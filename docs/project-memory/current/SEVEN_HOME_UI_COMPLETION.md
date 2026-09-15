# Seven Home UI Completion — September 2026

> **Status:** Implementation candidate on `seven-design-studio-v0`. This record describes the UI structure implemented in Seven Design Studio. It is not a claim that every underlying runtime capability is fully implemented.

## Goal

Complete Seven Home as the smallest practical Android-first surface that can reach the full Seven capability map without turning the Home screen into a dashboard.

The governing law remains:

**Intent first. Capability second. Architecture last.**

Home itself stays simple. Deep capability is progressively disclosed through the Universal Composer, Seven Orb / Command Center, Spaces, Library, You, and contextual task sheets.

## Implemented Home structure

1. Seven identity + Activity + You entry.
2. Readiness/greeting surface.
3. Universal Composer as the primary focal surface.
4. Exactly four specialist shortcuts: Research, Code, Create, World.
5. One consolidated `Now` surface for active work + continuation.
6. Bottom navigation: `Home | Spaces | 7 | Library | You`.
7. Seven Orb opens a search-first Command Center rather than a permanent feature grid.

## Universal Composer surfaces

The Composer now exposes:
- `+` sheet for Files, Photos, Camera, Scan, Web, Tools, Connections and Context.
- Auto execution selector with Auto / Fast / Balanced / Deep / Custom.
- Context sheet with Conversation, Memories, Current Space, Files, Pinned and Sources.
- Voice sheet.
- removable specialist-mode chips.
- Send / thinking state.
- semantic focus halo and restrained Aurora state treatment.

## Runtime/task UI states

The Home prototype includes UI for:
- Ready
- Thinking / working
- Researching
- Paused
- Stopped / cancellation requested
- Retry
- Waiting for permission
- Offline / provider unavailable
- `Cancelled · completion uncertain`
- Recovery available

These are presentation contracts. They do not manufacture runtime truth.

## Permissions / side effects

Protected actions use a just-in-time permission sheet. The UI communicates scoped authority such as `READ_REMOTE` and preserves the rule that model/tool output cannot grant itself permission.

## Full capability reachability

The Command Center is progressively disclosed and search-first. Current command groups cover:

### Ask
Chat, Search, Research, Files, Vision, Voice.

### Make
Image, Document, Presentation, App / Site, Structured output.

### Build
Code, Project actions, Tools, Automation, Data.

### World
RPG, Real Works, Canon, What-if, Titles.

### Use context
Spaces, Memory, Files, Pinned, Sources.

### System
Models, Compute, Permissions, Verification, Recovery, Evolution, System states.

### Data & knowledge
SQL/local data, Data analysis, Charts & tables, Math & science, Maps & weather, Structured data.

### Documents & media
PDF tools, DOCX/reports, Spreadsheets, Image generation, Image editing, Media transform, Archives.

### Automation & connections
APIs, Webhooks, Connected accounts, Mail, Calendar, Cloud files, Code hosting.

### Device & local
OCR/scanner, Speech, Local intelligence, Device actions, Notifications, Share.

### Tool Fabric
SchemaGuard, MCP tools, Fetch/extract, Browser actions.

### Trust & provenance
Artifact provenance, Content integrity, Import/export, Diagnostics.

This progressively exposes the practical user-facing reachability of the capability families in `CAPABILITY_REGISTRY.md`, including Tool Fabric 2.0 and the later data/media/device planes, while intentionally keeping implementation concepts such as authority derivation, schema hashes, idempotency internals, CI gates and release verification out of normal Home navigation.

## Placement rule for architecture-only capabilities

Not every capability family becomes a visible command. Some are cross-cutting infrastructure and surface only when meaningful:
- Truth / epistemic state → evidence/status UI when relevant.
- Lineage/provenance → source/artifact details.
- Idempotency/side-effect uncertainty → retry/cancel/action state.
- Resource Governor → automatic behavior + You/Performance.
- Observability/Evals → Expert/Diagnostics.
- CI/release gates and screenshot verification → development/release tooling, not end-user Home.
- GitHub Project Memory → project/development authority, not a consumer UI feature.

## Visual implementation principles

- Premium navy Night identity and cool off-white Day identity.
- polished Seven ribbon mark retained in Header and Seven Orb.
- 48px minimum core touch targets.
- 8px primary spacing rhythm.
- one dominant focal surface: Composer.
- semantic glow only, no decorative glow flood.
- asymmetric Seven Cut geometry on key surfaces.
- Day/Night, RTL, 320px, Lite and Reduced Motion support.
- no arbitrary usage-limit UI.
- no fake progress percentages.

## Implementation files

- `tools/seven-design-studio/home-launchpad-v4.js` — simplified authoritative launchpad contract.
- `tools/seven-design-studio/seven-mark-polish.js` — in-site Seven mark polish.
- `tools/seven-design-studio/home-completion-v5.js` — completed composer, sheets, states and interactions.
- `tools/seven-design-studio/home-capability-catalog-v1.js` — progressive reachability for the wider capability map.
- `tools/seven-design-studio/home-completion.test.cjs` — interaction/state/mobile coverage.
- `tools/seven-design-studio/home-capability-catalog.test.cjs` — extended capability-catalog coverage.

## Truth boundary

This closes the **Home UI design/prototype structure** only after its dedicated Studio CI is green. It does not claim that all runtime capabilities behind the visible routes are complete, provider-connected, device-certified, or release-certified.

Physical Android review remains valuable for final visual micro-polish, typography, spacing and real-device feel before Home is considered visually frozen.
