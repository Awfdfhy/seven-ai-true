#!/usr/bin/env bash
# Exercise Android's real DocumentsUI SAF picker on an emulator, not a mocked file input.
set -euo pipefail
OUT="dist/saf-picker-${ANDROID_API_LEVEL:-unknown}"
mkdir -p "$OUT"
adb wait-for-device
adb shell am start -a android.intent.action.OPEN_DOCUMENT -c android.intent.category.OPENABLE -t application/json > "$OUT/launch.txt"
sleep 3
adb shell uiautomator dump /sdcard/seven-saf-window.xml >/dev/null
adb pull /sdcard/seven-saf-window.xml "$OUT/window.xml" >/dev/null
adb shell screencap -p /sdcard/seven-saf-picker.png
adb pull /sdcard/seven-saf-picker.png "$OUT/picker.png" >/dev/null
# Android 14/16 may localize DocumentsUI. Confirm system picker is foreground,
# rather than relying on English UI text or fixed screen coordinates.
adb shell dumpsys activity activities > "$OUT/activities.txt"
if ! grep -Eiq 'documentsui|com.google.android.documentsui|com.android.documentsui' "$OUT/activities.txt"; then
  echo "SAF picker did not become foreground activity" >&2
  exit 1
fi
test -s "$OUT/window.xml"
test -s "$OUT/picker.png"
echo "SAF real DocumentsUI launch + UI hierarchy + screenshot: PASS (not persisted URI grant)"
adb shell input keyevent KEYCODE_BACK || true
