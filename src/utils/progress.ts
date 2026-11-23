import type { LocalDate, Milestone } from '@/src/types/domain';
import { deadlineInstant, parseLocalDate, toLocalDateString, type DeadlineLike } from './dates';

export interface PlanLike extends DeadlineLike {
  startDate: LocalDate;
  milestones: readonly Milestone[];
}

/** First milestone by user order that isn't done and is dated today or later (FR-11). */
export function getNextMilestone(now: Date, c: { milestones: readonly Milestone[] }): Milestone | null {
  const today = toLocalDateString(now);
  const sorted = [...c.milestones].sort((a, b) => a.order - b.order);
  return sorted.find((m) => !m.done && m.date >= today) ?? null;
}

export function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.min(1, Math.max(0, x));
}

export interface Progress {
  done: number;
  total: number;
  /** null when there are no milestones (bar hidden). */
  milestoneRatio: number | null;
  timeRatio: number;
}

/** Dual progress (FR-12): milestones done/total and time elapsed start → deadline, both clamped. */
export function getProgress(now: Date, c: PlanLike): Progress {
  const total = c.milestones.length;
  const done = c.milestones.filter((m) => m.done).length;
  const start = c.startDate ? parseLocalDate(c.startDate).getTime() : now.getTime();
  const end = deadlineInstant(c).getTime();
  const timeRatio = end <= start ? 1 : clamp01((now.getTime() - start) / (end - start));
  return { done, total, milestoneRatio: total === 0 ? null : clamp01(done / total), timeRatio };
}
