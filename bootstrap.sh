#!/usr/bin/env bash
# One-command setup for Countdown Lock Screen (see docs/SETUP.md).
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Checking Node.js version"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Install Node.js LTS (>= 20) first." >&2
  exit 1
fi
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "${NODE_MAJOR}" -lt 20 ]; then
  echo "Node.js >= 20 is required (found $(node -v))." >&2
  exit 1
fi
echo "    node $(node -v), npm $(npm -v)"

echo "==> Installing dependencies (npm ci)"
npm ci

echo "==> Checking Expo SDK compatibility"
npx expo install --check || true

echo "==> Typechecking"
npx tsc --noEmit

echo "==> Running unit tests"
CI=1 npm test

cat <<'NEXT'

All checks passed. Next steps (docs/SETUP.md):

  Run in Expo Go (scan the QR code):
    npx expo start            # same Wi-Fi
    npx expo start --tunnel   # different networks

  Build the Android preview APK (real lock-screen setting):
    npx eas-cli login
    npx eas-cli init
    npx eas-cli build --platform android --profile preview

  Web / laptop export (stretch):
    npx expo export --platform web
NEXT
