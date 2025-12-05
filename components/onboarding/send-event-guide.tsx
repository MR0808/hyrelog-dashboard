'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateOnboardingStep } from '@/app/actions/onboarding';
import { FancyButton } from '@/components/ui/fancy-button';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
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
    hasSentEvent
}: SendEventGuideProps) {
    const router = useRouter();
    const [copied, setCopied] = useState<string | null>(null);
    const [eventSent, setEventSent] = useState(hasSentEvent);
    const [isPending, startTransition] = useTransition();

    // Poll for events
    useEffect(() => {
        if (eventSent) return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch(
                    `/api/check-events?workspaceId=${workspaceId}`
                );
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

    const handleContinue = () => {
        if (eventSent && !isPending) {
            startTransition(async () => {
                try {
                    // Update step to 'send-event' (complete page will mark it as 'complete')
                    await updateOnboardingStep(companyId, 'send-event');
                    // Navigate immediately after update
                    router.push('/onboarding/complete');
                } catch (error) {
                    console.error('Error updating onboarding step:', error);
                    // Still navigate even if step update fails
                    router.push('/onboarding/complete');
                }
            });
        }
    };

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4040';

    const curlExample = `curl -X POST ${baseUrl}/v1/key/workspace/events \\
  -H "x-hyrelog-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "user.created",
    "category": "user",
    "actor": {
      "id": "user-123",
      "email": "user@example.com"
    },
    "payload": {
      "userId": "user-123",
      "email": "user@example.com"
    }
  }'`;

    const nodeExample = `import { HyreLogWorkspaceClient } from '@hyrelog/node';

const client = new HyreLogWorkspaceClient({
  workspaceKey: 'YOUR_API_KEY',
});

await client.logEvent({
  action: 'user.created',
  category: 'user',
  actor: {
    id: 'user-123',
    email: 'user@example.com',
  },
  payload: {
    userId: 'user-123',
    email: 'user@example.com',
  },
});`;

    const pythonExample = `from hyrelog import HyreLogWorkspaceClient

client = HyreLogWorkspaceClient(
    workspace_key='YOUR_API_KEY',
)

await client.log_event(
    action='user.created',
    category='user',
    actor={'id': 'user-123', 'email': 'user@example.com'},
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
                        Send a test event using one of the methods below. We'll
                        detect it automatically.
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
                                    onClick={() =>
                                        handleCopy(curlExample, 'curl')
                                    }
                                >
                                    {copied === 'curl' ? (
                                        'Copied!'
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
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
                                    onClick={() =>
                                        handleCopy(nodeExample, 'node')
                                    }
                                >
                                    {copied === 'node' ? (
                                        'Copied!'
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
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
                                    onClick={() =>
                                        handleCopy(pythonExample, 'python')
                                    }
                                >
                                    {copied === 'python' ? (
                                        'Copied!'
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <Alert className="mt-4">
                        <AlertDescription>
                            <strong>Note:</strong> Replace{' '}
                            <code>YOUR_API_KEY</code> with your actual API key
                            (starts with <code>{apiKeyPrefix}</code>). You can
                            find it in your API Keys page.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
                <FancyButton
                    type="button"
                    variant="outline"
                    asChild
                    icon={<ArrowLeft className="h-4 w-4" />}
                    iconPosition="left"
                >
                    <Link href="/onboarding/api-key">Back</Link>
                </FancyButton>
                <FancyButton
                    onClick={handleContinue}
                    disabled={!eventSent || isPending}
                    variant="primary"
                    icon={
                        eventSent && !isPending ? (
                            <ArrowRight className="h-4 w-4" />
                        ) : undefined
                    }
                    iconPosition="right"
                >
                    {isPending
                        ? 'Loading...'
                        : eventSent
                          ? 'Continue'
                          : 'Waiting for event...'}
                </FancyButton>
            </div>
        </div>
    );
}
