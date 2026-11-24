import { StyleSheet, View } from 'react-native';
import { S } from '@/src/constants/strings';
import type { ThemeTokens } from '@/src/types/theme';
import type { WallpaperModel } from '@/src/types/wallpaper';
import { WText } from './WText';

export function ProgressStrip({ model, tokens, u, width, height }: { model: WallpaperModel; tokens: ThemeTokens; u: number; width: number; height: number }) {
  if (!model.progress) return null;
  const { colors, fonts, sizes, radii } = tokens;
  const barH = 1.2 * u;
  const r = Math.min(radii.card, 0.6) * u;
  return (
    <View style={[styles.row, { width, height, gap: u * 2 }]}>
      <View style={[styles.track, { height: barH, borderRadius: r, backgroundColor: colors.surfaceBorder }]}>
        <View style={{ width: `${Math.round(model.progress.ratio * 100)}%`, height: barH, borderRadius: r, backgroundColor: colors.success }} />
      </View>
      <WText font={fonts.body} size={sizes.caption * u} color={colors.textSecondary} numberOfLines={1}>
        {S.wallpaper.milestonesCount(model.progress.done, model.progress.total)}
      </WText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  track: { flex: 1, overflow: 'hidden' },
});
