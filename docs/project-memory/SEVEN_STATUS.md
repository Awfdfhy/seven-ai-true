# Seven AI — Current Status

> Update this file when a meaningful project milestone changes. It is a compact operational snapshot, not a replacement for the Master Plan.

## Active Development Branch
`seven-beta-ui-v1`

## Protected Branches / PRs
- `main` — baseline
- `seven-v4.2-hardening` — hardened architecture branch
- PR #15: `seven-v4.2-hardening` → `main` — keep unmerged
- PR #16: `seven-beta-ui-v1` → `seven-v4.2-hardening` — keep Draft/unmerged

## Protected Source
`seven_ai-final.html`

Known integrity reference from the protected baseline:
- bytes: `658133`
- Git blob SHA: `3e8dfa8e7da7124e16504140eb9631c10cabf053`

A source-integrity test exists and should remain part of release verification.

## Ultimate Polish Campaign
- Protocol: `SEVEN_ULTIMATE_POLISH_PROTOCOL.md` v2.1
- Velocity Fabric is mandatory across every capability polish.
- Capability 01 — Cognitive Runtime: **Architecture frozen for campaign / implementation deferred**
  - final target: **Seven Cognitive Runtime 3.0 — Event-Governed Adaptive Run Kernel**
  - polish: `docs/project-memory/ultimate-polish/01_COGNITIVE_RUNTIME_ULTIMATE_POLISH.md`
  - freeze: `docs/project-memory/ultimate-polish/01_COGNITIVE_RUNTIME_FREEZE_RECORD.md`
  - implementation remains partial/foundation; CR-P0 through CR-P7 remain deferred until cross-system reconciliation.
- Capability 02 — Truth / Epistemic Fabric: **Architecture frozen for campaign / implementation deferred**
  - final target: **Seven Epistemic Fabric 3.0 — Provenance-Locked Claim Graph**
  - polish: `docs/project-memory/ultimate-polish/02_TRUTH_EPISTEMIC_FABRIC_ULTIMATE_POLISH.md`
  - freeze: `docs/project-memory/ultimate-polish/02_TRUTH_EPISTEMIC_FABRIC_FREEZE_RECORD.md`
  - implementation remains partial/foundation; EF-P0 through EF-P8 remain deferred until cross-system reconciliation.
- Capability 03 — Memory Fabric: **Architecture frozen for campaign / implementation deferred**
  - final target: **Seven Memory Fabric 3.0 — Origin-Bound Temporal Experience Ledger**
  - polish: `docs/project-memory/ultimate-polish/03_MEMORY_FABRIC_ULTIMATE_POLISH.md`
  - freeze: `docs/project-memory/ultimate-polish/03_MEMORY_FABRIC_FREEZE_RECORD.md`
  - key reconciliations: flat memory taxonomy removed; working memory belongs to Context Workspace; events/time/causality are separated from durable memory roles; verified Experience/Lesson/Procedure learning is explicit; purge semantics remove reconstructable derived copies; semantic/vector intelligence is optional and lazy.
  - implementation remains partial/foundation; MF-P0 through MF-P10 remain deferred until cross-system reconciliation.
- Capability 04 — Context Fabric / Context Workspace: **Architecture frozen for campaign / implementation deferred**
  - final target: **Seven Context Fabric 3.0 — Governed Elastic Context Workspace**
  - polish: `docs/project-memory/ultimate-polish/04_CONTEXT_FABRIC_ULTIMATE_POLISH.md`
  - freeze: `docs/project-memory/ultimate-polish/04_CONTEXT_FABRIC_FREEZE_RECORD.md`
  - key reconciliations: context is a derived reconstructable execution view; privileged instructions are separated from contextual data; fixed shares become elastic phase/model/tier budgets; ordering is semantic; compression/folding remain source-bound and expandable; models may propose context actions but the deterministic Context Governor validates them; Lite does not require embeddings or learned compression.
  - implementation remains partial/foundation; CF-P0 through CF-P10 remain deferred until cross-system reconciliation.
- Capability 05 — Model Fabric: **Architecture frozen for campaign / implementation deferred**
  - final target: **Seven Model Fabric 3.0 — Evidence-Governed Adaptive Inference Mesh**
  - polish: `docs/project-memory/ultimate-polish/05_MODEL_FABRIC_ULTIMATE_POLISH.md`
  - freeze: `docs/project-memory/ultimate-polish/05_MODEL_FABRIC_FREEZE_RECORD.md`
  - key reconciliations: model family/revision/deployment are separated; hard eligibility precedes learned routing; strict-free eligibility requires fresh evidence; a deterministic champion remains the routing baseline; model routing is separated from endpoint routing; route leases preserve cache/context continuity; static quality scores are priors only; local inference is governed by device evidence and Resource Governor.
  - implementation remains partial/foundation; MDL-P0 through MDL-P11 remain deferred until cross-system reconciliation.
- Capability 06 — Adaptive Compute: **Architecture frozen for campaign / implementation deferred**
  - final target: **Seven Adaptive Compute 3.0 — Closed-Loop Marginal-Utility Compute Governor**
  - polish: `docs/project-memory/ultimate-polish/06_ADAPTIVE_COMPUTE_ULTIMATE_POLISH.md`
  - freeze: `docs/project-memory/ultimate-polish/06_ADAPTIVE_COMPUTE_FREEZE_RECORD.md`
  - key reconciliations: canonical compute is a multi-dimensional BudgetVector rather than one scalar tier; risk is separated from reasoning difficulty; verification/recovery reserves are protected; allocation adapts at meaningful checkpoints; marginal verified utility and no-progress signals control escalation/early exit; child agents use hierarchical ComputeLeases; expensive arenas and multi-candidate paths are selective; a deterministic allocator remains the baseline for any future learned policy.
  - implementation remains partial/foundation; AC-P0 through AC-P10 remain deferred until cross-system reconciliation.
- Capability 07 — Tool Runtime / Tool Fabric: **Architecture frozen for campaign / implementation deferred**
  - final target: **Seven Tool Fabric 3.0 — Governed Capability Execution Mesh**
  - polish: `docs/project-memory/ultimate-polish/07_TOOL_RUNTIME_TOOL_FABRIC_ULTIMATE_POLISH.md`
  - freeze: `docs/project-memory/ultimate-polish/07_TOOL_RUNTIME_TOOL_FABRIC_FREEZE_RECORD.md`
  - key reconciliations: canonical capabilities are separated from concrete bindings/revisions; runs bind to catalogue snapshots and schema fingerprints; large catalogues use hierarchical retrieval plus progressive schema disclosure; hard eligibility precedes model/learned selection; deterministic retrieval remains the baseline; both inputs and outputs are contract-validated; dispatch certainty controls retries; tool outputs remain data rather than instruction authority; large results become artifacts/context capsules; MCP remains an interoperability adapter, not Seven's authority model.
  - implementation remains partial/foundation; TR-P0 through TR-P11 remain deferred until cross-system reconciliation. Individual Tool Fabric 2.0 families remain governed by their separate Deep Polish queue and are not silently marked complete by this core freeze.
- Capability 08 — Tool Security Kernel: **Architecture frozen for campaign / implementation deferred**
  - final target: **Seven Authority Kernel 3.0 — Intent-Bound Least-Privilege Execution Firewall**
  - polish: `docs/project-memory/ultimate-polish/08_TOOL_SECURITY_KERNEL_ULTIMATE_POLISH.md`
  - freeze: `docs/project-memory/ultimate-polish/08_TOOL_SECURITY_KERNEL_FREEZE_RECORD.md`
  - key reconciliations: capability, binding and authority are separate; effective authority is an intersection of principal/task/project/resource/destination policy; explicit deny dominates; grants project into short-lived narrowed leases; approvals bind to exact action fingerprints or finite plan envelopes; read authority is distinct from release authority; origin survives derived transformations; child agents receive explicit subleases; revocation epochs invalidate cached authority; routine authorization is deterministic and does not require an LLM.
  - implementation remains partial/foundation; TSK-P0 through TSK-P9 remain deferred until cross-system reconciliation.
- Capability 09 — Side-Effect Ledger: **Architecture frozen for campaign / implementation deferred**
  - final target: **Seven Effect Ledger 3.0 — Evidence-Bound Real-World Change Journal**
  - polish: `docs/project-memory/ultimate-polish/09_SIDE_EFFECT_LEDGER_ULTIMATE_POLISH.md`
  - freeze: `docs/project-memory/ultimate-polish/09_SIDE_EFFECT_LEDGER_FREEZE_RECORD.md`
  - key reconciliations: logical effect identity is separate from attempts; lifecycle, dispatch certainty, effect certainty and compensation are orthogonal; transport outcome is not effect truth; uncertain post-dispatch actions are not blindly retried; no generic exactly-once claim is made across uncontrolled boundaries; compensation is a separate linked effect; partial effects remain partial; unresolved effects recover after reload/crash.
  - implementation remains partial/foundation; SEL-P0 through SEL-P9 remain deferred until cross-system reconciliation.
- Capability 10 — File & Project Tools: **Architecture frozen for campaign / implementation deferred**
  - final target: **Seven Project File Fabric 3.0 — Transactional Scoped Workspace Engine**
  - polish: `docs/project-memory/ultimate-polish/10_FILE_PROJECT_TOOLS_ULTIMATE_POLISH.md`
  - freeze: `docs/project-memory/ultimate-polish/10_FILE_PROJECT_TOOLS_FREEZE_RECORD.md`
  - key reconciliations: project/file access begins from explicit ProjectGrants; FileRef/version tokens replace raw-path trust; stale bases conflict instead of silently overwriting; multi-file edits use staged transactions; patch-first editing is preferred; project maps are derived and revalidated; large/binary/archive work is bounded and lazy; Android direction uses app-private storage plus SAF rather than broad storage authority.
  - implementation remains partial/foundation; FPT-P0 through FPT-P10 remain deferred until cross-system reconciliation.
- Capability 11 — Coding Agent: **Architecture frozen for campaign / implementation deferred**
  - final target: **Seven Coding Agent 3.0 — Transactional Evidence-Gated Software Engineering Loop**
  - polish: `docs/project-memory/ultimate-polish/11_CODING_AGENT_ULTIMATE_POLISH.md`
  - freeze: `docs/project-memory/ultimate-polish/11_CODING_AGENT_FREEZE_RECORD.md`
  - key reconciliations: authoritative ChangeContract and RequirementLedger; baseline proof/reproduction where practical; progressive repository inspection; isolated candidate workspace; File Fabric-only mutation; evidence-backed command/test records; risk-adaptive verification ladder; review constraints beyond functional tests; bounded auto-repair; selective subagents/multi-candidate paths; separate evidence bundle and promotion boundary.
  - implementation remains partial/foundation; CA-P0 through CA-P11 remain deferred until cross-system reconciliation.
- Capability 12 — Verification / Judge Layer: **Architecture frozen for campaign / implementation deferred**
  - final target: **Seven Verification Fabric 3.0 — Evidence-Calibrated Independent Decision Kernel**
  - polish: `docs/project-memory/ultimate-polish/12_VERIFICATION_JUDGE_LAYER_ULTIMATE_POLISH.md`
  - freeze: `docs/project-memory/ultimate-polish/12_VERIFICATION_JUDGE_LAYER_FREEZE_RECORD.md`
  - key reconciliations: versioned VerificationContracts and subjects; requirement-to-check/evidence matrices; property-specific evidence classes; deterministic/authoritative checks dominate model judgment for the same property; producer self-report is not independent verification; judges are calibrated/versioned and may abstain; final verdict policy is deterministic; PASS/FAIL/INCONCLUSIVE/REPAIR_REQUIRED/BLOCKED are explicit; verification itself is evaluated.
  - implementation remains partial/foundation; VJ-P0 through VJ-P10 remain deferred until cross-system reconciliation.
- Capability 13 — Seven Evals: **Architecture frozen for campaign / implementation deferred**
  - final target: **Seven Evals 3.0 — Version-Locked Multi-Axis Measurement Observatory**
  - polish: `docs/project-memory/ultimate-polish/13_SEVEN_EVALS_ULTIMATE_POLISH.md`
  - freeze: `docs/project-memory/ultimate-polish/13_SEVEN_EVALS_FREEZE_RECORD.md`
  - key reconciliations: existing eval-lock/UNMEASURED discipline is preserved and extended to grader/runtime/environment identities; stochastic trials expose sample count/uncertainty; metrics remain multi-axis; critical regressions cannot be averaged away; public/shadow/holdout and contamination states are explicit; device and live-provider evidence are separately governed; Arabic remains a visible first-class stratum; suite saturation and evaluator validity are tracked.
  - implementation remains partial/foundation; EV-P0 through EV-P11 remain deferred until cross-system reconciliation.
- Capability 14 — Self-Evolution Engine: **Architecture frozen for campaign / implementation deferred**
  - final target: **Seven Evolution Engine 3.0 — Governed Hypothesis-to-Promotion Improvement Laboratory**
  - polish: `docs/project-memory/ultimate-polish/14_SELF_EVOLUTION_ENGINE_ULTIMATE_POLISH.md`
  - freeze: `docs/project-memory/ultimate-polish/14_SELF_EVOLUTION_ENGINE_FREEZE_RECORD.md`
  - key reconciliations: evolution is a bounded experiment laboratory; falsifiable hypotheses and immutable baselines are mandatory; control-plane-critical surfaces are separately governed; candidates preserve lineage and are compared through critical gates plus multi-objective/Pareto evidence instead of one weighted score; candidates cannot rewrite their active eval/promotion rules or self-promote; shadow/canary/promotion/rollback are explicit; evolution-engine changes are evaluated from a stable external control version.
  - implementation remains partial/foundation; SE-P0 through SE-P11 remain deferred until cross-system reconciliation.
- Capability 15 — Research System: **Architecture frozen for campaign / implementation deferred**
  - final target: **Seven Research Fabric 3.0 — Claim-Driven Evidence Acquisition and Synthesis Engine**
  - polish: `docs/project-memory/ultimate-polish/15_RESEARCH_SYSTEM_ULTIMATE_POLISH.md`
  - freeze: `docs/project-memory/ultimate-polish/15_RESEARCH_SYSTEM_FREEZE_RECORD.md`
  - key reconciliations: claim-driven gap-closing research is preserved; scalar A0–A5 source authority is removed from the final architecture in favor of Epistemic claim/domain/role-specific authority; discovery candidates are separated from SourceVersions/EvidenceUnits; evidence dependency and CoverageContract semantics are explicit; retrieval uses an adaptive portfolio with lexical/exact as a real baseline; freshness/conflicts are claim-scoped; synthesis follows ClaimEvidenceLock and citation verification; research depth is marginal-utility bounded and mobile-heavy work remains lazy.
  - implementation remains partial/foundation; RS-P0 through RS-P11 remain deferred until cross-system reconciliation.
- Next numbered core capability: Capability 16 — Search / Retrieval Tools.

## Implemented / Strongly Established
- Hardened Cognitive Runtime v4.2 direction
- Task contracts, truth fabric, context compiler, resource governance and side-effect ledger foundations
- Browser control / bridge / execution bridge
- Memory and persistence hardening foundations
- Research runtime
- Canon simulator and world runtime
- Coding runtime foundations and verification controls
- Beta UI runtime
- Adaptive Day/Night theme
- Aurora semantic state layer
- Lazy workspace hub
- Coding Agent workspace
- RPG / Real Works workspace
- Mobile / RTL / reduced-motion test coverage
- Verified release artifact pipeline
- Real release screenshot capture pipeline
- GitHub project-memory system

## Beta UI State
Beta UI is functional but not final product UI.

Current visual direction is being aligned with the adopted curved/ribbon Seven identity:
- primary brand family: Seven Blue / Cyan
- Day: clean bright surfaces
- Night: midnight/navy surfaces
- curves and ribbon continuity
- restrained shadows and highlights
- semantic workspace/state colors remain functional, not decorative

Latest identity-alignment work started on the Beta branch. Do not call Beta UI final until the remaining polish and gates pass.

## Remaining Beta UI Work
1. Verify current identity-alignment CI
2. Finish Chat/Home/Topbar/Sidebar/Composer/Settings polish
3. Bring Coding Agent workspace into the same visual language
4. Bring RPG / Real Works workspace into the same visual language
5. Refine Aurora / motion / status presentation
6. Run mobile, RTL, Day/Night, Reduced Motion, Lite, contrast, overflow, source-integrity and release gates
7. Capture new real screenshots from the verified artifact
8. Beta UI Freeze

## Final UI
Not started as a dedicated final redesign. The Final UI phase comes after Beta/identity/system stabilization and may redesign surfaces more substantially.

## Release Safety
Before declaring a major milestone PASS:
- verify CI success
- verify source integrity
- verify no accidental file deletions
- verify protected source remains unchanged unless explicitly approved
- verify release artifact boots
- verify mobile/RTL/theme/reduced-motion gates
- do not merge protected PRs automatically

## Current Development Philosophy
Use large coherent patches, minimal repetitive checks, then one strong final verification pass. Preserve mature systems and avoid scope drift.
