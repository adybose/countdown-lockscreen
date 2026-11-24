import { S } from '@/src/constants/strings';
import type { Countdown, CountdownDraft, Milestone } from '@/src/types/domain';
import type { ThemeTokens } from '@/src/types/theme';
import type { WallpaperModel, WallpaperRenderOptions, WallpaperRow } from '@/src/types/wallpaper';
import {
  daysLeft,
  daysPast,
  formatDeadline,
  formatShortDate,
  formatTime12,
  getCountdownStatus,
  isLocalDate,
  localDateOfInstant,
  tMinus,
  toLocalDateString,
} from './dates';
import { hashString } from './prng';
import { getNextMilestone } from './progress';

type AnyCountdown = Countdown | CountdownDraft;

function isCountdown(c: AnyCountdown): c is Countdown {
  return 'id' in c && typeof (c as Countdown).id === 'string';
}

/** Stable identity for seeding decorations (drafts have no id yet). */
export function seedKey(c: AnyCountdown): string {
  if (isCountdown(c)) return c.id;
  return c.editingId ?? `draft:${c.title}`;
}

/** What to render (ARCHITECTURE §4 / DESIGN §5, §10). Pure: `options.now` is the only clock. */
export function buildWallpaperModel(
  input: AnyCountdown,
  options: WallpaperRenderOptions,
  tokens: Pick<ThemeTokens, 'id' | 'maxRows'>,
): WallpaperModel {
  const now = new Date(options.now);
  const completedAt = isCountdown(input) ? input.completedAt : null;
  const deadlineDate = isLocalDate(input.deadlineDate) ? input.deadlineDate : toLocalDateString(now);
  const c = { ...input, deadlineDate, completedAt };
  const status = getCountdownStatus(now, c);
  const ms: Milestone[] = [...input.milestones].sort((a, b) => a.order - b.order);
  const total = ms.length;
  const doneCount = status === 'completed' ? total : ms.filter((m) => m.done).length;

  // Hero (DESIGN §5 / §10.4)
  let hero: WallpaperModel['hero'];
  if (status === 'completed') {
    const fin = completedAt ? formatShortDate(localDateOfInstant(completedAt)) : formatShortDate(deadlineDate);
    hero = { primary: S.wallpaper.done, secondary: S.wallpaper.finished(fin), tone: 'success' };
  } else if (status === 'overdue') {
    hero = { primary: S.wallpaper.overdue, secondary: S.wallpaper.daysPast(daysPast(now, c)), tone: 'danger' };
  } else if (status === 'today') {
    const time = c.deadlineTime ? ` · ${formatTime12(c.deadlineTime)}` : '';
    hero = { primary: S.wallpaper.today, secondary: `${S.wallpaper.deadlineDay}${time}`, tone: 'normal' };
  } else {
    const d = daysLeft(now, c);
    hero = { primary: String(d), secondary: d === 1 ? S.wallpaper.dayToGo : S.wallpaper.daysToGo, tone: 'normal' };
  }

  // Rows: pending from `next` onward, plus ≤ 1 most-recent done row; cap at maxRows.
  const maxRows = Math.max(1, options.maxRows ?? tokens.maxRows[options.orientation]);
  const next = status === 'upcoming' || status === 'today' ? getNextMilestone(now, c) : null;
  const toRow = (m: Milestone, state: WallpaperRow['state']): WallpaperRow => ({
    id: m.id,
    tLabel: `T-${Math.max(0, tMinus(m.date, deadlineDate))}`,
    dateLabel: isLocalDate(m.date) ? formatShortDate(m.date) : '',
    title: m.title.trim() || '…',
    icon: m.icon,
    state,
  });

  let candidates: WallpaperRow[];
  let doneRowIncluded = false;
  if (status === 'completed') {
    candidates = ms.map((m) => toRow(m, 'done'));
  } else {
    let pending: Milestone[];
    if (status === 'overdue') pending = ms.filter((m) => !m.done);
    else if (next) pending = ms.filter((m) => !m.done && m.order >= next.order);
    else pending = [];
    candidates = pending.map((m) =>
      toRow(m, status === 'overdue' ? 'missed' : m.id === next?.id ? 'next' : 'pending'),
    );
    if (options.showCompleted) {
      const done = ms.filter((m) => m.done);
      if (done.length) {
        const recent = [...done].sort((a, b) => {
          const ka = a.completedAt ?? a.date;
          const kb = b.completedAt ?? b.date;
          return ka < kb ? 1 : ka > kb ? -1 : b.order - a.order;
        })[0];
        candidates = [toRow(recent, 'done'), ...candidates];
        doneRowIncluded = true;
      }
    }
  }

  let rows = candidates;
  let overflowCount = 0;
  if (rows.length > maxRows) {
    // drop the completed row first, then the farthest-future rows
    if (doneRowIncluded && status !== 'completed') rows = rows.slice(1);
    if (rows.length > maxRows) {
      overflowCount = rows.length - maxRows;
      rows = rows.slice(0, maxRows);
    }
  }

  const motivationText = input.motivation.trim();
  const motivation = !options.showMotivation
    ? null
    : status === 'overdue'
      ? S.wallpaper.overdueMotivation
      : motivationText || null;

  const allDone = total > 0 && ms.every((m) => m.done) && (status === 'upcoming' || status === 'today');

  return {
    status,
    header: { title: input.title.trim() || 'Your goal', emoji: input.emoji, deadlineLabel: formatDeadline(c) },
    hero,
    progress: options.showProgress && total > 0 ? { done: doneCount, total, ratio: doneCount / total } : null,
    rows,
    overflowCount,
    finish: { tLabel: 'T-0', dateLabel: formatShortDate(deadlineDate), label: S.wallpaper.deadline },
    motivation,
    banner: allDone ? S.wallpaper.allDone : null,
    seed: hashString(seedKey(input) + tokens.id),
  };
}

/** One-line summary for the preview's accessibility label (DESIGN §11). */
export function summarizeModel(m: WallpaperModel): string {
  const next = m.rows.find((r) => r.state === 'next');
  const heroText =
    m.status === 'upcoming' ? `${m.hero.primary} ${m.hero.secondary.toLowerCase()} to ${m.header.title}` : `${m.hero.primary}, ${m.header.title}`;
  return next ? `${heroText}, next milestone ${next.title} on ${next.dateLabel}` : heroText;
}
