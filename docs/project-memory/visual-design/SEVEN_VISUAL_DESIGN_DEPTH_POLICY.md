# Seven Visual Design Depth Policy

Status: APPROVED DESIGN WORKFLOW POLICY
Branch: `ultimate-polish-v1`
Scope: visual design depth for Home and all major Seven UI systems

## Decision
Use approximately **20 focused visual designs per major UI system/component family** as the default creative budget when that depth is useful.

This is a flexible design budget, not a mandatory quota and not a completion counter.

## Why
Seven is being designed as a complete product system rather than a collection of attractive mockups. A single poster cannot adequately specify component anatomy, interaction, state transitions, edge cases, accessibility, responsive behavior and performance variants.

More focused visual artifacts allow individual design questions to be solved and reviewed at useful scale.

## Rule: depth without filler
Do not generate redundant images merely to reach 20.

- If a system is fully resolved in 12–14 focused artifacts, stop there.
- If a complex system such as Coding, RPG or Real Works genuinely needs more than 20, continue beyond 20.
- Combine closely related states when doing so improves comparison and does not hide important detail.
- Split dense boards when compression makes components difficult to judge.

Quality and coverage outrank the number of images.

## One visual artifact, one focused design question
Prefer each artifact to answer a specific question instead of packing the entire product into a poster.

Examples:
- What is the final Composer icon language?
- How does attachment selection work?
- What does Voice/Listening look like?
- How are Auto/Fast/Balanced/Deep exposed without clutter?
- How does a permission-required task appear?
- How does the same component behave in Arabic RTL?
- What survives in Lite/Reduced Motion?

Atlas/poster boards may still be created for overview and comparison, but they do not replace focused design artifacts.

## Coverage dimensions
For each major UI system, use the visual budget to cover the dimensions that actually matter, which may include:
- component anatomy;
- default/focus/pressed/disabled states;
- loading/progress/completion/error;
- permissions and blocked states;
- empty/first-use/offline states;
- sheets, menus and overlays;
- navigation/transition flows;
- Day/Night;
- Arabic RTL and mixed bidi;
- small/regular/large Android layouts;
- large text and accessibility;
- Full/Balanced/Lite;
- Reduced Motion;
- rare but important edge cases;
- comparison/polish rounds;
- final integrated state.

Not every system needs every dimension as a separate image.

## Universal Composer example
The Composer may initially be explored through focused groups such as:
1. core/default states;
2. icon language;
3. attachments;
4. tools;
5. voice/multimodal;
6. mode/compute selection;
7. expanded/multiline input;
8. context indicators;
9. contextual suggestions;
10. send/cancel/retry;
11. loading/progress;
12. errors/offline;
13. permissions;
14. long/complex input;
15. Day/Night;
16. Arabic RTL;
17. small-phone adaptation;
18. accessibility/large text;
19. Lite/Reduced Motion;
20. final integration/polish.

This is an example exploration map, not a fixed checklist. Merge or expand items as the design requires.

## Product-wide implication
Applying this depth across Home, Chat, Coding, Research, RPG, Real Works, Memory, Context, Projects, Tools, Model & Compute, Evolution, Repair, Settings and shared systems may result in hundreds of visual references.

That is acceptable when the artifacts are organized, non-redundant and tied to explicit design decisions. The intended outcome is a **Seven Visual Design Bible**, not a pile of disconnected concept art.

## Storage and documentation
Approved design decisions must be captured in written GitHub specifications. Visual artifacts are references/evidence of intended appearance; written specs preserve dimensions, semantics, interactions, accessibility, performance and truth boundaries.

A visually attractive image alone does not freeze a component.

## Relationship to Home workflow
This policy extends `SEVEN_HOME_UI_DESIGN_WORKFLOW.md`.

Home continues to use:
`Component-by-component -> State-by-state -> Interaction flows -> Integrated screens -> Final specification`

The ~20-artifact budget gives each major component/system enough room for genuine exploration and refinement without forcing every idea into a single board.

## Current next target
Continue detailed Universal Composer design. The first focused Composer board exists as a visual exploration, and the icon language is currently being polished before proceeding to the remaining Composer interaction/state artifacts.