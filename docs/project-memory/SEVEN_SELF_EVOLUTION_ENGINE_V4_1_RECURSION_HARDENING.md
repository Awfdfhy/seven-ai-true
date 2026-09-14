# Seven Self-Evolution Engine 4.1 — Recursion & Promotion Hardening

Status: ARCHITECTURE_CANDIDATE
Parent: Self-Evolution Engine 4.0
Governance: V5.40 Meta-Assurance Closure

V4.1 closes material gaps found in the first V5.40 challenge of Self-Evolution 4.0.

## 1. Global Recursion Budget
The ten-generation ceiling applies to the entire campaign tree, not only one visible call stack. A child Meta-Evolution campaign consumes the parent's recursion budget. Nested campaigns cannot reset generation count, hostility history, or evidence debt.

Campaign identity forms a DAG with a single authoritative root CampaignID. Cyclic ancestry is invalid.

## 2. Fork / Merge Semantics
Parallel candidate branches may fork from an incumbent, but a merge is a new candidate with a new hash and must be evaluated as an integrated system. Component PASS evidence may be reused only where V5.40 ProofGraph rules show unaffected scope. Interaction claims require merged-candidate evidence.

## 3. Atomic Promotion Bundle
A promotion may include code, prompts, schemas, tools, migrations, configuration, benchmark references, and recovery metadata. These form one versioned PromotionBundle.

A bundle is either accepted as one coherent version or remains non-canonical. Partial promotion is forbidden when cross-artifact consistency is required.

## 4. Campaign Transaction Ledger
Self-Evolution campaign state is append-only and idempotent for authoritative transitions. Records include:
- campaign/generation/candidate identities;
- frozen constitution hashes;
- evaluation epoch;
- evidence references;
- decision state;
- PromotionBundle hash;
- rollback reference;
- resume token/version.

After interruption or process death, resume reconstructs from authoritative ledger state. A repeated request with the same decision/idempotency identity cannot duplicate a promotion.

## 5. Scope Firewall
Learning carries an explicit scope:
- DEVICE_LOCAL;
- USER_LOCAL;
- PROJECT_LOCAL;
- CAMPAIGN_LOCAL;
- PRODUCT_CANDIDATE;
- CANONICAL_GLOBAL.

Information cannot move to a broader scope merely through repetition or summarization. Broader reuse requires evidence and authority appropriate to the target scope. Personal/local adaptation cannot silently become global product behavior.

## 6. Bootstrap Supervisor
A Self-Evolution engine candidate never becomes the only mechanism capable of judging its own health or restoring the previous engine.

A known-good Bootstrap Supervisor remains outside the candidate bundle and stores:
- previous engine reference;
- candidate engine reference;
- constitution reference;
- migration/compatibility metadata;
- health/recovery checks;
- rollback procedure.

If the new engine cannot initialize, reconstruct campaign state, or satisfy required bootstrap checks, the supervisor restores or selects the known-good engine without relying on the failed candidate's logic.

## 7. Autonomy Envelope
Every campaign freezes an AutonomyEnvelope that classifies actions as:
- AUTO_ALLOWED;
- APPROVAL_REQUIRED;
- EXPERIMENT_ONLY;
- FORBIDDEN.

The envelope binds action class, data scope, side-effect class, environment, resource budget, and expiry. Candidate generations cannot broaden their own envelope.

## 8. Experiment Effect Boundary
Improvement experiments default to no external side effects. Tool experiments should use deterministic simulation, replay, local/sandbox state, or shadow execution where this can validly test the claim.

If a real side effect is necessary, it requires separate authority, explicit Effect Ledger identity, bounded scope, recovery expectations, and cannot be hidden inside a benchmark run.

## 9. Evaluation Epoch Bridge
Material changes to evaluator, benchmark, oracle, environment, scaffold, provider/model, or evidence transformation create a new EvaluationEpoch.

Cross-epoch comparison requires bridge evidence. Scores from different epochs are not directly treated as one continuous metric unless comparability is demonstrated.

## 10. Privacy & Provenance Boundary
Reusable improvement memory cannot absorb private/local experience without explicit scope and provenance. Derived lessons must preserve enough lineage to determine whether they may be reused. Raw private data is not converted into global canonical improvement memory merely because it produced a useful result.

## 11. Old-Supervisor Rollback Proof
For migrations or engine changes that affect recovery semantics, rollback proof is evaluated from the perspective of the old/independent supervisor. A new candidate cannot satisfy rollback by asserting that its own new recovery mechanism works.

## 12. Generation Output Contract
Every generation now emits:
- CampaignID / GenerationID / CandidateID;
- parent/fork lineage;
- global recursion budget remaining;
- AutonomyEnvelope hash;
- ImprovementTarget hash;
- EvaluationEpoch;
- candidate Mechanism Card set;
- evidence/assumption debt;
- scope transitions requested;
- PromotionBundle hash;
- supervisor compatibility verdict;
- Judge verdict;
- Promotion verdict;
- rollback reference;
- next-generation hostility delta.

## 13. V5.40 Claim Ceiling
No campaign may claim generalized self-improvement merely because a particular target improved. Meta-Evolution claims require transfer evidence across the target classes for which the improved development mechanism is claimed useful.

## Truth boundary
Architecture only. V4.1 does not claim campaign-ledger runtime, supervisor runtime, automatic rollback, scoped learning promotion, or executable recursive evolution is implemented.