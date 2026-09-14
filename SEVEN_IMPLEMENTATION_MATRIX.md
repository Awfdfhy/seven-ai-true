# Seven AI — Implementation Truth Matrix

This file separates architecture from shipped behavior. A prompt, document, button or API name does not make a subsystem complete.

## Definition of done
A subsystem is **DONE** only when executable code exists, normal-flow wiring invokes it, important paths have deterministic/browser/device evidence, and failures have explicit BLOCKED/FAIL/INCONCLUSIVE/retry/fallback/recovery semantics.

## Current implementation map

| System | Executable core | Normal-flow wiring | Verification | Current truth |
| --- | --- | --- | --- | --- |
| Chat / rooms | Yes | Yes | Browser + persistence gates | Strong, not final-production certified |
| Room persistence | IndexedDB adapter | Yes | Browser gate | Strong |
| Cognitive Runtime | Task state machine, scoped capabilities, adaptive compute/risk, dependency/budget mission frontier, route learning, trust gate, adversarial preflight | Partial across specialist flows | Cognitive Boost 23 + Gate 7 + Planner 4 + integration | Wave 02 foundation verified; CR3 execution classes/no-progress remain partial |
| Truth / Epistemic | Claim kinds, authority ceiling, lineage, freshness, dedupe, independence, conflict semantics | Partial via Research/World/control | Hardening + parity + cognitive gates | Wave 02 foundation verified; full ClaimGraph/correction/retraction projection remains partial |
| Memory Fabric | Selective admission, origin-bound versioned atoms, correction history, point-in-time lookup, scope/principal filters, same-origin dedupe, bounded recall, MemoryCapsules, hard purge | Hardening/runtime compatibility foundation | Legacy memory + runtime smoke + 15 adversarial assertions | **Wave 03 foundation verified**; scalable persistence/indexes/semantic retrieval and complete derived purge reconciliation remain partial |
| Context Workspace | Typed roles, privileged instruction boundary, scope filtering, dedupe, mandatory blocking, elastic budgets, ordering/chronology, manifest/capsule | Browser Control Runtime `v4.3` + Control Bridge `v1.1.0` | Node/browser parity + 15 adversarial assertions | **Wave 03 foundation verified**; full adapters/invalidation/reconstruction remain partial |
| Model Fabric | Family/revision/endpoint identity, strict proof freshness, endpoint pricing/health/quota/qualification, hard eligibility, verified outcome ranking, champion/lease/failover, context handshake | Foundation available to cognitive/specialist integration | Model/Compute Polish 36 + registry/promotion/evolution | **Wave 04 foundation verified**; live-provider/adapters and release saturation remain partial |
| Adaptive Compute | BudgetVector, mandatory floors, resource ceilings, ComputeLease pool, protected verification/recovery reserves, early-exit/inconclusive actions | Partial through cognitive layer | Model/Compute 36 + Cognitive/Performance | **Wave 04 foundation verified**; real-device tuning/broad integration remain partial |
| Tool Fabric | CapabilitySpec, BindingRevision, ToolCatalogSnapshot, security-relevant snapshot identity, SchemaGuard/Fingerprint, bounded retrieval/frontier, progressive schemas, exact ToolCallContract, invocation states, BindingLease/replay | Strong host/hardening foundation; browser/specialist migration partial | Tool/Security/Effect 54 + runtime/execution bridge + full CI | **Wave 05 foundation verified**; full external adapter/MCP and every product-flow migration remain partial |
| Tool Security Kernel | Authoritative grants, policy/revocation epochs, exact ActionIntent/Fingerprint, principal/task/project/resource/destination scoping, read-vs-release, confirmations, narrowing leases/subleases | Host/hardening foundation; legacy browser permission bridge remains | Tool/Security/Effect 54 + execution bridge security | **Wave 05 foundation verified**; on-device Keystore/credential brokers and full runtime migration remain partial |
| Side-Effect Ledger | Logical Effect identity, independent attempt/dispatch/effect/compensation state, idempotency-aware retry, bounded reconciliation, restart lineage refresh, tamper detection | Host/hardening foundation + legacy API compatibility | Tool/Security/Effect 54 + execution recovery | **Wave 05 foundation verified**; durable on-device persistence and live provider reconciliation remain partial |
| Verification / Judge | Existing cognitive/evolution judges, deterministic hard gates | Partial | Multiple evolution/cognitive suites | Wave 06 active; unified evidence-bound layered adjudication incomplete |
| Seven Evals / Benchmark | Frozen corpus, evolution eval locks, benchmark fragments | Partial | Corpus/evolution gates | Wave 06 active; general suite/task/run identity, matched comparison and uncertainty reporting incomplete |
| Story Fabric / Narrative Engine | Architecture-polished StoryContract, narrative graph/ledger, arcs, promises, reveals, scene/beat/pacing/voice/revision design | No dedicated executable runtime yet | Architecture review only | **Architecture-polished only**; implementation/benchmarks deferred to RPG/Real Works campaign |
| Local Intelligence | Deterministic embedding/classification helpers | Partial | Runtime smoke | Foundation implemented |
| Research Runtime | Claim-evidence matrix, freshness/conflict/gap analysis, citation locks | Packaged verification API; acquisition partial | Unit + release gates | Verification foundation implemented |
| Coding Runtime | Repo-map/patch/evidence foundations + evolution modules | Partial | Runtime + evolution tests | Partial; real platform shell/file bridge remains |
| Canon / Real Works | Source authority, anchors, world/canon contracts, branch/debt audit | Packaged APIs; chat orchestration partial | Unit/browser release tests | Functional foundation |
| Titles System | Deterministic world naming rules | Via World Runtime; UI partial | Unit gate | Functional foundation |
| UI Design / Runtime | Release CSS, adaptive tiers, semantic states, accessibility hooks | Yes | Browser/static gates | Strong foundation; final Visual campaign pending |
| Motion System | Event-delegated reveals/press/theme motion | Yes | Browser + reduced-motion | Strong foundation |
| Performance Runtime | Adaptive tiers, pressure downgrade, guarded recovery, bounded marks, idle/frame scheduling/yield | Yes | 11 direct assertions + static/browser | Wave 01 foundation verified; real-device/tail evidence pending |
| PDF Runtime | Lazy local PDF.js | Yes | Browser/static | Strong |
| Evolution Promotion Safety | Transactional apply/verify/rollback + baseline/corpus lock | Promotion runner | Evolution suites | Strong fail-closed foundation |
| Android packaging | Capacitor/assets/APK workflow | Build pipeline | Actions + emulator smoke | Packaging foundation; real-device evidence pending |
| Android SAF / Keystore | No final integration | No | No | Planned |
| Full observability | Partial counters/modules | Partial | Partial | Planned/partial |

## Current system laws
- Authority cannot be created by model/tool/memory/summary text or increased through derivation.
- Memory Recall remains recall-only; contextual placement never creates evidence or permission.
- Only trusted runtime/controller/policy instructions occupy the privileged system lane.
- A model family, revision and endpoint are distinct; endpoint eligibility is fail-closed on material unknowns.
- Child compute cannot mint budget or steal protected verification/recovery reserve.
- Capability identity is distinct from a tool binding/revision; discovery is not activation.
- Remote tool annotations are hints, never permission/risk authority.
- Full tool schemas are disclosed only after bounded shortlist selection.
- Effectful tool authorization binds exact principal/task/action/resource/binding/schema and argument payload fingerprint.
- Read permission is not release/exfiltration permission; subleases may narrow but never widen authority.
- Transport success is not real-world effect truth.
- Possible post-dispatch side effects never blind-retry unless idempotency/evidence makes repetition safe.
- Cancellation and compensation do not erase uncertain dispatch/effect history.
- Success cannot early-exit before verification; unresolved effects require bounded reconciliation.

## UI / performance rules
- Mobile-first reachability and safe areas.
- Reduced Motion affects presentation only.
- Performance tiers may reduce optional decoration/depth, never correctness/safety.
- Heavy PDF/workspace/tool/benchmark assets remain lazy.
- Release startup gate remains `<100000` bytes; Wave 05 final evidence is `99794` bytes.

## Research / World / Story rules
- Claims bind to source/stance/locator/authority/transformation.
- GAP/STALE/UNCITABLE/CONFLICT cannot become PASS through prose.
- Canon order is source-bound; divergence branches rather than rewriting canon.
- Story prose cannot silently overwrite authoritative RPG/Canon world state; Story Fabric proposes diffs and the owning controller verifies/commits them.

## Evolution promotion rules
- Promotion is bound to frozen evaluation identity and exact candidate/baseline state.
- Missing/drifted eval identity fails before mutation.
- Critical security/permission/persistence/crash regression overrides benchmark gains.
- Apply/verify failure requires rollback; rollback failure is never reported success.

## Next integration gates
1. **Verification/Judge + Seven Evals/Benchmark expansion.**
2. Research: Search → Fetch → Extract → Matrix → Verify → Cite with live acquisition adapters.
3. Coding: connect repo primitives to platform file/shell inspect/edit/test/diff evidence.
4. RPG/Real Works + Story Fabric: wire world/story contracts into conversation generation and verified scene/world commits.
5. Persistence: reconcile remaining legacy state and durable Effect/Memory recovery.
6. Android SAF/Keystore + real-device startup/storage/cancellation/offline/provider tests.
7. Protocol adapters only after underlying capability authority/contracts are verified.
8. Specialist/UI campaigns, Android certification and final Red Team.
9. Only then may the complete product be called release-ready.
