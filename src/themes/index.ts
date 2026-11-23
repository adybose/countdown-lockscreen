import type { ThemeId, ThemeTokens } from '@/src/types/theme';
import { fieldJournal } from './tokens/fieldJournal';
import { glassTerminal } from './tokens/glassTerminal';
import { pixelQuest } from './tokens/pixelQuest';
import { stickerPlanner } from './tokens/stickerPlanner';

export const THEMES: Record<ThemeId, ThemeTokens> = {
  'glass-terminal': glassTerminal,
  'pixel-quest': pixelQuest,
  'sticker-planner': stickerPlanner,
  'field-journal': fieldJournal,
};

export const THEME_ORDER: readonly ThemeId[] = [
  'glass-terminal',
  'pixel-quest',
  'sticker-planner',
  'field-journal',
];

export const DEFAULT_THEME_ID: ThemeId = 'glass-terminal';

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === 'string' && (THEME_ORDER as readonly string[]).includes(v);
}
