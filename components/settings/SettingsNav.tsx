'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Shield, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsNavItems = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
    description: 'Manage your personal information'
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: Shield,
    description: 'Password and sessions'
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
    description: 'Email preferences'
  },
  {
    title: 'Preferences',
    href: '/settings/preferences',
    icon: Settings,
    description: 'UI and behavior'
  }
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground mb-1">Personal Settings</h2>
        <p className="text-xs text-muted-foreground">Manage your account and preferences</p>
      </div>

      {settingsNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-start gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer',
              isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 shrink-0 mt-0.5',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            />
            <div className="flex-1 min-w-0">
              <div
                className={cn('text-sm font-medium', isActive ? 'text-primary' : 'text-foreground')}
              >
                {item.title}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
