'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { rotateApiKey, revokeApiKey } from '@/app/actions/api-keys';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApiKeyActionsProps {
  keyId: string;
  keyName: string;
}

export function ApiKeyActions({ keyId, keyName }: ApiKeyActionsProps) {
  const router = useRouter();
  const [rotateOpen, setRotateOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [rotateSuccess, setRotateSuccess] = useState<{ key: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRotate = () => {
    setError(null);
    setRotateSuccess(null);
    
    startTransition(async () => {
      const result = await rotateApiKey(keyId, false);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.apiKey) {
        setRotateSuccess({ key: result.apiKey.key });
        router.refresh();
      }
    });
  };

  const handleRevoke = () => {
    setError(null);
    
    startTransition(async () => {
      const result = await revokeApiKey(keyId, 'Revoked via dashboard');
      
      if (result.error) {
        setError(result.error);
      } else {
        setRevokeOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex gap-2">
      <AlertDialog open={rotateOpen} onOpenChange={setRotateOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isPending}>
            Rotate
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate API Key</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new API key and link it to the old one. The old key will remain active unless you revoke it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {rotateSuccess ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <p className="font-semibold mb-2">API Key Rotated Successfully!</p>
                  <p className="text-sm mb-2">Copy this key now - you won't be able to see it again:</p>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm break-all">
                    {rotateSuccess.key}
                  </div>
                </AlertDescription>
              </Alert>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setRotateOpen(false)}>Close</AlertDialogAction>
              </AlertDialogFooter>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRotate} disabled={isPending}>
                  {isPending ? 'Rotating...' : 'Rotate Key'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isPending}>
            Revoke
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke &quot;{keyName}&quot;? This action cannot be undone and the key will immediately stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isPending ? 'Revoking...' : 'Revoke Key'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

