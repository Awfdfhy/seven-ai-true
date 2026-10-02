# Seven AI — Intelligence & Reliability Polish Roadmap

Date: 2026-10-02
Status: ACTIVE
Owner repository: Awfdfhy/seven-ai-true

## Purpose

This file is the durable polishing roadmap for Seven AI. It is intentionally separate from chat history so future work can resume from the repository without reconstructing decisions.

The rule for this roadmap is: improve reliability, coherence, and user-visible truth before adding broad new feature surfaces.

## Release direction

### 2.1 — Intelligence & Reliability Polish
Primary goal: make routing, provider health, explainability, memory boundaries, and long-session behavior trustworthy.

1. Model Intelligence v3 ✅ COMPLETE (merged via PR #20, 2026-10-02)
   - multi-intent request analysis
   - confidence-aware routing
   - workspace + request blended scoring
   - context-pressure awareness
   - provider/model rolling health
   - switch hysteresis to prevent unnecessary model hopping
   - explainable recommendation reasons
   - one ranking source for picker and Auto Routing
   - deterministic tests

2. Provider Health v2 ✅ COMPLETE (merged via PR #21, 2026-10-02)
   - decayed success/failure signal
   - rolling latency
   - rate-limit/auth/server-failure distinction
   - provider-wide circuit breaker
   - cooldown recovery
   - quota pressure
   - structured diagnostics

3. Memory Scope Hardening ✅ COMPLETE (merged via PR #22, 2026-10-02)
   - global / room / project / RPG scopes
   - provenance
   - explicit cross-scope sharing
   - deletion verification
   - conflict correction
   - no silent leakage between workspaces

4. UI Simplification Pass ✅ COMPLETE (merged via PR #23, 2026-10-02)
   - progressive disclosure
   - reduce settings clutter
   - explain routing without exposing internal noise
   - clear Ready / Degraded / Blocked states
   - mobile-first touch and RTL review

5. Performance + Android Reliability ✅ COMPLETE (PR #24, Android run #285, 2026-10-02)
   - long-chat rendering
   - streaming DOM pressure
   - IndexedDB contention
   - keyboard/safe-area behavior
   - offline/network-loss recovery
   - background/foreground restoration
   - process-death recovery where platform support exists

### 2.2 — Deep Research Overhaul ✅ COMPLETE
Primary goal: turn Research into an auditable evidence workflow.

Question → Plan → Subquestions → Queries → Search → Read → Evidence → Gaps → Follow-up → Contradictions → Cited Report

Required:
- checkpoints and resume
- query/page/time budgets
- claim-to-source matrix
- freshness
- source provenance
- blocked-page handling
- contradiction resolution
- explicit uncertainty / INCONCLUSIVE
- exportable evidence bundle

### 2.3 — Coding + Self-Development Hardening
Primary goal: every repository mutation is inspectable, atomic, testable, and recoverable.

Understand → Plan → Diff → Apply → Test → Review → Commit/PR

Required:
- file hash / stale patch detection
- atomic multi-file application
- rollback
- CI tied to exact SHA
- resume without duplicate commits
- protected secret/test paths
- mobile diff review
- explicit BLOCKED/FAIL states

### 2.4 — RPG / World Continuity Polish
Primary goal: make World mode stateful rather than prompt-only.

Required:
- player agency lock
- canon vs improvisation
- character facts/relationships
- location/time/inventory state
- lorebook retrieval budget
- branch saves
- contradiction review
- rollback with world state and prose together

### 2.5 — Attachments + Capability Truth
Primary goal: Seven never implies understanding it does not have.

Every attachment reports one of:
- text extracted
- vision understood
- OCR understood
- metadata only
- unsupported

Image/OCR/audio are enabled only when a real provider or native capability is wired and tested.

### 2.6 — Design System Consolidation
Primary goal: stop CSS/DOM override accumulation.

Required:
- shared tokens
- one button/card/dialog system
- one responsive shell
- dark/light
- full RTL
- reduced motion
- 320/360/390/412px gates
- no important action below minimum touch target

## Cross-cutting release gates

A subsystem is not considered finished until:
1. executable implementation exists;
2. the normal user path invokes it;
3. failure/recovery behavior exists;
4. automated evidence covers the critical path;
5. Android/device-specific claims are not made without device evidence.

Routing, memory, research, coding, and world state must use runtime truth rather than UI state as authority.

## Immediate execution order

Current priority:
1. Model Intelligence v3 ✅ COMPLETE
2. Provider Health v2 ✅ COMPLETE
3. Memory Scope Hardening ✅ COMPLETE
4. UI Simplification ← NEXT
5. Android/Performance
6. Deep Research 2.0

The detailed execution specification for the current first item lives in:
`plans/MODEL_INTELLIGENCE_V3.md`

## Change log

- 2026-10-02: roadmap created; Model Intelligence v3 selected as first polish implementation.
- 2026-10-02: Model Intelligence v3 implemented, CI passed, and PR #20 merged to main as `454c72ecab333938cc642b5ba0e63d27efc00f3e`. Provider Health v2 is next.
- 2026-10-02: Provider Health v2 implemented, CI #2135 passed, and PR #21 merged to main as `cebd9f30d96b7dfaa23e0ff841bd7128f98f1233`. Memory Scope Hardening is next.

- 2026-10-02: Memory Scope Hardening implemented, CI #2143 passed, and PR #22 merged to main as `44bbd88b9b1ce0c69a328d1d500b4e405c381589`. UI Simplification is next.

- 2026-10-02: UI Simplification implemented, CI #2151 passed, and PR #23 merged to main as `a1bb2714721044dbb1db9afdfbbf9fe69728f12b`. Performance + Android Reliability is the final 2.1 polish stage.

- 2026-10-02: Performance + Android Reliability browser implementation passed CI #2161 and PR #24 merged to main as `7aae45341cea8b2b892f2ec0fdf5916892b29e2d`. Android main-branch release gate is pending before 2.1 is marked complete.

- 2026-10-02: Android main-branch release gate #285 PASSED for merge `7aae45341cea8b2b892f2ec0fdf5916892b29e2d`: pre-APK Seven gate, Android lint, unit tests, APK build, packaged APK verification, Android 16 WebView emulator smoke, final APK verification, and artifact upload all succeeded. Seven AI 2.1 Intelligence & Reliability Polish is COMPLETE. Deep Research 2.0 is next.

## Post-2.1 latency polish

### Deep Think Speed Polish ✅ COMPLETE

Purpose: reduce Send → final-answer latency without removing Deep Think's two-pass architecture or strongest supported reasoning effort.

Plan: `plans/DEEP_THINK_SPEED_POLISH.md`
Implementation PR: #25
Merge SHA: `f0e67e13731746e36483bb292202ebbdc0a7cc32`
Browser CI: #2173 PASS
Android release gate: #286 PASS.

- 2026-10-02: Deep Think Speed Polish completed after Android gate #286 passed, including Android lint, unit tests, APK build/verification, API 36 WebView emulator smoke, and artifact upload. Next: measured latency optimization before any hedging/cache work.

### Measured Latency Optimization v2 ✅ COMPLETE

- Plan: `plans/MEASURED_LATENCY_OPTIMIZATION_V2.md`
- PR #26
- Browser CI #2189 PASS
- Android APK #287 PASS
- Merge: `6a692353190f4d6c7c594bb6c3f872d64659cdd3`
- Deep Think now records bounded local p50/p90 timing data and uses it only for safe near-tie routing + route-aware timeouts.

### Web Search Overhaul v2 — ACTIVE FOCUS

Plan: `plans/WEB_SEARCH_OVERHAUL_V2.md`

Completed:
- Batch 1 — Multi-source retrieval ✅
- Batch 2 — General Web Gateway + Reader ✅
- Batch 3 — Evidence + Citations + Freshness ✅
- Batch 4 — Gap Analysis + Follow-up + Conflict Signals ✅
- Batch 5 — Performance Cache + Stage UI + Quality Evaluation ✅
  - PR #36
  - Browser #2281/#2282 PASS
  - Android #293 PASS
  - Merge `71b7d93fe1b89254266dc81c927c0950a97d2520`

- Batch 6 — Query Intelligence + Primary Source Discovery ✅
  - PR #37
  - Browser #2316 PASS
  - Android #294 PASS
  - Merge `d072bda179df394c4568bf86a9402f392d8c82eb`

Current: **Batch 7 — Deep Research Integration**.


- 2026-10-02: Deep Research 2.0 / Web Search v2 completed through Batch 7. Browser CI #2331 and Android APK #296 passed for `7fc0ac30d8ba4c67d3f44de96a1213ee0b1dcf9c`. Next roadmap stage: 2.3 Coding + Self-Development Hardening.
