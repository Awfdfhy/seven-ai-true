# Seven Home UI — Product Ground Truth

Status: DESIGN SOURCE / PRE-FINAL HOME UI
Branch: `ultimate-polish-v1`
Purpose: authoritative product map for designing Seven Home and the rest of the UI. This document is not an implementation-completion claim and does not advance any Ultimate Polish counter.

## Design rule
During UI design, do not use Waves/PASS/Mega-Waves as the creative workflow. Design screen-by-screen, visually and collaboratively. Use this document as product ground truth, then freeze a screen only after visual review.

## 1. What Seven is
Seven is not a chatbot with a pile of tools. The product target is an Android-first Cognitive Runtime: one coherent intelligence with multiple execution systems, memory, context, tools, models, research, coding, worlds/simulation and verification.

The user-facing experience should feel like one intelligence system, not a collection of disconnected feature apps.

Core cognitive path:
`Intent -> Task Contract -> Cognitive Control -> Evidence / Memory / Context -> Planner -> Models + Tools -> Execution -> Verification -> Commit -> Evaluation -> Learning`

This matters to Home: the UI should expose user intent and useful work surfaces while keeping most orchestration invisible.

## 2. Capability families relevant to UI
Seven's detailed registry contains many capability planes. For product design, group them into these families:

- Core Intelligence: cognitive controller, intent routing, planning, scheduling, dynamic execution, stop/continue/retry.
- Truth: FACT / CLAIM / INFERENCE / ASSUMPTION / UNKNOWN / CONFLICT, provenance, freshness, contradiction detection.
- Memory: long-term memory, event ledger, entity/semantic views, temporal/causal/lexical/vector retrieval.
- Context: pin, expand, compress, evict, reconstruct, token budgets, evidence-aware context.
- Models: provider abstraction, model routing, capabilities, reasoning profiles, fallback, free-proof, health/quota.
- Adaptive Compute: fast/deep selection, dynamic reasoning/retrieval/verification, local/remote routing.
- Tools: registry, discovery, schemas, execution, permissions, health, retries and cancellation.
- Tool Security: read/write/execute/network/upload/delete permissions, scoped grants and confirmation.
- Side Effects: real-world action tracking, retry safety, idempotency and uncertain completion.
- Files: read/search/edit/patch/copy/rename/project maps/checkpoints/integrity.
- Coding: full coding agent, project understanding, edit/test/fix loop, diffs and terminal bubbles.
- Verification: judge, evidence checking, PASS/FAIL/BLOCKED/INCONCLUSIVE and repair.
- Seven Evals: quality, latency, hallucination, coding, memory, routing, recovery and canon fidelity.
- Research: deep search, evidence, source ranking, contradiction, freshness and citations.
- Knowledge: PDF/TXT/project documents, knowledge bases and selective retrieval.
- Vision: images, screenshots, UI, diagrams, OCR and visual debugging.
- RPG: world/character/relationship/knowledge states, inventory, timeline and consequences.
- Real Works: canon simulator, source-bound canon, player insertion, divergence/what-if.
- Story Fabric: episodes/chapters/scenes/arcs/threads/reveals/pacing/dialogue/story verification.
- Titles: episode/chapter/arc/season/side-story/special/quest/game/location/power naming.
- Projects: files + memory + goals + instructions + runs + tools + checkpoints.
- Self-Evolution: discover -> propose -> experiment -> evaluate -> promote/reject.
- Repair: detect -> reproduce -> diagnose -> patch -> test -> verify -> learn.
- Persistence: rooms/chats/projects/settings/run recovery/schema migrations.
- Recovery: checkpoints, rollback, corruption recovery and migration recovery.
- Observability: models/tools/timing/errors/retries/context/performance/runtime state.
- Resource Governor: RAM/CPU/battery/thermal/network/context/concurrency management.
- Generated UI: cards, diffs, timelines, tables, charts, file trees and tool/result UI.
- Android Layer: SAF file access, Keystore secrets, APK shell and native bridge.
- Protocol Layer: MCP, A2A, AG-UI and generative-UI adapters.
- Local Intelligence: embeddings, reranking, classification and lightweight local fallback.

## 3. Layers, not a feature grid
A visible task may invoke many invisible fabrics. Example:
`Research -> Evidence -> Memory -> Project Context -> Coding -> Files -> Tools -> Verification -> Repair`

The user should not be forced to navigate those systems manually. Home must avoid representing every internal capability as an equal tile or button.

## 4. Chat and universal entry
Chat/Rooms is a mature central surface and a universal conversational entry, but it is not all of Seven.

The universal composer should be capable, conceptually, of starting:
- Ask
- Search
- Research
- Code
- Create
- World
- Files
- Project tasks
- Tool tasks

This does not imply placing all of those as permanent buttons in the composer. Progressive disclosure and intent routing should keep the surface calm.

## 5. Coding workspace
Coding is a real agent workspace, not a terminal skin or a colored Chat mode.

Runtime shape:
`Understand -> Inspect -> Plan -> Read -> Modify -> Test -> Inspect Diff -> Fix -> Verify -> Report`

Relevant UI surfaces include project map/file tree, editor/diff, terminal/event bubbles, tests, checkpoints, verification, auto-repair, collapse/expand and copy.

## 6. Research workspace
Research is an evidence workspace, not merely web search.

It may expose answer, sources, evidence, source quality/freshness, conflicts, uncertainty, timeline/progress, comparisons and evidence packs. The UI must support query decomposition, ranking/deduplication, contradiction handling and citations without overwhelming normal users.

## 7. Memory and Context are different
Memory is durable knowledge/history with lineage, lifecycle and conflicts.

Context is the reconstructable working set selected for the current task. Context actions include Pin / Compress / Expand / Evict / Reconstruct and explicit budgets.

Do not collapse Memory and Context into one concept merely to simplify navigation. They may share entry points while preserving semantic separation.

## 8. Model & Compute
Model Fabric is deeper than a model picker. It considers provider availability/revision/endpoint, capabilities, context/output limits, reasoning, vision, tools, health, quota, streaming, cancellation, latency, access class and fallback.

Normal UI should prefer understandable compute intent such as Auto / Fast / Balanced / Deep. Expert controls may reveal exact model/provider details. Do not fabricate a live champion model when qualification evidence is absent.

## 9. Projects
A Project is not merely a folder. It can coordinate identity, manifest, events, resources, work items, policies, snapshots and variants with durable local persistence.

Project types may include coding, research, story, RPG world, study/personal work and Seven development itself. Projects therefore deserve a central role in information architecture.

## 10. RPG
RPG is a character-centered causal living-world system. Relevant state includes world, characters, relationships, knowledge, rules/powers, inventory, locations, events, timeline, consequences and branches.

Possible RPG surfaces include Story, Character, World, Journal, Inventory, Relationships, Timeline and Map/Media.

Generated prose or pixels are representation, not authoritative world truth.

## 11. Real Works
Real Works inserts/operates within existing works while preserving source-bound canon as far as evidence permits.

Relevant concepts include Canon Graph, source hierarchy, event/episode timeline, character knowledge, relationship graph, world rules, Scene Contracts, player insertion and explicit CANON / DIVERGENCE / WHAT-IF / CANON_GAP states.

Advanced canon information should be available without flooding the normal play surface.

## 12. Story Fabric
Story Fabric is separate from world/canon authority. It turns state into strong long-form narrative.

Hierarchy:
`Series/Work -> Season/Part -> Arc -> Chapter/Episode -> Sequence -> Scene -> Beat`

It may track setups/payoffs, mysteries, reveals, character arcs, pacing, reader knowledge, dialogue/voice and story verification. Story controls must not silently mutate authoritative world/canon state.

## 13. Self-Evolution
Self-Evolution is a governed engineering system, not a magic Improve button.

Primary lanes include runtime adaptation, engineering evolution, meta-evolution and a separately governed future model/training class.

Typical lifecycle includes opportunities, candidates, experiments, evals, independent judgment, promotion/rejection and rollback. Production Seven does not silently rewrite its installed APK.

An Evolution Lab UI may therefore expose Discover / Experiments / Evals / Generations and evidence-backed progress.

## 14. Repair
Repair is evidence-governed debugging:
`Capture -> Reproduce -> Minimize -> Diagnose -> Competing Hypotheses -> Repair Candidates -> Patch -> Tests -> Regression -> Verify -> Verdict`

UI states may include Detected / Reproducing / Diagnosing / Root Cause / Patching / Testing / Fixed / Mitigated / Inconclusive. Do not use fake progress to imply certainty.

## 15. Tools
Tool UI is a Capability Center, activity surface, permissions manager and connections surface, not just a catalog of tool buttons.

Tool activity can also appear contextually inside Chat, Coding and Research through typed cards/events.

## 16. Runtime state language
Seven needs more than Idle/Thinking. Visible states may include Idle, Thinking, Research, Coding, RPG, Success, Warning and Error.

Truth/execution layers may also expose PASS, FAIL, BLOCKED, INCONCLUSIVE, UNKNOWN, CONFLICT and CANCELLED_UNCERTAIN when relevant.

Examples of useful user-facing state:
- Researching…
- Waiting for permission
- Task blocked
- Action may have completed; verifying…

Different states need meaningful presentation rather than one universal spinner.

## 17. Design Genome
Five core visual primitives should be available across the UI:

1. Orbit Thread — continuity, progress and intelligence flow.
2. Seven Cut — distinctive geometric cut/detail.
3. Evidence Rail — sources, verification and evidence/timeline structure.
4. Focus Halo — current focus/attention.
5. State Node — runtime/process state.

State Node must not communicate status through color alone.

## 18. Aurora
Aurora is a runtime representation layer, not evidence or truth. It may respond to Thinking, Research, Coding, RPG, Success, Warning and Error.

Use it sparingly. Seven should not become a permanently animated RGB interface.

## 19. Android-first resource law
Seven is Android-first. RAM, CPU, battery, thermal state, storage, APK weight, network and startup cost are first-class constraints.

Design implications:
- no always-running decorative video backgrounds;
- avoid stacks of expensive blur/glow;
- no decorative WebGL requirement;
- no unnecessary continuous animation loops;
- heavy surfaces/features load lazily/on demand;
- premium feeling should come primarily from geometry, spacing, typography, color/light hierarchy and short purposeful motion.

At the time this ground truth was captured, the startup-byte budget was already extremely tight. Do not treat that numeric snapshot as permanent design truth; re-measure before implementation decisions.

## 20. Performance tiers
Seven targets Full / Balanced / Lite presentation tiers.

Lite may reduce blur, glow, animation and render complexity while preserving functionality and the same visual identity. Lite must not become a visually broken or second-class product.

## 21. Arabic, RTL and accessibility
Design every reusable component for LTR and true RTL from the beginning, including mixed Arabic/English/code and bidi-safe presentation.

Also account for high contrast, larger text/font scale, reduced motion, screen readers and non-color-only state communication.

## 22. Product surface map
Current design surface map:

`Home · Chat · Coding · Research · RPG · Real Works · Story/World views · Memory · Context · Projects · Files/Knowledge · Tools/Connections · Model & Compute · Evolution Lab · Repair Lab · Settings · Onboarding · System States · Permissions · Generated UI · Profile/Personalization`

This map describes product surfaces, not necessarily permanent top-level navigation destinations. Home must not expose every surface at equal hierarchy.

## 23. Implementation truth boundary
When designing, distinguish three states:
1. product/architecture target;
2. verified foundation/runtime contract;
3. fully integrated/device-proven feature.

Current broad snapshot at capture time:
- Chat / Rooms: strong and connected.
- Persistence: strong IndexedDB foundation.
- Cognitive / Truth: verified foundation.
- Memory / Context: foundation present; further persistence/index integration remains.
- Model Fabric: runtime foundation; no fabricated live champion.
- Tools / Security / Effects: strong foundation.
- Verification / Evals: strong foundation.
- Coding: strong foundation; integration/device work remains.
- Research: foundation; broader live acquisition remains.
- Vision: foundation; live OCR/VLM integration remains incomplete.
- RPG / Story: architecture/runtime foundations; persistence/UI scale not final.
- Real Works / Titles: foundation; live canon acquisition/corpus work remains.
- Self-Evolution: architecture plus some eval/promotion infrastructure; not autonomous magic.
- Repair: architecture/foundation; not every scenario is production-ready.
- Global UI: substantial foundation; not final UI.
- Android: APK + SAF/Keystore + emulator evidence exists.
- Physical-device certification: not closed.
- Final UI / Brand freeze: not formally closed at capture time.

Do not turn a planned or foundation capability into a false production claim in UI copy.

## 24. Working visual identity
Repository truth and current design-session truth are distinct.

The formal repository logo tournament/brand freeze was not closed at capture time. For the current collaborative UI design, use the user's latest Seven mark as the working identity: a distinctive flowing `7` with cyan -> electric blue -> violet treatment, supported by night/day variants.

Do not claim formal brand freeze until the design is explicitly accepted and the repository process is reconciled.

## Home UI north star
Seven Home must make the entire system approachable without becoming a dashboard with dozens of equal buttons.

Home should communicate:
- one intelligence;
- immediate universal action;
- continuity of ongoing work;
- contextual access to Projects/workspaces;
- clear runtime/task state when useful;
- progressive disclosure of advanced systems;
- Seven's distinctive visual identity;
- Android-first speed and resource restraint.

The Home screen is to be designed collaboratively and iterated visually (`V1 -> critique -> refinement -> final`). This document constrains product truth, not the final composition. The final Home layout is intentionally not frozen here.
