'use server';

/**
 * Server Actions for Email Verification
 */

import { prisma } from '@/lib/db';
import { audit } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { verifyToken } from '@/lib/tokens';
import { generateToken, hashToken } from '@/lib/tokens';
import { sendEmail, getEmailBaseUrl } from '@/lib/email/send';
import { VerifyEmail } from '@/lib/email/templates/VerifyEmail';
import { redirect } from 'next/navigation';
import { getAuthContext } from '@/lib/rbac';

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * Verify email with token
 */
export async function verifyEmailAction(token: string): Promise<ActionResult> {
  try {
    if (!token) {
      return { success: false, error: 'Verification token is required' };
    }

    const tokenHash = hashToken(token);

    // Find verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!verificationToken) {
      return { success: false, error: 'Invalid or expired verification token' };
    }

    // Check if already used
    if (verificationToken.usedAt) {
      return { success: false, error: 'This verification link has already been used' };
    }

    // Check if expired
    if (verificationToken.expiresAt < new Date()) {
      return { success: false, error: 'Verification token has expired' };
    }

    // Mark token as used and verify user email
    await prisma.$transaction([
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      }),
    ]);

    // Log audit event
    await audit.custom('USER_EMAIL_VERIFIED', {
      resourceType: 'user',
      resourceId: verificationToken.userId,
      details: { email: verificationToken.user.email },
    });

    logger.log('[Verify Email] Successfully verified email for user:', verificationToken.userId);

    return { success: true };
  } catch (error) {
    logger.error('[Verify Email] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify email',
    };
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationAction(): Promise<ActionResult> {
  try {
    const authContext = await getAuthContext();
    const userId = authContext.userId;

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Email is already verified' };
    }

    // Invalidate old tokens
    await prisma.emailVerificationToken.updateMany({
      where: {
        userId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        usedAt: new Date(), // Mark as used to invalidate
      },
    });

    // Create new verification token
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    // Send verification email
    const baseUrl = getEmailBaseUrl();
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Verify your email to activate HyreLog',
      react: VerifyEmail({
        verificationUrl,
        firstName: user.firstName || 'User',
      }),
    });

    logger.log('[Resend Verification] Sent verification email to user:', userId);

    return { success: true };
  } catch (error) {
    logger.error('[Resend Verification] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resend verification email',
    };
  }
}
