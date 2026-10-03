# A02 — Android / WebView Validation Matrix for UI Foundation V2 (Wave 01A)

Author: A02 (Codex CLI), Team A
Date: 2026-10-03
Mode: read-only inspection. No production source was modified. My only write is this file.

**Verified sources** (every factual claim below traces to one of these):
`apk/materialize-android-visual-test.cjs`, `.github/workflows/android-apk.yml`, `apk/patch-android.cjs`,
`apk/verify-apk.cjs`, `apk/materialize-native-platform.cjs`, `apk/materialize-android-motion-bridge.cjs`,
`apk/harden-native-platform.cjs`, `capacitor.config.json`, `package.json`, `all.cjs`,
`.github/workflows/seven-tests.yml`, `release/visual-evidence-runtime.cjs`, `seven_ai-final.html` (grep-level only).

**Evidence-strength convention used throughout:**
- **PROVEN** = asserted by executable code that runs in CI (generated instrumentation assertions, or `verify-apk.cjs`).
- **CAPTURED** = a PNG is produced and uploaded, but nothing compares it to a baseline.
- **UNPROVEN** = no code, no workflow step, and no assertion touches it.
- Cost figures are **estimates**, explicitly labelled; they are not measured.

Note on this file: a prior version of this report existed in the workspace. I rewrote it so that every
line is backed by the files I inspected in this run. Claims I could not re-verify from the inspected files
were removed rather than carried forward.

---

## 1. Current Android evidence coverage

### 1.1 What actually exists

`apk/materialize-android-visual-test.cjs` is a **generator**, not a test. It reads `capacitor.config.json`,
derives the Java package from `appId` (`ai.seven.v243`), and writes
`android/app/src/androidTest/java/ai/seven/v243/SevenVisualEvidenceTest.java` from an inline template
(`const source = ...`, then `fs.writeFileSync(path.join(testDir,"SevenVisualEvidenceTest.java"), source)`).
The `android/` tree itself is **ephemeral**: `package.json` `android:generate` runs `rm -rf android` before
`npx --no-install cap add android`. So there is **no committed Android test source** — every change to Android
test coverage is a change to a `.cjs` generator.

`apk/patch-android.cjs` writes a *second* generated test, `SevenSmokeTest.java`, into the same
`androidTest/java/ai/seven/v243/` directory (and deletes Capacitor's template
`.../com/getcapacitor/myapp/ExampleInstrumentedTest.java`). Both tests therefore run in the same
`:app:connectedDebugAndroidTest` invocation in CI.

### 1.2 CI wiring — `.github/workflows/android-apk.yml`

One job `android` on `ubuntu-24.04`, **`timeout-minutes: 50`**. Triggers: push to `main`/`apk-finalization`
on paths `seven_ai-final.html`, `release/**`, `apk/**`, `package.json`, `capacitor.config.json`, and the
workflow itself; plus `workflow_dispatch`.

Step order (verified):

| Step | Command / config |
|---|---|
| Checkout, Node 24, Java 21 (temurin), `npm install --no-audit --no-fund` | toolchain |
| `npx playwright install --with-deps --only-shell chromium` | "Install Chromium for release gate" — consumed by `node all.cjs`, not by any Android-viewport test |
| `node all.cjs` | pre-APK web gate |
| `npm run android:generate` | build:web → `sync-launcher-label-contract` → `prepare-assets` → `rm -rf android` → `cap add/sync android` → `materialize-android-assets` → `patch-android` → `materialize-native-platform` → `materialize-android-motion-bridge` → `harden-native-platform` → `materialize-android-visual-test` |
| `./gradlew --no-daemon lintDebug testDebugUnitTest assembleDebug` (cwd `android`) | **debug variant only** |
| `npm run android:verify` | `apk/verify-apk.cjs` |
| Enable KVM | udev rule + reload, needed by the emulator runner |
| **Android 16 device smoke** | `reactivecircus/android-emulator-runner@v2.38.0`, `api-level: 36`, `arch: x86_64`, `target: default`, `profile: pixel_6`, `disable-animations: false`, `emulator-options: -no-window -gpu swiftshader_indirect -noaudio -no-boot-anim -camera-back none`; `adb shell rm -rf /data/local/tmp/seven-visual`, mkdir, `./gradlew --no-daemon :app:connectedDebugAndroidTest`, pull → `visual-evidence/android16/` |
| **Android 14 device regression** | same runner, `api-level: 34`, same profile/options, **plus `adb shell settings put system font_scale 1.15`**; pull → `visual-evidence/android14/` |
| Upload evidence | `actions/upload-artifact@v7`, name `seven-ui-visual-evidence`, `path: visual-evidence`, `retention-days: 3`, `if-no-files-found: error` |
| `npm run android:verify` again | post-device re-verify |
| Upload APK | `android/app/build/outputs/apk/debug/app-debug.apk`, `if-no-files-found: error`, `retention-days: 14` |

Two material facts follow directly:
1. **No screenshot is ever compared.** `shot()` in the generated test only shells `screencap -p <name>.png`;
   the workflow pulls the directory and uploads it. There is no diff, no golden set, no pixel or
   perceptual comparison anywhere in the repository.
2. **The build matrix is debug-only.** `assembleDebug`, `connectedDebugAndroidTest`, and the uploaded
   `app-debug.apk`. `assembleRelease` never runs in this workflow.

### 1.3 What the generated visual test asserts (PROVEN) vs. captures (CAPTURED)

Single `@Test public void captureReleaseVisualStates()`. Helpers: `js()` (`evaluateJavascript` + 12 s latch),
`waitFor()` (100 × 200 ms poll, fails with "Seven visual state did not become ready"), `shell()`
(`UiAutomation.executeShellCommand`), `restoreScale()` (regex-validated numeric restore), `assertZeroScale()`,
`shot()`, `webView(ActivityScenario)` (`a.getBridge().getWebView()`), `theme()`, `ensureWorkspaces()`,
`workspace()`. `EVIDENCE_ROOT = "/data/local/tmp/seven-visual"`.

**PROVEN — hard assertions:**

| Area | Assertion |
|---|---|
| Startup contract | `SevenPerformance.state.ready` and `SevenTheme`/`SevenRemake`/`SevenShell` globals exist and `#userInput` exists |
| Day tokens | `#seven-app` computed `--s-bg` `.trim() === '#f5f7f5'` |
| Night tokens | `#seven-app` `--s-bg === '#111815'`, `.main` and `.composer` background `rgb(23, 33, 29)`, root color `!== 'rgb(0, 0, 0)'` |
| Model menu | `.seven-shell-model-menu` exists and `!hidden`; dismissed with a synthetic `Escape` `KeyboardEvent` |
| Dialogs | `SevenRemake.modeDialog()`, `depthDialog()`, `searchSettings()` each require `#seven-app > .s-modal .s-dialog`; each followed by `closeDialog()` |
| Settings routing | After `openSettings()`: `temperatureRange`→`s-settings-generation`, `reasoningEffort`→`s-settings-generation`, `pinnedNotes`→`s-settings-context`, `providersSection`→`s-settings-models`, `advancedSection`→`s-settings-data`, `s-theme`→`s-settings-data` |
| Settings viewport containment | `#settingsModal .modal-content`: `scrollWidth <= clientWidth + 1` **and** rect `left>=-2 && right<=innerWidth+2 && top>=-2 && bottom<=innerHeight+2` |
| Workspaces | `ensureWorkspaces()` injects `./workspaces/hub.js` if `window.SevenWorkspaces` is absent and waits for load; `workspace()` asserts `document.documentElement.dataset.sevenWorkspace === kind` for `coding`, `research`, `rpg` |
| RTL (DOM) | `lang='ar-IQ'`, `dir='rtl'` on `<html>` and `<body>`, computed `direction==='rtl'`; closed sidebar `left >= innerWidth-2`; open sidebar `left>=-2 && right<=innerWidth+2` with `.seven-shell-backdrop` present, not hidden, parent `#seven-app` |
| Long chat (RTL) | 18 assistant messages of `رسالة اختبار طويلة رقم N — ` + `('نص '.repeat(24))`; `.seven-shell-jump` exists, has class `show`, `aria-label === 'الانتقال إلى أحدث رسالة'`, parent `#seven-app` |
| Reduced motion (native→JS bridge) | Sets `window_animation_scale`, `transition_animation_scale`, `animator_duration_scale` to `0` via shell, re-reads them with `assertZeroScale` (delta 0.0001), **relaunches the activity**, then asserts `__sevenAndroidMotion.source==='ANDROID_GLOBAL_ANIMATION_SCALES'`, `reducedMotion===true`, `SevenPerformance.state.reducedMotion===true`, `document.documentElement.dataset.sevenReducedMotion==='1'`, `SevenMotion.allow('ambient')===false` |
| Hygiene | Animation scales restored in a `finally` block; `shot()` name must match `[a-z0-9-]+` |

**CAPTURED (screenshot only, never compared):** `chat-day`, `chat-night`, `model-menu-night`,
`mode-dialog-night`, `depth-dialog-night`, `search-dialog-night`, `attachments-night`,
`github-selfdev-night`, `settings-models-night`, `settings-intelligence-night`, `settings-context-night`,
`settings-app-night`, `workspace-picker-night`, `coding`, `research`, `rpg`, `sidebar-rtl-night`,
`long-chat-jump-rtl-night`, `arabic-rtl`, `reduced-motion`.

Two observations that matter for V2:
- **Theme skew.** `theme(webView,"day")` is used exactly once, for `chat-day`. Every dialog, all three
  settings tabs, all four workspaces, the RTL sidebar, the long-chat jump, and `arabic-rtl` are captured
  and asserted **in night**. `reduced-motion` relaunches explicitly back into `night`. Day-mode dialog,
  settings, and workspace surfaces have **zero** coverage.
- **Naming vs. theme.** The three workspace shots are named `coding`/`research`/`rpg` with no theme suffix,
  but they execute while night is active — a future human reviewer filtering by filename would misread them.

**Also PROVEN (host-side, not device):** `apk/verify-apk.cjs` gates the **debug** APK by default
(`android/app/build/outputs/apk/debug/app-debug.apk`, overridable via `SEVEN_APK_PATH` or argv[2]):
size `< 30 MiB`; `unzip -l` must contain `assets/public/index.html`, `vendor/pdfjs/pdf.min.mjs`,
`workspaces/remake.css`, `workspaces/remake.js`, `workspaces/intelligence.js`, `workspaces/research-v2.js`,
`classes*.dex`; unpacked `index.html` must contain `SEVEN_FINAL_RELEASE_LAYER_V1`, `id="seven-app"`,
`data-seven-remake="1"`, the workspace script/css wiring, `Seven 2.4.3 Zero-Key + UI Cleanup`,
`Seven 2.4.2 Zero-Key UX`, `Automatic Providers`, `Zero-Key routing`; must **not** contain
`cdnjs.cloudflare.com/ajax/libs/pdf.js`, `id="apiKeyInput"`, `id="nvidiaApiKeyInput"`,
`id="openrouterApiKeyInput"`, `id="geminiApiKeyInput"`, `id="llm7TokenInput"`, any `type="password"`,
`id="nameModal"`, `id="nameInput"`; bundled `remake.css` must carry `--seven-ui-hardening-v242:1`;
bundled `remake.js` must not contain `s-brave-key`, `Brave API key`, or `Enter API key`. It also asserts
the generated `app/build.gradle` `versionCode`/`versionName` match `package.json` (`2.4.3` / `243`).

### 1.4 Coverage summary

| Dimension | Status | Basis |
|---|---|---|
| Android 14 / API 34 | CAPTURED + partial assertions, single config | workflow step, `font_scale 1.15` |
| Android 16 / API 36 | CAPTURED + partial assertions, single config | workflow step |
| Small / compact viewport | **UNPROVEN** | only `profile: pixel_6`; no `wm size`, no `wm density`, no second profile |
| Font scale | CAPTURED at exactly `1.15` on API 34 only; **UNPROVEN** at any other value incl. API 36 | `settings put system font_scale 1.15` |
| Landscape / rotation | **UNPROVEN** | no `user_rotation`, no `wm size`, no `screenOrientation`, no rotation in the test; `apk/patch-android.cjs` manifest rewrite touches only `allowBackup`, `usesCleartextTraffic`, `windowSoftInputMode`, `configChanges` |
| Keyboard / IME | **UNPROVEN** | `windowSoftInputMode="adjustResize"` is declared; nothing focuses `#userInput` and re-measures |
| Safe-area insets | **UNPROVEN** | `safe-area-inset` occurs 9× in `seven_ai-final.html`, but no assertion reads a resolved inset; `materialize-native-platform.cjs` grep for `WindowInsets`/`setDecorFitsSystemWindows`/`safe-area`/`ime`/`statusBar`/`navigationBar`/`uiMode`/`ColorMode`/`landscape`/`font_scale` returns **no matches** |
| Day / night | Day: 1 screenshot. Night: everything else. **System** day/night: **UNPROVEN** | `SevenTheme.setPreference()` is a JS preference; no `cmd uimode` anywhere |
| Arabic RTL | PROVEN at DOM level (night, portrait, one device width) | the `dir`/`lang`/sidebar/jump assertions above |
| Long chat | PROVEN only in RTL + night, synthetic `addMessage` payloads, 18 messages | the `.seven-shell-jump` assertion |
| Settings / dialogs | PROVEN at night; routing + one containment assertion | `openSettings()` / `closeSettings()` / `SevenRemake.*Dialog()` |
| Baseline comparison | **UNPROVEN** — none exists | no diff step in the workflow |
| Build variant | debug only | `assembleDebug` / `connectedDebugAndroidTest` / `app-debug.apk` |

---

## 2. Exact gaps per required dimension

### 2.1 Android 14 / API 34 — gaps
- **G-34-1** Exactly one emulator config. No compact-width device, no tablet/foldable, no low-RAM path,
  no alternate WebView provider. `arch: x86_64` on both steps means no ARM WebView rendering path.
- **G-34-2** The `font_scale 1.15` write is applied but **nothing asserts that WebView honoured it.**
  There is no check of `document.documentElement` text size, no measurement of composer/textarea height
  before vs. after, and no clipping assertion. If the setting did not propagate, the run would still be green.
- **G-34-3** Nothing in the test is API-aware. Both steps execute the *same* generated test, so an
  API-34-only regression is only detectable by a human comparing two un-diffed PNG sets.
- **G-34-4** The API-34 job has no timing budget of its own; the shared `timeout-minutes: 50` covers
  two emulator boots plus a full web build and two Gradle invocations.

### 2.2 Android 16 / API 36 — gaps
- **G-36-1** API 36 runs at **default font scale**, i.e. `1.0`. There is therefore *no* large-font
  evidence on the newest target at all.
- **G-36-2** No API-36-specific behavioural assertion (window-inset handling, predictive-back,
  edge-to-edge window behaviour) exists in any generated test.
- **G-36-3** No `SevenSmokeTest` / `SevenVisualEvidenceTest` distinction in reporting: both tests run under
  one Gradle task, so a failure in the SAF/`SevenSecureStore` test (from `apk/patch-android.cjs`) is
  indistinguishable in the workflow log from a visual-regression failure.

### 2.3 Small viewport — gaps
- **G-SM-1** No viewport narrower than the pinned `pixel_6` profile. Nothing asserts
  `documentElement.scrollWidth <= documentElement.clientWidth + 1` at a compact width, which is the single
  cheapest horizontal-overflow detector and is already the pattern used for `#settingsModal .modal-content`.
- **G-SM-2** No assertion that the composer, send button, model chip, or sidebar trigger remain reachable
  when width collapses. The only width-sensitive assertions in the whole suite are the settings-modal
  containment check and the RTL sidebar bounds — both at one width.
- **G-SM-3** `seven_ai-final.html`'s viewport meta is exactly
  `<meta name="viewport" content="width=device-width, initial-scale=1.0">` — **no `viewport-fit=cover`,
  no `maximum-scale`**. Any `env(safe-area-inset-*)` usage therefore has to be treated as
  "unproven whether it ever resolves non-zero on Android", not as an assumed working mechanism.
- **G-SM-4** Density is unparameterized: no `wm density` override, so no high-density/low-density render.

### 2.4 Font scale — gaps
- **G-FS-1** One value (`1.15`). No `1.3`, `1.5`, or `2.0` — all inside Android's accessibility range and
  all inside the range where a fixed-height composer or dialog will clip.
- **G-FS-2** No assertion of survival at large fonts for the composer, the three dialogs, the settings
  tabs, or the `.seven-shell-jump` button; these are screenshot-only even at 1.15.
- **G-FS-3** `apk/patch-android.cjs` appends only `|density` to the activity's `android:configChanges`
  (`a.replace(/android:configChanges="([^"]*)"/, ...)`). A system font-scale change is a *different*
  configuration change, so the activity is expected to be recreated. There is **no** test that changes
  font scale with in-app state live (open dialog, unsent draft in `#userInput`, scrolled chat) and
  verifies the state survives recreation.

### 2.5 Landscape — gaps
- **G-LS-1** Zero rotation coverage. The only evidence is `apk/patch-android.cjs` setting
  `windowSoftInputMode="adjustResize"` and appending `|density`; it does not set `screenOrientation`
  or add any layout-land/port qualifiers, and the manifest is otherwise left at Capacitor defaults.
- **G-LS-2** No post-rotation assertion for any surface: chat list, sidebar, workspace hub, model menu,
  attachments menu, GitHub self-dev panel, settings modal, or the three dialogs.
- **G-LS-3** No rotated evidence for the settings-modal containment assertion, even though that assertion
  is written in viewport-relative terms (`innerWidth`/`innerHeight`) and would be the natural landscape probe.

### 2.6 Keyboard / safe-area — gaps
- **G-KB-1** `adjustResize` is declared and never exercised. Nothing focuses `#userInput`, waits for the
  IME, and re-checks composer visibility or `visualViewport.height`.
- **G-KB-2** No native inset plumbing exists in the generation scripts. Grepping
  `apk/materialize-native-platform.cjs` for `WindowInsets`, `setDecorFitsSystemWindows`, `fitsSystemWindows`,
  `statusBar`, `navigationBar`, `ColorMode`, `uiMode` returns no matches; `apk/harden-native-platform.cjs`
  touches only SAF permission constants. `MainActivity` is rewritten only to add
  `registerPlugin(SevenPlatformPlugin.class)` inside `onCreate` before `super.onCreate(...)`.
  Consequence: **inset propagation into the WebView is structurally unmodelled** — it must be measured,
  not assumed in either direction.
- **G-KB-3** Because insets are unmodelled, the correct assertion is *no occlusion of interactive targets*
  (composer, jump button, dialog close), **not** "insets are non-zero". A gate written as "insets > 0"
  would be wrong on a non-edge-to-edge window and would be a false failure.
- **G-KB-4** Hardware/gesture back with a dialog open or sidebar open is untested — no `OnBackPressed`
  dispatch, no history assertion.

### 2.7 Day / night — gaps
- **G-DN-1** Theme is an app preference (`SevenTheme.setPreference`), not a system signal. No
  `adb shell cmd uimode night yes|no` exists in the workflow or the test.
- **G-DN-2** Day coverage is one screenshot (`chat-day`) plus its token assertion. Day dialogs, day
  settings tabs, day workspaces, and day RTL have none.
- **G-DN-3** No native dark resources or theme plumbing is generated, so status bar / splash / launcher
  behaviour under system night mode is unproven (and is out of scope for `materialize-*` scripts as written).

### 2.8 Arabic RTL — gaps
- **G-RTL-1** RTL is proven only at one device width, portrait, night, on the generated test's own DOM
  manipulation (`document.documentElement.dir='rtl'` applied by the test itself, not by a persisted
  user setting or `android:configChanges` locale change).
- **G-RTL-2** RTL is never combined with: day theme, large font scale, landscape, small viewport, or IME.
- **G-RTL-3** RTL proof covers sidebar bounds, backdrop parentage, and the jump button's Arabic
  `aria-label`. It does **not** cover the settings modal, any dialog, the model menu, the attachments menu,
  the workspace picker, or code/markdown blocks in RTL.

### 2.9 Long chat — gaps
- **G-LC-1** Long chat is exercised **only** as 18 Arabic assistant messages appended via `addMessage`,
  in RTL + night, with no user turns, no code blocks, no markdown tables, no long unbroken URLs, and no
  streaming/partial-render state.
- **G-LC-2** The `.seven-shell-jump` assertion is RTL-only. There is **no LTR long-chat assertion**, so
  the jump affordance is unproven in the default direction.
- **G-LC-3** `chat.scrollTop=0` is set before asserting `.show`; the `arabic-rtl` shot then scrolls to the
  bottom. No assertion covers scroll position after rotation, font-scale change, or dialog close.

### 2.10 Settings / dialogs — gaps
- **G-SD-1** Night-only. The settings routing assertion and the `.modal-content` containment assertion are
  strong, but both run at one width, portrait, one font scale.
- **G-SD-2** Dialogs are asserted to *exist* (`#seven-app > .s-modal .s-dialog`) and to close. Nothing
  asserts scrollability or non-occlusion of dialog content at large font scale or landscape — precisely
  where a modal taller than the viewport fails silently.
- **G-SD-3** No focus-trap / Escape-contract assertion for dialogs. Escape is only exercised against the
  model menu via a synthetic `KeyboardEvent`.

---

## 3. Release-vs-debug build implications (signing deliberately kept separate)

**Signing is out of scope here by instruction.** Recording only what the files state, so the boundary is clear:
`apk/patch-android.cjs` injects a `sevenCi*` signing block **only when** `project.findProperty("sevenCiKeystore")`
is non-null, sets `testBuildType = "release"` in that case, and comments that instrumentation "will correctly
reject a test APK whose certificate differs from the installed release target". The workflow's
`npm run android:generate` passes **no** `-P` flags, so today the whole chain runs on Capacitor defaults and
the uploaded APK is the debug-signed `app-debug.apk`. No signing change is proposed by this report.

Non-signing implications of moving to a release variant:

- **R-1 — `assembleRelease` has never run in CI.** `lintDebug testDebugUnitTest assembleDebug` is the entire
  Gradle line. Any release-only path (resource shrinking, R8/minification, per-variant asset packaging) is
  **UNPROVEN**.
- **R-2 — `apk/verify-apk.cjs` is debug-shaped but parameterised.** It defaults to
  `android/app/build/outputs/apk/debug/app-debug.apk` yet honours `SEVEN_APK_PATH` / `argv[2]`. Pointing it at
  `app-release-unsigned.apk` or a CI-signed release APK is a one-env-var change with **no code change** —
  this is the cheapest release-side coverage available and should be adopted first.
- **R-3 — shrinking can change the UI contract the APK gate asserts.** `verify-apk.cjs` checks the presence of
  `workspaces/*.js|css` inside the APK and inside `index.html`. If a release build shrinks or strips web assets,
  these assertions are the tripwire. They have never run against a shrunk artifact.
- **R-4 — WebView debugging.** `capacitor.config.json` sets `android.webContentsDebuggingEnabled: false`. The
  visual test drives the WebView through `a.getBridge().getWebView()` + `evaluateJavascript`, which is
  independent of DevTools, so the same test is expected to work against a release variant — but that is an
  expectation, not evidence.
- **R-5 — variant + test-variant pairing.** `connectedDebugAndroidTest` is the only wired task. A release
  instrumented run needs either `connectedReleaseAndroidTest` or the `testBuildType` mechanism described in
  `apk/patch-android.cjs`. Either way this is a workflow change, not a test change.
- **R-6 — the pre-APK web gate is variant-agnostic.** `node all.cjs` runs on host Node and never sees the
  APK, so a release-only regression would be invisible to it.

---

## 4. Files that would change (exact list)

| File | Change needed | Why |
|---|---|---|
| `apk/materialize-android-visual-test.cjs` | **Primary.** Add a second `@Test` (e.g. `captureResponsiveMatrix()`) parameterised over device state, plus a `wmSize`/`rotate`/`fontScale` shell helper and a baseline-comparison assertion. Extend the existing RTL/long-chat assertions to LTR and day. Add a dialog/settings "fits viewport" assertion mirroring the existing `.modal-content` check. | The generated Java is the only device-level test surface; the generator is the only committed source for it. |
| `.github/workflows/android-apk.yml` | Add `adb shell wm size` / `wm density` / `settings put system accelerometer_rotation 0` + `user_rotation` / `settings put system font_scale` preconditions per step; add `assembleRelease`; add a golden-diff step; add `SEVEN_APK_PATH` invocation of `android:verify`; consider splitting the two emulator runs into separate jobs given `timeout-minutes: 50`. | All device preconditioning and all variant changes live here. |
| `apk/verify-apk.cjs` | Add assertions that only make sense for a release artifact (e.g. no debug-only markers) — optional; the `SEVEN_APK_PATH` hook already exists. | Release APK coverage. |
| `apk/patch-android.cjs` | Only if a release instrumented task is added, or if the manifest needs an orientation/config change. Also the home of the generated `SevenSmokeTest.java`. | Variant/test-variant wiring. |
| `all.cjs` + `release/visual-evidence-runtime.cjs` | Optional host-side viewport/font-scale matrix. `release/visual-evidence-runtime.cjs` already models `viewport`, `density`, `fontScale`, `locale`, `direction`, `theme`, `reducedMotion`, `expectedSelectors`, `criticalSelectors` as scenario fields — it is the natural place to declare V2 device-equivalent scenarios that run without an emulator. Note this is a **descriptor model**; whether it performs real viewport emulation is not established by the inspected lines. | Cheap pre-APK regression net for responsive breakage. |
| `package.json` | Only if new npm scripts are added (e.g. an `android:evidence` gate). | Script wiring. |
| `.github/workflows/seven-tests.yml` | Only if the host-side matrix lands in `all.cjs`. | It currently runs `node all.cjs` only. |
| `android/app/src/androidTest/**` | **Never edited directly** — the directory is deleted by `rm -rf android` on every `android:generate`. | Must be regenerated. |

No change is proposed to `apk/materialize-native-platform.cjs`, `apk/materialize-android-motion-bridge.cjs`,
`apk/harden-native-platform.cjs`, `apk/materialize-android-assets.cjs`, or any signing logic.

---

## 5. Prioritised validation matrix

Cost is an **estimate** in relative terms, anchored to observed CI structure: one extra emulator step of the
existing shape (boot → one `:app:connectedDebugAndroidTest` → pull) is the unit of cost, and the job already
carries `timeout-minutes: 50`. "Est." values are engineering estimates, not measurements.

### P0 — required before UI Foundation V2 can be called Android-safe

| # | Matrix cell | How it is produced | Est. cost | Gate type |
|---|---|---|---|---|
| P0-1 | **Baseline comparison of the existing 20 shots.** Give each `shot()` a deterministic name and add a host-side diff step (e.g. ImageMagick `compare -metric AE` / `ssim`) against a committed `visual-baseline/` set, per API level, with an explicit allowlist workflow for intentional deltas. Without this, P1–P4 produce more unreviewed PNGs. | `.github/workflows/android-apk.yml` + new baseline dir | S (≈0.5 dev-day; ≈2 CI min extra) | CI-blocking, with human-approve escape hatch |
| P0-2 | **Small viewport, portrait, API 36.** `adb shell wm size 720x1280` + `wm density 320` before launch; assert `documentElement.scrollWidth <= clientWidth + 1` for `#seven-app`; assert composer/send/model-chip rects within `innerWidth`; assert `#settingsModal .modal-content` containment (reuse the existing assertion verbatim). | `apk/materialize-android-visual-test.cjs` + workflow | M (≈1 dev-day) | CI-blocking |
| P0-3 | **Font scale 1.5 and 2.0, API 36 and API 34.** Set `font_scale`, relaunch, assert composer height and `#userInput` visibility, assert dialog `.s-dialog` rects fit `innerHeight` (or are explicitly scrollable), assert `.seven-shell-jump` is reachable. | same two files | M (≈1 dev-day; ≈4 extra CI min) | CI-blocking |
| P0-4 | **Landscape, API 36 and API 34.** `accelerometer_rotation 0` + `user_rotation 1` (and `wm size 1280x720` where rotation is not honoured); re-run the settings containment assertion and add it for the three dialogs, model menu, workspace picker, and sidebar in RTL. | same two files | M (≈1 dev-day) | CI-blocking |

### P1 — required before release sign-off, not before merge

| # | Matrix cell | Notes | Est. cost |
|---|---|---|---|
| P1-1 | **Day-theme parity.** Re-run the dialogs, settings tabs, workspace picker, and sidebar assertions under `SevenTheme.setPreference('day')` with the **same** token-assertion shape as the existing night block. | Generator only | S–M (≈0.5 day) |
| P1-2 | **Arabic RTL × {large font, landscape, compact width}.** Extend the existing RTL block into a matrix instead of a single sequence; assert settings modal and at least one dialog in RTL (currently unproven). | Generator only | M (≈1 day) |
| P1-3 | **LTR long chat.** Same 18-message synthetic load in `dir='ltr'`, asserting `.seven-shell-jump` presence/class. Add one code-block message to catch horizontal overflow inside messages. | Generator only | S (≈0.25 day) |
| P1-4 | **Release-variant APK.** Add `assembleRelease`; run `SEVEN_APK_PATH=<release apk> npm run android:verify`. Zero new assertions needed for the first pass — this only proves the existing gate survives a shrunk artifact. | Workflow only | S (≈0.5 day + CI time) |
| P1-5 | **System day/night.** `adb shell cmd uimode night yes|no` before launch, asserting the app honours the system signal **or** explicitly asserting it does not (whichever is the intended V2 contract). Requires the product contract to be decided first. | Workflow + generator | S (≈0.5 day) + decision |

### P2 — valuable, deferrable

| # | Matrix cell | Notes | Est. cost |
|---|---|---|---|
| P2-1 | **Keyboard / IME.** Focus `#userInput`, wait for `visualViewport.height` to shrink, assert composer stays visible and no dialog action is occluded. **See blockers — emulator evidence here is unreliable.** | Requires a physical device run or a hardened IME harness | L (≈2 days, plus a device) |
| P2-2 | **Safe-area inset measurement.** Read resolved `env(safe-area-inset-*)` on both APIs and assert *no occlusion of interactive targets*, not non-zero insets (see §2.6 G-KB-3). | Emulator cutout profile needed | M (≈1 day) |
| P2-3 | **Back behaviour.** Dispatch back with a dialog open and with the sidebar open; assert dismissal contract. | Generator only | S (≈0.25 day) |
| P2-4 | **ARM / real-device spot check.** Both emulator steps are `x86_64` with `-gpu swiftshader_indirect`; no GPU-composited or ARM WebView rendering is proven. | Manual / self-hosted runner | M (device access) |
| P2-5 | **Tablet / foldable.** One non-`pixel_6` profile. | Workflow | S |

---

## 6. Blockers

1. **No golden baseline exists anywhere.** Screenshots are produced, pulled, and uploaded with
   `retention-days: 3`, and nothing diffs them. Every visual claim in §1 is therefore
   human-review-only, and any new matrix cell added without P0-1 multiplies unreviewed images rather than
   adding signal. This is the single highest-leverage blocker.
2. **CI time budget.** The job is `timeout-minutes: 50` and already contains a full web build
   (`node all.cjs` + `npm run android:generate`), two Gradle invocations, and two full emulator boots.
   P0-2 through P0-4 as written would add matrix dimensions inside those existing boots (cheap) or as new
   steps (expensive). Splitting the two API levels into separate jobs is the safe shape but doubles
   build time — a workflow-architecture decision, not a test change.
3. **No `android/` in version control.** `rm -rf android` on every generate means baseline APKs, test
   sources, and any Gradle tuning are entirely reproducible-from-script or lost.
4. **IME evidence on a `-no-window -gpu swiftshader_indirect` emulator is not trustworthy.** P2-1 should be
   treated as requiring a physical device or a deliberately instrumented IME; do not gate merge on it.
5. **System dark-mode contract is undecided.** `SevenTheme` is an app preference; whether V2 must follow
   `cmd uimode` is a product decision, so P1-5 cannot be written until it is made.
6. **No native inset model exists** (`materialize-native-platform.cjs` contains no `WindowInsets` /
   `setDecorFitsSystemWindows` / `ColorMode` code). Safe-area gaps must therefore be closed by
   **measurement**, and a change to the activity may be required before a gate can be written at all.
7. **Release variant is entirely unexercised**, so R-1..R-3 are hypotheses until `assembleRelease` runs once.
8. **Test/report separation.** `SevenSmokeTest` (SAF + `SevenSecureStore`) and `SevenVisualEvidenceTest` run
   under one Gradle task; failures are hard to attribute in logs.

---

## 7. Recommended first Android gate

**Extend the existing API 36 emulator step in `.github/workflows/android-apk.yml` with device-state
preconditions, and add exactly one new generated test method — `captureResponsiveMatrix()` — in
`apk/materialize-android-visual-test.cjs`.** Concretely:

1. In the API 36 step, set `wm size 720x1280`, `wm density 320`, `accelerometer_rotation 0`,
   `user_rotation 1`, and `font_scale 1.5` before `:app:connectedDebugAndroidTest`, and restore nothing
   (fresh emulator per step).
2. In the generator, add `captureResponsiveMatrix()` that relaunches at each device state and asserts the
   **three assertions that already have precedent in the suite** — document-level
   `scrollWidth <= clientWidth + 1` (the same pattern the suite already uses on `.modal-content`),
   interactive-target rect containment in `innerWidth`/`innerHeight`, and dialog rect containment —
   then calls the existing `shot()` so the human-review path keeps working.
3. Add the baseline-diff step (P0-1) for this one subset in the same change, so the new gate produces a
   **verdict**, not just more images.

Why this first: API 36 is already booted and green, needs no new infrastructure, exercises the newest
WebView, and — unlike API 34 — currently runs at **default font scale**, so it has the largest uncovered
surface. It also converts three declared-but-unproven settings (`adjustResize`, safe-area usage, viewport
meta without `viewport-fit=cover`) into measurements. API 34 should follow as the second gate once the
cell shape is proven, and it should carry the `font_scale 1.15` legacy value plus the new cells so the
existing 20 shots keep a meaning.

Explicitly **not** recommended as a first gate: any release-variant work (R-1..R-4 — needs a decision about
the job's time budget first) and anything keyboard/IME related (blocker #4).

WAVE01=COMPLETE
