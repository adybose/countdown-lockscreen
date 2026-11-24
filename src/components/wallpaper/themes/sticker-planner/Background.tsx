import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';
import { mulberry32 } from '@/src/utils/prng';
import type { ThemeBackgroundProps } from '../../types';

export function sparklePath(cx: number, cy: number, r: number): string {
  const k = r * 0.28;
  return `M${cx},${cy - r} Q${cx + k},${cy - k} ${cx + r},${cy} Q${cx + k},${cy + k} ${cx},${cy + r} Q${cx - k},${cy + k} ${cx - r},${cy} Q${cx - k},${cy - k} ${cx},${cy - r} Z`;
}

export function heartPath(cx: number, cy: number, s: number): string {
  const h = s / 2;
  return `M${cx},${cy + h * 0.9} C${cx - s},${cy} ${cx - h * 0.9},${cy - h * 1.1} ${cx},${cy - h * 0.35} C${cx + h * 0.9},${cy - h * 1.1} ${cx + s},${cy} ${cx},${cy + h * 0.9} Z`;
}

/** Flat paper + 6u grid + seeded sticker confetti (DESIGN §6.3). Calm in the safe zones. */
export function StickerBackground({ tokens, size, u, seed, zones }: ThemeBackgroundProps) {
  const { width: W, height: H } = size;
  const { colors } = tokens;
  const pitch = 6 * u;
  const rand = mulberry32(seed);
  const confetti = Array.from({ length: 28 }, (_, i) => {
    const kind = i % 3;
    const s = (1.6 + rand() * 1.8) * u;
    const inMargin = rand() < 0.5;
    let x: number;
    let y: number;
    let o: number;
    if (inMargin) {
      // content-zone side margins: up to 70%
      x = rand() < 0.5 ? rand() * zones.content.x : zones.content.x + zones.content.width + rand() * zones.content.x;
      y = zones.content.y + rand() * zones.content.height;
      o = 0.4 + rand() * 0.3;
    } else {
      // safe zones: ≤ 25%
      x = rand() * W;
      y = rand() < 0.7 ? rand() * zones.top.height : zones.bottom.y + rand() * zones.bottom.height;
      o = 0.12 + rand() * 0.13;
    }
    return { kind, x, y, s, o };
  });
  return (
    <Svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
      <Rect x={0} y={0} width={W} height={H} fill={colors.background} />
      <G>
        {Array.from({ length: Math.ceil(W / pitch) + 1 }, (_, i) => (
          <Line key={`v${i}`} x1={i * pitch} y1={0} x2={i * pitch} y2={H} stroke={colors.backgroundAlt} strokeWidth={0.25 * u} />
        ))}
        {Array.from({ length: Math.ceil(H / pitch) + 1 }, (_, i) => (
          <Line key={`h${i}`} x1={0} y1={i * pitch} x2={W} y2={i * pitch} stroke={colors.backgroundAlt} strokeWidth={0.25 * u} />
        ))}
      </G>
      {confetti.map((c, i) =>
        c.kind === 0 ? (
          <Path key={i} d={sparklePath(c.x, c.y, c.s)} fill="#FFB3CC" opacity={c.o} />
        ) : c.kind === 1 ? (
          <Path key={i} d={heartPath(c.x, c.y, c.s)} fill="#FF8FB3" opacity={c.o} />
        ) : (
          <Circle key={i} cx={c.x} cy={c.y} r={c.s * 0.35} fill="#FFB86B" opacity={c.o} />
        ),
      )}
    </Svg>
  );
}
