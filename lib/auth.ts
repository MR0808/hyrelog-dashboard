import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';
import { sendWelcomeEmail, sendPasswordResetEmail } from './email';
import { hashPassword, verifyPassword } from './password';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql'
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        password: {
            hash: hashPassword,
            verify: verifyPassword
        }
    },
    email: {
        // Configure email sending with react-email templates
        sendVerificationEmail: async ({
            user,
            url
        }: {
            user: { email: string; name?: string | null };
            url: string;
        }) => {
            // This is called when email verification is enabled
            // For now, we're not using email verification, but this shows how to integrate
            await sendWelcomeEmail(user.email, {
                userName: user.name || undefined,
                loginUrl: url
            });
        },
        sendPasswordResetEmail: async ({
            user,
            url
        }: {
            user: { email: string; name?: string | null };
            url: string;
        }) => {
            await sendPasswordResetEmail(user.email, {
                resetUrl: url,
                userName: user.name || undefined
            });
        },
        sendPasswordChangedEmail: async ({
            user
        }: {
            user: { email: string; name?: string | null };
        }) => {
            // You can create a password-changed email template if needed
            // For now, we'll just log it
            if (process.env.NODE_ENV === 'development') {
                console.log('Password changed for user:', user.email);
            }
        }
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24 // 1 day
    },
    user: {
        changeEmail: {
            enabled: true
        },
        changePassword: {
            enabled: true
        }
    },
    secret: process.env.BETTER_AUTH_SECRET || 'change-me-in-production',
    baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
