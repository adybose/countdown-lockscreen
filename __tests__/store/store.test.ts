import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialState, STORE_KEY, useAppStore } from '@/src/store';
import { migrate } from '@/src/store/migrations';
import { sortMilestones } from '@/src/store/selectors';

const NOW = new Date(2027, 0, 10, 9, 0, 0);

function resetStore() {
  useAppStore.setState({ ...initialState(), meta: { ...initialState().meta, hasHydrated: true } });
}

function startDraftWithDeadline() {
  const s = useAppStore.getState();
  s.startDraft('create');
  s.updateDraft({ title: 'Pass Bio Exam', deadlineDate: '2027-02-20' });
}

beforeEach(async () => {
  await AsyncStorage.clear();
  resetStore();
});

describe('defaults (AC-09)', () => {
  it('has reminder and preference defaults', () => {
    const s = useAppStore.getState();
    expect(s.countdown).toBeNull();
    expect(s.reminders).toEqual({ dailyEnabled: true, dailyTime: '08:00', milestoneEnabled: true, milestoneDaysBefore: 1 });
    expect(s.preferences).toEqual({
      showMotivation: true, showCompleted: true, showProgress: true, showSafeZones: true, sizePresetId: 'device',
    });
    expect(s.notifications.permission).toBe('undetermined');
  });
});

describe('draft milestones (AC-05)', () => {
  it('adds up to 12 and rejects the 13th', () => {
    startDraftWithDeadline();
    for (let i = 0; i < 12; i++) {
      expect(useAppStore.getState().addDraftMilestone({ title: `M${i}`, date: '2027-02-01' })).toBe(true);
    }
    expect(useAppStore.getState().addDraftMilestone({ title: 'M13' })).toBe(false);
    expect(useAppStore.getState().draft?.milestones).toHaveLength(12);
  });

  it('defaults a new milestone date to the deadline', () => {
    startDraftWithDeadline();
    useAppStore.getState().addDraftMilestone();
    expect(useAppStore.getState().draft?.milestones[0].date).toBe('2027-02-20');
  });

  it('updates, moves and removes milestones', () => {
    startDraftWithDeadline();
    const s = useAppStore.getState();
    s.addDraftMilestone({ id: 'a', title: 'A' });
    s.addDraftMilestone({ id: 'b', title: 'B' });
    s.addDraftMilestone({ id: 'c', title: 'C' });
    s.updateDraftMilestone('b', { title: 'B2', icon: 'code' });
    let ms = sortMilestones(useAppStore.getState().draft?.milestones ?? []);
    expect(ms.map((m) => m.title)).toEqual(['A', 'B2', 'C']);
    expect(ms[1].icon).toBe('code');

    s.moveDraftMilestone('c', -1);
    ms = sortMilestones(useAppStore.getState().draft?.milestones ?? []);
    expect(ms.map((m) => m.id)).toEqual(['a', 'c', 'b']);
    expect(ms.map((m) => m.order)).toEqual([0, 1, 2]);

    s.moveDraftMilestone('a', -1); // no-op at the top
    s.moveDraftMilestone('b', 1); // no-op at the bottom
    ms = sortMilestones(useAppStore.getState().draft?.milestones ?? []);
    expect(ms.map((m) => m.id)).toEqual(['a', 'c', 'b']);

    s.removeDraftMilestone('c');
    ms = sortMilestones(useAppStore.getState().draft?.milestones ?? []);
    expect(ms.map((m) => m.id)).toEqual(['a', 'b']);
    expect(ms.map((m) => m.order)).toEqual([0, 1]);
  });

  it('replaceDraftMilestones caps at 12 and renumbers', () => {
    startDraftWithDeadline();
    const many = Array.from({ length: 14 }, (_, i) => ({
      id: `x${i}`, title: `X${i}`, date: '2027-02-01', done: false, completedAt: null, icon: 'flag' as const, order: 99,
    }));
    useAppStore.getState().replaceDraftMilestones(many);
    const ms = useAppStore.getState().draft?.milestones ?? [];
    expect(ms).toHaveLength(12);
    expect(ms.map((m) => m.order)).toEqual([...Array(12).keys()]);
  });
});

describe('commit + edit', () => {
  it('commits a valid draft into a countdown and clears the draft', () => {
    startDraftWithDeadline();
    useAppStore.getState().addDraftMilestone({ title: '  Read ch. 1  ', date: '2027-01-20' });
    const res = useAppStore.getState().commitDraft(NOW);
    expect(res.ok).toBe(true);
    const c = useAppStore.getState().countdown;
    expect(c?.title).toBe('Pass Bio Exam');
    expect(c?.startDate).toBe('2027-01-10');
    expect(c?.milestones[0].title).toBe('Read ch. 1');
    expect(useAppStore.getState().draft).toBeNull();
  });

  it('rejects an invalid draft', () => {
    useAppStore.getState().startDraft('create');
    expect(useAppStore.getState().commitDraft(NOW)).toEqual({ ok: false, reason: 'invalid' });
  });

  it('keeps the create draft across startDraft calls (resume)', () => {
    startDraftWithDeadline();
    useAppStore.getState().startDraft('create');
    expect(useAppStore.getState().draft?.title).toBe('Pass Bio Exam');
  });

  it('edit mode pre-fills from the countdown and keeps the id', () => {
    startDraftWithDeadline();
    useAppStore.getState().commitDraft(NOW);
    const id = useAppStore.getState().countdown?.id;
    useAppStore.getState().startDraft('edit');
    expect(useAppStore.getState().draft).toMatchObject({ mode: 'edit', editingId: id, title: 'Pass Bio Exam' });
    useAppStore.getState().updateDraft({ title: 'Ace Bio Exam' });
    useAppStore.getState().commitDraft(new Date(2027, 0, 11));
    const c = useAppStore.getState().countdown;
    expect(c?.id).toBe(id);
    expect(c?.title).toBe('Ace Bio Exam');
    expect(c?.startDate).toBe('2027-01-10');
  });
});

describe('active countdown actions', () => {
  beforeEach(() => {
    startDraftWithDeadline();
    useAppStore.getState().addDraftMilestone({ id: 'm1', title: 'Read', date: '2027-01-20' });
    useAppStore.getState().commitDraft(NOW);
  });

  it('toggleMilestone flips done and sets/clears completedAt (AC-13)', () => {
    useAppStore.getState().toggleMilestone('m1', NOW);
    let m = useAppStore.getState().countdown?.milestones[0];
    expect(m?.done).toBe(true);
    expect(m?.completedAt).toBe(NOW.toISOString());
    useAppStore.getState().toggleMilestone('m1', NOW);
    m = useAppStore.getState().countdown?.milestones[0];
    expect(m?.done).toBe(false);
    expect(m?.completedAt).toBeNull();
  });

  it('markComplete sets completedAt', () => {
    useAppStore.getState().markComplete(NOW);
    expect(useAppStore.getState().countdown?.completedAt).toBe(NOW.toISOString());
  });

  it('resetCountdown clears countdown and draft (AC-27)', () => {
    useAppStore.getState().startDraft('edit');
    useAppStore.getState().resetCountdown();
    expect(useAppStore.getState().countdown).toBeNull();
    expect(useAppStore.getState().draft).toBeNull();
  });

  it('setTheme targets the countdown when no draft exists', () => {
    useAppStore.getState().setTheme('pixel-quest');
    expect(useAppStore.getState().countdown?.themeId).toBe('pixel-quest');
  });

  it('setPreferences / setReminders patch (AC-16)', () => {
    useAppStore.getState().setPreferences({ showSafeZones: false });
    useAppStore.getState().setReminders({ milestoneDaysBefore: 3 });
    expect(useAppStore.getState().preferences.showSafeZones).toBe(false);
    expect(useAppStore.getState().reminders.milestoneDaysBefore).toBe(3);
  });
});

describe('persistence', () => {
  it('persists and rehydrates the draft (AC-01)', async () => {
    startDraftWithDeadline();
    useAppStore.getState().setPreferences({ showProgress: false });
    // let persist flush
    await new Promise((r) => setTimeout(r, 0));
    const raw = await AsyncStorage.getItem(STORE_KEY);
    expect(raw).toContain('Pass Bio Exam');
    expect(raw).not.toContain('hasHydrated');
    resetStore(); // writes defaults through persist…
    await AsyncStorage.setItem(STORE_KEY, raw as string); // …so restore the saved snapshot
    await useAppStore.persist.rehydrate();
    const s = useAppStore.getState();
    expect(s.draft?.title).toBe('Pass Bio Exam');
    expect(s.preferences.showProgress).toBe(false);
    expect(s.meta.hasHydrated).toBe(true);
    expect(s.meta.storageError).toBe(false);
  });

  it('corrupt JSON resets to defaults and flags storageError once (AC-30)', async () => {
    useAppStore.setState(initialState());
    await new Promise((r) => setTimeout(r, 0));
    await AsyncStorage.setItem(STORE_KEY, '{not json');
    await useAppStore.persist.rehydrate();
    const s = useAppStore.getState();
    expect(s.meta.storageError).toBe(true);
    expect(s.meta.hasHydrated).toBe(true);
    expect(s.countdown).toBeNull();
    expect(await AsyncStorage.getItem(STORE_KEY)).not.toBe('{not json');
    useAppStore.getState().clearStorageError();
    expect(useAppStore.getState().meta.storageError).toBe(false);
  });

  it('migrate passes v0 state through to v1', () => {
    expect(migrate({ countdown: null }, 0)).toEqual({ countdown: null });
    expect(migrate(null, 0)).toEqual({});
  });
});
