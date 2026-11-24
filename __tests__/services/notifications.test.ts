import * as Notifications from 'expo-notifications';
import { DEFAULT_REMINDERS } from '@/src/constants/defaults';
import { shouldDailySync, subscribeNotificationSync } from '@/src/services/notificationSync';
import { ensurePermission, routeFromNotificationData, syncNotifications } from '@/src/services/notifications';
import { initialState, useAppStore } from '@/src/store';
import type { Countdown } from '@/src/types/domain';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('id')),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DAILY: 'daily', DATE: 'date' },
}));

const N = Notifications as jest.Mocked<typeof Notifications>;
const granted = { granted: true, status: 'granted', canAskAgain: true } as unknown as Notifications.NotificationPermissionsStatus;
const denied = { granted: false, status: 'denied', canAskAgain: false } as unknown as Notifications.NotificationPermissionsStatus;
const undetermined = { granted: false, status: 'undetermined', canAskAgain: true } as unknown as Notifications.NotificationPermissionsStatus;

const countdown: Countdown = {
  id: 'c1', title: 'Pass Bio Exam', emoji: null, deadlineDate: '2027-03-01', deadlineTime: null, motivation: '',
  startDate: '2027-01-01', themeId: 'glass-terminal', createdAt: '', updatedAt: '', completedAt: null,
  milestones: [
    { id: 'a', title: 'A', date: '2027-01-20', done: false, completedAt: null, icon: 'flag', order: 0 },
    { id: 'b', title: 'B', date: '2027-02-10', done: false, completedAt: null, icon: 'flag', order: 1 },
  ],
};
const NOW = new Date(2027, 0, 10, 12);

beforeEach(() => jest.clearAllMocks());

describe('syncNotifications (AC-26)', () => {
  it('cancels everything, then schedules each planned item', async () => {
    N.getPermissionsAsync.mockResolvedValue(granted);
    const res = await syncNotifications({ countdown, reminders: DEFAULT_REMINDERS }, NOW);
    expect(res).toEqual({ ok: true, scheduled: 4 }); // daily + deadline-day + 2 milestones
    expect(N.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(N.scheduleNotificationAsync).toHaveBeenCalledTimes(4);
    const cancelOrder = N.cancelAllScheduledNotificationsAsync.mock.invocationCallOrder[0];
    expect(N.scheduleNotificationAsync.mock.invocationCallOrder[0]).toBeGreaterThan(cancelOrder);
    expect(N.scheduleNotificationAsync.mock.calls[0][0]).toMatchObject({
      identifier: 'daily-refresh',
      content: { data: { url: '/studio' } },
      trigger: { type: 'daily', hour: 8, minute: 0, channelId: 'reminders' },
    });
    expect(N.scheduleNotificationAsync.mock.calls[1][0]).toMatchObject({ trigger: { type: 'date' } });
  });

  it('is a no-op when permission is denied', async () => {
    N.getPermissionsAsync.mockResolvedValue(denied);
    expect(await syncNotifications({ countdown, reminders: DEFAULT_REMINDERS }, NOW)).toEqual({ ok: false, reason: 'permission' });
    expect(N.cancelAllScheduledNotificationsAsync).not.toHaveBeenCalled();
    expect(N.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('after reset (no countdown) cancels and schedules nothing (AC-27)', async () => {
    N.getPermissionsAsync.mockResolvedValue(granted);
    expect(await syncNotifications({ countdown: null, reminders: DEFAULT_REMINDERS }, NOW)).toEqual({ ok: true, scheduled: 0 });
    expect(N.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(N.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('reports errors instead of throwing', async () => {
    N.getPermissionsAsync.mockRejectedValue(new Error('boom'));
    expect(await syncNotifications({ countdown, reminders: DEFAULT_REMINDERS }, NOW)).toEqual({ ok: false, reason: 'error' });
  });
});

describe('ensurePermission', () => {
  it('returns granted without asking', async () => {
    N.getPermissionsAsync.mockResolvedValue(granted);
    expect(await ensurePermission()).toBe('granted');
    expect(N.requestPermissionsAsync).not.toHaveBeenCalled();
  });
  it('asks when undetermined', async () => {
    N.getPermissionsAsync.mockResolvedValue(undetermined);
    N.requestPermissionsAsync.mockResolvedValue(granted);
    expect(await ensurePermission()).toBe('granted');
  });
  it('does not re-ask when permanently denied', async () => {
    N.getPermissionsAsync.mockResolvedValue(denied);
    expect(await ensurePermission()).toBe('denied');
    expect(N.requestPermissionsAsync).not.toHaveBeenCalled();
  });
});

describe('store → sync subscription (AC-26)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useAppStore.setState({ ...initialState() });
  });
  afterEach(() => jest.useRealTimers());

  it('debounces and calls sync when reminders or the countdown change', () => {
    const sync = jest.fn();
    const unsub = subscribeNotificationSync(useAppStore, sync, 500);
    useAppStore.getState().setReminders({ dailyTime: '09:00' });
    useAppStore.getState().setReminders({ milestoneDaysBefore: 2 });
    expect(sync).not.toHaveBeenCalled();
    jest.advanceTimersByTime(500);
    expect(sync).toHaveBeenCalledTimes(1);
    expect(sync.mock.calls[0][0].reminders).toMatchObject({ dailyTime: '09:00', milestoneDaysBefore: 2 });

    useAppStore.getState().setPreferences({ showProgress: false }); // unrelated change
    jest.advanceTimersByTime(500);
    expect(sync).toHaveBeenCalledTimes(1);

    useAppStore.getState().resetCountdown();
    useAppStore.setState({ countdown });
    jest.advanceTimersByTime(500);
    expect(sync).toHaveBeenCalledTimes(2);
    unsub();
  });
});

describe('helpers', () => {
  it('routes only known urls', () => {
    expect(routeFromNotificationData({ url: '/studio' })).toBe('/studio');
    expect(routeFromNotificationData({ url: '/home' })).toBe('/home');
    expect(routeFromNotificationData({ url: 'https://evil' })).toBeNull();
    expect(routeFromNotificationData(null)).toBeNull();
  });
  it('daily foreground sync runs once per calendar day', () => {
    expect(shouldDailySync(null, NOW)).toBe(true);
    expect(shouldDailySync(new Date(2027, 0, 10, 7).toISOString(), NOW)).toBe(false);
    expect(shouldDailySync(new Date(2027, 0, 9, 23).toISOString(), NOW)).toBe(true);
    expect(shouldDailySync('garbage', NOW)).toBe(true);
  });
});
