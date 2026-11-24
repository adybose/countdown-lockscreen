import { Check, Flag } from 'lucide-react-native';
import { View } from 'react-native';
import Svg, { Circle, G, Path, Polygon } from 'react-native-svg';
import { S } from '@/src/constants/strings';
import { mulberry32 } from '@/src/utils/prng';
import { MoreChip } from '../../parts/MoreChip';
import { RowIcon } from '../../parts/RowIcon';
import { WText } from '../../parts/WText';
import type { ThemePathProps } from '../../types';
import { pinPath, roadCurve } from './geometry';

/**
 * `road`: left 52% map with a winding Bézier road, pins and pine trees; right 48% checklist panel
 * with a tape strip (DESIGN §6.4).
 */
export function RoadPath({ model, tokens, u, width, height, seed }: ThemePathProps) {
  const { colors, fonts, sizes, radii } = tokens;
  const mapW = width * 0.52;
  const panelX = mapW + 1.5 * u;
  const panelW = width - panelX;
  const road = roadCurve(mapW, height);
  const n = model.rows.length;
  const pins = model.rows.map((r, i) => ({ r, p: road.at((i + 1) / (n + 1.15)) }));
  const end = road.at(1);
  const rand = mulberry32(seed ^ 0x5f3759df);
  const trees = Array.from({ length: 7 }, (_, i) => {
    const p = road.at((i + 0.5) / 7);
    const side = i % 2 === 0 ? -1 : 1;
    return { x: Math.min(mapW - 2 * u, Math.max(2 * u, p.x + side * (6 + rand() * 4) * u)), y: p.y + (rand() - 0.5) * 4 * u, s: (2.4 + rand() * 1.4) * u };
  });

  // Panel rows
  const headerH = 8 * u;
  const extras = (model.overflowCount > 0 ? 5 * u : 0) + (model.banner ? 5 * u : 0);
  const rowH = Math.min(12 * u, (height - headerH - 2 * u - extras) / Math.max(1, n));

  return (
    <View style={{ width, height }}>
      <Svg width={mapW} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
        {trees.map((t, i) => (
          <G key={`t${i}`} opacity={0.6}>
            <Polygon points={`${t.x},${t.y - t.s} ${t.x - t.s * 0.6},${t.y + t.s * 0.4} ${t.x + t.s * 0.6},${t.y + t.s * 0.4}`} fill={colors.accentAlt} />
            <Polygon points={`${t.x},${t.y - t.s * 1.5} ${t.x - t.s * 0.45},${t.y - t.s * 0.3} ${t.x + t.s * 0.45},${t.y - t.s * 0.3}`} fill={colors.accentAlt} />
          </G>
        ))}
        <Path d={road.d} fill="none" stroke={colors.roadEdge} strokeWidth={5.1 * u} strokeLinecap="round" />
        <Path d={road.d} fill="none" stroke={colors.road} strokeWidth={4.5 * u} strokeLinecap="round" />
        <Path d={road.d} fill="none" stroke={colors.roadDash} strokeWidth={0.45 * u} strokeDasharray={`${1.5 * u} ${1.5 * u}`} />
        {pins.map(({ r, p }) => {
          const done = r.state === 'done';
          const fill = done ? colors.nodeDone : colors.node;
          return (
            <G key={r.id} opacity={r.state === 'missed' ? 0.5 : 1}>
              {r.state === 'next' ? <Circle cx={p.x} cy={p.y} r={3.2 * u} fill="none" stroke={colors.nodeActive} strokeWidth={0.4 * u} opacity={0.6} /> : null}
              <Path d={pinPath(p.x, p.y, 6 * u)} fill={fill} stroke={colors.roadEdge} strokeWidth={0.25 * u} />
              <Circle cx={p.x} cy={p.y - 6 * u + 2.16 * u} r={0.9 * u} fill={colors.surface} />
            </G>
          );
        })}
        <Path d={pinPath(end.x, end.y, 7 * u)} fill={colors.accent} stroke={colors.roadEdge} strokeWidth={0.25 * u} />
      </Svg>
      {/* date tags beside pins (Caveat) */}
      {pins.map(({ r, p }) => {
        const leftSide = p.x > mapW / 2;
        return (
          <View
            key={`tag${r.id}`}
            style={{
              position: 'absolute',
              top: p.y - 6 * u,
              ...(leftSide ? { right: width - (p.x - 3 * u) } : { left: p.x + 3 * u }),
              backgroundColor: colors.surface,
              borderRadius: 0.6 * u,
              borderWidth: Math.max(1, 0.2 * u),
              borderColor: colors.surfaceBorder,
              paddingHorizontal: 1 * u,
              opacity: r.state === 'done' ? 0.7 : 1,
            }}
          >
            <WText font={fonts.hand ?? fonts.body} size={4.4 * u} color={colors.textPrimary} lineHeight={4.8 * u}>
              {r.tLabel}
            </WText>
          </View>
        );
      })}
      <View style={{ position: 'absolute', left: end.x + 3 * u, top: end.y - 6 * u, flexDirection: 'row', alignItems: 'center', gap: 0.5 * u }}>
        <Flag size={3.6 * u} color={colors.accent} strokeWidth={2} />
        <WText font={fonts.hand ?? fonts.body} size={4.4 * u} color={colors.accent} lineHeight={4.8 * u}>
          {model.finish.tLabel}
        </WText>
      </View>

      {/* checklist panel */}
      <View
        style={{
          position: 'absolute',
          left: panelX,
          top: 1 * u,
          width: panelW,
          height: height - 1 * u,
          backgroundColor: colors.surface,
          borderWidth: Math.max(1, 0.3 * u),
          borderColor: colors.surfaceBorder,
          borderRadius: radii.card * u,
          paddingHorizontal: 2 * u,
          paddingTop: 3 * u,
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: -1.8 * u,
            left: panelW / 2 - 7 * u,
            width: 14 * u,
            height: 3.5 * u,
            backgroundColor: colors.tape,
            transform: [{ rotate: '-4deg' }],
          }}
        />
        <WText font={fonts.display} size={sizes.rowTitle * 1.2 * u} color={colors.textPrimary} lineHeight={headerH * 0.7}>
          {S.wallpaper.checklist}
        </WText>
        {model.rows.map((r) => {
          const done = r.state === 'done';
          return (
            <View key={r.id} style={{ height: rowH, flexDirection: 'row', alignItems: 'center', gap: 1.4 * u, opacity: done ? 0.6 : r.state === 'missed' ? 0.5 : 1 }}>
              <View
                style={{
                  width: 3.2 * u,
                  height: 3.2 * u,
                  borderRadius: radii.checkbox * u,
                  borderWidth: Math.max(1, 0.35 * u),
                  borderColor: done ? colors.success : r.state === 'next' ? colors.accent : colors.textSecondary,
                  backgroundColor: done ? colors.success : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {done ? <Check size={2.4 * u} color={colors.surface} strokeWidth={3.5} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <WText font={fonts.body} size={sizes.caption * u} color={r.state === 'next' ? colors.accent : colors.textMuted} numberOfLines={1}>
                  {r.tLabel} · {r.dateLabel}
                  {r.state === 'next' ? `  ${S.wallpaper.next}` : ''}
                </WText>
                <WText
                  font={fonts.body}
                  size={sizes.rowTitle * u}
                  color={colors.textPrimary}
                  numberOfLines={1}
                  style={done ? { textDecorationLine: 'line-through' } : undefined}
                >
                  {r.title}
                </WText>
              </View>
              <RowIcon icon={r.icon} tokens={tokens} u={u} />
            </View>
          );
        })}
        {model.overflowCount > 0 ? (
          <View style={{ height: 5 * u, justifyContent: 'center' }}>
            <MoreChip count={model.overflowCount} tokens={tokens} u={u} />
          </View>
        ) : null}
        {model.banner ? (
          <View style={{ height: 5 * u, justifyContent: 'center' }}>
            <WText font={fonts.body} size={sizes.caption * u} color={colors.success} numberOfLines={2}>
              {model.banner}
            </WText>
          </View>
        ) : null}
        {n === 0 ? (
          <WText font={fonts.body} size={sizes.rowTitle * u} color={colors.textSecondary}>
            {model.finish.tLabel} · {model.finish.dateLabel} · {model.finish.label}
          </WText>
        ) : null}
      </View>
    </View>
  );
}
