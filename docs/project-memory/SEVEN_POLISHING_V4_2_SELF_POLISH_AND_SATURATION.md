# Seven Polishing V4.2 — Self-Polish & Saturation Record

## Baseline
Parent: V4.1 The Loop.
Candidate: V4.2 Motion Evidence & Expert Judgment.

## Research evidence sweep
Primary/authoritative and production/HCI evidence used during this campaign:
- Android performance guidance: jank/frame deadlines, smooth transitions, power/memory costs, refresh-rate-aware behavior.
- W3C WCAG motion criteria: interaction-triggered motion must be reducible/disableable where non-essential.
- Apple reduced-motion evaluation guidance: problematic depth/parallax/spin/multi-axis/ongoing motion should be modified or removed for reduced-motion users while preserving meaning.
- Material motion guidance: motion should be quick, clear, cohesive and intentional; durations should vary by distance/surface change rather than use one global constant.
- NN/g animation guidance: execution quality depends on purpose, duration/easing and avoidance of intrusive/slow motion; appearance can mask usability problems (aesthetic-usability effect).
- Rive runtime guidance: pause offscreen/idle animations, honor reduced motion, optimize heavy assets and test on target devices.

Evidence is treated as guidance and constraints, not a universal aesthetic oracle.

## Round 01 — VIDEO AS FIRST-CLASS EVIDENCE
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Added MotionArtifact identity, full-clip review plus adaptive keyframes, state-timeline alignment, baseline/candidate matched playback, and explicit separation of apparent stutter from measured frame timing.

## Round 02 — MOTION METROLOGY
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Added MotionBenchmarkContract, refresh-rate-aware runtime metrics, repetitions/variance, input-to-visible-response latency, jank/frame distributions, resource evidence and prohibition on inferring runtime metrics from video alone.

## Round 03 — ACCESSIBILITY SEMANTIC EQUIVALENCE
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Reduced Motion no longer means blindly deleting animation. Motion severity classes M0-M4 define whether to remove, substitute, simplify or preserve essential semantic feedback.

## Round 04 — RESEARCH DEPTH
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Replaced shallow single-source search with layered evidence acquisition: primary platform standards, runtime/tool docs, HCI/perception research, production engineering, competitive observation, accessibility/localization and negative evidence. Material decisions seek three evidence classes when feasible.

## Round 05 — EXPERT COUNCIL
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Replaced single aesthetic reviewer with nine explicit lenses: Product, Motion, Accessibility, Mobile Performance, Interaction, Brand, Localization, Simplifier and Broad-Audience.

## Round 06 — SUBJECTIVE TRUTH CONTROL
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Added labels SUBJECTIVE_PREFERENCE and BROAD_AUDIENCE_HYPOTHESIS. Taste is not promoted to FACT. Major broad-audience claims require user evidence, multi-reviewer agreement or explicit uncertainty.

## Round 07 — TASTE CALIBRATION WITHOUT COPYING
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Added TasteCalibrationSet. References across categories/style directions are decomposed into principles such as hierarchy, restraint, timing, density and typography. References are not templates to clone. Refresh prevents evaluator drift and fashion lock-in.

## Round 08 — AESTHETIC-USABILITY COUNTERATTACK
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Added requirement to test task clarity/interaction behavior separately from visual appeal because attractive presentation can conceal usability defects. Visual delight cannot compensate for broken flows.

## Round 09 — MOTION FAILURE CEMETERY
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Added permanent cases for jank, delayed feedback, uncancellable transitions, RTL direction bugs, text clipping during resize, reduced-motion semantic loss, offscreen loops, dishonest progress animation, theme flash and process-resume desync.

## Round 10 — SIMPLIFIER / COST ATTACK
Verdict: NO_MATERIAL_IMPROVEMENT.
Considered a universal motion score, always-on video AI review and mandatory full-device testing for every micro-animation. Rejected all three: scalar scores hide tradeoffs; always-on multimodal review violates cost/resource discipline; device escalation should be risk-based while release/device claims still require device evidence.

## Independent Challenge A — Motion/HCI/Metrology
Examined: timing evidence, evaluator validity, Goodhart risk, accessibility, refresh-rate assumptions, full-video vs keyframes, benchmark repeatability.
Result: NO_MATERIAL_IMPROVEMENT → 1/2.
Reason: material concerns are covered by identity locks, evidence separation, runtime metric ownership, accessibility variants, benchmark health and regression promotion.

## Independent Challenge B — Broad-Audience/Product/Low-End Android
Different lens: general-user comprehension, trend resistance, Arabic/RTL, low-end phone performance, repeated-motion fatigue, brand distinctiveness, simplification.
Result: NO_MATERIAL_IMPROVEMENT → 2/2.
Reason: candidate explicitly distinguishes broad-audience hypotheses from fact, includes calibration diversity, low-end/resource gates, RTL/reduced-motion cases and simplifier authority.

## Saturation decision
V4.2 reaches ARCHITECTURE_SATURATED_2_OF_2 for polishing governance.

This is architecture governance, not proof that executable video analysis, Android instrumentation, user panels or benchmark harnesses are implemented. Those remain subject to the normal evidence ladder.

## Canonical name
**Seven Polishing V4.2 — The Loop: Benchmark, Visual & Motion Expert System**

## Reopen triggers
- new evidence shows current motion rubric predicts user quality poorly
- benchmark/video evaluator drift
- material animation failure on representative devices
- user testing contradicts broad-audience hypotheses
- new accessibility/platform motion requirements
- runtime instrumentation disproves assumed measurement feasibility
- simpler architecture provides equivalent rigor at lower cost
