'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { prisma } from './prisma';

async function getSessionFromHeaders() {
  const headerList = await headers();
  return auth.api.getSession({ headers: headerList });
}

function safeReturnTo(path?: string) {
  if (!path) return '/';
  if (!path.startsWith('/')) return '/';
  if (path.startsWith('//')) return '/';
  return path;
}

function checkEmailRedirect(email: string, returnTo?: string) {
  const rt = safeReturnTo(returnTo);
  return `/auth/check-email?email=${encodeURIComponent(email)}&returnTo=${encodeURIComponent(rt)}`;
}

// Checks if the user is logged in, if so, redirects to the home page. This is used on auth pages

export const isLoggedIn = async (callbackUrl?: string) => {
  const session = await getSessionFromHeaders();
  if (!session) return null;

  const rt = safeReturnTo(callbackUrl);

  if (!session.user.emailVerified) {
    redirect(checkEmailRedirect(session.user.email, rt));
  }

  redirect(rt);
};

export const authCheckAuth = async () => {
  const session = await getSessionFromHeaders();

  if (!session) {
    redirect('/auth/login');
  }

  if (session && session.user.emailVerified) {
    redirect('/');
  }
};

// Checks if the user is logged in, if not, redirects to the login page. This is used on protected pages

export const authCheck = async (callbackUrl?: string) => {
  const session = await getSessionFromHeaders();
  const rt = safeReturnTo(callbackUrl);

  if (!session) {
    redirect(`/auth/login?callbackURL=${encodeURIComponent(rt)}`);
  }

  if (!session.user.emailVerified) {
    redirect(checkEmailRedirect(session.user.email, rt));
  }

  return session;
};

// checks if the user is logged in and returns the session for server actions

export const authCheckServer = async () => {
  const session = await getSessionFromHeaders();
  return session ?? null;
};

// checks if the user is logged in and has completed onboarding, for the onboarding page

export const authCheckOnboarding = async (callbackUrl?: string) => {
  const session = await getSessionFromHeaders();
  const rt = safeReturnTo(callbackUrl);

  if (!session) {
    redirect(`/auth/login?callbackURL=${encodeURIComponent(rt)}`);
  }

  if (!session.user.emailVerified) {
    redirect(checkEmailRedirect(session.user.email, rt));
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

export const enforceCreatorOnboardingAtEntry = async (callbackUrl?: string) => {
  const session = await authCheck(callbackUrl); // includes login + verify gating
  const rt = safeReturnTo(callbackUrl);

  const isCreator = session.company.createdByUserId === session.user.id;
  if (!isCreator) return session;

  const pending = await prisma.workspace.findFirst({
    where: {
      companyId: session.company.id,
      deletedAt: null,
      onboardingStatus: 'PENDING'
    },
    select: { id: true },
    orderBy: [{ createdAt: 'asc' }]
  });

  if (pending) {
    redirect(
      `/onboarding?workspaceId=${encodeURIComponent(pending.id)}&returnTo=${encodeURIComponent(rt)}`
    );
  }

  return session;
};

// export const authCheckAdmin = async (callbackUrl?: string) => {
//   const session = await getSessionFromHeaders();
//   if (!session) {
//     const url = callbackUrl
//       ? `/auth/login?callbackURL=${encodeURIComponent(callbackUrl)}`
//       : `/auth/login`;

//     throw redirect(url);
//   }

//   if (session.user.role !== 'SITE_ADMIN') {
//     throw redirect('/');
//   }

//   return session;
// };
