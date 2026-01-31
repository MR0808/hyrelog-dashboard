import { z } from 'zod';

// OTP verification schema
export const otpSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
  otp: z
    .string()
    .length(6, 'Please enter all 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers')
});

export type OtpFormData = z.infer<typeof otpSchema>;

export const VerifyCodeSchema = z.object({
  email: z.email(),
  code: z.string().regex(/^\d{6}$/)
});

export const ResendSchema = z.object({
  email: z.email()
});
