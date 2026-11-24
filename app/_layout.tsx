import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { NotificationBridge } from '@/src/components/system/NotificationBridge';
import { ToastHost } from '@/src/components/ui';
import { useAppReady } from '@/src/hooks/useAppReady';
import { useChrome } from '@/src/hooks/useChrome';
import { useNotificationSync } from '@/src/hooks/useNotificationSync';
import { configureNotifications } from '@/src/services/notifications';

SplashScreen.preventAutoHideAsync().catch(() => {
  // already hidden / unsupported (web static render)
});

export default function RootLayout() {
  const { ready } = useAppReady();
  const { c, scheme } = useChrome();

  useEffect(() => {
    void configureNotifications();
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  useNotificationSync(ready);

  if (!ready) return null;
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="ios-guide" options={{ presentation: 'modal' }} />
      </Stack>
      <NotificationBridge />
      <ToastHost />
    </View>
  );
}
