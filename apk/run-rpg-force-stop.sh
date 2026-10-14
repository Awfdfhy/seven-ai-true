#!/usr/bin/env bash
set -euo pipefail
node apk/materialize-rpg-force-stop-test.cjs
(cd android && ./gradlew --no-daemon :app:assembleDebugAndroidTest)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb install -r android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
adb shell pm path ai.seven.v243 | grep -Fq package:
test_phase() {
  local phase="$1" log
  log="$(mktemp)"
  adb shell am instrument -w -r -e class "ai.seven.v243.RpgForceStopTest#${phase}" \
    ai.seven.v243.test/androidx.test.runner.AndroidJUnitRunner | tee "$log"
  if ! grep -Fq 'OK (1 test)' "$log"; then
    echo "RPG force-stop instrumentation phase failed: ${phase}" >&2
    rm -f "$log"; return 1
  fi
  rm -f "$log"
}
test_phase seedRpgState
adb shell am force-stop ai.seven.v243
test_phase verifyRpgState
echo 'RPG Android real force-stop recovery: PASS'
