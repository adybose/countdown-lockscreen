import { Redirect, useRouter } from 'expo-router';
import { ImageIcon, Pencil, PartyPopper, Plus, Settings, Sparkles } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Checklist } from '@/src/components/home/Checklist';
import { CountdownHero } from '@/src/components/home/CountdownHero';
import { DualProgress } from '@/src/components/home/DualProgress';
import { NextMilestoneCard } from '@/src/components/home/NextMilestoneCard';
import { AppText, Banner, Button, IconButton } from '@/src/components/ui';
import { S } from '@/src/constants/strings';
import { useChrome } from '@/src/hooks/useChrome';
import { useNow } from '@/src/hooks/useNow';
import { nowDate } from '@/src/services/clock';
import { confirmAsync } from '@/src/services/dialog';
import { useAppStore } from '@/src/store';
import { sortMilestones } from '@/src/store/selectors';
import {
  daysPast,
  formatLongDate,
  formatShortDate,
  getCountdownParts,
  getCountdownStatus,
  localDateOfInstant,
  toLocalDateString,
} from '@/src/utils/dates';
import { getNextMilestone, getProgress } from '@/src/utils/progress';

export default function Home() {
  const router = useRouter();
  const { c } = useChrome();
  const now = useNow();
  const countdown = useAppStore((s) => s.countdown);
  const toggleMilestone = useAppStore((s) => s.toggleMilestone);

  if (!countdown) return <Redirect href="/onboarding/goal" />;

  const today = toLocalDateString(now);
  const status = getCountdownStatus(now, countdown);
  const parts = getCountdownParts(now, countdown);
  const milestones = sortMilestones(countdown.milestones);
  const next = status === 'completed' ? null : getNextMilestone(now, countdown);
  const progress = getProgress(now, countdown);

  const editPlan = () => router.push('/onboarding/goal?mode=edit');
  const startNew = async () => {
    const ok = await confirmAsync({
      title: S.home.startNewConfirmTitle,
      message: S.home.startNewConfirmBody,
      confirmLabel: S.home.startNewConfirm,
      cancelLabel: S.common.cancel,
      destructive: true,
    });
    if (!ok) return;
    useAppStore.getState().resetCountdown();
    router.replace('/onboarding/goal');
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.flex}>
            <AppText variant="title" accessibilityRole="header" numberOfLines={2}>
              {countdown.emoji ? `${countdown.emoji} ` : ''}
              {countdown.title}
            </AppText>
            <AppText variant="caption" tone="secondary">
              📅 {formatLongDate(countdown.deadlineDate)}
            </AppText>
          </View>
          <IconButton icon={Settings} accessibilityLabel={S.home.settings} onPress={() => router.push('/settings')} />
        </View>

        <CountdownHero status={status} parts={parts} daysPast={daysPast(now, countdown)} />

        {status === 'overdue' ? (
          <Banner tone="error" title={S.home.overdueCardTitle} message={S.wallpaper.overdueMotivation}>
            <Button label={S.home.markComplete} compact onPress={() => useAppStore.getState().markComplete(nowDate())} />
            <Button label={S.home.setNewDeadline} variant="secondary" compact onPress={() => router.push('/onboarding/deadline?mode=edit')} />
          </Banner>
        ) : null}

        {status === 'completed' && countdown.completedAt ? (
          <Banner tone="info" icon={PartyPopper} title={S.home.completedTitle(formatShortDate(localDateOfInstant(countdown.completedAt)))} message="">
            <Button label={S.home.startNew} compact onPress={startNew} />
          </Banner>
        ) : null}

        {next ? <NextMilestoneCard milestone={next} deadlineDate={countdown.deadlineDate} today={today} /> : null}

        <DualProgress progress={progress} />

        <AppText variant="label" accessibilityRole="header" style={styles.section}>
          {S.home.checklist}
        </AppText>
        {milestones.length > 0 ? (
          <Checklist
            milestones={milestones}
            deadlineDate={countdown.deadlineDate}
            nextId={next?.id ?? null}
            onToggle={(id) => toggleMilestone(id, nowDate())}
          />
        ) : (
          <Banner tone="info" title={S.home.breakItDown} message={S.home.breakItDownBody}>
            <Button
              label={S.home.autoPlan}
              icon={Sparkles}
              compact
              onPress={() => router.push('/onboarding/milestones?mode=edit&autoplan=1')}
            />
            <Button label={S.home.add} icon={Plus} variant="secondary" compact onPress={() => router.push('/onboarding/milestones?mode=edit')} />
          </Banner>
        )}
      </ScrollView>

      <View style={[styles.actions, { borderTopColor: c.border, backgroundColor: c.bg }]}>
        <Button label={S.home.generate} icon={ImageIcon} onPress={() => router.push('/studio')} />
        <Button label={S.home.editPlan} icon={Pencil} variant="secondary" onPress={editPlan} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  section: { marginTop: 8 },
  actions: { padding: 16, gap: 10, borderTopWidth: StyleSheet.hairlineWidth },
});
