# Seven AI — Ultimate Polish Plan

> **Purpose:** This document captures the full feature/tool map that will be used as the checklist for systematically polishing Seven. It is not a claim that every item is fully implemented. It is the authoritative refinement map for future work.

## Refinement Philosophy
Seven should be improved by strengthening existing systems, not by accumulating random features. Each major system should be inspected, scored, hardened, simplified where necessary, evaluated, and only then frozen.

The guiding question for every subsystem is:

> What is the strongest practical version we can build without making Seven heavy, fragile, fake, or needlessly complex?

## The 12 Boss Systems
These are the top-level polish targets:

1. Brain / Cognitive Runtime
2. Models / Routing / Adaptive Compute
3. Memory
4. Context
5. Tools / Permissions / Side Effects
6. Coding Agent
7. Research
8. RPG / Real Works
9. Verification / Evals / Self-Evolution
10. UX / Brand / Motion / Accessibility
11. Performance / Local Intelligence / Android Constraints
12. Recovery / Integrity / Security / Observability

Each Boss System should eventually receive:
- current-state audit
- score out of 100
- missing capabilities
- architectural weaknesses
- performance risks
- safety/integrity risks
- best-in-class target design
- implementation plan
- eval plan
- freeze criteria

---

# Complete Seven Feature / Tool Map

## 1. Seven Cognitive Runtime
- Cognitive Control Plane 2.0
- Task Contract
- Dynamic Execution Graph
- Durable Run Kernel
- explicit task/run states
- planning / executing / waiting / verifying / repairing / completed / failed / cancelled
- Stop / Continue / Retry
- recovery-aware execution
- selective reasoning instead of always-on heavy compute

Canonical pipeline:

`Intent → Task Contract → Cognitive Control Plane → Evidence / Memory / Context → Planner → Models + Tools → Execution Ledger → Verification → Canonical Commit → Evaluation → Learning`

## 2. Truth / Epistemic Fabric
Information states:
- FACT
- CLAIM
- INFERENCE
- ASSUMPTION
- UNKNOWN
- CONFLICT

Supporting metadata:
- source
- confidence
- freshness
- timestamps
- verification state
- contradictions
- provenance / lineage

Core laws:
- model output is not truth merely because a model produced it
- tool success is not accepted until the effect is verified
- claimed system improvement is not accepted until Seven Evals proves it

## 3. Memory Fabric
- authoritative append-only memory event ledger
- Event View
- Entity View
- Semantic View
- temporal index
- causal index
- lexical index
- vector index
- hierarchical retrieval
- memory consolidation
- Chain-of-Memory retrieval strategy
- session memory
- project memory
- long-session continuity
- summaries remain derived objects, not authoritative truth
- authority never increases through summarization, consolidation, tool echo, or corroboration alone

## 4. Context Fabric / Context Workspace
- Context Compiler
- selective context assembly
- pin
- compress
- expand
- evict
- reconstruct
- prioritize
- category token budgets
- conversation context
- memory context
- project-file context
- tool-result context
- instruction context
- evidence context
- code context
- canon context

## 5. Model Fabric
- provider abstraction
- model abstraction
- capability profiles
- free-proof / free-eligibility classes
- context limits
- latency awareness
- reasoning capability
- vision capability
- coding capability
- tool capability
- replaceable providers
- model routing based on task type

Possible routing classes:
- simple / fast
- deep reasoning
- coding
- research
- RPG / prose
- vision

## 6. Adaptive Compute
- reasoning effort selection
- model-size selection
- context-depth selection
- retrieval-depth selection
- verification-depth selection
- tool-count selection
- pass-count selection
- easy tasks use cheap paths
- difficult tasks use deeper paths
- critical tasks use stronger verification

## 7. Tool Runtime / Tool Fabric
- tool registry
- capability normalization
- duplicate/alias merging
- capability graph
- progressive plan-aware tool discovery
- dependency-aware retrieval
- schema validation
- argument validation
- result validation
- tool pinning
- tool hashes/versioning
- timeout handling
- retries
- cancellation
- idempotency
- permission checks

### Tool Security Kernel
- permission-aware execution
- protected dangerous operations
- explicit side-effect handling

### Side-Effect Ledger
Record:
- attempted action
- tool used
- target
- timestamp
- reported result
- verified result
- uncertainty state
- rollback/recovery relevance

### Side-Effect Uncertainty
If a tool action may have happened but confirmation is lost, Seven should use an explicit unknown/uncertain side-effect state and verify instead of blindly retrying.

## 8. File / Project Tools
Target capability set:
- list files
- read file
- read range
- search files
- search text
- inspect project
- create file
- edit file
- patch file
- copy file
- rename file
- delete file
- directory operations
- file metadata
- compare versions
- restore/checkpoint

Delete and rename remain protected operations.

## 9. Coding Agent
### Project Context
- directory tree
- source files
- configs
- package metadata
- documentation
- AGENTS / AG files
- dependency context
- runtime structure

### Project Map
- selective project understanding
- avoid rereading the entire repository blindly

### Agent Loop
`Inspect → Plan → Edit → Test → Inspect Result → Fix → Verify`

### Auto Repair Loop
`Inspect → Edit → Test → Error → Fix → Test`

### Coding Capabilities
- inspect code
- search code
- targeted edits
- patch transactions
- selective testing
- diagnostics
- error parsing
- retry
- checkpointing
- rollback concepts
- verification before canonical commit

### Coding UX
- Terminal/tool output as conversation bubbles
- copy per bubble
- collapse / expand
- long-output handling
- execution timeline
- Stop / Continue / Retry
- tool activity display

## 10. Verification / Judge System
Verify:
- goal completion
- contract compliance
- scope adherence
- code correctness
- tests
- source support
- unintended file changes
- real tool effects

Possible outcomes:
- PASS
- FAIL
- REPAIR

## 11. Seven Evals
Compare old vs new systems on:
- accuracy
- latency
- token use
- tool success
- hallucination rate
- coding success
- canon fidelity
- recovery
- memory retrieval
- UX regressions
- performance regressions

No major self-improvement should bypass the eval gate.

## 12. Self-Evolution Engine
Target lifecycle:
`Observe → Propose → Sandbox → Evaluate → Compare → Accept / Reject`

Potential optimization targets:
- prompts
- routing
- tool selection
- context budgets
- memory retrieval
- retry policies
- model choice
- heuristics

## 13. Research System
Target pipeline:
`Query Decomposition → Search → Retrieve → Rank → Cross-check → Synthesize → Cite`

Capabilities:
- multi-query research
- source quality assessment
- freshness awareness
- duplicate removal
- contradiction detection
- citations
- FACT / CLAIM separation
- uncertainty
- evidence lineage

## 14. Search / Retrieval Tools
- web search
- page retrieval
- document retrieval
- project search
- memory search
- semantic search
- lexical search
- canon search
- reranking

## 15. Knowledge / Files
- TXT knowledge
- PDF knowledge
- project documents
- room knowledge
- reference material
- selective retrieval rather than repeatedly stuffing entire files into context

## 16. Vision
Potential capabilities:
- image understanding
- screenshot inspection
- UI inspection
- document inspection
- diagram understanding
- visual debugging
- route to vision-capable models only when needed

## 17. RPG Engine
Simulation state targets:
- World State
- Character State
- Relationship State
- Knowledge State
- Rules
- Powers
- Inventory
- Locations
- Events
- Consequences
- Continuity
- Timeline

Model prose proposes changes; verified controller logic commits authoritative world-state changes.

## 18. Real Works / Canon Simulation Engine
- Canon Graph
- source hierarchy/provenance
- Timeline / Episode / Event Graph
- character identity
- relationships
- knowledge-state tracking
- world-state tracking
- rules / powers / invariants
- spoiler boundaries
- player insertion engine
- preserve canon unless divergence is explicit
- CANON vs DIVERGENCE / WHAT-IF
- Scene Contracts
- source refs
- anchors
- required facts
- forbidden changes
- model proposes world diff; validator commits
- conflict / retcon handling
- source uncertainty
- CANON_GAP when coverage is insufficient

## 19. Titles / World Linguistic Engine
Naming support for:
- episodes
- chapters
- arcs
- seasons
- side stories
- specials
- OVAs
- fillers
- What If
- DLC-style content
- games
- events
- quests
- achievements
- locations
- organizations
- powers
- artifacts

Titles should follow the linguistic/style DNA of the target fictional world instead of generic naming.

## 20. Projects System
A project may contain:
- files
- memory
- context
- goals
- instructions
- agent state
- run history
- tools
- checkpoints

## 21. Sessions / Persistence
Persist:
- rooms
- titles
- messages
- settings
- selected model
- project state
- memory
- run state

Long-term target is verified persistence/recovery beyond fragile single-storage assumptions.

## 22. Recovery / Integrity
- source integrity
- state recovery
- corrupted-state handling
- checkpoints
- execution records
- rollback concepts
- artifact verification

## 23. Observability
Track:
- model selected
- tools used
- timings
- errors
- retries
- context size
- token estimates
- verification result
- run state
- performance tier

## 24. Resource Governor
Optimize / govern:
- RAM
- CPU pressure
- battery impact
- context size
- model calls
- concurrency
- UI effects
- background work

## 25. Performance Tiers
Example target tiers:
- Full
- Balanced
- Lite

Lite principles:
- no expensive blur where avoidable
- no unnecessary glow
- fewer animations
- lazy heavy features
- simpler rendering

## 26. UX Runtime
- component state
- semantic UI state
- workspace UI
- typed/generated UI where appropriate
- responsive behavior
- accessibility behavior

## 27. Day / Night Identity System
### Day
- clean bright surfaces
- Seven Blue/Cyan identity
- restrained cool shadows
- light depth

### Night
- midnight/navy surfaces
- blue/cyan lighting
- low glare
- controlled highlights

Both modes must preserve the same Seven visual DNA.

## 28. Seven Brand System
Adopted direction:
- curved/ribbon `7`
- simple silhouette
- ribbon continuity
- Seven Blue / Cyan
- Day/Night compatibility
- monochrome compatibility
- suitable for app icon, clothing, hardware, and product surfaces
- avoid generic AI sparkle / brain / circuit / robot / infinity / crypto language

## 29. Aurora System
Semantic states:
- Idle
- Thinking
- Research
- Coding
- RPG
- Success
- Warning
- Error

Aurora may affect:
- accent
- subtle lighting
- status indicators
- workspace state
- motion intensity

Aurora never grants authority or proves success by itself.

## 30. Animation System
Animations should be:
- meaningful
- lightweight
- interruptible
- Reduced Motion compatible
- performance-tier aware
- not permanently looping without purpose

Possible surfaces:
- composer focus
- workspace opening
- status changes
- tool execution
- thinking pulse
- success confirmation
- ribbon-inspired transitions

## 31. Accessibility
- Reduced Motion
- contrast
- touch target sizing
- small-screen adaptability
- focus/keyboard behavior where relevant
- Arabic readability
- RTL

## 32. Arabic / RTL
- true RTL layout
- Arabic typography
- bidi-safe messages/code
- direction-aware layout/icons
- Arabic markdown
- mixed Arabic / English / code handling

## 33. Workspace Hub
Current workspace direction:
- Coding Workspace
- RPG / Real Works Workspace

Potential later workspaces:
- Research Workspace
- Files / Knowledge Workspace
- Projects Workspace
- Memory Inspector
- Model Lab

Heavy workspaces should stay lazy-loaded.

## 34. Generative / Typed UI
Potential structured response surfaces:
- status cards
- progress views
- code diffs
- research results
- tables
- timelines
- RPG state
- source cards
- file trees

Generated UI must be typed/controlled rather than arbitrary unsafe HTML from a model.

## 35. Provider Layer
Target provider flexibility:
- Groq
- OpenRouter
- direct providers
- future APIs
- local runtimes

Seven should not require a full rewrite to replace a provider.

## 36. Local Intelligence Plane
Potential local tasks:
- embeddings
- reranking
- classification
- intent detection
- memory selection
- lightweight fallback
- llama.cpp fallback

## 37. Streaming
- incremental model output
- status updates
- tool events
- integration with cancellation

## 38. Real Cancellation
Cancellation should stop, when supported:
- model generation
- streams
- relevant tools
- chained tasks

Use real cancellation mechanisms such as AbortController/provider cancellation instead of a cosmetic stop flag where possible.

## 39. Import / Export
Before final APK maturity, support safe portability of:
- chats
- rooms
- settings
- memory
- projects
- knowledge

## 40. Permission System
Potential permission classes:
- read
- write
- execute
- network
- delete
- rename
- external action

Permission memory must remain bound to authoritative permission events.

## 41. Lineage System
Derived objects should retain:
`Source → Transformation → Current Object`

Applies to:
- memories
- summaries
- research facts
- tool outputs
- canon state
- compiled context

## 42. Idempotency
Prevent retries from duplicating side effects, such as creating the same resource multiple times after a timeout.

## 43. Release Screenshot Verification
Verified release screenshot surfaces:
- Chat Night
- Chat Day
- Aurora Thinking
- Workspace Launcher
- Coding Agent
- RPG / Real Works

Screenshots used as proof must come from the actual verified release, not concept art.

## 44. Release / CI Gates
Before major PASS / freeze:
- tests
- source-integrity
- build
- browser boot
- mobile
- RTL
- Day
- Night
- Reduced Motion
- Lite/performance tier
- overflow
- contrast
- startup budget
- static budget
- lazy workspace loading
- screenshot capture
- release artifact verification

## 45. GitHub Project Memory
Project-memory system:
- `SEVEN_MASTER_PLAN.md`
- `SEVEN_DECISIONS.md`
- `SEVEN_STATUS.md`
- `SEVEN_ULTIMATE_POLISH_PLAN.md`

Major architectural, product, safety, roadmap, or brand decisions should be committed here so the project does not depend on conversation memory alone.

---

# Polish Order
Recommended sequence for deep refinement:

1. Brain / Cognitive Runtime
2. Models + Adaptive Compute
3. Memory
4. Context
5. Tool Fabric + permissions + side effects
6. Coding Agent
7. Research
8. RPG / Real Works
9. Verification + Evals + Self-Evolution
10. UX / Brand / Motion / Accessibility
11. Performance + Android + Local Intelligence
12. Recovery + Integrity + Security + Observability

The Beta UI work may continue independently, but these twelve systems form the main long-term refinement campaign.

## Freeze Rule
A subsystem is not considered polished merely because more features were added. It freezes only when its architecture, behavior, performance, failure modes, verification, and user experience have all passed their defined gates.
