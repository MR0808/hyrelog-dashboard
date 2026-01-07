'use server';

/**
 * Server Actions for Authentication
 * 
 * Uses better-auth API directly for authentication
 */

import { auth } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { signUpSchema, signInSchema } from '@/lib/validations/auth';
import { redirect } from 'next/navigation';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { headers, cookies } from 'next/headers';
import { generateToken, hashToken } from '@/lib/tokens';
import { sendEmail, getEmailBaseUrl } from '@/lib/email/send';
import { VerifyEmail } from '@/lib/email/templates/VerifyEmail';

export type ActionResult<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * Sign up a new user
 */
export async function signUpAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    // Extract and validate form data
    const rawData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    // Validate with Zod
    const validatedData = signUpSchema.parse(rawData);

    // Combine firstName and lastName for better-auth
    const name = `${validatedData.firstName} ${validatedData.lastName}`.trim();

    logger.log('[SignUp Action] Attempting signup for:', validatedData.email);

    // Get headers for better-auth API
    const headersList = await headers();
    const cookieStore = await cookies();
    
    // Convert headers to plain object
    const headersObj: Record<string, string> = {};
    headersList.forEach((value, key) => {
      headersObj[key] = value;
    });
    
    // Add cookies to headers
    const cookieHeader = cookieStore.toString();
    if (cookieHeader) {
      headersObj['cookie'] = cookieHeader;
    }

    // Call better-auth sign-up API
    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: validatedData.email,
          password: validatedData.password,
          name: name,
        },
        headers: headersObj,
      });

      if (!result || !result.user) {
        logger.error('[SignUp Action] Signup failed - no user returned');
        return {
          success: false,
          error: 'Sign up failed. Please try again.',
        };
      }
    } catch (authError: any) {
      logger.error('[SignUp Action] Better-auth error:', authError);
      const errorMessage = authError?.message || authError?.error || 'Sign up failed';
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Get the created user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      logger.error('[SignUp Action] User not found after signup');
      return {
        success: false,
        error: 'User creation failed. Please try again.',
      };
    }

    // Update user with firstName and lastName (required fields)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      },
    });

    // Create email verification token
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Send verification email
    const baseUrl = getEmailBaseUrl();
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    try {
      await sendEmail({
        to: validatedData.email,
        subject: 'Verify your email to activate HyreLog',
        react: VerifyEmail({
          verificationUrl,
          firstName: validatedData.firstName,
        }),
      });
    } catch (emailError) {
      logger.error('[SignUp Action] Failed to send verification email:', emailError);
      // Don't fail signup if email fails - user can request resend
    }

    // Log audit event
    await audit.custom('USER_CREATED', {
      resourceType: 'user',
      resourceId: user.id,
      details: { email: validatedData.email },
    });

    logger.log('[SignUp Action] Successfully signed up user:', user.id);

    // Redirect to verification page (don't auto-verify)
    redirect('/verify-email-sent');
  } catch (error) {
    logger.error('[SignUp Action] Exception:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Validation failed',
      };
    }

    if (error && typeof error === 'object' && 'message' in error) {
      // This might be a redirect, re-throw it
      throw error;
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during sign up',
    };
  }
}

/**
 * Sign in an existing user
 */
export async function signInAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    // Extract and validate form data
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    // Validate with Zod
    const validatedData = signInSchema.parse(rawData);

    logger.log('[SignIn Action] Attempting signin for:', validatedData.email);

    // Get headers for better-auth API
    const headersList = await headers();
    const cookieStore = await cookies();
    
    // Convert headers to plain object
    const headersObj: Record<string, string> = {};
    headersList.forEach((value, key) => {
      headersObj[key] = value;
    });
    
    // Add cookies to headers
    const cookieHeader = cookieStore.toString();
    if (cookieHeader) {
      headersObj['cookie'] = cookieHeader;
    }

    // Call better-auth sign-in API
    try {
      const result = await auth.api.signInEmail({
        body: {
          email: validatedData.email,
          password: validatedData.password,
        },
        headers: headersObj,
      });

      if (!result || !result.user) {
        logger.error('[SignIn Action] Signin failed - no user returned');
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }
    } catch (authError: any) {
      logger.error('[SignIn Action] Better-auth error:', authError);
      const errorMessage = authError?.message || authError?.error || 'Invalid email or password';
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Get the user for audit logging
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (user) {
      // Log audit event
      await audit.userLogin(user.id);
      logger.log('[SignIn Action] Successfully signed in user:', user.id);
    }

    // Redirect on success
    redirect('/');
  } catch (error) {
    logger.error('[SignIn Action] Exception:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Validation failed',
      };
    }

    if (error && typeof error === 'object' && 'message' in error) {
      // This might be a redirect, re-throw it
      throw error;
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during sign in',
    };
  }
}
