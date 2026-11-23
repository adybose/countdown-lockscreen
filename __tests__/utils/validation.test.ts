import type { Milestone } from '@/src/types/domain';
import {
  isChronological,
  sortMilestonesByDate,
  validateDeadline,
  validateGoal,
  validateMilestones,
  validateMotivation,
  validateTime,
} from '@/src/utils/validation';

const ms = (id: string, date: string, order: number, extra: Partial<Milestone> = {}): Milestone => ({
  id, title: `T ${id}`, date, done: false, completedAt: null, icon: 'flag', order, ...extra,
});

describe('validateGoal (AC-02)', () => {
  it('rejects empty, whitespace and >60 chars; accepts a normal title', () => {
    expect(validateGoal('')).toEqual({ ok: false, error: 'empty' });
    expect(validateGoal(' '.repeat(3))).toEqual({ ok: false, error: 'empty' });
    expect(validateGoal('x'.repeat(61))).toEqual({ ok: false, error: 'too-long' });
    expect(validateGoal('x'.repeat(60))).toEqual({ ok: true });
    expect(validateGoal('Pass Bio Exam')).toEqual({ ok: true });
  });
});

describe('validateDeadline (AC-03)', () => {
  it('rejects yesterday and accepts today', () => {
    expect(validateDeadline('2027-01-09', '2027-01-10')).toEqual({ ok: false, error: 'past' });
    expect(validateDeadline('2027-01-10', '2027-01-10')).toEqual({ ok: true });
    expect(validateDeadline('2028-01-10', '2027-01-10')).toEqual({ ok: true });
  });
  it('rejects missing and invalid dates', () => {
    expect(validateDeadline('', '2027-01-10')).toEqual({ ok: false, error: 'missing' });
    expect(validateDeadline('2027-02-30', '2027-01-10')).toEqual({ ok: false, error: 'invalid' });
  });
  it('validates optional time', () => {
    expect(validateTime(null)).toEqual({ ok: true });
    expect(validateTime('18:00')).toEqual({ ok: true });
    expect(validateTime('25:00')).toEqual({ ok: false, error: 'invalid' });
  });
});

describe('validateMotivation (AC-04)', () => {
  it('rejects 91 chars and accepts empty', () => {
    expect(validateMotivation('x'.repeat(91))).toEqual({ ok: false, error: 'too-long' });
    expect(validateMotivation('x'.repeat(90))).toEqual({ ok: true });
    expect(validateMotivation('')).toEqual({ ok: true });
  });
});

describe('validateMilestones (AC-07)', () => {
  const today = '2027-01-10';
  const deadline = '2027-02-01';

  it('accepts boundary dates equal to today and the deadline', () => {
    const r = validateMilestones([ms('a', today, 0), ms('b', deadline, 1)], today, deadline);
    expect(r).toEqual({ ok: true, byId: {}, global: [] });
  });

  it('flags before-today and after-deadline', () => {
    const r = validateMilestones([ms('a', '2027-01-09', 0), ms('b', '2027-02-02', 1)], today, deadline);
    expect(r.ok).toBe(false);
    expect(r.byId.a).toEqual(['before-today']);
    expect(r.byId.b).toEqual(['after-deadline']);
  });

  it('allows done milestones in the past (ADR-005)', () => {
    const r = validateMilestones([ms('a', '2027-01-01', 0, { done: true })], today, deadline);
    expect(r.ok).toBe(true);
  });

  it('flags titles and invalid dates', () => {
    const r = validateMilestones(
      [ms('a', today, 0, { title: '  ' }), ms('b', today, 1, { title: 'x'.repeat(49) }), ms('c', 'bad', 2)],
      today,
      deadline,
    );
    expect(r.byId).toEqual({ a: ['empty-title'], b: ['title-too-long'], c: ['invalid-date'] });
  });

  it('flags too-many globally', () => {
    const many = Array.from({ length: 13 }, (_, i) => ms(`m${i}`, today, i));
    expect(validateMilestones(many, today, deadline).global).toEqual(['too-many']);
  });
});

describe('chronology', () => {
  it('detects out-of-order and sorts by date stably', () => {
    const list = [ms('a', '2027-01-20', 0), ms('b', '2027-01-15', 1), ms('c', '2027-01-15', 2)];
    expect(isChronological(list)).toBe(false);
    const sorted = sortMilestonesByDate(list);
    expect(sorted.map((m) => m.id)).toEqual(['b', 'c', 'a']);
    expect(sorted.map((m) => m.order)).toEqual([0, 1, 2]);
    expect(isChronological(sorted)).toBe(true);
    expect(isChronological([])).toBe(true);
  });
});
