'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateCompanySettings } from '@/app/actions/settings';

interface Company {
  id: string;
  name: string;
  slug: string;
  retentionDays: number;
}

export function CompanySettings({ company }: { company: Company }) {
  const router = useRouter();
  const [name, setName] = useState(company.name);
  const [retentionDays, setRetentionDays] = useState(company.retentionDays);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('companyId', company.id);
    formData.append('name', name);
    formData.append('retentionDays', retentionDays.toString());

    startTransition(async () => {
      const result = await updateCompanySettings(formData);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          router.refresh();
        }, 2000);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Settings</CardTitle>
        <CardDescription>Update your company information and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription>Settings saved successfully!</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="name">Company Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={company.slug}
            disabled
            className="font-mono"
          />
          <p className="text-sm text-muted-foreground">Slug cannot be changed</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="retention">Retention Days</Label>
          <Input
            id="retention"
            type="number"
            min="1"
            max="3650"
            value={retentionDays}
            onChange={(e) => setRetentionDays(parseInt(e.target.value) || 90)}
            disabled={isPending}
          />
          <p className="text-sm text-muted-foreground">
            Number of days to retain audit events (1-3650)
          </p>
        </div>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
}
