import { ChevronLeft } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { S } from '@/src/constants/strings';
import { useChrome } from '@/src/hooks/useChrome';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

export interface StepHeaderProps {
  step: number;
  total: number;
  onBack?: () => void;
}

/** "Step n of 6" + progress dots + back arrow (DESIGN §9.1). */
export function StepHeader({ step, total, onBack }: StepHeaderProps) {
  const { c, accent } = useChrome();
  return (
    <View style={styles.row}>
      {onBack ? (
        <IconButton icon={ChevronLeft} accessibilityLabel={S.common.back} onPress={onBack} />
      ) : (
        <View style={styles.spacer} />
      )}
      <AppText variant="label" tone="secondary" accessibilityRole="header">
        {S.common.stepOf(step, total)}
      </AppText>
      <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i < step ? accent : c.border }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8, minHeight: 48 },
  spacer: { width: 44 },
  dots: { flexDirection: 'row', gap: 6, marginLeft: 'auto', paddingRight: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
