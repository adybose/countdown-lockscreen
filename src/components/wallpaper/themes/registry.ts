import type { ThemeId } from '@/src/types/theme';
import type { ThemeModule } from '../types';
import { neutralTheme } from './neutral';

/** Theme renderers by id. Themes not yet implemented fall back to the neutral renderer. */
export const THEME_MODULES: Partial<Record<ThemeId, ThemeModule>> = {};

export function getThemeModule(id: ThemeId): ThemeModule {
  return THEME_MODULES[id] ?? neutralTheme;
}
