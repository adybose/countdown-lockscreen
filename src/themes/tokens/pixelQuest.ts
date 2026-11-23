import type { ThemeTokens } from '@/src/types/theme';

/** DESIGN §6.2 — Pixel Quest. */
export const pixelQuest: ThemeTokens = {
  id: 'pixel-quest',
  name: 'Pixel Quest',
  colors: {
    background: '#0B0A1F',
    backgroundAlt: '#1A1240',
    surface: '#12102BE6',
    surfaceBorder: '#39FF88',
    textPrimary: '#F5F3FF',
    textSecondary: '#B8B3E0',
    textMuted: '#8A84C2',
    accent: '#39FF88',
    accentAlt: '#FFD23F',
    success: '#39FF88',
    danger: '#FF4F6D',
    trail: '#39FF88',
    trailGlow: '#39FF8840',
    // node = fill (border surfaceBorder); nodeActive = fill (border #FFF3B0); nodeDone = fill
    node: '#12102B',
    nodeActive: '#FFD23F',
    nodeDone: '#39FF88',
    badgeBg: '#FFD23F',
    badgeText: '#0B0A1F',
  },
  fonts: { display: 'PressStart2P_400Regular', body: 'VT323_400Regular' },
  sizes: { title: 4.2, hero: 17, heroUnit: 3.2, badge: 2.6, tLabel: 2.8, rowTitle: 4.6, motivation: 4.6, caption: 3.6 },
  radii: { card: 0, badge: 0, node: 0, checkbox: 0 },
  spacing: { xxs: 2, xs: 2, sm: 2, md: 4, lg: 4, xl: 6, xxl: 8 },
  background: {
    kind: 'pixel-bands',
    bands: 8,
    stars: 40,
    hillColor: '#140F33',
  },
  pathStyle: 'pixel-trail',
  maxRows: { portrait: 4, landscape: 6 },
  icon: { strokeWidth: 2.5, size: 5, color: 'accentAlt', container: 'none' },
  contrastPairs: [
    { fg: 'textPrimary', bg: 'background', min: 4.5 },
    { fg: 'textSecondary', bg: 'background', min: 4.5 },
    { fg: 'textMuted', bg: 'background', min: 4.5 },
    { fg: 'badgeText', bg: 'badgeBg', min: 4.5 },
  ],
};
