import { View } from 'react-native';
import Svg, { Line, Polygon, Rect } from 'react-native-svg';
import { pathSlots } from '../../layout';
import { MoreChip } from '../../parts/MoreChip';
import { RowIcon } from '../../parts/RowIcon';
import { RowText } from '../../parts/RowText';
import { WText } from '../../parts/WText';
import type { ThemePathProps } from '../../types';

/** `circuit`: vertical rail, 90° traces, rounded-square nodes, diamond finish, glass cards (DESIGN §6.1). */
export function CircuitPath({ model, tokens, u, width, height }: ThemePathProps) {
  const { colors, fonts, sizes, radii } = tokens;
  const slots = pathSlots(model, height, { maxRowH: 15 * u, chipH: 6 * u, bannerH: 6 * u });
  const railX = 2 * u;
  const cardX = 5.5 * u;
  const node = 2.8 * u;
  const centers = slots.filter((s) => s.kind === 'row' || s.kind === 'finish').map((s) => s.y + s.h / 2);
  const railTop = centers[0] ?? 0;
  const railBottom = centers[centers.length - 1] ?? 0;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Line x1={railX} y1={railTop} x2={railX} y2={railBottom} stroke={colors.trail} strokeWidth={0.4 * u} />
        {slots.map((s) => {
          const cy = s.y + s.h / 2;
          if (s.kind === 'row' && s.row) {
            const st = s.row.state;
            const stroke = st === 'next' ? colors.nodeActive : st === 'done' ? colors.nodeDone : colors.node;
            const fill = st === 'done' ? colors.nodeDone : colors.backgroundAlt;
            return [
              <Line key={`t${s.index}`} x1={railX} y1={cy} x2={cardX} y2={cy} stroke={colors.trail} strokeWidth={0.3 * u} />,
              <Rect
                key={`n${s.index}`}
                x={railX - node / 2}
                y={cy - node / 2}
                width={node}
                height={node}
                rx={radii.node * u}
                fill={fill}
                stroke={stroke}
                strokeWidth={0.4 * u}
                opacity={st === 'missed' ? 0.5 : 1}
              />,
            ];
          }
          if (s.kind === 'finish') {
            const d = 1.9 * u;
            return (
              <Polygon
                key="finish"
                points={`${railX},${cy - d} ${railX + d},${cy} ${railX},${cy + d} ${railX - d},${cy}`}
                fill={colors.accent}
                stroke={colors.textPrimary}
                strokeWidth={0.2 * u}
              />
            );
          }
          return null;
        })}
      </Svg>

      {slots.map((s) => {
        const pos = { position: 'absolute' as const, left: cardX, right: 0, top: s.y, height: s.h, justifyContent: 'center' as const };
        if (s.kind === 'row' && s.row) {
          const r = s.row;
          const next = r.state === 'next';
          return (
            <View key={r.id} style={[pos, { paddingVertical: 0.6 * u, opacity: r.state === 'done' ? 0.6 : r.state === 'missed' ? 0.5 : 1 }]}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2 * u,
                  paddingHorizontal: 2.5 * u,
                  borderRadius: radii.card * u,
                  borderWidth: Math.max(1, 0.25 * u),
                  borderColor: next ? colors.nodeActive : colors.surfaceBorder,
                  borderTopColor: colors.surfaceHighlight,
                  backgroundColor: next ? colors.surfaceStrong : colors.surface,
                }}
              >
                <View style={{ flex: 1 }}>
                  <RowText row={r} tokens={tokens} u={u} labelFont={fonts.display} />
                </View>
                <RowIcon icon={r.icon} tokens={tokens} u={u} />
              </View>
            </View>
          );
        }
        if (s.kind === 'more') {
          return (
            <View key="more" style={pos}>
              <MoreChip count={model.overflowCount} tokens={tokens} u={u} />
            </View>
          );
        }
        if (s.kind === 'banner') {
          return (
            <View key="banner" style={pos}>
              <WText font={fonts.body} size={sizes.caption * u} color={colors.success} numberOfLines={1}>
                {model.banner}
              </WText>
            </View>
          );
        }
        return (
          <View key="finish" style={[pos, { flexDirection: 'row', alignItems: 'center', gap: 2 * u, justifyContent: 'flex-start' }]}>
            <WText font={fonts.display} size={sizes.tLabel * u} color={colors.accent}>
              {model.finish.tLabel} · {model.finish.dateLabel}
            </WText>
            <WText font={fonts.bodyStrong ?? fonts.body} size={sizes.rowTitle * u} color={colors.textPrimary}>
              {model.finish.label.toUpperCase()}
            </WText>
          </View>
        );
      })}
    </View>
  );
}
