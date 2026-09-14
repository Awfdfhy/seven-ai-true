# Seven Polishing V5.36 — Requirements Fidelity

Status: ARCHITECTURE_CANDIDATE
Parent: V5.35 Environment Replay Fidelity

Purpose: verify that evaluation rules, executable checks, and proof claims remain faithful to the intended requirement, with explicit scope and assumptions.

## Core rules
- every critical check records the requirement it represents;
- evidence scope cannot exceed requirement scope;
- assumptions and abstractions are explicit;
- missing or conflicting requirements are visible;
- changes to authoritative requirements create a new comparison epoch;
- candidates cannot rewrite the requirements that judge them;
- known historical defects are reused to test whether the requirement set would detect them;
- high-criticality claims use more than one interpretation route where practical;
- uncovered behavior remains explicitly unproven;
- changing benchmark or environment versions create explicit evidence identities rather than silent continuity;
- live and replay results are bridged before one is allowed to stand in for the other;
- diagnostic evidence is graded separately for detection, localization, attribution and reproducibility;
- fresh evidence cannot erase older contradictory evidence without an explicit reconciliation record;
- a missing observation channel is recorded as uncertainty rather than interpreted as evidence of absence.

Saturation remains 0/2. Architecture only.