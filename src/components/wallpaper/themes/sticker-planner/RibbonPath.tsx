import { View } from 'react-native';
import { Check, Star } from 'lucide-react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { pathSlots } from '../../layout';
import { MoreChip } from '../../parts/MoreChip';
import { RowIcon } from '../../parts/RowIcon';
import { WText } from '../../parts/WText';
import type { ThemePathProps } from '../../types';
import { Mochi, type MochiMood } from './Mochi';

/** Card with rounded left corners and a chevron cut on the right end. */
function ribbonPath(w: number, h: number, r: number, notch: number): string {
  return `M${r},0 H${w} L${w - notch},${h / 2} L${w},${h} H${r} Q0,${h} 0,${h - r} V${r} Q0,0 ${r},0 Z`;
}

/** `ribbon-stack`: rotated ribbon cards, stitch line, sticker pills, Mochi (DESIGN §6.3). */
export function RibbonPath({ model, tokens, u, width, height }: ThemePathProps) {
  const { colors, fonts, sizes, radii } = tokens;
  const slots = pathSlots(model, height, { maxRowH: 14 * u, chipH: 6 * u, bannerH: 6 * u });
  const gutter = 4 * u;
  const cardW = width - gutter;
  const mood: MochiMood = model.status === 'overdue' ? 'sweat' : model.status === 'completed' || model.banner ? 'star' : 'normal';
  const pennant = model.status === 'upcoming' ? model.hero.primary : model.status === 'overdue' ? '!' : '★';
  const finish = slots[slots.length - 1];
  const mochiSize = 20 * u;

  return (
    <View style={{ width, height }}>
      <Svg width={gutter} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Line
          x1={gutter / 2}
          y1={0}
          x2={gutter / 2}
          y2={finish.y + finish.h / 2}
          stroke={colors.trail}
          strokeWidth={0.4 * u}
          strokeDasharray={`${1.2 * u} ${1 * u}`}
        />
      </Svg>

      {slots.map((s, i) => {
        const pos = { position: 'absolute' as const, left: gutter, width: cardW, top: s.y, height: s.h };
        if (s.kind === 'row' && s.row) {
          const r = s.row;
          const h = s.h - 2.4 * u;
          const rotate = i % 2 === 0 ? '-1.2deg' : '0.8deg';
          const done = r.state === 'done';
          const markColor = done ? colors.nodeDone : r.state === 'next' ? colors.nodeActive : 'transparent';
          return (
            <View key={r.id} style={[pos, { paddingTop: 1.6 * u, opacity: done ? 0.6 : r.state === 'missed' ? 0.5 : 1 }]}>
              <View style={{ height: h, transform: [{ rotate }] }}>
                <Svg width={cardW} height={h + 0.8 * u} style={{ position: 'absolute', left: 0, top: 0 }}>
                  <Path d={ribbonPath(cardW, h, radii.card * u, 2 * u)} fill={colors.surfaceShadow} transform={`translate(0 ${0.8 * u})`} />
                  <Path d={ribbonPath(cardW, h, radii.card * u, 2 * u)} fill={colors.surface} stroke={colors.surfaceBorder} strokeWidth={0.6 * u} />
                </Svg>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2 * u, paddingLeft: 2.5 * u, paddingRight: 4.5 * u, paddingTop: 1.2 * u }}>
                  <View
                    style={{
                      width: 3.6 * u,
                      height: 3.6 * u,
                      borderRadius: 1.8 * u,
                      borderWidth: 0.5 * u,
                      borderColor: done ? colors.nodeDone : r.state === 'next' ? colors.nodeActive : colors.node,
                      backgroundColor: markColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {done ? <Check size={2.6 * u} color="#FFFFFF" strokeWidth={3.5} /> : null}
                  </View>
                  <WText
                    font={fonts.body}
                    size={sizes.rowTitle * u}
                    color={r.state === 'missed' ? colors.textMuted : colors.textPrimary}
                    numberOfLines={1}
                    style={[{ flex: 1 }, done ? { textDecorationLine: 'line-through' } : {}]}
                  >
                    {r.title}
                  </WText>
                  <RowIcon icon={r.icon} tokens={tokens} u={u} />
                </View>
                {/* sticker pill overlapping the top-left edge */}
                <View
                  style={{
                    position: 'absolute',
                    left: 2 * u,
                    top: -2.4 * u,
                    backgroundColor: colors.badgeBg,
                    borderRadius: 50 * u,
                    paddingHorizontal: 1.8 * u,
                    paddingVertical: 0.2 * u,
                    borderWidth: 0.4 * u,
                    borderColor: '#FFFFFF',
                    transform: [{ rotate: '-3deg' }],
                    flexDirection: 'row',
                    gap: 1 * u,
                  }}
                >
                  <WText font={fonts.display} size={Math.max(2.6, sizes.tLabel * 0.75) * u} color={colors.badgeText}>
                    {r.tLabel} · {r.dateLabel}
                  </WText>
                  {r.state === 'next' ? (
                    <WText font={fonts.display} size={Math.max(2.6, sizes.tLabel * 0.75) * u} color={colors.badgeText}>
                      ★
                    </WText>
                  ) : null}
                </View>
              </View>
            </View>
          );
        }
        if (s.kind === 'more') {
          return (
            <View key="more" style={[pos, { justifyContent: 'center' }]}>
              <MoreChip count={model.overflowCount} tokens={tokens} u={u} />
            </View>
          );
        }
        if (s.kind === 'banner') {
          return (
            <View key="banner" style={[pos, { justifyContent: 'center' }]}>
              <WText font={fonts.hand ?? fonts.body} size={sizes.motivation * 0.85 * u} color={colors.success} numberOfLines={1}>
                {model.banner}
              </WText>
            </View>
          );
        }
        return (
          <View key="finish" style={[pos, { justifyContent: 'center' }]}>
            <View
              style={{
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1.5 * u,
                backgroundColor: colors.accent,
                borderRadius: 50 * u,
                paddingHorizontal: 3 * u,
                paddingVertical: 1 * u,
                borderWidth: 0.5 * u,
                borderColor: '#FFFFFF',
              }}
            >
              <Star size={3.4 * u} color="#FFFFFF" fill="#FFFFFF" />
              <WText font={fonts.display} size={sizes.tLabel * u} color={colors.textPrimary}>
                {model.finish.tLabel} · {model.finish.dateLabel} · {model.finish.label}
              </WText>
            </View>
          </View>
        );
      })}

      <View style={{ position: 'absolute', right: -2 * u, top: Math.max(0, finish.y + finish.h - mochiSize * 0.85) }}>
        <Mochi size={mochiSize} mood={mood} pennant={pennant} tokens={tokens} />
      </View>
    </View>
  );
}
