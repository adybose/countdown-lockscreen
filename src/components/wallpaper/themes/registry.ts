import type { ThemeId } from '@/src/types/theme';
import type { ThemeModule } from '../types';
import { glassTerminalTheme } from './glass-terminal';
import { neutralTheme } from './neutral';
import { pixelQuestTheme } from './pixel-quest';

/** Theme renderers by id. Themes not yet implemented fall back to the neutral renderer. */
export const THEME_MODULES: Partial<Record<ThemeId, ThemeModule>> = {
  'glass-terminal': glassTerminalTheme,
  'pixel-quest': pixelQuestTheme,
};

export function getThemeModule(id: ThemeId): ThemeModule {
  return THEME_MODULES[id] ?? neutralTheme;
}
