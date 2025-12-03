'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createCompany } from '@/app/actions/company';
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
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function CreateCompanyForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [dataRegion, setDataRegion] = useState<'AU' | 'US' | 'EU' | 'APAC'>('AU');
  const [retentionDays, setRetentionDays] = useState('90');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('dataRegion', dataRegion);
    formData.append('retentionDays', retentionDays);

    startTransition(async () => {
      const result = await createCompany(formData);

      if (result.success) {
        router.push('/onboarding/plan');
        router.refresh();
      } else {
        setError(result.error || 'Failed to create company');
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
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              placeholder="Acme Inc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              This will be used to identify your organization
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataRegion">Data Region</Label>
            <Select
              value={dataRegion}
              onValueChange={(value: 'AU' | 'US' | 'EU' | 'APAC') => setDataRegion(value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AU">Australia (AU)</SelectItem>
                <SelectItem value="US">United States (US)</SelectItem>
                <SelectItem value="EU">Europe (EU)</SelectItem>
                <SelectItem value="APAC">Asia Pacific (APAC)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose where your audit logs will be stored
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
              How long to retain audit events (default: 90 days)
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" asChild disabled={isPending}>
              <Link href="/onboarding/start">
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

