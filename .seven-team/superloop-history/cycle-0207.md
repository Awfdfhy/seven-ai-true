# Seven Superloop Cycle 207

Run: 38975334292

## Machine summary

```json
{
  "cycle": 207,
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
  "head": "1d362da1a5db79a964e01e018143674395a5e221",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 207,
    "sourceSha": "1d362da1a5db79a964e01e018143674395a5e221",
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
session id: 01a14742-9f57-7df0-acaf-15992d11197e
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


Cycle: 207
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "1d362da1a5db79a964e01e018143674395a5e221", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 207, "championSha": "1d362da1a5db79a964e01e018143674395a5e221", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "1d362da1a5db79a964e01e018143674395a5e221", "fullGatesPass": true}
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
session id: 01a14741-bc1d-7b80-994d-0685e1b95e1a
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

."

**Polish:** `accepted: False`.

**APK:** `APK_STAGE=BLOCKED_NO_PRODUCT_DELTA`, `SELF_HEAL_APK=EXHAUSTED`. The self-heal loop refused to publish another APK because there is no user-facing/product-runtime delta under `remake/src`, `remake/index.html`, or `remake/public`. The payload would be effectively unchanged.

**B03 conflict in feature integration:** flagged as conflict, not accepted.

## What remains unproven (do NOT call these PASS)

Every item below is UNPROVEN or BLOCKED. Missing evidence is not manufactured as PASS.

- **All 30 domain campaigns:** `RESEARCH_INSUFFICIENT`, including D01_CHAT_CORE, D02_MEMORY_CONTEXT, D03_TOOLS_CAPABILITY, D11_ANDROID_NATIVE, D12_UI_DESIGN_SYSTEM, D13_ARABIC_RTL_A11Y, D15_PERSISTENCE_RECOVERY, D24_RELEASE_APK, D20_PRODUCT_QUALITY, D30_AUTONOMOUS_QUALITY. No trustworthy plan block was produced; research output missing or timed out.
- **Remake release readiness:** `RELEASE_READY=INCONCLUSIVE`. Required but missing: installed-remake Android bridge device round-trip, built remake APK payload hash, installed payload identity match, installed remake smoke evidence. The existing `.github/workflows/android-apk.yml` only validates the legacy path.
- **Product quality / premium claim:** No `.seven-team/product-intelligence/` directory exists, no `JUDGE_PROTOCOL.md`, no `PRODUCT_QUALITY_RUBRIC.json`, no `VISUAL_REFERENCE_CATALOG.json`. Product-quality score is UNPROVEN; rubric hard fails unknown. The Seven Cohesion Pass is ACTIVE (feature freeze except release blockers/security/eval infra), meaning UI Foundation V2 and RPG V2 are classified REBUILD, not shippable.
- **Constitution / autonomy plane:** No `.seven-team/autonomy/` directory. Reality Lab exact-installed evidence absent, physical device evidence absent, constitution runtime coverage PARTIAL.
- **Memory v2 / Tools v1 (P0 campaigns):** Primary owners A06/B08 (memory) and A04+A07 (tools) produced no candidates this cycle. Live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity, secret exclusion — none proven.
- **Verified bugs awaiting fixes:** Bughunt B03 reports CRITICAL/HIGH/MEDIUM verified and strong findings in the research/citation domain (stale citations without `retrievedAt`/`contentHash`, GitHub search cache with no TTL/etag, citation `url→link` key mismatch, swallowed 429/5xx in native bridge, duplicate citations). Several are marked `NEEDS_RUNTIME_TEST`. None were accepted as fixes this cycle.

## Exact next-cycle research priorities

Priority order by user impact and root cause. Each is a research-completion task, not implementation go-ahead.

1. **D24_RELEASE_APK — installed-remake Android evidence.** Unblock APK publishing by producing a real remake APK packaging/device gate: built payload hash, installed identity match, bridge round-trip, smoke test. This is the release blocker.
2. **D02_MEMORY_CONTEXT + D03_TOOLS_CAPABILITY (P0).** Complete the Memory v2 and Tools v1 research baselines; assign A06/B08 (memory, with A04 architecture review, A08 verification, B09 race/stress, B10 cohesion) and A04+A07 (tools architecture/security, A08 verification, B09 race/replay, B07 network/failure). Do not promote semantic/vector/graph complexity unless it wins a measured benchmark against the local lexical/temporal baseline.
3. **D01_CHAT_CORE.** Research the chat/rooms/composer/streaming domain; required before any chat-surface change.
4. **D20_PRODUCT_QUALITY + product-intelligence corpus.** Stand up the product-intelligence directory (README, rubric, judge protocol, source map, visual catalog) and score the product so hard fails are known rather than unknown.
5. **D11_ANDROID_NATIVE + D13_ARABIC_RTL_A11Y.** Android device/emulator gate and Arabic parity — required before any mobile/release claim.
6. **D15_PERSISTENCE_RECOVERY + D25_HISTORY_ROOMS.** Restart persistence and recovery evidence for memory/chat.
7. **Evolution Arena B03.** Require comparative proof beyond typecheck before any promotion; champion remains `42246668e41ae1f24364783bd5b8722f5890916b`.

## Manager decision

Preserve current architecture. No integration, no APK publish, no premium/release-quality claim this cycle. Cycle 207 must convert the above research items from INSUFFICIENT to complete with evidence before any feature or fix is accepted. I will not modify files, commit, or push per instructions.

exec
/bin/bash -lc 'cd /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review && ls .seven-team/superloop-history/ | tail -8 && echo "---DOMAIN HISTORY---" && ls .seven-team/domain-campaign/generated/history/ | tail -5 && echo "---WAVE01---" && cat .seven-team/wave-01-manifest.json && echo "---BUGHUNT MANIFEST---" && cat .seven-team/bughunt/manifest.json' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
cycle-0199.md
cycle-0200.md
cycle-0201.md
cycle-0202.md
cycle-0203.md
cycle-0204.md
cycle-0205.md
cycle-0206.md
---DOMAIN HISTORY---
cycle-0202.md
cycle-0203.md
cycle-0204.md
cycle-0205.md
cycle-0206.md
---WAVE01---
{
  "schemaVersion": 1,
  "workerMarker": "WAVE01=COMPLETE",
  "reviewMarker": "WAVE01_REVIEW=PASS",
  "workers": [
    {"id":"A01","team":"A","worker":"Cline","branch":"agent/01-ui-ux","report":".seven-team/reports/wave-01/A01-ui-ownership.md"},
    {"id":"A02","team":"A","worker":"Codex CLI","branch":"agent/02-android-build","report":".seven-team/reports/wave-01/A02-android-evidence.md"},
    {"id":"A03","team":"A","worker":"Gemini CLI","branch":"agent/03-search","report":".seven-team/reports/wave-01/A03-localization-cohesion.md"},
    {"id":"A04","team":"A","worker":"OpenHands","branch":"agent/04-research","report":".seven-team/reports/wave-01/A04-design-system-map.md"},
    {"id":"A05","team":"A","worker":"OpenCode","branch":"agent/05-runtime-models","report":".seven-team/reports/wave-01/A05-runtime-controls.md"},
    {"id":"A06","team":"A","worker":"Aider","branch":"agent/06-memory-context","report":".seven-team/reports/wave-01/A06-persisted-ui-state.md"},
    {"id":"A07","team":"A","worker":"Goose","branch":"agent/07-security-selfdev","report":".seven-team/reports/wave-01/A07-selfdev-security.md"},
    {"id":"A08","team":"A","worker":"mini-SWE","branch":"agent/08-testing-ci","report":".seven-team/reports/wave-01/A08-ui-evaluation-harness.md"},
    {"id":"A09","team":"A","worker":"Qwen Code","branch":"agent/09-performance","report":".seven-team/reports/wave-01/A09-ui-performance.md"},
    {"id":"B01","team":"B","worker":"Cline","branch":"agent-b/01-rpg-ux","report":".seven-team/reports/wave-01/B01-rpg-ux.md"},
    {"id":"B02","team":"B","worker":"Codex CLI","branch":"agent-b/02-android-rpg","report":".seven-team/reports/wave-01/B02-rpg-android.md"},
    {"id":"B03","team":"B","worker":"Gemini CLI","branch":"agent-b/03-canon-retrieval","report":".seven-team/reports/wave-01/B03-canon-grounding.md"},
    {"id":"B04","team":"B","worker":"OpenHands","branch":"agent-b/04-rpg-engine","report":".seven-team/reports/wave-01/B04-rpg-engine-map.md"},
    {"id":"B05","team":"B","worker":"OpenCode","branch":"agent-b/05-rpg-runtime","report":".seven-team/reports/wave-01/B05-rpg-runtime.md"},
    {"id":"B06","team":"B","worker":"Aider","branch":"agent-b/06-rpg-memory","report":".seven-team/reports/wave-01/B06-rpg-memory.md"},
    {"id":"B07","team":"B","worker":"Goose","branch":"agent-b/07-rpg-integrity","report":".seven-team/reports/wave-01/B07-rpg-integrity.md"},
    {"id":"B08","team":"B","worker":"mini-SWE","branch":"agent-b/08-rpg-testing","report":".seven-team/reports/wave-01/B08-rpg-evaluation-harness.md"},
    {"id":"B09","team":"B","worker":"Qwen Code","branch":"agent-b/09-rpg-performance","report":".seven-team/reports/wave-01/B09-rpg-performance.md"}
  ],
  "reviewers": [
    {"id":"A10","team":"A","worker":"Hermes Agent","branch":"agent/10-integration-review","report":".seven-team/reports/wave-01/A10-integration-review.md"},
    {"id":"B10","team":"B","worker":"Hermes Agent","branch":"agent-b/10-rpg-review","report":".seven-team/reports/wave-01/B10-integration-review.md"}
  ]
}
---BUGHUNT MANIFEST---
{
  "schemaVersion": 1,
  "target": "Seven-AI-2.4.3-Zero-Key-Final(1).apk",
  "marker": "BUGHUNT=COMPLETE",
  "workers": [
    {
      "id": "A01",
      "team": "A",
      "worker": "Cline",
      "focus": "UI / visual layout / theme / night mode / responsive surfaces",
      "branch": "bughunt/a01",
      "prompt": ".seven-team/prompts/bughunt/A01.md",
      "report": ".seven-team/reports/bughunt/A01.md"
    },
    {
      "id": "A02",
      "team": "A",
      "worker": "Codex CLI",
      "focus": "Android lifecycle / install-upgrade / WebView / native bridge / permissions",
      "branch": "bughunt/a02",
      "prompt": ".seven-team/prompts/bughunt/A02.md",
      "report": ".seven-team/reports/bughunt/A02.md"
    },
    {
      "id": "A03",
      "team": "A",
      "worker": "Gemini CLI",
      "focus": "Arabic RTL / localization / accessibility / text overflow / keyboard",
      "branch": "bughunt/a03",
      "prompt": ".seven-team/prompts/bughunt/A03.md",
      "report": ".seven-team/reports/bughunt/A03.md"
    },
    {
      "id": "A04",
      "team": "A",
      "worker": "OpenHands",
      "focus": "Navigation / dialogs / workspaces / architecture / duplicate UI systems",
      "branch": "bughunt/a04",
      "prompt": ".seven-team/prompts/bughunt/A04.md",
      "report": ".seven-team/reports/bughunt/A04.md"
    },
    {
      "id": "A05",
      "team": "A",
      "worker": "OpenCode",
      "focus": "Model picker / provider routing / free-route selection / mode controls",
      "branch": "bughunt/a05",
      "prompt": ".seven-team/prompts/bughunt/A05.md",
      "report": ".seven-team/reports/bughunt/A05.md"
    },
    {
      "id": "A06",
      "team": "A",
      "worker": "Aider",
      "focus": "Memory / context / persistence / migrations / corruption / restore",
      "branch": "bughunt/a06",
      "prompt": ".seven-team/prompts/bughunt/A06.md",
      "report": ".seven-team/reports/bughunt/A06.md"
    },
    {
      "id": "A07",
      "team": "A",
      "worker": "Goose",
      "focus": "Security / zero-key / credentials / self-dev / GitHub protections",
      "branch": "bughunt/a07",
      "prompt": ".seven-team/prompts/bughunt/A07.md",
      "report": ".seven-team/reports/bughunt/A07.md"
    },
    {
      "id": "A08",
      "team": "A",
      "worker": "mini-SWE",
      "focus": "Test gaps / reproducibility / CI / release verification / regressions",
      "branch": "bughunt/a08",
      "prompt": ".seven-team/prompts/bughunt/A08.md",
      "report": ".seven-team/reports/bughunt/A08.md"
    },
    {
      "id": "A09",
      "team": "A",
      "worker": "Qwen Code",
      "focus": "Performance / DOM / storage / observers / network latency / long chats",
      "branch": "bughunt/a09",
      "prompt": ".seven-team/prompts/bughunt/A09.md",
      "report": ".seven-team/reports/bughunt/A09.md"
    },
    {
      "id": "A10",
      "team": "A",
      "worker": "Hermes Agent",
      "focus": "Holistic adversarial product audit across all surfaces",
      "branch": "bughunt/a10",
      "prompt": ".seven-team/prompts/bughunt/A10.md",
      "report": ".seven-team/reports/bughunt/A10.md"
    },
    {
      "id": "B01",
      "team": "B",
      "worker": "Cline",
      "focus": "Chat core / send-stop-copy / streaming / retry / room switching",
      "branch": "bughunt/b01",
      "prompt": ".seven-team/prompts/bughunt/B01.md",
      "report": ".seven-team/reports/bughunt/B01.md"
    },
    {
      "id": "B02",
      "team": "B",
      "worker": "Codex CLI",
      "focus": "Attachments / PDF / import-export / file errors / Android document flow",
      "branch": "bughunt/b02",
      "prompt": ".seven-team/prompts/bughunt/B02.md",
      "report": ".seven-team/reports/bughunt/B02.md"
    },
    {
      "id": "B03",
      "team": "B",
      "worker": "Gemini CLI",
      "focus": "Web Search / Deep Research / citations / evidence / stale-result handling",
      "branch": "bughunt/b03",
      "prompt": ".seven-team/prompts/bughunt/B03.md",
      "report": ".seven-team/reports/bughunt/B03.md"
    },
    {
      "id": "B04",
      "team": "B",
      "worker": "OpenHands",
      "focus": "Deep Think / reasoning modes / context construction / orchestration",
      "branch": "bughunt/b04",
      "prompt": ".seven-team/prompts/bughunt/B04.md",
      "report": ".seven-team/reports/bughunt/B04.md"
    },
    {
      "id": "B05",
      "team": "B",
      "worker": "OpenCode",
      "focus": "RPG / canon / world runtime / state / titles / persistence",
      "branch": "bughunt/b05",
      "prompt": ".seven-team/prompts/bughunt/B05.md",
      "report": ".seven-team/reports/bughunt/B05.md"
    },
    {
      "id": "B06",
      "team": "B",
      "worker": "Aider",
      "focus": "Coding workspace / GitHub self-development / repo actions / failure recovery",
      "branch": "bughunt/b06",
      "prompt": ".seven-team/prompts/bughunt/B06.md",
      "report": ".seven-team/reports/bughunt/B06.md"
    },
    {
      "id": "B07",
      "team": "B",
      "worker": "Goose",
      "focus": "Provider/network failures / offline / timeout / rate-limit / fallback behavior",
      "branch": "bughunt/b07",
      "prompt": ".seven-team/prompts/bughunt/B07.md",
      "report": ".seven-team/reports/bughunt/B07.md"
    },
    {
      "id": "B08",
      "team": "B",
      "worker": "mini-SWE",
      "focus": "Storage / backup / migration / session recovery / destructive edge cases",
      "branch": "bughunt/b08",
      "prompt": ".seven-team/prompts/bughunt/B08.md",
      "report": ".seven-team/reports/bughunt/B08.md"
    },
    {
      "id": "B09",
      "team": "B",
      "worker": "Qwen Code",
      "focus": "Concurrency / races / duplicate actions / state corruption / stress paths",
      "branch": "bughunt/b09",
      "prompt": ".seven-team/prompts/bughunt/B09.md",
      "report": ".seven-team/reports/bughunt/B09.md"
    },
    {
      "id": "B10",
      "team": "B",
      "worker": "Hermes Agent",
      "focus": "Independent whole-app adversarial bug hunt and cross-system contradictions",
      "branch": "bughunt/b10",
      "prompt": ".seven-team/prompts/bughunt/B10.md",
      "report": ".seven-team/reports/bughunt/B10.md"
    }
  ]
}

exec
/bin/bash -lc "cd /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review && python3 -c \"
import json
d=json.load(open('.seven-team/domain-campaign/generated/latest-audit.json'))
print(type(d), list(d)[:20] if isinstance(d,dict) else len(d))
\" 2>/dev/null || head -100 .seven-team/domain-campaign/generated/latest-audit.json" in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
<class 'dict'> ['schemaVersion', 'domains', 'ready', 'missing', 'insufficient', 'results']

codex

tokens used
432,397
