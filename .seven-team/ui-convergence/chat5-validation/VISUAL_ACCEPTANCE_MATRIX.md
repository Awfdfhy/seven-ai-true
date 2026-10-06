# Chat 5 — Visual Acceptance Matrix v1

Every tested cell requires a screenshot tied to the exact SHA. DOM-only checks do not count.

## Required dimensions
Widths: 320 / 360 / 390 / 420.
Platforms: Android 14 / Android 16.
Orientation: portrait everywhere; landscape for shell, chat, settings, RPG battle/map where supported.
Language: English LTR / Arabic RTL.
Theme: day / night.
Keyboard: closed / open.
Font: normal / large.
Content: empty / realistic / stress-long.

## Required surfaces
Core:
- app shell
- topbar
- sidebar + mobile navigation
- empty room
- long room
- long title
- chat messages
- long Arabic response
- code block
- table
- attachments
- composer
- send/stop
- model picker
- mode picker
- settings
- forms
- dialogs
- loading/error/empty states

Workspaces:
- RPG dialogue
- narrator presentation
- character
- relationship
- journal/canon/lore
- inventory/equipment
- map/world
- battle/system surfaces that actually exist
- Coding
- Research
- Self-Development
- Settings

## Minimum evidence set per Android version
1. 320 EN/LTR Day Normal Keyboard closed — shell/chat/composer.
2. 320 AR/RTL Night Large Keyboard open — chat/composer/picker.
3. 360 EN/LTR Night Large — settings/dialog.
4. 360 AR/RTL Day Normal — sidebar/navigation.
5. 390 EN/LTR Day + Night — long room/code/table/attachments.
6. 390 AR/RTL Day + Night — long Arabic response/model picker.
7. 420 EN/LTR — RPG narrative + character/journal.
8. 420 AR/RTL — RPG systems + cross-workspace frame.
9. Landscape — shell/chat/settings and applicable RPG map/battle.

## Screenshot metadata
Each evidence item must contain:
- exact SHA
- workflow run or local build identity
- device/emulator model
- Android version/API
- viewport/window size
- orientation
- theme
- language
- direction
- font scale
- keyboard state
- workspace
- surface
- test scenario
- reviewer
- timestamp

## Screenshot review rubric (1–5 each)
Alignment; Hierarchy; Spacing; Density; Typography; Readability; Contrast; Touchability; Consistency; Polish; RTL correctness; Accessibility; Visual noise; Clipping; Overflow.

### Verdict
- PASS: no automatic-fail condition, no criterion below 3, mean >=4.0.
- CONDITIONAL: no P0/P1 but one or more 3-level polish findings; becomes P2 register items.
- BLOCKED: any automatic-fail condition or any P0/P1.

## Automatic fail
- obvious text clipping
- overlapping controls
- critical action outside viewport
- duplicated control
- modal cannot be closed
- unreadable contrast
- broken RTL or incorrect semantic mirroring
- critical target below accepted touch target
- composer covered by keyboard
- model picker off-screen
- sidebar unusable
- visible legacy UI duplicate
- RPG looks like a separate unrelated product
- obvious horizontal overflow
- broken font scaling

## Cross-workspace consistency test
Hide the workspace name. Compare Core, RPG, Coding, Research, Self-Development, Settings.
They must still share recognizable Seven typography, spacing, buttons, menus, headers, cards, dialogs, navigation, theme behavior and icon grammar.

If the answer to “do these belong to one product?” is no, verdict = BLOCKED.

## Android 16 focus
Additionally inspect edge-to-edge, safe areas, status/navigation bars, WebView differences, keyboard resize/insets and back navigation.

## Evidence status
At creation of this matrix: **NOT EXECUTED / BLOCKED**.
