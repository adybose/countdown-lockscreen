import { useColorScheme } from 'react-native';
import { CHROME, CHROME_FONTS, type ChromeColors } from '@/src/themes/chrome';
import { THEMES } from '@/src/themes';
import { useAppStore } from '@/src/store';
import { contrastRatio } from '@/src/utils/contrast';

export interface Chrome {
  scheme: 'light' | 'dark';
  c: ChromeColors;
  /** Active theme accent, or its badgeBg when the accent fails contrast on the chrome bg (DESIGN §6.5). */
  accent: string;
  /** Text/icon color to place on top of `accent`. */
  onAccent: string;
  fonts: typeof CHROME_FONTS;
}

function onColor(bg: string): string {
  return contrastRatio('#FFFFFF', bg) >= contrastRatio('#14151A', bg) ? '#FFFFFF' : '#14151A';
}

export function pickAccent(themeAccent: string, themeBadgeBg: string, chromeBg: string): string {
  const solid = themeAccent.slice(0, 7);
  if (contrastRatio(solid, chromeBg) >= 3) return solid;
  return themeBadgeBg.slice(0, 7);
}

export function useChrome(): Chrome {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const themeId = useAppStore((s) => s.draft?.themeId ?? s.countdown?.themeId ?? 'glass-terminal');
  const c = CHROME[scheme];
  const t = THEMES[themeId];
  const accent = pickAccent(t.colors.accent, t.colors.badgeBg, c.bg);
  return { scheme, c, accent, onAccent: onColor(accent), fonts: CHROME_FONTS };
}
