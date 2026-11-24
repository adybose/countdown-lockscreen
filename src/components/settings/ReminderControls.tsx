import { StyleSheet, View } from 'react-native';
import { AppText, Segmented, TimeField, Toggle } from '@/src/components/ui';
import { S } from '@/src/constants/strings';
import { MILESTONE_DAYS_BEFORE_CHOICES, type ReminderSettings } from '@/src/types/domain';

const T = S.onboarding.reminders;

export interface ReminderControlsProps {
  value: ReminderSettings;
  onChange: (patch: Partial<ReminderSettings>) => void;
}

/** Shared reminder controls for onboarding step 6 and Settings (FR-09, FR-26). */
export function ReminderControls({ value, onChange }: ReminderControlsProps) {
  return (
    <View style={styles.wrap}>
      <Toggle label={T.daily} hint={T.dailyHint} value={value.dailyEnabled} onValueChange={(dailyEnabled) => onChange({ dailyEnabled })} />
      <View style={styles.row}>
        <AppText variant="body" style={styles.flex}>
          {T.time}
        </AppText>
        <View style={styles.time}>
          <TimeField label={T.time} value={value.dailyTime} onChange={(dailyTime) => onChange({ dailyTime })} compact />
        </View>
      </View>
      <Toggle label={T.milestone} value={value.milestoneEnabled} onValueChange={(milestoneEnabled) => onChange({ milestoneEnabled })} />
      <View style={styles.daysWrap}>
        <AppText variant="caption" tone="secondary">
          {T.daysBefore} · {T.daysBeforeSuffix}
        </AppText>
        <Segmented
          accessibilityLabel={`${T.daysBefore} ${T.daysBeforeSuffix}`}
          options={MILESTONE_DAYS_BEFORE_CHOICES.map((n) => ({ value: n, label: String(n), accessibilityLabel: T.dayChoice(n) }))}
          value={value.milestoneDaysBefore}
          onChange={(milestoneDaysBefore) => onChange({ milestoneDaysBefore })}
          disabled={!value.milestoneEnabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  time: { width: 160 },
  daysWrap: { gap: 8 },
});
