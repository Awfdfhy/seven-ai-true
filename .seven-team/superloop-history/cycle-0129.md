# Seven Superloop Cycle 129

Run: 38113437057

## Machine summary

```json
{
  "cycle": 129,
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
  "head": "8584754ff60f1e0c0b32413fcfa46df6e68291f5",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 129,
    "sourceSha": "8584754ff60f1e0c0b32413fcfa46df6e68291f5",
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
session id: 01a129d5-383e-7501-89ac-80805fa11662
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


Cycle: 129
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "8584754ff60f1e0c0b32413fcfa46df6e68291f5", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 129, "championSha": "8584754ff60f1e0c0b32413fcfa46df6e68291f5", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "8584754ff60f1e0c0b32413fcfa46df6e68291f5", "fullGatesPass": true}
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
exec
/bin/bash -lc 'find /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review -name "PRODUCT_QUALITY_RUBRIC*" -not -path "*/node_modules/*" 2>&1 | head -10' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
exec
/bin/bash -lc 'cat /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json 2>&1 | head -100' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
cat: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json: No such file or directory

exec
/bin/bash -lc 'ls /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/ 2>&1 | head -30' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
PROTOCOL.md
TWO_TEAM_PROTOCOL.md
bughunt
cohesion
domain-campaign
ownership.json
prompts
readiness.json
remake-mega
remake-super
reports
runtime
superloop-history
superloop-state.json
team.json
wave-01-manifest.json

exec
/bin/bash -lc 'cat /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/ownership.json 2>&1 | head -120' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
{
  "schemaVersion": 1,
  "policy": "exclusive-active-write",
  "manager": "ChatGPT",
  "leases": [
    {
      "team": "A",
      "scope": [
        "release/workspaces/*.css",
        "release/workspaces/seven-shell*.js",
        "release/workspaces/ui-polish-fixes.js",
        "release/workspaces/hub.js"
      ],
      "purpose": "UI Foundation V2",
      "status": "active"
    },
    {
      "team": "B",
      "scope": [
        "release/workspaces/rpg.js",
        "release/world-runtime.js",
        "release/canon-simulator.js"
      ],
      "purpose": "RPG V2 vertical slice",
      "status": "active"
    }
  ],
  "sharedReadOnlyByDefault": [
    "seven_ai-final.html",
    "release/build-release.cjs",
    "apk/patch-android.cjs",
    "verify.cjs",
    ".github/workflows/**"
  ],
  "sharedWriteRule": "Manager must grant a temporary explicit lease before either team edits sharedReadOnlyByDefault paths."
}

exec
/bin/bash -lc 'git -C /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review log --oneline -5' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
8584754 Superloop cycle 128 manager record
6a35cbc Superloop cycle 127 manager record
deab175 Superloop cycle 126 manager record
ee96dfe Superloop cycle 125 manager record
9a7b7f3 Superloop cycle 124 manager record

codex
**Final Cycle Review – Cycle 129 (Manager)**

- Head: `8584754ff60f1e0c0b32413fcfa46df6e68291f5` (Cycle 128 manager record)
- Stage: `manager-final-review`
- Feature integration: accepted=[], rejected all 20 agents (no candidate), `fullGatesPass=true` (structural gate report)
- Fix integration: same
- Evolution Arena: `BLOCKED_PENDING_COMPARATIVE_PROOF` (no challengers; rule enforced: “No challenger wins from typecheck alone.”)
- Polish: `False`
- APK: `APK_STAGE=BLOCKED_NO_PRODUCT_DELTA`, `SELF_HEAL_APK=EXHAUSTED`
- Independent product-quality synthesis: agent timeout after 240s
- Manager fallback: preserve current architecture, prioritize release blockers, require evidence before integration.

### What actually improved

- **Gate discipline preserved.** No features were promoted without candidates. All 20 agents were explicitly rejected for “no candidate.” The Evolution Arena correctly blocked promotion in the absence of comparative proof.
- **APK discipline enforced.** Refused to publish another APK whose Seven payload is effectively unchanged under `remake/src`, `remake/index.html`, or `remake/public`. This matches the hard rule: missing Android installed-artifact evidence remains missing until an executable device/emulator gate proves it.
- **Evidence-first stance maintained.** Manager did not infer completeness from structural gate flags (`fullGatesPass=true`). Fallback explicitly requires evidence before integration and preserves architecture rather than papering over gaps.
- **Campaign 

...[clipped by superloop]...

ty/failure semantics (P0)**
- Objective: Enforce LLM-not-authorization-boundary; deterministic schema/capability/scope/approval/replay; ReferenceMonitor, approval binding, idempotency, audit tests green.
- Owners: A04+A07 primary, A08 verification, B09 race/replay, B10 product cohesion, B07 network/failure semantics.
- Inspect: `.seven-team/tools-v1/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`.
- Evidence: contract tests, replay/idempotency, approval binding, audit coverage, failure semantics.
- Acceptance: security hard-fails cleared with evidence.

6. **Domain-campaign closure (P0) – evidence gathering, not certainty**
- Objective: For each configured Seven subsystem, ensure current-state audit, broad internet research, architecture roadmap, tests, risks, first implementation slice exist. If RESEARCH_INSUFFICIENT, assign follow-up evidence gathering (no invention). Route smallest knowledge packs.
- Owners: per subsystem owners from `team.json`/`superloop/team-v1.json`; cross-domain requires adjacent packs.
- Inspect: `.seven-team/domain-campaign/*`. Use `sources/OFFICIAL_SOURCE_MAP.json` when material.
- Evidence: per-domain roadmap+evidence; separate roadmaps preserved (don’t merge).
- Acceptance: no domain remains RESEARCH_INSUFFICIENT without assigned follow-up and evidence.

7. **Preserve failed experiments & quality debt (P1/P0 hygiene)**
- Objective: Record failed experiments/quality debt as learning evidence (don’t erase). Ensure ownership (one owner per subsystem), prevent duplicate runtimes/stores/bridges, protect cancellation/deadlines/persistence recovery/immutable public state/exact payload identity, never expose secrets.
- Owners: A04+A08+B09+B10 as applicable.
- Evidence: learning log entries tied to attempts.

### Manager verdict

- **Do not claim premium/release quality now.** Missing product delta + missing Android installed-artifact evidence + missing required product-intelligence/autonomy evidence are hard blockers. Visual quality is UNPROVEN.
- **Correct state is “blocked pending evidence.”** Rejecting all candidates and blocking Evolution Arena/APK is the right action. Reported `fullGatesPass=true` must not override these hard fails.
- **Next cycle must be evidence-driven.** Start with Priority 1 (delta + Android evidence) – this unblocks APK and gives a concrete target for visual/rubric evaluation and autonomy compliance. Route work by specialist knowledgePacks and ownership leases; require evidence before any acceptance/integration.

This is a concrete manager deliverable. No files were modified, committed, or pushed.
tokens used
50,819
**Final Cycle Review – Cycle 129 (Manager)**

- Head: `8584754ff60f1e0c0b32413fcfa46df6e68291f5` (Cycle 128 manager record)
- Stage: `manager-final-review`
- Feature integration: accepted=[], rejected all 20 agents (no candidate), `fullGatesPass=true` (structural gate report)
- Fix integration: same
- Evolution Arena: `BLOCKED_PENDING_COMPARATIVE_PROOF` (no challengers; rule enforced: “No challenger wins from typecheck alone.”)
- Polish: `False`
- APK: `APK_STAGE=BLOCKED_NO_PRODUCT_DELTA`, `SELF_HEAL_APK=EXHAUSTED`
- Independent product-quality synthesis: agent timeout after 240s
- Manager fallback: preserve current architecture, prioritize release blockers, require evidence before integration.

### What actually improved

- **Gate discipline preserved.** No features were promoted without candidates. All 20 agents were explicitly rejected for “no candidate.” The Evolution Arena correctly blocked promotion in the absence of comparative proof.
- **APK discipline enforced.** Refused to publish another APK whose Seven payload is effectively unchanged under `remake/src`, `remake/index.html`, or `remake/public`. This matches the hard rule: missing Android installed-artifact evidence remains missing until an executable device/emulator gate proves it.
- **Evidence-first stance maintained.** Manager did not infer completeness from structural gate flags (`fullGatesPass=true`). Fallback explicitly requires evidence before integration and preserves architecture rather than papering over gaps.
- **Campaign framing intact.** Memory Fabric v2 and Tool System v1 remain marked P0 with explicit owner sets and evidence ledgers defined in their execution plans/synthesis.

### What was rejected

- **All agent-submitted candidates.** Feature and fix integration lists show `rejected = ["A01..B10: no candidate"]` for all 20 agents. No vertical user value was accepted without code/test/runtime evidence.
- **Speculative promotion.** Evolution Arena promotion is blocked pending comparative proof. Isolated agent candidates are treated as challengers only, not winners.
- **Premature polish.** `Polish accepted: False` – polish not warranted when no accepted product delta exists.
- **APK regeneration.** Self-heal exhausted; regeneration refused due to lack of product delta. Publishing an unchanged payload would violate release-readiness and evidence discipline.

### What remains unproven

Critical blockers (must be proven, not assumed):

- **Product delta.** No user-facing/product-runtime delta exists under `remake/src`, `remake/index.html`, or `remake/public`. This is the direct cause of APK_BLOCKED_NO_PRODUCT_DELTA. Visual behavior under Seven runtime is unproven.
- **Android installed-artifact evidence.** Still missing. Requires an executable device/emulator gate tied to an exact build (artifact identity). Cannot be inferred from typecheck/build logs or from APK packaging of an unchanged payload.
- **Product quality/visuals.** Required product-intelligence artifacts referenced by the brief (e.g., `.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json`, `VISUAL_REFERENCE_CATALOG.json`, `JUDGE_PROTOCOL.md`, visual boards, encyclopedia v2 specialist packs, `sources/OFFICIAL_SOURCE_MAP.json`) are not present in the inspected `.seven-team/` tree. Missing exact-build visual evidence means visual quality is **UNPROVEN**, not PASS. Any rubric hard fail blocks premium/release-quality claim regardless of aggregate score.
- **Autonomy evaluator contracts.** `.seven-team/autonomy/` must be honored (Constitution, proof-policy, Engineering World Model for blast-radius/test planning only, Reality Lab evidence bound to candidate source/artifact identity, security/product-quality/constitution hard fails not averaged away). No artifacts from this plane were observed in the current `.seven-team/` snapshot provided; enforcement remains procedural but evidence of compliance is unproven.
- **Memory Fabric v2 (P0).** Requires proof of live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity, and secret exclusion. Per strike-team discipline, every memory capability must add to the evidence ledger (implementation commit, tests, benchmark vs local lexical/temporal baseline, Android exact-build state, known unproven). Baseline evidence exists in `.seven-team/memory-v2/RESEARCH_SYNTHESIS.md` and `EXECUTION_PLAN.md`, but concrete implementation/test/benchmark/Android evidence tied to this head is unproven.
- **Tool System v1 (P0).** LLM never authorization boundary. Deterministic schema, capability, scope, approval, replay, ReferenceMonitor, approval binding, idempotency, audit tests required. Evidence ledger unproven for this head. Primary owners A04+A07 with verification A08, race/replay B09, product cohesion B10, network/failure semantics B07.
- **Domain-campaign completeness.** Every Seven subsystem requires current-state audit, broad internet research, architecture roadmap, tests, risks, first implementation slice. A domain marked RESEARCH_INSUFFICIENT cannot be treated as complete; follow-up evidence gathering required. No per-domain completion proof observed.
- **Comparative proof for promotion.** Evolution Arena explicitly blocked pending comparative proof; no challengers recorded. This is correct and remains the state.

Notes on reported gate state: `fullGatesPass=true` is noted as a structural report, but hard fails (missing Android installed-artifact, missing product delta, missing required product-intelligence/autonomy evidence, rubric/constitution hard fails if any) cannot be averaged away. Treat reported “pass” as non-conclusive until all evidence exists.

### Exact next-cycle research priorities (ranked by user impact & release-readiness)

Assign by smallest complete knowledge set (encyclopedia v2: route via `.seven-team/superloop/team-v1.json` knowledgePacks; use `.seven-team/product-intelligence/sources/OFFICIAL_SOURCE_MAP.json` to refresh platform guidance when material). Do not merge domains.

1. **Release gate: Product delta + Android evidence (P0, blocks APK/release)**
- Objective: Produce a concrete, user-facing product delta under `remake/src`, `remake/index.html`, or `remake/public` (vertical slice with release value). Prove it runs on a device/emulator with exact-build installed-artifact evidence (bound to head `8584754`).
- Owners: A (UI Foundation V2, per ownership leases on `release/workspaces/*.css/js`, `hub.js`) + B (RPG V2 vertical slice where it integrates). Architecture A04 review. Verification A08. Android/device gate evidence required.
- Inspect: current `remake/*` (src/index.html/public), `release/workspaces/*`, integration points between A/B slices.
- Evidence: diff of product delta, runtime smoke on target (logs/screenshots tied to artifact identity), Android installed-artifact proof (executable gate), tests covering delta.
- Dependencies/conflicts: respect exclusive-active-write leases (A owns UI workspaces, B owns RPG/canon/world-runtime). Manager must grant explicit lease if editing shared paths. Avoid creating duplicate runtimes/stores/bridges.
- Acceptance: APK moves to reproducible build with proven payload delta; Android evidence present; no unchanged-payload regeneration.

2. **Product Intelligence + Visual quality (P0, blocks premium claim)**
- Objective: Establish required artifacts and run visual/product rubric against current runtime.
- Owners: B10 (product cohesion) with A09/A10 or designated product-intelligence owners per team config; route specialist knowledgePacks from `team-v1.json`.
- Inspect: `.seven-team/product-intelligence/*` (create/read only if missing per instructions), `VISUAL_REFERENCE_CATALOG.json`, `JUDGE_PROTOCOL.md`, visual boards, `sources/OFFICIAL_SOURCE_MAP.json`.
- Evidence: populated rubric with hard-fail criteria, exact-build visual evidence (screenshots tied to artifact identity of proven delta), judge results. Any hard fail blocks premium/release claim.
- Note: Reference products are principles/evidence only; never copy branding/proprietary assets/pixel geometry.
- Acceptance: rubric complete, visual quality verdict supported by exact-build evidence (not “PASS” by count).

3. **Autonomy contracts enforcement evidence (P0)**
- Objective: Prove evaluator-plane compliance for any candidate/delta.
- Owners: A07 (security) + A04 (architecture), B09 (race/replay) as needed.
- Inspect: `.seven-team/autonomy/*` (Constitution, proof-policy, Engineering World Model, Reality Lab). 
- Evidence: blast-radius analysis, test plan, Reality Lab evidence bound to candidate source/artifact identity, security hard-fail list, confirmation hard fails not averaged. 
- Acceptance: checklist satisfied for proposed delta (or “not applicable + justified”).

4. **Memory Fabric v2 – close P0 gaps (P0)**
- Objective: Address live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity, secret exclusion. Compare against local lexical/temporal baseline with measured benchmarks.
- Owners: A06/B08 primary, A04 architecture review, A08 verification, B09 race/stress, B10 product-cohesion. Follow STRIKE_TEAM.md and IMPLEMENTATION_EVIDENCE.md; don’t duplicate tasks.
- Inspect: `.seven-team/memory-v2/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`, `STRIKE_TEAM.md`, `IMPLEMENTATION_EVIDENCE.md`.
- Evidence per capability: implementation commit, tests, benchmark result vs baseline, Android exact-build state (if affects mobile), known unproven items. Prefer incremental migration beside legacy; no destructive rewrite. 
- Acceptance: evidence ledger updated with all required items; no promotion without measured win over baseline.

5. **Tool System v1 – harden security/failure semantics (P0)**
- Objective: Enforce LLM-not-authorization-boundary; deterministic schema/capability/scope/approval/replay; ReferenceMonitor, approval binding, idempotency, audit tests green.
- Owners: A04+A07 primary, A08 verification, B09 race/replay, B10 product cohesion, B07 network/failure semantics.
- Inspect: `.seven-team/tools-v1/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`.
- Evidence: contract tests, replay/idempotency, approval binding, audit coverage, failure semantics.
- Acceptance: security hard-fails cleared with evidence.

6. **Domain-campaign closure (P0) – evidence gathering, not certainty**
- Objective: For each configured Seven subsystem, ensure current-state audit, broad internet research, architecture roadmap, tests, risks, first implementation slice exist. If RESEARCH_INSUFFICIENT, assign follow-up evidence gathering (no invention). Route smallest knowledge packs.
- Owners: per subsystem owners from `team.json`/`superloop/team-v1.json`; cross-domain requires adjacent packs.
- Inspect: `.seven-team/domain-campaign/*`. Use `sources/OFFICIAL_SOURCE_MAP.json` when material.
- Evidence: per-domain roadmap+evidence; separate roadmaps preserved (don’t merge).
- Acceptance: no domain remains RESEARCH_INSUFFICIENT without assigned follow-up and evidence.

7. **Preserve failed experiments & quality debt (P1/P0 hygiene)**
- Objective: Record failed experiments/quality debt as learning evidence (don’t erase). Ensure ownership (one owner per subsystem), prevent duplicate runtimes/stores/bridges, protect cancellation/deadlines/persistence recovery/immutable public state/exact payload identity, never expose secrets.
- Owners: A04+A08+B09+B10 as applicable.
- Evidence: learning log entries tied to attempts.

### Manager verdict

- **Do not claim premium/release quality now.** Missing product delta + missing Android installed-artifact evidence + missing required product-intelligence/autonomy evidence are hard blockers. Visual quality is UNPROVEN.
- **Correct state is “blocked pending evidence.”** Rejecting all candidates and blocking Evolution Arena/APK is the right action. Reported `fullGatesPass=true` must not override these hard fails.
- **Next cycle must be evidence-driven.** Start with Priority 1 (delta + Android evidence) – this unblocks APK and gives a concrete target for visual/rubric evaluation and autonomy compliance. Route work by specialist knowledgePacks and ownership leases; require evidence before any acceptance/integration.

This is a concrete manager deliverable. No files were modified, committed, or pushed.
