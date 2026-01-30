'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { safeReturnTo } from '@/lib/auth/redirects';

/**
 * Guard for /auth/verify-email and /auth/verify-code
 *
 * Rules:
 * - Must be logged in
 * - Email may be UNVERIFIED
 * - If already verified, bounce to post-login destination
 */
export async function requireVerifySession(returnTo?: string) {
  const rt = safeReturnTo(returnTo);

  const h = await headers();
  const session = await auth.api.getSession({ headers: h });

  if (!session) {
    // No session → user shouldn't be here
    redirect(`/auth/login?callbackURL=${encodeURIComponent(rt)}`);
  }

  return session;
}
