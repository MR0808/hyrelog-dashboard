import { headers } from 'next/headers';

import { auth } from '@/lib/auth';

export async function getFreshSession() {
  const headerList = await headers();
  return auth.api.getSession({ headers: headerList, query: { disableCookieCache: true } });
}

export async function getSessionFromHeaders() {
  const h = await headers();
  return auth.api.getSession({ headers: h });
}
