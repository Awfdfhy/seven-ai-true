# Seven Polishing V4 — Self-Polish Round 01

Verdict: MATERIAL_IMPROVEMENT_FOUND
Saturation counter: 0/2

## Why V4 itself was reviewed
A protocol that demands saturation from every Seven subsystem must not exempt itself. The first V4 draft was evaluated as a product-control system rather than a checklist.

## Evidence signals incorporated
- Architecture evaluation practice emphasizes explicit quality-attribute scenarios and tradeoffs rather than evaluating architecture by feature count.
- Reliability engineering uses measurable objectives and budgets with consequences; a violated reliability budget should redirect work from expansion to restoration.
- Android quality is multidimensional: stability, ANR behavior, memory, battery/background behavior, startup and rendering all matter, and device tiers differ materially.
- Contract/property-based testing can turn architecture properties into generated verification cases rather than relying only on hand-authored examples.

## Material improvements over the initial V4 draft

### 1. Search-surface ledger
Problem: Domain Discovery could still claim broad coverage without proving where it looked.

Add `SearchSurfaceLedger` with categories examined, sources/lenses used, exclusions, unresolved gaps, and date/version. Saturation may only claim coverage relative to this ledger.

### 2. Scenario provenance
Every quality scenario receives origin and priority:
- user journey
- invariant
- prior failure
- research evidence
- platform constraint
- release requirement

This prevents invented benchmark targets from masquerading as requirements.

### 3. Criticality classes
Classify requirements:
- C0: authority/security/data-integrity/user-agency critical; non-compensable
- C1: reliability/recovery/accessibility critical
- C2: performance/resource/product-quality target
- C3: enhancement/optimization

A C0 failure blocks saturation regardless of gains elsewhere.

### 4. Evidence freshness and applicability
ResearchEvidenceMap must record publication/version date, environment, applicability to Seven, and whether evidence is direct, analogous, or speculative. Old evidence is not automatically invalid, but changing-platform assumptions must be revalidated.

### 5. Negative-evidence discipline
`NO MATERIAL IMPROVEMENT` is not proof that none exists. A clean review must record which alternatives, domains, scenarios and constraints were actually examined. This makes the 2/2 rule auditable.

### 6. Independence contract for final reviews
Review B must differ materially from Review A in at least two of:
- reviewer framing
- evidence subset/order
- scenario family
- architecture alternatives considered
- failure composition strategy
- simplification strategy

Otherwise it cannot increment the counter.

### 7. Stop-cost guard
Polishing has a cost. After mandatory gates pass, optional search continues only while expected information gain is material relative to time/complexity cost. This prevents endless cosmetic churn while preserving reopen triggers for new evidence.

### 8. Budget classes
Separate:
- correctness/authority invariants: cannot be spent
- reliability budget
- performance/resource budget
- complexity budget
- optional feature budget

This avoids abusing an SLO-style budget to justify correctness regressions.

### 9. Implementation feedback loop
If implementation proves an accepted architecture assumption false, the architecture automatically receives a `REALITY_REOPEN` event rather than patching around it silently.

### 10. Test derivation map
Each invariant/contract should map, where feasible, to one or more of:
- deterministic unit/integration test
- property-based test
- fuzz test
- metamorphic test
- replay test
- migration test
- device/performance measurement
- manual UX/accessibility inspection

Architecture without a plausible verification route is incomplete.

### 11. Statistical discipline
Performance and stochastic-model comparisons require repeated trials and distribution/variance awareness where meaningful. A single fast run or lucky model response cannot prove improvement.

### 12. Representative-device matrix
Mobile gate must define device/RAM/performance tiers and test release builds. Emulator/debug evidence cannot silently become real-device release proof.

## Result
V4 is stronger, but not saturated. These improvements must be reconciled into the canonical protocol before independent reviews begin.