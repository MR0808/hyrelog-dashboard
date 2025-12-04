import { requireInternalAuth } from '@/lib/internal-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function InternalBillingPage() {
  await requireInternalAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing Overview</h1>
        <p className="text-muted-foreground">
          View billing information across all companies
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing Summary</CardTitle>
          <CardDescription>
            Overview of billing across all companies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Billing overview coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

