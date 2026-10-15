# Legacy Shared UI Deletion Plan

## KEEP / canonicalize
- `release/seven-final.css`: becomes canonical shared token/component owner during migration.
- `release/workspaces/rtl.css`: remains direction-specific only; no generic component styling.

## MERGE then delete overrides
- `release/ui-hardening.css`: migrate safe-area/overflow rules into canonical owners; delete duplicate theme/modal declarations.
- `release/workspaces/seven-shell.css` + `seven-shell-final.css`: Chat 0 decides surviving shell owner; Chat 4 supplies tokens only.
- `release/workspaces/hub.css` + `generated-ui.css`: replace raw `--sb-*`/workspace values with semantic aliases incrementally.

## DELETE after migration evidence
- `ui-polish-fixes.css` where it only outbids existing picker/menu styles.
- stale duplicated modal/theme rules.

## Blockers
Do not delete a layer until its selectors are mapped to a surviving owner, viewport/RTL/theme tests pass, and before/after screenshots exist. No new override stylesheet is permitted as a shortcut.
