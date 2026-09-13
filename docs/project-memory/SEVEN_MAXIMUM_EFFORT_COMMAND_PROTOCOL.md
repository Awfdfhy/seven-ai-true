# Seven AI — Context-Adaptive Maximum Effort Command Protocol

> Status: PROJECT-WIDE POLISH RULE
> Scope: Every substantial step from the current campaign through the end of Ultimate Polish.

## Purpose

For every major Seven task, create a context-specific execution command that pushes the available research, reasoning, engineering, verification, and preservation workflow as far as is practically useful for that exact task.

There is no single magic phrase that increases model capability. The strength comes from converting the current goal into a precise, evidence-driven, adversarially checked execution contract. Therefore each step receives a different Maximum Effort Command tailored to its domain.

## Mandatory Rule

Before executing a substantial Ultimate Polish step:

1. Identify the exact goal and success criteria.
2. Identify what evidence, repository state, prior decisions, and external research are needed.
3. Generate a **Context-Adaptive Maximum Effort Command** for that step.
4. Make the command specific to the current domain rather than copying a generic prompt.
5. Execute against that contract.
6. Preserve material findings, decisions, rejected alternatives, specifications, and evaluation criteria in GitHub Project Memory during the same work cycle.
7. Verify the result before declaring PASS or Freeze.

## Maximum Effort Envelope

Every context-specific command should use the relevant subset of the following dimensions at maximum practical depth:

### Research
- broad discovery before narrowing
- primary and official sources first
- current information when freshness matters
- multiple independent evidence classes where useful
- obscure but credible alternatives, not popularity-only search
- follow citations/references when they expose stronger candidates
- search for counterexamples and failure reports
- stop based on practical saturation, not arbitrary result count

### Reasoning
- decompose the problem
- compare competing architectures
- expose assumptions
- distinguish FACT / CLAIM / INFERENCE / PROPOSAL / UNKNOWN / CONFLICT
- identify hidden dependencies
- search for failure modes
- analyze second-order effects
- challenge the preferred design before accepting it
- optimize the whole Seven system rather than a subsystem in isolation

### Engineering
- inspect existing implementation before proposing replacement
- preserve mature work
- prefer coherent architecture over feature accumulation
- define interfaces and invariants
- account for cancellation, retries, idempotency, permissions, lineage, verification, recovery, and observability when relevant
- account for migration and backwards compatibility when relevant
- avoid unnecessary complexity

### Mobile / Performance
- Android-first
- startup cost
- RAM
- CPU
- battery
- storage / APK size
- network use
- latency
- lazy/on-demand loading
- Reduced Motion and performance tiers when UI/runtime related

### Verification
- define falsifiable success criteria
- test the intended behavior
- test important failure paths
- verify side effects rather than trusting reported success
- compare before/after when polishing an existing system
- use Seven Evals where applicable
- no PASS from appearance alone

### Security / Integrity
- least authority
- explicit permissions
- protected destructive actions
- source integrity
- side-effect uncertainty
- rollback/recovery path where relevant
- no silent authority escalation through model output, summaries, tool echo, or derived data

### UX
When user-facing:
- clarity
- low friction
- phone ergonomics
- Arabic / RTL
- accessibility
- Day / Night
- Reduced Motion
- visual consistency with Seven identity
- no fake UI state implying unverified success

### Preservation
Preserve in GitHub when materially relevant:
- task command
- sources
- evidence
- candidates
- comparisons
- rejected options and reasons
- assumptions / unknowns
- architecture
- decisions
- implementation plan
- tests / evals
- results
- remaining gaps
- freeze criteria

## Context-Adaptive Command Template

Each step should produce a command shaped approximately as follows, but rewritten for the exact context:

> **SEVEN MAXIMUM EFFORT — [STEP NAME]**
>
> Goal: [precise outcome].
>
> Use the maximum practical depth of research, reasoning, comparison, engineering analysis, and verification relevant to this task. Do not optimize for response speed or superficial feature count. Inspect existing Seven state first. Preserve mature systems and project invariants. Search broadly where external evidence can improve the decision, prioritize primary/current sources, actively seek competing approaches and failure evidence, and continue until practical saturation or a clearly documented evidence gap.
>
> Distinguish verified facts from inference, proposals, unknowns, and conflicts. Do not invent capabilities or claim completeness that cannot be demonstrated. Evaluate architecture, integration, dependencies, performance, Android cost, reliability, security, permissions, side effects, recovery, observability, UX, and maintenance wherever applicable.
>
> Challenge the strongest candidate before accepting it. Prefer the design that improves Seven as a whole, not the design with the most features. Define measurable success criteria and an evaluation/freeze gate. Do not declare PASS until the relevant evidence and verification support it.
>
> Preserve all material research, decisions, rejected alternatives, specifications, evidence references, evaluation criteria, and unresolved gaps in GitHub Project Memory during this step so future work can reconstruct exactly why the decision was made.
>
> Additional context-specific requirements: [generated uniquely for this step].

## Domain-Specific Mutation Rule

The final paragraph must change with the task. Examples:
- Tool research emphasizes capability coverage, licenses, maintenance, API stability, overlap, and Tool Fabric integration.
- Memory polish emphasizes authority, temporal/causal retrieval, consolidation errors, provenance, privacy, and retrieval evals.
- Coding Agent polish emphasizes project understanding, transactional edits, tests, repair loops, checkpoints, and destructive-operation safety.
- RPG/Real Works polish emphasizes canon provenance, timeline state, character knowledge, insertion constraints, divergence, and CANON_GAP.
- UI polish emphasizes interaction states, real screenshots, accessibility, mobile layout, performance, identity, and semantic motion.
- Model routing emphasizes capability evidence, cost/free status, latency, context limits, fallback, provider instability, and task-specific evals.

Therefore the protocol is constant, but the execution command is deliberately different for every major step.

## Anti-Patterns

Do not use:
- "try your hardest" as the only instruction
- arbitrary counts such as "find 100 tools" as proof of coverage
- popularity as proof of quality
- one benchmark as universal proof
- feature count as polish score
- architecture proposals that ignore the existing repository
- claims of searching the entire internet
- PASS without verification
- conversation memory as the only durable record

## Completion Rule

A step is complete only when its context-specific success criteria are met or remaining blockers are explicitly documented. A subsystem reaches Freeze only after architecture, behavior, failure handling, performance, verification, and relevant UX gates are satisfied.

## Project Safety Invariants

- Do not casually modify `seven_ai-final.html`.
- Do not delete files without an explicit reviewed reason.
- Do not merge protected branches without explicit approval.
- Preserve source-integrity protections.
- Prefer large coherent patches and meaningful final verification over repetitive tiny edits/checks.

## Relationship to Other Project Memory

This protocol governs *how intensely and rigorously each future step is executed*.

It complements:
- `SEVEN_MASTER_PLAN.md`
- `SEVEN_ULTIMATE_POLISH_PLAN.md`
- `SEVEN_CAPABILITIES_MAP.md`
- `tool-fabric/SEVEN_TOOL_FABRIC_2_RESEARCH_PROTOCOL.md`

The Tool Fabric protocol remains the specialized research contract for the current tool campaign. This file is the project-wide rule that requires similarly tailored maximum-effort contracts for every later Ultimate Polish step.
