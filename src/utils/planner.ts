import type { LocalDate, Milestone } from '@/src/types/domain';
import { addLocalDays, calendarDaysBetween } from './dates';
import { suggestIcon } from './icons';
import { createId } from './id';

/** Phase template, in chronological order (ARCHITECTURE §4). */
export const PHASE_TITLES = [
  'Research & scope',
  'Outline the plan',
  'First draft / first rep',
  'Midpoint check-in',
  'Polish & practice',
  'Final review',
] as const;

/** D ≥ 42 → 6; 28–41 → 5; 14–27 → 4; otherwise 3. */
export function milestoneCountFor(daysAway: number): number {
  if (daysAway >= 42) return 6;
  if (daysAway >= 28) return 5;
  if (daysAway >= 14) return 4;
  return 3;
}

/** Pick `n` template titles evenly spaced across the 6 phases. */
export function phaseTitlesFor(n: number): string[] {
  const last = PHASE_TITLES.length - 1;
  if (n <= 1) return [PHASE_TITLES[last]];
  return Array.from({ length: n }, (_, k) => PHASE_TITLES[Math.round((k * last) / (n - 1))]);
}

export interface AutoPlanInput {
  today: LocalDate;
  deadlineDate: LocalDate;
  /** Used only for ID generation. */
  now: Date;
}

/**
 * Evenly spaced milestones backward from the deadline (FR-06).
 * offset_i = round(D · i / (n + 1)) days before the deadline, i = 1…n. Returned ascending by date.
 */
export function autoPlanBackward({ today, deadlineDate, now }: AutoPlanInput): Milestone[] {
  const D = Math.max(0, calendarDaysBetween(today, deadlineDate));
  const n = milestoneCountFor(D);
  const offsets = Array.from({ length: n }, (_, k) => Math.round((D * (k + 1)) / (n + 1))).sort((a, b) => b - a);
  const titles = phaseTitlesFor(n);
  return offsets.map((offset, i) => {
    const title = titles[i];
    return {
      id: createId('m', now.getTime()),
      title,
      date: addLocalDays(deadlineDate, -offset),
      done: false,
      completedAt: null,
      icon: suggestIcon(title),
      order: i,
    };
  });
}
