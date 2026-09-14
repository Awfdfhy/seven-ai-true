# Seven Benchmark + Visual Evidence Fabric 1.0

Status: ARCHITECTURE CANDIDATE — designed as an extension to Polishing V4.
Scope: measurable comparison, regression proof, visual/UI understanding, screenshot evidence, device/performance evidence, and anti-overfitting controls.

## Prime law
When a quality claim is meaningfully measurable, Polishing may not accept `better`, `faster`, `lighter`, `more accurate`, `more reliable`, or `visually improved` on narrative judgment alone. The claim must be bound to a comparable BenchmarkContract or explicitly marked `NOT_MEASURABLE_WITH_CURRENT_EVIDENCE`.

Benchmarking informs decisions; it never overrides C0 invariants, authority, security, data integrity, user agency, or known release blockers.

## Core objects
### BenchmarkContract
Binds:
- subject/capability
- exact baseline identity
- exact candidate identity
- environment identity
- scenario set
- metrics
- measurement method
- repetitions / sampling rule
- acceptance rule
- critical gates
- resource envelope
- visible/shadow/holdout partition
- variance/confidence handling where relevant
- invalidation/reopen conditions

### BenchmarkCase
One reproducible stimulus + environment + expected observation + measurement route.

### BenchmarkRun
One execution bound to exact code/config/provider/model/tool/device/build identities.

### BenchmarkObservation
Raw measured result. Observation is evidence, not verdict.

### BenchmarkVerdict
Typed result produced by a deterministic VerdictPolicy where feasible:
- PASS
- FAIL
- INCONCLUSIVE
- REGRESSION
- TRADEOFF
- BLOCKED
- ENVIRONMENT_INVALID
- MEASUREMENT_INVALID

### BenchmarkSuite
A versioned set of cases. Suites are domain-specific; Seven must not collapse all domains into one universal score.

### BenchmarkBaselineLock
Prevents moving the comparison target after results are seen.

### BenchmarkProvenance
Records how every observation was collected, transformed and aggregated.

## Benchmark families
- correctness / invariant preservation
- truth / epistemic behavior
- retrieval / memory / context quality
- coding and tool-use success
- side-effect correctness and retry safety
- RPG/canon consistency
- latency / throughput
- startup / first-interaction / first-result
- RAM / CPU / battery / thermal / storage / network
- reliability / crash / migration / process-death recovery
- UX task completion
- accessibility
- Arabic/RTL
- visual/UI quality
- release integrity

## No universal scalar winner
A candidate cannot compensate for a C0/C1 regression by winning many C2/C3 metrics. Comparison is Pareto- and gate-aware. A scalar summary may exist only as a local convenience when the underlying dimensions remain visible and critical failures remain non-compensable.

## Anti-overfitting partitions
Important suites may be partitioned into:
- PUBLIC/DEVELOPMENT — visible during iteration
- SHADOW — intermittently evaluated
- HOLDOUT — withheld from candidate tuning
- RELEASE — run at promotion/release gates

The partition identity and acceptance rules are fixed before the compared candidate sees results. New failures may add new cases, but old gates cannot be silently weakened.

## Counterexample promotion
Any material reproducible failure becomes a permanent regression case or invariant when feasible. Failure discovery therefore grows Seven's protective benchmark surface over time.

## Benchmark evidence tiers
- SIMULATED
- HOST
- EMULATOR
- PHYSICAL_DEVICE
- REPRESENTATIVE_DEVICE
- RELEASE_BUILD_DEVICE

Claims may not silently jump tiers. Host screenshot equality does not prove physical-device usability. Emulator performance does not prove representative-device performance.

# Visual Evidence Plane

## Purpose
Polishing must be able to inspect what users actually see, not only code and text descriptions. Visual evidence supports UI/UX/brand/motion/accessibility polish and release screenshot verification.

## VisualEvidenceArtifact
A versioned image/frame set bound to:
- source/build/branch/commit
- screen/journey/state
- device/window dimensions
- density/font scale
- locale/direction
- theme
- performance tier
- reduced-motion state where relevant
- timestamp/version
- capture method

A screenshot is evidence of rendered pixels, not proof of underlying semantics or correct behavior.

## VisualObservation
Derived, provenance-bound observations may include:
- clipping / overlap / truncation
- alignment / spacing inconsistency
- hierarchy / emphasis anomalies
- density / crowding
- touch-target visibility and obstruction
- text readability
- contrast warning candidates
- RTL mirroring/layout anomalies
- mixed Arabic/English/bidi issues
- icon/label mismatch candidates
- theme inconsistency
- state visibility and uncertainty clarity
- responsive/adaptive layout failures
- visual regression vs approved reference
- motion-state discontinuity when frame sequences are available

Model-generated visual judgments remain `DERIVED_VISUAL_OBSERVATION` until corroborated by deterministic checks, source semantics, accessibility tooling, user evidence, or explicit reviewer acceptance when the property is subjective.

## Visual understanding is not pixel authority
A multimodal model can discover likely defects and compare compositions, but it must not claim exact contrast ratio, exact touch target size, exact spacing, hidden semantics, focus order or accessibility tree correctness from pixels alone when those properties require deterministic or structural evidence.

## Dual-channel UI verification
UI claims should use two complementary channels when applicable:
1. STRUCTURAL: semantics tree/layout bounds/accessibility metadata/design tokens/test APIs.
2. VISUAL: screenshots/frame sequences/diffs/multimodal inspection.

Disagreement is preserved as `UI_EVIDENCE_CONFLICT` until resolved.

## Golden screenshot policy
Golden/reference images are regression anchors, not unquestionable truth. A visual difference may be:
- intended improvement
- unintended regression
- environment/rendering variance
- stale golden

Updating a golden requires an explicit approval path tied to the change and cannot be used merely to make a failing test green.

## Visual Scenario Matrix
Representative UI evidence should cover a bounded, high-information matrix rather than a Cartesian explosion:
- Day / Night
- LTR / RTL
- Arabic / English / mixed bidi
- small phone / representative phone / larger window where relevant
- normal / large font
- reduced motion
- loading / success / warning / error / offline / cancellation / uncertainty
- long content / empty content / extreme labels
- keyboard/IME states where relevant

Pairwise/risk-based selection is preferred over blindly generating every combination.

## Motion evidence
Motion polish may use short frame sequences or video segments. Evaluate:
- continuity
- interruption/cancellation
- reduced-motion fallback
- state causality
- excessive duration
- layout jumps
- dropped/duplicated visual states

Performance smoothness still requires runtime frame/performance evidence; video appearance alone is insufficient.

## Visual benchmark verdict rules
Visual comparison is multi-axis. Candidate can be superior on hierarchy and worse on RTL. The result may therefore be `TRADEOFF`, not a fake numeric winner.

Subjective qualities such as elegance or brand character require an explicit rubric and reviewer evidence; they must not be disguised as objective measurements.

## Android grounding
Android's current guidance treats screenshot testing as an effective way to verify rendered UI and compare against approved references. Compose screenshot tooling supports preview variants including theme/font-scale configurations and produces visual diff reports. Android accessibility guidance also recommends combining manual, analysis-tool and automated testing rather than relying on one channel. These platform facts support, but do not alone define, Seven's Visual Evidence Plane.

## Resource discipline
Visual evaluation is selective and lazy:
- no vision model loaded on normal app startup
- no screenshot corpus loaded globally
- prefer deterministic structural/diff checks first
- invoke multimodal interpretation only for cases where semantic visual judgment may add value
- cache derived observations by exact artifact hash + evaluator identity
- invalidate on artifact/evaluator/rubric changes

## Privacy and security
Screenshots may contain sensitive user/project content. Capture and evaluation obey project/permission boundaries, minimize retained pixels, support redaction, and must never be silently uploaded to remote vision providers.

## Release rule
A visual release claim requires evidence appropriate to the claim. Host-side screenshot tests can prove bounded visual regression behavior; representative real-device evidence is required for device-level release claims.
