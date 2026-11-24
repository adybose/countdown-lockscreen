import { DEFAULT_REMINDERS } from '@/src/constants/defaults';
import type { Countdown, Milestone, ReminderSettings } from '@/src/types/domain';
import { addLocalDays } from '@/src/utils/dates';
import { planNotifications } from '@/src/utils/notificationPlan';

const ms = (i: number, date: string, done = false): Milestone => ({
  id: `m${i}`, title: `Step ${i}`, date, done, completedAt: null, icon: 'flag', order: i,
});

const countdown = (milestones: Milestone[] = [], extra: Partial<Countdown> = {}): Countdown => ({
  id: 'c1', title: 'Pass Bio Exam', emoji: '📚', deadlineDate: '2027-03-01', deadlineTime: null, motivation: '',
  startDate: '2027-01-01', milestones, themeId: 'glass-terminal', createdAt: '', updatedAt: '', completedAt: null, ...extra,
});

const NOW = new Date(2027, 0, 10, 12, 0);
const plan = (c: Countdown | null, r: Partial<ReminderSettings> = {}, now = NOW) =>
  planNotifications({ countdown: c, reminders: { ...DEFAULT_REMINDERS, ...r } }, now);

describe('planNotifications (AC-23, AC-24)', () => {
  it('emits one daily trigger that opens the Studio', () => {
    const p = plan(countdown());
    const daily = p.filter((n) => n.trigger.type === 'daily');
    expect(daily).toHaveLength(1);
    expect(daily[0]).toMatchObject({ id: 'daily-refresh', data: { url: '/studio' }, trigger: { type: 'daily', hour: 8, minute: 0 } });
    expect(daily[0].title).toBe('Refresh your lock screen');
    expect(daily[0].body).toContain('Pass Bio Exam');
  });

  it('emits a deadline-day trigger at the daily time', () => {
    const d = plan(countdown()).find((n) => n.id === 'deadline-day');
    expect(d?.trigger).toEqual({ type: 'date', at: new Date(2027, 2, 1, 8, 0) });
    expect(d?.data.url).toBe('/studio');
  });

  it('moves the deadline-day nudge before an early deadline time', () => {
    const d = plan(countdown([], { deadlineTime: '07:00' })).find((n) => n.id === 'deadline-day');
    expect(d?.trigger).toEqual({ type: 'date', at: new Date(2027, 2, 1, 6, 0) });
  });

  it('emits milestone triggers at (date − N) @ dailyTime with T-minus copy', () => {
    const p = plan(countdown([ms(0, '2027-01-20'), ms(1, '2027-02-10')]), { milestoneDaysBefore: 3, dailyTime: '09:30' });
    const m0 = p.find((n) => n.id === 'ms-m0');
    expect(m0?.trigger).toEqual({ type: 'date', at: new Date(2027, 0, 17, 9, 30) });
    expect(m0?.body).toBe('In 3 days: Step 0 (T-40)');
    expect(m0?.title).toBe('📚 Pass Bio Exam');
    expect(m0?.data.url).toBe('/home');
  });

  it('uses "Today:" copy when N = 0', () => {
    const p = plan(countdown([ms(0, '2027-01-20')]), { milestoneDaysBefore: 0 });
    expect(p.find((n) => n.id === 'ms-m0')?.body).toBe('Today: Step 0');
  });

  it('skips past triggers and done milestones', () => {
    const p = plan(countdown([ms(0, '2027-01-10'), ms(1, '2027-01-11'), ms(2, '2027-01-25', true)]), { milestoneDaysBefore: 1 });
    expect(p.map((n) => n.id)).toEqual(['daily-refresh', 'deadline-day']);
  });

  it('respects the toggles', () => {
    expect(plan(countdown([ms(0, '2027-01-20')]), { dailyEnabled: false }).map((n) => n.id)).toEqual(['ms-m0']);
    expect(plan(countdown([ms(0, '2027-01-20')]), { milestoneEnabled: false }).map((n) => n.id)).toEqual(['daily-refresh', 'deadline-day']);
  });

  it('returns [] when overdue, completed or empty', () => {
    expect(plan(null)).toEqual([]);
    expect(plan(countdown([], { deadlineDate: '2027-01-05' }))).toEqual([]);
    expect(plan(countdown([], { completedAt: '2027-01-09T00:00:00.000Z' }))).toEqual([]);
  });

  it('caps at 60 and keeps the earliest, ascending', () => {
    // 12 milestones per countdown max, but the planner itself must cap any input
    const many = Array.from({ length: 80 }, (_, i) => ms(i, addLocalDays('2027-01-12', i % 45)));
    const p = plan(countdown(many, { deadlineDate: '2027-06-01' }));
    expect(p).toHaveLength(60);
    const dates = p.filter((n) => n.trigger.type === 'date').map((n) => (n.trigger.type === 'date' ? n.trigger.at.getTime() : 0));
    for (let i = 1; i < dates.length; i++) expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
    expect(p.some((n) => n.id === 'deadline-day')).toBe(false); // the latest one was dropped
  });
});
