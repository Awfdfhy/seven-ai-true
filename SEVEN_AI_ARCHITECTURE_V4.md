# Seven AI — Architecture v4 / Astra Handoff

## Mission
Seven AI is being built as a Cognitive Runtime, not merely a chat UI.

Core philosophy:
1. Own the intelligence. Borrow the infrastructure.
2. Canonical state is authoritative. Everything derived must prove where it came from.

## Core invariants
- Authoritative state is explicit. Canonical memory, files, run state, and permissions are not summaries, embeddings, caches, or projections.
- Every derived object must carry lineage to its source and transformation.
- Authority must never increase through summarization, consolidation, tool echo, or corroboration.
- Action-sensitive permission memory must bind to authoritative source events.
- Retrieval, reasoning, tools, verification, and stronger models are selectively invoked, not always-on.

## Target runtime
Seven AI
├─ Cognitive Controller
│  ├─ Task Router
│  ├─ Memory Router
│  └─ Tool Router
├─ Memory Fabric
├─ Context Fabric / Context Workspace
├─ Tool Fabric
├─ Model Fabric / Unlimited Runtime
├─ Evidence + Verification Runtime
├─ Research Runtime
├─ Coding Runtime
├─ Projects / Workspace
└─ Protocol adapters
   ├─ MCP
   ├─ A2A
   ├─ AG-UI
   └─ generative UI adapters

Cross-cutting:
Security, permissions, provenance, observability, evaluation, recovery, performance.

## Memory Fabric
Canonical state remains authoritative.

Planned/target additions:
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
- localStorage only for small preferences/cache-like state.
- Android future: Storage Access Framework for user-granted files.
- Android Keystore for secrets.

## Research Runtime
SearXNG adapter + fetch/extract/browser tiers.

Search → Fetch → Extract → Evidence → Compare → Verify → Synthesize → Cite.

Add:
- claim-evidence matrix
- contradiction search
- freshness search
- gap search
- citation/evidence lock

## Coding Runtime
Aider-style repo map + minimal SWE-agent-style inspect/edit/test loop.

Understand → Inspect → Plan → Read → Modify → Test → Inspect Diff → Fix → Verify → Report.

PASS requires evidence such as changed files, tests, diff inspection, and syntax checks.
Use strict sandbox and command policy.

## Verification
Escalation levels:
1. deterministic checks
2. execution evidence
3. consistency checks
4. model critic
5. independent model only when needed

Allowed terminal state: INCONCLUSIVE. Never manufacture PASS.

Unified loop:
Plan → Execute → Observe → Verify → PASS
                         └→ FAIL → Replan → Execute

## Local Intelligence Plane
Use cheap/local computation wherever it preserves quality:
- embeddings
- reranking
- classification/gating
- simple routing
- deterministic validation
- llama.cpp local fallback when feasible

## Observability
Internal tracing should align with OpenTelemetry GenAI concepts.
Prompt/content capture should be opt-in.

Trace:
Request → Controller Decision → Memory Retrieval → Tool Selection → Tool Call
→ Evidence → Verification → Response.

Track latency, token/cost estimates, context size, memory hit rate, tool success,
retry rate, conflict rate, verification failures, model routing, and cache hits.

## Evaluation gates
Use evaluations as development gates, not decoration:
- LongMemEval-V2 / LoCoMo for memory
- BFCL for tool use
- SWE-bench for coding
- BrowseComp for research
- LLMRouterBench for routing
- security/red-team suites
- Promptfoo can be an optional external harness

## Protocol rule
MCP, A2A, AG-UI, and generative UI are adapters/interoperability layers, never Seven's brain.

## Recommended build order after T150
A. Persistence + origin-bound authority hardening
B. Context intelligence + local embeddings
C. Tool Fabric intelligence
D. Research Runtime
E. Coding Runtime
F. Model Fabric learning
G. Protocols / UI / sync

Task sizes should be natural. Advance by quality gates, not a fixed task count.
