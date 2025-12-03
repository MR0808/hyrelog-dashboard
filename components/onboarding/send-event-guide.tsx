'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateOnboardingStep } from '@/app/actions/onboarding';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, ArrowLeft, CheckCircle2, Copy } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SendEventGuideProps {
  companyId: string;
  workspaceId: string;
  workspaceSlug: string;
  apiKeyPrefix: string;
  hasSentEvent: boolean;
}

export function SendEventGuide({
  companyId,
  workspaceId,
  workspaceSlug,
  apiKeyPrefix,
  hasSentEvent,
}: SendEventGuideProps) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);
  const [eventSent, setEventSent] = useState(hasSentEvent);

  // Poll for events
  useEffect(() => {
    if (eventSent) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/check-events?workspaceId=${workspaceId}`);
        const data = await response.json();
        if (data.hasEvents) {
          setEventSent(true);
        }
      } catch (error) {
        // Ignore errors
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [workspaceId, eventSent]);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleContinue = async () => {
    if (eventSent) {
      await updateOnboardingStep(companyId, 'send-event');
      router.push('/onboarding/complete');
      router.refresh();
    }
  };

  const curlExample = `curl -X POST ${process.env.NEXT_PUBLIC_APP_URL?.replace('/dashboard', '') || 'https://api.hyrelog.com'}/v1/events \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workspace": "${workspaceSlug}",
    "action": "user.created",
    "category": "user",
    "actorId": "user-123",
    "actorEmail": "user@example.com",
    "payload": {
      "userId": "user-123",
      "email": "user@example.com"
    }
  }'`;

  const nodeExample = `import { HyreLog } from '@hyrelog/node';

const client = new HyreLog({
  apiKey: 'YOUR_API_KEY',
  workspace: '${workspaceSlug}',
});

await client.log({
  action: 'user.created',
  category: 'user',
  actorId: 'user-123',
  actorEmail: 'user@example.com',
  payload: {
    userId: 'user-123',
    email: 'user@example.com',
  },
});`;

  const pythonExample = `from hyrelog import HyreLog

client = HyreLog(
    api_key='YOUR_API_KEY',
    workspace='${workspaceSlug}',
)

client.log(
    action='user.created',
    category='user',
    actor_id='user-123',
    actor_email='user@example.com',
    payload={
        'userId': 'user-123',
        'email': 'user@example.com',
    },
)`;

  return (
    <div className="space-y-6">
      {eventSent ? (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Great! We received your first event. You're all set!
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertDescription>
            Send a test event using one of the methods below. We'll detect it automatically.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
          <CardDescription>
            Choose your preferred method to send your first event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="node">Node.js</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>

            <TabsContent value="curl" className="space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                  <code>{curlExample}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(curlExample, 'curl')}
                >
                  {copied === 'curl' ? 'Copied!' : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="node" className="space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                  <code>{nodeExample}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(nodeExample, 'node')}
                >
                  {copied === 'node' ? 'Copied!' : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="python" className="space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                  <code>{pythonExample}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(pythonExample, 'python')}
                >
                  {copied === 'python' ? 'Copied!' : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <Alert className="mt-4">
            <AlertDescription>
              <strong>Note:</strong> Replace <code>YOUR_API_KEY</code> with your actual API key
              (starts with <code>{apiKeyPrefix}</code>). You can find it in your API Keys page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/onboarding/api-key">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <Button onClick={handleContinue} disabled={!eventSent}>
          {eventSent ? 'Continue' : 'Waiting for event...'}
          {eventSent && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

