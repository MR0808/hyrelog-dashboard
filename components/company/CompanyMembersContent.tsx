'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus } from 'lucide-react';
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
import { updateCompanyRole, removeCompanyMember } from '@/actions/members';
import { InviteToCompanySheet } from './InviteToCompanySheet';
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

interface CompanyMembersContentProps {
  companyId: string;
  members: Member[];
  currentUserId: string;
  isCompanyOwnerAdmin: boolean;
}

export function CompanyMembersContent({
  companyId,
  members,
  currentUserId,
  isCompanyOwnerAdmin
}: CompanyMembersContentProps) {
  const router = useRouter();
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const editMember = editMemberId ? members.find((m) => m.id === editMemberId) : null;
  const removeMember = removeMemberId ? members.find((m) => m.id === removeMemberId) : null;

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
        {isCompanyOwnerAdmin && (
          <InviteToCompanySheet companyId={companyId} />
        )}
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
    </div>
  );
}
