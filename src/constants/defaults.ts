import type { ReminderSettings, WallpaperPreferences } from '@/src/types/domain';

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

export const SIZE_PRESET_IDS = [
  'device',
  'android-fhd',
  'android-qhd',
  'iphone-pro',
  'iphone-pro-max',
  'desktop-16x10',
  'desktop-mbp',
] as const;
