# RPG UI A — Top 50 → Top 15 → Implementation 6

Source: `RPG_UI_A_IDEA_MATRIX.md`

## Top 50
I001, I003, I005, I007, I009,
I011, I013, I015, I017, I019,
I021, I023, I025, I027, I029,
I031, I033, I035, I037, I039,
I041, I043, I045, I047, I049,
I051, I053, I055, I057, I059,
I061, I063, I065, I067, I069,
I071, I073, I075, I077, I079,
I081, I083, I085, I087, I089,
I091, I093, I095, I097, I099.

Selection criteria:
- story remains primary;
- progressive disclosure;
- runtime-backed data only;
- 320px and RTL viability;
- no second global design system;
- no permanent dashboard/HUD.

## Top 15
1. I001 — Story Chat / Inline reveal
2. I003 — Story Chat / Focus panel
3. I007 — Story Chat / Tap identity → card
4. I011 — Narrator / Inline reveal
5. I018 — Narrator / List → detail
6. I024 — Character Quick Card / Accordion detail
7. I031 — Character Sheet / Inline reveal
8. I038 — Character Sheet / List → detail
9. I045 — Cast / Context chip → sheet
10. I052 — Relationship Focus / Bottom sheet
11. I061 — Relationship Graph / Inline reveal, spoiler-safe only
12. I072 — Quest Log / Bottom sheet
13. I083 — Journal / Focus panel
14. I094 — Timeline / Accordion detail
15. I108 — Canon / List → detail

## Implementation 6
1. Story-first context trigger.
2. Runtime-backed scene summary.
3. Tap character identity → quick card.
4. Advanced story tooling behind disclosure.
5. Character/cast strip sourced from active scene only.
6. Archive/canon/list-detail reserved for the coordinated inspector layer.

Implemented now: 1–5.
Deferred by ownership: 6 and deeper relationship/knowledge/archive inspectors.

Chat 3 owns RPG inspectors/state; Chat 2 must not create a parallel inspector stack.
