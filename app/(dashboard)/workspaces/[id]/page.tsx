import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireDashboardAccess } from '@/lib/auth/requireDashboardAccess';
import {
  getWorkspaceDetailForUser,
  workspaceExistsForCompany
} from '@/lib/workspaces/workspace-detail-queries';
import { listWorkspaceInvites } from '@/actions/invites';
import { WorkspaceDetailContent } from '@/components/workspaces/detail/WorkspaceDetailContent';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function WorkspaceDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id: workspaceIdOrSlug } = await params;
  const session = await requireDashboardAccess(`/workspaces/${workspaceIdOrSlug}`);

  const exists = await workspaceExistsForCompany(
    workspaceIdOrSlug,
    session.company.id,
    session.company.slug
  );
  if (!exists) {
    return (
      <div className="p-4 sm:p-6 max-w-md">
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium">Workspace not found</p>
            <p className="text-sm text-muted-foreground mt-1">
              This workspace does not exist or has been deleted.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/workspaces">Back to workspaces</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const payload = await getWorkspaceDetailForUser(workspaceIdOrSlug, {
    user: { id: session.user.id },
    company: {
      id: session.company.id,
      preferredRegion: session.company.preferredRegion,
      slug: session.company.slug
    },
    userCompany: { role: session.userCompany.role }
  });

  if (!payload) {
    redirect('/workspaces');
  }

  const invitesResult = await listWorkspaceInvites(payload.workspace.id);
  const workspaceInvites = invitesResult.ok ? invitesResult.invites : [];

  // Serialize for client (dates -> ISO strings)
  const companyId = (payload.workspace.company as { id: string }).id;
  const clientPayload = {
    workspace: {
      ...payload.workspace,
      createdAt: payload.workspace.createdAt.toISOString()
    },
    companyId,
    effectiveRegion: payload.effectiveRegion,
    projects: payload.projects.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString()
    })),
    members: payload.members,
    keys: payload.keys.map((k) => ({
      ...k,
      lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
      revokedAt: k.revokedAt?.toISOString() ?? null,
      createdAt: k.createdAt.toISOString()
    })),
    isCompanyOwnerAdmin: payload.isCompanyOwnerAdmin,
    isCompanyBilling: payload.isCompanyBilling,
    effectiveRole: payload.effectiveRole,
    canWrite: payload.canWrite,
    canAdmin: payload.canAdmin,
    regionLocked: payload.regionLocked,
    isArchived: payload.isArchived,
    currentUserId: session.user.id,
    workspaceInvites: workspaceInvites.map((i) => ({
      ...i,
      expiresAt: i.expiresAt.toISOString(),
      revokedAt: i.revokedAt?.toISOString() ?? null,
      createdAt: i.createdAt.toISOString()
    }))
  };

  return (
    <WorkspaceDetailContent
      workspaceIdOrSlug={workspaceIdOrSlug}
      payload={clientPayload}
    />
  );
}
