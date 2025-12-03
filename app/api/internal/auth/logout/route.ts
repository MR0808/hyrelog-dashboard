import { NextResponse } from 'next/server';
import { signOutInternal } from '@/lib/internal-auth';

export async function POST() {
  await signOutInternal();
  return NextResponse.json({ success: true });
}

