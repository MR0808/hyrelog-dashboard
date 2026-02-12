'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { updateCompanyRole, removeCompanyMember, assignMembersToWorkspaces } from '@/actions/members';
import { revokeInvite } from '@/actions/invites';
import { InviteToCompanySheet } from './InviteToCompanySheet';
import { AssignToWorkspacesSheet } from './AssignToWorkspacesSheet';
import { TransferOwnershipDialog } from './TransferOwnershipDialog';
import { toast } from 'sonner';

type CompanyRole = 'OWNER' | 'ADMIN' | 'BILLING' | 'MEMBER';

interface Member {
  id: string;
  userId: string;
  role: CompanyRole;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image: string | null;
  };
}

export interface CompanyInviteRow {
  id: string;
  email: string;
  status: string;
  scope: string;
  companyRole: string | null;
  workspaceRole: string | null;
  workspaceId: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  invitedBy: { id: string; firstName: string; lastName: string; email: string };
  workspace: { id: string; name: string; slug: string } | null;
}

export interface WorkspaceOption {
  id: string;
  name: string;
  slug: string;
}

interface CompanyMembersContentProps {
  companyId: string;
  companySlug: string;
  members: Member[];
  invites?: CompanyInviteRow[];
  workspaces?: WorkspaceOption[];
  currentUserId: string;
  isCompanyOwnerAdmin: boolean;
  isCompanyOwner?: boolean;
}

export function CompanyMembersContent({
  companyId,
  companySlug,
  members,
  invites = [],
  workspaces = [],
  currentUserId,
  isCompanyOwnerAdmin,
  isCompanyOwner = false
}: CompanyMembersContentProps) {
  const router = useRouter();
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [isPendingRevoke, startTransition] = useTransition();

  const editMember = editMemberId ? members.find((m) => m.id === editMemberId) : null;
  const removeMember = removeMemberId ? members.find((m) => m.id === removeMemberId) : null;
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

  const ownerCount = members.filter((m) => m.role === 'OWNER').length;
  const canEditRole = isCompanyOwnerAdmin;
  const canRemove = isCompanyOwnerAdmin;

  async function handleRoleChange(memberId: string, role: CompanyRole) {
    setPending(true);
    const result = await updateCompanyRole({ companyMemberId: memberId, role });
    setPending(false);
    if (result.ok) {
      toast.success('Role updated');
      setEditMemberId(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleRemove(memberId: string) {
    setPending(true);
    const result = await removeCompanyMember({ companyMemberId: memberId });
    setPending(false);
    if (result.ok) {
      toast.success('Member removed');
      setRemoveMemberId(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Company members</h1>
        <div className="flex flex-wrap items-center gap-2">
          {isCompanyOwner && (
            <TransferOwnershipDialog
              companyId={companyId}
              companySlug={companySlug}
              members={members}
              currentUserId={currentUserId}
            />
          )}
          {isCompanyOwnerAdmin && (
            <>
              <AssignToWorkspacesSheet
                companyId={companyId}
                members={members}
                workspaces={workspaces}
              />
              <Button variant="outline" size="sm" asChild>
                <Link href="/company/invites" className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  Invites
                </Link>
              </Button>
              <InviteToCompanySheet companyId={companyId} />
            </>
          )}
        </div>
      </div>

      {!isCompanyOwnerAdmin && (
        <p className="text-sm text-muted-foreground">
          You can view members. Only company owners and admins can invite or change roles.
        </p>
      )}

      <Card>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No members yet.</p>
              {isCompanyOwnerAdmin && (
                <InviteToCompanySheet companyId={companyId} className="mt-4" />
              )}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">
                      {m.user.firstName} {m.user.lastName}
                      {m.userId === currentUserId && (
                        <span className="text-muted-foreground text-sm ml-2">(you)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{m.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary">{m.role}</Badge>
                    {canEditRole && m.userId !== currentUserId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditMemberId(m.id)}
                      >
                        Edit role
                      </Button>
                    )}
                    {canRemove && m.userId !== currentUserId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setRemoveMemberId(m.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {invites.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-medium">Pending invites</h2>
              <p className="text-sm text-muted-foreground">
                {pendingInvites.length} pending · {invites.length - pendingInvites.length} accepted/revoked/expired
              </p>
            </div>
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
                      Invited by {i.invitedBy.firstName} {i.invitedBy.lastName} · Expires{' '}
                      {new Date(i.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={i.status === 'PENDING' && !i.revokedAt ? 'default' : 'secondary'}
                    >
                      {i.revokedAt ? 'Revoked' : i.status}
                    </Badge>
                    {isCompanyOwnerAdmin && i.status === 'PENDING' && !i.revokedAt && (
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
          </CardContent>
        </Card>
      )}

      {editMember && (
        <Dialog open onOpenChange={(open) => !open && setEditMemberId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit role</DialogTitle>
              <DialogDescription>
                Change role for {editMember.user.firstName} {editMember.user.lastName}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Select
                defaultValue={editMember.role}
                onValueChange={(value) => handleRoleChange(editMember.id, value as CompanyRole)}
                disabled={pending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">MEMBER</SelectItem>
                  <SelectItem value="BILLING">BILLING</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="OWNER">OWNER</SelectItem>
                </SelectContent>
              </Select>
              {editMember.role === 'OWNER' && ownerCount <= 1 && (
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  Cannot demote the last owner.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {removeMember && (
        <Dialog open onOpenChange={(open) => !open && setRemoveMemberId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove member?</DialogTitle>
              <DialogDescription>
                {removeMember.user.firstName} {removeMember.user.lastName} will lose access to this
                company and all its workspaces.
              </DialogDescription>
            </DialogHeader>
            {removeMember.role === 'OWNER' && ownerCount <= 1 ? (
              <p className="text-sm text-destructive mt-2">Cannot remove the last owner.</p>
            ) : (
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setRemoveMemberId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleRemove(removeMember.id)}
                  disabled={pending}
                >
                  Remove
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

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
                disabled={isPendingRevoke}
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
