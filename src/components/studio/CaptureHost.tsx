import type { ComponentRef, RefObject } from 'react';
import { View } from 'react-native';
import { Wallpaper } from '@/src/components/wallpaper';
import type { Countdown } from '@/src/types/domain';
import type { ThemeId } from '@/src/types/theme';
import type { CanvasSize, WallpaperRenderOptions } from '@/src/types/wallpaper';

/**
 * Off-screen, full-size render used only while exporting. It contains the bare <Wallpaper> —
 * the safe-zone overlay is never inside this ref (FR-17).
 */
export function CaptureHost({
  hostRef,
  onLayout,
  countdown,
  theme,
  layout,
  options,
}: {
  hostRef: RefObject<ComponentRef<typeof View> | null>;
  onLayout: () => void;
  countdown: Countdown;
  theme: ThemeId;
  layout: CanvasSize;
  options: WallpaperRenderOptions;
}) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: -layout.width - 100, top: 0 }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <View ref={hostRef} collapsable={false} onLayout={onLayout} style={{ width: layout.width, height: layout.height }}>
        <Wallpaper countdown={countdown} theme={theme} size={layout} options={options} />
      </View>
    </View>
  );
}
