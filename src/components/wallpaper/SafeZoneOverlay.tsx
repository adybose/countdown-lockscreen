import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';
import { S } from '@/src/constants/strings';
import type { SafeZoneSpec } from '@/src/types/wallpaper';

const TINT = 'rgba(255,64,64,0.18)';

/**
 * Studio-only overlay (DESIGN §4.3): hatched top/bottom zones + dashed content outline.
 * Always rendered as a sibling of the scaled preview — never inside the capture ref (FR-17).
 */
export function SafeZoneOverlay({ width, height, safeZone }: { width: number; height: number; safeZone: SafeZoneSpec }) {
  const topH = (height * safeZone.topPct) / 100;
  const bottomH = (height * safeZone.bottomPct) / 100;
  const side = (width * safeZone.sidePct) / 100;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={width} height={height}>
        <Defs>
          <Pattern id="szhatch" patternUnits="userSpaceOnUse" width={10} height={10} patternTransform="rotate(45)">
            <Line x1={0} y1={0} x2={0} y2={10} stroke="rgba(255,64,64,0.45)" strokeWidth={3} />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width={width} height={topH} fill={TINT} />
        <Rect x={0} y={0} width={width} height={topH} fill="url(#szhatch)" />
        <Rect x={0} y={height - bottomH} width={width} height={bottomH} fill={TINT} />
        <Rect x={0} y={height - bottomH} width={width} height={bottomH} fill="url(#szhatch)" />
        <Rect
          x={side}
          y={topH}
          width={width - side * 2}
          height={height - topH - bottomH}
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={1}
          strokeDasharray="6 4"
        />
      </Svg>
      <View style={[styles.label, { top: topH / 2 - 10 }]}>
        <Text style={styles.text}>{S.studio.overlayTop}</Text>
      </View>
      <View style={[styles.label, { top: height - bottomH / 2 - 10 }]}>
        <Text style={styles.text}>{S.studio.overlayBottom}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
