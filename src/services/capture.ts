import type { ComponentRef, RefObject } from 'react';
import { Platform, type View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import type { CanvasSize } from '@/src/types/wallpaper';

export interface CaptureResult {
  uri: string;
  px: { w: number; h: number };
  ms: number;
}

/**
 * Snapshots the CaptureHost view to a PNG at the exact target size (ARCHITECTURE §7, FR-18).
 * Android takes output size in pixels; iOS multiplies by the screen scale, so it gets layout points.
 */
export async function captureWallpaper(
  target: RefObject<ComponentRef<typeof View> | null>,
  px: { w: number; h: number },
  layout: CanvasSize,
): Promise<CaptureResult> {
  const started = Date.now();
  const size = Platform.OS === 'ios' ? { width: layout.width, height: layout.height } : { width: px.w, height: px.h };
  // RN 0.88 host refs are ReactNativeElement instances; view-shot resolves them via findNodeHandle.
  const node = target.current as unknown as Parameters<typeof captureRef>[0];
  if (!node) throw new Error('Capture host is not mounted');
  const uri = await captureRef(node, { format: 'png', quality: 1, result: 'tmpfile', ...size });
  const ms = Date.now() - started;
  if (__DEV__) console.log(`[capture] ${px.w}×${px.h} in ${ms} ms`); // NFR-03 timing
  return { uri, px, ms };
}
