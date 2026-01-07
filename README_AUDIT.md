# Audit Logging

The HyreLog Dashboard includes comprehensive audit logging for all actions within the system. This is essential for a logging company to maintain compliance and security.

## Features

- **Automatic Logging**: All authentication actions (signup, login, logout) are automatically logged
- **Action Tracking**: All user actions within the dashboard are tracked
- **Compliance Ready**: Full audit trail with IP addresses, user agents, and timestamps
- **Searchable**: Indexed by user, company, action type, and resource

## Usage

### Automatic Logging

Authentication actions are automatically logged via the auth API route handler.

### Manual Logging

Use the `audit` utility for manual logging:

```typescript
import { audit } from '@/lib/audit';

// Log a user signup
await audit.userSignup(userId, email);

// Log a company creation
await audit.companyCreate(companyId, companyName);

// Log a custom action
await audit.custom('EXPORT_DOWNLOAD', {
  resourceType: 'export',
  resourceId: exportId,
  details: { format: 'csv' },
});
```

### Server Actions with Audit Logging

Wrap server actions to automatically log events:

```typescript
import { withAuditLog } from '@/lib/server-actions';

export const createCompany = withAuditLog(
  async (name: string, companyId: string) => {
    // Your action logic
    return await prisma.company.create({ data: { name, companyId } });
  },
  {
    action: 'COMPANY_CREATE',
    resourceType: 'company',
    getResourceId: (name, companyId) => companyId,
    getDetails: (name) => ({ companyName: name }),
  }
);
```

## Audit Log Model

The `AuditLog` model includes:

- `userId`: User who performed the action (null for system actions)
- `companyId`: Company context (null for user-level actions)
- `action`: Type of action (see `AuditAction` enum)
- `resourceType`: Type of resource affected (e.g., "user", "company", "export")
- `resourceId`: ID of the affected resource
- `details`: Additional context (JSON)
- `ipAddress`: IP address of the request
- `userAgent`: User agent string
- `createdAt`: Timestamp

## Available Actions

See the `AuditAction` enum in `prisma/schema.prisma` for all available action types:

- Authentication: `USER_SIGNUP`, `USER_LOGIN`, `USER_LOGOUT`, etc.
- Company Management: `COMPANY_CREATE`, `COMPANY_UPDATE`, `COMPANY_MEMBER_ADD`, etc.
- Data Management: `EXPORT_CREATE`, `WEBHOOK_CREATE`, `RESTORE_REQUEST_CREATE`, etc.
- Admin Actions: `ADMIN_USER_UPDATE`, `ADMIN_COMPANY_UPDATE`, etc.

## Viewing Audit Logs

Audit logs can be viewed via:

1. **Prisma Studio**: `npm run db:studio`
2. **Admin Dashboard**: `/admin/audit-logs` (to be implemented)
3. **Direct Database Query**: Query the `audit_logs` table

## Best Practices

1. **Log Early**: Log actions as soon as they occur
2. **Include Context**: Add relevant details to the `details` field
3. **Don't Break on Failure**: Audit logging should never break the application
4. **Redact Sensitive Data**: Never log passwords, tokens, or other sensitive information
5. **Use Appropriate Actions**: Use the most specific action type available
