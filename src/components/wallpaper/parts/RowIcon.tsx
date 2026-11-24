import { View } from 'react-native';
import { ICON_COMPONENTS } from '@/src/themes/icons';
import type { IconId } from '@/src/types/domain';
import type { ThemeTokens } from '@/src/types/theme';

/** Milestone icon styled per theme (DESIGN §6.x "Icons"). */
export function RowIcon({ icon, tokens, u, color }: { icon: IconId; tokens: ThemeTokens; u: number; color?: string }) {
  const Icon = ICON_COMPONENTS[icon];
  const { icon: spec, colors } = tokens;
  const glyph = spec.size * u;
  const stroke = color ?? colors[spec.color] ?? colors.accent;
  const square = tokens.id === 'pixel-quest';
  const svg = (
    <Icon
      size={glyph}
      color={stroke}
      strokeWidth={spec.strokeWidth}
      strokeLinecap={square ? 'square' : 'round'}
      strokeLinejoin={square ? 'miter' : 'round'}
    />
  );
  if (spec.container === 'outline-square') {
    const box = 7 * u;
    return (
      <View
        style={{
          width: box,
          height: box,
          borderRadius: 1.2 * u,
          borderWidth: Math.max(1, 0.25 * u),
          borderColor: colors.surfaceBorder,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {svg}
      </View>
    );
  }
  if (spec.container === 'sticker-circle') {
    const box = 6.5 * u;
    return (
      <View
        style={{
          width: box,
          height: box,
          borderRadius: box / 2,
          backgroundColor: colors.accent,
          borderWidth: 0.5 * u,
          borderColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {svg}
      </View>
    );
  }
  return svg;
}
