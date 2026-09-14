# Seven AI — Capability 05 Model Fabric Freeze Record

Status: **ARCHITECTURE FROZEN FOR ULTIMATE POLISH CAMPAIGN**  
Implementation status: **Deferred / partial foundation remains**

## Frozen target

**Seven Model Fabric 3.0 — Evidence-Governed Adaptive Inference Mesh**

## Prime law

> Models are replaceable compute workers. They do not own Seven's identity, truth, permissions, memory authority, verification result, or product architecture.

## Final reconciled architecture

The Model Fabric is frozen around these principles:

1. Separate **ModelFamily**, exact **ModelRevision**, and concrete **DeploymentEndpoint**.
2. Treat mutable aliases as aliases, not immutable model revisions.
3. Separate capability declaration from evidence-bearing capability qualification.
4. Separate access, pricing, licensing, privacy, quota, health, qualification, and performance instead of collapsing them into one model status.
5. Use fresh, scoped evidence for STRICT_FREE eligibility; stale or ambiguous price proof fails closed.
6. Treat `UNKNOWN` quota as unknown, never unlimited.
7. Run **Hard Eligibility Gateway** before any learned ranking.
8. Reduce eligible routes to a small curated/Pareto frontier before ranking.
9. Keep a deterministic champion router as the permanent baseline and rollback target.
10. Allow learned routing only when it proves measurable improvement over that champion.
11. Keep contextual-bandit exploration bounded and only among already eligible routes.
12. Separate **model routing** from **endpoint routing**.
13. Prefer same-model qualified endpoint failover when it preserves semantics and continuity.
14. Use **RouteLease** to reduce model/provider thrashing and preserve prompt-cache/context affinity during longer runs.
15. Let Context Fabric compile context for the selected target model/tokenizer; Model Fabric does not become a second context compiler.
16. Normalize provider-specific request parameters through a provider-neutral InferenceProfile and never silently discard correctness-critical semantics.
17. Normalize provider failures into explicit error classes before recovery.
18. Keep retry/fallback bounded and explicit.
19. Distinguish route failure **fallback** from verified-quality **escalation**.
20. Treat static model quality/task numbers as priors only, not canonical truth.
21. Use verified outcomes for routing learning; model self-confidence is not a trusted reward signal.
22. Keep multi-model/critic/ensemble calls selective rather than default.
23. Make local inference a governed first-class deployment with RAM, storage, battery, thermal, context, capability and license evidence.
24. Discovery never implies qualification or activation.
25. Drift in price, quota, model alias, endpoint, privacy, capability or quality invalidates only the affected proofs when possible.
26. Keep provider discovery, probes, benchmarking, ensembles and heavy routing intelligence off the ordinary hot path.
27. Preserve explicit terminal outcomes including `NO_ELIGIBLE_MODEL`, `BLOCKED`, and `INCONCLUSIVE`.

## Final routing shape

```text
TaskContract + ContextEnvelope + ToolNeeds + Policy + Device Signals
 -> InferenceRequirement
 -> Hard Eligibility Gateway
 -> Curated Candidate Frontier
 -> Deterministic/Learned Route Predictor
 -> Route Lease
 -> Target-model Context Compile
 -> Endpoint Selection
 -> Dispatch / Stream / Cancel
 -> Validate / Verify
 -> Accept | Escalate | Fallback
 -> Outcome Ledger
 -> Bounded Router Learning
```

## Frozen failure/fallback contract

Core normalized failures include authentication/access, stale free proof, quota exhaustion, throttling, network/timeout/provider errors, unavailable models, unsupported parameters, context overflow, schema/tool-protocol failure, policy block, partial stream failure, cancellation, local OOM, and local thermal limits.

Preferred bounded recovery order when semantics permit:

1. safe retry for transient pre-output failure
2. same model revision through another qualified endpoint
3. equivalent qualified model
4. stronger qualified model only when quality verification justifies escalation
5. qualified local fallback
6. reduced-capability path if TaskContract permits it
7. explicit terminal unavailable/blocked/inconclusive state

Partial user-visible streams must not be blindly replayed as if no output occurred.

## Strict-free freeze

Seven remains **unlimited-by-design at the application layer**, not falsely unlimited at external providers.

- no Seven-imposed daily message ceiling is required by this architecture
- external quotas and availability remain real
- no silent free-to-paid transition
- API key presence does not prove free use
- stale/unknown free-price evidence fails closed under STRICT_FREE
- no account rotation or other provider-limit circumvention

## Mobile freeze

Local inference remains optional, lazy and Resource-Governor controlled.

Heavy local model files are not required in the base APK. Local routes must prove device feasibility before load, use conservative context sizing, support cancellation, avoid UI-thread inference, unload when appropriate, and react to RAM/battery/thermal pressure.

## Pass A / Pass B reconciliation

### Survived Pass A

- dynamic model/deployment registry
- evidence-bearing capability/access/health planes
- adaptive routing
- bounded learned routing
- cascaded escalation
- local fallback
- discovery and outcome learning

### Pass B removed as mandatory architecture

- giant all-model candidate pools
- always-on bandit routing
- universal canonical quality scalar
- mandatory multi-model inference
- continuous provider polling
- every-request discovery
- expensive LLM-as-router dependency
- blind fallback after partial streaming
- automatic activation of newly discovered models
- treating open weights as equivalent to zero-cost local inference

## Mandatory proof before implementation completion

Implementation cannot be called complete until the following families pass:

- exact revision and alias-drift tests
- free/access proof freshness and conflict tests
- quota and reset behavior
- Arabic/general/coding/reasoning/research/vision capability evals
- tool-call and JSON/schema reliability
- long-context behavior
- deterministic-versus-learned router evaluation
- under/over-escalation tests
- provider/model switching and route-stability tests
- 401/403/429/5xx/network/timeout/context-overflow handling
- partial stream and cancellation correctness
- same-model endpoint failover and alternate-model fallback
- all-routes-exhausted behavior
- routing-data poisoning and privacy/credential isolation
- local corruption/OOM/thermal/battery/offline behavior
- route latency, TTFT, TPOT, RAM, CPU, battery and network regression gates
- long-run model/price/quota/privacy/quality drift

## Deferred implementation stages

- `MDL-P0` — identity compatibility bridge
- `MDL-P1` — provider adapter contract
- `MDL-P2` — access/pricing/license/privacy/quota proof plane
- `MDL-P3` — endpoint health and circuit breakers
- `MDL-P4` — evidence-bearing capability qualification
- `MDL-P5` — RouteContract, eligibility, frontier and deterministic champion
- `MDL-P6` — learned router shadow/canary and bounded adaptation
- `MDL-P7` — RouteLease, Context Fabric handshake and cache affinity
- `MDL-P8` — normalized failures, fallback, escalation and partial-stream correctness
- `MDL-P9` — governed local inference integration
- `MDL-P10` — discovery, drift, quarantine and retirement
- `MDL-P11` — live-provider, adversarial, long-run and Android gates

These stages remain deferred until cross-system reconciliation.

## Implementation truth

Current Seven already has provider-routing pieces, free-proof, health, model evaluation/promotion and fallback foundations. That is valuable executable groundwork, but it does **not** yet equal this frozen architecture and does not justify calling Model Fabric complete.

## Protection record

This architecture freeze is documentation-only. `seven_ai-final.html` remains protected and must retain its known baseline blob SHA unless the user explicitly authorizes implementation changes.

## Campaign continuation

Next numbered core capability after this freeze:

**Capability 06 — Adaptive Compute**
