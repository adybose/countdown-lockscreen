import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon } from 'react-native-svg';
import type { ThemeTokens } from '@/src/types/theme';
import { WText } from '../../parts/WText';
import { sparklePath } from './Background';

export type MochiMood = 'normal' | 'star' | 'sweat';

/**
 * "Mochi", an original mascot built from SVG primitives (DESIGN §6.3): a round peach blob with a
 * two-leaf sprout, holding a mini pennant with the day count.
 */
export function Mochi({ size, mood, pennant, tokens }: { size: number; mood: MochiMood; pennant: string; tokens: ThemeTokens }) {
  const k = size / 100;
  return (
    <View style={{ width: size * 1.25, height: size }}>
      <Svg width={size * 1.25} height={size} viewBox="0 0 125 100">
        {/* pennant */}
        <Line x1={104} y1={74} x2={104} y2={12} stroke="#B07A5C" strokeWidth={2.5} strokeLinecap="round" />
        <Polygon points="106,12 124,20 106,30" fill={tokens.colors.accent} stroke="#FFFFFF" strokeWidth={1.5} />
        {/* sprout */}
        <Line x1={50} y1={24} x2={50} y2={13} stroke="#5FB47F" strokeWidth={2.5} strokeLinecap="round" />
        <Ellipse cx={43} cy={12} rx={7} ry={3.6} fill="#7FD1A0" transform="rotate(-25 43 12)" />
        <Ellipse cx={57} cy={12} rx={7} ry={3.6} fill="#7FD1A0" transform="rotate(25 57 12)" />
        {/* body */}
        <Ellipse cx={52} cy={60} rx={42} ry={37} fill="#FFD9C2" stroke="#E89A7F" strokeWidth={2} />
        {/* arm holding the pennant */}
        <Ellipse cx={96} cy={66} rx={7} ry={5} fill="#FFD9C2" stroke="#E89A7F" strokeWidth={2} />
        {/* blush */}
        <Ellipse cx={30} cy={68} rx={7} ry={4} fill="#FF9DB8" opacity={0.7} />
        <Ellipse cx={74} cy={68} rx={7} ry={4} fill="#FF9DB8" opacity={0.7} />
        {/* eyes */}
        {mood === 'star' ? (
          <G>
            <Path d={sparklePath(40, 56, 6)} fill="#4A1530" />
            <Path d={sparklePath(64, 56, 6)} fill="#4A1530" />
          </G>
        ) : (
          <G>
            <Circle cx={40} cy={57} r={5} fill="#4A1530" />
            <Circle cx={64} cy={57} r={5} fill="#4A1530" />
          </G>
        )}
        {/* mouth */}
        {mood === 'sweat' ? (
          <Path d="M45,72 Q52,67 59,72" stroke="#4A1530" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        ) : (
          <Path d="M45,68 Q52,75 59,68" stroke="#4A1530" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        )}
        {mood === 'sweat' ? <Path d="M84,30 Q90,40 84,44 Q78,40 84,30 Z" fill="#8FD3FF" stroke="#5AAFE0" strokeWidth={1} /> : null}
      </Svg>
      <View style={{ position: 'absolute', left: 106 * k, top: 12 * k, width: 18 * k, height: 18 * k, alignItems: 'center', justifyContent: 'center' }}>
        <WText font={tokens.fonts.display} size={Math.max(1, 6.5 * k)} color="#FFFFFF" numberOfLines={1}>
          {pennant}
        </WText>
      </View>
    </View>
  );
}
