# A01 — Seven UI Ownership & Migration Map (Wave 01A)

## 1. Objective
Single-owner rules for UI tokens, primary nav, modals/dialogs and model-picker; name the first
migration slice so no new `!important` patch layers are added. Read-only audit, no source modified.

## 2. Evidence / files inspected
| File | Lines | `!important` |
|---|---|---|
| workspaces/seven-shell.css (`[data-seven-shell="2"]`) | 65 | 121 |
| workspaces/seven-shell-final.css (`[data-seven-shell-final="1"]`) | 50 | 74 |
| workspaces/ui-polish-fixes.css (minified) | 1 | 86 |
| workspaces/hub.css / generated-ui.css / rtl.css | 6/1/1 | 4/3/0 |
| release/seven-final.css | 291 | 67 |
| release/ui-hardening.css | 90 | 35 |
| release/beta-ui.css | 18 | 81 |

JS: workspaces/{seven-shell,seven-shell-final,ui-polish-fixes,hub}.js. HTML: seven_ai-final.html, t161.
**Absent:** `workspaces/seven-final.css` (file lives at `release/seven-final.css`).
**Not verified:** cascade order of the 5 inline `<style>` blocks in seven_ai-final.html (no `.css` hrefs).

## 3. Selector / component ownership conflicts
| Selector | Competing owners |
|---|---|
| `.seven-shell-primary-nav` | seven-shell-final.css:4 and :46 (dup decls), :48 |
| `.modal-content` | seven-final.css:221/244/271 + ui-hardening.css:19/57/88 (7 decls) |
| `.s-dialog` / `.s-modal` | ui-hardening.css:22/23/24 (`.s-dialog` twice) |
| `.seven-shell-backdrop` | seven-shell.css:60 + seven-shell-final.css:45 |
| `.sidebar/.topbar/#chat` | seven-shell.css (all `!important`) vs base CSS |
| theme tokens | beta-ui.css `--seven-g-*`/`--sb-*`; seven-final.css:26-37 `--accent/--muted`; ui-hardening.css:28 `--bg/--surface/--accent` |

## 4. Duplicate systems
- **Modals x3:** `.modal/.modal-content`; `.s-modal/.s-dialog`; `.seven-shell-backdrop` menu layer.
- **Model selection x2:** `.seven-shell-model-chip` (seven-shell.css:9-12) vs
  `.seven-model-picker/-trigger/-panel` (ui-polish-fixes.css + .js:11-12); z-index 2200 vs 2800.
- **Nav x2:** legacy `.sidebar/.sidebar-section-label` markup (HTML:794-805) vs JS-built
  `.seven-shell-primary-nav/.seven-shell-nav-btn`.
- **Picker:** `.seven-ws-picker` (hub.js/hub.css) reimplements the picker pattern.

## 5. Top 10 findings
1. seven-shell-final.css:4 hardcodes `repeat(4,minmax(0,1fr))` on the primary nav; grep proves **no `repeat(5)` in any CSS**. The 5-button count is **unverified** — `seven-shell-nav-btn` occurs 0x in both HTML files (likely runtime-built by seven-shell-final.js).
2. The identical declaration repeats verbatim at :46 — pure drift surface.
3. Only responsive handling is :48 (≤380px gap/padding); no `grid-auto-flow`/`:nth-child` escape, so a 5th child wraps/overflows silently.
4. `!important` density inverted: shell+polish 281 vs base system 183 — overrides outweigh the design system.
5. `.modal-content` has no owner; width/max-height/padding set 7x across 2 files.
6. `.s-dialog` declared twice in ui-hardening.css (:22, :24) with conflicting max-width/width; one is dead.
7. Three live theme namespaces (§3) with no mapping layer.
8. Shell files define **zero** tokens yet hardcode fallbacks (`var(--sb-s2,#151525)`) — missing tokens fail silently.
9. RTL gap: rtl.css holds only 4 `.seven-ws-*` rules; none for sidebar, primary nav, topbar, modal.
10. rtl.css re-declares `html[dir=rtl] .seven-ws-head h1{letter-spacing:-.02em}` equal to the hub.css base (no-op); relies on `unicode-bidi:plaintext` not logical properties.

## 6. Recommended canonical ownership
- **Tokens — single owner `release/beta-ui.css`:** `--seven-g-*` semantic layer, publish only `--sb-*`; retire `--accent/--muted` and `--bg/--surface/--accent`.
- **Shell/layout — one gate attribute:** retire either `data-seven-shell="2"` or `data-seven-shell-final="1"`.
- **Overlays — one system, `.s-modal`/`.s-dialog`:** `.seven-shell-backdrop` becomes a scrim token; delete `.modal*` after a call-site sweep.
- **Model selection — single owner `ui-polish-fixes.css`:** fold the shell chip into `.seven-model-trigger`.
- **Workspaces stay as-is:** hub.css owns `--seven-ws-*`; rtl.css stays the only RTL file, extended not duplicated.
- Rule: zero `!important` in new code; express overrides as higher-specificity gated selectors.

## 7. First representative migration slice — "Primary nav grid + gate unification"
Replace the fixed 4-column hardcode with a button-count-agnostic grid; drop the duplicate.
Files changed (exactly):
1. `workspaces/seven-shell-final.css` — replace the `:4` and `:46` column hardcodes with
   `grid-auto-flow:column; grid-auto-columns:minmax(0,1fr)`.
2. `workspaces/seven-shell-final.css` — keep the single `:48` ≤380px guard unchanged.
3. `workspaces/seven-shell-final.js` — confirm the nav container is created/queried once (no CSS-side item count).

## 8. Rules to delete as superseded
- seven-shell-final.css:46 nav `grid-template-columns`/margin — duplicate of :4.
- ui-hardening.css:22 `.s-dialog{max-width:calc(100vw - 16px)...}` — superseded by :24 `width:min(560px,100%)!important`.
- rtl.css `html[dir=rtl] .seven-ws-head h1{letter-spacing:-.02em}` — identical to hub.css base.
- After modal unification: seven-final.css:244 and :271 `.modal-content` animation/width overrides.

## 9. Acceptance evidence (for the implementing agent)
- `grep -c 'repeat(4' release/workspaces/seven-shell-final.css` → **0**.
- Nav carries exactly one `grid-template-columns`/`grid-auto-columns` declaration.
- DOM/screenshot: 4, 5, 6 nav buttons each render one equal-width row, no wrap, at 360/390/768/1280px.
- `grep -o '!important' release/workspaces/seven-shell-final.css | wc -l` drops; target < 40.
- Visual parity for topbar, sidebar, composer, model chip across light/dark and LTR/RTL.

## 10. Dependencies & risks
- Nav slice is low-risk and unblocks the rest — chosen first deliberately.
- **Risk:** seven-shell-final.js may re-assert nav item count; verify before changing the grid.
- **Risk:** the v1/v2 gate split means a fix on one gate is invisible in the other — unify the gate or ship both edits together.
- **Risk:** HTML inlines its CSS and `release/build-release.cjs` may duplicate content — confirm the build path before deleting rules.
- **Risk:** deleting `.modal*` needs a full call-site sweep (not performed here).
- **Unverified:** runtime-injected nav markup, build injection order, safe-area regressions.

WAVE01=COMPLETE
