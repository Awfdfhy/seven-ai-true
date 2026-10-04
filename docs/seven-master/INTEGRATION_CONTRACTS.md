# Seven AI — Integration Contracts

This file is the compatibility boundary between specialist chats.

## Core Contracts

### Model Layer
Must expose a stable request/response abstraction independent of provider-specific payloads.

### Memory Layer
Must support:
- write/update
- retrieve/search
- relevance ranking
- provenance/metadata
- deletion/forget semantics
- context-budget-aware retrieval

### Tool Layer
Must support:
- tool discovery/registry
- schema validation
- permission/safety checks
- execution result normalization
- error propagation
- retry policy
- audit trail

### Coding System
Must consume Files + Tools and provide:
- repository inspection
- plan generation
- targeted edits/patches
- test/build invocation
- failure diagnosis
- verification report
- Git-aware change tracking

### Self-Development
Must never bypass Coding System verification.

Canonical improvement loop:
Observe → Measure → Diagnose → Research → Generate Hypotheses → Prioritize → Plan → Coding System → Patch → Test → Benchmark → Compare → Critique → Accept/Reject → Rollback if needed → Document → Learn

#### Observation contract
Observation records exchanged with Self-Development must be structured and content-minimized:
- source + subsystem + event kind
- PASS / FAIL / ERROR / BLOCKED / INCONCLUSIVE outcome
- severity
- run/request identifiers when available
- allowlisted numeric metrics
- allowlisted categorical metadata
- evidence references
- deterministic failure fingerprint

Prompt/response text, secrets, credentials and raw authorization material are forbidden by default.

#### Coding interface contract
Self-Development does not own direct repository mutation. Production candidates must be created through Coding System with:
- exact baseline SHA
- isolated candidate workspace
- explicit allowed paths/scope
- stale-plan/base-drift rejection
- transactional patch semantics
- deterministic mandatory test selection outside candidate-model control
- targeted + regression verification
- exact changed-path/diff/test evidence
- discard/rollback support

If these properties are unavailable or unproven, Self-Development must stop at PLAN / SHADOW_ONLY rather than fall back to a parallel GitHub mutation path.

#### Evaluation contract
Baseline and candidate must be evaluated under the same locked evaluator identity and comparable environment. The evaluator plane includes tests, benchmark manifests, baselines, constitution, judge/acceptance rules and protected-path policy. A candidate cannot modify this plane while being judged.

Result states:
- ACCEPT
- REJECT
- ROLLBACK
- BLOCKED
- INCONCLUSIVE
- SHADOW_ONLY

Missing required evidence is INCONCLUSIVE/UNPROVEN, never PASS. Critical security, permission, persistence, crash, constitution or integration failures cannot be averaged away by a higher aggregate score.

#### Risk contract
- LOW: prompts, bounded rankings/thresholds and similarly reversible local policy.
- MEDIUM: routing, memory/context algorithms, tool selection, search/research, latency/token strategy, agent workflow.
- HIGH: shared contracts, auth/permissions, storage schema/migration, core execution, GitHub mutation, rollback/recovery.
- CRITICAL: evaluator plane, constitution/proof policy, protected-path policy and Self-Development engine itself.

HIGH requires explicit stronger integration/recovery evidence and manual approval. CRITICAL changes are separate governance work and may not be autonomously self-modified.

#### Learning contract
Accepted, rejected, blocked and rolled-back experiments preserve:
- problem/diagnosis
- hypothesis
- baseline/candidate identities
- metrics/tests/proof
- confounders/known unknowns
- decision reason
- ADOPT / AVOID / RETEST lesson

Learning records never grant permissions by themselves.


### RPG System
Must use Memory through public memory interfaces; it must not create a separate hidden memory architecture unless explicitly approved.

## Contract Change Procedure
1. Propose change.
2. Identify affected systems.
3. Add decision entry.
4. Update this file.
5. Run integration tests.
6. Update CURRENT_STATUS.md.
