import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { StepFrame } from '@/src/components/onboarding/StepFrame';
import { nextStepHref } from '@/src/components/onboarding/steps';
import { AppText, Button } from '@/src/components/ui';
import { WallpaperPreview } from '@/src/components/wallpaper';
import { S } from '@/src/constants/strings';
import { useCanvasSize } from '@/src/hooks/useCanvasSize';
import { useChrome } from '@/src/hooks/useChrome';
import { useNow } from '@/src/hooks/useNow';
import { THEME_ORDER, THEMES } from '@/src/themes';
import { useAppStore } from '@/src/store';
import type { WallpaperRenderOptions } from '@/src/types/wallpaper';
import { safeZoneFor } from '@/src/utils/canvas';

const T = S.onboarding.theme;

export default function ThemeStep() {
  const router = useRouter();
  const { c, accent, onAccent } = useChrome();
  const draft = useAppStore((s) => s.draft);
  const setTheme = useAppStore((s) => s.setTheme);
  const now = useNow();
  const canvas = useCanvasSize('device');
  const [cellW, setCellW] = useState(150);
  const nowIso = now.toISOString();
  const options = useMemo<WallpaperRenderOptions>(
    () => ({
      now: nowIso,
      showMotivation: true,
      showCompleted: true,
      showProgress: true,
      orientation: 'portrait',
      safeZone: safeZoneFor('portrait'),
    }),
    [nowIso],
  );

  if (!draft) return null;

  return (
    <StepFrame
      headline={T.headline}
      helper={T.helper}
      footer={
        <Button
          label={`${S.common.next} →`}
          accessibilityLabel={S.common.next}
          onPress={() => router.push(nextStepHref('theme'))}
          style={styles.flex}
        />
      }
    >
      <View style={styles.grid}>
        {THEME_ORDER.map((id) => {
          const t = THEMES[id];
          const selected = draft.themeId === id;
          return (
            <Pressable
              key={id}
              accessibilityRole="radio"
              accessibilityLabel={T.cardLabel(t.name, selected)}
              accessibilityState={{ selected }}
              onPress={() => setTheme(id)}
              style={styles.cell}
            >
              <View
                onLayout={(e) => setCellW(e.nativeEvent.layout.width)}
                style={[styles.preview, { borderColor: selected ? accent : c.border, borderWidth: selected ? 3 : 1 }]}
              >
                {cellW > 0 ? (
                  <WallpaperPreview countdown={draft} theme={id} size={canvas.layout} options={options} boxWidth={cellW - (selected ? 6 : 2)} />
                ) : null}
                {selected ? (
                  <View style={[styles.check, { backgroundColor: accent }]}>
                    <Check size={14} color={onAccent} strokeWidth={3} />
                  </View>
                ) : null}
              </View>
              <AppText variant="label" style={styles.name}>
                {t.name}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </StepFrame>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  cell: { width: '47%', gap: 8 },
  preview: { borderRadius: 14, overflow: 'hidden', alignItems: 'center' },
  check: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  name: { textAlign: 'center' },
});
