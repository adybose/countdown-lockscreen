import v0 from '../fixtures/plan-v0.json';
import { DEFAULT_PREFERENCES, DEFAULT_REMINDERS } from '@/src/constants/defaults';
import type { Countdown } from '@/src/types/domain';
import { exportFileName, exportPlan, importPlan, PLAN_SCHEMA, serializePlan } from '@/src/utils/planFile';

const NOW = new Date(2026, 10, 24, 10, 0);

const countdown: Countdown = {
  id: 'c_lx1abc_0',
  title: 'Land a summer internship',
  emoji: '💼',
  deadlineDate: '2027-01-01',
  deadlineTime: null,
  motivation: 'Future me will thank me.',
  startDate: '2026-11-24',
  themeId: 'glass-terminal',
  completedAt: null,
  createdAt: '2026-11-24T10:00:00.000Z',
  updatedAt: '2026-11-24T10:00:00.000Z',
  milestones: [
    { id: 'm_1', title: 'Polish resume', date: '2026-12-02', done: false, completedAt: null, icon: 'file-text', order: 0 },
    { id: 'm_2', title: 'Mock interviews', date: '2026-12-12', done: true, completedAt: '2026-12-10T09:00:00.000Z', icon: 'users', order: 1 },
  ],
};
const state = { countdown, reminders: { ...DEFAULT_REMINDERS, milestoneDaysBefore: 3 as const }, preferences: { ...DEFAULT_PREFERENCES, showProgress: false } };

const valid = () => JSON.parse(serializePlan(exportPlan(state, NOW)));

describe('exportPlan (AC-28)', () => {
  it('writes schema + version 1 and round-trips', () => {
    const file = exportPlan(state, NOW);
    expect(file.schema).toBe(PLAN_SCHEMA);
    expect(file.version).toBe(1);
    expect(file.exportedAt).toBe(NOW.toISOString());
    const res = importPlan(serializePlan(file), NOW);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.plan.countdown).toEqual(countdown);
    expect(res.plan.reminders).toEqual(state.reminders);
    expect(res.plan.preferences).toEqual(state.preferences);
    expect(res.warnings).toEqual([]);
  });

  it('names the file by local date', () => {
    expect(exportFileName(NOW)).toBe('countdown-plan-2026-11-24.json');
  });
});

describe('importPlan errors (AC-29)', () => {
  it('rejects invalid JSON', () => {
    expect(importPlan('{nope', NOW)).toEqual({ ok: false, error: { code: 'invalid-json' } });
  });
  it('rejects a wrong or missing schema', () => {
    expect(importPlan({ ...valid(), schema: 'other' }, NOW)).toEqual({ ok: false, error: { code: 'wrong-schema' } });
    const { schema: _s, ...noSchema } = valid();
    expect(importPlan(noSchema, NOW)).toEqual({ ok: false, error: { code: 'wrong-schema' } });
    expect(importPlan([1, 2], NOW)).toEqual({ ok: false, error: { code: 'wrong-schema' } });
  });
  it('rejects a future version', () => {
    expect(importPlan({ ...valid(), version: 2 }, NOW)).toEqual({ ok: false, error: { code: 'unsupported-version', version: 2 } });
  });
  it('rejects a non-numeric version', () => {
    expect(importPlan({ ...valid(), version: 'x' }, NOW)).toEqual({ ok: false, error: { code: 'invalid-field', path: 'version' } });
  });
  it('rejects a missing deadline', () => {
    const f = valid();
    delete f.countdown.deadlineDate;
    expect(importPlan(f, NOW)).toEqual({ ok: false, error: { code: 'invalid-field', path: 'countdown.deadlineDate' } });
  });
  it('rejects invalid dates', () => {
    const f = valid();
    f.countdown.deadlineDate = '2027-02-30';
    expect(importPlan(f, NOW)).toEqual({ ok: false, error: { code: 'invalid-field', path: 'countdown.deadlineDate' } });
    const g = valid();
    g.countdown.milestones[1].date = '12/12/2026';
    expect(importPlan(g, NOW)).toEqual({ ok: false, error: { code: 'invalid-field', path: 'countdown.milestones[1].date' } });
  });
  it('rejects bad titles, times and too many milestones', () => {
    const a = valid();
    a.countdown.title = '   ';
    expect(importPlan(a, NOW)).toMatchObject({ ok: false, error: { path: 'countdown.title' } });
    const b = valid();
    b.countdown.deadlineTime = '25:00';
    expect(importPlan(b, NOW)).toMatchObject({ ok: false, error: { path: 'countdown.deadlineTime' } });
    const c = valid();
    c.countdown.milestones = Array.from({ length: 13 }, (_, i) => ({ ...c.countdown.milestones[0], id: `x${i}` }));
    expect(importPlan(c, NOW)).toMatchObject({ ok: false, error: { path: 'countdown.milestones' } });
    const d = valid();
    d.countdown = 'nope';
    expect(importPlan(d, NOW)).toMatchObject({ ok: false, error: { path: 'countdown' } });
  });
});

describe('importPlan normalization', () => {
  it('coerces an unknown theme with a warning', () => {
    const f = valid();
    f.countdown.themeId = 'neon-dream';
    const res = importPlan(f, NOW);
    expect(res.ok && res.plan.countdown.themeId).toBe('glass-terminal');
    expect(res.ok && res.warnings.length).toBe(1);
  });
  it('coerces unknown icons and regenerates duplicate ids', () => {
    const f = valid();
    f.countdown.milestones[0].icon = 'unicorn';
    f.countdown.milestones[1].id = 'm_1';
    const res = importPlan(f, NOW);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.plan.countdown.milestones[0].icon).toBe('flag');
    expect(new Set(res.plan.countdown.milestones.map((m) => m.id)).size).toBe(2);
  });
  it('allows past deadlines and fills defaults for missing sections', () => {
    const f = valid();
    f.countdown.deadlineDate = '2020-01-01';
    f.countdown.startDate = '2019-12-01';
    delete f.reminders;
    f.preferences = { showMotivation: 'yes', sizePresetId: 'android-fhd' };
    const res = importPlan(f, NOW);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.plan.countdown.deadlineDate).toBe('2020-01-01');
    expect(res.plan.reminders).toEqual(DEFAULT_REMINDERS);
    expect(res.plan.preferences).toEqual({ ...DEFAULT_PREFERENCES, sizePresetId: 'android-fhd' });
  });
});

describe('v0 migration', () => {
  it('converts the ISO deadline into a local deadlineDate + time', () => {
    const res = importPlan(JSON.stringify(v0), NOW);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.plan.countdown.deadlineDate).toBe('2027-01-01');
    expect(res.plan.countdown.deadlineTime).toBe('18:30');
    expect(res.plan.countdown.themeId).toBe('pixel-quest');
    expect(res.plan.countdown.milestones[0].title).toBe('Polish resume');
    expect(res.plan.countdown.startDate).toBe('2026-11-24');
  });
});
