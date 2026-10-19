# Seven Domain Roadmaps — cycle evidence

Ready domains: 5/30
Only READY domains may drive implementation.

# D01_CHAT_CORE — Chat / Rooms / Composer / Streaming

Research audit: INSUFFICIENT

DOMAIN_ID=D01_CHAT_CORE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D02_MEMORY_CONTEXT — Long-Term Memory / Context Fabric

Research audit: READY

DOMAIN_ID=D02_MEMORY_CONTEXT
SOURCE_ANALYSIS=Harvested sources show consensus around: (1) prefix/summarized long-term memory to avoid full context (Mem0, MemX local-first, Memoria) [2504.19413, 2603.16171, 2512.12686]; (2) temporal/graph knowledge for point-in-time queries and entity evolution (Zep/Graphiti) [2501.13956, help.getzep.com]; (3) benchmarks emphasize retrieval/utility over recall: LongMemEval, UTILMEM [2410.10813, 2608.30508, 2609.03467]. Disagreements: heavyweight KG vs minimal lexical+temporal; server-first (Mem0/Zep) vs local-first (MemX). Freshness mixed (some preprints). Limitation: arXiv abstracts provide intent, not full impl details; docs describe concepts but Seven is browser/IndexedDB local-first.

CURRENT=Seven implements a concrete local memory fabric: domain memory v2 with schemaVersion 2 ContextSummary including sourceFingerprint [remake/src/domain/memory/index.ts], CAS (compareAndSwapSummary) with sameSummary guard, monotonic timestamps, capacity limits [remake/src/storage/memory-repository.ts]. MemoryContextService enforces single-writer per room (WeakMap guard + pending queue bounded to 64, abort propagation), validates AbortSignal, rejects oversized provider summaries (PROVIDER error), reuses summaries across restart, detects prefix coverage, migrates legacy v1 summaries (migrateContextSummary) [remake/src/application/context/memory-context-service.ts]. Tests confirm persistence/reuse, CAS conflict handling, monotonicity, policy override, cancellation behavior [memory-context-service.test.ts, memory-repository.test.ts, domain/memory/memory.test.ts]. Memory service CRUD with room/global scope [remake/src/application/memory/memory-service.ts]. No graph/temporal episode store, no vector index, no abstention/forgetting policy beyond delete, no provenance ledger beyond fingerprint.

TARGET=Local-first, deterministic memory with: (a) restart persistence proven (IndexedDB-backed repo, not just in-mem), (b) temporal correctness (valid_at/invalid_at or through-message monotonicity + edit/rebuild detection), (c) provenance (sourceFingerprint used but need episode chain + evidence links), (d) abstention (don’t inject irrelevant memories), (e) secret exclusion/redaction, (f) Arabic parity for summary/retrieval, (g) Android exact-build evidence, (h) measured benchmark vs current lexical baseline (LongMemEval/UTILMEM style) before adding vector/KG complexity. Align with Memory v2 campaign (A06/B08/A04/A08/B09/B10).

NOW=(1) Make persistence concrete: replace/verify IndexedDB-backed MemoryRepository implementation (exists in storage? check) and add restart integration test using real IDB (jsdom or browser). (2) Provenance: extend ContextSummary with minimal episodeId/revision and audit trail; enforce sourceFingerprint integrity. (3) Abstention: add memory relevance gate (token budget + confidence) to avoid polluting context. (4) Temporal/edit detection: strengthen fingerprint to cover message edits (already uses throughMessageId+content hash; ensure room history edits invalidate correctly).

NEXT=(1) Secret exclusion: PII/token redaction before storing summaries/memories (pre-commit filter). (2) Arabic RTL parity: test summary generation/retrieval with Arabic content (length/segmentation). (3) Restart stress: CAS under concurrent writers across instances; recovery after crash mid-write. (4) Android evidence: run memory flows on Capacitor/Android build with exact artifact.

LATER=(1) Measurable benchmark harness against current baseline (target metrics: tokens saved, precision@k, abstention rate, time). (2) Only if benchmark wins, consider minimal vector index (IndexedDB+embedding) with feature flag; avoid KG unless justified. (3) Forgetting/TTL, memory compaction. (4) Provenance ledger export for audit.

TESTS=(1) Deterministic: CAS conflict (exists), oversized summary rejection, monotonic timestamps, prefix reuse. (2) Integration: restart (persisted repo) loads summary. (3) Adversarial: concurrent writes, abort storm (bounded queue tested), malformed signals, oversized content. (4) E2E: context prepare with policy override. (5) Android: memory CRUD+summary on device/emulator. (6) Eval: small LongMemEval-style harness for local baseline.

RISKS=Secret leakage (must exclude before persist), CAS livelock (bounded pending set, retryable errors), IDB quota on mobile, RTL text handling, over-summarization losing facts, complexity creep (vector/KG) without benchmark proof.

FIRST_SLICE=Restart-persisted MemoryRepository + integration test: prove summary survives process restart (non-mem backend) and CAS semantics hold. + minimal provenance fields + abstention gate. Keep changes small and evidence-based.

KNOWN_UNKNOWNS=No IndexedDB-backed repo implementation visible in inspected files (only InMemoryMemoryRepository). Android exact-build memory evidence missing. Benchmark vs baseline not present. Secret redaction policy unspecified. Arabic parity untested.

DOMAIN_VERDICT=READY_FOR_PLAN


# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: INSUFFICIENT

DOMAIN_ID=D03_TOOLS_CAPABILITY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D04_CODING_SYSTEM — Coding Agent / Repo Map / Edit-Test-Verify

Research audit: INSUFFICIENT

DOMAIN_ID=D04_CODING_SYSTEM
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D05_SELF_DEVELOPMENT — Self-Development / Autonomous Software Evolution

Research audit: INSUFFICIENT

DOMAIN_ID=D05_SELF_DEVELOPMENT
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D06_RPG_WORLD — RPG / World Runtime / Canon / Dialogue / Agency

Research audit: READY

DOMAIN_ID=D06_RPG_WORLD
SOURCE_ANALYSIS=Harvested sources point to Yarn Spinner as canonical narrative runtime (dialogue runner, commands, variables) [yarnspinner.dev, docs]. Godot saving guide emphasizes versioned saves, binary/JSON serialization, encryption considerations [godotengine.org]. Unity integration exists but Seven is web-first (and Android). Key points: separate dialogue state from game state, idempotent saves, migration/versioning, deterministic replay for testing, localization. Limitation: web-focused RPG runtime in repo not fully visible from memory files; need to inspect RPG/world code.

CURRENT=Seven has RPG/world references in domain campaign (owners B05,A06) but inspected memory files don’t show dialogue runtime. Need to inspect actual RPG/world modules (e.g. src/domain/rpg, src/application/rpg, dialogue) to see current state. Evidence: campaign marks D06 as INSUFFICIENT; no concrete implementation found in memory-centric scan.

TARGET=Deterministic RPG world runtime with: (a) canonical dialogue system (Yarn-like or compatible) with line/option/command separation, (b) world state + persistence (separate from chat memory), (c) canon tracking (facts/flags), (d) save/load with versioning/migration, (e) deterministic replay for tests, (f) Android save paths, (g) no secret leakage in saves.

NOW=Inspect RPG/world surfaces: find dialogue runner, world store, save/load, canon. Map against Yarn Spinner concepts. Identify what exists vs gaps.

NEXT=Define clear boundaries: RPG world state independent from LTM chat memory (separation of concerns) to avoid coupling. Add versioned save format.

LATER=Deterministic tests, rollback on load failure, migration paths.

TESTS=Deterministic replay, save/load roundtrip, migration, edge cases.

RISKS=State coupling with memory system, save corruption, breaking canon, Android storage.

FIRST_SLICE=Evidence inspection complete + minimal contract doc + testable save/load for world state.

KNOWN_UNKNOWNS=RPG implementation files not located in memory scan; extent unknown. Campaign INSUFFICIENT confirmed.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need repo inspection of RPG/world modules before concrete plan)


# D07_RESEARCH_WEB — Web Research / Retrieval / Citations / Evidence

Research audit: READY

DOMAIN_ID=D07_RESEARCH_WEB
SOURCE_ANALYSIS=Harvested evidence: [SOURCE primary] https://cdn.openai.com/pdf/5e10f4ab-d6f7-442e-9508-59515c65e35d/browsecomp.pdf (BrowseComp) is a concrete artifact (PDF) describing a browsing/reasoning benchmark. Its presence matters for citation discipline and verifiability. [SOURCE secondary] https://link.springer.com/article/10.1007/s42979-026-05134-x failed to render fully in harvest (client challenge/JS blocked) — content cannot be verified from harvest alone; freshness/claims unknown. Other harvested secondaries are font/CSS assets. Collectively sources point to verifiability (BrowseComp) and retrieval/evaluation literature (Springer) but harvested set is insufficient to validate exact Seven behavior. Disagreements/nuance not extractable from partial Springer load. Limitations: PDF is public but represents a benchmark/task framing (not a product UX spec); Springer partial load means we cannot cite specifics from it without fetching clean text.
CURRENT=Seven implements `ResearchService` in `remake/src/application/research/research-service.ts` (creates research sessions, manages pending searches, records results, sets done/failed, streams progress). It tracks queries, results with metadata (url, title, snippet), and lifecycle. Evidence: file exists and defines concrete state (query, results array, status, startedAt, endedAt). No obvious citation schema (e.g. required citations array, citation IDs, source credibility), no retrieval provider abstraction that enforces provenance, no cache policy visible in inspected code. UI surface not inspected here but service is the core. Domain audit from campaign marked INSUFFICIENT overall.
TARGET=Deterministic, evidence-first web research in Seven: retrieval must produce verifiable citations (URL, title, access timestamp, retrieval method) bound to results; cache respects staleness; failures are explicit (timeouts, blocked, partial). Align with BrowseComp-style verifiability expectations (can trace claim to source) without copying. Preserve Seven identity. No LLM-auth boundary for retrieval policy.
NOW=Add minimal citation schema to research results (url, title, snippet, retrievedAt, sourceType, hash/id). Enforce that completed results include at least one citation when claim is external. Add retrieval failure taxonomy. Wire to existing `ResearchService` state without breaking current flow. Add unit test for citation requirement and timeout/partial cases.
NEXT=Introduce retrieval cache with TTL and ETag/Last-Modified where available; provenance ledger (sessionId, query, sources). Consider allowlist for domains if policy requires; add source credibility flags (official/docs/primary vs secondary). Improve citation rendering path.
LATER=Full retrieval provider abstraction (pluggable), evaluation hooks aligned to BrowseComp-style verification (answer-source match), prefetch policies, cost/latency metrics, Android offline behavior.
TESTS=Unit: ResearchService state transitions, citation enforcement, error paths. Integration: retrieval timeout, partial results, redirect handling. Adversarial: SSRF guardrails (if external calls added), injection in snippets/URLs, malformed redirects. Eval: citation coverage (% results with verifiable source), answer-groundedness (can point to citation). Android: basic service lifecycle (background constraints) if wired.
RISKS=Over-relying on external fetches (latency, SSRF, PII leakage in queries). Citation bloat. Cache staleness. Android network permissions/background. Cross-system: must not weaken security policies. Reference sources are benchmark literature (BrowseComp) — avoid turning product into eval-only.
FIRST_SLICE=Extend `ResearchService` result shape to require citations; add validation that `done` state with non-empty external claims has citations. Add tests. Smallest change that materially improves evidence discipline.
KNOWN_UNKNOWNS=No visible citation enforcement in current code; no cache/staleness policy; no retrieval provider interface; harvest gave partial Springer content (unreadable) so cannot cite its specifics; BrowseComp is benchmark (not UX spec). Need to confirm if ResearchService already persists citations elsewhere.
DOMAIN_VERDICT=READY_FOR_PLAN


# D08_MODEL_ROUTING — Model Routing / Provider Health / Fallback

Research audit: INSUFFICIENT

DOMAIN_ID=D08_MODEL_ROUTING
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D09_DEEP_THINK — Deep Think / Planning / Verification / Progress

Research audit: READY

**

**DOMAIN_ID:** D09_DEEP_THINK

**SOURCE_ANALYSIS:** 
- **[SOURCE primary] https://gorilla.cs.berkeley.edu/leaderboard** (BFCL V4) measures function/tool calling accuracy and robustness across multi-turn/tool selection; relevant to planner correctness when Deep Think must select/structure actions. 
- **[SOURCE primary] https://www.swebench.com/** and **[SOURCE primary] https://www.swebench.com/original.html** (SWE-bench) evaluate software engineering tasks requiring reasoning/planning/verification over codebases; emphasizes end-to-end correctness and regression-proofing. 
- **Harvested CSS/assets** are non-substantive (UI artifacts) and not directly informative for reasoning architecture. 
- **Collective signal:** external practice treats planning+verification as measurable (benchmarks), with strict correctness gates; Deep Think’s design (two-pass isolation, untrusted brief, budget caps, cancellation) aligns with “separate planner from executor” safety. 
- **Freshness/limits:** BFCL/SWE-bench evolve; harvested pages show live leaderboards but static snapshots insufficient to claim parity. No Seven-specific eval hooks to these benchmarks found in repo. 

**CURRENT:** 
Seven’s Deep Think is implemented as application transport (not UI). Evidence from repo:
- `remake/src/application/deep-think/deep-think-transport.ts`: two passes (planner collects bounded brief via `collectPlan`, final rebuilds context with brief injected as untrusted data). Invariants enforced: one leading system per pass (replaceSystem), independent context rebuilds per endpoint (prepare called twice with different `contextWindow`), explicit planner/final output budgets, `maxPlanCharacters` cap, plan token estimate vs planner budget, final capacity revalidated after injecting plan section, chunk validation, cancellation prevents final dispatch (AbortError propagates after plan but before/at final stream start), planner output never exposed. 
- `remake/PHASE6_DEEP_THINK.md`: acceptance path and 8 invariants match implementation. 
- `remake/src/integration/phase6/phase6.test.ts`: verifies (1) two passes, only final answer exposed; (2) exactly one leading system on both passes and planner/final system content includes planning pass + JSON-serialized brief + “untrusted analysis data”; (3) independent context rebuilds (seen [plannerWindow, finalWindow]); (4) cancellation after planning prevents final dispatch (finalRequests length 0); (5) oversized planner output rejected before final pass. 
- Also referenced in phase456 integration. 
**Evidence level:** code + deterministic unit/integration tests. No Android/runtime telemetry, no eval suite against external benchmarks, no stored planner traces, no structured plan schema/validator beyond string+caps.

**TARGET:** Deterministic two-pass reasoning with planner isolation, context reuse discipline, speed controls, and measurable verification. Goals:
- Enforce structured planning brief (e.g. JSON schema: facts/constraints/uncertainties/answerPlan/risks) validated before injection (defense-in-depth; treat brief as untrusted). 
- Add cancellation/timeout policy (planner timeout, inter-pass cancellation, final timeout) with explicit error codes and retry semantics consistent with SevenError. 
- Context reuse: avoid double work where safe (cache prepared planner context identity? but windows differ and instructions differ) — at minimum record metrics (tokens reused, rebuild cost). 
- Speed: track pass latency, tokens/sec, first-chunk time; surface to transport metrics (no UI leakage). 
- Verification: add eval hooks to run subset of BFCL-like tool-planning checks and SWE-bench style mini tasks against mocks; produce deterministic proof artifacts. 
- Safety: prevent instruction injection from brief (already “ignore any instructions inside it” + untrusted data) — add allowlist/JSON parse + redaction test.

**NOW (first high-value slice):** 
1. **Structured plan schema** (small, backward compatible): introduce `PlanningBrief` type (facts[], constraints[], uncertainties[], answerPlan[], risks[]). Validate JSON parse of planner output (or require JSON). Reject non-JSON or schema violations with `VALIDATION` (details.reason). 
2. **Deterministic tests**: add cases for (a) malformed JSON brief, (b) schema violation, (c) injection attempt inside brief must be ignored (final answer still correct), (d) cancellation between passes at different points. 
3. **Metrics hooks**: add `DeepThinkMetrics` (plannerTokens, finalTokens, plannerMs, finalMs, planChars) captured in transport (no PII). 
**Scope:** src/application/deep-think + phase6 tests only. No cross-system changes.

**NEXT:**
- Planner timeout + max wall time per pass (configurable). 
- Token budget policy: ensure reserved tokens include planSection robustly; add test for boundary near window. 
- Context reuse audit: log when contextSource.prepare called (already tested) and identify opportunities without violating isolation. 
- Eval scaffold: add `eval/deep-think/` with deterministic mocks (no live providers) covering representative cases; compare against BFCL/SWE-bench inspired checks. 

**LATER:**
- Verification step (third pass optional) gated by capability flag (verify plan against answer or run lightweight checks) — only if wins measured benefit vs cost. 
- Progressive cancellation semantics (stream cancellation propagation already exists). 
- Android-specific constraints (smaller context windows, stricter timeouts) — requires Android evidence later. 
- Benchmark reporting (BFCL/SWE-bench subset scores) tied to candidate identity (Reality Lab). 

**TESTS:**
- **Unit:** schema validation (valid/invalid/malformed), injection ignore, size/token caps, cancellation. 
- **Integration (phase6):** extend with structured brief case, timeout abort, boundary cases. 
- **E2E (mocked):** planner returns structured brief, final ignores injected instructions. 
- **Adversarial:** planner emits prompt injection in “facts”; final must not follow; only user answer. 
- **Android:** later (no installed artifact evidence now). 
- **Eval:** deterministic BFCL-style tool-planning subset (mock tools) and tiny SWE-bench-like reasoning task. 

**RISKS:**
- **Security:** planner output untrusted — injection risk; mitigated by single-system replacement, “untrusted analysis data”, ignore instructions; adding JSON schema + validation strengthens. 
- **Correctness:** stricter schema may reject valid but unstructured planner outputs — make schema opt-in behind flag initially or accept both? Prefer schema by default but allow plain text with warnings? Or require schema to avoid ambiguity. 
- **Performance:** double prepare calls are necessary for independent windows (correctness > speed) — metrics needed before optimizing. 
- **Cross-system:** contextSource.prepare contract must remain unchanged. 
- **Android/RTL:** none directly; later timeouts matter. 
- **Privacy:** metrics must not log brief content; only sizes/times/tokens.

**FIRST_SLICE:** Add `PlanningBrief` interface + `parseAndValidatePlan(raw: string): PlanningBrief` with strict schema; update `collectPlan` to return validated object or validated string; inject `JSON.stringify(validatedBrief)` into final system (preserves “untrusted analysis data” + JSON). Update phase6 tests to use structured brief. Add 2 new tests (malformed JSON, injection ignore). Keep behavior identical otherwise (only final answer exposed). 

**KNOWN_UNKNOWNS:**
- Planner model capability to emit valid structured JSON consistently across providers/models (may need “respond with JSON only” instruction in planner system). 
- Whether existing planner outputs in practice are JSON-like; harvested sources don’t specify internal format. 
- No Reality Lab/Android evidence; eval parity with external benchmarks unproven. 
- Cancellation timing: abort between passes after plan collected but before final prepare/stream — current code checks signal after plan; behavior correct but needs more tests. 
- Speed baseline unknown (no metrics). 
- Domain campaign marked D09 as INSUFFICIENT overall (repo has impl/tests but missing eval/metrics/structured schema/telemetry). 

**DOMAIN_VERDICT:** READY_FOR_PLAN

**


# D10_FILES_MULTIMODAL — Files / Attachments / PDFs / Multimodal

Research audit: INSUFFICIENT

DOMAIN_ID=D10_FILES_MULTIMODAL
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D11_ANDROID_NATIVE — Android / APK / Lifecycle / IME / Back / Insets

Research audit: INSUFFICIENT

DOMAIN_ID=D11_ANDROID_NATIVE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D12_UI_DESIGN_SYSTEM — UI / Visual System / Motion / Responsive Design

Research audit: INSUFFICIENT

DOMAIN_ID=D12_UI_DESIGN_SYSTEM
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D13_ARABIC_RTL_A11Y — Arabic / RTL / Bidi / Accessibility

Research audit: INSUFFICIENT

DOMAIN_ID=D13_ARABIC_RTL_A11Y
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D14_SECURITY_PRIVACY — Security / Credentials / Privacy / Agent Boundaries

Research audit: INSUFFICIENT

DOMAIN_ID=D14_SECURITY_PRIVACY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D15_PERSISTENCE_RECOVERY — Persistence / Migration / Corruption / Recovery

Research audit: INSUFFICIENT

DOMAIN_ID=D15_PERSISTENCE_RECOVERY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D16_NETWORK_RESILIENCE — Network / Retry / Offline / Streaming Resilience

Research audit: INSUFFICIENT

DOMAIN_ID=D16_NETWORK_RESILIENCE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D17_PERFORMANCE_CONCURRENCY — Performance / Concurrency / Long Chat / Races

Research audit: INSUFFICIENT

DOMAIN_ID=D17_PERFORMANCE_CONCURRENCY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D18_TESTING_EVALS — Testing / Evals / Mutation / Visual / Release Evidence

Research audit: INSUFFICIENT

DOMAIN_ID=D18_TESTING_EVALS
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D19_AGENT_ORCHESTRATION — Multi-Agent Team / Manager / Strike Teams / Calibration

Research audit: INSUFFICIENT

DOMAIN_ID=D19_AGENT_ORCHESTRATION
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D20_PRODUCT_QUALITY — Product Quality / Cohesion / Synthetic Users / UX Judges

Research audit: INSUFFICIENT

DOMAIN_ID=D20_PRODUCT_QUALITY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D21_OBSERVABILITY_WORLD_MODEL — Observability / Engineering World Model / Blast Radius

Research audit: INSUFFICIENT

DOMAIN_ID=D21_OBSERVABILITY_WORLD_MODEL
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D22_PROTOCOLS_INTEROP — MCP / Agent Protocols / Tool Interoperability

Research audit: INSUFFICIENT

DOMAIN_ID=D22_PROTOCOLS_INTEROP
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D23_IMPORT_EXPORT_BACKUP — Import / Export / Backup / Data Portability

Research audit: INSUFFICIENT

DOMAIN_ID=D23_IMPORT_EXPORT_BACKUP
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D24_RELEASE_APK — Release / APK Identity / Signing / Installed Evidence

Research audit: INSUFFICIENT

DOMAIN_ID=D24_RELEASE_APK
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D25_HISTORY_ROOMS — Conversation History / Room Lifecycle / Search / Archive

Research audit: INSUFFICIENT

DOMAIN_ID=D25_HISTORY_ROOMS
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D26_SETTINGS_CONTROLS — Settings / Model Controls / Progressive Disclosure

Research audit: INSUFFICIENT

DOMAIN_ID=D26_SETTINGS_CONTROLS
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D27_ERROR_RECOVERY_UX — Errors / Loading / Empty / Recovery UX

Research audit: INSUFFICIENT

DOMAIN_ID=D27_ERROR_RECOVERY_UX
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D28_LOCAL_INTELLIGENCE — Local Intelligence / Embeddings / Reranking / Offline Fallback

Research audit: INSUFFICIENT

DOMAIN_ID=D28_LOCAL_INTELLIGENCE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D29_REAL_WORKS_CANON — Real Works / Source Fidelity / Canon Branching

Research audit: READY

DOMAIN_ID=D29_REAL_WORKS_CANON
SOURCE_ANALYSIS=Harvested: [SOURCE primary] https://www.yarnspinner.dev/docs/ (Yarn Spinner docs) — authoritative for Yarn Spinner (narrative scripting, lines, options, variables, functions, localization). Relevant as a reference for "real works canon" (interactive narrative structure, branching, source fidelity). Harvest is minimal (title only) but docs are canonical; freshness good. No harvested BrowseComp for this domain except seed. Limitations: Yarn Spinner is a specific tool (Ink/Yarn family) — Seven must not copy; use principles (branching canon, node identity, immutable public state, deterministic payload identity) per Seven Constitution. Other seeds not harvested.
CURRENT=Seven has RPG/canon surface: `rpg-canon-service.ts`, `rpg/domain.ts`. Inspected: `domain.ts` defines `RPGElementType`, `RPGRarity`, `RPGStat`, `RPGSkill`, `RPGLocation`, `RPGCharacter`, `RPGFaction`, `RPGItem`, `RPGQuest`, `RPGEvent`, `RPGWorldState`, `RPGNarrativeNode`, `RPGCanonEntry`, `RPGCanon`, plus helpers (createDefaultWorldState, createDefaultNarrativeNode). `RPGNarrativeNode` includes id, title, content, choices[], conditions, effects, nextNodeId, flags, tags, version. `RPGCanonEntry`/`RPGCanon` track entries with content hash/signature fields. `rpg-canon-service.ts` manages canon entries (add/update/get/list), computes checksums (SHA-256 via Web Crypto/Subtle or fallback), validates integrity, tracks revisions, persists canon state. Evidence: concrete types and integrity primitives (hashing, validation). Canon exists and has integrity concepts; branching model is present (narrative nodes with choices/nextNodeId). Missing: source fidelity enforcement (must not silently rewrite canon), canonical branch identity, provenance (who/when), immutable public state guarantees, restart persistence, exact payload identity as called out in manager rules.
TARGET=Real works canon with source fidelity: treat canon as immutable-by-contract once published; edits create new revisions with provenance; branching uses stable node IDs; narrative state is deterministic; payload identity is exact (byte-for-byte/signature). Align with Yarn Spinner principles (structured narrative, explicit choices, conditions) but preserve Seven RPG identity. Enforce constitution invariants (immutable public state, exact payload identity, persistence recovery).
NOW=Strengthen canon integrity: ensure `RPGCanonEntry` includes provenance (author, createdAt, sourceRef, hash, revision). Enforce that published entries cannot be mutated in-place (copy-on-write). Add validation: narrative node choices reference valid nextNodeId; circular/invalid refs detected. Add tests for integrity (checksum matches content), revision immutability, invalid branching. Document sourceRef (must point to real source when imported).
NEXT=Canon branching policy: enforce deterministic traversal; add snapshotting for world state; restart persistence for active narrative; export/import with signature verification. Add audit log of canon changes. Consider canonicalization (normalize whitespace/order) before hashing to ensure exact payload identity.
LATER=Canon diffing, merge policy for branches, localization hooks (RTL-aware), rollback to signed revision, performance for large canons.
TESTS=Unit: hashing, validation, immutability, branching validation. Integration: add/update/publish flow, revision history. Adversarial: hash collision attempt, tampering (modify content after hash), invalid nextNodeId, self-loop. Persistence: restart recovery (state survives reload). Android: file persistence integrity.
RISKS=Hashing fallback behavior if SubtleCrypto unavailable (must fail closed or use safe fallback). Mutability leaks (objects passed by reference). Canon bloat. Cross-system: narrative state interacts with memory/context (ownership). Must not weaken guards. Yarn Spinner is reference only (principles) not to be imported.
FIRST_SLICE=Enforce copy-on-write for canon updates (never mutate stored entry); require sourceRef+provenance on entries; add branching validation (all nextNodeId exist). Add unit tests. Smallest change improving source fidelity and integrity.
KNOWN_UNKNOWNS=No explicit "published" immutability flag visible; provenance fields (author/sourceRef) may be missing; branching validation not obvious; persistence/restart behavior for RPG state unknown; hashing fallback semantics need verification.
DOMAIN_VERDICT=READY_FOR_PLAN


# D30_AUTONOMOUS_QUALITY — Reality Lab / Evolution Arena / Constitution / Proof / Meta-Team

Research audit: INSUFFICIENT

DOMAIN_ID=D30_AUTONOMOUS_QUALITY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.
