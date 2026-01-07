/**
 * Better Auth Configuration
 *
 * Handles authentication for the dashboard using email/password
 * with session-based authentication.
 *
 * NOTE: better-auth's prismaAdapter has compatibility issues with Prisma 7.
 * We use a custom wrapper to fix field mapping issues.
 */

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './db';

// Workaround: better-auth's prismaAdapter may have issues with Prisma 7
// The adapter tries to use accountId/providerId instead of id/provider
// We handle field mapping using Prisma middleware (see lib/db.ts)
let adapter;
try {
    adapter = prismaAdapter(prisma, {
        provider: 'postgresql' // or "mysql", "postgresql", ...etc
    });
} catch (error) {
    // Only log in development - don't expose errors in production
    if (process.env.NODE_ENV === 'development') {
        console.error('Error creating prismaAdapter:', error);
    }
    throw error;
}

export const auth = betterAuth({
    database: adapter,
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false // Set to true in production
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24 // 1 day
    },
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001'
});

export type Session = typeof auth.$Infer.Session;
