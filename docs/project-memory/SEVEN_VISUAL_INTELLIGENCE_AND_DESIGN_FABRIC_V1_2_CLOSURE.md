# Seven Visual Intelligence & Design Fabric 1.2 - Durability Closure

Status: ARCHITECTURE_CANDIDATE
Cumulative stack: V1.0 + V1.1 + this closure
Governance: Polishing V5.40

## 1. Design Lint & Genome Compiler

The frozen Design Genome becomes executable policy, not only documentation.

The compiler/linter should detect where technically feasible:
- raw colors outside approved token declarations
- unapproved spacing/radius/shadow values
- one-off motion timings/easings
- direct semantic-state colors that bypass Aurora/state roles
- components missing required state tokens
- domain styles that bypass global interaction vocabulary
- inaccessible hit-target declarations
- asset references without provenance metadata

Escape hatches require:
- explicit reason
- owning component/domain
- expiry or review condition where temporary
- evidence showing why a canonical token/component is insufficient

Design lint does not make aesthetic decisions. It prevents accidental architecture drift.

## 2. Genome Coverage Ledger

Track product-wide adoption by component/surface, not by vague percentage.

For each surface record:
- token families adopted
- shared components adopted
- interaction vocabulary coverage
- typography coverage
- icon coverage
- motion coverage
- remaining legacy mappings
- scenario evidence
- rollback identity

A surface is not CANONICAL merely because its colors look similar.

## 3. Human Product Evidence Lane

For high-impact visual decisions where feasible, support bounded human evidence:
- pairwise preference
- recognition/recall
- task comprehension
- discoverability
- task efficiency
- confusion/error reports
- Arabic and English use where audience requires it

Rules:
- accessibility/truth/security invariants cannot be voted away,
- tiny preference differences are not treated as universal truth,
- sample/context limitations remain visible,
- owner preference can set product direction but is labeled as a product decision rather than objective proof,
- human study artifacts must respect privacy and consent.

## 4. Typography Resilience Plane

Typography candidates must survive:
- primary font available
- primary font unavailable
- offline startup
- missing glyph/fallback route
- Arabic shaping and punctuation
- Arabic/Latin mixed baseline
- numerals, dates, code and paths
- large text
- bold/system emphasis settings where exposed
- font swap/load transition

Measure:
- layout shift
- clipping/reflow
- line-height collisions
- asset bytes/load path
- readability judgment

A beautiful font with unstable fallback behavior is not a winning system font.

## 5. Interaction Vocabulary Registry

Every common interaction pattern has a canonical meaning.

Registry classes include:
- primary action
- secondary action
- destructive action
- toggle
- selection
- expansion/disclosure
- navigation/back
- stop/cancel
- retry/recover
- copy/share/export
- verified/uncertain/warning/error
- running/waiting/offline

For each class record:
- semantic meaning
- permitted icons/labels
- shape/state behavior
- Aurora relationship if any
- motion behavior
- accessibility semantics
- domain overrides, if justified

Same-looking controls should not carry conflicting meanings across workspaces.

## 6. Content Design Grammar

Visual hierarchy includes words.

Create governed content roles for:
- navigation labels
- button labels
- empty states
- onboarding
- permission prompts
- warnings/errors
- offline/provider failure
- progress/waiting
- success/verification
- uncertainty
- destructive confirmation
- import/export/recovery

Requirements:
- Arabic/English semantic parity
- concise labels without hiding important truth
- no fake certainty
- no anthropomorphic or decorative wording that obscures state
- text-expansion tolerance
- consistent terminology across Core/Build/Research/World

## 7. Post-Release Visual Health Plane

Observe visual health without default screenshot surveillance.

Privacy-preserving signals may include:
- horizontal-overflow occurrence
- layout exception/failure markers
- asset/font load failure
- long-task/jank aggregates tied to visual feature versions
- repeated fallback-tier activation
- unsupported component-state occurrence
- orientation/inset failures detected structurally
- visual-runtime exceptions

Rules:
- no background screenshot collection by default,
- no message/project content in health counters,
- telemetry authority cannot exceed its source,
- local-only diagnostics remain valid when telemetry is disabled,
- release rollback decisions require verified signals rather than raw counts alone.

## 8. Repetition & Fatigue Tests

Evaluate high-frequency visual behaviors over repeated use:
- message arrival
- thinking/research loops
- tool progress
- workspace switching
- theme transitions
- warnings/retries
- Aurora ambient treatment

A candidate can fail for cumulative distraction even if a single replay looks excellent.

Reduced Motion is not the only fatigue control; ordinary mode should also avoid attention theft.

## 9. System Personalization Resilience

Where platform/browser support exists, evaluate:
- large display/font settings
- bold/emphasis settings
- high-contrast/forced-color modes
- dark/light system preference
- themed launcher icons
- optional dynamic/system color

Seven may support system personalization only when:
- brand recognition remains adequate,
- semantic state distinctions remain valid,
- contrast remains valid,
- Day/Night design intent remains coherent.

Dynamic color is optional, not allowed to dissolve Seven into an arbitrary palette.

## 10. Visual Operations Contract

After freeze, every new material surface must:
1. declare its Design Genome version,
2. use canonical semantic tokens/components or documented escapes,
3. register new interaction vocabulary only when required,
4. enter scenario coverage,
5. add regressions discovered during development to the cemetery,
6. record asset provenance,
7. prove Lite/Reduced Motion/RTL behavior when relevant,
8. keep post-release signals content-free by default.

This prevents visual quality from decaying immediately after the redesign campaign ends.

## 11. Updated visual promotion bundle

The cumulative promotion bundle now includes:
- baseline/candidate/epoch identity
- Design Genome identity
- Genome coverage receipt
- Design Lint receipt
- scenario coverage receipt
- functional/behavioral receipt
- structural accessibility receipt
- typography resilience receipt where fonts change
- interaction vocabulary receipt
- content-design receipt where wording changes
- performance/resource receipt
- render environment fingerprint
- visual judge calibration/disagreement receipts
- asset provenance/distinctiveness receipt
- migration/rollback receipt
- privacy receipt
- open uncertainties

## 12. Closure boundary

V1.2 closes the material architecture gaps found in Challenges A and B. The cumulative architecture is now eligible to be fixed for independent saturation challenges.

This does not claim runtime implementation. Design Lint, expanded capture, human evidence, device accessibility proof, visual judge runtime and post-release health still require implementation.