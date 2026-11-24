import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { nowDate } from '@/src/services/clock';
import { getPermission, syncNotifications } from '@/src/services/notifications';
import { shouldDailySync, subscribeNotificationSync } from '@/src/services/notificationSync';
import { useAppStore, type Store } from '@/src/store';

async function runSync(state: Store): Promise<void> {
  const now = nowDate();
  const res = await syncNotifications({ countdown: state.countdown, reminders: state.reminders }, now);
  if (res.ok) useAppStore.getState().setNotificationsSynced(now.toISOString());
}

/** Root-layout side effect: keep scheduled notifications in step with the plan (ARCHITECTURE §5.1, §9.3). */
export function useNotificationSync(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || Platform.OS === 'web') return;
    const unsub = subscribeNotificationSync(useAppStore, (s) => {
      void runSync(s);
    });

    const dailyCheck = async () => {
      const s = useAppStore.getState();
      const perm = await getPermission();
      if (perm !== s.notifications.permission) s.setNotificationPermission(perm);
      if (shouldDailySync(s.notifications.lastSyncedAt, nowDate())) await runSync(useAppStore.getState());
    };
    void dailyCheck();
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') void dailyCheck();
    });
    return () => {
      unsub();
      sub.remove();
    };
  }, [enabled]);
}
