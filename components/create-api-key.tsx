'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createApiKey } from '@/app/actions/api-keys';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CreateApiKey() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'COMPANY' | 'WORKSPACE'>('COMPANY');
  const [workspaceId, setWorkspaceId] = useState<string>('');
  const [readOnly, setReadOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ key: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('readOnly', readOnly.toString());
    if (workspaceId) {
      formData.append('workspaceId', workspaceId);
    }

    startTransition(async () => {
      const result = await createApiKey(formData);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.apiKey) {
        setSuccess({ key: result.apiKey.key });
        setName('');
        setType('COMPANY');
        setWorkspaceId('');
        setReadOnly(false);
        router.refresh();
      }
    });
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setSuccess(null);
    setName('');
    setType('COMPANY');
    setWorkspaceId('');
    setReadOnly(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button>Create API Key</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Create a new API key for authentication. The key will only be shown once.
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <p className="font-semibold mb-2">API Key Created Successfully!</p>
                <p className="text-sm mb-2">Copy this key now - you won't be able to see it again:</p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm break-all">
                  {success.key}
                </div>
              </AlertDescription>
            </Alert>
            <div className="flex justify-end">
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My API Key"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={type}
                onValueChange={(value: 'COMPANY' | 'WORKSPACE') => setType(value)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPANY">Company</SelectItem>
                  <SelectItem value="WORKSPACE">Workspace</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {type === 'WORKSPACE' && (
              <div className="space-y-2">
                <Label htmlFor="workspaceId">Workspace ID (optional)</Label>
                <Input
                  id="workspaceId"
                  placeholder="workspace-id"
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  disabled={isPending}
                />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="readOnly"
                checked={readOnly}
                onCheckedChange={(checked) => setReadOnly(checked === true)}
                disabled={isPending}
              />
              <Label htmlFor="readOnly" className="cursor-pointer">
                Read-only access
              </Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Key'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
