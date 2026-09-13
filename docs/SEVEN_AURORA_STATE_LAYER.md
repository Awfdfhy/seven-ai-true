# Seven Aurora State Layer

Status: FINAL UI PLAN / Beta implementation active

Aurora is Seven's semantic ambient-state language. It is not a decorative palette and must never invent system state. Real runtime state drives Aurora; Aurora only expresses it through color, glow, motion and intensity.

## Core contract

Every Aurora signal has two independent values:

- `state`: what Seven is doing or what outcome is known.
- `intensity`: how strongly that state should be expressed in the UI.

Supported states:

| State | Meaning | Visual family |
| --- | --- | --- |
| `idle` | Ready / normal | Seven Blue |
| `thinking` | reasoning / planning | Blue → Violet |
| `research` | search / evidence retrieval | Aurora Blue |
| `coding` | agent execution / tools / file work | Deep Cobalt |
| `rpg` | story / world simulation | Soft Violet |
| `success` | verified / committed / completed | Calm Green |
| `warning` | review needed / uncertainty / CANON_GAP | Amber |
| `error` | blocked / failed / unrecoverable state | Soft Red |

Supported intensities: `low`, `medium`, `high`.

Intensity never changes semantic meaning. `error/low` is still an error; `thinking/high` is still thinking.

## Beta runtime API

The Beta UI exposes:

```js
SevenAurora.set(state, intensity)
SevenAurora.reset()
SevenAurora.getState()
SevenAurora.getIntensity()
```

Current automatic mapping:

- Chat → `idle/low`
- Think → `thinking/medium`
- Search → `research/medium`
- Research → `research/medium`

Coding, RPG and outcome states are available now as real semantic hooks, ready for their dedicated functional workspaces.

## Surfaces

Aurora may influence only existing functional surfaces unless a new functional surface is intentionally added:

1. Topbar Aurora Orb and status chip.
2. Composer edge / focus energy.
3. Primary action accent.
4. Message/evidence edge accents where appropriate.
5. Future Coding Agent activity rail, terminal/tool states and verification result.
6. Future RPG/Real Works world-state header, canon status and event-state accents.
7. Success, warning and error feedback.

No fake controls or decorative status surfaces may be introduced just to display Aurora.

## Day / Night rule

Semantic identity is invariant across Day and Night. The surrounding surface, contrast, depth and glow adapt to the active theme, but `coding` remains Coding and `warning` remains Warning.

Aurora therefore sits above the theme layer:

`Theme (Day/Night) → Surface treatment`

`Aurora state → Semantic energy`

The two systems compose instead of replacing each other.

## Motion language

Motion is state-sensitive but deliberately small:

- Idle: stable / nearly still.
- Thinking: slow breathing rhythm.
- Research: quicker exploratory pulse.
- Coding: precise, faster execution rhythm.
- RPG: slow floating rhythm.
- Success: settles rather than looping.
- Warning: measured alert rhythm.
- Error: fastest allowed alert rhythm, never flashing aggressively.

`prefers-reduced-motion` disables Aurora looping motion. Lite performance tier also suppresses nonessential effects.

## Coding Agent integration plan

When the dedicated Coding Agent workspace is built, it should call Aurora from real execution state:

- inspecting / planning → `thinking`
- editing / tool execution → `coding`
- running tests / verification → `coding` or `research` according to the actual operation
- verified checkpoint / successful commit → `success`
- permission uncertainty / unresolved side effect → `warning`
- failed tool / failed test / blocked transaction → `error`

Intensity guideline:

- background/idle coding context → low
- active operation → medium
- foreground long-running or critical operation → high

Aurora must not mark an operation `success` merely because a model says it succeeded. Verified execution state is authoritative.

## RPG / Real Works integration plan

When the dedicated RPG cockpit is built:

- normal story/world interaction → `rpg/low` or `rpg/medium`
- major scene/event resolution → `rpg/high`
- source/canon retrieval → `research`
- unresolved canon coverage / `CANON_GAP` → `warning`
- canon-verified resolution may briefly use `success`
- runtime failure or blocked world transaction → `error`

Aurora must never convert uncertainty into canon confidence. Canon state comes from the Real Works / Truth systems.

## Truth and authority invariants

1. Visual state never grants authority.
2. `success` requires an authoritative successful state from the owning runtime.
3. `warning` must remain visible while a relevant uncertainty is unresolved.
4. `error` cannot be hidden by switching modes.
5. Theme, animation or user preference cannot rewrite semantic state.
6. Reduced Motion changes motion only, never meaning.

## Performance invariants

- No polling loop for Aurora.
- No background canvas, WebGL or particle system.
- No image asset required for the Orb.
- CSS variables and DOM data attributes are the primary rendering mechanism.
- Heavy visual effects are forbidden in Lite tier.
- Release-layer hard cap remains 100,000 bytes unless the architecture is deliberately revised later.

## Beta freeze rule

The Beta implementation establishes the Aurora DNA. Future work should wire new functional surfaces into `SevenAurora` rather than create separate one-off color systems.

The final UI may refine optical values, easing, spacing and material treatment, but should preserve the state taxonomy and truth invariants unless a verified product need requires a versioned change.
