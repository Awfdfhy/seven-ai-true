# HOT_LAYER_TRIM_HANDOFF

Owner of fix: Chat 0 / I01 (shared/global lock)

## Exact blocker
Latest exact-head CI still fails only on:
`release-layer-too-heavy = 102209`
Budget: `100000`
Required recovery: at least `2210` compiled bytes.

RPG lazy-workspace budget is already green.

## Attribution
Compared against convergence base `f86d409bcf914280246078d235e8f96ee73337a3`.

The only new startup-layer asset in the counted set is:
`release/workspaces/ui-foundation.css`

Raw size: ~3544 chars.

All pre-existing startup assets inspected are byte-identical to base.

## Production-use scan
Across current release/workspace production CSS/JS inspected, the foundation variables actually consumed are:

- seven-ui-canvas
- seven-ui-surface-1
- seven-ui-surface-2
- seven-ui-border
- seven-ui-text
- seven-ui-text-muted
- seven-ui-accent
- seven-ui-danger
- seven-ui-warning
- seven-ui-success
- seven-ui-radius-sm
- seven-ui-radius-md
- seven-ui-touch-min

The compatibility families below were not found in current production consumers inspected:
- seven-color-*
- seven-space-*
- seven-radius-* compatibility aliases
- seven-z-*
- seven-duration-*
- seven-ui-space-*
- seven-ui-z-*
- seven-ui-dialog-*
- seven-ui-menu-*
- most seven-ui-motion-* aliases

## Safe reduction direction
Keep the 13 currently consumed hot tokens above in `ui-foundation.css`.

Move the unused compatibility/scale vocabulary to a deferred/lazy design-system file if Chat 0 wants to preserve the vocabulary for future migration. Do not delete the vocabulary from documentation/design-system specs if it is still planned.

Estimated raw reduction from a minimal hot foundation:
~2724 characters.

That exceeds the 2210-byte compiled deficit before any additional minifier gain.

## Constraints
- Do not raise the 100 KB startup budget.
- Do not alter RPG-owned code further to solve this shared-layer blocker.
- Re-run exact-head `Seven AI tests`.
- Only after static audit passes should the prepared RPG visual matrix be allowed to produce its 19 screenshots.
