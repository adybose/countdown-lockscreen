import { Stack, useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ONBOARDING_STEPS, stepIndexFromPath } from '@/src/components/onboarding/steps';
import { StepHeader } from '@/src/components/ui';
import { useChrome } from '@/src/hooks/useChrome';
import { useAppStore } from '@/src/store';

export default function OnboardingLayout() {
  const { mode } = useGlobalSearchParams<{ mode?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { c } = useChrome();
  const isEdit = useAppStore((s) => s.draft?.mode === 'edit');
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const s = useAppStore.getState();
    if (mode === 'edit') s.startDraft('edit');
    else if (!s.draft) s.startDraft('create');
  }, [mode]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  const step = stepIndexFromPath(pathname) + 1;
  const canBack = step > 1 || isEdit;
  const onBack = () => {
    if (step === 1 && isEdit) useAppStore.getState().discardDraft();
    if (router.canGoBack()) router.back();
    else router.replace(isEdit ? '/home' : '/onboarding/goal');
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.bg }]} edges={['top', 'bottom', 'left', 'right']}>
      <StepHeader step={step} total={ONBOARDING_STEPS.length} onBack={canBack ? onBack : undefined} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: reduceMotion ? 'none' : 'slide_from_right',
          contentStyle: { backgroundColor: c.bg },
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
