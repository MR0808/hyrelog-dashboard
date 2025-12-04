'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createWorkspace } from '@/app/actions/workspace';
import { updateOnboardingStep } from '@/app/actions/onboarding';
import { FancyButton } from '@/components/ui/fancy-button';
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
      try {
        const result = await createWorkspace(formData);

        if (result.success) {
          // Update onboarding step
          const stepResult = await updateOnboardingStep(companyId, 'workspace');
          
          if (stepResult.success) {
            router.push('/onboarding/api-key');
            router.refresh();
          } else {
            // Still navigate even if step update fails
            console.warn('Failed to update onboarding step:', stepResult.error);
            router.push('/onboarding/api-key');
            router.refresh();
          }
        } else {
          setError(result.error || 'Failed to create workspace');
        }
      } catch (error) {
        console.error('Error in workspace creation:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
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

          {isPending && (
            <div className="text-sm text-muted-foreground text-center">
              Creating workspace...
            </div>
          )}
          
          <div className="flex justify-between pt-4">
            <FancyButton 
              type="button" 
              variant="outline" 
              asChild 
              disabled={isPending}
              icon={<ArrowLeft className="h-4 w-4" />}
              iconPosition="left"
            >
              <Link href="/onboarding/billing">
                Back
              </Link>
            </FancyButton>
            <FancyButton 
              type="submit" 
              disabled={isPending || !name}
              variant="primary"
              icon={!isPending ? <ArrowRight className="h-4 w-4" /> : undefined}
              iconPosition="right"
            >
              {isPending ? 'Creating...' : 'Continue'}
            </FancyButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

