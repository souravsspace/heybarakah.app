#!/usr/bin/env bash
#
# Build and install the Barakah dev client on a physical iPhone.
#
# Usage:
#   ./scripts/build-device.sh                # auto-pick the first connected iPhone
#   ./scripts/build-device.sh <UDID>         # target a specific device
#   ./scripts/build-device.sh --clean        # prebuild:clean + pod install first (needed after native changes)
#   ./scripts/build-device.sh --clean <UDID>
#
# Notes:
#   - The iPhone must be unlocked, trusted, and connected (cable or same Wi-Fi).
#   - Native features (shield / Screen Time, Live Activity) only work on a real device.
#   - Run --clean whenever native code changed (modules/, targets/, new native deps).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$REPO_ROOT/packages/app"

CLEAN=0
UDID=""
for arg in "$@"; do
  case "$arg" in
    --clean) CLEAN=1 ;;
    *) UDID="$arg" ;;
  esac
done

cd "$APP_DIR"

# Resolve a connected physical device UDID if one wasn't passed.
if [[ -z "$UDID" ]]; then
  UDID="$(xcrun xctrace list devices 2>/dev/null \
    | awk '/^== Devices ==/{d=1;next} /^== /{d=0} d' \
    | grep -v "MacBook\|Mac mini\|iMac\|Mac Studio\|Mac Pro" \
    | grep -oE '[0-9A-F]{8}-[0-9A-F]{16}|[0-9a-f]{8}-[0-9a-f]{16}' \
    | head -n1 || true)"
fi

if [[ -z "$UDID" ]]; then
  echo "✖ No connected iPhone found."
  echo "  Unlock the phone, plug it in (or join the same Wi-Fi), tap 'Trust', then re-run."
  echo "  Devices Xcode can see:"
  xcrun xctrace list devices 2>/dev/null | sed -n '/== Devices ==/,/== Simulators ==/p'
  exit 1
fi

echo "▶ Target device UDID: $UDID"

if [[ "$CLEAN" -eq 1 ]]; then
  echo "▶ Clean prebuild (regenerating ios/android + pods)…"
  # Use clean — incremental `expo prebuild` hits the @bacons/apple-targets
  # 'removeFromProject' bug when the DeviceActivityMonitor target already exists.
  bun run prebuild:clean
fi

echo "▶ Building & installing to device…"
bun expo run:ios --device "$UDID"

echo "✔ Done. Launch Barakah on the phone."
