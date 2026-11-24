import { StyleSheet, Text, View } from 'react-native';
import { AppText } from '@/src/components/ui';
import { S } from '@/src/constants/strings';
import { useChrome } from '@/src/hooks/useChrome';
import type { CountdownStatus } from '@/src/types/domain';
import type { CountdownParts } from '@/src/utils/dates';

const pad = (n: number) => (n < 10 ? `0${n}` : String(n));

export interface CountdownHeroProps {
  status: CountdownStatus;
  parts: CountdownParts;
  daysPast: number;
}

/** Live `days : hrs : min` (FR-10) plus today / overdue variants (DESIGN §10.4). */
export function CountdownHero({ status, parts, daysPast }: CountdownHeroProps) {
  const { c, fonts, accent } = useChrome();
  const big = { fontFamily: fonts.extrabold, color: c.text, fontVariant: ['tabular-nums' as const] };

  if (status === 'today') {
    return (
      <View style={styles.wrap} accessible accessibilityLabel={`${S.home.todayHero}, ${S.home.todayLeft(parts.hours, parts.minutes)}`}>
        <Text maxFontSizeMultiplier={1.2} style={[styles.big, big, { color: accent }]}>
          {S.home.todayHero}
        </Text>
        <AppText variant="title" tone="secondary">
          {S.home.todayLeft(parts.hours + parts.days * 24, parts.minutes)}
        </AppText>
      </View>
    );
  }

  if (status === 'overdue') {
    return (
      <View style={styles.wrap} accessible accessibilityRole="header">
        <Text maxFontSizeMultiplier={1.2} style={[styles.medium, big, { color: c.danger }]}>
          {S.home.overdueHero(daysPast)}
        </Text>
      </View>
    );
  }

  if (status === 'completed') return null;

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="timer"
      accessibilityLabel={S.home.countdownA11y(parts.days, parts.hours, parts.minutes)}
    >
      <View style={styles.row}>
        <Unit value={String(parts.days)} label={S.home.units.days} bigStyle={big} />
        <Text style={[styles.big, big, styles.colon]}>:</Text>
        <Unit value={pad(parts.hours)} label={S.home.units.hrs} bigStyle={big} />
        <Text style={[styles.big, big, styles.colon]}>:</Text>
        <Unit value={pad(parts.minutes)} label={S.home.units.min} bigStyle={big} />
      </View>
    </View>
  );
}

function Unit({ value, label, bigStyle }: { value: string; label: string; bigStyle: object }) {
  return (
    <View style={styles.unit}>
      <Text maxFontSizeMultiplier={1.2} style={[styles.big, bigStyle]}>
        {value}
      </Text>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 16, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  unit: { alignItems: 'center', minWidth: 72 },
  big: { fontSize: 56, lineHeight: 64 },
  medium: { fontSize: 34, lineHeight: 42, textAlign: 'center' },
  colon: { opacity: 0.4, marginHorizontal: 2 },
});
