import type { LocalDate } from '@/src/types/domain';

const LOCAL_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

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
