#!/usr/bin/env bash
# RPG acceptance on a clean runner; never start Gradle, Sharp, or Chromium next to an emulator.
set -euo pipefail
: "${ANDROID_API_LEVEL:?Android API level must be provided}"
APP_ID="ai.seven.rpg"
TEST_ID="${APP_ID}.test/androidx.test.runner.AndroidJUnitRunner"
APP_APK="dist/rpg-smoke-apks/app-debug.apk"
TEST_APK="dist/rpg-smoke-apks/app-debug-androidTest.apk"
OUT="dist/rpg-device-evidence/android-${ANDROID_API_LEVEL}"
mkdir -p "$OUT"
collect() {
  adb logcat -d -v threadtime -t 5000 > "$OUT/logcat.txt" 2>&1 || true
  adb shell dumpsys meminfo "$APP_ID" > "$OUT/app-meminfo.txt" 2>&1 || true
  adb shell dumpsys activity activities > "$OUT/activities.txt" 2>&1 || true
}
trap collect EXIT
test -s "$APP_APK" || { echo "Device app APK missing: $APP_APK"; exit 1; }
test -s "$TEST_APK" || { echo "Device test APK missing: $TEST_APK"; exit 1; }
echo "Android API ${ANDROID_API_LEVEL}: installing prebuilt artifacts on clean emulator"
adb wait-for-device
adb install -r "$APP_APK"
adb install -r "$TEST_APK"
adb shell pm path "$APP_ID" | grep -q '^package:'
run_test() {
  local klass="$1" expected="$2" name="$3" result=0
  echo "RPG acceptance: $name"
  adb shell am instrument -w -r -e class "$klass" "$TEST_ID" > "$OUT/$name.txt" 2>&1 || result=$?
  cat "$OUT/$name.txt"
  if [ "$result" -ne 0 ] || ! grep -Fq "OK ($expected test" "$OUT/$name.txt"; then
    echo "RPG acceptance FAILED: $name on API $ANDROID_API_LEVEL" >&2
    return 1
  fi
}
# Native WebView assertions exercise actual world creation, persistence, menus,
# model connection controls and import/export. This gate cannot be faked by build success.
run_test "ai.seven.rpg.SevenRpgStandaloneTest" 2 "startup"
# A real OS force-stop between two distinct instrumentation sessions is required.
run_test "ai.seven.rpg.RpgForceStopTest#seedRpgState" 1 "seed"
adb shell am force-stop "$APP_ID"
run_test "ai.seven.rpg.RpgForceStopTest#verifyRpgState" 1 "force-stop-restore"
ANDROID_API_LEVEL="$ANDROID_API_LEVEL" bash apk/run-rpg-saf-picker-smoke.sh
mkdir -p "$OUT/saf-picker"
cp -a "dist/saf-picker-${ANDROID_API_LEVEL}/." "$OUT/saf-picker/" || true
adb shell am start -n "${APP_ID}/.MainActivity" > "$OUT/launch.txt" 2>&1
sleep 4
adb shell screencap -p /sdcard/Download/seven-rpg-main.png
adb pull /sdcard/Download/seven-rpg-main.png "$OUT/main.png"
# Keep raw screenshot evidence; no assertion based on guessed tap coordinates.
test -s "$OUT/main.png"
echo "Seven RPG Android ${ANDROID_API_LEVEL}: actual-device smoke and force-stop PASS"
