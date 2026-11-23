import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useChrome } from '@/src/hooks/useChrome';

export interface IconButtonProps {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Icon-only button with a 44×44 pt minimum hit area. */
export function IconButton({ icon: Icon, accessibilityLabel, onPress, disabled, color, size = 22, style }: IconButtonProps) {
  const { c } = useChrome();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.base, { opacity: disabled ? 0.35 : pressed ? 0.6 : 1 }, style]}
    >
      <Icon size={size} color={color ?? c.text} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
