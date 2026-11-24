import { View } from 'react-native';
import type { ThemeModule } from '../../types';
import { StickerBackground } from './Background';
import { RibbonPath } from './RibbonPath';

export const stickerPlannerTheme: ThemeModule = {
  Background: StickerBackground,
  Path: RibbonPath,
  HeaderDecoration: ({ tokens, u, width }) => (
    <View
      style={{
        position: 'absolute',
        top: -1 * u,
        left: width * 0.55,
        width: 20 * u,
        height: 3.8 * u,
        backgroundColor: tokens.colors.accentAlt,
        opacity: 0.55,
        transform: [{ rotate: '-6deg' }],
      }}
    />
  ),
  heroColor: 'badgeBg',
  displayCharWidth: 0.62,
  heroUnitTracking: 0.3,
};
