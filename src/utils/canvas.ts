import type { CanvasSize, Orientation, SafeZoneSpec, SizePreset, SizePresetId } from '@/src/types/wallpaper';
import { LANDSCAPE_SAFE, PORTRAIT_SAFE } from '@/src/types/wallpaper';

export { LANDSCAPE_SAFE, PORTRAIT_SAFE };

/** DESIGN §8.3 */
export const SIZE_PRESETS: readonly SizePreset[] = [
  { id: 'device', label: 'This device', px: null, orientation: 'portrait', webOnly: false },
  { id: 'android-fhd', label: 'Android FHD+', px: { w: 1080, h: 2400 }, orientation: 'portrait', webOnly: false },
  { id: 'android-qhd', label: 'Android QHD+', px: { w: 1440, h: 3120 }, orientation: 'portrait', webOnly: false },
  { id: 'iphone-pro', label: 'iPhone Pro', px: { w: 1179, h: 2556 }, orientation: 'portrait', webOnly: false },
  { id: 'iphone-pro-max', label: 'iPhone Pro Max', px: { w: 1290, h: 2796 }, orientation: 'portrait', webOnly: false },
  { id: 'desktop-16x10', label: 'Laptop 16:10', px: { w: 2560, h: 1600 }, orientation: 'landscape', webOnly: true },
  { id: 'desktop-mbp', label: 'MacBook Pro 14"', px: { w: 3024, h: 1964 }, orientation: 'landscape', webOnly: true },
];

export function getPreset(id: SizePresetId): SizePreset {
  return SIZE_PRESETS.find((p) => p.id === id) ?? SIZE_PRESETS[0];
}

/** Presets offered on a platform (desktop presets are web-only). */
export function presetsFor(platform: string): SizePreset[] {
  return SIZE_PRESETS.filter((p) => !p.webOnly || platform === 'web');
}

/** u = min(width, height × 0.5) / 100 (DESIGN §3). */
export function unitFor(size: CanvasSize): number {
  return Math.min(size.width, size.height * 0.5) / 100;
}

export function orientationOf(size: CanvasSize): Orientation {
  return size.width > size.height ? 'landscape' : 'portrait';
}

export function safeZoneFor(orientation: Orientation): SafeZoneSpec {
  return orientation === 'landscape' ? LANDSCAPE_SAFE : PORTRAIT_SAFE;
}

export interface ResolvedCanvas {
  presetId: SizePresetId;
  /** Exact output pixels. */
  px: { w: number; h: number };
  /** Layout units (dp) = px / pixelRatio, so a native snapshot is ≈ px. */
  layout: CanvasSize;
  orientation: Orientation;
}

/** `device` = round(screen × pixelRatio) (AC-15). */
export function resolveCanvasSize(
  presetId: SizePresetId,
  screen: { width: number; height: number },
  pixelRatio: number,
): ResolvedCanvas {
  const preset = getPreset(presetId);
  const pr = pixelRatio > 0 ? pixelRatio : 1;
  const px = preset.px ?? {
    w: Math.round(Math.min(screen.width, screen.height) * pr),
    h: Math.round(Math.max(screen.width, screen.height) * pr),
  };
  return {
    presetId: preset.id,
    px,
    layout: { width: px.w / pr, height: px.h / pr },
    orientation: preset.orientation,
  };
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ZoneRects {
  top: Rect;
  content: Rect;
  bottom: Rect;
  /** Landscape only: left (header/hero/progress/motivation) and right (path) columns. */
  left?: Rect;
  right?: Rect;
}

/** Portrait 30/58/12 split with side padding; landscape 8/80/12 with two columns (DESIGN §4). */
export function zoneRects(size: CanvasSize, safe: SafeZoneSpec, orientation: Orientation): ZoneRects {
  const { width: W, height: H } = size;
  const topH = (H * safe.topPct) / 100;
  const bottomH = (H * safe.bottomPct) / 100;
  const side = (W * safe.sidePct) / 100;
  const content: Rect = { x: side, y: topH, width: W - side * 2, height: H - topH - bottomH };
  const rects: ZoneRects = {
    top: { x: 0, y: 0, width: W, height: topH },
    content,
    bottom: { x: 0, y: H - bottomH, width: W, height: bottomH },
  };
  if (orientation === 'landscape') {
    // 42% left column, 4% gap, remaining ~46% right column (see ADR-007).
    const leftW = W * 0.42;
    const gap = W * 0.04;
    rects.left = { x: side, y: topH, width: leftW, height: content.height };
    rects.right = { x: side + leftW + gap, y: topH, width: content.width - leftW - gap, height: content.height };
  }
  return rects;
}

export interface ContentHeights {
  header: number;
  hero: number;
  progress: number;
  path: number;
  motivation: number;
}

/**
 * Portrait content sub-zones as % of the content zone (DESIGN §4.1):
 * header 14 · hero 22 · progress 4 · path 48 · motivation 12. Path absorbs hidden sections;
 * with 0 milestones the hero grows by 20%.
 */
export function contentHeights(
  contentHeight: number,
  opts: { hasProgress: boolean; hasMotivation: boolean; noMilestones: boolean },
): ContentHeights {
  const header = 14;
  let hero = 22;
  const progress = opts.hasProgress ? 4 : 0;
  const motivation = opts.hasMotivation ? 12 : 0;
  if (opts.noMilestones) hero = 22 * 1.2;
  const path = 100 - header - hero - progress - motivation;
  const k = contentHeight / 100;
  return { header: header * k, hero: hero * k, progress: progress * k, path: path * k, motivation: motivation * k };
}
