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
import { createGdprRequest } from '@/app/actions/gdpr';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CreateGdprRequest() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [requestType, setRequestType] = useState<'DELETE' | 'ANONYMIZE'>('DELETE');
  const [actorEmail, setActorEmail] = useState('');
  const [actorId, setActorId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('requestType', requestType);
    if (actorEmail) formData.append('actorEmail', actorEmail);
    if (actorId) formData.append('actorId', actorId);

    startTransition(async () => {
      const result = await createGdprRequest(formData);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setOpen(false);
        setRequestType('DELETE');
        setActorEmail('');
        setActorId('');
        router.refresh();
      }
    });
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setRequestType('DELETE');
    setActorEmail('');
    setActorId('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button>Create GDPR Request</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create GDPR Request</DialogTitle>
          <DialogDescription>
            Create a new data subject access or deletion request
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="requestType">Request Type</Label>
            <Select
              value={requestType}
              onValueChange={(value: 'DELETE' | 'ANONYMIZE') => setRequestType(value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="ANONYMIZE">Anonymize</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="actorEmail">Actor Email (optional)</Label>
            <Input
              id="actorEmail"
              type="email"
              placeholder="user@example.com"
              value={actorEmail}
              onChange={(e) => setActorEmail(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="actorId">Actor ID (optional)</Label>
            <Input
              id="actorId"
              placeholder="actor-id"
              value={actorId}
              onChange={(e) => setActorId(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
