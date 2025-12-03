import { redirect } from 'next/navigation';
import { requireInternalAuth } from '@/lib/internal-auth';
import { InternalSidebar } from '@/components/internal/sidebar';
import { InternalHeader } from '@/components/internal/header';

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require internal authentication
  const internalUser = await requireInternalAuth();
  
  if (!internalUser) {
    redirect('/internal/login');
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      <InternalSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <InternalHeader user={internalUser} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

