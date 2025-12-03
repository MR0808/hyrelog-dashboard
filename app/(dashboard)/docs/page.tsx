import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { FileText, Search, Shield, Users, Globe } from 'lucide-react';

const docSections = [
  {
    title: 'Getting Started',
    icon: FileText,
    href: '/docs/getting-started',
    description: 'Learn how to set up and use HyreLog',
  },
  {
    title: 'Event Explorer',
    icon: Search,
    href: '/docs/explorer',
    description: 'How to search and filter audit events',
  },
  {
    title: 'GDPR',
    icon: Shield,
    href: '/docs/gdpr',
    description: 'Managing GDPR requests and compliance',
  },
  {
    title: 'RBAC',
    icon: Users,
    href: '/docs/rbac',
    description: 'Role-based access control explained',
  },
  {
    title: 'Regions',
    icon: Globe,
    href: '/docs/regions',
    description: 'Data residency and regional configuration',
  },
];

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documentation</h1>
        <p className="text-muted-foreground">Learn how to use HyreLog effectively</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {docSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="transition-colors hover:bg-accent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <section.icon className="h-5 w-5" />
                  <CardTitle>{section.title}</CardTitle>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <h3>1. Create a Workspace</h3>
          <p>
            Start by creating a workspace to organize your audit events. Workspaces can represent
            different applications, environments, or teams.
          </p>

          <h3>2. Generate API Keys</h3>
          <p>
            Create API keys to authenticate your applications. You can create company-wide or
            workspace-specific keys with read-only or read-write permissions.
          </p>

          <h3>3. Send Events</h3>
          <p>
            Use the API to send audit events from your applications. Events are automatically
            indexed and made searchable.
          </p>

          <h3>4. Explore Events</h3>
          <p>
            Use the Event Explorer to search, filter, and analyze your audit events. Set up alerts
            to be notified of important events or threshold breaches.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
