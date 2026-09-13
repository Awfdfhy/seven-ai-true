# Seven Polishing Protocol V4.2 — Motion Evidence & Expert Judgment

Status: CANDIDATE — successor to V4.1 The Loop
Scope: UI/UX/Brand/Motion campaigns and any campaign where video, animation, interaction quality or broad-audience product judgment is material.

## Prime upgrade
V4.2 inherits V4.1 and adds two governed planes:
1. Motion Evidence Plane — video/frame-sequence understanding plus runtime frame evidence.
2. Expert Judgment Council — multi-lens, research-grounded, uncertainty-aware product judgment.

The goal is not to make Seven imitate taste. The goal is to combine measurable quality, human-perception evidence, platform conventions, accessibility, product coherence and broad-audience preference signals without pretending subjective taste is objective truth.

## Motion Evidence Plane
### Inputs
- screen recordings
- frame sequences
- transition clips
- interaction traces
- state-machine timelines
- animation assets / manifests
- runtime frame timing / jank traces
- reduced-motion variants

### MotionArtifact identity
Every evaluated clip binds:
- commit/build
- feature/state/interaction
- device class / OS / refresh rate when known
- theme / locale / RTL / font scale
- reduced-motion setting
- capture FPS / playback rate / crop/scale transforms
- input sequence
- animation implementation identity where available
- artifact hash

Unknown capture metadata remains UNKNOWN rather than guessed.

### Motion analysis dimensions
- purpose / semantic meaning
- anticipation and response clarity
- temporal hierarchy
- duration appropriateness
- easing/acceleration quality
- continuity and spatial causality
- interruption/cancellation behavior
- gesture-to-motion coupling
- overshoot/bounce restraint
- visual stability
- layering and occlusion
- choreography between elements
- perceived latency masking vs deceptive delay
- loading/progress honesty
- repeated-motion fatigue
- idle-animation cost
- motion consistency across product surfaces
- reduced-motion equivalence
- Arabic/RTL directional correctness
- small-screen robustness

### Evidence separation
Visual/video model judgments may identify apparent stutter, awkward pacing, inconsistent trajectory, hierarchy and semantic issues, but cannot prove actual frame timing, dropped-frame percentage, touch latency, battery cost or refresh-rate behavior.

Runtime measurements own those claims.

### MotionBenchmarkContract
Before comparing candidate animations, lock where applicable:
- interaction scenario
- start/end states
- capture environment
- target device tiers
- refresh-rate context
- frame/jank metrics
- motion rubric
- reduced-motion acceptance
- accessibility constraints
- resource envelope
- baseline identity
- repetitions / variance method
- holdout interaction set

### Runtime motion metrics
Use platform/runtime evidence for:
- frame duration distribution
- missed/deadline frames / jank
- input-to-visible-response latency
- transition completion latency
- CPU/GPU/RAM impact when measurable
- battery/thermal impact for sustained motion when material

Do not require a universal 60/90/120 FPS target independent of device/context. Compare against the active display mode and product scenario.

## Research Depth Protocol
V4.2 strengthens Phase 3 into a multi-pass research process when the decision is material.

### Research layers
1. Primary platform guidance: Android, W3C/WCAG, relevant OS/HIG specifications.
2. Runtime/tool documentation: animation engines, rendering systems, profilers.
3. Peer-reviewed/HCI/perception research where available.
4. Strong production engineering write-ups and postmortems.
5. Competitive pattern study across leading products, used only as observational evidence, never proof that popularity equals correctness.
6. Accessibility and localization evidence.
7. Negative evidence / failure cases.

### Search diversity
A material UI/motion decision should seek at least three distinct evidence classes when feasible. If only one class is available, the confidence ceiling is recorded.

### Research freshness
Time-sensitive platform/runtime guidance records version/date and revalidation triggers.

## Expert Judgment Council
No single evaluator determines a subjective product-quality claim.

### Required lenses for major UI/motion decisions
- Product Design Lens: hierarchy, clarity, purpose, progressive disclosure.
- Motion Design Lens: timing, easing, continuity, choreography, interruption.
- Accessibility Lens: reduced motion, vestibular risk, discoverability, alternatives.
- Mobile Performance Lens: frame pacing, resource cost, low-end degradation.
- Interaction Lens: affordance, feedback latency, gesture coupling, error recovery.
- Brand Lens: identity distinctiveness and consistency.
- Localization Lens: Arabic/RTL, text expansion, bidi, typography.
- Simplifier Lens: remove decoration whose value is not material.
- Broad-Audience Lens: likely comprehension/appeal beyond expert designers, with uncertainty explicitly recorded.

### Judgment output
Each review returns structured findings:
- observation
- evidence channel
- severity
- confidence
- affected audience/scenario
- whether objective/measurable, convention-based, or subjective
- recommendation
- expected benefit
- regression risk

Subjective taste judgments must be labeled SUBJECTIVE_PREFERENCE or BROAD_AUDIENCE_HYPOTHESIS. They cannot masquerade as verified facts.

## Broad-Audience Quality Model
The goal is broad product appeal, not lowest-common-denominator design.

A candidate should seek:
- instant legibility
- low learning friction
- emotional polish without visual noise
- recognizable interaction conventions
- distinctive Seven identity
- restrained motion by default
- delight concentrated at meaningful moments
- graceful behavior on low-end phones
- equivalent reduced-motion experience

Avoid optimizing toward novelty alone, maximal animation density, designer-only subtlety, or trend imitation.

## Taste Calibration
For major visual campaigns, maintain a TasteCalibrationSet containing curated references from multiple product categories and style directions. References are analyzed for principles such as hierarchy, restraint, timing, density, typography and transitions rather than copied.

Calibration is periodically refreshed to prevent evaluator drift and fashion lock-in.

## Animation Severity Classes
- M0 Decorative: no semantic dependency; first candidate for removal under cost/accessibility pressure.
- M1 Feedback: communicates tap/state acknowledgement.
- M2 Navigation/Hierarchy: communicates spatial/structural relationship.
- M3 Progress/Process: communicates ongoing work; must not misrepresent completion.
- M4 Critical State: warning/error/permission/cancellation; clarity dominates delight.

Reduced-motion behavior is defined per class rather than globally deleting all movement.

## Motion Failure Cemetery
Material failures become permanent cases when reproducible, including:
- dropped/janky transition
- delayed tap feedback
- uncancellable motion blocking action
- RTL trajectory reversal bug
- text clipping during animated resize
- reduced-motion path losing semantic context
- decorative loop consuming resources offscreen
- progress animation implying success before verified completion
- theme transition flash/flicker
- animation state desync after process resume

## Harsher Judgment Gate
A candidate does not pass because reviewers 'like it'. For material UI/motion promotion:
- no unresolved C0/C1 failure
- no material accessibility regression
- no material performance regression outside accepted resource envelope
- semantics remain understandable with animation disabled/reduced where required
- structural and visual evidence do not materially conflict unresolved
- major motion has clear purpose or demonstrated delight value
- benchmark/visual/video evidence is reproducible enough for the claim
- simplifier cannot remove a substantial portion without losing value
- broad-audience hypothesis has either user evidence, multi-reviewer agreement, or explicit uncertainty rather than fake certainty

## Video Review Pipeline
1. bind MotionArtifact identity;
2. derive scene/interaction timeline;
3. sample keyframes adaptively around transitions, velocity changes, occlusion and state boundaries;
4. multimodal review of full clip plus keyframes;
5. align with runtime frame/jank trace when available;
6. compare baseline/candidate at matched playback and interaction sequence;
7. run accessibility/reduced-motion variant;
8. aggregate findings in MotionObservationLedger;
9. promote reproducible failures to regression suite;
10. preserve disagreements and uncertainty.

Keyframe-only review is insufficient when timing/choreography is material. Full-motion evidence is required when available.

## Performance discipline
Animations must not impose material idle/global cost merely by existing. Offscreen/idle animation should pause when practical. Heavy assets are lazy-loaded. Motion tiers degrade under thermal/resource pressure while preserving interaction meaning.

## Saturation rule
V4.2 may replace V4.1 only after self-polish under The Loop, applicable research/benchmark/video/judgment gates, simplifier attack, and independent 2/2 challenge. Any material improvement resets saturation.
