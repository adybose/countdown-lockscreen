import { StyleSheet, Switch, View } from 'react-native';
import { useChrome } from '@/src/hooks/useChrome';
import { AppText } from './AppText';

export interface ToggleProps {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  hint?: string;
  disabled?: boolean;
}

export function Toggle({ label, value, onValueChange, hint, disabled }: ToggleProps) {
  const { c, accent } = useChrome();
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <AppText variant="bodyStrong">{label}</AppText>
        {hint ? (
          <AppText variant="caption" tone="secondary">
            {hint}
          </AppText>
        ) : null}
      </View>
      <Switch
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{ checked: value, disabled: !!disabled }}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: accent, false: c.border }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={c.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  text: { flex: 1, gap: 2 },
});
