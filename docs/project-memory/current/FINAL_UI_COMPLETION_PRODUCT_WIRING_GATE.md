# Seven AI — Final UI Completion & Product Wiring Gate

Status: `REQUIRED_BEFORE_FINAL_E2E`
Branch: `ultimate-polish-v1`

## Product-owner directive
Final Seven must not ship with release-relevant capabilities that exist only behind the scenes, require hidden/manual invocation, or expose decorative UI that is not wired to the real runtime.

A dedicated **Final UI Completion & Product Wiring** stage is mandatory before the final End-to-End Capability Verification gate.

## Core rule
`CAPABILITY_REGISTRY → APPROPRIATE_UI_ENTRY_POINT → REAL_RUNTIME_WIRING → REQUIRED_USER_STATES → E2E_PROOF`

Every release-relevant capability that requires user interaction must have an appropriate discoverable interaction surface. This does **not** require a separate screen for every internal primitive. The UI should use the simplest correct surface: screen, workspace, sheet, menu, inline action, contextual control, generated UI, or conversation-native interaction.

## Required coverage
The final mapping must cover all user-facing release capabilities, including where applicable:
- Chat and conversations
- Model/provider controls and routing surfaces that are legitimately user-facing
- Memory and Context Workspace
- Tools and permission/side-effect confirmation surfaces
- Files and Projects
- Search / Retrieval
- Vision / image input
- Coding Agent
- Research
- RPG / Real Works
- Generated UI
- Sessions and persistence
- Stop / Continue / Retry / cancellation and recovery
- Settings and relevant resource/performance controls
- Android-specific interaction surfaces
- Any additional release-relevant capability present in the canonical Capability Registry

## State completeness
Each user-facing capability must expose the states that genuinely apply to it, including as appropriate:
- idle / ready
- loading / running / streaming
- success / completed
- empty
- error / degraded
- retry / recovery
- cancel / stopped
- permission / confirmation
- offline / network unavailable
- provider unavailable / rate or service failure
- unsupported / unavailable capability

States must reflect real runtime truth. UI must not imply completion, permission, evidence, canon commitment, or successful side effects when the authoritative runtime has not established them.

## Product quality requirements
- No dead buttons, fake controls, placeholder-only release paths, or hidden mandatory manual setup.
- No duplicated screens when a simpler contextual surface is sufficient.
- Preserve Seven's premium visual identity and coherent interaction language.
- Preserve Arabic/RTL, accessibility, Reduced Motion, Day/Night, touch targets, and responsive behavior.
- Preserve Android-first resource discipline: low startup cost, low RAM/battery/storage impact, lazy-load heavy workspaces, and no unnecessary background work.
- UI presentation cannot elevate authority. Memory, tools, evidence, permissions, side effects, and RPG canon/world commits remain governed by their authoritative runtimes.

## Completion evidence
Before this gate may PASS, the canonical Capability Registry must be audited against the actual product and every release-relevant user-facing capability must be classified with:
1. its real UI entry point,
2. its real runtime binding,
3. applicable user states,
4. accessibility/RTL/mobile behavior,
5. automated or device-verifiable evidence,
6. any intentionally internal/non-user-facing rationale.

Any missing release-critical entry point, dead wiring, false state, or mandatory hidden/manual path blocks this gate.

## Ordering before Final Seven
`Remaining implementation → Final UI Completion & Product Wiring → End-to-End Capability Verification → Final Red Team → Repair + regression reruns → Android release/device QA → exact Release Candidate → Final Verification → Final Seven`

This document complements `FINAL_END_TO_END_VERIFICATION_GATE.md` and is a mandatory predecessor to it.

Protected `seven_ai-final.html` remains untouched by this documentation change. No merge to `main` is authorized by this directive.