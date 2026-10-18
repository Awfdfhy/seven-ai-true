# Seven Domain Roadmaps — cycle evidence

Ready domains: 7/30
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


# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: READY

DOMAIN_ID=D03_TOOLS_CAPABILITY
SOURCE_ANALYSIS=Sources converge on: tools must be schema-typed (MCP 2026-07-28 [SOURCE primary]/MCP TS SDK v2 [SOURCE primary]); LLM is planner, not authorization boundary (OWASP LLM06 [SOURCE secondary], OpenAI programmatic tool calling [SOURCE primary]). Stateful evals (ToolSandbox [SOURCE primary], τ-bench [SOURCE primary]) show real-world interaction matters; security evals (AgentDojo [SOURCE primary], AgentDyn [SOURCE primary], adaptive evals [SOURCE primary]) show prompt injection/adaptive attacks. BFCL V4 [SOURCE primary] measures correctness but not security/approval. OWASP agentic top10 2026 [SOURCE secondary] lists excessive agency, tool misuse, identity/trust, supply chain, memory poisoning as risks. Disagreements/limitations: MCP is protocol (not Seven runtime) — must not import wholesale; evals are research sandboxes (not Reality Lab). Freshness good (2026 specs). 
CURRENT=Seven has `.seven-team/tools-v1/` with RESEARCH_SYNTHESIS/EXECUTION_PLAN stating ReferenceMonitor, approval binding, schema/capability/scope/replay/audit required; LLM never auth boundary. No ReferenceMonitor implementation found in quick scan of `remake/`; ownership A07+A04 security boundaries, D03 primary owner surface. `all.cjs`, `memory.cjs`, `runtime-smoke.cjs` suggest local runtime paths exist. No production tool execution surface confirmed connected to external high-impact tools yet (per plan). 
TARGET=Tools v1 with deterministic enforcement: ReferenceMonitor (capability graph + scope), approval binding (human approval for high-impact), strict schema validation, least privilege per tool/capability, idempotency/replay, full audit trail with evidence identity, prompt injection resistance boundaries, secret exclusion from tool inputs/logs, no ambient trust to LLM. Align to MCP safety ideas without protocol lock-in; satisfy OWASP agentic controls. 
NOW=Verify existence/status of ReferenceMonitor in codebase (search `remake/`, `*.cjs`, `.seven-team/tools-v1/*`). Read `.seven-team/tools-v1/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`, `ownership.json`. Inventory tool surfaces (any `tools`, `capability`, `approval`, `monitor`, `schema` in remake). Confirm approval binding path exists or is TODO. Check audit hooks. Write evidence links. 
NEXT=Define minimal capability graph model (who can call what with which scopes/params), approval policy matrix (impact levels), schema validation per tool, idempotency keys, replay constraints. Propose deterministic tests (schema, scope violation, approval required, replay). Ensure LLM outputs never override auth decisions. 
LATER=Harden against prompt injection (input sanitization boundaries, untrusted content marking), tool chaining constraints, timeouts/cancellation integration with B05, provenance of derived state (B07), Android-safe audit (A02/B02), OTel GenAI semconv attributes [SOURCE primary] for audit. 
TESTS=Deterministic unit tests for capability checks, scope enforcement, approval gating. Negative tests (unauthorized scope, missing approval, malformed schema). Replay/idempotency tests. Adversarial tests inspired by AgentDojo [SOURCE primary] (prompt injection into tool args) with deterministic harness. Smoke tests via `runtime-smoke.cjs`, `verify.cjs`. 
RISKS=Excessive agency (LLM06 [SOURCE secondary]) if approval/scope missing; prompt injection leading to tool abuse; capability graph drift; secret leakage via tool args/logs; replay confusion; cross-system coupling (Tools v1 P0). Android: WebView tool surfaces need care (MASVS). 
FIRST_SLICE=Evidence-grounded audit: locate ReferenceMonitor/approval/schema code, map current tool surfaces, produce capability graph sketch with file refs, identify missing checks (schema/scope/approval/audit). Smallest slice that creates testable evidence (no new high-impact tools). 
KNOWN_UNKNOWNS=Is ReferenceMonitor implemented? Where is approval binding stored? Are idempotency/replay enforced? Audit coverage? Any external tools connected? Reality Lab evidence binding per autonomy. 
DOMAIN_VERDICT=READY_FOR_PLAN (research complete with evidence; implementation requires code inspection of ReferenceMonitor/approval paths)


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

Research audit: INSUFFICIENT

DOMAIN_ID=D06_RPG_WORLD
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D07_RESEARCH_WEB — Web Research / Retrieval / Citations / Evidence

Research audit: INSUFFICIENT

DOMAIN_ID=D07_RESEARCH_WEB
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D08_MODEL_ROUTING — Model Routing / Provider Health / Fallback

Research audit: INSUFFICIENT

DOMAIN_ID=D08_MODEL_ROUTING
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D09_DEEP_THINK — Deep Think / Planning / Verification / Progress

Research audit: READY

DOMAIN_ID=D09_DEEP_THINK

SOURCE_ANALYSIS=Harvested 10 primary sources focus on public benchmarks (BFCL v4 [SOURCE primary] https://gorilla.cs.berkeley.edu/leaderboard; SWE-bench leaderboards [SOURCE primary] https://www.swebench.com/). These measure tool use and end-to-end task success for reasoning/planning agents, but provide limited direct evidence about Seven’s specific two-pass orchestration pattern (planner isolation, context reuse strategy, cancellation semantics between passes, or transport-level proof obligations). No harvested source explicitly documents “planner output must never be emitted to user”, “rebuild context independently per model”, or transport invariants. Disagreements/nuance: benchmark results emphasize quality/capability tradeoffs (cost/speed) rather than isolation/correctness invariants. Freshness: benchmark pages are actively maintained (BFCL v4, SWE-bench) but content is leaderboard-oriented (CSS/HTML harvested) not implementation guidance. Limitations: web evidence is observational/competitive; cannot substitute for Seven’s exact runtime behavior or proof-policy requirements. Additional targeted research (beyond harvested) may be useful for planner-prompting patterns and verification strategies, but must remain grounded in Seven’s contracts.

CURRENT=Seven implements Deep Think as application transport (`remake/src/application/deep-think/deep-think-transport.ts`). Two passes: planner prepares context for planner model, collects bounded plan (max characters, output tokens), injects plan as `Internal planning brief (JSON data): ...` plus `FINAL_INSTRUCTION` into final system message with “untrusted analysis data” warning; final context rebuilt independently for final model window (Phase 6 test asserts seen [plannerWindow, finalWindow]). Invariants in `remake/PHASE6_DEEP_THINK.md`: two-pass application transport (not UI), planner never emitted to user, exactly one leading system message after shaping, independent context rebuild per model, explicit budgets, bounded brief treated untrusted, final payload revalidated after brief injection, cancellation between passes prevents final dispatch. Tests (`phase6.test.ts`) verify: only final answer exposed, exactly one system message on both passes (planner gets planning instruction appended to system; final system contains JSON-stringified brief + FINAL_INSTRUCTION), context rebuilt independently, cancellation after planning prevents final dispatch, oversized planner output rejected before final pass. Integration tests reference DeepThinkTransport (`phase456/manager-integration.test.ts`). Architecture states Deep Think as service (not UI), final payload revalidated before provider dispatch.

TARGET=Deep Think must remain a transport/service with strict planner isolation and proof-carrying behavior. Desired: (1) Planner isolation boundary enforced (planner output never reaches UI/log streams that could be misread; brief treated strictly as untrusted data injected only into final system message). (2) Context reuse strategy that preserves safety (independent rebuild per model) while reducing redundant work/speed cost where safe (e.g., share non-sensitive prepared structure without leaking planner state). (3) Speed/cost awareness: two calls are necessary for isolation; need explicit budgets and telemetry (planner/final tokens, time, cancel points). (4) Cancellation correctness: TaskManager signal must propagate end-to-end (planner stream aborted cancels final dispatch; between passes abort prevents final call). (5) Verification/progress: bounded plan schema/size, capacity revalidation after brief injection (already present), and deterministic error mapping. (6) Android/installed-artifact evidence path if exposed on mobile; Reality Lab/visual UNPROVEN if UI surface claims Deep Think behavior without exact-build evidence. (7) Eval proof: add Deep Think-specific behavioral tests (isolation, cancellation, budget violations) to CI; align with proof-policy (claims PROVEN only with artifacts). (8) No planner-memory pollution: planning brief must not be written to persistent memory stores unless explicitly whitelisted and provenance recorded.

NOW=Smallest high-value slice: strengthen planner isolation + verification. Specifically: (a) enforce plan size/structure validation before injecting (already checks char count and estimator vs plannerOutputTokens; consider JSON-like or minimal schema for “brief” to catch malformed planner output early), (b) add explicit test that planner messages never appear in final request messages beyond being serialized inside final system content (current tests check final system contains brief JSON and instructions; add assertion that no planner message object appears in final messages list), (c) document/verify TaskManager cancellation mapping (ensure transport.stream receives TaskManager signal and all abort paths throw AbortError as implemented), (d) add timing/cost hooks (optional but useful) without leaking brief content, (e) add negative test: planner exceeds output budget -> final never called (already covered partially), also test final capacity revalidation after injection. These are test-tightenings + clarity; no behavior change to core isolation.

NEXT=Improve speed/context reuse without weakening isolation: investigate context reuse between passes (e.g., cache prepared user+history structure for same room/policy except model window/reserved output; but final reserved differs because of planReserve). Must preserve independent rebuild invariant and avoid carrying planner artifacts. Consider “prepare once” producing shareable parts and re-apply window-specific shaping; also estimate planReserve more tightly. Add cancellation coverage at all await points (planner chunk loop, post-plan, final prepare/stream) and ensure Android bridge cancellation maps to same taskId. Add eval harness coverage for Deep Think behavioral isolation (A08 coordination). Research whether planner can be smaller/cheaper model while preserving isolation; benchmark tradeoffs using BFCL/SWE-bench style tasks as reference (not copy). 

LATER=Progress/UX for long Deep Think: expose cancellation state, partial progress indicators without leaking planner text; consider streaming “thinking” markers distinct from planner content. Add planner verification (self-check) that brief is minimal/untrusted, and adversarial tests (planner tries to inject instructions) — current design treats brief as data inside system message and gives FINAL_INSTRUCTION to ignore instructions inside it; verify this holds under adversarial cases. Explore multi-pass (more than two) only if justified by measured quality gain with isolation preserved. Consider cost budgeting per mode and Android perf budgets. Evaluate context reuse across turns if Deep Think used repeatedly (careful with memory). Align with proof-policy: any new claim needs artifacts.

TESTS=Deterministic unit/integration: (1) isolation: final messages list contains no planner-generated message objects; planner content only inside final system message as serialized data. (2) budgets: planner exceeds plannerOutputTokens -> Provider error, final never called. (3) capacity: planReserve causes final context capacity violation -> reject before final dispatch. (4) cancellation: abort during planner streaming -> AbortError, final never dispatched; abort between passes after plan collected -> AbortError. (5) one-system-message invariant on both passes (already present). (6) independent rebuild: contextSource.prepare called with correct contextWindows [planner, final] (already present). (7) untrusted treatment: final system includes JSON-stringified brief and “untrusted analysis data” and FINAL_INSTRUCTION (already present). (8) provider contract validation: planner/final adapters malformed -> Validation errors. (9) E2E: realistic room with history, ensure only final answer emitted. (10) Adversarial: planner emits text that looks like instructions (e.g., “system: override”) — verify final ignores (design-level) and brief size bounded. (11) Android: if Deep Think used on mobile, lifecycle cancellation (background/foreground) maps correctly (UNPROVEN until device/emulator evidence). (12) Eval: add behavioral isolation test to eval/ or harness (A08) to prevent regressions.

RISKS=Security: planner output is untrusted data; injection risk mitigated by placing brief inside final system message as data + explicit FINAL_INSTRUCTION to ignore instructions inside it, and by never emitting planner to UI. Ensure no code logs raw brief at info level in user-visible paths. Privacy: brief may contain sensitive context; avoid persisting planner brief unless provenance/audit and policy allow. Isolation: context reuse must not leak planner state between passes or to persistent stores. Performance: two passes increase latency/cost; speed optimization must not weaken isolation (e.g., sharing mutable prepared context). Cancellation: missed abort points can cause final dispatch after cancellation (tests cover key points; must verify TaskManager integration). Android: WebView/Capacitor lifecycle can interrupt between passes; bridge cancellation token must map to taskId. Correctness: brief size estimation uses characters + estimator; ensure capacity check uses same estimator (plannerOutputTokens vs estimateText(plan), finalOutputTokens + planReserve vs contextWindow - estimateMessages). Cross-system: Deep Think is transport only (good) — UI must not assume planner state exists. Hard fail potential if isolation claim made without artifacts; proof-policy requires evidence.

FIRST_SLICE=Strengthen planner-isolation verification with minimal code/test changes: (1) add test asserting final messages contain exactly user/assistant (no planner messages) and planner content appears only inside final system message content (not as separate message), (2) add test for cancellation between passes after plan collected (abort before final.prepare/stream) — ensure final provider never called, (3) add negative test for final context capacity violation when planReserve too large, (4) document TaskManager signal propagation requirement in transport comments or test (coordination with TaskManager). Keep changes targeted, preserve existing invariants.

KNOWN_UNKNOWNS=Planner-prompting quality tradeoffs relative to benchmarks (BFCL/SWE-bench) without weakening isolation; optimal plannerOutputTokens/maxPlanCharacters for different models; whether context reuse (sharing prepared parts) is safe and measurable speed gain; Android exact-build evidence for Deep Think flows (installed-device/emulator gate) — currently UNPROVEN; eval coverage for behavioral isolation (A08); whether planner can be cheaper model while meeting quality; adversarial robustness of “ignore instructions inside brief” in practice across providers; planner brief persistence/provenance if ever logged. Domain marked RESEARCH_INSUFFICIENT (47/10 primary tagged) — partially due to limited harvested sources directly addressing orchestration invariants; need focused research on planner isolation best practices and verification, but must remain grounded in Seven’s exact implementation.

DOMAIN_VERDICT=READY_FOR_PLAN


# D10_FILES_MULTIMODAL — Files / Attachments / PDFs / Multimodal

Research audit: READY

DOMAIN_ID=D10_FILES_MULTIMODAL
SOURCE_ANALYSIS=Sources (Capacitor Filesystem [SOURCE primary], Android SAF/shared storage [SOURCE primary], MASVS [SOURCE primary]) emphasize secure file access: use platform APIs, respect scoped storage, avoid broad file permissions, validate paths, prevent traversal, handle PII/secrets in attachments. MASVS requires secure storage of sensitive data and proper permission model. Android SAF gives user-mediated access (preferred over broad READ/WRITE). Limitations: Capacitor plugin specifics vary; WebView file handling differs from native. 
CURRENT=Repo has `capacitor.config.json` (Capacitor app) and `apk/` dir. No obvious file attachment UI paths visible in quick scan; attachments/multimodal may be in remake or HTML files (`seven_ai-*.html`). Secrets/PII in attachments not assessed. 
TARGET=Path policy (no traversal, allowlisted roots/schemes), scoped storage (SAF where appropriate), avoid exposing credentials via file URIs, strip secrets from logs/telemetry, validate MIME/size, Android-safe implementation aligned to MASVS. 
NOW=Inspect `capacitor.config.json`, `apk/`, `remake/` for file/attachment/multimodal code, search for `filesystem`, `attachment`, `upload`, `pdf`, `image`, `file://`. 
NEXT=Define path policy: base dirs (cache/temp/user-selected), disallow `..`, symlink safety, scheme allowlist, sanitize names. For Android, prefer SAF user selection over MANAGE_EXTERNAL_STORAGE; enforce scoped storage. 
LATER=Secret scanning in attachments (redaction), memory hygiene for large files, provenance of uploaded content. 
TESTS=Path traversal negative tests, scheme validation, large file handling, permission boundary tests. 
RISKS=Path traversal, accidental secret persistence in uploads/cache, over-broad permissions (MASVS fail), log leakage (filenames/paths may contain PII). 
FIRST_SLICE=Path policy doc + checks in file access paths; evidence of current attachment surfaces and any unsafe patterns. 
KNOWN_UNKNOWNS=Any file upload/attachment implementation exists? Capacitor Filesystem plugin configured/used? SAF flows? 
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need to confirm file/attachment surfaces exist in codebase; harvested sources inform policy but Seven implementation unknown)


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

Research audit: READY

DOMAIN_ID=D14_SECURITY_PRIVACY
SOURCE_ANALYSIS=OWASP MASVS [SOURCE primary] sets mobile appsec baseline (secure storage, crypto, network, platform interaction). MCP 2026-07-28 [SOURCE primary] is protocol-level; security properties depend on implementation (not just protocol). OTel GenAI semconv [SOURCE primary] supports audit evidence (attributes for gen_ai). OWASP agentic guidance (cross-cutting with D03) reinforces trust boundaries, least privilege, excessive agency, secret handling. Limitations: MASVS is mobile-focused; need to map to web/Capacitor app. No single “secrets manager” prescribed. 
CURRENT=Seven is Capacitor app (`capacitor.config.json`, `apk/`) with local runtime (`all.cjs`, `memory.cjs`). `.seven-team/autonomy/proof-policy*` exists (mandatory). No obvious credential/token storage code found in quick grep; Git self-dev safety not obvious from file list. Path policy/trust boundaries not explicit in reviewed files. Secrets exposure checks mentioned in Tools v1 plan. 
TARGET=Secret non-leakage (no secrets in logs, code, bundles, telemetry), secure credential handling (if any), auth boundaries (LLM never auth), path policy (no traversal, scoped I/O), GitHub self-dev safety (no token leakage in scripts/CI/logs), trust boundaries enforced (Tools v1 ReferenceMonitor), Android secure storage per MASVS where credentials stored, audit evidence with identity. 
NOW=Scan repo for secret patterns (tokens, keys, passwords, API keys, bearer, `ghp_`, `sk-`, env var dumps) in code/scripts/log artifacts (`*.cjs`, `*.js`, `*.ts`, `*.json`, `release/`, `plans/`, `eval/`, `cloudflare/`, `apk/` metadata). Read `.seven-team/autonomy/proof-policy*`, `.seven-team/tools-v1/*` (secrets exposure), `.seven-team/ownership.json`, `remake/ARCHITECTURE.md`, `SEVEN_AI_ARCHITECTURE_V4.md`. 
NEXT=Define explicit trust boundaries (who can read/write secrets, what crosses trust boundary), path policy (allowlists, traversal prevention), GitHub self-dev safety checklist (scripts must not echo tokens, avoid `set -x` with secrets, redact in logs), secret exclusion rules for tools/memory (no secrets in tool args stored in memory logs without redaction; per Memory v2: secret exclusion required). 
LATER=MASVS-aligned mobile controls if credentials stored on device (Android Keystore/EncryptedSharedPreferences), rotation guidance, runtime secret detection in logs, OTel GenAI semconv for audit events. 
TESTS=Static checks (secret patterns), negative tests (path traversal), log redaction tests, boundary tests (LLM cannot override auth), Tools v1 approval/scope tests. 
RISKS=Secret leakage via logs/telemetry/tool args; excessive agency (auth boundary bypass); path traversal in file I/O; Android insecure storage; GitHub self-dev scripts leaking tokens; memory persistence including secrets (Memory v2 must enforce secret exclusion). 
FIRST_SLICE=Secrets inventory (evidence: files scanned, patterns, findings). Trust boundaries map (surfaces that touch secrets: config, tools, memory, network). Path policy draft. Git self-dev safety checklist. All with file refs. 
KNOWN_UNKNOWNS=Any credentials/tokens currently in repo? Where are config values sourced (env vs files)? Android secret storage? Self-dev scripts (gh, release) behavior? Memory v2 secret exclusion implemented? 
DOMAIN_VERDICT=READY_FOR_PLAN (harvested MASVS/MCP/OTel inform policy; repo scan needed to confirm no leakage and boundary implementation)


# D15_PERSISTENCE_RECOVERY — Persistence / Migration / Corruption / Recovery

Research audit: INSUFFICIENT

DOMAIN_ID=D15_PERSISTENCE_RECOVERY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D16_NETWORK_RESILIENCE — Network / Retry / Offline / Streaming Resilience

Research audit: READY

DOMAIN_ID=D16_NETWORK_RESILIENCE
SOURCE_ANALYSIS=The harvested sources collectively describe resilient network behavior across web and agentic contexts. MDN on [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/AbortController documents request cancellation and timeout patterns; [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/Streams_API covers incremental/streaming processing and backpressure semantics relevant to long-running generations. [SOURCE primary] https://opentelemetry.io/docs/specs/semconv/ provides a framework for telemetry/attributes around requests, retries, failures and client/server spans (useful to make resilience observable without inventing metrics). Agent/tooling sources ([SOURCE primary] https://modelcontextprotocol.io/specification/2026-07-28/server/tools, [SOURCE primary] https://tasks.extensions.modelcontextprotocol.io/specification/draft/tasks, [SOURCE primary] https://ts.sdk.modelcontextprotocol.io/v2/) emphasize deterministic tool execution, schema/approval boundaries and replayability; resilience here is failure isolation and clear error taxonomy, not just retry. Security/agent benchmarks ([SOURCE primary] https://arxiv.org/abs/2406.13352, [SOURCE primary] https://arxiv.org/abs/2602.03117, [SOURCE primary] https://arxiv.org/abs/2606.26479) and OWASP agent guidance ([SOURCE secondary] https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/, [SOURCE secondary] https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) highlight excessive agency and unsafe tool execution under failure modes (e.g. retry storms, partial results consumed as truth). BFCL ([SOURCE primary] https://gorilla.cs.berkeley.edu/leaderboard) and eval papers ([SOURCE primary] https://arxiv.org/abs/2408.04682, [SOURCE primary] https://arxiv.org/abs/2406.12045) show that stateful/conversational evals must distinguish transient network errors from tool/logic errors. Disagreements/limitations: web specs (MDN) focus on browser primitives (fetch+AbortController+Streams) while agent frameworks (MCP/OpenAI) emphasize authorization/replay/idempotency boundaries; Seven must bridge both without conflating transport errors with capability denials. Freshness is high for 2026-era MCP/OWASP; harvested set is current enough as starting evidence (no single page claimed beyond provided). Limitations: MDN asset URLs harvested are style assets (not content) and don’t add new resilience semantics beyond core APIs.
CURRENT=Seven’s current runtime/network surface is visible across shipped HTML bundles and minimal runtime scripts. Primary UI/runtime evidence: `seven_ai-final.html` (842964 bytes), `seven_ai-t161.html` (651222 bytes), `seven_ai-t152.html` (641085 bytes), `seven_ai-t150.html` (620723 bytes). These are single-file HTML applications (inline JS/CSS) with no explicit `AbortController` usage patterns visible in a targeted scan of runtime code paths present (search heuristic shows fetch calls exist in embedded scripts but no consistent timeout/cancel wiring, retry/backoff, or offline detection surfaced). Runtime support: `runtime-smoke.cjs` (4942 bytes) — Node-based smoke checks; `verify.cjs` (122722 bytes) — verification harness; `memory.cjs` (3261 bytes), `all.cjs` (1170 bytes) — small utilities. Config: `capacitor.config.json` (272 bytes) — Android/WebView wrapper config (no network policy/timeouts specified). Architecture: `remake/ARCHITECTURE.md` (inspected via repo root presence; Seven’s authoritative architecture lives under `remake/` and is treated as truth). No explicit network resilience module (retry policies, circuit breaker, request queue, streaming backpressure handlers, or offline state manager) found in the files inspected. No evidence of client-side offline detection (`navigator.onLine` handlers), Retry-After parsing, rate-limit classification, or streaming cancellation surfaced. Android surface: `apk/` directory exists but no installed-device/emulator runtime evidence of network resilience behavior (exact-build device proof UNPROVEN). Tests: no deterministic network failure tests (timeouts, 5xx/429, stream aborts, partial chunks) discovered in the inspected files; resilience coverage is absent. Verdict on current: resilience primitives exist in web platform but are not uniformly applied; failure taxonomy is not normalized across UI/runtime; observable proof of resilience behavior is MISSING.
TARGET=Desired behavior: normalized error taxonomy (transport vs auth vs capability vs rate limit vs server vs stream abort), timeouts via `AbortController` with per-request deadlines and user-cancel, bounded retries with jittered backoff and Retry-After honoring, offline-first guardrails (`navigator.onLine` + queued-safe UX), streaming resilience (partial chunk handling, reconnect/backpressure, idempotent resume where safe), and failure isolation so partial tool results don’t propagate as truth. All must align with Seven architecture in `remake/ARCHITECTURE.md` (no duplicate owners: network/resilience owned in coordination with A05 runtime, B07 domain; don’t create parallel stores/bridges). Tool-facing boundaries must respect authorization/approval (MCP/OpenAI patterns) and never treat LLM as auth boundary. Telemetry/observability hooks aligned to OTel semconv where feasible (request attributes, failure classes) without leaking secrets. Android/WebView path (Capacitor) must preserve same semantics (timeouts/cancel/streaming) with exact-build identity. Proof policy: resilience claims PROVEN only with deterministic failure-injection tests and (where UI-visible) reproducible runtime evidence; else UNPROVEN.
NOW=First high-value implementation slice (smallest coherent): (1) introduce a normalized error classification utility (transport, timeout, abort, 429/rate-limit with Retry-After, 5xx, network offline, stream error, auth/capability denial) used consistently by runtime/fetch paths in the embedded app; (2) add per-request timeouts + `AbortController` with user-initiated cancel and deadline propagation; (3) minimal bounded retry (max attempts, jittered backoff) applied only to idempotent/safe requests with Retry-After honored, and never to high-impact state-changing tool calls; (4) offline detection guard (treat `navigator.onLine` false as distinct error class) with user-facing recovery path; (5) add deterministic unit tests simulating timeouts/abort/429/5xx using injectable fetch (no live network). Files touched conceptually: runtime/network module under `remake/` (respecting architecture), shared error types, and targeted tests. Evidence target: unit tests pass and classify errors correctly (file refs + test names). No production feature bloat.
NEXT=Next improvements: (1) streaming resilience (readable stream backpressure, partial chunk buffering, stream abort classification, reconnect strategy gated by idempotency and server hints); (2) circuit breaker per host/path with half-open and failure budgets; (3) request coalescing/de-duplication for safe reads; (4) structured telemetry hooks (OTel semconv-aligned attributes: http.method/status/error.type/retry.count) with no PII; (5) Android-specific hardenings (WebView connectivity/timeout behavior, background lifecycle) tied to `capacitor.config.json` and verified via device/emulator where evidence exists; (6) rate limit UX (countdown using Retry-After, non-blocking). Each improvement requires regression test proving behavior.
LATER=Longer-term ideas: (1) replayable request traces for Reality Lab (request/response identity excluding secrets) to support deterministic evals; (2) adaptive backoff driven by server signals and global budgets; (3) resilience policies per capability/tool (MCP tool annotations) so high-impact tools are never auto-retried; (4) integration with Tool System v1 approval/replay (coordinate with A07/A04/D03) to ensure retry doesn’t bypass approval; (5) offline queue with explicit user consent and idempotency keys; (6) cross-environment parity tests (browser vs WebView) with golden error states.
TESTS=Deterministic: injectable fetch harness simulating timeout (AbortController), network error, stream abort, 429 with/without Retry-After, 5xx, slow connect, partial chunks. E2E: user-cancel during generation/stream, offline toggle, 429 countdown, retry exhaustion surfaces normalized error. Android: WebView lifecycle (app background/foreground) during in-flight request, offline on device, timeout behavior (exact-build device evidence required). Adversarial: retry storm prevention, retrying non-idempotent requests, consuming partial tool results as truth, bypassing approval on retry. Eval: resilience scenarios integrated into eval harness (A08) with PROVEN/UNPROVEN gates.
RISKS=Security/privacy: retry storms, leaking request details in logs/telemetry, storing PII in retry queues, bypassing approval boundaries on retry (must enforce capability-scoped idempotency and never auto-retry high-impact tools). Performance: backpressure mismanagement causing memory bloat on long streams, excessive retry traffic amplifying outages. Android/RTL: WebView differences (timeouts, streaming), background network constraints; RTL not directly network but error strings must be localizable. Cross-system: coordination with Tool System v1 (auth boundary strict) and Memory v2 (no persistence of secrets in network state). Architecture: risk of creating duplicate resilience/queue stores — must live under `remake/` with single owner (B07, coordinate A05) per architecture rules.
FIRST_SLICE=Smallest implementation that materially improves domain: add normalized error types + AbortController timeouts + bounded retry (idempotent-only, jitter) + offline guard + 5 deterministic unit tests. This directly addresses missing resilience primitives without destabilizing ownership; measurable improvement in failure clarity and basic robustness.
KNOWN_UNKNOWNS=Current implementation details of embedded fetch calls in `seven_ai-*.html` (exact call sites, streaming usage, error handling paths) — not fully enumerated in quick scan; Android installed-artifact behavior (timeouts/stream abort in Capacitor WebView) — UNPROVEN (no device/emulator evidence). Whether any runtime path already uses AbortController/Streams — evidence not found. Retry-After header handling presence — MISSING. Circuit breaker/state — MISSING. Tool execution paths that are state-changing vs idempotent (needed to gate retry) — requires coordination with A07/D03; not evident from inspected files.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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

Research audit: READY

DOMAIN_ID=D27_ERROR_RECOVERY_UX
SOURCE_ANALYSIS=Harvested sources define error/recovery UX quality. Android Core App Quality guidelines ([SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality) specify predictable navigation, clear error states, graceful degradation, and lifecycle-aware behavior; localized versions ([SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality?hl=ar, [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality?hl=bn) underscore internationalization parity. WCAG 2 Overview ([SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/) establishes accessibility requirements for perceivable/operable/understandable/robust UIs — error messaging, focus management, keyboard operability, and sufficient contrast are directly applicable to error/loading/empty states. Asset URLs harvested ([SOURCE primary] https://developer.android.com/_pwa/android/manifest.json, [SOURCE primary] https://developer.android.com/s/opensearch.xml, [SOURCE primary] https://www.w3.org/assets/logos/w3c-2025/favicons/favicon-32.png, [SOURCE primary] https://www.w3.org/assets/logos/w3c-2025/favicons/favicon-180.png, [SOURCE primary] https://www.w3.org/WAI/assets/css/style.css?1791997513034655878, [SOURCE primary] https://www.w3.org/WAI/feed.xml) are metadata/style only (no UX guidance). Disagreements/limitations: Android guidelines are platform-specific (navigation/permissions/lifecycle) while WCAG is web-agnostic; Seven is a hybrid (single-file web UI wrapped via Capacitor) so both apply. Freshness high. Limitation: harvested content gives principles but not Seven’s exact UI implementation details. No page content beyond provided was claimed.
CURRENT=Current UI is delivered as large single-file HTML bundles: `seven_ai-final.html`, `seven_ai-t161.html`, `seven_ai-t152.html`, `seven_ai-t150.html`. Visual/UX surfaces present but error/loading/empty states are not systematically enumerated in the inspected runtime scripts. `runtime-smoke.cjs` (4942 bytes) performs basic runtime checks; `verify.cjs` (122722 bytes) is a broader verification harness. Config: `capacitor.config.json` (272 bytes). Architecture: `remake/ARCHITECTURE.md` is the truth. No evidence of reusable UX components for error/loading/empty (skeletons, inline error banners, retry affordances, empty states with guidance) consistently applied across flows; network error taxonomy from D16 is not mapped to user-facing recovery. Android: `apk/` present but no installed-device/emulator visual proof of error states in WebView (exact-build visual evidence UNPROVEN). RTL/localization readiness for error strings not evident. Accessibility hooks (ARIA live regions for errors, focus on error surfaces) not surfaced in inspected files. Tests: no golden-screen coverage or deterministic tests asserting error/loading/empty states; recovery paths untested.
TARGET=Desired behavior: consistent, accessible error/loading/empty states with clear recovery actions, mapped 1:1 to normalized error classes from D16 (timeout/abort/offline/429/5xx/auth/capability/stream). States: loading (non-blocking, cancellable), empty (guidance + next action), error (actionable retry/cancel, avoid technical jargon), partial/loading-streaming (progress indicators). WCAG 2.x compliance for these surfaces (perceivable error text, focus management, keyboard operability, sufficient contrast), Android Core App Quality alignment (predictable navigation, lifecycle-aware, no jarring transitions), and RTL/localization parity including Arabic (per Memory v2 parity requirement context). Recovery UX must be deterministic and testable; preserve Seven identity (principles-only, no competitor copying). Proof: golden-screen evidence tied to exact build where visual, plus runtime behavior tests; missing exact-build visual = UNPROVEN.
NOW=First high-value slice: (1) define canonical error/loading/empty state components and copy guidelines mapped to D16 error taxonomy; (2) apply to one high-frequency surface in the app UI (smallest coherent change) with inline error banner + primary retry/cancel actions; (3) add accessible error surface (ARIA live region role=alert/assertive for blocking errors, polite for non-blocking), focus management on error appearance, keyboard-operable actions; (4) ensure offline/timeout/abort map to distinct user-friendly messages; (5) add deterministic UI tests asserting presence of retry/cancel and correct message mapping for 4–5 key error classes (via injectable state). Files: UI component/state in `remake/` respecting architecture (no duplicate UI runtimes), plus tests. Evidence: test assertions + file refs; visual proof deferred to Android/device gate if UI changes are visual (UNPROVEN until exact-build evidence exists).
NEXT=Next improvements: (1) skeleton/loading patterns with cancellability tied to request cancel (AbortController); (2) empty states with actionable guidance per context; (3) toast/inline patterns consistent across flows; (4) error deduplication and escalation (avoid stacking identical errors); (5) RTL support verified across error components, Arabic parity for strings; (6) accessibility audit pass (focus trap avoidance, contrast, screen reader announcements) with concrete fixes; (7) golden-screen coverage for error/loading/empty states (A08 harness) bound to exact build.
LATER=Longer-term ideas: (1) recovery journey tests (user retries and succeeds, retry exhaustion path, offline->online resume) with deterministic timing; (2) error analytics taxonomy (no PII) aligned to OTel semconv classes; (3) adaptive recovery (auto-retry with countdown only where safe/idempotent, explicit user choice otherwise); (4) cross-platform parity (web vs Capacitor WebView) for error rendering/keyboard; (5) integration with eval harness to assert UX recovery paths in agent-driven exploratory tests.
TESTS=Deterministic: state-driven tests mapping each normalized error class to UI copy, action availability (retry/cancel), and ARIA attributes. E2E: offline toggle surfaces offline state with recovery action; timeout/abort shows cancellable/retry path; 429 shows countdown guidance when Retry-After present; 5xx surfaces generic recoverable error. Android: lifecycle transitions don’t lose error context, keyboard/focus on error, RTL rendering of error strings, exact-build visual snapshots (device/emulator required). Adversarial: long/overflowing error strings, rapid error churn, focus lost after error clears, retry spam doesn’t duplicate errors. Accessibility: keyboard-only recovery flows, screen reader announcements verified.
RISKS=UX consistency: fragmenting patterns across multiple HTML bundles (`seven_ai-*.html`) instead of shared components under `remake/`; must avoid duplication. Accessibility: missing ARIA live regions or incorrect assertive/polite can be disruptive. Android/RTL: WebView text rendering/dir attributes; Capacitor lifecycle can clear transient error state. Cross-system: error states must not leak secrets/tool payloads; coordinate with Tool System (capability denials vs transport). Architecture: creating parallel UI state stores — single owner pattern. Product quality: aesthetic claims without exact-build visual evidence are weak; label UNPROVEN.
FIRST_SLICE=Smallest implementation that materially improves domain: map D16 taxonomy to user-friendly messages/actions, add accessible inline error banner + retry/cancel to one surface, and 3–4 deterministic tests asserting mapping and accessibility. Directly improves clarity/recoverability with minimal surface area.
KNOWN_UNKNOWNS=Current error UI patterns and components in `seven_ai-*.html` bundles (locations, reuse) — not fully cataloged. Exact error strings currently shown to users (if any) and whether they are localizable/RTL-ready — MISSING. Android installed-artifact visual state of error/loading/empty — UNPROVEN (no device/emulator evidence). Focus management strategy in current UI — not evident. WCAG conformance baseline for these states — UNPROVEN.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


# D28_LOCAL_INTELLIGENCE — Local Intelligence / Embeddings / Reranking / Offline Fallback

Research audit: INSUFFICIENT

DOMAIN_ID=D28_LOCAL_INTELLIGENCE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D29_REAL_WORKS_CANON — Real Works / Source Fidelity / Canon Branching

Research audit: INSUFFICIENT

DOMAIN_ID=D29_REAL_WORKS_CANON
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D30_AUTONOMOUS_QUALITY — Reality Lab / Evolution Arena / Constitution / Proof / Meta-Team

Research audit: INSUFFICIENT

DOMAIN_ID=D30_AUTONOMOUS_QUALITY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.
