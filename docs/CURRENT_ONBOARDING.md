# Current Onboarding Process

## Overview
This document describes the current user onboarding flow in the HyreLog dashboard.

## Current Flow

### 1. **User Registration/Signup**
   - **Status**: ❌ **NOT IMPLEMENTED**
   - There is **no signup page** in the application
   - The `signUp` function is exported from `lib/auth-client.ts` but is never used
   - Users can only be created through:
     - Manual database seeding
     - Direct API calls to Better-Auth
     - External user management tools

### 2. **User Login**
   - **Location**: `/login` page (`app/login/page.tsx`)
   - **Process**:
     1. User enters email and password
     2. Calls `signIn.email()` from Better-Auth
     3. On success, redirects to `/overview`
     4. On failure, shows error message
   - **Authentication**: Uses Better-Auth with Argon2 password hashing

### 3. **Post-Login Experience**
   - **Location**: `app/(dashboard)/layout.tsx`
   - **Process**:
     1. `requireAuth()` ensures user is authenticated
     2. `getUserCompanies()` fetches user's companies
     3. If user has no companies → **No handling** (user sees empty state)
     4. Company selection stored in cookie: `hyrelog-selected-company-id`
     5. `CompanyProvider` wraps dashboard with company context

### 4. **Dashboard Access**
   - **Location**: `/overview` (and other dashboard pages)
   - **Current Behavior**:
     - If user has companies → Shows company data
     - If user has NO companies → Shows "No data available. Please configure your company."
     - **No onboarding flow** - user is stuck with empty state

### 5. **Company Creation**
   - **Status**: ❌ **NOT IMPLEMENTED**
   - There is **no UI** for creating a company
   - No server action for company creation
   - Companies must be created manually or through seeding

### 6. **Workspace Creation**
   - **Status**: ❌ **NOT IMPLEMENTED**
   - No UI for creating workspaces
   - Workspaces must be created manually

## Current Data Model

### User → Company Relationship
- **Many-to-Many**: `User` ↔ `CompanyUser` ↔ `Company`
- Users can belong to multiple companies
- Each relationship has a `role` (OWNER, ADMIN, MEMBER, VIEWER)

### Company → Workspace Relationship
- **One-to-Many**: `Company` → `Workspace`
- Each company can have multiple workspaces
- Workspaces belong to a company

### Required Setup for New User
For a new user to use the system, they need:
1. ✅ User account (created via Better-Auth signup - but no UI)
2. ❌ At least one Company (no creation flow)
3. ❌ CompanyUser relationship (no creation flow)
4. ❌ Optional: Workspace (no creation flow)
5. ❌ Optional: CompanyPlan (no creation flow)

## Current Issues

### Critical Gaps
1. **No Signup Page**: Users cannot register themselves
2. **No Company Creation**: Users cannot create their first company
3. **No Onboarding Flow**: New users see empty state with no guidance
4. **No Welcome Email**: While `sendWelcomeEmail` exists, it's only called for email verification (which is disabled)
5. **No First-Time User Detection**: System doesn't detect if user has no companies

### User Experience Problems
1. User signs up → Logs in → Sees empty dashboard → **No way forward**
2. No guidance on what to do next
3. No automatic company creation for first-time users
4. No onboarding wizard or setup flow

## What Happens Now

### Scenario 1: New User (No Companies)
1. User somehow gets account (manual creation)
2. User logs in
3. `getUserCompanies()` returns empty array
4. `getSelectedCompany()` returns `null`
5. Dashboard shows "No data available. Please configure your company."
6. **User is stuck** - no way to create a company

### Scenario 2: Existing User (Has Companies)
1. User logs in
2. `getUserCompanies()` returns their companies
3. First company is auto-selected (or cookie value used)
4. Dashboard shows company data
5. User can switch companies via header dropdown

## Email Integration Status

### Welcome Email
- **Template**: ✅ Created (`emails/welcome.tsx`)
- **Function**: ✅ Created (`sendWelcomeEmail()`)
- **Integration**: ⚠️ Only called for email verification (disabled)
- **On Signup**: ❌ Not called

### Password Reset Email
- **Template**: ✅ Created (`emails/password-reset.tsx`)
- **Function**: ✅ Created (`sendPasswordResetEmail()`)
- **Integration**: ✅ Integrated with Better-Auth
- **Status**: ✅ Working

## Summary

The current onboarding process is **incomplete**:
- Users can log in but cannot sign up
- Users cannot create companies
- No onboarding flow for first-time users
- Welcome email exists but is not sent on signup
- System assumes companies already exist

**Next Steps Needed:**
1. Create signup page
2. Create company creation flow
3. Add onboarding wizard for first-time users
4. Send welcome email on signup
5. Auto-create default company/workspace for new users (optional)

