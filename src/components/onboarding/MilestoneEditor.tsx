import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, DateField, IconButton, TextField } from '@/src/components/ui';
import { LIMITS } from '@/src/constants/limits';
import { S } from '@/src/constants/strings';
import { useChrome } from '@/src/hooks/useChrome';
import { ICON_COMPONENTS } from '@/src/themes/icons';
import type { LocalDate, Milestone } from '@/src/types/domain';
import { formatMediumDate, formatTMinusLabel, isLocalDate } from '@/src/utils/dates';
import { suggestIcon } from '@/src/utils/icons';
import type { MilestoneError } from '@/src/utils/validation';
import { IconPicker } from './IconPicker';

const T = S.onboarding.milestones;

export interface MilestoneEditorProps {
  milestone: Milestone;
  index: number;
  count: number;
  today: LocalDate;
  deadlineDate: LocalDate;
  errors: MilestoneError[];
  onChange: (patch: Partial<Milestone>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}

export function MilestoneEditor({ milestone: m, index, count, today, deadlineDate, errors, onChange, onMove, onRemove }: MilestoneEditorProps) {
  const { c, accent } = useChrome();
  const [picker, setPicker] = useState(false);
  const Icon = ICON_COMPONENTS[m.icon];
  const label = isLocalDate(m.date) && isLocalDate(deadlineDate) ? formatTMinusLabel(m, { deadlineDate }) : '';
  const messages = errors.map((e) => (e === 'after-deadline' ? T.errors[e](formatMediumDate(deadlineDate)) : T.errors[e]));

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: errors.length ? c.danger : c.border }]}>
      <View style={styles.head}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={T.changeIcon(m.title)}
          onPress={() => setPicker(true)}
          style={[styles.iconBtn, { borderColor: c.border }]}
        >
          <Icon size={20} color={accent} />
        </Pressable>
        <AppText variant="label">{label}</AppText>
      </View>
      <TextField
        label={T.titleLabel}
        hideLabel
        value={m.title}
        placeholder={T.titlePlaceholder}
        maxLength={LIMITS.milestoneTitleMax}
        onChangeText={(title) => {
          const autoIcon = m.icon === suggestIcon(m.title) || m.icon === 'flag';
          onChange(autoIcon ? { title, icon: suggestIcon(title) } : { title });
        }}
      />
      <View style={styles.row}>
        <View style={styles.flex}>
          <DateField
            label={T.dateLabel}
            value={m.date}
            initial={deadlineDate}
            minimumDate={m.done ? undefined : today}
            maximumDate={deadlineDate}
            onChange={(date) => onChange({ date })}
            format={formatMediumDate}
            error={errors.some((e) => e !== 'empty-title' && e !== 'title-too-long')}
            compact
          />
        </View>
        <IconButton icon={ChevronUp} accessibilityLabel={T.moveUp(m.title)} onPress={() => onMove(-1)} disabled={index === 0} />
        <IconButton icon={ChevronDown} accessibilityLabel={T.moveDown(m.title)} onPress={() => onMove(1)} disabled={index === count - 1} />
        <IconButton icon={Trash2} accessibilityLabel={T.remove(m.title)} onPress={onRemove} color={c.danger} />
      </View>
      {messages.map((msg) => (
        <AppText key={msg} variant="caption" tone="danger">
          ⚠ {msg}
        </AppText>
      ))}
      <IconPicker visible={picker} value={m.icon} title={T.changeIcon(m.title)} onSelect={(icon) => onChange({ icon })} onClose={() => setPicker(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 12, gap: 8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  flex: { flex: 1 },
});
