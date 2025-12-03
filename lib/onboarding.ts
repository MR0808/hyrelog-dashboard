/**
 * Onboarding step tracking and utilities
 */

export type OnboardingStep =
  | 'start'
  | 'company'
  | 'plan'
  | 'billing'
  | 'workspace'
  | 'api-key'
  | 'send-event'
  | 'complete';

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'start',
  'company',
  'plan',
  'billing',
  'workspace',
  'api-key',
  'send-event',
  'complete',
];

/**
 * Get the next step in onboarding
 */
export function getNextStep(currentStep: OnboardingStep | null): OnboardingStep {
  if (!currentStep) return 'start';
  
  const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === ONBOARDING_STEPS.length - 1) {
    return 'complete';
  }
  
  return ONBOARDING_STEPS[currentIndex + 1];
}

/**
 * Get the previous step in onboarding
 */
export function getPreviousStep(currentStep: OnboardingStep | null): OnboardingStep | null {
  if (!currentStep) return null;
  
  const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
  if (currentIndex <= 0) return null;
  
  return ONBOARDING_STEPS[currentIndex - 1];
}

/**
 * Check if a step is valid
 */
export function isValidStep(step: string): step is OnboardingStep {
  return ONBOARDING_STEPS.includes(step as OnboardingStep);
}

/**
 * Get step number (1-indexed)
 */
export function getStepNumber(step: OnboardingStep): number {
  return ONBOARDING_STEPS.indexOf(step) + 1;
}

/**
 * Get total number of steps
 */
export function getTotalSteps(): number {
  return ONBOARDING_STEPS.length;
}

