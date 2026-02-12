import { requireDashboardAccess } from '@/lib/auth/requireDashboardAccess';
import { SettingsNav } from '@/components/settings/SettingsNav';

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardAccess('/settings');

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
      <aside className="lg:w-64 shrink-0">
        <SettingsNav />
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
