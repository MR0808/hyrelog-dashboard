'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createWorkspace } from '@/app/actions/workspace';
import { updateOnboardingStep } from '@/app/actions/onboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CreateWorkspaceFormProps {
  companyId: string;
}

export function CreateWorkspaceForm({ companyId }: CreateWorkspaceFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [retentionDays, setRetentionDays] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('companyId', companyId);
    if (retentionDays) {
      formData.append('retentionDays', retentionDays);
    }

    startTransition(async () => {
      const result = await createWorkspace(formData);

      if (result.success) {
        // Update onboarding step
        await updateOnboardingStep(companyId, 'workspace');
        router.push('/onboarding/api-key');
        router.refresh();
      } else {
        setError(result.error || 'Failed to create workspace');
      }
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              placeholder="Production"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Examples: Production, Staging, Development, or project-specific names
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retentionDays">Retention Days (optional)</Label>
            <Input
              id="retentionDays"
              type="number"
              min="1"
              max="3650"
              value={retentionDays}
              onChange={(e) => setRetentionDays(e.target.value)}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to inherit from company settings
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" asChild disabled={isPending}>
              <Link href="/onboarding/plan">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button type="submit" disabled={isPending || !name}>
              {isPending ? 'Creating...' : 'Continue'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

