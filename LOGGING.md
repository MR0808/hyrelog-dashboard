# Logging Configuration

## Overview

The HyreLog Dashboard uses a two-tier logging system:

1. **Console Logging**: For development debugging (disabled in production by default)
2. **Audit Logging**: Always written to the database for compliance and security

## Console Logging

Console logs are **automatically disabled in production** to:
- Reduce noise in production logs
- Improve performance
- Maintain security (no sensitive data in logs)

### Server-Side Logging

Use `logger` from `@/lib/logger`:

```typescript
import { logger } from '@/lib/logger';

logger.log('Info message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

**Behavior:**
- ✅ Enabled in development (`NODE_ENV=development`)
- ❌ Disabled in production by default
- ✅ Can be enabled with `ENABLE_CONSOLE_LOGS=true`

### Client-Side Logging

Use `clientLogger` from `@/lib/logger`:

```typescript
import { clientLogger } from '@/lib/logger';

clientLogger.log('Info message');
clientLogger.error('Error message'); // Always logged
clientLogger.warn('Warning message');
```

**Behavior:**
- ✅ Enabled in development
- ❌ Disabled in production by default
- ✅ Errors are always logged (even in production)
- ✅ Can be enabled with `NEXT_PUBLIC_ENABLE_LOGS=true`

## Audit Logging

**Audit logs are ALWAYS written to the database**, regardless of console logging settings. This ensures:
- Full compliance trail
- Security monitoring
- Action tracking

### Usage

```typescript
import { audit } from '@/lib/audit';

// Automatic logging (via auth route)
// - User signups
// - User logins
// - User logouts

// Manual logging
await audit.companyCreate(companyId, companyName);
await audit.exportDownload(exportId);
await audit.custom('CUSTOM_ACTION', {
  resourceType: 'resource',
  resourceId: 'id',
  details: { custom: 'data' },
});
```

### Viewing Audit Logs

1. **Prisma Studio**: `npm run db:studio` → `audit_logs` table
2. **Admin Dashboard**: `/admin/audit-logs` (to be implemented)
3. **Direct Database Query**: Query the `audit_logs` table

## Environment Variables

### Development (Default)
```bash
# Console logs enabled automatically
NODE_ENV=development
```

### Production (Recommended)
```bash
# Disable console logs
NODE_ENV=production
ENABLE_CONSOLE_LOGS=false
NEXT_PUBLIC_ENABLE_LOGS=false
```

### Production with Debugging
```bash
# Enable console logs for debugging (temporary)
NODE_ENV=production
ENABLE_CONSOLE_LOGS=true
NEXT_PUBLIC_ENABLE_LOGS=true
```

## Migration from console.log

Replace all `console.log` / `console.error` with:

**Server-side:**
```typescript
// Before
console.log('Message');
console.error('Error');

// After
import { logger } from '@/lib/logger';
logger.log('Message');
logger.error('Error');
```

**Client-side:**
```typescript
// Before
console.log('Message');
console.error('Error');

// After
import { clientLogger } from '@/lib/logger';
clientLogger.log('Message');
clientLogger.error('Error'); // Always logged
```

## Important Notes

1. **Audit logs are independent**: Database audit logs are written regardless of console logging settings
2. **Errors are always logged**: Client-side errors are always logged to console (even in production)
3. **No sensitive data**: Passwords and tokens are never logged
4. **Performance**: Console logging disabled in production improves performance

## Best Practices

1. ✅ Use `logger` / `clientLogger` instead of `console.*`
2. ✅ Always log audit events for important actions
3. ✅ Never log passwords, tokens, or other sensitive data
4. ✅ Use appropriate log levels (log, warn, error)
5. ✅ Keep console logs minimal in production (use audit logs instead)
