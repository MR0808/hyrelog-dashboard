'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { safeReturnTo, toCheckEmail } from '@/lib/auth/redirects';

async function getSessionFromHeaders() {
  const headerList = await headers();
  return auth.api.getSession({ headers: headerList });
}

export const checkOnboardingRequired = async (callbackUrl?: string) => {
  const session = await getSessionFromHeaders();
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

  // If creator + pending exists, onboarding page can proceed
  return { session, workspaceId: workspaceNeedingOnboarding.id };
};
