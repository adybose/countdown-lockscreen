import { Text, type TextProps, type TextStyle } from 'react-native';
import type { FontKey } from '@/src/types/theme';

export interface WTextProps extends Omit<TextProps, 'style'> {
  font: FontKey;
  size: number;
  color: string;
  style?: TextStyle | TextStyle[];
  lineHeight?: number;
}

/** Wallpaper text: fixed scale (never follows system font size) so the PNG is deterministic. */
export function WText({ font, size, color, style, lineHeight, ...rest }: WTextProps) {
  return (
    <Text
      allowFontScaling={false}
      style={[{ fontFamily: font, fontSize: size, color, lineHeight: lineHeight ?? size * 1.2 }, style as TextStyle]}
      {...rest}
    />
  );
}
