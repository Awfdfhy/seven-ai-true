#!/usr/bin/env bash
# UI/runtime blocker verification trigger
# RC1 final integration verification trigger
# RC gate rerun marker: durable WAL verification
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
OUT="visual-evidence/android14/rc1-hardening"
mkdir -p "$OUT"
APP_ID="$(node -p "require('./capacitor.config.json').appId")"
BASE_CODE="$(node -p "require('./package.json').sevenAndroidVersionCode")"
BASE_NAME="$(node -p "require('./package.json').version")"
RUNNER="${APP_ID}.test/androidx.test.runner.AndroidJUnitRunner"
CLASS="${APP_ID}.SevenRcHarnessTest"
APP_APK="android/app/build/outputs/apk/debug/app-debug.apk"
TEST_APK="android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk"
TMP="${RUNNER_TEMP:-/tmp}/seven-android-rc"
mkdir -p "$TMP"

node apk/materialize-android-rc-harness.cjs
(cd android && ./gradlew --no-daemon :app:assembleDebug :app:assembleDebugAndroidTest)
test -s "$APP_APK"
test -s "$TEST_APK"
cp "$APP_APK" "$TMP/build-a.apk"
cp android/app/build.gradle "$TMP/build.gradle.a"

restore_candidate(){
  cp "$TMP/build.gradle.a" android/app/build.gradle || true
  (cd android && ./gradlew --no-daemon :app:assembleDebug >/dev/null) || true
}
trap restore_candidate EXIT

run_one(){
  local method="$1" log="$2"
  set +e
  adb shell am instrument -w -r -e class "${CLASS}#${method}" "$RUNNER" 2>&1 | tee "$log"
  local status="${PIPESTATUS[0]}"
  set -e
  test "$status" -eq 0
  grep -q 'OK (1 test)' "$log"
  ! grep -q 'FAILURES!!!' "$log"
}

kill_window(){
  local phase="$1" stage="$2" verify="$3"
  local marker="files/seven-rc-process-ready"
  adb shell run-as "$APP_ID" rm -f "$marker"
  # End the previous instrumentation/activity process before starting this window.
  # force-stop retains app data and persisted SAF grants; no pm clear is permitted here.
  adb shell am force-stop "$APP_ID"
  adb shell am force-stop "${APP_ID}.test" || true
  adb shell am instrument -w -r -e class "${CLASS}#${stage}" "$RUNNER" >"$OUT/${phase}-stage.log" 2>&1 &
  local host_pid=$!
  local ready=""
  for _ in $(seq 1 120); do
    ready="$(adb shell run-as "$APP_ID" cat "$marker" 2>/dev/null | tr -d '\r\n' || true)"
    if [[ "$ready" == "$phase" ]]; then break; fi
    if ! kill -0 "$host_pid" 2>/dev/null; then cat "$OUT/${phase}-stage.log"; echo "stage instrumentation exited before kill window: $phase" >&2; return 1; fi
    sleep 0.25
  done
  [[ "$ready" == "$phase" ]] || { cat "$OUT/${phase}-stage.log"; echo "kill window was never armed: $phase" >&2; return 1; }
  local before
  before="$(adb shell pidof "$APP_ID" | tr -d '\r' || true)"
  [[ -n "$before" ]] || { echo "target process missing before force-stop: $phase" >&2; return 1; }
  printf 'phase=%s\npid_before=%s\n' "$phase" "$before" > "$OUT/${phase}-kill-evidence.txt"
  adb shell am force-stop "$APP_ID"
  adb shell am force-stop "${APP_ID}.test" || true
  wait "$host_pid" || true
  sleep 0.3
  local after
  after="$(adb shell pidof "$APP_ID" | tr -d '\r' || true)"
  printf 'pid_after=%s\n' "${after:-none}" >> "$OUT/${phase}-kill-evidence.txt"
  [[ -z "$after" ]] || { echo "target process survived force-stop: $phase pid=$after" >&2; return 1; }
  run_one "$verify" "$OUT/${phase}-verify.log"
}

# Build A starts from a clean target data directory. Nothing is cleared after seeding.
adb install -r -t "$APP_APK" | tee "$OUT/build-a-install.log"
adb install -r -t "$TEST_APK" | tee "$OUT/harness-install.log"
adb shell pm clear "$APP_ID" | tee "$OUT/build-a-clear-before-seed.log"
run_one seedUpgradeState "$OUT/build-a-seed.log"

# Real target-process kill at three persistence boundaries.
kill_window precommit stageProcessPreCommit verifyProcessPreCommit
kill_window postcommit stageProcessPostCommit verifyProcessPostCommit
kill_window cleancommit stageProcessCleanCommit verifyProcessCleanCommit

# Measured device evidence on Build A: cold/warm launch, background/foreground,
# low-memory callback, back/reopen, 500-message render/composer latency and PSS trend.
adb shell am force-stop "$APP_ID"
adb shell am start -W -n "$APP_ID/.MainActivity" | tee "$OUT/cold-start.txt"
adb shell input keyevent KEYCODE_HOME
adb shell am start -W -n "$APP_ID/.MainActivity" | tee "$OUT/warm-start.txt"
adb shell dumpsys meminfo "$APP_ID" > "$OUT/meminfo-before-performance.txt"
run_one measureRuntimePerformance "$OUT/performance-500.log"
adb shell dumpsys meminfo "$APP_ID" > "$OUT/meminfo-after-performance.txt"
run_one backgroundForegroundPreservesDurableState "$OUT/background-foreground.log"
# Instrumentation may leave the target process dead after the background/foreground test.
# Re-launch Seven and require a live PID before exercising the Android low-memory callback.
adb shell am start -W -n "$APP_ID/.MainActivity" | tee "$OUT/low-memory-relaunch.txt"
LOW_PID=""
for _ in $(seq 1 40); do
  LOW_PID="$(adb shell pidof "$APP_ID" | tr -d '\r' || true)"
  [[ -n "$LOW_PID" ]] && break
  sleep 0.25
done
[[ -n "$LOW_PID" ]] || { echo "target process missing before low-memory callback" >&2; exit 1; }
printf 'pid_before_trim=%s\n' "$LOW_PID" > "$OUT/low-memory-process.txt"
adb shell am send-trim-memory "$APP_ID" RUNNING_LOW | tee "$OUT/low-memory.log"
run_one verifyProcessCleanCommit "$OUT/low-memory-verify.log"
adb shell am start -W -n "$APP_ID/.MainActivity" > "$OUT/back-before.txt"
adb shell input keyevent KEYCODE_BACK
sleep 0.3
run_one verifyProcessCleanCommit "$OUT/back-reopen-verify.log"

# Build B is deliberately test-only: same package/signer, strictly higher versionCode.
BASE_CODE="$BASE_CODE" BASE_NAME="$BASE_NAME" node <<'NODE'
const fs=require('fs');
const p='android/app/build.gradle';
let s=fs.readFileSync(p,'utf8');
const code=Number(process.env.BASE_CODE);
if(!Number.isInteger(code))throw Error('invalid BASE_CODE');
if(!/versionCode\s+\d+/.test(s)||!/versionName\s+["'][^"']+["']/.test(s))throw Error('version anchors missing');
s=s.replace(/versionCode\s+\d+/,'versionCode '+(code+1));
s=s.replace(/versionName\s+["'][^"']+["']/,'versionName "'+process.env.BASE_NAME+'-upgrade-fixture"');
fs.writeFileSync(p,s);
NODE
(cd android && ./gradlew --no-daemon :app:assembleDebug)
cp "$APP_APK" "$TMP/build-b.apk"

APKSIGNER="$(find "${ANDROID_HOME:-$ANDROID_SDK_ROOT}/build-tools" -type f -name apksigner | sort -V | tail -n 1)"
[[ -x "$APKSIGNER" ]]
"$APKSIGNER" verify --print-certs "$TMP/build-a.apk" | tee "$OUT/build-a-signer.txt"
"$APKSIGNER" verify --print-certs "$TMP/build-b.apk" | tee "$OUT/build-b-signer.txt"
A_SIGNER="$(grep -Em1 '(Signer #1|V[0-9]+ Signer): certificate SHA-256 digest:' "$OUT/build-a-signer.txt" | sed 's/.*: //')"
B_SIGNER="$(grep -Em1 '(Signer #1|V[0-9]+ Signer): certificate SHA-256 digest:' "$OUT/build-b-signer.txt" | sed 's/.*: //')"
[[ -n "$A_SIGNER" && "$A_SIGNER" == "$B_SIGNER" ]] || { echo "A/B signer mismatch" >&2; exit 1; }
printf 'package=%s\nbuildA_versionCode=%s\nbuildB_versionCode=%s\nsigner_sha256=%s\n' "$APP_ID" "$BASE_CODE" "$((BASE_CODE+1))" "$A_SIGNER" > "$OUT/upgrade-identity.txt"

adb install -r -t "$TMP/build-b.apk" | tee "$OUT/build-b-upgrade-install.log"
grep -q 'Success' "$OUT/build-b-upgrade-install.log"
adb shell dumpsys package "$APP_ID" | grep -E 'versionCode=|versionName=' | head -n 4 | tee "$OUT/build-b-package.txt"
run_one verifyUpgradeState "$OUT/build-b-upgrade-verify.log"

# Restore candidate build metadata/output. The fixture B APK is never uploaded as product.
cp "$TMP/build.gradle.a" android/app/build.gradle
(cd android && ./gradlew --no-daemon :app:assembleDebug)
trap - EXIT
echo "android RC process-death + A-to-B continuity acceptance: PASS"
