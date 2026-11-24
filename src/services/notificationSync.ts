import type { Countdown, ReminderSettings } from '@/src/types/domain';
import { toLocalDateString } from '@/src/utils/dates';

interface SyncSlice {
  countdown: Countdown | null;
  reminders: ReminderSettings;
}

interface StoreLike<S extends SyncSlice> {
  getState(): S;
  subscribe(listener: (state: S, prev: S) => void): () => void;
}

/**
 * Calls `sync` (debounced) whenever `countdown` or `reminders` change by reference (shallow compare).
 * Returns an unsubscribe function.
 */
export function subscribeNotificationSync<S extends SyncSlice>(
  store: StoreLike<S>,
  sync: (state: S) => void,
  debounceMs = 500,
): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const unsub = store.subscribe((state, prev) => {
    if (state.countdown === prev.countdown && state.reminders === prev.reminders) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      sync(store.getState());
    }, debounceMs);
  });
  return () => {
    if (timer) clearTimeout(timer);
    unsub();
  };
}

/** Foreground sync at most once per calendar day (catches the overdue transition). */
export function shouldDailySync(lastSyncedAt: string | null, now: Date): boolean {
  if (!lastSyncedAt) return true;
  const last = new Date(lastSyncedAt);
  if (Number.isNaN(last.getTime())) return true;
  return toLocalDateString(last) !== toLocalDateString(now);
}
