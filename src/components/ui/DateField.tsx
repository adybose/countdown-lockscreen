import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { S } from '@/src/constants/strings';
import { useChrome } from '@/src/hooks/useChrome';
import type { LocalDate } from '@/src/types/domain';
import { formatLongDate, isLocalDate, parseLocalDate, toLocalDateString } from '@/src/utils/dates';
import { AppText } from './AppText';
import { Button } from './Button';
import { FieldButton } from './FieldButton';

export interface DateFieldProps {
  label: string;
  value: LocalDate | '';
  onChange: (d: LocalDate) => void;
  /** Date the picker opens on when `value` is empty. */
  initial: LocalDate;
  minimumDate?: LocalDate;
  maximumDate?: LocalDate;
  error?: boolean;
  compact?: boolean;
  format?: (d: LocalDate) => string;
}

export function DateField({ label, value, onChange, initial, minimumDate, maximumDate, error, compact, format }: DateFieldProps) {
  const { c, scheme, accent } = useChrome();
  const [iosOpen, setIosOpen] = useState(false);
  const current = parseLocalDate(isLocalDate(value) ? value : initial);
  const [iosValue, setIosValue] = useState(current);
  const min = minimumDate && isLocalDate(minimumDate) ? parseLocalDate(minimumDate) : undefined;
  const max = maximumDate && isLocalDate(maximumDate) ? parseLocalDate(maximumDate) : undefined;

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'date',
        minimumDate: min,
        maximumDate: max,
        onChange: (e: DateTimePickerEvent, d?: Date) => {
          if (e.type === 'set' && d) onChange(toLocalDateString(d));
        },
      });
    } else {
      setIosValue(current);
      setIosOpen(true);
    }
  };

  const text = isLocalDate(value) ? (format ?? formatLongDate)(value) : null;

  return (
    <>
      <FieldButton
        icon={Calendar}
        text={text}
        placeholder={S.common.pickDate}
        onPress={open}
        accessibilityLabel={label}
        error={error}
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
            <View style={[styles.sheet, { backgroundColor: c.card }]} onStartShouldSetResponder={() => true}>
              <AppText variant="title">{label}</AppText>
              <View style={styles.picker}>
                <DateTimePicker
                  value={iosValue}
                  mode="date"
                  display="inline"
                  minimumDate={min}
                  maximumDate={max}
                  accentColor={accent}
                  themeVariant={scheme}
                  onChange={(_e, d) => d && setIosValue(d)}
                />
              </View>
              <Button
                label={S.common.done}
                onPress={() => {
                  onChange(toLocalDateString(iosValue));
                  setIosOpen(false);
                }}
              />
            </View>
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
