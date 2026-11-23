import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useChrome } from '@/src/hooks/useChrome';
import { CHROME_RADII } from '@/src/themes/chrome';
import { AppText } from './AppText';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  disabled,
  loading,
  accessibilityLabel,
  accessibilityHint,
  style,
  compact,
}: ButtonProps) {
  const { c, accent, onAccent } = useChrome();
  const inactive = disabled || loading;
  const bg =
    variant === 'primary' ? accent : variant === 'danger' ? c.danger : variant === 'secondary' ? c.card : 'transparent';
  const fg = variant === 'primary' ? onAccent : variant === 'danger' ? '#FFFFFF' : variant === 'ghost' ? accent : c.text;
  const border = variant === 'secondary' ? c.border : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: compact ? 44 : variant === 'primary' ? 52 : 48,
          backgroundColor: bg,
          borderColor: border,
          opacity: inactive ? 0.45 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : Icon ? (
          <Icon size={20} color={fg} strokeWidth={2} />
        ) : null}
        <AppText variant="label" style={{ color: fg }} numberOfLines={2}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: CHROME_RADII.button,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
