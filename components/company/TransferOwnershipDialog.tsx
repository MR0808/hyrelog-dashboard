'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { transferCompanyOwnership, type TransferOwnershipErrorCode } from '@/actions/members';
import { toast } from 'sonner';

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

const ERROR_MESSAGES: Record<TransferOwnershipErrorCode, string> = {
  FORBIDDEN: 'Only an owner can transfer ownership.',
  INVALID_CONFIRMATION: "Company slug confirmation didn't match.",
  INVALID_TARGET: 'Target must be an active, verified company member.',
  NO_OP: "You can't transfer ownership to yourself.",
  COMPANY_DELETED: 'This company is deleted and cannot be modified.',
  NOT_FOUND: 'Company or member not found.'
};

interface TransferOwnershipDialogProps {
  companyId: string;
  companySlug: string;
  members: Member[];
  currentUserId: string;
}

export function TransferOwnershipDialog({
  companyId,
  companySlug,
  members,
  currentUserId
}: TransferOwnershipDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [confirmationSlug, setConfirmationSlug] = useState('');
  const [isPending, startTransition] = useTransition();

  const eligibleTargets = members.filter((m) => m.userId !== currentUserId);
  const slugMatches = confirmationSlug.trim() === companySlug;
  const canSubmit = targetUserId && slugMatches && !isPending;

  function handleOpenChange(next: boolean) {
    if (!next) {
      setTargetUserId('');
      setConfirmationSlug('');
    }
    setOpen(next);
  }

  function handleSubmit() {
    if (!canSubmit) return;
    startTransition(async () => {
      const result = await transferCompanyOwnership({
        companyId,
        targetUserId,
        confirmationSlug: confirmationSlug.trim()
      });
      if (result.ok) {
        toast.success('Ownership transferred. You are now an Admin.');
        handleOpenChange(false);
        router.refresh();
      } else {
        const message = ERROR_MESSAGES[result.code];
        toast.error(message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Crown className="h-4 w-4 mr-2" />
          Transfer ownership
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer ownership</DialogTitle>
          <DialogDescription>
            Owners have full access to company settings, members, billing, and all workspaces. You
            will be demoted to Admin.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>New owner</Label>
            <Select value={targetUserId} onValueChange={setTargetUserId} disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {eligibleTargets.map((m) => (
                  <SelectItem key={m.userId} value={m.userId}>
                    {m.user.firstName} {m.user.lastName} ({m.user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-confirm-slug">
              Type <strong>{companySlug}</strong> to confirm
            </Label>
            <Input
              id="transfer-confirm-slug"
              placeholder={companySlug}
              value={confirmationSlug}
              onChange={(e) => setConfirmationSlug(e.target.value)}
              disabled={isPending}
              className="font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {isPending ? 'Transferring…' : 'Transfer ownership'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
