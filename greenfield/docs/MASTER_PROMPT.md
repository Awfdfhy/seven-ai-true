# SEVEN RPG — GREENFIELD MASTER EXECUTION DIRECTIVE
Version 3.1 · 2026-10-24

## 1. Mission and product identity
Build Seven RPG from a clean, evidence-driven foundation as an independent, mobile-first, AI-powered role-playing game. Product motto: **Own the intelligence. Borrow the infrastructure.** The app is a game, not a general AI assistant, coding assistant, productivity suite, or unrelated chatbot.

The objective is not maximal file count or a superficial feature checklist. The objective is a coherent playable RPG with reliable world state, player agency, deep narrative continuity, strong mobile UX, replaceable AI infrastructure, and verifiable Android releases.

## 2. Truth and provenance
Start with repository inventory and source evidence. Label each statement VERIFIED, INFERRED, ASSUMED, UNKNOWN, or BLOCKED. A historical plan is not proof that a feature exists. A local test is not proof of an Android build. A web build is not proof of device readiness. Never invent logs, screenshots, benchmark results, test runs, commits, or completed agent work.

Treat the historical repository as read-only reference unless the owner explicitly authorizes a scoped migration. Do not copy legacy source wholesale. Preserve all existing user data and formats until migration is planned, tested, reversible, and approved.

## 3. Required startup sequence
1. Verify repository, branch, HEAD SHA, working tree, default branch, permissions, CI, and exact allowed file scope.
2. Inventory source tree, application entry points, data/storage keys and schemas, provider integrations, imports/exports, UI navigation, Android build setup, permissions, tests, workflows, and release process.
3. Build a source register of all previous Seven RPG requirements and known defects. Attach source path, evidence, confidence, and status.
4. Consolidate duplicate features into stable IDs. Keep an explicit conflict list; do not silently resolve major product or data-safety conflicts.
5. Define MVP-0 and its adversarial acceptance suite.
6. Compare no more than three viable technology stacks and build a narrow proof-of-concept for high-risk assumptions.
7. Record the choice in ADR-0001 before creating a full stack-specific application scaffold.
8. Establish typed domain/data/event/AI contracts and contract tests.
9. Implement one vertical slice at a time and keep all status documents accurate.

## 4. Product invariants
- The player controls their character's consequential actions, choices, and dialogue unless explicit delegation exists.
- AI prose is not authoritative game state.
- Only typed, validated, authorized domain events may change game state.
- Every campaign/world is isolated from every other campaign/world.
- Canon facts, confirmed event history, character knowledge, beliefs, rumors, summaries, and model suggestions are separate data categories.
- Model outputs, imported content, external web content, and third-party skills are untrusted input.
- Credentials and signing secrets never enter client bundles, source control, logs, screenshots, or reports.
- Save data must be versioned, recoverable, exportable where specified, and protected against partial writes.
- Arabic RTL and English LTR are first-class product requirements.
- Offline, cancellation, timeout, stale responses, and retry are explicit states, not exceptional afterthoughts.

## 5. MVP-0 acceptance journey
A new user can launch the app, create a world, create a player character, enter a scene, submit a player action, have the action validated, receive structured narrative from a deterministic mock provider, validate proposed domain events, apply only legal events, save, force-stop/reopen, and recover the same world and character state.

Test at minimum:
- malformed or empty model response;
- proposal attempts unauthorized state mutation;
- illegal action and insufficient resources;
- duplicate submission / replayed event;
- user cancellation while request is in flight;
- late response arriving after cancellation or newer action;
- interrupted save and corrupted save;
- migration failure and recovery;
- offline launch and offline action;
- world/campaign isolation;
- Arabic RTL, English LTR, mixed-direction text, long text, and keyboard navigation.

## 6. Stack selection
Score at most three stacks against: Android distribution, mobile UI quality, Arabic RTL, persistence and migrations, deterministic domain tests, AI streaming and cancellation, offline mode, low/mid-range device performance, accessibility, build reproducibility, app size, licensing, ecosystem maintenance, and autonomous-agent ergonomics. Use evidence and a small proof-of-concept. Record rejected options and migration costs in ADR-0001. Do not choose a stack merely because an agent is familiar with it.

## 7. Architecture boundaries
Keep the game domain independent of UI and provider SDKs. Define explicit interfaces for:
- world/campaign repository and versioned save codec;
- typed player commands and deterministic validation;
- domain events, reducer, event identity, idempotency and concurrency;
- narrative request/response schemas;
- AI provider capability and cancellation contract;
- Canon and memory retrieval/writes;
- import/export validation;
- telemetry and error reporting with sensitive-data filtering.

AI runtime returns proposals and prose. The domain engine validates proposals against current state, permissions, rules, and event history. Invalid proposals are rejected without mutation. Do not let a model invent authoritative inventory, HP, currency, quest completion, relationships, time, or combat outcomes.

## 8. Data and continuity
Before implementation, define schemas, versioning, migration, rollback, atomic save boundaries, backup/restore, corruption handling, and export compatibility. Every event needs identity and idempotency rules. Reject stale commands if their base revision is no longer current. Never mix one world's facts into another world's retrieval context.

Keep separately:
1. canonical world facts;
2. confirmed event log;
3. current authoritative state;
4. character-specific knowledge;
5. character beliefs and uncertainty;
6. rumors and hearsay;
7. compacted summaries with provenance;
8. generated suggestions awaiting validation.

Memory retrieval must respect world, character, time, relevance, confidence, and source. A generated suggestion does not become history until the game rules and user-authority model approve it.

## 9. AI provider strategy
Start with a deterministic mock provider and a versioned schema. Add one real provider only after tests enforce the contract. Provider implementations must be replaceable and declare supported features. Implement timeouts, cancellation, retry budgets, backoff, error classification, rate limits, streaming lifecycle, malformed-output handling, and safe logging. Never expose secrets in mobile clients. Do not silently switch to a provider that changes privacy, cost, or data handling assumptions.

## 10. UI and accessibility
Define design tokens, typography, spacing, color semantics, motion, icons, component contracts, and navigation before broad screen expansion. Every async interaction documents idle/loading/success/empty/error/offline/cancelled/stale/retry states. Audit touch target size, focus order, keyboard and back behavior, screen readers, contrast, reduced motion, long text, small screens, Arabic RTL, English LTR, and mixed-direction values. Test actual gameplay content, not only ideal mock text.

## 11. Android and performance
Document supported API levels and device assumptions. Test install, upgrade, lifecycle interruption, force-stop/reopen, storage provider permissions, import/export, network loss, cancellation, keyboard, RTL, low memory, and long sessions. Benchmark on representative low/mid-range hardware. Report measurements and conditions; do not claim a performance target without a reproducible test.

Release evidence must include commit SHA, exact commands, toolchain versions, test outcomes, device/API level, screenshots/logs where relevant, artifact checksum, and known gaps. Signing keys and private credentials must never be committed.

## 12. Work planning
Every task must contain:
- stable task/feature ID;
- measurable objective and user-visible outcome;
- dependencies and prerequisites;
- files/modules allowed to change;
- acceptance criteria;
- exact test commands;
- data/security/performance risks;
- rollback strategy;
- status and evidence references.

Use small dependency-ordered tasks. Keep the feature catalog, roadmap, task ledger, current status, decisions, and risk register synchronized. Use separate worktrees/branches for parallel agents and explicit file ownership. Require integration tests before merging agent work.

## 13. Verification and release discipline
Run relevant tests after each change. Run the full regression suite at milestones. Separate static checks, unit tests, integration tests, UI tests, emulator tests, physical-device tests, and release gates. Report each category independently. A skipped test is not a pass. A flaky test is not a pass until triaged. A screenshot is not evidence that underlying behavior works.

Never merge to main, publish a release, change repository visibility, rewrite history, delete important data, or incur unavoidable paid usage without the owner's required approval. Continue autonomously through safe, reversible, unblocked tasks.

## 14. Mandatory project artifacts
Maintain:
- README and AGENTS rules;
- MASTER_PROMPT and MASTER_PRODUCT_BIBLE;
- GENESIS_PLAN and SOURCE_REGISTER;
- FEATURE_CATALOG with stable IDs;
- ARCHITECTURE, DATA_MODEL, STATE_AND_EVENT_CONTRACT;
- AI_RUNTIME_CONTRACT and CANON_MEMORY_CONTRACT;
- UI_CONTRACT and SECURITY_THREAT_MODEL;
- ROADMAP, TASK_LEDGER, CURRENT_STATUS, RISK_REGISTER, DECISIONS;
- ADR-0001 technology choice;
- TEST_STRATEGY and ANDROID_RELEASE_GATES;
- changelog and reproducible build/test instructions.

## 15. First deliverable
Before large-scale coding, deliver a truthful bootstrap report containing repository provenance, untouched-legacy evidence, source register, conflicts, MVP-0 acceptance suite, stack scorecard, ADR, architecture boundaries, dependency-ordered backlog, exact verification commands, and blockers. Then start the first implementation task whose prerequisites are actually satisfied.

**Definition of success:** a real playable RPG, verified state transitions, recoverable persistence, tested provider contracts, high-quality mobile UI, and release evidence—not an elaborate plan with no working software.
