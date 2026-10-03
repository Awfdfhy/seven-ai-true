# Seven Evaluation Gate

## Principle

Tests must answer "does the product work as intended for a person?" rather than only "does a function return the expected value?"

## Gate A — Functional

Required:
- no uncaught runtime errors in the target flow
- persistence survives close/reopen when the contract requires it
- Stop/cancel affects only the intended operation
- no horizontal overflow at supported mobile widths
- RTL and day/night themes remain functional
- Android WebView smoke passes for the target surface

## Gate B — Experience

Each feature must have scenario tests with an explicit user goal and maximum friction budget.

Example form:

- Goal: start a new RPG session.
- Starting state: fresh install, no imported packs.
- Expected: first meaningful story turn in <= 3 user-visible actions.
- Failure: requires knowledge of JSON packs, hidden setup, or unexplained control panels.

Experience evidence can be automated where deterministic and manually reviewed where visual/semantic judgment is required.

## Gate C — Integration

A feature must:
- use shared navigation conventions
- use shared design tokens/components
- support Arabic/RTL where the rest of Seven does
- obey common persistence and model-routing rules
- avoid introducing a parallel settings or modal system unless explicitly approved
- not duplicate an existing control surface

## Gate D — Evidence

Required artifacts for merge readiness:
- relevant automated test output
- Android WebView screenshot set for UI-affecting changes
- a short before/after behavior note
- known limitations
- independent reviewer verdict: READY / CHANGES REQUIRED

## Golden screens

Maintain reference coverage for:
- Chat
- Sidebar
- Model picker
- Mode/depth dialogs
- Search
- Research
- Coding
- RPG
- Settings tabs
- Attachments
- Arabic RTL
- Day/night
- smallest supported phone width
- landscape / increased font scale

Visual changes must be intentional and reviewed; accidental drift is a regression.

## Anti-patterns that fail the gate

- "The button exists" as proof of usefulness.
- Adding more CSS overrides to hide a structural layout problem.
- A feature requiring manual internal-format imports for its primary happy path.
- The same agent implementing and self-approving a major feature.
- Declaring success while CI only proves unit-level behavior.
