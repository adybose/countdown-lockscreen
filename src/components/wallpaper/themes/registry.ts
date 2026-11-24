import type { ThemeId } from '@/src/types/theme';
import type { ThemeModule } from '../types';
import { fieldJournalTheme } from './field-journal';
import { glassTerminalTheme } from './glass-terminal';
import { neutralTheme } from './neutral';
import { pixelQuestTheme } from './pixel-quest';
import { stickerPlannerTheme } from './sticker-planner';

/** Theme renderers by id. Unknown ids fall back to the neutral renderer. */
export const THEME_MODULES: Record<ThemeId, ThemeModule> = {
  'glass-terminal': glassTerminalTheme,
  'pixel-quest': pixelQuestTheme,
  'sticker-planner': stickerPlannerTheme,
  'field-journal': fieldJournalTheme,
};

export function getThemeModule(id: ThemeId): ThemeModule {
  return THEME_MODULES[id] ?? neutralTheme;
}
