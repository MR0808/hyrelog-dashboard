import { redirect } from 'next/navigation';
import { getOptionalSession } from '@/lib/auth-server';
import { needsOnboarding } from '@/app/actions/onboarding';

export default async function HomePage() {
  const session = await getOptionalSession();
  
  if (session) {
    // Check if user needs onboarding
    const needsOnboardingCheck = await needsOnboarding();
    if (needsOnboardingCheck) {
      redirect('/onboarding/start');
    }
    redirect('/overview');
  } else {
    redirect('/login');
  }
}