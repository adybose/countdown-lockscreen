import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/src/components/ui';
import { S } from '@/src/constants/strings';
import { useChrome } from '@/src/hooks/useChrome';
import type { WallpaperPreferences } from '@/src/types/domain';

type ToggleKey = 'showMotivation' | 'showCompleted' | 'showProgress' | 'showSafeZones';
const KEYS: ToggleKey[] = ['showMotivation', 'showCompleted', 'showProgress', 'showSafeZones'];

/** The 4 visibility toggles (FR-16); persisted through the store. */
export function OptionToggles({ value, onChange }: { value: WallpaperPreferences; onChange: (patch: Partial<WallpaperPreferences>) => void }) {
  const { c, accent, onAccent } = useChrome();
  return (
    <View style={styles.wrap}>
      {KEYS.map((k) => {
        const on = value[k];
        return (
          <Pressable
            key={k}
            accessibilityRole="switch"
            accessibilityLabel={S.studio.toggles[k]}
            accessibilityState={{ checked: on }}
            onPress={() => onChange({ [k]: !on })}
            style={[styles.chip, { borderColor: on ? accent : c.border, backgroundColor: on ? accent : 'transparent' }]}
          >
            <AppText variant="label" style={{ color: on ? onAccent : c.textSecondary }}>
              {on ? '● ' : '○ '}
              {S.studio.toggles[k]}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  chip: { minHeight: 44, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, justifyContent: 'center' },
});
