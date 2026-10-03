# A08 — Product-Level UI Evaluation Harness (Seven Production Wave 01A)

Team A / mini-SWE-agent. **Scope:** design only. No production source was modified.
Gate authority: `.seven-team/cohesion/EVALUATION_GATE.md` (Gates A/B/C/D + golden-screen list).
Evidence base: repository inspection at `work/seven-ai-true/seven-ai-true` (commit of 2024-10-03 tree), 8 read-only passes.

---

## 0. TL;DR

The repository already contains **most of the machine-readable skeleton** of the required harness, and almost none of the **product-level evidence wiring**:

* A strong Playwright product suite already exists: `release/release-verify.cjs` (23 named checks, RTL/theme/viewport/font-scale aware).
* A complete deterministic **visual-evidence kernel** already exists: `release/visual-evidence-runtime.cjs` (+ `-passb`, `-final`) with scenario/artifact/audit/evidence/baseline/approval/compare/manifest primitives — **but it is dead code in CI** (only `release/logo-tournament-passb.cjs` requires it; it is not in `all.cjs` and not in any workflow).
* An Android WebView visual-evidence generator already exists: `apk/materialize-android-visual-test.cjs` (one `@Test`, `screencap` into `/data/local/tmp/seven-visual`), pulled as artifacts by `.github/workflows/android-apk.yml` at API 36 and API 34 (`font_scale 1.15`).
* **Zero screenshot capture exists in the web harness.** `grep screenshot` matches only `apk/*.cjs`. There is no `playwright.config.*`, no `test/`, `e2e/`, `__tests__/`, no jest/vitest, and no committed golden baselines.

Therefore the harness is not a green-field build: it is a **wiring + coverage-completion** job on top of `release-verify.cjs` and the visual-evidence kernel.

---

## 1. Existing test infrastructure — exact inventory

### 1.1 Entry point

`package.json` → `"test": "node all.cjs"`.
`all.cjs` spawns (stdio inherited, **`timeout:120000` per file**, non-zero exit aborts) in this order:

| # | Suite | Kind |
|---|---|---|
| 1 | `eval/harness.cjs` | product eval |
| 2 | `eval/search-v2-eval.cjs` | search eval |
| 3 | `memory.cjs` | memory |
| 4 | `runtime-smoke.cjs` | smoke |
| 5 | `verify.cjs` | **Playwright** (persistence/model-routing) |
| 6 | `cloudflare/search-gateway/search-gateway.test.mjs` | node:test |
| 7 | `release/embedded-credentials.test.cjs` | static |
| 8 | `release/contrast.test.cjs` | static |
| 9 | `release/static-audit.cjs` | static audit |
| 10 | `release/canon-simulator.test.cjs` | unit |
| 11 | `release/world-runtime.test.cjs` | unit |
| 12 | `release/research-runtime.test.cjs` | unit |
| 13 | `release/release-verify.cjs` | **Playwright (the UI gate)** |
| 14+ | `evolution/*.test.cjs` (auto-discovered, sorted) | unit |

CI: `.github/workflows/seven-tests.yml` → node 24, `npm install --no-save playwright pdfjs-dist@4.10.38`, `npx playwright install --with-deps --only-shell chromium`, `node all.cjs`, then uploads `dist/seven_ai-release.html`, `dist/release-manifest.json`, `dist/static-audit.json`, `dist/vendor/**`, `release/release-results.json` (`if-no-files-found: error`).

### 1.2 `release/release-verify.cjs` — the reusable product-level UI suite (reuse verbatim)

Builds the real release via `build-release.cjs` → `zero-room-transform.cjs` → `frontier-model-patch.cjs`, serves `dist/` from an in-process `http` server (no network), launches `chromium`, seeds `localStorage` (`user_name_asked=1`, `user_name`), and runs **23 named checks**:

1. `release boots`
2. `modern night theme and RTL sidebar are functional`
3. `zero-key settings expose no manual credential controls`
4. `settings tabs map every control to the correct modern section`
5. `Arabic settings localization is complete and RTL-safe`
6. `search settings require no manual API key`
7. `legacy Brave search preference migrates to zero-key Auto`
8. `responsive UI matrix stays bounded on phone widths themes and directions` — **4 widths (320×800, 360×800, 390×844, 412×915) × 2 dir × 2 theme**
9. `landscape large-text and keyboard-height surfaces stay usable` — `[800,360]`, `[390,430]`, `documentElement.style.fontSize='150%'`
10. `fresh install stays zero-room with no legacy name modal`
11. `expanded settings sections remain bounded on smallest phone`
12. `long messages code and URLs cannot widen the mobile viewport`
13. `all specialist workspaces remain viewport-safe on mobile RTL night`
14. `Arabic workspace picker and specialist surfaces are fully localized`
15. `mode and depth dialogs stay usable on smallest RTL night phone`
16. `modern dialogs inherit Seven theme and isolate background interaction`
17. `modern model and workspace menus stay inside viewport`
18. `GitHub Self Dev panel inherits theme localizes and isolates background`
19. `Arabic sidebar room search model picker and final nav are localized`
20. `settings expose no manual credential entry points`
21. `long-chat jump control is themed localized and rooted correctly`
22. `attachment menu is localized themed and bounded on mobile`
23. `workspace assets are lazy and loadable`

Reusable primitives already present (extract, do not reinvent):
* **Static/HTTP preconditions:** release markers, `id="seven-app"` + `data-seven-remake="1"`, asset wiring, `sendMessageLocked` guard, zero-key provider UX, absence of `id="nameModal"`/`id="nameInput"`/all `*ApiKey*`/`*Token*` fields, **no `type="password"` anywhere**, `--seven-ui-hardening-v242` present, `releaseLayerBytes < 100000`, lazy PDF/attachment/workspace modes.
* **Runtime globals asserted:** `SevenRuntime, SevenControl, SevenBridge, SevenExecution, SevenBetaUI, SevenRemake, SevenIntelligence`, `document.documentElement.dataset.sevenControl === 'v4.3'`.
* **Theme contract:** `SevenTheme.setPreference('day'|'night')` → `data-seven-theme`; `--s-bg` `#f5f7f5` (day) / `#111815` (night); `.main`/`.composer` = `rgb(23, 33, 29)`.
* **Overflow predicate (the canonical one):** `document.documentElement.scrollWidth <= innerWidth + 2`; region checks `r.left>=-2 && r.right<=innerWidth+2 && r.bottom<=innerHeight+2`; inner overflow `el.scrollWidth <= el.clientWidth + 1`.
* **Localization predicate style:** exact-string pins (e.g. attachment `الصور`, `الملفات`, aria `إرفاق صور أو ملفات`, pseudo `أفلت الملفات`) and regex fallbacks (`/never need to paste an API key|لن تحتاج إلى لصق مفتاح API/i`).
* **Lazy-load contract:** no `/workspaces/*` specialist request before intent; `workspaces/hub.js` loads after `SevenRemake.openWorkspace('coding')`.

### 1.3 `verify.cjs` — Playwright, non-visual (reuse for Gate A persistence + routing)

Same harness shape (`chromium`, `async function test(name,fn)`). Named tests include:
`initial IDB migration and UI boot` (**asserts `errors` is `[]` — the only uncaught-error collector in the repo**), `room commit/reload and untouched legacy keys`, `queued snapshots maintain order`, `stale tab fails rather than overwrite`, `atomic memory create update delete and history`, `failed memory write leaves state and ledger unchanged`, `memory metadata never grants action permission`, `corrupt bundle cannot be overwritten`, `legacy room migration preserves ID title text and original`, `room audit and state commit revisions agree`, `free-only model catalog and credential-free backup`, `awesome free api pack is zero-key by default`, `model intelligence v3 …` (7 checks), `model picker v3 …`, `provider health v2 …` (6+ checks incl. `cancellation does not damage route health`).
Backing store contract: IndexedDB `seven_ai_canonical_v1` with `state`/`audit` stores; legacy key `chat_rooms_v6`.

### 1.4 `release/visual-evidence-runtime.cjs` (+ `-passb`, `-final`) — **the missing wiring**

Deterministic, hash-chained evidence kernel, already complete and exported:
`VERSION, VERDICT{PASS,WARN,FAIL,INCONCLUSIVE}, EVIDENCE_TIER{SIMULATED,HOST,EMULATOR,PHYSICAL_DEVICE,REPRESENTATIVE_DEVICE,RELEASE_BUILD_DEVICE}, hash, createScenario, verifyScenario, createArtifact, verifyArtifact, auditViewport, auditTouchTargets, auditAccessibility, contrastRatio, auditContrast, auditState, verdict, createEvidence, verifyEvidence, createBaselineRegistry, verifyRegistry, approveBaseline, compareBaseline, createManifest, verifyManifest`.

Key contracts to design around:
* `createScenario` validates viewport `>= 240×320`, `direction ∈ {ltr,rtl}`, `theme ∈ {day,night,system}`, and **hashes the scenario body** (`scenarioHash`) including `expectedSelectors`/`criticalSelectors`.
* `auditViewport({scrollWidth,clientWidth,scrollHeight,clientHeight})` → `FAIL` with `horizontal-overflow:<px>` when `overflow > 2` — matches `release-verify`'s `+2` tolerance exactly.
* `auditTouchTargets(targets,{preferredMin:44,hardMin:24})` → `FAIL` below 24px, `WARN` below 44px; skips `visible===false`/`disabled===true`.
* `auditAccessibility(targets)` → `FAIL` on `missing-accessible-name` / `not-focusable`.
* `auditContrast(samples,{min})`, `auditState(scenario,{presentSelectors,direction,reducedMotion})` → `critical-selector-missing`, `direction-mismatch`, `reduced-motion-mismatch`.
* `verdict()`: any FAIL ⇒ FAIL; any WARN/INCONCLUSIVE ⇒ WARN; else PASS; empty ⇒ INCONCLUSIVE.
* `approveBaseline` **throws** if `evidence.status === FAIL`; requires `reviewer`, `reason`, `approvalRef` (this is the machine form of Gate D's independent-reviewer rule).
* `compareBaseline` → `NO_BASELINE | SCENENE_CHANGED (scenarioHash differs) | MATCH | CHANGED`, with `reviewRequired` flags.
* `createManifest` re-verifies every scenario/artifact/evidence and emits `summary{count,pass,warn,fail,inconclusive}`; `mode: OBSERVE` by default.

**Consumers:** only `release/logo-tournament-passb.cjs`. Not in `all.cjs`, not in any workflow → the harness must adopt it.

### 1.5 Android visual infrastructure (reuse)

* `apk/materialize-android-visual-test.cjs` writes `android/app/src/androidTest/java/<appId>/SevenVisualEvidenceTest.java` from a template string. Harness helpers: `js()` (`evaluateJavascript`, 12s latch), `waitFor()` (100 × 200ms), `shell()`, `restoreScale()`, **`assertZeroScale(key)`** for `window_animation_scale`/`transition_animation_scale`/`animator_duration_scale`, `shot(name)` → `screencap -p /data/local/tmp/seven-visual/<name>.png` with **`assertTrue(name.matches("[a-z0-9-]+"))`** (kebab-case-only names), `theme()`, `ensureWorkspaces()`, `workspace(kind)`.
  Single `@Test captureReleaseVisualStates()` asserting: performance/theme/remake/shell/input ready, `--s-bg` day `#f5f7f5` + `shot("chat-day")`, night `rgb(23,33,29)` + non-black text, settings tab→panel mapping, `#settingsModal .modal-content` bounded & non-overflowing, RTL sidebar closed off-screen (`r.left>=innerWidth-2`), open sidebar in-viewport with non-hidden `.seven-shell-backdrop` whose `parentElement.id === 'seven-app'`.
* `apk/capture-android-release-profile.cjs`, `capture-android-themed-launcher-ui.cjs`, `capture-android-legacy-launcher-ui.cjs`, `capture-android-splash-burst.cjs`, `capture-android-system-visuals.cjs`, `prepare-pixel-launcher-home.cjs` — broader launcher/splash/system capture set.
* `.github/workflows/android-apk.yml`: `node all.cjs` → `android:generate` → `lintDebug testDebugUnitTest assembleDebug` → `android:verify` → KVM → **Android 16 emulator (`api-level 36`, `pixel_6`) `:app:connectedDebugAndroidTest`**, pull to `visual-evidence/android16` → **Android 14 (`api-level 34`) with `adb shell settings put system font_scale 1.15`**, pull to `visual-evidence/android14` → upload `seven-ui-visual-evidence` (`if-no-files-found: error`) → re-verify APK.
* `npm run android:generate` is where `materialize-android-visual-test.cjs` is invoked — the Android test is regenerated from the template on every generate, so template changes are the sanctioned edit point (a generator file, not production app source).

### 1.6 Structural facts measured in source (recorded as found)

Counted in `seven_ai-final.html` (source, 842 KB): `<dialog` = **0**, `class="s-modal"` = **0**, `s-dialog` = **0**, `seven-shell-backdrop` = **0**, `id="settingsModal"` = **1**, `class="modal-content"` = **1**.
`grep -o 'data-seven-nav[^ >]*'` and `class="…seven-nav…"` → **no matches in source**.
Interpretation (flagged for confirmation during implementation): the legacy settings overlay is inline in source, while the modern overlay system (`.s-modal` / `.s-dialog` / `.seven-shell-backdrop` / `.seven-workspace-root` / `.seven-ws-picker` / `.seven-rpg-chatbar`) and the primary nav are injected by the remake layer at build time (from `release/remake-source/` and `release/workspaces/`). **Consequence: every census and layout assertion must run against the built `dist/` artifact, never against `seven_ai-final.html`.**

### 1.7 Files that do NOT exist (recorded, per instruction)

`playwright.config.{ts,js}` — absent. `test/`, `tests/`, `e2e/`, `__tests__/` — absent. `jest.config*`, `vitest.config*` — absent. `*.e2e.*` — absent. Committed golden screenshots / baseline registry JSON — absent. `.seven-team/reports/wave-01/` — empty before this report.

---

## 2. Reuse map: gate requirement → existing coverage

| Gate requirement | Existing coverage (reuse, do not rewrite) | Verdict |
|---|---|---|
| A: no uncaught runtime errors | `verify.cjs › initial IDB migration and UI boot` collects errors (`assert.deepEqual(errors,[])`); release-verify has **no** `pageerror`/`console` listener | **Partial** — needs harness-wide listener |
| A: persistence survives close/reopen | `verify.cjs` room commit/reload, stale tab, corrupt bundle, audit/state revision agreement | **Strong** |
| A: Stop/cancel affects only intended operation | `verify.cjs › provider health v2 cancellation does not damage route health` (routing-level only). No UI stop-button scope test | **Gap** |
| A: no horizontal overflow at supported widths | release-verify 8/9/11/12/13/15/17 | **Strong** |
| A: RTL + day/night functional | release-verify 2/5/13/14/19 | **Strong** |
| A: Android WebView smoke | android-apk.yml API 36 + 34 device runs | **Strong (no golden compare)** |
| B: scenario tests w/ user goal + friction budget | none — all 23 checks are surface/structure assertions; no "≤N user-visible actions to first outcome" measurement | **Gap (primary)** |
| C: shared nav conventions | release-verify 19 (`final nav … localized`) — text-level only, no 5-item structural or activation assertion | **Gap** |
| C: shared tokens/components | theme assertions (`--s-bg` exacts) + contrast test + static-audit | **Good** |
| C: Arabic/RTL parity | 5/14/19/22 string pins | **Partial (spot checks, no census)** |
| C: no parallel settings/modal system | release-verify 16 (modern dialogs), 10 (no legacy name modal), static-audit duplicate-id check | **Partial (no overlay census)** |
| C: no duplicated control surface | static-audit `duplicate-static-id` | **Gap (runtime duplication)** |
| D: automated output | `all.cjs` PASS line, CI artifacts | **Present** |
| D: Android screenshot set | android-apk.yml `visual-evidence/android{14,16}` upload | **Present (no baseline/golden compare)** |
| D: before/after note, limitations, reviewer verdict | none automated (`approveBaseline` requires `reviewer`/`reason`/`approvalRef` — the hook exists, unused) | **Gap** |
| Golden screens (13 listed) | ~0 committed goldens; web harness captures **no** screenshots at all | **Gap (largest)** |

---

## 3. Missing deterministic assertions (the actual build list)

**P0 — evidence plumbing**
1. No `pageerror` + `console.error` collector anywhere in the web UI suite. Every new scenario must install `page.on('pageerror')` / `page.on('console')` filters and assert zero uncaught errors *per scenario* (Gate A), excluding an explicit allow-list.
2. No web screenshot capture and no baseline compare: wire `page.screenshot()` → `sharp` (already a devDependency, used by android capture scripts) → `createArtifact` → `auditViewport/auditTouchTargets/auditAccessibility/auditState` → `createEvidence` → `compareBaseline` → `createManifest`.
3. `visual-evidence-runtime.cjs` is orphaned in CI; no manifest is ever written or uploaded.
4. No independent-reviewer gate: `approveBaseline` needs `reviewer` + `reason` + `approvalRef` from a human/Gate-D verdict (READY / CHANGES REQUIRED).

**P1 — Gate B scenario tests with friction budgets**
5. No fresh-install → first meaningful outcome measurement. Required: *Goal: start a new RPG session. Starting state: fresh install, no imported packs. Expected: first meaningful story turn ≤ 3 user-visible actions. Failure: requires knowledge of JSON packs / hidden setup.*
6. No Stop-scope scenario: pressing Stop during a streaming turn must cancel only that turn — assert the assistant bubble stops, the draft survives, the room/audit state is unchanged for other rooms, and a second turn can start.
7. No close/reopen persistence scenario *through the UI* (localStorage + IndexedDB round-trip via UI actions, not only via runtime calls).
8. No "first-run zero-key routing works end-to-end" scenario (`hasAnyConfiguredFreeProvider()` true ⇒ first send succeeds) — currently only asserted as a boolean.
9. No per-surface friction accounting (action counter + screenshot at each step).

**P1 — Gate C structural censuses**
10. No **5-button nav** structural assertion (count, order, stable ids, activation, clipping at 320 px, 44/24 px targets, long-Arabic-label RTL safety).
11. No **duplicate modal system** census (overlay-root inventory, single-open invariant, Escape/backdrop close, `<dialog>`/`showModal(` pinned at 0, z-index/stacking uniqueness).
12. No **untranslated Arabic control** census (every interactive node's text/aria-label/placeholder/title must contain Arabic script when `lang=ar`/`dir=rtl`, with an allow-list for numerals, icons, brand tokens).

**P2 — robustness**
13. Landscape and font-scale coverage exists only for `150%` and only in one check; no `175%`, no nav/composer at `200%`, no Android `font_scale 1.30`.
14. Overflow detection is boolean and non-diagnostic; it does not name the offending element, and does not detect the anti-pattern "CSS `overflow-x:hidden` masking a structural overflow".
15. No touch-target or accessibility audit is run against the real product (the kernel supports both; nothing calls them with live DOM).
16. No reduced-motion / animation-freeze contract in the web harness (Android has `assertZeroScale`; web has none).
17. `all.cjs` enforces a 120 s per-file timeout; a full 13-surface × 8-config golden matrix plus screenshots will exceed it.

---

## 4. Golden-screen matrix (13 gate screens, mapped to runnable scenarios)

Scenario ids are permanent keys: `scenarioHash` covers viewport/density/fontScale/locale/direction/theme/`expectedSelectors`/`criticalSelectors`, so **any change to these invalidates the baseline as `SCENONE_CHANGED` → `reviewRequired:true`** — which is the desired "visual changes must be intentional" behavior. Names must satisfy the Android `shot()` regex `[a-z0-9-]+` (kebab-case) to be shared across web and device.

| # | Gate screen | Scenario id | Viewport | dir/theme/fontScale | Critical selectors (assert present) | Capture |
|---|---|---|---|---|---|---|
| 1 | Chat | `gs-chat-night-390` | 390×844 | ltr/night/1.0 | `#seven-app[data-seven-remake="1"]`, `.main`, `.composer`, `#chat`, `#userInput`, `.topbar` | Playwright + Android |
| 2 | Chat (day) | `gs-chat-day-390` | 390×844 | ltr/day/1.0 | same; `--s-bg === #f5f7f5` | Playwright + Android |
| 3 | Sidebar (closed/open, RTL) | `gs-sidebar-rtl-night-390` | 390×844 | rtl/night/1.0 | `.sidebar`, `.seven-shell-backdrop` (parent `#seven-app`, non-transparent) | Playwright + Android |
| 4 | Model picker | `gs-model-picker-rtl-night-320` | 320×800 | rtl/night/1.0 | `.seven-ws-picker`/model menu, bounded dialog | Playwright |
| 5 | Mode/depth dialogs | `gs-mode-depth-rtl-night-320` | 320×800 | rtl/night/1.0 | `.s-dialog`, controls ≥ 24px | Playwright + Android |
| 6 | Search | `gs-search-ltr-night-390` | 390×844 | ltr/night/1.0 | search surface + zero-key notice (`لم`/`never need to paste an API key`) | Playwright |
| 7 | Research | `gs-research-rtl-night-360` | 360×800 | rtl/night/1.0 | `.seven-workspace-root`, `[data-research-run]`, `[data-research-import]` | Playwright + Android |
| 8 | Coding | `gs-coding-rtl-night-360` | 360×800 | rtl/night/1.0 | `[data-code-run]`, `[data-code-task]`, `[data-code-files]`, `[data-code-output]`, `[data-code-retry]`, `[data-code-stop]` | Playwright + Android |
| 9 | RPG | `gs-rpg-rtl-night-360` | 360×800 | rtl/night/1.0 | `[data-rpg-world-name]`, `[data-rpg-state]`, `[data-rpg-title-toggle]`, `[data-rpg-exit]`, `.seven-rpg-chatbar` (aria-label) | Playwright + Android |
| 10 | Settings tabs | `gs-settings-tabs-rtl-night-320` / `gs-settings-expanded-320` | 320×800 | rtl/night/1.0 | `#settingsModal .modal-content`, `[role=tabpanel]` ∈ {s-settings-generation, s-settings-context, s-settings-models, s-settings-data} | Playwright + Android |
| 11 | Attachments | `gs-attachments-rtl-night-320` | 320×800 | rtl/night/1.0 | attachment menu (`الصور`, `الملفات`, aria `إرفاق صور أو ملفات`, `أفلت الملفات`) | Playwright |
| 12 | Arabic RTL (global) | `gs-global-rtl-390` | 390×844 | rtl/night/1.0 | `documentElement.lang==='ar' && dir==='rtl'`, every interactive node Arabic-localized (census) | Playwright |
| 13 | Day/night pair | `gs-settings-day-390` | 390×844 | ltr/day/1.0 | day token contract + night↔day round-trip | Playwright |
| 14 | Smallest supported phone | `gs-smallest-320-night` | 320×800 | ltr+rtl/night/1.0 | `scrollWidth <= innerWidth+2` everywhere, nav 5 buttons inside container | Playwright + Android |
| 15 | Landscape | `gs-landscape-800x360-font150` | 800×360 | ltr/night/**1.5** | topbar/main/composer bounds; settings modal scrollable | Playwright |
| 16 | Increased font scale | `gs-fontscale-390x430-175` | 390×430 | ltr/night/**1.75** | composer/nav bounds, dialog `scrollHeight >= clientHeight` | Playwright |
| 17 | Android font scale (device) | `android14-fs115-*` / `android16-fs100-*` | pixel_6 | ltr/night/1.0 / 1.15 | same critical selectors; `assertZeroScale(animation scales)` | `screencap` |

Matrix invariants run for **every** scenario above, independent of screenshotting: `auditViewport`, `auditTouchTargets(44/24)`, `auditAccessibility`, `auditState`, contrast sample, uncaught-error count = 0.

---

## 5. Test file and workflow changes (design — no production edits)

New directory `eval/ui/` (sibling of the existing `eval/harness.cjs`, keeping `all.cjs` conventions):

| File | Role | Depends on |
|---|---|---|
| `eval/ui/server.cjs` | Local static server + release build pipeline, extracted from `release-verify.cjs` lines ~41–54 (`build()`, `transformFile()`, `patchFile()`, `/vendor|/workspaces|/brand|/attachment-runtime.js` routing). **Zero network.** | `release/build-release.cjs`, `zero-room-transform.cjs`, `frontier-model-patch.cjs` |
| `eval/ui/page-fixture.cjs` | `withPage(browser, {viewport, dir, theme, fontScale, reducedMotion})`: seeds `user_name_asked`/`user_name`, installs `pageerror`/`console` collectors, `prefers-reduced-motion`, blocks non-localhost requests, `page.screenshot({animations:'disabled', caret:'hide'})`, returns `{page, errors}`. | Playwright |
| `eval/ui/audits.cjs` | **Pure, browser-free-testable** collectors → exactly the shapes the kernel expects: `collectViewport(page) → {scrollWidth,clientWidth,scrollHeight,clientHeight}`; `collectTouchTargets(page) → [{selector,width,height,visible,disabled}]`; `collectA11y(page) → [{selector,accessibleName,focusable,interactive}]`; `collectContrast(page)`; `findOverflowOffenders(page) → [{selector, right|left, overflow}]`; `findUntranslatedControls(page,{lang}) → [{selector, text, source}]`. | none |
| `eval/ui/overflow.cjs` | The 5 deterministic overflow strategies (§6a) as named scenario assertions. | `audits.cjs` |
| `eval/ui/i18n-census.cjs` | Untranslated-Arabic detector + allow-list (`[A-Z]{2,}` brand, digits, icons, `aria-hidden`) + exact-string pins imported from release-verify 5/14/19/22. | `audits.cjs` |
| `eval/ui/surface-census.cjs` | Overlay inventory (modal systems), 5-button nav inventory, duplicate-control detection at runtime. | `audits.cjs` |
| `eval/ui/scenarios.cjs` | **Gate B product scenarios**: declarative `{id, goal, startingState, maxActions, steps[], expectations, frictionBudget}` — RPG first-turn ≤3 actions, Stop-scope, persistence-through-UI, zero-key first send. | `server.cjs`, `page-fixture.cjs` |
| `eval/ui/golden-screens.test.cjs` | Runs the §4 matrix: activate surface → collect audits → screenshot → `createScenario/Artifact` → audits → `createEvidence` → `compareBaseline` → manifest at `dist/ui-evidence-manifest.json`; baseline registry at `eval/ui/baselines.json`. | kernel + all above |
| `eval/ui/harness.test.cjs` | Unit tests for `audits.cjs`/`scenarios.cjs`/manifest round-trip using synthetic DOM fixtures (no browser) — keeps the 120 s budget safe. | node:test |

Wiring (small, build-side changes only):
* `all.cjs`: append `path.join('eval','ui','harness.test.cjs')` and `path.join('eval','ui','golden-screens.test.cjs')` to the existing `files` array (mirrors how `releaseTests` is enumerated). Because of `timeout:120000`, either keep the golden matrix ≤~100 s or give the golden suite its own spawn entry with a larger timeout — **recommended: split `golden-screens.test.cjs` into two spawns (matrix-A web, matrix-B golden capture)**.
* `package.json`: add `"test:ui": "node eval/ui/golden-screens.test.cjs"`, `"eval:ui-manifest": "node eval/ui/golden-screens.test.cjs --manifest-only"` (mirrors the existing `test:gateway` / `eval:search-live` naming).
* `.github/workflows/seven-tests.yml`: after `node all.cjs`, upload `dist/ui-evidence-manifest.json`, `eval/ui/baselines.json`, `eval/ui/evidence/**` (keep `if-no-files-found: error` so a crashed harness is red, not silently green).
* New `.github/workflows/ui-visual-gate.yml` (optional, PR-gated): node 24 + `--only-shell chromium`, run web golden matrix, upload `visual-evidence/web/**`, and (only on labels/manual dispatch) the `reactivecircus/android-emulator-runner` jobs at `api-level 34` + `font_scale 1.15/1.30` and `api-level 36`, pulling into `visual-evidence/android14|android16` — mirroring the existing, proven android-apk.yml block.
* `apk/materialize-android-visual-test.cjs`: add a second `@Test goldenReleaseScreens()` reusing `theme()/workspace()/shot()/assertZeroScale()` to capture the kebab-case names from §4 (`gs-chat-night-390` etc.) — this is a **generator edit, not app source**, and is regenerated by `npm run android:generate`.

---

## 6. Catching the five named regressions

### 6a. Horizontal overflow
Canonical predicate (already proven in release-verify) promoted to a shared collector, run for every matrix cell (4 widths × 2 dir × 2 theme) and after every scenario step:

```js
// audits.cjs
collectViewport = () => ({scrollWidth:document.documentElement.scrollWidth,
  clientWidth:document.documentElement.clientWidth,
  scrollHeight:document.documentElement.scrollHeight,
  clientHeight:document.documentElement.clientHeight});
// auditViewport() FAILS when scrollWidth-clientWidth > 2  →  "horizontal-overflow:<px>"
```
Five deterministic strategies, each producing a named failure message:
1. **Static matrix** — `.topbar`, `.main`, `.composer`, `#chat`, `.sidebar`, `.seven-workspace-root`, `#settingsModal .modal-content`, `.s-dialog`, `.seven-ws-picker` rect bounds `left>=-2 && right<=innerWidth+2`.
2. **Adversarial content injection** — 500-char unbroken token, 500-char URL, fenced code block, mixed CJK+Latin, `&nbsp;`-padded string, `100vw`-width child; assert `documentElement.scrollWidth`, `#chat.scrollWidth <= #chat.clientWidth+2`, and `pre`/`.bubble` right edges (extends release-verify check 12 to all workspaces, not just chat).
3. **Every surface, not just chat** — activate Research/Coding/RPG/Search/Settings and re-run (extends check 13 from "root bounded" to "whole subtree").
4. **Offender attribution** — `findOverflowOffenders()` walks the DOM and returns the top-5 widest-right elements with selector + computed `overflow-x`, so a failure names the culprit instead of a boolean. **Anti-pattern guard:** fail with `MASKED-OVERFLOW` if `documentElement.scrollWidth <= clientWidth+2` **but** an element with computed `overflow-x:hidden|clip` has `scrollWidth > clientWidth + 2` — this directly enforces the gate's prohibition on "adding more CSS overrides to hide a structural layout problem".
5. **RTL inversion** — identical run under `dir='rtl'` (offenders are mirrored; right-bounded checks must become left-bounded).

### 6b. Untranslated Arabic controls
`i18n-census.cjs`, per surface, after `SevenShell` sets `lang=ar; dir=rtl`:
* Enumerate `button, [role=button], a[href], input, select, textarea, summary, [aria-label], [title], [placeholder], [data-code-*], [data-research-*], [data-rpg-*], nav *`.
* For each visible node compute `strings = [textContent.trim(), aria-label, title, placeholder, value(for buttons only)]`.
* **Fail** `untranslated:<selector>:<string>` when the string contains ASCII letters `[A-Za-z]{2,}` and **no** Arabic codepoint `[\u0600-\u06FF\u0750-\u077F]`, after stripping the allow-list: brand tokens (`Seven`, `API`, `WebView`, `GitHub`, `JSON`, `PDF`, `LLM`, `RPG`, `Kilo`, `Auto`), icon-only/emoji, pure digits/separators, `aria-hidden` subtrees.
* **Fail** `missing-label:<selector>` for any interactive node with no accessible name (feeds `auditAccessibility`).
* **Fail** `surface-coverage` if Arabic coverage on any surface is < 100 % of non-allow-listed interactive strings, or if Arabic coverage regresses below the value pinned by the previous manifest run (golden-manifest diff).
* Reuse exact pins from release-verify 5/14/19/22 as non-negotiable regressions (`الصور`, `الملفات`, `إرفاع صور أو ملفات`, `أفلت الملفات`, `لن تحتاج إلى لصق مفتاح API`).
* Symmetric **inverse** check for English mode: Arabic script present in `lang=en` ⇒ `rtl-leak`.

### 6c. Duplicate modal systems
`surface-census.cjs`:
* **Overlay inventory:** `document.querySelectorAll('[role=dialog], [aria-modal=true], .s-modal, .modal, .modal-content, .s-dialog, dialog, .seven-shell-backdrop, [class*=sheet], [class*=drawer]')`, grouped by "system" (legacy `#settingsModal` + `.modal-content`; modern `.s-modal` + `.s-dialog`; shell backdrop). Assert the approved system list matches exactly — a new system fails `new-overlay-system`.
* **Static pin (source-scan, `static-audit.cjs` style):** assert `built html` contains **0** `<dialog` and **0** `showModal(` (both currently 0 in `seven_ai-final.html`) — a native-dialog parallel system fails immediately.
* **Single-open invariant:** open settings, then a `.s-dialog`, then the attachment menu; assert exactly one overlay has `data-open`/non-hidden each time and focus is inside the topmost (focus-trap containment test).
* **Dismissal parity:** `Escape` and backdrop click close each overlay in each system; body scroll is restored.
* **Styling uniqueness:** no two systems share the same z-index band; every overlay's background is non-`rgba(0,0,0,0)` and inherits `#seven-app` (mirrors release-verify 16/22).
* **Runtime duplication:** for each control in the settings census, assert no two visible controls trigger the same handler (`el.onclick` identity or `data-action` key) — the gate's "must not duplicate an existing control surface" rule.

### 6d. 5-button nav breakage
Because no nav markup is present in the source HTML (§1.6), the nav is resolved **at runtime** against the built artifact:
* Assert the primary nav container exposes **exactly 5** navigable destinations (`nav button, nav [role=tab], nav a` with `data-seven-nav*` or `aria-label`), in a **stable order** equal to a pinned list captured at first run and stored in `eval/ui/baselines.json` (`nav-contract.json`).
* Per button: rect fully inside the nav container rect; `width,height ≥ 24` (hard) and warn below `44` (preferred) → `auditTouchTargets`; unique accessible name; Arabic label in `ar` mode; `aria-current`/active class toggles on activation and exactly one item is active at a time.
* **Layout stress:** 320 px width, `fontSize 150%/175%`, `ltr`+`rtl`, and a max-length Arabic label injected into each button → assert no button is clipped, wrapped beyond the container height, or overlapped (`rects do not intersect`), and the nav still reports 5 activatable destinations (a 6th or a hidden 5th ⇒ `nav-count-drift`).
* **Reachability:** each of the 5 activates in ≤2 taps and the resulting `data-seven-workspace`/view state matches its label (catches "the button exists but goes nowhere" — an explicit gate anti-pattern).

### 6e. Font-scale / landscape regressions
* **Web (Playwright):** matrices `[800,360]`, `[390,430]`, `[360,640]` × `documentElement.style.fontSize ∈ {150%, 175%, 200%}` × `{ltr,rtl}`. Assertions per cell: `documentElement.scrollWidth <= innerWidth+2`; `.topbar`, `.main`, `.composer` bounds; `#settingsModal .modal-content` non-overflowing **and** scrollable (`scrollHeight >= clientHeight`); `.s-dialog` same; `.seven-workspace-root` bounded; `.seven-ws-picker` bounded; nav 5-button container intact; no `MASKED-OVERFLOW`.
* **Device (Android):** reuse `android-apk.yml`'s existing `font_scale 1.15` block; add a `1.30` run. `assertZeroScale(window|transition|animator_duration_scale)` guarantees deterministic captures at every scale.
* **Determinism guards:** `reducedMotion:'reduce'`, `animations:'disabled'`, `caret:'hide'`, frozen clock (`Date`), stubbed randomness for any timestamp/latency rendering, and a screenshot `mask` over volatile regions — otherwise the baseline will churn and the harness will cry wolf.

---

## 7. Failure semantics

| Condition | Kernel verdict | Process exit | CI |
|---|---|---|---|
| Uncaught JS error / page error in a scenario | — | 1 | red |
| `horizontal-overflow` (`scrollWidth-clientWidth > 2`) | `FAIL` | 1 in ENFORCE; 0 in OBSERVE (manifest records FAIL) | yellow/red by mode |
| Touch target `< 24px` | `FAIL` | 1 in ENFORCE | red |
| Touch target `24–44px` | `WARN` | 0 | yellow (artifact note) |
| Missing accessible name / not focusable | `FAIL` | 1 in ENFORCE | red |
| Untranslated Arabic control, nav-count drift, new overlay system, duplicate control | — | 1 | red |
| `MASKED-OVERFLOW` (overflow hidden over structural break) | `FAIL` | 1 | red |
| Screenshot differs from baseline (`CHANGED`) | `reviewRequired` | 0 | artifact + reviewer task |
| Scenario definition changed (`SCENENE_CHANGED`) | `reviewRequired` | 0 | reviewer task (intentional-change sign-off) |
| No baseline yet (`NO_BASELINE`) | `reviewRequired` | 0 | reviewer task |
| All audits pass, screenshot matches (`MATCH`) | `PASS` | 0 | green |
| Zero audits collected | `INCONCLUSIVE` | 0 (treated as harness bug — assert ≥1 audit) | red via manifest assertion |
| Gate B friction budget exceeded (> maxActions) | — | 1 | red |
| `evidence.status === FAIL` submitted for baseline approval | `approveBaseline` **throws** | 1 | red |
| Harness crash before manifest write | — | 1; artifact upload has `if-no-files-found: error` → red | red |

Modes: **`OBSERVE`** for the first wave (every check runs, manifest records everything, only functional asserts fail the build) → flip to **`ENFORCE`** after an independent reviewer approves the baseline registry (Gate D). The manifest's `summary{count,pass,warn,fail,inconclusive}` and every `issue` string is the machine-readable reviewer brief.

---

## 8. First implementation slice (recommended PR 1 — no production source touched)

**Scope: make the orphaned kernel live, for four surfaces, on one width set.**

1. `eval/ui/server.cjs` — extract build+serve from `release-verify.cjs` (no behavior change; release-verify may keep its inline copy in this PR to avoid touching a green gate file).
2. `eval/ui/page-fixture.cjs` — viewport/dir/theme/fontScale seed + `pageerror`/`console` collectors + `screenshot({animations:'disabled'})`.
3. `eval/ui/audits.cjs` — `collectViewport`, `collectTouchTargets`, `collectA11y`, `findOverflowOffenders`, `findUntranslatedControls` (pure mapping functions, unit-testable with synthetic DOM input).
4. `eval/ui/harness.test.cjs` — node:test unit tests for the five collectors + manifest round-trip (`createManifest` → `verifyManifest`) using fixtures; no browser, milliseconds.
5. `eval/ui/golden-screens.test.cjs` — **four** scenarios only: `gs-chat-night-390`, `gs-chat-day-390`, `gs-sidebar-rtl-night-390`, `gs-settings-tabs-rtl-night-320`. For each: navigate → collect audits → screenshot → build scenario/artifact/audits/evidence → `compareBaseline` → write `dist/ui-evidence-manifest.json` + `eval/ui/baselines.json` (approved entries only when a reviewer string is present).
6. Wire into `all.cjs` (one added path, own spawn entry) and add `test:ui` to `package.json`; extend `seven-tests.yml` upload list with the manifest.
7. Mode `OBSERVE`, exit 0 unless a functional assert fails. Second PR adds the Gate B scenarios + censuses (§6b–6e); third adds the remaining 9 golden screens and flips ENFORCE after reviewer sign-off.

**Definition of done for PR 1:** `node all.cjs` still green with one extra suite; `dist/ui-evidence-manifest.json` exists with 4 verified scenarios and real sha256 artifacts; uploading it in CI; zero changes to `seven_ai-final.html`, `release/*.css|js`, or `apk/*-launcher*` app sources.

---

## 9. Open items to confirm during implementation (recorded, not blocking)

1. Exact file in `release/remake-source/` / `release/workspaces/` that injects `.s-modal`, `.s-dialog`, `.seven-shell-backdrop` and the primary nav (source HTML grep shows none; built page does).
2. Stable selectors/ids for the 5 nav destinations — must be pinned on first run; prefer existing `data-*` hooks over adding any.
3. Whether `release/release-results.json` (uploaded in CI) is still produced by `release-verify.cjs`; if so, the new manifest should sit beside it, not replace it.
4. `evolution/*.test.cjs` count is dynamic — the `all.cjs` "N suites" line will change; keep the summary format stable.
5. Budget: a 17-scenario matrix with screenshots on `--only-shell chromium` must be measured against the 120 s per-suite timeout before ENFORCE.

WAVE01=COMPLETE
