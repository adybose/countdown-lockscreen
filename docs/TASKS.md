# TASKS — Build Plan

Rules: see `CLAUDE.md` → **Unattended Operation Rules**. Work top to bottom. Pick the first `[ ]` task whose dependencies are done.

**Markers:** `[ ]` todo · `[x]` done · `[!] Blocked (see BLOCKERS.md)` · `[-]` skipped (STRETCH not attempted, with reason)
**Priority:** `MUST-HAVE` · `SHOULD-HAVE` · `STRETCH`
**Every task's definition of done** (in addition to its own acceptance commands):
```bash
npx tsc --noEmit && CI=1 npm test
```
Then mark `[x]`, commit `<type>(<TaskID>): <summary>`, and `git push origin main`.
**Phase gate** (last task of each of Phases 1–6 and 8): `npx expo export --platform android` must succeed.

## Time budget

| Phase | Scope | Estimate |
|---|---|---|
| 0 | Docs review (human gate) | 0 min (human) |
| 1 | Scaffold, TS config, fonts, theme tokens, data layer | 43 min |
| 2 | Planning engine, date utils, tests, onboarding wizard | 42 min |
| 3 | Home + Settings (JSON export/import, reset) | 26 min |
| 4 | `<Wallpaper>`, 4 themes, safe zones, Studio, capture/save/share, iOS guide | 50 min |
| 5 | Local notifications | 14 min |
| 6 | Android native module + EAS preview build | 21 min |
| 7 | **STRETCH:** web desktop export + background refresh notes/hook | 12 min |
| 8 | Polish, accessibility, README, HANDOFF | 18 min |
| | **Subtotal** | **226 min** |
| | Contingency buffer | 14 min |
| | **Total** | **240 min (4 h)** |

---

## Phase 0 — Docs review (human gate)

- [x] **T0.1 — Human approves the docs** · `MUST-HAVE` · 0 min (human) · deps: —
  - Read `SPEC.md`, `DESIGN.md`, `ARCHITECTURE.md`, `DECISIONS.md`, and this file. Edit anything you disagree with.
  - **Approval signal:** starting the `BUILD.md` session counts as approval. The agent marks T0.1 `[x]` as its first action if it's still unchecked.
  - Acceptance: `test -f docs/SPEC.md && test -f docs/DESIGN.md && test -f docs/ARCHITECTURE.md && test -f docs/TASKS.md`

- [x] **T0.2 — Human prerequisites (optional but recommended)** · `SHOULD-HAVE` · 0 min (human) · deps: —
  - Confirm `.claude/settings.json` exists with the project permission rules.
  - Confirm `git push origin main` works non-interactively (SSH agent loaded).
  - Optional, for T6.3: `npx eas-cli login` then `npx eas-cli whoami`.
  - The agent **does not block** on T0.2. If it's unchecked, the agent proceeds and logs any resulting blockers.

---

## Phase 1 — Scaffold, TypeScript, fonts, tokens, data layer (43 min)

- [x] **T1.1 — Scaffold Expo + Expo Router app without clobbering docs** · `MUST-HAVE` · 10 min · deps: T0.1
  - `npx create-expo-app@latest .scaffold --template default --yes --no-install` (resolves the latest stable SDK. Don't pin.)
  - Copy into the repo root **only**: `package.json`, `tsconfig.json`, `app.json`, `expo-env.d.ts` (if present), `eslint.config.js` (if present), `assets/images/*`. **Don't copy** the template's `app/`, `components/`, `hooks/`, `constants/`, `scripts/`, `README.md`. Don't overwrite `docs/`, `CLAUDE.md`, `.claude/`, `KICKOFF.md`, `BUILD.md`, `.gitignore`.
  - `package.json`: `name: "countdown-lockscreen"`; remove the `reset-project` script; keep `main: "expo-router/entry"`.
  - `tsconfig.json`: `strict: true`; keep the `@/*` alias.
  - Append to `.gitignore`: `android/`, `ios/`, `.scaffold/`, `coverage/`.
  - `npm install`. Create minimal placeholder `app/_layout.tsx` (Stack) and `app/index.tsx` (text "Countdown Lock Screen") so it bundles.
  - Configure `app.json` per ARCHITECTURE §12 (name, slug, scheme `countdownlock`, portrait, package IDs). Plugins come later as they're installed.
  - Remove the scaffold dir: `rm -r .scaffold`.
  - Acceptance:
    ```bash
    test -f package.json && test ! -d .scaffold && grep -q '"strict": true' tsconfig.json
    grep -q countdownlock app.json
    npx tsc --noEmit && npx expo export --platform android
    ```

- [x] **T1.2 — Install core dependencies, Jest, scripts** · `MUST-HAVE` · 8 min · deps: T1.1
  - Runtime (one command, versions resolved by Expo):
    `npx expo install zustand @react-native-async-storage/async-storage date-fns react-native-svg lucide-react-native react-native-view-shot expo-media-library expo-notifications expo-sharing expo-file-system expo-document-picker expo-font expo-splash-screen expo-constants expo-linking @react-native-community/datetimepicker`
  - Dev: `npx expo install jest-expo jest @types/jest @testing-library/react-native -- --save-dev`
  - `package.json` scripts: `"test": "jest"`, `"test:tz": "TZ=America/Los_Angeles jest && TZ=Asia/Kolkata jest"`, `"typecheck": "tsc --noEmit"`, `"lint": "expo lint"`.
  - Jest config in `package.json`: `preset: "jest-expo"`, `testMatch: ["**/__tests__/**/*.test.ts?(x)"]`, and `transformIgnorePatterns` per jest-expo docs, extended with `lucide-react-native`. `setupFiles` mocks AsyncStorage with its official jest mock.
  - Add `app.json` plugins for installed libs that need config (`expo-media-library` permissions text, `expo-notifications`, `expo-font`, `expo-splash-screen`).
  - Add `__tests__/sanity.test.ts` (1 + 1 = 2).
  - Acceptance:
    ```bash
    CI=1 npm test && npx expo install --check && npm run lint
    ```

- [x] **T1.3 — Bundle fonts locally + font map** · `MUST-HAVE` · 8 min · deps: T1.2
  - `npx expo install @expo-google-fonts/inter @expo-google-fonts/jetbrains-mono @expo-google-fonts/press-start-2p @expo-google-fonts/vt323 @expo-google-fonts/fredoka @expo-google-fonts/playfair-display @expo-google-fonts/lora @expo-google-fonts/caveat`
  - Copy exactly the 12 files listed in DESIGN §7 into `assets/fonts/` (find them with `find node_modules/@expo-google-fonts -name '<Key>.ttf'`). Add `assets/fonts/LICENSES/README.md` listing each family as SIL OFL 1.1 (copy license files if the packages ship them).
  - Uninstall the `@expo-google-fonts/*` packages (`npm uninstall …`) so the app depends only on local files.
  - `src/themes/fonts.ts`: `FONT_MAP` with 12 `require('../../assets/fonts/<Key>.ttf')` entries + the `FontKey` type.
  - If the download fails: log in `BLOCKERS.md`, map every key to a system font, add an ADR, and continue.
  - Acceptance:
    ```bash
    test "$(ls assets/fonts/*.ttf | wc -l | tr -d ' ')" = "12"
    test "$(grep -c "require(" src/themes/fonts.ts)" -ge 12
    ! grep -q "@expo-google-fonts" package.json
    ```

- [x] **T1.4 — Domain types + 4 theme token sets + contrast check** · `MUST-HAVE` · 7 min · deps: T1.3
  - `src/types/{domain,theme,wallpaper}.ts` per ARCHITECTURE §3.
  - `src/themes/tokens/*.ts` with **exact** values from DESIGN §6.1–6.4. `src/themes/index.ts` (`THEMES`, `THEME_ORDER`). `src/themes/chrome.ts` (§6.5). `src/themes/icons.ts` (lucide registry; verify the names exist).
  - `src/utils/contrast.ts` (alpha-aware: composite `#RRGGBBAA` over the declared bg).
  - Tests: `__tests__/themes/tokens.test.ts` (each theme has every required key, fonts ∈ FontKey), `__tests__/themes/contrast.test.ts` (every `contrastPairs` entry ≥ its `min`). If a DESIGN token fails, adjust the token minimally and note it in an ADR.
  - Acceptance:
    ```bash
    CI=1 npm test -- __tests__/themes
    ```

- [x] **T1.5 — Zustand store + AsyncStorage persistence + app-ready gate** · `MUST-HAVE` · 7 min · deps: T1.4
  - `src/store/{index,storage,migrations,selectors}.ts` per ARCHITECTURE §5.1, including draft actions, `toggleMilestone`, `markComplete`, `resetCountdown`, preferences, and reminders (defaults per SPEC AC-09).
  - `src/utils/id.ts`. `src/hooks/useAppReady.ts` (fonts + `hasHydrated`).
  - `app/_layout.tsx`: keep the splash until ready. `app/index.tsx`: redirect to `/home` or `/onboarding/goal` (placeholder route files are OK for now).
  - Tests `__tests__/store/store.test.ts`: defaults, add 13th milestone rejected, move/remove, toggle sets `completedAt`, reset clears, corrupt JSON → `storageError` (AC-05, AC-13, AC-27, AC-30).
  - Acceptance:
    ```bash
    CI=1 npm test -- __tests__/store
    ```

- [x] **T1.6 — `bootstrap.sh` + phase gate** · `SHOULD-HAVE` · 3 min · deps: T1.5
  - Root `bootstrap.sh` (bash, `set -euo pipefail`): check Node ≥ 20, `npm ci`, `npx expo install --check || true`, `npx tsc --noEmit`, `CI=1 npm test`, then print the next steps from `docs/SETUP.md`. `chmod +x`. **Don't run it here** (it would reinstall); syntax-check only.
  - Acceptance:
    ```bash
    bash -n bootstrap.sh && test -x bootstrap.sh
    npx expo export --platform android
    ```

---

## Phase 2 — Planning engine, date utilities, tests, onboarding (42 min)

- [x] **T2.1 — Date & T-minus utilities + timezone tests** · `MUST-HAVE` · 10 min · deps: T1.5
  - `src/utils/dates.ts` per ARCHITECTURE §4 (`parseLocalDate`, `toLocalDateString`, `deadlineInstant`, `daysLeft`, `getCountdownParts`, `getCountdownStatus`, `tMinus`, `formatTMinusLabel`, `formatDeadline`).
  - Tests `__tests__/utils/dates.test.ts`: the `YYYY-MM-DD` parse doesn't shift days; end-of-day default; DST start 2027-03-14 and end 2027-11-07 day counts; statuses upcoming/today/overdue/completed (AC-03, AC-10, AC-31, AC-32).
  - Acceptance:
    ```bash
    CI=1 npm test -- dates && npm run test:tz
    ```

- [ ] **T2.2 — Backward planner, validation, progress, icon suggestion** · `MUST-HAVE` · 10 min · deps: T2.1
  - `src/utils/{planner,validation,progress,icons,prng}.ts` per ARCHITECTURE §4 + DESIGN §8.1.
  - Tests: `milestoneCountFor` boundaries 13/14/27/28/41/42; all generated dates within `[today, deadline]` and ascending, for D ∈ {0, 1, 2, 7, 30, 120}; validation boundaries (today and deadline accepted); `getNextMilestone` skips done/past; `getProgress` clamps; `suggestIcon('Polish resume') === 'file-text'`; PRNG deterministic (AC-02, AC-04–AC-07, AC-11, AC-12).
  - Acceptance:
    ```bash
    CI=1 npm test -- planner validation progress icons prng
    ```

- [ ] **T2.3 — UI kit + onboarding layout + Steps 1–3 (Goal, Deadline, Motivation)** · `MUST-HAVE` · 11 min · deps: T2.2
  - `src/components/ui/*` (Button, IconButton, TextField with counter, DateField / DateField.web, TimeField / TimeField.web, Toggle, Segmented, Checkbox, ProgressBar, Toast, StepHeader, Banner) using chrome tokens.
  - `app/onboarding/_layout.tsx` (Stack, StepHeader "Step n of 6"; `?mode=edit` → `startDraft('edit')`).
  - `goal.tsx`, `deadline.tsx`, `motivation.tsx` per DESIGN §9.2–9.4. Next is disabled until valid. Inline errors.
  - `src/constants/strings.ts` holds all copy.
  - Acceptance:
    ```bash
    ls app/onboarding/{_layout,goal,deadline,motivation}.tsx
    npx expo export --platform android
    ```

- [ ] **T2.4 — Steps 4–6 (Milestones, Theme, Reminders) + commit flow** · `MUST-HAVE` · 11 min · deps: T2.3
  - `milestones.tsx` (DESIGN §9.5): add/edit/move ↑↓/delete, Auto-plan (confirm before replacing), out-of-order warning + Sort by date, max 12, per-row errors block Next.
  - `theme.tsx` (§9.6): 2×2 cards. Use a **temporary** solid-color swatch per theme until T4.5 swaps in the live `<Wallpaper>` mini preview.
  - `reminders.tsx` (§9.7): toggles, time, N-days segmented control. **Finish** → `commitDraft(now)` → `router.replace('/home')`. (The permission request is wired in T5.2.)
  - Acceptance:
    ```bash
    ls app/onboarding/{milestones,theme,reminders}.tsx
    CI=1 npm test && npx expo export --platform android
    ```

---

## Phase 3 — Home + Settings (26 min)

- [ ] **T3.1 — Home screen** · `MUST-HAVE` · 14 min · deps: T2.4
  - `src/hooks/useNow.ts` (minute-aligned interval, paused when the app is backgrounded).
  - `app/home.tsx` + `src/components/home/*` per DESIGN §9.8: live `days : hrs : min`, NextMilestoneCard, DualProgress, interactive Checklist (`accessibilityRole="checkbox"`), **Generate lock screen** (→ `/studio`), **Edit plan** (→ `/onboarding/goal?mode=edit`), settings icon.
  - Empty, overdue, today, and completed states per DESIGN §10 (Mark complete / Set new deadline actions).
  - Acceptance:
    ```bash
    test -f app/home.tsx && npx expo export --platform android
    ```

- [ ] **T3.2 — Settings + JSON export/import + reset** · `MUST-HAVE` (export/import `SHOULD-HAVE`) · 12 min · deps: T3.1
  - `src/utils/planFile.ts` (`exportPlan`, `importPlan`, v0→v1 migration) per ARCHITECTURE §5.2.
  - `src/services/{planFile,share}.ts` (expo-file-system + expo-sharing + expo-document-picker).
  - `app/settings.tsx` per DESIGN §9.11: reminders section (UI only until T5.2), Export, Import (confirm + error card), Edit plan, Mark complete, Reset (confirm dialog → `resetCountdown()` → `router.replace('/onboarding/goal')`).
  - Tests `__tests__/utils/planFile.test.ts`: round-trip; `wrong-schema`, `unsupported-version`, invalid date, missing deadline; v0 fixture migrates; unknown theme coerced (AC-28, AC-29).
  - Acceptance:
    ```bash
    CI=1 npm test -- planFile && test -f app/settings.tsx
    npx expo export --platform android
    ```

---

## Phase 4 — Wallpaper renderer, themes, Studio (50 min)

- [ ] **T4.1 — Canvas utils, wallpaper model, `<Wallpaper>` frame + shared parts** · `MUST-HAVE` · 12 min · deps: T2.2
  - `src/utils/canvas.ts` (`unitFor`, `resolveCanvasSize`, presets from DESIGN §8.3, `PORTRAIT_SAFE`/`LANDSCAPE_SAFE`).
  - `src/utils/wallpaperModel.ts` (`buildWallpaperModel`: hero variants, row selection, overflow, banner).
  - `src/components/wallpaper/{Wallpaper,WallpaperFrame,WallpaperPreview,SafeZoneOverlay}.tsx` + `parts/*`. The zones follow DESIGN §4 exactly (30/58/12). A neutral fallback path is used until themes land.
  - Tests: `canvas.test.ts` (AC-15; `u` for portrait and landscape), `wallpaperModel.test.ts` (overdue → `OVERDUE`/`n DAYS PAST`; today → `TODAY`; 12 milestones → `maxRows` rows + overflow; `showCompleted` adds ≤ 1 done row; 0 milestones → only finish).
  - Acceptance:
    ```bash
    CI=1 npm test -- canvas wallpaperModel
    ! grep -rnE "Date\.now|new Date\(\)|Math\.random" src/components/wallpaper src/utils
    ```

- [ ] **T4.2 — Themes: Glass Terminal + Pixel Quest** · `MUST-HAVE` · 11 min · deps: T4.1
  - `src/components/wallpaper/themes/glass-terminal/*` (gradient + glow orbs + grid, circuit rail, glass cards, outlined icon squares) and `pixel-quest/*` (stepped bands, seeded stars, pixel hills, S-trail, octagon nodes, castle-flag finish, max 4 rows) per DESIGN §6.1–6.2, §8.2.
  - Acceptance:
    ```bash
    ls src/components/wallpaper/themes/glass-terminal src/components/wallpaper/themes/pixel-quest
    CI=1 npm test
    ```

- [ ] **T4.3 — Themes: Sticker Planner + Field Journal** · `MUST-HAVE` · 11 min · deps: T4.1
  - `sticker-planner/*` (grid paper, confetti, rotated ribbon cards with notches, stitch line, sticker pills, **Mochi** mascot with 3 expressions) and `field-journal/*` (parchment vignette, speckles, contours, compass, Bézier road + pins + pine trees, checklist panel with tape) per DESIGN §6.3–6.4, §8.2.
  - Render smoke test `__tests__/components/Wallpaper.test.tsx`: 4 themes × {upcoming, today, overdue, completed} × {0, 3, 12 milestones} render without throwing and contain the hero text (AC-08 partial).
  - Acceptance:
    ```bash
    CI=1 npm test -- Wallpaper
    ```

- [ ] **T4.4 — Lock Screen Studio: preview, toggles, overlay, capture, Save, Share** · `MUST-HAVE` · 12 min · deps: T4.2, T4.3, T3.1
  - `app/studio.tsx` + `src/components/studio/*` per DESIGN §9.9: scaled preview at target aspect, theme chips, 4 toggles (persisted), size preset sheet (web-only presets hidden on native), safe-zone overlay **outside** the capture ref.
  - `src/hooks/useWallpaperCapture.ts` + `src/services/capture.ts` per ARCHITECTURE §7 (CaptureHost, frozen `now`, font guard, exact `width/height`).
  - `src/services/media.ts` (write-only permission, denied → toast + Open Settings + Share instead). Share via `sharePng`.
  - Busy, success, and error toasts per DESIGN §10.2.
  - Acceptance:
    ```bash
    test -f app/studio.tsx && grep -q "captureRef" src/services/capture.ts
    grep -q "SafeZoneOverlay" app/studio.tsx src/components/studio/*.tsx
    npx expo export --platform android
    ```

- [ ] **T4.5 — iOS guide + live theme previews in onboarding** · `MUST-HAVE` · 4 min · deps: T4.4
  - `app/ios-guide.tsx` (modal) per DESIGN §9.10 with a collapsible Shortcuts section. The Studio shows "How to set as Lock Screen" on iOS and after Save on iOS.
  - Replace the T2.4 swatches with live mini `<Wallpaper>` previews built from the draft (AC-08).
  - Acceptance:
    ```bash
    test -f app/ios-guide.tsx && grep -q "Wallpaper" app/onboarding/theme.tsx
    npx expo export --platform android
    ```

---

## Phase 5 — Local notifications (14 min)

- [ ] **T5.1 — Pure notification planner + tests** · `MUST-HAVE` (milestone reminders `SHOULD-HAVE`) · 6 min · deps: T2.2
  - `src/utils/notificationPlan.ts` per ARCHITECTURE §9.2.
  - Tests: daily trigger with `data.url = '/studio'`; deadline-day trigger; milestone triggers at `(date − N) @ dailyTime`; past triggers skipped; done milestones skipped; overdue/completed → `[]`; cap 60 (AC-23, AC-24).
  - Acceptance:
    ```bash
    CI=1 npm test -- notificationPlan
    ```

- [ ] **T5.2 — Notification service, permissions, sync, tap routing** · `MUST-HAVE` · 8 min · deps: T5.1, T4.4, T3.2
  - `src/services/notifications.ts` (`configureNotifications`, `ensurePermission`, `syncNotifications`) using the **installed** expo-notifications trigger types.
  - Root layout: `configureNotifications()`, `useNotificationSync()` (debounced), foreground once-per-day sync, `useLastNotificationResponse` → `router.push(data.url)`.
  - Wire the permission request into onboarding **Finish** and the Settings toggles. Show the denied card (DESIGN §10.3).
  - Test `__tests__/services/notifications.test.ts` with mocked `expo-notifications`: sync cancels then schedules N items; no-op when permission is denied (AC-26).
  - Acceptance:
    ```bash
    CI=1 npm test -- notifications && npx expo export --platform android
    ```

---

## Phase 6 — Android native module + EAS (21 min)

- [ ] **T6.1 — `modules/lockscreen-wallpaper` Expo local module (Kotlin) + JS wrapper** · `MUST-HAVE` · 10 min · deps: T1.5
  - Create the files listed in ARCHITECTURE §8.1. Prefer hand-writing them from the Expo local-module template structure. If you use `npx create-expo-module@latest --local`, it may prompt, so pass all names/flags non-interactively or fall back to hand-writing. Remove iOS/web native stubs; set `platforms: ["android"]`.
  - Kotlin per §8.2: `getCapabilities`, `setLockScreenWallpaperAsync(fileUri, options)` → `WallpaperManager.setBitmap(bitmap, null, allowBackup, FLAG_LOCK)`. Coded errors. `SET_WALLPAPER` permission in the module manifest.
  - `src/services/lockscreen.ts` per §8.3 (`requireOptionalNativeModule`, Expo Go detection).
  - Test `__tests__/services/lockscreen.test.ts`: module null → `available: false` with the correct `reason`; module present → calls through; native rejection → `{ ok: false, code }` (AC-21).
  - Optional compile check (only if an Android SDK is already present; otherwise skip and **don't** log a blocker): `npx expo prebuild --platform android --no-install` then `cd android && ./gradlew :lockscreen-wallpaper:compileDebugKotlin`.
  - Acceptance:
    ```bash
    grep -q "FLAG_LOCK" modules/lockscreen-wallpaper/android/src/main/java/expo/modules/lockscreenwallpaper/LockscreenWallpaperModule.kt
    grep -q "SET_WALLPAPER" modules/lockscreen-wallpaper/android/src/main/AndroidManifest.xml
    CI=1 npm test -- lockscreen
    npx expo prebuild --platform android --no-install && test -d android   # android/ is git-ignored
    ```

- [ ] **T6.2 — Studio "Set as Lock Screen" integration** · `MUST-HAVE` · 4 min · deps: T6.1, T4.4
  - Android + available → button enabled: capture → `setLockScreenWallpaper(uri)` → toast "Lock screen updated ✓". Failure → alert + offer Save.
  - Android + unavailable → button disabled with an explanation (reason-specific copy). iOS/web → hidden.
  - Acceptance:
    ```bash
    grep -q "setLockScreenWallpaper" app/studio.tsx src/components/studio/*.tsx
    npx expo export --platform android
    ```

- [ ] **T6.3 — `eas.json` + EAS Android preview build** · `MUST-HAVE` (config) / `SHOULD-HAVE` (cloud build) · 7 min · deps: T6.2
  - `eas.json` per ARCHITECTURE §12. Install `expo-dev-client` via `npx expo install expo-dev-client` (for the `development` profile).
  - `npx eas-cli whoami`. If not logged in → **BLOCKER** (`npx eas-cli login && npx eas-cli init`), then mark `[!]` and continue.
  - If logged in: `npx eas-cli build --platform android --profile preview --non-interactive --no-wait`. If it fails on keystore generation → **BLOCKER** with `npx eas-cli build -p android --profile preview` (interactive, answer "Yes" to generate the keystore). Record the build URL in `docs/HANDOFF.md` notes.
  - Never read or commit credentials or keystores.
  - Acceptance:
    ```bash
    node -e "const e=require('./eas.json'); if(e.build.preview.android.buildType!=='apk') process.exit(1)"
    npx expo export --platform android
    ```

---

## Phase 7 — STRETCH: Web desktop export + Android background refresh (12 min)

Start only when every MUST-HAVE and SHOULD-HAVE task is `[x]` or `[!]`.

- [ ] **T7.1 — Expo Web desktop PNG export (2560×1600, 3024×1964)** · `STRETCH` · 9 min · deps: T4.4
  - Install web deps if missing (`npx expo install react-dom react-native-web`).
  - Landscape layout in `WallpaperFrame` (DESIGN §4.2). Desktop presets shown only on `Platform.OS === 'web'`.
  - `src/services/capture.web.ts` per ARCHITECTURE §7 (record an ADR if you add `html-to-image`). The Download PNG button replaces Save/Set on web. Hide notifications UI on web.
  - Acceptance:
    ```bash
    npx expo export --platform web && test -d dist
    CI=1 npm test -- canvas
    ```

- [ ] **T7.2 — Android background refresh hook (notify-only, feature-flagged)** · `STRETCH` · 3 min · deps: T5.2
  - `src/services/backgroundRefresh.ts` behind `FEATURE_BG_REFRESH = false`, per ARCHITECTURE §9.4. If `expo-background-task` isn't installed, write only the documented stub + notes (no new dependency unless the flag is turned on).
  - Acceptance:
    ```bash
    grep -q "FEATURE_BG_REFRESH = false" src/services/backgroundRefresh.ts
    ```

---

## Phase 8 — Polish, accessibility, README, HANDOFF (18 min)

- [ ] **T8.1 — Accessibility + edge-state audit** · `MUST-HAVE` · 8 min · deps: T6.2
  - Every Pressable/Touchable has `accessibilityRole` + `accessibilityLabel`; hit areas ≥ 44 pt; checklist checkbox state; wallpaper preview summary label; `allowFontScaling={false}` only inside `<Wallpaper>`.
  - Verify the DESIGN §10 states exist in code (empty, error, permission-denied, today, overdue, completed). Fix gaps.
  - Acceptance:
    ```bash
    npm run lint && npx tsc --noEmit
    ! grep -rnE "fetch\(|axios|XMLHttpRequest" src app
    ```

- [ ] **T8.2 — Coverage + full verification sweep** · `SHOULD-HAVE` · 4 min · deps: T8.1
  - Raise `src/utils` coverage to ≥ 80% lines (AC-N08) if needed.
  - Acceptance:
    ```bash
    CI=1 npm test -- --coverage --collectCoverageFrom='src/utils/**/*.ts'
    npm run test:tz && npx expo install --check && npx expo export --platform android
    ```

- [ ] **T8.3 — README + HANDOFF** · `MUST-HAVE` · 6 min · deps: T8.2
  - Update `README.md` (features, screenshots placeholder, quick start, doc links).
  - Write `docs/HANDOFF.md` per `BUILD.md` §6: what was built; test/export status; a manual phone checklist (Expo Go, EAS APK install, Android lock-screen set, iOS save + guide, notification + tap-to-Studio, overdue check by setting a past deadline via import); a summary of `BLOCKERS.md` with copy-paste commands; ADRs added during the build; known limitations (OEM lock-screen overrides, Expo Go media limits).
  - Final commit: `docs(T8.3): add handoff`.
  - Acceptance:
    ```bash
    test -f docs/HANDOFF.md && grep -q "BLOCKERS" docs/HANDOFF.md
    ```
