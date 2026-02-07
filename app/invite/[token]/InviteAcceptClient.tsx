'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { acceptInvite } from '@/actions/invites';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface InviteAcceptClientProps {
  token: string;
  hasSession: boolean;
  userEmailVerified: boolean;
  redirectTo: string;
}

export function InviteAcceptClient({
  token,
  hasSession,
  userEmailVerified,
  redirectTo
}: InviteAcceptClientProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleAccept() {
    setPending(true);
    const result = await acceptInvite({ token });
    setPending(false);
    if (result.ok) {
      toast.success('Invite accepted');
      router.push(result.redirectTo);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  if (!hasSession) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Sign in to accept this invite.</p>
        <Button asChild>
          <Link href={`/auth/login?callbackURL=${encodeURIComponent(`/invite/${token}`)}`}>
            Sign in
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/register">Create account</Link>
        </Button>
      </div>
    );
  }

  if (!userEmailVerified) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-amber-600 dark:text-amber-500">
          Verify your email before accepting. The invite was sent to the email on your account.
        </p>
        <Button asChild variant="outline">
          <Link href={`/auth/check-email?returnTo=${encodeURIComponent(`/invite/${token}`)}`}>
            Verify email
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleAccept} disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Accepting…
          </>
        ) : (
          'Accept invite'
        )}
      </Button>
      <Button asChild variant="outline">
        <Link href="/workspaces">Decline</Link>
      </Button>
    </div>
  );
}
