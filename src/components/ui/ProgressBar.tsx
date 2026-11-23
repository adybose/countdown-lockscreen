import { StyleSheet, View } from 'react-native';
import { useChrome } from '@/src/hooks/useChrome';
import { AppText } from './AppText';

export interface ProgressBarProps {
  label: string;
  ratio: number;
  detail?: string;
  color?: string;
}

export function ProgressBar({ label, ratio, detail, color }: ProgressBarProps) {
  const { c, accent } = useChrome();
  const pct = Math.round(Math.min(1, Math.max(0, ratio)) * 100);
  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityLabel={`${label} ${detail ?? ''} ${pct}%`.replace(/\s+/g, ' ')}
      accessibilityValue={{ min: 0, max: 100, now: pct }}
    >
      <AppText variant="caption" tone="secondary" style={styles.label}>
        {label}
      </AppText>
      <View style={[styles.track, { backgroundColor: c.border }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color ?? accent }]} />
      </View>
      <AppText variant="caption" style={styles.value}>
        {detail ? `${detail} ` : ''}
        {pct}%
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { width: 84 },
  track: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  value: { minWidth: 64, textAlign: 'right' },
});
