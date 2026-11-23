# BUILD: Autonomous Execution of Countdown Lock Screen App

Read `CLAUDE.md`, `docs/SPEC.md`, `docs/DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, and `docs/TASKS.md` before writing any code.

## Mission
Implement `docs/TASKS.md` from Phase 1 through Phase 8 completely autonomously in auto mode, strictly following the **Unattended Operation Rules** in `CLAUDE.md`.

## Execution Protocol
1. **Phase 1 Kickoff:** Initialize the Expo TypeScript app in the existing repo using the latest stable Expo SDK (check current versions dynamically via `npx create-expo-app@latest` into a temp directory or in-place merge without clobbering `docs/`, `CLAUDE.md`, `.claude/`, `KICKOFF.md`, `BUILD.md`, or `.git/`). Install every Expo/RN dependency via `npx expo install` so SDK compatibility is guaranteed.
2. **One Task at a Time:**
   - Pick the next unchecked `[ ]` task in `docs/TASKS.md` whose dependencies are satisfied.
   - Implement only what that task requires, matching `docs/DESIGN.md` and `docs/ARCHITECTURE.md`.
   - Verify with the task's acceptance command(s) plus `npx tsc --noEmit` and `CI=1 npm test` (and `npx expo export --platform android` at phase boundaries).
   - Mark the task `[x]` in `docs/TASKS.md`.
   - Commit with a Conventional Commit message (`feat(T1.2): ...`) and run `git push origin main`.
3. **Zero Blocking / Zero Waiting:**
   - Always use non-interactive flags (`CI=1`, `--yes`, `--non-interactive`).
   - Never start Metro, Expo Go servers, or Jest watch mode.
   - If a task hits an unresolvable external blocker (e.g., EAS requires an interactive first-time Android keystore confirmation, missing credentials, or physical-device-only verification), document the exact blocker and the exact command the human must run in `docs/BLOCKERS.md`, mark the task `[!] Blocked (see BLOCKERS.md)` in `docs/TASKS.md`, commit, and continue with all remaining independent tasks.
4. **Context Hygiene:**
   - Keep context lean. At the end of each completed phase, if context usage is high, run `/clear` (or compact cleanly) and resume immediately by re-reading `CLAUDE.md` and `docs/TASKS.md` to pick up the next unchecked task.
5. **Priority Order:**
   - Complete all `MUST-HAVE` and `SHOULD-HAVE` tasks first. Attempt `STRETCH` tasks (Phase 7: Expo Web desktop PNG export) only if core phases are green and verified.
6. **Final Deliverable (`docs/HANDOFF.md`):**
   - When all unblocked tasks are complete, update `README.md` and write `docs/HANDOFF.md` containing:
     1. Summary of everything built (features, themes, screens, tests passing, bundle export status).
     2. Exact manual test checklist for the human on their phone (Expo Go preview, EAS APK install, Android lock-screen setting, iOS save-to-Photos guide, notification test).
     3. Full contents/summary of `docs/BLOCKERS.md` with exact copy-paste commands to resolve any blocked item (especially EAS keystore/build if blocked).
     4. Any ADRs added to `docs/DECISIONS.md` during implementation.
   - Commit and push `docs/HANDOFF.md` as the final commit.

