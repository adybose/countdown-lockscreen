import type { FontKey } from '@/src/themes/fonts';

export type { FontKey };

export type ThemeId = 'glass-terminal' | 'pixel-quest' | 'sticker-planner' | 'field-journal';
export type PathStyle = 'circuit' | 'pixel-trail' | 'ribbon-stack' | 'road';

export interface ThemeColors {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceStrong?: string;
  surfaceBorder: string;
  surfaceHighlight?: string;
  surfaceShadow?: string;
  tape?: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentAlt: string;
  success: string;
  danger: string;
  trail: string;
  trailGlow?: string;
  node: string;
  nodeActive: string;
  nodeDone: string;
  badgeBg: string;
  badgeText: string;
  road?: string;
  roadDash?: string;
  roadEdge?: string;
}

export type BackgroundKind = 'gradient-glow' | 'pixel-bands' | 'grid-paper' | 'parchment';

export interface ThemeTokens {
  id: ThemeId;
  name: string;
  colors: ThemeColors;
  fonts: { display: FontKey; body: FontKey; bodyStrong?: FontKey; hand?: FontKey };
  /** Canvas units u (DESIGN §3). */
  sizes: {
    title: number;
    hero: number;
    heroUnit: number;
    badge: number;
    tLabel: number;
    rowTitle: number;
    motivation: number;
    caption: number;
  };
  /** u; 999 = pill. */
  radii: { card: number; badge: number; node: number; checkbox: number };
  spacing: { xxs: number; xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
  background: { kind: BackgroundKind; [k: string]: unknown };
  pathStyle: PathStyle;
  maxRows: { portrait: number; landscape: number };
  icon: {
    strokeWidth: number;
    size: number;
    color: keyof ThemeColors;
    container: 'none' | 'outline-square' | 'sticker-circle';
  };
  contrastPairs: { fg: keyof ThemeColors; bg: keyof ThemeColors; min: 4.5 | 3 }[];
}
