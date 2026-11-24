import type { ReactNode } from 'react';
import { View } from 'react-native';
import type { CanvasSize, Orientation, SafeZoneSpec } from '@/src/types/wallpaper';
import { contentHeights, zoneRects, type ContentHeights, type Rect } from '@/src/utils/canvas';

export interface FrameSections {
  header: (w: number, h: number) => ReactNode;
  hero: (w: number, h: number) => ReactNode;
  progress: ((w: number, h: number) => ReactNode) | null;
  path: (w: number, h: number) => ReactNode;
  motivation: ((w: number, h: number) => ReactNode) | null;
}

function Box({ rect, children }: { rect: Rect; children: ReactNode }) {
  return (
    <View style={{ position: 'absolute', left: rect.x, top: rect.y, width: rect.width, height: rect.height }}>{children}</View>
  );
}

/** Positions the content zones exactly per DESIGN §4 (portrait 30/58/12, landscape two columns). */
export function WallpaperFrame({
  size,
  orientation,
  safeZone,
  sections,
  noMilestones,
}: {
  size: CanvasSize;
  orientation: Orientation;
  safeZone: SafeZoneSpec;
  sections: FrameSections;
  noMilestones: boolean;
}) {
  const z = zoneRects(size, safeZone, orientation);
  const hasProgress = sections.progress !== null;
  const hasMotivation = sections.motivation !== null;

  if (orientation === 'landscape' && z.left && z.right) {
    // Left column: header 24 · hero 40 · progress 8 · motivation 20 (rest spacing); right: path.
    const L = z.left;
    const k = L.height / 100;
    const header = { x: L.x, y: L.y, width: L.width, height: 24 * k };
    const hero = { x: L.x, y: header.y + header.height, width: L.width, height: 40 * k };
    const progress = { x: L.x, y: hero.y + hero.height, width: L.width, height: 8 * k };
    const motivation = { x: L.x, y: progress.y + progress.height + 4 * k, width: L.width, height: 20 * k };
    return (
      <>
        <Box rect={header}>{sections.header(header.width, header.height)}</Box>
        <Box rect={hero}>{sections.hero(hero.width, hero.height)}</Box>
        {sections.progress ? <Box rect={progress}>{sections.progress(progress.width, progress.height)}</Box> : null}
        {sections.motivation ? <Box rect={motivation}>{sections.motivation(motivation.width, motivation.height)}</Box> : null}
        <Box rect={z.right}>{sections.path(z.right.width, z.right.height)}</Box>
      </>
    );
  }

  const C = z.content;
  const h: ContentHeights = contentHeights(C.height, { hasProgress, hasMotivation, noMilestones });
  const at = (y: number, height: number): Rect => ({ x: C.x, y, width: C.width, height });
  const header = at(C.y, h.header);
  const hero = at(header.y + h.header, h.hero);
  const progress = at(hero.y + h.hero, h.progress);
  const path = at(progress.y + h.progress, h.path);
  const motivation = at(path.y + h.path, h.motivation);

  return (
    <>
      <Box rect={header}>{sections.header(header.width, header.height)}</Box>
      <Box rect={hero}>{sections.hero(hero.width, hero.height)}</Box>
      {sections.progress ? <Box rect={progress}>{sections.progress(progress.width, progress.height)}</Box> : null}
      <Box rect={path}>{sections.path(path.width, path.height)}</Box>
      {sections.motivation ? <Box rect={motivation}>{sections.motivation(motivation.width, motivation.height)}</Box> : null}
    </>
  );
}
