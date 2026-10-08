# HOT_LAYER_TRIM_HANDOFF

Owner of fix: Chat 0 / I01 with Chat 4 design-system ownership.

## Exact blocker
Latest convergence CI repeatedly fails:
`release-layer-too-heavy = 102209`
Budget: `100000`

RPG lazy-workspace budget is handled separately by Chat 2.

## Existing Chat 4 candidate discovered
Branch:
`chat4/design-system-rtl-settings-current-20261006`

Head:
`12920155f0c5be42a71d048d25363572058584f5`

Its `release/workspaces/ui-foundation.css`:
- blob `a9fc8860c4154b310df72fd51ed07cc37ff6696c`
- raw 1815 chars
- compactCss 1520 chars

Current convergence foundation:
- raw 3544 chars
- compactCss 3033 chars

Applying the Chat 4 file alone saves only ~1513 compiled bytes:
predicted startup = `100696`.
**Therefore Chat 4's current file alone is still insufficient.**

## Cross-owner production usage scan
Current RPG + Chat 4 settings/shell consumers require these `seven-ui-*` tokens:

- seven-ui-surface-1
- seven-ui-surface-2
- seven-ui-border
- seven-ui-text
- seven-ui-text-muted
- seven-ui-radius-sm
- seven-ui-radius-md
- seven-ui-radius-lg
- seven-ui-radius-pill
- seven-ui-touch-min
- seven-ui-z-sticky
- seven-ui-z-popover
- seven-ui-z-sheet

Evidence:
- RPG story surface consumes surfaces/border/text/radius-sm/md/touch.
- Chat 4 `ui-hardening.css` consumes radius-sm/md/lg, touch, z-popover, z-sheet.
- Chat 4 `seven-final.css` consumes touch, z-sticky, radius-pill.

## Proposed hot subset
A hot foundation containing exactly the currently consumed aliases above compacts to approximately **480 chars**.

Against the current 3033-char compact foundation:
- estimated recovery: **2553 bytes**
- predicted startup layer: **99656**
- predicted margin: **344 bytes**

This is enough to restore the strict 100 KB gate without raising the budget.

## Important design-system constraint
Do not delete the broader vocabulary from design documentation. Compatibility/scale aliases that are not currently consumed can remain documented or be moved to a deferred design-system layer if Chat 0/4 wants to preserve them for later migration.

Do not remove:
- radius-lg
- radius-pill
- z-sticky
- z-popover
- z-sheet

Those are already consumed by Chat 4-owned production CSS.

## Required validation
After Integrator applies the hot-layer trim:
1. exact-head static audit < 100000
2. design-system contract PASS
3. core UI tests PASS
4. RPG UI A/B tests PASS
5. release-verify executes the prepared RPG visual matrix
6. publish visual evidence artifact
7. Android 14/16 remains a separate final gate

Never raise the startup budget.

## Chat 4 branch contract blocker
The discovered Chat 4 branch is **not green** and must not be merged verbatim.

Branch CI:
- head: `12920155f0c5be42a71d048d25363572058584f5`
- Seven AI tests run: `37399312586`
- result: FAIL
- first reported assertion: `missing canonical token --seven-radius-pill`

Full required-token comparison shows four canonical tokens missing from `seven-final.css + ui-hardening.css` on that branch:
- `--seven-radius-pill`
- `--seven-z-sticky`
- `--seven-z-critical`
- `--seven-touch-min`

Integrator/Chat 4 must restore those canonical `--seven-*` definitions (or reconcile the contract intentionally) before treating the branch as mergeable.

This is separate from the hot `--seven-ui-*` subset. Do not confuse canonical design-system definitions with hot compatibility aliases.
