#!/usr/bin/env bash
set -euo pipefail
node apk/materialize-rpg-force-stop-test.cjs
# Derive the application id from capacitor.config.json (same source the test
# materializer uses) instead of hardcoding it. This used to hardcode the old
# Seven AI package (ai.seven.v243) while the RPG standalone APK is packaged as
# ai.seven.rpg, so `pm path` found nothing and the gate failed at install.
APP_ID="$(node -p "JSON.parse(require('fs').readFileSync('capacitor.config.json','utf8')).appId")"
if ! printf '%s' "$APP_ID" | grep -Eq '^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)+$'; then
  echo "Invalid Android application ID: ${APP_ID}" >&2
  exit 1
fi
TEST_APP_ID="${APP_ID}.test"
(cd android && ./gradlew --no-daemon :app:assembleDebugAndroidTest)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb install -r android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
adb shell pm path "$APP_ID" | grep -Fq package:
test_phase() {
  local phase="$1" log
  log="$(mktemp)"
  adb shell am instrument -w -r -e class "${APP_ID}.RpgForceStopTest#${phase}" \
    "$TEST_APP_ID/androidx.test.runner.AndroidJUnitRunner" | tee "$log"
  if ! grep -Fq 'OK (1 test)' "$log"; then
    echo "RPG force-stop instrumentation phase failed: ${phase}" >&2
    rm -f "$log"; return 1
  fi
  rm -f "$log"
}
test_phase seedRpgState
adb shell am force-stop "$APP_ID"
test_phase verifyRpgState
echo 'RPG Android real force-stop recovery: PASS'
