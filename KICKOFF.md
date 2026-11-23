\# KICKOFF: Countdown Lock Screen App — Spec, Docs & Config Only

**CRITICAL CONSTRAINT: Create documentation, configuration, and an empty folder structure ONLY. Do NOT write any application code, do NOT create `package.json`, and do NOT run `create-expo-app` or `npm install` in this session.**

You are acting as a Principal Mobile Product Architect preparing a complete, self-contained specification and unattended-execution harness for an autonomous build of a mobile-first Countdown Lock Screen app. A human developer will review all docs you generate before starting implementation in a separate session. The entire implementation phase must be completable autonomously in under 4 hours.

---

## 1. Product Vision & Context

This app is built for the "Your Deadline, Your Design: Create a Countdown Lock Screen" mission. Instead of creating one static wallpaper image, the app lets a user plan backward from one high-priority deadline, define intermediate milestones, and generate high-resolution countdown lock screens with optional daily reminders.

- **Privacy & Architecture:** 100% local-first. No backend, no user login, no paid APIs, no AI API calls. All data persists on-device.
- **MVP Scope:** One active countdown at a time (document multiple countdowns as a future roadmap item).
- **Target Platforms:**
  - **Mobile-first:** React Native with **Expo (latest stable SDK — do NOT pin an SDK or library version from memory; during the build phase, check the current version via `npx create-expo-app@latest` and install dependencies with `npx expo install`)**, TypeScript, Expo Router.
  - **Android (Primary Native Capability):** Sets the lock screen wallpaper directly using a small Expo local module in Kotlin (`modules/lockscreen-wallpaper`) wrapping `WallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_LOCK)`. This is the ONLY native code in the project. Because Expo Go cannot load custom native modules, the JS wrapper must gracefully detect unavailability in Expo Go and fall back to saving/sharing, while real lock-screen setting runs in an EAS Android dev/preview APK (`npx expo run:android` documented as a local fallback).
  - **iOS:** Apps cannot programmatically set the lock screen. Fallback: save the PNG to Photos via `expo-media-library` and display a concise, visual "How to set as Lock Screen" guide (plus an optional collapsible guide for setting up an iOS Shortcuts automation).
  - **Web / Laptop (Stretch Goal):** The same `<Wallpaper>` renderer runs on Expo Web so users can export desktop-resolution PNGs (e.g., `2560x1600` and `3024x1964`).

---

## 2. Functional Requirements & User Flows

### Onboarding Flow (First Launch — 1 Question Per Screen)
A clean, linear 6-step wizard:
1. **Goal:** "What is your main upcoming goal or task?" (title + optional emoji or icon).
2. **Deadline:** "What is the deadline?" (date + optional time, using the device's local timezone).
3. **Motivation:** "Why does it matter?" (optional one-line motivation displayed on the lock screen).
4. **Milestones:** Add, edit, reorder, and delete intermediate milestones (title + date). Must include an offline (no AI) **"Auto-plan backward"** button that generates 3–6 milestones evenly spaced backward from the deadline as editable T-minus labels. Validation rule: every milestone date must fall between today and the deadline (inclusive).
5. **Theme Picker:** Choose one of the 4 visual themes with a live mini preview of the lock screen.
6. **Reminders:** Configure daily reminder time (local notification) + toggle for reminders `N` days before each milestone.

### Post-Onboarding Screens
- **Home:** Large live countdown (days, hours, minutes), highlighted next upcoming milestone, dual progress bar (completed milestones + elapsed time), interactive milestone checklist (tick/untick), and primary actions: **"Generate lock screen"** and **"Edit plan"**.
- **Lock Screen Studio:** Full-screen preview scaled to the device's native aspect ratio/resolution, theme switcher, visibility toggles (e.g., show motivation, show completed milestones, show safe-zone overlay), and actions: **Save to Gallery**, **Set as Lock Screen** (Android only, disabled/hidden with helpful tooltip on iOS/Expo Go), and **Share**.
- **Settings:** Notification/reminder schedule, reset or replace active deadline, export plan as JSON, import plan from JSON.

---

## 3. Design Plan & Reference Guidance

Inspect `@docs/reference/examples.png` if provided. Use it strictly for **layout patterns, hierarchy, and mood**—create 100% ORIGINAL themes and never copy its artwork or characters.

### Layout Patterns to Carry Over
- Bold goal title and hero countdown number (e.g., `"15 Days to Go"`).
- Deadline date badge (e.g., `"Nov 18, 2026"`).
- T-minus milestone labels with dates (e.g., `"T-30 Days (Dec 2): Complete OAs"`).
- Milestone checklist rows with checkbox state (done/pending) and one icon per row.
- Visual "path" or trail connecting milestones chronologically.

### Four Original Starter Themes (Define Full Design Token Tables in `docs/DESIGN.md`)
1. **Glass Terminal:** Dark translucent glassmorphism cards, neon mint & cyan accents, monospace/tech headings, outlined geometric tech icons.
2. **Pixel Quest:** Retro 8-bit aesthetic, milestones rendered as glowing level nodes along a winding trail, pixel display font for headings, high-contrast dark background.
3. **Sticker Planner:** Pastel pink palette, stacked ribbon-style rounded cards, sticker-like pill badges, an original cute mascot/emoji accent, handwritten/playful display font.
4. **Field Journal:** Warm parchment/map paper texture, winding road with location pins for milestones, paired checklist panel, crisp editorial/serif headings.

### Lock-Screen Safe Zones & Rendering
- **Safe Zones (Critical):** Specify as percentages of canvas height:
  - Top **30%** kept visually calm/clear for iOS/Android lock-screen clock, date, and widgets.
  - Bottom **12%** kept clear for flashlight, camera shortcuts, and home indicator/swipe bar.
  - Middle **58%** holds the primary title, hero countdown, path/checklist, and motivation.
  - Provide an optional semi-transparent safe-zone guide overlay in the Lock Screen Studio (automatically hidden during PNG capture).
- **Rendering Pipeline:** One pure, deterministic, data-driven `<Wallpaper countdown={...} theme={...} size={...} options={...} />` component captured to PNG at full pixel ratio using `react-native-view-shot`. All custom fonts must be bundled locally and loaded via `expo-font` before capture.
- **Staleness Handling:** Because static wallpapers go stale the next day:
  - **iOS & Android Default:** Daily local notification ("Tap to refresh your lock screen") deep-linking to the Lock Screen Studio.
  - **Android Stretch Goal:** Optional background refresh task (`expo-background-task` or WorkManager) documented with Android 14/15 limitations and marked explicitly as Stretch.

---

## 4. Suggested Libraries (Verify Expo Compatibility During Build)
- `expo-router`, `zustand`, `@react-native-async-storage/async-storage`, `date-fns`, `react-native-view-shot`, `expo-media-library`, `expo-notifications`, `expo-sharing`, `react-native-svg`, `expo-font`, `lucide-react-native` (or `@expo/vector-icons`), `jest` + `jest-expo` for unit tests of date math and backward-planning logic.

---

## 5. Exact Deliverables to Create in This Session

Create ONLY the following files and folder skeleton (no `package.json`, no `.ts`/`.tsx`/`.kt` application code):

1. **`CLAUDE.md`**
   - Project purpose, tech stack, folder structure, standard commands (install, typecheck, test, lint, web export, EAS build), TypeScript & React Native coding conventions.
   - An explicit **"Unattended Operation Rules"** section containing:
     - Work strictly one task at a time from `docs/TASKS.md`. After each task: run `npx tsc --noEmit` and `npm test`, mark the task `[x]` in `docs/TASKS.md`, commit with a Conventional Commit message (`feat:`, `fix:`, `docs:`, `chore:`, `test:`), and `git push origin main`.
     - Never wait for user input. Always pass non-interactive flags (`CI=1`, `--yes`, `--non-interactive`, `npx expo install`). Never start dev servers, Metro, or watch-mode test runners in the foreground. Verify builds with `npx tsc --noEmit`, `CI=1 npm test`, and `npx expo export` instead.
     - Never use `sudo`, never install global tools, never modify git remotes, never force-push, and never read or commit secrets/keystores/env files.
     - If any step is blocked (permission denied, login needed, EAS keystore prompt, physical device required), log it in `docs/BLOCKERS.md` with the exact command the human needs to run, then immediately continue with the next independent task. Never retry the same blocked action in a loop.
     - When compacting context, always preserve: current task ID, list of modified files, and current state of `docs/TASKS.md`.
     - Never deviate from `docs/SPEC.md` or `docs/ARCHITECTURE.md` without first recording an ADR in `docs/DECISIONS.md`.

2. **`.claude/settings.json`** (project-level permissions — do NOT set `defaultMode` here)
   - Narrow `allow` rules for commands needed during the build (e.g., `Bash(npx create-expo-app*)`, `Bash(npx expo install *)`, `Bash(npx expo export *)`, `Bash(npx expo prebuild *)`, `Bash(npx tsc --noEmit)`, `Bash(npm test*)`, `Bash(CI=1 npm test*)`, `Bash(npm run *)`, `Bash(git status)`, `Bash(git diff*)`, `Bash(git add *)`, `Bash(git commit *)`, `Bash(git push*)`, `Bash(eas build *)`, `Bash(eas whoami)`).
   - Strict `deny` rules: `Read(./.env*)`, `Read(**/*.keystore)`, `Read(**/*.jks)`, `Read(./credentials.json)`, `Read(./google-services.json)`, `Bash(sudo *)`, `Bash(git push --force*)`, `Bash(git push -f *)`, `Bash(git remote *)`, `Bash(rm -rf *)`, `Bash(npm install -g *)`.

3. **`docs/SPEC.md`**
   - Problem statement, target users, user stories, numbered functional requirements (`FR-01`, `FR-02`, ...), non-functional requirements (`NFR-01`, ... covering offline-first, render speed, accessibility, timezone correctness), explicit out-of-scope list, and testable acceptance criteria mapped to every requirement.

4. **`docs/DESIGN.md`**
   - Complete design token tables for all 4 original themes (colors, surfaces, borders, typography families/weights/sizes, radii, spacing, background treatment, icon style).
   - Wallpaper layout anatomy diagram (ASCII) with exact safe-zone percentages (30% top / 58% content / 12% bottom).
   - Typography & bundled font loading strategy.
   - Icon strategy (vector icons + original SVG decorations).
   - Screen-by-screen wireframes (ASCII/Markdown) for Onboarding (Steps 1–6), Home, Lock Screen Studio, and Settings.
   - Explicit empty, error, permission-denied, and **overdue** states (what the UI and wallpaper render once the deadline has passed).

5. **`docs/ARCHITECTURE.md`**
   - Module/folder map, TypeScript interface sketches (`Countdown`, `Milestone`, `ThemeId`, `ThemeTokens`, `ReminderSettings`, `WallpaperRenderOptions`, `AppState`), Zustand + AsyncStorage persistence & JSON import/export schema versioning, `<Wallpaper>` rendering + `react-native-view-shot` capture pipeline, Android native module interface (`modules/lockscreen-wallpaper` method signatures only — NO implementation code), local notification scheduling strategy, and a clear Android vs. iOS vs. Web capability matrix.

6. **`docs/SETUP.md`**
   - Pointer to `bootstrap.sh`, how to run locally with Expo Go (QR code), how to install and test the EAS Android preview APK on a phone, and optional `npx expo run:android` instructions.

7. **`docs/TASKS.md`**
   - Phased, numbered tasks (`T0.1`, `T1.1`, ...) with explicit dependencies, time estimates totaling **≤ 4 hours**, priority tags (`MUST-HAVE`, `SHOULD-HAVE`, `STRETCH`), and command-verifiable acceptance criteria.
   - Phases:
     - **Phase 0:** Docs review (human gate)
     - **Phase 1:** Expo scaffold, TypeScript config, bundled fonts, theme tokens, and Zustand data layer
     - **Phase 2:** Backward-planning engine, date/T-minus utilities, Jest unit tests, and 6-step Onboarding wizard
     - **Phase 3:** Home screen (live countdown, dual progress bar, interactive milestone checklist) and Settings (JSON export/import, reset)
     - **Phase 4:** Pure `<Wallpaper>` component, all 4 themes, safe-zone overlay, and Lock Screen Studio (PNG capture, Save to Gallery, Share, iOS guide)
     - **Phase 5:** Local notifications (daily refresh reminder + N-days-before milestone reminders)
     - **Phase 6:** Android native `lockscreen-wallpaper` Expo local module (Kotlin `FLAG_LOCK`) + `eas.json` + EAS Android preview build (placed late so any first-time keystore prompt doesn't block earlier phases)
     - **Phase 7 (Stretch):** Expo Web desktop PNG export (`2560x1600`, `3024x1964`) + optional Android background refresh notes/hook
     - **Phase 8:** Polish, accessibility pass, `README.md` update, and `docs/HANDOFF.md`

8. **`docs/DECISIONS.md`**
   - Concise ADRs for:
     - ADR-001: Expo (Managed + Local Module / Prebuild) vs. Bare React Native vs. Flutter
     - ADR-002: iOS Lock-Screen Limitation & Fallback UX
     - ADR-003: `react-native-view-shot` vs. `@shopify/react-native-skia` for Wallpaper Rendering
     - ADR-004: EAS Cloud Builds vs. Local Android Studio Builds

9. **`docs/BLOCKERS.md`** (clean empty template with columns/fields for Task ID, Blocker Description, Exact Human Command, Status) and an updated **`README.md`** linking all docs.

10. **Empty Folder Skeleton**
    - Create the exact folder hierarchy specified in `docs/ARCHITECTURE.md` (e.g., `app/`, `src/components/`, `src/themes/`, `src/store/`, `src/utils/`, `src/services/`, `modules/lockscreen-wallpaper/`, `assets/fonts/`, `__tests__/`) using `.gitkeep` files only.

---

## 6. Final Step for This Session
1. Verify that NO `package.json` and NO application source files were created.
2. Stage all created docs, config files, and `.gitkeep` directories.
3. Commit with `docs: add project specification, architecture, design, and task plan` and push to `origin main`.
4. Print a concise summary of all created files and confirm you are ready for human review before running `BUILD.md`.
