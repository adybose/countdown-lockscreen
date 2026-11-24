import { Check } from 'lucide-react-native';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/src/components/ui';
import { S } from '@/src/constants/strings';
import { useChrome } from '@/src/hooks/useChrome';
import type { SizePresetId } from '@/src/types/wallpaper';
import { presetsFor, resolveCanvasSize } from '@/src/utils/canvas';

export function SizePresetSheet({
  visible,
  value,
  screen,
  pixelRatio,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: SizePresetId;
  screen: { width: number; height: number };
  pixelRatio: number;
  onSelect: (id: SizePresetId) => void;
  onClose: () => void;
}) {
  const { c, accent } = useChrome();
  // Desktop presets are web-only (DESIGN §8.3).
  const presets = presetsFor(Platform.OS);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel={S.common.cancel}>
        <Pressable style={[styles.sheet, { backgroundColor: c.card }]} onPress={() => {}} accessibilityRole="none">
          <AppText variant="title" accessibilityRole="header">
            {S.studio.sizeSheetTitle}
          </AppText>
          {presets.map((p) => {
            const r = resolveCanvasSize(p.id, screen, pixelRatio);
            const selected = p.id === value;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${p.label}, ${r.px.w} by ${r.px.h}`}
                onPress={() => {
                  onSelect(p.id);
                  onClose();
                }}
                style={[styles.row, { borderColor: c.border }]}
              >
                <View style={styles.flex}>
                  <AppText variant="bodyStrong">{p.label}</AppText>
                  <AppText variant="caption" tone="secondary">
                    {r.px.w}×{r.px.h}
                  </AppText>
                </View>
                {selected ? <Check size={20} color={accent} /> : null}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#00000080', justifyContent: 'flex-end' },
  sheet: { padding: 16, gap: 4, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 56, borderBottomWidth: StyleSheet.hairlineWidth },
  flex: { flex: 1 },
});
