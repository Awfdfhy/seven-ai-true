# Chat 5 — UI Foundation Hot-Trim Specification

Role boundary: **validator specification only**. Chat 5 does not modify `release/workspaces/ui-foundation.css`.

## Evidence
Current hot release layer: **102,209 bytes**.
Gate: **<100,000 bytes**.
Minimum reduction: **2,210 bytes**.
Recommended stable target: **<=96,000 bytes**.

Blob comparison against convergence base shows every pre-existing hot asset inspected is byte-identical. The only new hot startup stylesheet is:

`release/workspaces/ui-foundation.css`
- raw source: ~3,544 chars
- absent at convergence base
- therefore primary remediation target for the current startup overage

## Tokens confirmed as current production consumers
Keep these in the hot foundation unless I01 proves another canonical owner already defines them safely:

1. `--seven-ui-canvas`
2. `--seven-ui-surface-1`
3. `--seven-ui-surface-2`
4. `--seven-ui-border`
5. `--seven-ui-text`
6. `--seven-ui-text-muted`
7. `--seven-ui-accent`
8. `--seven-ui-danger`
9. `--seven-ui-warning`
10. `--seven-ui-success`
11. `--seven-ui-radius-sm`
12. `--seven-ui-radius-md`
13. `--seven-ui-touch-min`

## Vocabulary currently eligible to move out of the hot startup layer
Only after I01 verifies no hot call site depends on it:

- unused spacing scale aliases
- unused z-index aliases
- unused dialog/menu sizing aliases
- unused motion aliases
- unused extended radius aliases
- compatibility token families preserved only for future migration
- design-system vocabulary with no current startup consumer

Moving a token out of startup does **not** mean deleting it from the design-system specification. It may remain documented or live in a deferred/lazy canonical stylesheet.

## Acceptance conditions
The fix is acceptable only if all are true:
1. static audit keeps the original <100,000 budget;
2. startupBytes drops below 100,000;
3. recommended headroom <=96,000 where feasible;
4. no raw color/spacing/z-index values are reintroduced into workspace code merely to compensate;
5. RPG/Core/Settings still resolve required semantic tokens;
6. day/night and RTL rendering remain unchanged or improved;
7. no new `!important` or competing token namespace is introduced;
8. Seven AI tests reach browser verification.

## Rejection conditions
Reject a trim if it:
- raises the budget;
- deletes a token still consumed by production;
- moves a token but then duplicates equivalent values in multiple workspace files;
- creates a second design-system layer;
- breaks reduced-motion, overlay z-order, touch targets or theme behavior.

## Validator next gate
Once I01 lands the trim:
- verify changed hot files only;
- run exact-head Seven AI tests;
- confirm `release-layer-too-heavy` disappears;
- verify browser matrix generation;
- verify screenshot artifact publication path.
