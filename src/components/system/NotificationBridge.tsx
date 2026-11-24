import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { routeFromNotificationData } from '@/src/services/notifications';

/** Routes a notification tap (including a cold start) to its `data.url` (FR-23). */
export function NotificationBridge() {
  const router = useRouter();
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!response) return;
    const key = `${response.notification.request.identifier}:${response.notification.date}`;
    if (handled.current === key) return;
    handled.current = key;
    const url = routeFromNotificationData(response.notification.request.content.data);
    if (url) router.push(url);
  }, [response, router]);

  return null;
}
