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
SOURCE_ANALYSIS=Harvested 20 sources (11 primary). ArXiv papers (Mem0 2504.19413, Zep/Graphiti 2501.13956, LongMemEval 2410.10813, MemX 2603.16171, Memoria 2512.12686, TeleMem 2601.06037, context-driven retrieval 2609.03467, UTILMEM 2608.30508) converge on: (1) long-term memory must be structured (blocks/knowledge graph) not just raw history, (2) temporal validity (bi-temporal) matters for "what was true when", (3) retrieval must be context-driven not only user-query driven, (4) evidence utilization (UTILMEM) is a separate failure mode from recall. Letta/Zep/Mem0 docs show production patterns (memory blocks, episodes, facts, summaries). MDN IndexedDB confirms client-side structured storage exists. Gaps: local-first hardening, explicit "do not ask" retrieval, and utilization scoring are underrepresented in current Seven evals.
CURRENT=Seven has `memory.cjs` (CLI/memory util) and `memory-results.json`. Evidence: `memory.cjs` reads/writes JSON-like memory state; `memory-results.json` exists at repo root. No obvious agent memory service (vector/graph/indexeddb/blocks) found in top-level files inspected. `remake/ARCHITECTURE.md` not fully read yet but memory appears lightweight/scripted rather than a long-term context fabric. Product intelligence corpus exists at `.seven-team/product-intelligence/` (must be read per rules) but implementation ownership of "memory/context fabric" not clearly visible from root scripts.
TARGET=Local-first long-term memory with: (a) structured memory blocks (core/episodic/semantic/procedural), (b) temporal facts with valid_at/invalid_at, (c) context-driven retrieval (trigger on task/state change without user query), (d) evidence utilization tracking (did retrieved memory change answer/action), (e) deterministic eviction/compression, (f) client storage (IndexedDB) with clear ownership, (g) memory health metrics.
NOW=Inventory memory ownership: trace `memory.cjs` usage, search for "memory", "context", "IndexedDB", "knowledgeGraph", "facts" across repo. Define minimal memory block schema + retrieval hooks. Add memory utilization metric to evals.
NEXT=Add bi-temporal facts, episode ingestion, context-triggered recall, memory block UI/inspection, compression policy.
LATER=Graphiti-style temporal KG, personalization without cross-session leakage, multimodal memory (TeleMem), local sync boundaries.
TESTS=Deterministic unit tests for block CRUD/eviction. Integration test: context-driven retrieval fires without user query. E2E: memory persists across sessions. Eval: LongMemEval-style subset + UTILMEM-style utilization rate. Android: IndexedDB quota/constraints.
RISKS=Privacy (PII in memory), cross-session leakage, stale facts, unbounded growth, retrieval pollution, over-reliance on history. Need explicit retention/forget/clear policies.
FIRST_SLICE=Document memory ownership + schema in one place; add `memory.health` check + utilization counter; wire to existing `verify.cjs`/eval without changing architecture.
KNOWN_UNKNOWNS=Is there an in-app memory service (not just `memory.cjs`)? IndexedDB usage? Memory block ownership? Need to read `remake/ARCHITECTURE.md` fully and search for memory implementation.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need to read ARCHITECTURE, product-intel memory section, and grep for memory service; harvested evidence strong but Seven's actual fabric unknown)


# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: READY

DOMAIN_ID=D03_TOOLS_CAPABILITY
SOURCE_ANALYSIS=Harvested 20 sources (18 primary). MCP 2026-07-28 tools spec, Tasks extension draft, TS SDK v2/migration, OpenAI function/tool calling + programmatic tool calling, BFCL V4, ToolSandbox (stateful/conversational/interactive), tau-bench (tool-agent-user interaction), AgentDojo/AgentDyn/Adaptive evaluation show prompt injection and dynamic env risks. OWASP Top 10 for Agentic 2026 + LLM06 Excessive Agency are critical. Strong signal: capability graph, permissions/scoping, stateful tools, task/continuations, and security evals are required.
CURRENT=Tooling implied by agent architecture (Seven has many specialist agents) but repo inspection shows scripts (`all.cjs`, `verify.cjs`, `runtime-smoke.cjs`) not MCP server implementation. No obvious `tools/` or `capability/` dirs at root. Need to check `remake/` and agent manifests. `.seven-team/` exists but tool schema/permissions not visible from root listing.
TARGET=MCP-aligned tool registry with capability graph, per-tool permissions/scopes, input validation, stateful tool sessions, task lifecycle (MCP Tasks), programmatic/tool orchestration guards, audit logging, deny-by-default, excessive agency prevention.
NOW=Map tool inventory (what tools exist), permission model, schema validation, sandbox boundaries. Compare to MCP 2026-07-28 + Tasks extension.
NEXT=Capability graph with allowlists, tool risk classification, human-in-the-loop for high-risk, task resume/cancel, tool result redaction.
LATER=Dynamic permission elevation with proof, tool composition safety, cross-agent tool boundaries, agentic security tests.
TESTS=Schema conformance tests (MCP), BFCL-style function calling, ToolSandbox scenarios, tau-bench style interactions, AgentDojo injection tests, permission bypass tests. Deterministic.
RISKS=Excessive agency (OWASP LLM06), prompt injection, confused deputy, tool chaining abuse, state leakage, sandbox escape. Critical for release.
FIRST_SLICE=Tool inventory + risk matrix + permission defaults; add tool audit log; block high-risk tools by default with justification required.
KNOWN_UNKNOWNS=Does Seven implement MCP server/client? Tool registry location? Permission model? Need to read architecture + grep for "tool", "mcp", "function", "capability".
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


# D04_CODING_SYSTEM — Coding Agent / Repo Map / Edit-Test-Verify

Research audit: READY

DOMAIN_ID=D04_CODING_SYSTEM
SOURCE_ANALYSIS=Harvested 14 sources (all primary). SWE-bench leaderboards, SWE-agent (NeurIPS 2024), GitHub custom agents docs, SWE-bench FAQ. Clear standard: repo map, issue->patch, test execution, environment setup, evaluation on held tests. Also need edit-test-verify loop, subagents, file system awareness.
CURRENT=Seven is agent team (20 agents) with manager coordination - repo shows `.seven-team/`, agent manifests implied. Scripts like `verify.cjs`, `all.cjs` exist. HTML files (`seven_ai-*.html`) suggest single-file app; coding system may be specialized. Need to see if there's repo map, edit tools, test harness.
TARGET=SWE-bench style loop: repo understanding (map/index), plan, edit with minimal diff, run tests (targeted), verify, iterate. Custom agent roles, context management, failure recovery.
NOW=Assess edit-test-verify: what tests run? `verify.cjs` content, `package.json` scripts, `all.cjs`. Repo map presence.
NEXT=Targeted test selection, failure triage, patch validation, regression guard.
LATER=Repo embedding/map, subagent specialization, tool use optimization.
TESTS=SWE-bench style tasks, unit tests, integration, lint/typecheck if present.
RISKS=Over-editing, breaking architecture, test pollution, slow loops.
FIRST_SLICE=Document coding loop; wire `verify.cjs` to run targeted tests; add failure report format.
KNOWN_UNKNOWNS=Actual coding agent implementation vs scripts. Need to read verify.cjs/all.cjs/package.json fully.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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

Research audit: READY

DOMAIN_ID=D07_RESEARCH_WEB
SOURCE_ANALYSIS=Harvested 4 sources (1 primary). BrowseComp (OpenAI) paper/pdf + leaderboard context, Springer article blocked by challenge. BrowseComp tests ability to browse web and find hard-to-locate info with citation/verification. Implies need for retrieval, source tracking, citation, evidence quality.
CURRENT=Research stage exists in cycle; domain campaign with seed URLs. Need to see if web research tool exists and how citations tracked.
TARGET=BrowseComp-aligned: query decomposition, source selection, evidence extraction, citation with URLs, verification, avoid hallucinated sources. Track source quality.
NOW=Review domain campaign usage, source tracking. Ensure URLs recorded with [SOURCE primary]/[SOURCE secondary].
NEXT=Citation format, source allowlist (OFFICIAL_SOURCE_MAP), freshness checks.
LATER=Multi-hop retrieval, contradiction detection, evidence strength scoring.
TESTS=BrowseComp subset, citation accuracy, source existence checks.
RISKS=Hallucinated URLs, paywalls, stale info, missing primary sources.
FIRST_SLICE=Enforce URL recording + source map validation; add citation linter.
KNOWN_UNKNOWNS=Web research implementation. Harvest insufficient (only 1 primary accessible) - need to read BrowseComp paper if cached or fetch gaps carefully.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


# D08_MODEL_ROUTING — Model Routing / Provider Health / Fallback

Research audit: INSUFFICIENT

DOMAIN_ID=D08_MODEL_ROUTING
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D09_DEEP_THINK — Deep Think / Planning / Verification / Progress

Research audit: INSUFFICIENT

DOMAIN_ID=D09_DEEP_THINK
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


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

Research audit: READY

DOMAIN_ID=D18_TESTING_EVALS
SOURCE_ANALYSIS=Harvested 12 sources (10 primary). SWE-bench, BFCL, BrowseComp, Playwright visual comparisons/emulation. Strong emphasis on deterministic tests, snapshots, browser emulation, regression proof. Release evidence required.
CURRENT=Scripts: `verify.cjs`, `runtime-smoke.cjs`, `all.cjs`. `eval/` dir exists. HTML builds exist. Need to see test structure, coverage, gates.
TARGET=Layered gates: unit/contract/integration/E2E, mutation (where feasible), visual regression, browser evidence, Android build evidence, installed-device evidence. Proof-carrying: evidence level per change.
NOW=Read verify.cjs/runtime-smoke.cjs/all.cjs, list eval/, check package.json test scripts.
NEXT=Deterministic fixtures, snapshot baselines, flake tracking, evidence bundles.
LATER=Mutation testing, eval harness, regression dashboard, release gate policy.
TESTS=All layers + adversarial. Must distinguish browser/mock/Android build/installed-device evidence per rules.
RISKS=Flaky tests, weakened guards, missing release evidence, false PASS.
FIRST_SLICE=Map test inventory + gates; add evidence level tagging; enforce "no weaken tests" rule in checks.
KNOWN_UNKNOWNS=Actual test framework. Need to inspect files.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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

Research audit: READY

DOMAIN_ID=D24_RELEASE_APK
SOURCE_ANALYSIS=Harvested 10 sources (all primary). Android app signing, Play App Signing, core app quality guidelines. Need signing identity, versioning, keystore/security, build reproducibility, quality checks.
CURRENT=`apk/` dir exists, `release/` dir exists, `capacitor.config.json` exists. HTML app likely wrapped. Need to see signing config, build scripts.
TARGET=Reproducible release: signing identity documented, versionCode/name, minSdk/targetSdk, ProGuard/R8 if applicable, core app quality checks, installed-device evidence, artifact checksums.
NOW=Inspect apk/, release/, capacitor.config.json, build scripts.
NEXT=Signing verification, versioning policy, quality gate checklist, evidence bundle.
LATER=Automated release checks, attestation, update policy.
TESTS=Install on device/emulator, core app quality tests, signing validation.
RISKS=Leaked keystore, unsigned/wrongly signed APK, versioning errors, missing quality evidence.
FIRST_SLICE=Document signing identity + build steps; add APK checksum + install evidence template.
KNOWN_UNKNOWNS=Signing state, actual APKs. Need inspection.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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

Research audit: INSUFFICIENT

DOMAIN_ID=D29_REAL_WORKS_CANON
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D30_AUTONOMOUS_QUALITY — Reality Lab / Evolution Arena / Constitution / Proof / Meta-Team

Research audit: READY

DOMAIN_ID=D30_AUTONOMOUS_QUALITY
SOURCE_ANALYSIS=Harvested 14 sources (13 primary). SWE-bench, Playwright snapshots, OWASP MASVS, OpenTelemetry semconv. Reality Lab/Evolution Arena/Constitution/Proof/Meta-team imply self-improvement with governance. Need proof-carrying work, invariants, judge rules, evidence levels.
CURRENT=`evolution/` dir exists. `.seven-team/autonomy/` exists (proof policy, judge rules mentioned in instructions). Must not modify them. Need to read autonomy contracts.
TARGET=Constitutional governance: invariants, proof policy, evidence levels, blocked conditions, regression baselines, meta-eval. Deterministic judges.
NOW=Read `.seven-team/autonomy/` fully, evolution/, understand proof-carrying requirements.
NEXT=Map invariants touched by changes, evidence bundle format, judge criteria.
LATER=Self-eval harness, regression detection, safe evolution boundaries.
TESTS=Constitution compliance, invariant checks, proof validation.
RISKS=Modifying governance to pass, weak proof, unprovable claims.
FIRST_SLICE=Document autonomy contracts + evidence requirements; enforce proof-carrying in reports.
KNOWN_UNKNOWNS=Autonomy implementation. Critical to read before changes.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
