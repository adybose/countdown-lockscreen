# BLOCKERS

Log anything the autonomous build can't do by itself (login, keystore prompt, missing SDK, physical device needed, permission denied). Add one row per blocker, then **continue with the next independent task**. Never retry the same blocked action in a loop.

**Status values:** `OPEN` (needs a human) · `RESOLVED` (human ran the command; note the date) · `WONTFIX` (accepted limitation; link an ADR)

| # | Task ID | Blocker Description | Exact Human Command | Status |
|---|---|---|---|---|
| 1 | T6.3 | The EAS Android preview build can't start: the project isn't linked to an Expo project yet (`app.json` has no `extra.eas.projectId`). `eas init` creates a project on your Expo account and you have two accounts to choose from, so a human must run it. The first build also needs an Android keystore, which EAS only generates interactively. | `npx eas-cli init` then `npx eas-cli build --platform android --profile preview` (answer **Yes** to "Generate a new Android Keystore?") | RESOLVED 2026-11-24: linked to `@adybose`, keystore generated in the cloud, APK built ([build](https://expo.dev/accounts/adybose/projects/countdown-lockscreen/builds/02c6837b-37f3-4011-a65c-ea473941de66)) |

## Details

### Blocker 1 — T6.3 (EAS cloud build)

- **Command attempted:** `npx eas-cli build --platform android --profile preview --non-interactive --no-wait`
- **Error output (trimmed):**
  ```
  EAS project not configured. This command cannot configure it in non-interactive mode.
  Run one of the following, then re-run this command:
    eas init --id <project-id> --non-interactive
    eas init --account <account-name> --non-interactive
  ```
- **Auth check:** `npx eas-cli whoami` succeeded (you're logged in), so login is **not** the problem.
- **Impact:** No installable APK yet, so **Set as Lock Screen** can't be tested on a phone. Everything else works in Expo Go. `eas.json` (development / preview APK / production AAB) and `expo-dev-client` are already committed.
- **Workaround in place:** none needed for the code. The local fallback `npx expo run:android` works if Android Studio + SDK + JDK 17 are installed (this build machine has no Android SDK).
- **To resolve (copy-paste, from the repo root):**
  ```bash
  npx eas-cli init                                              # pick your account; writes extra.eas.projectId to app.json
  git add app.json && git commit -m "chore: link EAS project" && git push origin main
  npx eas-cli build --platform android --profile preview        # first time: answer Yes to generate the keystore
  ```
  Later builds can run unattended:
  ```bash
  npx eas-cli build --platform android --profile preview --non-interactive --no-wait
  ```
