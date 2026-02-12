'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { revokeInvite } from '@/actions/invites';
import { InviteToCompanySheet } from './InviteToCompanySheet';
import { toast } from 'sonner';

interface InviteRow {
  id: string;
  email: string;
  emailNormalized: string;
  status: string;
  scope: string;
  companyRole: string | null;
  workspaceRole: string | null;
  workspaceId: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  invitedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  workspace: { id: string; name: string; slug: string } | null;
}

interface CompanyInvitesContentProps {
  companyId: string;
  invites: InviteRow[];
  canManage: boolean;
}

export function CompanyInvitesContent({
  companyId,
  invites,
  canManage
}: CompanyInvitesContentProps) {
  const router = useRouter();
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const revokeInv = revokeId ? invites.find((i) => i.id === revokeId) : null;

  function handleRevoke(inviteId: string) {
    startTransition(async () => {
      const result = await revokeInvite({ inviteId });
      if (result.ok) {
        toast.success('Invite revoked');
        setRevokeId(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  const pendingInvites = invites.filter((i) => i.status === 'PENDING' && !i.revokedAt);
  const otherInvites = invites.filter((i) => i.status !== 'PENDING' || i.revokedAt);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Company invites</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/company/members" className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Members
            </Link>
          </Button>
          {canManage && <InviteToCompanySheet companyId={companyId} />}
        </div>
      </div>

      {!canManage && (
        <p className="text-sm text-muted-foreground">
          You can view invites. Only company owners and admins can create or revoke.
        </p>
      )}

      <Card>
        <CardContent className="p-0">
          {invites.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No invites yet.</p>
              {canManage && (
                <InviteToCompanySheet companyId={companyId} className="mt-4" />
              )}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {invites.map((i) => (
                <li
                  key={i.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{i.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {i.scope === 'WORKSPACE' && i.workspace
                        ? `Workspace: ${i.workspace.name}`
                        : 'Company'}
                      {i.companyRole && ` · ${i.companyRole}`}
                      {i.workspaceRole && ` · ${i.workspaceRole}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Invited by {i.invitedBy.firstName} {i.invitedBy.lastName} ·{' '}
                      {new Date(i.createdAt).toLocaleDateString()} · Expires{' '}
                      {new Date(i.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        i.status === 'PENDING' && !i.revokedAt ? 'default' : 'secondary'
                      }
                    >
                      {i.revokedAt ? 'Revoked' : i.status}
                    </Badge>
                    {canManage && i.status === 'PENDING' && !i.revokedAt && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setRevokeId(i.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {revokeInv && (
        <Dialog open onOpenChange={(open) => !open && setRevokeId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revoke invite?</DialogTitle>
              <DialogDescription>
                The invite sent to {revokeInv.email} will be cancelled. They won&apos;t be able to
                use the link.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setRevokeId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleRevoke(revokeInv.id)}
                disabled={isPending}
              >
                Revoke
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
