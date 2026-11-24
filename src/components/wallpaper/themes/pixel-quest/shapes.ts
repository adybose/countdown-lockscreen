/** Pixel-art SVG helpers (pure geometry). */

export function snap(v: number, grid: number): number {
  return Math.round(v / grid) * grid;
}

/** Regular-ish octagon centered on (cx, cy) with side length ≈ s. */
export function octagonPoints(cx: number, cy: number, s: number): string {
  const h = s / 2;
  const c = s * 0.29;
  return [
    [cx - h + c, cy - h],
    [cx + h - c, cy - h],
    [cx + h, cy - h + c],
    [cx + h, cy + h - c],
    [cx + h - c, cy + h],
    [cx - h + c, cy + h],
    [cx - h, cy + h - c],
    [cx - h, cy - h + c],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
}

/** Rectangle with stepped "pixel corners" (n = notch size). */
export function notchedRectPath(x: number, y: number, w: number, h: number, n: number): string {
  return [
    `M${x + n},${y}`,
    `H${x + w - n}`,
    `V${y + n}`,
    `H${x + w}`,
    `V${y + h - n}`,
    `H${x + w - n}`,
    `V${y + h}`,
    `H${x + n}`,
    `V${y + h - n}`,
    `H${x}`,
    `V${y + n}`,
    `H${x + n}`,
    'Z',
  ].join(' ');
}

/** Stair-step polyline between two points on a `grid`: down half, across, down half. */
export function stepPoints(x1: number, y1: number, x2: number, y2: number, grid: number): number[][] {
  const ym = snap((y1 + y2) / 2, grid);
  return [
    [snap(x1, grid), snap(y1, grid)],
    [snap(x1, grid), ym],
    [snap(x2, grid), ym],
    [snap(x2, grid), snap(y2, grid)],
  ];
}

/** Interpolate two #RRGGBB colors. */
export function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1, 7), 16);
  const pb = parseInt(b.slice(1, 7), 16);
  const ch = (p: number, s: number) => (p >> s) & 0xff;
  const m = (s: number) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t);
  return `#${[m(16), m(8), m(0)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
