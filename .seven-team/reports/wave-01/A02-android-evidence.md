# A02 — Android / WebView Validation Matrix for UI Foundation V2 (Wave 01A)

Author: A02 (Codex CLI), Team A
Date: 2026-10-03
Scope: read-only inspection. No production source was modified.
Sources inspected (evidence for every claim below is one of these):
`apk/materialize-android-visual-test.cjs`, `.github/workflows/android-apk.yml`, `capacitor.config.json`,
`package.json`, `apk/patch-android.cjs`, `apk/patch-production-signing.cjs`, `apk/verify-apk.cjs`,
`apk/materialize-native-platform.cjs`, `apk/materialize-android-motion-bridge.cjs`, `apk/harden-native-platform.cjs`,
`seven_ai-final.html`, `all.cjs`, `.seven-team/ownership.json`.

---

## 1. Current Android evidence coverage (what is already proven)

### 1.1 The device-evidence pipeline that exists today

`apk/materialize-android-visual-test.cjs` (175 lines) does not contain a test — it *generates* one. It writes
`android/app/src/androidTest/java/ai/seven/v243/SevenVisualEvidenceTest.java` (path derived from
`capacitor.config.json` `appId`, lines 4-5) from an inline template (lines 7-174). A single JUnit method,
`captureReleaseVisualStates()` (line 86), drives every capture.

The generated test uses:
- `ActivityScenario<MainActivity>` to launch the real Capacitor activity and pull the real WebView
  (`webView(ActivityScenario)`, line 63 — `a.getBridge().getWebView()`).
- `evaluateJavascript` with a 12 s latch timeout (`js(...)`, lines 23-28) and a 20 s poll loop
  (`waitFor(...)`, lines 29-32) for DOM readiness.
- `UiAutomation.executeShellCommand` (`shell(...)`, lines 36-45) for `settings get/put global` and
  `screencap -p <name>.png` (`shot(...)`, lines 55-61).
- Evidence root is a fixed device path: `EVIDENCE_ROOT="/data/local/tmp/seven-visual"` (line 21).

### 1.2 CI wiring — `.github/workflows/android-apk.yml`

One job, `android`, `runs-on: ubuntu-24.04`, **`timeout-minutes: 50`**. Step order:

| Step | Fact |
|---|---|
| Checkout / Node 24 / Java 21 / `npm install` | toolchain only |
| `npx playwright install --only-shell chromium` | Chromium for the release gate; **no browser-based Android-viewport tests consume it in this workflow** |
| `node all.cjs` | web pre-APK gate |
| `npm run android:generate` | build:web → label contract → assets → `rm -rf android` → `cap add/sync android` → materialize/patch/harden chain |
| `./gradlew lintDebug testDebugUnitTest assembleDebug` | **debug variant only** |
| `npm run android:verify` | `apk/verify-apk.cjs` |
| Enable KVM | udev rule for `/dev/kvm` |
| **Android 16 WebView device smoke test** | `reactivecircus/android-emulator-runner@v2.38.0`, `api-level: 36`, `arch: x86_64`, `profile: pixel_6`, `disable-animations: false`, `-no-window -gpu swiftshader_indirect`, runs `./gradlew :app:connectedDebugAndroidTest`, pulls to `visual-evidence/android16/` |
| **Android 14 WebView UI regression test** | same runner, `api-level: 34`, plus **`adb shell settings put system font_scale 1.15`**, pulls to `visual-evidence/android14/` |
| Upload evidence | `actions/upload-artifact@v7`, name `seven-ui-visual-evidence`, `retention-days: 3`, `if-no-files-found: error` |
| `npm run android:verify` again | post-device re-verify |
| Upload APK | `android/app/build/outputs/apk/debug/app-debug.apk` |

### 1.3 What the generated test actually asserts (line refs into the template)

These are **hard DOM/CSS assertions**, independent of the screenshots:

- **Theme tokens, day**: `--s-bg` on `#seven-app` equals `#f5f7f5` (line 92).
- **Theme tokens, night**: `#seven-app --s-bg === '#111815'`, `.main` and `.composer` background `rgb(23, 33, 29)`, root color not `rgb(0,0,0)` (line 94).
- **Model menu**: `.seven-shell-model-menu` exists and is not `hidden` (line 97); dismissed via synthetic `Escape` `KeyboardEvent` (line 98).
- **Dialogs**: `SevenRemake.modeDialog/depthDialog/searchSettings` each assert `#seven-app > .s-modal .s-dialog` exists, then `closeDialog()` (lines 100-102).
- **Settings**: `#s-tab-context` and `#s-tab-data` clicks (lines ~104-105); `closeSettings()` (line 107).
- **Workspaces**: `ensureWorkspaces()` injects `./workspaces/hub.js` if `window.SevenWorkspaces` is absent and waits for load (lines 73-77); `workspace(webView,kind)` opens and asserts `document.documentElement.dataset.sevenWorkspace===kind` (lines 78-83). Captured: workspace picker + `coding`, `research`, `rpg` (lines 110-115).
- **RTL (DOM-level)**: sets `lang='ar-IQ'`, `dir='rtl'` on `<html>` and `<body>`, asserts computed `direction==='rtl'` (line 118); asserts closed sidebar `left >= innerWidth-2` (line 120) and open sidebar `left>=-2 && right<=innerWidth+2` with backdrop present under `#seven-app` (line 122).
- **Long chat (RTL + night)**: injects 18 assistant messages of `('نص '.repeat(24))` and asserts `.seven-shell-jump` exists, has class `show`, `aria-label==='الانتقال إلى أحدث رسالة'`, parent `#seven-app` (line 126).
- **Reduced motion**: sets `window_animation_scale`, `transition_animation_scale`, `animator_duration_scale` to 0 via `shell`, re-reads them with `assertZeroScale` (lines 133-136), **relaunches the activity**, then asserts `__sevenAndroidMotion.source==='ANDROID_GLOBAL_ANIMATION_SCALES'`, `reducedMotion===true`, `SevenPerformance.state.reducedMotion===true`, `dataset.sevenReducedMotion==='1'`, `SevenMotion.allow('ambient')===false` (line 149). Animation scales are restored in a `finally` block (lines 152-155).

### 1.4 Coverage summary table (current state)

| Dimension | Status | Evidence |
|---|---|---|
| Android 14 / API 34 | **Partially covered** — one run, `pixel_6`, portrait, `font_scale 1.15`, night-heavy theme | workflow "Android 14 WebView UI regression test" |
| Android 16 / API 36 | **Partially covered** — one run, `pixel_6`, portrait, default `font_scale` | workflow "Android 16 WebView device smoke test" |
| Small / compact viewport | **Not covered** — the only device profile pinned is `pixel_6`; no `wm size`, no density override, no small-width profile | workflow `profile: pixel_6` (both steps) |
| Font scale | **Weakly covered** — exactly one non-default value (1.15) on API 34; no 1.3/1.5/2.0; no clipping assertion | workflow `settings put system font_scale 1.15` |
| Landscape / rotation | **Not covered** — no `user_rotation`, no `wm size`, no `screenOrientation`, no rotation in the test | no rotation token in workflow or test; `apk/patch-android.cjs` manifest rewrite (lines 17-30) sets only `allowBackup`, `usesCleartextTraffic`, `windowSoftInputMode`, `configChanges` |
| Keyboard / IME / safe-area | **Not covered** — `adjustResize` is declared but never exercised; `visualViewport` is tracked in web code but never asserted; `env(safe-area-inset-*)` CSS exists but is never asserted | `apk/patch-android.cjs:24` (`android:windowSoftInputMode="adjustResize"`); `seven_ai-final.html:694-737` (insets CSS) and `seven_ai-final.html:2095-2170` (visualViewport reliability state); no `keyboard`, `ime`, `insets`, `fitsSystemWindows`, `visualViewport` token in `apk/materialize-native-platform.cjs`, `apk/materialize-android-motion-bridge.cjs`, `apk/harden-native-platform.cjs` |
| Day/night | **App-level only** — `SevenTheme.setPreference('day'|'night')` driven from JS; **no OS dark mode** (`cmd uimode night`), and `prefers-color-scheme` has **0 occurrences** in `seven_ai-final.html`; no `values-night` resources in the three materialize scripts | test `theme(webView,value)` (lines 64-68) and line 92/94; `grep -c "prefers-color-scheme" seven_ai-final.html` = 0 |
| Arabic RTL | **DOM-level only** — `lang`/`dir` swapped in JS while the Android locale stays default; Arabic text rendering (Arabic font, shaping) is exercised by the long-chat injection; **system** RTL (window insets, back gesture, `supportsRtl`) is not | test lines 118-129 |
| Long chat | **Partially covered** — 18 messages, RTL + night, jump-button presence/aria only | test line 126 |
| Settings / dialogs | **Partially covered** — 3 dialogs + 2 settings tabs, night only, no rotation/keyboard/scroll assertions | test lines 100-107 |
| Screenshots as *evidence* | Captured (`screencap -p`, ~20 PNGs) and uploaded, **never compared** to a baseline; no diff step exists in the workflow | `shot()` line 55-61; artifact step has no diff tool |
| Build variant exercised | **debug only** — `assembleDebug`, `connectedDebugAndroidTest`, uploaded `app-debug.apk`; `assembleRelease` never runs | workflow |
| APK content gate | Covered for the **debug** APK: version name/code match `package.json`, size < 30 MB, required `assets/public/**` entries, `SEVEN_FINAL_RELEASE_LAYER_V1`, `id="seven-app"`, `data-seven-remake="1"`, no manual key inputs, no password inputs, no CDN pdf.js | `apk/verify-apk.cjs:12-48` |
| Web-side gate overlap | `grep -E "android|apk|viewport|rtl|font|safe|visual" all.cjs` → **0 matches** | `all.cjs` |

**Headline:** Android evidence today is *one API 36 run + one API 34 run, one device profile, portrait only, night-biased, debug variant, screenshots without comparison, DOM assertions only for theme tokens / dialogs / workspaces / DOM-RTL / reduced motion.*

---

## 2. Exact gaps by required dimension

### 2.1 Android 14 / API 34 and Android 16 / API 36
- **Gap A1** — One profile (`pixel_6`) and one configuration per API. No compact-width or large-screen device, no tablet/foldable, no low-RAM path.
- **Gap A2** — `font_scale` is asymmetric: 1.15 on API 34, untouched (1.0) on API 36. There is therefore **no API-36 large-font evidence at all**, which is exactly where WebView text autosizing plus `dvh` layout tends to break.
- **Gap A3** — Emulator rendering is software: `-no-window -gpu swiftshader_indirect`. Font rasterization, blur/backdrop and any GPU-composited effect are not representative of real hardware.
- **Gap A4** — No assertion ties an API level to any behavior; both steps run the identical test, so a regression that only appears on one API would only be caught if the captured pixels were reviewed by a human.

### 2.2 Small viewport
- **Gap S1** — No device narrower than the pinned profile. Nothing asserts `document.documentElement.scrollWidth <= clientWidth` at a compact width, which is the single cheapest overflow detector.
- **Gap S2** — Nothing asserts the composer, send button, model chip, or sidebar trigger remain reachable when width collapses.
- **Gap S3** — `seven_ai-final.html` mixes `100vh` (5 occurrences) and `@supports(height:100dvh){--seven-visual-height:100dvh}` (lines 737-738). Which branch is active inside an Android WebView for a compact window is unverified — no test reads `--seven-visual-height`.

### 2.3 Font scale
- **Gap F1** — Only `1.15`. No coverage at 1.3 / 1.5 / 2.0, and Android's accessibility range goes well beyond that.
- **Gap F2** — No assertion that the composer, dialogs, or the RTL jump button survive large fonts; the test only screenshots.
- **Gap F3** — `apk/patch-android.cjs:26-29` appends only `|density` to `android:configChanges`. A system font-scale change is a different configuration change, so the activity is expected to recreate — no test covers a recreation with in-app state (open dialog, typed draft, scrolled chat).

### 2.4 Landscape
- **Gap L1** — No rotation anywhere: no `user_rotation`, no `wm size`, no `screenOrientation` lock, no rotation assertion in the test.
- **Gap L2** — No post-rotation reflow evidence for: chat list, sidebar, workspace hub, model menu, or any of the three dialogs.
- **Gap L3** — Landscape is where `env(safe-area-inset-left/right)` and `100dvh` disagree most; nothing asserts insets or the `--seven-visual-height` variable after rotation.

### 2.5 Keyboard / safe-area
- **Gap K1** — `windowSoftInputMode="adjustResize"` (`apk/patch-android.cjs:24`) is a declaration with **zero** runtime evidence. Nothing focuses `#userInput` and re-measures.
- **Gap K2** — `seven_ai-final.html:2095-2170` computes and stores `appReliabilityState.visualViewport` and re-reads it on `resize`/`scroll`. That is an *observability* hook with no assertion attached anywhere.
- **Gap K3** — `env(safe-area-inset-*)` appears at lines 694-737 of `seven_ai-final.html`, but no test asserts the resolved inset values, and no native code in the three materialize scripts applies window insets (no `setDecorFitsSystemWindows`, no `fitsSystemWindows`, no `WindowInsets` listener). Whether insets are consumed by the WebView at all is unknown from repository evidence.
- **Gap K4** — Hardware/gesture back with a dialog or the sidebar open is untested (no `OnBackPressed` or history assertion).

### 2.6 Day / night
- **Gap D1** — Theme is a JS preference, not a system signal: `prefers-color-scheme` count in `seven_ai-final.html` is **0**. No `cmd uimode night yes|no` anywhere.
- **Gap D2** — Every dialog, settings tab, workspace and RTL capture is night. Day-mode dialogs/workspaces are only covered by `chat-day` (line 93) — one screen.
- **Gap D3** — No `values-night` resources exist in the three materialize scripts, so native chrome (status bar, splash, launcher) is not proven to follow system night mode.

### 2.7 Arabic RTL
- **Gap R1** — RTL is applied by setting `lang`/`dir` attributes, not by an Arabic system locale. Arabic *font* and shaping are exercised (Arabic strings are injected), but WebView's locale-driven line-breaking/percent-width behavior is not.
- **Gap R2** — RTL assertions cover only the sidebar (lines 120, 122) and the jump button (line 126). **Not** covered: composer/send button order, model chip, settings tabs, all three dialogs, the workspace hub, and the input caret/selection in RTL.
- **Gap R3** — No `android:supportsRtl` / locale config is added by the manifest rewrite (`apk/patch-android.cjs:17-30`), so window-level RTL (and its effect on `safe-area-inset-left/right`) is unproven.

### 2.8 Long chat
- **Gap C1** — 18 messages is a shallow history; no test at 200+ messages, no scroll-performance/virtualization check, no memory or frame-timing assertion.
- **Gap C2** — Only assistant messages with a fixed repeated string; no long user message, no code block, no long unbroken URL/token, no markdown table.
- **Gap C3** — The jump button assertion checks presence + `aria-label` only; no assertion that scrolling to bottom hides it, and no LTR long-chat case.

### 2.9 Settings / dialogs
- **Gap G1** — Three dialogs asserted to exist, then closed. No assertion on geometry (`getBoundingClientRect` within viewport), no small-height dialog case, no scroll-within-dialog case.
- **Gap G2** — Settings covers two tabs (`s-tab-context`, `s-tab-data`) out of the tab set, night only, and nothing is asserted about the panel being scrollable or fitting the viewport.
- **Gap G3** — No dialog behaviour under font scale 2.0 or landscape — the two states most likely to clip a fixed-height dialog.

---

## 3. Release vs debug build implications (signing deliberately excluded)

Facts:
- CI builds and uploads **only** `assembleDebug` / `app-debug.apk` (workflow build step + final upload step).
- `apk/verify-apk.cjs:17-18` defaults to `android/app/build/outputs/apk/debug/app-debug.apk` but **already honours `SEVEN_APK_PATH`**, so verifying a release APK needs no code change — only a different path/arg in CI.
- Device evidence runs `:app:connectedDebugAndroidTest`, so every assertion in §1.3 is against the **debug** variant.
- `apk/patch-android.cjs:47-48`: the injected Gradle sets `testBuildType = "release"` and swaps in `signingConfig signingConfigs.sevenCi` **only when the `sevenCiKeystore` Gradle property is present**; the debug buildType block is likewise conditional.
- The workflow supplies `SEVEN_EMBED_*` API-key env vars but **no `sevenCiKeystore`/related Gradle properties**, so today `testBuildType` stays at Capacitor's default (debug).

Implications for UI Foundation V2 validation:
1. **Minified/resource-shrunk release rendering is entirely unproven.** R8/shrinking only applies to the release variant; nothing in CI would catch a release-only regression (stripped class, renamed asset, dropped CSS rule). Any UI Foundation V2 CSS/JS change must be proven on the release variant before it is trusted.
2. **The build variant is coupled to a signing identity.** Because `testBuildType = "release"` is gated on `sevenCiKeystore` (`apk/patch-android.cjs:47`), release-variant device evidence cannot be obtained without supplying a keystore. **Decoupling "which variant is instrumented" from "which key signs it" is a prerequisite code change in `apk/patch-android.cjs`** (e.g. an explicit `sevenTestBuildType` property), and that change is *not* a signing decision and should be reviewed independently.
3. **Debug-only evidence has one known blind spot already visible in the repo:** `capacitor.config.json` sets `webContentsDebuggingEnabled: false` and `allowMixedContent: false` for **all** variants, so DevTools-based debugging is not available even on debug; a failure inside the WebView currently has only the instrumentation assertions and screenshots to work with.
4. Recommended sequencing: land the P0 assertions first against debug (fast, no signing change), then add one release-variant connected run as a *separate* CI step/job once the variant/signing coupling is decoupled. Keep `apk/patch-production-signing.cjs` out of that change entirely.

---

## 4. Files / workflows that would change

| File | Change | Priority |
|---|---|---|
| `apk/materialize-android-visual-test.cjs` | Add new `@Test` methods alongside `captureReleaseVisualStates()` (line 86): viewport-overflow, font-scale, rotation, IME-focus, inset, system-night, RTL-composer. Reuse `shell()` (line 36) for `settings put system font_scale`, `wm size`, `settings put system user_rotation`, `cmd uimode night`; reuse `js()`/`waitFor()`/`shot()` unchanged. Add a `finally` restore for every setting mutated (pattern already exists at lines 152-155). | P0/P1 |
| `.github/workflows/android-apk.yml` | Mirror `font_scale` into the API 36 step; add rotation + IME steps to the API 34 step (or a third runner step); add `assembleRelease` + `SEVEN_APK_PATH=.../release/*.apk npm run android:verify`; increase or split the `timeout-minutes: 50` job budget; raise `retention-days: 3` if evidence must outlive the run; add a screenshot-count/manifest assertion step. | P0/P1 |
| `apk/patch-android.cjs` | Decouple instrumented build variant from `sevenCiKeystore` (line 47) so release-variant evidence does not require a signing identity. Manifest rewrite (lines 17-30) is the natural place to consider `supportsRtl`/locale config if RTL must be device-driven. | P1 |
| `apk/verify-apk.cjs` | **No change required** for release verification (`SEVEN_APK_PATH`/`argv[2]` already supported, lines 17-18). Only change if release-only asset expectations need asserting. | — |
| `package.json` | Only if new scripts are added (e.g. an `android:evidence` wrapper). `android:generate` and `android:verify` already exist and are unchanged. | P2 |
| `all.cjs` | Contains **0** matches for android/apk/viewport/rtl/font/safe/visual — web-side gap for the same dimensions. Out of Android scope; flag to the web gate owner. | P2 |

---

## 5. Prioritized validation matrix (with relative cost)

Cost legend: **S** ≈ single emulator step + 2-4 assertions (~5-8 min CI, no new job); **M** ≈ emulator run + one or two settings toggles plus restore (~10-15 min, may need a second runner step); **L** ≈ new runner step / new job / Gradle change (~20-30 min, pushes the 50-min job budget).

| # | Dimension | API/Profile | Action | Assertion (hard, not screenshot) | Cost |
|---|---|---|---|---|---|
| P0-1 | Horizontal overflow, any state | 36 / pixel_6 | none | `document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1` across chat, sidebar-open, settings, dialog, workspace hub | S |
| P0-2 | Compact viewport | 36 / `wm size` override or small profile | `shell("wm size WxH")` in `finally` | P0-1 re-run; composer + send button `getBoundingClientRect().right <= innerWidth` | M |
| P0-3 | Font scale 1.3 and 2.0 | 36 + 34 | `settings put system font_scale` + restore | composer controls and dialog `height <= innerHeight`, no clipped text, jump button inside viewport | M |
| P0-4 | IME focus | 36 | `document.getElementById('userInput').focus()` | composer bottom ≤ `visualViewport.height + offsetTop`; send button visible; `visualViewport` height actually shrank | M |
| P0-5 | Landscape + rotation | 34 | `settings put system user_rotation 1` + restore | P0-1 after rotation; sidebar and dialog within viewport; `--seven-visual-height` equals `100dvh` | M |
| P1-1 | Safe-area / insets | 36 | none | `getComputedStyle` resolved insets are non-negative and composer padding ≥ inset; `#seven-app` not under the status bar | S |
| P1-2 | System night mode | 36 | `cmd uimode night yes/no` + restore | app honours system signal **or** demonstrably does not — record which, since `prefers-color-scheme` is absent today | M |
| P1-3 | RTL, device-driven locale | 34 | `adb shell setprop persist.sys.locale ar` requires reboot — infeasible in-run | DOM-level RTL extended to composer, model chip, settings tabs, all three dialogs, workspace hub | M |
| P1-4 | Long chat depth | 36 + 34 | 200+ messages, long code block, long unbroken URL | jump button show/hide across scrollTop extremes; no unbounded layout growth; scroll reaches bottom | S |
| P1-5 | Release-variant parity | 36 | requires `apk/patch-android.cjs` decoupling | P0-1/P0-3 assertions pass on the release variant after shrinking | L |
| P2-1 | Screenshot comparison | 36 + 34 | baseline store + diff step | diff count under a threshold per shot name; today there is no baseline to diff against | L |
| P2-2 | Hardware GPU rendering | — | real device or GPU emulator | not reproducible in current CI (`-gpu swiftshader_indirect`); requires out-of-band device run | L |
| P2-3 | Back gesture with dialog/sidebar | 36 | instrumentation back event | dialog closes, sidebar closes, no WebView history entry left behind | M |

**Total added CI cost if P0 + P1 all land in the existing job:** roughly +25-40 min against a job already capped at `timeout-minutes: 50` and already doing two full emulator boots. **This is the practical constraint:** the job must be split or the budget raised before P1 lands.

---

## 6. Blockers

1. **The Android project is not in the repository.** `package.json` `android:generate` runs `rm -rf android && npx --no-install cap add android`, so `minSdk`/`targetSdk`/`compileSdk`, Capacitor's `variables.gradle`, `AndroidManifest.xml` final state and `MainActivity` final state **cannot be read without executing the generation step**. Therefore the Android 15+ (API 35) edge-to-edge enforcement behaviour that would affect API 36 insets **is unverified from repository evidence** — this is an unknown, not a pass.
2. **`npx --no-install cap` requires a populated `node_modules`**; the generation step cannot be reproduced in a bare checkout without `npm install`.
3. **Job timeout.** `timeout-minutes: 50` covers `node all.cjs`, `lintDebug testDebugUnitTest assembleDebug`, KVM setup, and two emulator boots. There is no headroom for the P1 matrix without splitting the job.
4. **No screenshot baseline exists** anywhere in the repo, and the artifact has `retention-days: 3` — evidence is both uncompared and short-lived. Any "visual regression" claim is therefore currently a human-review activity, not a gate.
5. **Non-deterministic captures.** Earlier screenshots are taken with animations **enabled** (`disable-animations: false`) and rely on `Thread.sleep(80..380)`; only the reduced-motion phase forces animation scales to 0. Frame-timing differences across emulator hosts will make any future pixel diff flaky unless animations are disabled for all captures.
6. **Build variant is coupled to signing identity** (`apk/patch-android.cjs:47`) — release-variant evidence is blocked until that coupling is removed; production signing (`apk/patch-production-signing.cjs`) is intentionally untouched by this recommendation.
7. **RTL device-level testing requires an emulator locale change plus reboot**, which is not feasible inside the current single-runner-step structure; RTL evidence stays DOM-level unless the workflow is restructured.
8. **Ownership:** `.seven-team/ownership.json` shows Team A's active lease covers `release/workspaces/*.css`, `release/workspaces/seven-shell*.js`, `release/workspaces/ui-polish-fixes.js`, `release/workspaces/hub.js`. The instrumentation template `apk/materialize-android-visual-test.cjs` and the workflow are **outside both leases**, so changes to them need a manager decision before implementation.

---

## 7. Recommended first Android gate

**Gate G0 — "Android compact-viewport + font-scale + IME + landscape overflow gate" on API 36, debug variant, no new CI job.**

Rationale: it reuses the existing API 36 runner step (zero new infrastructure, zero Gradle/signing change), and every one of its assertions is a hard DOM assertion that fails the existing `connectedDebugAndroidTest` step rather than producing a screenshot nobody diffs. It covers four of the requested dimensions at once (small viewport, font scale, keyboard, landscape) with the cheapest possible device-configuration toggles, all of which are already expressible through the existing `shell()` helper.

Concrete shape (single new `@Test` in `apk/materialize-android-visual-test.cjs`):
1. `wm size` to a compact width; assert `scrollWidth <= clientWidth + 1` and composer/send button within `innerWidth`.
2. `settings put system font_scale 2.0`; relaunch; assert dialog (`#seven-app > .s-modal .s-dialog`) and composer fit `innerHeight`, then `settings put system font_scale 1.0` in `finally`.
3. Focus `#userInput`; assert `visualViewport.height < window.innerHeight` and composer bottom ≤ `visualViewport.height + visualViewport.offsetTop`.
4. `settings put system user_rotation 1`; assert step 1 again plus `--seven-visual-height` resolves to `100dvh`.

Promotion path: G0 on API 36 → replicate the same test method on API 34 → then P1 (insets, system night, extended RTL, long chat) → then P1-5 release-variant parity once `apk/patch-android.cjs` decouples variant from signing.

WAVE01=COMPLETE
