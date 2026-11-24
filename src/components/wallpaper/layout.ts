import type { WallpaperModel, WallpaperRow } from '@/src/types/wallpaper';

export interface PathSlot {
  kind: 'row' | 'more' | 'banner' | 'finish';
  y: number;
  h: number;
  row?: WallpaperRow;
  index: number;
}

/**
 * Vertical slots for the path zone: rows, then "+N more", then the all-done banner, then the finish row.
 * Row height is the free space divided evenly, capped at `maxRowH` (top-aligned).
 */
export function pathSlots(
  model: WallpaperModel,
  height: number,
  opts: { maxRowH: number; chipH: number; bannerH: number; finishScale?: number },
): PathSlot[] {
  const n = model.rows.length;
  const finishScale = opts.finishScale ?? 1;
  const extra = (model.overflowCount > 0 ? opts.chipH : 0) + (model.banner ? opts.bannerH : 0);
  const rowH = Math.max(1, Math.min(opts.maxRowH, (height - extra) / (n + finishScale)));
  const slots: PathSlot[] = [];
  let y = 0;
  model.rows.forEach((row, index) => {
    slots.push({ kind: 'row', y, h: rowH, row, index });
    y += rowH;
  });
  if (model.overflowCount > 0) {
    slots.push({ kind: 'more', y, h: opts.chipH, index: n });
    y += opts.chipH;
  }
  if (model.banner) {
    slots.push({ kind: 'banner', y, h: opts.bannerH, index: n + 1 });
    y += opts.bannerH;
  }
  slots.push({ kind: 'finish', y, h: rowH * finishScale, index: n + 2 });
  return slots;
}

/** SVG-safe id prefix from React's useId(). */
export function svgId(raw: string): string {
  return `w${raw.replace(/[^a-zA-Z0-9_-]/g, '')}`;
}
