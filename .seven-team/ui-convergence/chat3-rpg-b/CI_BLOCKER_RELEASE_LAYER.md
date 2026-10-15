# RPG UI B — External CI Blocker

Observed on Seven AI tests #3626, run 37400365670, branch head 5a65efcebb54f3581b1f2fae6e5a71cb53c7afba.

## Failure
`release/static-audit.cjs` fails before release/*.test.cjs runs:

`release-layer-too-heavy: 102209`

Budget: `built.startupBytes < 100000`.

## Attribution audit
Compared hot startup source files against assignment base `f86d409bcf914280246078d235e8f96ee73337a3`.

Unchanged:
- seven-final.css
- beta-ui.css
- research-runtime.js
- performance-runtime.js
- control-runtime.js
- control-bridge.js
- execution-bridge.js
- pdf-runtime.js
- motion-runtime.js
- ui-runtime.js
- attachment-loader.js
- beta-ui-runtime.js
- ui-polish-loader.js

Only startup-layer addition found:
- `release/workspaces/ui-foundation.css`
  - base: absent
  - current raw source: ~3544 characters

Chat 3 RPG-B production artifacts are lazy workspace files and are not included in `built.startupBytes`.

## Required owner
Chat 0 / I01 / B08, because `ui-foundation.css` is globally locked by COMPONENT_OWNERSHIP.md.

## Required correction
Reduce hot release layer by at least 2210 bytes without raising the 100000-byte budget.

Preferred options:
1. consolidate duplicate declarations in the new foundation;
2. move non-critical component styling out of hot global foundation into approved lazy/canonical workspace styles;
3. replace repeated fallback/token expressions with canonical aliases where this reduces built compact CSS;
4. delete superseded hot rules as required by the convergence plan.

Do not raise the budget.

## Chat 3 status
This blocker prevents the suite from reaching RPG-B adapter/render/mount/static tests. It is not evidence of a functional RPG-B test failure.
