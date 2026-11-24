import { toPng } from 'html-to-image';
import type { ComponentRef, RefObject } from 'react';
import type { View } from 'react-native';
import type { CanvasSize } from '@/src/types/wallpaper';
import type { CaptureResult } from './capture';

export type { CaptureResult };

/**
 * Web capture (ARCHITECTURE §7, ADR-008): react-native-web renders the host as a DOM node, which
 * html-to-image serializes (SVG + embedded fonts) and rasterizes at the exact target pixels.
 * Returns a PNG data URI.
 */
export async function captureWallpaper(
  target: RefObject<ComponentRef<typeof View> | null>,
  px: { w: number; h: number },
  layout: CanvasSize,
): Promise<CaptureResult> {
  const started = Date.now();
  const node = target.current as unknown as HTMLElement | null;
  if (!node) throw new Error('Capture host is not mounted');
  const uri = await toPng(node, {
    width: layout.width,
    height: layout.height,
    canvasWidth: px.w,
    canvasHeight: px.h,
    pixelRatio: 1,
    cacheBust: true,
  });
  const ms = Date.now() - started;
  if (__DEV__) console.log(`[capture:web] ${px.w}×${px.h} in ${ms} ms`);
  return { uri, px, ms };
}
