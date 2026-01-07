import { redirect } from 'next/navigation';
import { getAuthContext } from '@/lib/rbac';
import { prisma } from '@/lib/db';

export default async function HomePage() {
  const authContext = await getAuthContext();

  // Check email verification first
  const user = await prisma.user.findUnique({
    where: { id: authContext.userId },
  });

  if (!user?.emailVerified) {
    redirect('/verify-email-sent');
  }

  // Redirect based on role
  if (authContext.isHyrelogAdmin) {
    redirect('/admin/companies');
  }

  if (authContext.companyId) {
    redirect('/app');
  }

  // No company membership - redirect to create company
  redirect('/create-company');
}
