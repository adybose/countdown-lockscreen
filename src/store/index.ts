import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LIMITS } from '@/src/constants/limits';
import { nowMs } from '@/src/services/clock';
import { DEFAULT_THEME_ID } from '@/src/themes';
import type {
  AppState,
  Countdown,
  CountdownDraft,
  ImportedPlan,
  Milestone,
  NotificationPermission,
  ReminderSettings,
  WallpaperPreferences,
} from '@/src/types/domain';
import type { ThemeId } from '@/src/types/theme';
import { toLocalDateString } from '@/src/utils/dates';
import { createId } from '@/src/utils/id';
import { migrate, STORE_VERSION } from './migrations';
import { consumeLoadFailure, safeJSONStorage } from './storage';

export const STORE_KEY = 'countdown-lockscreen:state';

export const DEFAULT_REMINDERS: ReminderSettings = {
  dailyEnabled: true,
  dailyTime: '08:00',
  milestoneEnabled: true,
  milestoneDaysBefore: 1,
};

export const DEFAULT_PREFERENCES: WallpaperPreferences = {
  showMotivation: true,
  showCompleted: true,
  showProgress: true,
  showSafeZones: true,
  sizePresetId: 'device',
};

export type CommitResult = { ok: true; countdown: Countdown } | { ok: false; reason: 'no-draft' | 'invalid' };

export interface Actions {
  // draft / wizard
  startDraft(mode: 'create' | 'edit'): void;
  updateDraft(patch: Partial<CountdownDraft>): void;
  /** Returns false when the 12-milestone limit is reached or there is no draft. */
  addDraftMilestone(input?: Partial<Milestone>): boolean;
  updateDraftMilestone(id: string, patch: Partial<Milestone>): void;
  moveDraftMilestone(id: string, dir: -1 | 1): void;
  removeDraftMilestone(id: string): void;
  replaceDraftMilestones(ms: Milestone[]): void;
  discardDraft(): void;
  commitDraft(now: Date): CommitResult;
  // active countdown
  toggleMilestone(id: string, now: Date): void;
  setMilestoneDone(id: string, done: boolean, now: Date): void;
  markComplete(now: Date): void;
  resetCountdown(): void;
  importPlan(plan: ImportedPlan): void;
  // settings
  setReminders(patch: Partial<ReminderSettings>): void;
  setPreferences(patch: Partial<WallpaperPreferences>): void;
  setTheme(id: ThemeId): void;
  setNotificationPermission(p: NotificationPermission): void;
  setNotificationsSynced(at: string): void;
  setLastRenderedAt(at: string): void;
  clearStorageError(): void;
}

export type Store = AppState & Actions;

export function initialState(): AppState {
  return {
    countdown: null,
    draft: null,
    reminders: { ...DEFAULT_REMINDERS },
    preferences: { ...DEFAULT_PREFERENCES },
    notifications: { permission: 'undetermined', lastSyncedAt: null },
    meta: { storageError: false, hasHydrated: false, lastRenderedAt: null },
  };
}

function emptyDraft(): CountdownDraft {
  return {
    mode: 'create',
    editingId: null,
    title: '',
    emoji: null,
    deadlineDate: '',
    deadlineTime: null,
    motivation: '',
    startDate: '',
    milestones: [],
    themeId: DEFAULT_THEME_ID,
  };
}

function draftFromCountdown(c: Countdown): CountdownDraft {
  return {
    mode: 'edit',
    editingId: c.id,
    title: c.title,
    emoji: c.emoji,
    deadlineDate: c.deadlineDate,
    deadlineTime: c.deadlineTime,
    motivation: c.motivation,
    startDate: c.startDate,
    milestones: c.milestones.map((m) => ({ ...m })),
    themeId: c.themeId,
  };
}

/** Sort by `order` and renumber 0..n-1. */
function renumber(ms: Milestone[]): Milestone[] {
  return [...ms].sort((a, b) => a.order - b.order).map((m, i) => ({ ...m, order: i }));
}

function isCommittable(d: CountdownDraft): boolean {
  const title = d.title.trim();
  return (
    title.length >= 1 &&
    title.length <= LIMITS.goalTitleMax &&
    /^\d{4}-\d{2}-\d{2}$/.test(d.deadlineDate) &&
    d.motivation.trim().length <= LIMITS.motivationMax &&
    d.milestones.length <= LIMITS.milestonesMax &&
    d.milestones.every((m) => {
      const t = m.title.trim();
      return t.length >= 1 && t.length <= LIMITS.milestoneTitleMax;
    })
  );
}

function setMilestoneDoneIn(c: Countdown, id: string, done: boolean, now: Date): Countdown {
  return {
    ...c,
    updatedAt: now.toISOString(),
    milestones: c.milestones.map((m) =>
      m.id === id ? { ...m, done, completedAt: done ? now.toISOString() : null } : m,
    ),
  };
}

type Persisted = Pick<AppState, 'countdown' | 'draft' | 'reminders' | 'preferences'> & {
  notifications: Pick<AppState['notifications'], 'permission'>;
  meta: Pick<AppState['meta'], 'lastRenderedAt'>;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/** Deep-ish merge so partial nested persisted objects never drop transient/default fields. */
export function mergePersisted(persisted: unknown, current: Store): Store {
  if (!isRecord(persisted)) return current;
  const p = persisted as Partial<Persisted>;
  return {
    ...current,
    countdown: p.countdown ?? null,
    draft: p.draft ?? null,
    reminders: { ...current.reminders, ...(isRecord(p.reminders) ? p.reminders : {}) },
    preferences: { ...current.preferences, ...(isRecord(p.preferences) ? p.preferences : {}) },
    notifications: {
      ...current.notifications,
      ...(isRecord(p.notifications) ? { permission: p.notifications.permission ?? current.notifications.permission } : {}),
    },
    meta: {
      ...current.meta,
      lastRenderedAt: isRecord(p.meta) ? (p.meta.lastRenderedAt ?? null) : current.meta.lastRenderedAt,
    },
  };
}

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState(),

      startDraft(mode) {
        const { draft, countdown } = get();
        if (mode === 'edit') {
          if (!countdown) return;
          set({ draft: draftFromCountdown(countdown) }); // always a fresh copy of the saved plan
          return;
        }
        if (draft?.mode === 'create') return; // resume the persisted wizard (FR-01)
        set({ draft: emptyDraft() });
      },

      updateDraft(patch) {
        const { draft } = get();
        if (!draft) return;
        set({ draft: { ...draft, ...patch } });
      },

      addDraftMilestone(input) {
        const { draft } = get();
        if (!draft || draft.milestones.length >= LIMITS.milestonesMax) return false;
        const m: Milestone = {
          id: input?.id ?? createId('m', nowMs()),
          title: input?.title ?? '',
          date: input?.date ?? draft.deadlineDate,
          done: input?.done ?? false,
          completedAt: input?.completedAt ?? null,
          icon: input?.icon ?? 'flag',
          order: draft.milestones.length,
        };
        set({ draft: { ...draft, milestones: [...renumber(draft.milestones), m] } });
        return true;
      },

      updateDraftMilestone(id, patch) {
        const { draft } = get();
        if (!draft) return;
        set({
          draft: {
            ...draft,
            milestones: draft.milestones.map((m) => (m.id === id ? { ...m, ...patch, id: m.id, order: m.order } : m)),
          },
        });
      },

      moveDraftMilestone(id, dir) {
        const { draft } = get();
        if (!draft) return;
        const sorted = renumber(draft.milestones);
        const i = sorted.findIndex((m) => m.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= sorted.length) return;
        [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
        set({ draft: { ...draft, milestones: sorted.map((m, k) => ({ ...m, order: k })) } });
      },

      removeDraftMilestone(id) {
        const { draft } = get();
        if (!draft) return;
        set({ draft: { ...draft, milestones: renumber(draft.milestones.filter((m) => m.id !== id)) } });
      },

      replaceDraftMilestones(ms) {
        const { draft } = get();
        if (!draft) return;
        const capped = ms.slice(0, LIMITS.milestonesMax).map((m, i) => ({ ...m, order: i }));
        set({ draft: { ...draft, milestones: capped } });
      },

      discardDraft() {
        set({ draft: null });
      },

      commitDraft(now) {
        const { draft, countdown } = get();
        if (!draft) return { ok: false, reason: 'no-draft' };
        if (!isCommittable(draft)) return { ok: false, reason: 'invalid' };
        const iso = now.toISOString();
        const editing = draft.mode === 'edit' && countdown && countdown.id === draft.editingId ? countdown : null;
        const next: Countdown = {
          id: editing?.id ?? createId('c', now.getTime()),
          title: draft.title.trim(),
          emoji: draft.emoji,
          deadlineDate: draft.deadlineDate,
          deadlineTime: draft.deadlineTime,
          motivation: draft.motivation.trim(),
          startDate: editing?.startDate || draft.startDate || toLocalDateString(now),
          milestones: renumber(draft.milestones).map((m) => ({ ...m, title: m.title.trim() })),
          themeId: draft.themeId,
          createdAt: editing?.createdAt ?? iso,
          updatedAt: iso,
          completedAt: editing?.completedAt ?? null,
        };
        set({ countdown: next, draft: null });
        return { ok: true, countdown: next };
      },

      toggleMilestone(id, now) {
        const { countdown } = get();
        if (!countdown) return;
        const m = countdown.milestones.find((x) => x.id === id);
        if (!m) return;
        set({ countdown: setMilestoneDoneIn(countdown, id, !m.done, now) });
      },

      setMilestoneDone(id, done, now) {
        const { countdown } = get();
        if (!countdown) return;
        set({ countdown: setMilestoneDoneIn(countdown, id, done, now) });
      },

      markComplete(now) {
        const { countdown } = get();
        if (!countdown) return;
        const iso = now.toISOString();
        set({ countdown: { ...countdown, completedAt: iso, updatedAt: iso } });
      },

      resetCountdown() {
        set({ countdown: null, draft: null });
      },

      importPlan(plan) {
        set({
          countdown: plan.countdown,
          draft: null,
          reminders: { ...plan.reminders },
          preferences: { ...plan.preferences },
        });
      },

      setReminders(patch) {
        set({ reminders: { ...get().reminders, ...patch } });
      },

      setPreferences(patch) {
        set({ preferences: { ...get().preferences, ...patch } });
      },

      setTheme(id) {
        const { draft, countdown } = get();
        if (draft) set({ draft: { ...draft, themeId: id } });
        else if (countdown) set({ countdown: { ...countdown, themeId: id } });
      },

      setNotificationPermission(p) {
        set({ notifications: { ...get().notifications, permission: p } });
      },

      setNotificationsSynced(at) {
        set({ notifications: { ...get().notifications, lastSyncedAt: at } });
      },

      setLastRenderedAt(at) {
        set({ meta: { ...get().meta, lastRenderedAt: at } });
      },

      clearStorageError() {
        set({ meta: { ...get().meta, storageError: false } });
      },
    }),
    {
      name: STORE_KEY,
      version: STORE_VERSION,
      storage: safeJSONStorage<Persisted>(AsyncStorage),
      partialize: (s): Persisted => ({
        countdown: s.countdown,
        draft: s.draft,
        reminders: s.reminders,
        preferences: s.preferences,
        notifications: { permission: s.notifications.permission },
        meta: { lastRenderedAt: s.meta.lastRenderedAt },
      }),
      migrate: (persisted, version) => migrate(persisted, version) as unknown as Persisted,
      merge: (persisted, current) => mergePersisted(persisted, current),
      onRehydrateStorage: () => (_state, error) => {
        const failed = consumeLoadFailure() || Boolean(error);
        useAppStore.setState((s) => ({
          meta: { ...s.meta, hasHydrated: true, storageError: s.meta.storageError || failed },
        }));
      },
    },
  ),
);
