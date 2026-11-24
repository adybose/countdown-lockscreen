import { Redirect, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Linking, PixelRatio, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionBar } from '@/src/components/studio/ActionBar';
import { CaptureHost } from '@/src/components/studio/CaptureHost';
import { OptionToggles } from '@/src/components/studio/OptionToggles';
import { SizePresetSheet } from '@/src/components/studio/SizePresetSheet';
import { ThemeChips } from '@/src/components/studio/ThemeChips';
import { AppText, Banner, IconButton, showToast } from '@/src/components/ui';
import { SafeZoneOverlay, WallpaperPreview } from '@/src/components/wallpaper';
import { S } from '@/src/constants/strings';
import { useAppReady } from '@/src/hooks/useAppReady';
import { useCanvasSize } from '@/src/hooks/useCanvasSize';
import { useChrome } from '@/src/hooks/useChrome';
import { useNow } from '@/src/hooks/useNow';
import { useWallpaperCapture } from '@/src/hooks/useWallpaperCapture';
import { nowDate } from '@/src/services/clock';
import { saveToGallery } from '@/src/services/media';
import { sharePng } from '@/src/services/share';
import { useAppStore } from '@/src/store';
import type { WallpaperRenderOptions } from '@/src/types/wallpaper';
import { safeZoneFor } from '@/src/utils/canvas';
import { buildWallpaperModel, summarizeModel } from '@/src/utils/wallpaperModel';
import { THEMES } from '@/src/themes';

export default function Studio() {
  const router = useRouter();
  const { c } = useChrome();
  const now = useNow();
  const { fontsLoaded } = useAppReady();
  const window = useWindowDimensions();
  const countdown = useAppStore((s) => s.countdown);
  const prefs = useAppStore((s) => s.preferences);
  const setPreferences = useAppStore((s) => s.setPreferences);
  const setCountdownTheme = useAppStore((s) => s.setCountdownTheme);
  const canvas = useCanvasSize(prefs.sizePresetId);
  const { job, hostRef, onHostLayout, capture, busy } = useWallpaperCapture(canvas.px, canvas.layout);
  const [sheet, setSheet] = useState(false);

  const nowIso = now.toISOString();
  const options = useMemo<WallpaperRenderOptions>(
    () => ({
      now: nowIso,
      showMotivation: prefs.showMotivation,
      showCompleted: prefs.showCompleted,
      showProgress: prefs.showProgress,
      orientation: canvas.orientation,
      safeZone: safeZoneFor(canvas.orientation),
    }),
    [nowIso, prefs.showMotivation, prefs.showCompleted, prefs.showProgress, canvas.orientation],
  );

  if (!countdown) return <Redirect href="/onboarding/goal" />;

  const theme = countdown.themeId;
  const aspect = canvas.layout.width / canvas.layout.height;
  const boxW = Math.min(window.width - 32, window.height * 0.52 * aspect);
  const boxH = boxW / aspect;
  const summary = summarizeModel(buildWallpaperModel(countdown, options, THEMES[theme]));

  /** Freeze `now`, render the host, capture. Returns the PNG uri or null (toast shown). */
  const render = async (): Promise<string | null> => {
    try {
      const at = nowDate();
      const res = await capture(at);
      useAppStore.getState().setLastRenderedAt(at.toISOString());
      return res.uri;
    } catch {
      showToast({ message: S.studio.captureFailed, tone: 'error' });
      return null;
    }
  };

  const share = async (uri?: string) => {
    const file = uri ?? (await render());
    if (!file) return;
    try {
      const ok = await sharePng(file);
      if (!ok) showToast({ message: S.studio.shareUnavailable, tone: 'error' });
    } catch {
      showToast({ message: S.studio.shareUnavailable, tone: 'error' });
    }
  };

  const save = async () => {
    const uri = await render();
    if (!uri) return;
    const res = await saveToGallery(uri);
    if (res.ok) {
      showToast({ message: S.studio.saved, tone: 'success' });
      if (Platform.OS === 'ios') router.push('/ios-guide'); // ADR-002: guide right after saving
      return;
    }
    if (res.reason === 'denied') {
      showToast({
        message: S.studio.photosDenied,
        tone: 'error',
        actions: [
          { label: S.common.openSettings, onPress: () => Linking.openSettings() },
          { label: S.studio.shareInstead, onPress: () => share(uri) },
        ],
      });
      return;
    }
    showToast({ message: S.studio.saveFailed, tone: 'error', actions: [{ label: S.studio.share, onPress: () => share(uri) }] });
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.bg }]}>
      <View style={styles.header}>
        <IconButton icon={ChevronLeft} accessibilityLabel={S.studio.back} onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))} />
        <AppText variant="title" accessibilityRole="header" style={styles.flex}>
          {S.studio.title}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={S.studio.sizeChipA11y(`${canvas.px.w}×${canvas.px.h}`)}
          onPress={() => setSheet(true)}
          style={[styles.sizeChip, { borderColor: c.border }]}
        >
          <AppText variant="label">
            {canvas.px.w}×{canvas.px.h}
          </AppText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!fontsLoaded ? <Banner tone="warning" message={S.studio.fontsFailed} /> : null}
        <View style={styles.previewWrap}>
          <WallpaperPreview
            countdown={countdown}
            theme={theme}
            size={canvas.layout}
            options={options}
            boxWidth={boxW}
            borderRadius={12}
            accessibilityLabel={S.studio.previewA11y(summary)}
            overlay={prefs.showSafeZones ? <SafeZoneOverlay width={boxW} height={boxH} safeZone={options.safeZone} /> : null}
          />
        </View>
        {busy ? (
          <AppText variant="caption" tone="secondary" style={styles.center} accessibilityLiveRegion="polite">
            {S.studio.rendering(canvas.px.w, canvas.px.h)}
          </AppText>
        ) : null}
        <ThemeChips value={theme} onChange={setCountdownTheme} />
        <OptionToggles value={prefs} onChange={setPreferences} />
        <ActionBar
          busy={busy}
          onSave={save}
          onShare={() => share()}
          onHowTo={Platform.OS === 'ios' ? () => router.push('/ios-guide') : undefined}
        />
      </ScrollView>

      {job ? (
        <CaptureHost
          hostRef={hostRef}
          onLayout={onHostLayout}
          countdown={countdown}
          theme={theme}
          layout={canvas.layout}
          options={{ ...options, now: job.now }}
        />
      ) : null}

      <SizePresetSheet
        visible={sheet}
        value={prefs.sizePresetId}
        screen={{ width: window.width, height: window.height }}
        pixelRatio={PixelRatio.get()}
        onSelect={(sizePresetId) => setPreferences({ sizePresetId })}
        onClose={() => setSheet(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, minHeight: 52 },
  sizeChip: { minHeight: 44, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, justifyContent: 'center', marginRight: 8 },
  content: { gap: 16, paddingBottom: 32, paddingTop: 8 },
  previewWrap: { alignItems: 'center', paddingHorizontal: 16 },
  center: { textAlign: 'center' },
});
