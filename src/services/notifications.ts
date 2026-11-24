import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { S } from '@/src/constants/strings';
import type { Countdown, NotificationPermission, ReminderSettings } from '@/src/types/domain';
import { planNotifications, type PlannedNotification } from '@/src/utils/notificationPlan';

export const CHANNEL_ID = 'reminders';

/** Root-layout setup (ARCHITECTURE §9.1). Safe to call more than once; no-op on web. */
export async function configureNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: S.notifications.channelName,
        // eslint-disable-next-line import/namespace -- re-exported via `export *`; tsc resolves it
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  } catch {
    // never crash on a missing capability (NFR-10)
  }
}

function toPermission(p: { granted: boolean; status: string }): NotificationPermission {
  if (p.granted) return 'granted';
  return p.status === 'denied' ? 'denied' : 'undetermined';
}

export async function getPermission(): Promise<NotificationPermission> {
  if (Platform.OS === 'web') return 'denied';
  try {
    return toPermission(await Notifications.getPermissionsAsync());
  } catch {
    return 'undetermined';
  }
}

/** Asks only when not yet decided (onboarding Finish / Settings toggle). */
export async function ensurePermission(): Promise<NotificationPermission> {
  if (Platform.OS === 'web') return 'denied';
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return 'granted';
    if (current.status === 'denied' && !current.canAskAgain) return 'denied';
    return toPermission(await Notifications.requestPermissionsAsync());
  } catch {
    return 'undetermined';
  }
}

function toTrigger(n: PlannedNotification): Notifications.NotificationTriggerInput {
  if (n.trigger.type === 'daily') {
    return {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: n.trigger.hour,
      minute: n.trigger.minute,
      channelId: CHANNEL_ID,
    };
  }
  return { type: Notifications.SchedulableTriggerInputTypes.DATE, date: n.trigger.at, channelId: CHANNEL_ID };
}

export type SyncResult = { ok: true; scheduled: number } | { ok: false; reason: 'web' | 'permission' | 'error' };

/** Idempotent: cancel everything, then schedule the current plan (ARCHITECTURE §9.3). */
export async function syncNotifications(
  state: { countdown: Countdown | null; reminders: ReminderSettings },
  now: Date,
): Promise<SyncResult> {
  if (Platform.OS === 'web') return { ok: false, reason: 'web' };
  try {
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return { ok: false, reason: 'permission' };
    await Notifications.cancelAllScheduledNotificationsAsync();
    const planned = planNotifications(state, now);
    for (const n of planned) {
      await Notifications.scheduleNotificationAsync({
        identifier: n.id,
        content: { title: n.title, body: n.body, data: n.data },
        trigger: toTrigger(n),
      });
    }
    return { ok: true, scheduled: planned.length };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

/** Routes allowed from a notification tap. */
export function routeFromNotificationData(data: unknown): '/studio' | '/home' | null {
  if (typeof data !== 'object' || data === null) return null;
  const url = (data as { url?: unknown }).url;
  return url === '/studio' || url === '/home' ? url : null;
}
