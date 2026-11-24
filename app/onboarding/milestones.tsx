import { useRouter } from 'expo-router';
import { Plus, Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { MilestoneEditor } from '@/src/components/onboarding/MilestoneEditor';
import { StepFrame } from '@/src/components/onboarding/StepFrame';
import { nextStepHref } from '@/src/components/onboarding/steps';
import { AppText, Banner, Button } from '@/src/components/ui';
import { LIMITS } from '@/src/constants/limits';
import { S } from '@/src/constants/strings';
import { useChrome } from '@/src/hooks/useChrome';
import { useNow } from '@/src/hooks/useNow';
import { confirmAsync } from '@/src/services/dialog';
import { useAppStore } from '@/src/store';
import { sortMilestones } from '@/src/store/selectors';
import { formatShortDate, isLocalDate, toLocalDateString } from '@/src/utils/dates';
import { autoPlanBackward } from '@/src/utils/planner';
import { isChronological, sortMilestonesByDate, validateMilestones } from '@/src/utils/validation';

const T = S.onboarding.milestones;

export default function MilestonesStep() {
  const router = useRouter();
  const { c } = useChrome();
  const now = useNow();
  const draft = useAppStore((s) => s.draft);
  const s = useAppStore.getState();

  if (!draft) return null;
  const today = toLocalDateString(now);
  const ms = sortMilestones(draft.milestones);
  const v = validateMilestones(ms, today, draft.deadlineDate);
  const atMax = ms.length >= LIMITS.milestonesMax;
  const deadlineLabel = isLocalDate(draft.deadlineDate) ? formatShortDate(draft.deadlineDate) : '';

  const autoPlan = async () => {
    if (ms.length > 0) {
      const ok = await confirmAsync({
        title: T.autoPlanConfirmTitle,
        message: T.autoPlanConfirmBody,
        confirmLabel: T.autoPlanConfirm,
        cancelLabel: S.common.cancel,
        destructive: true,
      });
      if (!ok) return;
    }
    const start = today > draft.deadlineDate ? draft.deadlineDate : today;
    s.replaceDraftMilestones(autoPlanBackward({ today: start, deadlineDate: draft.deadlineDate, now }));
  };

  return (
    <StepFrame
      headline={T.headline(deadlineLabel)}
      helper={T.helper}
      footer={
        <Button
          label={`${S.common.next} →`}
          accessibilityLabel={S.common.next}
          onPress={() => v.ok && router.push(nextStepHref('milestones'))}
          disabled={!v.ok}
          style={styles.flex}
        />
      }
    >
      <Button label={T.autoPlan} icon={Sparkles} variant="secondary" onPress={autoPlan} />

      {ms.length === 0 ? (
        <View style={[styles.empty, { borderColor: c.border }]}>
          <AppText variant="body" tone="secondary">
            {T.empty}
          </AppText>
        </View>
      ) : null}

      {ms.map((m, i) => (
        <MilestoneEditor
          key={m.id}
          milestone={m}
          index={i}
          count={ms.length}
          today={today}
          deadlineDate={draft.deadlineDate}
          errors={v.byId[m.id] ?? []}
          onChange={(patch) => s.updateDraftMilestone(m.id, patch)}
          onMove={(dir) => s.moveDraftMilestone(m.id, dir)}
          onRemove={() => s.removeDraftMilestone(m.id)}
        />
      ))}

      {!isChronological(ms) ? (
        <Banner tone="warning" message={T.outOfOrder}>
          <Button label={T.sortByDate} variant="secondary" compact onPress={() => s.replaceDraftMilestones(sortMilestonesByDate(ms))} />
        </Banner>
      ) : null}

      <Button
        label={T.add}
        icon={Plus}
        variant="ghost"
        disabled={atMax}
        onPress={() => s.addDraftMilestone({ date: draft.deadlineDate })}
      />
      {atMax ? (
        <AppText variant="caption" tone="secondary" style={styles.center}>
          {T.max}
        </AppText>
      ) : null}
    </StepFrame>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 16, padding: 16 },
  center: { textAlign: 'center' },
});
