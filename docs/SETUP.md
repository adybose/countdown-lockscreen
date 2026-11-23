# SETUP — Running & installing Countdown Lock Screen

Audience: the human developer/tester. The autonomous build never runs dev servers. Everything in this doc that starts a server or needs a phone is **for you**.

## 0. Prerequisites

| Tool | Notes |
|---|---|
| Node.js LTS (≥ 20) + npm | `node -v` |
| Git with push access to `origin` | SSH remote already configured |
| **Expo Go** app on your phone | Must match the project's Expo SDK version (shown in `package.json` → `expo`). If the store version is newer or older, use the EAS build instead. |
| *(Optional)* Expo account | Needed for EAS builds. Free tier is fine. |
| *(Optional)* Android Studio + JDK 17 | Only for the local `npx expo run:android` fallback |

## 1. One-command setup: `bootstrap.sh`

`./bootstrap.sh` is created during the build (task **T1.6**) at the repo root. It:
1. checks the Node version,
2. runs `npm ci`,
3. runs `npx expo install --check` (reports SDK-incompatible deps),
4. runs `npx tsc --noEmit` and `CI=1 npm test`,
5. prints the next commands from this doc.

```bash
git clone git@github.com:<you>/countdown-lockscreen.git
cd countdown-lockscreen
./bootstrap.sh
```

Until T1.6 exists, run `npm ci` manually.

## 2. Run locally in Expo Go (QR code)

```bash
npx expo start            # same Wi-Fi for phone + laptop
npx expo start --tunnel   # if they're on different networks / corporate Wi-Fi
```

- **Android:** open Expo Go → *Scan QR code*.
- **iOS:** scan the QR code with the Camera app → opens in Expo Go.

What works in Expo Go: onboarding, Home, Settings, theme previews, PNG export, Share, local notifications, and usually Save to Photos.
What doesn't: **Set as Lock Screen** (custom native module). The button is disabled with an explanation. Use §3 for that.

## 3. Install the EAS Android preview APK (real lock-screen setting)

One-time:
```bash
npx eas-cli login                       # opens a login prompt
npx eas-cli init                        # links the project, writes extra.eas.projectId to app.json
```

Build (≈ 10–20 min in the cloud):
```bash
npx eas-cli build --platform android --profile preview
```
- The first build asks to **generate a new Android keystore**. Answer **Yes** (EAS stores it for you).
- When it finishes, the CLI prints a URL + QR code. Open it on your Android phone and download the `.apk`.
- Allow "Install unknown apps" for your browser when Android asks, then install.
- Later builds can run non-interactively:
  `npx eas-cli build -p android --profile preview --non-interactive --no-wait`

Test the lock screen: open the app → **Generate lock screen** → **Set as Lock Screen** → lock the phone.
> Some OEM skins (certain Samsung/Xiaomi builds) can override third-party lock wallpapers with their own lock-screen carousel. Turn that feature off if the wallpaper doesn't appear.

## 4. Optional: local native build (`npx expo run:android`)

Requires Android Studio (SDK + platform tools), JDK 17, and a device with USB debugging enabled (or an emulator).

```bash
npx expo run:android           # prebuilds android/ (git-ignored), compiles, installs, starts Metro
npx expo run:android --variant release   # standalone release-like build on device
```

## 5. iOS

- Expo Go (§2) covers everything available on iOS. Save → follow the in-app "How to set as Lock Screen" guide.
- An iOS dev build (`npx eas-cli build -p ios --profile development`) needs a paid Apple Developer account. It's optional and adds no extra lock-screen capability (ADR-002).

## 6. Web / laptop (stretch)

```bash
npx expo start --web                  # interactive dev
npx expo export --platform web        # static build in dist/
npx serve dist                        # or any static server
```
In the Studio, choose **Laptop 16:10 (2560×1600)** or **MacBook Pro 14" (3024×1964)** → **Download PNG**.

## 7. Everyday commands

| Task | Command |
|---|---|
| Typecheck | `npx tsc --noEmit` |
| Tests | `CI=1 npm test` · timezone suite `npm run test:tz` |
| Lint | `npm run lint` |
| Bundle sanity | `npx expo export --platform android` |
| Dependency health | `npx expo install --check` · `npx expo-doctor` |

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| Expo Go says "Project is incompatible with this version of Expo Go" | Update Expo Go, or use the EAS APK (§3). |
| Notifications don't arrive | Check OS notification permission for Expo Go/the app. On Android, check battery optimization. Re-toggle reminders in Settings. |
| "Save to Photos" fails in Expo Go on Android | Use **Share** → save, or install the EAS APK (§3). |
| EAS build fails asking for a keystore in `--non-interactive` mode | Run the interactive build once (§3). Later builds can be non-interactive. |
| Fonts look like system fonts | Reload the app. If it persists, check `assets/fonts/` contains the 12 `.ttf` files. |
