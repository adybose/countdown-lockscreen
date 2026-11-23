import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useChrome } from '@/src/hooks/useChrome';

/** Visual checkbox mark. The pressable row owns the accessibility role/state. */
export function Checkbox({ checked, size = 24 }: { checked: boolean; size?: number }) {
  const { c, accent, onAccent } = useChrome();
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderColor: checked ? accent : c.textSecondary,
          backgroundColor: checked ? accent : 'transparent',
        },
      ]}
    >
      {checked ? <Check size={size - 6} color={onAccent} strokeWidth={3} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 2, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
});
