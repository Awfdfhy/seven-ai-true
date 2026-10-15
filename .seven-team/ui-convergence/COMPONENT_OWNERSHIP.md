# COMPONENT_OWNERSHIP — Seven UI Convergence

Source base: `f86d409bcf914280246078d235e8f96ee73337a3`

Rule: one canonical owner per surface. Shared/core files are Integrator-only.

| Surface | Owner | Canonical target | Forbidden parallel ownership |
|---|---|---|---|
| Global tokens/theme | I01 / Chat 0 | `release/workspaces/ui-foundation.css` | workspace-local global token systems |
| Shell/navigation | B01 + I01 | canonical shell module | new shell CSS stacks |
| Topbar/sidebar/mobile header | B02 | shell DOM + canonical shell CSS | workspace-local header overrides |
| Chat/message/composer | B03 | base chat DOM + canonical components | RPG composer clone |
| Model/mode/attachments | B04 | one picker/menu family | native/custom/shell independent state owners |
| Settings/dialog/forms | B05 | one overlay family | multiple modal systems |
| RTL/Arabic/a11y | B06 | logical properties + narrow RTL exceptions | physical-direction patch layers |
| Workspace frame | B07 | hub + adapters | bespoke shell per workspace |
| Theme/token consolidation | B08 + I01 | UI foundation | duplicate token ladders |
| RPG story surface | Chat 2 / B07 | `release/workspaces/rpg.js` + canonical RPG styles | recolored chat-only RPG |
| RPG inspectors/state | Chat 3 / B07 | RPG context adapters | independent modal stack |
| Validation | V01–V03 | evidence only | production writes |
| Final integration | I01 / Chat 0 | shared/core | non-integrator shared/core merge |

## Shared/core lock
Integrator approval is required for `seven_ai-final.html`, `release/build-release.cjs`, `release/beta-ui.css`, `release/seven-final.css`, `release/ui-hardening.css`, `release/workspaces/seven-shell*.{css,js}`, `release/workspaces/hub*.{css,js}`, and every global design-system file.

## Rule
Replace → migrate call sites → delete legacy. Do not solve ownership conflicts with higher specificity or new `!important`.
