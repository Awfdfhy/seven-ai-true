# Seven AI — Core UI Deletion Plan

Inventory at base `f86d409bcf914280246078d235e8f96ee73337a3` shows six CSS layers influencing Core UI plus multiple runtime decorators.

| Layer | Verdict | Reason / action |
|---|---|---|
| `release/seven-final.css` | **KEEP (base only) / MERGE Core rules** | Retain global tokens, baseline focus/a11y and generic primitives. Move Core shell/chat/composer-specific ownership into canonical shell; do not expand Core rules here. |
| `release/workspaces/seven-shell-final.css` | **KEEP — CANONICAL** | Final destination for Core shell, topbar, sidebar, chat, composer, model picker, message-action visuals. |
| `release/workspaces/seven-shell-final.js` | **KEEP — CANONICAL** | Final destination for Core DOM decoration/interaction ownership. |
| `release/workspaces/seven-shell.css` | **MERGE → DELETE FROM LOAD PATH** | Currently owns sidebar state, empty state, message actions, model chip/menu and composer sizing. Absorb required behavior into final shell, then stop loading. |
| `release/workspaces/seven-shell.js` | **MERGE → DELETE FROM LOAD PATH** | Same functional conflict as CSS; especially duplicate model-picker ownership. |
| `release/ui-hardening.css` | **MERGE Core subset / KEEP non-Core temporarily** | Reflow/safe-area rules belong in canonical shell; Settings/other cross-surface hardening stays until Chat 0/4 decide owner. |
| `release/beta-ui.css` | **DELETE FROM Core ownership after token extraction** | Competing palette, shell, message and composer styling. Theme/global token decisions require Chat 0/4. |
| `release/beta-ui-runtime.js` | **KEEP behavior temporarily; remove Core decoration hooks** | Contains mode/theme/workspace runtime behavior; avoid business-logic regression while eliminating Core chrome duplication. |
| `release/workspaces/ui-polish-fixes.css` | **MERGE UI-only Core rules → DELETE FROM Core load path** | Contains model-picker/room-search polish that competes with shell. |
| `release/workspaces/ui-polish-fixes.js` | **SPLIT** | UI picker/search decoration should move to final shell; zero-room facade is logic/persistence-adjacent and must remain untouched or be reassigned. |
| `release/ui-polish-loader.js` | **MERGE/REDUCE** | Currently loads shell → final shell → polish, explicitly recreating a cascade stack. Final target loads one Core shell owner plus non-Core runtimes only. |

## Safe sequence
1. Add regression tests asserting one model picker and one message-action owner.
2. Port sidebar/empty/actions/model-picker behavior from old shell into final shell.
3. Port only required CSS primitives; prefer logical properties and breakpoint rules.
4. Update loader so old shell and UI-polish Core decorators are not loaded.
5. Keep zero-room facade/business logic intact.
6. Run Seven tests + viewport matrix + Android screenshots.
7. Only after screenshots/review: physically delete obsolete Core files if no non-Core consumers remain.

**No physical deletion before dependency proof.**
