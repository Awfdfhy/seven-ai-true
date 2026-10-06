# RPG UI B ACCESSIBILITY CONTRACT

## Required semantics
- Root inspector container has an accessible label supplied by the canonical BottomSheet/InspectorPanel owner.
- Section headings use real heading elements in descending hierarchy.
- State chips always contain text; color is supplemental.
- Disabled/unavailable abilities retain visible explanation.
- Item quantity/equipped state remain textual.
- Faction relationships are labeled "Allies"/"Enemies" (localized), not conveyed by color or position only.
- Battle conflict state is textual.

## Focus and keyboard
Mount helper is intentionally passive. Focus ownership belongs to the canonical overlay primitive.
Integrator must guarantee:
- focus moves into the opened inspector,
- Escape/Android Back closes through canonical overlay behavior,
- focus returns to trigger,
- no keyboard trap,
- all interactive controls >=44px hard floor, target 48dp.

## Arabic / RTL
- Renderer declares dir=rtl for Arabic.
- No chronology/order arrays are reversed by renderer.
- Long Arabic ability/item/faction names may wrap.
- No physical left/right positioning is required.
- Numerals retain source values; do not localize game-state identifiers destructively.

## Large text
At 150%:
- labels may wrap,
- chips may wrap to new rows,
- no fixed-height information rows,
- no ellipsis on primary action names.

## Screen readers
When interactive affordances are added by B07/I01:
- buttons require explicit accessible names,
- expanded sheets/panels expose expanded state,
- selected tabs expose selected state,
- unavailable action reason is included in accessible description.
