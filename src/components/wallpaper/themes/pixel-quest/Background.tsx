import Svg, { Path, Rect } from 'react-native-svg';
import { mulberry32 } from '@/src/utils/prng';
import type { ThemeBackgroundProps } from '../../types';
import { mixHex, snap } from './shapes';

/** 8 hard gradient bands, seeded star field, original stepped hills (DESIGN §6.2). */
export function PixelBackground({ tokens, size, u, seed, safeZone }: ThemeBackgroundProps) {
  const { width: W, height: H } = size;
  const { colors } = tokens;
  const bands = 8;
  const bandH = H / bands;
  const rand = mulberry32(seed);
  const topSafe = (H * safeZone.topPct) / 100;
  const stars = Array.from({ length: 40 }, () => {
    const s = (0.6 + rand() * 0.4) * u;
    const x = rand() * (W - s);
    const y = rand() * (H * 0.75);
    const o = 0.3 + rand() * 0.4;
    return { x: snap(x, 0.5 * u), y: snap(y, 0.5 * u), s, o: y < topSafe ? Math.min(o, 0.25) : o };
  });

  // Stepped hills silhouette behind the lower content.
  const step = 2 * u;
  const base = H * 0.72;
  let d = `M0,${H} L0,${snap(base, step)}`;
  for (let x = 0; x <= W + step; x += step * 3) {
    const y = base + Math.sin(x / (18 * u)) * 6 * u + Math.sin(x / (7 * u)) * 2 * u;
    d += ` H${x} V${snap(y, step)}`;
  }
  d += ` H${W} V${H} Z`;

  return (
    <Svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
      {Array.from({ length: bands }, (_, i) => (
        <Rect key={i} x={0} y={i * bandH} width={W} height={bandH + 1} fill={mixHex(colors.background, colors.backgroundAlt, i / (bands - 1))} />
      ))}
      {stars.map((s, i) => (
        <Rect key={`s${i}`} x={s.x} y={s.y} width={s.s} height={s.s} fill="#FFFFFF" opacity={s.o} />
      ))}
      <Path d={d} fill="#140F33" />
    </Svg>
  );
}
