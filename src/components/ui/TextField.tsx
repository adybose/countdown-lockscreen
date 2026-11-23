import type { ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { useChrome } from '@/src/hooks/useChrome';
import { S } from '@/src/constants/strings';
import { AppText } from './AppText';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  maxLength?: number;
  showCounter?: boolean;
  error?: string | null;
  leading?: ReactNode;
  hideLabel?: boolean;
}

export function TextField({
  label,
  value,
  onChangeText,
  maxLength,
  showCounter,
  error,
  leading,
  hideLabel,
  multiline,
  ...rest
}: TextFieldProps) {
  const { c, fonts, accent } = useChrome();
  return (
    <View style={styles.wrap}>
      {!hideLabel && (
        <AppText variant="caption" tone="secondary">
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.box,
          { backgroundColor: c.card, borderColor: error ? c.danger : c.border, minHeight: multiline ? 88 : 52 },
        ]}
      >
        {leading}
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
          multiline={multiline}
          placeholderTextColor={c.textSecondary}
          selectionColor={accent}
          maxFontSizeMultiplier={1.5}
          style={[
            styles.input,
            { color: c.text, fontFamily: fonts.regular, textAlignVertical: multiline ? 'top' : 'center' },
          ]}
          {...rest}
        />
      </View>
      <View style={styles.meta}>
        <AppText variant="caption" tone="danger" style={styles.error} accessibilityLiveRegion="polite">
          {error ?? ''}
        </AppText>
        {showCounter && maxLength ? (
          <AppText variant="caption" tone="secondary">
            {S.common.counter(value.length, maxLength)}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  box: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12 },
  input: { flex: 1, fontSize: 17, paddingVertical: 12 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  error: { flex: 1 },
});
