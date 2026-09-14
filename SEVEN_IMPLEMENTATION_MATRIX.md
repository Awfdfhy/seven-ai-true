# Seven AI — Implementation Truth Matrix

This file separates architecture from shipped behavior. A prompt, document, button or API name does not make a subsystem complete.

## Definition of done
A subsystem is **DONE** only when executable code exists, normal-flow wiring invokes it, important paths have deterministic/browser/device evidence, and failures have explicit BLOCKED/FAIL/INCONCLUSIVE/retry/fallback/recovery semantics.

## Current implementation map

| System | Executable core | Normal-flow wiring | Verification | Current truth |
| --- | --- | --- | --- | --- |
| Chat / rooms | Yes | Yes | Browser + persistence gates | Strong, not final-production certified |
| Room persistence | IndexedDB adapter | Yes | Browser gate | Strong |
| Cognitive Runtime | Task state machine, scoped capabilities, adaptive compute/risk, dependency/budget mission frontier, route learning, trust gate, adversarial preflight | Partial across specialist flows | Cognitive Boost 23 + Gate 7 + Planner 4 + integration | **Wave 02 foundation verified**; full CR3 execution/no-progress classes remain partial |
| Truth / Epistemic | Claim kinds, authority ceiling, lineage, freshness, dedupe, explicit independence, conflict semantics | Partial via Research/World/control | Hardening + parity + cognitive gates | **Wave 02 foundation verified**; full ClaimGraph/correction/retraction projection remains partial |
| Memory Fabric | Selective admission, origin-bound atoms, correction history, point-in-time lookup, scope/principal filters, dedupe, bounded recall, capsules, hard purge | Hardening/runtime compatibility foundation | Legacy memory + runtime smoke + 15 adversarial assertions | **Wave 03 foundation verified**; scalable indexes/semantic retrieval/derived purge reconciliation remain partial |
| Context Workspace | Typed roles, privileged instruction boundary, scope filtering, dedupe, mandatory blocking, elastic budgets, chronology, manifest/capsule | Browser Control Runtime + bridge | Node/browser parity + 15 adversarial assertions | **Wave 03 foundation verified**; full adapters/invalidation/reconstruction remain partial |
| Model Fabric | Family/revision/endpoint identity, strict proof, endpoint pricing/health/quota, hard eligibility, verified outcome ranking, lease/failover, context handshake | Foundation available to specialist integration | Model/Compute 36 + registry/promotion/evolution | **Wave 04 foundation verified**; live provider/adapters and release saturation remain partial |
| Adaptive Compute | BudgetVector, mandatory floors, resource ceilings, leases, protected verification/recovery reserves, early-exit/inconclusive actions | Partial through cognitive layer | Model/Compute 36 + Cognitive/Performance | **Wave 04 foundation verified**; real-device tuning/broad closed-loop integration remain partial |
| Tool Fabric | CapabilitySpec, BindingRevision, snapshots, schema fingerprints, bounded retrieval/frontier, progressive schemas, exact ToolCallContract, invocation states, BindingLease/replay | Strong host/hardening foundation; migration partial | Tool/Security/Effect 54 + runtime/execution bridge | **Wave 05 foundation verified**; external adapter/MCP and every product-flow migration remain partial |
| Tool Security Kernel | Authoritative grants, epochs, ActionIntent/Fingerprint, exact scope/destination, read-vs-release, confirmations, narrowing leases/subleases | Host/hardening foundation | Tool/Security/Effect 54 + execution bridge | **Wave 05 foundation verified**; Keystore/credential brokers/full runtime migration remain partial |
| Side-Effect Ledger | Logical Effect identity, attempt/dispatch/effect/compensation state, idempotency-aware retry, bounded reconciliation, restart lineage, tamper detection | Host/hardening foundation + legacy API compatibility | Tool/Security/Effect 54 + execution recovery | **Wave 05 foundation verified**; durable on-device persistence/live provider reconciliation remain partial |
| Verification / Judge | AcceptanceContract, VerificationPlan DAG, subject/scope/authority-bound candidates, typed evidence, freshness/independence, deterministic dominance, bounded repair, independent high-risk judge, effect-postcondition gate, JudgeReceipt/dependency invalidation | Host/evolution foundation; specialist migration partial | Judge/Benchmark 53 + existing evolution/cognitive gates | **Wave 06 foundation verified**; representative judge calibration and universal specialist handoff remain partial |
| Seven Evals / Benchmark | EvaluationProgram, AffordanceContract, TrialPolicy, versioned tasks/suites/environments/runs, hard gates, uncertainty, paired matched comparison, contamination, strata, release decisions/receipts | Evolution/benchmark foundation; persistent UI/store later | Judge/Benchmark 53 + corpus/evolution gates | **Wave 06 foundation verified**; hidden/holdout scale, eval-of-evals, live/provider/device cohorts remain partial |
| File / Project Tools | ProjectRoot/Grant, FileRef/VersionToken, protected-path policy, ProjectMap, staged ProjectTransaction, stale-base/version checks, commit/postcondition/rollback evidence | Hardening foundation; platform adapter integration partial | Coding/File 58 + Pass B 25 | **Wave 07 foundation verified**; SAF/shell bridge and durable on-device transaction journal remain partial |
| Coding Runtime | Source-backed RequirementLedger, ChangeContract, BaselineProof, isolated CandidateWorkspace, reproduce/investigate/test/review/repair, exact ChangeEvidenceBundle and independent Judge promotion | Strong host/evolution foundation; product flow/UI partial | Coding/File 58 + Pass B 25 + Judge handoff | **Wave 07 foundation verified**; larger real-repository/device benchmarks and final specialist UI remain partial |
| Research Fabric | ResearchContract/Agenda/ClaimRef, source-versioned locator-bound EvidenceUnits, dependency clusters, claim freshness/conflict, CoverageContract, ClaimEvidenceLock, CitationManifest, ResultPack | Release Research Runtime + hardening + Truth bridge; live acquisition partial | Research core 46 + Pass B 17 + bridge 2 | **Wave 08 foundation verified**; live acquisition, multimodal research and larger current-web/multilingual evals remain partial |
| Retrieval Fabric | RetrievalNeed/QueryPlan, exact/lexical cheap baseline, conditional semantic/hybrid portfolio, discovery-only observations, candidate clustering, fetched/extracted lineage, run manifest | Hardening foundation; provider/browser adapters partial | Wave 08 Research suites | **Wave 08 foundation verified**; live providers, health/cache persistence and browser escalation remain partial |
| Knowledge / Files | KnowledgeSource/SourceVersion/SourceLocator, derived representations, invalidation and source-bound KnowledgeResult | Hardening foundation; ingestion/storage adapters partial | Wave 08 Research suites | **Wave 08 foundation verified**; durable ingestion, OCR/multimodal bridge, optional semantic indexes and Android SAF remain partial |
| Vision Fabric | Frozen VisualSource/Version/Region/OCR/Layout/Observation/Perception contracts | No complete executable specialist core yet | Architecture evidence only | **Wave 09 active**; implementation foundation is the current boundary |
| Story Fabric / Narrative Engine | Architecture-polished StoryContract, graph/ledger, arcs, promises/reveals, scene/beat/pacing/voice/revision design | No dedicated executable runtime yet | Architecture review only | **Architecture-polished only**; implementation/benchmarks deferred to RPG/Real Works campaign |
| Local Intelligence | Deterministic embedding/classification helpers | Partial | Runtime smoke | Foundation implemented |
| Canon / Real Works | Source authority, anchors, world/canon contracts, branch/debt audit | Packaged APIs; chat orchestration partial | Unit/browser release tests | Functional foundation |
| Titles System | Deterministic world naming rules | Via World Runtime; UI partial | Unit gate | Functional foundation |
| UI Design / Runtime | Release CSS, adaptive tiers, semantic states, accessibility hooks | Yes | Browser/static gates | Strong foundation; final Visual campaign pending |
| Motion System | Event-delegated reveals/press/theme motion | Yes | Browser + reduced-motion | Strong foundation |
| Performance Runtime | Adaptive tiers, pressure downgrade, guarded recovery, bounded marks, idle/frame scheduling/yield | Yes | 11 direct assertions + static/browser | **Wave 01 foundation verified**; real-device/tail evidence pending |
| PDF Runtime | Lazy local PDF.js | Yes | Browser/static | Strong |
| Evolution Promotion Safety | Transactional apply/verify/rollback + baseline/corpus lock | Promotion runner | Evolution suites | Strong fail-closed foundation |
| Android packaging | Capacitor/assets/APK workflow | Build pipeline | Actions + emulator smoke | Packaging foundation; real-device evidence pending |
| Android SAF / Keystore | No final integration | No | No | Planned |
| Full observability | Partial counters/modules | Partial | Partial | Planned/partial |

## Current system laws
- Authority cannot be created by model/tool/memory/summary/search text or increased through derivation.
- Search observations, snippets and ranking are discovery signals, not evidence authority.
- Durable Research evidence binds exact claim, SourceVersion, locator, principal/scope/realm and explicit dependency cluster.
- Distinct source IDs do not manufacture independent corroboration.
- Negative absence claims require bounded CoverageContract evidence; `NOT_FOUND` alone is not refutation.
- Research → Truth transport remains conservative and cannot recreate Research scalar authority.
- Memory Recall remains recall-only; contextual placement never creates evidence or permission.
- Only trusted runtime/controller/policy instructions occupy the privileged system lane.
- Child compute cannot mint budget or steal protected verification/recovery reserve.
- Capability identity is distinct from binding/revision; discovery is not activation.
- Remote tool annotations are hints, never permission/risk authority.
- Effectful tool authorization binds exact principal/task/action/resource/binding/schema and argument payload.
- Read permission is not release/exfiltration permission; child leases may narrow but never widen authority.
- Transport success is not real-world effect truth; possible post-dispatch effects never blind-retry without sufficient idempotency/evidence.
- Verification verdicts are canonical and evidence-bound; missing evidence/executors cannot become PASS through prose.
- Deterministic or authoritative refutation outranks semantic/model preference.
- High-risk independent adjudication cannot be performed by the same builder/context.
- Benchmark hard gates cannot be averaged away by quality scores.
- Fair comparisons require matched environment, affordances and budget plus paired trials; non-comparable evidence stays non-comparable.
- Critical regressions dominate benchmark gains; contamination blocks clean capability claims.
- Success cannot early-exit before verification; unresolved effects require bounded reconciliation.

## UI / performance rules
- Mobile-first reachability and safe areas.
- Reduced Motion affects presentation only.
- Performance tiers may reduce optional decoration/depth, never correctness/safety.
- Heavy PDF/workspace/tool/benchmark/coding/research semantic assets remain lazy.
- Release startup gate remains `<100000` bytes; Wave 08 final implementation evidence is **`98941` bytes**.

## Research / World / Story rules
- Search finds candidates; SourceVersions + locators anchor evidence; evidence supports claims; ClaimEvidenceLock precedes grounded synthesis.
- GAP/STALE/UNCITABLE/CONFLICT cannot become PASS through prose.
- Freshness and source fitness are claim-specific, not universal source scores.
- Canon order is source-bound; divergence branches rather than rewriting canon.
- Story prose cannot silently overwrite authoritative RPG/Canon world state; proposed diffs require owning-controller verification/commit.

## Evolution / evaluation promotion rules
- Promotion is bound to frozen evaluation identity and exact candidate/baseline state.
- Missing/drifted eval identity fails before mutation.
- Comparison conditions, grader identity, affordances and compute budgets are evidence identity.
- Critical security/permission/persistence/crash regression overrides benchmark gains.
- Apply/verify failure requires rollback; rollback failure is never reported success.

## Next integration gates
1. **Vision Fabric:** provenance-bound VisualSource/Version/Region, derived OCR/layout, grounded observations, stale-frame guards, privacy/minimization and Truth evidence bridge.
2. Research live acquisition: provider/browser adapters, durable cache/source persistence and optional semantic retrieval without moving heavy work onto startup.
3. RPG/Real Works + Story Fabric: wire world/story contracts into conversation generation and verified scene/world commits.
4. Persistence: reconcile remaining legacy state and durable Effect/Memory/Project/Research recovery.
5. Android SAF/Keystore + real-device startup/storage/cancellation/offline/provider tests.
6. Protocol adapters only after underlying capability authority/contracts are verified.
7. Specialist/UI campaigns, Android certification, long-horizon/competitor evals and final Red Team.
8. Only then may the complete product be called release-ready.
