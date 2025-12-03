# Onboarding Improvements Needed

## Current State Summary

Based on the analysis in `CURRENT_ONBOARDING.md`, here's what's missing:

### ❌ Missing Components
1. **Signup Page** - No way for users to register
2. **Company Creation UI** - No way to create companies
3. **Onboarding Flow** - No guidance for new users
4. **Welcome Email Trigger** - Not sent on signup
5. **First-Time User Detection** - No logic to detect new users

## Recommended Improvements

### 1. **Signup Page** (High Priority)
**Location**: `app/signup/page.tsx`

**Features Needed**:
- Email and password input
- Name input (optional)
- Password confirmation
- Terms of service checkbox
- Link to login page
- Error handling
- Success redirect

**Integration**:
- Use `signUp.email()` from Better-Auth
- Send welcome email after successful signup
- Redirect to onboarding flow

### 2. **Onboarding Wizard** (High Priority)
**Location**: `app/onboarding/page.tsx` or multi-step flow

**Flow**:
1. **Step 1: Welcome**
   - Welcome message
   - Brief explanation of HyreLog
   - "Get Started" button

2. **Step 2: Create Company**
   - Company name input
   - Company slug (auto-generated from name)
   - Data region selection (AU, US, EU, APAC)
   - Retention days (default: 90)
   - Create company button

3. **Step 3: Create Workspace** (Optional)
   - Workspace name input
   - Workspace slug (auto-generated)
   - Skip option (can create later)

4. **Step 4: Select Plan** (Optional)
   - Show available plans
   - Select default/free plan
   - Skip option (can select later)

5. **Step 5: Complete**
   - Success message
   - "Go to Dashboard" button
   - Optional: Quick start guide

### 3. **Company Creation Server Action** (High Priority)
**Location**: `app/actions/company.ts`

**Function**: `createCompany(formData: FormData)`

**Process**:
1. Validate user is authenticated
2. Validate company name and slug
3. Check slug uniqueness
4. Create company in database
5. Create CompanyUser relationship with role "OWNER"
6. Set as selected company (cookie)
7. Return success/error

### 4. **Workspace Creation Server Action** (Medium Priority)
**Location**: `app/actions/workspace.ts`

**Function**: `createWorkspace(formData: FormData)`

**Process**:
1. Validate user is authenticated
2. Validate user has access to company
3. Validate workspace name and slug
4. Check slug uniqueness within company
5. Create workspace in database
6. Create WorkspaceUser relationship
7. Return success/error

### 5. **First-Time User Detection** (High Priority)
**Location**: `app/(dashboard)/layout.tsx` or middleware

**Logic**:
```typescript
const companies = await getUserCompanies();
if (companies.length === 0) {
  redirect('/onboarding');
}
```

### 6. **Welcome Email on Signup** (Medium Priority)
**Location**: `app/signup/page.tsx` or Better-Auth hook

**Options**:
- **Option A**: Call `sendWelcomeEmail()` after successful signup in signup page
- **Option B**: Use Better-Auth hook/plugin to send email automatically
- **Option C**: Create server action that triggers email

**Recommended**: Option A (explicit call in signup page)

### 7. **Auto-Select First Company** (Low Priority - Already Partially Implemented)
**Current**: `getSelectedCompany()` already selects first company if none selected
**Enhancement**: Set cookie on first company creation

### 8. **Onboarding State Management** (Medium Priority)
**Location**: Cookie or database field

**Options**:
- Store onboarding completion in cookie
- Add `onboardingCompleted` field to User model
- Use URL-based flow (no state needed)

**Recommended**: URL-based flow (simplest)

## Implementation Priority

### Phase 1: Critical (Must Have)
1. ✅ Signup page
2. ✅ Company creation server action
3. ✅ Company creation UI
4. ✅ First-time user detection & redirect
5. ✅ Welcome email on signup

### Phase 2: Important (Should Have)
6. ✅ Onboarding wizard (multi-step)
7. ✅ Workspace creation (optional in onboarding)
8. ✅ Plan selection (optional in onboarding)

### Phase 3: Nice to Have
9. ✅ Onboarding progress indicator
10. ✅ Skip options for optional steps
11. ✅ Quick start guide after onboarding
12. ✅ Tutorial tooltips

## Technical Considerations

### Slug Generation
- Auto-generate from company/workspace name
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Ensure uniqueness

### Default Values
- **Company**: 
  - Retention days: 90
  - Data region: AU (or user's location)
  - Default plan: Free/Basic plan
- **Workspace**:
  - Retention days: Inherit from company (or null)

### Error Handling
- Duplicate slug errors
- Validation errors
- Network errors
- Permission errors

### Security
- Validate user authentication
- Validate company ownership
- Sanitize inputs
- Rate limiting on creation endpoints

## Example Flow

### New User Journey
1. User visits `/signup`
2. Enters email, password, name
3. Clicks "Sign Up"
4. Account created → Welcome email sent
5. Redirected to `/onboarding`
6. Step 1: Welcome screen → Click "Get Started"
7. Step 2: Enter company name → Auto-generate slug → Select region → Create
8. Step 3: (Optional) Create workspace → Skip
9. Step 4: (Optional) Select plan → Skip
10. Step 5: Complete → Click "Go to Dashboard"
11. Redirected to `/overview` with company selected

### Existing User Journey (No Companies)
1. User logs in
2. `getUserCompanies()` returns empty array
3. Redirected to `/onboarding`
4. Same flow as new user (steps 2-5)

## Files to Create/Modify

### New Files
- `app/signup/page.tsx` - Signup page
- `app/onboarding/page.tsx` - Onboarding wizard
- `app/actions/company.ts` - Company creation server action
- `app/actions/workspace.ts` - Workspace creation server action
- `components/create-company.tsx` - Company creation form component
- `components/onboarding-wizard.tsx` - Multi-step wizard component

### Modified Files
- `app/(dashboard)/layout.tsx` - Add first-time user detection
- `app/login/page.tsx` - Add link to signup page
- `app/page.tsx` - Handle redirect logic
- `lib/email.ts` - Ensure welcome email works
- `lib/auth.ts` - (Optional) Add signup hook for email

## Questions to Consider

1. **Should we auto-create a default company on signup?**
   - Pro: User can start immediately
   - Con: User might want to customize company name first
   - **Recommendation**: No, let user create it in onboarding

2. **Should we auto-create a default workspace?**
   - Pro: User can start logging events immediately
   - Con: User might want to customize workspace name first
   - **Recommendation**: Optional step in onboarding

3. **Should onboarding be skippable?**
   - Pro: Advanced users can skip
   - Con: Users might miss important setup
   - **Recommendation**: Yes, but show reminder in dashboard

4. **Should we require plan selection?**
   - Pro: Ensures billing setup
   - Con: Might be barrier to entry
   - **Recommendation**: Optional, default to free plan

5. **Should we send welcome email immediately or after onboarding?**
   - Pro (immediately): User gets confirmation right away
   - Pro (after): Email includes setup instructions
   - **Recommendation**: Immediately on signup, then follow-up after onboarding

