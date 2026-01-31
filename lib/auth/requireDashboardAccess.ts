'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { safeReturnTo, toLogin, toCheckEmail, toOnboarding } from '@/lib/auth/redirects';

export async function requireDashboardAccess(returnTo?: string) {
  const rt = safeReturnTo(returnTo);

  const h = await headers();
  // Bypass cookie cache so emailVerified etc. are fresh (e.g. right after magic-link verify)
  const session = await auth.api.getSession({ headers: h, query: { disableCookieCache: true } });

  if (!session) {
    redirect(toLogin(rt));
  }

  if (!session.user.emailVerified) {
    redirect(toCheckEmail(session.user.email, rt));
  }

  const isCreator = session.company.createdByUserId === session.user.id;
  if (isCreator) {
    const pending = await prisma.workspace.findFirst({
      where: {
        companyId: session.company.id,
        deletedAt: null,
        onboardingStatus: 'PENDING'
      },
      orderBy: [{ createdAt: 'asc' }],
      select: { id: true }
    });

    if (pending) {
      redirect(toOnboarding(pending.id, rt));
    }
  }

  return session;
}
