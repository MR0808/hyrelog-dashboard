'use server';

import { prisma } from '@/lib/prisma';
import { safeReturnTo, toCheckEmail, toOnboarding } from '@/lib/auth/redirects';
import { normalizeEmail } from '@/lib/members/utils';
import type { SessionShape } from '@/types/auth';

type SessionWithOptionalCompany = SessionShape & {
  company?: { id: string; createdByUserId: string | null } | null;
};

export async function getPostLoginDestination(session: SessionWithOptionalCompany, returnTo?: string) {
  const rt = safeReturnTo(returnTo);

  if (!session.user.emailVerified) {
    return toCheckEmail(session.user.email, rt);
  }

  // No company (invited user or new user) -> invites list or onboarding
  if (!session.company) {
    const emailNorm = normalizeEmail(session.user.email);
    const pendingInvite = await prisma.invite.findFirst({
      where: {
        emailNormalized: emailNorm,
        status: 'PENDING',
        revokedAt: null,
        expiresAt: { gt: new Date() },
        pendingKey: { not: null }
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true }
    });
    if (pendingInvite) {
      return '/invites';
    }
    return '/onboarding';
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
      return toOnboarding(pending.id, rt);
    }
  }

  return rt;
}
