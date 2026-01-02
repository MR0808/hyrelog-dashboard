import { redirect } from 'next/navigation';
import { getAuthContext } from '@/lib/rbac';

export default async function HomePage() {
  const authContext = await getAuthContext();

  // Redirect based on role
  if (authContext.isHyrelogAdmin) {
    redirect('/admin/companies');
  } else {
    redirect('/app/events');
  }
}
