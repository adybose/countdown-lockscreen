import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { StepFrame } from '@/src/components/onboarding/StepFrame';
import { ReminderControls } from '@/src/components/settings/ReminderControls';
import { Button, showToast } from '@/src/components/ui';
import { S } from '@/src/constants/strings';
import { nowDate } from '@/src/services/clock';
import { useAppStore } from '@/src/store';

const T = S.onboarding.reminders;

export default function RemindersStep() {
  const router = useRouter();
  const draft = useAppStore((s) => s.draft);
  const reminders = useAppStore((s) => s.reminders);
  const setReminders = useAppStore((s) => s.setReminders);
  const [busy, setBusy] = useState(false);

  if (!draft) return null;

  const finish = async () => {
    setBusy(true);
    try {
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
      <ReminderControls value={reminders} onChange={setReminders} />
    </StepFrame>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
