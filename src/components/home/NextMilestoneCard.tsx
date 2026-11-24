import { StyleSheet, View } from 'react-native';
import { AppText } from '@/src/components/ui';
import { S } from '@/src/constants/strings';
import { useChrome } from '@/src/hooks/useChrome';
import { ICON_COMPONENTS } from '@/src/themes/icons';
import type { LocalDate, Milestone } from '@/src/types/domain';
import { calendarDaysBetween, formatTMinusLabel } from '@/src/utils/dates';

export function NextMilestoneCard({ milestone, deadlineDate, today }: { milestone: Milestone; deadlineDate: LocalDate; today: LocalDate }) {
  const { c, accent } = useChrome();
  const Icon = ICON_COMPONENTS[milestone.icon];
  const label = formatTMinusLabel(milestone, { deadlineDate });
  const when = S.home.inDays(calendarDaysBetween(today, milestone.date));
  return (
    <View
      accessible
      accessibilityLabel={`${S.home.nextMilestone}: ${milestone.title}, ${label}, ${when}`}
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border, borderLeftColor: accent }]}
    >
      <AppText variant="overline" tone="accent">
        {S.home.nextMilestone}
      </AppText>
      <View style={styles.row}>
        <Icon size={18} color={accent} />
        <AppText variant="label">{label}</AppText>
      </View>
      <AppText variant="title">{milestone.title}</AppText>
      <AppText variant="caption" tone="secondary">
        {when}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderLeftWidth: 4, borderRadius: 16, padding: 14, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
