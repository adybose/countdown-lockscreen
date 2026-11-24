import type { ReactNode } from 'react';
import { View } from 'react-native';
import type { WallpaperProps } from '@/src/types/wallpaper';
import { Wallpaper } from './Wallpaper';

export interface WallpaperPreviewProps extends WallpaperProps {
  /** Width of the box to fit into; height follows the canvas aspect ratio. */
  boxWidth: number;
  /** Rendered above the scaled wallpaper (e.g. SafeZoneOverlay). Never part of a capture. */
  overlay?: ReactNode;
  accessibilityLabel?: string;
  borderRadius?: number;
}

/** Scales a full-size <Wallpaper> into a box with `transform: scale` (ARCHITECTURE §7). */
export function WallpaperPreview({ boxWidth, overlay, accessibilityLabel, borderRadius = 0, ...props }: WallpaperPreviewProps) {
  const { width, height } = props.size;
  const scale = boxWidth / width;
  const boxHeight = height * scale;
  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={{ width: boxWidth, height: boxHeight, overflow: 'hidden', borderRadius }}
    >
      <View
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={{
          position: 'absolute',
          width,
          height,
          left: (boxWidth - width) / 2,
          top: (boxHeight - height) / 2,
          transform: [{ scale }],
        }}
      >
        <Wallpaper {...props} />
      </View>
      {overlay}
    </View>
  );
}
