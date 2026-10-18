# D02_MEMORY_CONTEXT — Long-Term Memory / Context Fabric

Research audit: READY

DOMAIN_ID=D02_MEMORY_CONTEXT

SOURCE_ANALYSIS=The harvested set splits between production/local-first memory (Mem0, Zep/Graphiti, MemX, Memoria, TeleMem) and evaluation/benchmarks (LongMemEval, UTILMEM, "When Users Don't Ask"). 

- [SOURCE primary] https://arxiv.org/abs/2504.19413 (Mem0): favors explicit memory extraction + updates, production focus, token efficiency; treats memory as first-class store with lifecycle.
- [SOURCE primary] https://arxiv.org/abs/2501.13956 (Zep/temporal KG): strongest evidence for temporal correctness — bi-temporal validity (valid_at/invalid_at) and point-in-time context queries; episodes+facts+entities. Directly relevant to history preservation and "what was true at t".
- [SOURCE primary] https://arxiv.org/abs/2410.10813 (LongMemEval): interactive long-term memory benchmark; stresses multi-session, user corrections, preference drift — matches "preference updated over time" cases.
- [SOURCE primary] https://arxiv.org/abs/2603.16171 (MemX): local-first, privacy-preserving, on-device store — aligns with offline/Android constraints and secret exclusion.
- [SOURCE primary] https://arxiv.org/abs/2512.12686 (Memoria): agentic memory framework emphasizing provenance, personalization, lifecycle — supports ledger/provenance needs.
- [SOURCE primary] https://arxiv.org/abs/2601.06037 (TeleMem): multimodal + long-term — future-facing, less immediate for current text-first but signals scope creep risk.
- [SOURCE primary] https://arxiv.org/abs/2609.03467 ("When Users Don't Ask"): context-driven retrieval (proactive recall) — retrieval policy, not just write path. Critical for relevance/budgets.
- [SOURCE primary] https://arxiv.org/abs/2608.30508 (UTILMEM): evidence utilization — tests whether retrieved memories are actually used correctly. Guards against "more memories = better" without utility.
- [SOURCE secondary] https://docs.letta.com/configuration/memory, https://docs.letta.com/v1-sdk/memory/memory-blocks: structured core memory blocks, teach/update lifecycle.
- [SOURCE secondary] https://help.getzep.com/* (Graphiti): episodes as append-only input, facts as immutable relations with timestamps, context types (facts/entities/episodes/thread summaries/observations/user summary) — concrete model for provenance.
- [SOURCE secondary] https://mem0.ai/research: benchmark claims (LoCoMo/LongMemEval scores, token cost) — useful as comparison points but must be measured against Seven baseline, not assumed.
- [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API: storage substrate for large structured data, lifecycle/quota, transactions — directly applicable to browser persistence and restart recovery.
- [SOURCE secondary] https://docs.langchain.com/oss/javascript/deepagents/overview, https://docs.langchain.com/oss/javascript/langgraph/thinking-in-langgraph: orchestration ideas (subagents, planning) — caution against overfitting; must not blur memory ownership.

Disagreements/freshness/limits: temporal KG (Zep) is heavier than pure lexical; Mem0 emphasizes extraction/updates; benchmarks vary. Harvested abstracts are current (2024–2025 vintage in naming) but implementation details vary. Limitations: arXiv abstracts only (full papers not fetched) — treat as design signals; need to validate against measured behavior. No single source is sufficient alone. 

CURRENT=Seven has an explicit Memory Fabric contract embedded in seven_ai-final.html with Node VM tests (memory.cjs). Evidence inspected:

- Contract region: `// ---------- Memory Fabric Architecture Contract` (from memory.cjs extraction). 
- Tests validate: create+ledger consistency, update preserves metadata and appends immutable history, write failure keeps exact snapshot, corruption cannot replace with empty data, metadata never authorizes actions, delete commits ledger with canonical removal, legacy keys unchanged, legacy noncanonical compatibility, duplicate ledger IDs blocked. 
- Storage adapter (test): in-memory Map backed by vm context localStorage-like methods; write failure simulated via `fail=true` throwing QUOTA. 
- Persistence keys: bundle v2 `seven_ai_memory_bundle_v2`; legacy `seven_ai_memory_v1`, `seven_ai_memory_event_ledger_v1` remain unchanged on read paths. 
- Auth boundary: metadata never authorizes actions (test enforces). 
- History is immutable (appended on updates/deletes). 
- Corruption guard prevents overwriting corrupted bundle with empty data. 
- Ledger duplication prevented.

Repo context: .seven-team/memory-v2/* (RESEARCH_SYNTHESIS.md, EXECUTION_PLAN.md, STRIKE_TEAM.md, IMPLEMENTATION_EVIDENCE.md) exists per Memory Fabric v2 priority campaign; ownership A06/B06 with A04/A08/B08/B09/B10. Also SEVEN_AI_ARCHITECTURE_V4.md documents architecture. 

Evidence level: PROVEN for the tested invariants in Node VM with injected adapter. UNPROVEN for: live-chat wiring, temporal correction beyond history append, provenance semantics (beyond ledger events), abstention, restart persistence in real browser/Android, Arabic parity, secret exclusion end-to-end, Android exact-build/WebView lifecycle, live benchmarks vs local lexical baseline. 

TARGET=Local-first memory fabric that preserves Seven identity, enforces proof-policy, and matches measured product needs. Concrete targets:

- Deterministic ledger: append-only history with event identity; prevent cross-memory history overwrite; canonical deletion entries.
- Corruption tolerance + recovery: never auto-replace corrupted state with empty; surface safe recovery paths; snapshot integrity on write failure (already tested).
- Auth boundary: memory metadata must never be authorization input (already enforced). 
- Temporal correctness: capture timestamps for events, consider point-in-time reads (inspired by Zep bi-temporal facts) without premature KG complexity. 
- Provenance: every mutating operation produces ledger entry with actor/context (non-secret). Link to implementation evidence ledger per STRIKE_TEAM.
- Retrieval policy: context-driven recall (UTILMEM/"When Users Don't Ask") with relevance + budget constraints; default to local lexical/temporal baseline until measured win.
- Persistence correctness: real browser IndexedDB (MDN) with transactions, quota handling, restart recovery; Android WebView persistence across lifecycle (B02/A02). 
- Migration discipline: incremental beside legacy (v1 preserved), no destructive rewrites. 
- Parity & safety: Arabic parity for memory UI/content handling where surfaced; secret exclusion (PII/secrets never stored in memory bundles/events). 
- Measurable: benchmark against current local baseline before adding semantic/vector/graph. 

NOW=Smallest coherent slice (evidence-backed):

1. Browser persistence mapping: document and verify IndexedDB-backed bundle persistence (vs localStorage) with quota/fail paths; add deterministic tests for restart recovery (load after simulated restart). Evidence: file refs in HTML/JS persistence code, test. 
2. Provenance fields: extend ledger events with minimal provenance (non-secret) while preserving backward compatibility; validate with existing consistency checks.
3. Retrieval baseline measurement harness: capture relevance/recall metrics on a small fixture (align with LongMemEval style) to establish baseline before complexity. 
4. Secret exclusion audit: scan memory write paths for secret-bearing fields; add guard tests. 
5. Live-chat wiring gap: identify exact integration points (owner A06+B06) and evidence required (no code edit in research). 

NEXT=Improvements building on measured baseline:

- Context-driven retrieval policy (abstain when irrelevant) with token budget enforcement. 
- Temporal correction: point-in-time queries for "what was true at t" using history (incremental vs full KG). 
- Arabic parity test coverage for memory surfaces. 
- Android evidence: WebView lifecycle tests via device/emulator gate (A02/B02). 
- Evidence ledger entries per STRIKE_TEAM for each capability.

LATER=Longer-term (only if measured win):

- Semantic embeddings/vector index (local-only) — require benchmark delta vs baseline. 
- Graph/episodes model closer to Zep only if temporal queries prove necessary and win. 
- Multimodal (TeleMem) — out of scope unless product requires.

TESTS=Deterministic + E2E + Android + adversarial + eval:

- Deterministic (Node VM): extend existing memory.cjs with cases: restart recovery (reload bundle), quota failure on read/write, provenance fields, point-in-time read, abstention (no irrelevant recall), secret exclusion rejection, duplicate ledger prevention (existing), corruption recovery path.
- E2E/browser: persistence roundtrip (IndexedDB), app restart simulation, large bundle quota behavior.
- Android: WebView lifecycle (pause/resume/crash recovery), exact-build identity (A02/B02).
- Adversarial: tampered bundle, ledger injection, history overwrite attempts, metadata-as-auth attempts (existing), legacy collision, cross-session leakage.
- Eval: baseline harness against fixture (LongMemEval-style subsets), UTILMEM-style evidence utilization, "When Users Don't Ask" recall precision/recall, token cost per recall.

RISKS=Security/privacy/performance/Android/RTL/cross-system:

- Security: metadata never auth (must hold). Secret exclusion critical; any new field must be allowlisted. 
- Privacy: local-first (MemX-aligned) — avoid remote sync unless explicitly gated and consented; no secrets in events. 
- Performance: history grows; need truncation/archival policy without breaking ledger consistency; retrieval budget enforcement. 
- Android: WebView storage quotas, lifecycle corruption on crash — requires device/emulator evidence. 
- RTL/Arabic: parity for surfaced memory UI/content. 
- Cross-system: avoid duplicating owners (A06 UI state/persistence vs B06 RPG memory). Live-chat wiring touches UI/kernel; coordination required. No destructive migration (preserve legacy). 

FIRST_SLICE=Browser persistence + provenance minimal + baseline measurement harness. Rationale: smallest set that converts UNPROVEN (restart persistence, provenance) to testable while establishing measured baseline to prevent premature semantic/vector complexity. Files to inspect: seven_ai-final.html (memory contract + persistence), memory.cjs, .seven-team/memory-v2/IMPLEMENTATION_EVIDENCE.md, STRIKE_TEAM.md, ownership.json.

KNOWN_UNKNOWNS=Missing evidence (must remain UNPROVEN until artifacts):

- Live-chat wiring: integration points not fully evidenced in current tests. 
- Restart persistence (real browser/Android): test uses injected adapter; IndexedDB path unverified. 
- Temporal correction/point-in-time queries: history exists but semantics untested. 
- Provenance semantics: events exist conceptually (ledger) but need concrete fields + non-secret guarantee. 
- Abstention/context-driven retrieval: not present; policy unknown. 
- Arabic parity: untested. 
- Secret exclusion end-to-end: untested. 
- Android exact-build state + WebView lifecycle: no device/emulator evidence. 
- Benchmarks vs local lexical baseline: no measured results. 
- Memory evidence ledger entries per STRIKE_TEAM (implementation commit/tests/benchmarks/Android exact-build/known unproven) — not yet populated for new capabilities.

DOMAIN_VERDICT=READY_FOR_PLAN
