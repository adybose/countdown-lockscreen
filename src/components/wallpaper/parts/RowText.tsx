import { View } from 'react-native';
import { S } from '@/src/constants/strings';
import type { ThemeTokens } from '@/src/types/theme';
import type { WallpaperRow } from '@/src/types/wallpaper';
import { WText } from './WText';

/** `T-30 · Dec 2` line + title line (+ NEXT micro-badge) shared by all themes. */
export function RowText({
  row,
  tokens,
  u,
  labelColor,
  titleColor,
  labelFont,
  labelSize,
  titleLines = 1,
}: {
  row: Pick<WallpaperRow, 'tLabel' | 'dateLabel' | 'title' | 'state'>;
  tokens: ThemeTokens;
  u: number;
  labelColor?: string;
  titleColor?: string;
  labelFont?: ThemeTokens['fonts']['display'];
  labelSize?: number;
  titleLines?: number;
}) {
  const { colors, fonts, sizes } = tokens;
  const done = row.state === 'done';
  const missed = row.state === 'missed';
  const lColor = labelColor ?? (row.state === 'next' ? colors.nodeActive : colors.accentAlt);
  const tColor = titleColor ?? (missed ? colors.textMuted : colors.textPrimary);
  const lSize = labelSize ?? sizes.tLabel * u;
  return (
    <View style={{ flexShrink: 1, gap: 0.3 * u }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 1.5 * u }}>
        <WText font={labelFont ?? fonts.display} size={lSize} color={lColor} numberOfLines={1}>
          {row.tLabel} · {row.dateLabel}
        </WText>
        {row.state === 'next' ? (
          <View style={{ backgroundColor: colors.badgeBg, borderRadius: 0.6 * u, paddingHorizontal: 1 * u, paddingVertical: 0.1 * u }}>
            <WText font={fonts.bodyStrong ?? fonts.body} size={Math.max(2.6, sizes.caption * 0.8) * u} color={colors.badgeText}>
              {S.wallpaper.next}
            </WText>
          </View>
        ) : null}
      </View>
      <WText
        font={fonts.bodyStrong ?? fonts.body}
        size={sizes.rowTitle * u}
        color={tColor}
        numberOfLines={titleLines}
        style={done ? { textDecorationLine: 'line-through' } : undefined}
      >
        {row.title}
      </WText>
    </View>
  );
}
