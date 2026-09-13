# Seven AI — Capability 07 Tool Runtime / Tool Fabric Ultimate Polish

Status: **Ultimate Polish complete / reconciled freeze candidate**

Final target: **Seven Tool Fabric 3.0 — Governed Capability Execution Mesh**

> This dossier freezes the **core Tool Runtime architecture**. It does **not** claim that every Tool Fabric 2.0 family, adapter, external provider, MCP server, Android bridge, or specialist tool is implemented or individually deep-polished.

## Prime law

A tool is not executable merely because it exists, is discovered, or is described by a model/server. Seven executes only a **canonical capability** through a **qualified binding** under an exact contract, schema/version, budget, authorization decision, and recovery/verification policy.

---

## 1. Ground truth

Seven already has meaningful Tool Fabric foundations rather than a blank slate.

Repository evidence includes:

- runtime smoke coverage for capability alias merging and schema/permission gating;
- capability normalization, aliases, schema/risk/permission gates in the implementation matrix;
- a broad Tool Fabric 2.0 inventory discovered through Waves 01–19;
- `DEEP_POLISH_MASTER_QUEUE.md`, whose prerequisite broad-discovery audit is already `SATURATED_FOR_BROAD_DISCOVERY`;
- a proposed MCP / ToolInteropGateway architecture;
- TaskContract capability constraints;
- SideEffectLedger primitives;
- ResourceGovernor tool-call/concurrency budgets;
- Context, Model and Adaptive Compute fabrics that now provide the adjacent boundaries Tool Runtime needs.

The implementation matrix still correctly marks Tool Fabric as **Partial**, especially for external adapters and effect recovery. Architecture freeze must not be reported as runtime completion.

### Existing strengths to preserve

1. Canonical capability direction instead of provider names as product logic.
2. Duplicate/alias merging.
3. Schema validation foundations.
4. Permission and risk gates.
5. Idempotency and side-effect uncertainty concepts.
6. Lazy/mobile-first Tool Fabric direction.
7. Capability graph and plan-aware dependency retrieval direction.
8. MCP as interoperability rather than authority.
9. Source lineage and verification-first philosophy.
10. Broad discovery already saturated enough that another generic library hunt has poor expected value.

### Main architectural weaknesses found

1. A logical capability and a concrete executable endpoint are not yet separated strongly enough everywhere.
2. Tool discovery, eligibility, retrieval, schema exposure and execution need one canonical lifecycle.
3. Large catalogues can still tempt implementations toward exposing too many schemas to the model.
4. Remote descriptions and annotations are an injection surface.
5. Tool names and server-local identities are not sufficient canonical identities.
6. Input validation alone is insufficient; output contracts, partial results and schema drift need equal treatment.
7. Transport success can be mistaken for task/effect success without strict state separation.
8. Retry logic must distinguish pre-dispatch failure from post-dispatch uncertainty.
9. Long-running/async tool tasks need explicit bindings without replacing Seven's Cognitive Runtime.
10. Tool health, account/principal scope, adapter version and schema revision need binding-scoped evidence.
11. Tool results can overwhelm context if large payloads are injected verbatim.
12. Learned tool retrieval can become another black box unless a deterministic champion remains.
13. A universal global capability graph can become too expensive and too authoritative if every discovered node is treated equally.
14. Cross-tool composition can launder permissions or untrusted instructions unless boundaries survive every hop.
15. External tool catalog changes can silently invalidate plans unless runs bind to a catalog snapshot/schema fingerprints.

---

## 2. Ownership boundary

### Tool Fabric owns

- canonical capability identity;
- capability contracts;
- tool/binding registration and discovery state;
- alias and duplicate normalization;
- capability-to-binding mapping;
- schema normalization, fingerprinting and validation;
- tool catalogue snapshots;
- plan-aware tool retrieval and progressive disclosure;
- dependency/capability graph metadata;
- binding qualification and health;
- dispatch, streaming and cancellation adapters;
- timeout and retry mechanics within approved policy;
- normalized execution/result envelopes;
- tool-call provenance;
- adapter/version drift detection;
- tool output artifactization;
- execution evidence handoff to verification and side-effect systems.

### Tool Fabric does not own

- task authority or orchestration: **Cognitive Runtime**;
- user permission authority: **Tool Security Kernel**;
- real-world effect truth and reconciliation: **Side-Effect Ledger**;
- factual truth of returned content: **Epistemic Fabric**;
- active prompt/context composition: **Context Fabric**;
- compute/tool-call budget authority: **Adaptive Compute + Resource Governor**;
- model choice: **Model Fabric**;
- final goal-completion verdict: **Verification / Judge**.

This boundary prevents Tool Runtime from becoming a second orchestrator, permission system, truth engine, or side-effect ledger.

---

## 3. Final architecture

```text
Task / Plan Node
  -> Capability Need
  -> Tool Catalog Snapshot
  -> Hierarchical Capability Retrieval
  -> Hard Binding Eligibility
  -> Small Candidate Frontier
  -> Binding Selection / Lease
  -> Full Schema Materialization
  -> ToolCallContract
  -> Tool Security Kernel authorization
  -> Budget reservation
  -> Pre-dispatch validation
  -> Dispatch / Stream / Cancel
  -> ToolResultEnvelope
  -> Output-schema / provenance validation
  -> SideEffect / Truth / Verification handoff
  -> ContextCapsule / Artifact reference
  -> Outcome evidence + health update
```

The model may propose a capability or arguments, but it never directly bypasses registry, schema, permission, budget, effect, or verification gates.

---

## 4. Canonical identity split

### 4.1 `CapabilitySpec`

Vendor-neutral logical operation, for example:

- `web.search`
- `files.read`
- `files.patch`
- `calendar.event.create`
- `code.structure.query`

Contains only stable product semantics and contract identity.

### 4.2 `ToolBinding`

A concrete executable implementation of one capability:

- local JS/native function;
- Android bridge;
- HTTP API;
- MCP tool;
- connector/plugin;
- host/desktop bridge;
- deterministic utility;
- specialized runtime.

A binding carries adapter identity, endpoint/server identity, principal/auth scope reference, schema revision, runtime constraints, health and qualification evidence.

### 4.3 `BindingRevision`

A binding's observed executable/schema revision. Mutable remote metadata must never silently rewrite the revision trusted by an active run.

### Frozen rule

**Capability identity != tool name != provider/server name != binding revision.**

One capability can have multiple bindings. One external tool can map to a canonical capability only through explicit normalization.

---

## 5. Canonical objects

The reconciled core uses these objects:

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

Security/permission and effect authority remain references to their owning fabrics rather than duplicated state.

---

## 6. Tool Catalog Snapshot

Every meaningful run or plan phase binds to a versioned catalogue view rather than an unbounded live mutable list.

A snapshot records:

- canonical capability ids;
- admitted bindings and revisions;
- schema fingerprints;
- qualification state;
- health epoch;
- principal/account scope where applicable;
- trust/quarantine state;
- catalogue generation/hash;
- creation/refresh time.

### Why

If a server changes a tool description/schema while an agent is running, Seven can detect drift rather than silently executing under a different contract.

Dynamic refresh is explicit. A refreshed catalogue creates a new snapshot/generation; it does not mutate history.

---

## 7. Discovery is not activation

Final lifecycle:

```text
DISCOVERED
 -> QUARANTINED
 -> NORMALIZED
 -> SCHEMA_VALIDATED
 -> SECURITY_CLASSIFIED
 -> EVAL_ELIGIBLE
 -> SHADOW
 -> CANARY
 -> APPROVED
 -> DEGRADED / QUARANTINED / RETIRED
```

A discovered external tool is never automatically made callable by an agent.

Remote metadata may inform analysis, but cannot self-assign permissions, effect class, idempotency, trust, verification policy or canonical capability.

---

## 8. Hierarchical tool retrieval

Seven must scale to large catalogues without dumping all schemas into the model context.

### Stage 0 — direct deterministic match

If task intent and capability identity are already exact and authorized, avoid semantic retrieval entirely.

### Stage 1 — cheap local candidate generation

Use compact indexes over:

- canonical id/name;
- aliases;
- capability family;
- lexical/BM25 terms;
- task tags;
- project/tool pins;
- recent proven bindings.

### Stage 2 — optional semantic retrieval

Embeddings/reranking are optional derived helpers, loaded lazily only when lexical/keyed retrieval is insufficient.

### Stage 3 — plan-aware dependency expansion

Expand only capabilities required by current plan nodes/dependencies. Do not preload the entire capability graph.

### Stage 4 — hard eligibility

Remove candidates that fail:

- capability requirement;
- permission/security preconditions;
- task scope;
- account/principal binding;
- qualification state;
- schema compatibility;
- online/offline state;
- resource/tool-call budget;
- binding health/circuit;
- known auth/rate state;
- side-effect policy prerequisites;
- platform availability.

### Stage 5 — small frontier

Present only a small useful candidate set to the model/selector.

Research in 2026 shows that adaptive shortlists can retain strong tool coverage while presenting far fewer tools, and shorter lists can improve downstream model selection. Seven therefore treats shortlist size as an eval-tuned budget, not a fixed magical number.

---

## 9. Progressive schema disclosure

Tools have three exposure levels:

### Level A — capability card

- canonical id;
- one-line purpose;
- effect/risk summary from Seven;
- required high-level inputs;
- availability.

### Level B — compact signature

Selected fields, argument names/types and constraints sufficient for ranking/planning.

### Level C — full executable schema

Only materialize the complete validated input/output schema for bindings that survive the shortlist and are candidates for dispatch.

This prevents schema tokens from growing linearly with the entire catalogue.

---

## 10. Deterministic champion selector

Seven keeps a cheap deterministic baseline for tool retrieval/selection.

It uses:

- exact capability matches;
- lexical/local indexes;
- plan dependency match;
- proven reliability;
- latency/resource cost;
- scope/platform fit;
- recent binding health.

A learned retriever/reranker may be added, but only after shadow/canary evals prove measurable improvement over this champion on realistic ambiguous queries, Arabic/English prompts, large catalogues and adversarial distractors.

ToolSense-style findings are especially relevant: strong retrieval on verbose benchmark prompts does not guarantee real tool understanding on ambiguous realistic prompts. Seven therefore evaluates realistic query ambiguity rather than only idealized tool descriptions.

---

## 11. SchemaGuard

Schemas are executable contracts, not documentation decoration.

### Input requirements

Before dispatch:

- validate root/object shape;
- required fields;
- types;
- enums/ranges/patterns where relevant;
- unknown-field policy;
- size limits;
- URI/path/domain constraints delegated to security policy where relevant;
- schema draft/version support;
- adapter-specific serialization rules.

### Output requirements

After result receipt:

- validate structured content against output schema when present;
- preserve explicit `PARTIAL`, `ERROR`, `UNKNOWN` finality;
- reject malformed structured output from authoritative state;
- retain raw payload hash/locator for diagnostics when policy permits;
- never treat prose saying "success" as proof of a real-world effect.

### Schema fingerprint

Bind calls to a normalized schema fingerprint containing at least:

- capability id;
- binding revision;
- input schema hash;
- output schema hash;
- validator version;
- normalization version.

Unexpected drift invalidates sensitive calls until re-qualified.

---

## 12. ToolCallContract

Every dispatch has an explicit contract.

Conceptual fields:

- `callId`
- `runId / planNodeId`
- `capabilityId`
- `bindingId / bindingRevision`
- `catalogSnapshotId`
- `schemaFingerprint`
- validated arguments hash/reference
- principal/scope reference
- authorization decision reference
- side-effect class reference
- idempotency policy reference
- budget reservation
- deadline/timeout
- cancellation contract
- result schema/finality expectations
- verification requirements
- lineage

No provider-specific raw call becomes canonical execution state by itself.

---

## 13. Execution state machine

Canonical attempt states:

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

`RESULT_VALID` means the result satisfies the tool contract. It **does not** mean the user's goal or real-world effect has been verified.

---

## 14. Dispatch certainty

Retries depend on where failure occurred.

### Pre-dispatch certainty

If Seven can prove the request was never dispatched, retry may be safe subject to policy/budget.

### Post-dispatch known result

Process normally through result/effect verification.

### Post-dispatch unknown

If a side-effecting request may have executed but confirmation was lost:

- no blind retry;
- mark the attempt uncertain;
- hand off to SideEffectLedger/reconciliation;
- use a read/status capability to verify state when safe;
- only retry if effect/idempotency policy explicitly proves safety.

This rule survives provider, MCP, connector, local and remote adapters.

---

## 15. Idempotency boundary

Tool Fabric records and enforces the execution mechanics of Seven's canonical idempotency policy:

- `SAFE_REPEAT`
- `KEYED_REPEAT`
- `DO_NOT_REPEAT`
- `UNKNOWN`

External claims such as MCP `idempotentHint` are evidence/hints only. They cannot lower Seven's idempotency risk classification on their own.

For `KEYED_REPEAT`, the stable downstream key path must be explicitly supported and bound into the call contract.

---

## 16. Cancellation

Cancellation is a structured protocol, not only an AbortController.

On cancellation:

1. stop new dependent planning/tool dispatch immediately;
2. propagate local abort signals;
3. request remote cancellation where supported;
4. preserve partial stream/result events;
5. distinguish confirmed cancellation from uncertain remote state;
6. reconcile potentially dispatched writes/effects when required;
7. release unused budget reservations;
8. never report a clean cancel when an effect may already have occurred.

---

## 17. Tool event streams

Streaming/long tools emit typed events rather than arbitrary text blobs.

Possible event classes:

- `STARTED`
- `PROGRESS`
- `PARTIAL_RESULT`
- `ARTIFACT`
- `REMOTE_TASK_HANDLE`
- `WARNING`
- `FINAL_RESULT`
- `ERROR`
- `CANCEL_ACK`

Partial output never silently upgrades to final output.

Large logs/results should be stored as artifacts with compact references/previews instead of continuously polluting model context.

---

## 18. Async/remote tasks

External async task handles are subordinate to Seven runs.

Store a binding between:

- Seven run/node/call id;
- binding/server identity;
- remote task id;
- last remote status;
- last result/evidence hash;
- cancellation capability;
- expiry/reconnect policy.

Remote `completed` is an observation. Seven still validates result/effect and success criteria.

---

## 19. Binding health and circuit breakers

Health is binding-scoped, not just capability/provider scoped.

Track where available:

- availability;
- latency distribution;
- transport errors;
- rate/auth errors;
- schema failure rate;
- malformed-result rate;
- cancellation reliability;
- timeout-after-dispatch uncertainty;
- result verification pass rate;
- local resource failures.

Circuit states:

- `CLOSED`
- `OPEN`
- `HALF_OPEN`

No continuous probing is required on mobile. Passive outcomes and selective probes are preferred.

---

## 20. ToolBindingLease

For long runs, Seven may temporarily prefer a qualified binding/revision to preserve:

- schema stability;
- auth/principal continuity;
- connection/cache affinity;
- reproducibility;
- consistent semantics.

Break a lease only for material reasons such as health failure, schema drift, revoked permission, budget/platform change, explicit user selection or security policy.

A lease never grants permission by itself.

---

## 21. Capability graph

The graph describes typed relationships such as:

- `requires`
- `produces`
- `verifies`
- `reconciles`
- `fallback-equivalent`
- `platform-bound`
- `auth-dependent`

Rules:

- graph edges are versioned metadata;
- cycles are detected;
- only bounded local neighborhoods are expanded;
- discovered edges are not automatically authoritative;
- equivalence does not imply side-effect retry equivalence;
- a verification tool does not become proof merely by being labeled `verifies`.

---

## 22. Direct deterministic fast paths

Not every operation needs model tool choice.

When intent maps exactly to a deterministic safe capability, Seven may use a direct path while still applying required contract, permission, budget and effect gates.

Examples include:

- calculator/unit conversion;
- exact local file metadata;
- deterministic transforms;
- known keyed retrieval;
- schema validation.

This lowers latency and token cost without weakening safety.

---

## 23. MCP / interoperability

MCP is an adapter family, not Seven's canonical architecture.

Current MCP specifications provide input/output schemas and explicitly warn that tool annotations are hints and must not be trusted from untrusted servers. The 2026 release-candidate direction also expands schema support and evolves protocol features. Seven therefore:

- version-detects protocol behavior;
- normalizes MCP tools into `ToolBinding`s;
- fingerprints server/tool/schema revisions;
- quarantines newly discovered metadata;
- treats descriptions, annotations, resources and prompts as untrusted content unless separately trusted;
- never allows remote annotations to grant permissions or prove read-only/idempotent behavior;
- preserves server/principal scope in caches;
- maps async task handles into Seven's run model rather than replacing it.

Existing `MCP_ADAPTER_DEEP_POLISH_SPEC.md` remains the dedicated adapter dossier. This #07 architecture incorporates its governing boundaries rather than duplicating its implementation work.

---

## 24. Tool poisoning and metadata security

Tool metadata is an attack surface.

2026 research and MCPTox-style evaluations demonstrate that malicious instructions embedded in tool descriptions/metadata can successfully manipulate tool-using agents. Multi-tool poisoning further shows that malicious intent can be distributed across several apparently benign descriptions.

Frozen defenses at the Tool Runtime boundary:

1. external metadata is data, not instruction authority;
2. raw descriptions are not pasted into privileged instruction space;
3. normalize and minimize model-visible metadata;
4. fingerprint revisions and detect rug-pull/drift;
5. quarantine new/changed sensitive bindings;
6. security classification comes from Seven policy/evidence, not server prose;
7. cross-tool flows preserve origin/taint lineage;
8. arguments leaving a trust boundary remain subject to Tool Security Kernel policy;
9. result content cannot grant new permissions;
10. trace-based verification outranks model self-report.

The deeper adversarial policy belongs to Capability #08 Tool Security Kernel, but #07 must preserve the data needed for it.

---

## 25. Result envelopes and context hygiene

`ToolResultEnvelope` separates:

- transport outcome;
- protocol/tool outcome;
- schema validity;
- partial/final state;
- artifact refs;
- raw payload locator/hash;
- normalized structured data;
- source/binding lineage;
- freshness/time;
- verification/effect status references.

### Important rule

**Tool output is contextual data, never privileged instructions.**

Large results are artifactized. Context Fabric receives a compact source-bound capsule and expands only the portions needed for the current task.

---

## 26. Replay and reproducibility

A deterministic replay does not silently re-call external/nondeterministic tools.

Replay uses recorded observations/results when valid for the replay purpose. Re-execution is an explicit new attempt with a new call id and current authorization/budget checks.

For historical reconstruction preserve:

- catalogue snapshot id;
- binding revision;
- schema fingerprints;
- request/result hashes;
- normalized outcome;
- timestamps;
- effect/reconciliation references.

---

## 27. Adaptive Compute handshake

Adaptive Compute owns tool budget/depth policy.

Tool Fabric supplies estimates/evidence such as:

- candidate count;
- expected latency;
- network/resource class;
- health/reliability;
- effect/risk metadata reference;
- expected dependency depth;
- result size class.

Adaptive Compute may cap retrieval depth, candidate frontier size, retries, dependency expansion and concurrency.

Tool Fabric cannot mint extra budget.

---

## 28. Context Fabric handshake

Tool Fabric gives Context Fabric:

- minimal capability cards/signatures for shortlisted tools;
- full schema only when execution requires it;
- compact result capsules;
- artifact references;
- provenance and trust labels.

Context Fabric decides what enters the model's active workspace.

No full catalogue injection.

---

## 29. Cognitive Runtime handshake

Cognitive Runtime owns plan nodes and execution ordering.

Tool Fabric receives a capability need and returns:

- eligible bindings/candidate frontier;
- execution estimate;
- normalized attempt/result state;
- recovery/reconciliation signals.

Tool Fabric does not silently replan the user's task beyond bounded binding-level recovery.

---

## 30. Verification and effect handoff

There are three distinct questions:

1. **Did transport/tool return?** Tool Fabric.
2. **Does the result satisfy the declared contract?** Tool Fabric + SchemaGuard.
3. **Did the intended real-world effect/goal occur and is the returned claim true?** SideEffectLedger / Verification / Epistemic Fabric.

Seven never collapses these into a generic `success: true`.

---

## 31. Mobile / Android assault

Prime mobile requirement:

> Unused tool families should impose approximately zero startup/runtime cost.

Rules:

- no global remote catalogue discovery on startup;
- lazy-load adapters and heavy validators;
- persist compact normalized catalogue/index metadata;
- keep full schemas/artifacts out of RAM until needed;
- bounded caches with principal/schema/version keys;
- optional embeddings loaded only when needed;
- no background polling of every tool endpoint;
- bounded concurrency/backpressure;
- large result streaming/artifactization;
- stdio/local-process integrations belong to host/native bridge territory, not direct WebView assumptions;
- native capabilities require explicit platform binding;
- Resource Governor may deny heavy tool paths under memory/thermal/battery pressure.

---

## 32. Velocity assault

### Hot path

```text
Need capability
 -> exact/local lookup
 -> tiny shortlist
 -> hard eligibility
 -> materialize one/few schemas
 -> validate
 -> dispatch
```

### Keep off hot path

- broad provider discovery;
- full catalogue embeddings/reindex;
- security rescans of unchanged trusted fingerprints;
- full-schema loading for irrelevant tools;
- benchmark suites;
- dependency graph materialization for unrelated capabilities;
- unused native/Wasmtime/browser/media runtimes;
- speculative remote probes.

### Track

- retrieval latency;
- top-k recall;
- candidate count shown to model;
- tool-schema tokens;
- schema materialization latency;
- authorization latency;
- dispatch/TTFR/final latency;
- cancellation latency;
- retry delay;
- context bytes/tokens from tools;
- catalogue RAM/storage;
- adapter cold-load time;
- circuit-breaker effectiveness;
- mobile CPU/battery/network impact.

---

## 33. Pass A — maximize

Pass A explored the strongest practical capability ceiling:

- dynamic capability graph;
- large-catalog retrieval;
- learned reranking;
- progressive schemas;
- adapter auto-discovery;
- tool composition;
- async task bindings;
- health-aware routing;
- execution leases;
- structured result streams;
- automatic recovery;
- local/remote binding parity;
- outcome learning.

Candidate A was powerful but risked becoming another complex autonomous planner and security boundary.

---

## 34. Pass B — destroy the winner

Pass B attacked Candidate A with these failures:

1. learned retrieval selecting a poisoned/distractor tool;
2. embedding index lag after schema/tool drift;
3. remote annotations laundering effect/idempotency claims;
4. duplicate tools across servers causing ambiguous execution;
5. huge catalogues bloating context/RAM;
6. full graph materialization costing more than the task;
7. tool descriptions becoming prompt injection;
8. an adapter returning schema-valid but false "success";
9. timeout after dispatch causing a duplicate side effect on retry;
10. async task `completed` being mistaken for verified completion;
11. partial streaming being mistaken for final data;
12. a tool changing schema during a long run;
13. switching bindings mid-run changing semantics/account scope;
14. cross-tool data flow laundering sensitive information;
15. provider fallback changing side-effect semantics;
16. child agents oversubscribing calls;
17. a model inventing a nonexistent capability/tool name;
18. result payloads consuming the entire Context Workspace;
19. Android startup loading thousands of schemas/adapters;
20. a learned selector beating benchmarks but failing ambiguous real prompts;
21. replay accidentally re-running external effects;
22. retries bypassing TaskContract/Adaptive Compute budgets.

### Pass B removals/corrections

- no raw external catalogue as model authority;
- no universal always-loaded graph;
- no learned selector without deterministic champion;
- no broad discovery on startup;
- no remote annotation as security fact;
- no generic "tool success" state;
- no automatic cross-binding retry after effect uncertainty;
- no full-result dump into context;
- no automatic execution merely because discovery found a tool;
- no MCP-specific object as Seven's canonical tool model;
- no assumption that more tools shown to the model is better.

---

## 35. Reconciled final design

The winner is a **capability-normalized, snapshot-bound, progressively disclosed, contract-validated execution mesh**.

Its intelligence comes from:

- selecting less, better;
- preserving exact contracts;
- separating capability from binding;
- validating both arguments and results;
- using explicit dispatch certainty;
- treating external metadata as untrusted;
- keeping effects/permissions/truth in their owning fabrics;
- recording enough lineage to reconstruct what actually happened;
- remaining cheap when unused.

---

## 36. Mandatory eval families

### Retrieval / selection

- 10 / 100 / 1,000 / 10,000+ catalogue simulations;
- exact query;
- underspecified/ambiguous query;
- Arabic / English / mixed language;
- similar-name distractors;
- duplicate/alias tools;
- correct tool below top-5;
- no applicable tool / abstention;
- plan-aware dependency retrieval;
- deterministic champion vs learned reranker.

Metrics:

- Recall@k;
- MRR/NDCG where useful;
- correct final tool selection;
- average tools exposed;
- schema tokens;
- latency/RAM.

### Schema / contract

- malformed arguments;
- unknown fields;
- nested/conditional schemas;
- oversized fields;
- output schema mismatch;
- missing output schema;
- schema drift mid-run;
- validator-version migration;
- structured + unstructured mixed results.

### Security boundary

- poisoned description;
- poisoned parameter descriptions/examples/defaults;
- multi-tool poisoning;
- Unicode/invisible metadata variants;
- malicious output instructions;
- fake read-only/idempotent annotations;
- principal/account swap;
- cross-tool data laundering;
- tool squatting/name collision;
- rug-pull after initial approval.

### Failure / recovery

- auth failure;
- rate limit;
- network timeout pre-dispatch;
- timeout post-dispatch;
- provider 5xx;
- remote task lost;
- malformed partial stream;
- cancellation confirmed/uncertain;
- circuit open/half-open recovery;
- binding disappears;
- fallback/equivalence mismatch.

### Side effects

- safe read retry;
- keyed idempotent write;
- non-idempotent write;
- uncertain dispatch;
- reconciliation proves effect happened;
- reconciliation proves effect absent;
- no duplicate effect under retry pressure.

### Context / large results

- huge JSON;
- logs/files/artifacts;
- partial result expansion;
- context capsule reconstruction;
- repeated outputs/dedup;
- result instructions cannot become privileged instructions.

### Mobile / performance

- no-tool startup baseline;
- 1k/10k compact catalogue storage;
- Lite/Balanced/Full;
- low RAM;
- thermal/battery pressure;
- offline;
- lazy adapter load;
- optional embeddings absent;
- cancellation latency;
- no background discovery/probing.

---

## 37. Proof-of-improvement contract

The new architecture must beat the old/naive baseline on a Pareto set, not one vanity metric.

Compare at minimum:

- task/tool success;
- correct tool selection;
- invalid-call rate;
- side-effect duplicate rate;
- schema-drift safety;
- poisoning resistance;
- tool-schema context tokens;
- retrieval/dispatch latency;
- cancellation/recovery correctness;
- RAM/battery/network overhead.

No candidate may be accepted merely because it retrieves more tools if it increases unsafe execution, context bloat, latency, or false positives.

---

## 38. Implementation stages

### TR-P0 — ownership + canonical contracts

- `CapabilitySpec`
- `ToolBinding`
- `BindingRevision`
- compatibility adapter from current registry

### TR-P1 — catalogue snapshots + identity

- canonical ids
- aliases/dedup
- revision/schema fingerprints
- compact persistent catalogue

### TR-P2 — SchemaGuard

- input/output validation
- normalized schema fingerprint
- drift state
- validator versioning

### TR-P3 — hierarchical retrieval

- exact/lexical indexes
- small frontier
- progressive schema disclosure
- deterministic champion

### TR-P4 — capability graph

- typed edges
- bounded dependency expansion
- cycle/equivalence controls

### TR-P5 — execution contracts

- ToolCallContract
- attempt state machine
- event/result envelopes
- artifact refs

### TR-P6 — adapters + interoperability

- local/browser/native/HTTP adapter contract
- MCP gateway integration
- provider error normalization

### TR-P7 — retry/cancel/async

- dispatch certainty
- bounded retry
- cancellation states
- remote task binding

### TR-P8 — health + leases

- binding health
- circuit breakers
- ToolBindingLease
- drift invalidation

### TR-P9 — security/effect handoffs

- Tool Security Kernel interface
- SideEffectLedger interface
- verification/truth handoff
- taint/origin preservation

### TR-P10 — context/mobile/velocity

- artifactization
- compact capsules
- lazy loading
- large catalogue stress
- ResourceGovernor integration

### TR-P11 — adversarial + long-run evals

- retrieval benchmarks
- ToolSense-like ambiguity tests
- MCP poisoning suites
- failure injection
- Android resource evidence
- replay/recovery tests

Implementation remains deferred until cross-system reconciliation authorizes code changes.

---

## 39. Research sweep

Research and standards reviewed for this polish include:

- MCP tool/schema specifications and the 2026 release-candidate direction;
- MCP guidance that tool annotations are untrusted hints unless server trust is established;
- large-catalog tool retrieval work such as ScaleMCP;
- 2026 adaptive shortlist research showing that fewer dynamically chosen tools can outperform larger fixed exposure for downstream selection;
- ToolSense, which reports strong degradation when tool retrieval is tested with realistic ambiguity rather than fully specified benchmark prompts;
- MCPTox and 2026 MCP threat-modeling work on tool poisoning;
- 2026 multi-tool poisoning work demonstrating that malicious instructions can be distributed across several tool descriptions;
- long-horizon large-tool planning benchmarks such as PlanBench-XL.

Architecture conclusions are deliberately provider/library independent. Research systems are evidence for design choices, not product dependencies.

---

## 40. Rejected alternatives

### Expose all tools directly to the model

Rejected: context cost, distractors, injection surface and poor scalability.

### External tool description as canonical semantics

Rejected: mutable and untrusted.

### One model call to choose among thousands of tools

Rejected: context and reliability bottleneck.

### Embedding-only retrieval

Rejected: specialized semantics and ambiguous queries can fail; deterministic/lexical paths remain mandatory.

### Learned retriever as sole authority

Rejected: drift, poisoning and benchmark overfit. Deterministic champion remains.

### MCP as Seven's internal Tool Fabric

Rejected: MCP is interoperability; Seven needs stronger identity, authority, lineage, side-effect and recovery semantics.

### Retry every failed tool call

Rejected: duplicate side effects and post-dispatch uncertainty.

### Tool response `success=true` equals verified success

Rejected: transport/tool assertion is not real-world or task verification.

### Always-on tool discovery/health probing

Rejected: battery/network/startup cost.

### Full capability graph always in RAM/context

Rejected: unnecessary global cost; use compact indexes and bounded expansion.

---

## 41. Freeze criteria

Architecture may freeze only if all are explicit:

- capability/binding identity split;
- catalogue snapshot/versioning;
- progressive tool retrieval/disclosure;
- hard eligibility before model selection;
- deterministic champion retrieval path;
- exact schema fingerprints and drift policy;
- input and output validation;
- dispatch certainty and safe retry rules;
- explicit cancellation uncertainty;
- async task subordination to Seven run state;
- result/effect/truth state separation;
- Tool Security Kernel and SideEffectLedger boundaries;
- tool output remains data, not instruction authority;
- large-result artifactization;
- no unused-tool startup burden;
- broad catalogue and poisoning eval families;
- implementation truth remains explicitly partial.

These conditions are satisfied at the architecture level.

**Freeze candidate: ACCEPT.**
