# Chat 1 — Core UI Inventory

Base inspected: `f86d409bcf914280246078d235e8f96ee73337a3`.

## Confirmed competing Core layers
- `release/seven-final.css`
- `release/ui-hardening.css`
- `release/beta-ui.css`
- `release/workspaces/seven-shell.css`
- `release/workspaces/seven-shell-final.css`
- `release/workspaces/ui-polish-fixes.css`

## Confirmed runtime collision
`release/ui-polish-loader.js` calls:
1. `loadShell()` → `seven-shell`
2. `loadFinal()` → `seven-shell-final`
3. `load()` → `ui-polish-fixes`

The old shell builds `.seven-shell-model-menu`. UI polish separately builds `.seven-model-panel` unless it detects the shell chip. This is a real competing-picker architecture, not merely cosmetic duplication.

## Base-SHA note
The user-specified Base SHA and the actual branch head are `f86d409...`. The checked-in WAVE plan header still states `0c112b9...`; treat the branch head as execution source-of-truth and correct the plan header only through Chat 0 coordination.
