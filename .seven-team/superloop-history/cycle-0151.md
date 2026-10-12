# Seven Superloop Cycle 151

Run: 38290655548

## Machine summary

```json
{
  "cycle": 151,
  "featureCandidates": 0,
  "featuresAccepted": 0,
  "fixCandidates": 0,
  "fixesAccepted": 0,
  "polishAccepted": false,
  "apkState": "BLOCKED_NO_PRODUCT_DELTA",
  "productQualityVerdict": "CHANGES_REQUIRED or RC or PREMIUM_CANDIDATE or UNPROVEN",
  "productQualityScore": "<0.0-10.0 or UNPROVEN>",
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
  "head": "9134312595b765af36ab285919d8580cc7aa1c41",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 151,
    "sourceSha": "9134312595b765af36ab285919d8580cc7aa1c41",
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
OpenAI Codex v0.162.1
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a131c7-b451-7e63-9bce-3b2dd289fe65
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


Cycle: 151
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "9134312595b765af36ab285919d8580cc7aa1c41", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 151, "championSha": "9134312595b765af36ab285919d8580cc7aa1c41", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "9134312595b765af36ab285919d8580cc7aa1c41", "fullGatesPass": true}
Polish accepted: False
APK result: APK_STAGE=BLOCKED_NO_PRODUCT_DELTA
No user-facing/product-runtime delta exists under remake/src, remake/index.html or remake/public. Refusing to publish another APK whose Seven payload is effectively unchanged.
SELF_HEAL_APK=EXHAUSTED

Independent product-quality synthesis:
Reading additional input from stdin...
OpenAI Codex v0.162.1
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a131c4-31e6-7330-9f7d-75e76ac6607d
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

Memory is currently a P0 product campaign. Use .seven-team/memory-v2/RESEARCH_SYNTHE

...[clipped by superloop]...

required.
- **Exploratory record preserved.** Wave-01 reports (A01–A10, B01–B10) exist and are explicit about unknowns, non-execution, and conflicts (notably B10). Disagreements were not collapsed into a single vague plan.
- **Compatibility principle applied.** Integration posture remained: preserve current architecture, prefer smallest coherent set passing full suite, de-duplicate/resolve conflicts by evidence, and avoid destructive rewrites.
- **Rubric/constitution discipline maintained.** Hard fails (visual exact-build evidence, Android device/emulator gate) were not averaged away.

## What was rejected

- **All candidates (20/20).** None produced sufficient code/test/runtime evidence to meet acceptance criteria.
- **Republishing unchanged APK.** Rejected to protect exact payload identity and avoid misleading release signals.
- **RC/premium/release-quality claims.** Rejected while visual exact-build evidence and Android installed-artifact evidence remain missing.
- **Premature certainty.** Domain-by-domain campaign results (30/30 RESEARCH_INSUFFICIENT; 0/30 READY) were treated as insufficient, not complete.
- **Merging overlapping work without owners.** Conflicts identified in reports (e.g. B10: storage key, test substrate, suite ownership, CI lease for `all.cjs`, gate semantics, persistence seam ownership) remain unresolved by integration and require explicit owner decisions.

## What remains unproven

**Release & product quality (hard blocks)**
- **Visual fidelity.** Exact-build visual capture against `VISUAL_REFERENCE_CATALOG.json` with rubric scoring per `JUDGE_PROTOCOL` is missing. Per protocol: visual quality is **UNPROVEN**, not PASS. **HARD FAIL #1.**
- **Android runtime evidence.** No executable device/emulator gate exists; APK blocked with no product delta. **HARD FAIL #2.** Cannot assert Android distribution readiness.
- **Premium/release verdict.** Aggregate score cannot compensate for hard fails (proof-policy). `PRODUCT_QUALITY_VERDICT=CHANGES_REQUIRED`, `PRODUCT_QUALITY_SCORE=UNPROVEN`, `PRODUCT_QUALITY_HARD_FAILS=2`.

**Campaigns (P0) — incomplete proof**
- **Domain research.** `DOMAIN_CAMPAIGN` generated state: ready=0/30, insufficient=all 30. No domain produced a trustworthy plan block; research agents timed out/missing outputs. Treat RESEARCH_INSUFFICIENT as follow-up, not certainty.
- **Memory v2 (P0).** Referenced in requirements but `memory-v2/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`, `STRIKE_TEAM.md`, `IMPLEMENTATION_EVIDENCE.md` not present in this tree. RPG memory audit (B06) is partial (16 explicit unknowns; could not inspect `seven_ai-final.html`). Required proofs missing: live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity, secret exclusion.
- **Tools v1 (P0).** Requires deterministic schema/capability/scope/approval/replay checks, `ReferenceMonitor`, approval binding, idempotency, audit tests; LLM must not be authorization boundary. No concrete green evidence set demonstrated.

**Product surfaces — insufficient executed evidence**
- **Chat/rooms/composer/streaming, attachments/SAF, citations/research, localization/RTL/a11y, UI performance/concurrency.** Wave-01 reports self-declare limited or no execution; domain research insufficient. Cannot verify end-to-end cohesion at release bar.
- **RPG vertical slice.** B10 concludes audit package coherent but **product (RPG V2) NOT READY** (RPG-01,04,05,07 fail by inspection; RPG-02 blocked by no bounded context seam; RPG-03/06 testable but in-app path gated; zero executed evidence). Conflicts (keys/formats, CI lease for `all.cjs`, prompt seam ownership) unresolved.
- **Reliability.** B09 notes persistence/backend unknowns; `task-manager.spec.ts` location/path uncertain (referenced missing in one worktree). Cancellation, races, bridge semantics unproven.
- **Security/guards.** Autonomy proof-policy noted; no concrete security test evidence demonstrated green. Cannot average away security/constitution hard fails.

## Exact next-cycle priorities (smallest coherent set first)

1. **Android evidence (Release blocker).** Identify/prove minimal product delta (or justify scope). Produce installable artifact with **device/emulator gate**; capture exact-build runtime evidence (logs/screenshots tied to artifact identity/commit). **Do not** republish unchanged APK. Owner: Android/platform (A02) + release gate; verify against APK_STAGE rules.
2. **Visual proof (Premium gate).** Run **exact-build visual capture** against `VISUAL_REFERENCE_CATALOG.json` and produce **rubric-scored comparison** per `JUDGE_PROTOCOL`. Explicitly mark any unmeasurable dimensions as UNPROVEN. Block premium/release claim on any rubric hard fail. Owner: product-quality/visual (A01/D12/D20) with evidence tied to same exact build as (1).
3. **Domain research closure (evidence-driven).** Treat RESEARCH_INSUFFICIENT as follow-up, not certainty. Assign evidence-gathering to domains that block (1)-(2) and P0s: start with `D01_CHAT_CORE`, `D02_MEMORY_CONTEXT`, `D03_TOOLS_CAPABILITY`, `D11_ANDROID_NATIVE`, `D12_UI_DESIGN_SYSTEM`, `D20_PRODUCT_QUALITY` (and include adjacent packs for cross-domain). Route smallest complete knowledge sets; require concrete artifacts (files/surfaces, runtime evidence, tests) before marking READY. Do not flood agents with entire corpus.
4. **Memory v2 (P0) — strike team.** Enforce STRIKE_TEAM ownership (A06 primary, A04 architecture review, A08 verification, B09 race/stress, B10 product cohesion). If corpus missing in tree, reconstruct minimal shared baseline or re-read authoritative sources; require evidence ledger entries (implementation commit, tests, benchmark, Android exact-build state, known unproven). Prove: live-chat wiring, temporal correction, provenance, abstention, restart persistence, Arabic parity, secret exclusion. Prefer incremental migration beside legacy; do not promote semantic/vector/graph complexity unless it wins measured benchmark against current lexical/temporal baseline.
5. **Tools v1 (P0) — hardening.** Owners A04+A07 (architecture/security), A08 (verification), B07 (network/failure), B09 (race/replay), B10 (cohesion). Prove `ReferenceMonitor`, approval binding, idempotency, audit tests, deterministic schema/capability/scope/approval/replay; confirm LLM is not authorization boundary. Block high-impact external tools until green.
6. **Deterministic coverage & reliability.** Expand beyond B04’s 3 manager-integration tests to chat, cancellation, races, storage recovery. Resolve `task-manager.spec.ts` location/path; add specs tied to root causes. Address B10 conflicts explicitly (keys/formats, `all.cjs` CI lease, prompt seam ownership) via manager lease before editing shared files.

**Verdict:** `PRODUCT_QUALITY_VERDICT=CHANGES_REQUIRED`, `PRODUCT_QUALITY_SCORE=UNPROVEN`, `PRODUCT_QUALITY_HARD_FAILS=2`. RC cannot be awarded. Require evidence before integration; preserve disagreements; do not weaken guards.
tokens used
279,585
# Final Cycle Review — Cycle 151

**Cycle identity**
- Authoritative branch (context): `seven-remake-v3`
- Head: `9134312595b765af36ab285919d8580cc7aa1c41` (Superloop cycle 150 manager record)
- Diff vs HEAD: none detected (no file changes in this cycle)
- Feature integration: accepted=[], rejected=[all 20 agents “no candidate”], fullGatesPass=true
- Evolution Arena: BLOCKED_PENDING_COMPARATIVE_PROOF (no challengers)
- APK: APK_STAGE=BLOCKED_NO_PRODUCT_DELTA; SELF_HEAL_APK=EXHAUSTED. Refusing to republish unchanged APK.
- Polish accepted: false

## What actually improved

- **Evidence discipline held.** Manager refused to accept agent claims without concrete candidates; all 20 rejected. No features accepted on assertion alone.
- **Release gate enforced.** Despite “fullGatesPass” context, APK publication was blocked because there is no product delta under `remake/src`, `remake/index.html`, or `remake/public`. Installed-artifact evidence remains required.
- **Exploratory record preserved.** Wave-01 reports (A01–A10, B01–B10) exist and are explicit about unknowns, non-execution, and conflicts (notably B10). Disagreements were not collapsed into a single vague plan.
- **Compatibility principle applied.** Integration posture remained: preserve current architecture, prefer smallest coherent set passing full suite, de-duplicate/resolve conflicts by evidence, and avoid destructive rewrites.
- **Rubric/constitution discipline maintained.** Hard fails (visual exact-build evidence, Android device/emulator gate) were not averaged away.

## What was rejected

- **All candidates (20/20).** None produced sufficient code/test/runtime evidence to meet acceptance criteria.
- **Republishing unchanged APK.** Rejected to protect exact payload identity and avoid misleading release signals.
- **RC/premium/release-quality claims.** Rejected while visual exact-build evidence and Android installed-artifact evidence remain missing.
- **Premature certainty.** Domain-by-domain campaign results (30/30 RESEARCH_INSUFFICIENT; 0/30 READY) were treated as insufficient, not complete.
- **Merging overlapping work without owners.** Conflicts identified in reports (e.g. B10: storage key, test substrate, suite ownership, CI lease for `all.cjs`, gate semantics, persistence seam ownership) remain unresolved by integration and require explicit owner decisions.

## What remains unproven

**Release & product quality (hard blocks)**
- **Visual fidelity.** Exact-build visual capture against `VISUAL_REFERENCE_CATALOG.json` with rubric scoring per `JUDGE_PROTOCOL` is missing. Per protocol: visual quality is **UNPROVEN**, not PASS. **HARD FAIL #1.**
- **Android runtime evidence.** No executable device/emulator gate exists; APK blocked with no product delta. **HARD FAIL #2.** Cannot assert Android distribution readiness.
- **Premium/release verdict.** Aggregate score cannot compensate for hard fails (proof-policy). `PRODUCT_QUALITY_VERDICT=CHANGES_REQUIRED`, `PRODUCT_QUALITY_SCORE=UNPROVEN`, `PRODUCT_QUALITY_HARD_FAILS=2`.

**Campaigns (P0) — incomplete proof**
- **Domain research.** `DOMAIN_CAMPAIGN` generated state: ready=0/30, insufficient=all 30. No domain produced a trustworthy plan block; research agents timed out/missing outputs. Treat RESEARCH_INSUFFICIENT as follow-up, not certainty.
- **Memory v2 (P0).** Referenced in requirements but `memory-v2/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`, `STRIKE_TEAM.md`, `IMPLEMENTATION_EVIDENCE.md` not present in this tree. RPG memory audit (B06) is partial (16 explicit unknowns; could not inspect `seven_ai-final.html`). Required proofs missing: live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity, secret exclusion.
- **Tools v1 (P0).** Requires deterministic schema/capability/scope/approval/replay checks, `ReferenceMonitor`, approval binding, idempotency, audit tests; LLM must not be authorization boundary. No concrete green evidence set demonstrated.

**Product surfaces — insufficient executed evidence**
- **Chat/rooms/composer/streaming, attachments/SAF, citations/research, localization/RTL/a11y, UI performance/concurrency.** Wave-01 reports self-declare limited or no execution; domain research insufficient. Cannot verify end-to-end cohesion at release bar.
- **RPG vertical slice.** B10 concludes audit package coherent but **product (RPG V2) NOT READY** (RPG-01,04,05,07 fail by inspection; RPG-02 blocked by no bounded context seam; RPG-03/06 testable but in-app path gated; zero executed evidence). Conflicts (keys/formats, CI lease for `all.cjs`, prompt seam ownership) unresolved.
- **Reliability.** B09 notes persistence/backend unknowns; `task-manager.spec.ts` location/path uncertain (referenced missing in one worktree). Cancellation, races, bridge semantics unproven.
- **Security/guards.** Autonomy proof-policy noted; no concrete security test evidence demonstrated green. Cannot average away security/constitution hard fails.

## Exact next-cycle priorities (smallest coherent set first)

1. **Android evidence (Release blocker).** Identify/prove minimal product delta (or justify scope). Produce installable artifact with **device/emulator gate**; capture exact-build runtime evidence (logs/screenshots tied to artifact identity/commit). **Do not** republish unchanged APK. Owner: Android/platform (A02) + release gate; verify against APK_STAGE rules.
2. **Visual proof (Premium gate).** Run **exact-build visual capture** against `VISUAL_REFERENCE_CATALOG.json` and produce **rubric-scored comparison** per `JUDGE_PROTOCOL`. Explicitly mark any unmeasurable dimensions as UNPROVEN. Block premium/release claim on any rubric hard fail. Owner: product-quality/visual (A01/D12/D20) with evidence tied to same exact build as (1).
3. **Domain research closure (evidence-driven).** Treat RESEARCH_INSUFFICIENT as follow-up, not certainty. Assign evidence-gathering to domains that block (1)-(2) and P0s: start with `D01_CHAT_CORE`, `D02_MEMORY_CONTEXT`, `D03_TOOLS_CAPABILITY`, `D11_ANDROID_NATIVE`, `D12_UI_DESIGN_SYSTEM`, `D20_PRODUCT_QUALITY` (and include adjacent packs for cross-domain). Route smallest complete knowledge sets; require concrete artifacts (files/surfaces, runtime evidence, tests) before marking READY. Do not flood agents with entire corpus.
4. **Memory v2 (P0) — strike team.** Enforce STRIKE_TEAM ownership (A06 primary, A04 architecture review, A08 verification, B09 race/stress, B10 product cohesion). If corpus missing in tree, reconstruct minimal shared baseline or re-read authoritative sources; require evidence ledger entries (implementation commit, tests, benchmark, Android exact-build state, known unproven). Prove: live-chat wiring, temporal correction, provenance, abstention, restart persistence, Arabic parity, secret exclusion. Prefer incremental migration beside legacy; do not promote semantic/vector/graph complexity unless it wins measured benchmark against current lexical/temporal baseline.
5. **Tools v1 (P0) — hardening.** Owners A04+A07 (architecture/security), A08 (verification), B07 (network/failure), B09 (race/replay), B10 (cohesion). Prove `ReferenceMonitor`, approval binding, idempotency, audit tests, deterministic schema/capability/scope/approval/replay; confirm LLM is not authorization boundary. Block high-impact external tools until green.
6. **Deterministic coverage & reliability.** Expand beyond B04’s 3 manager-integration tests to chat, cancellation, races, storage recovery. Resolve `task-manager.spec.ts` location/path; add specs tied to root causes. Address B10 conflicts explicitly (keys/formats, `all.cjs` CI lease, prompt seam ownership) via manager lease before editing shared files.

**Verdict:** `PRODUCT_QUALITY_VERDICT=CHANGES_REQUIRED`, `PRODUCT_QUALITY_SCORE=UNPROVEN`, `PRODUCT_QUALITY_HARD_FAILS=2`. RC cannot be awarded. Require evidence before integration; preserve disagreements; do not weaken guards.
