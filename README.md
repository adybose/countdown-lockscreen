# Countdown Lock Screen

Cross-platform Expo app that plans backward from one high-priority deadline and generates custom countdown lock screens.

Pick one deadline, auto-plan milestones backward from it (offline, no AI), and export a high-resolution lock-screen wallpaper in one of four original themes:

- **Glass Terminal**: dark glass cards with neon mint/cyan accents, a circuit rail and monospace headings
- **Pixel Quest**: an 8-bit trail of glowing octagon level nodes ending at a castle flag
- **Sticker Planner**: pastel ribbon cards, sticker pills, and Mochi the mascot
- **Field Journal**: a parchment map with a winding road, location pins, and a taped checklist panel

On **Android**, the app sets the lock screen directly through a small Kotlin Expo module (`modules/lockscreen-wallpaper`). On **iOS**, it saves to Photos and shows a short setup guide. A daily local reminder brings you back to refresh the image. The app works 100% offline with no account, no backend, and no tracking.

> **Status:** MVP built. See [docs/HANDOFF.md](docs/HANDOFF.md) for what's done, the phone test checklist, and the one open blocker (linking the EAS project for the Android APK).

<!-- Screenshots: add Expo Go captures of onboarding, Home, Studio and the four themes here. -->

## Features

| Area | What you get |
|---|---|
| Onboarding | 6 steps, one question each: goal (+ emoji), deadline (+ optional time), motivation, milestones (auto-plan backward, reorder, validate), theme (live previews), reminders |
| Home | Live `days : hrs : min` countdown, next milestone, dual progress (milestones + time), tappable checklist, today / overdue / completed states |
| Lock Screen Studio | True-aspect preview, 4 themes, 4 toggles (motivation, completed, progress, safe zones), size presets, PNG export at the exact target pixels, Save, Share, Set as Lock Screen (Android build), iOS guide |
| Reminders | Daily "refresh your lock screen" notification (tap opens the Studio), deadline-day nudge, milestone reminders N days before |
| Data | Local persistence (AsyncStorage), JSON export/import with versioned schema + migration, reset |

## Quick start

```bash
./bootstrap.sh        # checks Node, npm ci, dependency check, typecheck, tests
npx expo start        # scan the QR code with Expo Go
```

Stack: Expo SDK 58 · React Native 0.88 · React 19 · TypeScript (strict) · Expo Router · zustand · date-fns · react-native-svg · react-native-view-shot.

| Task | Command |
|---|---|
| Typecheck | `npx tsc --noEmit` |
| Unit tests | `CI=1 npm test` (timezones: `npm run test:tz`) |
| Lint | `npm run lint` |
| Android bundle check | `npx expo export --platform android` |
| Android APK (EAS) | `npx eas-cli build --platform android --profile preview` (see [docs/SETUP.md](docs/SETUP.md) §3) |

## Documentation

| Doc | Purpose |
|---|---|
| [docs/HANDOFF.md](docs/HANDOFF.md) | **Start here:** build summary, phone test checklist, blockers, ADRs added |
| [CLAUDE.md](CLAUDE.md) | Stack, commands, conventions, **Unattended Operation Rules** |
| [docs/SPEC.md](docs/SPEC.md) | Problem, users, FR/NFR requirements, acceptance criteria, out of scope |
| [docs/DESIGN.md](docs/DESIGN.md) | Theme token tables, wallpaper anatomy & safe zones, wireframes, edge states |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Folder map, types, store/persistence, render & capture pipeline, native module, notifications |
| [docs/DECISIONS.md](docs/DECISIONS.md) | ADRs (Expo vs. alternatives, iOS limitation, view-shot vs. Skia, EAS, plus ADRs added during the build) |
| [docs/TASKS.md](docs/TASKS.md) | Phased build plan with acceptance commands and status |
| [docs/SETUP.md](docs/SETUP.md) | Run in Expo Go, install the EAS APK, local Android build |
| [docs/BLOCKERS.md](docs/BLOCKERS.md) | Items that need a human |
| [BUILD.md](BUILD.md) / [KICKOFF.md](KICKOFF.md) | Prompts used for the autonomous build and the spec |

Design reference (layout patterns only, never copied): [docs/reference/examples.png](docs/reference/examples.png). Fonts are SIL OFL 1.1 (see `assets/fonts/LICENSES/`); icons are Lucide (ISC).
