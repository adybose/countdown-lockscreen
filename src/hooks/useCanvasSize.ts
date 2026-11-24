import { PixelRatio, useWindowDimensions } from 'react-native';
import type { SizePresetId } from '@/src/types/wallpaper';
import { resolveCanvasSize, type ResolvedCanvas } from '@/src/utils/canvas';

/** Resolves a size preset → { px, layout } for this device (FR-15). */
export function useCanvasSize(presetId: SizePresetId): ResolvedCanvas {
  const { width, height } = useWindowDimensions();
  return resolveCanvasSize(presetId, { width, height }, PixelRatio.get());
}
