import type { LucideIcon } from 'lucide-react-native';
import { ChevronDown } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import { useChrome } from '@/src/hooks/useChrome';
import { AppText } from './AppText';

/** A pressable field look-alike used by DateField / TimeField on native. */
export function FieldButton({
  icon: Icon,
  text,
  placeholder,
  onPress,
  accessibilityLabel,
  error,
  compact,
}: {
  icon: LucideIcon;
  text: string | null;
  placeholder: string;
  onPress: () => void;
  accessibilityLabel: string;
  error?: boolean;
  compact?: boolean;
}) {
  const { c } = useChrome();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${accessibilityLabel}: ${text ?? placeholder}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.box,
        {
          backgroundColor: c.card,
          borderColor: error ? c.danger : c.border,
          opacity: pressed ? 0.8 : 1,
          minHeight: compact ? 44 : 52,
        },
      ]}
    >
      <Icon size={18} color={c.textSecondary} />
      <AppText variant="body" tone={text ? 'default' : 'secondary'} style={styles.text} numberOfLines={1}>
        {text ?? placeholder}
      </AppText>
      <ChevronDown size={18} color={c.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12 },
  text: { flex: 1 },
});
