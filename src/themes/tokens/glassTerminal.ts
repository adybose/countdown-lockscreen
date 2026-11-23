import type { ThemeTokens } from '@/src/types/theme';

/** DESIGN §6.1 — Glass Terminal. */
export const glassTerminal: ThemeTokens = {
  id: 'glass-terminal',
  name: 'Glass Terminal',
  colors: {
    background: '#05080F',
    backgroundAlt: '#0A1B24',
    surface: '#FFFFFF0F',
    surfaceStrong: '#FFFFFF1A',
    surfaceBorder: '#7FFFD440',
    surfaceHighlight: '#FFFFFF2E',
    textPrimary: '#E6FFF7',
    textSecondary: '#9FC7C0',
    textMuted: '#6B8A86',
    accent: '#3DFFC5',
    accentAlt: '#22D3EE',
    success: '#3DFFC5',
    danger: '#FF5C7A',
    trail: '#22D3EE66',
    // node = stroke (fill is backgroundAlt), nodeActive = stroke, nodeDone = fill
    node: '#22D3EE',
    nodeActive: '#3DFFC5',
    nodeDone: '#3DFFC5',
    badgeBg: '#3DFFC51F',
    badgeText: '#3DFFC5',
  },
  fonts: { display: 'JetBrainsMono_700Bold', body: 'Inter_400Regular', bodyStrong: 'Inter_600SemiBold' },
  sizes: { title: 6.5, hero: 26, heroUnit: 4.4, badge: 3.4, tLabel: 3.8, rowTitle: 3.6, motivation: 3.6, caption: 2.8 },
  radii: { card: 3, badge: 999, node: 0.8, checkbox: 1 },
  spacing: { xxs: 0.5, xs: 1, sm: 2, md: 3, lg: 4.5, xl: 6, xxl: 8 },
  background: {
    kind: 'gradient-glow',
    orbs: [
      { color: '#3DFFC5', opacity: 0.18, cx: 0.85, cy: 0.38, r: 45 },
      { color: '#22D3EE', opacity: 0.14, cx: 0.1, cy: 0.75, r: 55 },
    ],
    gridColor: '#7FFFD4',
    gridOpacity: 0.05,
    gridPitch: 6,
  },
  pathStyle: 'circuit',
  maxRows: { portrait: 5, landscape: 6 },
  icon: { strokeWidth: 1.5, size: 4.2, color: 'accentAlt', container: 'outline-square' },
  contrastPairs: [
    { fg: 'textPrimary', bg: 'backgroundAlt', min: 4.5 },
    { fg: 'textSecondary', bg: 'backgroundAlt', min: 4.5 },
    { fg: 'textMuted', bg: 'backgroundAlt', min: 4.5 },
    { fg: 'accent', bg: 'backgroundAlt', min: 4.5 },
  ],
};
