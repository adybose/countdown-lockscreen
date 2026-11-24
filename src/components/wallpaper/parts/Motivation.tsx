import { StyleSheet, View } from 'react-native';
import type { ThemeTokens } from '@/src/types/theme';
import type { WallpaperModel } from '@/src/types/wallpaper';
import { WText } from './WText';

export function Motivation({ model, tokens, u, width, height }: { model: WallpaperModel; tokens: ThemeTokens; u: number; width: number; height: number }) {
  if (!model.motivation) return null;
  const { colors, fonts, sizes } = tokens;
  const size = sizes.motivation * u;
  return (
    <View style={[styles.wrap, { width, height }]}>
      <WText font={fonts.hand ?? fonts.body} size={size} color={colors.textSecondary} numberOfLines={2} style={styles.text} lineHeight={size * 1.25}>
        “{model.motivation}”
      </WText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  text: { textAlign: 'center' },
});
