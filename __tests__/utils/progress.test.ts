import type { Milestone } from '@/src/types/domain';
import { clamp01, getNextMilestone, getProgress } from '@/src/utils/progress';

const ms = (id: string, date: string, order: number, done = false): Milestone => ({
  id, title: id, date, done, completedAt: null, icon: 'flag', order,
});

const plan = (milestones: Milestone[]) => ({
  deadlineDate: '2027-01-31',
  deadlineTime: null,
  startDate: '2027-01-01',
  milestones,
});

describe('getNextMilestone (AC-11)', () => {
  const now = new Date(2027, 0, 10, 12);
  it('skips done and past milestones, by user order', () => {
    const list = [ms('past', '2027-01-05', 0), ms('done', '2027-01-12', 1, true), ms('today', '2027-01-10', 2), ms('later', '2027-01-20', 3)];
    expect(getNextMilestone(now, plan(list))?.id).toBe('today');
  });
  it('returns null when none remain', () => {
    expect(getNextMilestone(now, plan([ms('past', '2027-01-05', 0), ms('done', '2027-01-20', 1, true)]))).toBeNull();
    expect(getNextMilestone(now, plan([]))).toBeNull();
  });
});

describe('getProgress (AC-12)', () => {
  it('computes ratios', () => {
    const p = getProgress(new Date(2027, 0, 16, 12), plan([ms('a', '2027-01-10', 0, true), ms('b', '2027-01-20', 1)]));
    expect(p.milestoneRatio).toBe(0.5);
    expect(p.done).toBe(1);
    expect(p.total).toBe(2);
    expect(p.timeRatio).toBeGreaterThan(0.45);
    expect(p.timeRatio).toBeLessThan(0.55);
  });
  it('clamps both ratios and hides the milestone bar with no milestones', () => {
    expect(getProgress(new Date(2026, 11, 1), plan([])).timeRatio).toBe(0);
    expect(getProgress(new Date(2027, 5, 1), plan([])).timeRatio).toBe(1);
    expect(getProgress(new Date(2027, 0, 5), plan([])).milestoneRatio).toBeNull();
  });
  it('treats a zero-length plan as complete in time', () => {
    const p = getProgress(new Date(2027, 0, 1), { ...plan([]), startDate: '2027-02-01' });
    expect(p.timeRatio).toBe(1);
  });
  it('clamp01 handles NaN and bounds', () => {
    expect(clamp01(NaN)).toBe(0);
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
  });
});
