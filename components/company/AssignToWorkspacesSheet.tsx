'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Loader2 } from 'lucide-react';
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
import { assignMembersToWorkspaces } from '@/actions/members';
import { toast } from 'sonner';
import type { WorkspaceOption } from './CompanyMembersContent';

interface Member {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface AssignToWorkspacesSheetProps {
  companyId: string;
  members: Member[];
  workspaces: WorkspaceOption[];
}

export function AssignToWorkspacesSheet({
  companyId,
  members,
  workspaces
}: AssignToWorkspacesSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<Set<string>>(new Set());
  const [role, setRole] = useState<'READER' | 'WRITER' | 'ADMIN'>('READER');
  const [isPending, startTransition] = useTransition();

  function toggleMember(userId: string) {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function toggleWorkspace(workspaceId: string) {
    setSelectedWorkspaces((prev) => {
      const next = new Set(prev);
      if (next.has(workspaceId)) next.delete(workspaceId);
      else next.add(workspaceId);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedMembers.size === 0 || selectedWorkspaces.size === 0) {
      toast.error('Select at least one member and one workspace.');
      return;
    }
    startTransition(async () => {
      const result = await assignMembersToWorkspaces({
        workspaceIds: Array.from(selectedWorkspaces),
        userIds: Array.from(selectedMembers),
        role
      });
      if (result.ok) {
        const added = result.added?.length ?? 0;
        const upgraded = result.upgraded?.length ?? 0;
        if (added + upgraded > 0) {
          toast.success(
            added + upgraded === 1
              ? 'Member assigned'
              : `${added + upgraded} assignments updated`
          );
        }
        if (result.skipped?.length) {
          toast.info('Some already had same or higher role in that workspace.');
        }
        setOpen(false);
        setSelectedMembers(new Set());
        setSelectedWorkspaces(new Set());
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (workspaces.length === 0) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <LayoutGrid className="h-4 w-4 mr-2" />
          Assign to workspaces
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Assign members to workspaces</SheetTitle>
          <SheetDescription>
            Select company members and workspaces. They will get the chosen role
            where they don’t already have the same or higher role.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 mt-4">
          <div className="space-y-2">
            <Label>Role</Label>
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
          <div className="mt-4 space-y-2">
            <Label>Members</Label>
            <ul className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
              {members.map((m) => (
                <li key={m.userId}>
                  <label className="flex items-center gap-3 cursor-pointer rounded-md p-2 hover:bg-muted/50">
                    <Checkbox
                      checked={selectedMembers.has(m.userId)}
                      onCheckedChange={() => toggleMember(m.userId)}
                    />
                    <span className="truncate text-sm">
                      {m.user.firstName} {m.user.lastName}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 space-y-2">
            <Label>Workspaces</Label>
            <ul className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
              {workspaces.map((w) => (
                <li key={w.id}>
                  <label className="flex items-center gap-3 cursor-pointer rounded-md p-2 hover:bg-muted/50">
                    <Checkbox
                      checked={selectedWorkspaces.has(w.id)}
                      onCheckedChange={() => toggleWorkspace(w.id)}
                    />
                    <span className="truncate text-sm">{w.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2 mt-4 pt-4 border-t shrink-0">
            <Button
              type="submit"
              disabled={
                selectedMembers.size === 0 || selectedWorkspaces.size === 0 || isPending
              }
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning…
                </>
              ) : (
                'Assign'
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
