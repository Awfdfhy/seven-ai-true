# Seven AI — Capability 07 Tool Runtime / Tool Fabric Freeze Record

Status: **ARCHITECTURE FROZEN FOR ULTIMATE POLISH CAMPAIGN**  
Implementation status: **Deferred / partial foundation remains**

## Frozen target

**Seven Tool Fabric 3.0 — Governed Capability Execution Mesh**

## Prime law

> A discovered tool is not executable authority. Seven executes a canonical capability only through a qualified binding under an exact schema/version, authorization decision, budget, and recovery/verification contract.

## Scope of this freeze

This freezes the **core Tool Runtime architecture**.

It does **not** mean:

- every Tool Fabric 2.0 family is individually deep-polished;
- every external adapter is implemented;
- MCP integration is production-complete;
- Android SAF/Keystore/native bridges are complete;
- Search/Browser/SQL/OCR/Media/Document/Geo/Data specialists are all frozen;
- Tool Security Kernel (#08) or Side-Effect Ledger (#09) are replaced by this system.

Those remain separate campaign/deep-polish work.

## Final reconciled architecture

1. Separate canonical `CapabilitySpec` from concrete `ToolBinding` and `BindingRevision`.
2. A tool/provider/server name is never the canonical capability identity by itself.
3. Bind runs/phases to a versioned `ToolCatalogSnapshot` rather than an implicitly mutable live catalogue.
4. Discovery follows quarantine/normalization/schema/security/eval gates before approval.
5. Discovery never equals activation.
6. Tool metadata from external sources is content/evidence, not instruction or permission authority.
7. Use hierarchical capability retrieval rather than dumping all tools into context.
8. Exact/keyed/lexical retrieval is the cheap baseline; embeddings/reranking are optional and lazy.
9. Expand the capability graph only around the current plan need.
10. Apply hard eligibility before any model/learned selector ranks bindings.
11. Reduce eligible bindings to a small `ToolCandidateFrontier`.
12. Keep a permanent deterministic champion retrieval/selection path.
13. Learned retrieval/reranking must beat that champion on realistic, multilingual and adversarial evals before promotion.
14. Use progressive schema disclosure: capability card -> compact signature -> full executable schema.
15. Full schemas are materialized only for shortlisted/executable bindings.
16. `SchemaGuard` validates both inputs and structured outputs.
17. Every executable binding/revision carries a `SchemaFingerprint`.
18. Unexpected schema drift invalidates sensitive execution until re-qualified.
19. Every dispatch is represented by a `ToolCallContract`.
20. The contract binds capability, binding revision, catalogue snapshot, schema fingerprint, arguments, authorization reference, budget, timeout/cancel policy and verification requirements.
21. Tool invocation uses explicit attempt states; there is no generic ambiguous `success=true` canonical state.
22. `RESULT_VALID` means contract-valid result, not verified real-world effect or completed user goal.
23. Distinguish failure before dispatch from failure after possible dispatch.
24. Post-dispatch uncertainty on side-effecting calls never triggers blind retry.
25. Canonical idempotency classes remain `SAFE_REPEAT`, `KEYED_REPEAT`, `DO_NOT_REPEAT`, `UNKNOWN`.
26. Remote idempotency/read-only annotations may be hints only and cannot lower Seven's risk classification by themselves.
27. Cancellation preserves `CANCELLED_CONFIRMED` vs `CANCELLED_UNCERTAIN` and propagates to dependent work.
28. Long-running tools use typed event streams with explicit partial/final semantics.
29. External async task handles are subordinate to Seven run/task state.
30. Remote `completed` is an observation, not final verification.
31. Health is binding/revision scoped and supports circuit breakers.
32. `ToolBindingLease` may preserve schema/auth/cache/semantic continuity during long runs but never grants permission.
33. Capability graph edges are typed, versioned, bounded and non-authoritative until validated.
34. Direct deterministic fast paths are preferred when an exact safe capability maps cleanly without model tool selection.
35. MCP is an interoperability adapter family, not Seven's internal authority model.
36. Protocol/server annotations and descriptions remain untrusted unless independently trusted/validated.
37. Tool poisoning and rug-pull/drift defenses require metadata minimization, fingerprints, quarantine and origin/taint preservation.
38. Tool output is always contextual data, never privileged instructions.
39. Large outputs are artifactized; Context Fabric receives compact source-bound capsules/references.
40. Deterministic replay uses recorded observations and never silently re-executes external side effects.
41. Adaptive Compute owns tool-count/depth/retry/concurrency budgets; Tool Fabric cannot mint extra compute.
42. Resource Governor owns device/resource ceilings.
43. Tool Security Kernel owns permission authority.
44. Side-Effect Ledger owns effect uncertainty/reconciliation.
45. Epistemic/Verification layers own factual/effect/goal verdicts beyond contract validity.
46. Unused tool families impose approximately zero startup cost.
47. Broad discovery, indexing, probes, benchmarks and heavy adapters stay off the ordinary mobile hot path.
48. Tool selection quality is judged on a Pareto frontier including correctness, schema validity, safety, latency, context cost and device impact.

## Canonical objects

- `CapabilitySpec`
- `ToolBinding`
- `BindingRevision`
- `ToolCatalogSnapshot`
- `SchemaFingerprint`
- `ToolCandidateFrontier`
- `ToolBindingLease`
- `ToolCallContract`
- `ToolInvocationAttempt`
- `ToolEvent`
- `ToolResultEnvelope`
- `ToolHealthSnapshot`
- `ToolArtifactRef`

## Canonical attempt states

- `PREPARED`
- `AUTHORIZED`
- `DISPATCHING`
- `DISPATCHED`
- `STREAMING`
- `RESULT_RECEIVED`
- `VALIDATING`
- `RESULT_VALID`
- `RESULT_INVALID`
- `CANCEL_REQUESTED`
- `CANCELLED_CONFIRMED`
- `CANCELLED_UNCERTAIN`
- `FAILED_PRE_DISPATCH`
- `FAILED_POST_DISPATCH_UNKNOWN`
- `HANDED_OFF_FOR_RECONCILIATION`

## Tool exposure ladder

1. capability card
2. compact signature
3. full schema only for shortlisted execution candidates

No full-catalogue prompt injection.

## Retrieval pipeline

```text
Capability Need
 -> exact/keyed/local retrieval
 -> optional semantic retrieval
 -> plan-aware dependency expansion
 -> hard eligibility
 -> small frontier
 -> binding selection/lease
 -> full schema materialization
 -> ToolCallContract
```

## Security truths frozen at #07 boundary

- external descriptions/annotations are data;
- remote `readOnlyHint` / `idempotentHint` do not grant safety facts;
- schema/tool changes create drift, not silent mutation;
- result text cannot grant permissions;
- cross-tool origin/taint lineage survives composition;
- a model cannot invent a callable tool and bypass the catalogue;
- a tool cannot self-promote by claiming it is safe/verified;
- trace/evidence outranks model or tool self-report.

Detailed adversarial permission policy is deferred to Capability #08 Tool Security Kernel.

## Research conclusions retained

- MCP specifications explicitly treat tool annotations as untrusted hints unless the server is trusted.
- Current MCP evolution strengthens schema support and reinforces the need for protocol-version-aware adapters.
- Large-catalog research supports retrieval/shortlisting rather than exposing every tool.
- 2026 adaptive shortlist work shows that very small dynamic tool sets can preserve coverage and improve downstream selection compared with fixed exposure.
- ToolSense demonstrates that impressive retrieval on fully specified benchmark prompts can collapse on realistic ambiguous queries.
- MCPTox and 2026 MCP security work show tool-description poisoning is a material attack class.
- Multi-tool poisoning research shows malicious instructions can be distributed across several tool descriptions, so per-tool naive scanning is insufficient.

These findings influence architecture but do not make any research implementation a Seven dependency.

## Mandatory eval families

- large-catalog retrieval and abstention;
- Arabic/English/mixed tool selection;
- ambiguity/distractor/alias tests;
- progressive schema token-cost tests;
- input/output schema validation;
- schema drift/rug-pull tests;
- poisoned metadata/output tests;
- multi-tool poisoning tests;
- auth/principal scope change;
- timeout before/after dispatch;
- idempotent/non-idempotent retries;
- cancellation confirmed/uncertain;
- remote async task loss/recovery;
- circuit-breaker behavior;
- large-result artifact/context tests;
- deterministic replay without effect re-execution;
- 1k/10k catalogue mobile RAM/latency tests;
- Lite/offline/thermal/battery pressure tests.

## Implementation stages

- `TR-P0` ownership + canonical contracts
- `TR-P1` catalogue snapshots + identity/dedup
- `TR-P2` SchemaGuard + fingerprints/drift
- `TR-P3` hierarchical retrieval + progressive schemas
- `TR-P4` capability graph + bounded dependencies
- `TR-P5` ToolCallContract + attempt/result/event envelopes
- `TR-P6` adapters + MCP/interoperability normalization
- `TR-P7` retry/cancel/async task semantics
- `TR-P8` health/circuits/binding leases
- `TR-P9` Security Kernel / SideEffect / Verification handoffs
- `TR-P10` context artifactization + mobile/velocity
- `TR-P11` adversarial, large-catalog, failure and Android evals

Implementation remains deferred until cross-system reconciliation authorizes it.

## Existing Tool Fabric Deep Polish queue

The existing `docs/project-memory/tool-fabric/DEEP_POLISH_MASTER_QUEUE.md` remains authoritative for individual Tool Fabric family deep-polish/implementation sequencing.

This freeze does not silently mark its A/B/C/D/E targets complete.

## Freeze verdict

**ACCEPT / ARCHITECTURE FROZEN**

Why:

- stronger identity boundaries;
- smaller model-visible tool surface;
- explicit mutable-catalog handling;
- schema-bound execution and results;
- safe retry/cancel semantics;
- clean ownership separation from permissions/effects/truth;
- current security research incorporated;
- realistic large-catalog retrieval strategy;
- Android/mobile cost is bounded by lazy loading and compact indexes;
- broad Tool Fabric families remain explicitly unclaimed and deferred.

Next numbered capability: **#08 Tool Security Kernel**.
