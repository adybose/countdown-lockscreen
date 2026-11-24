import { View } from 'react-native';
import Svg, { G, Path, Polygon, Polyline, Rect } from 'react-native-svg';
import { pathSlots } from '../../layout';
import { MoreChip } from '../../parts/MoreChip';
import { RowIcon } from '../../parts/RowIcon';
import { RowText } from '../../parts/RowText';
import { WText } from '../../parts/WText';
import type { ThemePathProps } from '../../types';
import { notchedRectPath, octagonPoints, stepPoints } from './shapes';

/**
 * `pixel-trail`: S-shaped stepped trail alternating x at 22u / 78u of the canvas (15u / 71u in the
 * content rect), 9u octagon nodes, label plates on the opposite side, castle-flag finish (DESIGN §6.2).
 */
export function TrailPath({ model, tokens, u, width, height }: ThemePathProps) {
  const { colors, fonts, sizes } = tokens;
  const slots = pathSlots(model, height, { maxRowH: 16 * u, chipH: 6 * u, bannerH: 6 * u, finishScale: 1.1 });
  const xs = [15 * u, Math.min(71 * u, width - 6 * u)];
  const nodeS = 9 * u;
  const grid = 2 * u;
  const pts = slots
    .filter((s) => s.kind === 'row' || s.kind === 'finish')
    .map((s, i) => ({ s, x: xs[i % 2], y: s.y + s.h / 2 }));
  const trail: number[][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const seg = stepPoints(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, grid);
    trail.push(...(i === 0 ? seg : seg.slice(1)));
  }
  const trailStr = trail.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
        {trail.length > 1 ? (
          <G>
            <Polyline points={trailStr} fill="none" stroke={colors.trailGlow} strokeWidth={6 * u} strokeLinejoin="miter" strokeLinecap="square" />
            <Polyline points={trailStr} fill="none" stroke={colors.trail} strokeWidth={3 * u} strokeLinejoin="miter" strokeLinecap="square" />
          </G>
        ) : null}
        {pts.map(({ s, x, y }, i) => {
          if (s.kind === 'finish') {
            // Original castle-flag glyph: tower with battlements + pole + triangle flag (12u).
            const w = 7 * u;
            const h = 6 * u;
            const top = y - 1 * u;
            return (
              <G key="finish">
                <Rect x={x - w / 2} y={top} width={w} height={h} fill={colors.accentAlt} />
                {[0, 2, 4].map((k) => (
                  <Rect key={k} x={x - w / 2 + k * 1.5 * u} y={top - 1.5 * u} width={1.5 * u} height={1.5 * u} fill={colors.accentAlt} />
                ))}
                <Rect x={x - 1 * u} y={top + 2.5 * u} width={2 * u} height={3.5 * u} fill={colors.background} />
                <Rect x={x - 0.3 * u} y={top - 6 * u} width={0.6 * u} height={4.5 * u} fill={colors.textPrimary} />
                <Polygon points={`${x + 0.3 * u},${top - 6 * u} ${x + 4 * u},${top - 4.8 * u} ${x + 0.3 * u},${top - 3.6 * u}`} fill={colors.accent} />
              </G>
            );
          }
          const st = s.row?.state;
          const fill = st === 'done' ? colors.nodeDone : st === 'next' ? colors.nodeActive : colors.node;
          const stroke = st === 'next' ? '#FFF3B0' : st === 'done' ? colors.nodeDone : colors.surfaceBorder;
          return (
            <G key={`n${i}`} opacity={st === 'missed' ? 0.5 : 1}>
              <Polygon points={octagonPoints(x, y, nodeS + 2.4 * u)} fill={colors.trailGlow} />
              <Polygon points={octagonPoints(x, y, nodeS)} fill={fill} stroke={stroke} strokeWidth={0.6 * u} />
              {st === 'done' ? (
                <Polyline
                  points={`${x - 2 * u},${y} ${x - 0.6 * u},${y + 1.6 * u} ${x + 2.2 * u},${y - 1.6 * u}`}
                  fill="none"
                  stroke={colors.background}
                  strokeWidth={1 * u}
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              ) : null}
            </G>
          );
        })}
        {pts.map(({ s, x }, i) => {
          if (s.kind !== 'row') return null;
          const left = x < width / 2;
          const px = left ? x + nodeS / 2 + 2 * u : 0;
          const pw = left ? width - px : x - nodeS / 2 - 2 * u;
          const py = s.y + 1 * u;
          const ph = s.h - 2 * u;
          return (
            <G key={`p${i}`} opacity={s.row?.state === 'done' ? 0.6 : 1}>
              <Path d={notchedRectPath(px - 0.6 * u, py - 0.6 * u, pw + 1.2 * u, ph + 1.2 * u, 1.2 * u)} fill={colors.trailGlow} />
              <Path d={notchedRectPath(px, py, pw, ph, 1 * u)} fill={colors.surface} stroke={colors.surfaceBorder} strokeWidth={0.6 * u} />
            </G>
          );
        })}
      </Svg>

      {pts.map(({ s, x }) => {
        if (s.kind === 'finish') {
          const left = x < width / 2;
          return (
            <View
              key="finish-label"
              style={{
                position: 'absolute',
                top: s.y,
                height: s.h,
                justifyContent: 'center',
                ...(left ? { left: x + 6 * u, right: 0 } : { left: 0, right: width - x + 6 * u, alignItems: 'flex-end' as const }),
              }}
            >
              <WText font={fonts.display} size={sizes.tLabel * u} color={colors.accentAlt}>
                {model.finish.tLabel} · {model.finish.dateLabel}
              </WText>
              <WText font={fonts.body} size={sizes.rowTitle * u} color={colors.textPrimary}>
                {model.finish.label.toUpperCase()}
              </WText>
            </View>
          );
        }
        if (!s.row) return null;
        const r = s.row;
        const left = x < width / 2;
        const px = left ? x + nodeS / 2 + 2 * u : 0;
        const pw = left ? width - px : x - nodeS / 2 - 2 * u;
        return (
          <View
            key={r.id}
            style={{
              position: 'absolute',
              left: px + 2 * u,
              width: pw - 4 * u,
              top: s.y + 1 * u,
              height: s.h - 2 * u,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1.5 * u,
              opacity: r.state === 'done' ? 0.6 : r.state === 'missed' ? 0.5 : 1,
            }}
          >
            <View style={{ flex: 1 }}>
              <RowText row={r} tokens={tokens} u={u} labelFont={fonts.display} labelColor={r.state === 'next' ? colors.accentAlt : colors.accent} />
            </View>
            <RowIcon icon={r.icon} tokens={tokens} u={u} />
          </View>
        );
      })}

      {slots.map((s) => {
        if (s.kind === 'more') {
          return (
            <View key="more" style={{ position: 'absolute', top: s.y, height: s.h, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
              <MoreChip count={model.overflowCount} tokens={tokens} u={u} />
            </View>
          );
        }
        if (s.kind === 'banner') {
          return (
            <View key="banner" style={{ position: 'absolute', top: s.y, height: s.h, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
              <WText font={fonts.body} size={sizes.caption * u} color={colors.success}>
                {model.banner}
              </WText>
            </View>
          );
        }
        return null;
      })}
    </View>
  );
}
