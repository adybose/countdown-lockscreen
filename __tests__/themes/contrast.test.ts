import { THEMES, THEME_ORDER } from '@/src/themes';
import { contrastRatio, parseHex } from '@/src/utils/contrast';

describe('contrast utils', () => {
  it('computes black on white as 21:1', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
  });
  it('is symmetric for opaque colors', () => {
    expect(contrastRatio('#336699', '#FFEEDD')).toBeCloseTo(contrastRatio('#FFEEDD', '#336699'), 6);
  });
  it('composites alpha', () => {
    // fully transparent fg over bg → ratio 1
    expect(contrastRatio('#00000000', '#FFFFFF')).toBeCloseTo(1, 6);
    expect(parseHex('#FFFFFF80').a).toBeCloseTo(128 / 255, 6);
  });
  it('rejects invalid hex', () => {
    expect(() => parseHex('red')).toThrow();
  });
});

describe('theme contrast pairs (NFR-04)', () => {
  for (const id of THEME_ORDER) {
    const t = THEMES[id];
    for (const pair of t.contrastPairs) {
      it(`${id}: ${pair.fg} on ${pair.bg} ≥ ${pair.min}`, () => {
        const fg = t.colors[pair.fg];
        const bg = t.colors[pair.bg];
        expect(fg).toBeDefined();
        expect(bg).toBeDefined();
        // translucent backgrounds sit on the theme's opaque background
        const ratio = contrastRatio(fg as string, bg as string, t.colors.background);
        expect(ratio).toBeGreaterThanOrEqual(pair.min);
      });
    }
  }
});
