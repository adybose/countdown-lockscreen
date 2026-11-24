import { StyleSheet, View } from 'react-native';
import type { ThemeTokens } from '@/src/types/theme';
import type { WallpaperModel } from '@/src/types/wallpaper';
import type { ThemeModule } from '../types';
import { WText } from './WText';

export function Header({
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
  const { colors, fonts, sizes, radii } = tokens;
  const Prefix = theme.TitlePrefix;
  const Deco = theme.HeaderDecoration;
  const titleSize = sizes.title * u;
  return (
    <View style={[styles.wrap, { width, height, gap: u * 1.6 }]}>
      {Deco ? <Deco tokens={tokens} u={u} width={width} height={height} /> : null}
      <View style={[styles.titleRow, { gap: u * 1.5 }]}>
        {Prefix ? <Prefix tokens={tokens} u={u} /> : null}
        <WText
          font={fonts.display}
          size={titleSize}
          color={colors.textPrimary}
          lineHeight={titleSize * 1.18}
          numberOfLines={2}
          ellipsizeMode="tail"
          style={styles.title}
        >
          {model.header.emoji ? `${model.header.emoji} ` : ''}
          {model.header.title}
        </WText>
      </View>
      <View
        style={{
          alignSelf: 'flex-start',
          backgroundColor: colors.badgeBg,
          borderRadius: Math.min(radii.badge, 50) * u,
          paddingHorizontal: u * 2.4,
          paddingVertical: u * 0.8,
        }}
      >
        <WText font={tokens.fonts.bodyStrong ?? fonts.body} size={sizes.badge * u} color={colors.badgeText} numberOfLines={1}>
          📅 {model.header.deadlineLabel}
        </WText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: 'flex-end' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { flexShrink: 1 },
});
