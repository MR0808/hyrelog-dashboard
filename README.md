# HyreLog Dashboard

A Next.js dashboard application for managing HyreLog audit logs.

## Architecture

- **Backend API/Workers**: Fastify, Prisma, S3, Billing, Hash-chain, GDPR Worker, Cron jobs (AWS)
- **Dashboard**: Next.js App Router + Prisma + Better-Auth (Vercel)
- **Database**: Shared PostgreSQL database (Supabase/AWS RDS)

## Important Rules

- **This repo MUST NOT create migrations**. Only the backend owns schema & migrations.
- **Dashboard ONLY runs `npx prisma generate`**.
- All schema updates come from backend repo and must be copied into this repo before generating Prisma client.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy the Prisma schema from the backend repo to `prisma/schema.prisma`

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Create `.env` file (see `.env.example`):
```env
DATABASE_URL=postgres://user:password@localhost:5432/hyrelog
BETTER_AUTH_SECRET=your-secret-key-change-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_HYRELOG_ENV=development
```

5. Run development server:
```bash
npm run dev
```

## Build

```bash
npm run build
```

## Pages

- `/overview` - Dashboard overview with usage charts
- `/workspaces` - Manage workspaces
- `/explorer` - Event explorer with filters
- `/timeline` - Visual timeline of events
- `/actors` - View actors and their activity
- `/resources` - View resources and their activity
- `/billing` - Usage & billing information
- `/alerts` - Configure and view alerts
- `/gdpr` - GDPR request management
- `/region` - Data region and residency settings
- `/api-keys` - API key management
- `/settings` - Company and workspace settings
- `/trust` - Trust & security information
- `/docs` - Documentation

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Better-Auth
- Prisma Client
- Recharts
- next-themes
- Lucide icons

## Notes

- Some pages may have runtime errors with Recharts - this is a known compatibility issue that may need version updates
- Better-Auth setup may need adjustment based on your database schema
- Middleware uses deprecated convention - consider updating to Next.js proxy pattern
