import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/src/components/ui';
import { useChrome } from '@/src/hooks/useChrome';
import { THEME_ORDER, THEMES } from '@/src/themes';
import type { ThemeId } from '@/src/types/theme';

export function ThemeChips({ value, onChange }: { value: ThemeId; onChange: (id: ThemeId) => void }) {
  const { c, accent, onAccent } = useChrome();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} accessibilityRole="radiogroup">
      {THEME_ORDER.map((id) => {
        const selected = id === value;
        const t = THEMES[id];
        return (
          <Pressable
            key={id}
            accessibilityRole="radio"
            accessibilityLabel={`${t.name} theme`}
            accessibilityState={{ selected }}
            onPress={() => onChange(id)}
            style={[styles.chip, { borderColor: selected ? accent : c.border, backgroundColor: selected ? accent : c.card }]}
          >
            <View style={[styles.dot, { backgroundColor: t.colors.background, borderColor: t.colors.accent }]} />
            <AppText variant="label" style={{ color: selected ? onAccent : c.text }}>
              {t.name}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingHorizontal: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 3 },
});
