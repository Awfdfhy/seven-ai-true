# Shared Component Inventory — Chat 4

| Primitive / Surface | Current owners observed | Decision | Canonical direction |
|---|---|---|---|
| Color tokens | seven_ai-final.html, seven-final.css, beta-ui.css, hub.css, shell CSS | MERGE | one semantic `--seven-color-*` contract |
| Typography scale | multiple CSS layers | REWRITE | seven roles only |
| Spacing | ad-hoc values across layers | REWRITE | 2/4/8/12/16/20/24/32/40 |
| Radius | 8/12/13/14/15/16/18/20/22/24/26/28/999 | MERGE | control/card/dialog/sheet/pill tokens |
| Elevation/shadow | seven-final + shell/hub | MERGE | canonical elevation ladder |
| Z-index | 8/15/90/400/2200/2400/9999/10020+ | REWRITE | 0/10/100/200/300/400/500/600 |
| Focus ring | seven-final, hub, generated UI | MERGE | single visible focus contract |
| Buttons | base, generated UI, workspace buttons, shell buttons | MERGE | shared target/state tokens; owners keep structure |
| Inputs/Textareas/Selects | settings modal, generated UI, workspace forms | MERGE | shared field geometry/states |
| Toggle/Checkbox/Radio/Slider | settings/base runtime | KEEP + NORMALIZE | preserve behavior; unify visual tokens |
| Cards | workspace/generated/settings sections | MERGE | semantic surface/border/radius/elevation |
| Menus/Popovers | beta UI + ui-polish + shell | REWRITE by owning leads | consume Chat 4 tokens only |
| Modal/Dialog | seven-final, ui-hardening, shell layers | MERGE | one dialog geometry/focus strategy |
| Bottom sheet | picker/menu mobile treatments | MERGE where existing | use only for pickers/context actions/details |
| Toast/Notice/Error | multiple local styles | MERGE | semantic status tokens and icon/text |
| Settings sections/tabs | ui-hardening + runtime shell | KEEP + NORMALIZE | grouped mental model; mobile one-column |
| RTL shared rules | rtl.css + scattered physical properties | REWRITE | root direction + logical properties + bidi leaves |
| Reduced motion | seven-final/beta/hub/generated repeated | MERGE | one policy; local components consume |
| Theme | legacy + beta + hardening duplicate night blocks | REWRITE incrementally | day/night use same semantics |
| seven-shell.css | shell ownership | MERGE/DELETE by Chat 0 | Chat 4 does not own structure |
| seven-shell-final.css | shell ownership | MERGE/DELETE by Chat 0 | surviving shell uses semantic tokens |
| ui-polish-fixes.css | override layer | DELETE after owner migration | no new replacement override |
| ui-hardening.css | overflow/safe-area + duplicate visuals | MERGE | retain hardening only, delete visual duplication |
| generated-ui.css | shared generated primitives | MERGE | consume semantic tokens |
| hub.css | workspace shell | MERGE | consume semantic tokens |
