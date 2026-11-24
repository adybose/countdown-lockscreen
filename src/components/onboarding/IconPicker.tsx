import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/src/components/ui';
import { useChrome } from '@/src/hooks/useChrome';
import { ICON_COMPONENTS } from '@/src/themes/icons';
import { ICON_IDS, type IconId } from '@/src/types/domain';

export function IconPicker({
  visible,
  value,
  title,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: IconId;
  title: string;
  onSelect: (id: IconId) => void;
  onClose: () => void;
}) {
  const { c, accent } = useChrome();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
        <View style={[styles.sheet, { backgroundColor: c.card }]} onStartShouldSetResponder={() => true}>
          <AppText variant="title">{title}</AppText>
          <View style={styles.grid}>
            {ICON_IDS.map((id) => {
              const Icon = ICON_COMPONENTS[id];
              const selected = id === value;
              return (
                <Pressable
                  key={id}
                  accessibilityRole="button"
                  accessibilityLabel={`Icon ${id.replace(/-/g, ' ')}`}
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onSelect(id);
                    onClose();
                  }}
                  style={[styles.cell, { borderColor: selected ? accent : c.border }]}
                >
                  <Icon size={22} color={selected ? accent : c.text} />
                </Pressable>
              );
            })}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#00000080', justifyContent: 'center', padding: 20 },
  sheet: { borderRadius: 16, padding: 16, gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  cell: { width: 48, height: 48, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
