import type { ThemeModule } from '../../types';
import { JournalBackground } from './Background';
import { RoadPath } from './RoadPath';

export const fieldJournalTheme: ThemeModule = {
  Background: JournalBackground,
  Path: RoadPath,
  heroColor: 'accent',
  displayCharWidth: 0.62,
  heroUnitTracking: 0.3,
};
