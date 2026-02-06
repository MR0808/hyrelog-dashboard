'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { renameProjectAction } from '@/app/(dashboard)/workspaces/[id]/actions';

interface EditProjectDialogProps {
  projectId: string;
  workspaceId: string;
  currentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProjectDialog({
  projectId,
  workspaceId,
  currentName,
  open,
  onOpenChange
}: EditProjectDialogProps) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [isPending, startTransition] = useTransition();
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setName(currentName);
  }, [open, currentName]);

  function handleOpenChange(isOpen: boolean) {
    if (!isPending) {
      onOpenChange(isOpen);
      if (!isOpen) {
        setName(currentName);
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
      const result = await renameProjectAction({ projectId, name: trimmed });
      if (result.ok) {
        toast.success('Project renamed');
        handleOpenChange(false);
        router.refresh();
      } else {
        setNameError(result.error ?? 'Something went wrong');
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>Change the project name. Slug will be updated automatically.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-project-name">Project name</Label>
            <Input
              id="edit-project-name"
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
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
