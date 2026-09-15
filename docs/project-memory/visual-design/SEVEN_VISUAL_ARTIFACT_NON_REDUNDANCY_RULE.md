# Seven Visual Artifact Non-Redundancy Rule

Status: APPROVED DESIGN WORKFLOW RULE
Branch: `ultimate-polish-v1`
Scope: all visual design series using numbered artifacts such as `01/20`, `02/20`, etc.

## Core principle
A numbered visual series is **not a tournament of repeated attempts**. It is a **puzzle of complementary design decisions**.

Each new visual artifact must add meaningful design coverage that is not already resolved by previous artifacts.

## Interpretation of the current Universal Composer series
- `01/20` established the Composer core states and general composition.
- `02/20` explored the icon/toolbar language and related controls.
- `03/20` expanded icon/state detail but overlapped too much with `02/20`.

`03/20` remains useful as an extended icon specification, but it marks the end of this repeated icon exploration unless a real unresolved issue is found.

## Rule for every next artifact
Before generating the next numbered visual, answer:
1. What specific design question is still unresolved?
2. Which previous artifact already covers adjacent territory?
3. What new decision will this artifact add?
4. Can the design be evaluated more clearly by focusing on a narrower topic?

If the answer does not reveal meaningful new coverage, do not generate another similar board.

## Allowed repetition
Repetition is justified only when it has a clear purpose, such as:
- fixing a discovered usability/accessibility problem;
- comparing two substantially different interaction models;
- validating a component in Day/Night or RTL when behavior changes materially;
- resolving a conflict between visual hierarchy and functionality;
- running a deliberate polish/finalization pass after the underlying system is complete.

Pure aesthetic retries do not count as progress.

## Current Composer progression
From `04/20` onward, the Universal Composer series should move across distinct subsystems rather than re-cover icon basics.

Suggested direction:
- `04/20` Attachments System
- `05/20` Voice & Multimodal
- `06/20` Modes / Compute Controls
- `07/20` Expanded / Long-form Composer
- `08/20` Context Indicators & Smart Suggestions
- `09/20` Tool Invocation & Tool Chips
- `10/20` Permissions / Safety / Side-effect confirmations
- `11/20` Offline / Error / Retry / Cancel / Uncertain states
- `12/20` Loading / Streaming / Progress / Background task handoff
- `13/20` Multi-attachment / mixed media / preview management
- `14/20` Project / Memory / Context binding
- `15/20` Day / Night reconciliation
- `16/20` Arabic RTL / mixed bidi
- `17/20` Small phone / adaptive layout
- `18/20` Accessibility / large text / touch / screen-reader semantics
- `19/20` Lite / Reduced Motion / low-resource behavior
- `20/20` Final Composer integration and polish

This is a working map, not an immutable quota. Merge, split, or reorder if interaction dependencies make another sequence better.

## Completion rule
A numbered series is complete when the system is sufficiently specified, not when the counter reaches its target.

The counter is a planning aid. Coverage, non-redundancy, clarity and implementability are the actual success criteria.

## Design philosophy
`20 images = 20 pieces of one system, not 20 tries at the same picture.`

This rule extends:
- `SEVEN_VISUAL_DESIGN_DEPTH_POLICY.md`
- `SEVEN_HOME_UI_DESIGN_WORKFLOW.md`

It should be applied to Home, Chat, Coding, Research, RPG, Real Works and every other major Seven UI design series.