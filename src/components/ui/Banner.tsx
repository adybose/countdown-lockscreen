import { CircleAlert, Info, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useChrome } from '@/src/hooks/useChrome';
import { AppText } from './AppText';

export interface BannerProps {
  tone?: 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  icon?: LucideIcon;
  children?: ReactNode;
}

/** Inline card for notices, errors and permission-denied states (DESIGN §10). */
export function Banner({ tone = 'info', title, message, icon, children }: BannerProps) {
  const { c, accent } = useChrome();
  const color = tone === 'error' ? c.danger : tone === 'warning' ? '#D97706' : accent;
  const Icon = icon ?? (tone === 'error' ? CircleAlert : tone === 'warning' ? TriangleAlert : Info);
  return (
    <View
      accessibilityRole={tone === 'info' ? 'summary' : 'alert'}
      style={[styles.card, { backgroundColor: c.card, borderColor: color }]}
    >
      <View style={styles.row}>
        <Icon size={20} color={color} />
        <View style={styles.text}>
          {title ? <AppText variant="bodyStrong">{title}</AppText> : null}
          <AppText variant="caption" tone="secondary">
            {message}
          </AppText>
        </View>
      </View>
      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderLeftWidth: 4, borderRadius: 12, padding: 12, gap: 8 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  text: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
