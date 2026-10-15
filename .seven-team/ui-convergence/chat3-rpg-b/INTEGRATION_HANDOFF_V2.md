# CHAT 3 RPG UI B — Integration Handoff v2

## New implementation artifacts
- release/workspaces/rpg-ui-b-adapter.js
- release/workspaces/rpg-ui-b-render.js
- release/rpg-ui-b-adapter.test.cjs
- release/rpg-ui-b-render.test.cjs
- .seven-team/ui-convergence/chat3-rpg-b/rpg-ui-b.scoped.css

## Ownership status
Chat 3 has not modified shared/core files. Current Chat 3 diff does not touch rpg.js, shell, hub, ui-foundation.css, or build-release.cjs.

## Integrator wiring steps
1. Load the adapter and renderer through the approved workspace path.
2. In the canonical RPG context surface, obtain the current RPG state snapshot.
3. Call SevenRpgUiBAdapter.project(state).
4. Render the resulting model with SevenRpgUiBRender.render(model,{lang:document.documentElement.lang}).
5. Mount into the existing canonical BottomSheet/InspectorPanel. Do not create another modal family.
6. Merge or approve only the scoped style candidate; keep selectors under .seven-rpgb.
7. Preserve Chat 2 ownership for characters, relationships, journal, canon and lore.
8. Run release tests, viewport matrix, Android 14/16 visual evidence, then R08 review.

## Runtime limits that remain intentional
Do not fabricate turn order, HP/MP, conventional level/XP/class, skill prerequisites, crafting/shop values, or geographic map coordinates when absent.

## Recommended direction
Tactical Minimal + Royal Strategy + contextual Living World.

## Readiness
Research complete.
Adapter implemented.
Renderer implemented.
Scoped style candidate prepared.
Shared UI wiring pending Integrator/B07.
Visual evidence pending integration.
