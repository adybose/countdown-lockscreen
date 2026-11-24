import { memo, useId, useMemo } from 'react';
import { View } from 'react-native';
import { THEMES } from '@/src/themes';
import type { WallpaperProps } from '@/src/types/wallpaper';
import { unitFor, zoneRects } from '@/src/utils/canvas';
import { buildWallpaperModel } from '@/src/utils/wallpaperModel';
import { svgId } from './layout';
import { Header } from './parts/Header';
import { Hero } from './parts/Hero';
import { Motivation } from './parts/Motivation';
import { ProgressStrip } from './parts/ProgressStrip';
import { getThemeModule } from './themes/registry';
import { WallpaperFrame } from './WallpaperFrame';

/**
 * The pure, deterministic wallpaper (ARCHITECTURE §6): same props → same pixels.
 * No store, no clock (`options.now` only), no unseeded randomness.
 */
function WallpaperImpl({ countdown, theme, size, options }: WallpaperProps) {
  const tokens = THEMES[theme];
  const mod = getThemeModule(theme);
  const u = unitFor(size);
  const idPrefix = svgId(useId());
  const model = useMemo(() => buildWallpaperModel(countdown, options, tokens), [countdown, options, tokens]);
  const zones = zoneRects(size, options.safeZone, options.orientation);
  const { Background, Path } = mod;

  return (
    <View
      collapsable={false}
      style={{ width: size.width, height: size.height, backgroundColor: tokens.colors.background, overflow: 'hidden' }}
    >
      <Background tokens={tokens} size={size} u={u} seed={model.seed} safeZone={options.safeZone} zones={zones} model={model} idPrefix={idPrefix} />
      <WallpaperFrame
        size={size}
        orientation={options.orientation}
        safeZone={options.safeZone}
        noMilestones={model.rows.length === 0 && model.overflowCount === 0}
        sections={{
          header: (w, h) => <Header model={model} tokens={tokens} u={u} width={w} height={h} theme={mod} />,
          hero: (w, h) => <Hero model={model} tokens={tokens} u={u} width={w} height={h} theme={mod} />,
          progress: model.progress ? (w, h) => <ProgressStrip model={model} tokens={tokens} u={u} width={w} height={h} /> : null,
          path: (w, h) => (
            <Path model={model} tokens={tokens} u={u} width={w} height={h} orientation={options.orientation} seed={model.seed} idPrefix={idPrefix} />
          ),
          motivation: model.motivation ? (w, h) => <Motivation model={model} tokens={tokens} u={u} width={w} height={h} /> : null,
        }}
      />
    </View>
  );
}

export const Wallpaper = memo(WallpaperImpl);
