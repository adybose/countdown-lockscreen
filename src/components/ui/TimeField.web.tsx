import { createElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useChrome } from '@/src/hooks/useChrome';
import { isLocalTime } from '@/src/utils/dates';
import type { TimeFieldProps } from './TimeField';

export type { TimeFieldProps };

/** Web: a native `<input type="time">`. */
export function TimeField({ label, value, onChange, compact }: TimeFieldProps) {
  const { c, fonts } = useChrome();
  return (
    <View style={[styles.box, { backgroundColor: c.card, borderColor: c.border, minHeight: compact ? 44 : 52 }]}>
      {createElement('input', {
        type: 'time',
        'aria-label': label,
        value: value ?? '',
        onChange: (e: { target: { value: string } }) => {
          if (isLocalTime(e.target.value)) onChange(e.target.value);
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
