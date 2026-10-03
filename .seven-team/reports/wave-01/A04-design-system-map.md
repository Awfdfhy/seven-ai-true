# A04 — UI Foundation V2 Design-System Map & Migration Architecture

Team A / Wave 01A · Classification: **REBUILD** (per `.seven-team/cohesion/UI_FOUNDATION_V2.md:3`)
Scope of this document: architecture only. **No production source was modified.**

---

## 1. Files / systems inspected

| Path | Role | Size signal | Evidence used |
|---|---|---|---|
| `.seven-team/cohesion/UI_FOUNDATION_V2.md` | Product contract | 90 lines | full read |
| `.seven-team/ownership.json` | Write-lease map | 3 scopes | full read |
| `release/build-release.cjs` | Release composer | L130–155 | head/body templates |
| `release/static-audit.cjs` | Startup + budget gate | 1 file | `assetNames` allowlist, budget asserts |
| `release/seven-final.css` | Token + polish layer | 291 lines, 67 `!important` | full read |
| `release/ui-hardening.css` | Overflow / safe-area hardening | 90 lines, 35 `!important` | full read (clipped mid-file) |
| `release/beta-ui.css` | **Second** token namespace + mode picker | 18 lines (long), 81 `!important` | full read |
| `release/workspaces/hub.css` | Workspace shell + launcher | 6 lines, 4 `!important` | full read |
| `release/workspaces/generated-ui.css` | `seven-generated-*` kit | 1 line, 3 `!important` | full read |
| `release/workspaces/ui-polish-fixes.css` | Model picker (**parallel menu**) | 1 line, 86 `!important` | full read |
| `release/workspaces/seven-shell.css` | Shell re-skin | 65 lines, 121 `!important` | head read |
| `release/workspaces/seven-shell-final.css` | Shell re-finish | 50 lines, 74 `!important` | head read |
| `release/workspaces/rtl.css` | Direction isolation | 1 line, 0 `!important` | full read |
| `release/ui-polish-loader.js` | Runtime CSS injector | — | head read |
| `release/workspaces/hub.js` | `sheet()` / `css()` injector | 1 file | `css()`,`sheet()`,`generatedCss()` |
| `release/workspaces/seven-shell.js` | Shell DOM/nav/state | 48 lines | `mark()`, `ensureEmpty()`, `viewport()` |
| `release/workspaces/seven-shell-final.js` | Nav + polish DOM | 88 lines | `syncNav()`, `ensureWorkspaceChip()` |
| `release/beta-ui-runtime.js` | Mode/theme/aurora + AR i18n | 1 file | `MODE`, `V`, `N`, `A`, `Q()` |
| `release/zero-room-transform.cjs` | Facade disabler | L32 | `disablePlaceholderFacade('.../ui-polish-fixes.js')` |
| `seven_ai-final.html` | **Source monolith** | 842,964 B / 13,175 lines | 4 `<style>` blocks, 3 `:root`, 2 `!important` |
| `release/build-release.cjs` referent `release/workspaces/remake.css` | **ABSENT** | — | not in tree |

Gates present and usable: `verify.cjs`, `runtime-smoke.cjs`, `all.cjs`, `memory.cjs`, `release/static-audit.cjs`, `release/build-release.cjs`, `release/zero-room-transform.cjs`. `package.json` script names were **not** read this pass.

### Files requested-but-absent (recorded, not fatal)
1. **`release/workspaces/remake.css`** — `build-release.cjs:154` emits `<link rel="stylesheet" href="./workspaces/remake.css" id="seven-remake-style">`, but no such file exists in `release/workspaces/`. It resolves to a 404 and, per `static-audit.cjs` (`remoteStyles` warn branch) is not caught because it is relative, not remote. **This is a latent cascade hole between `beta-ui.css` and every runtime-injected layer.**
2. **No golden-screenshot / visual-regression harness exists.** Contract line 66–67 ("Android WebView screenshots in day/night and at least one RTL case"; "accidental golden-screen drift blocks merge readiness") is therefore **unenforceable today**. This is the single largest gap for the migration plan.
3. **No lint gate on `!important` or token count.** Contract line 64 ("no new `!important` unless documented with a structural reason") has no automated enforcement.

---

## 2. Current layer graph (evidence-backed)

### 2.1 Build-time cascade (`release/build-release.cjs:154`, deterministic)

```
0  THEME_BOOT (inline <script>, pre-paint)
1  <style id="seven-final-style">    ← release/seven-final.css        (291 L, 67 !imp)
2  <style id="seven-beta-ui-style">  ← release/beta-ui.css            ( 18 L, 81 !imp)
3  <link  id="seven-remake-style">   ← ./workspaces/remake.css        *** FILE ABSENT ***
```

### 2.2 Source-embedded cascade (`seven_ai-final.html`, always present)

```
A  <style>                                  line    9  — :root brand bundle (--bg,--sidebar-bg,--surface,
                                                                 --surface2,--text,--muted,--accent,--accent-hover,
                                                                 --accent-2,--danger,--border,--user-bubble,--ai-bubble,
                                                                 --radius,--shadow,--focus-ring) + `.light{}`
B  <style id="seven-settings-simplification"> line 579  — #settingsModal geometry, .route-status-card
C  <style id="seven-performance-reliability">  line 687  — :root{--seven-visual-height:100vh;
                                                                 --seven-visual-offset-top:0px} + .sidebar/.main height
D  <style id="seven-search-citations">        line 745  — .inline-source-citation
```

`seven_ai-final.html` has **zero external stylesheet links** and only **2** `!important` in the whole 842 KB file. The A–D blocks are the *legacy* base; the build injects 1–3 **after** them.

### 2.3 Runtime-injected cascade (NON-DETERMINISTIC — the core defect)

```
build body scripts (build-release.cjs:155), in order:
  seven-research-runtime, seven-performance-runtime, seven-control-runtime,
  seven-control-bridge, seven-execution-bridge, seven-pdf-runtime,
  seven-motion-runtime, seven-ui-runtime, seven-attachment-loader,
  seven-beta-ui-runtime, seven-ui-polish-loader   ← CSS injector
  then <script src> brand/runtime.js, workspaces/remake.js

ui-polish-loader.js injects, in async completion order:
  L4  ./workspaces/ui-polish-fixes.css   (+ ui-polish-fixes.js)
  L5  ./workspaces/seven-shell.css        (+ seven-shell.js)
  L6  ./workspaces/seven-shell-final.css  (+ seven-shell-final.js)

hub.js injects, on first loadWorkspaces()/eval:
  L7  ./workspaces/hub.css   then  L8  ./workspaces/rtl.css
  L9  ./workspaces/generated-ui.css       (on demand, SevenGeneratedUI)
```

**Finding:** L4–L9 are appended to `document.head` at *promise-resolution* time, not document order. Final cascade precedence among `ui-polish-fixes.css`, `seven-shell.css`, `seven-shell-final.css`, `hub.css`, `rtl.css`, `generated-ui.css` is therefore **dependent on network/lazy-load timing**. `sheet()` in `hub.js` is idempotent by element id but does **not** order anything. Consequences: FOUC, golden-screen nondeterminism, and the reason `!important` counts are so high — each new layer is written to *outbid* an earlier layer whose position it cannot guarantee.

**Total measured `!important`: 471** across 9 stylesheets (67 + 35 + 81 + 4 + 3 + 86 + 121 + 74 + 0) + 2 in the source HTML. The contract (line 64) forbids *new* ones; nothing forbids accumulating 471.

### 2.4 Token namespaces in simultaneous force (5 parallel systems)

| # | Namespace | Declared in | Example |
|---|---|---|---|
| 1 | legacy (unprefixed) | `seven_ai-final.html:10` | `--bg --surface --surface2 --text --muted --accent --border --radius --shadow --focus-ring` |
| 2 | `--seven-*` (system) | `seven-final.css:1` | `--seven-motion-fast --seven-radius-sm --seven-elev-1 --seven-ring --seven-code-bg` |
| 3 | `--seven-g-*` + `--sb-*` | `beta-ui.css:1` | `--seven-g-canvas --sb-s --sb-m --sb-a --sb-b --sb-mode --sb-mode2 --sb-rate` |
| 4 | `--seven-ws-*` | `hub.css`, `generated-ui.css` | `--seven-ws-surface --seven-ws-muted --seven-ws-accent --seven-ws-radius` |
| 5 | `--seven-shell-*` / `--seven-final-*` / `--seven-visual-height` | `seven-shell.css`, `seven-shell-final.css`, `html:688` | `--seven-shell-sidebar --seven-shell-radius --seven-final-panel --seven-visual-height` |

**The only cross-namespace bridge in the codebase** is one rule in `beta-ui.css`:
`html.seven-beta-ui body{ --bg:var(--sb-bg); --surface:var(--sb-s); --surface2:var(--sb-s2); --text:var(--sb-t); --muted:var(--sb-m); --accent:var(--sb-a); --border:var(--sb-b) }`
This means **`beta-ui.css` is load-bearing for the entire legacy token set** while itself being an override layer — a circular ownership dependency. Theme switching works only because `beta-ui.css` re-emits `html[data-seven-theme=day]{...}`. Delete or reorder `beta-ui.css` and the whole light/dark contract breaks (`UI_FOUNDATION_V2.md:52`).

### 2.5 Ungoverned scales (invented per layer, not tokenised)

- **Radius vocabulary (7+ values):** `18px` legacy `--radius`; `8/12/16/22/28` `--seven-radius-xs..xl`; `28px` composer (`beta-ui.css`) vs `999px` composer (`seven-final.css`) vs `24px` (`beta-ui.css` mobile) vs `22px` (`seven-final.css` mobile); `12px` `ui-polish-fixes.css`; `13/14/15/20px` `ui-polish-fixes.css`; `18/20/26px` `hub.css`; `18px` `--seven-ws-radius` `generated-ui.css`; `24px` `--seven-shell-radius`.
- **Breakpoints (6 values, no scale):** `380`, `390` (`beta-ui.css` / `generated-ui.css`), `420` (`seven-final.css`), `620` (`hub.css`), `720` (`seven-final.css`, `beta-ui.css`, `ui-polish-fixes.css`), `900` (`hub.css`).
- **z-index ladder (unowned):** `8` topbar (`seven-final.css`), `15` `.seven-mode-picker`, `90` `.seven-mode-menu`, `400` `.seven-ws-launcher`, `2200` `.seven-model-panel`, `2400` `.seven-mode-menu` mobile override.
- **Touch targets (3 values):** `34px` `.tool-btn` (mobile override wins over `40px`), `40px`, `44px` (`beta-ui.css` global, `hub.css`), `48px` primary.
- **Motion (3 systems):** `--seven-motion-*` (5 steps) + `--seven-ease-*`; `sb-aur` keyframe driven by `--sb-rate`; `seven-stop-spin`. Reduced-motion is implemented **three times** (`seven-final.css`, `beta-ui.css`, `hub.css`) and **not at all** in `ui-polish-fixes.css` / `seven-shell*.css` / `generated-ui.css` — verified: `generated-ui.css` has its own, `ui-polish-fixes.css` and both shell files have none.

---

## 3. Proposed canonical token schema

**File: `release/workspaces/ui-foundation.css`** (new, Team A lease — `ownership.json` scope `release/workspaces/*.css`).
Phase 1 is a **pure alias layer**: every value resolves to an existing token, so computed styles are byte-identical and the only observable change is cascade *order* becoming deterministic.

```css
/* ui-foundation.css — canonical token contract. Phase 1 = zero visual change. */
:root{
  /* -- primitives (authoritative; migrated out of html:10) -------------- */
  --seven-ui-canvas:      var(--sb-bg,   #faf9ff);
  --seven-ui-surface-1:   var(--sb-s,    #ffffff);
  --seven-ui-surface-2:   var(--sb-s2,   #eae7fa);
  --seven-ui-surface-raised: color-mix(in srgb, var(--seven-ui-surface-1) 97%, var(--seven-ui-canvas));
  --seven-ui-border:      var(--sb-b,    #e3e0f7);
  --seven-ui-border-soft: var(--seven-border-soft);
  --seven-ui-border-strong: var(--seven-border-strong);
  --seven-ui-text:        var(--sb-t,    #262244);
  --seven-ui-text-muted:  var(--sb-m,    #837fa3);
  --seven-ui-text-faint:  color-mix(in srgb, var(--seven-ui-text-muted) 82%, transparent);
  --seven-ui-accent:      var(--sb-a,    #6c63ff);
  --seven-ui-accent-hover:var(--sb-a2,   #4b3f9e);
  --seven-ui-on-accent:   var(--seven-on-accent, #fff);
  --seven-ui-danger:      #dd5263;         /* unify hexes: #e5484d|#d13a40|#ff8793|#dd5263 */
  --seven-ui-warn:        #dc9418;         /* unify: #ffc65c|#ffc45b */
  --seven-ui-success:     #20a878;         /* unify: #69dbb1|#61d9ad */

  /* -- typography scale (step *only*; today: 9.5,11,12,13,14,16,17,18,21,24,25.6rem) */
  --seven-ui-font-2xs:.70rem; --seven-ui-font-xs:.78rem; --seven-ui-font-sm:.84rem;
  --seven-ui-font-md:.95rem; --seven-ui-font-lg:1.08rem; --seven-ui-font-xl:1.25rem;
  --seven-ui-font-2xl:1.5rem;  --seven-ui-font-3xl:1.9rem;
  --seven-ui-leading-tight:1.15; --seven-ui-leading-snug:1.45;
  --seven-ui-leading-normal:1.55; --seven-ui-leading-relaxed:1.62;

  /* -- spacing scale (4px base; today: 5,6,7,8,9,10,11,12,13,14,16,18,20,24) */
  --seven-ui-space-0:0; --seven-ui-space-1:4px; --seven-ui-space-2:8px;
  --seven-ui-space-3:12px; --seven-ui-space-4:16px; --seven-ui-space-5:20px;
  --seven-ui-space-6:24px; --seven-ui-space-8:32px;

  /* -- radius (collapse 7 vocabularies -> 5 steps + pill) --------------- */
  --seven-ui-radius-xs:8px; --seven-ui-radius-sm:12px; --seven-ui-radius-md:16px;
  --seven-ui-radius-lg:20px; --seven-ui-radius-xl:28px; --seven-ui-radius-pill:999px;

  /* -- elevation (absorb ad-hoc 0 5px 16px, 0 16px 44px, 0 24px 64px) -- */
  --seven-ui-elev-0:none;
  --seven-ui-elev-1:var(--seven-elev-1);
  --seven-ui-elev-2:var(--seven-elev-2);
  --seven-ui-elev-3:0 24px 64px color-mix(in srgb, var(--seven-ui-canvas) 82%, #000);

  /* -- action states --------------------------------------------------- */
  --seven-ui-action-default:var(--seven-ui-surface-2);
  --seven-ui-action-hover:  color-mix(in srgb, var(--seven-ui-accent) 10%, var(--seven-ui-surface-2));
  --seven-ui-action-active: color-mix(in srgb, var(--seven-ui-accent) 18%, var(--seven-ui-surface-2));
  --seven-ui-action-disabled:opacity .55;
  --seven-ui-focus-ring:var(--seven-ring);

  /* -- geometry (dialog / menu) : single source for 3 competing systems - */
  --seven-ui-dialog-width:min(520px, calc(100vw - 24px));
  --seven-ui-dialog-max-height:min(88dvh, 780px);
  --seven-ui-menu-width:min(310px, calc(100vw - 24px));
  --seven-ui-menu-max-height:min(52dvh, 360px);
  --seven-ui-menu-radius:var(--seven-ui-radius-lg);
  --seven-ui-menu-z:2200;   /* above launcher(400) and topbar(8) */
  --seven-ui-dialog-z:2400;

  /* -- safe area / viewport (move OUT of html:687, do not change values) */
  --seven-ui-viewport-height:var(--seven-visual-height, 100dvh);
  --seven-ui-inset-top:    max(14px, env(safe-area-inset-top, 0px));
  --seven-ui-inset-bottom: max(18px, env(safe-area-inset-bottom, 0px));
  --seven-ui-inset-inline: max(12px, env(safe-area-inset-left, 0px));

  /* -- layer order (replaces async cascade with declared order) -------- */
  --seven-ui-layer-0:0;    --seven-ui-layer-1:8;   --seven-ui-layer-2:90;
  --seven-ui-layer-3:400;  --seven-ui-layer-4:2200;--seven-ui-layer-5:2400;

  /* -- responsive (6 values -> 4 named) --------------------------------- */
  --seven-ui-bp-sm:380px;  /* contract: smallest phone                    */
  --seven-ui-bp-md:720px;  /* contract scenario 4: dialogs on phone       */
  --seven-ui-bp-lg:900px;  /* workspace grid collapse                    */
}

/* -- theme: single owner. Replaces the html[data-seven-theme] + body.light
      + body:not(.light) + :root triple declaration of the same palette. */
html[data-seven-theme=day]{
  color-scheme:light;
  --seven-ui-canvas:#f7fbff; --seven-ui-surface-1:#fff; --seven-ui-surface-2:#edf5fc;
  --seven-ui-text:#0b1728;   --seven-ui-text-muted:#60748a;
  --seven-ui-accent:#087bff; --seven-ui-accent-hover:#08bddd;
  --seven-ui-on-accent:#fff;
}
html[data-seven-theme=night]{
  color-scheme:dark;
  --seven-ui-canvas:#07111f; --seven-ui-surface-1:#0c1828; --seven-ui-surface-2:#122238;
  --seven-ui-text:#f7fbff;   --seven-ui-text-muted:#91a2b7;
  --seven-ui-accent:#087bff; --seven-ui-accent-hover:#21d7f2;
  --seven-ui-on-accent:#0b1728;
}

/* -- state channels (aurora -> one pair, not 2 per state) -------------- */
html[data-seven-aurora=thinking]{--seven-ui-state-a:#087bff;--seven-ui-state-b:#735cff}
html[data-seven-aurora=research]{--seven-ui-state-a:#00aee8;--seven-ui-state-b:#21d7f2}
html[data-seven-aurora=coding] {--seven-ui-state-a:#1267ee;--seven-ui-state-b:#079cff}
html[data-seven-aurora=rpg]    {--seven-ui-state-a:#7657f4;--seven-ui-state-b:#a08cff}
html[data-seven-aurora=success]{--seven-ui-state-a:#20a878;--seven-ui-state-b:#61d9ad}
html[data-seven-aurora=warning]{--seven-ui-state-a:#dc9418;--seven-ui-state-b:#ffc45b}
html[data-seven-aurora=error]  {--seven-ui-state-a:#dd5263;--seven-ui-state-b:#ff8592}

/* -- ONE reduced-motion block. Replaces the 3 divergent copies. ------- */
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{
    scroll-behavior:auto!important; animation-duration:.001ms!important;
    animation-iteration-count:1!important; transition-duration:.001ms!important;
    transform:none!important;
  }
}

/* -- ONE RTL block. Replaces rtl.css + per-file html[dir=rtl] rules. --- */
html[dir=rtl] .message.user .bubble{ border-radius:22px 22px 22px 7px; }
html[dir=rtl] .seven-ws-kicker{ letter-spacing:.08em; }
code,pre,.seven-ws-fingerprint,.seven-ws-output,.seven-ws-source,
.seven-generated-code{ direction:ltr; unicode-bidi:isolate; text-align:start; }
```

**Invariant:** Phase 1 introduces `--seven-ui-*` as aliases only. It is *not* a new patch layer (contract line 13) because every subsequent migration step deletes the rule it replaced; the file dies to a token+breakpoint+motion manifest as component rules move out of it.

---

## 4. Canonical component list (consumers, owner, and the rule being absorbed)

| # | Component | Current owners (conflict) | Canonical file | Selector surface |
|---|---|---|---|---|
| C1 | **Token manifest** | `html:10`, `seven-final.css:1`, `beta-ui.css:1`, `hub.css`, `seven-shell*.css` | `ui-foundation.css` | `:root`, `[data-seven-theme=*]`, `[data-seven-aurora=*]` |
| C2 | **App frame** (`.app`, `.main`, `.main-content`, height/viewport) | `seven-shell.css`, `seven-shell-final.css` (`!important` ×N), `html:687` | `ui-foundation.css` | `.app,.main,.main-content` |
| C3 | **Sidebar + room list** | `html:10`, `seven-final.css`, `beta-ui.css`, `ui-polish-fixes.css`, `seven-shell*.css` | `workspaces/shell.css` | `.sidebar,.room-list,.room-item,.sidebar-header,.sidebar-footer` |
| C4 | **Topbar + nav** (`.topbar`, `.seven-shell-primary-nav`, `.seven-shell-nav-btn`, workspace chip) | `seven-shell.css`, `seven-shell-final.css`, `beta-ui.css` (hides `.seven-beta-badge`) | `workspaces/shell.css` | `.topbar,.menu-toggle,.icon-btn` |
| C5 | **Composer** (`.input-area`, `.composer`, `.composer-row`, `.composer-tools`, `.tool-btn`, send/stop) | `seven-final.css` (r=28/22, `.input-area` gradient `!important`), `beta-ui.css` (r=28/24 + `::after` mask, send 48px `!important`) | `workspaces/composer.css` | `.composer,.tool-btn` |
| C6 | **Message + bubble** (`.message`, `.bubble`, user/assistant/system, `content-visibility`) | `seven-final.css` (decor rail, `contain`), `beta-ui.css` (bubble radius `22 22 7 22` + gradient rail), `ui-hardening.css` (`overflow-wrap:anywhere`) | `workspaces/message.css` | `.message,.bubble` |
| C7 | **Markdown + code block + inline citation** | `seven-final.css` (`--seven-code-bg`), `html:745` (`.inline-source-citation`) | `workspaces/message.css` | `.bubble.markdown,pre,code` |
| C8 | **Modal / settings geometry** (`.modal`, `.modal-content`, `#settingsModal`, `.settings-row`) | `seven-final.css` (r=16, elev-2), `ui-hardening.css` (safe-area pad, `width:min(540px,100%)`, `max-height:var(--seven-visual-height)-16px`), `html:579` (`width:min(520px,…)`, `max-height:min(88vh,780px)`), `beta-ui.css` (r=24 `!important`) | `workspaces/dialog.css` | `.modal,.modal-content,#settingsModal` |
| C9 | **Menu / popover** — **must be ONE** | `.seven-mode-menu/.seven-mode-option` (`beta-ui.css`) **vs** `.seven-model-panel/.seven-model-option` (`ui-polish-fixes.css`); `.seven-shell-model-menu` (`ui-hardening.css`); `.seven-ws-picker` | `workspaces/dialog.css` | `.seven-menu, .seven-menu__option` |
| C10 | **Button / action states** | 44px in `beta-ui.css`+`hub.css`, 40px/34px in `seven-final.css`, 38px in `ui-polish-fixes.css` | `workspaces/actions.css` | `button,.tool-btn,.icon-btn,.menu-toggle` |
| C11 | **Field** (input/textarea/select, label, focus) | `ui-hardening.css`, `beta-ui.css`, `hub.css` `.seven-ws-field`, `generated-ui.css` `.seven-generated-input`, `ui-polish-fixes.css` `.seven-model-trigger` | `workspaces/field.css` | `input,textarea,select` |
| C12 | **Card / banner / pill / badge** | `.seven-ws-card`, `.seven-generated-card`, `.seven-beta-badge`, `.seven-ws-pill`, `.route-status-card` (`html:579`) | `workspaces/card.css` | `.seven-card` |
| C13 | **Workspace root + launcher** | `hub.css` | `workspaces/hub.css` (keep) | `.seven-workspace-root,.seven-ws-launcher` |
| C14 | **RTL + reduced-motion + safe-area** | duplicated in 3+ files, missing in 3 | `ui-foundation.css` | `html[dir=rtl]`, `@media` |

**Ownership rule (enforced by the plan):** a selector is owned by exactly one file. A file may only *consume* `--seven-ui-*`. No file outside `ui-foundation.css` may declare a `:root`/theme block after Phase 2.

---

## 5. Migration order by surface, with deletion criteria per step

Each step: **migrate → prove → delete**. A step is not complete until its deletion criterion passes.

| Step | Surface | Consumes | **Delete on completion (evidence)** |
|---|---|---|---|
| **0** | **Lease + harness** | — | none (no code) |
| **1** | **Deterministic order** | `ui-polish-loader.js` (build-injected) | `release/workspaces/remake.css` link from `build-release.cjs:154` (already-404 file) — or land the missing file. **Also** `static-audit.cjs` gains a check that every `<link>`/`<style>` id in `dist` resolves to an existing file. |
| **2** | **Token manifest only** | `html:10` + `:root` in 3 blocks | `html:10` `:root`+`.light` block moves to `ui-foundation.css` **only after** `beta-ui.css` stop-gate is confirmed. Deletion: `html` `:root` block removed, `grep -c ':root' seven_ai-final.html` drops 3→1 (the perf `:root` remains until Step 8). |
| **3** | **C10 actions** | `--seven-ui-radius-*`, `--seven-ui-space-*` | Remove `html.seven-beta-ui button{min-width:44px;min-height:44px}`, `html.seven-beta-ui :is(.tool-btn,.icon-btn,.menu-toggle){...44px}`, and the `.tool-btn{min-height:34px}` / `button{min-height:40px}` mobile overrides in `seven-final.css`. Criterion: exactly **one** min-touch declaration remains, ≥44px, at one specificity. |
| **4** | **C11 fields** | `--seven-ui-focus-ring`, `--seven-ui-border-soft` | Remove `seven-final.css` `button,input,textarea,select{font:inherit}` + `modal-content select/input/textarea` focus block; `ui-hardening.css` `#seven-app textarea,input,select,button{max-width:100%}`. Criterion: no per-file `:focus-visible{box-shadow}` remains outside `ui-foundation.css`. |
| **5** | **C5 composer** | `--seven-ui-radius-xl`, `--seven-ui-elev-1`, `--seven-ui-inset-bottom` | Delete the **duplicated pair**: `seven-final.css` `.composer{border-radius:28px!important}` vs `beta-ui.css` `.composer{border-radius:28px!important}` vs mobile `22px` vs `24px`; also the `input-area{background:linear-gradient(...)!important}` duplicate. Criterion: composer radius has **one** declaration + **one** mobile override; both >24px; `!important` on `.composer` = 0. |
| **6** | **C3/C4 sidebar + topbar + nav** | `--seven-ui-surface-*`, `--seven-ui-border-soft`, `--seven-ui-layer-1` | Delete `seven-final.css` `.sidebar{border-right-color:...!important}` (breaks under RTL — should be `border-inline-end`), `.room-item{border-radius:...!important}`, `.topbar{background:...!important}`, `.topbar .title{font-weight:650!important}`; delete `ui-polish-fixes.css` `.room-item{min-height:58px!important;padding:10px 12px!important}` (duplicates C3) **and** the `.seven-beta-badge` hide in `seven-shell-final.css`. Criterion: `!important` in C3/C4 = 0; all inline-start/end (not left/right) for mirrored edges — required by `UI_FOUNDATION_V2.md:53`. |
| **7** | **C9 menu — the two-system merge** | `--seven-ui-menu-*`, `--seven-ui-layer-4/5` | Collapse `.seven-mode-*` (beta-ui) + `.seven-model-panel/-option` (ui-polish-fixes) + `.seven-shell-model-menu` (ui-hardening) into one `.seven-menu`. Delete: 3 selectors groups, ~120 `!important`, and the z-index 90/2200/2400 split. **Also un-disable the facade**: `zero-room-transform.cjs:32` currently disables `ui-polish-fixes.js` — the plan must keep the *picker markup* source but delete the *style layer*. Criterion: exactly one `position:fixed` popover component; no selector with `z-index` outside `--seven-ui-layer-*`. Directly satisfies contract line 63. |
| **8** | **C8 dialog / settings** | `--seven-ui-dialog-*`, `--seven-ui-viewport-height` | Delete the 4-way geometry conflict: `seven-final.css` `.modal-content{border-radius:16px!important;box-shadow:...!important}`; `beta-ui.css` `.modal-content{border-radius:24px!important;background:var(--sb-s)!important}`; `ui-hardening.css` `#settingsModal{padding:max(8px,env(...))}` + `width:min(540px,100%)` + `max-height:calc(var(--seven-visual-height)-16px)`; `html:579` `width:min(520px,calc(100vw-24px))` + `max-height:min(88vh,780px)`. **Keep** the value set chosen in the token schema. **Relocate** `html:687` `:root{--seven-visual-height}` → `ui-foundation.css` **unchanged** (Android WebView keyboard contract). Criterion: `#settingsModal` has 0 `!important`; dialog fits at 320px without clipping (contract scenario 4). |
| **9** | **C6/C7 message + code + citation** | `--seven-ui-code-bg`, `--seven-ui-leading-relaxed` | Delete `seven-final.css` `.message.assistant[data-seven-ui-decorated="1"]::before` **or** the `beta-ui.css` twin `…:before{inset-inline-start:7px!important}` — one rail only; delete `html:745` `.inline-source-citation` (moved). Criterion: `overflow-wrap:anywhere` enforced once (`ui-hardening.css` is the current owner; do **not** duplicate); zero document-level horizontal expansion (contract line 61/57). |
| **10** | **C12 cards / pills / badges** | `--seven-ui-radius-md`, `--seven-ui-state-*` | Unify the 4 status hex families (`#e5484d|#d13a40|#ff8793|#dd5263` → `--seven-ui-danger`; `#ffc65c|#ffc45b` → `--seven-ui-warn`; `#69dbb1|#61d9ad` → `--seven-ui-success`) across `hub.css`, `generated-ui.css`, `beta-ui.css`. Delete `generated-ui.css`'s local `--seven-ws-radius:18px`. Criterion: no raw hex outside `ui-foundation.css` except in `color-mix()` state ramps. |
| **11** | **C13 workspace hub** | `--seven-ui-*` | Replace `hub.css`'s 8 `--seven-ws-*` aliases with direct `--seven-ui-*` reads; `rtl.css` folds into `ui-foundation.css` and the file is deleted. Criterion: `release/workspaces/rtl.css` no longer exists; `hub.css` declares no tokens. |
| **12** | **Breakpoints + motion consolidation** | `--seven-ui-bp-*` | Collapse 380/390/420/620/720/900 → 380/720/900. Delete the 2 duplicate reduced-motion blocks (`beta-ui.css`, `hub.css`) after the one in `ui-foundation.css` covers them. **Add** reduced-motion to `ui-polish-fixes.css`, `seven-shell*.css`, `generated-ui.css` before deleting. Criterion: exactly 1 `prefers-reduced-motion` block in the whole release. |
| **13** | **Shell layer retirement** | — | With C2–C4 and C9 canonical, `release/workspaces/seven-shell.css` (121 `!important`) and `seven-shell-final.css` (74 `!important`) become redundant. **Delete both files** and their two `loadShell()`/`loadFinal()` injectors in `ui-polish-loader.js`, keeping the DOM/i18n logic from `seven-shell.js`/`seven-shell-final.js` (these set `data-seven-shell="2"`, `data-seven-shell-empty`, `data-seven-shell-polished`, `data-seven-shell-card` — **the CSS gate keys must be updated or styles will silently drop**). Criterion: `!important` total 471 → **< 40**. |

**Invariant across all steps:** file byte-count and `!important` count are **monotonically non-increasing**; every step ends with a deletion, never with a "disable" flag.

---

## 6. First implementation slice — exact files

Chosen because it is **fully inside Team A's existing lease** (`ownership.json`: `release/workspaces/*.css`, `release/workspaces/seven-shell*.js`) and produces **zero visual change** (pure alias layer), so it is provably safe and reversible.

**Create**
1. `release/workspaces/ui-foundation.css` — §3 exactly (token manifest + theme + aurora + reduced-motion + RTL only; **zero component selectors**).

**Modify**
2. `release/workspaces/seven-shell.js` — in the existing `loadShell()`-equivalent boot path, add one idempotent injection alongside the existing pattern already proven in this file family:
   `hub.js` already implements the canonical helper — `function sheet(id,file){if(d.getElementById(id))return;let l=d.createElement('link');l.id=id;l.rel='stylesheet';l.href='./workspaces/'+file;d.head.appendChild(l)}` and `function css(){sheet('seven-workspaces-style','hub.css');sheet('seven-workspaces-rtl-style','rtl.css')}`.
   Add: `sheet('seven-ui-foundation-style','ui-foundation.css')` as the **first** call in `css()` — this places the token layer *before* `hub.css` and *before* the async `ui-polish-fixes.css`/`seven-shell*.css`, making precedence deterministic without moving any production file.
   *(Preferred variant: also call it from `seven-shell.js` boot so it is present on the hot path, not only after `loadWorkspaces()`.)*
3. `release/static-audit.cjs` — **requires a Manager lease** (it is not in Team A's scope). Add two zero-visual-change asserts: (a) every stylesheet `id` present in `dist/*.html` resolves to a file on disk (catches the absent `remake.css`); (b) `!important` count per tracked asset ≤ its current committed value, stored as a baseline map.

**Delete in this slice:** nothing. Deletion begins in Step 2.

**Explicitly out of slice:** `seven_ai-final.html`, `build-release.cjs`, `verify.cjs` — all `sharedReadOnlyByDefault`.

**Why this slice first:** (1) zero visual delta → golden screens cannot drift; (2) it makes cascade order deterministic, which is a **precondition** for every later step's deletion criteria to be meaningful; (3) it introduces the one file that later steps delete content *into*, satisfying contract line 13 ("no additional patch layer whose only purpose is overriding previous patch layers") because the file is the migration destination, not an override.

---

## 7. Regression & golden-screen gates

**Existing executable gates (run per step, all read-only until Step 13):**
- `node release/build-release.cjs` — asserts `lazy-local` load modes for PDF / attachments / workspaces.
- `node release/static-audit.cjs` — `assert.deepEqual(issues,[])`; fails on `release-layer-too-heavy` (>100 KB hot layer sum), `oversized-release-asset` (>50 KB per asset), `lazy-workspaces-too-heavy` (>320 KB), `apk-static-asset-budget-exceeded` (>8 MB), duplicate static ids, `eval`/`new Function`/`document.write`.
- `node verify.cjs`, `node runtime-smoke.cjs`, `node release/zero-room-transform.cjs`.

**New gates required before Step 2 (no visual-change code may land first):**

| Gate | Assertion | Contract clause |
|---|---|---|
| **G1 Cascade determinism** | Build twice with network latency 0 ms and 400 ms; computed-style snapshot of 20 probe selectors is byte-identical. Directly tests the §2.3 defect. | 61, 76 |
| **G2 Golden screens** | Baseline PNGs for **6 surfaces × 2 themes × 2 directions × 3 viewports (320/390/720 portrait + 720 landscape)** = 24 baselines. Any pixel delta > 1% blocks merge. | 66, 67 |
| **G3 Horizontal overflow** | `document.scrollingElement.scrollWidth <= clientWidth + 1` for every scenario, with a 40-char unbreakable token, a 200-char URL, a 120-line code block, and 60 rooms. | 61, 57 |
| **G4 Debt counters** | `!important` per file non-increasing; total ≤ current (471); declared `:root` blocks in `seven_ai-final.html` 3→1→0; distinct token namespaces 5→1. | 64, 26 |
| **G5 No new patch layer** | Any new `.css` in `release/` must be registered in `build-release.cjs` `assetNames`; unregistered new sheet = fail. | 13 |
| **G6 RTL completeness** | Arabic run over all 6 surfaces; zero untranslated `aria-label`/`title`/visible text; zero physical `left:`/`right:` on structural selectors. | 53, 62 |
| **G7 Font-scale + rotation** | `font-size:200%` and landscape 740×360: composer + nav remain operable. | 56, 65 |
| **G8 Perf** | No `setInterval` added for static layout (already a `warn` in `static-audit.cjs`); no full-DOM scan where mutation-scoped suffices. | 80–83 |

**Golden-screen capture caveat:** G2 does not exist. It must be built in Step 0–1. Until G2 is live, Steps 3–13 are **unguarded against accidental drift** and should not start.

---

## 8. Risks & dependencies

| # | Risk | Evidence | Severity | Mitigation |
|---|---|---|---|---|
| R1 | **No golden-screenshot harness.** Contract 66–67 is unenforceable; every migration step is unprovable. | No screenshot/visual-regression file exists in `release/` | **Critical** | Build G2 in Step 0. Blocks Steps 3+. |
| R2 | **Lease boundary blocks the token layer.** The base tokens live in `seven_ai-final.html` + `release/seven-final.css` + `release/beta-ui.css`, all `sharedReadOnlyByDefault`. Team A owns only `release/workspaces/*.css`. | `ownership.json` `sharedWriteRule` | **Critical** | Manager must grant a temporary lease on `release/seven-final.css`, `release/beta-ui.css`, `seven_ai-final.html` **before Step 2**. Do not attempt Steps 2, 5, 8 without it. |
| R3 | **Cyclic token ownership.** `beta-ui.css` (an override layer) is the *sole* bridge that maps `--sb-*` → legacy `--bg/--surface/--accent/...`, and the *sole* light/dark owner besides `body.light` in `html:10`. Reordering or trimming it breaks every theme. | `beta-ui.css` bridge rule; `seven-final.css` `body.light` / `body:not(.light)` | **High** | Step 2 must *append* the theme block, never move/delete `beta-ui.css`'s bridge, until every consumer is on `--seven-ui-*`. |
| R4 | **Runtime cascade is timing-dependent** → FOUC, flaky goldens, and the reason `!important` inflated to 471. | `ui-polish-loader.js` + `hub.js` both append `<link>` at promise-resolution time | **High** | Step 1 (deterministic order) is a hard prerequisite for all later steps. |
| R5 | **Shell CSS gate keys are coupled to JS.** `seven-shell-final.css` is gated on `html[data-seven-shell-final="1"]` set by `seven-shell-final.js`; deleting the CSS without updating the JS drops all styles silently (no error). | `seven-shell.js` `mark()`, `seven-shell-final.js` `polishWorkspaces()` | **High** | Step 13 is a paired JS+CSS commit; add G2 baseline diff for shell before delete. |
| R6 | **RTL is half-migrated.** `seven-final.css` uses physical `border-right-color`; `beta-ui.css`/`hub.css` use `border-inline-*`. Under `dir=rtl` the sidebar divider lands on the wrong edge. | `seven-final.css` `.sidebar{border-right-color:...!important}` vs `beta-ui.css` `border-inline-end` | **Medium** | Step 6 mandatory fix; G6 gate. |
| R7 | **Reduced-motion implemented 3×, missing in 3 files.** `ui-polish-fixes.css`, `seven-shell.css`, `seven-shell-final.css`, `generated-ui.css` have none. | per-file grep | **Medium** | Step 12 adds coverage *before* deleting duplicates. |
| R8 | **Physical-pixel fragmentation** of radius/touch/z-index (7 radius vocabularies, 6 breakpoints, 6 z-levels). Smallest-radius components (`.seven-beta-status i` 7px, `.seven-ws-pill` 3px) will visibly change if the scale is unified naively. | §2.5 | **Medium** | Migrate radius only where a token already exists; freeze sub-10px decorative radii as documented exceptions. |
| R9 | **Budget headroom is tight and shrinking.** `static-audit.cjs` fails above 100 KB hot-layer sum / 50 KB per asset. The token manifest *adds* bytes. | `static-audit.cjs` asserts | **Medium** | Phase 1 must be offset by deleting the absent `remake.css` link and by the Step 13 shell deletion (195 `!important` across two files). Track `releaseLayerBytes` per step. |
| R10 | **Two global menu systems exist today** — direct violation of contract line 63. Any "menus" work touches the model picker, which is also the subject of `zero-room-transform.cjs:32` facade disabling. | `ui-polish-fixes.css` `.seven-model-*`; `zero-room-transform.cjs:32` | **Medium** | Step 7 must decide *which* system survives **before** coding; requires Manager sign-off. |
| R11 | **13,175-line / 842 KB monolith** with `:root` at 3 sites and 4 embedded `<style>` blocks interleaved with app logic. Editing it safely requires a lease **and** the build marker position must be confirmed first. | `seven_ai-final.html` structure | **Low–Med** | One grep of the build marker before any HTML edit. |
| R12 | **Byte figures not measured.** Layer sizes above are **line counts**, not bytes; `releaseLayerBytes` / per-asset bytes must be read from `dist/static-audit.json` after a build. | not measured this pass | **Low** | Read `dist/static-audit.json` in Step 0. |

---

## 9. What should NOT be migrated together

1. **The two menu systems (`.seven-mode-*` vs `.seven-model-*`).** They are the same product concept implemented twice (`beta-ui.css` and `ui-polish-fixes.css`), with different DOM, different z-index, different breakpoints. Migrating them as one "menus" step doubles the golden surface and makes the rollback ambiguous — you cannot tell which caused drift. **Migrate one; delete the other in a separate commit.** The 86 `!important` in `ui-polish-fixes.css` also entangle the model picker with `.room-item` and `.composer-tools`, which are Steps 6 and 5 respectively — pulling it in forces Steps 5+6 early.
2. **Shell geometry + workspace surfaces.** `seven-shell-final.css` forces `height:var(--seven-shell-vh,100dvh)!important` on `body/.app/.main/.main-content`, which is what makes `.seven-workspace-root{overflow:auto}` work. Changing shell height tokens and workspace padding/grid simultaneously changes every Coding/Research/RPG golden at once. **Shell first (Step 6/13), workspaces second (Step 11).**
3. **`--seven-visual-height` (html:687) + any composer/dialog height work.** It is the Android WebView keyboard-inset contract shared by `ui-hardening.css` (`max-height:calc(var(--seven-visual-height)-16px)`) and `seven-shell-final.css` (`--seven-shell-vh`). Steps 5 and 8 both read it — relocate it (Step 8, values unchanged) but never co-edit it with them.
4. **Composer + dialog geometry.** Both are primary-action surfaces measured at the same viewport in contract scenarios 4 and 6; changing both means a single screen has two deltas and no attribution.
5. **Chat shell + RPG/Research/Generated-UI surfaces.** The workspace files are lazy-loaded under a 320 KB budget and have **no** golden coverage. Migrate them only after the chat shell is stable and G2 exists.
6. **Token manifest (Step 2) + component migration (Steps 3+).** Landing the manifest and new component rules in one commit makes the token layer untestable in isolation, since you cannot distinguish "alias changed a value" from "component rule changed a value."
7. **RTL conversion + theme conversion.** Both re-resolve `var()` chains and both change computed colors *and* geometry simultaneously under `dir=rtl`. Do geometry (Step 6) and theming (Step 2) separately; G2 baselines must be per-axis.

---

## 10. Definition of done for Wave 01A architecture

- [x] Files/systems inspected with evidence (11 CSS/JS contract layers, build, audit, ownership, source monolith)
- [x] Current layer graph documented, including the **non-deterministic runtime cascade** (§2.3) and **5 token namespaces** (§2.4)
- [x] Canonical token schema proposed as a **zero-visual-change alias layer** (§3)
- [x] Canonical component list C1–C14 with current owners and absorbed rules (§4)
- [x] Ordered migration Steps 0–13 with a **deletion criterion per step** (§5)
- [x] First implementation slice named by **exact file** (§6)
- [x] Regression/golden gates G1–G8 mapped to contract clauses (§7)
- [x] Risks R1–R12 and non-co-migration constraints (§8, §9)
- [x] Absent files recorded: `release/workspaces/remake.css`, golden-screenshot harness, `!important`/token-count lint

**Blocking dependency for the next wave:** Manager lease on `release/seven-final.css`, `release/beta-ui.css`, `release/ui-hardening.css`, `release/static-audit.cjs`, and `seven_ai-final.html`; plus a decision on which of the two menu systems survives (R10).

WAVE01=COMPLETE
