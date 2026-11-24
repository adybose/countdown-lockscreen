import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { StepFrame } from '@/src/components/onboarding/StepFrame';
import { NotificationsDeniedCard } from '@/src/components/settings/NotificationsDeniedCard';
import { ReminderControls } from '@/src/components/settings/ReminderControls';
import { AppText, Button, showToast } from '@/src/components/ui';
import { S } from '@/src/constants/strings';
import { nowDate } from '@/src/services/clock';
import { ensurePermission } from '@/src/services/notifications';
import { useAppStore } from '@/src/store';

const T = S.onboarding.reminders;

export default function RemindersStep() {
  const router = useRouter();
  const draft = useAppStore((s) => s.draft);
  const reminders = useAppStore((s) => s.reminders);
  const setReminders = useAppStore((s) => s.setReminders);
  const permission = useAppStore((s) => s.notifications.permission);
  const [busy, setBusy] = useState(false);

  if (!draft) return null;

  const finish = async () => {
    setBusy(true);
    try {
      // Permission is requested here, not at launch (FR-09).
      const r = useAppStore.getState().reminders;
      if (Platform.OS !== 'web' && (r.dailyEnabled || r.milestoneEnabled)) {
        useAppStore.getState().setNotificationPermission(await ensurePermission());
      }
      const res = useAppStore.getState().commitDraft(nowDate());
      if (!res.ok) {
        showToast({ message: T.commitFailed, tone: 'error' });
        return;
      }
      router.replace('/home');
    } finally {
      setBusy(false);
    }
  };

  return (
    <StepFrame
      headline={T.headline}
      helper={T.helper}
      footer={<Button label={`${T.finish} ✓`} accessibilityLabel={T.finish} onPress={finish} loading={busy} style={styles.flex} />}
    >
      {Platform.OS === 'web' ? (
        <AppText variant="body" tone="secondary">
          {S.settings.notAvailableWeb}
        </AppText>
      ) : (
        <ReminderControls value={reminders} onChange={setReminders} />
      )}
      {permission === 'denied' ? <NotificationsDeniedCard /> : null}
    </StepFrame>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
