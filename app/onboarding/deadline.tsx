import { useRouter } from 'expo-router';
import { Info } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { StepFrame } from '@/src/components/onboarding/StepFrame';
import { nextStepHref } from '@/src/components/onboarding/steps';
import { AppText, Button, Checkbox, DateField, TimeField } from '@/src/components/ui';
import { S } from '@/src/constants/strings';
import { useChrome } from '@/src/hooks/useChrome';
import { useNow } from '@/src/hooks/useNow';
import { useAppStore } from '@/src/store';
import { addLocalDays, calendarDaysBetween, toLocalDateString } from '@/src/utils/dates';
import { validateDeadline, validateTime } from '@/src/utils/validation';

const T = S.onboarding.deadline;

function localTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'local';
  } catch {
    return 'local';
  }
}

export default function DeadlineStep() {
  const router = useRouter();
  const { c } = useChrome();
  const now = useNow();
  const draft = useAppStore((s) => s.draft);
  const updateDraft = useAppStore((s) => s.updateDraft);

  if (!draft) return null;
  const today = toLocalDateString(now);
  const v = validateDeadline(draft.deadlineDate, today);
  const tv = validateTime(draft.deadlineTime);
  const ok = v.ok && tv.ok;
  const error = !v.ok && draft.deadlineDate ? T.errors[v.error] : null;
  const hasTime = draft.deadlineTime !== null;

  return (
    <StepFrame
      headline={T.headline}
      helper={T.helper}
      footer={
        <Button
          label={`${S.common.next} →`}
          accessibilityLabel={S.common.next}
          onPress={() => ok && router.push(nextStepHref('deadline'))}
          disabled={!ok}
          style={styles.flex}
        />
      }
    >
      <DateField
        label={T.dateLabel}
        value={draft.deadlineDate}
        initial={addLocalDays(today, 30)}
        minimumDate={today}
        onChange={(deadlineDate) => updateDraft({ deadlineDate })}
        error={!!error}
      />
      {error ? (
        <AppText variant="caption" tone="danger" accessibilityRole="alert">
          ⚠ {error}
        </AppText>
      ) : null}

      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={T.addTime}
        accessibilityState={{ checked: hasTime }}
        onPress={() => updateDraft({ deadlineTime: hasTime ? null : '18:00' })}
        style={styles.checkRow}
      >
        <Checkbox checked={hasTime} />
        <AppText variant="body">{T.addTime}</AppText>
      </Pressable>
      {hasTime ? (
        <View style={styles.indent}>
          <TimeField label={T.timeLabel} value={draft.deadlineTime} onChange={(deadlineTime) => updateDraft({ deadlineTime })} />
        </View>
      ) : (
        <AppText variant="caption" tone="secondary">
          {T.endOfDay}
        </AppText>
      )}

      {v.ok ? (
        <View style={styles.info}>
          <Info size={16} color={c.textSecondary} />
          <AppText variant="caption" tone="secondary" style={styles.flex}>
            {T.info(calendarDaysBetween(today, draft.deadlineDate), localTimeZone())}
          </AppText>
        </View>
      ) : null}
    </StepFrame>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  indent: { marginLeft: 36, maxWidth: 220 },
  info: { flexDirection: 'row', gap: 8, alignItems: 'center' },
});
