# Seven AI — Architecture v4.1 / Astra Handoff

## Mission
Seven AI is being built as a Cognitive Runtime, not merely a chat UI.

Core philosophy:
1. Own the intelligence. Borrow the infrastructure.
2. Canonical state is authoritative. Everything derived must prove where it came from.
3. A subsystem is not complete until it is implemented, wired into the normal user path, verified, and recoverable.

## Core invariants
- Authoritative state is explicit. Canonical memory, files, run state, permissions, world state, and work progression are not summaries, embeddings, caches, or projections.
- Every derived object must carry lineage to its source and transformation.
- Authority must never increase through summarization, consolidation, tool echo, corroboration, model confidence, or repeated restatement.
- Action-sensitive permission memory must bind to authoritative source events.
- Retrieval, reasoning, tools, verification, stronger models, research, and expensive UI effects are selectively invoked, not always-on.
- `PASS` requires evidence. `INCONCLUSIVE` is a valid terminal result when evidence is insufficient.
- The UI may reveal runtime state, but it must never become the authority for runtime state.

## Target runtime
Seven AI
├─ Cognitive Controller
│  ├─ Task Router
│  ├─ Memory Router
│  ├─ Tool Router
│  └─ Mode / Runtime Router
├─ Memory Fabric
├─ Context Fabric / Context Workspace
├─ Tool Fabric
├─ Model Fabric / Unlimited-by-design Runtime
├─ Evidence + Verification Runtime
├─ Research Runtime
├─ Coding Runtime
├─ World Runtime
│  ├─ Canon Simulator
│  ├─ Real Works Runtime
│  ├─ Player Agency Lock
│  └─ Titles / Naming Runtime
├─ Projects / Workspace
├─ Experience / UI Runtime
└─ Protocol adapters
   ├─ MCP
   ├─ A2A
   ├─ AG-UI
   └─ generative UI adapters

Cross-cutting:
Security, permissions, provenance, observability, evaluation, recovery, performance, accessibility, Android integration.

## Memory Fabric
Canonical state remains authoritative.

Target additions:
- Append-only memory event ledger.
- Three primary derived views: event, entity, semantic.
- Orthogonal temporal, causal, lexical, and vector indexes.
- Hierarchical retrieval.
- Chain-of-Memory only as a derived retrieval strategy.
- Provenance, evidence, trust, confidence, authority kept distinct.
- Origin-bound authority.
- Conflict detection/resolution, temporal reasoning, versioning, supersession, consolidation, transformation.
- Evidence expansion and evidence/citation lock.
- Memory actions exposed to the controller only through governed capabilities.

Write path:
Input → Trust Boundary → Source Identification → Policy Gate → Candidate Extraction
→ Validation → Evidence Attachment → Provenance Binding → Authority Decision
→ Review/Approval → Canonical Commit → Event Ledger → Derived Index Update

Read path:
Query → Intent Gate → Memory Router → Scope/Source Filter → Candidate Generation
→ Hierarchical Retrieval → Fusion → Reranking → Evidence Expansion → Conflict Check
→ Evidence Lock → Context Reconstruction → Context Compilation

## Context Fabric
Upgrade into an active Context Workspace:
- select / rank / dedupe
- pin / compress / expand / evict / reconstruct
- explicit category token budgets
- evidence-aware compilation
- validation before model invocation

Storage != Memory != State != Context != Evidence != Provenance.

## Tool Fabric
Discover → Capability Normalize → duplicate/alias merge → Filter → Permission → Risk
→ progressive plan-aware dependency retrieval → Schema Load → Plan → Schedule
→ Execute → Validate Result → Evidence → Retry/Replan.

Also:
- capability graph
- tool pinning/hashes
- idempotency
- side-effect uncertainty
- schema/result validation
- never dump every tool schema into context by default

## Model Fabric / Free-first resilience
Goal: no single-provider usage ceiling, not a false promise of physically unlimited external AI.

Architecture:
Request → Capability Router → availability/free-proof/health checks → best eligible provider/model
→ fallback provider(s) → local model → cache/deferred path where appropriate.

Requirements:
- strict free-proof classes and runtime proof TTL
- provider abstraction
- quota/health manager
- automatic fallback
- outcome-history kNN routing
- model-switch penalty
- local intelligence plane
- local embeddings/reranking/classification
- llama.cpp fallback
- provider catalog discovery where safely supported
- new models must not silently become trusted/eligible without policy validation
- Z.AI free models may be supported
- Mistral Free mode only when pay-as-you-go is confirmed off
- Cloudflare Free hard-stop detection
- user-owned resources where appropriate

## Persistence
Target migration:
- IndexedDB/Dexie for canonical persistence.
- localStorage only for small preferences/cache-like state and bounded compatibility bridges.
- Android Storage Access Framework for user-granted files.
- Android Keystore for secrets.
- imports/exports must preserve lineage and version metadata, not only rendered chat text.

## Research Runtime
SearXNG adapter + fetch/extract/browser tiers.

Search → Fetch → Extract → Evidence → Compare → Verify → Synthesize → Cite.

Add:
- claim-evidence matrix
- contradiction search
- freshness search
- gap search
- citation/evidence lock
- explicit `INCONCLUSIVE` when evidence is missing or conflicting

## Coding Runtime
Aider-style repo map + minimal SWE-agent-style inspect/edit/test loop.

Understand → Inspect → Plan → Read → Modify → Test → Inspect Diff → Fix → Verify → Report.

PASS requires evidence such as changed files, tests, diff inspection, and syntax checks.
Use strict sandbox and command policy. File-system and shell authority must come from the platform bridge, never from model text.

## World Runtime
World mode is a stateful simulation/runtime, not a roleplay prompt preset.

### Canon Simulator
- source authority classes
- continuity selection
- fact knowledge horizons
- hard/soft anchors
- invariants
- canon debt
- explicit branch creation when a rigid anchor is invalidated

### Real Works Runtime
For existing works, events must be represented as source-bound ordered beats rather than trusted model recollection.

Source Pack → Normalize Beats → Bind Source References → Build Scene Contract
→ Player Action → Validate Agency → Commit Canon Beat or Create Branch → Audit Fidelity.

Rules:
- missing sources yield `UNVERIFIED` or `INCONCLUSIVE`
- out-of-order canon changes are blocked unless a branch is explicitly created
- the model never invents the player's irreversible action, core intention, or emotion
- work progress is canonical state and must be persisted independently of prose summaries
- source fidelity and narrative quality are separate scores

### Titles / Naming Runtime
Naming is a deterministic world capability with configurable namespaces for episode, chapter, arc, side story, special, what-if, filler, game, and future content types.
Naming metadata is not allowed to change world authority or canon state.

## Verification
Escalation levels:
1. deterministic checks
2. execution evidence
3. consistency checks
4. model critic
5. independent model only when needed

Allowed terminal states include `PASS`, `FAIL`, `BLOCKED`, and `INCONCLUSIVE`. Never manufacture PASS.

Unified loop:
Plan → Execute → Observe → Verify → PASS
                         ├→ FAIL → Replan → Execute
                         ├→ BLOCKED → Surface requirement/fallback
                         └→ INCONCLUSIVE → Preserve uncertainty

## Local Intelligence Plane
Use cheap/local computation wherever it preserves quality:
- embeddings
- reranking
- classification/gating
- simple routing
- deterministic validation
- llama.cpp local fallback when feasible

## Experience / UI Runtime
The interface is a projection of runtime truth, not an alternate state store.

Requirements:
- Core / Build / World / Research share one design language while exposing mode-specific state.
- busy/ready/running/blocked/failed states come from runtime state.
- mobile-first touch targets and safe areas.
- Reduced Motion is authoritative.
- performance tiers may remove blur, glow, long transitions, and decorative animation.
- event-delegated or observer-driven updates; no animation polling loops.
- long messages use offscreen rendering optimizations.
- chat behaves as an accessible live log; toggles expose semantic pressed state.
- UI polish must not materially increase startup cost, RAM, or APK size.

## Performance budget
Seven must remain lightweight on phone even when advanced systems exist.

- Startup loads only essential chat/runtime/UI code.
- PDF, large research tools, local models, and heavy adapters are lazy-loaded.
- expensive effects are disabled on lite tier.
- hidden-page animations pause.
- long tasks may automatically downgrade the visual performance tier.
- release assets have explicit size gates.

## Observability
Internal tracing should align with OpenTelemetry GenAI concepts.
Prompt/content capture should be opt-in.

Trace:
Request → Controller Decision → Memory Retrieval → Tool Selection → Tool Call
→ Evidence → Verification → Response.

Track latency, token/cost estimates, context size, memory hit rate, tool success,
retry rate, conflict rate, verification failures, model routing, cache hits, world branches, source-fidelity gaps, UI long tasks, and fallback use.

## Evaluation gates
Use evaluations as development gates, not decoration:
- LongMemEval-V2 / LoCoMo for memory
- BFCL for tool use
- SWE-bench for coding
- BrowseComp for research
- LLMRouterBench for routing
- world/canon fixtures for RPG continuity, player agency, source fidelity, and branching
- security/red-team suites
- Promptfoo can be an optional external harness

## Protocol rule
MCP, A2A, AG-UI, and generative UI are adapters/interoperability layers, never Seven's brain.

## Definition of done per subsystem
A subsystem may be called complete only when:
1. executable implementation exists;
2. normal user flow invokes it;
3. failure/recovery state exists;
4. automated evidence covers its critical path;
5. device/platform-specific dependencies are tested where relevant.

## Recommended build order after T150
A. Persistence + origin-bound authority hardening
B. Context intelligence + local embeddings
C. Tool Fabric intelligence
D. Research Runtime
E. Coding Runtime
F. Model Fabric learning
G. World Runtime / Real Works / Titles integration
H. Experience/UI runtime and mode-specific surfaces
I. Android SAF/Keystore + real-device gates
J. Protocols / sync / optional ecosystem adapters

Task sizes should be natural. Advance by quality gates, not a fixed task count.
