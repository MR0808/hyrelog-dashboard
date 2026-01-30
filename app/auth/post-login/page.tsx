import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { getPostLoginDestination } from '@/lib/auth/postLoginRoute';
import { safeReturnTo, toLogin } from '@/lib/auth/redirects';

export default async function PostLoginPage({
  searchParams
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const rt = safeReturnTo(returnTo);

  const h = await headers();
  const session = await auth.api.getSession({ headers: h });

  if (!session) redirect(toLogin(rt));

  const dest = await getPostLoginDestination(session as any, rt);
  redirect(dest);
}
