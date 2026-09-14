# Seven Polishing V5.22 — Ecological Validity

Status: ARCHITECTURE_CANDIDATE
Parent: V5.21 Evidence Resolution Integrity

V5.22 prevents simulated users and synthetic interaction patterns from being mistaken for real-user proof.

## Prime law
A benchmark user is an evaluation instrument, not a real population.

## Requirements
1. User-Model Lineage: record simulator model, prompting, grounding data, behavior profile, locale, and scenario source.
2. Simulator Fidelity: measure how closely simulated behavior matches real interaction patterns on dimensions relevant to the claim.
3. Real-Behavior Grounding: when user realism matters, prefer profiles or distributions grounded in observed human interaction over unconstrained role-play.
4. Simulator Diversity: broad claims require more than one simulator family or evidence that one simulator adequately covers the target population.
5. Directive Amplification Review: detect unrealistic extremes caused by over-specified personas or behavioral instructions.
6. Cooperative-Bias Review: detect simulators that make tasks easier by supplying unusually complete, patient, or compliant behavior.
7. Friction Cases: include ambiguity, correction, interruption, incomplete information, changing intent, and varied language style when relevant.
8. Locale and RTL Coverage: Arabic/RTL and locale-specific interaction patterns are evaluated explicitly for claims that include them.
9. Simulator Transfer: gains discovered with one simulator are checked against different simulator families or real-derived data before broad promotion.
10. Downstream Utility: simulator quality is judged partly by whether improvements transfer to more realistic user evidence, not by simulator elegance alone.
11. Synthetic-Only Label: evidence derived only from simulated users cannot be called real-user validated.
12. Population Scope: every user-facing verdict records the population or behavior envelope actually represented.
13. Rare-Behavior Handling: rare but material interaction styles are preserved when relevant rather than averaged away.
14. Feedback-Loop Review: self-evolution must not progressively optimize Seven toward quirks of its own simulator population.
15. Freshness: simulator assumptions and population distributions can become stale and require revalidation.

## Saturation
V5.21 is NOT saturated. This material change resets saturation to 0/2.

## Truth boundary
Architecture only. No real-user study, simulator runtime, or population validation harness is claimed implemented.