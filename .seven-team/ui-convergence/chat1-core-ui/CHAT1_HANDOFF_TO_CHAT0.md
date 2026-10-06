# Chat 1 — Core UI Handoff to Chat 0 / I01

Date: 2026-10-06
Status: **READ-ONLY HANDOFF UNDER INTEGRATION FREEZE**

## Freeze acknowledged
The shared branch now contains `.seven-team/ui-convergence/INTEGRATION_FREEZE.md`.
Chat 1 will not make further shared/core production writes while that freeze is active.

## What is already present on the shared branch
Verified read-only on `ui/20-agent-convergence-20261006`:
- Core research database/docs are present.
- `release/workspaces/ui-polish-fixes.js` no longer creates the competing `.seven-model-panel`.
- `release/ui-hardening.css` contains the required `Seven 2.4.2 UI Hardening` build marker.
- `release/core-ui-convergence.test.cjs` exists.

## Remaining Core convergence gap on shared branch
Verified current shared state:
- `release/ui-polish-loader.js` still loads legacy `seven-shell` before `seven-shell-final`.
- `release/workspaces/seven-shell-final.js` is still v3.1 decorator-only and does **not** own the DOM observer/model picker/sidebar/composer runtime.
- `release/workspaces/seven-shell-final.css` has not yet absorbed legacy `seven-shell.css`.
- Legacy `seven-shell.js/css` therefore remain active runtime owners.
- The current static ownership test still encodes the old two-stage ownership model.

## Candidate implementation prepared on Chat 1 R2
Branch: `ui/chat1-core-ui-r2-20261006`
PR: #129 (draft; do not merge blindly during freeze)

Prepared candidate changes:
1. Promote `seven-shell-final.js` to canonical Core runtime owner.
2. Move sidebar, visualViewport/keyboard, growing composer, empty state, message actions, jump-to-latest and model picker ownership into that runtime.
3. Stop `ui-polish-loader.js` from loading `seven-shell.js/css`.
4. Merge legacy shell CSS into `seven-shell-final.css` so one stylesheet is loaded.
5. Keep legacy files temporarily as unreferenced rollback artifacts until dependency proof allows physical deletion.
6. Make model picker mobile presentation fixed/bottom-sheet style at small widths.
7. Remove horizontal composer tool scrolling at <=520px; allow wrap/reflow instead.
8. Update regression contracts so one loaded Core owner is enforced.

## CI evidence
Earlier Chat 1 run #3550 failed before browser validation due a missing hardening compatibility marker:
`Error: Seven UI hardening marker missing`.
That marker is already restored on the shared branch.

Shared-branch acceptance run #3564 / run 37397454423 was IN PROGRESS at last observation, on SHA `cc5ac0fdc0a38f2f0f0130a40d36d57eaab69ed1`.

## Integration recommendation
Under the freeze, Chat 0 should treat PR #129 as a patch source only:
- preserve all newer shared-branch edits;
- transplant the canonical-owner runtime/loader changes;
- re-run static ownership contracts;
- then run exact-SHA browser + Android visual evidence.

## READY rule
Chat 1 does **not** claim CORE UI READY until:
- exact frozen SHA Seven AI tests pass,
- 320/360/390/420 visual screenshots are reviewed,
- LTR/RTL + EN/AR + Day/Night + keyboard open/closed pass,
- no duplicate model picker/message actions are visible,
- C04 independent review changes from BLOCKED to PASS.
