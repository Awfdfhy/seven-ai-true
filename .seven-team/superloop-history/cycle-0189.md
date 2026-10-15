# Seven Superloop Cycle 189

Run: 38741389289

## Machine summary

```json
{
  "cycle": 189,
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
  "head": "a4c94744de01114ececdcb2f96e4aa6e3dd45f8f",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 189,
    "sourceSha": "a4c94744de01114ececdcb2f96e4aa6e3dd45f8f",
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
session id: 01a14018-3f49-7112-b792-d6e182ce3e3c
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


Cycle: 189
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "a4c94744de01114ececdcb2f96e4aa6e3dd45f8f", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 189, "championSha": "a4c94744de01114ececdcb2f96e4aa6e3dd45f8f", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "a4c94744de01114ececdcb2f96e4aa6e3dd45f8f", "fullGatesPass": true}
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
session id: 01a14015-7227-7761-b72f-3934f8170b25
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

 feature/integration/fix sections, and the Security Facts vs Hypotheses summary).

If you need me to verify anything file-by-file, let me know what specific paths or evidence you'd like me to cross-reference and I'll work with what's shared. Otherwise, here is the deliverable based on the supplied evidence stream.

---

# Seven Superloop — Cycle 189 Final Review

## What Actually Improved

1. **Root-cause mapping of the protected-path policy gap (Gap A).**
   - The Security Facts section crystallized that the protected-path policy is **web-only and advisory (F1)**, while native controls consist *only* of token custody (F5) and the repo-admin/secret path blocklist (F3). This is the precise root-cause boundary — not a vague "security" complaint.

2. **Exact-gap decomposition (A/Gap B root cause + silent-persistence UX).**
   - Separated the *capability-gap* (Gap A/Gap B) from the *UX-gap* (auto-merge/APK-dispatch silently persisted with no confirm — F8; localStorage destructive opt-in fallback — H3). The two are co-located in `release/github-self-dev.js` 157-176, but they are distinct failure modes.

3. **A concrete, minimal-risk first slice was defined.**
   - Native protect-list mirrors the JS list *exactly* (not a new list) → closes R1 behavior drift.
   - Action-time confirm (not persistent auto opt-in) → closes H4 silently one-tap merge-to-main.
   - Removes the silent-persistence merge UX (Gap C/H4) → trust-boundary win.
   - Deliberately *does not* touch credential embedding (Gap E) → accurate blast radius.

4. **Test plan that matches the existing hardened style.**
   - Parity test (string-containment on `SevenPlatformPlugin.java`, mirroring `harden-native-platform.cjs` forbidding `WrongConstant` suppression).
   - Protected-paths-write-blocking test (the highest-value missing test — "no test asserts the protected-path policy actually blocks writes").
   - Merge/dispatch-confirmation-required test.
   - localStorage destructive opt-in reset/label test.

5. **Honest risk framing.**
   - R1 (legitimate flows hitting newly-protected paths), R2 (confirm-modal inert/focus contract vs `closePanel` 394-400), R3 (dual protect-lists until unified), R4 (no false claim about Keystore covering Cloudflare/Search keys).

## What the Team Rejected (and Why)

| Candidate | Status | Reason |
|-----------|--------|--------|
| A01–A10 / B01–B10 | Rejected: no candidate | No agent produced runnable code + test evidence under the authoritative `seven-remake-v3` branch. |
| Feature integration | Accepted: ∅ | Empty candidate set. |
| Fix integration | Accepted: ∅ | Empty candidate set. |
| Polish | Rejected (False) | No user-facing/product-runtime delta under `remake/src`, `remake/index.html`, or `remake/public`. |
| APK publish | Blocked: `APK_STAGE=BLOCKED_NO_PRODUCT_DELTA` | Refused to publish another APK whose Seven payload is effectively unchanged. |
| APK self-heal | `SELF_HEAL_APK=EXHAUSTED` | Auto-recovery has no further headroom — a product delta (not a pipeline retry) is required. |
| Evolution Arena promotion | `BLOCKED_PENDING_COMPARATIVE_PROOF` | "No challenger wins from typecheck alone." |

**Core rejection principle:** No feature passes merely because an agent claims it works. Candidates were empty or lacked the required code/test/runtime evidence. The bar was not lowered to make the cycle appear green.

## What Remains Unproven

- **Protected-path policy blocking** — *no test asserts it actually blocks writes.* (Highest-priority missing test.)
- **Native protect-list ↔ JS protect-list parity** — untested; only asserted via string containment once a parity test exists.
- **Merge/dispatch confirmation required** — untested.
- **localStorage destructive opt-in reset/label** — untested.
- **Android installed-artifact evidence** — still missing per the hard rule; cannot be inferred from build config alone. Needs an executable emulator/device gate.
- **Full-gates pass with `fullGatesPass: true`** — technically true for the *empty* set, but an empty candidate set is not a product delta. Treated as structurally unproven, not PASS.
- **Visual quality** — per the Product Intelligence requirement, missing exact-build visual evidence ⇒ visual quality is UNPROVEN, regardless of any aggregate score.
- **Arabic parity / secret-exclusion / restart persistence / temporal correction / provenance / abstention** (Memory Fabric v2 completion criteria) — remain unproven until live-chat wiring + benchmark evidence land.

## Exact Next-Cycle Research Priorities

Priority is ranked by **user impact → root cause → blast radius**, then mapped to the smallest coherent slice that can pass the full suite.

1. **P0 — Implement the native protected-path list + action-time confirm slice (Gap A root cause + H4).**
   - Owner (to assign next cycle): `A04` as architecture owner + the agent that owns `release/github-self-dev.js` + an Android-build-capable agent (owner of `apk/materialize-native-platform.cjs`).
   - Evidence required: (a) `SevenPlatformPlugin.java` regenerated via `materialize-native-platform.cjs`; (b) emulator/device gate proving the protected path is actually blocked at runtime; (c) four tests listed in §7.

2. **P0 — Android installed-artifact gate.**
   - A runnable emulator/device test that materializes the APK and asserts the protected-path block at runtime — not build-config inspection. Blocks any "native-enforced" claim.

3. **P0 — Visual quality proof.**
   - Exact-build screenshot comparison against a reference frame for the self-dev panel, including `prefers-reduced-motion` handling injected via `apk/materialize-android-visual-test.cjs:107-110`. Missing visual evidence ⇒ UNPROVEN.

4. **P1 — Confirm-modal inert/focus contract regression test.**
   - Extend `release/release-verify.cjs:402-433` to assert the new confirm dialog does not regress `closePanel` (394-400) inert management. R2 mitigation.

5. **P1 — Shared protect-list policy module (Gap A long-term hygiene).**
   - Extract the JS + Java protect-list into a single source-of-truth so R3 (dual lists drift) degrades to "tested parity by construction." Dependency for future cross-domain changes (Evolution Arena vs Reality Lab).

6. **P1 — Credential embedding (Gap E) — separate, larger build/packaging change.**
   - NOT in this slice. Must not be implied as covered by Keystore token custody (F5) — Cloudflare/Search keys remain a distinct blast radius (F6/H3).

7. **P2 — Memory Fabric v2 completion criteria.**
   - Live-chat wiring + temporal correction + provenance + abstention + restart persistence + Arabic parity + secret exclusion + Android evidence + benchmark vs local lexical/temporal baseline → `IMPLEMENTATION_EVIDENCE.md` ledger entry.

8. **P2 — Tool System v1 (D03) guard chain.**
   - Before any high-impact external tool connects: ReferenceMonitor green + approval-binding tests + idempotency + audit tests + deterministic schema/capability/scope/replay checks.

---

## Deliverable

No files modified, no commits, no pushes — per instruction. This review is the concrete artifact: it (a) refuses to paper over an empty candidate set, (b) pins the protected-path root cause with file-level precision, and (c) reduces the next cycle to the smallest coherent slice that can actually produce a product delta and a PASS-gated APK.
tokens used
23,902
I don't have the ability to directly inspect the repository filesystem or run commands — those capabilities aren't exposed to me in this environment. However, I can still produce a concrete manager final-cycle review using the evidence that was provided in the prompt itself (the synthesis document, the feature/integration/fix sections, and the Security Facts vs Hypotheses summary).

If you need me to verify anything file-by-file, let me know what specific paths or evidence you'd like me to cross-reference and I'll work with what's shared. Otherwise, here is the deliverable based on the supplied evidence stream.

---

# Seven Superloop — Cycle 189 Final Review

## What Actually Improved

1. **Root-cause mapping of the protected-path policy gap (Gap A).**
   - The Security Facts section crystallized that the protected-path policy is **web-only and advisory (F1)**, while native controls consist *only* of token custody (F5) and the repo-admin/secret path blocklist (F3). This is the precise root-cause boundary — not a vague "security" complaint.

2. **Exact-gap decomposition (A/Gap B root cause + silent-persistence UX).**
   - Separated the *capability-gap* (Gap A/Gap B) from the *UX-gap* (auto-merge/APK-dispatch silently persisted with no confirm — F8; localStorage destructive opt-in fallback — H3). The two are co-located in `release/github-self-dev.js` 157-176, but they are distinct failure modes.

3. **A concrete, minimal-risk first slice was defined.**
   - Native protect-list mirrors the JS list *exactly* (not a new list) → closes R1 behavior drift.
   - Action-time confirm (not persistent auto opt-in) → closes H4 silently one-tap merge-to-main.
   - Removes the silent-persistence merge UX (Gap C/H4) → trust-boundary win.
   - Deliberately *does not* touch credential embedding (Gap E) → accurate blast radius.

4. **Test plan that matches the existing hardened style.**
   - Parity test (string-containment on `SevenPlatformPlugin.java`, mirroring `harden-native-platform.cjs` forbidding `WrongConstant` suppression).
   - Protected-paths-write-blocking test (the highest-value missing test — "no test asserts the protected-path policy actually blocks writes").
   - Merge/dispatch-confirmation-required test.
   - localStorage destructive opt-in reset/label test.

5. **Honest risk framing.**
   - R1 (legitimate flows hitting newly-protected paths), R2 (confirm-modal inert/focus contract vs `closePanel` 394-400), R3 (dual protect-lists until unified), R4 (no false claim about Keystore covering Cloudflare/Search keys).

## What the Team Rejected (and Why)

| Candidate | Status | Reason |
|-----------|--------|--------|
| A01–A10 / B01–B10 | Rejected: no candidate | No agent produced runnable code + test evidence under the authoritative `seven-remake-v3` branch. |
| Feature integration | Accepted: ∅ | Empty candidate set. |
| Fix integration | Accepted: ∅ | Empty candidate set. |
| Polish | Rejected (False) | No user-facing/product-runtime delta under `remake/src`, `remake/index.html`, or `remake/public`. |
| APK publish | Blocked: `APK_STAGE=BLOCKED_NO_PRODUCT_DELTA` | Refused to publish another APK whose Seven payload is effectively unchanged. |
| APK self-heal | `SELF_HEAL_APK=EXHAUSTED` | Auto-recovery has no further headroom — a product delta (not a pipeline retry) is required. |
| Evolution Arena promotion | `BLOCKED_PENDING_COMPARATIVE_PROOF` | "No challenger wins from typecheck alone." |

**Core rejection principle:** No feature passes merely because an agent claims it works. Candidates were empty or lacked the required code/test/runtime evidence. The bar was not lowered to make the cycle appear green.

## What Remains Unproven

- **Protected-path policy blocking** — *no test asserts it actually blocks writes.* (Highest-priority missing test.)
- **Native protect-list ↔ JS protect-list parity** — untested; only asserted via string containment once a parity test exists.
- **Merge/dispatch confirmation required** — untested.
- **localStorage destructive opt-in reset/label** — untested.
- **Android installed-artifact evidence** — still missing per the hard rule; cannot be inferred from build config alone. Needs an executable emulator/device gate.
- **Full-gates pass with `fullGatesPass: true`** — technically true for the *empty* set, but an empty candidate set is not a product delta. Treated as structurally unproven, not PASS.
- **Visual quality** — per the Product Intelligence requirement, missing exact-build visual evidence ⇒ visual quality is UNPROVEN, regardless of any aggregate score.
- **Arabic parity / secret-exclusion / restart persistence / temporal correction / provenance / abstention** (Memory Fabric v2 completion criteria) — remain unproven until live-chat wiring + benchmark evidence land.

## Exact Next-Cycle Research Priorities

Priority is ranked by **user impact → root cause → blast radius**, then mapped to the smallest coherent slice that can pass the full suite.

1. **P0 — Implement the native protected-path list + action-time confirm slice (Gap A root cause + H4).**
   - Owner (to assign next cycle): `A04` as architecture owner + the agent that owns `release/github-self-dev.js` + an Android-build-capable agent (owner of `apk/materialize-native-platform.cjs`).
   - Evidence required: (a) `SevenPlatformPlugin.java` regenerated via `materialize-native-platform.cjs`; (b) emulator/device gate proving the protected path is actually blocked at runtime; (c) four tests listed in §7.

2. **P0 — Android installed-artifact gate.**
   - A runnable emulator/device test that materializes the APK and asserts the protected-path block at runtime — not build-config inspection. Blocks any "native-enforced" claim.

3. **P0 — Visual quality proof.**
   - Exact-build screenshot comparison against a reference frame for the self-dev panel, including `prefers-reduced-motion` handling injected via `apk/materialize-android-visual-test.cjs:107-110`. Missing visual evidence ⇒ UNPROVEN.

4. **P1 — Confirm-modal inert/focus contract regression test.**
   - Extend `release/release-verify.cjs:402-433` to assert the new confirm dialog does not regress `closePanel` (394-400) inert management. R2 mitigation.

5. **P1 — Shared protect-list policy module (Gap A long-term hygiene).**
   - Extract the JS + Java protect-list into a single source-of-truth so R3 (dual lists drift) degrades to "tested parity by construction." Dependency for future cross-domain changes (Evolution Arena vs Reality Lab).

6. **P1 — Credential embedding (Gap E) — separate, larger build/packaging change.**
   - NOT in this slice. Must not be implied as covered by Keystore token custody (F5) — Cloudflare/Search keys remain a distinct blast radius (F6/H3).

7. **P2 — Memory Fabric v2 completion criteria.**
   - Live-chat wiring + temporal correction + provenance + abstention + restart persistence + Arabic parity + secret exclusion + Android evidence + benchmark vs local lexical/temporal baseline → `IMPLEMENTATION_EVIDENCE.md` ledger entry.

8. **P2 — Tool System v1 (D03) guard chain.**
   - Before any high-impact external tool connects: ReferenceMonitor green + approval-binding tests + idempotency + audit tests + deterministic schema/capability/scope/replay checks.

---

## Deliverable

No files modified, no commits, no pushes — per instruction. This review is the concrete artifact: it (a) refuses to paper over an empty candidate set, (b) pins the protected-path root cause with file-level precision, and (c) reduces the next cycle to the smallest coherent slice that can actually produce a product delta and a PASS-gated APK.
