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
