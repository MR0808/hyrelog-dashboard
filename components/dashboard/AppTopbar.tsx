'use client';

import { ChevronRight, LogOut, Settings, User } from 'lucide-react';

import { useSession } from '@/lib/auth-client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import type { User as UserType, Company, Workspace } from '@/types/dashboard';

interface AppTopbarProps {
  /** Fallback when session is loading or not available (e.g. mock data). Session is used when available so the topbar updates reactively. */
  user?: UserType;
  company?: Company;
  workspaces: Workspace[];
  currentWorkspaceId?: string;
  breadcrumb: {
    label: string;
    href?: string;
  }[];
  showWorkspaceSwitcher?: boolean;
  onWorkspaceChange?: (workspaceId: string) => void;
}

export function AppTopbar({
  user: userProp,
  company: companyProp,
  workspaces,
  currentWorkspaceId,
  breadcrumb,
  showWorkspaceSwitcher = false,
  onWorkspaceChange
}: AppTopbarProps) {
  const { data: session, isPending } = useSession();

  // Prefer session so name/company updates automatically (e.g. after updateUser); fall back to props when loading or mock data
  const user: UserType | undefined = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? '',
        firstName: (session.user as { firstName?: string }).firstName ?? '',
        lastName: (session.user as { lastName?: string }).lastName ?? '',
        companyRole:
          (session.user as { companyRole?: UserType['companyRole'] }).companyRole ?? 'MEMBER',
        platformRole: (session.user as { platformRole?: UserType['platformRole'] }).platformRole
      }
    : userProp;
  const company: Company | undefined = session?.company
    ? {
        id: session.company.id,
        name: session.company.name,
        slug: session.company.slug,
        preferredRegion: (session.company as { preferredRegion?: string }).preferredRegion ?? '',
        planType: (session.company as { planType?: Company['planType'] }).planType ?? 'TRIAL',
        trialDaysRemaining: (session.company as { trialDaysRemaining?: number }).trialDaysRemaining
      }
    : companyProp;

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : null;
  const userInitials = user
    ? ((`${(user.firstName || '')[0]}${(user.lastName || '')[0]}`.toUpperCase() ||
        user.email[0]?.toUpperCase()) ??
      '?')
    : '?';

  return (
    <header className="h-20 border-b border-border bg-card flex justify-end items-center px-6">
      {/* <div className="flex items-center gap-2 flex-1">
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumb.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2"
            >
              {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              {item.href ? (
                <a
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {item.label}
                </a>
              ) : (
                <span className="font-medium text-foreground">{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      </div> */}

      <div className="flex items-center gap-4">
        {/* {showWorkspaceSwitcher && workspaces.length > 0 && (
          <WorkspaceSwitcher
            workspaces={workspaces}
            currentWorkspaceId={currentWorkspaceId}
            onWorkspaceChange={onWorkspaceChange}
          />
        )} */}

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full cursor-pointer"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-brand-500 text-white">{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            align="end"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                {isPending && !user && <p className="text-sm text-muted-foreground">Loading…</p>}
                {user && (
                  <>
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    {company && (
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        {company.name}
                      </p>
                    )}
                  </>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
