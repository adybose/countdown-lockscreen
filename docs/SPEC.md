# SPEC — Countdown Lock Screen

Status: **Draft for human review** · Owner: product/architecture · Related: `DESIGN.md`, `ARCHITECTURE.md`, `TASKS.md`

## 1. Problem statement

People with one big deadline (an exam, an internship application window, a trip, a savings goal) often make a single static "countdown" wallpaper. It goes stale the next day, has no plan behind it, and doesn't show what to do *next*. This app turns one deadline into a backward plan of milestones. It then renders that plan as a polished, high-resolution lock-screen wallpaper that the user can refresh in one tap each day. Everything runs offline and privately on the phone.

Built for the mission **"Your Deadline, Your Design: Create a Countdown Lock Screen."**

## 2. Target users

| Persona | Need |
|---|---|
| **Student** (exams, applications) | See "T-20 days: mock interview" every time they unlock their phone. |
| **Traveler** (trip prep) | A checklist of prep milestones before departure. |
| **Saver / self-improver** (money or habit goal) | Visible progress toward a dated target. |

Shared traits: mobile-first, wants something that looks good enough to keep as a wallpaper, doesn't want an account, and has little patience for setup (under 3 minutes).

## 3. User stories

- **US-01** As a user, I answer one question per screen so I can set up my countdown in under 3 minutes.
- **US-02** As a user, I tap "Auto-plan backward" to get sensible milestones without thinking, then tweak them.
- **US-03** As a user, I pick a visual theme and see a live preview before committing.
- **US-04** As a user, I see a live countdown, my next milestone, and my progress on the Home screen.
- **US-05** As a user, I tick milestones off as I finish them.
- **US-06** As a user, I generate a wallpaper that fits my phone's exact resolution and keeps the clock and shortcut areas clear.
- **US-07** As an Android user, I set the wallpaper as my lock screen with one tap.
- **US-08** As an iPhone user, I save the wallpaper to Photos and follow a short visual guide to set it.
- **US-09** As a user, I get a daily nudge to refresh my wallpaper so the number stays accurate.
- **US-10** As a user, I get reminded N days before each milestone.
- **US-11** As a user, I export my plan as a JSON file and import it on another device.
- **US-12** As a user, I reset or replace my countdown when the deadline passes or my plans change.
- **US-13** *(Stretch)* As a laptop user, I export a desktop-resolution wallpaper from the web build.

## 4. Functional requirements

Priority: **M** = MUST-HAVE, **S** = SHOULD-HAVE, **X** = STRETCH.

### 4.1 Onboarding (first launch, one question per screen)

| ID | Pri | Requirement |
|---|---|---|
| FR-01 | M | First launch (no active countdown) opens a linear 6-step wizard: Goal → Deadline → Motivation → Milestones → Theme → Reminders. Each step shows a progress indicator ("Step n of 6"), **Back**, and **Next** (the final step says **Finish**). Wizard draft state persists across app restarts. |
| FR-02 | M | **Goal:** title is required (1–60 chars, trimmed). Optional single emoji or a preset icon. |
| FR-03 | M | **Deadline:** a date is required and must be ≥ today (local). An optional time is allowed. Interpreted in the device's local timezone. With no time, the deadline is the end of that local day (23:59:59). |
| FR-04 | M | **Motivation:** optional one-liner (0–90 chars), shown on the wallpaper when enabled. |
| FR-05 | M | **Milestones:** add, edit (title and date), reorder (move up/down), and delete. 0–12 milestones. Title 1–48 chars. Each milestone gets an auto-suggested icon (offline keyword mapping) that the user can change. |
| FR-06 | M | **Auto-plan backward** (offline, no AI) generates 3–6 milestones evenly spaced backward from the deadline, each with a T-minus label (e.g., `T-30 (Dec 2)`) and an editable default title. If milestones already exist, the user must confirm replacing them. |
| FR-07 | M | **Milestone validation:** every milestone date must satisfy `today ≤ date ≤ deadlineDate` (inclusive, local calendar dates). Invalid rows show an inline error and block **Next**. If the order isn't chronological, show a non-blocking warning with a **Sort by date** action. |
| FR-08 | M | **Theme picker:** choose one of 4 themes (Glass Terminal, Pixel Quest, Sticker Planner, Field Journal), each with a live mini preview that renders the actual `<Wallpaper>` using the draft data. |
| FR-09 | M | **Reminders:** daily reminder on/off + local time (default 08:00, on). Milestone reminders on/off + `N` days before (choices 0, 1, 2, 3, 7; default 1). Notification permission is requested here, not at launch. |

### 4.2 Home

| ID | Pri | Requirement |
|---|---|---|
| FR-10 | M | Large live countdown showing **days, hours, minutes** to the deadline instant. Updates at least once per minute while the screen is visible. |
| FR-11 | M | Highlights the **next upcoming pending milestone** (earliest date ≥ today that isn't done) with its T-minus label. |
| FR-12 | M | **Dual progress bar:** (a) milestones completed / total; (b) time elapsed from plan start to deadline. Each is labeled with a percentage. |
| FR-13 | M | Interactive **milestone checklist:** tap to tick or untick. Changes persist immediately. |
| FR-14 | M | Primary actions **Generate lock screen** (→ Studio) and **Edit plan** (→ wizard pre-filled, edit mode). A Settings entry point is present. |

### 4.3 Lock Screen Studio

| ID | Pri | Requirement |
|---|---|---|
| FR-15 | M | Full-screen preview at the target canvas's aspect ratio. The default target is the device's native screen resolution (`screen dp × pixelRatio`). Size presets are available (DESIGN §8.3). |
| FR-16 | M | Theme switcher plus visibility toggles: **Show motivation**, **Show completed milestones**, **Show progress**, **Show safe zones**. Choices persist. |
| FR-17 | M | Safe-zone overlay (top 30% / bottom 12% tinted and labeled) is never present in exported PNGs. |
| FR-18 | M | Exports a PNG at the exact target pixel size. Custom fonts are loaded before capture. |
| FR-19 | M | **Save to Gallery** saves the PNG to Photos/Gallery (write-only permission). Shows success or error feedback. |
| FR-20 | M | **Share** opens the OS share sheet with the PNG. |
| FR-21 | M | **Set as Lock Screen** (Android with the native module present): sets only the lock-screen wallpaper (`FLAG_LOCK`). On iOS the button is hidden and replaced by the "How to set as Lock Screen" guide. On Android without the module (Expo Go), the button is visible but disabled with an explanation, and the app offers Save/Share instead. |
| FR-22 | M | **iOS guide:** a concise, visual, step-by-step "How to set as Lock Screen" guide, plus a collapsible "Automate with Shortcuts (optional)" section. |

### 4.4 Reminders & staleness

| ID | Pri | Requirement |
|---|---|---|
| FR-23 | M | Daily local notification at the chosen time ("Tap to refresh your lock screen"). Tapping it opens the Studio, including from a cold start. |
| FR-24 | S | Milestone reminders: a one-shot local notification `N` days before each future pending milestone, at the daily reminder time. Rescheduled whenever the plan or settings change. |
| FR-25 | X | Android background refresh: an optional periodic task that reminds or re-renders. Documented with Android 14/15 limits; implementation is optional. |

### 4.5 Settings & data

| ID | Pri | Requirement |
|---|---|---|
| FR-26 | M | Settings shows and edits the reminder schedule (same controls as FR-09). |
| FR-27 | M | **Reset / replace deadline:** delete the active countdown (with a confirmation dialog), cancel its notifications, and return to onboarding. |
| FR-28 | S | **Export plan as JSON** (versioned schema, ARCHITECTURE §5) via the share sheet or a file save. |
| FR-29 | S | **Import plan from JSON:** validate the schema and version, migrate older versions, show a readable error on invalid input, and confirm before replacing the current plan. |
| FR-30 | M | All state persists locally and survives app restarts. Corrupted storage falls back to a recoverable error state (DESIGN §10). |

### 4.6 Edge states

| ID | Pri | Requirement |
|---|---|---|
| FR-31 | M | **Overdue:** after the deadline instant passes, Home and the wallpaper switch to the overdue state (DESIGN §10.4). The app suggests "Mark complete / Set a new deadline". Daily reminders stop. |
| FR-32 | M | **Deadline day:** when `daysLeft = 0` and the deadline hasn't passed, show "Today's the day" (DESIGN §10.3). |

### 4.7 Web / Laptop (Stretch)

| ID | Pri | Requirement |
|---|---|---|
| FR-33 | X | On Expo Web, the Studio offers desktop presets `2560×1600` and `3024×1964` (landscape layout) and downloads the PNG. |

## 5. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Offline-first | The app works fully in airplane mode. No network requests in app code. |
| NFR-02 | Privacy | No analytics, no tracking SDKs, no login, no remote config. Data leaves the device only through user-initiated Share/Export. |
| NFR-03 | Render speed | PNG capture at 1080×2400 completes in ≤ 2 s on a mid-range Android device. The Studio preview re-renders in ≤ 100 ms after a toggle. |
| NFR-04 | Accessibility | All interactive elements have accessibility roles and labels and are ≥ 44×44 pt. Wallpaper text/background token pairs meet WCAG AA contrast (≥ 4.5:1 for body, ≥ 3:1 for ≥ 24 px display text). App UI supports system font scaling up to 1.5× without clipping primary actions. |
| NFR-05 | Timezone correctness | Calendar dates are stored as local `YYYY-MM-DD`. Day counts are correct across DST transitions and in UTC−/UTC+ zones. |
| NFR-06 | Determinism | `<Wallpaper>` output depends only on its props. Same props → identical render (no clock, no unseeded randomness). |
| NFR-07 | Code quality | TypeScript strict, zero `tsc` errors, lint clean. |
| NFR-08 | Test coverage | `src/utils/**` line coverage ≥ 80%. |
| NFR-09 | Startup | Fonts and persisted state load behind the splash screen. No flash of fallback fonts. |
| NFR-10 | Graceful degradation | Missing native capability (Expo Go, iOS, web) never crashes. Features are feature-detected and fall back. |
| NFR-11 | Licensing | Only OFL/Apache/MIT fonts and icons. All decorative art is original. |

## 6. Acceptance criteria

Verification types: **U** = Jest unit test, **C** = command, **M** = manual on device (listed in `HANDOFF.md`).

| AC | Req | Criterion | Type |
|---|---|---|---|
| AC-01 | FR-01 | With empty storage, the app routes to `/onboarding/goal`. The 6 route files exist. Draft fields survive a store rehydrate. | U + C (`ls app/onboarding`) + M |
| AC-02 | FR-02 | `validateGoal('')` fails, `validateGoal(' '.repeat(3))` fails, a 61-char title fails, `'Pass Bio Exam'` passes. | U |
| AC-03 | FR-03 | Yesterday's date is rejected and today's is accepted. With no time, `deadlineInstant()` returns local 23:59:59 of the date. | U |
| AC-04 | FR-04 | A 91-char motivation is rejected. An empty motivation is accepted. | U |
| AC-05 | FR-05 | Store actions add/update/move/remove milestones correctly. The 13th add is rejected. `suggestIcon('Polish resume')` returns `file-text`. | U |
| AC-06 | FR-06 | For a deadline D days away: D ≥ 42 → 6 milestones, 28–41 → 5, 14–27 → 4, otherwise 3. All dates are within `[today, deadline]`. They're sorted ascending. Labels match `T-<n>`. | U |
| AC-07 | FR-07 | `validateMilestones` flags a date before today and a date after the deadline. It accepts boundary dates equal to today and to the deadline. | U |
| AC-08 | FR-08 | The theme step renders 4 previews, each a `<Wallpaper>` with a distinct `themeId`. | U (render test) + M |
| AC-09 | FR-09 | Defaults are daily on at 08:00, milestone reminders on, N = 1. | U |
| AC-10 | FR-10 | `getCountdownParts(now, deadline)` returns correct `{days, hours, minutes}` across a DST boundary. | U |
| AC-11 | FR-11 | `getNextMilestone` skips done and past milestones and returns `null` when none remain. | U |
| AC-12 | FR-12 | `getProgress` returns `milestoneRatio` and `timeRatio`, both clamped to [0, 1]. No milestones → `milestoneRatio = null` (bar hidden). | U |
| AC-13 | FR-13 | `toggleMilestone(id)` flips `done` and sets/clears `completedAt`. | U |
| AC-14 | FR-14 | Home shows both actions. Edit mode pre-fills the wizard from the active countdown. | M |
| AC-15 | FR-15 | `resolveCanvasSize('device')` = `round(screen.width × pixelRatio)` × `round(screen.height × pixelRatio)`. | U |
| AC-16 | FR-16 | Toggling options updates `preferences.wallpaperOptions` and persists. | U |
| AC-17 | FR-17 | The overlay is rendered outside the captured view ref. A manual PNG check shows no overlay. | M + code review |
| AC-18 | FR-18 | The exported PNG's dimensions equal the target exactly. | M (HANDOFF checklist) |
| AC-19 | FR-19 | Permission denied → an error toast with an "Open Settings" action. Success → a "Saved to Photos" toast. | M |
| AC-20 | FR-20 | The share sheet opens with a `image/png` file. | M |
| AC-21 | FR-21 | `LockscreenWallpaper.isAvailable()` returns `false` when the native module is absent (unit test with a mocked `requireOptionalNativeModule`). Tapping on an EAS APK changes the lock screen only. | U + M |
| AC-22 | FR-22 | On iOS the Studio shows a "How to set" button. The guide renders steps plus a collapsible Shortcuts section. | M |
| AC-23 | FR-23 | `planNotifications()` emits one daily trigger with `data.url = '/studio'`. A tap routes to Studio. | U + M |
| AC-24 | FR-24 | `planNotifications()` emits one dated trigger per future pending milestone at `(date − N days) @ dailyTime`, skips triggers in the past, and caps the total at 60. | U |
| AC-25 | FR-25 | `docs/ARCHITECTURE.md` §9.4 notes exist. Any hook is behind a feature flag. | C |
| AC-26 | FR-26 | Settings changes call `syncNotifications()`. | U (mocked service) |
| AC-27 | FR-27 | After reset, the store has `countdown = null` and no scheduled notifications, and the app routes to onboarding. | U + M |
| AC-28 | FR-28 | `exportPlan(state)` output has `schema = "countdown-lockscreen/plan"` and `version = 1` and round-trips through `importPlan`. | U |
| AC-29 | FR-29 | `importPlan` rejects wrong schema, future version, missing deadline, and invalid dates, each with a specific message. It migrates v0 fixtures. | U |
| AC-30 | FR-30 | A corrupted persisted JSON value → the store resets to defaults, and an error banner is shown once. | U |
| AC-31 | FR-31 | `getCountdownStatus` returns `'overdue'` after the deadline instant. Wallpaper model hero text = `"Overdue"` with `"<n> days past"`. | U |
| AC-32 | FR-32 | On the deadline date before the deadline time, status = `'today'`. | U |
| AC-33 | FR-33 | `npx expo export --platform web` succeeds. Presets appear only on web. | C + M |
| AC-N01 | NFR-01 | `grep -rnE "fetch\(|axios|XMLHttpRequest|https?://" src app --include=*.ts --include=*.tsx` → no matches outside comments/docs-links in the iOS guide. | C |
| AC-N03 | NFR-03 | Capture timing is logged in dev builds. Manual check ≤ 2 s. | M |
| AC-N04 | NFR-04 | `__tests__/themes/contrast.test.ts` asserts the AA ratios for every theme's declared text/background pairs. | U |
| AC-N05 | NFR-05 | `npm run test:tz` passes under `America/Los_Angeles` and `Asia/Kolkata`. | C |
| AC-N06 | NFR-06 | `grep -rnE "Date\.now|new Date\(\)|Math\.random" src/components/wallpaper src/utils` → no matches. | C |
| AC-N07 | NFR-07 | `npx tsc --noEmit` and `npm run lint` exit 0. | C |
| AC-N08 | NFR-08 | `CI=1 npm test -- --coverage --collectCoverageFrom='src/utils/**'` ≥ 80% lines. | C |

## 7. Out of scope (MVP)

- Multiple simultaneous countdowns (roadmap).
- Accounts, cloud sync, backend, sharing to social feeds via APIs.
- AI-generated plans, images, or text. Any paid API.
- Programmatically setting the iOS lock screen (not possible; see ADR-002).
- Setting the **home** screen wallpaper (lock only; the native API accepts a flag for a possible later option).
- Live/animated wallpapers, widgets (iOS Lock Screen widgets, Android app widgets).
- Custom user-uploaded background photos.
- Localization beyond English (all strings live in one module to make it easier later).
- Push (remote) notifications.

## 8. Future roadmap

1. Multiple countdowns with a "primary" picked for the wallpaper.
2. Home-screen + lock-screen pair export.
3. iOS/Android widgets showing the live countdown (removes staleness entirely).
4. User photo backgrounds with automatic contrast scrim.
5. Theme editor (custom tokens) + community theme JSON import.
6. Android background auto-refresh via native headless rendering (see ARCHITECTURE §9.4).
