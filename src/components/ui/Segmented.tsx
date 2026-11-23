import { Pressable, StyleSheet, View } from 'react-native';
import { useChrome } from '@/src/hooks/useChrome';
import { AppText } from './AppText';

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  accessibilityLabel?: string;
}

export interface SegmentedProps<T extends string | number> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  accessibilityLabel: string;
  disabled?: boolean;
}

export function Segmented<T extends string | number>({ options, value, onChange, accessibilityLabel, disabled }: SegmentedProps<T>) {
  const { c, accent, onAccent } = useChrome();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.wrap, { borderColor: c.border, backgroundColor: c.card, opacity: disabled ? 0.5 : 1 }]}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityLabel={o.accessibilityLabel ?? o.label}
            accessibilityState={{ selected, disabled: !!disabled }}
            disabled={disabled}
            onPress={() => onChange(o.value)}
            style={[styles.item, selected && { backgroundColor: accent }]}
          >
            <AppText variant="label" style={{ color: selected ? onAccent : c.text }}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, padding: 3, gap: 3 },
  item: { flex: 1, minHeight: 44, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
});
