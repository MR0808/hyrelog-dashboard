import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { DocsTOC } from '@/components/docs/DocsTOC';

const docs: Record<string, { title: string; content: string }> = {
    'getting-started': {
        title: 'Getting Started',
        content: `
# Getting Started with HyreLog

HyreLog is an audit logging platform designed for compliance and security.

## Overview

HyreLog provides:
- Immutable audit logs with hash-chain verification
- GDPR-compliant data management
- Regional data residency options
- Role-based access control
- Real-time event search and filtering

## First Steps

1. **Set up your company**: Configure your organization settings
2. **Create workspaces**: Organize events by application or team
3. **Generate API keys**: Authenticate your applications
4. **Start logging**: Send events via the API
5. **Explore events**: Use the dashboard to search and analyze

## Key Concepts

### Workspaces
Workspaces organize events and provide isolation. Each workspace can have its own:
- API keys
- Webhooks
- Retention policies
- Team members

### Events
Events represent actions in your system. Each event includes:
- Action type and category
- Actor (who performed the action)
- Target/resource (what was acted upon)
- Timestamp
- Metadata

### API Keys
API keys authenticate your applications. They can be:
- Company-wide or workspace-specific
- Read-only or read-write
- Rotated for security
`
    },
    explorer: {
        title: 'Event Explorer',
        content: `
# Event Explorer

The Event Explorer allows you to search and filter through your audit events.

## Filters

You can filter events by:
- **Workspace**: Filter to specific workspaces
- **Actor**: Search by actor email or ID
- **Action**: Filter by action type (e.g., "user.created")
- **Category**: Filter by category (e.g., "user", "payment")
- **Date Range**: Filter by when events occurred

## Search Tips

- Use partial matches for actor email and action
- Combine multiple filters for precise results
- Use date ranges to focus on specific time periods
- Export results for external analysis

## Viewing Event Details

Click on any event to view:
- Full event payload
- Metadata
- Related events
- Actor information
`
    },
    gdpr: {
        title: 'GDPR Compliance',
        content: `
# GDPR Compliance

HyreLog helps you comply with GDPR requirements.

## Data Subject Rights

### Right to Access
Data subjects can request access to their personal data through GDPR requests.

### Right to Deletion
Data subjects can request deletion of their personal data. Requests require:
1. Customer approval (second approver)
2. Internal admin approval
3. Processing by the GDPR worker

### Right to Anonymization
Instead of deletion, data can be anonymized to preserve audit trail integrity.

## Request Process

1. **Create Request**: Initiate a GDPR request for a specific actor
2. **Customer Approval**: A second approver must approve the request
3. **Admin Approval**: Internal HyreLog admin reviews and approves
4. **Processing**: Backend GDPR worker processes the request
5. **Completion**: Request is marked as done

## Best Practices

- Review requests carefully before approval
- Use anonymization when audit trail integrity is important
- Document the reason for any rejections
`
    },
    rbac: {
        title: 'Role-Based Access Control',
        content: `
# Role-Based Access Control (RBAC)

HyreLog implements RBAC at both company and workspace levels.

## Company Roles

- **OWNER**: Full access to company settings and billing
- **ADMIN**: Can manage workspaces and users
- **BILLING**: Can view and manage billing information
- **AUDITOR**: Read-only access to audit logs
- **MEMBER**: Basic access

## Workspace Roles

- **ADMIN**: Full control over workspace settings
- **DEVELOPER**: Can create API keys and webhooks
- **VIEWER**: Read-only access to events

## Permission Matrix

| Action | OWNER | ADMIN | BILLING | AUDITOR | MEMBER |
|--------|-------|-------|---------|---------|--------|
| View Events | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Workspace | ✓ | ✓ | ✗ | ✗ | ✗ |
| Manage Billing | ✓ | ✗ | ✓ | ✗ | ✗ |
| Manage Users | ✓ | ✓ | ✗ | ✗ | ✗ |
| Export Data | ✓ | ✓ | ✗ | ✓ | ✗ |

## Best Practices

- Use the principle of least privilege
- Regularly review user access
- Use workspace roles for fine-grained control
`
    },
    regions: {
        title: 'Data Regions & Residency',
        content: `
# Data Regions & Residency

HyreLog supports regional data residency to meet compliance requirements.

## Available Regions

- **AU**: Australia
- **US**: United States
- **EU**: European Union
- **APAC**: Asia Pacific

## Configuration

Each company has:
- **Primary Region**: Where data is primarily stored
- **Replication Regions**: Optional regions for data replication

## Regional Features

- **Database**: Region-specific database instances
- **Read Replicas**: Optional read-only replicas for performance
- **Cold Storage**: Long-term archival in region-specific storage

## Compliance

Regional configuration helps meet:
- GDPR (EU data residency)
- Data sovereignty requirements
- Industry-specific regulations

## Best Practices

- Choose regions based on your user base
- Use replication for disaster recovery
- Consider latency when selecting regions
`
    }
};

export default async function DocPage({
    params
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const doc = docs[slug];

    if (!doc) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/docs"
                    className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Documentation
                </Link>
            </div>

            <div>
                <h1 className="text-3xl font-bold">{doc.title}</h1>
            </div>

            <DocsTOC content={doc.content} />

            <Card>
                <CardHeader>
                    <CardTitle>{doc.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-800 dark:prose-code:text-gray-200 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-700">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}
                            components={{
                                h1: ({ node, ...props }) => (
                                    <h1
                                        {...props}
                                        className="mb-6 mt-8 text-4xl font-bold text-gray-900 dark:text-white"
                                    />
                                ),
                                h2: ({ node, ...props }) => (
                                    <h2
                                        {...props}
                                        className="mb-4 mt-8 text-3xl font-semibold text-gray-900 dark:text-white"
                                    />
                                ),
                                h3: ({ node, ...props }) => (
                                    <h3
                                        {...props}
                                        className="mb-3 mt-6 text-2xl font-semibold text-gray-900 dark:text-white"
                                    />
                                ),
                                h4: ({ node, ...props }) => (
                                    <h4
                                        {...props}
                                        className="mb-2 mt-4 text-xl font-semibold text-gray-900 dark:text-white"
                                    />
                                ),
                                p: ({ node, ...props }) => (
                                    <p
                                        {...props}
                                        className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300"
                                    />
                                ),
                                a: ({ node, ...props }) => (
                                    <a
                                        {...props}
                                        className="text-blue-600 underline transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    />
                                ),
                                ul: ({ node, ...props }) => (
                                    <ul
                                        {...props}
                                        className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300"
                                    />
                                ),
                                ol: ({ node, ...props }) => (
                                    <ol
                                        {...props}
                                        className="mb-4 ml-6 list-decimal space-y-2 text-gray-700 dark:text-gray-300"
                                    />
                                ),
                                li: ({ node, ...props }) => (
                                    <li
                                        {...props}
                                        className="leading-relaxed"
                                    />
                                ),
                                blockquote: ({ node, ...props }) => (
                                    <blockquote
                                        {...props}
                                        className="my-4 border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:border-gray-700 dark:text-gray-400"
                                    />
                                ),
                                code: ({ node, inline, ...props }: any) => {
                                    return inline ? (
                                        <code
                                            {...props}
                                            className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                        />
                                    ) : (
                                        <code
                                            {...props}
                                            className="block rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-800"
                                        />
                                    );
                                },
                                pre: ({ node, ...props }) => (
                                    <pre
                                        {...props}
                                        className="mb-4 overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-800"
                                    />
                                ),
                                hr: ({ node, ...props }) => (
                                    <hr
                                        {...props}
                                        className="my-8 border-gray-300 dark:border-gray-700"
                                    />
                                ),
                                table: ({ node, ...props }) => (
                                    <div className="my-6 overflow-x-auto">
                                        <table
                                            {...props}
                                            className="min-w-full divide-y divide-gray-300 border border-gray-300 dark:divide-gray-700 dark:border-gray-700"
                                        />
                                    </div>
                                ),
                                thead: ({ node, ...props }) => (
                                    <thead
                                        {...props}
                                        className="bg-gray-50 dark:bg-gray-800"
                                    />
                                ),
                                tbody: ({ node, ...props }) => (
                                    <tbody
                                        {...props}
                                        className="divide-y divide-gray-200 dark:divide-gray-700"
                                    />
                                ),
                                th: ({ node, ...props }) => (
                                    <th
                                        {...props}
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
                                    />
                                ),
                                td: ({ node, ...props }) => (
                                    <td
                                        {...props}
                                        className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300"
                                    />
                                )
                            }}
                        >
                            {doc.content.trim()}
                        </ReactMarkdown>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
