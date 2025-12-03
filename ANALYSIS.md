# HyreLog Dashboard - Current State Analysis

## ✅ What's Working

### Architecture
- ✅ Next.js 16 App Router with TypeScript
- ✅ Better-Auth authentication (per-page, not middleware)
- ✅ Prisma Client integration (read-only, shared database)
- ✅ shadcn/ui components with dark/light theme
- ✅ All 14 pages implemented with Prisma queries
- ✅ Server Components for data fetching
- ✅ Client Components for interactivity

### Pages Implemented
1. ✅ Overview - Dashboard with stats (Recharts issue)
2. ✅ Workspaces - List and detail views
3. ✅ Event Explorer - Search/filter with pagination (pagination buttons need client component)
4. ✅ Timeline - Visual timeline view
5. ✅ Actors - Actor activity view
6. ✅ Resources - Resource activity view
7. ✅ Billing - Usage charts (Recharts issue)
8. ✅ Alerts - Alert configuration (form needs server action)
9. ✅ GDPR - Request management (form needs server action)
10. ✅ Region - Data region settings
11. ✅ API Keys - Key management (forms need server actions)
12. ✅ Settings - Company settings (form needs server action)
13. ✅ Trust - Security information (static)
14. ✅ Docs - Documentation pages

### Authentication Flow
- ✅ Login page with Better-Auth
- ✅ Dashboard layout protects all routes via `requireAuth()`
- ✅ Session management working
- ✅ Logout functionality

## ⚠️ Known Issues

### 1. Recharts Compatibility
**Problem**: Runtime error "Super expression must either be null or a function"
**Affected Pages**: Overview, Billing
**Solution Options**:
- Update Recharts to latest version
- Use dynamic imports with `ssr: false`
- Replace with alternative charting library (Chart.js, Victory, etc.)

### 2. Server Actions Missing
**Problem**: Forms show placeholder alerts instead of actual mutations
**Affected Components**:
- `components/create-api-key.tsx` - API key creation
- `components/create-gdpr-request.tsx` - GDPR request creation
- `components/company-settings.tsx` - Settings updates
- `components/alert-settings.tsx` - Alert configuration
- API key rotate/revoke buttons in `app/(dashboard)/api-keys/page.tsx`

**Required Actions**:
- Create API key (with hashing - may need backend API call)
- Rotate API key
- Revoke API key
- Create GDPR request
- Update company settings
- Update alert thresholds

### 3. Pagination Not Working
**Problem**: Pagination buttons in Event Explorer don't navigate
**Location**: `app/(dashboard)/explorer/page.tsx` (lines 182-201)
**Solution**: Convert pagination section to client component or use Link components

### 4. Company Context Missing
**Problem**: Hardcoded "Acme Corp" in header, no company switcher
**Location**: `components/header.tsx` (line 32)
**Solution**: 
- Get user's companies from `CompanyUser` table
- Add company switcher dropdown
- Store selected company in context/cookies
- Filter all queries by selected company

### 5. RBAC Not Implemented
**Problem**: No role-based access control
**Solution**: 
- Check `CompanyUser.role` and `WorkspaceUser.role`
- Hide/disable features based on roles
- Add permission checks in server actions

## 🔧 Implementation Needed

### Priority 1: Server Actions

#### 1.1 API Key Management (`app/actions/api-keys.ts`)
```typescript
'use server'

export async function createApiKey(formData: FormData) {
  // Validate auth
  // Get company/workspace from session
  // Generate key (may need backend API call for hashing)
  // Save to database
  // Return key (only shown once)
}

export async function rotateApiKey(keyId: string) {
  // Create new key
  // Link to old key
  // Optionally revoke old key
}

export async function revokeApiKey(keyId: string, reason?: string) {
  // Update revokedAt and revokedReason
}
```

#### 1.2 GDPR Requests (`app/actions/gdpr.ts`)
```typescript
'use server'

export async function createGdprRequest(formData: FormData) {
  // Validate auth
  // Get company from session
  // Create GdprRequest with status CUSTOMER_PENDING
  // Return request ID
}
```

#### 1.3 Company Settings (`app/actions/settings.ts`)
```typescript
'use server'

export async function updateCompanySettings(formData: FormData) {
  // Validate auth and permissions
  // Update company fields
  // Log config change
}
```

#### 1.4 Alert Settings (`app/actions/alerts.ts`)
```typescript
'use server'

export async function updateAlertThreshold(formData: FormData) {
  // Validate auth
  // Update NotificationThreshold
}
```

### Priority 2: Fix Recharts

**Option A: Dynamic Import (Quick Fix)**
```typescript
import dynamic from 'next/dynamic';

const LineChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart),
  { ssr: false }
);
```

**Option B: Update Package**
```bash
npm install recharts@latest
```

**Option C: Replace Library**
- Chart.js with react-chartjs-2
- Victory Charts
- Visx

### Priority 3: Company Context

#### 3.1 Create Company Context Provider
```typescript
// app/providers/company-provider.tsx
'use client'

export function CompanyProvider({ children }) {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  // Load from cookies/localStorage
  // Provide context
}
```

#### 3.2 Update Header with Company Switcher
```typescript
// Get user's companies from CompanyUser
// Show dropdown to switch
// Store selection in cookies
```

#### 3.3 Filter All Queries by Company
```typescript
// Update all Prisma queries to filter by selectedCompany
// Pass companyId from context to server components
```

### Priority 4: Pagination Fix

**Solution**: Create client component for pagination
```typescript
// components/pagination-client.tsx
'use client'

export function PaginationClient({ currentPage, totalPages, baseUrl }) {
  // Use useRouter and Link for navigation
  // Build query string properly
}
```

### Priority 5: RBAC Implementation

#### 5.1 Create Permission Helpers
```typescript
// lib/permissions.ts
export async function requireRole(role: string) {
  const session = await requireAuth();
  // Check CompanyUser.role or WorkspaceUser.role
  // Throw error if insufficient permissions
}

export async function canManageApiKeys() {
  // Check if user has ADMIN or OWNER role
}
```

#### 5.2 Add Permission Checks
- In server actions
- In page components (conditional rendering)
- In UI components (disable buttons)

## 📋 File Structure Summary

```
hyrelog-dashboard/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── layout.tsx        # Auth check + Sidebar/Header
│   │   └── [14 pages]        # All dashboard pages
│   ├── api/
│   │   └── auth/[...all]/    # Better-Auth route handler
│   ├── login/                # Login page
│   └── layout.tsx            # Root layout with ThemeProvider
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── sidebar.tsx           # Navigation sidebar
│   ├── header.tsx             # Top header (needs company switcher)
│   └── [form components]      # Need server actions
├── lib/
│   ├── auth.ts               # Better-Auth config
│   ├── auth-server.ts        # Server-side auth (requireAuth)
│   ├── auth-client.ts        # Client-side hooks
│   └── prisma.ts             # Prisma Client singleton
└── prisma/
    └── schema.prisma         # Copied from backend (read-only)
```

## 🎯 Recommended Next Steps

1. **Fix Recharts** (Quick win)
   - Try dynamic import first
   - If that fails, update package or replace

2. **Implement Server Actions** (Critical)
   - Start with API key creation (may need backend API)
   - Then GDPR requests
   - Then settings updates

3. **Add Company Context** (Important)
   - Create provider
   - Update header
   - Filter queries

4. **Fix Pagination** (Quick fix)
   - Convert to client component

5. **Add RBAC** (Security)
   - Permission helpers
   - Role checks in actions
   - UI conditional rendering

## 🔗 Integration Points

### Backend API Calls Needed
Some operations may need to call the backend API instead of direct DB writes:
- **API Key Creation**: Key hashing happens in backend
- **API Key Rotation**: May need backend validation
- **Rate Limit Status**: Backend calculates this

### Database Operations
Most operations can use Prisma directly:
- GDPR requests (create, read)
- Company settings (update)
- Alert thresholds (update)
- Event queries (read-only)

## 📝 Notes

- Dashboard is **read-only for schema** - all migrations happen in backend
- Both repos share same `DATABASE_URL`
- Better-Auth creates its own tables (session, user, etc.)
- Prisma Client generated to `generated/prisma/` directory
- All pages use Server Components by default (good for SEO/performance)

