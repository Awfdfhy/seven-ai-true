# Seven Projects System — Polishing V4 Research + Ground Truth

Status: ACTIVE V4 CAMPAIGN
Capability: #22 Projects System
Branch: seven-beta-ui-v1
Protected source policy: architecture-only; do not modify `seven_ai-final.html`.

## Baseline inventory
The existing capability map defines Projects as persistent scope for files, memory, context, goals, instructions, agent state, run history, tools, checkpoints, export/import and integrity manifests. This baseline is useful but underspecified about authority, lifecycle, synchronization, variant isolation, trust, project-to-session boundaries and mobile/offline behavior.

Adjacent Seven ownership already exists and must not be duplicated:
- File & Project Tools / Project File Fabric owns file bytes, file versions and transactional file mutation.
- Memory Fabric owns authoritative memory events and derived memory views.
- Context Fabric owns disposable/reconstructable context workspace.
- Cognitive Runtime owns active run state.
- Sessions / Persistence owns session/chat persistence and application schema migration.
- Tool Security / Permission System owns grants and executable authority.
- Side-Effect Ledger owns external effect truth and uncertainty.
- Recovery / Integrity owns corruption and restoration mechanisms.
- Workspace Hub owns product surface/navigation, not project authority.

Therefore Projects must act as a durable coordination boundary and relationship graph, not as a second database for everything.

## SearchSurfaceLedger
Examined domains:
1. persistent AI agent workspaces
2. long-running agent continuity across sessions
3. local-first/offline-first mobile architecture
4. durable workflow boundaries
5. workspace trust and execution isolation
6. repository/worktree style variant isolation
7. project-scoped memory vs session history
8. task/goal dependency graphs
9. import/export, fork/clone/archive and recovery
10. mobile resource constraints and lazy loading
11. future collaboration/sync without making cloud authority mandatory

Explicit exclusions for this round:
- concrete collaborative CRDT implementation selection; collaboration is future-facing and not required for single-user Seven 1.0.
- concrete Android Room/SQLite schema; belongs to implementation stage after architecture contracts stabilize.
- cloud execution plane; intentionally not added.

## Research evidence
### Android offline-first architecture
Google Android architecture guidance recommends a local data source as the source consumed by higher layers in offline-first applications, with network reconciliation handled by repositories. It also discusses queued/persistent synchronization using WorkManager and the need to resolve write conflicts deliberately.
Design impact on Seven: Project metadata and project-local durable coordination state should remain usable offline. Network/cloud sync, if added later, is a replica/synchronization concern and must not become an implicit authority shortcut.
Sources:
- https://developer.android.com/topic/architecture/data-layer/offline-first
- https://developer.android.com/topic/architecture/data-layer

### Persistent AI workspaces
Cloudflare's enterprise AI agent workspace architecture treats a workspace as a persistent environment that holds conversation state, files, tools and isolated execution, while produced artifacts outlive individual conversations.
Design impact: Seven Project should outlive chats/runs and link them rather than being represented by one conversation.
Source:
- https://developers.cloudflare.com/reference-architecture/diagrams/ai/enterprise-ai-agent-workspace/

### Long-running agent handoff
Anthropic's long-running agent engineering write-up identifies cross-session continuity as a core failure mode and uses persistent artifacts/handoff state to let later sessions continue work.
Design impact: Project continuity requires explicit durable goals, decisions, checkpoints and re-entry summaries/views, rather than relying on transcript replay or hidden model context.
Source:
- https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

### Memory scope separation
Current VS Code agent documentation distinguishes user-scoped memory from repository/workspace-scoped memory, reinforcing that persistent project knowledge should have an explicit scope rather than leaking globally.
OpenAI Agents SDK documentation similarly separates sandbox-agent memory from conversational session memory.
Design impact: Project memory policy should bind Memory Fabric records to project scope while leaving user-global and session-local memory distinct.
Sources:
- https://github.com/microsoft/vscode-docs/blob/main/docs/agents/concepts/agents.md
- https://openai.github.io/openai-agents-python/sandbox/memory/

### Workspace trust
VS Code Workspace Trust applies a trust boundary to folders/workspaces and restricts agent execution for untrusted content.
Design impact: Seven Project trust is not a cosmetic flag. Project resources can be readable while execution/network/write capabilities remain restricted until appropriate grants exist.
Source:
- https://code.visualstudio.com/docs/editing/workspaces/workspace-trust

### Variant isolation / worktrees
Git worktrees allow multiple isolated working trees attached to one repository, enabling parallel branches without duplicating the repository model.
Design impact: Seven project variants should be first-class references/views over shared or forked resources where safe, rather than blindly duplicating the entire project state. This is an analogy, not a requirement to use Git internally.
Source:
- https://git-scm.com/docs/git-worktree

### Durable execution boundary
LangGraph's 2025 design write-up emphasizes durable control/state and explicitly discusses the tradeoffs of workflow engines versus low-latency agent loops. Temporal-oriented examples separate durable orchestration history from agent-loop logic.
Design impact: Projects must not absorb Cognitive Runtime orchestration. They store durable references/results/checkpoints needed to resume work, while run execution remains owned by Cognitive Runtime.
Sources:
- https://www.langchain.com/blog/building-langgraph
- https://github.com/temporal-community/durable-hitl-agents

## Domain discoveries that materially exceed the baseline
1. Project identity and lifecycle must be authoritative and separate from folders/chats.
2. Project state should be local-first and offline-usable by default.
3. Project resources need typed links, not a flat bag.
4. Sessions/runs are attachments to projects, not project truth.
5. Project trust/authority must gate executable capabilities independently from read/display access.
6. Durable goal/task/decision state must survive context resets without requiring transcript replay.
7. Project variants/forks need explicit ancestry and merge/reconcile semantics where supported.
8. Project deletion/archive/export must define retention, references and orphan handling.
9. Re-entry must be compiled from authoritative/derived project state, not stored as a magical canonical summary.
10. Collaboration/sync should be future-compatible but not force CRDT/cloud complexity into Seven 1.0.

V4 outcome for discovery/research phase: `MATERIAL_IMPROVEMENT_FOUND`; saturation remains 0/2.
