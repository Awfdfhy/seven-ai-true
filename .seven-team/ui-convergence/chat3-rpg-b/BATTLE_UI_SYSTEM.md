# BATTLE_UI_SYSTEM

## Canonical direction
**Tactical Minimal × Modern Fantasy HUD**, contextual rather than permanent.

## Runtime-safe model
Render only capabilities present in the current scene/session. The existing state contract exposes abilities and scene/timeline data, but not a universal HP/MP/initiative schema. Therefore the battle shell must tolerate:
- no turn order
- no resource meter
- no numeric health
- no target list
- abilities with `costs`, `limitations`, `cooldownTurns`, `lastUsedTurn`, `forbidden`

## Composition
1. **Battle Context Bar** — compact state: encounter label if available, active actor if known, high-priority alert.
2. **Turn Preview** — at most 3–5 future actors when the runtime provides order. Horizontal strip at >=390px; compact vertical peek at 320–360px.
3. **Action Sheet** — text-first ability rows: name, cost, cooldown/ready state, target type only when supplied, and unavailable reason.
4. **Status Stack** — max 3 visible priority states; overflow becomes “+N states”. Every icon has short text.
5. **Combat Log** — collapsed by default; event-first, not transcript spam.
6. **Narrator handoff** — combat events flow back into the story stream instead of creating a second chat.

## Interaction rules
- One primary choice zone in the lower thumb region.
- Disabled action always explains *why*.
- Target selection visibly changes the context header.
- Critical events may elevate typography/contrast briefly; minor damage/loot never gets cinematic treatment.
- Never show raw engine objects.

## 2-second test
User must identify: what is happening, whose decision matters, and what actions are currently valid.

## RTL/mobile
- Logical CSS properties only.
- Horizontal order strips reverse semantically only if runtime order is represented correctly; do not reverse chronology by CSS alone.
- 44px preferred touch targets.
- 320px: action sheet is single-column; no persistent side panels.

## Data contract blocker
A true initiative strip requires an explicit ordered actor list. Until it exists, show “active actor / recent turn” only. Do not infer initiative from speed or timestamps.
