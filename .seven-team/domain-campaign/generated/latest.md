# Seven Domain Roadmaps — cycle evidence

Ready domains: 2/30
Only READY domains may drive implementation.

# D01_CHAT_CORE — Chat / Rooms / Composer / Streaming

Research audit: INSUFFICIENT

DOMAIN_ID=D01_CHAT_CORE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D02_MEMORY_CONTEXT — Long-Term Memory / Context Fabric

Research audit: INSUFFICIENT

DOMAIN_ID=D02_MEMORY_CONTEXT
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


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

Research audit: INSUFFICIENT

DOMAIN_ID=D06_RPG_WORLD
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D07_RESEARCH_WEB — Web Research / Retrieval / Citations / Evidence

Research audit: READY

DOMAIN_ID=D07_RESEARCH_WEB

SOURCE_ANALYSIS=Harvested evidence analyzed first per instructions. [SOURCE primary] https://cdn.openai.com/pdf/5e10f4ab-d6f7-442e-9508-59515c65e35d/browsecomp.pdf (BrowseComp PDF) is primary content. [SOURCE secondary] https://link.springer.com/article/10.1007/s42979-026-05134-x returned a client-challenge/JS-disabled loading error (no readable article body harvested) — asset-only harvest. Additional [SOURCE secondary] assets (inter-var.woff2, styles.css) are not content sources. OpenAI BrowseComp page (seed) exists but was not listed as harvested primary/secondary in the provided block. Collectively: sources point to BrowseComp (benchmark for deep web browsing/retrieval under constraints) and a Springer article that failed to load in harvest (harvest=INSUFFICIENT overall). Freshness: BrowseComp materials recent (OpenAI index post + PDF). Limitations: harvested set incomplete relative to source target 12; Springer content not captured (blocked/harvest failure). Need to fetch actual Springer content or substitute with authoritative equivalents; also need retrieval/citation mechanics references. Disagreements: none observed in harvested fragments.

CURRENT=Seven is the 20-agent system described in repo (ARCHITECTURE.md, MILESTONES.md, V4). .seven-team defines domain campaign, product-intelligence, autonomy (constitution/proof policy). Evidence: proof-carrying work is required (.seven-team/autonomy/PROOF_POLICY.md), evidence levels and contracts exist (.seven-team/autonomy). No obvious citation/retrieval subsystem named in top-level architecture summary inspected (remake/ARCHITECTURE.md first 140 lines) — domain is RESEARCH/WEB (retrieval/citations/evidence). Current implementation: research capabilities implied by agent roles/stages, but concrete "web retrieval + citations + evidence cache" modules not surfaced in inspected architecture files yet. Evidence level for this domain in codebase: weak/implicit (roles) vs required proof-carrying. Browser evidence/mock/Android/build/installed-device distinctions exist in agent instructions but subsystem not yet implemented.

TARGET=Desired: deterministic web research pipeline with (a) source tracking (source_id, URL, fetch time, content hash), (b) evidence levels (primary/secondary/tertiary) with required fields, (c) citations attached to claims (claim -> sources[], confidence, evidence_level), (d) freshness/TTL and cache (ETag/Last-Modified, revalidation policy), (e) retrieval with timeouts, robots/terms awareness where applicable, (f) provenance (redirects, final URL), (g) failure taxonomy (network/parse/paywall/js-challenge/captcha) recorded per fetch, (h) duplicate suppression, (i) meeting source target per domain with audit trail. Must integrate with .seven-team/product-intelligence/sources/OFFICIAL_SOURCE_MAP.json and Seven proof-carrying work (invariants + evidence level + UNPROVEN). Preserve Seven identity; do not imitate competitors pixel-for-pixel.

NOW=First high-value slice: define evidence model + source tracking. Create minimal `remake/research/` (or extend existing research area) with `evidence.ts`/`evidence.py` types: Source{source_id,url,title,kind,fetch_time,content_hash,evidence_level,status,failure_reason,redirects,ttl}, Claim{claim_id,text,sources[],confidence,evidence_level,provenance}. Add `citation` formatter (structured, no broken inline markers). Implement fetch wrapper with timeouts, headers, redirect tracking, failure_reason on errors. Wire to cache on disk (hash+ttl) to avoid redundant fetches. Enforce that harvested [SOURCE primary]/secondary are recorded verbatim. Add unit tests for failure taxonomy (including js-challenge case like Springer). This is smallest coherent slice that improves citations/evidence.

NEXT=Next improvements: integrate with domain campaign (read D07 entries, enforce source target 12 with coverage report). Add content extraction (PDF text for BrowseComp PDF) and basic readability for HTML; record content_hash of extracted text. Add robots.txt check (configurable, logged). Add freshness check (staleness warning). Build coverage matrix: required sources vs fetched vs primary vs usable. Expand failure reasons (paywall/captcha/403/429). Cross-link claims to files/commands (evidence in repo) per proof policy.

LATER=Longer-term: re-ranking by authority (map to OFFICIAL_SOURCE_MAP), canonical URL resolution, dedup clusters, citation graph, adversarial tests (redirect loops, chunked, large PDFs), rate limiting, offline cache mode, PII scrubbing in harvested content, Android/edge constraints (if used in mobile context). Consider eval integration for BrowseComp-like retrieval tasks (deterministic fixtures). 

TESTS=Deterministic: unit tests for evidence model, citation formatter, failure taxonomy, cache TTL, redirect tracking. E2E: fixture-based fetch (mock HTTP) to avoid live flaky; include Springer js-challenge fixture (status+body) -> recorded as failure_reason. Adversarial: timeouts, redirects (max), 404/403/429, invalid PDF, truncated HTML. Android: not directly applicable unless fetch runs on device; treat as CLI/agent-side first. Eval: retrieval precision/recall on small gold set; coverage % (sources_fetched / source_target). Proof: each claim requires sources[] non-empty or explicitly UNPROVEN with justification.

RISKS=Security/privacy: avoid storing secrets in cache; PII redaction; respect robots where enabled; don’t follow auth flows. Performance: cache-first, timeouts, max size. Android/RTL: N/A for retrieval layer now. Cross-system: must not weaken proof policy; must preserve architecture (no duplicate owners). Harvest fragility (Springer dynamic) — treat content as unharvested if js-challenge; require explicit fetch success. Citation formatting must follow CLI constraints (no broken inline markers). 

FIRST_SLICE=Add `remake/research/evidence.ts` (types) + `remake/research/fetch.ts` (wrapper+timeouts+redirects+failure_reason) + `remake/research/citations.ts` (formatter) + cache dir + unit tests. Record harvested URLs with their tags into evidence store (even if fetch failed) — this makes harvest explicit and auditable.

KNOWN_UNKNOWNS=Springer article body not captured (client challenge). OpenAI BrowseComp index page content not harvested. Need to determine if Seven needs to execute live fetches now or rely on fixtures+harvested assets. Actual usable content count: PDF (primary, 1) + YarnSpinner (D29, 1) + others secondary/assets only — far below targets (D07 needs 12, D29 needs 8). Source coverage matrix incomplete.

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

SOURCE_ANALYSIS=Harvested: [SOURCE primary] https://www.yarnspinner.dev/docs/ (Yarn Spinner docs) — content harvested (title: "Documentation | Yarn Spinner", note indicates docs). Harvest overall INSUFFICIENT (fetched 1 sources; primary=1; target 8). Seed also includes https://openai.com/index/browsecomp/ (BrowseComp) — cross-domain overlap with D07 (useful for canon/evidence). No other harvested secondary content provided. Freshness: YarnSpinner docs current. Limitations: only 1 primary captured, need 7 more authoritative canon sources (real works, source fidelity, canon branching). Canon branching suggests need to understand how canon is structured/branched (narrative systems often have storylets/branches). Disagreements: none in harvested.

CURRENT=Seven is agent system; canon/branching domain (D29) relates to “real works / source fidelity / canon branching”. Inspected repo: no obvious narrative engine/canon subsystem in remake/ARCHITECTURE.md top lines. SEVEN files focus on agent architecture, polish roadmap, implementation matrix. Current state: product is Seven AI (agentic coding interface context per system) — canon here likely means knowledge canon/source fidelity in research pipeline (not game narrative). Need to confirm against domain intent, but follow assignment: real works/source fidelity/canon branching. Evidence: no existing canon store in inspected code. 

TARGET=Desired: canonical source registry with source fidelity tracking. Canon branching = versioned canon (primary canonical vs branches/variants), with branching rules (provenance, divergence). For each claim, prefer primary canonical source; record variant sources. Requirements: source_id, canonical_url, is_canonical, branch (if any), fidelity_score, verification_status, last_verified, checksum, redirects. Integrate with evidence model (D07) — reuse Source types. Enforce source fidelity (prefer authoritative specs/docs, primary papers). Track canon graph (parent->child branches). Meet target 8 sources with coverage. Preserve Seven identity.

NOW=First high-value slice: extend evidence model with canon fields. Add `canon.ts` types: CanonSource extends Source { is_canonical:boolean, branch?:string, parent_source_id?:string, fidelity_score?:number, verified_at?:Date, verification_method?:string }. Add canonical selection rule (prefer canonical_url match, highest fidelity). Seed canon registry with YarnSpinner docs as primary canonical (real work). Record harvest explicitly.

NEXT=Next improvements: identify 7 more authoritative sources for this domain (target 8). Candidates: authoritative specs for relevant domains, primary papers, recognized benchmarks (BrowseComp is benchmark; also retrieval/citation standards like COICOP? less obvious). But need credible sources per domain campaign. Add branching support: when source has variants (e.g. PDF vs HTML, different versions), record branch. Add verification workflow (periodic check). Cross-reference with OFFICIAL_SOURCE_MAP.

LATER=Longer-term: canon diffing, divergence alerts, immutable canon snapshots, audit log for canon changes, adversarial: canonical spoofing detection (redirects), merge rules. Eval: source fidelity tests.

TESTS=Deterministic: canon fields, canonical selection, branching. E2E: registry CRUD, verification. Adversarial: circular branches, missing parent. Proof: every canon entry has verification_status and evidence of harvest/success.

RISKS=Canon drift; over-branching; mixing game narrative canon (YarnSpinner is narrative tooling) with research canon — need to be precise about domain scope (real works/source fidelity). Don’t conflate with product UI canon. Must not modify autonomy controls. Privacy: registry contains URLs only (no content). Cross-system: reuse D07 types to avoid duplication (ownership).

FIRST_SLICE=Extend `remake/research/evidence.ts` with canon fields; add `remake/research/canon.ts` with registry + canonical selection; seed with YarnSpinner docs [SOURCE primary] harvested. Add unit tests. This is small, reuses types, improves source fidelity.

KNOWN_UNKNOWNS=Domain intent: “real works/canon branching” — could mean narrative canon (YarnSpinner) or knowledge canon. YarnSpinner is a real work (narrative tooling) and docs are canonical source — fits “real works/source fidelity”. Target 8 sources missing (only 1 harvested). Need 7 more credible sources. BrowseComp also relevant (benchmark real work). Cross-domain with D07.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


# D30_AUTONOMOUS_QUALITY — Reality Lab / Evolution Arena / Constitution / Proof / Meta-Team

Research audit: INSUFFICIENT

DOMAIN_ID=D30_AUTONOMOUS_QUALITY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.
