import { headers } from 'next/headers';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { validateInviteToken } from '@/actions/invites';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InviteAcceptClient } from './InviteAcceptClient';

export default async function InviteTokenPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const h = await headers();
  const session = await auth.api.getSession({ headers: h, query: { disableCookieCache: true } });

  const validation = await validateInviteToken(token);

  if (!validation.ok) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid invite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{validation.error}</p>
            <Button asChild variant="outline">
              <Link href={session ? '/workspaces' : '/auth/login'}>
                {session ? 'Go to workspaces' : 'Sign in'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    companyName,
    workspaceName,
    workspaceId,
    scope,
    companyRole,
    workspaceRole,
    email
  } = validation;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>You&apos;re invited</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You&apos;ve been invited to join <strong>{companyName}</strong>
            {workspaceName && (
              <>
                {' '}
                — workspace <strong>{workspaceName}</strong>
              </>
            )}
            .
          </p>
          <ul className="text-sm space-y-1">
            <li>Company role: {companyRole ?? 'MEMBER'}</li>
            {scope === 'WORKSPACE' && workspaceRole && (
              <li>Workspace role: {workspaceRole}</li>
            )}
          </ul>
          <p className="text-xs text-muted-foreground">Invite sent to: {email}</p>
          <InviteAcceptClient
            token={token}
            hasSession={!!session}
            userEmailVerified={!!session?.user?.emailVerified}
            redirectTo={workspaceId ? `/workspaces/${workspaceId}` : '/workspaces'}
          />
        </CardContent>
      </Card>
    </div>
  );
}
