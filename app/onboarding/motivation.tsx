import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { StepFrame } from '@/src/components/onboarding/StepFrame';
import { nextStepHref } from '@/src/components/onboarding/steps';
import { Button, TextField } from '@/src/components/ui';
import { LIMITS } from '@/src/constants/limits';
import { S } from '@/src/constants/strings';
import { useAppStore } from '@/src/store';
import { validateMotivation } from '@/src/utils/validation';

const T = S.onboarding.motivation;

export default function MotivationStep() {
  const router = useRouter();
  const draft = useAppStore((s) => s.draft);
  const updateDraft = useAppStore((s) => s.updateDraft);

  if (!draft) return null;
  const v = validateMotivation(draft.motivation);
  const go = () => router.push(nextStepHref('motivation'));

  return (
    <StepFrame
      headline={T.headline}
      helper={T.helper}
      footer={
        <>
          <Button
            label={S.common.skip}
            variant="secondary"
            onPress={() => {
              updateDraft({ motivation: '' });
              go();
            }}
            style={styles.flex}
          />
          <Button
            label={`${S.common.next} →`}
            accessibilityLabel={S.common.next}
            onPress={() => v.ok && go()}
            disabled={!v.ok}
            style={styles.flex}
          />
        </>
      }
    >
      <TextField
        label={T.label}
        hideLabel
        value={draft.motivation}
        onChangeText={(motivation) => updateDraft({ motivation })}
        maxLength={LIMITS.motivationMax}
        showCounter
        placeholder={T.placeholder}
        multiline
        error={v.ok ? null : T.errors[v.error]}
      />
    </StepFrame>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
