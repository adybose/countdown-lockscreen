import { createElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useChrome } from '@/src/hooks/useChrome';
import { isLocalDate } from '@/src/utils/dates';
import type { DateFieldProps } from './DateField';

export type { DateFieldProps };

/** Web: a native `<input type="date">` (DESIGN §9.3). */
export function DateField({ label, value, onChange, minimumDate, maximumDate, error, compact }: DateFieldProps) {
  const { c, fonts } = useChrome();
  return (
    <View
      style={[
        styles.box,
        { backgroundColor: c.card, borderColor: error ? c.danger : c.border, minHeight: compact ? 44 : 52 },
      ]}
    >
      {createElement('input', {
        type: 'date',
        'aria-label': label,
        value: value || '',
        min: minimumDate,
        max: maximumDate,
        onChange: (e: { target: { value: string } }) => {
          if (isLocalDate(e.target.value)) onChange(e.target.value);
        },
        style: {
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: c.text,
          fontFamily: fonts.regular,
          fontSize: 17,
          minHeight: compact ? 42 : 50,
          colorScheme: 'light dark',
        },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12 },
});
