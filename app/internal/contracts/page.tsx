import { requireInternalAuth } from '@/lib/internal-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function InternalContractsPage() {
  await requireInternalAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contracts</h1>
        <p className="text-muted-foreground">
          Manage enterprise contracts and agreements
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contract Management</CardTitle>
          <CardDescription>
            View and manage enterprise contracts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Contract management coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

