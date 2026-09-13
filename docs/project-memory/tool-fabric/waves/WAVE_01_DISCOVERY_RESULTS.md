# Seven Tool Fabric 2.0 — Discovery Wave 01

> Status: DISCOVERY EVIDENCE, NOT FINAL ADOPTION
> Date: 2026-09-13
> Governing prompt: `WAVE_01_MAXIMUM_EFFORT_PROMPT.md`

## Executive finding

Wave 01 strongly supports a brokered Tool Fabric rather than hard-wiring many vendors as unrelated tools. Seven should expose stable capability contracts such as SearchBroker, BrowserActionBroker, CodeStructureEngine, PolicyEngine, and TelemetryBridge, then attach providers/engines behind those contracts. This reduces duplication, vendor lock-in, prompt/tool-schema bloat, and migration cost.

This wave is deliberately not a claim of internet-wide completeness. It is the first evidence wave and will be followed by deeper domain-specific waves and individual Deep Polish.

## Evidence discipline

Labels:
- VERIFIED FACT: supported by primary/current evidence in this wave.
- INFERENCE: architectural conclusion derived from evidence and Seven constraints.
- PROPOSAL: candidate Seven design awaiting Deep Polish/evals.
- UNKNOWN: requires more evidence before adoption.

## 1. MCP protocol layer

### Finding
VERIFIED FACT: MCP specification 2026-07-28 introduced a stateless protocol core, multi round-trip requests, header-based routing, cacheable list results, authorization hardening, extensions, and updated Tier 1 SDKs. The official MCP roadmap published 2026-08-22 confirms continued protocol development.

### Seven classification
**CORE CANDIDATE: protocol/adaptation layer, not a single end-user tool.**

### Proposed role
`McpCapabilityAdapter`
- discover compatible external capabilities
- normalize MCP-exposed tools into Seven capability metadata
- keep Seven permissions/verification authoritative
- never treat MCP server claims as trusted truth
- pin server/tool identity and schema versions where possible
- isolate remote side effects behind Seven Side-Effect Ledger

### Why
MCP can widen Seven's external capability surface without requiring a custom integration for every service, but it must not bypass Seven's Tool Security Kernel.

### Deep-polish questions
- exact 2026-07-28 client semantics
- Tasks/long-running work integration
- authorization boundary
- schema change detection
- hostile/untrusted MCP server model
- mobile transport and connection cost
- capability caching

Primary evidence: official Model Context Protocol blog/spec release and roadmap.

## 2. Search / retrieval broker

### Finding
Current independent and vendor evidence shows there is no universal winner for all retrieval tasks. A September 2026 independent benchmark reports different leaders by track: Exa fast for one-shot lookup, Exa deep for some coding/fetch tracks, and Parallel basic for one multi-hop search-only track. Vendor comparisons make different claims, reinforcing the need for Seven-owned evaluation rather than adopting marketing scores.

### Seven classification
**CORE CANDIDATE: SearchBroker abstraction.**

Provider candidates for later individual evaluation:
- Exa
- Tavily
- Firecrawl search/retrieval capabilities
- Parallel
- Brave search API
- self-hosted/open search options in a later wave

### Proposed role
`SearchBroker`
- query classification
- provider capability profiles
- freshness requirement
- search vs fetch distinction
- multi-provider fallback only when justified
- result deduplication
- provenance
- cost/free-quota awareness
- latency budget
- source-quality signals
- query/result cache policy
- cancellation
- provider health

### Important decision
Do **not** create five top-level Seven tools called Exa/Tavily/etc. Seven should expose stable semantic search capabilities and route providers behind them.

### Unknowns
Free-tier durability, exact current pricing, API quotas, licensing/TOS constraints, geographic availability, and Android/network behavior require individual Deep Polish before adoption.

Evidence: independent OpenBenchmarks 2026 search benchmark plus current comparison evidence. Vendor-reported benchmark claims are not treated as neutral proof.

## 3. Browser action broker

### Finding
Evidence consistently separates deterministic browser automation from AI-directed exploratory automation. Playwright-style deterministic execution is better suited to repeatable flows; Stagehand adds AI-assisted browser primitives; Browser Use emphasizes autonomous browser-agent behavior. These are adjacent layers rather than perfect substitutes.

### Seven classification
**CORE CANDIDATE: BrowserActionBroker architecture.**

Candidate engines:
- Playwright / Playwright MCP: deterministic/repeatable browser actions
- Stagehand: specialist AI-assisted browser primitives
- Browser Use: experimental/specialist autonomous exploration
- Skyvern: later evaluation for changing multi-step portal workflows

### Proposed routing
1. deterministic known action first
2. semantic/AI-assisted action when DOM/selector knowledge is insufficient
3. autonomous exploratory browser loop only when task genuinely requires it
4. verify important effects after browser actions

### Why
This matches Seven's selective-compute law: do not spend model calls on browser steps that deterministic automation can execute reliably.

### Android constraint
A full local Chromium automation stack is likely too heavy for Seven's phone-first runtime. Browser execution should be lazy, external/remote when appropriate, or reserved for environments that can support it. This is an INFERENCE requiring implementation-specific profiling.

## 4. Structural code engine

### ast-grep
VERIFIED FACT: ast-grep is a Rust CLI/library for structural AST search, linting, and rewriting based on tree-sitter. It supports code-pattern search/replacement, YAML rules, traversal APIs, and multi-core compiled execution.

### Seven classification
**SPECIALIST/CORE CANDIDATE for Coding Agent structural operations.**

### Proposed role
`CodeStructureEngine`
- structural search
- syntax-aware replacement
- rule-driven lint/search
- safer large refactors than raw text replacement where language support exists

It should complement, not replace:
- fast lexical/text search
- project map/index
- language-server/compiler diagnostics
- tests

### Deep-polish questions
- Android binary footprint
- supported languages needed by Seven users
- tree-sitter grammar packaging cost
- WASM/native possibilities
- transaction preview and rollback
- exact licensing and update strategy

Primary evidence: ast-grep project documentation/repository.

## 5. Authorization / policy engine

### Cedar
VERIFIED FACT: Cedar is a policy language and authorization engine designed to separate authorization logic from application business logic. Authorization requests are evaluated in terms of principal, action, resource, and context, returning allow/deny decisions.

### Seven classification
**EXPERIMENTAL/ARCHITECTURE CANDIDATE.**

### Potential role
A formal policy engine could strengthen Seven's Tool Security Kernel for actions such as read/write/execute/network/delete/rename/external side effects.

### Caution
Seven may not need to embed Cedar itself. The stronger insight may be adopting a small Seven-native policy model inspired by explicit principal/action/resource/context semantics. Embedding a full engine must beat a lightweight native design on APK size, complexity, auditability, and latency.

### Deep-polish comparison required
- Cedar
- OPA/Rego
- lightweight Seven-native policy evaluator

Primary evidence: Cedar official documentation.

## 6. Observability bridge

### OpenTelemetry
VERIFIED FACT: OpenTelemetry is vendor-neutral and specifies tracing, metrics, logs, context and related telemetry. Current GenAI semantic conventions can represent model operations, token counts, tool calls/results and other agent-relevant telemetry, with content capture requiring explicit consideration.

### Seven classification
**CORE DESIGN CANDIDATE, implementation form TBD.**

### Proposed role
`TelemetryBridge`
- run traces
- model call spans
- tool call spans
- latency
- retries
- token estimates/counts
- verification outcomes
- error states
- resource/performance tier metadata

### Privacy rule
Do not record full prompts, completions, tool inputs/results by default merely because a telemetry standard permits them. Seven should default to privacy-preserving metadata and require explicit policy for sensitive content capture.

### Android constraint
Do not bundle a heavyweight observability backend into the app. Use a lightweight internal event model with optional export/adaptation to OpenTelemetry-compatible telemetry.

Primary evidence: OpenTelemetry specification 1.60 and official 2026 GenAI observability guidance.

# Wave 01 candidate architecture

```text
Cognitive Control Plane
        |
   Capability Router
        |
+-------+-------------------+-------------------+----------------+
| SearchBroker             | BrowserActionBroker| CodeStructure  |
| provider adapters        | engine adapters    | Engine         |
+--------------------------+--------------------+----------------+
        |
 Tool Security Kernel -> Side-Effect Ledger -> Verification
        |
 Optional MCP Capability Adapter
        |
 Internal Telemetry -> optional TelemetryBridge/export
```

## Initial classifications

### CORE candidates
- SearchBroker abstraction
- BrowserActionBroker abstraction
- MCP capability adapter architecture
- lightweight internal telemetry model / optional OpenTelemetry bridge

### SPECIALIST candidates
- ast-grep structural code operations
- Stagehand-like semantic browser actions

### EXPERIMENTAL candidates
- Browser Use autonomous browser loop
- Skyvern-style browser workflows pending deeper evidence
- full Cedar embedding

### PROVIDERS TO EVALUATE, NOT YET TO ADOPT
- Exa
- Tavily
- Firecrawl
- Parallel
- Brave

### REJECTED AS AN ARCHITECTURAL PATTERN
- exposing every search vendor as a permanent top-level Seven tool
- using autonomous LLM browser control for deterministic tasks by default
- trusting provider/tool success without effect verification
- bundling a heavy observability backend into the Android app
- treating vendor benchmark claims as sufficient adoption evidence

# Wave 01 gaps

This wave has not yet deeply covered:
- self-hosted search (SearXNG and alternatives)
- document/PDF parsing (Docling, Marker, Unstructured and alternatives)
- OCR/vision engines
- speech/audio
- SQL/data tools
- sandboxed execution
- language servers/compiler adapters
- Git tooling
- local embeddings/rerankers
- vector/lexical stores
- knowledge graphs
- compression/context tools
- Android local inference
- testing/fuzzing/property testing
- file format conversion
- structured extraction
- API automation
- RPG/Canon-specific tools

These are intentionally carried into later discovery waves rather than pretending Wave 01 is complete.

# Saturation status

**NOT SATURATED.** Wave 01 establishes several high-leverage architecture candidates and provider shortlists, but many required domains remain unexplored. No final adoption or implementation is authorized by this document.

# Next research direction

Wave 02 should target the local/data/document foundation because it has high cross-system leverage:
- document parsing
- PDF/text extraction
- OCR
- structured data/SQL
- local lexical/vector retrieval
- embeddings/reranking
- lightweight Android-compatible execution paths

Each serious candidate will later receive its own Deep Polish document before final adoption.
