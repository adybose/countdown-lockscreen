import Svg, { Defs, G, Line, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { ThemeBackgroundProps } from '../../types';

/** Dark gradient + two glow orbs + faint grid (DESIGN §6.1). Glass is simulated, never real blur. */
export function GlassBackground({ tokens, size, u, idPrefix }: ThemeBackgroundProps) {
  const { width: W, height: H } = size;
  const { colors } = tokens;
  const pitch = 6 * u;
  const cols = Math.ceil(W / pitch);
  const rows = Math.ceil(H / pitch);
  const bg = `${idPrefix}-gt-bg`;
  const o1 = `${idPrefix}-gt-o1`;
  const o2 = `${idPrefix}-gt-o2`;
  return (
    <Svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
      <Defs>
        <LinearGradient id={bg} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.background} />
          <Stop offset="1" stopColor={colors.backgroundAlt} />
        </LinearGradient>
        <RadialGradient id={o1} cx={0.85 * W} cy={0.38 * H} r={45 * u} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#3DFFC5" stopOpacity={0.18} />
          <Stop offset="1" stopColor="#3DFFC5" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={o2} cx={0.1 * W} cy={0.75 * H} r={55 * u} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#22D3EE" stopOpacity={0.14} />
          <Stop offset="1" stopColor="#22D3EE" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={W} height={H} fill={`url(#${bg})`} />
      <G opacity={0.05}>
        {Array.from({ length: cols + 1 }, (_, i) => (
          <Line key={`v${i}`} x1={i * pitch} y1={0} x2={i * pitch} y2={H} stroke="#7FFFD4" strokeWidth={Math.max(0.5, 0.15 * u)} />
        ))}
        {Array.from({ length: rows + 1 }, (_, i) => (
          <Line key={`h${i}`} x1={0} y1={i * pitch} x2={W} y2={i * pitch} stroke="#7FFFD4" strokeWidth={Math.max(0.5, 0.15 * u)} />
        ))}
      </G>
      <Rect x={0} y={0} width={W} height={H} fill={`url(#${o1})`} />
      <Rect x={0} y={0} width={W} height={H} fill={`url(#${o2})`} />
    </Svg>
  );
}
