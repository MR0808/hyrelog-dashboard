# Email System Documentation

## Overview

The HyreLog dashboard uses **react-email** for all email templates, both transactional and non-transactional. All emails are sent through a centralized email service.

## Architecture

### Email Templates (`emails/`)

All email templates are React components using `@react-email/components`:

- **`welcome.tsx`**: Welcome email for new users
- **`password-reset.tsx`**: Password reset email
- **`alert-threshold.tsx`**: Usage alert notifications (non-transactional)
- **`gdpr-request.tsx`**: GDPR request status updates

### Email Service (`lib/email.ts`)

Centralized email sending functions:

- `sendEmail(options)`: Core email sending function (needs ESP integration)
- `sendWelcomeEmail()`: Sends welcome email
- `sendPasswordResetEmail()`: Sends password reset email
- `sendAlertThresholdEmail()`: Sends usage alert emails
- `sendGdprRequestEmail()`: Sends GDPR request status emails

### Better-Auth Integration (`lib/auth.ts`)

Better-Auth is configured to use react-email templates for:

- Email verification (when enabled)
- Password reset emails
- Password changed notifications

## Email Service Provider (ESP) Integration

### Current Status

✅ **Resend is now integrated!** The email system is fully configured and ready to send emails.

### Implementation

Resend is configured in `lib/email.ts`:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const { data, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL || 'noreply@hyrelog.com',
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
  // Error handling...
}
```

### Environment Variables

Required in `.env`:

```env
# Resend API Key (required)
RESEND_API_KEY=re_xxxxxxxxx

# From Email Address (optional, defaults to noreply@hyrelog.com)
FROM_EMAIL=noreply@hyrelog.com
```

**Note**: Make sure your domain is verified in Resend before sending emails in production.

## Email Types

### Transactional Emails

These are triggered by user actions:

1. **Welcome Email**: Sent when a user signs up
2. **Password Reset**: Sent when user requests password reset
3. **Password Changed**: Sent when user changes password
4. **Email Verification**: Sent when email verification is enabled

### Non-Transactional Emails

These are notifications and alerts:

1. **Usage Alerts**: Sent when usage thresholds are reached
2. **GDPR Request Updates**: Sent when GDPR request status changes
3. **Billing Notifications**: (Future) Billing-related emails
4. **Security Alerts**: (Future) Security-related notifications

## Development

In development mode, emails are logged to the console instead of being sent. To test actual email sending:

1. Configure an ESP (see above)
2. Set `NODE_ENV=production` or remove the development check
3. Ensure `FROM_EMAIL` is set in environment variables

## Testing Email Templates

You can preview email templates using react-email's dev server:

```bash
npx react-email dev
```

This starts a local server where you can preview all email templates.

## Best Practices

1. **Always provide both HTML and text versions** of emails
2. **Use react-email components** for consistent styling
3. **Test emails** in multiple email clients
4. **Handle errors gracefully** - email sending failures shouldn't break the app
5. **Rate limiting** - Respect ESP rate limits
6. **Unsubscribe links** - Include unsubscribe links for non-transactional emails (GDPR compliance)

## Future Enhancements

- [ ] Email template preview page in dashboard
- [ ] Email delivery tracking
- [ ] Email analytics (open rates, click rates)
- [ ] Email queue system for reliability
- [ ] A/B testing for email templates
- [ ] Localization support for emails

