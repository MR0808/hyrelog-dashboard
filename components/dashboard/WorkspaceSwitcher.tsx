'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Workspace } from '@/types/dashboard';

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  currentWorkspaceId?: string;
  onWorkspaceChange?: (workspaceId: string) => void;
}

export function WorkspaceSwitcher({
  workspaces,
  currentWorkspaceId,
  onWorkspaceChange
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);
  const sortedWorkspaces = [...workspaces].sort((a, b) => a.name.localeCompare(b.name));

  if (workspaces.length === 0) {
    return <div className="text-sm text-muted-foreground">No workspaces</div>;
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={setOpen}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between bg-transparent"
        >
          <span className="truncate">{currentWorkspace?.name || 'Select workspace'}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px] p-0">
        {sortedWorkspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onSelect={() => {
              onWorkspaceChange?.(workspace.id);
              setOpen(false);
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Check
                  className={cn(
                    'h-4 w-4 shrink-0',
                    currentWorkspaceId === workspace.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <span className="truncate">{workspace.name}</span>
              </div>
              <Badge
                variant="secondary"
                className="text-xs ml-2"
              >
                {workspace.region}
              </Badge>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
