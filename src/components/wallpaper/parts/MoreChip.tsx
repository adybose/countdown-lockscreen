import { View } from 'react-native';
import { S } from '@/src/constants/strings';
import type { ThemeTokens } from '@/src/types/theme';
import { WText } from './WText';

export function MoreChip({ count, tokens, u }: { count: number; tokens: ThemeTokens; u: number }) {
  if (count <= 0) return null;
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderRadius: Math.min(tokens.radii.badge, 50) * u,
        borderWidth: Math.max(1, 0.25 * u),
        borderColor: tokens.colors.surfaceBorder,
        paddingHorizontal: 2 * u,
        paddingVertical: 0.4 * u,
      }}
    >
      <WText font={tokens.fonts.body} size={tokens.sizes.caption * u} color={tokens.colors.textSecondary}>
        {S.wallpaper.more(count)}
      </WText>
    </View>
  );
}
