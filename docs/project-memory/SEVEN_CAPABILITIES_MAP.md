# Seven AI — Capabilities & Tools Map

> **Purpose:** Canonical inventory of Seven's planned and implemented systems, capabilities, runtime layers, tools, product surfaces, safety boundaries, and verification infrastructure. Use this together with `SEVEN_MASTER_PLAN.md` and `SEVEN_ULTIMATE_POLISH_PLAN.md` during future architecture polishing.

## 1. Cognitive Runtime
- Cognitive Control Plane 2.0
- Task Contract
- Dynamic Execution Graph
- Durable Run Kernel / explicit state machine
- Stop / Continue / Retry
- Recovery-aware execution
- Planner + tool/model orchestration

## 2. Truth / Epistemic Fabric
- FACT / CLAIM / INFERENCE / ASSUMPTION / UNKNOWN / CONFLICT states
- Evidence provenance
- Freshness / recency awareness
- Contradiction tracking
- Confidence that does not exceed source authority
- Model output is not truth by default
- Tool output is not treated as success until verified
- Derived data cannot gain authority through repetition or summarization

## 3. Memory Fabric
- Append-only authoritative memory event ledger
- Event / Entity / Semantic derived views
- Temporal / Causal / Lexical / Vector indexes
- Hierarchical retrieval
- Chain-of-Memory style retrieval strategies
- Summaries remain derived, not authoritative
- Room / session / project memory
- Long-session continuity
- Memory lineage and reconstruction

## 4. Context Fabric / Context Workspace
- Context Compiler
- Pin / Compress / Expand / Evict / Reconstruct
- Category-specific token budgets
- Selective inclusion of messages, memories, files, evidence, code and canon
- Context priority and relevance scoring
- Reconstructable derived context instead of destructive compression

## 5. Model Fabric
- Provider abstraction
- Model abstraction
- Capability profiles
- Reasoning profiles
- Coding / Vision / Tool-use capability awareness
- Context-window awareness
- Free-model proof classes / eligibility
- Provider/model switching without rewriting product logic
- Model routing by task

## 6. Adaptive Compute
- Dynamic reasoning depth
- Dynamic model strength
- Dynamic retrieval depth
- Dynamic verification depth
- Dynamic tool count
- Dynamic context breadth
- Lightweight path for simple tasks
- Deeper path for complex / critical tasks

## 7. Tool Runtime / Tool Fabric
- Tool registry
- Capability normalization
- Duplicate / alias merging
- Capability graph
- Progressive tool discovery
- Plan-aware dependency retrieval
- Schema validation
- Argument validation
- Result validation
- Tool pinning and hashes
- Timeouts
- Retries
- Cancellation
- Idempotency
- Permission checks
- Side-effect uncertainty handling

## 8. Tool Security Kernel
- Read / write / execute / network / delete / rename permission classes
- Authority binding to original permission events
- Protected side-effect operations
- Explicit verification after actions
- No permission escalation via model/tool echo

## 9. Side-Effect Ledger
Tracks:
- requested action
- tool used
- target resource
- timestamp / run
- returned result
- verified effect
- uncertainty state
- retry safety
- rollback/checkpoint relation where applicable

## 10. File & Project Tools
- List files
- Read file / range
- Search files
- Search text
- Inspect project structure
- Create file
- Edit file
- Patch file
- Copy file
- Rename file with safeguards
- Delete file with safeguards
- Directory operations
- File metadata
- Compare versions
- Checkpoint / restore concepts
- Project map / project graph

## 11. Coding Agent
- Project Context
- Project Map
- Read / inspect / edit workflows
- Patch transactions
- Selective testing
- Auto Repair Loop: Inspect -> Edit -> Test -> Error -> Fix -> Test
- Stop / Continue / Retry
- Tool activity timeline
- Terminal output as structured chat bubbles
- Collapse / expand long output
- Copy per output bubble
- Checkpoints
- Verification before canonical commit
- Protected delete / rename
- No fake shell or fake successful actions

## 12. Verification / Judge Layer
- Goal-completion checking
- Constraint checking
- Scope drift detection
- Code/test verification
- Research evidence verification
- Tool-effect verification
- Changed-file verification
- PASS / FAIL / REPAIR decisions

## 13. Seven Evals
- Old vs New comparisons
- Accuracy
- Latency
- Token / context cost
- Tool success
- Hallucination rate
- Coding success
- Canon fidelity
- Recovery reliability
- Memory retrieval quality
- UX regressions
- Performance regressions
- Self-evolution changes must pass eval gates

## 14. Self-Evolution Engine
- Observe
- Propose
- Sandbox
- Evaluate
- Compare
- Accept / Reject

Potential improvement targets:
- prompts
- routing
- model selection
- tool selection
- memory retrieval
- context budgets
- retry policies
- verification strategies
- system heuristics

## 15. Research System
- Query decomposition
- Search
- Retrieve
- Rank / rerank
- Deduplicate
- Cross-check
- Contradiction detection
- Source quality
- Freshness
- Evidence synthesis
- Citations
- Epistemic-state integration

## 16. Search / Retrieval Tools
- Web search
- Page retrieval
- Document retrieval
- Project search
- Memory search
- Semantic search
- Lexical search
- Canon search
- Source search
- Reranking

## 17. Knowledge / Files
- TXT ingestion
- PDF ingestion
- Project documents
- Room / project knowledge bases
- Selective retrieval into context
- Source-backed knowledge rather than unconditional full-file injection

## 18. Vision
- Image understanding
- Screenshot inspection
- UI inspection
- Document / diagram interpretation
- Visual debugging
- Vision-capable model routing only when needed

## 19. RPG Engine
- World State
- Character State
- Relationship State
- Knowledge State
- Rules / powers / invariants
- Inventory / locations / events
- Continuity
- Timeline
- Consequences
- Model proposes narrative/world changes
- Verified controller commits state

## 20. Real Works / Canon Simulation Engine
- Canon Graph
- Source hierarchy / provenance
- Timeline / episode / event graph
- Character identity and knowledge-state
- Relationship graph
- Rules / powers
- World state
- Safe player insertion engine
- Scene contracts
- Source refs
- Anchors
- Required facts
- Forbidden changes
- CANON vs DIVERGENCE / WHAT-IF
- CANON_GAP for insufficient source coverage
- Explicit divergence rather than fake canon preservation

## 21. Titles / World Linguistic Engine
Naming support for:
- Episodes
- Chapters
- Arcs
- Seasons
- Side Stories
- Specials
- OVAs
- Fillers
- What Ifs
- Games
- DLC-style content
- Events
- Quests
- Achievements
- Locations
- Organizations
- Powers
- Artifacts

Titles should inherit the linguistic DNA of each world rather than generic naming templates.

## 22. Projects System
- Persistent project scope
- Files
- Memory
- Context
- Goals
- Instructions
- Agent state
- Run history
- Tools
- Checkpoints

## 23. Sessions / Persistence
- Rooms
- Titles
- Messages
- Settings
- Selected model
- Project state
- Memory
- Run state
- Recovery after reload
- Migration path beyond localStorage-only persistence

## 24. Recovery / Integrity
- Source-integrity checks
- State recovery
- Corruption handling
- Checkpoints
- Execution records
- Rollback concepts
- Release artifact verification
- Protected source guarantees

## 25. Observability
- Selected model
- Tools used
- Timings
- Errors
- Retries
- Context size
- Token estimates
- Verification result
- Run state
- Performance tier
- Internal execution traces suitable for debugging without exposing private reasoning

## 26. Resource Governor
- RAM awareness
- CPU pressure awareness
- Battery impact awareness
- Context size control
- Model-call pressure
- Concurrent job limits
- Expensive UI effect suppression
- Lazy loading
- Startup budget enforcement

## 27. Performance Tiers
- Full
- Balanced
- Lite

Lite principles:
- Disable expensive blur/effects
- Minimize animations
- Lazy-load heavy features
- Simpler rendering
- Preserve functionality over decoration

## 28. UX Runtime
- Component states
- Semantic UI states
- Workspace states
- Typed / generated UI where appropriate
- Responsive behavior
- Accessibility behavior
- Mobile-first interactions

## 29. Day / Night Identity System
Day:
- clean bright surfaces
- restrained cool depth
- Seven Blue / Cyan identity

Night:
- midnight/navy surfaces
- controlled blue/cyan light
- low glare

Both share the same Seven shape DNA.

## 30. Seven Brand System
- Curved / ribbon-like `7`
- Simple silhouette
- Curved geometry
- Ribbon continuity
- Seven Blue / Cyan
- Day/Night compatible
- Monochrome capable
- Suitable for app icon / clothing / hardware
- Avoid generic AI sparkle / brain / circuit / robot / infinity / crypto aesthetics

## 31. Aurora Semantic State System
States:
- Idle
- Thinking
- Research
- Coding
- RPG
- Success
- Warning
- Error

Aurora may affect accents, subtle lighting, status presentation and motion intensity, but never authority or truth status.

## 32. Animation System
- Meaningful motion only
- Lightweight
- Interruptible where applicable
- Reduced Motion compatible
- Performance-tier aware
- No constant decorative loops
- Workspace / composer / status / tool / success transitions
- Future ribbon-DNA motion language

## 33. Accessibility
- Reduced Motion
- Contrast
- Touch target sizing
- Phone layout robustness
- Focus behavior
- Arabic readability
- RTL
- Bidi-safe code and mixed-language content

## 34. Arabic / RTL
- True RTL layouts
- Direction-aware UI
- Arabic typography
- Arabic Markdown
- Mixed Arabic / English / code safety
- Mobile RTL verification

## 35. Workspace Hub
Current / established surfaces:
- Coding Workspace
- RPG / Real Works Workspace

Possible future workspaces:
- Research
- Files / Knowledge
- Projects
- Memory Inspector
- Model Lab

## 36. Generative / Typed UI
Potential typed surfaces:
- status cards
- progress views
- code diffs
- research results
- tables
- timelines
- RPG state
- source cards
- file trees

Generated UI must be schema-bound / typed rather than arbitrary unsafe HTML.

## 37. Provider Layer
- Groq
- OpenRouter
- direct providers
- local runtimes
- future providers

Provider choice should not leak into product-level logic.

## 38. Local Intelligence Plane
- Local embeddings
- Local reranking
- Classification
- Intent detection
- Memory selection
- Lightweight fallback
- llama.cpp fallback direction

## 39. Streaming
- Incremental response rendering
- Streaming-aware status UI
- Streaming-aware tool events
- Integration with cancellation

## 40. Real Cancellation
- AbortController / provider cancellation where supported
- Stop generation
- Stop streams
- Stop compatible tools
- Stop chained tasks safely

## 41. Import / Export
Target coverage:
- chats
- rooms
- settings
- memory
- projects
- knowledge
- safe upgrade / APK migration

## 42. Permission System
- Read
- Write
- Execute
- Network
- Delete
- Rename
- External side effects

Permissions must bind to authoritative user grants and must not become permanent merely because an AI or tool echoed them.

## 43. Lineage System
Derived objects retain links to:
- source
- transformation
- resulting object

Applies to:
- memories
- summaries
- research facts
- tool results
- canon state
- generated context

## 44. Idempotency
- Avoid duplicate side effects during retries
- Track retry-safe operations
- Detect operations that must be verified before retrying

## 45. Side-Effect Uncertainty
If a request may have completed but confirmation was lost, represent it as unknown rather than automatically failed. Verify the real-world state before retrying.

## 46. Release Screenshot Verification
Verified release screenshot targets:
- Chat Night
- Chat Day
- Aurora Thinking
- Workspace Launcher
- Coding Agent
- RPG / Real Works

Screenshots must come from the actual verified release artifact, not concept mockups.

## 47. CI / Release Gates
- Unit / browser tests
- Source integrity
- Build verification
- Release boot
- Mobile widths
- RTL
- Day / Night
- Reduced Motion
- Lite tier
- Overflow
- Contrast
- Startup budget
- Lazy workspace loading
- Screenshot capture

## 48. GitHub Project Memory
Canonical durable project-memory files:
- `SEVEN_MASTER_PLAN.md`
- `SEVEN_DECISIONS.md`
- `SEVEN_STATUS.md`
- `SEVEN_CAPABILITIES_MAP.md`
- `SEVEN_ULTIMATE_POLISH_PLAN.md`

## Core Rule
This capability map is an inventory, not a claim that every item is fully implemented. Implementation status belongs in `SEVEN_STATUS.md`; architectural intent belongs in `SEVEN_MASTER_PLAN.md`; final perfection work belongs in `SEVEN_ULTIMATE_POLISH_PLAN.md`.
