# Chat 5 — Hot Release-Layer Budget Diagnosis

Observed failing candidate: `5a65efcebb54f3581b1f2fae6e5a71cb53c7afba`
Failing run: `37400365670`
Static audit: `release-layer-too-heavy`
Observed startup bytes: **102,209**
Hard gate: **< 100,000 bytes**

## Required reduction
Minimum mathematical reduction: **2,210 bytes**.
Validation target: reduce at least **4–6 KB** to avoid immediately regressing above the gate with small follow-up commits.

Do not raise the budget.

## Approximate hot-layer ranking
Character counts after current compaction logic (beta-ui-runtime uses an additional startup minifier, so its final byte count may be lower than this approximation):

| Asset | Approx compact chars |
|---|---:|
| control-runtime.js | 18,312 |
| execution-bridge.js | 13,407 |
| beta-ui-runtime.js | 13,164 before startup-specific minifier |
| seven-final.css | 12,280 |
| beta-ui.css | 11,969 |
| control-bridge.js | 6,874 |
| research-runtime.js | 6,677 |
| ui-runtime.js | 4,029 |
| performance-runtime.js | 3,996 |
| motion-runtime.js | 3,340 |
| ui-foundation.css | 3,033 |
| attachment-loader.js | 2,876 |
| ui-polish-loader.js | 1,755 |
| pdf-runtime.js | 586 |

## UI-convergence reduction priorities
I01 should reduce duplication, not remove required behavior.

Priority A:
- migrate/delete overlapping rules between `seven-final.css` and `beta-ui.css`;
- keep `ui-foundation.css` semantic tokens, but delete equivalent raw token declarations from legacy layers once call sites migrate;
- remove obsolete compatibility rules already superseded by canonical shell/picker/overlay behavior.

Priority B:
- inspect `beta-ui-runtime.js`, `ui-runtime.js`, and `ui-polish-loader.js` for duplicated UI boot/projection duties;
- if a runtime is only needed by a lazy workspace, move it behind the existing lazy-local architecture rather than keeping it hot.

Priority C:
- preserve `control-runtime.js` / execution behavior unless duplication is proven; they are large but functional core logic and should not be trimmed merely to satisfy a UI budget.

## Acceptance
Bundle defect closes only when:
1. `node all.cjs` passes the unchanged static audit;
2. startupBytes < 100000;
3. no budget constant is raised;
4. Seven functionality/visual tests remain green;
5. no deleted layer causes fallback to legacy duplicate UI.

Recommended target: **<= 96,000 bytes**.
