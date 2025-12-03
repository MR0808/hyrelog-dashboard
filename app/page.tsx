import { redirect } from 'next/navigation';
import { getOptionalSession } from '@/lib/auth-server';

export default async function HomePage() {
  const session = await getOptionalSession();
  
  if (session) {
    redirect('/overview');
  } else {
    redirect('/login');
  }
}