import { useRouter } from 'expo-router';
import { ChevronDown, ChevronRight, Images, X } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Button, IconButton } from '@/src/components/ui';
import { S } from '@/src/constants/strings';
import { useChrome } from '@/src/hooks/useChrome';

const T = S.iosGuide;

/** "How to set as Lock Screen" for iOS (FR-22, ADR-002). */
export default function IosGuide() {
  const router = useRouter();
  const { c, accent, onAccent } = useChrome();
  const [open, setOpen] = useState(false);

  const openPhotos = () => {
    Linking.openURL('photos-redirect://').catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.bg }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header" style={styles.flex}>
          {T.title}
        </AppText>
        <IconButton icon={X} accessibilityLabel={T.close} onPress={() => (router.canGoBack() ? router.back() : router.replace('/studio'))} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {T.steps.map((step, i) => (
          <View key={step} style={styles.step}>
            <View style={[styles.num, { backgroundColor: accent }]}>
              <AppText variant="label" style={{ color: onAccent }}>
                {i + 1}
              </AppText>
            </View>
            <View style={styles.flex}>
              <AppText variant="body">{step}</AppText>
              {i === 0 ? <Button label={T.openPhotos} icon={Images} variant="secondary" compact onPress={openPhotos} style={styles.inline} /> : null}
            </View>
          </View>
        ))}

        <View style={[styles.tip, { backgroundColor: c.card, borderColor: c.border }]}>
          <AppText variant="caption" tone="secondary">
            {T.tip}
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={T.shortcutsTitle}
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen((v) => !v)}
          style={[styles.collapse, { borderColor: c.border }]}
        >
          {open ? <ChevronDown size={20} color={c.text} /> : <ChevronRight size={20} color={c.text} />}
          <AppText variant="bodyStrong" style={styles.flex}>
            {T.shortcutsTitle}
          </AppText>
        </Pressable>
        {open ? (
          <View style={styles.shortcuts}>
            {T.shortcutsSteps.map((s, i) => (
              <AppText key={s} variant="body">
                {i + 1}. {s}
              </AppText>
            ))}
            <AppText variant="caption" tone="secondary">
              {T.shortcutsNote}
            </AppText>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingRight: 8, minHeight: 56 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  num: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  inline: { alignSelf: 'flex-start', marginTop: 8 },
  tip: { borderWidth: 1, borderRadius: 12, padding: 12 },
  collapse: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, borderTopWidth: StyleSheet.hairlineWidth },
  shortcuts: { gap: 8, paddingLeft: 28 },
});
