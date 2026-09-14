# Seven Visual Regression Cemetery 1.0

Status: PHASE_1_SEED
Comparison epoch: VISUAL-EPOCH-1

## Purpose
Keep visual failures from returning after they are fixed. The cemetery stores reproduced failures and open evidence gaps separately. It is not a list of aesthetic dislikes.

## Entry states
- REPRODUCED_OPEN
- FIXED_GATED
- OPEN_EVIDENCE_GAP
- RETIRED_WITH_REASON

## VR-001 Repeated visual-runtime boot duplicated observers
State: FIXED_GATED
Area: performance-runtime
Failure class: hidden duplicate visual/runtime work
Evidence: first V4.4 closed-loop campaign observed three PerformanceObservers and three visibility listeners after repeated boot; promoted candidate reduced both to one.
Protection: permanent regression gate in evolution test suite.
Design lesson: idempotent visual/runtime initialization is part of visual performance correctness.

## VR-002 Screenshot evidence matrix too narrow
State: OPEN_EVIDENCE_GAP
Area: release/capture-ui.cjs
Current evidence: six captures at a single 390x844 viewport.
Missing coverage: Arabic RTL, mixed bidi, text scaling, device-width diversity, performance tiers, Reduced Motion, warning/error/offline/cancelled states, keyboard-open, settings/permissions, Research and broader recovery states.
Required closure: implement the canonical scenario matrix with selective/pairwise expansion.

## VR-003 Contrast proof covers too few rendered relationships
State: OPEN_EVIDENCE_GAP
Area: release/contrast.test.cjs
Current evidence: six explicit light/dark color pairs.
Risk: a passing base token pair does not prove every rendered workspace/Aurora/transient state.
Required closure: rendered/token-aware contrast inventory with deterministic checks and documented exceptions.

## VR-004 Effective mobile hit targets below Seven's new 48dp target
State: REPRODUCED_OPEN
Area: release/seven-final.css
Current implementation evidence: mobile buttons/send-stop include 40px minimum dimensions; tool controls include 34px minimum height.
Interpretation: this does not automatically prove an accessibility failure because the effective hit region may be enlarged elsewhere, but current CSS does not prove Seven's new 48dp target.
Required closure: measure actual hit boxes in browser/device scenarios and enlarge interaction regions where needed without forcing oversized glyphs.

## VR-005 Launcher identity pipeline is single-bitmap-derived
State: REPRODUCED_OPEN
Area: apk/prepare-assets.cjs
Current implementation: extract embedded PNG from protected HTML and resize to 1024x1024.
Risk: no authored adaptive foreground/background/monochrome identity or mask-tournament proof.
Required closure: new logo tournament and Android adaptive identity asset pipeline.

## VR-006 Token dialect split may cause visual drift
State: OPEN_EVIDENCE_GAP
Area: release/seven-final.css + release/beta-ui.css + workspace CSS
Observed: seven-final uses --seven-* plus generic roles, beta-ui uses --sb-* and separate mode colors.
Risk: duplicate roles can diverge between global shell and domains.
Required closure: canonical semantic Design Genome tokens compiled/adapted into release layers.

## VR-007 Screenshot capture has no complete structured promotion comparison
State: OPEN_EVIDENCE_GAP
Area: CI visual evidence
Observed: screenshot generation exists and is uploaded with release artifacts.
Risk: capture alone cannot decide expected improvement vs material regression vs stale baseline.
Required closure: baseline registry, structural diff, visual observation ledger, explicit classification and independent judgment for subjective changes.

## VR-008 Motion has behavior but incomplete proof
State: OPEN_EVIDENCE_GAP
Area: release/motion-runtime.js + CSS
Observed: press, message reveal, theme shift and Reduced Motion controls exist.
Risk: no full frame/video evidence across all important motion families or representative-device frame pacing.
Required closure: Motion Genome + frame/video capture + runtime performance evidence.

## VR-009 Domain workspace identity can drift
State: OPEN_EVIDENCE_GAP
Area: Core / Coding / Research / RPG / World
Observed: workspaces already have distinct surfaces and behavior.
Risk: domain personality can become visual fragmentation without one genome.
Required closure: one Design Genome with bounded domain-personality tokens and shared primitives.

## VR-010 Logo/tiny-size recognition unproven
State: OPEN_EVIDENCE_GAP
Area: brand
Observed: existing icon is used in app/asset pipeline.
Risk: no tournament evidence for 16/24/32/48/64px survival, monochrome survival, adaptive masks or memory/distinctiveness judgment.
Required closure: Logo & Identity Lab.

## Cemetery promotion rule
A reproduced failure may move to FIXED_GATED only when:
1. the failure is reproduced or objectively localized,
2. a repair is implemented,
3. the repair is tested in the relevant scenario,
4. a durable regression gate exists where technically feasible,
5. the fix does not create a protected regression elsewhere.

Aesthetic preference alone cannot enter the cemetery as a defect. It belongs in the Visual Judgment Council record.