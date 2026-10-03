# B02 — RPG V2 Android Lifecycle & Persistence Audit (Wave 01B)

Team B / Codex CLI. Scope: `release/workspaces/rpg.js`, workspace hub lifecycle, storage paths,
Android visual/smoke instrumentation, Capacitor lifecycle. Audit only — no production source edited.
Contract refs: `.seven-team/cohesion/RPG_V2_PRODUCT_CONTRACT.md` (RPG-04 L104, RPG-07 L113).

---

## 1. Actual persistence path today

**There is no automatic persistence path at all. The only "save" that exists is a manual JSON file import.**

| Evidence | Finding |
|---|---|
| `release/workspaces/rpg.js:5` | All RPG state is a module-closure singleton `S={version,root,bar,worldEngine,worldSession,canonEngine,canonSession,observer,titleHandler}`. No store, no key, no serializer. |
| `rpg.js:24` / `rpg.js:25` | `loadWork(pack,opts)` / `loadCanon(pack,opts)` create a fresh `worldEngine` + `worldSession` (or `canonEngine` + `canonSession`) **from an in-memory pack object**. No read-back path exists. |
| `rpg.js:39` | `async function jsonFile(file,kind)` → `JSON.parse(await file.text())` → `loadWork`/`loadCanon`. Bound to `<input type=file data-world-file>` / `[data-canon-file]` at `rpg.js:53`. This is a **user-driven import**, not autosave. There is no export/download/write-to-disk path in the file. |
| `rpg.js:28,29,33,autoTitle` | Every mutation (`commitVerifiedBeat`, `applyVerifiedDelta`, `recordTitle`, `autoTitle`) updates `S.*Session` then calls `renderStatus()`/`renderTitles()` — **pure DOM re-render, zero write side effects**. |
| Repo-wide grep | `localStorage`, `sessionStorage`, `indexedDB`, `visibilitychange`, `pagehide`, `beforeunload`, `freeze`, `resume`, `persist` return **no hits** in `release/workspaces/*.js` (including `rpg.js`, `hub.js`, `seven-shell-final.js`) and no hits in `capacitor.config.json`. |
| `capacitor.config.json` | Dependencies are only `@capacitor/android` + `@capacitor/core` (`package.json`). **No `@capacitor/preferences`, no `@capacitor/app`, no `@capacitor/filesystem`.** There is no native persistence or native lifecycle plugin to lean on. |
| `runtime-smoke.cjs:6` | The only `localStorage` in the test tree is a hand-rolled stub `{getItem,setItem,removeItem}` for `memory.cjs` — unrelated to RPG. |

**Consequence:** RPG session continuity is satisfied only inside a single live JS realm. Exit/re-entry
works in-realm (see §2), but **any WebView reload, Activity recreate, or process death discards the entire
session, world pack, canon pack, and recorded titles.**

---

## 2. Lifecycle seams that likely lose state

### Seam A — `unmount()` tears down UI but keeps stale in-memory sessions (leak + wrong-state risk)
`rpg.js:57`: `unmount()` disconnects `S.observer`, removes the `seven:themechange` listener and
`S.titleHandler`, removes `S.bar`, sets `S.root=null`, strips `.seven-rpg-copy*` nodes.
It **does not clear `S.worldEngine/worldSession/canonEngine/canonSession`.**
So today: exit → re-enter keeps state *only because the closure survives*. This is accidental
continuity, not a contract. Any future hydration added to `mount()` must reset these fields, or a
stale pre-restart session will be silently resurrected over a rehydrated one.

### Seam B — the exit button goes through the hub, not through RPG
`rpg.js:53`: `[data-rpg-exit].onclick = () => r.SevenWorkspaces && r.SevenWorkspaces.close()`.
`release/workspaces/hub.js:1` (single-line module): `close()` calls `old.unmount()`, sets `S.active='chat'`,
deletes `dataset.sevenWorkspace` / `sevenSpecialist`, does `n.innerHTML=''`, then `chat(true)`.
`open('rpg')` mirrors it: unmount old → `chat(true)` → `n.innerHTML=''` → `dataset.sevenWorkspace='rpg'`.
`n.innerHTML=''` destroys the whole workspace subtree, so **every DOM-derived RPG fact is gone**; only
`S.*Session` closures survive. If any future renderer reads from the DOM instead of `S`, exit destroys it.

### Seam C — `hub.open()` is `async` with a silent chat fallback
`hub.js:1`: `async function open(kind){ ... try{...}catch(e){ ... S.active='chat'; ... chat(true); ... } }`.
A throw during RPG hydration (bad JSON in storage, engine unavailable) **silently drops the user back into
Chat with no notice**. RPG-04 would fail invisibly rather than loudly.

### Seam D — no save-on-background hook anywhere
No `visibilitychange`, `pagehide`, `freeze`, `resume`, `App.addListener`, or Android `onPause` hook exists
in any web asset. On Android the WebView can be frozen/killed while backgrounded; without a foreground
flush, the last N beats are lost even after autosave is added.

### Seam E — the shell actively suppresses RPG titles (integration conflict)
`release/workspaces/seven-shell-final.js:67` consumes `r.SevenRpgWorkspace`, and a later block in the same
file injects `#seven-no-rpg-titles` CSS hiding `[data-rpg-title-toggle],[data-rpg-current-title],[data-title-kind],
[data-title-num],[data-title-name],[data-title-record],[data-title-preview]`, plus a **capture-phase**
`d.addEventListener('seven:rpg-title-recorded', e => e.stopImmediatePropagation(), true)`.
Recorded titles are part of RPG-04 "recent state" — they are currently suppressed in the integrated shell,
so a restore test that only checks DOM visibility will fail (or, worse, be written to ignore the symptom).

### Seam F — hardware Back is not mapped to workspace close
`hub.js:1` `close()` is only reachable from a button. No `popstate`/`history` entry is pushed when entering
RPG, and no `@capacitor/app` backButton listener exists. On Android, Back leaves the WebView/app rather than
exiting RPG, so the exit path that RPG-04 depends on is not the path a user takes on device.

### Seam G — keyboard/IME is unhandled
No `visualViewport`, `focusin`/`focusout`, or scroll-into-view logic exists. `rpg.js:53` inserts the RPG bar
**immediately before `.input-area`**, so at 360dp with the IME open the bar + drawer + composer compete for
the same ~200px of visible height. Direct RPG-07 clipping risk.

### Seam H — device-side debug is off
`capacitor.config.json`: `loggingBehavior:"none"`, `android.webContentsDebuggingEnabled:false`.
Any device evidence **must** come from instrumentation return values + screenshots (the pattern already used
in `apk/materialize-android-visual-test.cjs` via `js(webView, ...)`), not from console/logcat or CDP.

---

## 3. What Android tests exist today

Single source of device truth: `apk/materialize-android-visual-test.cjs` (materializes Java instrumentation:
`ActivityScenario`, `AndroidJUnit4`, `WebView` JS eval with a 12s latch — lines 2–29).

| Capability | Present? | Evidence |
|---|---|---|
| Night theme assertions | ✅ | `:89` `theme(webView,"night")`, `:91` `--s-bg` computed-style check on `#seven-app`/`.main`/`.composer`, `:161-162` `SevenTheme.setPreference('night')` + `dataset.sevenTheme==='night'` |
| Arabic RTL assertions | ✅ (sidebar only) | `:129` sets `lang='ar-IQ'`, `dir='rtl'`; `:130` waits for computed `direction==='rtl'`; `:132` sidebar `r.left>=innerWidth-2`; `:135` sidebar+backdrop in-bounds; `:136` `shot("sidebar-rtl-night")`; `:141` long-chat jump; `:143` `shot("arabic-rtl")` |
| Overflow / clipping assertions | ✅ (settings only) | `:112-117` tabpanel identity + `m.scrollWidth<=m.clientWidth+1 && r.left>=-2 && r.right<=innerWidth+2` |
| Animation-scale-off assertions | ✅ | `:48-50` `assertZeroScale` for `window/transition/animator` |
| **RPG workspace opened on device** | ❌ | `:129` explicitly calls `SevenWorkspaces.close()` before the RTL block; RPG is never opened in any instrumentation method |
| Small/compact viewport metrics | ❌ | Assertions are all relative to `innerWidth` on default emulator metrics; no explicit 360×640 / 320dp `wm size`/`wm density` override, no `visualViewport.height` check |
| Keyboard / IME | ❌ | no `windowSoftInputMode`, `visualViewport`, or focus-shrink assertion anywhere |
| Back button | ❌ | no `Espresso.pressBack()`, no `InstrumentationRegistry` back invocation |
| Reload / restore | ❌ | no `webView.reload()`, no storage assertion |
| Process death / cold start | ❌ | no `ActivityScenario.recreate()`, no `am force-stop` |
| Storage corruption / quota | ❌ | n/a anywhere in repo |

**Adjacent (non-device) coverage:**
- `all.cjs:6` — `releaseTests` list: `embedded-credentials.test.cjs`, `contrast.test.cjs`, `static-audit.cjs`,
  `canon-simulator.test.cjs`, `world-runtime.test.cjs`, `research-runtime.test.cjs`, `release-verify.cjs`.
  **No RPG test file exists.**
- `release/release-verify.cjs` — the only RPG assertion in the suite; it reads
  `[data-rpg-world-name]`, `[data-rpg-state]`, `[data-rpg-title-toggle]`, `[data-rpg-exit]` label text.
  Pure label presence. Zero persistence, zero lifecycle.
- `release/world-runtime.test.cjs` / `canon-simulator.test.cjs` cover the *engines* (`SevenWorld`,
  `SevenCanon`) headlessly — they never mount `SevenRpgWorkspace`, so `mount`/`unmount`/`snapshot`
  are effectively untested.
- CI: `.github/workflows/seven-tests.yml:28-32` installs Playwright chromium then runs `node all.cjs`.
  `playwright@1.63.0` is already a devDependency ⇒ **compact-viewport / reload / restart tests can run in
  CI today with zero new dependencies.** `.github/workflows/android-apk.yml` covers build/verify only.

---

## 4. Missing tests

**RPG-04 (Persistence) — all missing:**
1. Exit RPG → re-enter: active session, recent state, current scene continuity (`.seven-team/cohesion/RPG_V2_PRODUCT_CONTRACT.md:104`).
2. Reload / WebView recreation restores session from storage.
3. Android process death → cold start restores the same session.
4. Corrupted / truncated / wrong-schema stored payload → safe reset + user-visible Arabic notice (no silent Chat fallback, per Seam C).
5. Autosave fires on every verified commit (`commitVerifiedBeat`, `applyVerifiedDelta`) and on `seven:rpg-title-candidate` → `autoTitle`.
6. Save-on-background flush (`visibilitychange`→hidden / `pagehide`).
7. Pack re-import invalidates prior stored session (no stale-state resurrection, per Seam A).
8. Exit via hardware Back preserves state.

**RPG-07 (Mobile UX) — all missing for RPG:**
9. 360×640 compact viewport, night theme: `.seven-rpg-chatbar`, brand, title pill, actions not clipped or overlapping.
10. Arabic RTL inside the RPG bar/drawer: grid order, `.seven-rpg-copy` placement, `Copy message / نسخ الرسالة` label, drawer field ordering (RTL coverage today stops at the sidebar and *closes* workspaces first, `:129`).
11. IME open: composer + RPG bar remain visible via `visualViewport`.
12. Touch target sizes ≥44px for `.seven-rpg-mini` / `.seven-rpg-copy` at compact width.
13. Reduced-motion honored by the RPG bar specifically (`rpg.js:15` declares it but nothing asserts it).
14. Night-theme token resolution for `var(--sb-*)` inside `.seven-rpg-*` (bar uses shell tokens; untested under night).

---

## 5. Exact files / tests required

**New — CI-runnable, no new deps (highest value, do first):**
- `release/rpg-persistence.test.cjs` — Playwright chromium (`playwright@1.63.0`), viewport `360×640`,
  deviceScaleFactor 3, `colorScheme:'dark'`. Stubs `SevenWorld.createEngine` / `SevenCanon.createEngine`
  with deterministic in-test engines (mirroring how `release/world-runtime.test.cjs` drives engines headlessly).
  Assertions: commit beat → reload page → `SevenRpgWorkspace.state.worldSession` deep-equals pre-reload;
  exit/re-enter via `SevenWorkspaces.close()` / `open('rpg')` continuity; corrupted storage → Arabic notice,
  no throw; title events persisted.
- `release/rpg-viewport.test.cjs` — same harness, RTL + night + compact geometry: bar `scrollWidth<=clientWidth`,
  drawer fields in-bounds, copy button present with Arabic label, tap targets ≥44px.

**Modified — wiring + config:**
- `all.cjs:6` — append `release/rpg-persistence.test.cjs`, `release/rpg-viewport.test.cjs` to `releaseTests`.
- `release/release-verify.cjs` — extend the existing RPG block: assert persisted key present and post-reload
  `[data-rpg-state]` / `[data-rpg-world-name]` text matches pre-reload.
- `apk/materialize-android-visual-test.cjs` — add instrumentation method(s): open RPG, commit a verified beat,
  assert stored payload non-null, `webView.reload()`, assert restored state, then measure the RPG bar under
  night + `ar-IQ` RTL + compact metrics and `shot("rpg-night-rtl-compact")`. Reuse `js()`, `waitFor()`, `shot()`.

**Modified — production (needs a builder slot; NOT in this audit's write scope):**
- `release/workspaces/rpg.js` — add `STORAGE_KEY` (e.g. `seven.rpg.v2.session`), `serialize()`/`hydrate()`
  off the existing `snapshot()`, autosave in `commitVerifiedBeat`/`applyVerifiedDelta`/`recordTitle`/`autoTitle`,
  `hydrate()` at the top of `mount()` (with an explicit reset of `S.*Session`/`S.*Engine`), and a
  `visibilitychange`/`pagehide` flush. Add try/catch around hydrate to satisfy Seam C.
- `release/workspaces/hub.js:1` — push a history entry on `open('rpg')` and make `close()` the `popstate` handler
  so Android Back exits RPG (Seam F); surface a notice instead of silently falling back to Chat.
- `apk/patch-android.cjs` (verify before changing — **I did not confirm current `windowSoftInputMode`**):
  ensure `android:windowSoftInputMode="adjustResize"` on the launch activity so the IME doesn't cover the composer.
- `release/workspaces/seven-shell-final.js` — reconcile the `#seven-no-rpg-titles` strip / capture-phase suppressor
  with RPG-04's "recent state" requirement (Seam E), or explicitly scope it out in the contract.

---

## 6. Test scenarios → RPG-04 / RPG-07 mapping

| ID | Scenario | Gate | Where it runs |
|---|---|---|---|
| S1 | Commit verified beat → `SevenWorkspaces.close()` → `open('rpg')` → session/current title identical | RPG-04 | `release/rpg-persistence.test.cjs` |
| S2 | Commit → `page.reload()` → session restored | RPG-04 | `release/rpg-persistence.test.cjs` |
| S3 | Commit → `ActivityScenario.recreate()` / cold start → session restored | RPG-04 | `apk/materialize-android-visual-test.cjs` |
| S4 | Corrupt stored JSON → app boots to Chat with Arabic notice, no silent hang | RPG-04 | `release/rpg-persistence.test.cjs` |
| S5 | Back-press while in RPG → returns to Chat, session intact | RPG-04 | `apk/materialize-android-visual-test.cjs` |
| S6 | 360×640 + night: `.seven-rpg-chatbar` no clip, actions reachable | RPG-07 | `release/rpg-viewport.test.cjs` |
| S7 | `ar-IQ` + RTL + night: drawer field order, `نسخ الرسالة` copy affordance | RPG-07 | `release/rpg-viewport.test.cjs` + instrumentation |
| S8 | IME open: `visualViewport.height` keeps composer + RPG bar visible | RPG-07 | `apk/materialize-android-visual-test.cjs` |
| S9 | Tap targets ≥44px; `prefers-reduced-motion` honored for `.seven-rpg-*` | RPG-07 | `release/rpg-viewport.test.cjs` |

---

## 7. First implementation / evidence slice

**Slice 1 (one builder session, one day):** prove RPG-04 in CI without touching Android tooling.

1. Add `STORAGE_KEY='seven.rpg.v2.session'` + `serialize()`/`hydrate()` to `release/workspaces/rpg.js`,
   autosave inside `commitVerifiedBeat` / `applyVerifiedDelta` / `recordTitle` / `autoTitle`, hydrate in
   `mount()` after an explicit `S.*Engine/S.*Session` reset, plus a `visibilitychange`/`pagehide` flush.
2. Add `release/rpg-persistence.test.cjs` (Playwright, S1 + S2 + S4) and wire it into `all.cjs:6`.
3. Extend the existing RPG block in `release/release-verify.cjs` to assert the stored key + restored labels.

This converts RPG-04 from "accidental in-realm continuity" to a CI-enforced contract and produces
reproducible evidence in `.github/workflows/seven-tests.yml` (Playwright chromium is already installed at
`seven-tests.yml:28-30`).

**Slice 2 (follow-on):** S3 + S5 + S8/S9 inside `apk/materialize-android-visual-test.cjs` on the emulator,
plus the `hub.js` Back mapping and the `windowSoftInputMode` check.

---

## 8. Risks & dependencies

- **Write-scope:** my mandate is audit-only; every item in §5 marked "production" needs a builder slot (RPG-04 builder per contract L118). Coordination risk: `rpg.js`, `hub.js`, and `seven-shell-final.js` are all single-line-ish dense modules — edits are merge-hostile, so one owner should do all three.
- **No native storage available:** `capacitor.config.json` has no Preferences/Filesystem plugin. Adding one is a dependency + build-pipeline change (`android:generate`) — a real schedule risk. WebView `localStorage` under `androidScheme:"https"` persists across restarts and is the correct zero-new-dependency choice; it does *not* survive "clear app data", and that limitation should be stated in the contract rather than tested around.
- **Seam E trap:** if title persistence lands while `seven-shell-final.js` still strips `[data-rpg-*]`, S1/S2 UI assertions will fail for reasons unrelated to storage. Sequence the title-suppression decision **before** the visibility assertions.
- **Emulator cost:** Slice 2 assertions run only on the emulator in `android-apk.yml`; each `js()` has a 12s latch (`materialize-android-visual-test.cjs:29`). Keep device scenarios few and assertion-dense.
- **Debug off:** `webContentsDebuggingEnabled:false` and `loggingBehavior:"none"` mean no CDP/logcat debugging for restore bugs — instrumentation return values are the only channel; make assertions return booleans, never just `shot()`.
- **Engine dependency:** hydration requires `SevenWorld`/`SevenCanon` to be loaded *before* `SevenRpgWorkspace.mount()` (`rpg.js:24` throws `'SevenWorld runtime unavailable'`). Script load order in the release HTML becomes a correctness dependency for S2/S3 and must be asserted, not assumed.
- **Sibling waves:** B01/other agents may be touching `hub.js` or the release HTML in parallel — lock before Slice 1.

---

## Bottom line

Today RPG has **no persistence path whatsoever** — only a manual JSON pack import (`rpg.js:39`).
Exit/re-entry continuity survives purely by closure accident (`rpg.js:5`, `rpg.js:57`), and any process
restart or WebView reload is a total loss. Device-side, the instrumentation suite
(`apk/materialize-android-visual-test.cjs`) proves night theme, Arabic RTL, and overflow for the shell and
sidebar — but **never opens the RPG workspace at all** and has no reload, back-button, keyboard, or
process-restart assertions. RPG-04 and RPG-07 are both effectively unevidenced; §7 Slice 1 is the
cheapest path to hard evidence.

WAVE01=COMPLETE
