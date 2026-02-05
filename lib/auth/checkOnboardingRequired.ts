'use server';

import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { safeReturnTo, toCheckEmail } from '@/lib/auth/redirects';
import { getFreshSession } from '../session';

/** Get session from DB (bypass cookie cache) so user fields like emailVerified are fresh. */

export const checkOnboardingRequired = async (callbackUrl?: string) => {
  const session = await getFreshSession();
  const rt = safeReturnTo(callbackUrl);

  if (!session) {
    redirect(`/auth/login?callbackURL=${encodeURIComponent(rt)}`);
  }

  if (!session.user.emailVerified) {
    redirect(toCheckEmail(session.user.email, rt));
  }

  // Creator-only rule: invited users/admins should never be forced to onboard
  const isCreator = session.company.createdByUserId === session.user.id;

  if (!isCreator) {
    redirect(rt);
  }

  // Find a workspace that still needs onboarding for THIS company (workspace required, no workspace context needed).
  const workspaceNeedingOnboarding = await prisma.workspace.findFirst({
    where: {
      companyId: session.company.id,
      deletedAt: null,
      onboardingStatus: 'PENDING'
    },
    orderBy: [{ createdAt: 'asc' }], // stable choice: oldest first (the one created at signup)
    select: { id: true }
  });

  // If none pending -> creator does NOT need onboarding
  if (!workspaceNeedingOnboarding) {
    redirect(rt);
  }

  console.log('workspaceNeedingOnboarding', workspaceNeedingOnboarding);

  // If creator + pending exists, onboarding page can proceed
  return { session, workspaceId: workspaceNeedingOnboarding.id };
};
