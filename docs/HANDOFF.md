# HANDOFF — Countdown Lock Screen

Autonomous build of `docs/TASKS.md` Phases 1–8, run from `BUILD.md`. This doc is for you, the human tester: what was built, how to check it on a phone, and what still needs you.

**TL;DR**
- Every MUST-HAVE and SHOULD-HAVE task is done except one: the **EAS cloud build (T6.3) needs you to run `npx eas-cli init`** (one-time project link + keystore prompt). Copy-paste commands are in §3.
- 249 Jest tests pass (also under `America/Los_Angeles` and `Asia/Kolkata`). `src/utils` line coverage is 99.7%. `tsc` and lint are clean. `npx expo export` succeeds for Android and web.
- Both STRETCH tasks are done: web desktop PNG export (T7.1) and a feature-flagged, notify-only background refresh stub (T7.2).
- Nothing has been run on a real phone yet. The checklist in §2 is the first device pass.

## 1. What was built

**Stack (resolved at build time):** Expo SDK 58 (`expo ~58.0.26`), React Native 0.88.1, React 19.3, TypeScript 6 (strict), Expo Router, zustand + AsyncStorage, date-fns 4, react-native-svg, react-native-view-shot, lucide-react-native, expo-notifications / media-library / sharing / file-system / document-picker.

### Screens (`app/`)

| Route | What it does |
|---|---|
| `/onboarding/goal` → `deadline` → `motivation` → `milestones` → `theme` → `reminders` | 6-step wizard with "Step n of 6" dots, Back/Next, inline validation, draft persisted across restarts. `?mode=edit` pre-fills from the saved plan. Milestones: auto-plan backward (confirm before replacing), add / edit / move ↑↓ / delete, icon picker, max 12, out-of-order warning + Sort by date. Theme: live mini `<Wallpaper>` previews of your draft. Finish asks for notification permission, then saves. |
| `/home` | Live `days : hrs : min` (minute-aligned, paused in background), next milestone card, dual progress bars, tappable checklist (`checkbox` role), Generate lock screen, Edit plan, Settings. Today / overdue ("How did it go?" → Mark complete / Set new deadline) / completed ("Done! 🎉" → Start a new countdown) states. Empty checklist → "Break it down" with Auto-plan / Add. |
| `/studio` | Scaled true-aspect preview, safe-zone overlay (outside the capture ref), theme chips, 4 persisted toggles, size presets (`This device`, Android FHD+/QHD+, iPhone Pro/Pro Max; desktop presets web-only), off-screen full-size capture → PNG, **Save** (write-only Photos permission), **Share**, **Set as Lock Screen** (Android build only; disabled with a reason in Expo Go), iOS "How to set as Lock Screen". |
| `/ios-guide` | Modal: 4 steps, Open Photos, collapsible Shortcuts automation section. Opens automatically after Save on iOS. |
| `/settings` | Reminder controls + permission status (denied card with Open Settings), Export plan (JSON via share sheet), Import plan (validate → confirm → replace; readable error card), Edit plan, Mark goal complete, Reset (confirm). |

### Wallpaper renderer

- `<Wallpaper>` (`src/components/wallpaper/`) is pure and deterministic: no store, no clock (`options.now` only), seeded PRNG for decorations. The same component renders thumbnails, the Studio preview and the export.
- Zones follow DESIGN §4 exactly: top 30% clear for the clock, content 58% (header 14 / hero 22 / progress 4 / path 48 / motivation 12), bottom 12% clear. Landscape (desktop) uses a two-column layout.
- **Themes:** Glass Terminal (gradient + glow orbs + grid, circuit rail, glass cards, `>_` prompt), Pixel Quest (8 hard bands, seeded stars, stepped hills, S-trail, octagon nodes, castle flag, max 4 rows), Sticker Planner (grid paper, confetti, rotated notched ribbon cards, stitch line, sticker pills, **Mochi** with normal / star-eyes / sweat-drop moods), Field Journal (parchment vignette, speckles, contours, compass rose, Bézier road with pins + pine trees, taped checklist panel). All art is drawn from SVG primitives.
- Every theme's declared text/background pairs pass WCAG AA (≥ 4.5:1) with the exact DESIGN tokens; no token had to change.

### Platform pieces

- **Android native module** `modules/lockscreen-wallpaper` (Kotlin, Expo Modules API): `getCapabilities()` and `setLockScreenWallpaperAsync(fileUri, { alsoSetHome, allowBackup })` → `WallpaperManager.setBitmap(bitmap, null, allowBackup, FLAG_LOCK)`, coded errors (`ERR_FILE_NOT_FOUND`, `ERR_DECODE_FAILED`, `ERR_NOT_SUPPORTED`, `ERR_NOT_ALLOWED`, `ERR_SET_FAILED`), `SET_WALLPAPER` in the module manifest. Autolinking resolves it (`npx expo prebuild --platform android` succeeds).
- **Notifications:** pure planner (`src/utils/notificationPlan.ts`): daily repeating refresh → `/studio`, deadline-day nudge, milestone reminders `(date − N) @ dailyTime`, past/done skipped, overdue/completed → none, cap 60. The service cancels then reschedules on every plan/reminder change (debounced store subscription) and on the first foreground of each day. Tapping a notification (including a cold start) routes to its URL.
- **Data:** versioned plan JSON (`countdown-lockscreen/plan`, v1) with v0 migration, unknown theme/icon coercion, duplicate-id regeneration. Corrupt storage → defaults + one-time banner.

### Verification status (last run)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errors |
| `CI=1 npm test` | ✅ 249 tests, 20 suites |
| `npm run test:tz` (LA + Kolkata) | ✅ |
| `CI=1 npm test -- --coverage --collectCoverageFrom='src/utils/**/*.ts'` | ✅ 99.7% lines (target ≥ 80%) |
| `npm run lint` | ✅ clean |
| `npx expo install --check` | ✅ up to date |
| `npx expo export --platform android` | ✅ |
| `npx expo prebuild --platform android --no-install` | ✅ (`android/` is git-ignored) |
| Gradle compile of the Kotlin module | ⏭️ skipped: no Android SDK on the build machine (per T6.1, not a blocker). First real compile happens on EAS. |
| EAS preview APK | ⛔ blocked (§3) |
| `npx expo export --platform web` (stretch) | ✅ static site in `dist/` |

## 2. Manual test checklist (your phone)

Tick these off in order. ✅ = expected result.

### A. Expo Go preview (Android or iPhone)

1. `./bootstrap.sh` then `npx expo start` (use `--tunnel` if the phone is on a different network). Scan the QR code with Expo Go.
   ✅ Splash stays up until fonts load; no flash of system fonts; you land on **Step 1 of 6**.
2. Run the wizard: type a goal + pick an emoji → pick a deadline ~40 days out (try yesterday first: ✅ "Deadline can't be in the past") → motivation → **Auto-plan backward** (✅ 5 milestones with `T-n · Mon d` labels, ascending) → change one date past the deadline (✅ inline error, Next disabled) → fix it → move a row up (✅ "aren't in date order" + Sort by date) → theme step (✅ 4 live mini wallpapers showing your goal) → reminders → **Finish**.
   ✅ Notification permission prompt appears now (not at launch). You land on Home.
3. Home: ✅ countdown ticks each minute; next milestone card; both progress bars; tap a checklist row (✅ strikethrough, Milestones bar moves). Kill and reopen the app: ✅ everything persisted.
4. **Edit plan** → ✅ wizard is pre-filled; change the title → Finish → ✅ Home shows the new title.
5. **Generate lock screen** → Studio. ✅ preview has red-hatched top/bottom zones labelled "Clock & widgets" / "Shortcuts"; toggling **Safe zones** hides them; switch all 4 themes; toggle Motivation / Completed / Progress (✅ preview updates immediately). Tap the size chip → ✅ only phone presets on mobile.
6. **Share** → ✅ share sheet with a PNG. Save it somewhere and open it: ✅ **no safe-zone overlay in the image**, and the size matches the chip (e.g. 1080×2400 for Android FHD+). *Please check this on iOS too (see §4, capture size).*
7. **Save** → ✅ "Saved to Photos ✓" (deny the permission once to see ✅ "Photos access denied." with Open Settings / Share instead). In Expo Go on Android, Save may fail by design; Share always works.
8. Android in Expo Go: ✅ **Set as Lock Screen** is visible but disabled with "Needs the installable app build (APK). Save or share for now."
9. Settings → **Export plan (JSON)** → ✅ share sheet with `countdown-plan-YYYY-MM-DD.json`. **Import plan** → pick that file → ✅ confirm dialog → plan replaced. Import a non-plan JSON → ✅ "That file isn't a Countdown Lock Screen plan."
10. **Overdue check:** Settings → Import plan → pick `docs/samples/overdue-plan.json` (AirDrop/email it to the phone). ✅ Home shows "Overdue by N days" + "How did it go?"; Studio wallpaper shows `OVERDUE / N DAYS PAST` in red with missed rows. Tap **Mark complete** → ✅ "Done! Finished …" and the wallpaper says `DONE` (Sticker Planner's Mochi gets star eyes).
11. Settings → **Reset / replace deadline** → confirm → ✅ back to Step 1, Home is gone.

### B. Notifications + tap-to-Studio

1. In Settings, set **Daily refresh** time to 2 minutes from now. Lock the phone.
   ✅ "Refresh your lock screen" arrives. Tap it → ✅ the app opens on the Studio (also when the app was fully closed).
2. With milestone reminders on and N = 0, add a milestone dated today (Edit plan); set the daily time a minute ahead. ✅ "Today: <milestone>" arrives; tap → Home.

### C. Android APK (after resolving §3)

1. Open the EAS build URL on the phone, download and install the APK (allow "Install unknown apps" for your browser).
2. Studio → **Set as Lock Screen** → ✅ "Lock screen updated ✓". Lock the phone → ✅ the new wallpaper is on the **lock screen only**; the home screen wallpaper is unchanged.
3. ✅ The clock/date and bottom shortcuts don't cover any text.
4. If the wallpaper doesn't appear: some Samsung/Xiaomi skins override third-party lock wallpapers (Glance / Dynamic Lock Screen / lock-screen carousel). Turn that off and retry.
5. Save in the APK → ✅ the image appears in the gallery.

### D. iPhone

1. Studio → **Save to Photos** → ✅ "Saved to Photos ✓" and the **How to set as Lock Screen** guide opens. **Open Photos** opens the Photos app.
2. Follow the 4 steps → ✅ wallpaper set; the top 30% stays clear for the clock.
3. Expand **Automate with Shortcuts (optional)** → ✅ 3 steps + the note about re-rendering first.

## 3. Blockers (from `docs/BLOCKERS.md`)

| # | Task | Blocker | Status |
|---|---|---|---|
| 1 | T6.3 | EAS project isn't linked (`app.json` has no `extra.eas.projectId`), so `eas build --non-interactive` refuses to start. `eas init` creates a project on your Expo account and you have two accounts, so the build left that choice to you. The first build also needs an interactive "generate keystore" answer. You're already logged in (`npx eas-cli whoami` works). | OPEN |

**Resolve it (from the repo root):**

```bash
npx eas-cli init                                              # choose your account; writes extra.eas.projectId to app.json
git add app.json && git commit -m "chore: link EAS project" && git push origin main
npx eas-cli build --platform android --profile preview        # answer "Yes" to generate a new Android Keystore
```

When it finishes, the CLI prints a URL + QR code for the APK (≈ 10–20 min on the free tier). Later builds can run unattended:

```bash
npx eas-cli build --platform android --profile preview --non-interactive --no-wait
```

Local fallback (needs Android Studio + SDK + JDK 17 + a USB-debugging device): `npx expo run:android`.

## 4. Decisions made during the build (ADRs in `docs/DECISIONS.md`)

| ADR | Decision |
|---|---|
| **ADR-005** | `validateMilestones` lets **done** milestones keep past dates, so editing an in-progress plan doesn't force you to move completed milestones into the future. Pending milestones still must be ≥ today. |
| **ADR-006** | SDK 58's template moved routes to `src/app` and `@/*` → `./src/*`. We kept the documented root `app/` + `@/*` → `./*`, added `"types": ["jest", "node"]` (TypeScript 6 no longer auto-includes `@types`), disabled `typedRoutes`, set `web.output: static`, and dropped template-only packages. |
| **ADR-007** | DESIGN §4.2's landscape percentages add up to 108%; we kept 4% sides + 42% left column, a 4% gap, and gave the path column the rest (~46%). Jest maps `lucide-react-native` to its CJS build; RNTL v14 `render()` is awaited. |
| **ADR-008** | Web export uses `html-to-image` (MIT, web-only) instead of view-shot's `html2canvas-pro` path, for better inline-SVG fidelity. The Studio on web shows only **Download PNG**. |

Other implementation notes (no spec deviation):
- **expo-media-library SDK 58** replaced the old API (the legacy `saveToLibraryAsync` now throws). Saving uses `requestPermissionsAsync(true, ['photo'])` (write-only) + `Asset.create(uri)`.
- **Capture size on iOS:** view-shot multiplies the requested `width/height` by the screen scale on iOS, so the app passes layout points there and pixels on Android. Both should produce the exact target size, but this is **unverified on a device**. Checklist item A6 covers it.
- `.gitignore` uses `/android/` and `/ios/` (root only), so the Kotlin sources under `modules/lockscreen-wallpaper/android/` stay tracked.
- A store action `setCountdownTheme` was added so the Studio theme chips always change the saved plan (never a leftover wizard draft).

## 5. Stretch (Phase 7)

| Task | Status | Notes |
|---|---|---|
| T7.1 Web desktop PNG export | ✅ | `src/services/capture.web.ts` (html-to-image, ADR-008). Desktop presets **Laptop 16:10 (2560×1600)** and **MacBook Pro 14" (3024×1964)** appear only on web and use the two-column landscape layout. The Studio shows only **Download PNG**; the reminder UI is hidden on web. |
| T7.2 Android background refresh | ✅ (stub) | `src/services/backgroundRefresh.ts` behind `FEATURE_BG_REFRESH = false`. No new dependency. The header documents the Android 14/15 limits and the enable steps. The pure `shouldPostRefreshReminder()` is unit-tested. |

**Web manual check:**
1. `npx expo export --platform web && npx serve dist` (or `npx expo start --web`).
2. Finish onboarding → Studio → size chip → **Laptop 16:10** → **Download PNG**.
   ✅ `countdown-desktop-16x10-2560x1600.png` downloads at exactly 2560×1600, uses the two-column layout, and has no safe-zone overlay.
3. Check that the SVG backgrounds and custom fonts look right in Chrome and Safari. If a browser drops the fonts, that's a known html-to-image limitation; Chrome is the reference.

## 6. Known limitations

- **OEM lock-screen overrides:** some Samsung/Xiaomi builds replace third-party lock wallpapers with their own carousel or theme engine.
- **Expo Go:** no Set as Lock Screen (custom native module). On Android, saving to Photos from Expo Go may fail depending on the OS version. Use Share, or the APK.
- **iOS:** there's no public API to set the lock screen (ADR-002). Save + guide only; the image goes stale until the daily reminder brings you back.
- **Staleness:** the wallpaper is a static PNG. The daily reminder is the refresh mechanism. Real background auto-refresh would need a native renderer (ARCHITECTURE §9.4).
- **Not device-tested by the build:** Kotlin compile (first compile happens on EAS), PNG pixel dimensions on iOS, capture timing (≤ 2 s target; the duration is logged as `[capture] … ms` in dev builds).
