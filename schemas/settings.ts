import { z } from 'zod';

// Profile schema
export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  displayName: z.string().optional(),
  jobTitle: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  timezone: z.string(),
  locale: z.string()
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Notifications schema
export const notificationsSchema = z.object({
  securityNewLogin: z.boolean(),
  securityPasswordChange: z.boolean(),
  securityEmailChange: z.boolean(),
  workspaceInvites: z.boolean(),
  workspaceRoleChanges: z.boolean(),
  workspaceRemoval: z.boolean(),
  productAnnouncements: z.boolean(),
  productNewsletters: z.boolean()
});

export type NotificationsFormData = z.infer<typeof notificationsSchema>;

// Preferences schema
export const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  defaultLanding: z.enum(['last-workspace', 'workspace-list']),
  developerMode: z.boolean()
});

export type PreferencesFormData = z.infer<typeof preferencesSchema>;
