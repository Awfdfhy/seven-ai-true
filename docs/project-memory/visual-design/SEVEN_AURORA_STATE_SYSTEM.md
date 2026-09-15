# Seven Aurora State System

Status: APPROVED DESIGN DIRECTION
Branch: `ultimate-polish-v1`
Scope: visual/runtime-state language for Seven UI

## Purpose
Aurora is Seven's living visual language for communicating what the intelligence is doing at a glance. It is semantic presentation, not evidence, authority, confidence, or verification.

## Prime visual rule
**Same Seven. Different Energy.**

The core `7` silhouette must remain recognizably Seven in every state. State identity is expressed primarily through:
- Focus Halo
- Orbit Thread
- State Node
- gradient bias
- light intensity
- motion behavior

Do not turn each state into a different logo.

## Brand anchor
The permanent visual DNA remains within Seven's cyan -> electric blue -> violet family. Semantic state colors bias or extend that DNA rather than replacing it.

## Primary Aurora states

| State | Primary color direction | Meaning |
|---|---|---|
| Idle | `#3B82F6` + `#7C5CFC` | ready / calm presence |
| Listening | `#18C7E8` + `#3B82F6` | receiving / attention |
| Thinking | `#665CFF` + `#A855F7` | internal reasoning |
| Researching | `#00B8D9` + `#5067FF` | exploration / evidence acquisition |
| Coding | `#00D6C9` + `#258BFF` | technical construction / debugging |
| RPG / World | `#6D5CFF` + `#A855F7` + `#35D5E8` | entering / operating a living world |
| Generating | `#8B5CF6` + `#EC5BC8` | creation / synthesis |
| Success | `#19CFA1` + `#20BFE7` | completed successfully |
| Warning | `#FFB84D` + `#EF7C62` | attention required |
| Error | `#FF5576` + `#D94A8C` | failure / something went wrong |

These values are the approved design direction, not an immutable implementation token contract. Final contrast/device calibration may adjust exact values while preserving perceptual identity.

## RPG / World Aurora
RPG is a first-class Aurora state and should be one of Seven's richest visual states without becoming expensive or decorative noise.

Base RPG gradient:
`#6D5CFF -> #A855F7 -> #35D5E8`

Optional secondary highlight:
`#FF73C7`

Visual behavior:
- core Seven mark remains recognizable;
- deeper, wider halo than ordinary idle state;
- two thin asymmetric orbit paths may represent world + player;
- a short orbit pulse may communicate a committed World Event;
- avoid continuous high-cost particle effects.

### RPG sub-states
RPG sub-states inherit the main RPG identity rather than inventing unrelated colors.

- **World**: cyan/blue bias; exploration and world-state activity.
- **Story / Scene**: violet bias; active narrative scene.
- **Character**: restrained magenta/violet bias; character interaction/focus.
- **Canon / Real Works**: cool blue/cyan bias plus Evidence Rail when source/canon evidence matters.
- **Divergence / What-if**: violet/pink split primarily in orbit treatment; branch state must also be expressed through text/iconography, never color alone.

## State intensity
Aurora supports intensity without creating separate identities for every internal operation.

Examples:
- Idle: low-energy breathing halo.
- Thinking: medium-energy orbit.
- Deep Think: stronger/double halo or orbit treatment.
- Research: broader directional orbit/evidence motion.
- Deep Research: increased violet depth/intensity while retaining Research identity.
- Coding: precise cyan/blue movement; short pulses may mark test/build events.
- Waiting for Permission: motion settles/pauses and an amber semantic State Node communicates required attention.

Intensity must never be interpreted as truth, confidence, authority, or quality.

## Motion vocabulary
Approved conceptual motion vocabulary:
- **Breath**: calm readiness / idle.
- **Pulse**: short acknowledgement or event.
- **Orbit**: active processing / continuity.
- **Double Orbit**: deeper reasoning or RPG world/player duality when contextually appropriate.
- **Spiral**: bounded transition into deeper activity; use sparingly.
- **Burst**: very short completion/event acknowledgement, never a constant loop.
- **Settle**: return from active state to stable state.

Motion must be meaningful, lightweight, interruptible and governed by performance tier and Reduced Motion.

## Semantic safety
Aurora must never claim or imply:
- verified truth;
- evidence quality;
- model confidence;
- permission approval;
- successful side effects;
- canonical authority.

Those require explicit runtime/evidence UI.

Success, Warning and Error may use conventional semantic color families, but color is never the sole carrier of meaning. Pair with State Node, icon, label and/or accessible text.

## Dark and Light modes
The same state identity must survive both themes.

### Dark
- deeper canvas;
- brighter halo edges allowed;
- glow kept local rather than flooding cards/surfaces;
- preserve readable text and card hierarchy.

### Light
- use softer translucent halos and restrained saturation;
- avoid washed-out cyan on white;
- state should remain visible through outline/orbit/node geometry, not only glow;
- backgrounds remain bright and airy rather than neon-heavy.

## Performance tiers
### Full
May use richer but bounded halo/orbit effects and short state transitions.

### Balanced
Default presentation: reduced layers, restrained blur and efficient transform/opacity-based motion.

### Lite
Preserve state recognition with static/near-static gradient, outline, State Node and minimal transition. No expensive decorative loops.

The visual identity must remain recognizably Seven in every tier.

## Reduced Motion
Reduced Motion is authoritative. Replace continuous/large motion with:
- static halo state;
- gentle opacity change when allowed;
- state icon/node change;
- text label;
- optional single short transition where platform preference permits.

No functionality or state information may depend on animation.

## Accessibility
- never encode state by color alone;
- use state labels/icons/nodes where state matters;
- maintain contrast in Day and Night themes;
- support RTL without changing semantic meaning;
- screen-reader descriptions should announce meaningful runtime state changes without flooding announcements.

## UI integration
Aurora may appear in:
- Seven Orb / central action control;
- compact runtime state indicators;
- active task cards;
- Chat/Coding/Research/RPG workspace headers;
- task progress surfaces;
- Home when a meaningful active task exists.

Aurora should not be painted across every card. The UI needs neutral surfaces so Aurora retains hierarchy.

## Home behavior
Home can reflect the most important current runtime state through the Seven Orb and a compact active-task surface. It should not continuously transform the entire screen background for every minor internal operation.

## Relationship to Design Genome
Aurora uses existing Seven visual primitives:
- **Focus Halo**: attention/active state.
- **Orbit Thread**: continuity, process and movement.
- **State Node**: explicit semantic state.
- **Evidence Rail**: evidence/source/canon structure where relevant, especially Research and Real Works.
- **Seven Cut**: identity geometry, not a semantic state channel.

## Approved direction summary
Aurora is not a set of colored logos. It is a coherent state language built around one stable Seven mark. The halo, orbit, node, color bias, intensity and bounded motion communicate activity while explicit UI communicates truth and operational meaning.

Approved primary family:
`Idle · Listening · Thinking · Researching · Coding · RPG/World · Generating · Success · Warning · Error`

Approved RPG sub-family:
`World · Story/Scene · Character · Canon/Real Works · Divergence/What-if`

This document records the design direction approved during the collaborative UI design session. Implementation values remain subject to contrast, Android device, performance and accessibility verification.