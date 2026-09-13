# Seven Tool Fabric 2.0 — Deep Polish Master Queue

Date: 2026-09-13
Status: ACTIVE MASTER QUEUE
Prerequisite: `DISCOVERY_COVERAGE_AUDIT_03.md` = `SATURATED_FOR_BROAD_DISCOVERY`

## Purpose

This file is the durable execution queue after broad Tool Fabric discovery. It prevents random integration, duplicate work, and "we researched it so ship it" thinking.

A candidate or subsystem moves through:

`AUDIT CURRENT STATE → MAXIMUM EFFORT COMMAND → DEEP POLISH SPEC → IMPLEMENTATION PLAN → IMPLEMENT → TEST/EVAL → ACCEPT/REJECT/FREEZE`

Discovery evidence is input, not a shipping decision.

## Status vocabulary

- `NOT_STARTED`
- `COMMAND_READY`
- `SPEC_PROPOSED`
- `IMPLEMENTATION_READY`
- `IMPLEMENTING`
- `EVAL_PENDING`
- `BLOCKED`
- `ACCEPT_CORE`
- `ACCEPT_SPECIALIST`
- `ACCEPT_FALLBACK`
- `EXPERIMENTAL`
- `REJECT`
- `FROZEN_V1`

## Global rules

1. Inspect existing Seven implementation before proposing a rewrite.
2. Reuse mature architecture; merge responsibilities rather than duplicate them.
3. Every material Deep Polish step gets a context-specific Maximum Effort command.
4. Android startup/RAM/battery/storage/APK remain first-class acceptance gates.
5. No provider/library becomes canonical product architecture merely because it is convenient.
6. No PASS/FREEZE without falsifiable tests/evals.
7. No side-effect/security/authority weakening for integration convenience.
8. New dependency must earn its bundle/maintenance/security cost.
9. Prefer a smaller accepted stack over many overlapping "options".
10. Preserve command, spec, decisions, rejection rationale, evals and freeze result in GitHub.

## Phase A — Runtime foundations

| # | Target | Current state | Next gate |
|---|---|---|---|
| A01 | Canonical Tool Contract + SchemaGuard | `NOT_STARTED` | current-code audit + Deep Polish command/spec |
| A02 | ToolInteropGateway / MCP adapter | `SPEC_PROPOSED` | implementation plan + eval fixture; existing `MCP_ADAPTER_DEEP_POLISH_SPEC.md` |
| A03 | Canonical Tool Registry / capability normalization | `NOT_STARTED` | audit registry/tool plumbing |
| A04 | SQLite authoritative/local data plane | `NOT_STARTED` | persistence-binding audit + benchmark plan |
| A05 | PatchTransaction / jsdiff decision | `NOT_STARTED` | current coding-agent edit audit |
| A06 | Android SAF / FileGrant | `NOT_STARTED` | Capacitor/native bridge audit |
| A07 | CredentialVault / Android Keystore | `NOT_STARTED` | secret-storage audit |
| A08 | Tool Security Kernel + SideEffectLedger convergence | `FOUNDATION_EXISTS` | reconcile current hardening with discovered policy |

## Phase B — Intelligence execution

| # | Target | Current state | Next gate |
|---|---|---|---|
| B01 | ModelGateway / canonical model contracts | `NOT_STARTED` | provider implementation audit |
| B02 | CapabilityRegistry / provider evidence | `NOT_STARTED` | manifest schema + drift eval |
| B03 | Groq adapter | `FOUNDATION_EXISTS` | inspect current Groq request path |
| B04 | OpenAI/Gemini/Anthropic/OpenRouter adapters | `NOT_STARTED` | add only after gateway contract freezes |
| B05 | ModelEventStream / cancellation / TokenLedger | `NOT_STARTED` | streaming/cancel audit |
| B06 | HybridRetriever | `NOT_STARTED` | memory implementation audit |
| B07 | ContextCompiler / TokenBudgetEngine | `FOUNDATION_EXISTS` | current `hardening/context-compiler.cjs` re-audit |
| B08 | ResourceGovernor / Observability | `FOUNDATION_EXISTS` | reconcile current governor with Wave 13 design |
| B09 | Recovery / Migration / Export | `NOT_STARTED` | persistence/import audit |

## Phase C — Coding / research / action

| # | Target | Current state | Next gate |
|---|---|---|---|
| C01 | Tree-sitter CodeStructureEngine | `NOT_STARTED` | bundle/Wasm eval |
| C02 | ast-grep structural edit specialist | `NOT_STARTED` | host/bridge integration eval |
| C03 | CodeEvalSandbox / QuickJS | `NOT_STARTED` | worker/resource/security eval |
| C04 | ProjectRunner / host sandbox | `FOUNDATION_EXISTS` | current Coding Agent runtime audit |
| C05 | GitEngine | `FOUNDATION_EXISTS` | current GitHub/project behavior audit |
| C06 | DependencyAudit / ArtifactVerifier | `NOT_STARTED` | OSV/Sigstore adoption eval |
| C07 | SearchBroker / FetchExtractBroker | `FOUNDATION_EXISTS` | current web-search implementation audit |
| C08 | BrowserActionBroker / Playwright | `NOT_STARTED` | host-only token/perf/security eval |
| C09 | ResearchEvidencePlane | `FOUNDATION_EXISTS` | current Research runtime audit |
| C10 | Verification specialist toolchain | `FOUNDATION_EXISTS` | map current Evals/CI to Wave 08 |

## Phase D — Local intelligence / simulation

| # | Target | Current state | Next gate |
|---|---|---|---|
| D01 | LocalInferenceRuntime / ONNX | `NOT_STARTED` | target-device model set/size eval |
| D02 | OCRBroker | `FOUNDATION_EXISTS` | current vision/file path audit |
| D03 | SpeechBroker | `NOT_STARTED` | model quality/size/language eval |
| D04 | Local LLM / llama.cpp backend | `NOT_STARTED` | optional-pack device eval |
| D05 | WorldDiff / WorldValidator / replay RNG | `FOUNDATION_EXISTS` | current RPG engine audit |
| D06 | SourceLedger / CanonGraphTools | `FOUNDATION_EXISTS` | current Real Works implementation audit |

## Phase E — Capability expansion

| # | Target | Current state | Next gate |
|---|---|---|---|
| E01 | DataAnalysisEngine / TableSpec | `NOT_STARTED` | deterministic data contract |
| E02 | ChartSpec / renderer bakeoff | `NOT_STARTED` | Chart.js vs Plot vs Vega subset eval |
| E03 | MathEngine | `NOT_STARTED` | minimal local bundle + host fallback eval |
| E04 | GeoBroker / Weather | `NOT_STARTED` | provider/privacy/attribution eval |
| E05 | MapSpec / renderer | `NOT_STARTED` | MapLibre lazy/device eval |
| E06 | ArtifactProductionPlane | `NOT_STARTED` | PDF/DOCX/XLSX/media exporter eval |
| E07 | GenerativeMediaBroker | `NOT_STARTED` | provider-neutral image generation contract |
| E08 | Local image generation | `EXPERIMENTAL` | stable-diffusion.cpp target-device eval only after E07 |

## Existing Deep Polish work discovered

### MCP Adapter
Files already exist:
- `deep-polish/MCP_ADAPTER_MAXIMUM_EFFORT_COMMAND.md`
- `deep-polish/MCP_ADAPTER_DEEP_POLISH_SPEC.md`

Status: `SPEC_PROPOSED`, not implemented/frozen.

Do not duplicate these files. Continue from their implementation/eval gate.

## Immediate queue

1. **A01 Canonical Tool Contract + SchemaGuard**
2. A03 Canonical Tool Registry
3. A02 MCP implementation/eval gate
4. A04 SQLite data plane
5. A05 PatchTransaction
6. A06/A07 Android file + credential boundaries
7. A08 security/ledger convergence

Reason: the validation/identity/security substrate should freeze before dozens of provider/tool adapters are implemented.

## Deep Polish dossier minimum contents

Every target dossier should capture:
- current Seven implementation
- candidate comparison
- exact canonical interface
- invariants
- permissions/side effects
- schema/lineage
- lifecycle/cancellation
- error model
- recovery
- Android cost
- dependency/license/maintenance
- security threats
- observability
- eval matrix
- migration/integration plan
- rejection rationale
- freeze criteria

## Reprioritization rule

This queue may change order when a dependency relationship, real implementation blocker, security defect or measured eval result justifies it. Reordering must be recorded; do not silently jump to whatever library seems exciting.

## Exit condition

Tool Fabric Deep Polish is complete when every admitted P0/P1 boundary has a final classification and all components selected for Seven's target release are implemented, evaluated and frozen or explicitly blocked/deferred.

Then Tool Fabric feeds the first system-wide Ultimate Polish and later `SEVEN_SECOND_ULTIMATE_POLISH_PLAN.md`.
