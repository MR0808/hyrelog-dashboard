'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createInternalCompany } from '@/app/actions/internal/company';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Plan {
  id: string;
  code: string;
  name: string;
  monthlyEventLimit: number;
  retentionDays: number;
  priceCents: number;
}

interface CreateCompanyFormProps {
  plans: Plan[];
}

export function CreateCompanyForm({ plans }: CreateCompanyFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [dataRegion, setDataRegion] = useState<'AU' | 'US' | 'EU' | 'APAC'>('AU');
  const [retentionDays, setRetentionDays] = useState('90');
  const [billingMode, setBillingMode] = useState<'STRIPE' | 'CUSTOM'>('STRIPE');
  const [planId, setPlanId] = useState('');
  const [customMonthlyPrice, setCustomMonthlyPrice] = useState('');
  const [customEventLimit, setCustomEventLimit] = useState('');
  const [customRetentionDays, setCustomRetentionDays] = useState('');
  const [invoiceTerm, setInvoiceTerm] = useState<'NET_30' | 'NET_60' | 'MANUAL'>('NET_30');
  const [crmDealId, setCrmDealId] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug || name.toLowerCase().replace(/\s+/g, '-'));
    formData.append('dataRegion', dataRegion);
    formData.append('retentionDays', retentionDays);
    formData.append('billingMode', billingMode);
    formData.append('ownerEmail', ownerEmail);

    if (billingMode === 'STRIPE') {
      formData.append('planId', planId);
    } else {
      if (customMonthlyPrice) formData.append('customMonthlyPrice', customMonthlyPrice);
      if (customEventLimit) formData.append('customEventLimit', customEventLimit);
      if (customRetentionDays) formData.append('customRetentionDays', customRetentionDays);
      formData.append('invoiceTerm', invoiceTerm);
      if (crmDealId) formData.append('crmDealId', crmDealId);
    }

    startTransition(async () => {
      const result = await createInternalCompany(formData);

      if (result.success) {
        router.push(`/internal/companies/${result.companyId}`);
        router.refresh();
      } else {
        setError(result.error || 'Failed to create company');
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Details</CardTitle>
        <CardDescription>
          Create a new company for an enterprise customer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) {
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }
                }}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                disabled={isPending}
                pattern="[a-z0-9-]+"
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly identifier (lowercase, hyphens only)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataRegion">Data Region *</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="retentionDays">Retention Days *</Label>
              <Input
                id="retentionDays"
                type="number"
                min="1"
                max="3650"
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Owner Email *</Label>
              <Input
                id="ownerEmail"
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                required
                disabled={isPending}
                placeholder="owner@example.com"
              />
              <p className="text-xs text-muted-foreground">
                User will be created if they don't exist
              </p>
            </div>
          </div>

          <Tabs value={billingMode} onValueChange={(v) => setBillingMode(v as 'STRIPE' | 'CUSTOM')}>
            <TabsList>
              <TabsTrigger value="STRIPE">Stripe Billing</TabsTrigger>
              <TabsTrigger value="CUSTOM">Custom Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="STRIPE" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="planId">Plan *</Label>
                <Select value={planId} onValueChange={setPlanId} disabled={isPending} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ${(plan.priceCents / 100).toFixed(0)}/month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="CUSTOM" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customMonthlyPrice">Monthly Price (cents)</Label>
                  <Input
                    id="customMonthlyPrice"
                    type="number"
                    value={customMonthlyPrice}
                    onChange={(e) => setCustomMonthlyPrice(e.target.value)}
                    disabled={isPending}
                    placeholder="50000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customEventLimit">Event Limit</Label>
                  <Input
                    id="customEventLimit"
                    type="number"
                    value={customEventLimit}
                    onChange={(e) => setCustomEventLimit(e.target.value)}
                    disabled={isPending}
                    placeholder="1000000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customRetentionDays">Retention Days</Label>
                  <Input
                    id="customRetentionDays"
                    type="number"
                    value={customRetentionDays}
                    onChange={(e) => setCustomRetentionDays(e.target.value)}
                    disabled={isPending}
                    placeholder="365"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceTerm">Invoice Term</Label>
                  <Select
                    value={invoiceTerm}
                    onValueChange={(v: 'NET_30' | 'NET_60' | 'MANUAL') => setInvoiceTerm(v)}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NET_30">NET 30</SelectItem>
                      <SelectItem value="NET_60">NET 60</SelectItem>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="crmDealId">CRM Deal ID</Label>
                  <Input
                    id="crmDealId"
                    value={crmDealId}
                    onChange={(e) => setCrmDealId(e.target.value)}
                    disabled={isPending}
                    placeholder="SF-12345"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" asChild disabled={isPending}>
              <Link href="/internal/companies">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isPending || !name || !ownerEmail}>
              {isPending ? 'Creating...' : 'Create Company'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

