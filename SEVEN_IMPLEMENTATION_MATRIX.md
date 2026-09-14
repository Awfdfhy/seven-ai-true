# Seven AI — Implementation Truth Matrix

This file separates architecture from shipped behavior. A prompt, document, button, screenshot or API name does not make a subsystem complete.

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
| Model Fabric | Family/revision/endpoint identity, strict proof, endpoint pricing/health/quota, hard eligibility, verified outcome ranking, lease/failover, context handshake | Foundation available to specialist integration | Model/Compute 36 + registry/promotion/evolution | **Wave 04 foundation verified**; live endpoint adapters/dynamic champion refresh remain later |
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
| Canon / Real Works | Source/version/evidence-bound Canon corpus, continuities, facts/events/partial chronology, knowledge, anchors, coverage, scenes, insertion/divergence, RPG constraint bridge | Canonical hardening foundation; live acquisition/product orchestration partial | Wave 11 foundation + Pass B + final adversarial guard + full CI | **Wave 11 foundation verified**; live source ingestion, durable indexes, large corpora and specialist UI remain later |
| Titles / World Linguistic | Typed status/domains, evidence-bound profiles, deterministic grammar, official/generated separation, collisions, localization/Arabic, manifests/replay | Canonical hardening foundation; product UI/model-assist orchestration partial | Wave 11 foundation + Pass B + final adversarial guard | **Wave 11 foundation verified**; live naming source acquisition/UI remain later |
| Local Intelligence | Deterministic embedding/classification helpers | Partial | Runtime smoke | Foundation implemented |
| Visual Evidence Runtime | Sealed scenarios/artifacts/audits/evidence, evidence tiers, scenario/evidence/baseline registries, anti-laundering, environment/device proof, manifest | Playwright release capture + build/test path | Wave 12: 43 foundation + 32 Pass B + 5 final assertions; 8/8 live HOST scenarios PASS | **Wave 12 HOST-tier foundation verified**; device-tier certification and approved production golden portfolio remain later |
| UI Design / Runtime | Release CSS, adaptive tiers, semantic states, accessibility hooks, repaired 44px core touch targets | Yes | Browser/static/contrast + Wave12 host visual evidence | Strong implementation foundation; **Design Genome convergence and Final UI campaigns remain pending** |
| Motion System | Event-delegated reveals/press/theme motion | Yes | Browser + reduced-motion + Wave12 probe | Strong foundation; dedicated motion polish remains later |
| Performance Runtime | Adaptive tiers, pressure downgrade, guarded recovery, bounded marks, idle/frame scheduling/yield | Yes | 11 direct assertions + static/browser | **Wave 01 foundation verified** |
| PDF Runtime | Lazy local PDF.js | Yes | Browser/static | Strong |
| Evolution Promotion Safety | Transactional apply/verify/rollback + baseline/corpus lock | Promotion runner | Evolution suites | Strong fail-closed foundation |
| Android packaging | Capacitor/assets/APK workflow | Build pipeline | Actions + emulator smoke | Packaging foundation; real-device evidence pending |
| Android SAF / Keystore | No final integration | No | No | Planned |
| Full observability | Partial counters/modules | Partial | Partial | Planned/partial |

## Current system laws
- Authority cannot be created by model/tool/memory/summary/search/vision/story/title/visual text or increased through derivation.
- Search observations, snippets and ranking are discovery signals, not evidence authority.
- Durable Research evidence binds exact claim, SourceVersion, locator, principal/scope/realm and explicit dependency cluster.
- Vision pixels/OCR/VLM output remains derived observation and cannot grant action/world/file authority.
- Screenshot geometry is ephemeral and exact current-frame/content/viewport bound.
- Visual screenshot pixels alone do not prove semantics, behavior, accessibility or device-tier quality.
- Visual evidence is scenario/commit/branch/environment bound; evidence tiers cannot be promoted by relabeling.
- Golden/reference baselines require explicit approval; a changed screenshot cannot auto-become the new expected result merely to make tests green.
- Memory Recall remains recall-only; contextual placement never creates permission.
- Child compute cannot mint budget or steal protected verification/recovery reserve.
- Capability identity is distinct from binding/revision; discovery is not activation.
- Effectful tool authorization binds exact principal/task/action/resource/schema/args.
- Transport success is not real-world effect truth.
- Verification verdicts are canonical and evidence-bound; missing evidence cannot become PASS through prose.
- Benchmark hard gates cannot be averaged away by quality scores.
- World state is owned by the RPG World Kernel, not by prose or model memory.
- Player agency is authoritative user input.
- Character knowledge requires a real transmission/source event.
- Story-origin world proposals require an authentic Judge-bound handoff and then World Kernel commit.
- Canon is source/version/evidence/continuity bound; missing required coverage remains `CANON_GAP`.
- Generated titles never silently become official titles.

## UI / performance rules
- Mobile-first reachability and safe areas.
- Reduced Motion affects presentation only.
- Performance tiers may reduce optional decoration/depth, never correctness/safety.
- Heavy PDF/workspace/tool/benchmark/coding/research/vision/RPG/Story/Canon/visual-evidence tooling remains lazy or build-time where practical.
- Release startup gate remains `<100000` bytes; current verified implementation is **`99743 / 100000` bytes**, leaving only **257 bytes** headroom.
- Wave 13+ visual work must recover/compact hot-path bytes before materially increasing startup payload, or remain lazy/build-time.

## Research / Vision / World / Story / Visual rules
- Search finds candidates; SourceVersions + locators anchor evidence.
- GAP/STALE/UNCITABLE/CONFLICT cannot become PASS through prose.
- Vision observes and grounds; it never converts perception into action authority.
- Canon order is source-bound; divergence branches rather than rewriting canon.
- Story prose cannot overwrite authoritative RPG world state.
- Real Works fidelity gaps remain explicit rather than false certainty.
- Titles generated by Seven must never masquerade as official canon titles.
- Host visual evidence cannot be called physical-device certification.
- OBSERVE-mode visual evidence detects/report defects; release GATE promotion is a separate decision.

## Next integration gates
1. **Design Genome Runtime + Design Lint:** converge token families, formalize Seven-specific primitives/rules and detect design drift without consuming startup headroom.
2. **Logo & Identity Tournament:** only after genome/evidence infrastructure is strong enough to judge candidates.
3. Global UI + specialist workspaces + Typed/Generated UI + Motion + Arabic/RTL + Accessibility + Mobile Performance.
4. Research/Vision/provider live adapters and durable caches/persistence.
5. Android SAF/Keystore + real-device startup/storage/cancellation/offline/provider/capture/visual tests.
6. Android visual certification, long-horizon/competitor evals and final Visual Red Team/saturation.
7. Only then may the complete product be called release-ready.
