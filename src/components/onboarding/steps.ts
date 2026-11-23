export const ONBOARDING_STEPS = ['goal', 'deadline', 'motivation', 'milestones', 'theme', 'reminders'] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export function stepIndexFromPath(pathname: string): number {
  const last = pathname.split('/').filter(Boolean).pop() ?? '';
  const i = (ONBOARDING_STEPS as readonly string[]).indexOf(last);
  return i < 0 ? 0 : i;
}

export function nextStepHref(step: OnboardingStep): string {
  const i = ONBOARDING_STEPS.indexOf(step);
  return `/onboarding/${ONBOARDING_STEPS[Math.min(i + 1, ONBOARDING_STEPS.length - 1)]}`;
}
