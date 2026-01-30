'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getPostLoginDestination } from '@/lib/auth/postLoginRoute';
import { safeReturnTo } from '@/lib/auth/redirects';

export async function redirectIfLoggedIn(callbackURL?: string) {
  const rt = safeReturnTo(callbackURL);

  const h = await headers();
  const session = await auth.api.getSession({ headers: h });

  if (!session) return null;

  const dest = await getPostLoginDestination(session as any, rt);
  redirect(dest);
}
