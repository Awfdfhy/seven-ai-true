# Seven Superloop Cycle 8

Run: 37234241756

## Machine summary

```json
{
  "cycle": 8,
  "featureCandidates": 2,
  "featuresAccepted": 0,
  "fixCandidates": 2,
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
  "head": "4511b46a07120c959a9d5b07fc950e38e425909c",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 8,
    "sourceSha": "4511b46a07120c959a9d5b07fc950e38e425909c",
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
OpenAI Codex v0.160.0
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a10938-5e95-7941-be55-163bc2e72d27
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


Cycle: 8
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: conflict", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: conflict", "B10: no candidate"], "head": "4511b46a07120c959a9d5b07fc950e38e425909c", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 8, "championSha": "4511b46a07120c959a9d5b07fc950e38e425909c", "challengers": [{"agent": "A07", "sha": "3b026b0ff5a06cd48f7a1e5445ea94001f47d7bf", "stage": "SHADOW_ELIGIBLE", "comparativeScore": null, "proof": "quick typecheck candidate only", "outputDigest": "2634ffcb7f99cf06513bdceefcbde824500b1da3b5cbb295b9703e1777af1c5f"}, {"agent": "B09", "sha": "b3c719ed4223a24a247593a98b1eb518a036709a", "stage": "SHADOW_ELIGIBLE", "comparativeScore": null, "proof": "quick typecheck candidate only", "outputDigest": "9234bd7bdbd181e1933e04bf67fef238be94f6d315b22b9d1a314b630370668d"}], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: conflict", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: conflict", "B10: no candidate"], "head": "4511b46a07120c959a9d5b07fc950e38e425909c", "fullGatesPass": true}
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
/bin/bash -lc 'ls -la && echo "---SEVEN TEAM---" && ls -la .seven-team 2>/dev/null' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
total 2976
drwxr-xr-x 11 runner runner   4096 Oct  4 23:20 .
drwxr-xr-x 10 runner runner   4096 Oct  4 23:20 ..
-rw-r--r--  1 runner runner     92 Oct  4 23:20 .git
drwxr-xr-x  3 runner runner   4096 Oct  4 23:20 .github
-rw-r--r--  1 runner runner     33 Oct  4 23:20 .gitignore
drwxr-xr-x 11 runner runner   4096 Oct  4 23:20 .seven-team
-rw-r--r--  1 runner runner  10204 Oct  4 23:20 DEVELOPMENT_REPORT.md
-rw-r--r--  1 runner runner    559 Oct  4 23:20 PROJECT_MANIFEST.json
-rw-r--r--  1 runner runner    754 Oct  4 23:20 README.md
-rw-r--r--  1 runner runner  10954 Oct  4 23:20 SEVEN_AI_ARCHITECTURE_V4.md
-rw-r--r--  1 runner runner  25280 Oct  4 23:20 SEVEN_AI_FREE_MAX_PLAN.md
-rw-r--r--  1 runner runner   7577 Oct  4 23:20 SEVEN_IMPLEMENTATION_MATRIX.md
-rw-r--r--  1 runner runner   8458 Oct  4 23:20 SEVEN_POLISH_ROADMAP.md
-rw-r--r--  1 runner runner   1170 Oct  4 23:20 all.cjs
drwxr-xr-x  2 runner runner   4096 Oct  4 23:20 apk
-rw-r--r--  1 runner runner    272 Oct  4 23:20 capacitor.config.json
drwxr-xr-x  3 runner runner   4096 Oct  4 23:20 cloudflare
drwxr-xr-x  2 runner runner   4096 Oct  4 23:20 eval
drwxr-xr-x  2 runner runner   4096 Oct  4 23:20 evolution
-rw-r--r--  1 runner runner    137 Oct  4 23:20 memory-results.json
-rw-r--r--  1 runner runner   3261 Oct  4 23:20 memory.cjs
-rw-r--r--  1 runner runner   1350 Oct  4 23:20 package.json
drwxr-xr-x  2 runner runner   4096 Oct  4 23:20 plans
drwxr-xr-x  5 runner runner   4096 Oct  4 23:20 release
drwxr-xr-x  4 runner runner   4096 Oct  4 23:20 remake
-rw-r--r--  1 runner runner   4942 Oct  4 23:20 runtime-smoke.cjs
-rw-r--r--  1 runner runner 842964 Oct  4 23:20 seven_ai-final.html
-rw-r--r--  1 runner runner 620723 Oct  4 23:20 seven_ai-t150.html
-rw-r--r--  1 runner runner 641085 Oct  4 23:20 seven_ai-t152.html
-rw-r--r--  1 runner runner 651222 Oct  4 23:20 seven_ai-t161.html
-rw-r--r--  1 runner runner 122722 Oct  4 23:20 verify.cjs
---SEVEN TEAM---
total 76
drwxr-xr-x 11 runner runner 4096 Oct  4 23:20 .
drwxr-xr-x 11 runner runner 4096 Oct  4 23:20 ..
-rw-r--r--  1 runner runner 1560 Oct  4 23:20 PROTOCOL.md
-rw-r--r--  1 runner runner 2434 Oct  4 23:20 TWO_TEAM_PROTOCOL.md
drwxr-xr-x  2 runner runner 4096 Oct  4 23:20 bughunt
drwxr-xr-x  2 runner runner 4096 Oct  4 23:20 cohesion
drwxr-xr-x  3 runner runner 4096 Oct  4 23:20 domain-campaign
-rw-r--r--  1 runner runner  923 Oct  4 23:20 ownership.json
drwxr-xr-x  5 runner runner 4096 Oct  4 23:20 prompts
-rw-r--r--  1 runner runner 3437 Oct  4 23:20 readiness.json
drwxr-xr-x  2 runner runner 4096 Oct  4 23:20 remake-mega
drwxr-xr-x  2 runner runner 4096 Oct  4 23:20 remake-super
drwxr-xr-x  4 runner runner 4096 Oct  4 23:20 reports
drwxr-xr-x  2 runner runner 4096 Oct  4 23:20 runtime
drwxr-xr-x  2 runner runner 4096 Oct  4 23:20 superloop-history
-rw-r--r--  1 runner runner 2484 Oct  4 23:20 superloop-state.json
-rw-r--r--  1 runner runner 8019 Oct  4 23:20 team.json
-rw-r--r--  1 runner runner 3033 Oct  4 23:20 wave-01-manifest.json

exec
/bin/bash -lc "pwd && git status --porcelain=v1 -b | head -30 && echo \"---BRANCH---\" && git branch -a --format='%(refname:short) %(objectname:short)' | head -40 && echo \"---HEAD---\" && git log --oneline -12" in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
## HEAD (no branch)
---BRANCH---
(no branch) 4511b46
autoloop/seven-24h-work-v6 4511b46
main e82608f
origin 957ca83
origin/agent-b/01-rpg-ux e03b9ce
origin/agent-b/02-android-rpg b21fa2a

...[clipped by superloop]...

y** `seven_ai-final.html`. There is no credential/static scan over `remake/src`. A07's probe3 wrote a token-shaped literal (`ghp_leak_probe`, synthetic, not a real credential) into the product source tree with no gate able to catch that class of leak. Needs an automated secret-scan gate on the real product tree.

---

### Exact next-cycle priorities (ranked by user impact, single owner each)

1. **P0 — Re-base the loop onto `seven-remake-v3` (`6a8a16b`).** No agent writes product code until the integration branch contains the product. Re-point `productBranch`/`workBranch` in `.seven-team/superloop-state.json`, port `.seven-team/product-intelligence/`, `superloop/team-v1.json`, `autonomy/`, `memory-v2/`, `tools-v1/` from `origin/main` **onto the product branch** so the corpus and product share a home. Owner: manager + A04. *Acceptance:* `git merge-base --is-ancestor 6a8a16b <work-branch>` succeeds and `ls .seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json` resolves from the integration worktree.
2. **P0 — Delete champion contamination.** Remove `zz-probe1.test.ts` and `remake/.vitest/json/output.json`; add `.vitest/` to `.gitignore`. Owner: A08. *Acceptance:* `git ls-files remake/.vitest` empty; no `zz-probe*` tracked.
3. **P0 — Make the gate measure the product.** Extend `all.cjs` (or add a required `verify:remake` step) to run `npm ci && npm run typecheck && npm test` under `remake/`. Owner: A08 with A04 review. *Acceptance:* a deliberate `tsc` error in `remake/src` fails the root gate.
4. **P0 — Fix the timeout harness.** 6/7 cycles lost the manager synthesis stage. Give each stage an explicit corpus path list and a hard file-count budget; fail fast with `STAGE_INPUT_MISSING` instead of burning 240s. Owner: A10. *Acceptance:* a cycle completes all manager stages with zero `[agent timeout]`.
5. **P1 — Convert the two probes into real assertions.** A07 → canonical path-policy + token-retention tests with hard `expect` on every case (no `/tmp` dumps, no `node:fs` in `src/`). B09 → `TaskManager` cancel/deadline/restart-durability tests with assertions. Owner: A07 (self-dev security), B09 (races). *Acceptance:* every case asserted; a deliberately weakened guard makes the suite fail.
6. **P1 — Add a secret-scan gate over `remake/src`** mirroring `embedded-credentials.test.cjs`, plus a CI step. Owner: A07 with A02. *Acceptance:* a synthetic token literal in `remake/src` fails CI.
7. **P1 — Replace the domain-campaign stub with a real config.** Commit a domain list + per-domain evidence schema; stop generating boilerplate files that inflate the repo while proving nothing. Owner: A04 with A08. *Acceptance:* `latest-audit.json` `ready` is non-zero from actual research content, not template text.
8. **P1 — Realize the Android installed-artifact gate.** Nothing else in this list can clear a rubric hard fail. Requires emulator/device runner producing `six-remake`-signed APK + screenshots (light/dark, RTL, keyboard-open composer) bound to the exact SHA. Owner: A02, single owner, no parallel bridge. *Acceptance:* APK + screenshots exist and their embedded SHA equals the evaluated SHA.
9. **P2 — Close Memory v2 / Tools v1 ledgers on `6a8a16b`.** Both ledgers self-declare "FINAL PRODUCT GATES PENDING." Run the closure gates on the real product SHA. Owner: A06 + A03 (Memory), A04 + A05 (Tools), verified by A08. *Acceptance:* both ledgers flipped to PROVEN with linked evidence or explicitly left UNPROVEN with named blockers.
10. **P2 — Re-score the rubric with exact-build evidence.** Owner: B10, using the rubric from the product branch. *Acceptance:* per-dimension scores with linked artifact IDs; any hard fail keeps the verdict below 8.2.

**Promotion rule for cycle 9:** no candidate is promotable on typecheck alone, and no candidate may be evaluated against `4511b46`. After priority 1 lands, every comparative score must be Champion(`6a8a16b`+rebase) vs Challenger on the same tree.

**Standing constraints:** one owner per subsystem; no duplicate runtimes, stores, or bridges; cancellation, deadlines, persistence recovery, immutable public state, and exact payload identity stay protected; missing evidence stays UNPROVEN.
tokens used
624,842
## Cycle 8 — Manager Final Review

**Verdict: NO INTEGRATION. Release claim BLOCKED. One structural defect explains almost everything below.**

---

### Headline finding: the loop is gating a fork, not the product

| Tree | SHA | `remake/src` files | `.test.ts` | Memory v2 | Tools v1 | PI corpus |
|---|---|---|---|---|---|---|
| **Authoritative product** `origin/seven-remake-v3` | `6a8a16b` | 149 | 68 | merged | merged | **absent** |
| **Loop work branch** (integration head) | `4511b46` | 74 | 30 | **none** | **none** | **absent** |
| Corpus home `origin/main` | `e82608f` | — | — | docs only | docs only | **present** |

The superloop has been integrating against `autoloop/seven-24h-work-v6`, which is **10 commits ahead / 64 commits behind** `seven-remake-v3` and shares only merge-base `af01f5f`. `git log origin/autoloop/seven-24h-work-v6 | grep -Ec 'tools v1|memory v2'` returns **0**. The entire 86-file / +8,861-line Memory Fabric + Tools kernel + approval-UI + semantic-recall body of work on the product branch has never been visible to a single cycle-8 agent, gate, or judge. **This is root cause #1 and it invalidates the cycle's framing, not just its output.**

### Root cause #2: `fullGatesPass: true` measures the wrong product

`all.cjs` contains **zero** references to `remake` and invokes no `vitest`/`tsc`. It runs `eval/*`, `memory.cjs`, `runtime-smoke.cjs`, `verify.cjs`, `release/*`, `evolution/*.test.cjs` — the legacy HTML product. `remake/node_modules` is absent in this worktree, so no TypeScript product test could have executed locally either. The green gate is real but measures `seven_ai-final.html`, not the shipped `remake` app. CI does run the real thing (`.github/workflows/seven-remake-ci.yml`, `seven-remake-android.yml`), but only on `seven-remake-v3` pushes — which the loop never makes.

### Root cause #3: mandated corpus is unreachable from the loop

`.seven-team/product-intelligence/`, `.seven-team/superloop/team-v1.json`, `.seven-team/autonomy/`, `.seven-team/memory-v2/`, `.seven-team/tools-v1/` exist **only on `origin/main`**. Every cycle-8 instruction ("use PRODUCT_QUALITY_RUBRIC, JUDGE_PROTOCOL, knowledgePacks from team-v1.json") is therefore unsatisfiable from the integration branch. `grep -c 'agent timeout'` across `superloop-history/cycle-*.md`: **6 of 7 cycles timed out** (cycle 4 is the sole clean one). The timeouts are a harness defect, not bad luck — no agent can score a rubric it cannot open.

### Root cause #4: the domain campaign is a stub generator

All 30 domains in `.seven-team/domain-campaign/generated/domains/` are byte-identical boilerplate: `DOMAIN_VERDICT=RESEARCH_INSUFFICIENT`, `KNOWN_UNKNOWNS=Research agent output missing or timed out.` There is **no non-generated config file at all** — no domain list, no sources, no per-domain rubric. `latest-audit.json` reports `ready: 0, domains: 30`. This produces volume, not research, and the "separate roadmaps preserved" requirement is not met.

---

### What actually improved

Genuinely little, and none of it shippable:

- **APK self-heal exhaustion was the correct call.** `APK_STAGE=BLOCKED_NO_PRODUCT_DELTA` is right — but the stated *reason* is wrong. The reason is not "the product is unchanged"; it is "the loop is looking at a branch that never received 64 product commits." Refusing to publish was correct; the diagnosis must be corrected.
- **Evolution Arena refused two challengers.** `promotion: BLOCKED_PENDING_COMPARATIVE_PROOF` held. Both are anti-pattern probes: A07's four files `writeFileSync('/tmp/probe*.json')` then `expect(true).toBe(true)` (zero assertions, plus a `__probe-shim.ts` importing `node:fs` into `src/`); B09's `zz-probe2.test.ts` is `console.log`-only. Neither is a candidate.
- **Two genuine risk hypotheses were surfaced**, worth converting into real tests: (a) GitHub self-dev path canonicalization (`..%2f.env`, `%2e%2e/%2eenv`, untrimmed `"  .env"`, `.github/workflows/*` writes) and OAuth token retention across `disconnect()` including in-flight-refresh resurrection; (b) `TaskManager` cancel/deadline interleaving, 50 concurrent cancels on one task, and cancel during `starting`.

### What was rejected, and how the reasons were mislabeled

`A07: conflict` and `B09: conflict` (feature pass) / `A02: conflict`, `B09: conflict` (fix pass) are **wrong rejection reasons**. These were not competing implementations — they were empty shells. Labeling them "conflict" hides a systemic candidate-quality failure behind a duplicate-work label, which will mask the real problem in cycle 9 metrics. Correct reason for all four: **non-candidate, zero assertions, zero product delta.**

### Champion hygiene debt (on `4511b46`)

- `remake/src/integration/phase12/zz-probe1.test.ts` — a `console.log`-only race probe **is committed into the champion** and is absent from `seven-remake-v3`. The integration head is not a clean release candidate.
- `remake/.vitest/json/output.json` is committed; `.gitignore` covers `node_modules/`, `dist/`, `remake/dist/` but not `.vitest`. Build artifacts are inflating every diff.

---

### What remains UNPROVEN (not PASS)

Against `PRODUCT_QUALITY_RUBRIC.json` (`releaseCandidateMinimum: 8.2`, 10 hard fails):

| Rubric hard fail | Status | Blocking evidence needed |
|---|---|---|
| Critical visual state has no exact-build screenshot evidence | **UNPROVEN → treated as FAIL for premium claim** | Emulator screenshots at `6a8a16b` |
| APK identity/evidence does not match evaluated build | **UNPROVEN → FAIL** | No `.apk`/`.aab` exists in worktree or in git history on any branch |
| Arabic RTL materially harder to use | **UNPROVEN** | RTL screenshot, exact build |
| Composer obscured/broken under Android keyboard | **UNPROVEN** | Device/emulator capture |
| Shell/dashboard dominant while chat is secondary | **UNPROVEN** | Exact-build UI judgement |
| Duplicate design system / navigation ownership | **UNPROVEN** | Visual judge on exact build |
| Committed state lost across restart/restore | **UNPROVEN on `6a8a16b`** | Memory ledger itself says Android gate pending |
| Errors exposing secrets | **UNPROVEN on product tree** | see below |

`productQualityScore: UNPROVEN`, `trustStatus: UNPROVEN_OR_BLOCKED`, `constitutionRuntimeCoverage: PARTIAL`, `physicalDeviceEvidence: false` — all correctly held. **Any premium or release-quality claim is blocked until exact-build visual + installed-APK evidence exists.** The tooling's own rule already says so.

Additional gap found: `release/embedded-credentials.test.cjs` scans **only** `seven_ai-final.html`. There is no credential/static scan over `remake/src`. A07's probe3 wrote a token-shaped literal (`ghp_leak_probe`, synthetic, not a real credential) into the product source tree with no gate able to catch that class of leak. Needs an automated secret-scan gate on the real product tree.

---

### Exact next-cycle priorities (ranked by user impact, single owner each)

1. **P0 — Re-base the loop onto `seven-remake-v3` (`6a8a16b`).** No agent writes product code until the integration branch contains the product. Re-point `productBranch`/`workBranch` in `.seven-team/superloop-state.json`, port `.seven-team/product-intelligence/`, `superloop/team-v1.json`, `autonomy/`, `memory-v2/`, `tools-v1/` from `origin/main` **onto the product branch** so the corpus and product share a home. Owner: manager + A04. *Acceptance:* `git merge-base --is-ancestor 6a8a16b <work-branch>` succeeds and `ls .seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json` resolves from the integration worktree.
2. **P0 — Delete champion contamination.** Remove `zz-probe1.test.ts` and `remake/.vitest/json/output.json`; add `.vitest/` to `.gitignore`. Owner: A08. *Acceptance:* `git ls-files remake/.vitest` empty; no `zz-probe*` tracked.
3. **P0 — Make the gate measure the product.** Extend `all.cjs` (or add a required `verify:remake` step) to run `npm ci && npm run typecheck && npm test` under `remake/`. Owner: A08 with A04 review. *Acceptance:* a deliberate `tsc` error in `remake/src` fails the root gate.
4. **P0 — Fix the timeout harness.** 6/7 cycles lost the manager synthesis stage. Give each stage an explicit corpus path list and a hard file-count budget; fail fast with `STAGE_INPUT_MISSING` instead of burning 240s. Owner: A10. *Acceptance:* a cycle completes all manager stages with zero `[agent timeout]`.
5. **P1 — Convert the two probes into real assertions.** A07 → canonical path-policy + token-retention tests with hard `expect` on every case (no `/tmp` dumps, no `node:fs` in `src/`). B09 → `TaskManager` cancel/deadline/restart-durability tests with assertions. Owner: A07 (self-dev security), B09 (races). *Acceptance:* every case asserted; a deliberately weakened guard makes the suite fail.
6. **P1 — Add a secret-scan gate over `remake/src`** mirroring `embedded-credentials.test.cjs`, plus a CI step. Owner: A07 with A02. *Acceptance:* a synthetic token literal in `remake/src` fails CI.
7. **P1 — Replace the domain-campaign stub with a real config.** Commit a domain list + per-domain evidence schema; stop generating boilerplate files that inflate the repo while proving nothing. Owner: A04 with A08. *Acceptance:* `latest-audit.json` `ready` is non-zero from actual research content, not template text.
8. **P1 — Realize the Android installed-artifact gate.** Nothing else in this list can clear a rubric hard fail. Requires emulator/device runner producing `six-remake`-signed APK + screenshots (light/dark, RTL, keyboard-open composer) bound to the exact SHA. Owner: A02, single owner, no parallel bridge. *Acceptance:* APK + screenshots exist and their embedded SHA equals the evaluated SHA.
9. **P2 — Close Memory v2 / Tools v1 ledgers on `6a8a16b`.** Both ledgers self-declare "FINAL PRODUCT GATES PENDING." Run the closure gates on the real product SHA. Owner: A06 + A03 (Memory), A04 + A05 (Tools), verified by A08. *Acceptance:* both ledgers flipped to PROVEN with linked evidence or explicitly left UNPROVEN with named blockers.
10. **P2 — Re-score the rubric with exact-build evidence.** Owner: B10, using the rubric from the product branch. *Acceptance:* per-dimension scores with linked artifact IDs; any hard fail keeps the verdict below 8.2.

**Promotion rule for cycle 9:** no candidate is promotable on typecheck alone, and no candidate may be evaluated against `4511b46`. After priority 1 lands, every comparative score must be Champion(`6a8a16b`+rebase) vs Challenger on the same tree.

**Standing constraints:** one owner per subsystem; no duplicate runtimes, stores, or bridges; cancellation, deadlines, persistence recovery, immutable public state, and exact payload identity stay protected; missing evidence stays UNPROVEN.
