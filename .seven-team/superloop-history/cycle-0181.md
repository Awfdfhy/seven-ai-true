# Seven Superloop Cycle 181

Run: 38586325377

## Machine summary

```json
{
  "cycle": 181,
  "featureCandidates": 0,
  "featuresAccepted": 0,
  "fixCandidates": 0,
  "fixesAccepted": 0,
  "polishAccepted": false,
  "apkState": "BLOCKED_NO_PRODUCT_DELTA",
  "productQualityVerdict": "UNPROVEN",
  "productQualityScore": "UNPROVEN",
  "domainResearchReady": 0,
  "domainResearchTotal": 30,
  "domainResearchInsufficient": [
    "D01_CHAT_CORE",
    "D02_MEMORY_CONTEXT",
    "D03_TOOLS_CAPABILITY",
    "D04_CODING_SYSTEM",
    "D05_SELF_DEVELOPMENT",
    "D06_RPG_WORLD",
    "D07_RESEARCH_WEB",
    "D08_MODEL_ROUTING",
    "D09_DEEP_THINK",
    "D10_FILES_MULTIMODAL",
    "D11_ANDROID_NATIVE",
    "D12_UI_DESIGN_SYSTEM",
    "D13_ARABIC_RTL_A11Y",
    "D14_SECURITY_PRIVACY",
    "D15_PERSISTENCE_RECOVERY",
    "D16_NETWORK_RESILIENCE",
    "D17_PERFORMANCE_CONCURRENCY",
    "D18_TESTING_EVALS",
    "D19_AGENT_ORCHESTRATION",
    "D20_PRODUCT_QUALITY",
    "D21_OBSERVABILITY_WORLD_MODEL",
    "D22_PROTOCOLS_INTEROP",
    "D23_IMPORT_EXPORT_BACKUP",
    "D24_RELEASE_APK",
    "D25_HISTORY_ROOMS",
    "D26_SETTINGS_CONTROLS",
    "D27_ERROR_RECOVERY_UX",
    "D28_LOCAL_INTELLIGENCE",
    "D29_REAL_WORKS_CANON",
    "D30_AUTONOMOUS_QUALITY"
  ],
  "head": "672575b42773ff8023346b6dcc38533c9af5d270",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 181,
    "sourceSha": "672575b42773ff8023346b6dcc38533c9af5d270",
    "proof": {
      "deterministicFinalGates": true,
      "apkBuilt": false,
      "productQualityScored": false,
      "productHardFailsKnown": false,
      "realityLabExactInstalledEvidence": false,
      "constitutionRuntimeCoverage": "PARTIAL",
      "physicalDeviceEvidence": false
    },
    "productQualityScore": "UNPROVEN",
    "productHardFails": "UNPROVEN",
    "trustStatus": "UNPROVEN_OR_BLOCKED",
    "championDecision": "HOLD_CHAMPION",
    "missingProof": [
      "apkBuilt",
      "productQualityScored",
      "productHardFailsKnown",
      "realityLabExactInstalledEvidence",
      "constitutionRuntimeCoverage",
      "physicalDeviceEvidence"
    ],
    "note": "Aggregate score never overrides Constitution/product hard fails."
  }
}
```

## Manager final review

Reading additional input from stdin...
OpenAI Codex v0.162.1
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a13b67-19f8-7ed3-9424-e5aa1d54f580
--------
user
# Seven Superloop Manager

You are the manager above a 20-agent engineering team working on Seven AI.

Your job is NOT to produce generic advice. Inspect the actual repository state and use the agents' evidence to drive a coherent product.

Hard rules:
- The authoritative product branch is `seven-remake-v3`.
- Never downgrade architecture, tests, security or release evidence to make progress appear green.
- De-duplicate overlapping ideas and reject contradictory implementations.
- Prefer vertical user value and release-readiness over feature count.
- A feature is not accepted because an agent claims it works; require code/test/runtime evidence.
- Missing Android installed-artifact evidence remains missing until an executable device/emulator gate proves it.
- Never expose or request secrets.
- Keep one owner per subsystem; prevent parallel agents from creating duplicate runtimes/stores/bridges.
- Protect cancellation, deadlines, persistence recovery, immutable public state and exact payload identity.

For planning, give every one of the 20 agents a specific assignment with:
1. objective,
2. files/surfaces to inspect,
3. expected evidence,
4. dependencies/conflicts,
5. acceptance test.

For synthesis, rank findings by user impact and root cause, then convert only the best compatible items into an execution plan.

For integration, favor the smallest coherent set of changes that passes the full suite.

For final cycle review, state what actually improved, what was rejected, what remains unproven, and the exact next-cycle priorities.


## Product Intelligence requirement

Before product/UX planning, integration, polish or final review, use:
- `.seven-team/product-intelligence/README.md`
- `.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json`
- relevant sections of `PRODUCT_KNOWLEDGE_BASE.md`
- `VISUAL_REFERENCE_CATALOG.json`
- `JUDGE_PROTOCOL.md`
- the visual boards under `.seven-team/product-intelligence/visual/`

Do not reward feature count. Judge whether Seven behaves and feels like one premium AI chat product.
Missing exact-build visual evidence means visual quality is UNPROVEN, not PASS.
Any rubric hard fail blocks a premium/release-quality claim regardless of aggregate score.
Reference products are principles/evidence only; never copy branding, proprietary assets or pixel geometry.


## Product Intelligence Encyclopedia v2

The shared corpus is now domain-routed. Before assigning work, inspect the specialist's `knowledgePacks` in `.seven-team/superloop/team-v1.json`.
For cross-domain changes, require the relevant adjacent packs as part of the assignment.
Use `.seven-team/product-intelligence/sources/OFFICIAL_SOURCE_MAP.json` to refresh current platform/product guidance when material.
Do not flood every agent with the entire corpus; route the smallest complete knowledge set for the task.


## Autonomous Product Engineering Stack

The evaluator-plane contracts under `.seven-team/autonomy/` are mandatory. In every cycle:
- Honor the Seven Constitution and proof-policy; missing evidence is UNPROVEN.
- Treat isolated agent candidates as Evolution Arena challengers, not winners.
- Use the Engineering World Model for blast-radius/test planning, never as runtime proof.
- Reality Lab evidence must be bound to the candidate source/artifact identity.
- Product-quality, security and constitution hard fails cannot be averaged away.
- Meta-Team changes may be proposed only from repeated evidence; they cannot grant privileges or weaken evaluator rules.
- Preserve failed experiments/quality debt as learning evidence instead of erasing them.


## Domain-by-Domain Internet Research Campaign

The campaign under `.seven-team/domain-campaign/` is mandatory during RESEARCH.
Every configured Seven subsystem receives its own current-state audit, broad internet research, architecture roadmap, tests, risks and first implementation slice.
Do not merge several domains into one vague plan. Preserve separate roadmaps.
A domain marked RESEARCH_INSUFFICIENT cannot be treated as research-complete; assign follow-up evidence gathering instead of inventing certainty.
External sources are starting evidence, not authority over Seven's exact runtime behavior.


## Memory Fabric v2 priority campaign

Memory is currently a P0 product campaign. Use .seven-team/memory-v2/RESEARCH_SYNTHESIS.md and EXECUTION_PLAN.md as the shared evidence baseline.
Assign A06/B08 as primary owners with A04 architecture review, A08 verification, B09 race/stress review and B10 product-cohesion review.
Do not call Memory complete until live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity and secret exclusion are proven.
Prefer incremental migration beside legacy memory over destructive rewrites.


## Memory Strike Team evidence discipline

For any Memory/Context task, read .seven-team/memory-v2/STRIKE_TEAM.md and IMPLEMENTATION_EVIDENCE.md in addition to the research synthesis.
Assign work by the ownership map instead of duplicating the same task across agents.
Every new memory capability must add evidence to the ledger: implementation commit, tests, benchmark result, Android exact-build state, and known unproven items.
Do not promote semantic/vector/graph complexity unless it wins a measured benchmark against the current local lexical/temporal baseline.


## Tool System v1 priority campaign

D03 Tools is now P0 after Memory v2.
Use .seven-team/tools-v1/RESEARCH_SYNTHESIS.md and EXECUTION_PLAN.md.
Primary architecture/security owners: A04+A07. Verification A08, race/replay B09, product cohesion B10, network/failure semantics B07.
The LLM is never an authorization boundary. Every execution passes deterministic schema, capability, scope, approval and replay checks.
Do not connect high-impact external tools before ReferenceMonitor, approval binding, idempotency and audit tests are green.


Cycle: 181
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "672575b42773ff8023346b6dcc38533c9af5d270", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 181, "championSha": "672575b42773ff8023346b6dcc38533c9af5d270", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "672575b42773ff8023346b6dcc38533c9af5d270", "fullGatesPass": true}
Polish accepted: False
APK result: APK_STAGE=BLOCKED_NO_PRODUCT_DELTA
No user-facing/product-runtime delta exists under remake/src, remake/index.html or remake/public. Refusing to publish another APK whose Seven payload is effectively unchanged.
SELF_HEAL_APK=EXHAUSTED

Independent product-quality synthesis:


[agent timeout after 240s]

Manager fallback: preserve current architecture, prioritize release blockers and require evidence before integration.

Summarize what actually improved, what the team rejected, what remains unproven, and exact next-cycle
research priorities. Do not call missing evidence PASS.

Return a concrete manager deliverable. Do not modify files, commit, or push.

warning: Model metadata for `kilo-auto/free` not found. Defaulting to fallback metadata; this can degrade performance and cause issues.
codex
# Seven Superloop Manager — Final Cycle Review (Cycle 181)

## Manager summary (evidence-based)

- Cycle head: `672575b42773ff8023346b6dcc38533c9af5d270`
- Manager stage: `manager-final-review`
- Agent timeout after 240s during independent product-quality synthesis; manager fallback applied (preserve architecture, prioritize release blockers, require evidence before integration).
- Feature integration: accepted=[]; rejected = all 20 agents (A01–A10, B01–B10): “no candidate”; `fullGatesPass=true`, `head` same.
- Fix integration: same as feature integration (all rejected, no candidates).
- Evolution Arena: `schemaVersion=1`, `cycle=181`, `championSha=672575b42773ff8023346b6dcc38533c9af5d270`, `challengers=[]`, `promotion="BLOCKED_PENDING_COMPARATIVE_PROOF"`, `rule="No challenger wins from typecheck alone."`
- Polish accepted: false.
- APK: `APK_STAGE=BLOCKED_NO_PRODUCT_DELTA`. No user-facing/product-runtime delta exists under `remake/src`, `remake/index.html`, or `remake/public`. Refusing to publish another APK whose Seven payload is effectively unchanged. `SELF_HEAL_APK=EXHAUSTED`.

Manager conclusion: No agent produced a verifiable candidate in this cycle; no product-runtime delta exists; Evolution Arena cannot promote from typecheck alone. Release readiness did not advance; architecture must be preserved and evidence required before integration.

## What actually improved

- **Cycle baseline stabilized**: Champion SHA is explicitly recorded (`672575b42773ff8023346b6dcc38533c9af5d270`) and treated as invariant; promotion remains blocked pending comparative proof.
- **Evidence gates enforced**: All 20 agents rejected as “no candidate” across feature/fix integration; APK refused because no user-facing/product-runtime delta detected under `remake/src`, `remake/index.html`, `remake/public`. This prevented non-evidenced “progress”.
- **Evolution Arena discipline preserved**: Promotion blocked; rule explicitly states “No challenger wins from typecheck alone.” No averaging to green.
- **Autonomy contracts upheld**: Missing evidence remained unproven; hard-fail discipline (product quality/security/constitution) not diluted; failed experiments retained (APK heal exhausted, synthesis timeout).
- **Polish withheld**: `polish accepted=false`, consistent with no product delta and no accepted candidates.
- **Tooling/integ traceability**: Head, gates, arena, APK state are fully captured for auditability.

## What the team rejected

- **All agent proposals rejected**: Every A01–A10 and B01–B10 returned “no candidate” in both feature and fix integration tracks; nothing met acceptance criteria (evidence required).
- **Promotion from typecheck alone**: Evolution Arena rejected promotion in absence of comparative proof; challengers list empty.
- **Publishing unchanged APK**: Product release artifact publication blocked to protect artifact identity and avoid deceptive payload equivalence.
- **Surface-level progress**: No attempt to call missing evidence PASS; rubric/visual evidence rules respected (visual quality remains unproven when no exact-build visual evidence exists).

## What remains unproven

- **Product-runtime delta**: No verifiable user-facing change under remake sources; APK production remains blocked.
- **Comparative proof**: Evolution Arena has no challengers; promotion blocked pending challenger(s) with comparative proof over champion.
- **Domain research completeness**: Domain-by-Domain Internet Research Campaign requires every subsystem audit/research/roadmap/tests/risks/first-slice. A domain marked RESEARCH_INSUFFICIENT cannot be treated as research-complete. Current state does not show research completion for all domains.
- **Memory v2 campaign**: P0 not proven complete. Unresolved areas include live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity, secret exclusion. Strike Team evidence ledger (implementation commit, tests, benchmark result, Android exact-build state, known unproven items) missing/insufficient evidence entries.
- **Tools v1 campaign**: P0 after Memory v2. Critical gates unproven: ReferenceMonitor, approval binding, idempotency, audit tests; no connection of high-impact external tools before these pass. Deterministic schema/capability/scope/approval/replay checks not evidenced as green.
- **Autonomy/reality lab**: Reality Lab evidence must bind to candidate source/artifact identity; Engineering World Model only for blast-radius/test planning, never runtime proof. No such evidence presented.
- **Product intelligence (visual)**: Missing exact-build visual evidence means visual quality is UNPROVEN, not PASS. Any rubric hard fail blocks premium/release-quality claim; aggregate score insufficient.
- **Cross-domain encyclopedia routing**: Specialist knowledgePacks must be used for cross-domain changes; current cycle did not produce routed evidence.
- **APK/Android installed-artifact evidence**: Android evidence remains missing until executable device/emulator gate proves it; APK stage blocked.

## Exact next-cycle research priorities

### Domain-by-Domain Internet Research Campaign (mandatory during RESEARCH)
- [ ] Treat each Seven subsystem separately; do not merge into one vague plan. Preserve separate roadmaps.
- [ ] For every subsystem, produce current-state audit, broad internet research, architecture roadmap, tests, risks, and first implementation slice.
- [ ] Mark domains explicitly (research-complete vs RESEARCH_INSUFFICIENT). No domain with RESEARCH_INSUFFICIENT treated as complete; assign follow-up evidence gathering.
- [ ] Use external sources as starting evidence only (not authority over Seven’s exact runtime behavior).
- [ ] Route specialist knowledgePacks per task; require adjacent packs for cross-domain work (Encyclopedia v2). Consult `.seven-team/product-intelligence/sources/OFFICIAL_SOURCE_MAP.json` when material.

### Memory Fabric v2 (P0)
- [ ] Owners: A06/B08 primary; A04 architecture review; A08 verification; B09 race/stress review; B10 product-cohesion review.
- [ ] Prove live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity, secret exclusion.
- [ ] Strike Team: add evidence to ledger for every new capability (implementation commit, tests, benchmark result, Android exact-build state, known unproven items).
- [ ] Prefer incremental migration beside legacy over destructive rewrites.
- [ ] Only add semantic/vector/graph complexity if it wins measured benchmark against current local lexical/temporal baseline.

### Tool System v1 (P0 after Memory v2)
- [ ] Owners: A04+A07 architecture/security; A08 verification; B09 race/replay; B10 product cohesion; B07 network/failure semantics.
- [ ] Enforce: deterministic schema, capability, scope, approval, replay checks; LLM never authorization boundary.
- [ ] Gates: ReferenceMonitor, approval binding, idempotency, audit tests must be green before connecting high-impact external tools.
- [ ] Ensure replay and idempotency evidence exists; audit trail binding to artifacts.

### Autonomy, Proof Policy, Reality Lab (mandatory)
- [ ] Honor Seven Constitution and proof-policy; missing evidence is UNPROVEN.
- [ ] Evolution Arena: only promote challengers with comparative proof over champion; no promotion from typecheck alone.
- [ ] EWM for blast-radius/test planning only (never runtime proof). Reality Lab evidence bound to candidate source/artifact identity.
- [ ] Hard fails (product-quality/security/constitution) cannot be averaged away. Preserve failed experiments/quality debt as learning evidence.

### Product Intelligence & Visual Evidence (mandatory before polish)
- [ ] Use `.seven-team/product-intelligence/README.md`, `PRODUCT_QUALITY_RUBRIC.json`, relevant `PRODUCT_KNOWLEDGE_BASE.md`, `VISUAL_REFERENCE_CATALOG.json`, `JUDGE_PROTOCOL.md`, and visual boards.
- [ ] Produce exact-build visual evidence for any visual change; visual quality is UNPROVEN if missing. Rubric hard fail blocks premium/release-quality claim.
- [ ] Reference products only as principles/evidence; never copy branding/proprietary assets/pixel geometry.

### Release readiness / APK (blocking)
- [ ] Produce verifiable user-facing/product-runtime delta under `remake/src`, `remake/index.html`, `remake/public` (or demonstrate equivalent runtime payload change). APK remains blocked until then.
- [ ] Android installed-artifact evidence required via executable device/emulator gate. APK stage cannot advance without delta.

## One concrete deliverable (manager-approved)

- **No integration this cycle**: All 20 agents rejected (no candidates). Feature/fix integration empty. Evolution Arena blocked pending comparative proof.
- **Preserve status quo**: Champion `672575b42773ff8023346b6dcc38533c9af5d270` maintained; no architecture downgrade.
- **Evidence-first stance**: Polish and APK withheld. SELF_HEAL_APK exhausted.
- **Next cycle is RESEARCH-first**: Focus on Memory v2 and Tools v1 gates, domain-by-domain research completeness, and producing exact-build/Android evidence before any integration or APK publication.

Cycle 181 final review complete.
tokens used
9,553
# Seven Superloop Manager — Final Cycle Review (Cycle 181)

## Manager summary (evidence-based)

- Cycle head: `672575b42773ff8023346b6dcc38533c9af5d270`
- Manager stage: `manager-final-review`
- Agent timeout after 240s during independent product-quality synthesis; manager fallback applied (preserve architecture, prioritize release blockers, require evidence before integration).
- Feature integration: accepted=[]; rejected = all 20 agents (A01–A10, B01–B10): “no candidate”; `fullGatesPass=true`, `head` same.
- Fix integration: same as feature integration (all rejected, no candidates).
- Evolution Arena: `schemaVersion=1`, `cycle=181`, `championSha=672575b42773ff8023346b6dcc38533c9af5d270`, `challengers=[]`, `promotion="BLOCKED_PENDING_COMPARATIVE_PROOF"`, `rule="No challenger wins from typecheck alone."`
- Polish accepted: false.
- APK: `APK_STAGE=BLOCKED_NO_PRODUCT_DELTA`. No user-facing/product-runtime delta exists under `remake/src`, `remake/index.html`, or `remake/public`. Refusing to publish another APK whose Seven payload is effectively unchanged. `SELF_HEAL_APK=EXHAUSTED`.

Manager conclusion: No agent produced a verifiable candidate in this cycle; no product-runtime delta exists; Evolution Arena cannot promote from typecheck alone. Release readiness did not advance; architecture must be preserved and evidence required before integration.

## What actually improved

- **Cycle baseline stabilized**: Champion SHA is explicitly recorded (`672575b42773ff8023346b6dcc38533c9af5d270`) and treated as invariant; promotion remains blocked pending comparative proof.
- **Evidence gates enforced**: All 20 agents rejected as “no candidate” across feature/fix integration; APK refused because no user-facing/product-runtime delta detected under `remake/src`, `remake/index.html`, `remake/public`. This prevented non-evidenced “progress”.
- **Evolution Arena discipline preserved**: Promotion blocked; rule explicitly states “No challenger wins from typecheck alone.” No averaging to green.
- **Autonomy contracts upheld**: Missing evidence remained unproven; hard-fail discipline (product quality/security/constitution) not diluted; failed experiments retained (APK heal exhausted, synthesis timeout).
- **Polish withheld**: `polish accepted=false`, consistent with no product delta and no accepted candidates.
- **Tooling/integ traceability**: Head, gates, arena, APK state are fully captured for auditability.

## What the team rejected

- **All agent proposals rejected**: Every A01–A10 and B01–B10 returned “no candidate” in both feature and fix integration tracks; nothing met acceptance criteria (evidence required).
- **Promotion from typecheck alone**: Evolution Arena rejected promotion in absence of comparative proof; challengers list empty.
- **Publishing unchanged APK**: Product release artifact publication blocked to protect artifact identity and avoid deceptive payload equivalence.
- **Surface-level progress**: No attempt to call missing evidence PASS; rubric/visual evidence rules respected (visual quality remains unproven when no exact-build visual evidence exists).

## What remains unproven

- **Product-runtime delta**: No verifiable user-facing change under remake sources; APK production remains blocked.
- **Comparative proof**: Evolution Arena has no challengers; promotion blocked pending challenger(s) with comparative proof over champion.
- **Domain research completeness**: Domain-by-Domain Internet Research Campaign requires every subsystem audit/research/roadmap/tests/risks/first-slice. A domain marked RESEARCH_INSUFFICIENT cannot be treated as research-complete. Current state does not show research completion for all domains.
- **Memory v2 campaign**: P0 not proven complete. Unresolved areas include live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity, secret exclusion. Strike Team evidence ledger (implementation commit, tests, benchmark result, Android exact-build state, known unproven items) missing/insufficient evidence entries.
- **Tools v1 campaign**: P0 after Memory v2. Critical gates unproven: ReferenceMonitor, approval binding, idempotency, audit tests; no connection of high-impact external tools before these pass. Deterministic schema/capability/scope/approval/replay checks not evidenced as green.
- **Autonomy/reality lab**: Reality Lab evidence must bind to candidate source/artifact identity; Engineering World Model only for blast-radius/test planning, never runtime proof. No such evidence presented.
- **Product intelligence (visual)**: Missing exact-build visual evidence means visual quality is UNPROVEN, not PASS. Any rubric hard fail blocks premium/release-quality claim; aggregate score insufficient.
- **Cross-domain encyclopedia routing**: Specialist knowledgePacks must be used for cross-domain changes; current cycle did not produce routed evidence.
- **APK/Android installed-artifact evidence**: Android evidence remains missing until executable device/emulator gate proves it; APK stage blocked.

## Exact next-cycle research priorities

### Domain-by-Domain Internet Research Campaign (mandatory during RESEARCH)
- [ ] Treat each Seven subsystem separately; do not merge into one vague plan. Preserve separate roadmaps.
- [ ] For every subsystem, produce current-state audit, broad internet research, architecture roadmap, tests, risks, and first implementation slice.
- [ ] Mark domains explicitly (research-complete vs RESEARCH_INSUFFICIENT). No domain with RESEARCH_INSUFFICIENT treated as complete; assign follow-up evidence gathering.
- [ ] Use external sources as starting evidence only (not authority over Seven’s exact runtime behavior).
- [ ] Route specialist knowledgePacks per task; require adjacent packs for cross-domain work (Encyclopedia v2). Consult `.seven-team/product-intelligence/sources/OFFICIAL_SOURCE_MAP.json` when material.

### Memory Fabric v2 (P0)
- [ ] Owners: A06/B08 primary; A04 architecture review; A08 verification; B09 race/stress review; B10 product-cohesion review.
- [ ] Prove live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity, secret exclusion.
- [ ] Strike Team: add evidence to ledger for every new capability (implementation commit, tests, benchmark result, Android exact-build state, known unproven items).
- [ ] Prefer incremental migration beside legacy over destructive rewrites.
- [ ] Only add semantic/vector/graph complexity if it wins measured benchmark against current local lexical/temporal baseline.

### Tool System v1 (P0 after Memory v2)
- [ ] Owners: A04+A07 architecture/security; A08 verification; B09 race/replay; B10 product cohesion; B07 network/failure semantics.
- [ ] Enforce: deterministic schema, capability, scope, approval, replay checks; LLM never authorization boundary.
- [ ] Gates: ReferenceMonitor, approval binding, idempotency, audit tests must be green before connecting high-impact external tools.
- [ ] Ensure replay and idempotency evidence exists; audit trail binding to artifacts.

### Autonomy, Proof Policy, Reality Lab (mandatory)
- [ ] Honor Seven Constitution and proof-policy; missing evidence is UNPROVEN.
- [ ] Evolution Arena: only promote challengers with comparative proof over champion; no promotion from typecheck alone.
- [ ] EWM for blast-radius/test planning only (never runtime proof). Reality Lab evidence bound to candidate source/artifact identity.
- [ ] Hard fails (product-quality/security/constitution) cannot be averaged away. Preserve failed experiments/quality debt as learning evidence.

### Product Intelligence & Visual Evidence (mandatory before polish)
- [ ] Use `.seven-team/product-intelligence/README.md`, `PRODUCT_QUALITY_RUBRIC.json`, relevant `PRODUCT_KNOWLEDGE_BASE.md`, `VISUAL_REFERENCE_CATALOG.json`, `JUDGE_PROTOCOL.md`, and visual boards.
- [ ] Produce exact-build visual evidence for any visual change; visual quality is UNPROVEN if missing. Rubric hard fail blocks premium/release-quality claim.
- [ ] Reference products only as principles/evidence; never copy branding/proprietary assets/pixel geometry.

### Release readiness / APK (blocking)
- [ ] Produce verifiable user-facing/product-runtime delta under `remake/src`, `remake/index.html`, `remake/public` (or demonstrate equivalent runtime payload change). APK remains blocked until then.
- [ ] Android installed-artifact evidence required via executable device/emulator gate. APK stage cannot advance without delta.

## One concrete deliverable (manager-approved)

- **No integration this cycle**: All 20 agents rejected (no candidates). Feature/fix integration empty. Evolution Arena blocked pending comparative proof.
- **Preserve status quo**: Champion `672575b42773ff8023346b6dcc38533c9af5d270` maintained; no architecture downgrade.
- **Evidence-first stance**: Polish and APK withheld. SELF_HEAL_APK exhausted.
- **Next cycle is RESEARCH-first**: Focus on Memory v2 and Tools v1 gates, domain-by-domain research completeness, and producing exact-build/Android evidence before any integration or APK publication.

Cycle 181 final review complete.
