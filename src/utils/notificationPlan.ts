import { LIMITS } from '@/src/constants/limits';
import { S } from '@/src/constants/strings';
import type { Countdown, LocalDate, LocalTime, ReminderSettings } from '@/src/types/domain';
import { addLocalDays, deadlineInstant, getCountdownStatus, parseLocalDate, parseLocalTime, tMinus } from './dates';

export type PlannedTrigger = { type: 'daily'; hour: number; minute: number } | { type: 'date'; at: Date };

export interface PlannedNotification {
  id: string;
  title: string;
  body: string;
  data: { url: '/studio' | '/home' };
  trigger: PlannedTrigger;
}

export interface NotificationPlanInput {
  countdown: Countdown | null;
  reminders: ReminderSettings;
}

function at(date: LocalDate, time: LocalTime): Date {
  const d = parseLocalDate(date);
  const { hour, minute } = parseLocalTime(time);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, minute, 0, 0);
}

/**
 * Pure schedule computation (ARCHITECTURE §9.2). Daily repeating refresh, a deadline-day nudge,
 * and one-shot milestone reminders `N` days before at the daily time. Capped at 60, earliest first.
 */
export function planNotifications(state: NotificationPlanInput, now: Date): PlannedNotification[] {
  const c = state.countdown;
  if (!c) return [];
  const status = getCountdownStatus(now, c);
  if (status === 'overdue' || status === 'completed') return [];

  const r = state.reminders;
  const { hour, minute } = parseLocalTime(r.dailyTime);
  const repeating: PlannedNotification[] = [];
  const dated: PlannedNotification[] = [];

  if (r.dailyEnabled) {
    repeating.push({
      id: 'daily-refresh',
      title: S.notifications.dailyTitle,
      body: S.notifications.dailyBody(c.title),
      data: { url: '/studio' },
      trigger: { type: 'daily', hour, minute },
    });

    // Deadline day: at the daily time, or one hour before the deadline if that is earlier.
    const instant = deadlineInstant(c);
    let fire = at(c.deadlineDate, r.dailyTime);
    if (fire.getTime() >= instant.getTime()) fire = new Date(instant.getTime() - 3_600_000);
    if (fire.getTime() > now.getTime()) {
      dated.push({
        id: 'deadline-day',
        title: S.notifications.deadlineDayTitle(c.title),
        body: S.notifications.deadlineDayBody,
        data: { url: '/studio' },
        trigger: { type: 'date', at: fire },
      });
    }
  }

  if (r.milestoneEnabled) {
    const n = r.milestoneDaysBefore;
    for (const m of c.milestones) {
      if (m.done) continue;
      const fire = at(addLocalDays(m.date, -n), r.dailyTime);
      if (fire.getTime() <= now.getTime()) continue;
      dated.push({
        id: `ms-${m.id}`,
        title: S.notifications.milestoneTitle(c.emoji, c.title),
        body: n === 0 ? S.notifications.milestoneToday(m.title) : S.notifications.milestoneIn(n, m.title, tMinus(m.date, c.deadlineDate)),
        data: { url: '/home' },
        trigger: { type: 'date', at: fire },
      });
    }
  }

  dated.sort((a, b) => (a.trigger.type === 'date' && b.trigger.type === 'date' ? a.trigger.at.getTime() - b.trigger.at.getTime() : 0));
  return [...repeating, ...dated].slice(0, LIMITS.notificationsMax);
}
