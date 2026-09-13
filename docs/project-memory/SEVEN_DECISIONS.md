# Seven AI — Decision Log

This file records durable project decisions and the reasoning behind them. Add new decisions instead of relying on chat history alone.

## D-001 — GitHub is the durable project memory
**Status:** Adopted

Seven project-memory documents in GitHub are the durable reference for roadmap, architecture, decisions and status. If chat memory conflicts with committed project-memory docs, prefer the newer explicit GitHub decision unless the user overrides it.

## D-002 — Preserve the existing application
**Status:** Adopted

Seven evolves through controlled layers and migrations. Mature systems should not be replaced casually. Large rewrites require a clear safety case and explicit approval.

## D-003 — Protect `seven_ai-final.html`
**Status:** Adopted

`seven_ai-final.html` is a protected source artifact. Release builds may read from it and inject generated release layers, but Beta work must not silently modify or replace it.

## D-004 — Verification beats appearance
**Status:** Adopted

A feature, action or release is not considered successful because it looks successful. Verify effects, persistence, source integrity and runtime state before declaring PASS.

## D-005 — Explicit epistemic states
**Status:** Adopted

Seven distinguishes FACT, CLAIM, INFERENCE, ASSUMPTION, UNKNOWN and CONFLICT. Missing canon/source evidence becomes CANON_GAP instead of fabricated certainty.

## D-006 — Authority never increases through derivation
**Status:** Adopted

Summaries, embeddings, consolidation, model repetition, tool echo and corroborating derived objects do not grant new authority or permissions. Action-sensitive permission memory must bind back to authoritative source events.

## D-007 — Selective compute
**Status:** Adopted

Strong models, retrieval, tools, deep reasoning and verification are selectively invoked based on task needs instead of running constantly.

## D-008 — Mobile weight is a product constraint
**Status:** Adopted

Performance is not just smoothness. Seven must minimize RAM, battery, storage, APK size and startup cost, using lazy loading and avoiding unnecessary background work and visual effects.

## D-009 — Beta UI is not Final UI
**Status:** Adopted

Beta UI exists to make current systems coherent, testable and premium enough for development. A later dedicated Final UI redesign may be substantially more ambitious once the identity and systems are frozen.

## D-010 — Adopt the curved ribbon Seven identity
**Status:** Adopted

The preferred Seven mark is a minimal curved/ribbon-like `7`. Its identity should survive app-icon scale, monochrome use, clothing/hardware placement and Day/Night themes without feeling like a generic AI logo.

The core visual language is:
- curves / ribbon continuity
- Seven Blue + Cyan family
- restrained light and shadow
- bright clean Day surfaces
- midnight/navy Night surfaces
- minimal effect usage

Avoid generic AI sparkle, brain, circuit, robot, infinity, shield, hexagon and crypto/game aesthetics as primary identity devices.

## D-011 — Day and Night share one identity
**Status:** Adopted

Day and Night are not separate brands. They retain the same geometry and hierarchy while adapting material, contrast and lighting. Day is airy and restrained; Night uses deeper navy surfaces and controlled blue luminance.

## D-012 — Aurora is semantic
**Status:** Adopted

Aurora communicates runtime state such as thinking, research, coding, RPG, success, warning and error. It must never imply authority or verification by appearance alone, and it must respect Reduced Motion and Lite tiers.

## D-013 — Real Works prioritizes canon fidelity without false 100% claims
**Status:** Adopted

The Real Works system should pursue maximum canon fidelity through source hierarchy, timelines, invariants, knowledge state and scene contracts. When evidence is incomplete or conflicting, Seven exposes uncertainty rather than inventing canon.

## D-014 — No arbitrary Seven-side usage caps
**Status:** Adopted

Seven itself should not impose artificial per-feature usage quotas. External model/provider/API limits may still apply and must be represented honestly.

## D-015 — Final screenshots must be real renders
**Status:** Adopted

When demonstrating implemented UI, use screenshots rendered from the actual verified release. Concept images or generated branding boards must be labeled as concepts and never presented as implementation screenshots.

## D-016 — Keep protected PRs unmerged until explicit approval
**Status:** Adopted

PR #15 (`seven-v4.2-hardening` → `main`) and PR #16 (`seven-beta-ui-v1` → `seven-v4.2-hardening`) stay unmerged until explicit approval.