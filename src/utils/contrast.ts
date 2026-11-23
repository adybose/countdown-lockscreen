/** WCAG 2.x contrast helpers. Alpha-aware: `#RRGGBBAA` is composited over an opaque backdrop. */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

export function parseHex(hex: string): RGBA {
  const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex.trim());
  if (!m) throw new Error(`Invalid hex color: ${hex}`);
  const n = parseInt(m[1], 16);
  return {
    r: (n >> 16) & 0xff,
    g: (n >> 8) & 0xff,
    b: n & 0xff,
    a: m[2] ? parseInt(m[2], 16) / 255 : 1,
  };
}

/** Composite `fg` (possibly translucent) over an opaque `bg`. */
export function composite(fg: RGBA, bg: RGB): RGB {
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
  };
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(c: RGB): number {
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
}

/**
 * Contrast ratio between `fg` and `bg` hex colors. A translucent `bg` is first composited over
 * `backdrop` (default: opaque `bg` itself, or white); a translucent `fg` is composited over the result.
 */
export function contrastRatio(fg: string, bg: string, backdrop = '#FFFFFF'): number {
  const back = parseHex(backdrop);
  const bgSolid = composite(parseHex(bg), back);
  const fgSolid = composite(parseHex(fg), bgSolid);
  const l1 = relativeLuminance(fgSolid);
  const l2 = relativeLuminance(bgSolid);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
