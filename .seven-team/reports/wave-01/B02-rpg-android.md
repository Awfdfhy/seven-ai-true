# B02 — RPG V2 Android Lifecycle & Persistence Audit (Wave 01B)

Team B / Codex CLI. Scope: `release/workspaces/rpg.js`, `release/workspaces/hub.js`, storage paths,
Android visual/smoke instrumentation, Capacitor lifecycle. **Audit only — no production source edited.**
Contract refs: `.seven-team/cohesion/RPG_V2_PRODUCT_CONTRACT.md` — RPG-04 (persistence / "recent state",
L104), RPG-07 (small-viewport + RTL + night, L113), RPG-04 builder slot L118.
This revision corrects two claims from the first pass: RPG **is** opened by device instrumentation
(`apk/materialize-android-visual-test.cjs:127`, screenshot only, zero assertions), and
`windowSoftInputMode="adjustResize"` **is** already patched (`apk/patch-android.cjs:24`).

---

## 1. Actual persistence path today

**There is no RPG persistence path at all. The only "save" that exists is a manual JSON file import.**

| Evidence | Finding |
|---|---|
| `release/workspaces/rpg.js:5` | All RPG state is a module-closure singleton `S={version,root,bar,worldEngine,worldSession,canonEngine,canonSession,observer,titleHandler}`. No store, no key, no serializer. |
| `rpg.js:23` | `snapshot()` returns `{work, worldSession, canonPack, canonSession}` — a read-only in-memory view that **is never serialized and never called by a write path.** This is the already-written hook a serializer should use. |
| `rpg.js:24` / `rpg.js:25` | `loadWork(pack,opts)` / `loadCanon(pack,opts)` build a fresh engine + session from an **in-memory pack object** and throw `'SevenWorld runtime unavailable'` / `'SevenCanon runtime unavailable'` if `r.SevenWorld.createEngine` / `r.SevenCanon.createEngine` is missing. No read-back path from storage exists. |
| `rpg.js:39` | `async function jsonFile(file,kind)` -> `JSON.parse(await file.text())` -> `loadWork`/`loadCanon`, bound to `<input type=file>` at `rpg.js:53`. **User-driven import, not autosave.** No export/download/write-to-disk path exists in the file. |
| `rpg.js:28`, `rpg.js:29`, `rpg.js:33`, `rpg.js:34` | Every mutation (`commitVerifiedBeat`, `applyVerifiedDelta`, `recordTitle`, `autoTitle`) updates `S.*Session` then re-renders status/titles — **pure DOM writes, zero persistence side effects.** |
| repo grep (`localStorage|sessionStorage|indexedDB|visibilitychange|pagehide|beforeunload|popstate|visualViewport` over `release/`) | Hits exist **only outside** `release/workspaces/*`: `beta-ui-runtime.js:17,21,43`, `brand/runtime.js:1`, `motion-runtime.js:1`, `performance-runtime.js:81`, `github-self-dev.js:472-475`. **Zero hits in `rpg.js`, `hub.js`, `seven-shell-final.js`.** An autosave-on-visibility precedent already exists in this codebase (see Slice 1). |
| `package.json` | Dependencies are only `@capacitor/android` + `@capacitor/core`. **No `@capacitor/preferences`, no `@capacitor/app`, no `@capacitor/filesystem`.** No native storage or native lifecycle plugin is available. |
| `capacitor.config.json` | `"androidScheme":"https"`, `"loggingBehavior":"none"`, `"webContentsDebuggingEnabled":false`. Under the `https` scheme, WebView `localStorage` **does** persist across app restarts — a zero-new-dependency persistence target exists today. |
| `runtime-smoke.cjs:6` | The only `localStorage` in the root test tree is a hand-rolled stub for `memory.cjs` — unrelated to RPG. |

**Consequence:** RPG continuity holds only inside one live JS realm. Exit/re-entry "works" purely by closure
survival; **any WebView reload, Activity recreate, or process death discards world pack, canon pack, session,
and all recorded titles.**

---

## 2. Lifecycle seams that likely lose state

**Seam A — `unmount()` tears down UI but keeps stale in-memory sessions.**
`rpg.js:57`: `unmount()` disconnects `S.observer`, removes the `seven:themechange` listener and
`S.titleHandler`, removes `S.bar`, nulls `S.root`, strips `.seven-rpg-copy*` — but **never clears
`S.worldEngine/worldSession/canonEngine/canonSession`.** Today's exit/re-entry continuity is therefore
*accidental*, not contractual. Any future hydration in `mount()` **must** reset those four fields first, or a
stale pre-restart session is silently resurrected over a rehydrated one.

**Seam B — exit runs through the hub, which nils the whole DOM subtree.**
`rpg.js:53`: `[data-rpg-exit].onclick = () => r.SevenWorkspaces && r.SevenWorkspaces.close()`.
`hub.js:1`: `close()` = `old.unmount()` -> `S.active='chat'` -> delete `dataset.sevenWorkspace`/`sevenSpecialist`
-> `n.innerHTML=''` -> `chat(true)` -> `SevenAurora.reset()`. `open('rpg')` mirrors it and ends with
`next.mount(n)` after `chat(true); n.innerHTML=''`. **Every DOM-derived RPG fact is destroyed**; only the `S`
closure survives. Any renderer that reads from DOM instead of `S` breaks on exit.

**Seam C — `hub.open()` rethrows into a Chat fallback with no user-visible RPG signal.**
`hub.js:1`: the `rpg` branch restores Chat state (`S.active='chat'`, dataset cleanup, `chat(true)`,
`SevenAurora.set('error','medium')`) and only then `throw e`. A throw during RPG hydration (corrupt stored
JSON, engine unavailable) lands the user **back in Chat with no RPG notice** — only a console-level error.
RPG-04 would fail invisibly rather than loudly.

**Seam D — no foreground flush anywhere.**
No `visibilitychange`, `pagehide`, `beforeunload`, `freeze`/`resume`, `App.addListener`, or Android `onPause`
hook exists in any workspace asset. On Android the WebView can be frozen/killed while backgrounded; without a
foreground flush the last N beats are lost even after autosave is added. The repo already uses the pattern
elsewhere: `beta-ui-runtime.js:43`, `motion-runtime.js:1`, `performance-runtime.js:81`, `brand/runtime.js:1`.

**Seam E — the integrated shell actively suppresses RPG titles (integration conflict).**
`release/workspaces/seven-shell-final.js` consumes `r.SevenRpgWorkspace` and later injects a
`#seven-no-rpg-titles` block hiding `[data-rpg-title-toggle],[data-rpg-current-title],[data-title-kind],
[data-title-num],[data-title-name],[data-title-record],[data-title-preview]` and adds a **capture-phase**
`d.addEventListener('seven:rpg-title-recorded', e => e.stopImmediatePropagation(), true)`. Recorded titles are
part of RPG-04 "recent state" — they are suppressed in the integrated shell, so a restore test asserting DOM
visibility would fail (or, worse, be written to tolerate the symptom).

**Seam F — hardware Back is not mapped to workspace close.**
`hub.js:1` `close()` is reachable only from a button. No `popstate`/history entry is pushed on `open('rpg')`,
and there is no `@capacitor/app` `backButton` listener. On Android, Back leaves the WebView/app instead of
exiting RPG — **the exit path RPG-04 depends on is not the path a device user takes.** `popstate` has zero
hits repo-wide under `release/`, so this is net-new work.

**Seam G — keyboard/IME geometry is unhandled (partially mitigated).**
`rpg.js:53` inserts the RPG bar **immediately before `.input-area`**. No `visualViewport`, `focusin/focusout`,
or scroll-into-view logic exists. `apk/patch-android.cjs:24` does append
`android:windowSoftInputMode="adjustResize"` when absent, so the composer is not occluded by the IME — but
`adjustResize` only shrinks the viewport, leaving bar + drawer + composer competing for the same ~200px of
visible height at 360dp. The gap is *scroll/visibility*, not occlusion. No `AndroidManifest.xml` is checked in;
it is generated by `cap add android` in the `android:generate` script and patched by `apk/patch-android.cjs`.

**Seam H — device-side debug is off.**
`capacitor.config.json`: `loggingBehavior:"none"`, `android.webContentsDebuggingEnabled:false`. Device evidence
must come from instrumentation **return values + screenshots** (established pattern: `js(webView, ...)` with a
12s latch, `materialize-android-visual-test.cjs:29`) — no console/logcat/CDP.

---

## 3. What Android tests exist today

Single source of device truth: `apk/materialize-android-visual-test.cjs` (175 lines; materializes Java
instrumentation with `ActivityScenario`, `AndroidJUnit4`, `WebView` JS eval, `assertTrue`, `shot()`).
Helpers: `js()`/`waitFor()` (`:65-75`), `workspace(webView,kind)` (`:72`).

| Capability | Present? | Evidence |
|---|---|---|
| Night theme assertions | YES | `:89-91` night screenshots + `--s-bg` computed-style check on `#seven-app`/`.main`/`.composer`; `:161-162` `SevenTheme.setPreference('night')` + `dataset.sevenTheme==='night'` |
| Arabic RTL assertions | YES (chat + sidebar only) | `:129` sets `lang='ar-IQ'`, `dir='rtl'`; `:130` waits for computed `direction==='rtl'`; `:132` sidebar `r.left>=innerWidth-2`; `:135` in-bounds; `:136` `shot("sidebar-rtl-night")`; `:141` long-chat jump; `:143` `shot("arabic-rtl")` |
| Overflow / clipping assertions | YES (settings tabpanel only) | `:112-117` tabpanel identity + `m.scrollWidth<=m.clientWidth+1 && r.left>=-2 && r.right<=innerWidth+2` |
| Animation-scale-off assertions | YES | `:48-50` `assertZeroScale` for `window/transition/animator` |
| Workspace open flow (chat/coding/research/**rpg**) | SCREENSHOT-ONLY | `:121` `openLauncher()`; `:123` `shot("workspace-picker-night")`; `:125-127` `workspace(webView,'coding'/'research'/'rpg'); shot(...)`. **RPG is opened on device but asserted nowhere** — no state read, no geometry read, no storage read, no restore. |
| RPG measured during RTL block | NO | `:129` begins with `SevenWorkspaces.close()` then sets `ar-IQ`/RTL, so every RTL assertion is measured in **Chat**, never in RPG |
| Small/compact viewport metrics | NO | All assertions are relative to default emulator `innerWidth`; no 360x640 / 320dp `wm size`/`wm density` override, no `visualViewport.height` check |
| Keyboard / IME | NO | No IME-open scenario, no `visualViewport` assertion (only the manifest line at `apk/patch-android.cjs:24`) |
| Back button | NO | No `Espresso.pressBack()`, no `InstrumentationRegistry` back invocation, no `popstate` expectation |
| Reload / restore | NO | No `webView.reload()`, no storage assertion |
| Process death / cold start | NO | No `ActivityScenario.recreate()`, no `am force-stop` |
| Storage corruption / quota | NO | Absent repo-wide |

**Adjacent (non-device) coverage:**
- `all.cjs:5` — `releaseTests` = `embedded-credentials.test.cjs`, `contrast.test.cjs`, `static-audit.cjs`,
  `canon-simulator.test.cjs`, `world-runtime.test.cjs`, `research-runtime.test.cjs`, `release-verify.cjs`.
  **No RPG test file exists.**
- `release/release-verify.cjs:316` — the suite's only RPG read:
  `document.querySelector('[data-rpg-world-name]')?.textContent` plus `[data-rpg-state]`. Pure label presence;
  zero persistence, zero lifecycle. The same file **already drives a Playwright page and already touches
  `localStorage`** (`:106,115,149,170,185,200,216,268,277`) for theme prefs — so the reload/RTL RPG harness
  belongs in this file's existing style.
- `release/world-runtime.test.cjs` / `canon-simulator.test.cjs` cover the **engines** (`SevenWorld`,
  `SevenCanon`) headlessly; they never mount `SevenRpgWorkspace`, so `mount`/`unmount`/`snapshot` are untested.
- CI: `package.json` has `playwright@1.63.0` as a devDependency and `npm test` -> `node all.cjs`, so
  **compact-viewport / reload / restart tests can run in CI today with zero new dependencies.**
  `.github/workflows/android-apk.yml` covers build/verify only; `seven-tests.yml` runs the node suite.

---

## 4. Missing tests

**RPG-04 — Persistence (all missing):**
1. Exit RPG -> re-enter: active session, recent state, current-scene continuity (contract L104).
2. Reload / WebView recreation restores the session from storage.
3. Android process death -> cold start restores the same session.
4. Corrupt / truncated / wrong-schema payload -> safe reset **plus user-visible Arabic notice**, no silent Chat
   fallback (Seam C).
5. Autosave fires on every verified commit (`commitVerifiedBeat` `rpg.js:28`, `applyVerifiedDelta` `rpg.js:29`,
   `recordTitle` `rpg.js:33`, `autoTitle` `rpg.js:34`) and on foreground (`visibilitychange`/`pagehide`).
6. Back-press inside RPG exits to Chat **with session intact** (Seam F).
7. Title recording survives exit/re-entry (blocked today by Seam E — decide suppression vs. persistence first).
8. Stale-session guard: hydrate after `unmount()` must not resurrect pre-restart `S.*Session` (Seam A).

**RPG-07 — Small viewport / Arabic RTL / night (all missing for RPG):**
9. 360x640 compact: `.seven-rpg-chatbar` has no horizontal clip (`scrollWidth<=clientWidth+1`), drawer fields in-bounds.
10. `ar-IQ` + RTL measured **while RPG is open** (never asserted today — `:129` closes RPG first).
11. Night-theme token resolution for `var(--sb-*)` / `--sb-mode` inside `.seven-rpg-*` (bar, drawer, copy button
    all consume shell tokens; untested under night).
12. Arabic copy-affordance label renders and `.seven-rpg-copy` stays in-bounds.
13. IME open: composer + RPG bar both reachable after `visualViewport` shrink.
14. Tap targets >=44px and `prefers-reduced-motion:reduce` honored for `.seven-rpg-*` (rule exists at `rpg.js:15`;
    no test).

---

## 5. Exact files / tests required

**New — CI-runnable, no new deps (highest value, do first):**
- `release/rpg-persistence.test.cjs` — Playwright chromium (`playwright@1.63.0`), viewport `360x640`,
  `deviceScaleFactor:3`, `colorScheme:'dark'`; deterministic `SevenWorld.createEngine` / `SevenCanon.createEngine`
  stubs mirroring how `release/world-runtime.test.cjs` drives engines headlessly. Assert: commit beat ->
  `page.reload()` -> `SevenRpgWorkspace.snapshot().worldSession` deep-equals pre-reload; exit/re-entry continuity
  via `SevenWorkspaces.close()` / `open('rpg')`; corrupt storage -> Arabic notice, no hang; title events persisted.
  Assert through `snapshot()` / `SevenWorkspaces.state`, not through the DOM stripped by Seam E.
- `release/rpg-viewport.test.cjs` — same harness; RTL + night + compact geometry: bar `scrollWidth<=clientWidth`,
  drawer fields in-bounds, Arabic copy label present, tap targets >=44px, reduced-motion honored.

**Modified — wiring + assertions (non-production):**
- `all.cjs:5` — append both new test files to `releaseTests`.
- `release/release-verify.cjs:316` — extend the existing RPG block: assert the persisted key exists and that
  post-reload `[data-rpg-world-name]` / `[data-rpg-state]` text matches pre-reload.
- `apk/materialize-android-visual-test.cjs` — add instrumentation right after `:127`: open RPG, commit a verified
  beat, assert the stored payload is non-null, `webView.reload()`, assert restored state, then measure the RPG bar
  under night + `ar-IQ` RTL + compact metrics and `shot("rpg-night-rtl-compact")`. Reuse `js()`, `waitFor()`,
  `shot()`; keep device scenarios few and assertion-dense (12s latch per `js()` at `:29`).

**Modified — production (needs the RPG-04 builder slot, contract L118; NOT in this audit's write scope):**
- `release/workspaces/rpg.js` — add `STORAGE_KEY` (e.g. `seven.rpg.v2.session`), `serialize()` built on the existing
  `snapshot()` (`:23`), `hydrate()` at the top of `mount()` (`:55`) **after an explicit reset of
  `S.worldEngine/S.worldSession/S.canonEngine/S.canonSession`**, autosave in the four mutation functions, a
  `visibilitychange`/`pagehide` flush, and a try/catch that surfaces an Arabic `notice()` instead of throwing into
  `hub.js`'s Chat fallback (Seam C).
- `release/workspaces/hub.js:1` — push a history entry in `open('rpg')` and make `close()` the `popstate` handler so
  Android Back exits RPG (Seam F).
- `release/workspaces/seven-shell-final.js` — reconcile the `#seven-no-rpg-titles` strip / capture-phase suppressor
  with RPG-04's "recent state" requirement (Seam E), or explicitly scope it out in the contract.
- `apk/patch-android.cjs:24` — **no production change needed** (`adjustResize` already patched); add an
  *assertion* that the attribute is present instead.

---

## 6. Test scenarios -> RPG-04 / RPG-07 mapping

| ID | Scenario | Gate | Where it runs |
|---|---|---|---|
| S1 | Commit verified beat -> `SevenWorkspaces.close()` -> `open('rpg')` -> session + current title identical | RPG-04 | `release/rpg-persistence.test.cjs` |
| S2 | Commit -> `page.reload()` -> session restored from storage | RPG-04 | `release/rpg-persistence.test.cjs` |
| S3 | Commit -> `ActivityScenario.recreate()` / cold start -> session restored | RPG-04 | `apk/materialize-android-visual-test.cjs` |
| S4 | Corrupt stored JSON -> safe reset + Arabic notice, no silent Chat drop, no hang | RPG-04 | `release/rpg-persistence.test.cjs` |
| S5 | Back-press while in RPG -> returns to Chat, session intact | RPG-04 | `apk/materialize-android-visual-test.cjs` (+ `hub.js` `popstate`) |
| S6 | 360x640 + night: `.seven-rpg-chatbar` no clip, actions reachable | RPG-07 | `release/rpg-viewport.test.cjs` |
| S7 | `ar-IQ` + RTL + night **with RPG open**: drawer order, Arabic copy affordance | RPG-07 | `release/rpg-viewport.test.cjs` + instrumentation |
| S8 | IME open: `visualViewport.height` keeps composer + RPG bar visible (`adjustResize` already set) | RPG-07 | `apk/materialize-android-visual-test.cjs` |
| S9 | Tap targets >=44px; `prefers-reduced-motion` honored for `.seven-rpg-*` | RPG-07 | `release/rpg-viewport.test.cjs` |

---

## 7. First implementation / evidence slice

**Slice 1 (one builder session; converts RPG-04 into a CI-enforced contract with zero Android work):**
1. `rpg.js`: `STORAGE_KEY` + `serialize()` off `snapshot()` (`:23`) + `hydrate()` at the top of `mount()` (`:55`)
   with an explicit `S.*` reset; autosave in the four mutation functions; `visibilitychange`/`pagehide` flush;
   try/catch -> Arabic `notice()`.
2. New `release/rpg-persistence.test.cjs` covering S1 + S2 + S4; wire into `all.cjs:5`.
3. Extend `release/release-verify.cjs:316` to assert the persisted key and restored labels.

This reuses the repo's own autosave precedent (`beta-ui-runtime.js:17,21,43`) and WebView `localStorage`
(persistent under `capacitor.config.json`'s `androidScheme:"https"`) with **no new dependency**, and runs in the
existing Playwright-backed node suite.

**Slice 2 (follow-on, device evidence):** S3 + S5 + S7 + S8 inside `apk/materialize-android-visual-test.cjs`
(right after the existing `:127` RPG screenshot), plus the `hub.js` Back mapping and a `windowSoftInputMode`
presence assertion.

---

## 8. Risks & dependencies

- **Write-scope:** this mission is audit-only; every §5 item marked "production" needs the RPG-04 builder slot
  (contract L118). `rpg.js`, `hub.js`, and `seven-shell-final.js` are dense minified-ish modules — edits are
  merge-hostile, so **one owner should do all three.**
- **No native storage available:** `package.json` has no Preferences/Filesystem/App plugin. Adding one is a
  dependency + `android:generate` pipeline change — a real schedule risk. WebView `localStorage` is the correct
  zero-dependency choice; it does **not** survive "clear app data". State that limitation in the contract rather
  than writing a test around it.
- **Seam E trap:** if title persistence lands while `seven-shell-final.js` still strips `[data-rpg-*]`, S1/S2 DOM
  assertions fail for reasons unrelated to storage. Sequence the title-suppression decision **before** the
  visibility assertions and prefer `snapshot()` / `SevenWorkspaces.state` assertions over DOM.
- **Script load order:** hydration requires `SevenWorld` / `SevenCanon` to be loaded **before**
  `SevenRpgWorkspace.mount()` (`rpg.js:24-25` throw otherwise). Release HTML script order becomes a correctness
  dependency for S2/S3 — assert it, don't assume it.
- **Emulator cost:** Slice 2 assertions run only on the emulator in `android-apk.yml`; each `js()` has a 12s latch
  (`materialize-android-visual-test.cjs:29`). Keep device scenarios few and assertion-dense.
- **Debug off:** `webContentsDebuggingEnabled:false` + `loggingBehavior:"none"` mean instrumentation return values
  are the only channel — assertions must return booleans, never just `shot()`.
- **Sibling waves:** other agents may be touching `hub.js` or the release HTML in parallel — lock before Slice 1.

---

## Bottom line

RPG has **no persistence path whatsoever** — only a manual JSON pack import (`rpg.js:39`); the read side
(`snapshot()`, `rpg.js:23`) already exists but is never serialized. Exit/re-entry continuity survives purely by
closure accident (`rpg.js:5`, `rpg.js:57`), and any reload / Activity recreate / process death is a total loss
(Seams A, D). On device, `apk/materialize-android-visual-test.cjs` proves night theme, Arabic RTL, and overflow —
but the RTL block **closes RPG first** (`:129`), and the RPG open at `:127` is a screenshot with **zero assertions**.
There is no reload, back-button, keyboard, small-viewport, or process-restart evidence anywhere. **RPG-04 and
RPG-07 are both effectively unevidenced; §7 Slice 1 is the cheapest path to hard CI evidence.**

WAVE01=COMPLETE
