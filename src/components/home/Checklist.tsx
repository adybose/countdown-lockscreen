import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Checkbox } from '@/src/components/ui';
import { S } from '@/src/constants/strings';
import { useChrome } from '@/src/hooks/useChrome';
import { ICON_COMPONENTS } from '@/src/themes/icons';
import type { LocalDate, Milestone } from '@/src/types/domain';
import { formatTMinusLabel } from '@/src/utils/dates';

export interface ChecklistProps {
  milestones: Milestone[];
  deadlineDate: LocalDate;
  nextId: string | null;
  onToggle: (id: string) => void;
}

/** Interactive milestone checklist (FR-13). */
export function Checklist({ milestones, deadlineDate, nextId, onToggle }: ChecklistProps) {
  const { c, accent, onAccent } = useChrome();
  return (
    <View style={styles.list}>
      {milestones.map((m) => {
        const Icon = ICON_COMPONENTS[m.icon];
        const label = formatTMinusLabel(m, { deadlineDate });
        const isNext = m.id === nextId;
        return (
          <Pressable
            key={m.id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: m.done }}
            accessibilityLabel={S.home.toggleA11y(m.title, label)}
            accessibilityHint={isNext ? S.home.next : undefined}
            onPress={() => onToggle(m.id)}
            style={({ pressed }) => [styles.row, { borderColor: c.border, opacity: pressed ? 0.7 : 1 }]}
          >
            <Checkbox checked={m.done} />
            <View style={styles.text}>
              <AppText variant="caption" tone="secondary">
                {label}
              </AppText>
              <AppText
                variant="body"
                style={m.done ? [styles.done, { color: c.textSecondary }] : undefined}
                numberOfLines={2}
              >
                {m.title}
              </AppText>
            </View>
            {isNext ? (
              <View style={[styles.chip, { backgroundColor: accent }]}>
                <AppText variant="overline" style={{ color: onAccent }}>
                  {S.home.next}
                </AppText>
              </View>
            ) : null}
            <Icon size={18} color={c.textSecondary} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  text: { flex: 1 },
  done: { textDecorationLine: 'line-through' },
  chip: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
});
