# AGENT_WORKBOARD — 20-Agent UI Strike Team

Every agent owns exactly 50 catalogue references and may mark them visually reviewed only after actual inspection.

| Agent | Role | Reference range | Focus | Production lease |
|---|---|---|---|---|
| A01 | Research/Audit | REF-0001–0050 | architecture + shell | reports only |
| A02 | Research/Audit | REF-0051–0100 | mobile geometry + safe areas | reports only |
| A03 | Research/Audit | REF-0101–0150 | RTL/Arabic/a11y | reports only |
| A04 | Research/Audit | REF-0151–0200 | tokens/type/spacing/z-index | reports only |
| A05 | Research/Audit | REF-0201–0250 | pickers/menus/popovers | reports only |
| A06 | Research/Audit | REF-0251–0300 | settings/forms/keyboard | reports only |
| A07 | Research/Audit | REF-0301–0350 | messages/actions/attachments | reports only |
| A08 | Research/Audit | REF-0351–0400 | workspace consistency | reports only |
| B01 | Implementation | REF-0401–0450 | canonical shell/navigation | shell lease |
| B02 | Implementation | REF-0451–0500 | topbar/sidebar/mobile header | header lease |
| B03 | Implementation | REF-0501–0550 | chat/message/composer | chat lease |
| B04 | Implementation | REF-0551–0600 | model/mode/attachment menus | picker lease |
| B05 | Implementation | REF-0601–0650 | settings/dialogs/forms | overlay lease |
| B06 | Implementation | REF-0651–0700 | RTL/Arabic/a11y | direction/a11y lease |
| B07 | Implementation | REF-0701–0750 | RPG/Coding/Research/Self-Dev frame | workspace lease |
| B08 | Implementation | REF-0751–0800 | theme/token consolidation | theme lease |
| V01 | Validation | REF-0801–0850 | Android 14 visual review | evidence only |
| V02 | Validation | REF-0851–0900 | Android 16 visual review | evidence only |
| V03 | Validation | REF-0901–0950 | viewport matrix visual review | evidence only |
| I01 | Integrator | REF-0951–1000 | final synthesis + consistency | shared/core only |

## Per-agent required research output
- 50 visually inspected references with completed metadata
- 10 design rules
- 5 anti-patterns
- 5 strongest references
- 3 derived concepts

## Implementation gate
B01–B08 may not start broad production writes until reference review, canonical tokens, ownership, deletion targets and shortlist are documented. Shared/core writes are I01/Chat 0 only.

## RPG priority
At least half of promoted references must remain directly or indirectly relevant to RPG, narrative UX, game state, character/world/canon/relationship UI, or game-to-mobile adaptation.
