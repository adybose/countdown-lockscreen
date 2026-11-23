# ARCHITECTURE — Countdown Lock Screen

Status: **Draft for human review** · Related: `SPEC.md`, `DESIGN.md`, `DECISIONS.md`

> Code blocks here are **interface sketches** for the build phase, not final code. If the installed library APIs differ (for example, the trigger shapes in `expo-notifications`), follow the installed types and record an ADR if behavior changes.

## 1. System overview

```
┌──────────────────────────── Expo app (TypeScript) ────────────────────────────┐
│  app/ (Expo Router screens)                                                    │
│     │ read/write via hooks                                                     │
│     ▼                                                                          │
│  src/store (zustand + persist) ──► AsyncStorage (single JSON key)              │
│     │ selectors                                                                │
│     ▼                                                                          │
│  src/utils (PURE: dates, planner, validation, wallpaper model, import/export)  │
│     │                                                                          │
│     ▼                                                                          │
│  src/components/wallpaper/<Wallpaper> (PURE render: tokens + model → SVG/Views) │
│     │ ref                                                                      │
│     ▼                                                                          │
│  src/services (SIDE EFFECTS)                                                   │
│     ├─ capture (react-native-view-shot | web: html-to-image) → PNG file/URI    │
│     ├─ media (expo-media-library)    ├─ share (expo-sharing)                   │
│     ├─ notifications (expo-notifications, local only)                         │
│     ├─ planFile (expo-file-system + expo-document-picker)                      │
│     └─ lockscreen ──► modules/lockscreen-wallpaper (Kotlin, Android only)      │
└────────────────────────────────────────────────────────────────────────────────┘
No network. No backend. No analytics.
```

## 2. Module / folder map

Folders marked ✱ exist now as empty `.gitkeep` skeletons. Files are created during the build.

```
app/ ✱
  _layout.tsx               Root Stack: fonts + hydration gate (splash), notification-tap listener, theme chrome
  index.tsx                 Redirect: countdown ? /home : /onboarding/goal
  home.tsx                  Home (FR-10..14)
  studio.tsx                Lock Screen Studio (FR-15..21)
  ios-guide.tsx             Modal guide (FR-22), presentation: 'modal'
  settings.tsx              Settings (FR-26..29)
  +not-found.tsx
  onboarding/ ✱
    _layout.tsx             Stack + StepHeader (progress dots); reads ?mode=edit
    goal.tsx  deadline.tsx  motivation.tsx  milestones.tsx  theme.tsx  reminders.tsx
src/
  types/ ✱
    domain.ts               Countdown, Milestone, ReminderSettings, AppState, …
    theme.ts                ThemeId, ThemeTokens, BackgroundSpec, PathStyle
    wallpaper.ts            WallpaperRenderOptions, WallpaperModel, CanvasSize, SizePreset
  constants/                (created at build) strings.ts (all user-facing copy), limits.ts
  utils/ ✱                  PURE: no React/Expo imports
    dates.ts                parseLocalDate, toLocalDateString, deadlineInstant, getCountdownParts,
                            getCountdownStatus, daysLeft, formatDeadline, tMinus, formatTMinusLabel
    planner.ts              autoPlanBackward, milestoneCountFor
    validation.ts           validateGoal, validateDeadline, validateMotivation, validateMilestones,
                            isChronological
    progress.ts             getNextMilestone, getProgress
    icons.ts                suggestIcon (keyword map → IconId)
    wallpaperModel.ts       buildWallpaperModel (what to render; row selection; hero variant)
    canvas.ts               unitFor(size), resolveCanvasSize(preset, screen, pixelRatio), SAFE_ZONES
    planFile.ts             exportPlan, importPlan, migrations
    notificationPlan.ts     planNotifications (pure schedule computation)
    prng.ts                 hashString, mulberry32
    contrast.ts             relativeLuminance, contrastRatio
    id.ts                   createId (timestamp + counter; no crypto dependency)
  themes/ ✱
    tokens/glassTerminal.ts pixelQuest.ts stickerPlanner.ts fieldJournal.ts
    index.ts                THEMES: Record<ThemeId, ThemeTokens>, THEME_ORDER
    fonts.ts                FONT_MAP (require of assets/fonts/*.ttf), FontKey
    icons.ts                ICON_COMPONENTS: Record<IconId, LucideIcon>
    chrome.ts               App-chrome light/dark tokens (DESIGN §6.5)
  store/ ✱
    index.ts                useAppStore (zustand + persist)
    storage.ts              safeJSONStorage (catches corrupt JSON → flags storageError)
    migrations.ts           persist `migrate` (version → version)
    selectors.ts            selectActiveCountdown, selectSortedMilestones, …
  components/
    ui/ ✱                   Button, IconButton, TextField, DateField(.web).tsx, TimeField(.web).tsx,
                            Toggle, Segmented, Checkbox, ProgressBar, Toast, StepHeader, Banner
    wallpaper/ ✱
      Wallpaper.tsx         Public pure component (§6)
      WallpaperFrame.tsx    Zones (top/content/bottom), unit context
      parts/                Header, Hero, ProgressStrip, MilestoneRow, FinishRow, Motivation, MoreChip
      themes/ ✱             One folder per theme: Background.tsx, Path.tsx, decorations
        glass-terminal/  pixel-quest/  sticker-planner/  field-journal/
      SafeZoneOverlay.tsx   Studio-only overlay (never inside capture ref)
      WallpaperPreview.tsx  Scales a full-size <Wallpaper> into a box (transform: scale)
    home/                   CountdownHero, NextMilestoneCard, DualProgress, Checklist
    studio/                 ThemeChips, OptionToggles, ActionBar, SizePresetSheet, CaptureHost
  services/ ✱
    capture.ts              captureWallpaper(ref, sizePx) → { uri } (view-shot)
    capture.web.ts          (stretch) html-to-image / view-shot web → data URI + download
    media.ts                saveToGallery(uri)
    share.ts                sharePng(uri), shareJson(uri)
    planFile.ts             writeExportFile(json) / pickImportFile()
    notifications.ts        configureNotifications(), ensurePermission(), syncNotifications(state)
    lockscreen.ts           JS wrapper over native module with availability detection
  hooks/ ✱
    useNow.ts               Minute-aligned clock (only clock source for UI)
    useAppReady.ts          fonts + hydration
    useCanvasSize.ts        Resolves preset → { layout, px }
    useWallpaperCapture.ts  Mount CaptureHost → wait 2 frames → capture → unmount
modules/lockscreen-wallpaper/ ✱   Expo local module (§8)
assets/
  fonts/ ✱                  12 .ttf + LICENSES/
  images/ ✱                 icon.png, adaptive-icon.png, splash-icon.png (from template)
__tests__/ ✱
  utils/ dates.test.ts planner.test.ts validation.test.ts progress.test.ts wallpaperModel.test.ts
         canvas.test.ts planFile.test.ts notificationPlan.test.ts icons.test.ts prng.test.ts
  themes/ contrast.test.ts tokens.test.ts
  store/ store.test.ts
  services/ lockscreen.test.ts notifications.test.ts
  components/ Wallpaper.test.tsx  (smoke render of all 4 themes × 4 statuses)
eas.json  app.json  tsconfig.json  package.json  jest config (in package.json)  bootstrap.sh
```

## 3. Domain types (sketch)

```ts
// src/types/domain.ts
export type LocalDate = string;     // 'YYYY-MM-DD' in the device's local calendar
export type LocalTime = string;     // 'HH:mm' 24h local wall time
export type ISODateTime = string;   // full ISO instant, e.g. new Date().toISOString()

export type IconId =
  | 'flag' | 'target' | 'book-open' | 'graduation-cap' | 'file-text' | 'code' | 'terminal'
  | 'briefcase' | 'send' | 'mic' | 'users' | 'plane' | 'map-pin' | 'luggage' | 'camera'
  | 'piggy-bank' | 'wallet' | 'dumbbell' | 'heart' | 'calendar' | 'clock' | 'star'
  | 'trophy' | 'rocket';

export interface Milestone {
  id: string;
  title: string;               // 1–48 chars
  date: LocalDate;             // today ≤ date ≤ countdown.deadlineDate (at edit time)
  done: boolean;
  completedAt: ISODateTime | null;
  icon: IconId;
  order: number;               // user order (0-based); display order everywhere
}

export interface Countdown {
  id: string;
  title: string;               // 1–60 chars
  emoji: string | null;
  deadlineDate: LocalDate;
  deadlineTime: LocalTime | null;   // null → end of day 23:59:59 local
  motivation: string;          // '' when not set; ≤ 90 chars
  startDate: LocalDate;        // plan start (for time-elapsed progress)
  milestones: Milestone[];     // ≤ 12
  themeId: ThemeId;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  completedAt: ISODateTime | null;  // user tapped "Mark goal complete"
}

export type CountdownStatus = 'upcoming' | 'today' | 'overdue' | 'completed';

export interface ReminderSettings {
  dailyEnabled: boolean;              // default true
  dailyTime: LocalTime;               // default '08:00'
  milestoneEnabled: boolean;          // default true
  milestoneDaysBefore: 0 | 1 | 2 | 3 | 7;  // default 1
}

export type CountdownDraft = Omit<Countdown, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'> & {
  mode: 'create' | 'edit';
  editingId: string | null;
};

export interface WallpaperPreferences {
  showMotivation: boolean;     // default true
  showCompleted: boolean;      // default true
  showProgress: boolean;       // default true
  showSafeZones: boolean;      // default true (Studio overlay only; never rendered into PNG)
  sizePresetId: SizePresetId;  // default 'device'
}

export interface AppState {
  countdown: Countdown | null;
  draft: CountdownDraft | null;
  reminders: ReminderSettings;
  preferences: WallpaperPreferences;
  notifications: {
    permission: 'granted' | 'denied' | 'undetermined';
    lastSyncedAt: ISODateTime | null;
  };
  meta: {
    storageError: boolean;     // transient; not persisted
    hasHydrated: boolean;      // transient; not persisted
    lastRenderedAt: ISODateTime | null;
  };
}
```

```ts
// src/types/theme.ts
export type ThemeId = 'glass-terminal' | 'pixel-quest' | 'sticker-planner' | 'field-journal';
export type PathStyle = 'circuit' | 'pixel-trail' | 'ribbon-stack' | 'road';
export type FontKey =
  | 'Inter_400Regular' | 'Inter_600SemiBold' | 'Inter_800ExtraBold'
  | 'JetBrainsMono_400Regular' | 'JetBrainsMono_700Bold'
  | 'PressStart2P_400Regular' | 'VT323_400Regular'
  | 'Fredoka_500Medium' | 'Fredoka_700Bold'
  | 'PlayfairDisplay_700Bold' | 'Lora_500Medium' | 'Caveat_700Bold';

export interface ThemeColors {
  background: string; backgroundAlt: string;
  surface: string; surfaceStrong?: string; surfaceBorder: string; surfaceHighlight?: string;
  surfaceShadow?: string; tape?: string;
  textPrimary: string; textSecondary: string; textMuted: string;
  accent: string; accentAlt: string; success: string; danger: string;
  trail: string; trailGlow?: string;
  node: string; nodeActive: string; nodeDone: string;
  badgeBg: string; badgeText: string;
  road?: string; roadDash?: string; roadEdge?: string;
}

export interface ThemeTokens {
  id: ThemeId;
  name: string;                              // "Glass Terminal"
  colors: ThemeColors;
  fonts: { display: FontKey; body: FontKey; bodyStrong?: FontKey; hand?: FontKey };
  sizes: {                                   // canvas units u (DESIGN §3)
    title: number; hero: number; heroUnit: number; badge: number;
    tLabel: number; rowTitle: number; motivation: number; caption: number;
  };
  radii: { card: number; badge: number; node: number; checkbox: number };   // u; 999 = pill
  spacing: { xxs: number; xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
  background: { kind: 'gradient-glow' | 'pixel-bands' | 'grid-paper' | 'parchment'; [k: string]: unknown };
  pathStyle: PathStyle;
  maxRows: { portrait: number; landscape: number };
  icon: { strokeWidth: number; size: number; color: keyof ThemeColors; container: 'none' | 'outline-square' | 'sticker-circle' };
  contrastPairs: Array<{ fg: keyof ThemeColors; bg: keyof ThemeColors; min: 4.5 | 3 }>;
}
```

```ts
// src/types/wallpaper.ts
export interface CanvasSize { width: number; height: number }   // layout units (dp)
export type Orientation = 'portrait' | 'landscape';
export interface SafeZoneSpec { topPct: number; bottomPct: number; sidePct: number }
export const PORTRAIT_SAFE: SafeZoneSpec  = { topPct: 30, bottomPct: 12, sidePct: 7 };
export const LANDSCAPE_SAFE: SafeZoneSpec = { topPct: 8,  bottomPct: 12, sidePct: 4 };

export type SizePresetId = 'device' | 'android-fhd' | 'android-qhd' | 'iphone-pro'
  | 'iphone-pro-max' | 'desktop-16x10' | 'desktop-mbp';

export interface WallpaperRenderOptions {
  now: ISODateTime;              // the ONLY time source for the render (determinism)
  showMotivation: boolean;
  showCompleted: boolean;
  showProgress: boolean;
  orientation: Orientation;
  safeZone: SafeZoneSpec;
  maxRows?: number;              // override theme default
}

export interface WallpaperProps {
  countdown: Countdown | CountdownDraft;   // drafts render in the theme picker
  theme: ThemeId;
  size: CanvasSize;
  options: WallpaperRenderOptions;
}

export interface WallpaperRow {
  id: string; tLabel: string; dateLabel: string; title: string; icon: IconId;
  state: 'done' | 'next' | 'pending' | 'missed';
}
export interface WallpaperModel {
  status: CountdownStatus;
  header: { title: string; emoji: string | null; deadlineLabel: string };
  hero: { primary: string; secondary: string; tone: 'normal' | 'danger' | 'success' };
  progress: { done: number; total: number; ratio: number } | null;
  rows: WallpaperRow[];
  overflowCount: number;          // → "+N more" chip
  finish: { tLabel: 'T-0'; dateLabel: string; label: string };
  motivation: string | null;
  banner: string | null;          // e.g. "All milestones done — final stretch!"
  seed: number;                   // mulberry32 seed for decorations
}
```

## 4. Key pure functions (contracts)

| Function | Contract |
|---|---|
| `parseLocalDate(d: LocalDate): Date` | `new Date(y, m-1, d)`: local midnight. Throws on invalid input. |
| `toLocalDateString(date: Date): LocalDate` | Local components, zero-padded. |
| `deadlineInstant(c): Date` | Local `deadlineDate` at `deadlineTime` or 23:59:59.999. |
| `daysLeft(now, c): number` | `differenceInCalendarDays(parseLocalDate(c.deadlineDate), now)`. |
| `getCountdownParts(now, c)` | `{days, hours, minutes}` of `max(0, instant − now)`. Days = floor(ms / 86 400 000). |
| `getCountdownStatus(now, c)` | `completed` if `completedAt`; `overdue` if now > instant; `today` if daysLeft = 0; else `upcoming`. |
| `tMinus(milestoneDate, deadlineDate)` | Calendar-day difference (≥ 0 for valid data). |
| `formatTMinusLabel(m, c)` | `"T-30 · Dec 2"`. |
| `milestoneCountFor(D)` | D ≥ 42 → 6; 28–41 → 5; 14–27 → 4; else 3. |
| `autoPlanBackward({today, deadlineDate, now})` | `n = milestoneCountFor(D)`, `D = days(today→deadline)`. For i = 1…n: `offset_i = round(D · i / (n + 1))` days **before** the deadline. Returns ascending by date (dates may repeat when D is small; all are within `[today, deadline]`). Default titles come from the phase template by relative position: `Research & scope`, `Outline the plan`, `First draft / first rep`, `Midpoint check-in`, `Polish & practice`, `Final review` (choose n evenly spaced from the 6). Each title gets `suggestIcon`. |
| `validateMilestones(ms, today, deadlineDate)` | Returns per-ID errors: `before-today`, `after-deadline`, `empty-title`, `title-too-long`, plus the global `too-many`. |
| `getNextMilestone(now, c)` | First by `order` with `!done && date ≥ today`. |
| `getProgress(now, c)` | `{ milestoneRatio: done/total \| null, timeRatio: clamp((now−start)/(instant−start)) }`. |
| `buildWallpaperModel(c, options, theme)` | Hero variant by status. Row selection: **pending rows first (from next onward, by order)**; if `showCompleted`, prepend **at most 1** most-recent done row; cap at `maxRows`; the remainder becomes `overflowCount`. Overdue: pending → `missed`. |
| `resolveCanvasSize(presetId, screen, pixelRatio)` | `{ px: {w,h}, layout: {w: px.w / pixelRatio, h: px.h / pixelRatio} }`. `device` = `round(screen × pixelRatio)`. |
| `planNotifications(state, now)` | §9. |
| `exportPlan(state, now)` / `importPlan(json, now)` | §5. |

## 5. State, persistence & JSON import/export

### 5.1 Store
- `zustand` `create<AppState & Actions>()(persist(…))`.
- Persist key: `countdown-lockscreen:state`. `version: 1`. `storage: safeJSONStorage(AsyncStorage)`.
- `partialize`: persist `countdown`, `draft`, `reminders`, `preferences`, `notifications.permission`, `meta.lastRenderedAt`. **Exclude** `meta.storageError`, `meta.hasHydrated`.
- `onRehydrateStorage` sets `meta.hasHydrated = true` (also on error). The root layout waits for it.
- `safeJSONStorage.getItem`: on `JSON.parse` failure, remove the key, set a module-level `lastLoadFailed = true`, and return `null`. The store reads it after hydration and sets `meta.storageError` (FR-30 / AC-30).
- `migrate(persisted, fromVersion)`: a chain of pure functions in `store/migrations.ts`.

**Actions (sketch):**
```ts
interface Actions {
  // draft / wizard
  startDraft(mode: 'create' | 'edit'): void;               // edit → copy of countdown
  updateDraft(patch: Partial<CountdownDraft>): void;
  addDraftMilestone(input?: Partial<Milestone>): void;     // rejects beyond 12
  updateDraftMilestone(id: string, patch: Partial<Milestone>): void;
  moveDraftMilestone(id: string, dir: -1 | 1): void;
  removeDraftMilestone(id: string): void;
  replaceDraftMilestones(ms: Milestone[]): void;           // auto-plan / sort-by-date
  commitDraft(now: Date): void;                            // validates; creates/updates countdown; clears draft
  // active countdown
  toggleMilestone(id: string, now: Date): void;
  markComplete(now: Date): void;
  resetCountdown(): void;                                  // countdown=null, draft=null
  importPlan(plan: ImportedPlan): void;
  // settings
  setReminders(patch: Partial<ReminderSettings>): void;
  setPreferences(patch: Partial<WallpaperPreferences>): void;
  setTheme(id: ThemeId): void;                             // countdown.themeId (or draft)
  setNotificationPermission(p: AppState['notifications']['permission']): void;
}
```
Side effects (notification sync) are **not** in the store. A `useNotificationSync()` hook in the root layout subscribes to `countdown` + `reminders` changes (shallow compare) and calls `syncNotifications()` (debounced 500 ms).

### 5.2 Plan file schema (export/import)

```json
{
  "schema": "countdown-lockscreen/plan",
  "version": 1,
  "exportedAt": "2026-11-24T10:00:00.000Z",
  "app": { "name": "Countdown Lock Screen", "build": "1.0.0" },
  "countdown": {
    "id": "c_lx1abc_0",
    "title": "Land a summer internship",
    "emoji": "💼",
    "deadlineDate": "2027-01-01",
    "deadlineTime": null,
    "motivation": "Future me will thank me.",
    "startDate": "2026-11-24",
    "themeId": "glass-terminal",
    "completedAt": null,
    "createdAt": "2026-11-24T10:00:00.000Z",
    "updatedAt": "2026-11-24T10:00:00.000Z",
    "milestones": [
      { "id": "m_1", "title": "Polish resume", "date": "2026-12-02", "done": false,
        "completedAt": null, "icon": "file-text", "order": 0 }
    ]
  },
  "reminders": { "dailyEnabled": true, "dailyTime": "08:00", "milestoneEnabled": true, "milestoneDaysBefore": 1 },
  "preferences": { "showMotivation": true, "showCompleted": true, "showProgress": true, "showSafeZones": true, "sizePresetId": "device" }
}
```

**Import rules (`importPlan`)** return `{ ok: true, plan } | { ok: false, error: ImportError }`:
- `wrong-schema`: missing/unknown `schema`.
- `unsupported-version`: `version > CURRENT_VERSION`.
- `invalid-field` (with path): type guards on every field; `LocalDate` regex `^\d{4}-\d{2}-\d{2}$` + real-date check; unknown `themeId` → coerced to `glass-terminal` (warning, not error); unknown icon → `flag`.
- Past deadlines **are allowed** on import (shown as overdue). Milestone range validation is **not** enforced on import (it is enforced on the next edit).
- Migrations: `version` missing → treated as v0 (fixture: `deadline` as an ISO string → converted to a local `deadlineDate`).
- IDs are regenerated if duplicate.

Export: `expo-file-system` writes `countdown-plan-YYYY-MM-DD.json` to the cache directory, then `expo-sharing` shares it (`mimeType: 'application/json'`). Web: Blob download.
Import: `expo-document-picker` (`type: 'application/json'`, `copyToCacheDirectory: true`), then read the text, then `importPlan`, then a confirm dialog, then the store `importPlan`, then `syncNotifications`.

## 6. `<Wallpaper>` rendering

```
<Wallpaper countdown theme size options>
  ├─ tokens = THEMES[theme]; u = unitFor(size); model = buildWallpaperModel(countdown, options, tokens)
  ├─ <View style={{width,height, backgroundColor}} collapsable={false}>
  │    <ThemeBackground tokens size u seed/>                (absolute, full-bleed Svg)
  │    <WallpaperFrame safeZone orientation>                (computes zone rects)
  │       <ContentZone>
  │          <Header/> <Hero/> {progress && <ProgressStrip/>}
  │          <ThemePath rows finish u tokens/>              (theme-specific Svg + RN Text)
  │          {motivation && <Motivation/>}
  │       </ContentZone>
  │    </WallpaperFrame>
  └─ </View>
```

Rules:
- **Pure**: there's no store, clock, or `Platform`-dependent layout inside. Text uses `allowFontScaling={false}` so the system font scale never changes the PNG.
- Text uses RN `<Text>` (best font support across platforms). Shapes use `react-native-svg`.
- `React.memo` with a shallow props compare. The model is computed via `useMemo`.
- Theme path components share one interface: `({ model, tokens, u, rect }) => ReactElement`.
- The same component renders the 72-pt theme-picker thumbnails, the Studio preview, and the capture host.

## 7. Capture pipeline (react-native-view-shot)

```
Studio
 ├─ Preview: <WallpaperPreview> = <View style={box}>
 │             <View style={{transform:[{scale: box.w / layout.w}], width: layout.w, height: layout.h}}>
 │               <Wallpaper size={layout} …/>
 │             </View>
 │             {showSafeZones && <SafeZoneOverlay/>}        ← sibling, never captured
 │           </View>
 └─ CaptureHost (mounted only while exporting):
      <View pointerEvents="none" style={{position:'absolute', left: -layout.w - 100, top: 0}}>
        <View ref={captureRef} collapsable={false}>
          <Wallpaper size={layout} options={{...opts, now: frozenNow}}/>
        </View>
      </View>
```

Steps (`useWallpaperCapture`):
1. `frozenNow = new Date().toISOString()` (the preview and export use the same `now`).
2. Assert fonts are ready (DESIGN §7.5).
3. Mount the CaptureHost, then wait for `onLayout` + 2× `requestAnimationFrame` (SVG paint).
4. `captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile', width: px.w, height: px.h })`.
   - The layout size is `px / PixelRatio.get()`, so the native snapshot is already ≈ `px`. Passing `width/height` forces exact output dimensions.
5. Unmount the host. Return the `file://…png` URI. Log the duration in `__DEV__` (NFR-03).
6. Consumers: `saveToGallery(uri)`, `sharePng(uri)`, `lockscreen.setLockScreen(uri)`.

**Fallback (if an off-screen capture is blank on a device):** render the host on-screen at `left: 0, top: 0` underneath an opaque full-screen "Rendering…" view. view-shot snapshots the target view's own drawing, so the overlay above it doesn't leak in. Record an ADR if you switch.

**Web (stretch):** `capture.web.ts` first tries `react-native-view-shot`'s web support. If that's unavailable or produces a wrong size, use `html-to-image` `toPng(node, { width, height, pixelRatio: px.w / layout.w })` and trigger a download via an anchor `download="countdown-<preset>.png"`. Record an ADR if you add `html-to-image`.

## 8. Android native module — `modules/lockscreen-wallpaper`

Only signatures here. **No implementation code in this doc.**

### 8.1 Files (created in T6.1)

```
modules/lockscreen-wallpaper/
  expo-module.config.json        { "platforms": ["android"], "android": { "modules": ["expo.modules.lockscreenwallpaper.LockscreenWallpaperModule"] } }
  index.ts                       re-exports the typed wrapper
  src/LockscreenWallpaper.types.ts
  src/LockscreenWallpaperModule.ts   requireOptionalNativeModule<…>('LockscreenWallpaper')  → null in Expo Go/iOS/web
  android/build.gradle           (from `npx create-expo-module@latest --local` template or hand-written equivalent)
  android/src/main/AndroidManifest.xml   <uses-permission android:name="android.permission.SET_WALLPAPER"/>
  android/src/main/java/expo/modules/lockscreenwallpaper/LockscreenWallpaperModule.kt
```

### 8.2 Native surface (Kotlin, Expo Modules API) — signatures

```
class LockscreenWallpaperModule : Module()
  definition():
    Name("LockscreenWallpaper")
    Function("getCapabilities") -> Map { isWallpaperSupported: Boolean, isSetWallpaperAllowed: Boolean, sdkInt: Int }
    AsyncFunction("setLockScreenWallpaperAsync") (fileUri: String, options: SetOptions) -> Int   // wallpaper id
      // decodes the PNG at fileUri (file:// path) → Bitmap
      // WallpaperManager.getInstance(ctx).setBitmap(bitmap, null, options.allowBackup ?: true, WallpaperManager.FLAG_LOCK
      //     [or FLAG_LOCK or FLAG_SYSTEM when options.alsoSetHome == true])
      // recycles the bitmap; runs off the main thread (AsyncFunction)

class SetOptions : Record { @Field alsoSetHome: Boolean = false; @Field allowBackup: Boolean = true }

Rejections (CodedException codes):
  ERR_FILE_NOT_FOUND | ERR_DECODE_FAILED | ERR_NOT_SUPPORTED | ERR_NOT_ALLOWED | ERR_SET_FAILED
```

- `minSdk` follows the Expo template (≥ 24, which is required for `FLAG_LOCK` and the 4-arg `setBitmap`).
- `SET_WALLPAPER` is a normal permission (granted at install).
- OEM caveat: some skins (certain Samsung/Xiaomi builds) may override the lock wallpaper with their own carousel or theme engine. HANDOFF documents this as a known limitation.

### 8.3 JS wrapper — `src/services/lockscreen.ts`

```ts
export interface LockscreenCapabilities {
  available: boolean;                 // native module present (false on iOS, web, Expo Go)
  isWallpaperSupported: boolean;
  isSetWallpaperAllowed: boolean;
  reason: 'ok' | 'not-android' | 'expo-go' | 'module-missing' | 'not-supported' | 'not-allowed';
}
export function getLockscreenCapabilities(): LockscreenCapabilities;
export async function setLockScreenWallpaper(fileUri: string, opts?: { alsoSetHome?: boolean }): Promise<
  { ok: true; wallpaperId: number } | { ok: false; code: string; message: string }>;
```
Expo Go detection: `Constants.executionEnvironment === ExecutionEnvironment.StoreClient` → `reason: 'expo-go'` (only for messaging; availability is always decided by `requireOptionalNativeModule` returning `null`).

## 9. Local notification strategy

### 9.1 Setup (`configureNotifications`, called in the root layout)
- `Notifications.setNotificationHandler` (show banner + sound while in the foreground).
- Android: `setNotificationChannelAsync('reminders', { name: 'Reminders', importance: DEFAULT })`.
- Permission requested only at onboarding Finish or a Settings toggle (`requestPermissionsAsync`). Android 13+ shows the `POST_NOTIFICATIONS` prompt.

### 9.2 Planning (pure, `utils/notificationPlan.ts`)
`planNotifications(state, now): PlannedNotification[]`:
- No countdown, or status ∈ {`overdue`, `completed`} → `[]`.
- **Daily** (`dailyEnabled`): one repeating `DAILY` trigger `{hour, minute}` from `dailyTime`. id `daily-refresh`. Title `"{emoji} {daysLeft} days to {title}"` is stale tomorrow, so use a **day-agnostic** text: title `"Refresh your lock screen"`, body `"Keep your countdown to “{title}” accurate — tap to update."`, `data: { url: '/studio' }`.
- **Deadline-day** (always when daily is enabled): one `DATE` trigger on the deadline date at `dailyTime`: "It's deadline day — {title}". id `deadline-day`.
- **Milestone** (`milestoneEnabled`): for each pending milestone, `fireAt = (date − N days) @ dailyTime` local. Keep only if `fireAt > now`. Body: N=0 → "Today: {title}"; else "In {N} day(s): {title} (T-{t})". id `ms-{milestoneId}`. `data: { url: '/home' }`.
- Cap the total at 60 (iOS allows 64 pending). Keep the earliest.

### 9.3 Syncing (`services/notifications.ts`)
`syncNotifications(state)` is idempotent: if permission isn't granted, return. Otherwise `cancelAllScheduledNotificationsAsync()` then schedule each planned item. It runs on: onboarding finish, plan commit, milestone toggle, reminders change, import, reset (cancel only), mark complete (cancel), and on app foreground at most once per calendar day (it catches the overdue transition).

**Tap handling:** the root layout uses `Notifications.useLastNotificationResponse()` (it covers cold start) and routes to `response.notification.request.content.data.url` if it's one of `/studio` or `/home`. The app scheme is `countdownlock` (`countdownlock://studio` also works as a deep link).

### 9.4 Android background refresh (STRETCH, mostly documentation)
- `expo-background-task` (WorkManager on Android) runs **headless JS** with **no view hierarchy**. `react-native-view-shot` **cannot** render `<Wallpaper>` there. Real auto-refresh would need either (a) a native Kotlin `Canvas` renderer duplicating the layout, or (b) a Skia-based offscreen renderer (see ADR-003 future note).
- Platform limits: the minimum periodic interval is 15 min. Doze and App Standby Buckets defer work (the "rare" bucket may run about once a day or less). OEM battery managers can kill tasks. Android 14+ denies `SCHEDULE_EXACT_ALARM` by default for new installs, so don't rely on exact alarms. Android 15 tightens background starts and some foreground-service types, so no foreground service is used.
- MVP stretch deliverable: a `src/services/backgroundRefresh.ts` hook behind `FEATURE_BG_REFRESH = false` that, when enabled, registers a daily task. The task only checks the status and posts a "refresh" notification if the last render was on an earlier calendar day. No rendering.

## 10. Platform capability matrix

| Capability | Android EAS APK / dev build | Android Expo Go | iOS (Expo Go or build) | Web (stretch) |
|---|---|---|---|---|
| Onboarding, Home, Settings, persistence | ✅ | ✅ | ✅ | ✅ (localStorage-backed AsyncStorage) |
| Live `<Wallpaper>` preview | ✅ | ✅ | ✅ | ✅ |
| PNG capture (view-shot) | ✅ | ✅ | ✅ | ⚠️ view-shot web / html-to-image |
| Save to Gallery/Photos | ✅ | ⚠️ write-only; may need dev build depending on SDK → fall back to Share | ✅ (add-only permission) | ⬇️ file download |
| Share sheet | ✅ | ✅ | ✅ | ⚠️ Web Share API if available, else download |
| **Set lock screen directly** | ✅ `FLAG_LOCK` via local module | ❌ (module absent → disabled + explanation) | ❌ (OS limitation → guide, ADR-002) | ❌ |
| Local notifications (daily + milestone) | ✅ | ✅ (local notifications still supported) | ✅ | ❌ (hidden) |
| Notification tap → Studio | ✅ | ✅ | ✅ | — |
| JSON export / import | ✅ | ✅ | ✅ | ✅ (download / file input) |
| Desktop presets 2560×1600, 3024×1964 | — | — | — | ✅ (stretch) |
| Background refresh | ⚠️ stretch, notify-only | ❌ | ❌ | ❌ |

## 11. Testing strategy

- **Unit (Jest, `jest-expo` preset):** every `src/utils` module, the theme tokens (all required keys, contrast pairs), the store actions (with in-memory AsyncStorage mock `@react-native-async-storage/async-storage/jest/async-storage-mock`), the notification plan, and the lockscreen wrapper (mocked `requireOptionalNativeModule`).
- **Render smoke:** `Wallpaper.test.tsx` renders 4 themes × statuses {upcoming, today, overdue, completed} × {0, 3, 12 milestones} with `@testing-library/react-native` (or `react-test-renderer`) and asserts the key text (hero, T-labels) is present. No snapshots of SVG internals (brittle).
- **Timezones:** `npm run test:tz` = `TZ=America/Los_Angeles jest && TZ=Asia/Kolkata jest`. Fixtures include the 2027-03-14 US DST start and the 2027-11-07 DST end.
- **Bundles:** `npx expo export --platform android` (and `web` for stretch) at phase boundaries.
- **Device (manual):** checklist in `HANDOFF.md`.

## 12. Configuration (created during build)

- `app.json`: `name: "Countdown Lock Screen"`, `slug: "countdown-lockscreen"`, `scheme: "countdownlock"`, `orientation: "portrait"`, `userInterfaceStyle: "automatic"`, `android.package: "com.countdownlockscreen.app"` (placeholder, changeable before first store release), `ios.bundleIdentifier: "com.countdownlockscreen.app"`. Plugins: `expo-router`, `expo-font`, `expo-notifications` (Android icon/color), `expo-media-library` (`photosPermission`, `savePhotosPermission`, `isAccessMediaLocationEnabled: false`), and `expo-splash-screen`.
- `eas.json`: `cli.appVersionSource: "remote"`; profiles `development` (developmentClient, internal), `preview` (internal, `android.buildType: "apk"`), `production` (`android.buildType: "app-bundle"`).
- `.gitignore` additions: `android/`, `ios/` (Continuous Native Generation), `.scaffold/`, `coverage/`.
