import { requireInternalAuth } from '@/lib/internal-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function InternalSettingsPage() {
  await requireInternalAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure internal admin settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
          <CardDescription>
            Internal system settings and configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Settings configuration coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

