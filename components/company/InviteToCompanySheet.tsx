'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { createCompanyInvite } from '@/actions/invites';
import { toast } from 'sonner';

interface InviteToCompanySheetProps {
  companyId: string;
  className?: string;
}

export function InviteToCompanySheet({ companyId, className }: InviteToCompanySheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'BILLING' | 'ADMIN' | 'OWNER'>('MEMBER');
  const [isPending, startTransition] = useTransition();
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const result = await createCompanyInvite({
        companyId,
        email: trimmed,
        companyRole: role
      });
      if (result.ok) {
        setInviteLink(result.inviteLink);
        toast.success('Invite created');
        if (!result.inviteLink) {
          setOpen(false);
          router.refresh();
        }
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleCopy() {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleClose(open: boolean) {
    if (!open) {
      setInviteLink(null);
      setEmail('');
      setRole('MEMBER');
      router.refresh();
    }
    setOpen(open);
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetTrigger asChild>
        <Button className={className}>
          <Plus className="h-4 w-4 mr-2" />
          Invite to company
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Invite to company</SheetTitle>
          <SheetDescription>
            Send an invite link. The recipient must sign in with this email to accept.
          </SheetDescription>
        </SheetHeader>
        {inviteLink ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm font-medium">Invite link created</p>
            <p className="text-xs text-muted-foreground">
              Share this link with the invitee. They won&apos;t be able to see it again.
            </p>
            <div className="flex gap-2">
              <Input readOnly value={inviteLink} className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button onClick={() => handleClose(false)}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Company role</Label>
              <Select value={role} onValueChange={(v: any) => setRole(v)} disabled={isPending}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">MEMBER</SelectItem>
                  <SelectItem value="BILLING">BILLING</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="OWNER">OWNER</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating…
                  </>
                ) : (
                  'Create invite'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
