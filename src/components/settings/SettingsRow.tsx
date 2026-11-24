import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import { AppText } from '@/src/components/ui';
import { useChrome } from '@/src/hooks/useChrome';

export function SettingsRow({
  label,
  icon: Icon,
  onPress,
  destructive,
  disabled,
}: {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  const { c } = useChrome();
  const color = destructive ? c.danger : c.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { borderColor: c.border, opacity: disabled ? 0.4 : pressed ? 0.7 : 1 }]}
    >
      <AppText variant="body" style={[styles.label, { color }]}>
        {label}
      </AppText>
      <Icon size={20} color={color} />
    </Pressable>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <AppText variant="overline" tone="secondary" accessibilityRole="header" style={styles.section}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  label: { flex: 1 },
  section: { marginTop: 24, marginBottom: 4 },
});
