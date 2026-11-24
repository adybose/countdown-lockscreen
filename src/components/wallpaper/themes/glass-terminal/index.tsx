import type { ThemeModule } from '../../types';
import { WText } from '../../parts/WText';
import { GlassBackground } from './Background';
import { CircuitPath } from './CircuitPath';

export const glassTerminalTheme: ThemeModule = {
  Background: GlassBackground,
  Path: CircuitPath,
  TitlePrefix: ({ tokens, u }) => (
    <WText font={tokens.fonts.display} size={tokens.sizes.title * 0.8 * u} color={tokens.colors.accent}>
      {'>_'}
    </WText>
  ),
  heroColor: 'accent',
  displayCharWidth: 0.6,
  heroUnitTracking: 0.6,
};
