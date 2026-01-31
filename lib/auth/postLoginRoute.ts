'use server';

import { prisma } from '@/lib/prisma';
import { safeReturnTo, toCheckEmail, toOnboarding } from '@/lib/auth/redirects';
import { SessionShape } from '@/types/auth';

export async function getPostLoginDestination(session: SessionShape, returnTo?: string) {
  const rt = safeReturnTo(returnTo);

  // 1) Email verification gate (caller should use getSession with disableCookieCache for fresh session)
  if (!session.user.emailVerified) {
    return toCheckEmail(session.user.email, rt);
  }

  // 2) Creator-only onboarding gate (no workspace context required)
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
      return toOnboarding(pending.id, rt);
    }
  }

  // 3) Otherwise go where they wanted, or dashboard
  return rt;
}
