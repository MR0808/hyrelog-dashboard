import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getPendingInvitesForCurrentUser } from '@/actions/invites';
import { toLogin } from '@/lib/auth/redirects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default async function InvitesPage() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h, query: { disableCookieCache: true } });

  if (!session) {
    redirect(toLogin('/invites'));
  }

  const sessionWithCompany = session as { company: { id: string } | null };
  if (sessionWithCompany.company) {
    redirect('/workspaces');
  }

  const result = await getPendingInvitesForCurrentUser();
  if (!result.ok) {
    redirect('/onboarding');
  }

  const { invites } = result;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Pending invites
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {invites.length === 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                You don&apos;t have any pending invites. You can create a new company to get started.
              </p>
              <Button asChild>
                <Link href="/onboarding">Get started</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                You have {invites.length} pending invite{invites.length !== 1 ? 's' : ''}. Check your
                email for the invitation link to accept.
              </p>
              <ul className="space-y-2 text-sm">
                {invites.map((inv) => (
                  <li key={inv.id} className="flex flex-col rounded-lg border p-3">
                    <span className="font-medium">{inv.companyName}</span>
                    {inv.workspaceName && (
                      <span className="text-muted-foreground">Workspace: {inv.workspaceName}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Expires {new Date(inv.expiresAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                If you didn&apos;t receive the email, ask the person who invited you to resend the
                invite.
              </p>
              <Button asChild variant="outline">
                <Link href="/auth/login">Back to sign in</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
