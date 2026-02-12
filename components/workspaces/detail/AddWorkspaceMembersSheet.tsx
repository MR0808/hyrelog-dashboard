'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  getCompanyMembersNotInWorkspace,
  assignMembersToWorkspace
} from '@/actions/members';
import { toast } from 'sonner';

interface AddWorkspaceMembersSheetProps {
  workspaceId: string;
  companyId: string;
  className?: string;
}

type MemberRow = {
  id: string;
  userId: string;
  role: string;
  user: { id: string; firstName: string; lastName: string; email: string };
};

export function AddWorkspaceMembersSheet({
  workspaceId,
  companyId,
  className
}: AddWorkspaceMembersSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [role, setRole] = useState<'READER' | 'WRITER' | 'ADMIN'>('READER');
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open || !companyId || !workspaceId) return;
    setLoadState('loading');
    getCompanyMembersNotInWorkspace(companyId, workspaceId).then((result) => {
      if (result.ok) {
        setMembers(result.members as MemberRow[]);
        setSelected(new Set());
        setLoadState('idle');
      } else {
        setMembers([]);
        setLoadState('error');
        toast.error(result.error);
      }
    });
  }, [open, companyId, workspaceId]);

  function toggleUser(userId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.size === 0) {
      toast.error('Select at least one member.');
      return;
    }
    startTransition(async () => {
      const result = await assignMembersToWorkspace({
        workspaceId,
        userIds: Array.from(selected),
        role
      });
      if (result.ok) {
        const added = result.added?.length ?? 0;
        const upgraded = result.upgraded?.length ?? 0;
        if (added + upgraded > 0) {
          toast.success(
            added + upgraded === 1
              ? 'Member added'
              : `${added + upgraded} members updated`
          );
        }
        if (result.skipped?.length) {
          toast.info(`${result.skipped.length} already had same or higher role.`);
        }
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add members
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add members to workspace</SheetTitle>
          <SheetDescription>
            Select company members to add to this workspace. Existing members are
            not shown. Role is only set for new members or when upgrading.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 mt-4">
          <div className="space-y-2">
            <Label>Role for new members</Label>
            <Select value={role} onValueChange={(v: 'READER' | 'WRITER' | 'ADMIN') => setRole(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="READER">READER</SelectItem>
                <SelectItem value="WRITER">WRITER</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-h-0 flex flex-col mt-4">
            <Label className="mb-2">Company members not in this workspace</Label>
            {loadState === 'loading' && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {loadState === 'idle' && members.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">
                All company members are already in this workspace.
              </p>
            )}
            {loadState === 'idle' && members.length > 0 && (
              <ul className="space-y-2 overflow-y-auto flex-1 pr-2 border rounded-md p-2">
                {members.map((m) => (
                  <li key={m.userId}>
                    <label className="flex items-center gap-3 cursor-pointer rounded-md p-2 hover:bg-muted/50">
                      <Checkbox
                        checked={selected.has(m.userId)}
                        onCheckedChange={() => toggleUser(m.userId)}
                      />
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {m.user.firstName} {m.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {m.user.email}
                        </p>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex gap-2 mt-4 pt-4 border-t shrink-0">
            <Button type="submit" disabled={selected.size === 0 || isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding…
                </>
              ) : (
                `Add ${selected.size > 0 ? selected.size : ''} member${selected.size !== 1 ? 's' : ''}`
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
