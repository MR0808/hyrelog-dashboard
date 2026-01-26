import { z } from 'zod';
import { passwordSchema } from './auth';

// Signup schema
export const RegisterSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  companyName: z.string(),
  email: z.email({ message: 'Please enter a valid email address' }),
  password: passwordSchema,
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions'
  })
});
