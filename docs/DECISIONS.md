# DECISIONS — Architecture Decision Records

Format: each ADR has Status · Context · Decision · Consequences. Add new ADRs at the bottom with the next number (`ADR-005`, …). **Any deviation from `SPEC.md` or `ARCHITECTURE.md` during the build requires a new ADR first** (see `CLAUDE.md`, Unattended Operation Rules).

---

## ADR-001: Expo (managed + local module / prebuild) vs. bare React Native vs. Flutter

- **Status:** Accepted
- **Context:** We need a mobile-first app that runs on Android and iOS (and web as a stretch), built autonomously in under 4 hours. It needs one small native capability: setting the Android lock-screen wallpaper. The human must be able to try the app quickly on a phone without a local Android toolchain.
- **Options:**
  1. **Expo managed workflow + Expo local module + Continuous Native Generation (prebuild).** JS/TS for 99% of the app. One Kotlin file in `modules/lockscreen-wallpaper`. `android/` and `ios/` are generated, not committed.
  2. **Bare React Native.** Full native projects committed. More setup and Gradle/Xcode maintenance, and no Expo Go previews.
  3. **Flutter.** Good rendering (`RepaintBoundary.toImage`), but a different toolchain, no instant QR preview equivalent to Expo Go, and web/desktop export works differently. It would also need a platform channel for the same Kotlin call.
- **Decision:** Option 1. Expo (latest stable SDK resolved at build time), TypeScript, Expo Router, plus an Expo local module that's autolinked from `modules/`.
- **Consequences:**
  - ✅ Instant previews in Expo Go for everything except setting the lock screen. EAS cloud builds don't need a local Android SDK. Same codebase for web export.
  - ✅ The native surface is tiny and isolated, with feature detection via `requireOptionalNativeModule`.
  - ⚠️ The lock-screen feature only works in a dev/preview build (EAS APK or `npx expo run:android`), never in Expo Go. The UI must explain this (FR-21).
  - ⚠️ `android/`/`ios/` are git-ignored. Native changes go through the module or config plugins only.

---

## ADR-002: iOS lock-screen limitation & fallback UX

- **Status:** Accepted
- **Context:** iOS has no public API that lets third-party apps set the lock screen or home screen wallpaper. The Shortcuts app has a "Set Wallpaper" action, but an app can't silently invoke it with new image data.
- **Decision:** On iOS:
  1. Hide the "Set as Lock Screen" button.
  2. **Save to Photos** using `expo-media-library` (add-only/write-only permission, so there's no full library access).
  3. Show a concise, visual 4-step **"How to set as Lock Screen"** guide (Photos → Share → Use as Wallpaper → Add), with an "Open Photos" shortcut.
  4. Offer an optional collapsible **Shortcuts automation** guide (Time-of-Day automation → Find Photos (latest) → Set Wallpaper → Lock Screen). It's clearly labeled as still needing the user to re-render the image through the daily reminder first.
  5. The daily local notification deep-links to the Studio, so re-rendering takes 2 taps.
- **Consequences:**
  - ✅ App Store–compliant, with no private APIs.
  - ⚠️ iOS users have a manual step each time. Wallpaper staleness is reduced by reminders, not eliminated. Widgets are on the roadmap.
  - ⚠️ The guide copy must avoid promising exact iOS menu labels that vary by version. It says "Use as Wallpaper (or similar)".

---

## ADR-003: `react-native-view-shot` vs. `@shopify/react-native-skia` for wallpaper rendering

- **Status:** Accepted
- **Context:** We need one deterministic, data-driven `<Wallpaper>` that renders (a) as a live preview, (b) as tiny theme-picker thumbnails, and (c) as a full-resolution PNG. Custom fonts, SVG decorations, and four very different themes are needed, and it should work in Expo Go and on web.
- **Options:**
  1. **React Native views + `react-native-svg`, captured with `react-native-view-shot`.** Same component tree for preview and export. RN `<Text>` handles custom fonts loaded via `expo-font`. view-shot is supported in Expo Go.
  2. **Skia (`@shopify/react-native-skia`).** Pixel-perfect drawing and offscreen surfaces (`Skia.Surface.MakeOffscreen` / `drawAsImage`) that don't need a mounted view. Text layout needs Skia `Paragraph` APIs and explicit font loading (`useFonts` from Skia, not `expo-font`). Web needs CanvasKit WASM (~3 MB+). It's more code for rich text, and there's a learning-curve risk for a 4-hour autonomous build.
- **Decision:** Option 1. Use RN views + `react-native-svg`, captured by `react-native-view-shot` (`format: 'png'`, `result: 'tmpfile'`, explicit `width/height`). The layout size is set to `targetPx / PixelRatio`, so captures are native-resolution, not upscaled.
- **Consequences:**
  - ✅ The fastest path to four rich themes. One component for preview, thumbnail, and export. Works in Expo Go.
  - ✅ Fonts load once through `expo-font` and are shared with the app chrome.
  - ⚠️ Capture needs a mounted view (an off-screen CaptureHost), so true headless/background rendering isn't possible. This is why Android background refresh is notify-only (ARCHITECTURE §9.4).
  - ⚠️ Real blur (glassmorphism) isn't used. Glass is simulated with translucent layers for capture consistency.
  - 🔁 **Revisit** if background auto-refresh becomes a must-have. Skia offscreen rendering (or a native Kotlin Canvas renderer) would then be required.

---

## ADR-004: EAS cloud builds vs. local Android Studio builds

- **Status:** Accepted
- **Context:** The human tester needs an installable Android APK that includes the native `lockscreen-wallpaper` module. The autonomous build machine may not have the Android SDK, a JDK, or emulators. Interactive prompts (EAS login, first-time keystore generation) can't be answered during the unattended run.
- **Options:**
  1. **EAS Build (cloud)** with a `preview` profile producing an APK (`android.buildType: "apk"`, `distribution: "internal"`). It's installed on the phone by scanning a QR code or opening a link.
  2. **Local builds** with `npx expo run:android` or Gradle. This needs Android Studio, an SDK, and a JDK on the machine, and the first build takes 10+ minutes.
- **Decision:** EAS cloud as the primary path, run as `npx eas-cli build -p android --profile preview --non-interactive --no-wait` (no global install). Use `npx expo run:android` as the documented local fallback (`docs/SETUP.md`). The EAS task is scheduled **late** (Phase 6), so login or keystore prompts can't block earlier phases. If it blocks, log it in `BLOCKERS.md` with the exact commands (`npx eas-cli login`, `npx eas-cli init`, `npx eas-cli build -p android --profile preview`).
- **Consequences:**
  - ✅ No local Android toolchain is needed. The APK can be shared by link.
  - ✅ `--no-wait` keeps the autonomous run from idling during the ~10–20 min cloud build.
  - ⚠️ It needs a (free) Expo account. The first build may require interactive keystore generation, so expect a human step.
  - ⚠️ Free-tier queue times vary. The build URL is recorded in `HANDOFF.md`.

---

<!-- Template for new ADRs
## ADR-00N: <title>
- **Status:** Proposed | Accepted | Superseded by ADR-00M
- **Context:**
- **Decision:**
- **Consequences:**
-->
