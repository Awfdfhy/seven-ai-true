# Seven Cohesion Pass

Status: ACTIVE  
Mode: feature freeze except release blockers, security fixes, and evaluation infrastructure.

## Why this pass exists

Seven has accumulated capable subsystems, but "implemented" has sometimes been treated as equivalent to "good product". This pass changes the release criterion. A feature is not complete because code exists; it is complete only when it is useful, coherent, testable, and integrated with the rest of Seven.

## Release model

Every feature is classified as one of:

- KEEP — useful, coherent, and already meets its product contract.
- REBUILD — valuable idea, but execution does not meet the product contract.
- REMOVE — insufficient user value or creates more complexity than benefit.

Current classification:
- Core chat: KEEP / harden.
- UI foundation: REBUILD.
- RPG workspace: REBUILD.
- Search: KEEP / evaluate against product contract.
- Research: KEEP / integrate execution plane.
- Coding workspace: KEEP / evaluate.
- Memory/context: KEEP / evaluate.
- GitHub Self-Dev: KEEP / security harden.

## Definition of Done

A feature ships only when all four gates pass:

1. Functional — workflows complete without broken states or regressions.
2. Experience — a user can understand and use it without hidden knowledge or confusing detours.
3. Integration — it follows Seven's shared visual, navigation, persistence, localization, and model-routing conventions.
4. Evidence — automated tests and repeatable evaluation scenarios demonstrate the expected behavior.

## Product Contract requirement

No substantial feature work begins without a Product Contract containing:

- purpose and non-goals
- primary user flow
- success and failure states
- reference UI / design-system constraints
- acceptance scenarios
- integration requirements
- performance budget
- Android/mobile/RTL requirements
- persistence/migration requirements
- observability and regression evidence

## Build vs Judge separation

The worker that implements a feature may not be the only evaluator.

Default chain:
Builder -> Testing/CI worker -> independent integration reviewer -> manager report.

The integration reviewer should reject merge readiness when a feature only satisfies implementation details but misses the product contract.

## First sprint

### Stream A — UI Foundation V2
Owner: agent/01-ui-ux  
Test partner: agent/08-testing-ci  
Reviewer: agent/10-integration-review

Goal: replace layered visual patching with one coherent design-system contract and measurable golden-screen coverage.

### Stream B — RPG V2 Vertical Slice
Owner: agent/04-research  
Memory/context support: agent/06-memory-context  
Test partner: agent/08-testing-ci  
Reviewer: agent/10-integration-review

Goal: rebuild RPG around a compelling 10-minute core experience instead of exposing infrastructure controls as the primary UX.

### Freeze rule

No new feature may bypass these two streams while this pass is active unless it fixes a release blocker, a security issue, or enables the evaluation system itself.
