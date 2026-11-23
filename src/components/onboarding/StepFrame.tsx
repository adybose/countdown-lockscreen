import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/src/components/ui';

export interface StepFrameProps {
  headline: string;
  helper?: string;
  children: ReactNode;
  footer: ReactNode;
}

/** Shared onboarding frame (DESIGN §9.1): headline, helper, input area, sticky footer. */
export function StepFrame({ headline, helper, children, footer }: StepFrameProps) {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="headline" accessibilityRole="header">
          {headline}
        </AppText>
        {helper ? (
          <AppText variant="body" tone="secondary" style={styles.helper}>
            {helper}
          </AppText>
        ) : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>
      <View style={styles.footer}>{footer}</View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  helper: { marginTop: 8 },
  body: { marginTop: 24, gap: 16 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, flexDirection: 'row', gap: 12 },
});
