'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Search,
  Clock,
  Users,
  Package,
  CreditCard,
  Bell,
  Shield,
  Globe,
  Key,
  Settings,
  FileText,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', href: '/overview', icon: LayoutDashboard },
  { name: 'Workspaces', href: '/workspaces', icon: FolderKanban },
  { name: 'Event Explorer', href: '/explorer', icon: Search },
  { name: 'Timeline', href: '/timeline', icon: Clock },
  { name: 'Actors', href: '/actors', icon: Users },
  { name: 'Resources', href: '/resources', icon: Package },
  { name: 'Usage & Billing', href: '/billing', icon: CreditCard },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'GDPR', href: '/gdpr', icon: Shield },
  { name: 'Region & Residency', href: '/region', icon: Globe },
  { name: 'API Keys', href: '/api-keys', icon: Key },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Trust & Security', href: '/trust', icon: Lock },
  { name: 'Docs', href: '/docs', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">HyreLog</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
