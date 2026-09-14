# Seven AI - Capability 05 Model Fabric Ultimate Polish

Status: **Ultimate Polish complete / reconciled freeze candidate**

Final target: **Seven Model Fabric 3.0 - Evidence-Governed Adaptive Inference Mesh**

## Prime law

Models are replaceable compute workers. They are not Seven's identity, truth source, permission source, or architecture. Selection is allowed only after capability, access, policy, health and resource eligibility are established.

## 1. Ground truth

Seven already has real Model Fabric foundations:

- `evolution/model-registry.cjs`: model records, capability flags, context metadata, free-proof metadata and lineage.
- `evolution/free-proof.cjs`: evidence-bearing free qualification with official-source checks.
- `evolution/health-monitor.cjs`: quality/reliability/performance health gates.
- `evolution/model-evals.cjs`: candidate evaluation.
- `evolution/model-promotion.cjs`: promotion binding and activation/retirement.
- shadow/canary/promotion foundations in Evolution.
- the application has a `requestAI()` boundary, verified-free candidate routing and provider fallback.
- `SEVEN_IMPLEMENTATION_MATRIX.md` correctly marks Model Fabric as partial.

The current base is strong but still mixes facts that must be orthogonal: model identity, provider, deployment, access/free state, quota, health, quality and qualification.

### Main weaknesses found

1. Capability support is mostly boolean rather than evidence-bearing.
2. Static seed values such as `quality`, task scores and speed can look more authoritative than their evidence.
3. One named model can behave differently across providers, quantizations and serving stacks.
4. Model aliases can drift while old evals remain attached.
5. Free availability can change independently of model quality.
6. A provider-level health average can hide endpoint-specific problems.
7. A universal scalar ranking can hide major weaknesses in Arabic, tools, JSON, vision or long context.
8. Fallback after partial streaming cannot be handled like pre-output failure.
9. Local inference has no monetary fee but still has RAM, storage, battery and thermal cost.

## 2. Ownership boundary

Model Fabric owns:

- model/family/revision/deployment identity
- provider adapters
- capability proofs
- access and price evidence
- quota observations
- endpoint health
- model and endpoint performance profiles
- routing, fallback and escalation selection
- route leases and cache affinity
- local-inference eligibility metadata
- discovery, drift, quarantine and retirement
- inference attempts and routing outcomes
- learned router promotion

Model Fabric does not own:

- task authority: Cognitive Runtime
- context construction: Context Fabric
- factual verdicts: Epistemic Fabric
- memory authority: Memory Fabric
- tool permissions/effects: Tool Fabric
- verification truth: Verification/Judge
- global device policy: Resource Governor

## 3. Canonical identity split

### ModelFamily
Stable family metadata only.

### ModelRevision
The exact revision Seven believes it is calling, with revision evidence and tokenizer identity. Aliases such as `latest` are stored as aliases, not immutable revisions. If exact revision cannot be resolved, state is explicit.

### DeploymentEndpoint
A concrete serving route:

- provider
- model revision
- endpoint/region when available
- quantization/serving variant when available
- adapter version
- parameter support
- context override
- tool/JSON/stream semantics
- privacy metadata reference

Two deployments of the same named model are not automatically behaviorally identical.

## 4. Proof planes

### CapabilityClaim
What a provider/model says it supports.

### CapabilityProof
Evidence that a capability works to Seven's required standard. Bind it to model revision, deployment when relevant, eval identity, adapter version, observation time and sample count.

A model may declare tool calling yet remain unqualified for an autonomous tool-heavy run until tool reliability is proven.

### AccessProfile
Access modes are separate from model identity:

- `LOCAL_OWNED`
- `PROVIDER_FREE_TIER`
- `HOSTED_ZERO_PRICE`
- `USER_BYOK`
- future explicit opt-in paid mode, never silently enabled

Seven's intended default remains `STRICT_FREE`.

### PricingProof
Versioned evidence for a concrete route:

- official/source references
- observed time
- freshness/TTL
- price fields
- free-tier conditions
- possible overage
- proof state: `VERIFIED`, `STALE`, `UNKNOWN`, `CONFLICT`

A key, old catalog entry, community claim or provider-wide free plan is not enough to prove a concrete route is currently zero-cost.

### LicenseProof
Licensing remains separate from pricing and deployment mode.

### PrivacyProfile
Provider/deployment data-use and retention constraints are routing inputs, never instructions.

## 5. Quota and health

### QuotaState

- `KNOWN_AVAILABLE`
- `SOFT_AVAILABLE`
- `NEAR_LIMIT`
- `RATE_LIMITED`
- `EXHAUSTED`
- `UNKNOWN`

`UNKNOWN` never means unlimited.

Track quota by provider/model/credential scope when possible, using response headers and local estimates. Use bounded reservations so parallel runs do not all assume the same remaining capacity.

### HealthSnapshot
Health is deployment-scoped and multi-dimensional:

- availability
- transport errors
- throttling
- TTFT
- TPOT
- throughput
- total latency
- schema/tool reliability
- cancellation behavior
- local OOM/thermal signals

Use rolling/recent weighting and circuit states:

- `CLOSED`
- `OPEN`
- `HALF_OPEN`

Do not require continuous background probing on mobile.

## 6. EvaluationProfile

There is no canonical universal `quality = 92` truth.

Profiles are conditional on:

- model revision
- deployment where needed
- task cluster
- language
- modality
- tool requirements
- context regime
- benchmark version
- date

Important dimensions include general chat, Arabic, coding, reasoning, research, tool selection, tool arguments, JSON/schema, long context, vision, RPG dialogue, latency and efficiency.

Static seed scores are **priors only** until supported by current eval evidence.

## 7. Orthogonal runtime states

Do not overload one `status` field.

Catalog state:
- DISCOVERED
- RESOLVED
- RETIRED

Access state:
- VERIFIED
- STALE
- UNKNOWN
- BLOCKED

Qualification state:
- UNTESTED
- SHADOW_ELIGIBLE
- CANARY
- APPROVED
- QUARANTINED

Runtime health:
- HEALTHY
- DEGRADED
- OPEN
- HALF_OPEN
- UNKNOWN

This allows an approved model to be temporarily rate-limited without corrupting its identity or qualification history.

## 8. RouteContract

Created from TaskContract plus current policy and resource signals.

It carries hard requirements such as:

- modality
- context/output capacity
- tools/JSON/schema support
- reasoning controls
- vision
- privacy mode
- cost mode
- online/offline state
- latency class
- minimum qualification
- local resource constraints

## 9. Final routing pipeline

```text
TaskContract + ContextEnvelope + ToolNeeds + Policy + Device Signals
 -> InferenceRequirement
 -> Hard Eligibility Gateway
 -> Curated Candidate Frontier
 -> Route Predictor
 -> Route Lease
 -> Context compile for target model
 -> Endpoint Selection
 -> Dispatch / Stream / Cancel
 -> Validate / Verify
 -> Accept | Escalate | Fallback
 -> Outcome Ledger
 -> bounded router learning
```

## 10. Hard Eligibility Gateway

A route is removed before ranking when it fails a required condition:

- current access/price proof
- privacy policy
- credentials/configuration
- qualification state
- modality
- context fit including output reserve
- tools/JSON/schema semantics
- required parameters
- local device feasibility
- license requirement
- health circuit
- known exhausted quota
- Seven policy requirements

**Frozen rule:** a learned router may rank only eligible routes. It can never restore an ineligible one.

## 11. Curated Candidate Frontier

Do not send every discovered model into the router.

First reduce candidates by capability, qualification, access, health and resource feasibility, then remove dominated candidates and retain a small Pareto frontier.

This follows the 2026 LLMRouterBench result that larger ensembles show diminishing returns and that careful model curation matters.

## 12. Router hierarchy

### Tier 0: deterministic obvious routes
Examples: user pins an eligible model, offline requires local, or only one qualified route supports the required modality.

### Tier 1: deterministic champion
A lightweight local baseline considers task class, language/modality, proven profile, latency, quota pressure, cache affinity and switch cost.

This is always available and is the rollback target.

### Tier 2: learned local ranking
Optional compact learned ranking may use verified outcome history, lightweight task features and local embeddings/classifiers. It must not require another expensive LLM call just to choose an LLM.

### Tier 3: bounded contextual-bandit adaptation
Allowed only after shadow/canary qualification. Exploration stays bounded and only among already eligible routes. The deterministic champion remains the safe fallback.

Because LLMRouterBench shows complex routers often fail to beat simple baselines reliably, learned routing must prove improvement before promotion.

## 13. No universal model score

Final order:

1. hard constraints
2. Pareto filtering
3. task-specific objective policy
4. learned/tie-break ranking

Possible objective dimensions:

- predicted task success
- tool/schema reliability
- latency
- throughput
- quota pressure
- cache affinity
- route-switch cost
- local battery/RAM/thermal cost
- privacy preference

Coding, RPG and lightweight chat should not use identical objective policies.

## 14. Model routing != endpoint routing

Model routing chooses the revision/capability tier.

Endpoint routing chooses where that model runs based on health, quota, performance, privacy, compatibility, cache affinity and access proof.

Where practical, Seven should try a qualified alternate endpoint of the same model before changing models.

## 15. Route leases

Long agent runs should not thrash between models/providers each turn.

A `RouteLease` temporarily pins model revision, deployment/provider affinity and inference profile.

Benefits:

- prompt-cache reuse
- fewer context recompiles
- more stable tool semantics
- lower latency
- better continuity

Break the lease only for material reasons such as health, quota, capability change, explicit user choice, privacy change or verified quality failure.

## 16. Context Fabric handshake

Model Fabric does not compile prompts.

1. Context Fabric exposes a light ContextEnvelope estimate.
2. Model Fabric chooses a tentative eligible target.
3. Context Fabric compiles for that tokenizer/context window.
4. If the target cannot fit, remove it and select from remaining candidates.
5. Recompile on fallback only when target semantics require it.

Do not compile full context for every candidate.

## 17. Provider-neutral InferenceProfile

Normalize:

- output budget
- temperature/sampling semantics
- reasoning effort
- structured output
- tools/tool choice
- streaming
- multimodal input
- cancellation

Adapters map to provider APIs. A correctness-critical parameter is never silently dropped.

## 18. Failure taxonomy

Normalize at least:

- `AUTH_FAILED`
- `ACCESS_BLOCKED`
- `PRICE_PROOF_STALE`
- `QUOTA_EXHAUSTED`
- `RATE_LIMITED`
- `NETWORK_FAILURE`
- `TIMEOUT`
- `PROVIDER_5XX`
- `MODEL_UNAVAILABLE`
- `UNSUPPORTED_PARAMETER`
- `CONTEXT_OVERFLOW`
- `INVALID_SCHEMA`
- `TOOL_PROTOCOL_FAILURE`
- `POLICY_BLOCK`
- `PARTIAL_STREAM_FAILURE`
- `CANCELLED`
- `LOCAL_OOM`
- `LOCAL_THERMAL_LIMIT`
- `UNKNOWN_PROVIDER_FAILURE`

Different classes trigger different recovery. For example, 429 respects reset hints, context overflow returns to Context Fabric, and partial streamed output forbids blind replay.

## 19. Bounded fallback ladder

Preferred sequence when semantics allow:

1. safe retry of same deployment for a transient pre-output failure
2. same model revision on another qualified endpoint
3. equivalent qualified model
4. stronger qualified model when verification justifies escalation
5. qualified local fallback
6. reduced-capability path if TaskContract permits
7. explicit `BLOCKED`, `INCONCLUSIVE` or `NO_ELIGIBLE_MODEL`

Every attempt consumes a retry budget. No infinite loop.

Fallback never changes Seven's policy boundary or permissions.

## 20. Escalation != fallback

Fallback handles route failure. Escalation handles insufficient verified quality.

Escalation signals can include deterministic failure, invalid schema, unresolved verification, unmet success criteria or calibrated quality signals. Model self-confidence alone is insufficient.

Cheap/fast first and stronger only for hard cases is allowed when evaluation proves it helps.

## 21. Multi-model use

Default is one selected route.

Critic/ensemble calls are selective and must justify extra quota, latency, context duplication and network/device cost. Multiple model outputs do not increase factual authority by consensus.

## 22. Strict-free resilience

Seven may be unlimited-by-design at the app layer, but external quotas remain real.

Rules:

- no Seven daily message ceiling by architecture
- no silent paid route
- stale/unknown pricing proof fails closed for STRICT_FREE
- quota exhaustion triggers qualified fallback or an explicit unavailable state
- no account-limit circumvention
- API key presence does not prove free use

## 23. Local inference

Local inference is a first-class deployment with:

- exact model/GGUF identity
- quantization
- file size
- RAM estimate
- context/RAM scaling
- capability proofs
- device benchmark profile
- thermal/battery profile
- license proof

Mobile rules:

- heavy model files are not bundled into the base APK by default
- lazy download/import
- inspect metadata before load
- memory feasibility check
- conservative context sizing
- no UI-thread inference
- cancellation support
- unload when no longer useful
- no continuous background inference
- Resource Governor may deny/downgrade a local route

`llama.cpp` is a strong Android backend candidate, not Seven's architecture.

## 24. Discovery, qualification and drift

```text
Discover
 -> Normalize
 -> Resolve family/revision/deployment
 -> Verify access/pricing/license/privacy
 -> Capability compatibility/eval
 -> Shadow
 -> Canary
 -> APPROVED
 -> runtime health
 -> drift detection
 -> quarantine / re-eval / retire
```

Discovery never equals activation.

Drift can invalidate only the affected proof when possible: alias, price, quota, privacy, capability, endpoint, quality or health.

## 25. Router learning security

- provider/model text cannot self-promote
- only validated outcome events become high-trust routing labels
- repeated copies do not amplify evidence
- one lucky run does not dominate
- router policy and training lineage are versioned
- sensitive raw prompts need not be stored for routing learning
- local/privacy-preserving task features are preferred

## 26. Velocity assault

Do not put these on the normal hot path:

- provider catalog discovery
- live benchmark suites
- every-provider probes
- proof-document refresh for all routes
- heavy prompt embeddings
- ensemble inference
- full context compilation for every candidate
- unused local-model loading

Ordinary routing should mostly use fresh cached metadata, local task classification, a small candidate frontier and a cheap router.

Track route decision latency, target compile latency, TTFT, TPOT, total latency, fallback delay, switch rate, cache hits, quota efficiency, local load time and cancellation latency.

## 27. Pass A

Pass A maximized intelligence with dynamic identity, capability proofs, learned routing, contextual bandits, cascades, local fallback, discovery and outcome learning.

Risk: it could become an always-on optimizer with too much complexity on the critical path.

## 28. Pass B

Pass B attacked:

- learned router worse than simple baseline
- huge model pool creating noise
- free price changing
- alias drift
- same model differing by provider
- poor tool reliability despite declared support
- router learning from fluent wrong answers
- outage storms
- concurrent quota races
- partial-stream failure
- provider switching destroying cache affinity
- context incompatible with fallback model
- local OOM/thermal pressure
- universal score hiding specialization weaknesses
- discovery slowing startup
- overfitting one benchmark

Pass B rejected as mandatory:

- always-on bandit routing
- mandatory multi-model calls
- giant candidate pools
- universal quality scalar
- continuous provider polling
- every-request discovery
- expensive LLM-as-router dependency
- blind partial-stream retry
- automatic model activation
- treating open weights as equivalent to free inference

## 29. Reconciliation

Surviving final design:

- family/revision/deployment split
- orthogonal access/qualification/health
- evidence-bearing capabilities
- strict-free proof freshness
- endpoint health/circuit breakers
- quota state/reservations
- curated Pareto frontier
- deterministic champion router
- optional learned ranking
- bounded bandit evolution only after proof
- model routing separated from endpoint routing
- route leases/cache affinity
- explicit failure/fallback taxonomy
- verification-driven escalation
- governed local inference
- discovery -> eval -> shadow -> canary -> approve
- outcome learning from verified evidence
- no universal model-quality truth

## 30. Research sweep

### LLMRouterBench 2026
Large-scale routing benchmark over many datasets/models. Key lesson: model complementarity is real, but many complex routers do not consistently beat simple baselines; larger ensembles show diminishing returns and model curation matters.

https://arxiv.org/abs/2601.07206

### RouteLLM
Preference-data routing demonstrates that strong/weak model routing can reduce resource cost while preserving quality.

https://arxiv.org/abs/2406.18665

### Online contextual-bandit routing
Supports adaptive routing under evolving conversation context and budgets. Seven uses this only as a bounded, qualified optimization layer.

https://arxiv.org/abs/2506.17670

### Cascaded routing
Recent work supports route-first, then escalate low-quality/uncertain cases.

https://arxiv.org/abs/2606.27457
https://arxiv.org/abs/2605.18796

### OpenRouter serving lessons
Useful reference for same-model provider failover, parameter compatibility, performance-aware endpoint sorting and sticky routing for prompt caches.

https://openrouter.ai/docs/guides/routing/provider-selection
https://openrouter.ai/docs/guides/best-practices/prompt-caching

### LiteLLM
Useful reference for provider adapter normalization and retry/fallback infrastructure.

https://docs.litellm.ai/

### llama.cpp Android
Useful evidence that GGUF local inference on Android is viable but context size can materially affect memory usage.

https://github.com/ggml-org/llama.cpp/blob/master/docs/android.md

## 31. Mandatory eval families

- exact revision / alias drift
- access/free proof freshness and conflicts
- quota unknown/near/exhausted/reset
- provider/model/deployment identity
- Arabic/general/coding/reasoning/research/vision
- tool selection and arguments
- JSON/schema reliability
- long-context behavior
- route accuracy and regret vs oracle where available
- deterministic vs learned router
- under/over escalation
- provider/model switch rate
- 401/403/429/5xx/network/timeout
- context overflow
- partial stream failure
- cancellation
- same-model failover
- alternate-model fallback
- no duplicate visible output
- all-routes-exhausted state
- router-learning poisoning
- privacy mismatch
- credential isolation
- local model corruption/OOM/thermal/battery/offline
- route latency, TTFT, TPOT, RAM, CPU, battery and network
- long-run model/price/quota/privacy/quality drift

## 32. Implementation stages

- `MDL-P0`: family/revision/deployment identity compatibility bridge
- `MDL-P1`: provider adapter contract
- `MDL-P2`: access/pricing/license/privacy/quota proofs
- `MDL-P3`: endpoint health + circuit breaker
- `MDL-P4`: evidence-bearing capability qualification
- `MDL-P5`: RouteContract + hard eligibility + curated frontier + deterministic champion
- `MDL-P6`: learned router shadow/canary + bounded online adaptation
- `MDL-P7`: RouteLease + Context Fabric handshake + cache affinity
- `MDL-P8`: normalized failures + fallback + escalation + partial-stream correctness
- `MDL-P9`: local inference / Resource Governor integration
- `MDL-P10`: discovery, drift, quarantine and retirement
- `MDL-P11`: live provider, adversarial, long-run and Android gates

Implementation remains deferred until cross-system reconciliation.

## 33. Frozen laws

1. Models are replaceable workers, not Seven's authority.
2. Model revision and deployment identity are distinct.
3. Aliases are not immutable revisions.
4. Hard eligibility precedes learned ranking.
5. A learned router cannot restore an ineligible route.
6. Free eligibility requires fresh evidence.
7. Seven never silently routes from free to paid.
8. `UNKNOWN` quota is not unlimited.
9. Open weights, licensing, local feasibility and zero price are separate facts.
10. Declared capability is not reliability proof.
11. No universal canonical quality score.
12. Static scores are priors only.
13. Model routing and endpoint routing are separate.
14. Same-model endpoint fallback is preferred when semantics permit.
15. Route switching has real cache/context/continuity cost.
16. Context Fabric owns model-targeted context compilation.
17. Learned routing must beat a deterministic champion before promotion.
18. Router learning uses verified outcomes, not model self-confidence.
19. Online exploration is bounded.
20. Fallback and quality escalation are different operations.
21. Partial streams forbid blind replay.
22. Tool permissions remain outside Model Fabric.
23. Multi-model agreement does not increase truth authority.
24. Discovery never equals activation.
25. Local routes are governed by RAM, battery and thermal evidence.
26. Heavy discovery/probing/ensembles are not mandatory hot-path work.
27. `NO_ELIGIBLE_MODEL`, `BLOCKED` and `INCONCLUSIVE` are valid outcomes.

## Freeze conclusion

Capability 05 is **architecture-frozen for the Ultimate Polish campaign**, not implementation-complete.

Final target:

> **Seven Model Fabric 3.0 - Evidence-Governed Adaptive Inference Mesh**

The final question is no longer “which model has the highest score?” It is:

> Which proven model revision, on which proven deployment, under current access/health/quota/privacy/resource conditions, is the strongest eligible worker for this exact task, and what verified recovery path exists if that route fails?
