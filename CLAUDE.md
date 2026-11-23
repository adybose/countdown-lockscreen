# CLAUDE.md — Countdown Lock Screen

## Purpose

A local-first mobile app that plans backward from **one** high-priority deadline, tracks intermediate milestones, and generates high-resolution countdown **lock-screen wallpapers** (PNG) in four original themes. The app also sends optional local reminders.

- No backend, no login, no analytics, no paid or AI APIs. All data stays on the device.
- MVP supports **one active countdown**. Multiple countdowns are on the roadmap (see `docs/SPEC.md` §8).
- Android sets the lock screen directly through a small Kotlin Expo local module. iOS saves to Photos and shows a guide. Web (stretch) exports desktop PNGs.

Source-of-truth documents (read before coding):

| Doc | What it governs |
|---|---|
| `docs/SPEC.md` | Requirements (FR/NFR) + acceptance criteria |
| `docs/DESIGN.md` | Theme tokens, wallpaper anatomy, safe zones, wireframes, edge states |
| `docs/ARCHITECTURE.md` | Folder map, types, store, render pipeline, native module API, notifications |
| `docs/DECISIONS.md` | ADRs. Add one before deviating from SPEC/ARCHITECTURE |
| `docs/TASKS.md` | The ordered build plan. Work it top to bottom |
| `docs/BLOCKERS.md` | Things only a human can unblock |
| `docs/SETUP.md` | Human run/install instructions |

## Tech stack

- **Expo** (latest stable SDK, resolved at build time; never pin from memory), **React Native**, **TypeScript (strict)**, **Expo Router** (file-based routes in `app/`).
- State: **zustand** + `persist` middleware → **@react-native-async-storage/async-storage**.
- Dates: **date-fns** (local-time functions only; see timezone rules below).
- Rendering: **react-native-svg** (backgrounds, paths, mascot, decorations), **lucide-react-native** icons, **expo-font** with locally bundled `.ttf` files.
- Capture/output: **react-native-view-shot** → PNG; **expo-media-library** (save), **expo-sharing** (share), **expo-file-system** (temp files, JSON export), **expo-document-picker** (JSON import).
- Notifications: **expo-notifications** (local only).
- Native: `modules/lockscreen-wallpaper` (Expo local module, Kotlin, Android only). This is the **only** native code.
- Tests: **jest** + **jest-expo**.
- Builds: **EAS Build** (`eas.json`, Android `preview` profile → APK), local fallback `npx expo run:android`.

## Folder structure

```
app/                      Expo Router routes (screens only, thin)
  onboarding/             6-step wizard: goal, deadline, motivation, milestones, theme, reminders
src/
  components/ui/          Reusable app-chrome components (Button, Field, Checkbox, ProgressBar…)
  components/wallpaper/   <Wallpaper> + shared parts (zones, milestone row, hero)
  components/wallpaper/themes/  One renderer per theme (background + path style)
  themes/                 ThemeTokens for the 4 themes + registry
  store/                  zustand store, persistence, migrations, selectors
  utils/                  Pure logic: dates, T-minus, planner, validation, import/export, contrast
  services/               Side effects: capture, media, share, notifications, lockscreen
  hooks/                  useNow, useFontsReady, useCapture…
  types/                  Domain types (Countdown, Milestone, …)
modules/lockscreen-wallpaper/   Expo local module (Kotlin, Android only)
assets/fonts/             Bundled OFL .ttf files + LICENSES
assets/images/            App icon/splash
__tests__/                Jest tests (mirrors src/utils, src/store, src/services)
docs/                     Spec, design, architecture, decisions, tasks, blockers, setup, handoff
```

Full map with every file: `docs/ARCHITECTURE.md` §2.

## Standard commands

| Purpose | Command |
|---|---|
| Install (fresh clone) | `npm ci` (or `./bootstrap.sh` once T1.6 exists) |
| Add an Expo/RN dependency | `npx expo install <pkg>` (never plain `npm install <pkg>` for RN libs) |
| Add a dev-only dependency | `npx expo install <pkg> -- --save-dev` |
| Check SDK compatibility | `npx expo install --check` |
| Typecheck | `npx tsc --noEmit` |
| Unit tests | `CI=1 npm test` |
| Timezone tests | `npm run test:tz` (runs the suite under `America/Los_Angeles` and `Asia/Kolkata`) |
| Lint | `npm run lint` |
| Bundle check (Android) | `npx expo export --platform android` |
| Bundle check (Web) | `npx expo export --platform web` |
| Prebuild check (Android) | `npx expo prebuild --platform android --no-install` (output is git-ignored) |
| EAS Android preview APK | `npx eas-cli build --platform android --profile preview --non-interactive --no-wait` |
| EAS auth check | `npx eas-cli whoami` |

`eas` is never installed globally. Always use `npx eas-cli`.

## Coding conventions

**TypeScript**
- `strict: true`. No `any` (use `unknown` + type guards). No non-null `!` unless you add a comment explaining why.
- Domain types live in `src/types/`. Import with the `@/` alias (`@/src/utils/dates`).
- Pure logic goes in `src/utils/` with **no React, no Expo imports**, so it stays unit-testable. Side effects go in `src/services/`.
- Never call `new Date()` / `Date.now()` inside utils or the `<Wallpaper>` tree. Pass `now` in as a parameter (determinism + testability). Only `useNow()` and services read the clock.
- Named exports. Prefer one default export per route file only (Expo Router requirement).

**Dates & timezones (critical)**
- Calendar dates (deadline date, milestone dates) are stored as **local date strings `YYYY-MM-DD`**. Never as UTC ISO instants.
- Optional deadline time is stored as `HH:mm` local wall time.
- Parse with `parseLocalDate()` from `src/utils/dates.ts`, never `new Date('YYYY-MM-DD')`, which parses as UTC midnight and shifts the day west of UTC.
- Day counts use `differenceInCalendarDays` on local dates, so DST never yields 14.96 days.

**React Native**
- Function components + hooks. Keep screens in `app/` thin; move logic into hooks/utils.
- Styles via `StyleSheet.create`. Wallpaper sizes are expressed in **canvas units `u`** (see `docs/DESIGN.md` §3), never raw px.
- `<Wallpaper>` is **pure and deterministic**: same props → same pixels. No store access, no clock, no `Math.random()` (use the seeded PRNG in `src/utils/prng.ts`).
- Every touchable has `accessibilityRole` + `accessibilityLabel`; minimum 44×44 pt hit area.
- Platform branches via `Platform.OS` or `.web.tsx` / `.android.ts` file suffixes. Never crash on a missing native module. Feature-detect.

**Tests**
- Tests live in `__tests__/` mirroring the source path (`__tests__/utils/planner.test.ts`).
- Every util in `src/utils/` has tests. Use fixed dates (2027 dates are fine), never "today".

**Git**
- Conventional Commits with task ID scope: `feat(T2.2): add backward planner`, `test(T2.1): …`, `fix(T4.4): …`, `docs: …`, `chore(T1.2): …`.
- **Never add a `Co-Authored-By: Claude …` trailer or any other Claude/AI attribution to commit messages.**
- One task = at least one commit. Never commit `android/`, `ios/`, `.scaffold/`, `dist/`, `.env*`, keystores.

## Unattended Operation Rules

These rules are mandatory during the autonomous build (`BUILD.md`).

1. **One task at a time.** Work strictly in order from `docs/TASKS.md`: pick the first unchecked `[ ]` task whose dependencies are `[x]` (or `[!]` when the dependency is non-blocking, as noted in the task). After each task:
   1. Run `npx tsc --noEmit` and `CI=1 npm test`. Both must pass. Run the task's own acceptance commands.
   2. Mark the task `[x]` in `docs/TASKS.md`.
   3. Commit with a Conventional Commit message (`feat:`, `fix:`, `docs:`, `chore:`, `test:`), scoped with the task ID.
   4. `git push origin main`.
2. **Never wait for user input.** Always pass non-interactive flags (`CI=1`, `--yes`, `--non-interactive`, `--no-wait`). Install dependencies with `npx expo install`. **Never** start dev servers, Metro, `expo start`, Expo Go, emulators, or watch-mode test runners in the foreground. Verify with `npx tsc --noEmit`, `CI=1 npm test`, and `npx expo export` instead.
3. **Safety.** Never use `sudo`. Never install global tools (`npm i -g`, `brew`). Never modify git remotes, never force-push, never rewrite pushed history. Never read, print, or commit secrets, `.env*`, keystores (`*.jks`, `*.keystore`), `credentials.json`, or `google-services.json`.
4. **Blockers.** If any step is blocked (permission denied, login required, EAS keystore prompt, missing Android SDK, physical device required), log it in `docs/BLOCKERS.md` with the **exact command the human needs to run**. Mark the task `[!] Blocked (see BLOCKERS.md)`, commit, then immediately continue with the next independent task. **Never retry the same blocked action in a loop.** At most one retry, and only with a changed approach.
5. **Context compaction.** When compacting or clearing context, always preserve: the **current task ID**, the **list of files modified in that task**, and the **current state of `docs/TASKS.md`** (which tasks are `[x]`, `[!]`, `[ ]`). After a reset, re-read `CLAUDE.md` and `docs/TASKS.md` before continuing.
6. **No silent deviation.** Never deviate from `docs/SPEC.md` or `docs/ARCHITECTURE.md` without first recording an ADR in `docs/DECISIONS.md` (next free `ADR-00N`, status `Accepted`, with context/decision/consequences). Library swaps, schema changes, and dropped requirements all need an ADR.
7. **Scope discipline.** Finish all `MUST-HAVE` and `SHOULD-HAVE` tasks before any `STRETCH` task. Do not add features not in `docs/SPEC.md`.
8. **Version discovery.** Never pin an Expo SDK or library version from memory. Let `npx create-expo-app@latest` and `npx expo install` resolve versions. If an API in these docs no longer matches the installed library, follow the installed library's types/docs and record an ADR if behavior changes.
