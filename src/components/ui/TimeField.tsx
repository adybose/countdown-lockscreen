import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { S } from '@/src/constants/strings';
import { useChrome } from '@/src/hooks/useChrome';
import type { LocalTime } from '@/src/types/domain';
import { formatTime12, isLocalTime, parseLocalTime, toLocalTimeString } from '@/src/utils/dates';
import { AppText } from './AppText';
import { Button } from './Button';
import { FieldButton } from './FieldButton';

export interface TimeFieldProps {
  label: string;
  value: LocalTime | null;
  onChange: (t: LocalTime) => void;
  compact?: boolean;
}

function toDate(t: LocalTime | null): Date {
  const { hour, minute } = isLocalTime(t) ? parseLocalTime(t) : { hour: 8, minute: 0 };
  return new Date(2000, 0, 1, hour, minute);
}

export function TimeField({ label, value, onChange, compact }: TimeFieldProps) {
  const { c, scheme, accent } = useChrome();
  const [iosOpen, setIosOpen] = useState(false);
  const [iosValue, setIosValue] = useState(toDate(value));

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: toDate(value),
        mode: 'time',
        onChange: (e: DateTimePickerEvent, d?: Date) => {
          if (e.type === 'set' && d) onChange(toLocalTimeString(d));
        },
      });
    } else {
      setIosValue(toDate(value));
      setIosOpen(true);
    }
  };

  return (
    <>
      <FieldButton
        icon={Clock}
        text={isLocalTime(value) ? formatTime12(value) : null}
        placeholder={S.common.pickTime}
        onPress={open}
        accessibilityLabel={label}
        compact={compact}
      />
      {Platform.OS === 'ios' && (
        <Modal visible={iosOpen} transparent animationType="fade" onRequestClose={() => setIosOpen(false)}>
          <Pressable
            style={styles.backdrop}
            accessibilityRole="button"
            accessibilityLabel={S.common.cancel}
            onPress={() => setIosOpen(false)}
          >
            <Pressable style={[styles.sheet, { backgroundColor: c.card }]} onPress={() => {}} accessibilityRole="none">
              <AppText variant="title">{label}</AppText>
              <View style={styles.picker}>
                <DateTimePicker
                  value={iosValue}
                  mode="time"
                  display="spinner"
                  accentColor={accent}
                  themeVariant={scheme}
                  onChange={(_e, d) => d && setIosValue(d)}
                />
              </View>
              <Button
                label={S.common.done}
                onPress={() => {
                  onChange(toLocalTimeString(iosValue));
                  setIosOpen(false);
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#00000080', justifyContent: 'flex-end' },
  sheet: { padding: 16, gap: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 32 },
  picker: { alignItems: 'center' },
});
