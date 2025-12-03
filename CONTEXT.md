# HyreLog Dashboard - Build Context

## Project Overview

Built a complete Next.js App Router dashboard application for HyreLog audit logging platform. This is a standalone dashboard repository that connects to a shared PostgreSQL database (managed by the backend repo).

## Architecture Decisions

### Authentication Strategy
- **Per-page authentication** (NOT middleware-based)
- Uses Better-Auth with Prisma adapter
- Server-side auth checks via `requireAuth()` in layouts/pages
- Client-side auth via `useSession()` hook

### Key Architecture Rules
1. **Dashboard CANNOT create migrations** - Only backend repo owns schema
2. **Dashboard ONLY runs `npx prisma generate`** - Never `prisma migrate`
3. **Schema updates come from backend** - Must copy schema.prisma before generating client
4. **Shared database** - Both backend and dashboard use same PostgreSQL instance

## Tech Stack

- **Next.js 16** (App Router with Turbopack)
- **TypeScript**
- **Tailwind CSS v4** (with custom theme variables)
- **shadcn/ui** components
- **Better-Auth** for authentication
- **Prisma Client** (read-only, no migrations)
- **Recharts** for charts (has compatibility issues with Next.js 16)
- **next-themes** for dark/light mode
- **Lucide React** for icons

## File Structure & Key Files

### Authentication
- `lib/auth.ts` - Better-Auth server configuration
- `lib/auth-server.ts` - Server-side auth utilities (`requireAuth()`, `getServerSession()`)
- `lib/auth-client.ts` - Client-side auth hooks (`useSession()`, `signIn()`, `signOut()`)
- `app/api/auth/[...all]/route.ts` - Better-Auth API route handler
- `app/login/page.tsx` - Login page (client component)

### Database
- `lib/prisma.ts` - Prisma Client singleton (prevents hot-reload issues)
- `prisma/schema.prisma` - Database schema (copied from backend repo)
- `generated/prisma/` - Generated Prisma Client (output directory)

### UI Components
- `components/ui/` - shadcn/ui components (button, card, table, dropdown, etc.)
- `components/sidebar.tsx` - Main navigation sidebar
- `components/header.tsx` - Top header with user menu and theme toggle
- `components/theme-provider.tsx` - Theme context provider
- `components/theme-toggle.tsx` - Dark/light mode toggle

### Pages Implemented

All pages are under `app/(dashboard)/` route group:

1. **Overview** (`/overview`) - Dashboard with usage charts and stats
2. **Workspaces** (`/workspaces`) - List and detail views
3. **Event Explorer** (`/explorer`) - Search/filter events with pagination
4. **Timeline** (`/timeline`) - Visual timeline of events
5. **Actors** (`/actors`) - View actors and their activity
6. **Resources** (`/resources`) - View resources and their activity
7. **Usage & Billing** (`/billing`) - Charts and billing information
8. **Alerts** (`/alerts`) - Configure threshold alerts
9. **GDPR** (`/gdpr`) - GDPR request management
10. **Region & Residency** (`/region`) - Data region settings
11. **API Keys** (`/api-keys`) - API key management
12. **Settings** (`/settings`) - Company/workspace settings
13. **Trust & Security** (`/trust`) - Security information (static content)
14. **Docs** (`/docs`) - Documentation pages

### Layouts
- `app/layout.tsx` - Root layout with ThemeProvider
- `app/(dashboard)/layout.tsx` - Dashboard layout with Sidebar/Header + auth check

## Authentication Flow

1. **Unauthenticated users** → Redirected to `/login`
2. **Login page** → Uses Better-Auth `signIn.email()` client-side
3. **Dashboard layout** → Calls `requireAuth()` server-side (protects all dashboard routes)
4. **Individual pages** → Can optionally add additional auth checks
5. **Logout** → Uses `signOut()` from auth-client

## Environment Variables

Required in `.env`:
```
DATABASE_URL=postgres://user:password@host:5432/database
BETTER_AUTH_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_HYRELOG_ENV=development
```

## Current State

### ✅ Completed
- All pages implemented with Prisma queries
- Authentication system (per-page, not middleware)
- UI components and navigation
- Theme system (dark/light mode)
- Server Components for data fetching
- Client Components for interactivity

### ⚠️ Known Issues
1. **Recharts compatibility** - Runtime error "Super expression must either be null or a function"
   - Affects: Overview, Billing pages
   - Solution: May need to update Recharts version or use dynamic imports
2. **Better-Auth setup** - May need schema adjustments based on actual database
   - Better-Auth creates its own tables, ensure they align with your schema
3. **Server Actions** - Form submissions currently show placeholder alerts
   - Need to implement actual server actions for mutations

### 🔧 Needs Implementation
- Server Actions for form submissions (GDPR requests, API keys, settings)
- RBAC guards based on CompanyUser/WorkspaceUser roles
- Company switcher in header
- Pagination controls in Event Explorer
- Event detail modals/views

## Key Design Decisions

1. **No Middleware** - Per-page auth gives more control and works better with App Router
2. **Server Components First** - Most pages use Server Components for data fetching
3. **Client Components Only When Needed** - Filters, forms, charts use client components
4. **Layout-Level Auth** - Dashboard layout protects all routes, individual pages can add more checks
5. **Prisma Singleton** - Prevents multiple instances in development (hot-reload issue)

## Database Schema Notes

The dashboard uses the shared Prisma schema from the backend repo. Key models:
- `User` - Authentication users
- `Company` - Organizations
- `Workspace` - Workspaces within companies
- `AuditEvent` - Audit log events
- `ApiKey` - API keys for authentication
- `GdprRequest` - GDPR requests
- `BillingMeter` - Usage meters
- `UsageStats` - Usage statistics
- And many more...

## Build Status

- TypeScript compilation: ✅ Works
- CSS/Tailwind: ✅ Fixed (removed `@apply` with custom variables)
- Prisma Client: ✅ Generated successfully
- Runtime: ⚠️ Recharts has compatibility issues

## Next Steps

1. Fix Recharts compatibility or replace with alternative
2. Implement Server Actions for mutations
3. Add RBAC based on roles from CompanyUser/WorkspaceUser
4. Test authentication flow end-to-end
5. Add company context/switcher
6. Implement pagination properly
7. Add loading states and error boundaries

## Important Notes

- This dashboard is **read-only** for schema changes
- All migrations happen in the backend repo
- Dashboard only queries and updates config rows (not schema structure)
- Both repos share the same database connection string
- Dashboard is designed to deploy on Vercel
- Backend will deploy on AWS

