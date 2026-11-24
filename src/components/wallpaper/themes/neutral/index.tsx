import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { MoreChip } from '../../parts/MoreChip';
import { RowIcon } from '../../parts/RowIcon';
import { RowText } from '../../parts/RowText';
import { WText } from '../../parts/WText';
import { pathSlots } from '../../layout';
import type { ThemeBackgroundProps, ThemeModule, ThemePathProps } from '../../types';

/** Neutral fallback used before (or if) a theme module is unavailable. */
function Background({ tokens, size, idPrefix }: ThemeBackgroundProps) {
  const id = `${idPrefix}-bg`;
  return (
    <Svg width={size.width} height={size.height} style={{ position: 'absolute', left: 0, top: 0 }}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={tokens.colors.background} />
          <Stop offset="1" stopColor={tokens.colors.backgroundAlt} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={size.width} height={size.height} fill={`url(#${id})`} />
    </Svg>
  );
}

function Path({ model, tokens, u, width, height }: ThemePathProps) {
  const { colors, sizes, fonts } = tokens;
  const slots = pathSlots(model, height, { maxRowH: 13 * u, chipH: 6 * u, bannerH: 6 * u });
  return (
    <View style={{ width, height }}>
      {slots.map((s) => {
        const style = { position: 'absolute' as const, left: 0, right: 0, top: s.y, height: s.h, justifyContent: 'center' as const };
        if (s.kind === 'row' && s.row) {
          const r = s.row;
          return (
            <View key={r.id} style={[style, { flexDirection: 'row', alignItems: 'center', gap: 2 * u, opacity: r.state === 'done' ? 0.6 : r.state === 'missed' ? 0.5 : 1 }]}>
              <View style={{ width: 2.4 * u, height: 2.4 * u, borderRadius: 1.2 * u, backgroundColor: r.state === 'done' ? colors.nodeDone : r.state === 'next' ? colors.nodeActive : colors.node }} />
              <View style={{ flex: 1 }}>
                <RowText row={r} tokens={tokens} u={u} />
              </View>
              <RowIcon icon={r.icon} tokens={tokens} u={u} />
            </View>
          );
        }
        if (s.kind === 'more') return <View key="more" style={style}><MoreChip count={model.overflowCount} tokens={tokens} u={u} /></View>;
        if (s.kind === 'banner') {
          return (
            <View key="banner" style={style}>
              <WText font={fonts.body} size={sizes.caption * u} color={colors.success}>
                {model.banner}
              </WText>
            </View>
          );
        }
        return (
          <View key="finish" style={[style, { flexDirection: 'row', alignItems: 'center', gap: 2 * u }]}>
            <View style={{ width: 2.4 * u, height: 2.4 * u, backgroundColor: colors.accent, transform: [{ rotate: '45deg' }] }} />
            <WText font={fonts.display} size={sizes.tLabel * u} color={colors.accent}>
              {model.finish.tLabel} · {model.finish.dateLabel}  {model.finish.label}
            </WText>
          </View>
        );
      })}
    </View>
  );
}

export const neutralTheme: ThemeModule = {
  Background,
  Path,
  heroColor: 'accent',
  displayCharWidth: 0.62,
  heroUnitTracking: 0.3,
};
