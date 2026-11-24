import { useCallback, useRef, useState, type ComponentRef } from 'react';
import type { View } from 'react-native';
import { captureWallpaper, type CaptureResult } from '@/src/services/capture';
import type { CanvasSize } from '@/src/types/wallpaper';

export interface CaptureJob {
  id: number;
  /** Frozen render time shared by the whole export. */
  now: string;
}

let jobSeq = 0;

/**
 * Mount CaptureHost → wait for layout + 2 frames (SVG paint) → capture → unmount (ARCHITECTURE §7).
 * The Studio renders <CaptureHost> with `job`, `hostRef` and `onHostLayout`.
 */
export function useWallpaperCapture(px: { w: number; h: number }, layout: CanvasSize) {
  const [job, setJob] = useState<CaptureJob | null>(null);
  const hostRef = useRef<ComponentRef<typeof View>>(null);
  const pending = useRef<{ id: number; resolve: (r: CaptureResult) => void; reject: (e: unknown) => void } | null>(null);
  const started = useRef<number | null>(null);

  const capture = useCallback((now: Date): Promise<CaptureResult> => {
    return new Promise((resolve, reject) => {
      if (pending.current) {
        reject(new Error('Capture already in progress'));
        return;
      }
      const id = ++jobSeq;
      pending.current = { id, resolve, reject };
      setJob({ id, now: now.toISOString() });
    });
  }, []);

  const onHostLayout = useCallback(() => {
    const p = pending.current;
    if (!p || started.current === p.id) return;
    started.current = p.id;
    requestAnimationFrame(() =>
      requestAnimationFrame(async () => {
        try {
          p.resolve(await captureWallpaper(hostRef, px, layout));
        } catch (e) {
          p.reject(e);
        } finally {
          pending.current = null;
          setJob(null);
        }
      }),
    );
  }, [px, layout]);

  return { job, hostRef, onHostLayout, capture, busy: job !== null };
}
