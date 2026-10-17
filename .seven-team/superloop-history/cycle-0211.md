# Seven Superloop Cycle 211

Run: 39000932598

## Machine summary

```json
{
  "cycle": 211,
  "featureCandidates": 0,
  "featuresAccepted": 0,
  "fixCandidates": 0,
  "fixesAccepted": 0,
  "polishAccepted": false,
  "apkState": "BLOCKED_NO_PRODUCT_DELTA",
  "productQualityVerdict": "UNPROVEN",
  "productQualityScore": "UNPROVEN",
  "domainResearchReady": 4,
  "domainResearchTotal": 30,
  "domainResearchInsufficient": [
    "D01_CHAT_CORE",
    "D03_TOOLS_CAPABILITY",
    "D04_CODING_SYSTEM",
    "D05_SELF_DEVELOPMENT",
    "D07_RESEARCH_WEB",
    "D08_MODEL_ROUTING",
    "D09_DEEP_THINK",
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
    "D24_RELEASE_APK",
    "D25_HISTORY_ROOMS",
    "D26_SETTINGS_CONTROLS",
    "D27_ERROR_RECOVERY_UX",
    "D28_LOCAL_INTELLIGENCE",
    "D29_REAL_WORKS_CANON",
    "D30_AUTONOMOUS_QUALITY"
  ],
  "head": "836b773a39cd1ad0fdc1a7adf79a45a3258d0fae",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 211,
    "sourceSha": "836b773a39cd1ad0fdc1a7adf79a45a3258d0fae",
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
session id: 01a14888-9ccd-7da1-96e4-6caec6a5ad92
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


Cycle: 211
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "836b773a39cd1ad0fdc1a7adf79a45a3258d0fae", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 211, "championSha": "836b773a39cd1ad0fdc1a7adf79a45a3258d0fae", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "836b773a39cd1ad0fdc1a7adf79a45a3258d0fae", "fullGatesPass": true}
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
**Seven Superloop Manager — Final Cycle Review (Cycle 211)**

**Cycle metadata**
- `Cycle`: 211
- `Manager stage`: manager-final-review
- `HEAD`: `836b773a39cd1ad0fdc1a7adf79a45a3258d0fae`
- `Polish accepted`: `False`
- `APK_STAGE`: `BLOCKED_NO_PRODUCT_DELTA`
- `SELF_HEAL_APK`: `EXHAUSTED`
- `Evolution Arena`: `schemaVersion 1`, `promotion = BLOCKED_PENDING_COMPARATIVE_PROOF` (rule: "No challenger wins from typecheck alone.")
- `Full gates pass (integration state)`: `true` by report, but with zero accepted candidates across all 20 agents.

---

**What actually improved**

- **Stability of baseline control**: The repository remains pinned to the authoritative branch context with no unproven merges. HEAD is unchanged, preserving `seven-remake-v3` integrity.
- **Evaluator-plane discipline enforced**: Evolution Arena blocked promotion due to insufficient comparative proof, upholding the Seven Constitution and proof-policy.
- **Release discipline**: APK publication correctly refused because no user-facing/product-runtime delta exists under `remake/src`, `remake/index.html`, or `remake/public`. Missing evidence was not treated as PASS.
- **Campaign baseline clarity**: P0 campaigns (Memory v2 and Tools v1) remain correctly prioritized with explicit owner maps and evidence ledgers intact (e.g. `.seven-team/memory-v2/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`, `STRIKE_TEAM.md`, `IMPLEMENTATION_EVIDENCE.md` and `.seven-team/tools-v1/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`).

---

**What the team rejected**

- **All agent candidates rejected (20/20)**: `Feature integration.accepted = []`, `rejected = [A01–A10, B01–B10: "no candidate"]`. `Fix integration` same. No agent submission met the requirement of code/test/runtime evidence to justify acceptance.
- **Typecheck-only progress rejected**: Evolution Arena explicitly rejected promotion without comparative proof, in line with "No challenger wins from typecheck alone."
- **APK inflation rejected**: Publishing an APK with effectively unchanged Seven payload was refused. Release-readiness was not manufactured.
- **Speculation over research**: Domains not reaching RESEARCH_COMPLETE were not advanced. The stance of "manager fallback: preserve current architecture, prioritize release blockers and require evidence before integration" was applied.

---

**What remains unproven**

- **Product-runtime delta**: No demonstrable user-facing change validated against remake surfaces (`remake/src`, `remake/index.html`, `remake/public`). Therefore product/UX improvement is UNPROVEN.
- **Visual quality**: Missing exact-build visual evidence means visual quality is UNPROVEN per Product Intelligence requirement (reference `.seven-team/product-intelligence/VISUAL_REFERENCE_CATALOG.json`, visual boards under `.seven-team/product-intelligence/visual/`, and rubric hard fails).
- **Memory v2 end-to-end**: Live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android exact-build evidence, Arabic parity, and secret exclusion remain unproven despite shared baseline.
- **Tool System v1 security gates**: ReferenceMonitor, authorization boundary enforcement (LLM never authorization boundary), capability/scope/approval binding, idempotency, replay/audit tests, and failure semantics unproven prior to any high-impact external tool connections.
- **Domain campaign completion**: Any domain marked `RESEARCH_INSUFFICIENT` remains incomplete; no domain merged into vague plan. Cross-domain evidence and blast-radius from Engineering World Model require concrete artifacts.
- **Android artifact evidence**: Exact-build executable device/emulator proof is still absent. Android state remains UNPROVEN.

---

**Exact next-cycle research priorities**

1. **Establish verifiable product delta (blocker)**
   - **Objective**: Identify or generate a minimal, user-visible/product-runtime change in `remake/src`, `remake/index.html`, or `remake/public` with traceable artifacts.
   - **Inspect**: `remake/` surfaces, existing UI flows, `.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json`, `VISUAL_REFERENCE_CATALOG.json`, visual boards.
   - **Evidence**: Before/after screenshots/video from an exact build, DOM/state diffs, Playwright/visual regression or runtime assertions, and clear user value statement.
   - **Dependencies/conflicts**: Product Intelligence Encyclopedia v2 routing; avoid cross-surface churn.
   - **Acceptance**: Exact-build visual evidence exists, rubric hard fails cleared, no branding/proprietary asset copy.

2. **Memory v2 — close live-chat wiring + persistence + parity (P0)**
   - **Objective**: Prove end-to-end memory in a live chat path with restart persistence and Arabic parity.
   - **Inspect**: `.seven-team/memory-v2/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`, `STRIKE_TEAM.md`, `IMPLEMENTATION_EVIDENCE.md`, chat wiring, storage/recovery paths.
   - **Evidence**: Integration test with live-chat scenario, restart persistence proof, provenance/abstention cases, Android exact-build state, benchmark vs local lexical/temporal baseline, secret exclusion validation.
   - **Owners**: A06/B08 primary, A04 review, A08 verification, B09 race/stress, B10 product-cohesion. 
   - **Acceptance**: Evidence ledger updated with implementation commit, tests, benchmark result, Android exact-build state, and known unproven items closed or explicitly tracked.

3. **Tools v1 — enforce security gates before any external connections (P0)**
   - **Objective**: Harden tool execution with deterministic schema, capability scope, approval binding, idempotency, replay and audit.
   - **Inspect**: `.seven-team/tools-v1/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`, tool registry/schema, ReferenceMonitor design.
   - **Evidence**: ReferenceMonitor unit/integration tests, approval binding tests, idempotency/replay tests, audit log coverage, failure semantics verified, LLM boundary tests. 
   - **Owners**: A04+A07 architecture/security, A08 verification, B07 network/failure, B09 race/replay, B10 product-cohesion.
   - **Acceptance**: All gates green; no high-impact external tools connected until gates pass.

4. **Domain campaign completion with evidence discipline**
   - **Objective**: Convert any `RESEARCH_INSUFFICIENT` domains to research-complete with concrete artifacts, not certainty. Preserve separate roadmaps per subsystem.
   - **Inspect**: `.seven-team/domain-campaign/`, per-subsystem audits, architecture roadmaps, risks, first implementation slices, `OFFICIAL_SOURCE_MAP.json` for refresh.
   - **Evidence**: Artifact links to exact-build/runtime observations, blast-radius notes from Engineering World Model, Reality Lab evidence bound to candidate source/artifact identity.
   - **Acceptance**: Each domain's research status justified by artifacts; cross-domain dependencies routed via Product Intelligence Encyclopedia v2 knowledgePacks.

5. **Android executable proof path**
   - **Objective**: Produce Android installed-artifact evidence on device/emulator tied to the exact build.
   - **Inspect**: Android build/config, installable artifacts, `.seven-team/autonomy/` contracts.
   - **Evidence**: Device/emulator run logs, installed package identity, runtime smoke for the product delta, and traceable artifact SHA.
   - **Acceptance**: Gate satisfied before any Android-related "complete" claim.

---

**Manager directive**
- **No feature integration** this cycle. Preserve architecture.
- **Evidence-first**: Require concrete artifacts before accepting any candidate. Missing evidence = UNPROVEN.
- **Release discipline maintained**: Refuse APK publication without a verifiable product delta.
- **Campaigns continue**: Memory v2 and Tools v1 remain P0 with strict owner boundaries and evidence ledgers.
- **Evolution policy**: No promotion without comparative proof. Failed experiments/quality debt must be preserved as learning evidence.

**Artifacts referenced (for routing/inspection):** `.seven-team/product-intelligence/README.md`, `.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json`, `PRODUCT_KNOWLEDGE_BASE.md`, `VISUAL_REFERENCE_CATALOG.json`, `JUDGE_PROTOCOL.md`, `.seven-team/product-intelligence/visual/`, `.seven-team/product-intelligence/sources/OFFICIAL_SOURCE_MAP.json`, `.seven-team/superloop/team-v1.json`, `.seven-team/autonomy/*`, `.seven-team/domain-campaign/*`, `.seven-team/memory-v2/*`, `.seven-team/tools-v1/*`.
tokens used
9,556
**Seven Superloop Manager — Final Cycle Review (Cycle 211)**

**Cycle metadata**
- `Cycle`: 211
- `Manager stage`: manager-final-review
- `HEAD`: `836b773a39cd1ad0fdc1a7adf79a45a3258d0fae`
- `Polish accepted`: `False`
- `APK_STAGE`: `BLOCKED_NO_PRODUCT_DELTA`
- `SELF_HEAL_APK`: `EXHAUSTED`
- `Evolution Arena`: `schemaVersion 1`, `promotion = BLOCKED_PENDING_COMPARATIVE_PROOF` (rule: "No challenger wins from typecheck alone.")
- `Full gates pass (integration state)`: `true` by report, but with zero accepted candidates across all 20 agents.

---

**What actually improved**

- **Stability of baseline control**: The repository remains pinned to the authoritative branch context with no unproven merges. HEAD is unchanged, preserving `seven-remake-v3` integrity.
- **Evaluator-plane discipline enforced**: Evolution Arena blocked promotion due to insufficient comparative proof, upholding the Seven Constitution and proof-policy.
- **Release discipline**: APK publication correctly refused because no user-facing/product-runtime delta exists under `remake/src`, `remake/index.html`, or `remake/public`. Missing evidence was not treated as PASS.
- **Campaign baseline clarity**: P0 campaigns (Memory v2 and Tools v1) remain correctly prioritized with explicit owner maps and evidence ledgers intact (e.g. `.seven-team/memory-v2/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`, `STRIKE_TEAM.md`, `IMPLEMENTATION_EVIDENCE.md` and `.seven-team/tools-v1/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`).

---

**What the team rejected**

- **All agent candidates rejected (20/20)**: `Feature integration.accepted = []`, `rejected = [A01–A10, B01–B10: "no candidate"]`. `Fix integration` same. No agent submission met the requirement of code/test/runtime evidence to justify acceptance.
- **Typecheck-only progress rejected**: Evolution Arena explicitly rejected promotion without comparative proof, in line with "No challenger wins from typecheck alone."
- **APK inflation rejected**: Publishing an APK with effectively unchanged Seven payload was refused. Release-readiness was not manufactured.
- **Speculation over research**: Domains not reaching RESEARCH_COMPLETE were not advanced. The stance of "manager fallback: preserve current architecture, prioritize release blockers and require evidence before integration" was applied.

---

**What remains unproven**

- **Product-runtime delta**: No demonstrable user-facing change validated against remake surfaces (`remake/src`, `remake/index.html`, `remake/public`). Therefore product/UX improvement is UNPROVEN.
- **Visual quality**: Missing exact-build visual evidence means visual quality is UNPROVEN per Product Intelligence requirement (reference `.seven-team/product-intelligence/VISUAL_REFERENCE_CATALOG.json`, visual boards under `.seven-team/product-intelligence/visual/`, and rubric hard fails).
- **Memory v2 end-to-end**: Live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android exact-build evidence, Arabic parity, and secret exclusion remain unproven despite shared baseline.
- **Tool System v1 security gates**: ReferenceMonitor, authorization boundary enforcement (LLM never authorization boundary), capability/scope/approval binding, idempotency, replay/audit tests, and failure semantics unproven prior to any high-impact external tool connections.
- **Domain campaign completion**: Any domain marked `RESEARCH_INSUFFICIENT` remains incomplete; no domain merged into vague plan. Cross-domain evidence and blast-radius from Engineering World Model require concrete artifacts.
- **Android artifact evidence**: Exact-build executable device/emulator proof is still absent. Android state remains UNPROVEN.

---

**Exact next-cycle research priorities**

1. **Establish verifiable product delta (blocker)**
   - **Objective**: Identify or generate a minimal, user-visible/product-runtime change in `remake/src`, `remake/index.html`, or `remake/public` with traceable artifacts.
   - **Inspect**: `remake/` surfaces, existing UI flows, `.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json`, `VISUAL_REFERENCE_CATALOG.json`, visual boards.
   - **Evidence**: Before/after screenshots/video from an exact build, DOM/state diffs, Playwright/visual regression or runtime assertions, and clear user value statement.
   - **Dependencies/conflicts**: Product Intelligence Encyclopedia v2 routing; avoid cross-surface churn.
   - **Acceptance**: Exact-build visual evidence exists, rubric hard fails cleared, no branding/proprietary asset copy.

2. **Memory v2 — close live-chat wiring + persistence + parity (P0)**
   - **Objective**: Prove end-to-end memory in a live chat path with restart persistence and Arabic parity.
   - **Inspect**: `.seven-team/memory-v2/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`, `STRIKE_TEAM.md`, `IMPLEMENTATION_EVIDENCE.md`, chat wiring, storage/recovery paths.
   - **Evidence**: Integration test with live-chat scenario, restart persistence proof, provenance/abstention cases, Android exact-build state, benchmark vs local lexical/temporal baseline, secret exclusion validation.
   - **Owners**: A06/B08 primary, A04 review, A08 verification, B09 race/stress, B10 product-cohesion. 
   - **Acceptance**: Evidence ledger updated with implementation commit, tests, benchmark result, Android exact-build state, and known unproven items closed or explicitly tracked.

3. **Tools v1 — enforce security gates before any external connections (P0)**
   - **Objective**: Harden tool execution with deterministic schema, capability scope, approval binding, idempotency, replay and audit.
   - **Inspect**: `.seven-team/tools-v1/RESEARCH_SYNTHESIS.md`, `EXECUTION_PLAN.md`, tool registry/schema, ReferenceMonitor design.
   - **Evidence**: ReferenceMonitor unit/integration tests, approval binding tests, idempotency/replay tests, audit log coverage, failure semantics verified, LLM boundary tests. 
   - **Owners**: A04+A07 architecture/security, A08 verification, B07 network/failure, B09 race/replay, B10 product-cohesion.
   - **Acceptance**: All gates green; no high-impact external tools connected until gates pass.

4. **Domain campaign completion with evidence discipline**
   - **Objective**: Convert any `RESEARCH_INSUFFICIENT` domains to research-complete with concrete artifacts, not certainty. Preserve separate roadmaps per subsystem.
   - **Inspect**: `.seven-team/domain-campaign/`, per-subsystem audits, architecture roadmaps, risks, first implementation slices, `OFFICIAL_SOURCE_MAP.json` for refresh.
   - **Evidence**: Artifact links to exact-build/runtime observations, blast-radius notes from Engineering World Model, Reality Lab evidence bound to candidate source/artifact identity.
   - **Acceptance**: Each domain's research status justified by artifacts; cross-domain dependencies routed via Product Intelligence Encyclopedia v2 knowledgePacks.

5. **Android executable proof path**
   - **Objective**: Produce Android installed-artifact evidence on device/emulator tied to the exact build.
   - **Inspect**: Android build/config, installable artifacts, `.seven-team/autonomy/` contracts.
   - **Evidence**: Device/emulator run logs, installed package identity, runtime smoke for the product delta, and traceable artifact SHA.
   - **Acceptance**: Gate satisfied before any Android-related "complete" claim.

---

**Manager directive**
- **No feature integration** this cycle. Preserve architecture.
- **Evidence-first**: Require concrete artifacts before accepting any candidate. Missing evidence = UNPROVEN.
- **Release discipline maintained**: Refuse APK publication without a verifiable product delta.
- **Campaigns continue**: Memory v2 and Tools v1 remain P0 with strict owner boundaries and evidence ledgers.
- **Evolution policy**: No promotion without comparative proof. Failed experiments/quality debt must be preserved as learning evidence.

**Artifacts referenced (for routing/inspection):** `.seven-team/product-intelligence/README.md`, `.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json`, `PRODUCT_KNOWLEDGE_BASE.md`, `VISUAL_REFERENCE_CATALOG.json`, `JUDGE_PROTOCOL.md`, `.seven-team/product-intelligence/visual/`, `.seven-team/product-intelligence/sources/OFFICIAL_SOURCE_MAP.json`, `.seven-team/superloop/team-v1.json`, `.seven-team/autonomy/*`, `.seven-team/domain-campaign/*`, `.seven-team/memory-v2/*`, `.seven-team/tools-v1/*`.
