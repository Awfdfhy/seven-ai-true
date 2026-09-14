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
| Memory Fabric | Selective admission, origin-bound atoms, correction history, point-in-time lookup, scope/principal filters, dedupe, bounded recall, capsules, hard purge | Hardening/runtime compatibility foundation | Legacy memory + runtime smoke + 15 adversarial assertions | **Wave 03 foundation verified** |
| Context Workspace | Typed roles, privileged instruction boundary, scope filtering, dedupe, mandatory blocking, elastic budgets, chronology, manifest/capsule | Browser Control Runtime + bridge | Node/browser parity + 15 adversarial assertions | **Wave 03 foundation verified** |
| Model Fabric | Family/revision/endpoint identity, strict proof, endpoint pricing/health/quota, hard eligibility, verified outcome ranking, lease/failover, context handshake | Foundation available to specialist integration | Model/Compute 36 + registry/promotion/evolution | **Wave 04 foundation verified** |
| Adaptive Compute | BudgetVector, mandatory floors, resource ceilings, leases, protected verification/recovery reserves, early-exit/inconclusive actions | Partial through cognitive layer | Model/Compute 36 + Cognitive/Performance | **Wave 04 foundation verified** |
| Tool Fabric | CapabilitySpec, BindingRevision, snapshots, schema fingerprints, bounded retrieval/frontier, progressive schemas, exact ToolCallContract, invocation states, BindingLease/replay | Strong host/hardening foundation; migration partial | Tool/Security/Effect 54 + runtime/execution bridge | **Wave 05 foundation verified** |
| Tool Security Kernel | Authoritative grants, epochs, ActionIntent/Fingerprint, exact scope/destination, read-vs-release, confirmations, narrowing leases/subleases | Host/hardening foundation | Tool/Security/Effect 54 + execution bridge | **Wave 05 foundation verified** |
| Side-Effect Ledger | Logical Effect identity, attempt/dispatch/effect/compensation state, idempotency-aware retry, bounded reconciliation, restart lineage, tamper detection | Host/hardening foundation + legacy compatibility | Tool/Security/Effect 54 + execution recovery | **Wave 05 foundation verified** |
| Verification / Judge | AcceptanceContract, VerificationPlan DAG, subject/scope/authority-bound candidates, typed evidence, freshness/independence, deterministic dominance, bounded repair, independent high-risk judge, JudgeReceipt/dependency invalidation | Host/evolution foundation; specialist migration partial | Judge/Benchmark 53 + evolution/cognitive gates | **Wave 06 foundation verified** |
| Seven Evals / Benchmark | Versioned programs/tasks/suites/environments/runs, hard gates, uncertainty, paired comparison, contamination, strata, release receipts | Evolution/benchmark foundation | Judge/Benchmark 53 + corpus/evolution gates | **Wave 06 foundation verified** |
| File / Project Tools | ProjectRoot/Grant, FileRef/VersionToken, protected paths, ProjectMap, staged transaction, stale-base/version checks, commit/postcondition/rollback evidence | Hardening foundation; platform adapter partial | Coding/File 58 + Pass B 25 | **Wave 07 foundation verified** |
| Coding Runtime | RequirementLedger, ChangeContract, BaselineProof, isolated candidate, reproduce/investigate/test/review/repair, exact evidence + Judge promotion | Strong host/evolution foundation; product flow/UI partial | Coding/File 58 + Pass B 25 + Judge | **Wave 07 foundation verified** |
| Research Fabric | Source-versioned locator-bound EvidenceUnits, dependency clusters, freshness/conflict, CoverageContract, locks/citations/results | Release Research Runtime + hardening + Truth bridge | Research core 46 + Pass B 17 + bridge 2 | **Wave 08 foundation verified** |
| Retrieval Fabric | QueryPlan, exact/lexical cheap baseline, conditional semantic/hybrid portfolio, discovery-only observations, clustering/manifests | Hardening foundation; provider adapters partial | Wave 08 suites | **Wave 08 foundation verified** |
| Knowledge / Files | KnowledgeSource/SourceVersion/SourceLocator, derived representations and invalidation | Hardening foundation; ingestion/storage adapters partial | Wave 08 suites | **Wave 08 foundation verified** |
| Vision Fabric | VisualSource/Version/Frame/Region, OCR/Layout, grounded observations, perception plan/manifest, exact target proposals, Remote Perception Envelope, VisualEvidenceRef | Canonical hardening foundation; live OCR/VLM integration partial | Vision Foundation 54 + Pass B 27 | **Wave 09 foundation verified** |
| RPG World Kernel | WorldDefinition/Session, sealed state/event ledger, player-authored actions, proposal/validation/commit, causal parents, replay, snapshots, branch ancestry, deterministic RNG, actor knowledge, relationships/quests | Canonical hardening runtime; product orchestration/UI partial | Pass A + Pass B + final adversarial suite + full CI | **Wave 10 foundation verified**; persistent recovery, deeper factions/schedules/rumors/director and real-device long-session evidence remain partial |
| Story Fabric / Narrative Engine | StoryContract, Narrative Ledger, StoryGraph, arcs/promises/reveals, SceneContract, BeatPlan, NarrativeArtifact, critics/review, Judge-bound Story→World handoff | Canonical hardening runtime; live writer/model/UI orchestration partial | Pass A + Pass B + final adversarial guard `28` + Wave06 Judge integration | **Wave 10 foundation verified**; long-horizon plotting/pacing/voice/theme benchmarks and final UI remain partial |
| Canon / Real Works | Existing source/canon packages and architecture | Partial | Existing world/canon tests | **Mega-Wave 11 next**; source-locked continuity graph, coverage, insertion/divergence and RPG constraint integration not yet foundation-complete |
| Titles / World Linguistic | Existing deterministic naming pieces and architecture | Partial | Existing unit gates | **Mega-Wave 11 next**; explicit status/grammar/evidence/collision/localization/replay foundation not yet complete |
| Local Intelligence | Deterministic embedding/classification helpers | Partial | Runtime smoke | Foundation implemented |
| UI Design / Runtime | Release CSS, adaptive tiers, semantic states, accessibility hooks | Yes | Browser/static gates | Strong foundation; final Visual campaign pending |
| Motion System | Event-delegated reveals/press/theme motion | Yes | Browser + reduced-motion | Strong foundation |
| Performance Runtime | Adaptive tiers, pressure downgrade, guarded recovery, bounded marks, idle/frame scheduling/yield | Yes | 11 direct assertions + static/browser | **Wave 01 foundation verified** |
| PDF Runtime | Lazy local PDF.js | Yes | Browser/static | Strong |
| Evolution Promotion Safety | Transactional apply/verify/rollback + baseline/corpus lock | Promotion runner | Evolution suites | Strong fail-closed foundation |
| Android packaging | Capacitor/assets/APK workflow | Build pipeline | Actions + emulator smoke | Packaging foundation; real-device evidence pending |
| Android SAF / Keystore | No final integration | No | No | Planned |
| Full observability | Partial counters/modules | Partial | Partial | Planned/partial |

## Current system laws
- Authority cannot be created by model/tool/memory/summary/search/vision/story text or increased through derivation.
- Search observations, snippets and ranking are discovery signals, not evidence authority.
- Durable Research evidence binds exact claim, SourceVersion, locator, principal/scope/realm and explicit dependency cluster.
- Distinct source IDs do not manufacture independent corroboration.
- Negative absence claims require bounded CoverageContract evidence.
- Vision pixels/OCR/VLM output remains derived observation and cannot grant action/world/file authority.
- Screenshot geometry is ephemeral and exact current-frame/content/viewport bound.
- Remote visual processing requires grounded minimized payload evidence.
- Memory Recall remains recall-only; contextual placement never creates permission.
- Child compute cannot mint budget or steal protected verification/recovery reserve.
- Capability identity is distinct from binding/revision; discovery is not activation.
- Remote tool annotations are hints, never permission/risk authority.
- Effectful tool authorization binds exact principal/task/action/resource/schema/args.
- Transport success is not real-world effect truth.
- Verification verdicts are canonical and evidence-bound; missing evidence cannot become PASS through prose.
- High-risk independent adjudication cannot be performed by the same builder/context.
- Benchmark hard gates cannot be averaged away by quality scores.
- Success cannot early-exit before verification.
- **World state is owned by the RPG World Kernel, not by prose or model memory.**
- **Player agency is authoritative user input. Player movement targets and protected mental-state changes must match the actual user action.**
- **Character knowledge requires a real transmission/source event; generic knowledge teleportation fails closed.**
- **Story-origin world proposals cannot use the generic commit path. They require an authentic Judge-bound handoff and then World Kernel commit.**
- **Story cancellation cannot create world events.**
- **RNG, snapshots, branches and narrative dependencies are integrity-bound and replay/audit oriented.**

## UI / performance rules
- Mobile-first reachability and safe areas.
- Reduced Motion affects presentation only.
- Performance tiers may reduce optional decoration/depth, never correctness/safety.
- Heavy PDF/workspace/tool/benchmark/coding/research/vision/RPG/Story assets remain lazy/off startup.
- Release startup gate remains `<100000` bytes; current verified specialist implementation leaves release startup at **`98941` bytes**.

## Research / Vision / World / Story rules
- Search finds candidates; SourceVersions + locators anchor evidence.
- GAP/STALE/UNCITABLE/CONFLICT cannot become PASS through prose.
- Vision observes and grounds; it never converts perception into action authority.
- Canon order is source-bound; divergence branches rather than rewriting canon.
- Story prose cannot overwrite authoritative RPG world state.
- Real Works fidelity gaps must remain explicit (`CANON_GAP`/unresolved) instead of false certainty.
- Titles generated by Seven must never masquerade as official canon titles.

## Next integration gates
1. **Real Works + Titles:** source/version/evidence-bound canon graph, continuity/adaptation separation, `CANON_GAP`, coverage/anchors/insertion/divergence, RPG constraints, and evidence-grounded world naming/status/grammar/localization/replay.
2. Research/Vision live adapters and durable caches.
3. Persistence/recovery for remaining Effect/Memory/Project/Research/Vision/RPG/Story state.
4. Android SAF/Keystore + real-device startup/storage/cancellation/offline/provider/capture tests.
5. Protocol adapters only after underlying capability authority/contracts are verified.
6. Specialist/UI campaigns, Android certification, long-horizon/competitor evals and final Red Team.
7. Only then may the complete product be called release-ready.
