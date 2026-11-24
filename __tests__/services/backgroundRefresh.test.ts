import { FEATURE_BG_REFRESH, registerBackgroundRefresh, shouldPostRefreshReminder } from '@/src/services/backgroundRefresh';
import type { Countdown } from '@/src/types/domain';

const c: Countdown = {
  id: 'c1', title: 'Goal', emoji: null, deadlineDate: '2027-03-01', deadlineTime: null, motivation: '',
  startDate: '2027-01-01', milestones: [], themeId: 'glass-terminal', createdAt: '', updatedAt: '', completedAt: null,
};
const NOW = new Date(2027, 0, 10, 12);

describe('backgroundRefresh (FR-25 stub)', () => {
  it('is feature-flagged off and registers nothing', async () => {
    expect(FEATURE_BG_REFRESH).toBe(false);
    expect(await registerBackgroundRefresh()).toBe(false);
  });
  it('posts only when the last render was on an earlier day', () => {
    expect(shouldPostRefreshReminder({ countdown: c, meta: { lastRenderedAt: null } }, NOW)).toBe(true);
    expect(shouldPostRefreshReminder({ countdown: c, meta: { lastRenderedAt: new Date(2027, 0, 9, 22).toISOString() } }, NOW)).toBe(true);
    expect(shouldPostRefreshReminder({ countdown: c, meta: { lastRenderedAt: new Date(2027, 0, 10, 7).toISOString() } }, NOW)).toBe(false);
  });
  it('never posts without an active countdown', () => {
    expect(shouldPostRefreshReminder({ countdown: null, meta: { lastRenderedAt: null } }, NOW)).toBe(false);
    expect(shouldPostRefreshReminder({ countdown: { ...c, deadlineDate: '2027-01-01' }, meta: { lastRenderedAt: null } }, NOW)).toBe(false);
  });
});
