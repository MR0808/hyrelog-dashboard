/**
 * Better Auth Client
 * 
 * Client-side API for better-auth
 * Use this in client components with useTransition
 */

'use client';

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
});

export const { signUp, signIn, signOut } = authClient;
