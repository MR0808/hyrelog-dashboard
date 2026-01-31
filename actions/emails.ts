// app/auth/check-email/resend-action.ts
'use server';

import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail';
import { sha256 } from '@/lib/crypto';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getPostLoginDestination } from '@/lib/auth/postLoginRoute';
import { getFreshSession } from '@/lib/session';
import { ResendSchema, VerifyCodeSchema } from '@/schemas/emails';

// NOTE: This assumes you have EmailVerificationChallenge model like the one we discussed.
// If your model/table name differs, rename accordingly.
export async function resendVerificationEmail(values: z.infer<typeof ResendSchema>) {
  const parsed = ResendSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: 'Invalid email.' };

  const email = parsed.data.email.toLowerCase().trim();

  // Generic response policy: never reveal account existence
  const genericOk = { success: true as const, message: 'If an account exists, we sent a message.' };

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, firstName: true }
  });

  if (!user) return genericOk;

  // Server-side rate limit: 60s between sends per user
  const latest = await prisma.emailVerificationChallenge.findFirst({
    where: { userId: user.id, usedAt: null, revokedAt: null },
    orderBy: { createdAt: 'desc' },
    select: { lastSentAt: true }
  });

  const now = Date.now();
  const last = latest?.lastSentAt?.getTime() ?? 0;

  if (last && now - last < 60_000) {
    return { success: false as const, message: 'Please wait a moment before resending.' };
  }

  // Send a fresh challenge email
  await sendVerificationEmail({
    userId: user.id,
    email: user.email,
    firstName: user.firstName ?? undefined
  });

  return genericOk;
}

export async function verifyMagicLink(args: { cid: string; token: string }) {
  const { cid, token } = args;

  const challenge = await prisma.emailVerificationChallenge.findUnique({
    where: { id: cid },
    include: { user: true }
  });

  if (!challenge) {
    return { ok: false as const, code: 'NOT_FOUND', message: 'Verification link is invalid.' };
  }

  if (challenge.usedAt) {
    // Treat as already verified (idempotent)
    if (challenge.user.emailVerified) {
      // Optional: create session anyway
      return { ok: true as const, already: true as const, userId: challenge.userId };
    }
    return {
      ok: false as const,
      code: 'ALREADY_USED',
      message: 'This verification link has already been used.'
    };
  }

  if (challenge.revokedAt) {
    return {
      ok: false as const,
      code: 'REVOKED',
      message: 'This verification link is no longer valid. Please request a new one.'
    };
  }

  if (challenge.magicExpiresAt.getTime() < Date.now()) {
    return {
      ok: false as const,
      code: 'EXPIRED',
      message: 'This verification link has expired. Please request a new one.'
    };
  }

  const tokenHash = sha256(token);
  if (tokenHash !== challenge.magicTokenHash) {
    return { ok: false as const, code: 'INVALID', message: 'Verification link is invalid.' };
  }

  // Success: mark used + verify user + audit + create session
  await prisma.$transaction(async (tx) => {
    await tx.emailVerificationChallenge.update({
      where: { id: challenge.id },
      data: { usedAt: new Date() }
    });

    await tx.user.update({
      where: { id: challenge.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    await tx.auditLog.create({
      data: {
        userId: challenge.userId,
        action: 'USER_EMAIL_VERIFIED',
        resourceType: 'User',
        resourceId: challenge.userId,
        details: { method: 'magic_link', challengeId: challenge.id, email: challenge.email }
      }
    });
  });

  return { ok: true as const, userId: challenge.userId };
}

export async function verifyOtp(args: { email: string; code: string }) {
  const email = args.email.toLowerCase().trim();
  const code = args.code.trim();

  if (!/^\d{6}$/.test(code)) {
    return { ok: false as const, code: 'BAD_FORMAT', message: 'Code must be 6 digits.' };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true }
  });

  // Don’t reveal existence; generic error is fine
  if (!user) {
    return { ok: false as const, code: 'INVALID', message: 'That code is incorrect or expired.' };
  }

  // Find latest active challenge for this user/email
  const challenge = await prisma.emailVerificationChallenge.findFirst({
    where: {
      userId: user.id,
      email,
      usedAt: null,
      revokedAt: null
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!challenge) {
    return { ok: false as const, code: 'INVALID', message: 'That code is incorrect or expired.' };
  }

  if (challenge.otpExpiresAt.getTime() < Date.now()) {
    return {
      ok: false as const,
      code: 'EXPIRED',
      message: 'That code has expired. Request a new one.'
    };
  }

  if (challenge.otpAttempts >= 5) {
    return {
      ok: false as const,
      code: 'LOCKED',
      message: 'Too many attempts. Please request a new code.'
    };
  }

  const codeHash = sha256(code);
  if (codeHash !== challenge.otpHash) {
    await prisma.emailVerificationChallenge.update({
      where: { id: challenge.id },
      data: { otpAttempts: { increment: 1 } }
    });

    return { ok: false as const, code: 'INVALID', message: 'That code is incorrect or expired.' };
  }

  // Success
  await prisma.$transaction(async (tx) => {
    await tx.emailVerificationChallenge.update({
      where: { id: challenge.id },
      data: { usedAt: new Date() }
    });

    await tx.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifiedAt: new Date() }
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_EMAIL_VERIFIED',
        resourceType: 'User',
        resourceId: user.id,
        details: { method: 'otp', challengeId: challenge.id, email }
      }
    });
  });

  return { ok: true as const, userId: user.id };
}

export async function verifyCodeAction(values: z.infer<typeof VerifyCodeSchema>) {
  const h = await headers();

  const session = await auth.api.getSession({ headers: h });
  if (!session) {
    redirect(`/auth/login`);
  }

  const parsed = VerifyCodeSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false as const, message: 'Please enter a valid email and 6-digit code.' };
  }

  const res = await verifyOtp({
    email: parsed.data.email,
    code: parsed.data.code
  });

  if (!res.ok) {
    return { success: false as const, message: res.message };
  }

  const updatedSession = await getFreshSession();

  const dest = await getPostLoginDestination(updatedSession as any, '/');

  return { success: true as const, destination: dest };
}
