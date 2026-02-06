'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { createProjectAction } from '@/app/(dashboard)/workspaces/[id]/actions';

interface CreateProjectDialogProps {
  workspaceId: string;
  workspaceIdOrSlug: string;
  trigger?: React.ReactNode;
  className?: string;
}

export function CreateProjectDialog({
  workspaceId,
  workspaceIdOrSlug,
  trigger,
  className
}: CreateProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  function handleOpenChange(isOpen: boolean) {
    if (!isPending) {
      setOpen(isOpen);
      if (!isOpen) {
        setName('');
        setNameError(null);
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameError(null);
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setNameError('Name is too short');
      return;
    }
    if (trimmed.length > 80) {
      setNameError('Name is too long');
      return;
    }

    startTransition(async () => {
      const result = await createProjectAction({ workspaceId, name: trimmed });
      if (result.ok) {
        toast.success('Project created');
        setOpen(false);
        router.refresh();
      } else {
        setNameError(result.error ?? 'Something went wrong');
        toast.error(result.error);
      }
    });
  }

  const defaultTrigger = (
    <Button size="sm" className="bg-brand-500 hover:bg-brand-600 text-white">
      <Plus className="h-4 w-4 mr-1.5" />
      Create project
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild className={className}>
        {trigger ?? defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            Add a new project to this workspace. You can rename it later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              placeholder="e.g. Production"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(null);
              }}
              disabled={isPending}
              className={nameError ? 'border-destructive' : ''}
              autoComplete="off"
            />
            {nameError && (
              <p className="text-sm text-destructive" role="alert">
                {nameError}
              </p>
            )}
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-brand-500 hover:bg-brand-600 text-white"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
