import { StyleSheet, View } from 'react-native';
import type { ThemeTokens } from '@/src/types/theme';
import type { WallpaperModel } from '@/src/types/wallpaper';
import type { ThemeModule } from '../types';
import { WText } from './WText';

/** Fit the hero word into the zone: width-limited for long words, height-limited for short zones. */
export function heroFontSize(text: string, opts: { base: number; width: number; height: number; unitLine: number; charWidth: number }): number {
  const byWidth = opts.width / Math.max(1, text.length * opts.charWidth);
  const byHeight = (opts.height - opts.unitLine) / 1.02;
  return Math.max(1, Math.min(opts.base, byWidth, byHeight));
}

export function Hero({
  model,
  tokens,
  u,
  width,
  height,
  theme,
}: {
  model: WallpaperModel;
  tokens: ThemeTokens;
  u: number;
  width: number;
  height: number;
  theme: ThemeModule;
}) {
  const { colors, fonts, sizes } = tokens;
  const unitSize = sizes.heroUnit * u;
  const unitLine = unitSize * 1.3;
  const size = heroFontSize(model.hero.primary, {
    base: sizes.hero * u,
    width,
    height,
    unitLine,
    charWidth: theme.displayCharWidth,
  });
  const color =
    model.hero.tone === 'danger' ? colors.danger : model.hero.tone === 'success' ? colors.success : colors[theme.heroColor] ?? colors.accent;
  return (
    <View style={[styles.wrap, { width, height }]}>
      <WText font={fonts.display} size={size} color={color} lineHeight={size * 1.02} numberOfLines={1} style={styles.center}>
        {model.hero.primary}
      </WText>
      <WText
        font={fonts.bodyStrong ?? fonts.body}
        size={unitSize}
        color={model.hero.tone === 'normal' ? colors.textSecondary : color}
        lineHeight={unitLine}
        numberOfLines={1}
        style={[styles.center, { letterSpacing: theme.heroUnitTracking * u }]}
      >
        {model.hero.secondary}
      </WText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
});
