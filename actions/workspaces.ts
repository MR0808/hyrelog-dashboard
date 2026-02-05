'use server';

// lib/workspaces/queries.ts
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { requireDashboardAccess } from '@/lib/auth/requireDashboardAccess';

import type { CompanyRole } from '@/generated/prisma/client';

const ADMIN_ROLES: CompanyRole[] = ['OWNER', 'ADMIN', 'BILLING'];

export async function isCompanyAdmin(role: CompanyRole) {
  return ADMIN_ROLES.includes(role);
}

export async function listWorkspacesForCompany(companyId: string) {
  return prisma.workspace.findMany({
    where: { companyId, deletedAt: null },
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      preferredRegion: true,
      createdAt: true,
      _count: { select: { members: true } },
      company: { select: { id: true, slug: true } }
    }
  });
}

export async function listWorkspacesForUser(userId: string) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId, workspace: { deletedAt: null } },
    select: {
      role: true,
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          preferredRegion: true,
          createdAt: true,
          _count: { select: { members: true } },
          company: { select: { id: true, slug: true } }
        }
      }
    }
  });

  // Flatten, stable sort
  const workspaces = memberships
    .map((m) => ({ ...m.workspace, myWorkspaceRole: m.role }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));

  return workspaces;
}

const CreateWorkspaceSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80, 'Name is too long'),
  preferredRegion: z.enum(['US', 'EU', 'APAC', 'UK', 'AU']).optional()
});

const RenameWorkspaceSchema = z.object({
  workspaceId: z.uuid(),
  name: z.string().trim().min(2).max(80)
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function uniqueWorkspaceSlug(companyId: string, base: string) {
  const root = slugify(base) || 'workspace';

  // Try root, root-2, root-3, ...
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const exists = await prisma.workspace.findFirst({
      where: { companyId, slug: candidate },
      select: { id: true }
    });
    if (!exists) return candidate;
  }

  // fallback (extremely unlikely)
  return `${root}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createWorkspaceAction(input: z.infer<typeof CreateWorkspaceSchema>) {
  const session = await requireDashboardAccess('/workspaces/new');

  if (!isCompanyAdmin(session.userCompany.role)) {
    return { success: false as const, message: 'Not allowed.' };
  }

  const parsed = CreateWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      message: parsed.error.issues[0]?.message ?? 'Invalid fields.'
    };
  }

  const { name, preferredRegion } = parsed.data;

  const slug = await uniqueWorkspaceSlug(session.company.id, name);

  const ws = await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        companyId: session.company.id,
        name,
        slug,
        preferredRegion: preferredRegion ?? null
        // onboardingStatus is unrelated here; leave as default or not set
      },
      select: { id: true }
    });

    // Add creator as Workspace ADMIN (so they can manage workspace settings)
    await tx.workspaceMember.upsert({
      where: {
        userId_workspaceId: { userId: session.user.id, workspaceId: workspace.id }
      },
      update: { role: 'ADMIN' },
      create: {
        userId: session.user.id,
        workspaceId: workspace.id,
        role: 'ADMIN'
      }
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        companyId: session.company.id,
        action: 'WORKSPACE_CREATED',
        resourceType: 'Workspace',
        resourceId: workspace.id,
        details: { name, slug, preferredRegion: preferredRegion ?? null }
      }
    });

    return workspace;
  });

  // send them to the workspace page (we’ll build it next) or back to list
  redirect(`/workspaces`);
}

export async function renameWorkspaceAction(input: z.infer<typeof RenameWorkspaceSchema>) {
  const session = await requireDashboardAccess('/workspaces');

  if (!isCompanyAdmin(session.userCompany.role)) {
    return { success: false as const, message: 'Not allowed.' };
  }

  const parsed = RenameWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: 'Invalid fields.' };
  }

  const { workspaceId, name } = parsed.data;

  const ws = await prisma.workspace.findFirst({
    where: { id: workspaceId, companyId: session.company.id, deletedAt: null },
    select: { id: true, name: true }
  });

  if (!ws) return { success: false as const, message: 'Workspace not found.' };

  await prisma.$transaction(async (tx) => {
    await tx.workspace.update({
      where: { id: ws.id },
      data: { name }
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        companyId: session.company.id,
        action: 'WORKSPACE_UPDATED',
        resourceType: 'Workspace',
        resourceId: ws.id,
        details: { from: { name: ws.name }, to: { name } }
      }
    });
  });

  return { success: true as const };
}
