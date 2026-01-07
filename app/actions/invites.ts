'use server';

/**
 * Server Actions for Company Invites
 */

import { prisma } from '@/lib/db';
import { audit } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { inviteUserSchema } from '@/lib/validations/auth';
import { getAuthContext } from '@/lib/rbac';
import { generateToken, hashToken } from '@/lib/tokens';
import { sendEmail, getEmailBaseUrl } from '@/lib/email/send';
import { InviteUser } from '@/lib/email/templates/InviteUser';
import { z } from 'zod';

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * Invite a user to join a company
 */
export async function inviteUserAction(
  formData: FormData,
  companyId: string
): Promise<ActionResult> {
  try {
    const authContext = await getAuthContext();
    const userId = authContext.userId;
    const userEmail = authContext.userEmail;

    if (!userId || !companyId) {
      return { success: false, error: 'Not authenticated or missing company' };
    }

    // Check if user is COMPANY_ADMIN
    const membership = await prisma.companyMembership.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
      include: {
        company: true,
        user: true,
      },
    });

    if (!membership || membership.role !== 'COMPANY_ADMIN') {
      return { success: false, error: 'Only company admins can invite users' };
    }

    // Extract and validate form data
    const rawData = {
      email: formData.get('email') as string,
      role: formData.get('role') as string,
    };

    const validatedData = inviteUserSchema.parse(rawData);

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        companyMemberships: {
          where: { companyId },
        },
      },
    });

    if (existingUser && existingUser.companyMemberships.length > 0) {
      return { success: false, error: 'User is already a member of this company' };
    }

    // Check for existing pending invite
    const existingInvite = await prisma.companyInvite.findFirst({
      where: {
        companyId,
        email: validatedData.email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      return { success: false, error: 'An active invite already exists for this email' };
    }

    // Create invite token
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await prisma.companyInvite.create({
      data: {
        companyId,
        email: validatedData.email,
        role: validatedData.role as 'COMPANY_ADMIN' | 'COMPANY_MEMBER',
        tokenHash,
        expiresAt,
        invitedByUserId: userId,
      },
      include: {
        company: true,
        invitedBy: true,
      },
    });

    // Send invite email
    const baseUrl = getEmailBaseUrl();
    const acceptUrl = `${baseUrl}/accept-invite?token=${token}`;

    try {
      await sendEmail({
        to: validatedData.email,
        subject: `You've been invited to join ${invite.company.name} on HyreLog`,
        react: InviteUser({
          companyName: invite.company.name,
          role: invite.role,
          acceptUrl,
          expiresAt: invite.expiresAt.toISOString(),
          inviterName: `${invite.invitedBy.firstName} ${invite.invitedBy.lastName}`.trim(),
        }),
      });
    } catch (emailError) {
      logger.error('[Invite User] Failed to send email:', emailError);
      // Delete invite if email fails
      await prisma.companyInvite.delete({ where: { id: invite.id } });
      return { success: false, error: 'Failed to send invite email' };
    }

    // Log audit event
    await audit.custom('MEMBER_INVITED', {
      resourceType: 'company_invite',
      resourceId: invite.id,
      companyId,
      details: {
        email: validatedData.email,
        role: validatedData.role,
      },
    });

    logger.log('[Invite User] Successfully invited user:', validatedData.email);

    return { success: true };
  } catch (error) {
    logger.error('[Invite User] Exception:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Validation failed',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to invite user',
    };
  }
}

/**
 * Accept an invite
 */
export async function acceptInviteAction(token: string): Promise<ActionResult<{ companyId: string }>> {
  try {
    if (!token) {
      return { success: false, error: 'Invite token is required' };
    }

    const tokenHash = hashToken(token);

    // Find invite
    const invite = await prisma.companyInvite.findUnique({
      where: { tokenHash },
      include: {
        company: true,
      },
    });

    if (!invite) {
      return { success: false, error: 'Invalid or expired invite token' };
    }

    // Check if already accepted
    if (invite.acceptedAt) {
      return { success: false, error: 'This invite has already been accepted' };
    }

    // Check if expired
    if (invite.expiresAt < new Date()) {
      return { success: false, error: 'Invite token has expired' };
    }

    // Get current user
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

    // Check if email matches
    if (user.email !== invite.email) {
      return { success: false, error: 'This invite was sent to a different email address' };
    }

    // Check if user is verified (if new user, they need to verify first)
    if (!user.emailVerified) {
      return {
        success: false,
        error: 'Email verification required before accepting invites. Please verify your email first.',
      };
    }

    // Check if already a member
    const existingMembership = await prisma.companyMembership.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId: invite.companyId,
        },
      },
    });

    if (existingMembership) {
      // Mark invite as accepted anyway
      await prisma.companyInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });
      return { success: true, data: { companyId: invite.companyId } };
    }

    // Create membership
    await prisma.$transaction([
      prisma.companyMembership.create({
        data: {
          userId,
          companyId: invite.companyId,
          role: invite.role,
        },
      }),
      prisma.companyInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    // Log audit event
    await audit.custom('MEMBER_INVITE_ACCEPTED', {
      resourceType: 'company_membership',
      resourceId: userId,
      companyId: invite.companyId,
      details: {
        role: invite.role,
        email: user.email,
      },
    });

    logger.log('[Accept Invite] Successfully accepted invite for user:', userId);

    return { success: true, data: { companyId: invite.companyId } };
  } catch (error) {
    logger.error('[Accept Invite] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to accept invite',
    };
  }
}
