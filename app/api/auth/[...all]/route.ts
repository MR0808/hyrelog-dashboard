/**
 * Better Auth API Route Handler
 * 
 * Handles all better-auth API requests (sign-in, sign-up, sign-out, etc.)
 */

import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
