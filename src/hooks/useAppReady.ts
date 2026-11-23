import { useFonts } from 'expo-font';
import { FONT_MAP } from '@/src/themes/fonts';
import { useAppStore } from '@/src/store';

export interface AppReady {
  ready: boolean;
  fontsLoaded: boolean;
  fontError: Error | null;
}

/** Fonts + store hydration (NFR-09). A font failure still lets the app start with system fonts. */
export function useAppReady(): AppReady {
  const [fontsLoaded, fontError] = useFonts(FONT_MAP);
  const hasHydrated = useAppStore((s) => s.meta.hasHydrated);
  return {
    ready: hasHydrated && (fontsLoaded || fontError != null),
    fontsLoaded,
    fontError: fontError ?? null,
  };
}
