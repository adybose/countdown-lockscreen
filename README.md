# Countdown Lock Screen

Cross-platform Expo app that plans backward from a high-priority deadline and generates custom countdown lock screens.

Pick one deadline, auto-plan milestones backward from it (offline, no AI), and export a high-resolution lock-screen wallpaper in one of four original themes:

- **Glass Terminal**: dark glass cards with neon mint/cyan accents and monospace headings
- **Pixel Quest**: an 8-bit trail of glowing level nodes
- **Sticker Planner**: pastel ribbon cards, sticker pills, and Mochi the mascot
- **Field Journal**: a parchment map with a winding road, location pins, and a checklist panel

On **Android**, the app sets the lock screen directly through a small Kotlin Expo module. On **iOS**, it saves to Photos and shows a short setup guide. A daily local reminder brings you back to refresh the image. The app works 100% offline with no account, no backend, and no tracking.

> **Status:** specification phase. The app code is built from `BUILD.md` after the docs are reviewed.

## Documentation

| Doc | Purpose |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Stack, commands, conventions, **Unattended Operation Rules** |
| [docs/SPEC.md](docs/SPEC.md) | Problem, users, FR/NFR requirements, acceptance criteria, out of scope |
| [docs/DESIGN.md](docs/DESIGN.md) | Theme token tables, wallpaper anatomy & safe zones, wireframes, edge states |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Folder map, types, store/persistence, render & capture pipeline, native module, notifications, capability matrix |
| [docs/DECISIONS.md](docs/DECISIONS.md) | ADRs (Expo vs. alternatives, iOS limitation, view-shot vs. Skia, EAS vs. local builds) |
| [docs/TASKS.md](docs/TASKS.md) | Phased build plan (≤ 4 h) with acceptance commands |
| [docs/SETUP.md](docs/SETUP.md) | Run in Expo Go, install the EAS APK, local Android build |
| [docs/BLOCKERS.md](docs/BLOCKERS.md) | Items that need a human (login, keystore, device) |
| [BUILD.md](BUILD.md) | Prompt for the autonomous implementation session |
| [KICKOFF.md](KICKOFF.md) | Prompt that produced this specification |

Design reference (layout patterns only, never copied): [docs/reference/examples.png](docs/reference/examples.png)

## Quick start (after the build)

```bash
./bootstrap.sh        # install + checks (created in task T1.6)
npx expo start        # scan the QR code with Expo Go
```

See [docs/SETUP.md](docs/SETUP.md) for the Android APK (real lock-screen setting) and web export.
