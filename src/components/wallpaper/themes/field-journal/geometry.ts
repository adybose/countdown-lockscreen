/** Cubic Bézier helpers for the Field Journal road (pure). */
export type Pt = { x: number; y: number };

export function cubic(p0: Pt, c1: Pt, c2: Pt, p1: Pt, t: number): Pt {
  const m = 1 - t;
  return {
    x: m * m * m * p0.x + 3 * m * m * t * c1.x + 3 * m * t * t * c2.x + t * t * t * p1.x,
    y: m * m * m * p0.y + 3 * m * m * t * c1.y + 3 * m * t * t * c2.y + t * t * t * p1.y,
  };
}

/** Two-segment S-curve through a map of size w × h. `t` ∈ [0, 1] across the whole road. */
export function roadCurve(w: number, h: number) {
  const a = { p0: { x: w * 0.3, y: 0 }, c1: { x: w * 0.98, y: h * 0.12 }, c2: { x: w * 0.95, y: h * 0.42 }, p1: { x: w * 0.5, y: h * 0.5 } };
  const b = { p0: a.p1, c1: { x: w * 0.05, y: h * 0.58 }, c2: { x: w * 0.05, y: h * 0.86 }, p1: { x: w * 0.62, y: h * 0.94 } };
  const d = `M${a.p0.x},${a.p0.y} C${a.c1.x},${a.c1.y} ${a.c2.x},${a.c2.y} ${a.p1.x},${a.p1.y} C${b.c1.x},${b.c1.y} ${b.c2.x},${b.c2.y} ${b.p1.x},${b.p1.y}`;
  const at = (t: number): Pt => (t <= 0.5 ? cubic(a.p0, a.c1, a.c2, a.p1, t * 2) : cubic(b.p0, b.c1, b.c2, b.p1, (t - 0.5) * 2));
  return { d, at };
}

/** Teardrop pin with its tip at (x, y), height s. */
export function pinPath(x: number, y: number, s: number): string {
  const r = s * 0.36;
  const cy = y - s + r;
  return `M${x},${y} C${x - r * 0.4},${y - s * 0.35} ${x - r},${cy + r * 0.5} ${x - r},${cy} A${r},${r} 0 1 1 ${x + r},${cy} C${x + r},${cy + r * 0.5} ${x + r * 0.4},${y - s * 0.35} ${x},${y} Z`;
}

/** 8-point compass star centered on (cx, cy) with outer radius r. */
export function compassPath(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const ang = (Math.PI / 8) * i - Math.PI / 2;
    const rad = i % 4 === 0 ? r : i % 2 === 0 ? r * 0.55 : r * 0.2;
    pts.push(`${cx + Math.cos(ang) * rad},${cy + Math.sin(ang) * rad}`);
  }
  return `M${pts.join(' L')} Z`;
}

/** Smooth closed wobbly loop (contour line). */
export function contourPath(cx: number, cy: number, rx: number, ry: number, wobble: number[], steps = 24): string {
  const p: Pt[] = [];
  for (let i = 0; i < steps; i++) {
    const a = (Math.PI * 2 * i) / steps;
    const k = 1 + wobble[i % wobble.length];
    p.push({ x: cx + Math.cos(a) * rx * k, y: cy + Math.sin(a) * ry * k });
  }
  // Catmull-Rom → cubic Bézier
  let d = `M${p[0].x},${p[0].y}`;
  for (let i = 0; i < steps; i++) {
    const p0 = p[(i - 1 + steps) % steps];
    const p1 = p[i];
    const p2 = p[(i + 1) % steps];
    const p3 = p[(i + 2) % steps];
    d += ` C${p1.x + (p2.x - p0.x) / 6},${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6},${p2.y - (p3.y - p1.y) / 6} ${p2.x},${p2.y}`;
  }
  return `${d} Z`;
}
