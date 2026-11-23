import {
  addLocalDays,
  calendarDaysBetween,
  daysLeft,
  daysPast,
  deadlineInstant,
  formatDeadline,
  formatLongDate,
  formatShortDate,
  formatTMinusLabel,
  formatTime12,
  getCountdownParts,
  getCountdownStatus,
  isLocalDate,
  isLocalTime,
  localDateOfInstant,
  parseLocalDate,
  parseLocalTime,
  tMinus,
  toLocalDateString,
  toLocalTimeString,
} from '@/src/utils/dates';

const c = (deadlineDate: string, deadlineTime: string | null = null, completedAt: string | null = null) => ({
  deadlineDate,
  deadlineTime,
  completedAt,
});

/** True when the local zone shifts offset between the two local dates (DST). */
const offsetChanges = (a: Date, b: Date) => a.getTimezoneOffset() !== b.getTimezoneOffset();

describe('parseLocalDate / toLocalDateString', () => {
  it('does not shift the day (unlike new Date("YYYY-MM-DD"))', () => {
    const d = parseLocalDate('2027-01-01');
    expect(d.getFullYear()).toBe(2027);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(1);
    expect(d.getHours()).toBe(0);
    expect(toLocalDateString(d)).toBe('2027-01-01');
  });

  it('round-trips every day of 2027 including DST days', () => {
    let s = '2027-01-01';
    for (let i = 0; i < 365; i++) {
      expect(toLocalDateString(parseLocalDate(s))).toBe(s);
      s = addLocalDays(s, 1);
    }
    expect(s).toBe('2028-01-01');
  });

  it('rejects invalid dates', () => {
    expect(() => parseLocalDate('2027-02-30')).toThrow();
    expect(() => parseLocalDate('2027-1-1')).toThrow();
    expect(isLocalDate('2027-02-28')).toBe(true);
    expect(isLocalDate('2028-02-29')).toBe(true);
    expect(isLocalDate('2027-02-29')).toBe(false);
    expect(isLocalDate(20270101)).toBe(false);
  });

  it('parses and formats local times', () => {
    expect(isLocalTime('08:00')).toBe(true);
    expect(isLocalTime('24:00')).toBe(false);
    expect(isLocalTime('8:00')).toBe(false);
    expect(parseLocalTime('18:05')).toEqual({ hour: 18, minute: 5 });
    expect(() => parseLocalTime('nope')).toThrow();
    expect(toLocalTimeString(new Date(2027, 0, 1, 7, 3))).toBe('07:03');
    expect(formatTime12('18:00')).toBe('6:00 PM');
  });
});

describe('deadlineInstant (AC-03)', () => {
  it('defaults to local 23:59:59.999 of the date', () => {
    const i = deadlineInstant(c('2027-01-01'));
    expect([i.getFullYear(), i.getMonth(), i.getDate(), i.getHours(), i.getMinutes(), i.getSeconds()]).toEqual([
      2027, 0, 1, 23, 59, 59,
    ]);
  });
  it('uses the time when set', () => {
    const i = deadlineInstant(c('2027-01-01', '18:30'));
    expect([i.getDate(), i.getHours(), i.getMinutes()]).toEqual([1, 18, 30]);
  });
});

describe('daysLeft across DST', () => {
  it('counts calendar days across the 2027-03-14 DST start', () => {
    expect(daysLeft(new Date(2027, 2, 10, 12), c('2027-03-20'))).toBe(10);
    expect(daysLeft(new Date(2027, 2, 13, 23, 30), c('2027-03-15'))).toBe(2);
  });
  it('counts calendar days across the 2027-11-07 DST end', () => {
    expect(daysLeft(new Date(2027, 10, 1, 0, 5), c('2027-11-15'))).toBe(14);
    expect(Number.isInteger(daysLeft(new Date(2027, 10, 6, 23, 59), c('2027-11-08')))).toBe(true);
    expect(daysLeft(new Date(2027, 10, 6, 23, 59), c('2027-11-08'))).toBe(2);
  });
  it('is 0 on the deadline day and negative after', () => {
    expect(daysLeft(new Date(2027, 0, 1, 8), c('2027-01-01'))).toBe(0);
    expect(daysLeft(new Date(2027, 0, 4, 8), c('2027-01-01'))).toBe(-3);
    expect(daysPast(new Date(2027, 0, 4, 8), c('2027-01-01'))).toBe(3);
    expect(daysPast(new Date(2026, 11, 30), c('2027-01-01'))).toBe(0);
  });
  it('calendarDaysBetween is DST-safe', () => {
    expect(calendarDaysBetween('2027-03-01', '2027-04-01')).toBe(31);
    expect(calendarDaysBetween('2027-11-01', '2027-12-01')).toBe(30);
  });
});

describe('getCountdownParts (AC-10)', () => {
  it('splits the remaining time', () => {
    const now = new Date(2027, 0, 1, 10, 0);
    expect(getCountdownParts(now, c('2027-01-03', '12:30'))).toMatchObject({ days: 2, hours: 2, minutes: 30 });
  });

  it('never goes negative', () => {
    const p = getCountdownParts(new Date(2027, 0, 5), c('2027-01-01'));
    expect(p).toEqual({ days: 0, hours: 0, minutes: 0, totalMs: 0 });
  });

  it('uses elapsed real time across the DST start', () => {
    const now = new Date(2027, 2, 13, 12, 0); // Sat noon
    const deadline = c('2027-03-15', '12:00'); // Mon noon
    const dst = offsetChanges(new Date(2027, 2, 13, 12), new Date(2027, 2, 15, 12));
    // 48h of wall time; one hour shorter where clocks spring forward
    expect(getCountdownParts(now, deadline)).toMatchObject(
      dst ? { days: 1, hours: 23, minutes: 0 } : { days: 2, hours: 0, minutes: 0 },
    );
  });

  it('uses elapsed real time across the DST end', () => {
    const now = new Date(2027, 10, 6, 12, 0);
    const deadline = c('2027-11-08', '12:00');
    const dst = offsetChanges(new Date(2027, 10, 6, 12), new Date(2027, 10, 8, 12));
    expect(getCountdownParts(now, deadline)).toMatchObject(
      dst ? { days: 2, hours: 1, minutes: 0 } : { days: 2, hours: 0, minutes: 0 },
    );
  });
});

describe('getCountdownStatus (AC-31, AC-32)', () => {
  it('upcoming before the deadline day', () => {
    expect(getCountdownStatus(new Date(2027, 0, 1, 9), c('2027-01-02'))).toBe('upcoming');
  });
  it('today on the deadline date before the instant', () => {
    expect(getCountdownStatus(new Date(2027, 0, 2, 9), c('2027-01-02', '18:00'))).toBe('today');
    expect(getCountdownStatus(new Date(2027, 0, 2, 23, 59), c('2027-01-02'))).toBe('today');
  });
  it('overdue after the instant', () => {
    expect(getCountdownStatus(new Date(2027, 0, 2, 18, 1), c('2027-01-02', '18:00'))).toBe('overdue');
    expect(getCountdownStatus(new Date(2027, 0, 3, 0, 0), c('2027-01-02'))).toBe('overdue');
  });
  it('completed wins over everything', () => {
    expect(getCountdownStatus(new Date(2027, 0, 9), c('2027-01-02', null, '2027-01-01T10:00:00.000Z'))).toBe(
      'completed',
    );
  });
});

describe('labels', () => {
  it('tMinus counts calendar days to the deadline', () => {
    expect(tMinus('2026-12-02', '2027-01-01')).toBe(30);
    expect(tMinus('2027-01-01', '2027-01-01')).toBe(0);
    expect(tMinus('2027-03-01', '2027-04-01')).toBe(31);
  });
  it('formats T-minus labels and dates', () => {
    expect(formatTMinusLabel({ date: '2026-12-02' }, { deadlineDate: '2027-01-01' })).toBe('T-30 · Dec 2');
    expect(formatShortDate('2027-01-01')).toBe('Jan 1');
    expect(formatLongDate('2027-01-01')).toBe('Fri, Jan 1, 2027');
  });
  it('formats the deadline badge', () => {
    expect(formatDeadline(c('2026-11-18'))).toBe('Nov 18, 2026');
    expect(formatDeadline(c('2026-11-18', '18:00'))).toBe('Nov 18, 2026 · 6:00 PM');
  });
  it('localDateOfInstant uses the local calendar', () => {
    const iso = new Date(2027, 0, 1, 23, 30).toISOString();
    expect(localDateOfInstant(iso)).toBe('2027-01-01');
  });
});
