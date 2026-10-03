# A03 — Localization / Navigation / Dialog Cohesion Audit (Wave 01A)

Owner: A03 (Team A) · Scope: Chat, Search, Research, Coding, Settings, RPG, Self-Dev
Write scope: `.seven-team/reports/wave-01/A03-localization-cohesion.md` (this file only). Read-only elsewhere.

## 1. Files inspected (evidence base)

- `release/workspaces/` — `hub.js`, `seven-shell.js`, `seven-shell-final.js`, `ui-polish-fixes.js`, `coding.js`, `research.js`, `rpg.js`, `generated-ui.js`, `rtl.css`
- `release/` — `beta-ui-runtime.js`, `ui-runtime.js`, `ui-polish-loader.js`, `github-self-dev.js`, `brand/runtime.js`, `attachment-runtime.js`, `motion-runtime.js`, `control-bridge.js`, `control-runtime.js`
- `release/workspaces/` listing confirms `research-v2.js` (referenced by `hub.js` CFG) is NOT present in the tree; only `research.js` exists (recorded as an absence, per protocol).

## 2. Verified inconsistencies (exact evidence)

### 2.1 Parallel shell/navigation systems (two shells + a loader)
- `seven-shell.js` L45 `boot()` dispatches `seven:shellready`; `seven-shell-final.js` L85 `boot()` dispatches `seven:shellfinalready`. Both observe `d.body` with a full `MutationObserver({childList:true,subtree:true})` and both listen to `seven:workspacechange` / `seven:themechange`.
- `ui-polish-loader.js` exposes three parallel loaders `loadShell()` (seven-shell.js), `loadFinal()` (seven-shell-final.js), and `load()` (ui-polish-fixes.js) — three independent async graphs that can all resolve and run `sync()` on the same DOM.
- Both shells build a `.seven-shell-primary-nav`: `seven-shell-final.js` L47-50 creates `navButton('chat'|'coding'|'research'|'rpg')` + a Self-Dev button; `github-self-dev.js` L482-483 independently appends its own `[data-seven-github-selfdev]` nav button to the same `.seven-shell-primary-nav`. `seven-shell.js` (older) has no primary-nav builder but does create `.seven-shell-section-label`, `.seven-shell-empty`, `.seven-shell-message-actions`, `.seven-shell-copy`, `.seven-shell-jump`, `.seven-shell-backdrop`.
- `seven-shell-final.js` L83 `installEvents()` registers a capture-phase `seven:rpg-title-recorded` handler that calls `e.stopImmediatePropagation()` and `stripRpgTitles()` — this can suppress rpg.js title handling and is a cross-system event race.

### 2.2 Duplicated / divergent localization strategies (5+ independent t() helpers)
Identical inline helper re-declared per file with no shared catalog:
- `seven-shell.js` L8 `function isAr(){...startsWith('ar')}` (named `isAr`)
- `seven-shell-final.js` L6-7 `const AR=...` / `const T=(en,ar)=>AR()?ar:en`
- `coding.js` L1, `rpg.js` L18-19, `ui-polish-fixes.js` L4 — same `AR`/`T` pair
- `github-self-dev.js` uses a separate `L(en,ar)` helper (L424, L483)
- `beta-ui-runtime.js` uses a separate `Q(en,ar)` helper (L36)
- `research.js` has NO localization at all: `renderSummary()` (L~10) writes literal English labels `'Status','Claims','Sources','Gaps','Conflicts'` and `status()` returns `'UNKNOWN'`/`'PASS'`/`'EMPTY'` raw into the DOM — untranslated in Arabic.

### 2.3 Concrete untranslated / hardcoded strings (Arabic lang misses these)
- `beta-ui-runtime.js` L19: theme button builds `'Auto · '`, `'Day'`, `'Night'`, `'Theme: '` — English-only, never passed through `Q()`. This is the day/night control, so the day-night toggle is untranslated in AR.
- `seven-shell.js` L23 `ensureEmpty()` sets `innerHTML` with hardcoded English `'What can Seven do for you?'`, `'Start a new conversation, or type below...'`, `'New chat'` (the same strings are localized in `localizeShell()` L17, so a race between `ensureEmpty` and `localizeShell` yields transient English).
- `seven-shell.js` L35 `ensureMessageActions()` sets `copy.innerHTML='...<span>Copy</span>'` (hardcoded English label), localized afterward by `localizeShell()` L18.
- `ui-polish-fixes.js` L24-25 `createNewChat`/`sendMessage` set `roomTitles[id]='New Chat'` (English-only literal) while L21 localizes the visible title via `T('New Chat','محادثة جديدة')` — the stored title is English and leaks into room lists/history in AR.
- `research.js` summary metric labels (above) and `rpg.js` L34 `notice('Auto title: '+out.title,...)` English-only log.

### 2.4 RTL / direction assumptions
- `rtl.css` is the only dedicated RTL stylesheet (loaded by `hub.js` `css()` as `seven-workspaces-rtl-style`). It scopes under `html[dir=rtl]` for `.seven-ws-kicker`, `.seven-ws-head h1`, `.seven-ws-actions`, `.seven-ws-task-actions` and forces `direction:ltr;unicode-bidi:isolate` on `.seven-ws-code,.seven-ws-fingerprint` and `unicode-bidi:plaintext` on source/output/claim/evidence/task nodes — good, but ONLY covers `seven-ws-*` classes.
- Shell-level widgets have NO RTL rules: `.seven-shell-primary-nav`, `.seven-shell-message-actions`, `.seven-shell-copy`, `.seven-shell-jump`, `.seven-shell-backdrop`, `.seven-model-picker`/`.seven-model-panel`, `.seven-room-search-wrap` (all created by shell/ui-polish) are absent from `rtl.css`. Icons ⧉ ↓ ⌘ ⌕ ✦ ⌁ are direction-neutral but flex row ordering relies on DOM order; `justify-content:flex-start` overrides exist only for `seven-ws-*`.
- AR detection is `lang.startsWith('ar')` only — it never checks `document.dir`. If the host sets `dir="rtl"` without `lang="ar"` (or vice-versa), `AR()` returns false and `rtl.css` selectors (`html[dir=rtl]`) won't match the same condition the JS used, so labels and layout can disagree.

### 2.5 Parallel modal/dialog systems
- `ui-polish-fixes.js` L12: custom model picker `role="dialog" aria-modal="false"` with `aria-haspopup="dialog"` trigger, `hidden`-toggled panel, custom `×` close button.
- `seven-shell-final.js` L12/L78: targets `.settings-modal,.settings-panel,.modal` and stamps `data-seven-shell-surface="settings"` — a second, settings-modal convention distinct from the model-picker dialog.
- `github-self-dev.js` L424: third dialog, `role="dialog" aria-modal="true"` with `.seven-gh-backdrop` + `.seven-gh-panel`, custom close.
- No shared dialog primitive / focus-trap / Escape contract; Escape handling is duplicated (`seven-shell.js` L28 keydown for sidebar; `attachment-runtime.js` L29 keydown for attachments; `seven-shell-final.js` keydown for Ctrl+/). Three different modal stacks can be open concurrently with no coordinated z-index/stack manager.

### 2.6 State-sync races
- `seven-shell-final.js` L83 re-listens `seven:workspacechange` with `setTimeout(sync,0)` while `seven-shell.js` L45 listens synchronously — two shells can mutate the same nodes in different microtask order; `ui-polish-fixes.js` L31 also listens to `seven:workspacechange` → `syncDynamic`.
- `seven-shell-final.js` L83 capture handler `stopImmediatePropagation()` on `seven:rpg-title-recorded` races `rpg.js` L34 dispatcher / L55 `S.titleHandler`.
- `hub.js` `root()` creates `.seven-workspace-root` with `aria-live="polite"` while each workspace (`coding.js`, `research.js`, `rpg.js`) also re-renders its own subtree via its own `MutationObserver` — nested live regions + per-file observers can double-announce.
- `ui-polish-fixes.js` L20 `updateRoomListUI` mutates global `rooms`/`roomTitles` inside a `finally`, racing `beta-ui-runtime.js` stop/observer paths that read room state.

## 3. One canonical strategy (recommended)

**Localization:** single `SevenI18N` module exposing `t(key, vars)` backed by one JSON catalog per locale (`en`, `ar`), plus `isRTL()` = `document.dir === 'rtl' || /^ar/i.test(document.documentElement.lang)`. Every runtime imports it; delete the five inline `AR`/`T`/`isAr`/`L`/`Q` helpers. All user-visible strings (including `beta-ui-runtime` Day/Night/Auto, `research.js` metric labels, `ui-polish-fixes` `'New Chat'` stored title, shell empty-state/copy strings) must resolve through `t()`.

**Navigation:** one shell owner. `seven-shell-final.js` is the most complete (primary-nav, workspace chip, syncNav with `aria-current`); retire `seven-shell.js` nav/empty-state builders and have `github-self-dev.js` register its Self-Dev button through a single `SevenShell.registerNavButton(id, icon, label, onClick)` API instead of directly appending to `.seven-shell-primary-nav`.

**Dialogs:** one `SevenDialog` primitive (`role="dialog"`, focus trap, Escape-to-close, single backdrop, stack manager with z-index). Migrate model picker (`ui-polish-fixes.js`), settings modal (`seven-shell-final.js`), and Self-Dev panel (`github-self-dev.js`) onto it.

**Events:** single `seven:shellchange` bus; remove `stopImmediatePropagation()` on `seven:rpg-title-recorded`; dedupe the body-wide `MutationObserver`s into one shared observer with registered handlers.

## 4. Migration order
1. Introduce `SevenI18N` + `isRTL()`; route `beta-ui-runtime` Day/Night and `research.js` labels first (highest-visibility untranslated strings).
2. Consolidate `seven-shell.js` → `seven-shell-final.js` (single shell owner; single `seven:shellchange`).
3. `github-self-dev.js` nav + dialog via `SevenShell.registerNavButton` / `SevenDialog`.
4. `ui-polish-fixes.js` model picker + zero-room facade onto `SevenDialog` / `SevenI18N`.
5. Extend `rtl.css` to cover all `.seven-shell-*`, `.seven-model-*`, `.seven-room-search-*`, `.seven-gh-*` selectors; switch AR detection to `isRTL()`.
6. Merge body-wide `MutationObserver`s; remove `stopImmediatePropagation` race.

## 5. Acceptance cases (Arabic RTL / day-night / mobile)
- AR RTL: set `<html lang="ar" dir="rtl">`; assert every nav label, empty-state, copy button, model picker, theme toggle, and research metric renders Arabic (no `'Day'/'Night'/'Auto'/'Status'/'Claims'/'Copy'/'New Chat'` literals); assert flex row order mirrors and `rtl.css` selectors fire for shell widgets.
- Day/Night: toggle `data-se7en-theme` day↔night; assert theme button label is localized, brand SVG swaps (`brand/runtime.js`), `meta[name=theme-color]` updates, no English `Theme:` string remains.
- `lang` vs `dir` mismatch: set `lang="ar"` without `dir="rtl"` and vice-versa; assert `isRTL()` and CSS agree (no half-localized layout).
- Mobile (≤820px): open sidebar via `.menu-toggle`, tap a room item, assert sidebar auto-closes (`seven-shell.js` L28) and primary-nav remains reachable; model picker dialog is scrollable and Escape closes it; no dialog stack collision with Self-Dev panel.
- Race: fire `seven:workspacechange` + `seven:rpg-title-recorded` together; assert exactly one shell `sync()` runs and rpg title records once (no `stopImmediatePropagation` suppression).

## 6. Files likely affected
`release/workspaces/{seven-shell.js, seven-shell-final.js, ui-polish-fixes.js, coding.js, research.js, rpg.js, hub.js, rtl.css}`, `release/{beta-ui-runtime.js, ui-runtime.js, ui-polish-loader.js, github-self-dev.js, brand/runtime.js, attachment-runtime.js, motion-runtime.js}`.

## 7. Risks / dependencies
- `hub.js` CFG references `research-v2.js` which is absent from the tree — Research workspace load may 404; confirm intended file (`research.js` vs `research-v2.js`) before migration.
- Retiring `seven-shell.js` is blocked by `ui-polish-loader.js` `loadShell()` and any HTML that only loads `seven-shell.js`; both loaders and the host HTML must be updated together.
- `stopImmediatePropagation()` on `seven:rpg-title-recorded` may be load-bearing for title stripping; verify `stripRpgTitles()` is idempotent before removing.
- Shared `SevenI18N` must be loaded before all workspaces (add to loader boot order) or `t()` must degrade to English gracefully.
- `rtl.css` extension must not break existing `seven-ws-*` bidi isolation for code/paths.

WAVE01=COMPLETE
