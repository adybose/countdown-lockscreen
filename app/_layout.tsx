import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { ToastHost } from '@/src/components/ui';
import { useAppReady } from '@/src/hooks/useAppReady';
import { useChrome } from '@/src/hooks/useChrome';

SplashScreen.preventAutoHideAsync().catch(() => {
  // already hidden / unsupported (web static render)
});

export default function RootLayout() {
  const { ready } = useAppReady();
  const { c, scheme } = useChrome();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />
      <ToastHost />
    </View>
  );
}
