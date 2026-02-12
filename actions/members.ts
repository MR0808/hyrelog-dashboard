'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireDashboardAccess } from '@/lib/auth/requireDashboardAccess';
import { getWorkspaceDetailForUser } from '@/lib/workspaces/workspace-detail-queries';
import { isCompanyOwnerOrAdmin, canWorkspaceAdmin } from '@/lib/workspaces/permissions';
import { getEffectiveWorkspaceAccess, requireCompanyOwner } from '@/lib/workspaces/access';
import { headers } from 'next/headers';
import { workspaceRoleLevel } from '@/lib/members/utils';
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

const AssignMembersToWorkspaceSchema = z.object({
  workspaceId: z.string().uuid(),
  userIds: z.array(z.string().uuid()).min(1).max(100),
  role: z.enum(['ADMIN', 'WRITER', 'READER'])
});

const RemoveMembersFromWorkspaceSchema = z.object({
  workspaceId: z.string().uuid(),
  userIds: z.array(z.string().uuid()).min(1).max(100)
});

const AssignMembersToWorkspacesSchema = z.object({
  workspaceIds: z.array(z.string().uuid()).min(1).max(50),
  userIds: z.array(z.string().uuid()).min(1).max(100),
  role: z.enum(['ADMIN', 'WRITER', 'READER'])
});

const TransferCompanyOwnershipSchema = z.object({
  companyId: z.string().uuid(),
  targetUserId: z.string().uuid(),
  confirmationSlug: z.string().min(1)
});

export type TransferOwnershipErrorCode =
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INVALID_CONFIRMATION'
  | 'INVALID_TARGET'
  | 'NO_OP'
  | 'COMPANY_DELETED';

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

/** Company members not yet in this workspace (for "Add members" UI). Caller must have canAdmin on the workspace. */
export async function getCompanyMembersNotInWorkspace(companyId: string, workspaceId: string) {
  const session = await requireDashboardAccess('/workspaces');
  const access = await getEffectiveWorkspaceAccess(session.user.id, workspaceId);
  if (!access?.canAdmin) {
    return { ok: false as const, error: 'Not authorized.' };
  }
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, companyId, deletedAt: null },
    select: { id: true }
  });
  if (!workspace) return { ok: false as const, error: 'Workspace not found.' };

  const [companyMembers, existingUserIds] = await Promise.all([
    prisma.companyMember.findMany({
      where: { companyId },
      orderBy: [{ role: 'desc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        userId: true,
        role: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    }),
    prisma.workspaceMember.findMany({
      where: { workspaceId },
      select: { userId: true }
    }).then((rows) => new Set(rows.map((r) => r.userId)))
  ]);

  const notInWorkspace = companyMembers.filter((m) => !existingUserIds.has(m.userId));
  return { ok: true as const, members: notInWorkspace };
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

/** Bulk assign company members to a workspace. Only adds or upgrades roles; never downgrades. */
export async function assignMembersToWorkspace(
  input: z.infer<typeof AssignMembersToWorkspaceSchema>
) {
  const parsed = AssignMembersToWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid fields.' };
  }
  const { workspaceId, userIds, role } = parsed.data;
  const session = await requireDashboardAccess('/workspaces');
  const actorId = session.user.id;

  const access = await getEffectiveWorkspaceAccess(actorId, workspaceId);
  if (!access?.canAdmin) {
    return { ok: false as const, error: 'Only workspace or company admins can add members.' };
  }

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, deletedAt: null },
    select: { id: true, companyId: true }
  });
  if (!workspace) return { ok: false as const, error: 'Workspace not found.' };

  const companyId = workspace.companyId;
  const companyMembers = await prisma.companyMember.findMany({
    where: { companyId, userId: { in: userIds } },
    select: { userId: true }
  });
  const allowedUserIds = new Set(companyMembers.map((m) => m.userId));
  const toAdd = userIds.filter((id) => allowedUserIds.has(id));
  if (toAdd.length === 0) {
    return { ok: false as const, error: 'No valid company members selected.' };
  }

  const existing = await prisma.workspaceMember.findMany({
    where: { workspaceId, userId: { in: toAdd } },
    select: { userId: true, role: true, id: true }
  });
  const existingByUser = new Map(existing.map((m) => [m.userId, m]));
  const targetRole = role as WorkspaceRole;

  const added: string[] = [];
  const upgraded: string[] = [];
  const skipped: string[] = [];

  await prisma.$transaction(async (tx) => {
    for (const userId of toAdd) {
      const current = existingByUser.get(userId);
      if (!current) {
        await tx.workspaceMember.create({
          data: {
            workspaceId,
            userId,
            role: targetRole,
            createdByUserId: actorId,
            updatedByUserId: actorId
          }
        });
        added.push(userId);
        await tx.auditLog.create({
          data: {
            userId: actorId,
            companyId,
            action: 'MEMBER_ADDED',
            resourceType: 'WorkspaceMember',
            details: {
              workspaceId,
              affectedUserId: userId,
              role: targetRole,
              bulk: toAdd.length > 1
            }
          }
        });
      } else {
        const currentLevel = workspaceRoleLevel(current.role as WorkspaceRole);
        const newLevel = workspaceRoleLevel(targetRole);
        if (newLevel > currentLevel) {
          await tx.workspaceMember.update({
            where: { id: current.id },
            data: { role: targetRole, updatedByUserId: actorId }
          });
          upgraded.push(userId);
          await tx.auditLog.create({
            data: {
              userId: actorId,
              companyId,
              action: 'MEMBER_ROLE_UPDATED',
              resourceType: 'WorkspaceMember',
              resourceId: current.id,
              details: {
                workspaceId,
                affectedUserId: userId,
                from: current.role,
                to: targetRole,
                bulk: toAdd.length > 1
              }
            }
          });
        } else {
          skipped.push(userId);
        }
      }
    }
  });

  return {
    ok: true as const,
    added,
    upgraded,
    skipped
  };
}

/** Bulk remove workspace members. */
export async function removeMembersFromWorkspace(
  input: z.infer<typeof RemoveMembersFromWorkspaceSchema>
) {
  const parsed = RemoveMembersFromWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid fields.' };
  }
  const { workspaceId, userIds } = parsed.data;
  const session = await requireDashboardAccess('/workspaces');
  const actorId = session.user.id;

  const access = await getEffectiveWorkspaceAccess(actorId, workspaceId);
  if (!access?.canAdmin) {
    return { ok: false as const, error: 'Only workspace or company admins can remove members.' };
  }

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, deletedAt: null },
    select: { id: true, companyId: true }
  });
  if (!workspace) return { ok: false as const, error: 'Workspace not found.' };

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId, userId: { in: userIds } },
    select: { id: true, userId: true }
  });
  if (members.length === 0) {
    return { ok: false as const, error: 'No members to remove.' };
  }

  await prisma.$transaction(async (tx) => {
    for (const member of members) {
      await tx.workspaceMember.delete({ where: { id: member.id } });
      await tx.auditLog.create({
        data: {
          userId: actorId,
          companyId: workspace.companyId,
          action: 'MEMBER_REMOVED',
          resourceType: 'WorkspaceMember',
          resourceId: member.id,
          details: {
            workspaceId,
            affectedUserId: member.userId,
            bulk: members.length > 1
          }
        }
      });
    }
  });

  return { ok: true as const, removed: members.map((m) => m.userId) };
}

/** Bulk assign company members to multiple workspaces. Only company OWNER/ADMIN. */
export async function assignMembersToWorkspaces(
  input: z.infer<typeof AssignMembersToWorkspacesSchema>
) {
  const parsed = AssignMembersToWorkspacesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid fields.' };
  }
  const { workspaceIds, userIds, role } = parsed.data;
  const session = await requireDashboardAccess('/company/members');
  const sessionWithCompany = session as {
    user: { id: string };
    company: { id: string };
    userCompany: { role: CompanyRole };
  };

  if (!isCompanyOwnerOrAdmin(sessionWithCompany.userCompany.role)) {
    return { ok: false as const, error: 'Only company owners and admins can assign members to workspaces.' };
  }

  const companyId = sessionWithCompany.company.id;
  const actorId = sessionWithCompany.user.id;

  const [workspaces, companyMembers] = await Promise.all([
    prisma.workspace.findMany({
      where: { id: { in: workspaceIds }, companyId, deletedAt: null },
      select: { id: true }
    }),
    prisma.companyMember.findMany({
      where: { companyId, userId: { in: userIds } },
      select: { userId: true }
    })
  ]);
  const validWorkspaceIds = new Set(workspaces.map((w) => w.id));
  const allowedUserIds = new Set(companyMembers.map((m) => m.userId));
  const toAddUserIds = userIds.filter((id) => allowedUserIds.has(id));
  const invalidWorkspaces = workspaceIds.filter((id) => !validWorkspaceIds.has(id));
  if (invalidWorkspaces.length > 0) {
    return { ok: false as const, error: 'One or more workspaces not found or not in your company.' };
  }
  if (toAddUserIds.length === 0) {
    return { ok: false as const, error: 'No valid company members selected.' };
  }

  const existing = await prisma.workspaceMember.findMany({
    where: {
      workspaceId: { in: workspaceIds },
      userId: { in: toAddUserIds }
    },
    select: { userId: true, workspaceId: true, role: true, id: true }
  });
  const existingKey = (wId: string, uId: string) => `${wId}:${uId}`;
  const existingMap = new Map(existing.map((e) => [existingKey(e.workspaceId, e.userId), e]));

  const added: { workspaceId: string; userId: string }[] = [];
  const upgraded: { workspaceId: string; userId: string }[] = [];
  const skipped: { workspaceId: string; userId: string }[] = [];
  const targetRole = role as WorkspaceRole;

  await prisma.$transaction(async (tx) => {
    for (const workspaceId of validWorkspaceIds) {
      for (const userId of toAddUserIds) {
        const key = existingKey(workspaceId, userId);
        const current = existingMap.get(key);
        if (!current) {
          await tx.workspaceMember.create({
            data: {
              workspaceId,
              userId,
              role: targetRole,
              createdByUserId: actorId,
              updatedByUserId: actorId
            }
          });
          added.push({ workspaceId, userId });
          await tx.auditLog.create({
            data: {
              userId: actorId,
              companyId,
              action: 'MEMBER_ADDED',
              resourceType: 'WorkspaceMember',
              details: {
                workspaceId,
                affectedUserId: userId,
                role: targetRole,
                bulk: true
              }
            }
          });
        } else {
          const currentLevel = workspaceRoleLevel(current.role as WorkspaceRole);
          const newLevel = workspaceRoleLevel(targetRole);
          if (newLevel > currentLevel) {
            await tx.workspaceMember.update({
              where: { id: current.id },
              data: { role: targetRole, updatedByUserId: actorId }
            });
            upgraded.push({ workspaceId, userId });
            await tx.auditLog.create({
              data: {
                userId: actorId,
                companyId,
                action: 'MEMBER_ROLE_UPDATED',
                resourceType: 'WorkspaceMember',
                resourceId: current.id,
                details: {
                  workspaceId,
                  affectedUserId: userId,
                  from: current.role,
                  to: targetRole,
                  bulk: true
                }
              }
            });
          } else {
            skipped.push({ workspaceId, userId });
          }
        }
      }
    }
  });

  return {
    ok: true as const,
    added,
    upgraded,
    skipped
  };
}

/** Transfer company ownership to another company member. Only current OWNER can do this. */
export async function transferCompanyOwnership(
  input: z.infer<typeof TransferCompanyOwnershipSchema>
): Promise<
  | { ok: true }
  | { ok: false; code: TransferOwnershipErrorCode }
> {
  const parsed = TransferCompanyOwnershipSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: 'INVALID_CONFIRMATION' };
  }
  const { companyId, targetUserId, confirmationSlug } = parsed.data;

  const session = await requireDashboardAccess('/company/members');
  const actorId = session.user.id;

  const actorMembership = await requireCompanyOwner(companyId, actorId);
  if (!actorMembership) {
    return { ok: false, code: 'FORBIDDEN' };
  }

  if (targetUserId === actorId) {
    return { ok: false, code: 'NO_OP' };
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, slug: true, deletedAt: true }
  });
  if (!company) {
    return { ok: false, code: 'NOT_FOUND' };
  }
  if (company.deletedAt != null) {
    return { ok: false, code: 'COMPANY_DELETED' };
  }
  if (company.slug !== confirmationSlug.trim()) {
    return { ok: false, code: 'INVALID_CONFIRMATION' };
  }

  const targetMember = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId: targetUserId, companyId } },
    select: { id: true, userId: true, role: true },
    include: {
      user: {
        select: { status: true, emailVerified: true }
      }
    }
  });
  if (!targetMember) {
    return { ok: false, code: 'NOT_FOUND' };
  }
  if (targetMember.user.status !== 'ACTIVE' || !targetMember.user.emailVerified) {
    return { ok: false, code: 'INVALID_TARGET' };
  }

  const h = await headers();
  const ipAddress = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? null;
  const userAgent = h.get('user-agent') ?? null;

  try {
    await prisma.$transaction(async (tx) => {
      const actorRow = await tx.companyMember.findUnique({
        where: { userId_companyId: { userId: actorId, companyId } },
        select: { id: true, role: true }
      });
      if (!actorRow || actorRow.role !== 'OWNER') {
        throw new Error('FORBIDDEN');
      }

      await tx.companyMember.update({
        where: { id: targetMember.id },
        data: { role: 'OWNER', updatedByUserId: actorId }
      });
      await tx.companyMember.update({
        where: { id: actorRow.id },
        data: { role: 'ADMIN', updatedByUserId: actorId }
      });

      const ownerCount = await tx.companyMember.count({
        where: { companyId, role: 'OWNER' }
      });
      if (ownerCount < 1) {
        throw new Error('INVARIANT_OWNER');
      }

      await tx.auditLog.create({
        data: {
          userId: actorId,
          companyId,
          action: 'MEMBER_ROLE_UPDATED',
          resourceType: 'CompanyMember',
          resourceId: targetMember.id,
          details: {
            operation: 'OWNERSHIP_TRANSFER',
            actorUserId: actorId,
            targetUserId: targetMember.userId,
            actorMemberId: actorRow.id,
            actorRoleBefore: actorRow.role,
            actorRoleAfter: 'ADMIN',
            targetRoleBefore: targetMember.role,
            targetRoleAfter: 'OWNER'
          },
          ipAddress,
          userAgent
        }
      });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message === 'FORBIDDEN') return { ok: false, code: 'FORBIDDEN' };
    if (message === 'INVARIANT_OWNER') return { ok: false, code: 'NOT_FOUND' };
    throw err;
  }

  return { ok: true };
}
