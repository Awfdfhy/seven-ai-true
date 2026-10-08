# LEGACY_UI_DELETION_PLAN

## Verified debt
Repository audits identify:
- 3 overlay/modal systems: `.modal/.modal-content`, `.s-modal/.s-dialog`, and shell backdrop/menu layering.
- 2+ model-selection presentations with separate styling/state projections.
- Legacy sidebar navigation plus runtime-built primary navigation.
- 5 simultaneous token namespaces.
- Runtime CSS injection whose precedence depends on load timing.
- About 471 `!important` declarations across inspected UI stylesheets.

## Deletion order
1. Introduce canonical semantic aliases with zero intended visual change.
2. Make CSS load order deterministic.
3. Move shell geometry into one shell stylesheet; delete duplicate shell declarations.
4. Collapse model/mode picker rendering to one component family and one state adapter.
5. Migrate modal call sites to one overlay contract; delete legacy modal rules.
6. Move workspace-global tokens out of hub/RPG/generated CSS.
7. Replace physical left/right geometry with logical properties.
8. Remove obsolete runtime CSS loaders after migrated CSS is deterministic.
9. Delete stale CSS files only after call-site and screenshot verification.
10. Add a gate rejecting new duplicate token namespaces and unapproved `!important`.

## Do not delete yet
`beta-ui.css` remains load-bearing until its legacy theme bridge is migrated.
`rtl.css` remains as a narrow exception layer until physical-direction dependencies are removed.
