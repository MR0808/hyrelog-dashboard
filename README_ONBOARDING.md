# HyreLog Onboarding System - Quick Start Guide

## 🚀 Quick Setup

### 1. Environment Variables

Add to your `.env` file:

```env
# Stripe (Required for billing)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Resend (Already configured)
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@hyrelog.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Already configured)
DATABASE_URL=postgres://...

# Better Auth (Already configured)
BETTER_AUTH_SECRET=your-secret-here
```

### 2. Schema Changes Required

**⚠️ IMPORTANT:** Before testing, you must apply schema changes in the backend repo.

See `docs/SCHEMA_CHANGES_REQUIRED.md` for complete details.

Key fields needed:
- `Company.onboardingStep`, `billingMode`, custom billing fields
- `CompanyUser.onboardingStep`
- `User.isVerified`, `onboardingState`
- New `InternalUser` model
- New `AuditLog` model

### 3. Install Dependencies

```bash
npm install
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

**Note:** Do NOT run `prisma migrate` - schema changes must be applied in backend repo.

### 5. Start Development Server

```bash
npm run dev
```

---

## 🧪 Testing Self-Serve Onboarding

### Flow:
1. Navigate to `http://localhost:3000/signup`
2. Create a new account
3. Follow onboarding steps:
   - **Start** → Welcome screen
   - **Company** → Create company, select region
   - **Plan** → Choose plan (Free plan skips billing)
   - **Billing** → Stripe checkout (if paid plan)
   - **Workspace** → Create first workspace
   - **API Key** → Generate API key
   - **Send Event** → Send test event (auto-detected)
   - **Complete** → Success screen

### Test Accounts:
- Use any email/password for signup
- Free plan: No Stripe required
- Paid plans: Requires Stripe test mode keys

---

## 🔐 Testing Internal Admin Portal

### Prerequisites:
1. **InternalUser table must exist** (apply schema changes)
2. Create an internal admin user in database:

```sql
-- Example (password will need to be hashed with Argon2)
INSERT INTO "InternalUser" (id, email, password, role, "createdAt", "updatedAt")
VALUES (
  'cuid()',
  'admin@hyrelog.com',
  '$argon2id$...', -- Use hashPassword() function
  'SUPER_ADMIN',
  NOW(),
  NOW()
);
```

### Flow:
1. Navigate to `http://localhost:3000/internal/login`
2. Sign in with internal admin credentials
3. Access company management:
   - **Companies** → List all companies
   - **Create Company** → Create enterprise company
   - **Company Detail** → View/edit company
   - **Users** → View all users
   - **Settings** → System configuration

---

## 📋 Checklist Before Testing

### Self-Serve Onboarding:
- [ ] Stripe API keys configured
- [ ] Resend API key configured
- [ ] Schema changes applied (onboardingStep fields)
- [ ] Database seeded with plans
- [ ] Test signup flow

### Internal Admin:
- [ ] Schema changes applied (InternalUser model)
- [ ] Internal admin user created
- [ ] Test internal login
- [ ] Test company creation
- [ ] Test company management

---

## 🐛 Common Issues

### "onboardingStep does not exist"
- **Fix:** Apply schema changes in backend repo
- See `docs/SCHEMA_CHANGES_REQUIRED.md`

### "InternalUser model not found"
- **Fix:** Create InternalUser table in database
- See schema changes document

### "Stripe checkout fails"
- **Fix:** Check Stripe API keys are correct
- Use test mode keys for development

### "Welcome email not sent"
- **Fix:** Check Resend API key
- Check `FROM_EMAIL` is set
- Check email logs in Resend dashboard

### "Event detection not working"
- **Fix:** Ensure backend API is running
- Check workspace ID matches
- Verify API key is correct

---

## 📚 Documentation

- `docs/SCHEMA_CHANGES_REQUIRED.md` - Schema changes needed
- `docs/ONBOARDING_IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- `docs/CURRENT_ONBOARDING.md` - Previous state analysis

---

## 🎯 Next Steps After Testing

1. **Fix any bugs** found during testing
2. **Add error handling** for edge cases
3. **Add analytics** tracking
4. **Complete internal admin** sub-pages (billing, workspaces, users, keys)
5. **Add email notifications** for internal admins
6. **Implement impersonation** with audit logging
7. **Add CRM integration** for enterprise deals

---

**Ready to test!** 🚀

