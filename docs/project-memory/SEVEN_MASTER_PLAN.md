# Seven AI — Master Plan

> **Authority:** This document is the project-level source of truth for Seven's current product direction. When conversation memory conflicts with this file, prefer this file unless a newer explicit project decision has been committed to GitHub.

## Product Goal
Seven AI is an Android-first, user-owned AI platform designed to feel like one coherent intelligence system rather than a collection of disconnected features. The target is a lightweight, premium mobile experience with replaceable model/provider infrastructure, strong memory/context, tool execution, coding-agent workflows, research, RPG/Real Works simulation, verification, recovery, and explicit truth/authority boundaries.

## Non-Negotiable Constraints
- Preserve existing work. Avoid rewrites that erase mature systems.
- `seven_ai-final.html` is a protected source file and must not be casually modified or replaced.
- No file deletion without an explicit reason and review.
- No protected-branch merge without explicit approval.
- No PASS claim without verification.
- No model output becomes truth merely because a model produced it.
- No successful-looking action counts until its effect is verified.
- No intelligence/system improvement is accepted unless evaluation demonstrates the improvement.
- No arbitrary Seven-side usage caps; provider/API limits may still exist.
- Mobile-first: low RAM, battery, storage, APK weight and startup cost are first-class constraints.
- Heavy features should be lazy-loaded where practical.
- Reduced Motion, Lite/performance tiers, RTL, Arabic readability and phone layouts are product requirements.

## Core Architecture
Seven Cognitive Runtime v4.2 hardened direction:
1. Cognitive Control Plane + Task Contract + dynamic Execution Graph
2. Truth/Epistemic Fabric with FACT / CLAIM / INFERENCE / ASSUMPTION / UNKNOWN / CONFLICT
3. Durable Run Kernel with explicit state transitions
4. Resource Governor
5. Context Compiler / Context Workspace
6. Tool Security Kernel + Side-Effect Ledger
7. Seven Evals
8. Self-Evolution gated by evaluations
9. Coding Runtime with project graph, patch transactions, selective testing, repair loop and checkpoints
10. RPG / Real Works Simulation Engine with canon graph, insertion engine, validator and explicit divergence
11. UX Runtime + design system + typed/generated UI where appropriate
12. Recovery / Integrity / Observability

### Canonical Pipeline
User Intent → Task Contract → Cognitive Control Plane → Evidence / Memory / Context → Planner → Model + Tools → Execution Ledger → Verification → Canonical Commit → Evaluation → Learning

## Major Product Systems
### Chat / General Intelligence
- Provider/model abstraction
- Streaming and real cancellation
- Adaptive model/tool/reasoning routing
- Context compilation
- Verified persistence and recovery
- Research mode with citations and epistemic states

### Memory Fabric
- Authoritative append-only memory event ledger
- Entity/event/semantic derived views
- Temporal, causal, lexical and vector indexes
- Summaries are derived, not authoritative
- Authority cannot increase through summarization, consolidation or model/tool echo

### Coding Agent
- Project context/map
- Read/inspect/edit workflows with safety
- Stop / Continue / Retry
- Tool activity and execution timeline
- Auto Repair Loop: Inspect → Edit → Test → Error → Fix → Test
- Checkpoints and verification before commit
- Terminal/tool output as structured conversation bubbles
- File delete/rename must remain protected and explicit

### RPG / Real Works
Goal: the strongest possible canon-aware interactive story system while refusing false certainty.
- Canon graph and source hierarchy/provenance
- Timeline / episode / event graph
- Character identity, relationships, knowledge-state and world-state tracking
- Rules / powers / invariant tracking
- Player insertion engine that preserves canon unless divergence is explicit
- CANON vs DIVERGENCE / WHAT-IF distinction
- Scene contracts with source refs, anchors, required facts and forbidden changes
- Model prose proposes world changes; verified controller logic commits them
- CANON_GAP when source coverage is insufficient
- Titles / World Linguistic Engine for episodes, arcs, side stories, specials, what-if, fillers, games, etc.

## UI / Brand Direction
### Adopted Visual DNA for Beta
- Seven logo family: curved / ribbon-like `7`
- Identity should feel simple enough to work on an app icon, clothing, hardware and monochrome contexts
- Day and Night share the same shape DNA
- Day: clean, bright, restrained cool surfaces
- Night: midnight/navy surfaces with controlled blue light
- Seven Blue/Cyan is the core identity accent
- Avoid generic AI sparkle/brain/circuit/robot/infinity/crypto aesthetics
- Curves and ribbon motion are the defining shape language
- Effects are subtle: small depth, light and shadow, not decorative glow overload

### Beta UI Goal
Current Beta is a functional proving ground, not final product UI. Align it with the adopted ribbon identity without over-investing in final redesign work.
- Chat/Home/Topbar/Sidebar/Composer/Settings should share ribbon identity DNA
- Coding and RPG workspaces should feel like the same product
- Aurora communicates semantic state without becoming decorative noise
- Day/Night should feel materially different but unmistakably Seven
- Keep startup release layer under the established budget; move heavier visuals/features to lazy surfaces

### Final UI
A later dedicated redesign phase will produce the final application UI after logo/visual DNA and core systems are frozen. Beta polish must not be mistaken for Final UI Freeze.

## Current Branch Safety Model
- `main`: protected baseline
- `seven-v4.2-hardening`: hardened architecture branch
- `seven-beta-ui-v1`: active Beta UI branch built on hardening
- PR #15 and PR #16 remain unmerged unless explicitly approved

## Release / Verification Rules
Before Beta UI Freeze or any major merge:
- Source-integrity lock passes
- No protected source replacement
- No accidental file deletions
- Mobile 360–390px passes without overflow
- RTL passes
- Day / Night passes
- Reduced Motion passes
- Lite/performance tier passes
- Contrast gate passes
- Startup/static budgets pass
- Coding/RPG lazy loading passes
- Release artifact boots
- Actual screenshots come from the verified release, not mockups

## Immediate Roadmap
1. Complete Beta identity alignment to the adopted ribbon logo family
2. Polish Chat/Home/Sidebar/Topbar/Composer/Settings
3. Polish Coding Agent and RPG/Real Works workspaces
4. Unify Aurora + motion + status language
5. Run final Beta gates and capture real release screenshots
6. Freeze Beta UI
7. Later: design and implement the true Final UI

## Rule for Future Changes
Any major architectural, roadmap, safety, brand or product-direction change should update this project-memory directory in the same development cycle so GitHub remains the durable project memory.