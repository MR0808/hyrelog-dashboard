# HyreLog Dashboard

Next.js dashboard for HyreLog audit log management. Provides customer-facing and admin interfaces for managing events, exports, webhooks, and Glacier restore requests.

## Prerequisites

1. **HyreLog API running**: The dashboard requires the `hyrelog-api` service to be running with the dashboard DB container.
2. **Node.js 20+** and npm
3. **Docker Desktop** (for the dashboard DB - already set up in `hyrelog-api` docker-compose)

## Tech Stack (Latest Versions)

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with compiler optimizations
- **Prisma 7** - Latest ORM with improved performance
- **TypeScript 5.7** - Latest TypeScript
- **better-auth** - Modern authentication library
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library

## Setup Instructions

### Step 1: Ensure hyrelog-api Docker Compose is Running

The dashboard uses the `postgres_dashboard` container from the `hyrelog-api` docker-compose setup.

```bash
cd ../hyrelog-api
docker compose up -d
```

Verify the container is running:
```bash
docker ps | grep hyrelog-postgres-dashboard
```

You should see the container running on port `55450`.

### Step 2: Copy Environment Variables

```bash
cp .env.example .env
```

### Step 3: Configure Environment Variables

Edit `.env` and set:

```bash
# Logging Configuration (Production)
# Set to 'false' to disable console logging in production
# Audit logs are ALWAYS written to database regardless of this setting
ENABLE_CONSOLE_LOGS=false
NEXT_PUBLIC_ENABLE_LOGS=false

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Dashboard Service Token (must match hyrelog-api DASHBOARD_SERVICE_TOKEN)
DASHBOARD_SERVICE_TOKEN=your-dashboard-service-token-here

# Database (dashboard auth DB)
DATABASE_URL=postgresql://hyrelog:hyrelog@localhost:55450/hyrelog_dashboard

# Better Auth
BETTER_AUTH_SECRET=your-better-auth-secret-here
BETTER_AUTH_URL=http://localhost:3001

# Seed Configuration
SEED_ADMIN_EMAIL=admin@hyrelog.local
SEED_ADMIN_PASSWORD=ChangeMe123!
```

**Important:**
- `DASHBOARD_SERVICE_TOKEN` must match the value in `hyrelog-api/.env`
- Generate `BETTER_AUTH_SECRET`: `openssl rand -hex 32`
- Generate `DASHBOARD_SERVICE_TOKEN`: `openssl rand -hex 32`

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Run Database Migrations

```bash
npm run db:migrate
```

This creates the Prisma schema tables (User, Session, Account, CompanyMembership, PlatformRole).

### Step 6: Generate Prisma Client

```bash
npm run db:generate
```

### Step 7: Seed Database

**Normal seeding (safe, doesn't delete existing data):**

```bash
npm run seed
```

**Reset and seed (⚠️ WARNING: Deletes ALL data first):**

```bash
npm run seed -- --reset
# or
npm run seed -- -r
```

This will:
- Delete all existing data (users, accounts, sessions, audit logs, etc.)
- Wait 3 seconds for you to cancel (Ctrl+C)
- Then create fresh seed data

**What gets created:**
- HyreLog admin user (from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`)
- Customer user (`customer@hyrelog.local` / `ChangeMe123!`)

### Step 8: Start Development Server

```bash
npm run dev -- --port 3001
```

The dashboard will be available at `http://localhost:3001`.

### Step 9: Sign Up and Set Passwords

**Important**: The seed script creates users but doesn't set passwords. Users must sign up via the UI to set their passwords.

1. **Sign up as admin**: Navigate to `http://localhost:3001/signup`
   - Email: `admin@hyrelog.local` (must match seeded email)
   - Name: `HyreLog Admin`
   - Password: `ChangeMe123!` (or your preferred password)

2. **Sign up as customer**: Logout and sign up again
   - Email: `customer@hyrelog.local` (must match seeded email)
   - Name: `Customer User`
   - Password: `ChangeMe123!` (or your preferred password)

### Step 10: Login and Attach Company Membership

1. **Login as admin**: Navigate to `http://localhost:3001/login`
   - Use the credentials you set during sign-up

2. **Attach company membership**:
   - After login, you'll be redirected to `/admin/companies`
   - Find or create a company in the API (via API endpoints or directly in DB)
   - Use the admin interface to attach company membership to the customer user
   - Or manually insert into `company_memberships` table:
     ```sql
     INSERT INTO company_memberships (id, "userId", "companyId", role, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), '<customer-user-id>', '<company-id>', 'COMPANY_ADMIN', NOW(), NOW());
     ```

3. **Login as customer**: Logout and login as `customer@hyrelog.local` to access customer pages.

## Project Structure

```
hyrelog-dashboard/
├── app/
│   ├── api/auth/          # Better-auth API routes
│   ├── app/               # Customer-facing pages
│   │   ├── events/        # Event listing and filtering
│   │   ├── exports/       # Export job management
│   │   ├── webhooks/       # Webhook management
│   │   ├── restores/       # Glacier restore requests
│   │   └── gdpr/          # GDPR requests (scaffold)
│   ├── admin/             # HyreLog admin pages
│   │   ├── companies/     # Company management
│   │   ├── plans/         # Plan management
│   │   ├── restore-requests/ # Approve/reject restores
│   │   └── audit-logs/    # Audit log viewing
│   └── login/             # Login page
├── lib/
│   ├── auth.ts            # Better-auth configuration
│   ├── db.ts              # Prisma client
│   ├── rbac.ts            # RBAC helpers
│   └── api/
│       └── client.ts      # API client for hyrelog-api
├── prisma/
│   ├── schema.prisma      # Dashboard DB schema
│   └── seed.ts            # Seed script
└── components/            # React components (shadcn/ui)
```

## Features

### Customer Pages (`/app/*`)

- **Events**: View and filter audit events
- **Exports**: Create and download export jobs
- **Webhooks**: Manage webhook endpoints
- **Restores**: Create and track Glacier restore requests
- **GDPR**: GDPR request management (scaffold)

### Admin Pages (`/admin/*`)

- **Companies**: List, search, and manage companies
- **Plans**: View and manage subscription plans
- **Restore Requests**: Approve/reject/cancel restore requests
- **Audit Logs**: View all dashboard actions

## Authentication

- Uses **better-auth** for session-based authentication
- Email/password authentication
- Session stored in database
- RBAC enforced server-side for all routes

## API Integration

The dashboard calls `hyrelog-api` `/dashboard/*` endpoints:
- Automatically adds `x-dashboard-token` header
- Adds actor headers: `x-user-id`, `x-user-email`, `x-user-role`
- Adds `x-company-id` for company-scoped routes
- Handles API errors with proper error codes

## Development

```bash
# Run development server
npm run dev -- --port 3001

# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Open Prisma Studio
npm run db:studio

# Seed database
npm run seed
```

## Troubleshooting

### "DASHBOARD_SERVICE_TOKEN environment variable is required"
- Ensure `.env` file exists and contains `DASHBOARD_SERVICE_TOKEN`
- Token must match the value in `hyrelog-api/.env`

### "Company ID required for this request"
- Customer users must have a company membership
- Use admin interface or manually insert into `company_memberships` table
- Select a company using the company switcher (if implemented)

### Database connection errors
- Ensure `hyrelog-api` docker-compose is running
- Verify `postgres_dashboard` container is up: `docker ps | grep dashboard`
- Check `DATABASE_URL` in `.env` matches the container port (55450)

### Better-auth errors
- Ensure `BETTER_AUTH_SECRET` is set in `.env`
- Ensure `BETTER_AUTH_URL` matches your dev server URL
- Run migrations: `npm run db:migrate`

## Next Steps

1. Implement company switcher component
2. Add export creation form
3. Add restore request creation form
4. Implement webhook creation/editing
5. Add server actions for all API calls
6. Enhance UI with shadcn/ui components
7. Add loading states and error handling
8. Implement pagination for all list views
