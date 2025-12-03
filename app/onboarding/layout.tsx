import { requireAuth } from '@/lib/auth-server';
import { needsOnboarding } from '@/app/actions/onboarding';
import { redirect } from 'next/navigation';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require authentication
  await requireAuth();
  
  // Check if user needs onboarding
  const needsOnboardingCheck = await needsOnboarding();
  
  // If onboarding is complete, redirect to dashboard
  if (!needsOnboardingCheck) {
    redirect('/overview');
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">{children}</div>
    </div>
  );
}

