import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { StepFrame } from '@/src/components/onboarding/StepFrame';
import { nextStepHref } from '@/src/components/onboarding/steps';
import { AppText, Banner, Button, TextField } from '@/src/components/ui';
import { LIMITS } from '@/src/constants/limits';
import { S } from '@/src/constants/strings';
import { useChrome } from '@/src/hooks/useChrome';
import { useAppStore } from '@/src/store';
import { validateGoal } from '@/src/utils/validation';

const QUICK_PICKS = ['🎯', '🎓', '✈️', '💰', '💼', '🏃', '📚', '🚀', '❤️'] as const;
const T = S.onboarding.goal;

export default function GoalStep() {
  const router = useRouter();
  const { c, accent } = useChrome();
  const draft = useAppStore((s) => s.draft);
  const updateDraft = useAppStore((s) => s.updateDraft);
  const storageError = useAppStore((s) => s.meta.storageError);
  const [touched, setTouched] = useState(false);

  if (!draft) return null;
  const v = validateGoal(draft.title);
  const error = touched && !v.ok ? T.errors[v.error] : null;

  const next = () => {
    if (!v.ok) return;
    if (storageError) useAppStore.getState().clearStorageError();
    router.push(nextStepHref('goal'));
  };

  return (
    <StepFrame
      headline={T.headline}
      helper={T.helper}
      footer={<Button label={`${S.common.next} →`} accessibilityLabel={S.common.next} onPress={next} disabled={!v.ok} style={styles.flex} />}
    >
      {storageError ? <Banner tone="warning" message={S.home.storageError} /> : null}
      <TextField
        label={T.label}
        hideLabel
        value={draft.title}
        onChangeText={(title) => {
          setTouched(true);
          updateDraft({ title });
        }}
        onBlur={() => setTouched(true)}
        maxLength={LIMITS.goalTitleMax}
        showCounter
        placeholder={T.placeholder}
        error={error}
        returnKeyType="next"
        onSubmitEditing={next}
        autoFocus={draft.title.length === 0}
        leading={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={draft.emoji ? `${T.emojiClear} ${draft.emoji}` : T.emojiLabel}
            onPress={() => updateDraft({ emoji: null })}
            style={[styles.emojiBtn, { borderColor: c.border }]}
          >
            <AppText style={[styles.emoji, !draft.emoji && styles.dim]}>{draft.emoji ?? '🎯'}</AppText>
          </Pressable>
        }
      />
      <View style={styles.picksWrap}>
        <AppText variant="caption" tone="secondary">
          {T.quickPicks}
        </AppText>
        <View style={styles.picks}>
          {QUICK_PICKS.map((e) => {
            const selected = draft.emoji === e;
            return (
              <Pressable
                key={e}
                accessibilityRole="button"
                accessibilityLabel={T.quickPickLabel(e)}
                accessibilityState={{ selected }}
                onPress={() => updateDraft({ emoji: selected ? null : e })}
                style={[styles.pick, { borderColor: selected ? accent : c.border, backgroundColor: c.card }]}
              >
                <AppText style={styles.emoji}>{e}</AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </StepFrame>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  emojiBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, marginRight: 8 },
  emoji: { fontSize: 24, lineHeight: 30 },
  dim: { opacity: 0.4 },
  picksWrap: { gap: 8 },
  picks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pick: { width: 48, height: 48, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
