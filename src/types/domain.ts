import type { ThemeId } from './theme';
import type { SizePresetId } from './wallpaper';

/** 'YYYY-MM-DD' in the device's local calendar. */
export type LocalDate = string;
/** 'HH:mm' 24h local wall time. */
export type LocalTime = string;
/** Full ISO instant, e.g. new Date().toISOString(). */
export type ISODateTime = string;

export const ICON_IDS = [
  'flag', 'target', 'book-open', 'graduation-cap', 'file-text', 'code', 'terminal',
  'briefcase', 'send', 'mic', 'users', 'plane', 'map-pin', 'luggage', 'camera',
  'piggy-bank', 'wallet', 'dumbbell', 'heart', 'calendar', 'clock', 'star',
  'trophy', 'rocket',
] as const;

export type IconId = (typeof ICON_IDS)[number];

export interface Milestone {
  id: string;
  /** 1–48 chars. */
  title: string;
  /** today ≤ date ≤ countdown.deadlineDate (at edit time). */
  date: LocalDate;
  done: boolean;
  completedAt: ISODateTime | null;
  icon: IconId;
  /** User order (0-based); display order everywhere. */
  order: number;
}

export interface Countdown {
  id: string;
  title: string;
  emoji: string | null;
  deadlineDate: LocalDate;
  /** null → end of day 23:59:59 local. */
  deadlineTime: LocalTime | null;
  /** '' when not set; ≤ 90 chars. */
  motivation: string;
  /** Plan start (for time-elapsed progress). */
  startDate: LocalDate;
  milestones: Milestone[];
  themeId: ThemeId;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  completedAt: ISODateTime | null;
}

export type CountdownStatus = 'upcoming' | 'today' | 'overdue' | 'completed';

export type MilestoneDaysBefore = 0 | 1 | 2 | 3 | 7;
export const MILESTONE_DAYS_BEFORE_CHOICES: readonly MilestoneDaysBefore[] = [0, 1, 2, 3, 7];

export interface ReminderSettings {
  dailyEnabled: boolean;
  dailyTime: LocalTime;
  milestoneEnabled: boolean;
  milestoneDaysBefore: MilestoneDaysBefore;
}

export type CountdownDraft = Omit<Countdown, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'> & {
  mode: 'create' | 'edit';
  editingId: string | null;
};

export interface WallpaperPreferences {
  showMotivation: boolean;
  showCompleted: boolean;
  showProgress: boolean;
  /** Studio overlay only; never rendered into the PNG. */
  showSafeZones: boolean;
  sizePresetId: SizePresetId;
}

export type NotificationPermission = 'granted' | 'denied' | 'undetermined';

export interface AppState {
  countdown: Countdown | null;
  draft: CountdownDraft | null;
  reminders: ReminderSettings;
  preferences: WallpaperPreferences;
  notifications: {
    permission: NotificationPermission;
    lastSyncedAt: ISODateTime | null;
  };
  meta: {
    /** Transient; not persisted. */
    storageError: boolean;
    /** Transient; not persisted. */
    hasHydrated: boolean;
    lastRenderedAt: ISODateTime | null;
  };
}

/** A validated plan ready to replace the current state (planFile import). */
export interface ImportedPlan {
  countdown: Countdown;
  reminders: ReminderSettings;
  preferences: WallpaperPreferences;
}
