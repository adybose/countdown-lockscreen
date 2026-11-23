import { Text, type TextProps } from 'react-native';
import { useChrome } from '@/src/hooks/useChrome';

export type TextVariant = 'headline' | 'title' | 'body' | 'bodyStrong' | 'caption' | 'label' | 'overline';

const SIZES: Record<TextVariant, { fontSize: number; lineHeight: number; weight: 'regular' | 'semibold' | 'extrabold' }> = {
  headline: { fontSize: 28, lineHeight: 34, weight: 'extrabold' },
  title: { fontSize: 20, lineHeight: 26, weight: 'semibold' },
  body: { fontSize: 16, lineHeight: 22, weight: 'regular' },
  bodyStrong: { fontSize: 16, lineHeight: 22, weight: 'semibold' },
  caption: { fontSize: 13, lineHeight: 18, weight: 'regular' },
  label: { fontSize: 15, lineHeight: 20, weight: 'semibold' },
  overline: { fontSize: 12, lineHeight: 16, weight: 'semibold' },
};

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  tone?: 'default' | 'secondary' | 'danger' | 'success' | 'accent' | 'onAccent';
}

/** App-chrome text with Inter and chrome colors. Supports system font scaling (NFR-04). */
export function AppText({ variant = 'body', tone = 'default', style, ...rest }: AppTextProps) {
  const { c, fonts, accent, onAccent } = useChrome();
  const s = SIZES[variant];
  const color =
    tone === 'secondary'
      ? c.textSecondary
      : tone === 'danger'
        ? c.danger
        : tone === 'success'
          ? c.success
          : tone === 'accent'
            ? accent
            : tone === 'onAccent'
              ? onAccent
              : c.text;
  return (
    <Text
      maxFontSizeMultiplier={1.5}
      style={[
        {
          fontFamily: fonts[s.weight],
          fontSize: s.fontSize,
          lineHeight: s.lineHeight,
          color,
          letterSpacing: variant === 'overline' ? 1 : 0,
        },
        style,
      ]}
      {...rest}
    />
  );
}
