import { addDays, differenceInCalendarDays, format } from 'date-fns';
import type { CountdownStatus, ISODateTime, LocalDate, LocalTime } from '@/src/types/domain';

/**
 * Date rules (CLAUDE.md): calendar dates are local `YYYY-MM-DD` strings, times are local `HH:mm`.
 * Never call the clock here — `now` is always a parameter.
 */

const LOCAL_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const LOCAL_TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DAY_MS = 86_400_000;

/** The subset of a countdown/draft the date helpers need. */
export interface DeadlineLike {
  deadlineDate: LocalDate;
  deadlineTime: LocalTime | null;
  completedAt?: ISODateTime | null;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** True when `s` is a real calendar date in `YYYY-MM-DD` form. */
export function isLocalDate(s: unknown): s is LocalDate {
  if (typeof s !== 'string') return false;
  const m = LOCAL_DATE_RE.exec(s);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(y, mo - 1, d);
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d;
}

/** True when `s` is a 24h `HH:mm` string. */
export function isLocalTime(s: unknown): s is LocalTime {
  return typeof s === 'string' && LOCAL_TIME_RE.test(s);
}

/** Local midnight for a `YYYY-MM-DD` string. Never use `new Date('YYYY-MM-DD')` (UTC). */
export function parseLocalDate(d: LocalDate): Date {
  if (!isLocalDate(d)) throw new Error(`Invalid local date: ${String(d)}`);
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day);
}

/** Local calendar components, zero-padded. */
export function toLocalDateString(date: Date): LocalDate {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseLocalTime(t: LocalTime): { hour: number; minute: number } {
  if (!isLocalTime(t)) throw new Error(`Invalid local time: ${String(t)}`);
  const [hour, minute] = t.split(':').map(Number);
  return { hour, minute };
}

export function toLocalTimeString(date: Date): LocalTime {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** `d + n` calendar days (DST-safe). */
export function addLocalDays(d: LocalDate, n: number): LocalDate {
  return toLocalDateString(addDays(parseLocalDate(d), n));
}

/** Calendar days from `from` to `to` (positive when `to` is later). */
export function calendarDaysBetween(from: LocalDate, to: LocalDate): number {
  return differenceInCalendarDays(parseLocalDate(to), parseLocalDate(from));
}

/** Local `deadlineDate` at `deadlineTime`, or 23:59:59.999 when no time is set (FR-03). */
export function deadlineInstant(c: DeadlineLike): Date {
  const day = parseLocalDate(c.deadlineDate);
  if (c.deadlineTime && isLocalTime(c.deadlineTime)) {
    const { hour, minute } = parseLocalTime(c.deadlineTime);
    return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute, 0, 0);
  }
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
}

/** Calendar days from `now`'s local date to the deadline date. 0 on deadline day, negative after. */
export function daysLeft(now: Date, c: DeadlineLike): number {
  return differenceInCalendarDays(parseLocalDate(c.deadlineDate), now);
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  totalMs: number;
}

/** `{days, hours, minutes}` of `max(0, instant − now)`. Days = floor(ms / 86 400 000). */
export function getCountdownParts(now: Date, c: DeadlineLike): CountdownParts {
  const totalMs = Math.max(0, deadlineInstant(c).getTime() - now.getTime());
  const days = Math.floor(totalMs / DAY_MS);
  const rem = totalMs - days * DAY_MS;
  const hours = Math.floor(rem / 3_600_000);
  const minutes = Math.floor((rem - hours * 3_600_000) / 60_000);
  return { days, hours, minutes, totalMs };
}

export function getCountdownStatus(now: Date, c: DeadlineLike): CountdownStatus {
  if (c.completedAt) return 'completed';
  if (now.getTime() > deadlineInstant(c).getTime()) return 'overdue';
  if (daysLeft(now, c) <= 0) return 'today';
  return 'upcoming';
}

/** Whole calendar days the deadline is past (≥ 0). */
export function daysPast(now: Date, c: DeadlineLike): number {
  return Math.max(0, -daysLeft(now, c));
}

/** Calendar-day difference deadline − milestone (≥ 0 for valid data). */
export function tMinus(milestoneDate: LocalDate, deadlineDate: LocalDate): number {
  return differenceInCalendarDays(parseLocalDate(deadlineDate), parseLocalDate(milestoneDate));
}

/** `Dec 2` */
export function formatShortDate(d: LocalDate): string {
  return format(parseLocalDate(d), 'MMM d');
}

/** `Nov 18, 2026` */
export function formatMediumDate(d: LocalDate): string {
  return format(parseLocalDate(d), 'MMM d, yyyy');
}

/** `Fri, Jan 1, 2027` */
export function formatLongDate(d: LocalDate): string {
  return format(parseLocalDate(d), 'EEE, MMM d, yyyy');
}

/** `6:00 PM` */
export function formatTime12(t: LocalTime): string {
  const { hour, minute } = parseLocalTime(t);
  return format(new Date(2000, 0, 1, hour, minute), 'h:mm a');
}

/** `T-30 · Dec 2` */
export function formatTMinusLabel(m: { date: LocalDate }, c: { deadlineDate: LocalDate }): string {
  return `T-${tMinus(m.date, c.deadlineDate)} · ${formatShortDate(m.date)}`;
}

/** Deadline badge: `Nov 18, 2026` (+ ` · 6:00 PM` if a time is set). */
export function formatDeadline(c: DeadlineLike): string {
  const base = formatMediumDate(c.deadlineDate);
  return c.deadlineTime && isLocalTime(c.deadlineTime) ? `${base} · ${formatTime12(c.deadlineTime)}` : base;
}

/** Local date of an ISO instant, e.g. for "Finished Nov 16". */
export function localDateOfInstant(iso: ISODateTime): LocalDate {
  return toLocalDateString(new Date(iso));
}
