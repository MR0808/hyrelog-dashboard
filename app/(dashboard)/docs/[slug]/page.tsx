import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
`,
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
`,
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
`,
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
`,
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
`,
  },
};

export default function DocPage({ params }: { params: { slug: string } }) {
  const doc = docs[params.slug];

  if (!doc) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{doc.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{doc.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
            {doc.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
