import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useAppReady } from '@/src/hooks/useAppReady';

SplashScreen.preventAutoHideAsync().catch(() => {
  // already hidden / unsupported (web static render)
});

export default function RootLayout() {
  const { ready } = useAppReady();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}
