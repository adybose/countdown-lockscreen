import type { Countdown, CountdownDraft, CountdownStatus, IconId, ISODateTime } from './domain';
import type { ThemeId } from './theme';

/** Layout units (dp). */
export interface CanvasSize {
  width: number;
  height: number;
}
export type Orientation = 'portrait' | 'landscape';
export interface SafeZoneSpec {
  topPct: number;
  bottomPct: number;
  sidePct: number;
}
export const PORTRAIT_SAFE: SafeZoneSpec = { topPct: 30, bottomPct: 12, sidePct: 7 };
export const LANDSCAPE_SAFE: SafeZoneSpec = { topPct: 8, bottomPct: 12, sidePct: 4 };

export type SizePresetId =
  | 'device'
  | 'android-fhd'
  | 'android-qhd'
  | 'iphone-pro'
  | 'iphone-pro-max'
  | 'desktop-16x10'
  | 'desktop-mbp';

export interface SizePreset {
  id: SizePresetId;
  label: string;
  /** null for 'device' (resolved at runtime). */
  px: { w: number; h: number } | null;
  orientation: Orientation;
  webOnly: boolean;
}

export interface WallpaperRenderOptions {
  /** The ONLY time source for the render (determinism). */
  now: ISODateTime;
  showMotivation: boolean;
  showCompleted: boolean;
  showProgress: boolean;
  orientation: Orientation;
  safeZone: SafeZoneSpec;
  /** Override the theme default. */
  maxRows?: number;
}

export interface WallpaperProps {
  countdown: Countdown | CountdownDraft;
  theme: ThemeId;
  size: CanvasSize;
  options: WallpaperRenderOptions;
}

export interface WallpaperRow {
  id: string;
  tLabel: string;
  dateLabel: string;
  title: string;
  icon: IconId;
  state: 'done' | 'next' | 'pending' | 'missed';
}

export interface WallpaperModel {
  status: CountdownStatus;
  header: { title: string; emoji: string | null; deadlineLabel: string };
  hero: { primary: string; secondary: string; tone: 'normal' | 'danger' | 'success' };
  progress: { done: number; total: number; ratio: number } | null;
  rows: WallpaperRow[];
  overflowCount: number;
  finish: { tLabel: 'T-0'; dateLabel: string; label: string };
  motivation: string | null;
  banner: string | null;
  seed: number;
}
