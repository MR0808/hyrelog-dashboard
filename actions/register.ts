'use server';

import * as z from 'zod';
import GithubSlugger from 'github-slugger';
import { APIError } from 'better-auth/api';

import { RegisterSchema } from '@/schemas/register';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generateOTP } from '@/lib/otp';
// import { sendVerificationEmail } from '@/lib/mail';
import { EmailCheckResult, RegisterInitialData } from '@/types/register';
import { ActionResult } from '@/types/global';

let cachedDomains: string[] | null = null;
let lastFetched: number | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms
const slugger = new GithubSlugger();

/* ------------------------------------------------------------------
 * registerInitial
 * ------------------------------------------------------------------ */

export const registerInitial = async (
  values: z.infer<typeof RegisterSchema>
): Promise<ActionResult<RegisterInitialData>> => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid fields'
    };
  }

  const { firstName, lastName, email, password, companyName } = validatedFields.data;

  const name = `${firstName} ${lastName}`;

  const compName = companyName || `${name}'s Company`;

  try {
    const emailCheck = await checkEmail(email);

    if (emailCheck.error) {
      return {
        success: false,
        message: `Email is invalid - ${emailCheck.error}`
      };
    }
    if (emailCheck.isDisposable) {
      return {
        success: false,
        message: 'Email is invalid'
      };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return {
        success: false,
        message: 'An account with this email already exists.'
      };
    }

    // Register via Better Auth
    const data = await auth.api.signUpEmail({
      body: {
        name,
        firstName,
        lastName,
        email,
        password
      }
    });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create unique company slug
    let slug = slugger.slug(compName);
    let slugExists = true;

    while (slugExists) {
      const checkSlug = await prisma.company.findUnique({
        where: { slug }
      });

      if (!checkSlug) {
        slugExists = false;
      } else {
        slug = slugger.slug(compName);
      }
    }

    const plan = await prisma.plan.findUnique({ where: { code: 'free' } });

    if (!plan) {
      return {
        success: false,
        message: 'Default plan not found'
      };
    }

    const company = await prisma.company.create({
      data: {
        slug,
        name: compName,
        creatorId: data.user.id,
        planId: plan.id
      }
    });

    await logCompanyCreated(data.user.id, {
      companyId: company.id,
      companyName: company.name
    });

    await prisma.companyMember.create({
      data: {
        companyId: company.id,
        userId: data.user.id,
        role: 'COMPANY_ADMIN'
      }
    });

    // Reset slugger to avoid weird cumulative state
    slugger.reset();

    // Create default team
    let teamSlug = slugger.slug(compName);
    let teamSlugExists = true;

    while (teamSlugExists) {
      const checkSlug = await prisma.team.findUnique({
        where: { slug: teamSlug }
      });

      if (!checkSlug) {
        teamSlugExists = false;
      } else {
        teamSlug = slugger.slug(compName);
      }
    }

    const team = await prisma.team.create({
      data: {
        slug: teamSlug,
        name: compName,
        description: `The default team for ${compName}`,
        companyId: company.id,
        creatorId: data.user.id,
        defaultTeam: true
      }
    });

    await prisma.teamMember.create({
      data: {
        role: 'TEAM_ADMIN',
        teamId: team.id,
        userId: data.user.id
      }
    });

    // Email verification record
    await prisma.verification.create({
      data: {
        identifier: `email-otp:${data.user.id}`,
        value: otp,
        expiresAt
      }
    });

    const emailSent = await sendVerificationEmail({ email, otp, name });

    if (emailSent.error) {
      return {
        success: false,
        message: 'Failed to send verification email'
      };
    }

    await logUserRegistered(data.user.id, {
      registrationMethod: 'email',
      emailVerified: false
    });

    await logEmailVerifyRequested(data.user.id, data.user.email);

    return {
      success: true,
      message: 'Registration started successfully',
      data: {
        userId: data.user.id
      }
    };
  } catch (err: unknown) {
    if (err instanceof APIError) {
      return {
        success: false,
        message: err.message
      };
    }

    return {
      success: false,
      message: 'Internal Server Error'
    };
  }
};

/* ------------------------------------------------------------------
 * checkEmail (kept as EmailCheckResult)
 * ------------------------------------------------------------------ */

export const checkEmail = async (email: string): Promise<EmailCheckResult> => {
  try {
    // Basic format validation
    if (!email || !email.includes('@')) {
      return { isDisposable: false, error: 'Invalid email format' };
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) {
      return { isDisposable: false, error: 'Invalid email domain' };
    }

    // Refresh disposable domain list if needed
    const now = Date.now();
    if (!cachedDomains || !lastFetched || now - lastFetched > CACHE_DURATION) {
      const response = await fetch(
        'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf',
        { cache: 'force-cache' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch disposable email domains');
      }

      const text = await response.text();
      cachedDomains = text
        .split('\n')
        .map((line) => line.trim().toLowerCase())
        .filter((line) => line && !line.startsWith('#'));
      lastFetched = now;
    }

    const isDisposable = cachedDomains.includes(domain);

    return { isDisposable, error: null };
  } catch (error) {
    console.error('Error checking email:', error);
    return { isDisposable: false, error: 'Server error occurred' };
  }
};
