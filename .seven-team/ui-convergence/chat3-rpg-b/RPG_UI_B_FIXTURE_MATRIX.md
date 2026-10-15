# RPG UI B FIXTURE MATRIX

Primary fixture: `fixture-rpg-ui-b.html`.

## Required screenshot mutations
Use the same adapter/renderer/mount stack and only change fixture state/language/theme.

1. empty
2. one-ability
3. twelve-abilities-long-arabic
4. inventory-30
5. faction-dense
6. battle-conflict-no-hp
7. four-world-events (expect only three primary events)
8. no-location
9. forbidden-ability
10. cooldown-ability
11. english-ltr
12. arabic-rtl

## Width matrix
320 / 360 / 390 / 420 portrait + 800×360 landscape.

## Theme matrix
day / night.

## Font scale
100% / 150%.

## Determinism
- fixed sample strings
- fixed state IDs
- no timestamps
- no network assets
- no random order
- no animations required
- screenshot state must be fully rendered synchronously from pure projection

## Expected invariants
- no horizontal overflow
- <=3 World Pulse event rows in primary view
- empty modules absent
- HP / MP / XP / Level strings absent unless deliberately introduced by a future explicit runtime contract
- source event order preserved
