import { LIMITS } from '@/src/constants/limits';
import type { LocalDate, Milestone } from '@/src/types/domain';
import { isLocalDate, isLocalTime } from './dates';

export type FieldResult<E extends string> = { ok: true } | { ok: false; error: E };

export type GoalError = 'empty' | 'too-long';
export type DeadlineError = 'missing' | 'invalid' | 'past';
export type TimeError = 'invalid';
export type MotivationError = 'too-long';
export type MilestoneError = 'before-today' | 'after-deadline' | 'empty-title' | 'title-too-long' | 'invalid-date';

export function validateGoal(title: string): FieldResult<GoalError> {
  const t = title.trim();
  if (t.length === 0) return { ok: false, error: 'empty' };
  if (t.length > LIMITS.goalTitleMax) return { ok: false, error: 'too-long' };
  return { ok: true };
}

/** Deadline must be a real local date ≥ today (FR-03). */
export function validateDeadline(date: string, today: LocalDate): FieldResult<DeadlineError> {
  if (!date) return { ok: false, error: 'missing' };
  if (!isLocalDate(date)) return { ok: false, error: 'invalid' };
  if (date < today) return { ok: false, error: 'past' }; // YYYY-MM-DD compares lexicographically
  return { ok: true };
}

export function validateTime(time: string | null): FieldResult<TimeError> {
  if (time === null) return { ok: true };
  return isLocalTime(time) ? { ok: true } : { ok: false, error: 'invalid' };
}

export function validateMotivation(s: string): FieldResult<MotivationError> {
  return s.trim().length > LIMITS.motivationMax ? { ok: false, error: 'too-long' } : { ok: true };
}

export interface MilestonesValidation {
  ok: boolean;
  byId: Record<string, MilestoneError[]>;
  global: 'too-many'[];
}

/**
 * Per-milestone errors (FR-07): `today ≤ date ≤ deadlineDate`, inclusive.
 * Done milestones may sit in the past (they were completed earlier) — see ADR-005.
 */
export function validateMilestones(
  ms: readonly Milestone[],
  today: LocalDate,
  deadlineDate: LocalDate,
): MilestonesValidation {
  const byId: Record<string, MilestoneError[]> = {};
  const global: 'too-many'[] = ms.length > LIMITS.milestonesMax ? ['too-many'] : [];
  for (const m of ms) {
    const errs: MilestoneError[] = [];
    const title = m.title.trim();
    if (title.length === 0) errs.push('empty-title');
    else if (title.length > LIMITS.milestoneTitleMax) errs.push('title-too-long');
    if (!isLocalDate(m.date)) errs.push('invalid-date');
    else {
      if (m.date < today && !m.done) errs.push('before-today');
      if (isLocalDate(deadlineDate) && m.date > deadlineDate) errs.push('after-deadline');
    }
    if (errs.length) byId[m.id] = errs;
  }
  return { ok: global.length === 0 && Object.keys(byId).length === 0, byId, global };
}

/** True when milestones in user order have non-decreasing dates. */
export function isChronological(ms: readonly Milestone[]): boolean {
  const sorted = [...ms].sort((a, b) => a.order - b.order);
  for (let i = 1; i < sorted.length; i++) if (sorted[i].date < sorted[i - 1].date) return false;
  return true;
}

/** Stable sort by date (ties keep user order), renumbered. */
export function sortMilestonesByDate(ms: readonly Milestone[]): Milestone[] {
  return [...ms]
    .sort((a, b) => a.order - b.order)
    .map((m, i) => ({ m, i }))
    .sort((a, b) => (a.m.date < b.m.date ? -1 : a.m.date > b.m.date ? 1 : a.i - b.i))
    .map(({ m }, order) => ({ ...m, order }));
}
