import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { StepFrame } from '@/src/components/onboarding/StepFrame';
import { nextStepHref } from '@/src/components/onboarding/steps';
import { AppText, Button } from '@/src/components/ui';
import { S } from '@/src/constants/strings';
import { useChrome } from '@/src/hooks/useChrome';
import { THEME_ORDER, THEMES } from '@/src/themes';
import { useAppStore } from '@/src/store';

const T = S.onboarding.theme;

export default function ThemeStep() {
  const router = useRouter();
  const { c, accent, onAccent } = useChrome();
  const draft = useAppStore((s) => s.draft);
  const setTheme = useAppStore((s) => s.setTheme);

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
              <View style={[styles.preview, { borderColor: selected ? accent : c.border, borderWidth: selected ? 3 : 1 }]}>
                {/* Temporary swatch (T2.4); replaced by a live <Wallpaper> in T4.5. */}
                <View style={[styles.swatch, { backgroundColor: t.colors.background }]}>
                  <View style={[styles.bar, { backgroundColor: t.colors.accent }]} />
                  <View style={[styles.bar, styles.short, { backgroundColor: t.colors.accentAlt }]} />
                </View>
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
  preview: { aspectRatio: 9 / 19.5, borderRadius: 14, overflow: 'hidden' },
  swatch: { flex: 1, justifyContent: 'center', padding: 12, gap: 8 },
  bar: { height: 10, borderRadius: 5 },
  short: { width: '60%' },
  check: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  name: { textAlign: 'center' },
});
