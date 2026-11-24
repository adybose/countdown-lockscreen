import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, CircleCheck, Download, TriangleAlert, Upload } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationsDeniedCard } from '@/src/components/settings/NotificationsDeniedCard';
import { ReminderControls } from '@/src/components/settings/ReminderControls';
import { SectionTitle, SettingsRow } from '@/src/components/settings/SettingsRow';
import { AppText, Banner, IconButton, showToast } from '@/src/components/ui';
import { S } from '@/src/constants/strings';
import { useChrome } from '@/src/hooks/useChrome';
import { nowDate } from '@/src/services/clock';
import { confirmAsync } from '@/src/services/dialog';
import { ensurePermission } from '@/src/services/notifications';
import { pickImportFile, writeAndShareExport } from '@/src/services/planFile';
import { useAppStore } from '@/src/store';
import type { ReminderSettings } from '@/src/types/domain';
import { exportFileName, exportPlan, importPlan, serializePlan, type ImportError } from '@/src/utils/planFile';

const T = S.settings;

function importErrorMessage(e: ImportError): string {
  return e.code === 'invalid-field' ? T.importErrors['invalid-field'](e.path) : T.importErrors[e.code];
}

export default function Settings() {
  const router = useRouter();
  const { c } = useChrome();
  const countdown = useAppStore((s) => s.countdown);
  const reminders = useAppStore((s) => s.reminders);
  const permission = useAppStore((s) => s.notifications.permission);
  const [importError, setImportError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const isWeb = Platform.OS === 'web';

  const onRemindersChange = async (patch: Partial<ReminderSettings>) => {
    // Store change → useNotificationSync → syncNotifications() (AC-26).
    useAppStore.getState().setReminders(patch);
    if (patch.dailyEnabled === true || patch.milestoneEnabled === true) {
      useAppStore.getState().setNotificationPermission(await ensurePermission());
    }
  };

  const onExport = async () => {
    const s = useAppStore.getState();
    if (!s.countdown) return;
    setBusy('export');
    try {
      const now = nowDate();
      const json = serializePlan(exportPlan({ countdown: s.countdown, reminders: s.reminders, preferences: s.preferences }, now));
      const ok = await writeAndShareExport(json, exportFileName(now));
      if (!ok) showToast({ message: S.studio.shareUnavailable, tone: 'error' });
    } catch {
      showToast({ message: T.exportFailed, tone: 'error' });
    } finally {
      setBusy(null);
    }
  };

  const onImport = async () => {
    setImportError(null);
    setBusy('import');
    try {
      const text = await pickImportFile();
      if (text === null) return;
      const res = importPlan(text, nowDate());
      if (!res.ok) {
        setImportError(importErrorMessage(res.error));
        return;
      }
      const ok = await confirmAsync({
        title: T.importConfirmTitle,
        message: T.importConfirmBody(res.plan.countdown.title),
        confirmLabel: T.importConfirm,
        cancelLabel: S.common.cancel,
        destructive: true,
      });
      if (!ok) return;
      useAppStore.getState().importPlan(res.plan);
      showToast({ message: T.imported, tone: 'success' });
    } catch {
      setImportError(T.importErrors['invalid-json']);
    } finally {
      setBusy(null);
    }
  };

  const onMarkComplete = async () => {
    const ok = await confirmAsync({ title: T.markComplete, message: T.markCompleteConfirm, confirmLabel: S.common.ok, cancelLabel: S.common.cancel });
    if (ok) useAppStore.getState().markComplete(nowDate());
  };

  const onReset = async () => {
    const ok = await confirmAsync({
      title: T.resetConfirmTitle,
      message: T.resetConfirmBody,
      confirmLabel: T.resetConfirm,
      cancelLabel: S.common.cancel,
      destructive: true,
    });
    if (!ok) return;
    useAppStore.getState().resetCountdown();
    router.replace('/onboarding/goal');
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.bg }]}>
      <View style={styles.header}>
        <IconButton icon={ChevronLeft} accessibilityLabel={S.common.back} onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))} />
        <AppText variant="title" accessibilityRole="header">
          {T.title}
        </AppText>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle>{T.reminders}</SectionTitle>
        {isWeb ? (
          <AppText variant="body" tone="secondary">
            {T.notAvailableWeb}
          </AppText>
        ) : (
          <>
            <ReminderControls value={reminders} onChange={onRemindersChange} />
            <View style={styles.permRow}>
              <AppText variant="body" style={styles.flex}>
                {T.permission}: {T.permissionValue[permission]}
              </AppText>
            </View>
            {permission === 'denied' ? <NotificationsDeniedCard /> : null}
          </>
        )}

        <SectionTitle>{T.data}</SectionTitle>
        <SettingsRow label={T.export} icon={Upload} onPress={onExport} disabled={!countdown || busy !== null} />
        <SettingsRow label={T.import} icon={Download} onPress={onImport} disabled={busy !== null} />
        {importError ? <Banner tone="error" message={importError} /> : null}

        <SectionTitle>{T.deadline}</SectionTitle>
        <SettingsRow label={T.editPlan} icon={ChevronRight} onPress={() => router.push('/onboarding/goal?mode=edit')} disabled={!countdown} />
        <SettingsRow label={T.markComplete} icon={CircleCheck} onPress={onMarkComplete} disabled={!countdown || !!countdown.completedAt} />
        <SettingsRow label={T.reset} icon={TriangleAlert} onPress={onReset} destructive disabled={!countdown} />

        <SectionTitle>{T.about}</SectionTitle>
        <AppText variant="caption" tone="secondary">
          {T.aboutLine(version)}
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, minHeight: 52 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  permRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44, marginTop: 8 },
});
