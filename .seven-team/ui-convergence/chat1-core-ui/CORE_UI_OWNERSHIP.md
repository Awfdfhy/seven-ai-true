# Seven AI — Core UI Ownership

## Canonical target
| Surface | Canonical owner after convergence | Transitional sources to absorb |
|---|---|---|
| App shell / mobile nav | `release/workspaces/seven-shell-final.{css,js}` | `seven-shell.{css,js}` |
| Topbar / workspace chip | `seven-shell-final` | `beta-ui.css`, `seven-final.css` core selectors |
| Sidebar / room list / new chat | `seven-shell-final` | `seven-shell`, UI-only parts of `ui-polish-fixes` |
| Chat width / message presentation | `seven-shell-final.css` | `seven-shell.css`, `seven-final.css` |
| Message actions | `seven-shell-final.js` | `seven-shell.js` |
| Composer visual shell | `seven-shell-final.{css,js}` | `seven-shell.css`, `seven-final.css`, `beta-ui.css` |
| Model picker | `seven-shell-final.{css,js}` | old shell model menu + polish model panel merged into one |
| Mode/attachment presentation | `seven-shell-final.css` visual only | behavior remains existing runtime |
| Empty/loading/error visual states | `seven-shell-final` | old shell empty state + existing app state logic |

## Boundaries
- Settings deep redesign: **not owned by Chat 1**.
- RTL design-system/global tokens: coordinate with Chat 0/Chat 4.
- RPG internals/inventory/stats/world: excluded.
- Memory/Tools/Coding business logic: excluded unless a UI contract blocks rendering.

## Coordination contract
Chat 1 performs convergence on `ui/chat1-core-ui-20261006`. Shared-shell changes are proposed for Chat 0 integration; no claim of final authority over global tokens.
