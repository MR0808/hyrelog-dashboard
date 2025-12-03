# Required Prisma Changes for Backend Repo

## ⚠️ CRITICAL: These changes MUST be applied in the backend repo

This dashboard repo cannot modify the schema. All changes below must be applied in the backend repository that owns the Prisma schema.

---

## 1. Company Model - Add Onboarding & Billing Fields

```prisma
model Company {
  // ... existing fields ...
  
  // Onboarding tracking
  onboardingStep String? // "start" | "company" | "plan" | "billing" | "workspace" | "api-key" | "send-event" | "complete"
  
  // Billing mode (STRIPE for self-serve, CUSTOM for enterprise)
  billingMode String @default("STRIPE") // "STRIPE" | "CUSTOM"
  
  // Plan tier (for display/filtering)
  planTier String? // "FREE" | "STARTER" | "GROWTH" | "SCALE" | "ENTERPRISE"
  
  // Custom billing fields (for enterprise)
  customMonthlyPrice Int? // Price in cents
  customEventLimit Int? // Custom event limit override
  customRetentionDays Int? // Custom retention override
  
  // Invoice/contract terms (for enterprise)
  invoiceTerm String? // "NET_30" | "NET_60" | "MANUAL"
  contractStart DateTime?
  contractEnd DateTime?
  crmDealId String? // CRM integration ID (e.g., Salesforce deal ID)
  
  // ... rest of existing fields ...
}
```

---

## 2. CompanyUser Model - Add Onboarding Step

```prisma
model CompanyUser {
  // ... existing fields ...
  
  // Track onboarding progress per user-company relationship
  onboardingStep String? // Same values as Company.onboardingStep
  
  // ... rest of existing fields ...
}
```

---

## 3. User Model - Add Verification & Onboarding State

```prisma
model User {
  // ... existing fields ...
  
  // Email verification status
  isVerified Boolean @default(false)
  
  // Overall onboarding state (optional, for tracking)
  onboardingState String? // "not_started" | "in_progress" | "completed"
  
  // ... rest of existing fields ...
}
```

---

## 4. InternalUser Model - NEW MODEL (Separate from User)

```prisma
enum InternalUserRole {
  SUPER_ADMIN
  SALES_ADMIN
  SUPPORT_ADMIN
  BILLING_ADMIN
}

model InternalUser {
  id        String           @id @default(cuid())
  email     String           @unique
  password  String           // Hashed password (use Argon2)
  name      String?
  role      InternalUserRole
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  
  // Audit log for impersonation
  impersonations AuditLog[]
  
  @@index([email])
  @@index([role])
}
```

---

## 5. AuditLog Model - NEW MODEL (For Impersonation Tracking)

```prisma
model AuditLog {
  id              String        @id @default(cuid())
  internalUserId  String        // Who performed the action
  action          String        // "IMPERSONATE_USER" | "CREATE_COMPANY" | etc.
  targetUserId    String?       // User being impersonated
  targetCompanyId String?       // Company being accessed
  metadata        Json?          // Additional context
  ipAddress       String?
  userAgent       String?
  createdAt       DateTime      @default(now())
  
  internalUser    InternalUser  @relation(fields: [internalUserId], references: [id], onDelete: Cascade)
  
  @@index([internalUserId, createdAt])
  @@index([targetUserId, createdAt])
  @@index([targetCompanyId, createdAt])
}
```

---

## 6. Plan Model - Add Plan Tier Field

```prisma
model Plan {
  // ... existing fields ...
  
  // Plan tier for filtering/display
  tier String? // "FREE" | "STARTER" | "GROWTH" | "SCALE" | "ENTERPRISE"
  
  // ... rest of existing fields ...
}
```

---

## 7. Stripe Integration Fields (Optional - Can be in separate table)

If you want to track Stripe subscriptions directly in Company:

```prisma
model Company {
  // ... existing fields ...
  
  // Stripe subscription fields
  stripeCustomerId String? @unique
  stripeSubscriptionId String? @unique
  stripePriceId String? // Current price ID
  
  // ... rest of existing fields ...
}
```

Or create a separate `StripeSubscription` model:

```prisma
model StripeSubscription {
  id                  String   @id @default(cuid())
  companyId           String   @unique
  stripeCustomerId    String   @unique
  stripeSubscriptionId String   @unique
  stripePriceId       String
  status             String   // "active" | "canceled" | "past_due" | etc.
  currentPeriodStart  DateTime
  currentPeriodEnd    DateTime
  cancelAtPeriodEnd   Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  company             Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@index([stripeCustomerId])
  @@index([stripeSubscriptionId])
  @@index([status])
}
```

---

## Migration Notes

1. **Default Values**: Set `billingMode` default to `"STRIPE"` for existing companies
2. **Onboarding Steps**: Set `onboardingStep` to `null` for existing companies (they've already completed onboarding)
3. **User Verification**: Set `isVerified` to `true` for existing users (or run verification flow)
4. **Plan Tiers**: Backfill `planTier` based on existing `CompanyPlan` relationships

---

## Index Recommendations

Add indexes for performance:

```prisma
model Company {
  // ... fields ...
  
  @@index([billingMode])
  @@index([planTier])
  @@index([onboardingStep])
  @@index([stripeCustomerId]) // if added
}
```

---

## Enum Definitions

Add these enums if not already present:

```prisma
enum BillingMode {
  STRIPE
  CUSTOM
}

enum InvoiceTerm {
  NET_30
  NET_60
  MANUAL
}

enum PlanTier {
  FREE
  STARTER
  GROWTH
  SCALE
  ENTERPRISE
}

enum OnboardingStep {
  START
  COMPANY
  PLAN
  BILLING
  WORKSPACE
  API_KEY
  SEND_EVENT
  COMPLETE
}
```

---

## Validation Rules

1. **billingMode**: 
   - If `STRIPE`, `customMonthlyPrice` should be `null` (use Plan pricing)
   - If `CUSTOM`, `customMonthlyPrice` should be set

2. **onboardingStep**: 
   - Must be one of the defined steps or `null` (completed)
   - Should progress sequentially

3. **InternalUser**: 
   - Must use separate authentication (not Better-Auth User table)
   - Password should use Argon2 (same as customer users)

---

## Testing Checklist

After applying schema changes:

- [ ] Run migrations successfully
- [ ] Verify default values are set correctly
- [ ] Test Company creation with new fields
- [ ] Test InternalUser creation and authentication
- [ ] Verify indexes are created
- [ ] Test queries with new fields
- [ ] Verify foreign key constraints

---

**END OF SCHEMA CHANGES DOCUMENT**

