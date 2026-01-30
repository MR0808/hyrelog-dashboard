import { SaveSchema } from '@/schemas/onboarding';
import z from 'zod';

export interface OnboardingFormProps {
  data: z.infer<typeof SaveSchema>;
  isAutoNamed: boolean;
}
