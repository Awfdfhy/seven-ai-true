# Seven Superloop Cycle 154

Run: 38324393978

## Machine summary

```json
{
  "cycle": 154,
  "featureCandidates": 0,
  "featuresAccepted": 0,
  "fixCandidates": 0,
  "fixesAccepted": 0,
  "polishAccepted": false,
  "apkState": "BLOCKED_NO_PRODUCT_DELTA",
  "productQualityVerdict": "CHANGES_REQUIRED or RC or PREMIUM_CANDIDATE or UNPROVEN",
  "productQualityScore": "<0.0-10.0 or UNPROVEN>",
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
  "head": "a378e3ea4c537296f41fc2f1e9bcbff7146d0d23",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 154,
    "sourceSha": "a378e3ea4c537296f41fc2f1e9bcbff7146d0d23",
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
session id: 01a13300-6765-74c1-a0f6-c037ce362910
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


Cycle: 154
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "a378e3ea4c537296f41fc2f1e9bcbff7146d0d23", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 154, "championSha": "16ac0db873f352a19c86f8f44523ea0ac8136359", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "a378e3ea4c537296f41fc2f1e9bcbff7146d0d23", "fullGatesPass": true}
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
session id: 01a132fe-a31f-7d50-82de-ae807a03bf5a
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

Memory is currently a P0 product campaign. Use .seven-team/memory-v2/RESEARCH_SYNTHESIS.md and EXECUTION_P

...[clipped by superloop]...

 (A01/Shell).** Deterministic unit tests for `ShellSnapshot` (patch/freeze/listeners, equality short-circuit, validation). No behavior change.
- **BH-154-002 (B02/Attachments).** Invariant tests (size limits, MIME allowlist, hash format, canonicalization, clone/freeze).
- **BH-154-003 (B04/Deep Think).** Transport guard tests (budget, trim, planner validation, cancellation boundary).
- **BH-154-006 (B07/Tools v1).** Deterministic tests for gates (ReferenceMonitor, approval binding, idempotency, replay, audit). Enforce schema/capability/scope/approval deterministically.

### P1 — Campaign closure (with evidence discipline)
- **A06 (Memory v2).** Close remaining acceptance per ownership map and evidence ledger (live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity, secret exclusion). Prefer incremental migration beside legacy memory; no destructive rewrite. Do not add semantic/vector/graph complexity without measured win over lexical/temporal baseline. Read `.seven-team/memory-v2/STRIKE_TEAM.md`, `IMPLEMENTATION_EVIDENCE.md`, `RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`.

### P2 — Stability, robustness & release assurance
- **Operational robustness.** Improve agent streaming resilience under 429/timeouts (retry with backoff, evidence streaming, idempotent verification) to avoid truncated evidence.
- **A08 (Release assurance).** Ensure test/build/validation evidence is complete and captured (not just summaries).
- **Research follow-up (domain-campaign).** For domains marked RESEARCH_INSUFFICIENT (all 30), assign targeted evidence gathering (current-state audit + broad internet research + architecture roadmap + tests + risks + first implementation slice) per domain. Do not merge domains; preserve separate roadmaps. External sources starting evidence only.
- **RPG/canon integrity (B05) if shipped.** Require checksum on persist/read, monotonic revision, branches, immutability/read-only projection with deterministic regression tests before treating complete.

## 6) Final verdict

**PRODUCT_QUALITY_VERDICT=CHANGES_REQUIRED**  
**PRODUCT_QUALITY_SCORE=UNPROVEN**  
**PRODUCT_QUALITY_HARD_FAILS=3**

This cycle produced **zero accepted product deltas**. The outcome is correctly conservative: architecture/guardrails preserved, APK discipline honored, no speculative PASS claims. However, release-readiness and premium UX remain unprovable without executable/runtime evidence (Android installed-artifact + exact-build visual). 

**Do not advance to RC/PREMIUM_CANDIDATE** until all hard fails are resolved with concrete, executable/runtime evidence artifacts bound to exact build identity. No weakening of guards, no averaging of missing evidence, no republishing of unchanged APK.
tokens used
47,360
# Seven Superloop Manager — Cycle 154 Final Review

**Cycle:** 154 | **Stage:** manager-final-review | **Authoritative product branch:** `seven-remake-v3`  
**Current HEAD (integration):** `a378e3ea4c537296f41fc2f1e9bcbff7146d0d23`  
**Champion (Evolution Arena):** `16ac0db873f352a19c86f8f44523ea0ac8136359` (promotion **BLOCKED_PENDING_COMPARATIVE_PROOF**)  
**Last completed cycle (state):** 153 (completed `2026-10-13T00:56:57.251987+00:00`, work branch `autoloop/seven-24h-work-v6`)

**Product Quality Verdict:** `CHANGES_REQUIRED` | **Product Quality Score:** `UNPROVEN` | **Hard Fails:** 3 (see §4)

## 1) Actual state snapshot (evidence-based)

- **No agent output accepted.** Feature integration: 0 accepted / 20 rejected (all “no candidate”). Fix integration: 0 accepted / 20 rejected (all “no candidate”). Polish accepted: **False**. No code/test/runtime deltas promoted this cycle.
- **Evolution Arena rule enforced.** No challenger wins from typecheck alone. Promotion remains **BLOCKED_PENDING_COMPARATIVE_PROOF** with champion `16ac0db8…`. No Evolution Arena candidate set expanded.
- **Domain research is incomplete.** `.seven-team/superloop-state.json` (cycle 153 summary) reports **30/30 domains RESEARCH_INSUFFICIENT** (D01–D30). The domain-campaign corpus under `.seven-team/domain-campaign/` remains mandatory during RESEARCH; insufficient domains cannot be treated as research-complete.
- **Autonomy proof is partial.** Autonomy block shows missing proof: `apkBuilt`, `productQualityScored`, `productHardFailsKnown`, `realityLabExactInstalledEvidence`, `constitutionRuntimeCoverage`, `physicalDeviceEvidence`. Constitution/runtime coverage marked `PARTIAL`. Trust status `UNPROVEN_OR_BLOCKED`. Aggregate score never overrides Constitution/product hard fails.
- **APK policy correctly enforced.** `APK_STAGE=BLOCKED_NO_PRODUCT_DELTA`. No user-facing/product-runtime delta exists under `remake/src`, `remake/index.html`, or `remake/public`. Refusing to republish another APK whose Seven payload is effectively unchanged. `SELF_HEAL_APK=EXHAUSTED`. Missing Android installed-artifact evidence remains missing until an executable device/emulator gate proves it.
- **Campaigns in-flight (evidence baselines exist).**
  - Memory v2: `.seven-team/memory-v2/RESEARCH_SYNTHESIS.md`, `.seven-team/memory-v2/EXECUTION_PLAN.md`, `.seven-team/memory-v2/STRIKE_TEAM.md`, `.seven-team/memory-v2/IMPLEMENTATION_EVIDENCE.md` (P0). Ownership: A06/B08 primary; A04 (arch review), A08 (verification), B09 (race/stress), B10 (product cohesion).
  - Tools v1: `.seven-team/tools-v1/RESEARCH_SYNTHESIS.md`, `.seven-team/tools-v1/EXECUTION_PLAN.md` (P0). Owners: A04+A07 (arch/security), A08 (verification), B09 (race/replay), B10 (product cohesion), B07 (network/failure semantics). LLM is never an authorization boundary.
- **Product intelligence corpus present.** `.seven-team/product-intelligence/README.md`, `.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json`, `.seven-team/product-intelligence/sources/OFFICIAL_SOURCE_MAP.json`, visual boards under `.seven-team/product-intelligence/visual/`, `PRODUCT_KNOWLEDGE_BASE.md`, `VISUAL_REFERENCE_CATALOG.json`, `JUDGE_PROTOCOL.md` exist in repo scope (referenced by instructions). Team routing via `.seven-team/superloop/team-v1.json` (knowledgePacks) applies.

## 2) What actually improved

- **Discipline over volume.** With 0 features/fixes accepted and polish rejected, the manager enforced the hard rule: a feature/fix is not accepted because claimed; it must be backed by code/test/runtime evidence. No speculative PASSes.
- **Correct release discipline.** APK correctly blocked due to no product delta; no republish of an unchanged payload. Android installed-artifact requirement preserved.
- **Architectural guardrails preserved.** No duplicate owners created; no weakening of security/constitution/proof-policy observed. Defensive domain design references (shell/memory/routing/kernel) remain intact per repo structure. 
- **Memory foundation visible.** Memory v2 has concrete research synthesis, execution plan, strike team and implementation evidence ledger structure (276 passed noted in synthesis input) providing a testable baseline before semantic/vector expansion.
- **Evaluator-plane integrity.** Evolution Arena promotion blocked pending comparative proof. Hard fails cannot be averaged away; proof requirements explicitly listed and unmet. Failed experiments/quality debt preserved by policy.

## 3) What the team rejected

- **Speculative acceptance.** All 20 agents rejected for feature and fix integration (“no candidate”). Polish not accepted. No attempt to promote typecheck-only or claim-only work.
- **Downgrading evidence to appear green.** Explicitly rejected averaging missing runtime/visual/Android evidence into PASS. Rejected weakening guards/tests/security to inflate score.
- **Premature APK publication.** Correctly refused to publish another APK while `remake/src`, `remake/index.html`, `remake/public` show no product delta.
- **Premature Memory complexity.** Policy rejects promoting semantic/vector/graph complexity unless it wins a measured benchmark against current local lexical/temporal baseline (per Memory Strike Team). 
- **Premature domain completion.** Rejected treating any of the 30 domains as complete while marked RESEARCH_INSUFFICIENT; follow-up evidence gathering required.
- **Meta/privilege expansion.** Rejected any Meta-Team proposal that would grant privileges or weaken evaluator rules without repeated evidence.

## 4) What remains unproven (concrete evidence gaps)

**Hard fails (block premium/release-quality claim):**
1. **Android installed-artifact missing (A02).** No executable device/emulator gate evidence for exact build id/artifact (logs/install output/runtime smoke). Reality Lab exact-installed evidence and physical device evidence absent.
2. **Visual exact-build missing (A01/A03).** Missing exact-build visual evidence for key flows (shell viewport/keyboard, composer, chat, RTL/a11y). Cannot be waived; premium UX is UNPROVEN.
3. **APK blocked by policy (release artifact).** Release artifact not justified by product delta; APK remains blocked with no product delta. This is a hard release-readiness fail until product delta exists with supporting evidence.

**Other unproven items (by subsystem/owner):**
- **Shell/UX determinism (A01).** Shell snapshot invariants and deterministic unit tests (`ShellSnapshot`: patch/freeze/listeners, equality short-circuit, validation) unproven as regression coverage (BH-154-001).
- **Attachments invariants (B02).** Size limits, MIME allowlist, hash format, canonicalization, clone/freeze unproven by deterministic invariant tests (BH-154-002).
- **Deep Think transport guards (B04).** Budget/trim/planner validation/cancellation boundary guard tests unproven (BH-154-003).
- **Memory v2 closure (A06).** Live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity, secret exclusion per ownership map/evidence ledger. Incremental migration beside legacy memory preferred; destructive rewrite not justified.
- **Resilience/Tools v1 gates (B07).** Deterministic tests for ReferenceMonitor, approval binding, idempotency, replay, audit. Schema/capability/scope/approval enforcement and network/failure semantics unproven.
- **Storage/recovery (B08).** Restart persistence + deterministic recovery paths with concrete evidence artifacts.
- **Stress/races (B09).** Deterministic stress suite proving cancellation correctness under contention; race-conscious checks.
- **Product cohesion/QA (B10).** Full rubric evaluation against `.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json` with hard-fails explicit (no aggregate masking).
- **Release assurance/red-team/perf (A08/A09/A10).** Test/build/validation evidence completeness; security/red-team coverage evidence; performance verification artifacts.
- **Research/GitHub/RPG/runtime (B03/B05/B06).** Research runtime behavior, GitHub/self-dev integration evidence, RPG canon/runtime integrity model (checksum/persist/read, monotonic revision, branches, immutability/read-only projection) if shipped.

Domain research: all 30 domains RESEARCH_INSUFFICIENT — external sources are starting evidence only, not authority over Seven’s exact runtime behavior.

## 5) Exact next-cycle priorities (smallest coherent provable set)

### P0 — Evidence completeness (blockers)
- **A02 (Android/native/APK).** Build + install to device/emulator + runtime smoke for exact build id/artifact. Capture build logs, install output, runtime smoke. Do not republish unchanged APK until product delta exists.
- **A01/A03 (Visual/runtime).** Capture browser runtime evidence for key flows (shell viewport/keyboard, composer, chat, RTL/a11y). Include screenshots + DOM state + focus order + `dir` + reduced motion. Treat missing exact-build as UNPROVEN.
- **B08 (Storage/recovery).** Deterministic restart persistence + recovery tests with concrete evidence artifacts.
- **B09 (Stress/races).** Deterministic stress suite with race-conscious checks; prove cancellation correctness under contention.
- **B10 (Product cohesion/QA).** Evaluate against product-intelligence rubric with hard-fails explicit; no aggregate masking.

### P1 — Determinism & safety (prevent regressions without weakening guards)
- **BH-154-001 (A01/Shell).** Deterministic unit tests for `ShellSnapshot` (patch/freeze/listeners, equality short-circuit, validation). No behavior change.
- **BH-154-002 (B02/Attachments).** Invariant tests (size limits, MIME allowlist, hash format, canonicalization, clone/freeze).
- **BH-154-003 (B04/Deep Think).** Transport guard tests (budget, trim, planner validation, cancellation boundary).
- **BH-154-006 (B07/Tools v1).** Deterministic tests for gates (ReferenceMonitor, approval binding, idempotency, replay, audit). Enforce schema/capability/scope/approval deterministically.

### P1 — Campaign closure (with evidence discipline)
- **A06 (Memory v2).** Close remaining acceptance per ownership map and evidence ledger (live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity, secret exclusion). Prefer incremental migration beside legacy memory; no destructive rewrite. Do not add semantic/vector/graph complexity without measured win over lexical/temporal baseline. Read `.seven-team/memory-v2/STRIKE_TEAM.md`, `IMPLEMENTATION_EVIDENCE.md`, `RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`.

### P2 — Stability, robustness & release assurance
- **Operational robustness.** Improve agent streaming resilience under 429/timeouts (retry with backoff, evidence streaming, idempotent verification) to avoid truncated evidence.
- **A08 (Release assurance).** Ensure test/build/validation evidence is complete and captured (not just summaries).
- **Research follow-up (domain-campaign).** For domains marked RESEARCH_INSUFFICIENT (all 30), assign targeted evidence gathering (current-state audit + broad internet research + architecture roadmap + tests + risks + first implementation slice) per domain. Do not merge domains; preserve separate roadmaps. External sources starting evidence only.
- **RPG/canon integrity (B05) if shipped.** Require checksum on persist/read, monotonic revision, branches, immutability/read-only projection with deterministic regression tests before treating complete.

## 6) Final verdict

**PRODUCT_QUALITY_VERDICT=CHANGES_REQUIRED**  
**PRODUCT_QUALITY_SCORE=UNPROVEN**  
**PRODUCT_QUALITY_HARD_FAILS=3**

This cycle produced **zero accepted product deltas**. The outcome is correctly conservative: architecture/guardrails preserved, APK discipline honored, no speculative PASS claims. However, release-readiness and premium UX remain unprovable without executable/runtime evidence (Android installed-artifact + exact-build visual). 

**Do not advance to RC/PREMIUM_CANDIDATE** until all hard fails are resolved with concrete, executable/runtime evidence artifacts bound to exact build identity. No weakening of guards, no averaging of missing evidence, no republishing of unchanged APK.
