# Seven AI — Ultimate Polish Protocol 2.0

> **Status:** Canonical architecture-polish protocol for Seven AI.
> **Scope:** Apply independently to every capability in `SEVEN_CAPABILITIES_MAP.md`, including all 45 core capability families and each Tool Fabric 2.0 capability family.
> **Goal:** Find the strongest practical design, not the largest design. Existing architecture is never assumed correct merely because it already exists.

---

## Operating Rule

For every system under polish, do not merely add features. Audit, attack, compare, simplify, redesign where justified, verify, evaluate, and only then produce a freeze candidate.

The governing question is:

> If we were forced to build the strongest practical version of this system for Seven today, knowing everything we know now, would we still choose this architecture?

If the answer is no, redesign it.

---

## 1. Establish Ground Truth
Determine precisely:
- what exists in architecture
- what is actually implemented
- what is planned only
- what is legacy
- what is duplicated
- what is speculative
- what depends on unverified assumptions

Never turn an architectural target into an implementation claim.

## 2. First-Principles Reconstruction
Ask:
- What original problem does this system solve?
- If the current design did not exist, how would we build it today?
- What is the smallest useful set of primitives?
- What must be authoritative?
- What must remain derived?
- Where are the correct responsibility boundaries?

## 3. Adversarial Architecture Attack
Attempt to break the system using:
- race conditions
- stale state
- corruption
- hallucinated state
- authority escalation
- ambiguous ownership
- hidden coupling
- retry hazards
- cancellation hazards
- partial failure
- network loss
- provider failure
- malformed or malicious inputs
- huge inputs
- low-memory conditions
- thermal pressure
- offline operation
- contradictory evidence
- irreversible actions
- migration failures
- version drift

## 4. Assumption Destruction
Extract hidden assumptions. For each one ask:
- Why is it required?
- What happens if it is false?
- Can the dependency be removed?
- Can the architecture remain correct without it?

## 5. Alternative Architecture Search
Do not optimize only the current solution. Produce and compare meaningful alternatives, including radically different designs where justified.

Compare by:
- capability
- correctness
- complexity
- latency
- RAM
- battery
- storage
- network cost
- maintainability
- security
- recoverability
- observability
- testability

Retain the current architecture only if it survives comparison.

## 6. Capability Ceiling
Determine the maximum useful capability of the system. Discover missing capabilities, but add one only when it is useful, implementable, compatible with Seven's invariants, and worth its complexity/resource cost.

## 7. Research & Competitive Sweep
Search relevant research papers, production architectures, open-source systems, agent runtimes, databases, operating systems, compilers, browsers, distributed systems, mobile systems, and relevant AI products.

Extract useful primitives and lessons. Do not copy systems merely because they are popular.

## 8. Intelligence Upgrade
Identify static decisions, thresholds, and naive heuristics that can safely become:
- adaptive policies
- evidence-aware decisions
- learned/local classifiers
- capability-aware routing
- resource-aware routing
- uncertainty-aware decisions

Retain deterministic fallbacks where they improve correctness or safety.

## 9. Truth & Authority Audit
For every meaningful state/object define:
- source
- authority
- owner
- lineage
- freshness
- confidence
- mutability
- persistence
- reconstruction path

Derived information must never silently become authoritative.

## 10. Security & Side-Effect Audit
Test:
- permissions
- privilege boundaries
- injection
- untrusted tool output
- remote metadata
- destructive actions
- external communication
- retries
- idempotency
- side-effect uncertainty
- confirmation requirements
- secret handling

## 11. Failure & Recovery Engineering
For every important operation define:
- failure states
- retry policy
- timeout policy
- cancellation semantics
- checkpoint behavior
- rollback possibility
- reconciliation strategy
- corruption recovery
- crash recovery

Use explicit UNKNOWN/uncertain states where binary success/failure would invent certainty.

## 12. Performance & Mobile Assault
Assume Seven runs on a constrained Android phone. Audit:
- startup
- APK size
- RAM
- CPU
- battery
- thermal load
- storage
- network
- background work
- concurrency
- rendering
- local models

Determine what can be lazy-loaded, cached, streamed, batched, deferred, unloaded, disabled, or gracefully degraded.

## 13. UX Translation
Important capabilities must have appropriate user-visible representations when needed, including:
- progress
- uncertainty
- errors
- recovery
- permissions
- verification
- cancellation
- long-running states
- debugging surfaces

Do not expose internal complexity without user value.

## 14. Integration Audit
Audit interactions with every relevant Seven system. Find:
- duplicated responsibility
- conflicting authority
- circular dependencies
- unnecessary coupling
- missing contracts
- missing events
- incompatible state models

## 15. Simplification Pass
After improving the design, attempt to remove things. Ask whether primitives can merge, layers can disappear, abstractions are unjustified, or features can emerge naturally from a cleaner architecture.

**Stronger does not mean larger.**

## 16. Verification Contract
Define how Seven proves that the system accomplished what it claims. Prefer evidence bound to the resulting action or artifact rather than model self-confidence.

## 17. Evaluation Contract
Create measurable tests and metrics for:
- correctness
- reliability
- latency
- resource cost
- recovery
- security
- UX
- regressions
- edge cases

Compare OLD vs NEW where possible.

## 18. Proof of Improvement
For every major accepted change record:
- current problem
- proposed solution
- why it is stronger
- cost
- new risks
- measurement method
- reason for acceptance or rejection

Never accept a change merely because it sounds advanced.

## 19. Future-Proofing
Test against:
- new providers
- new models
- new tools
- new Android versions
- schema evolution
- larger projects
- longer sessions
- offline/local execution
- future Seven capabilities

The system should evolve without requiring product-wide rewrites.

## 20. Final Red-Team
After the proposed final design exists, attack it again as though trying to prove a competitor's architecture unsound. New material failures return the design to repair.

## 21. Freeze Candidate
Produce a final specification containing:
- final architecture
- final capabilities
- invariants
- authoritative states
- interfaces/contracts
- failure semantics
- security boundaries
- performance budgets
- integration contracts
- verification requirements
- eval requirements
- deferred ideas
- rejected ideas and rejection reasons
- implementation order

Do not mark the system frozen while a clear improvement remains whose expected value materially exceeds its cost.

---

# Global Seven Laws

1. Explicit authoritative state.
2. Derived state never silently gains authority.
3. Full lineage for meaningful derived objects.
4. Verification before claiming real-world success.
5. Explicit uncertainty instead of invented certainty.
6. Selective compute instead of always-on expensive intelligence.
7. Mobile-first resource discipline.
8. Graceful degradation.
9. Provider independence.
10. Recoverability.
11. Cancellation safety.
12. Side-effect safety and idempotency.
13. Security boundaries that AI/tool output cannot override.
14. Typed contracts between major systems.
15. No fake actions, fake tool success, fake canon fidelity, or fake evidence.
16. Complexity must earn its existence.

---

# Campaign Application

Apply this protocol independently to:
1. Every numbered core capability in `SEVEN_CAPABILITIES_MAP.md`.
2. Every Tool Fabric 2.0 capability family, not Tool Fabric as one monolithic item.
3. Cross-system boundaries after individual polishing is complete.
4. A final whole-system integration/red-team pass after the campaign.

Each polish record should preserve ground truth, alternatives considered, accepted/rejected changes, evidence, verification/eval requirements, and the resulting freeze candidate.
