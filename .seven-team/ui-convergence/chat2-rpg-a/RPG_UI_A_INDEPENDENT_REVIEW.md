# Independent RPG UX Review — Baseline

Role: R04 — independent reviewer
Scope: pre-implementation baseline only. R04 does not fix production code.

## Baseline verdict
**BLOCKED for RPG UI A READY.**

## Evidence-based defects in current RPG surface
1. Primary visible chrome is engine/control-oriented rather than story-oriented.
2. Title/import controls dominate the specialized RPG layer.
3. Raw state can surface as engine-like status text.
4. Per-message copy affordances compete with narrative reading.
5. Mobile CSS hides the "more" control while the drawer contains advanced functions.
6. Physical directional CSS creates RTL risk.
7. Hard-coded notice colors bypass theme semantics.
8. Character, relationship, journal, canon and knowledge state are not given a coherent player-facing visual system.
9. The current surface does not exploit Seven's most distinctive runtime capability: character-local knowledge vs global truth.
10. The screen can function as chat, but does not yet communicate a persistent living world strongly enough.

## Two-question gate
- Does it look like a real RPG? **No — not yet.**
- Is it still easy like chat? **Mostly yes.**

Therefore the current design fails the dual requirement.

## Review requirements after implementation
R04 must review screenshots and interactions independently at:
320 / 360 / 390 / 420 widths, Arabic RTL, day/night, large text, landscape and keyboard-open.

R04 must reject if:
- story is buried under panels
- any permanent HUD becomes noisy
- hidden knowledge leaks
- relationship UI implies false directionality/precision
- archive becomes a dense desktop dashboard on mobile
- global shell/composer behavior regresses
