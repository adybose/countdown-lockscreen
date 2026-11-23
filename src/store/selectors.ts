import type { Countdown, CountdownDraft, Milestone } from '@/src/types/domain';
import type { Store } from './index';

export const selectActiveCountdown = (s: Store): Countdown | null => s.countdown;
export const selectDraft = (s: Store): CountdownDraft | null => s.draft;
export const selectReminders = (s: Store) => s.reminders;
export const selectPreferences = (s: Store) => s.preferences;
export const selectHasHydrated = (s: Store): boolean => s.meta.hasHydrated;
export const selectStorageError = (s: Store): boolean => s.meta.storageError;

/** Milestones in display (user) order. */
export function sortMilestones(ms: readonly Milestone[]): Milestone[] {
  return [...ms].sort((a, b) => a.order - b.order);
}

export const selectSortedMilestones = (s: Store): Milestone[] =>
  s.countdown ? sortMilestones(s.countdown.milestones) : [];
