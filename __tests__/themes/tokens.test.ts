import { FONT_KEYS } from '@/src/themes/fonts';
import { THEMES, THEME_ORDER } from '@/src/themes';
import { ICON_IDS } from '@/src/types/domain';

const REQUIRED_COLORS = [
  'background', 'backgroundAlt', 'surface', 'surfaceBorder', 'textPrimary', 'textSecondary',
  'textMuted', 'accent', 'accentAlt', 'success', 'danger', 'trail', 'node', 'nodeActive',
  'nodeDone', 'badgeBg', 'badgeText',
] as const;
const SIZE_KEYS = ['title', 'hero', 'heroUnit', 'badge', 'tLabel', 'rowTitle', 'motivation', 'caption'] as const;
const HEX = /^#[0-9A-F]{6}([0-9A-F]{2})?$/i;

describe('theme tokens', () => {
  it('registers exactly the 4 themes in order', () => {
    expect(THEME_ORDER).toEqual(['glass-terminal', 'pixel-quest', 'sticker-planner', 'field-journal']);
    expect(Object.keys(THEMES).sort()).toEqual([...THEME_ORDER].sort());
  });

  it.each(THEME_ORDER)('%s has every required key with valid values', (id) => {
    const t = THEMES[id];
    expect(t.id).toBe(id);
    expect(t.name.length).toBeGreaterThan(0);
    for (const k of REQUIRED_COLORS) expect(t.colors[k]).toMatch(HEX);
    for (const v of Object.values(t.colors)) if (v !== undefined) expect(v).toMatch(HEX);
    for (const k of SIZE_KEYS) expect(t.sizes[k]).toBeGreaterThan(0);
    for (const f of Object.values(t.fonts)) expect(FONT_KEYS).toContain(f);
    expect(t.maxRows.portrait).toBeGreaterThanOrEqual(1);
    expect(t.contrastPairs.length).toBeGreaterThan(0);
    expect(t.colors[t.icon.color]).toBeDefined();
  });

  it('enforces the 2.6u minimum text size (DESIGN §2.5)', () => {
    for (const id of THEME_ORDER) {
      for (const k of SIZE_KEYS) expect(THEMES[id].sizes[k]).toBeGreaterThanOrEqual(2.6);
    }
  });

  it('pixel quest caps rows at 4', () => {
    expect(THEMES['pixel-quest'].maxRows.portrait).toBe(4);
  });

  it('icon ids are unique', () => {
    expect(new Set(ICON_IDS).size).toBe(ICON_IDS.length);
  });
});
