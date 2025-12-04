'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createApiKey } from '@/app/actions/api-keys';
import { updateOnboardingStep } from '@/app/actions/onboarding';
import { FancyButton } from '@/components/ui/fancy-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, ArrowLeft, Copy, Check } from 'lucide-react';
import Link from 'next/link';

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface ApiKeyGenerationProps {
  companyId: string;
  workspaces: Workspace[];
}

export function ApiKeyGeneration({ companyId, workspaces }: ApiKeyGenerationProps) {
  const router = useRouter();
  const [name, setName] = useState('My First API Key');
  const [type, setType] = useState<'COMPANY' | 'WORKSPACE'>('COMPANY');
  const [workspaceId, setWorkspaceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('readOnly', 'false');
    if (type === 'WORKSPACE' && workspaceId) {
      formData.append('workspaceId', workspaceId);
    }

    startTransition(async () => {
      const result = await createApiKey(formData);

      if (result.success && result.apiKey) {
        setApiKey(result.apiKey.key);
        // Update onboarding step
        await updateOnboardingStep(companyId, 'api-key');
      } else {
        setError(result.error || 'Failed to create API key');
      }
    });
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (apiKey) {
      try {
        await navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleContinue = () => {
    router.push('/onboarding/send-event');
    router.refresh();
  };

  if (apiKey) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert className="mb-4">
            <AlertDescription>
              <p className="font-semibold mb-2">API Key Created Successfully!</p>
              <p className="text-sm mb-2">
                Copy this key now - you won't be able to see it again:
              </p>
              <div className="relative">
                <div className="bg-muted p-3 rounded-md font-mono text-sm break-all pr-12">
                  {apiKey}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-2"
                  onClick={handleCopy}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex justify-end pt-4">
            <FancyButton 
              onClick={handleContinue}
              variant="primary"
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
            >
              Continue
            </FancyButton>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <Label htmlFor="name">API Key Name</Label>
            <Input
              id="name"
              placeholder="My First API Key"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              A descriptive name to help you identify this key
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Key Type</Label>
            <Select
              value={type}
              onValueChange={(value: 'COMPANY' | 'WORKSPACE') => setType(value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPANY">Company Key</SelectItem>
                <SelectItem value="WORKSPACE">Workspace Key</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Company keys work across all workspaces. Workspace keys are scoped to a specific workspace.
            </p>
          </div>

          {type === 'WORKSPACE' && (
            <div className="space-y-2">
              <Label htmlFor="workspaceId">Workspace</Label>
              <Select
                value={workspaceId}
                onValueChange={setWorkspaceId}
                disabled={isPending}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Link href="/onboarding/workspace">
                Back
              </Link>
            </FancyButton>
            <FancyButton 
              type="submit" 
              disabled={isPending || !name}
              variant="primary"
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
            >
              {isPending ? 'Generating...' : 'Generate API Key'}
            </FancyButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

