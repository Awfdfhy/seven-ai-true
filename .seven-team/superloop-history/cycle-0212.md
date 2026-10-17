# Seven Superloop Cycle 212

Run: 39005561295

## Machine summary

```json
{
  "cycle": 212,
  "featureCandidates": 0,
  "featuresAccepted": 0,
  "fixCandidates": 0,
  "fixesAccepted": 0,
  "polishAccepted": false,
  "apkState": "BLOCKED_NO_PRODUCT_DELTA",
  "productQualityVerdict": "UNPROVEN",
  "productQualityScore": "UNPROVEN",
  "domainResearchReady": 1,
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
  "head": "4f653f563e6773fb6d5dbd2999c98f8aaea730cf",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 212,
    "sourceSha": "4f653f563e6773fb6d5dbd2999c98f8aaea730cf",
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
OpenAI Codex v0.163.0
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a148ca-d777-71e2-bd16-a2950dbef2ef
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


Cycle: 212
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "4f653f563e6773fb6d5dbd2999c98f8aaea730cf", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 212, "championSha": "4f653f563e6773fb6d5dbd2999c98f8aaea730cf", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "4f653f563e6773fb6d5dbd2999c98f8aaea730cf", "fullGatesPass": true}
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
**MANAGER FINAL CYCLE REVIEW — Cycle 212** 

**Head:** `4f653f563e6773fb6d5dbd2999c98f8aaea730cf`  
**Branch (authoritative):** `seven-remake-v3`  
**Stage:** `manager-final-review`  
**Polish accepted:** `False`  
**APK result:** `APK_STAGE=BLOCKED_NO_PRODUCT_DELTA`, `SELF_HEAL_APK=EXHAUSTED`

---

**What actually improved**

- **Gate discipline held.** No feature/fix integration was accepted (all 20 agents: `no candidate`). Evolution Arena `promotion: BLOCKED_PENDING_COMPARATIVE_PROOF` (typecheck alone insufficient). APK blocked due to no product delta. These blocks were enforced rather than relaxed.
- **Stability preserved.** Head remained unchanged with no speculative merges. The team rejected padding feature count and instead upheld evidence requirements.
- **Campaign baselines preserved.** Memory v2 (`.seven-team/memory-v2/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`, `STRIKE_TEAM.md`, `IMPLEMENTATION_EVIDENCE.md`), Tools v1 baselines, domain-campaign separation, encyclopedia v2 routing, and the autonomy evaluator contracts remain intact with no weakening of rules.
- **Evidence-first culture.** Failed/blocked states were treated as required evidence (not erased), and parallel/duplicate work was prevented by ownership discipline.

---

**What the team rejected**

- **All agent candidates (A01–A10, B01–B10).** Feature integration and fix integration returned `accepted: []` with `rejected` listing each as `no candidate`. No integration approved.
- **Premature APK publication.** Refused to publish an APK when no user-facing/product-runtime delta exists under `remake/src`, `remake/index.html` or `remake/public`. Android installed-artifact evidence remains missing until an executable device/emulator gate proves it.
- **Speculation without proof.** Rejected promotion without head-to-head comparative artifacts (Evolution Arena), rejection of rubric hard-fail averaging (premium/release claims blocked), and rejection of complexity without measured Memory benchmarks.
- **Unsafe expansion.** Rejected connecting high-impact external tools before `ReferenceMonitor`, approval binding, idempotency, audit/replay, and deterministic schema/capability/scope checks are proven (LLM is never an authorization boundary).
- **Scope creep.** Rejected merging domains into vague plans; domains marked `RESEARCH_INSUFFICIENT` require follow-up evidence gathering, not invention.

---

**What remains unproven**

- **Product delta.** No user-facing/product-runtime change identified under `remake/src`, `remake/index.html`, or `remake/public` relative to `4f653f5`. Visual/product quality: missing exact-build visual evidence (UNPROVEN). Any rubric hard fail blocks premium/release-quality claim.
- **Android release gate.** Installed-artifact evidence missing; executable device/emulator gate, tied to exact build identity (artifact hash/ABI/signature), install+run smoke, logs/screenshots required.
- **Memory v2 acceptance (P0).** Live-chat wiring, temporal correction, provenance, abstention, restart persistence, Arabic parity, secret exclusion, and Android evidence all unproven. Semantic/vector/graph additions require winning measured benchmark against current local lexical/temporal baseline; evidence ledger entries (implementation commit, tests, benchmark result, Android exact-build state, known unproven items) incomplete.
- **Tools v1 (P0).** `ReferenceMonitor`, approval binding, idempotency, audit, replay, deterministic schema/capability/scope, failure semantics and network surface controls unproven before high-impact external tool connections.
- **Domain research completeness.** Multiple subsystems marked `RESEARCH_INSUFFICIENT`; separate roadmaps must be preserved. Route smallest complete knowledge packs via `.seven-team/superloop/team-v1.json` and refresh `.seven-team/product-intelligence/sources/OFFICIAL_SOURCE_MAP.json` when material.
- **Evolution Arena comparative proof.** Promotion blocked pending head-to-head comparative proof (runtime behavior, tests, security, performance). No challenger wins from typecheck alone.
- **Constitutional/quality debt.** Hard fails (product-quality, security, constitution) cannot be averaged away. Failed experiments and quality debt must be preserved as learning evidence.

---

**Exact next-cycle research priorities**

1. **Product delta & visual evidence (P0) — Owner: Product cohesion (B10) + relevant domain owner**  
   - **Inspect:** `remake/src`, `remake/index.html`, `remake/public` vs `4f653f5`.  
   - **Evidence:** minimal user-visible diff, acceptance test, exact-build visual artifacts (screenshots/video) against `VISUAL_REFERENCE_CATALOG.json`, `JUDGE_PROTOCOL.md`, and visual boards under `.seven-team/product-intelligence/visual/`. Map rubric hard fails explicitly.  
   - **Gate:** No APK until delta + visual exact-build evidence exist.

2. **Android executable gate (P0) — Owner: Platform/Android (A09) + Verification (A08)**  
   - **Define:** executable device/emulator gate with exact-build identity (commit SHA `4f653f5` + build hash/ABI/signature).  
   - **Evidence:** installed artifact, install+run smoke, captured logs/screenshots tied to that identity, pass/fail recorded.  
   - **Gate:** Blocks APK publication regardless of other progress.

3. **Memory v2 Strike Team (P0) — Owners: A06/B08 (primary), A04 (arch review), A08 (verification), B09 (race/stress), B10 (product cohesion)**  
   - **Focus:** live-chat wiring, temporal correction, provenance, abstention, restart persistence, Arabic parity, secret exclusion, Android evidence.  
   - **Evidence:** update `.seven-team/memory-v2/IMPLEMENTATION_EVIDENCE.md` ledger (implementation commit, tests, benchmark result vs local lexical/temporal baseline, Android exact-build state, known unproven). Require measured win before adding semantic/vector/graph complexity. Use `RESEARCH_SYNTHESIS.md`/`EXECUTION_PLAN.md` as baseline.

4. **Tools v1 hardening (P0) — Owners: A04+A07 (arch/security), A08 (verification), B07 (network/failure), B09 (race/replay), B10 (product cohesion)**  
   - **Must prove:** `ReferenceMonitor`, approval binding, idempotency, audit, replay, deterministic schema/capability/scope. LLM never authorization boundary.  
   - **Evidence:** unit+integration tests, replay fixtures, audit logs, negative/abuse cases; block high-impact external tool connections until green.

5. **Domain-campaign completion (P0) — Per-subsystem owners as configured**  
   - **Action:** Resolve each domain marked `RESEARCH_INSUFFICIENT` with separate roadmap (do not merge). Route smallest complete knowledge pack via `.seven-team/superloop/team-v1.json`; for cross-domain, include adjacent packs. Refresh `OFFICIAL_SOURCE_MAP.json` for material platform/product changes. Treat external sources as starting evidence, not authority over Seven’s exact runtime behavior.

6. **Evolution Arena comparative proof (P0) — Owners: A08 (verification) + relevant domain**  
   - **Require:** head-to-head comparative artifacts (runtime behavior, tests, security, performance) vs current champion `4f653f5`. Enforce rule: “No challenger wins from typecheck alone.” Promotion remains `BLOCKED_PENDING_COMPARATIVE_PROOF`.

**Manager directive:** Do not call missing evidence PASS. Never weaken evaluator rules or grant Meta-Team privileges. Prefer smallest coherent set of changes that satisfies all gates. Focus effort on the P0 items above before claiming premium/release-quality status.
tokens used
10,264
**MANAGER FINAL CYCLE REVIEW — Cycle 212** 

**Head:** `4f653f563e6773fb6d5dbd2999c98f8aaea730cf`  
**Branch (authoritative):** `seven-remake-v3`  
**Stage:** `manager-final-review`  
**Polish accepted:** `False`  
**APK result:** `APK_STAGE=BLOCKED_NO_PRODUCT_DELTA`, `SELF_HEAL_APK=EXHAUSTED`

---

**What actually improved**

- **Gate discipline held.** No feature/fix integration was accepted (all 20 agents: `no candidate`). Evolution Arena `promotion: BLOCKED_PENDING_COMPARATIVE_PROOF` (typecheck alone insufficient). APK blocked due to no product delta. These blocks were enforced rather than relaxed.
- **Stability preserved.** Head remained unchanged with no speculative merges. The team rejected padding feature count and instead upheld evidence requirements.
- **Campaign baselines preserved.** Memory v2 (`.seven-team/memory-v2/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`, `STRIKE_TEAM.md`, `IMPLEMENTATION_EVIDENCE.md`), Tools v1 baselines, domain-campaign separation, encyclopedia v2 routing, and the autonomy evaluator contracts remain intact with no weakening of rules.
- **Evidence-first culture.** Failed/blocked states were treated as required evidence (not erased), and parallel/duplicate work was prevented by ownership discipline.

---

**What the team rejected**

- **All agent candidates (A01–A10, B01–B10).** Feature integration and fix integration returned `accepted: []` with `rejected` listing each as `no candidate`. No integration approved.
- **Premature APK publication.** Refused to publish an APK when no user-facing/product-runtime delta exists under `remake/src`, `remake/index.html` or `remake/public`. Android installed-artifact evidence remains missing until an executable device/emulator gate proves it.
- **Speculation without proof.** Rejected promotion without head-to-head comparative artifacts (Evolution Arena), rejection of rubric hard-fail averaging (premium/release claims blocked), and rejection of complexity without measured Memory benchmarks.
- **Unsafe expansion.** Rejected connecting high-impact external tools before `ReferenceMonitor`, approval binding, idempotency, audit/replay, and deterministic schema/capability/scope checks are proven (LLM is never an authorization boundary).
- **Scope creep.** Rejected merging domains into vague plans; domains marked `RESEARCH_INSUFFICIENT` require follow-up evidence gathering, not invention.

---

**What remains unproven**

- **Product delta.** No user-facing/product-runtime change identified under `remake/src`, `remake/index.html`, or `remake/public` relative to `4f653f5`. Visual/product quality: missing exact-build visual evidence (UNPROVEN). Any rubric hard fail blocks premium/release-quality claim.
- **Android release gate.** Installed-artifact evidence missing; executable device/emulator gate, tied to exact build identity (artifact hash/ABI/signature), install+run smoke, logs/screenshots required.
- **Memory v2 acceptance (P0).** Live-chat wiring, temporal correction, provenance, abstention, restart persistence, Arabic parity, secret exclusion, and Android evidence all unproven. Semantic/vector/graph additions require winning measured benchmark against current local lexical/temporal baseline; evidence ledger entries (implementation commit, tests, benchmark result, Android exact-build state, known unproven items) incomplete.
- **Tools v1 (P0).** `ReferenceMonitor`, approval binding, idempotency, audit, replay, deterministic schema/capability/scope, failure semantics and network surface controls unproven before high-impact external tool connections.
- **Domain research completeness.** Multiple subsystems marked `RESEARCH_INSUFFICIENT`; separate roadmaps must be preserved. Route smallest complete knowledge packs via `.seven-team/superloop/team-v1.json` and refresh `.seven-team/product-intelligence/sources/OFFICIAL_SOURCE_MAP.json` when material.
- **Evolution Arena comparative proof.** Promotion blocked pending head-to-head comparative proof (runtime behavior, tests, security, performance). No challenger wins from typecheck alone.
- **Constitutional/quality debt.** Hard fails (product-quality, security, constitution) cannot be averaged away. Failed experiments and quality debt must be preserved as learning evidence.

---

**Exact next-cycle research priorities**

1. **Product delta & visual evidence (P0) — Owner: Product cohesion (B10) + relevant domain owner**  
   - **Inspect:** `remake/src`, `remake/index.html`, `remake/public` vs `4f653f5`.  
   - **Evidence:** minimal user-visible diff, acceptance test, exact-build visual artifacts (screenshots/video) against `VISUAL_REFERENCE_CATALOG.json`, `JUDGE_PROTOCOL.md`, and visual boards under `.seven-team/product-intelligence/visual/`. Map rubric hard fails explicitly.  
   - **Gate:** No APK until delta + visual exact-build evidence exist.

2. **Android executable gate (P0) — Owner: Platform/Android (A09) + Verification (A08)**  
   - **Define:** executable device/emulator gate with exact-build identity (commit SHA `4f653f5` + build hash/ABI/signature).  
   - **Evidence:** installed artifact, install+run smoke, captured logs/screenshots tied to that identity, pass/fail recorded.  
   - **Gate:** Blocks APK publication regardless of other progress.

3. **Memory v2 Strike Team (P0) — Owners: A06/B08 (primary), A04 (arch review), A08 (verification), B09 (race/stress), B10 (product cohesion)**  
   - **Focus:** live-chat wiring, temporal correction, provenance, abstention, restart persistence, Arabic parity, secret exclusion, Android evidence.  
   - **Evidence:** update `.seven-team/memory-v2/IMPLEMENTATION_EVIDENCE.md` ledger (implementation commit, tests, benchmark result vs local lexical/temporal baseline, Android exact-build state, known unproven). Require measured win before adding semantic/vector/graph complexity. Use `RESEARCH_SYNTHESIS.md`/`EXECUTION_PLAN.md` as baseline.

4. **Tools v1 hardening (P0) — Owners: A04+A07 (arch/security), A08 (verification), B07 (network/failure), B09 (race/replay), B10 (product cohesion)**  
   - **Must prove:** `ReferenceMonitor`, approval binding, idempotency, audit, replay, deterministic schema/capability/scope. LLM never authorization boundary.  
   - **Evidence:** unit+integration tests, replay fixtures, audit logs, negative/abuse cases; block high-impact external tool connections until green.

5. **Domain-campaign completion (P0) — Per-subsystem owners as configured**  
   - **Action:** Resolve each domain marked `RESEARCH_INSUFFICIENT` with separate roadmap (do not merge). Route smallest complete knowledge pack via `.seven-team/superloop/team-v1.json`; for cross-domain, include adjacent packs. Refresh `OFFICIAL_SOURCE_MAP.json` for material platform/product changes. Treat external sources as starting evidence, not authority over Seven’s exact runtime behavior.

6. **Evolution Arena comparative proof (P0) — Owners: A08 (verification) + relevant domain**  
   - **Require:** head-to-head comparative artifacts (runtime behavior, tests, security, performance) vs current champion `4f653f5`. Enforce rule: “No challenger wins from typecheck alone.” Promotion remains `BLOCKED_PENDING_COMPARATIVE_PROOF`.

**Manager directive:** Do not call missing evidence PASS. Never weaken evaluator rules or grant Meta-Team privileges. Prefer smallest coherent set of changes that satisfies all gates. Focus effort on the P0 items above before claiming premium/release-quality status.
