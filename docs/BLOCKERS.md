# BLOCKERS

Log anything the autonomous build can't do by itself (login, keystore prompt, missing SDK, physical device needed, permission denied). Add one row per blocker, then **continue with the next independent task**. Never retry the same blocked action in a loop.

**Status values:** `OPEN` (needs a human) · `RESOLVED` (human ran the command; note the date) · `WONTFIX` (accepted limitation; link an ADR)

| # | Task ID | Blocker Description | Exact Human Command | Status |
|---|---|---|---|---|
| | | | | |

<!--
Example row (delete when the first real blocker is added):
| 1 | T6.3 | EAS build needs an Expo login; `npx eas-cli whoami` returned "Not logged in". | `npx eas-cli login && npx eas-cli init --non-interactive && npx eas-cli build -p android --profile preview` | OPEN |
-->

## Details (optional, one section per blocker)

<!--
### Blocker 1 — T6.3
- Command attempted: `...`
- Error output (trimmed): `...`
- Impact: which tasks/features are affected
- Workaround in place: ...
-->
