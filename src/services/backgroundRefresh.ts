/**
 * Android background refresh — STRETCH, notify-only (ARCHITECTURE §9.4, FR-25).
 *
 * Disabled by default. `expo-background-task` is deliberately NOT installed: per the task rules, no new
 * dependency is added unless this flag is turned on. To enable:
 *   1. `npx expo install expo-background-task expo-task-manager`
 *   2. set FEATURE_BG_REFRESH = true and fill in `registerBackgroundRefresh` (sketch below)
 *   3. rebuild the APK (EAS) — background tasks don't run in Expo Go.
 *
 * Why notify-only: background tasks run headless JS with no view hierarchy, so react-native-view-shot
 * can't render <Wallpaper> there (ADR-003). Real auto-refresh would need a native Kotlin Canvas
 * renderer or Skia offscreen rendering.
 *
 * Platform limits: minimum periodic interval 15 min; Doze / App Standby buckets defer work (the
 * "rare" bucket may run ~once a day or less); OEM battery managers can kill tasks; Android 14+ denies
 * SCHEDULE_EXACT_ALARM by default; Android 15 tightens background starts — so no exact alarms and
 * no foreground service.
 *
 * Sketch (when enabled):
 *   TaskManager.defineTask(TASK, async () => {
 *     const s = useAppStore.getState();
 *     if (shouldPostRefreshReminder(s, new Date())) await Notifications.scheduleNotificationAsync({
 *       content: { title: S.notifications.dailyTitle, body: S.notifications.dailyBody(s.countdown.title), data: { url: '/studio' } },
 *       trigger: null,
 *     });
 *     return BackgroundTask.BackgroundTaskResult.Success;
 *   });
 *   BackgroundTask.registerTaskAsync(TASK, { minimumInterval: 24 * 60 });
 */
import type { Countdown, ISODateTime } from '@/src/types/domain';
import { getCountdownStatus, toLocalDateString } from '@/src/utils/dates';

export const FEATURE_BG_REFRESH = false;
export const BG_REFRESH_TASK = 'countdown-lockscreen:bg-refresh';

/** Post a reminder only for an active countdown whose last render was on an earlier calendar day. */
export function shouldPostRefreshReminder(
  state: { countdown: Countdown | null; meta: { lastRenderedAt: ISODateTime | null } },
  now: Date,
): boolean {
  const c = state.countdown;
  if (!c) return false;
  const status = getCountdownStatus(now, c);
  if (status === 'overdue' || status === 'completed') return false;
  const last = state.meta.lastRenderedAt;
  if (!last) return true;
  return toLocalDateString(new Date(last)) < toLocalDateString(now);
}

/** No-op while the flag is off. Returns whether a task was registered. */
export async function registerBackgroundRefresh(): Promise<boolean> {
  if (!FEATURE_BG_REFRESH) return false;
  return false; // implementation intentionally omitted until the dependency is installed (see header)
}
