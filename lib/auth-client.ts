import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields, customSessionClient } from 'better-auth/client/plugins';
import type { auth } from '@/lib/auth';

function getBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? '';
}

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || getBaseUrl(),
  plugins: [inferAdditionalFields<typeof auth>(), customSessionClient<typeof auth>()]
});

export const {
  signUp,
  signOut,
  signIn,
  useSession,
  sendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  updateUser,
  changeEmail,
  changePassword
} = authClient;
