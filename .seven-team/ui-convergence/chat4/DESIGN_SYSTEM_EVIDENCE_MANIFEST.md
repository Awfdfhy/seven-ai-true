# Chat 4 — Design System Visual Evidence Manifest

## Evidence branches

- BEFORE baseline head: `e56c34429d44330933baea4c489e0e1b0722d513`
- AFTER implementation head: `0f623ae6c8d5cd3275d149afd001f47e543341c2`
- BEFORE workflow: Seven AI tests run `37398037839`
- AFTER workflow: Seven AI tests run `37397997486`

## Artifact location

The existing Seven AI tests artifact already uploads `dist/vendor/**`.
Visual evidence is written to:

`dist/vendor/design-system-evidence/`

No workflow/budget rule was weakened and no second artifact mechanism was added.

## Required screenshot set

For Settings, one screenshot is captured for every combination:

- widths: 320, 360, 390, 420
- direction: LTR, RTL
- theme: Day, Night

That is 16 Settings screenshots per evidence branch.

Additional screenshots:
- Arabic RTL Settings at 320px
- large-text RTL Night at 800×360
- large-text RTL Night at 390×430

Expected total: **19 BEFORE + 19 AFTER = 38 visual files**.

## Naming

BEFORE:
`before-settings-{width}-{dir}-{theme}.png`
`before-settings-320-rtl-arabic.png`
`before-large-text-{width}x{height}-rtl-night.png`

AFTER:
`after-settings-{width}-{dir}-{theme}.png`
`after-settings-320-rtl-arabic.png`
`after-large-text-{width}x{height}-rtl-night.png`

## Review gate

D04 must inspect the actual artifact images after CI succeeds. A green DOM/bounds assertion alone is insufficient for DESIGN SYSTEM READY.

Review specifically for:
- clipped or horizontally overflowing settings
- inconsistent padding/radius
- incorrect RTL ordering/alignment
- unreadable Arabic density
- day/night surface inconsistency
- tiny controls
- focus/selection visibility
- modal/dialog clipping under large text
