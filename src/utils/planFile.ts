import { DEFAULT_PREFERENCES, DEFAULT_REMINDERS, SIZE_PRESET_IDS } from '@/src/constants/defaults';
import { LIMITS } from '@/src/constants/limits';
import type {
  Countdown,
  ImportedPlan,
  Milestone,
  MilestoneDaysBefore,
  ReminderSettings,
  WallpaperPreferences,
} from '@/src/types/domain';
import { MILESTONE_DAYS_BEFORE_CHOICES } from '@/src/types/domain';
import type { ThemeId } from '@/src/types/theme';
import type { SizePresetId } from '@/src/types/wallpaper';
import { isLocalDate, isLocalTime, toLocalDateString, toLocalTimeString } from './dates';
import { isIconId } from './icons';
import { createId } from './id';

/** Versioned plan file (ARCHITECTURE §5.2). Pure: no file system or React here. */

export const PLAN_SCHEMA = 'countdown-lockscreen/plan';
export const PLAN_VERSION = 1;
export const APP_INFO = { name: 'Countdown Lock Screen', build: '1.0.0' } as const;

const THEME_IDS: readonly ThemeId[] = ['glass-terminal', 'pixel-quest', 'sticker-planner', 'field-journal'];
const FALLBACK_THEME: ThemeId = 'glass-terminal';

export interface PlanFileV1 {
  schema: typeof PLAN_SCHEMA;
  version: 1;
  exportedAt: string;
  app: { name: string; build: string };
  countdown: Countdown;
  reminders: ReminderSettings;
  preferences: WallpaperPreferences;
}

export type ImportError =
  | { code: 'invalid-json' }
  | { code: 'wrong-schema' }
  | { code: 'unsupported-version'; version: number }
  | { code: 'invalid-field'; path: string };

export type ImportResult = { ok: true; plan: ImportedPlan; warnings: string[] } | { ok: false; error: ImportError };

export interface ExportableState {
  countdown: Countdown;
  reminders: ReminderSettings;
  preferences: WallpaperPreferences;
}

export function exportPlan(state: ExportableState, now: Date): PlanFileV1 {
  return {
    schema: PLAN_SCHEMA,
    version: PLAN_VERSION,
    exportedAt: now.toISOString(),
    app: { ...APP_INFO },
    countdown: {
      ...state.countdown,
      milestones: state.countdown.milestones.map((m) => ({ ...m })),
    },
    reminders: { ...state.reminders },
    preferences: { ...state.preferences },
  };
}

export function serializePlan(file: PlanFileV1): string {
  return JSON.stringify(file, null, 2);
}

/** `countdown-plan-YYYY-MM-DD.json` */
export function exportFileName(now: Date): string {
  return `countdown-plan-${toLocalDateString(now)}.json`;
}

// ---------- import ----------

class FieldError extends Error {
  constructor(public path: string) {
    super(path);
  }
}

type Rec = Record<string, unknown>;

function isRecord(v: unknown): v is Rec {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isIsoInstant(v: unknown): v is string {
  return typeof v === 'string' && v.length >= 10 && !Number.isNaN(new Date(v).getTime());
}

function reqString(o: Rec, key: string, path: string, max: number): string {
  const v = o[key];
  if (typeof v !== 'string' || v.trim().length === 0) throw new FieldError(path);
  return v.trim().slice(0, max);
}

function optIso(o: Rec, key: string, path: string): string | null {
  const v = o[key];
  if (v === null || v === undefined) return null;
  if (!isIsoInstant(v)) throw new FieldError(path);
  return v;
}

/** v0 → v1: `countdown.deadline` (ISO instant) → local `deadlineDate` (+ `deadlineTime` unless end of day). */
function migrateV0(raw: Rec): Rec {
  const c = isRecord(raw.countdown) ? { ...raw.countdown } : raw.countdown;
  if (isRecord(c) && c.deadlineDate === undefined && isIsoInstant(c.deadline)) {
    const d = new Date(c.deadline as string);
    c.deadlineDate = toLocalDateString(d);
    const t = toLocalTimeString(d);
    c.deadlineTime = t === '23:59' ? null : t;
    delete c.deadline;
  }
  return { ...raw, version: 1, countdown: c };
}

function parseMilestones(v: unknown, now: Date, warnings: string[]): Milestone[] {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) throw new FieldError('countdown.milestones');
  if (v.length > LIMITS.milestonesMax) throw new FieldError('countdown.milestones');
  const seen = new Set<string>();
  const out = v.map((item: unknown, i: number): Milestone => {
    const path = `countdown.milestones[${i}]`;
    if (!isRecord(item)) throw new FieldError(path);
    const title = reqString(item, 'title', `${path}.title`, LIMITS.milestoneTitleMax);
    if (!isLocalDate(item.date)) throw new FieldError(`${path}.date`);
    let id = typeof item.id === 'string' && item.id ? item.id : '';
    if (!id || seen.has(id)) id = createId('m', now.getTime());
    seen.add(id);
    let icon = item.icon;
    if (!isIconId(icon)) {
      if (icon !== undefined) warnings.push(`Unknown icon at ${path}.icon replaced with "flag".`);
      icon = 'flag';
    }
    const done = item.done === true;
    return {
      id,
      title,
      date: item.date,
      done,
      completedAt: done ? optIso(item, 'completedAt', `${path}.completedAt`) : null,
      icon: icon as Milestone['icon'],
      order: typeof item.order === 'number' && Number.isFinite(item.order) ? item.order : i,
    };
  });
  return [...out].sort((a, b) => a.order - b.order).map((m, i) => ({ ...m, order: i }));
}

function parseCountdown(v: unknown, now: Date, warnings: string[]): Countdown {
  if (!isRecord(v)) throw new FieldError('countdown');
  const title = reqString(v, 'title', 'countdown.title', LIMITS.goalTitleMax);
  if (v.deadlineDate === undefined || v.deadlineDate === null || v.deadlineDate === '') {
    throw new FieldError('countdown.deadlineDate');
  }
  if (!isLocalDate(v.deadlineDate)) throw new FieldError('countdown.deadlineDate');
  const deadlineDate = v.deadlineDate;
  let deadlineTime: string | null = null;
  if (v.deadlineTime !== undefined && v.deadlineTime !== null) {
    if (!isLocalTime(v.deadlineTime)) throw new FieldError('countdown.deadlineTime');
    deadlineTime = v.deadlineTime;
  }
  let startDate = toLocalDateString(now);
  if (v.startDate !== undefined) {
    if (!isLocalDate(v.startDate)) throw new FieldError('countdown.startDate');
    startDate = v.startDate;
  }
  if (startDate > deadlineDate) startDate = deadlineDate;
  let themeId: ThemeId = FALLBACK_THEME;
  if ((THEME_IDS as readonly unknown[]).includes(v.themeId)) themeId = v.themeId as ThemeId;
  else warnings.push(`Unknown theme "${String(v.themeId)}" replaced with "${FALLBACK_THEME}".`);
  const iso = now.toISOString();
  return {
    id: typeof v.id === 'string' && v.id ? v.id : createId('c', now.getTime()),
    title,
    emoji: typeof v.emoji === 'string' && v.emoji ? v.emoji : null,
    deadlineDate,
    deadlineTime,
    motivation: typeof v.motivation === 'string' ? v.motivation.trim().slice(0, LIMITS.motivationMax) : '',
    startDate,
    milestones: parseMilestones(v.milestones, now, warnings),
    themeId,
    createdAt: isIsoInstant(v.createdAt) ? v.createdAt : iso,
    updatedAt: isIsoInstant(v.updatedAt) ? v.updatedAt : iso,
    completedAt: optIso(v, 'completedAt', 'countdown.completedAt'),
  };
}

function parseReminders(v: unknown): ReminderSettings {
  const r: ReminderSettings = { ...DEFAULT_REMINDERS };
  if (!isRecord(v)) return r;
  if (typeof v.dailyEnabled === 'boolean') r.dailyEnabled = v.dailyEnabled;
  if (isLocalTime(v.dailyTime)) r.dailyTime = v.dailyTime;
  if (typeof v.milestoneEnabled === 'boolean') r.milestoneEnabled = v.milestoneEnabled;
  if ((MILESTONE_DAYS_BEFORE_CHOICES as readonly unknown[]).includes(v.milestoneDaysBefore)) {
    r.milestoneDaysBefore = v.milestoneDaysBefore as MilestoneDaysBefore;
  }
  return r;
}

function parsePreferences(v: unknown): WallpaperPreferences {
  const p: WallpaperPreferences = { ...DEFAULT_PREFERENCES };
  if (!isRecord(v)) return p;
  for (const k of ['showMotivation', 'showCompleted', 'showProgress', 'showSafeZones'] as const) {
    if (typeof v[k] === 'boolean') p[k] = v[k] as boolean;
  }
  if ((SIZE_PRESET_IDS as readonly unknown[]).includes(v.sizePresetId)) p.sizePresetId = v.sizePresetId as SizePresetId;
  return p;
}

/**
 * Validates, migrates and normalizes a plan file (FR-29). Past deadlines are allowed (shown as overdue);
 * milestone date ranges are enforced on the next edit, not here.
 */
export function importPlan(input: string | unknown, now: Date): ImportResult {
  let raw: unknown = input;
  if (typeof input === 'string') {
    try {
      raw = JSON.parse(input);
    } catch {
      return { ok: false, error: { code: 'invalid-json' } };
    }
  }
  if (!isRecord(raw) || raw.schema !== PLAN_SCHEMA) return { ok: false, error: { code: 'wrong-schema' } };

  let file: Rec = raw;
  if (file.version === undefined) file = migrateV0(file);
  const version = file.version;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 0) {
    return { ok: false, error: { code: 'invalid-field', path: 'version' } };
  }
  if (version > PLAN_VERSION) return { ok: false, error: { code: 'unsupported-version', version } };
  if (version === 0) file = migrateV0(file);

  const warnings: string[] = [];
  try {
    const countdown = parseCountdown(file.countdown, now, warnings);
    return {
      ok: true,
      plan: { countdown, reminders: parseReminders(file.reminders), preferences: parsePreferences(file.preferences) },
      warnings,
    };
  } catch (e) {
    if (e instanceof FieldError) return { ok: false, error: { code: 'invalid-field', path: e.path } };
    throw e;
  }
}
