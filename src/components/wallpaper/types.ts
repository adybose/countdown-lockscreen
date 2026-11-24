import type { ReactElement } from 'react';
import type { ThemeColors, ThemeTokens } from '@/src/types/theme';
import type { CanvasSize, Orientation, SafeZoneSpec, WallpaperModel } from '@/src/types/wallpaper';
import type { ZoneRects } from '@/src/utils/canvas';

export interface ThemeBackgroundProps {
  tokens: ThemeTokens;
  size: CanvasSize;
  u: number;
  seed: number;
  safeZone: SafeZoneSpec;
  zones: ZoneRects;
  model: WallpaperModel;
  idPrefix: string;
}

export interface ThemePathProps {
  model: WallpaperModel;
  tokens: ThemeTokens;
  u: number;
  /** Size of the path rect (positioned by the frame). */
  width: number;
  height: number;
  orientation: Orientation;
  seed: number;
  idPrefix: string;
}

export interface ThemeModule {
  Background: (p: ThemeBackgroundProps) => ReactElement | null;
  Path: (p: ThemePathProps) => ReactElement | null;
  /** Optional glyph shown before the goal title (e.g. Glass Terminal's `>_`). */
  TitlePrefix?: (p: { tokens: ThemeTokens; u: number }) => ReactElement | null;
  /** Optional decoration over the header block (e.g. washi tape). */
  HeaderDecoration?: (p: { tokens: ThemeTokens; u: number; width: number; height: number }) => ReactElement | null;
  /** Color key for the hero number in the normal tone. */
  heroColor: keyof ThemeColors;
  /** Approximate glyph width of the display font, in em (for fitting long hero words). */
  displayCharWidth: number;
  /** Letter spacing for the hero unit line, in u. */
  heroUnitTracking: number;
}
