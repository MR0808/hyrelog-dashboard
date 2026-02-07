'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { requireDashboardAccess } from '@/lib/auth/requireDashboardAccess';
import { getWorkspaceDetailForUser } from '@/lib/workspaces/workspace-detail-queries';
import { normalizeEmail } from '@/lib/members/utils';
import { generateInviteToken, hashInviteToken } from '@/lib/invites/token';
import { isCompanyOwnerOrAdmin, canWorkspaceAdmin } from '@/lib/workspaces/permissions';
import type { CompanyRole, WorkspaceRole } from '@/generated/prisma/client';

const INVITE_EXPIRY_DAYS = 7;

const CreateCompanyInviteSchema = z.object({
  companyId: z.string().uuid(),
  email: z.string().email(),
  companyRole: z.enum(['OWNER', 'ADMIN', 'BILLING', 'MEMBER'])
});

const CreateWorkspaceInviteSchema = z.object({
  workspaceId: z.string().uuid(),
  email: z.string().email(),
  workspaceRole: z.enum(['ADMIN', 'WRITER', 'READER'])
});

const RevokeInviteSchema = z.object({ inviteId: z.string().uuid() });
const AcceptInviteSchema = z.object({ token: z.string().min(1) });

async function getSession() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h, query: { disableCookieCache: true } });
  return session;
}

/** List pending invites for company (company OWNER/ADMIN) or workspace (workspace ADMIN). */
export async function listCompanyInvites(companyId: string) {
  const session = await requireDashboardAccess('/company/invites');
  const sessionWithCompany = session as { company: { id: string }; userCompany: { role: CompanyRole } };
  if (sessionWithCompany.company.id !== companyId) {
    return { ok: false as const, error: 'Not authorized.' };
  }
  if (!isCompanyOwnerOrAdmin(sessionWithCompany.userCompany.role)) {
    return { ok: false as const, error: 'Only company owners and admins can view invites.' };
  }

  const invites = await prisma.invite.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      emailNormalized: true,
      status: true,
      scope: true,
      companyRole: true,
      workspaceRole: true,
      workspaceId: true,
      expiresAt: true,
      revokedAt: true,
      createdAt: true,
      invitedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      workspace: { select: { id: true, name: true, slug: true } }
    }
  });

  return { ok: true as const, invites };
}

export async function listWorkspaceInvites(workspaceId: string) {
  const session = await requireDashboardAccess(`/workspaces/${workspaceId}`);
  const company = (session as { company: { id: string; preferredRegion: string; slug?: string } }).company;
  const payload = await getWorkspaceDetailForUser(workspaceId, {
    user: { id: session.user.id },
    company: { id: company.id, preferredRegion: company.preferredRegion, slug: company.slug },
    userCompany: { role: (session as any).userCompany.role }
  });
  if (!payload) return { ok: false as const, error: 'Not authorized.' };
  if (!canWorkspaceAdmin(payload.effectiveRole)) {
    return { ok: false as const, error: 'Only workspace admins can view invites.' };
  }
  if (payload.workspace.status !== 'ACTIVE' || payload.isArchived) {
    return { ok: false as const, error: 'Workspace is archived.' };
  }

  const invites = await prisma.invite.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      status: true,
      workspaceRole: true,
      expiresAt: true,
      revokedAt: true,
      createdAt: true,
      invitedBy: { select: { firstName: true, lastName: true } }
    }
  });

  return { ok: true as const, invites };
}

export async function createCompanyInvite(input: z.infer<typeof CreateCompanyInviteSchema>) {
  const parsed = CreateCompanyInviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid fields.' };
  }
  const { companyId, email, companyRole } = parsed.data;
  const session = await requireDashboardAccess('/company/invites');
  const sessionWithCompany = session as { company: { id: string }; user: { id: string }; userCompany: { role: CompanyRole } };
  if (sessionWithCompany.company.id !== companyId) {
    return { ok: false as const, error: 'Not authorized.' };
  }
  if (!isCompanyOwnerOrAdmin(sessionWithCompany.userCompany.role)) {
    return { ok: false as const, error: 'Only company owners and admins can invite.' };
  }

  const company = await prisma.company.findFirst({
    where: { id: companyId, deletedAt: null },
    select: { id: true }
  });
  if (!company) return { ok: false as const, error: 'Company not found.' };

  const emailNorm = normalizeEmail(email);
  const pendingKey = `company:${companyId}:${emailNorm}`;

  const existing = await prisma.invite.findFirst({
    where: { pendingKey, status: 'PENDING', revokedAt: null, expiresAt: { gt: new Date() } },
    select: { id: true }
  });
  if (existing) {
    return { ok: false as const, error: 'A pending invite already exists for this email.' };
  }

  const token = generateInviteToken();
  const tokenHash = hashInviteToken(token);

  const invite = await prisma.$transaction(async (tx) => {
    const inv = await tx.invite.create({
      data: {
        email,
        emailNormalized: emailNorm,
        status: 'PENDING',
        scope: 'COMPANY',
        tokenHash,
        expiresAt: new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
        companyId,
        pendingKey,
        companyRole,
        invitedByUserId: sessionWithCompany.user.id
      },
      select: { id: true, email: true, expiresAt: true }
    });
    await tx.auditLog.create({
      data: {
        userId: sessionWithCompany.user.id,
        companyId,
        action: 'MEMBER_INVITED',
        resourceType: 'Invite',
        resourceId: inv.id,
        details: { scope: 'COMPANY', email: inv.email, companyRole }
      }
    });
    return inv;
  });

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/invite/${token}`;
  return { ok: true as const, inviteId: invite.id, inviteLink, expiresAt: invite.expiresAt };
}

export async function createWorkspaceInvite(input: z.infer<typeof CreateWorkspaceInviteSchema>) {
  const parsed = CreateWorkspaceInviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid fields.' };
  }
  const { workspaceId, email, workspaceRole } = parsed.data;
  const session = await requireDashboardAccess(`/workspaces/${workspaceId}`);
  const company = (session as { company: { id: string; preferredRegion: string; slug?: string } }).company;
  const payload = await getWorkspaceDetailForUser(workspaceId, {
    user: { id: session.user.id },
    company: { id: company.id, preferredRegion: company.preferredRegion, slug: company.slug },
    userCompany: { role: (session as any).userCompany.role }
  });
  if (!payload) return { ok: false as const, error: 'Not authorized.' };
  if (!canWorkspaceAdmin(payload.effectiveRole)) {
    return { ok: false as const, error: 'Only workspace admins can invite.' };
  }
  if (payload.workspace.status !== 'ACTIVE' || payload.isArchived) {
    return { ok: false as const, error: 'Workspace is archived.' };
  }

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, companyId: company.id, deletedAt: null },
    select: { id: true, companyId: true }
  });
  if (!workspace) return { ok: false as const, error: 'Workspace not found.' };

  const emailNorm = normalizeEmail(email);
  const pendingKey = `workspace:${workspaceId}:${emailNorm}`;

  const existing = await prisma.invite.findFirst({
    where: { pendingKey, status: 'PENDING', revokedAt: null, expiresAt: { gt: new Date() } },
    select: { id: true }
  });
  if (existing) {
    return { ok: false as const, error: 'A pending invite already exists for this email.' };
  }

  const token = generateInviteToken();
  const tokenHash = hashInviteToken(token);

  const invite = await prisma.$transaction(async (tx) => {
    const inv = await tx.invite.create({
      data: {
        email,
        emailNormalized: emailNorm,
        status: 'PENDING',
        scope: 'WORKSPACE',
        tokenHash,
        expiresAt: new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
        companyId: workspace.companyId,
        workspaceId,
        pendingKey,
        companyRole: 'MEMBER',
        workspaceRole,
        invitedByUserId: session.user.id
      },
      select: { id: true, email: true, expiresAt: true }
    });
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        companyId: workspace.companyId,
        action: 'MEMBER_INVITED',
        resourceType: 'Invite',
        resourceId: inv.id,
        details: { scope: 'WORKSPACE', email: inv.email, workspaceRole, workspaceId }
      }
    });
    return inv;
  });

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/invite/${token}`;
  return { ok: true as const, inviteId: invite.id, inviteLink, expiresAt: invite.expiresAt };
}

export async function revokeInvite(input: z.infer<typeof RevokeInviteSchema>) {
  const parsed = RevokeInviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: 'Invalid invite.' };
  }
  const { inviteId } = parsed.data;
  const session = await requireDashboardAccess('/company/invites');

  const company = (session as { company: { id: string } }).company;
  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
    select: { id: true, companyId: true, workspaceId: true, status: true, revokedAt: true, pendingKey: true }
  });
  if (!invite) return { ok: false as const, error: 'Invite not found.' };
  if (invite.companyId !== company.id) {
    return { ok: false as const, error: 'Not authorized.' };
  }
  if (invite.status !== 'PENDING' || invite.revokedAt) {
    return { ok: false as const, error: 'Invite is not pending.' };
  }

  const sessionWithCompany = session as { user: { id: string }; company: { id: string; preferredRegion: string; slug?: string }; userCompany: { role: CompanyRole } };
  if (invite.workspaceId) {
    const payload = await getWorkspaceDetailForUser(invite.workspaceId, {
      user: { id: session.user.id },
      company: { id: sessionWithCompany.company.id, preferredRegion: sessionWithCompany.company.preferredRegion, slug: sessionWithCompany.company.slug },
      userCompany: { role: sessionWithCompany.userCompany.role }
    });
    if (!payload || !canWorkspaceAdmin(payload.effectiveRole)) {
      return { ok: false as const, error: 'Only workspace admins can revoke workspace invites.' };
    }
    if (payload.isArchived) return { ok: false as const, error: 'Workspace is archived.' };
  } else {
    if (!isCompanyOwnerOrAdmin(sessionWithCompany.userCompany.role)) {
      return { ok: false as const, error: 'Only company owners and admins can revoke company invites.' };
    }
  }

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.invite.update({
      where: { id: invite.id },
      data: { status: 'REVOKED', revokedAt: now, revokedByUserId: sessionWithCompany.user.id, pendingKey: null }
    });
    await tx.auditLog.create({
      data: {
        userId: sessionWithCompany.user.id,
        companyId: invite.companyId,
        action: 'MEMBER_REMOVED',
        resourceType: 'Invite',
        resourceId: invite.id,
        details: { action: 'revoke_invite' }
      }
    });
  });

  return { ok: true as const };
}

/** Pending invites for current user's email (for /invites page when user has no company). */
export async function getPendingInvitesForCurrentUser() {
  const session = await getSession();
  if (!session) return { ok: false as const, error: 'Not signed in.' };
  const emailNorm = normalizeEmail(session.user.email);
  const invites = await prisma.invite.findMany({
    where: {
      emailNormalized: emailNorm,
      status: 'PENDING',
      revokedAt: null,
      expiresAt: { gt: new Date() },
      pendingKey: { not: null }
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      scope: true,
      expiresAt: true,
      company: { select: { name: true } },
      workspace: { select: { name: true, slug: true } }
    }
  });
  return {
    ok: true as const,
    invites: invites.map((i) => ({
      id: i.id,
      companyName: i.company.name,
      workspaceName: i.workspace?.name ?? null,
      scope: i.scope,
      expiresAt: i.expiresAt
    }))
  };
}

/** Validate invite token and return invite details for display. Callable without dashboard (session optional). */
export async function validateInviteToken(token: string) {
  const tokenHash = hashInviteToken(token);
  const invite = await prisma.invite.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      email: true,
      emailNormalized: true,
      scope: true,
      status: true,
      companyRole: true,
      workspaceRole: true,
      expiresAt: true,
      revokedAt: true,
      pendingKey: true,
      company: { select: { id: true, name: true } },
      workspace: { select: { id: true, name: true, slug: true } }
    }
  });
  if (!invite) return { ok: false as const, error: 'Invalid or expired invite link.' };
  if (invite.status !== 'PENDING' || invite.revokedAt || !invite.pendingKey) {
    return { ok: false as const, error: 'This invite is no longer valid.' };
  }
  if (invite.expiresAt < new Date()) {
    return { ok: false as const, error: 'This invite has expired.' };
  }
  return {
    ok: true as const,
    inviteId: invite.id,
    email: invite.email,
    scope: invite.scope,
    companyRole: invite.companyRole,
    workspaceRole: invite.workspaceRole,
    companyName: invite.company.name,
    workspaceName: invite.workspace?.name ?? null,
    workspaceSlug: invite.workspace?.slug ?? null,
    workspaceId: invite.workspace?.id ?? null
  };
}

/** Accept invite (user must be signed in, email verified, email match). */
export async function acceptInvite(input: z.infer<typeof AcceptInviteSchema>) {
  const parsed = AcceptInviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: 'Invalid token.' };
  }
  const { token } = parsed.data;
  const session = await getSession();
  if (!session) return { ok: false as const, error: 'Sign in to accept this invite.' };
  if (!session.user.emailVerified) {
    return { ok: false as const, error: 'Verify your email before accepting. The invite email must match your account.' };
  }

  const emailNorm = normalizeEmail(session.user.email);
  const tokenHash = hashInviteToken(token);

  const invite = await prisma.invite.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      emailNormalized: true,
      scope: true,
      status: true,
      companyId: true,
      workspaceId: true,
      companyRole: true,
      workspaceRole: true,
      pendingKey: true,
      expiresAt: true,
      revokedAt: true
    }
  });

  if (!invite) return { ok: false as const, error: 'Invalid or expired invite link.' };
  if (invite.status !== 'PENDING' || invite.revokedAt || !invite.pendingKey) {
    return { ok: false as const, error: 'This invite is no longer valid.' };
  }
  if (invite.expiresAt < new Date()) return { ok: false as const, error: 'This invite has expired.' };
  if (invite.emailNormalized !== emailNorm) {
    return { ok: false as const, error: 'This invite was sent to a different email. Sign in with that email to accept.' };
  }

  const userId = session.user.id;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.invite.update({
      where: { id: invite.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: now,
        acceptedByUserId: userId,
        pendingKey: null
      }
    });

    const existingCompanyMember = await tx.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId: invite.companyId } },
      select: { id: true, role: true }
    });

    const companyRoleToSet = invite.companyRole ?? 'MEMBER';
    if (existingCompanyMember) {
      const existingLevel = ['MEMBER', 'BILLING', 'ADMIN', 'OWNER'].indexOf(existingCompanyMember.role);
      const newLevel = ['MEMBER', 'BILLING', 'ADMIN', 'OWNER'].indexOf(companyRoleToSet);
      if (newLevel > existingLevel) {
        await tx.companyMember.update({
          where: { id: existingCompanyMember.id },
          data: { role: companyRoleToSet, updatedByUserId: userId }
        });
      }
    } else {
      await tx.companyMember.create({
        data: {
          userId,
          companyId: invite.companyId,
          role: companyRoleToSet,
          createdByUserId: userId
        }
      });
    }

    if (invite.scope === 'WORKSPACE' && invite.workspaceId) {
      const invRole = invite.workspaceRole ?? 'READER';
      const levels: Record<string, number> = { READER: 0, WRITER: 1, ADMIN: 2 };
      const existingWs = await tx.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId: invite.workspaceId } },
        select: { role: true }
      });
      const newRole =
        !existingWs || levels[invRole] > levels[existingWs.role] ? invRole : existingWs.role;
      await tx.workspaceMember.upsert({
        where: { userId_workspaceId: { userId, workspaceId: invite.workspaceId } },
        update: { role: newRole, updatedByUserId: userId },
        create: {
          userId,
          workspaceId: invite.workspaceId,
          role: invRole,
          createdByUserId: userId
        }
      });
    }

    await tx.auditLog.create({
      data: {
        userId,
        companyId: invite.companyId,
        action: 'MEMBER_INVITE_ACCEPTED',
        resourceType: 'Invite',
        resourceId: invite.id,
        details: { scope: invite.scope, workspaceId: invite.workspaceId }
      }
    });
  });

  const redirectTo =
    invite.scope === 'WORKSPACE' && invite.workspaceId
      ? `/workspaces/${invite.workspaceId}`
      : '/workspaces';
  return { ok: true as const, redirectTo };
}
