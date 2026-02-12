'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireDashboardAccess } from '@/lib/auth/requireDashboardAccess';
import {
  uploadToS3,
  isStorageConfigured,
  MAX_AVATAR_SIZE,
  ALLOWED_AVATAR_TYPES
} from '@/lib/storage/s3';

const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  name: z.string().max(200).optional(),
  jobTitle: z.string().max(200).optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string().max(100).optional(),
  locale: z.string().max(20).optional()
});

/** Get current user profile for settings (extended fields from DB). */
export async function getProfile() {
  const session = await requireDashboardAccess('/settings');
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      emailVerifiedAt: true,
      firstName: true,
      lastName: true,
      name: true,
      image: true,
      jobTitle: true,
      bio: true,
      timezone: true,
      locale: true
    }
  });
  if (!user) return { ok: false as const, error: 'User not found.' };
  return {
    ok: true as const,
    profile: {
      ...user,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null
    }
  };
}

/** Update profile (identity and metadata). Does not change email or password. */
export async function updateProfile(input: z.infer<typeof UpdateProfileSchema>) {
  const parsed = UpdateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid fields.' };
  }
  const session = await requireDashboardAccess('/settings');
  const { firstName, lastName, name, jobTitle, bio, timezone, locale } = parsed.data;
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName,
      lastName,
      name: name ?? null,
      jobTitle: jobTitle ?? null,
      bio: bio ?? null,
      timezone: timezone ?? null,
      locale: locale ?? null
    }
  });
  return { ok: true as const };
}

/** Upload avatar image to S3/MinIO and set user.image. */
export async function uploadAvatar(formData: FormData): Promise<
  | { ok: true; imageUrl: string }
  | { ok: false; error: string }
> {
  const session = await requireDashboardAccess('/settings');
  if (!isStorageConfigured()) {
    return { ok: false, error: 'File storage is not configured. Set S3_* or MinIO env vars for local dev.' };
  }
  const file = formData.get('avatar');
  if (!file || !(file instanceof File)) {
    return { ok: false, error: 'No file provided.' };
  }
  if (!ALLOWED_AVATAR_TYPES.includes(file.type as (typeof ALLOWED_AVATAR_TYPES)[number])) {
    return { ok: false, error: 'Invalid file type. Use JPG, PNG, WebP or GIF.' };
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return { ok: false, error: 'Image must be under 5 MB.' };
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const key = `avatars/${session.user.id}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  let imageUrl: string | null;
  try {
    imageUrl = await uploadToS3({
      key,
      body: buffer,
      contentType: file.type
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.';
    const isTimeout = message.includes('timed out');
    const isConnection = /ECONNRESET|ETIMEDOUT|socket hang up/i.test(message);
    if (isTimeout || isConnection) {
      return {
        ok: false,
        error: 'Storage unavailable. If using MinIO locally, ensure it is running (e.g. docker compose -f docker-compose.minio.yml up -d) and S3_* env vars are set.'
      };
    }
    return { ok: false, error: message };
  }
  if (!imageUrl) {
    return { ok: false, error: 'Upload failed.' };
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl }
  });
  return { ok: true, imageUrl };
}
