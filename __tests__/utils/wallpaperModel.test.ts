import { THEMES } from '@/src/themes';
import type { Countdown, CountdownDraft, Milestone } from '@/src/types/domain';
import { PORTRAIT_SAFE, type WallpaperRenderOptions } from '@/src/types/wallpaper';
import { buildWallpaperModel, seedKey, summarizeModel } from '@/src/utils/wallpaperModel';

const gt = THEMES['glass-terminal']; // maxRows 5
const pq = THEMES['pixel-quest']; // maxRows 4

const ms = (i: number, date: string, done = false, completedAt: string | null = null): Milestone => ({
  id: `m${i}`, title: `Milestone ${i}`, date, done, completedAt, icon: 'flag', order: i,
});

const base = (milestones: Milestone[] = [], extra: Partial<Countdown> = {}): Countdown => ({
  id: 'c1', title: 'Pass Bio Exam', emoji: '📚', deadlineDate: '2027-02-01', deadlineTime: null,
  motivation: 'Future me will thank me.', startDate: '2027-01-01', milestones, themeId: 'glass-terminal',
  createdAt: '2027-01-01T00:00:00.000Z', updatedAt: '2027-01-01T00:00:00.000Z', completedAt: null, ...extra,
});

const opts = (now: Date, extra: Partial<WallpaperRenderOptions> = {}): WallpaperRenderOptions => ({
  now: now.toISOString(), showMotivation: true, showCompleted: true, showProgress: true,
  orientation: 'portrait', safeZone: PORTRAIT_SAFE, ...extra,
});

const twelve = () => Array.from({ length: 12 }, (_, i) => ms(i, `2027-01-${String(10 + i).padStart(2, '0')}`));

describe('hero variants', () => {
  it('upcoming: n DAYS TO GO / 1 DAY TO GO', () => {
    expect(buildWallpaperModel(base(), opts(new Date(2027, 0, 17, 9)), gt).hero).toEqual({ primary: '15', secondary: 'DAYS TO GO', tone: 'normal' });
    expect(buildWallpaperModel(base(), opts(new Date(2027, 0, 31, 9)), gt).hero.secondary).toBe('DAY TO GO');
  });
  it('today → TODAY / DEADLINE DAY (+time)', () => {
    const m = buildWallpaperModel(base([], { deadlineTime: '18:00' }), opts(new Date(2027, 1, 1, 9)), gt);
    expect(m.status).toBe('today');
    expect(m.hero).toEqual({ primary: 'TODAY', secondary: 'DEADLINE DAY · 6:00 PM', tone: 'normal' });
  });
  it('overdue → OVERDUE / n DAYS PAST in danger (AC-31)', () => {
    const m = buildWallpaperModel(base([ms(0, '2027-01-20')]), opts(new Date(2027, 1, 4, 9)), gt);
    expect(m.status).toBe('overdue');
    expect(m.hero).toEqual({ primary: 'OVERDUE', secondary: '3 DAYS PAST', tone: 'danger' });
    expect(m.rows.every((r) => r.state === 'missed')).toBe(true);
    expect(m.motivation).toBe('New plan? Open the app to reset.');
  });
  it('completed → DONE / FINISHED <date>, all rows done', () => {
    const fin = new Date(2027, 0, 16, 12).toISOString();
    const m = buildWallpaperModel(base([ms(0, '2027-01-20'), ms(1, '2027-01-25')], { completedAt: fin }), opts(new Date(2027, 0, 17)), gt);
    expect(m.hero).toEqual({ primary: 'DONE', secondary: 'FINISHED JAN 16', tone: 'success' });
    expect(m.rows.every((r) => r.state === 'done')).toBe(true);
    expect(m.progress).toEqual({ done: 2, total: 2, ratio: 1 });
  });
});

describe('row selection', () => {
  const now = new Date(2027, 0, 9, 9);

  it('12 milestones → maxRows rows + overflow', () => {
    const m = buildWallpaperModel(base(twelve()), opts(now), gt);
    expect(m.rows).toHaveLength(5);
    expect(m.overflowCount).toBe(7);
    expect(m.rows[0].state).toBe('next');
    expect(m.rows.slice(1).every((r) => r.state === 'pending')).toBe(true);
    const p = buildWallpaperModel(base(twelve()), opts(now), pq);
    expect(p.rows).toHaveLength(4);
    expect(p.overflowCount).toBe(8);
  });

  it('respects an explicit maxRows override', () => {
    expect(buildWallpaperModel(base(twelve()), opts(now, { maxRows: 2 }), gt).rows).toHaveLength(2);
  });

  it('showCompleted adds at most 1 (most recent) done row', () => {
    const list = [
      ms(0, '2027-01-10', true, '2027-01-08T10:00:00.000Z'),
      ms(1, '2027-01-11', true, '2027-01-09T08:00:00.000Z'),
      ms(2, '2027-01-12'),
      ms(3, '2027-01-13'),
    ];
    const m = buildWallpaperModel(base(list), opts(now), gt);
    expect(m.rows.filter((r) => r.state === 'done')).toHaveLength(1);
    expect(m.rows[0]).toMatchObject({ id: 'm1', state: 'done' });
    expect(m.rows[1]).toMatchObject({ id: 'm2', state: 'next' });
    const hidden = buildWallpaperModel(base(list), opts(now, { showCompleted: false }), gt);
    expect(hidden.rows.some((r) => r.state === 'done')).toBe(false);
  });

  it('drops the done row first when overflowing', () => {
    const list = [ms(0, '2027-01-10', true), ...twelve().slice(1)];
    const m = buildWallpaperModel(base(list), opts(now), gt);
    expect(m.rows.some((r) => r.state === 'done')).toBe(false);
    expect(m.rows).toHaveLength(5);
  });

  it('0 milestones → only the finish row', () => {
    const m = buildWallpaperModel(base(), opts(now), gt);
    expect(m.rows).toEqual([]);
    expect(m.overflowCount).toBe(0);
    expect(m.progress).toBeNull();
    expect(m.finish).toEqual({ tLabel: 'T-0', dateLabel: 'Feb 1', label: 'Deadline' });
  });

  it('labels rows with T-minus and short date', () => {
    const m = buildWallpaperModel(base([ms(0, '2027-01-02')]), opts(new Date(2027, 0, 1)), gt);
    expect(m.rows[0]).toMatchObject({ tLabel: 'T-30', dateLabel: 'Jan 2' });
  });
});

describe('banner, progress, motivation, seed', () => {
  const now = new Date(2027, 0, 20, 9);
  it('all done before the deadline → final-stretch banner', () => {
    const m = buildWallpaperModel(base([ms(0, '2027-01-10', true), ms(1, '2027-01-15', true)]), opts(now), gt);
    expect(m.banner).toBe('All milestones done — final stretch!');
    expect(m.progress).toEqual({ done: 2, total: 2, ratio: 1 });
  });
  it('hides progress and motivation when toggled off or empty', () => {
    const m = buildWallpaperModel(base([ms(0, '2027-01-25')], { motivation: '  ' }), opts(now, { showProgress: false }), gt);
    expect(m.progress).toBeNull();
    expect(m.motivation).toBeNull();
    expect(buildWallpaperModel(base(), opts(now, { showMotivation: false }), gt).motivation).toBeNull();
  });
  it('seed is deterministic per countdown + theme', () => {
    const a = buildWallpaperModel(base(), opts(now), gt).seed;
    expect(buildWallpaperModel(base(), opts(new Date(2027, 0, 21)), gt).seed).toBe(a);
    expect(buildWallpaperModel(base(), opts(now), pq).seed).not.toBe(a);
  });
  it('renders drafts (no id) and tolerates an empty deadline', () => {
    const draft: CountdownDraft = {
      mode: 'create', editingId: null, title: '', emoji: null, deadlineDate: '', deadlineTime: null,
      motivation: '', startDate: '', milestones: [], themeId: 'pixel-quest',
    };
    const m = buildWallpaperModel(draft, opts(now), pq);
    expect(m.header.title).toBe('Your goal');
    expect(m.status).toBe('today');
    expect(seedKey(draft)).toBe('draft:');
  });
  it('summarizes for accessibility', () => {
    const m = buildWallpaperModel(base([ms(0, '2027-01-25')]), opts(now), gt);
    expect(summarizeModel(m)).toBe('12 days to go to Pass Bio Exam, next milestone Milestone 0 on Jan 25');
  });
});
