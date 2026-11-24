import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { mulberry32 } from '@/src/utils/prng';
import type { ThemeBackgroundProps } from '../../types';
import { compassPath, contourPath } from './geometry';

/** Parchment, vignette, ink speckles, contour lines, compass rose (DESIGN §6.4). */
export function JournalBackground({ tokens, size, u, seed, idPrefix, zones }: ThemeBackgroundProps) {
  const { width: W, height: H } = size;
  const { colors } = tokens;
  const rand = mulberry32(seed);
  const vig = `${idPrefix}-fj-vig`;
  const speckles = Array.from({ length: 120 }, () => ({
    x: rand() * W,
    y: rand() * H,
    r: (0.2 + rand() * 0.3) * u,
    o: 0.06 + rand() * 0.06,
  }));
  const ccx = W * (0.25 + rand() * 0.5);
  const ccy = H * (0.45 + rand() * 0.3);
  const contours = Array.from({ length: 5 }, (_, i) => {
    const wobble = Array.from({ length: 6 }, () => (rand() - 0.5) * 0.25);
    return contourPath(ccx, ccy, (14 + i * 9) * u, (10 + i * 7) * u, wobble);
  });
  const compassR = 7 * u;
  return (
    <Svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
      <Defs>
        <RadialGradient id={vig} cx={W / 2} cy={H / 2} r={Math.max(W, H) * 0.65} gradientUnits="userSpaceOnUse">
          <Stop offset="0.55" stopColor={colors.backgroundAlt} stopOpacity={0} />
          <Stop offset="1" stopColor={colors.backgroundAlt} stopOpacity={0.6} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={W} height={H} fill={colors.background} />
      {contours.map((d, i) => (
        <Path key={`c${i}`} d={d} fill="none" stroke="#B89A6A" strokeOpacity={0.15} strokeWidth={0.3 * u} />
      ))}
      {speckles.map((s, i) => (
        <Circle key={`s${i}`} cx={s.x} cy={s.y} r={s.r} fill="#8B6B3E" opacity={s.o} />
      ))}
      <Rect x={0} y={0} width={W} height={H} fill={`url(#${vig})`} />
      <Path
        d={compassPath(W - 14 * u, zones.top.height * 0.45, compassR)}
        fill="#8B6B3E"
        opacity={0.25}
      />
      <Circle cx={W - 14 * u} cy={zones.top.height * 0.45} r={compassR * 1.15} fill="none" stroke="#8B6B3E" strokeOpacity={0.25} strokeWidth={0.3 * u} />
    </Svg>
  );
}
