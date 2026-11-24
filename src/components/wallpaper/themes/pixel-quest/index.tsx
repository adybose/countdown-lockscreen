import type { ThemeModule } from '../../types';
import { PixelBackground } from './Background';
import { TrailPath } from './TrailPath';

export const pixelQuestTheme: ThemeModule = {
  Background: PixelBackground,
  Path: TrailPath,
  heroColor: 'accentAlt',
  displayCharWidth: 1.0,
  heroUnitTracking: 0.2,
};
