import {
  contentHeights,
  getPreset,
  orientationOf,
  presetsFor,
  resolveCanvasSize,
  safeZoneFor,
  unitFor,
  zoneRects,
} from '@/src/utils/canvas';
import { LANDSCAPE_SAFE, PORTRAIT_SAFE } from '@/src/types/wallpaper';

describe('unitFor', () => {
  it('portrait: 1% of width', () => {
    expect(unitFor({ width: 360, height: 800 })).toBeCloseTo(3.6);
    expect(unitFor({ width: 1080, height: 2400 })).toBeCloseTo(10.8);
  });
  it('landscape: half the height / 100', () => {
    expect(unitFor({ width: 2560, height: 1600 })).toBeCloseTo(8);
  });
  it('mini preview uses the same math', () => {
    expect(unitFor({ width: 72, height: 160 })).toBeCloseTo(0.72);
  });
});

describe('resolveCanvasSize (AC-15)', () => {
  it('device = round(screen × pixelRatio)', () => {
    const r = resolveCanvasSize('device', { width: 392.7, height: 872.7 }, 2.75);
    expect(r.px).toEqual({ w: Math.round(392.7 * 2.75), h: Math.round(872.7 * 2.75) });
    expect(r.layout.width).toBeCloseTo(r.px.w / 2.75);
    expect(r.orientation).toBe('portrait');
  });
  it('device is always portrait even if the screen reports landscape', () => {
    const r = resolveCanvasSize('device', { width: 800, height: 360 }, 3);
    expect(r.px).toEqual({ w: 1080, h: 2400 });
  });
  it('fixed presets use exact pixels', () => {
    const r = resolveCanvasSize('android-fhd', { width: 400, height: 900 }, 2);
    expect(r.px).toEqual({ w: 1080, h: 2400 });
    expect(r.layout).toEqual({ width: 540, height: 1200 });
    expect(resolveCanvasSize('desktop-mbp', { width: 1, height: 1 }, 2).orientation).toBe('landscape');
  });
  it('guards a zero pixel ratio and unknown presets', () => {
    expect(resolveCanvasSize('iphone-pro', { width: 1, height: 1 }, 0).layout).toEqual({ width: 1179, height: 2556 });
    expect(getPreset('nope' as never).id).toBe('device');
  });
});

describe('presets', () => {
  it('hides desktop presets off the web', () => {
    expect(presetsFor('android').map((p) => p.id)).not.toContain('desktop-16x10');
    expect(presetsFor('web').map((p) => p.id)).toContain('desktop-mbp');
  });
});

describe('zones', () => {
  it('portrait 30 / 58 / 12 with 7% side padding', () => {
    const z = zoneRects({ width: 360, height: 800 }, PORTRAIT_SAFE, 'portrait');
    expect(z.top.height).toBeCloseTo(240);
    expect(z.content.y).toBeCloseTo(240);
    expect(z.content.height).toBeCloseTo(464);
    expect(z.bottom.y).toBeCloseTo(704);
    expect(z.content.x).toBeCloseTo(25.2);
    expect(z.left).toBeUndefined();
  });
  it('landscape has two columns within the content zone', () => {
    const z = zoneRects({ width: 2560, height: 1600 }, LANDSCAPE_SAFE, 'landscape');
    expect(z.top.height).toBeCloseTo(128);
    expect(z.left && z.right).toBeTruthy();
    if (!z.left || !z.right) return;
    expect(z.right.x + z.right.width).toBeCloseTo(z.content.x + z.content.width);
    expect(z.left.x + z.left.width).toBeLessThan(z.right.x);
  });
  it('orientation helpers', () => {
    expect(orientationOf({ width: 3, height: 2 })).toBe('landscape');
    expect(safeZoneFor('portrait')).toBe(PORTRAIT_SAFE);
    expect(safeZoneFor('landscape')).toBe(LANDSCAPE_SAFE);
  });
  it('content heights follow 14/22/4/48/12 and absorb hidden sections', () => {
    const h = contentHeights(100, { hasProgress: true, hasMotivation: true, noMilestones: false });
    expect(h).toEqual({ header: 14, hero: 22, progress: 4, path: 48, motivation: 12 });
    expect(contentHeights(100, { hasProgress: false, hasMotivation: true, noMilestones: false }).path).toBe(52);
    expect(contentHeights(100, { hasProgress: false, hasMotivation: false, noMilestones: false }).path).toBe(64);
    expect(contentHeights(100, { hasProgress: true, hasMotivation: true, noMilestones: true }).hero).toBeCloseTo(26.4);
  });
});
