# HyreLog Self-Serve Onboarding - Setup Instructions

## Prerequisites

1. PostgreSQL database running (for dashboard DB)
2. Node.js 18+ installed
3. Both `hyrelog-dashboard` and `hyrelog-api` repositories cloned

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd hyrelog-dashboard
npm install
```

### 2. Environment Variables

Create/update `.env` in `hyrelog-dashboard`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hyrelog_dashboard

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here-min-32-chars
BETTER_AUTH_URL=http://localhost:3001

# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
DASHBOARD_SERVICE_TOKEN=your-dashboard-service-token

# Email (Optional - dev mode logs to console if not set)
EMAIL_FROM=noreply@hyrelog.com
EMAIL_FROM_NAME=HyreLog
RESEND_API_KEY=re_xxx  # Optional for dev

# Stripe (Optional - for webhook testing)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Logging
ENABLE_CONSOLE_LOGS=true
NEXT_PUBLIC_ENABLE_LOGS=true

# Seed Users
SEED_ADMIN_EMAIL=admin@hyrelog.local
SEED_ADMIN_PASSWORD=ChangeMe123!
```

### 3. Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional - creates test users)
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The dashboard will run on `http://localhost:3001`

## Testing the Flow

### 1. Sign Up
1. Navigate to `http://localhost:3001/signup`
2. Fill in:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john@example.com`
   - Password: `Test1234!`
3. Submit form
4. Check console for verification email link (dev mode)

### 2. Verify Email
1. Copy verification link from console
2. Open in browser or click link
3. Should redirect to dashboard after verification

### 3. Create Company
1. After verification, you'll be redirected to `/create-company`
2. Fill in:
   - Company Name: `Acme Corp`
   - Data Region: `US` (or EU/APAC)
   - Optional: Company Size, Industry, Use Case
3. Submit
4. Check console for company created email
5. Should redirect to `/app` dashboard

### 4. Invite User
1. Navigate to company settings (when implemented) or use API directly
2. Invite a user by email
3. Check console for invite email link
4. Accept invite as the invited user
5. Verify membership created

## API Endpoint Testing

### Create Company via API

```bash
curl -X POST http://localhost:3000/dashboard/companies \
  -H "Authorization: Bearer ${DASHBOARD_SERVICE_TOKEN}" \
  -H "x-user-id: ${USER_ID}" \
  -H "x-user-email: ${USER_EMAIL}" \
  -H "x-user-role: COMPANY_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "dataRegion": "US"
  }'
```

## Troubleshooting

### Email Verification Not Working
- Check console for verification link (dev mode)
- Verify token hasn't expired (24 hours)
- Check database for `email_verification_tokens` table

### Company Creation Fails
- Verify API is running on port 3000
- Check `DASHBOARD_SERVICE_TOKEN` matches API config
- Verify user email is verified
- Check API logs for errors

### Invite Not Working
- Verify invite token hasn't expired (7 days)
- Check user email matches invite email
- Verify user email is verified before accepting
- Check database for `company_invites` table

## Database Schema Changes

After migration, verify these tables exist:
- `users` (with `emailVerifiedAt`, `status`, required `firstName`/`lastName`)
- `email_verification_tokens`
- `companies` (in API DB, not dashboard DB)
- `company_memberships`
- `company_invites`
- `audit_logs` (with new action types)

## Next Steps

1. Implement member management UI
2. Add API key creation endpoint
3. Test Stripe webhook (requires Stripe account)
4. Implement grace period cron job
5. Add plan downgrade enforcement

## Notes

- All tokens are hashed before storage
- Email verification is required for company creation and API keys
- Company data region is immutable
- All operations are audited
- Dev mode logs email links to console for testing
