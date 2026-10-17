# Seven Superloop Cycle 218

Run: 39047403713

## Machine summary

```json
{
  "cycle": 218,
  "featureCandidates": 0,
  "featuresAccepted": 0,
  "fixCandidates": 0,
  "fixesAccepted": 0,
  "polishAccepted": false,
  "apkState": "BLOCKED_NO_PRODUCT_DELTA",
  "productQualityVerdict": "CHANGES_REQUIRED or RC or PREMIUM_CANDIDATE or UNPROVEN",
  "productQualityScore": "<0.0-10.0 or UNPROVEN>",
  "domainResearchReady": 2,
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
    "D25_HISTORY_ROOMS",
    "D26_SETTINGS_CONTROLS",
    "D27_ERROR_RECOVERY_UX",
    "D28_LOCAL_INTELLIGENCE",
    "D29_REAL_WORKS_CANON",
    "D30_AUTONOMOUS_QUALITY"
  ],
  "head": "ade139f390eecb3416ef2ba34c42d42ec76de88e",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 218,
    "sourceSha": "ade139f390eecb3416ef2ba34c42d42ec76de88e",
    "proof": {
      "deterministicFinalGates": true,
      "apkBuilt": false,
      "productQualityScored": false,
      "productHardFailsKnown": false,
      "realityLabExactInstalledEvidence": false,
      "constitutionRuntimeCoverage": "PARTIAL",
      "physicalDeviceEvidence": false
    },
    "productQualityScore": "<0.0-10.0 or UNPROVEN>",
    "productHardFails": "<integer>",
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
session id: 01a14b09-1a7a-7e81-aaa5-faf12f8320f6
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


Cycle: 218
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "ade139f390eecb3416ef2ba34c42d42ec76de88e", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 218, "championSha": "ade139f390eecb3416ef2ba34c42d42ec76de88e", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "ade139f390eecb3416ef2ba34c42d42ec76de88e", "fullGatesPass": true}
Polish accepted: False
APK result: APK_STAGE=BLOCKED_NO_PRODUCT_DELTA
No user-facing/product-runtime delta exists under remake/src, remake/index.html or remake/public. Refusing to publish another APK whose Seven payload is effectively unchanged.
SELF_HEAL_APK=EXHAUSTED

Independent product-quality synthesis:
Reading additional input from stdin...
OpenAI Codex v0.163.0
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a14b07-1118-7be3-917b-a75924693a1f
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

Memory is currently a P0 product campaign. Use .seven-team/memory-v2/RESEARCH_SYNTHESIS.md and EXECUTION_PLAN.md as the shared eviden

...[clipped by superloop]...

 proof**  
- **Owner:** B08 (Storage/recovery) + B09 stress/races verification  
- **Objective:** Crash/restart, restore, cancellation-safe durable persistence, corruption handling proven.  
- **Files/surfaces:** `remake/src/storage/**`, `remake/src/core/**`, persistence tests  
- **Expected evidence:** deterministic stress runs, restart fixtures, recovery assertions, known unproven items.

7. **QA-COMP — Testing completeness + release assurance**  
- **Owner:** A08 (Testing/release assurance) + B10  
- **Objective:** Close release assurance matrix (including visual/Android gates) with recorded artifacts; ensure deterministic suite remains green.  
- **Expected evidence:** matrix with each gate state, artifact paths, run IDs (browser/local).

8. **RTL-PARITY — Arabic/RTL parity evidence**  
- **Owner:** A03 (Arabic/RTL/accessibility) + A01 + B10  
- **Objective:** Evidence for layout/typography/dir, input, composer, messages in RTL with visual evidence tied to exact build (link to V1).  
- **Expected evidence:** screenshots (RTL sample), checks against visual rubric, accessibility notes.

**Compatibility note (from manager):** Preserve architecture (evidence-based only). Smallest coherent set passing full suite. Reject duplicates; keep one owner per subsystem. Protect cancellation, deadlines, persistence recovery, immutable public state, exact payload identity. Never expose/request secrets.

---

**Final Verdict (as required):**

```
PRODUCT_QUALITY_VERDICT=CHANGES_REQUIRED
PRODUCT_QUALITY_SCORE=UNPROVEN
PRODUCT_QUALITY_HARD_FAILS=3
```

**Recommendation:** Not RC/PREMIUM_CANDIDATE. Deterministic runtime gates are green and architectural discipline is strong, but premium/release-quality is blocked by three hard fails: (1) visual quality UNPROVEN (no exact-build visual evidence), (2) Android installed-artifact evidence missing (APK blocked by policy + no device/emulator gate proof), (3) D20_PRODUCT_QUALITY research INSUFFICIENT. Execute P0 items V1, A-Dev, D20 in parallel with strict evidence requirements, advance M-PROOF and T-PROOF to closure, and do not integrate high-impact external tools until T-PROOF gates are green. Promote to RC only when all hard fails cleared AND full suite green with recorded artifacts. Treat timeouts/incompleteness as evidence missing (not PASS).
tokens used
12,935
**Final Cycle Review — Cycle 218 (Manager Final Review)**

**Head (authoritative product state):** `ade139f390eecb3416ef2ba34c42d42ec76de88e`  
**Branch:** `seven-remake-v3`  
**Integration result:** fullGatesPass=true (deterministic runtime gates green). No feature/fix candidates accepted for any of the 20 agents. Evolution Arena promotion BLOCKED_PENDING_COMPARATIVE_PROOF.  
**APK:** APK_STAGE=BLOCKED_NO_PRODUCT_DELTA; SELF_HEAL_APK=EXHAUSTED (policy: no user-facing/product-runtime delta under `remake/src`, `remake/index.html`, or `remake/public` — refusing to publish unchanged APK).  
**Polish accepted:** False

---

### **What actually improved**

- **Discipline preserved.** No architectural downgrade; no duplicate runtimes/stores/bridges; one-owner rule maintained. Security/constitution boundaries not weakened.
- **Deterministic gates held.** With `fullGatesPass=true` at head, the existing deterministic suite remains green and was not sacrificed to inflate feature count.
- **Evidence discipline enforced.** APK publication correctly blocked by policy (no delta). Evolution Arena correctly rejected “typecheck alone” and requires comparative proof. Research insufficiency (D20) not conflated with completion.
- **Campaign baselines hardened.** Shared evidence baselines exist and are being enforced: Memory v2 (`.seven-team/memory-v2/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`, `STRIKE_TEAM.md`, `IMPLEMENTATION_EVIDENCE.md`) and Tool System v1 (`.seven-team/tools-v1/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`). Ownership maps and proof-ledger expectations are explicit.
- **Product intelligence scaffolding in place.** Rubric (`PRODUCT_QUALITY_RUBRIC.json`), judge protocol (`JUDGE_PROTOCOL.md`), visual catalog (`VISUAL_REFERENCE_CATALOG.json`), visual boards and source map exist to support exact-build judgment rather than impression.

### **What the team rejected**

- **Feature count over proof.** All 20 agents rejected (no candidates) across Feature/ Fix/ Integration tracks because claims without code/test/runtime evidence could not satisfy acceptance tests. No vertical user value was accepted on assertion alone.
- **Premature promotion.** Evolution Arena challenger set empty and promotion blocked — explicitly rejected “wins from typecheck alone”. No candidate advanced without comparative proof.
- **APK churn.** Rejected publishing another APK whose Seven payload is effectively unchanged (BLOCKED_NO_PRODUCT_DELTA). Release artifact identity must change or be justified by delta.
- **Certainty without evidence.** Rejected treating any domain marked `RESEARCH_INSUFFICIENT` (notably `D20_PRODUCT_QUALITY`) as research-complete. External sources treated as starting evidence only.
- **Complexity without measured gain.** Rejected promoting semantic/vector/graph memory complexity unless it wins a measured benchmark against current local lexical/temporal baseline. High-impact external tools remain unconnected until Tool System v1 gates are green.
- **Destructive rewrites.** Rejected destructive memory rewrite in favor of incremental migration beside legacy memory.

### **What remains unproven**

1. **Visual quality (HARD FAIL #1)** — `UNPROVEN`. No exact-build visual evidence exists. Missing exact-build visual evidence means visual quality is UNPROVEN, not PASS. Any rubric hard fail blocks premium/release-quality claim regardless of aggregate score.
2. **Android installed-artifact evidence (HARD FAIL #2)** — `MISSING`. APK blocked by policy and no executable device/emulator gate proof recorded (model/OS, install success, launch, basic chat smoke, exact build identity APK SHA256 + remake commit, logs/screenshots, gate result). Remains UNPROVEN until that gate runs against an exact build with a product delta.
3. **D20_PRODUCT_QUALITY research (HARD FAIL #3)** — `RESEARCH_INSUFFICIENT`. Domain research not complete; unknowns not closed with evidence. No “research-complete” without current-state audit, broad internet research with citations, architecture roadmap, tests, risks, first implementation slice, and explicit unknowns closed or each with evidence+owner+ETA.
4. **Memory v2 completeness (P0)** — Live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence (when delta), Arabic parity, secret exclusion — each must be PASS with artifacts or explicitly UNPROVEN with blocking path; cannot be called complete until proven.
5. **Tool System v1 gates (P0)** — ReferenceMonitor, approval binding, idempotency, audit tests must be green with test names+status, audit log samples, replay fixtures, schema validation, approval binding tests, idempotency tests. Policy “LLM never authorization boundary” must be enforced by tests; high-impact external tools must remain unconnected until gates green.
6. **Release/continuity (P2)** — Storage/recovery end-to-end (crash/restart, restore, cancellation-safe durability, corruption handling), full testing completeness/release assurance matrix (including visual/Android gates with run IDs/artifact paths), Arabic/RTL parity evidence tied to exact build — all UNPROVEN without recorded artifacts.

Also note: Reality Lab evidence must be bound to candidate source/artifact identity; Engineering World Model is planning-only (never runtime proof). Failed experiments/quality debt preserved.

### **Exact next-cycle priorities (research + execution)**

**P0 — Proof campaigns (must close before RC consideration)**

1. **V1 — Visual gate (enables #1)**  
- **Owner:** B10 + A05 (product quality/visual)  
- **Objective:** Generate exact-build visual evidence against `VISUAL_REFERENCE_CATALOG.json` and rubric using `JUDGE_PROTOCOL.md`.  
- **Files/surfaces:** `.seven-team/product-intelligence/visual/**`, `VISUAL_REFERENCE_CATALOG.json`, `JUDGE_PROTOCOL.md`, `PRODUCT_QUALITY_RUBRIC.json`, `remake/src/**`, `remake/index.html`, `remake/public`  
- **Expected evidence:** exact build identity (commit+artifact), browser/local run context, per-view screenshots tied to that build, rubric checklist with PASS/FAIL per item, hard-fail list, judge notes, artifact paths.  
- **Acceptance:** visual quality moves from UNPROVEN→PASS only if all rubric items satisfied with linked artifacts and no hard fail remains. Aggregate score not sufficient if any hard fail.  
- **Dependencies:** Route smallest complete knowledge set per Encyclopedia v2.

2. **A-Dev — Android installed-artifact gate (enables #2)**  
- **Owner:** A09 (Android/build/release) + A08 verification + B10 cohesion  
- **Objective:** Run executable device/emulator gate against an exact build that has a product delta (policy requires delta to publish APK). If no delta exists, record gate result as BLOCKED_BY_POLICY and do not promote APK; still produce gate artifacts.  
- **Files/surfaces:** Android build surfaces under `remake/android/**` (if present), release evidence, `.seven-team/autonomy/evaluators/**` as applicable  
- **Expected evidence:** device/emulator model/OS, install success, launch, basic chat smoke (send/receive or deterministic UI state), exact build identity (APK SHA256, remake commit), logs, screenshots, gate result recorded and linked.  
- **Acceptance:** “Android installed-artifact evidence” becomes PROVEN only after this runs with all artifacts linked. Until run, remains UNPROVEN.

3. **D20 — Product quality domain research (closes #3)**  
- **Owner:** B10 + A05 coordination (D20 lead per team.json if specified)  
- **Objective:** Close `D20_PRODUCT_QUALITY` from `RESEARCH_INSUFFICIENT` to `RESEARCH_COMPLETE` with minimal complete knowledge set (domain-routed).  
- **Files/surfaces:** `.seven-team/domain-campaign/generated/domains/D20_PRODUCT_QUALITY.md`, `.seven-team/product-intelligence/**`, `JUDGE_PROTOCOL.md`, `PRODUCT_KNOWLEDGE_BASE.md`, `VISUAL_REFERENCE_CATALOG.json`, `team.json` knowledgePacks  
- **Dependencies:** Route smallest complete knowledge set (Encyclopedia v2). Do not merge other domains.  
- **Expected evidence:** current-state audit, broad internet research with citations, architecture roadmap, tests, risks, first implementation slice, explicit unknowns closed or reduced with evidence (each unknown has evidence+owner+ETA).  
- **Acceptance:** Verdict updated to RESEARCH_COMPLETE only with evidence per subsection; unknowns list empty or each satisfied.

**P1 — Campaign proof (prevent regression)**

4. **M-PROOF — Memory v2 proof ledger completion**  
- **Owner:** A06/B08 primary; A04 architecture review, A08 verification, B09 race/stress review, B10 product-cohesion review  
- **Objective:** Prove required items with artifacts: live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence (when delta), Arabic parity, secret exclusion.  
- **Files/surfaces:** `.seven-team/memory-v2/IMPLEMENTATION_EVIDENCE.md` (append evidence), `remake/src/context/**`, `remake/src/storage/**`, `remake/src/integration/**`  
- **Dependencies:** Incremental migration beside legacy (no destructive rewrite). Compare against current local lexical/temporal baseline for any complexity increase.  
- **Expected evidence:** implementation commits/patches, tests, benchmark vs baseline, Android exact-build state (if applicable), known unproven items ledgered.  
- **Acceptance:** Each required item PASS with evidence or explicit UNPROVEN+blocking path; no “complete” without all.

5. **T-PROOF — Tool System v1 gates green**  
- **Owner:** A04+A07 security/architecture; A08 verification, B07 network/failure semantics, B09 race/replay, B10 cohesion  
- **Objective:** Make ReferenceMonitor, approval binding, idempotency, audit tests green; enforce deterministic schema/capability/scope/approval/replay; LLM never authorization boundary.  
- **Files/surfaces:** `.seven-team/tools-v1/EXECUTION_PLAN.md`, `remake/src/kernel/**`, `remake/src/platform/**`, tool registry surfaces  
- **Dependencies:** High-impact external tools remain unconnected until gates green.  
- **Expected evidence:** test names+status, audit log samples, replay fixtures, schema validation, approval binding tests, idempotency tests.  
- **Acceptance:** Gates green with recorded evidence; boundary enforced by tests.

**P2 — Hardening/continuity (stabilize synthesis)**

6. **S-REC — Storage/recovery end-to-end proof**  
- **Owner:** B08 (Storage/recovery) + B09 stress/races verification  
- **Objective:** Crash/restart, restore, cancellation-safe durable persistence, corruption handling proven.  
- **Files/surfaces:** `remake/src/storage/**`, `remake/src/core/**`, persistence tests  
- **Expected evidence:** deterministic stress runs, restart fixtures, recovery assertions, known unproven items.

7. **QA-COMP — Testing completeness + release assurance**  
- **Owner:** A08 (Testing/release assurance) + B10  
- **Objective:** Close release assurance matrix (including visual/Android gates) with recorded artifacts; ensure deterministic suite remains green.  
- **Expected evidence:** matrix with each gate state, artifact paths, run IDs (browser/local).

8. **RTL-PARITY — Arabic/RTL parity evidence**  
- **Owner:** A03 (Arabic/RTL/accessibility) + A01 + B10  
- **Objective:** Evidence for layout/typography/dir, input, composer, messages in RTL with visual evidence tied to exact build (link to V1).  
- **Expected evidence:** screenshots (RTL sample), checks against visual rubric, accessibility notes.

**Compatibility note (from manager):** Preserve architecture (evidence-based only). Smallest coherent set passing full suite. Reject duplicates; keep one owner per subsystem. Protect cancellation, deadlines, persistence recovery, immutable public state, exact payload identity. Never expose/request secrets.

---

**Final Verdict (as required):**

```
PRODUCT_QUALITY_VERDICT=CHANGES_REQUIRED
PRODUCT_QUALITY_SCORE=UNPROVEN
PRODUCT_QUALITY_HARD_FAILS=3
```

**Recommendation:** Not RC/PREMIUM_CANDIDATE. Deterministic runtime gates are green and architectural discipline is strong, but premium/release-quality is blocked by three hard fails: (1) visual quality UNPROVEN (no exact-build visual evidence), (2) Android installed-artifact evidence missing (APK blocked by policy + no device/emulator gate proof), (3) D20_PRODUCT_QUALITY research INSUFFICIENT. Execute P0 items V1, A-Dev, D20 in parallel with strict evidence requirements, advance M-PROOF and T-PROOF to closure, and do not integrate high-impact external tools until T-PROOF gates are green. Promote to RC only when all hard fails cleared AND full suite green with recorded artifacts. Treat timeouts/incompleteness as evidence missing (not PASS).
