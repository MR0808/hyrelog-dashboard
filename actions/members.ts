'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireDashboardAccess } from '@/lib/auth/requireDashboardAccess';
import { getWorkspaceDetailForUser } from '@/lib/workspaces/workspace-detail-queries';
import { isCompanyOwnerOrAdmin, canWorkspaceAdmin } from '@/lib/workspaces/permissions';
import type { CompanyRole, WorkspaceRole } from '@/generated/prisma/client';

const UpdateCompanyRoleSchema = z.object({
  companyMemberId: z.string().uuid(),
  role: z.enum(['OWNER', 'ADMIN', 'BILLING', 'MEMBER'])
});

const RemoveCompanyMemberSchema = z.object({
  companyMemberId: z.string().uuid()
});

const UpdateWorkspaceRoleSchema = z.object({
  workspaceMemberId: z.string().uuid(),
  role: z.enum(['ADMIN', 'WRITER', 'READER'])
});

const RemoveWorkspaceMemberSchema = z.object({
  workspaceMemberId: z.string().uuid()
});

/** List company members (company OWNER/ADMIN/BILLING see all; MEMBER sees self). */
export async function listCompanyMembers(companyId: string) {
  const session = await requireDashboardAccess('/company/members');
  const sessionWithCompany = session as { company: { id: string }; userCompany: { role: CompanyRole } };
  if (sessionWithCompany.company.id !== companyId) {
    return { ok: false as const, error: 'Not authorized.' };
  }

  const members = await prisma.companyMember.findMany({
    where: { companyId },
    orderBy: [{ role: 'desc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      userId: true,
      role: true,
      createdAt: true,
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, image: true }
      }
    }
  });

  return { ok: true as const, members };
}

export async function updateCompanyRole(input: z.infer<typeof UpdateCompanyRoleSchema>) {
  const parsed = UpdateCompanyRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid fields.' };
  }
  const { companyMemberId, role } = parsed.data;
  const session = await requireDashboardAccess('/company/members');
  const sessionWithCompany = session as {
    user: { id: string };
    company: { id: string };
    userCompany: { role: CompanyRole };
  };

  if (!isCompanyOwnerOrAdmin(sessionWithCompany.userCompany.role)) {
    return { ok: false as const, error: 'Only company owners and admins can change roles.' };
  }

  const member = await prisma.companyMember.findUnique({
    where: { id: companyMemberId },
    select: { id: true, companyId: true, userId: true, role: true }
  });
  if (!member || member.companyId !== sessionWithCompany.company.id) {
    return { ok: false as const, error: 'Member not found.' };
  }

  const ownerCount = await prisma.companyMember.count({
    where: { companyId: member.companyId, role: 'OWNER' }
  });
  if (member.role === 'OWNER' && ownerCount <= 1 && role !== 'OWNER') {
    return { ok: false as const, error: 'Cannot demote the last owner.' };
  }

  await prisma.$transaction(async (tx) => {
    await tx.companyMember.update({
      where: { id: member.id },
      data: { role: role as CompanyRole, updatedByUserId: sessionWithCompany.user.id }
    });
    await tx.auditLog.create({
      data: {
        userId: sessionWithCompany.user.id,
        companyId: member.companyId,
        action: 'MEMBER_ROLE_UPDATED',
        resourceType: 'CompanyMember',
        resourceId: member.id,
        details: { from: member.role, to: role }
      }
    });
  });

  return { ok: true as const };
}

export async function removeCompanyMember(input: z.infer<typeof RemoveCompanyMemberSchema>) {
  const parsed = RemoveCompanyMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: 'Invalid member.' };
  }
  const { companyMemberId } = parsed.data;
  const session = await requireDashboardAccess('/company/members');
  const sessionWithCompany = session as {
    user: { id: string };
    company: { id: string };
    userCompany: { role: CompanyRole };
  };

  if (!isCompanyOwnerOrAdmin(sessionWithCompany.userCompany.role)) {
    return { ok: false as const, error: 'Only company owners and admins can remove members.' };
  }

  const member = await prisma.companyMember.findUnique({
    where: { id: companyMemberId },
    select: { id: true, companyId: true, userId: true, role: true }
  });
  if (!member || member.companyId !== sessionWithCompany.company.id) {
    return { ok: false as const, error: 'Member not found.' };
  }

  const ownerCount = await prisma.companyMember.count({
    where: { companyId: member.companyId, role: 'OWNER' }
  });
  if (member.role === 'OWNER' && ownerCount <= 1) {
    return { ok: false as const, error: 'Cannot remove the last owner.' };
  }

  await prisma.$transaction(async (tx) => {
    await tx.companyMember.delete({ where: { id: member.id } });
    await tx.auditLog.create({
      data: {
        userId: sessionWithCompany.user.id,
        companyId: member.companyId,
        action: 'MEMBER_REMOVED',
        resourceType: 'CompanyMember',
        resourceId: member.id,
        details: { removedUserId: member.userId }
      }
    });
  });

  return { ok: true as const };
}

export async function updateWorkspaceRole(input: z.infer<typeof UpdateWorkspaceRoleSchema>) {
  const parsed = UpdateWorkspaceRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid fields.' };
  }
  const { workspaceMemberId, role } = parsed.data;
  const session = await requireDashboardAccess('/workspaces');

  const member = await prisma.workspaceMember.findUnique({
    where: { id: workspaceMemberId },
    select: { id: true, workspaceId: true, userId: true, role: true }
  });
  if (!member) return { ok: false as const, error: 'Member not found.' };

  const company = (session as { company: { id: string; preferredRegion: string; slug?: string } }).company;
  const payload = await getWorkspaceDetailForUser(member.workspaceId, {
    user: { id: session.user.id },
    company: { id: company.id, preferredRegion: company.preferredRegion, slug: company.slug },
    userCompany: { role: (session as any).userCompany.role }
  });
  if (!payload) return { ok: false as const, error: 'Not authorized.' };
  if (!canWorkspaceAdmin(payload.effectiveRole)) {
    return { ok: false as const, error: 'Only workspace admins can change roles.' };
  }
  if (payload.isArchived) return { ok: false as const, error: 'Workspace is archived.' };

  await prisma.$transaction(async (tx) => {
    await tx.workspaceMember.update({
      where: { id: member.id },
      data: { role: role as WorkspaceRole, updatedByUserId: session.user.id }
    });
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        companyId: company.id,
        action: 'MEMBER_ROLE_UPDATED',
        resourceType: 'WorkspaceMember',
        resourceId: member.id,
        details: { workspaceId: member.workspaceId, from: member.role, to: role }
      }
    });
  });

  return { ok: true as const };
}

export async function removeWorkspaceMember(input: z.infer<typeof RemoveWorkspaceMemberSchema>) {
  const parsed = RemoveWorkspaceMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: 'Invalid member.' };
  }
  const { workspaceMemberId } = parsed.data;
  const session = await requireDashboardAccess('/workspaces');

  const member = await prisma.workspaceMember.findUnique({
    where: { id: workspaceMemberId },
    select: { id: true, workspaceId: true, userId: true }
  });
  if (!member) return { ok: false as const, error: 'Member not found.' };

  const company = (session as { company: { id: string; preferredRegion: string; slug?: string } }).company;
  const payload = await getWorkspaceDetailForUser(member.workspaceId, {
    user: { id: session.user.id },
    company: { id: company.id, preferredRegion: company.preferredRegion, slug: company.slug },
    userCompany: { role: (session as any).userCompany.role }
  });
  if (!payload) return { ok: false as const, error: 'Not authorized.' };
  if (!canWorkspaceAdmin(payload.effectiveRole)) {
    return { ok: false as const, error: 'Only workspace admins can remove members.' };
  }
  if (payload.isArchived) return { ok: false as const, error: 'Workspace is archived.' };

  await prisma.$transaction(async (tx) => {
    await tx.workspaceMember.delete({ where: { id: member.id } });
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        companyId: company.id,
        action: 'MEMBER_REMOVED',
        resourceType: 'WorkspaceMember',
        resourceId: member.id,
        details: { workspaceId: member.workspaceId, removedUserId: member.userId }
      }
    });
  });

  return { ok: true as const };
}
