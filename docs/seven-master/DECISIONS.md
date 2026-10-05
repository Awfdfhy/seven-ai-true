# Seven AI — Architecture Decision Log

## ADR-001 — GitHub is the Source of Truth
Status: Accepted
Decision: Multi-chat work is coordinated through repository documentation and code, not chat memory alone.

## ADR-002 — One Primary Subsystem per Specialist Chat
Status: Accepted
Decision: Specialist chats own focused domains to reduce context pollution and conflicting assumptions.

## ADR-003 — Shared Contracts Are Explicit
Status: Accepted
Decision: Cross-system interfaces are documented in INTEGRATION_CONTRACTS.md and cannot be silently changed.

## ADR-004 — Coding Before Self-Development
Status: Accepted
Decision: The Coding System must be robust and verified before autonomous/self-development features depend on it.

## ADR-005 — Verification Is Mandatory
Status: Accepted
Decision: No subsystem is marked complete from implementation alone; tests and regression evidence are required.

## ADR-006 — Integration Acceptance Is Evidence-Gated
Status: Accepted
Decision: Unit success is insufficient for release readiness. Cross-system regression, release build, Android build/device evidence, state isolation, cancellation and recovery are explicit acceptance gates. Zero bugs may only mean zero known reproducible bugs in the tested scope.

## ADR-007 — Execution Checkpoints Fail Closed
Status: Accepted
Decision: Execution checkpoints use a versioned envelope with task/run/state identity checks, deterministic corruption checksum and bounded retention. Invalid checkpoints are rejected. The checksum is not treated as a cryptographic trust boundary.

## ADR-008 — Cancellation Is Request-Scoped
Status: Accepted
Decision: Cancellation belongs to the originating generation/tool request. Platform-specific code may choose the safe abort mechanism, but late results must be discarded and cancellation from another room/workspace must not bleed across scopes.

## ADR-009 — Cross-System Errors Use a Common Taxonomy
Status: Accepted
Decision: Integration surfaces normalize failures into MODEL_ERROR, NETWORK_ERROR, TOOL_ERROR, MEMORY_ERROR, FILE_ERROR, AUTH_ERROR, RATE_LIMIT, VALIDATION_ERROR, CANCELLED, TIMEOUT or INTERNAL_ERROR, while preserving technical details in safe structured diagnostics.


## ADR-010 — RPG Structured State Is Authoritative
Status: Accepted
Decision: RPG continuity-critical truth lives in validated structured state plus provenance ledger. Narrative prose, summaries and retrieved memories are projections/evidence, not authoritative state.

## ADR-011 — RPG Separates Truth, Knowledge and Belief
Status: Accepted
Decision: Narrator/world truth, each character's knowledge, and each character's beliefs are separate state domains. A character may not use a fact without a valid knowledge path.

## ADR-012 — RPG Uses Propose → Validate → Commit
Status: Accepted
Decision: Models and NPC planners may propose state changes, but deterministic Canon, player-control, knowledge, timeline, spatial, inventory/ability and provenance gates decide whether a change can commit.

## ADR-013 — RPG Reuses Seven Memory Fabric
Status: Accepted
Decision: RPG-specific memory schemas/adapters layer on the shared Memory system using RPG scope and provenance; no independent hidden RPG memory database is introduced.

## ADR-014 — Player Control Is a Hard Runtime Constraint
Status: Accepted
Decision: For player-controlled characters, Seven cannot invent irreversible actions, internal thoughts/emotions or decisions unless the user explicitly grants control.


## ADR-REL-001 — Release scope is identified by product and commit
Status: Accepted
Decision: Root main currently builds the HTML/Capacitor product. Typed remake branches are separate candidates; their tests/features are not credited to a root APK. Do not silently merge the divergent architectures or delete historical branches. Acceptance is bound to one product entrypoint and SHA.

## ADR-REL-002 — Self-development accepts exact required CI only
Status: Accepted
Decision: Explicitly dispatch the required test workflow for isolated work branches, require matching branch/SHA, reject unfinished timeouts and bind merge to that verified SHA. Publication uses one tree/commit and a non-forced ref update. Autonomous patches cannot edit measured acceptance gates; only 404 means a file is absent.

## ADR-REL-003 — APK provenance and source cleanliness are release gates
Status: Accepted
Decision: Packaging v5 records source commit, source dirty status, workflow run and SHA-256 asset inventory. APK verification rejects different SHA, dirty source or mismatched packaged bytes. Build generators must be idempotent with committed sources; label synchronizer output was committed for the current label. Actual binary/version/signature/install remains an additional acceptance gate.

## ADR-REL-004 — RPG context budgets include knowledge references and diagnostics
Status: Accepted
Decision: Character context knowledge references are projections restricted to selected known Canon. Serialized size includes diagnostics. An unavoidable oversized projection returns BLOCKED/context-budget-exceeded rather than READY. Canonical knowledge is not deleted or changed. Narrative/character generation callers must honor this blocked result.

## ADR-REL-005 — Regression discovery and startup budget share authoritative inputs
Status: Accepted
Decision: all.cjs discovers release/*.test.cjs automatically. Static and browser release audits consume build.startupBytes with the same strict <100000-byte gate; no budget increase was used. UI loader public API stays load/loadShell/loadFinal and supports failure recovery.

Generated test reports belong under dist/, not tracked source. Memory output moved to dist/memory-results.json to keep acceptance/build source identity clean.
## ADR-015 — Response Mode State Is Canonical
Status: Accepted
Decision: Chat/Think/Search/Research are controlled by one idempotent runtime state surface. CSS classes are projections only. Changing mode while generation is active cancels the originating work before changing semantics.

## ADR-016 — Context Budget Follows the Controller Model
Status: Accepted
Decision: Context input budget is derived from the controller-selected model window, not the largest configured provider window. Fallback candidates must fit the actual compiled request.

## ADR-017 — Research Citation Locks Preserve Temporal Identity
Status: Accepted
Decision: Locked citations preserve retrievedAt, publishedAt when available, source identity and deterministic content hash so freshness and source mutation are auditable.

## ADR-018 — Diagnostics Are Bounded and Content-Free
Status: Accepted
Decision: Request traces retain IDs, phases, timings, counts, model/provider identifiers and normalized errors only. Prompt, response, secret, file-body and source-body content is excluded.

## ADR-019 — Network Link State Is Not Reachability
Status: Accepted
Decision: navigator.onLine is represented as link-online/offline only. End-to-end reachability is a separate evidence field updated from provider outcomes.

## ADR-REL-006 — Verify the APK binary and signature, retain explicit upgrade gate
Status: Accepted
Decision: APK acceptance reads package/version from aapt dump badging and verifies the actual APK with apksigner verify --verbose --print-certs. Missing SDK tools, wrong binary identity or invalid signatures fail the gate. Record APK SHA-256, certificate SHA-256, source SHA/run and web inventory count in dist/apk-verification.json and publish it beside the APK. A valid signature is not evidence of cross-build signing continuity or data-preserving upgrades; those remain explicit gates. Root debug workflow currently does not pass the optional persistent CI keystore properties.
Reference: https://developer.android.com/tools/apksigner

## ADR-REL-007 — Uncertain RPG persistence must quarantine before hydrate
Status: Accepted
Decision: The live RPG bridge stages a durable per-room pending journal before mutation, containing previous session/index for recovery. Ordinary rollback removes the journal only when session/index restoration succeeds. Uncertain rollback, interruption or failed finalization leaves the journal and load/loadLatest/context/sync fail closed with recovery-required, including after restart. Journal write failure prevents all mutation. This is a safety quarantine, not a cross-store atomic transaction or automatic recovery claim; unresolved journal repair and user-visible recovery remain release gates.

## ADR-REL-008 — Reduce RPG payload through parser-based packaging
Status: Accepted
Decision: Pin Terser 5.51.2 as a build dependency and minify only four whitelisted RPG kernel/bridge files. Compression is disabled; local identifier mangling is allowed while function names and property/API names are retained. Other assets retain their existing packaging. Execute the existing state/session/context/live failure/restart suites against the packaged modules in one isolated VM. Preserve all startup/workspace size gates; source stays readable. This repairs the 320506-byte CI workspace failure without raising the 320000-byte budget.
Reference: https://terser.org/docs/api-reference/

ADR-REL-008 addendum: upstream theme fixes pushed startup bytes to 100085. The same parser packaging now covers beta-ui-runtime.js with local mangling, compression disabled and function/property names retained. Fourteen source-vs-packaged preference/system/legacy cases and public API checks pass. Other startup scripts keep their existing transform.
