import type { FontKey } from './fonts';

/** App-chrome tokens (DESIGN §6.5). Neutral so any wallpaper theme looks good inside it. */
export interface ChromeColors {
  bg: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  danger: string;
  success: string;
}

export const CHROME: Record<'light' | 'dark', ChromeColors> = {
  light: {
    bg: '#F7F7FA',
    card: '#FFFFFF',
    border: '#E3E4EA',
    text: '#14151A',
    textSecondary: '#5B5F6B',
    danger: '#C62828',
    success: '#1E8E5A',
  },
  dark: {
    bg: '#0E0F13',
    card: '#181A20',
    border: '#2A2D36',
    text: '#F2F3F7',
    textSecondary: '#A3A7B3',
    danger: '#FF6B6B',
    success: '#4ADE80',
  },
};

export const CHROME_FONTS: { regular: FontKey; semibold: FontKey; extrabold: FontKey } = {
  regular: 'Inter_400Regular',
  semibold: 'Inter_600SemiBold',
  extrabold: 'Inter_800ExtraBold',
};

export const CHROME_RADII = { card: 16, button: 12, chip: 999 } as const;
export const CHROME_SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
