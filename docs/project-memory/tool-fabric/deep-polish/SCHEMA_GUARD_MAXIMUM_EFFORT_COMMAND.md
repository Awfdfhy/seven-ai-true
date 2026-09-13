# Seven Tool Fabric 2.0 — SchemaGuard Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE DEEP POLISH CONTRACT
Target: A01 Canonical Tool Contract + SchemaGuard

## SEVEN MAXIMUM EFFORT — SCHEMAGUARD / CANONICAL TOOL CONTRACT

Goal: design and implement Seven's smallest trustworthy validation boundary for tool/model/import/generated-UI contracts while preserving JSON Schema interoperability and the Android startup budget.

Inspect existing Seven code first. Preserve TaskContract, Truth Fabric, SideEffectLedger and existing Tool Fabric schema/risk/permission foundations. Do not create a competing authority system.

Research/verify:
- JSON Schema Draft 2020-12 core/validation/output semantics
- Ajv 2020-12 support, strict mode, standalone code generation and data-mutating options
- external dynamic schemas from MCP/OpenAPI/providers
- build-time/precompiled validation versus runtime compilation
- browser CSP/startup implications
- schema/data denial-of-service limits
- schema identity/hash/version/dialect
- normalized issue/error representation
- mutation/coercion/default-insertion risks
- format annotation versus semantic/business validation

Required architecture principles:
1. `SchemaGuard` owns the validation boundary, not a third-party validator.
2. Seven-owned stable schemas should prefer build-time generated/standalone validator functions.
3. dynamic external schemas may use a lazily loaded standards-compliant compiler/validator adapter when required.
4. runtime validation must not mutate input by default.
5. schema validation never grants permission, authority, truth or successful side-effect state.
6. unknown/unsupported required dialect/vocabulary must fail closed at sensitive boundaries.
7. schema id/hash/dialect and validator version remain evidence.
8. data/schema complexity limits apply before or during validation.
9. validation output is normalized so Ajv/provider/MCP/OpenAPI differences do not leak into product logic.
10. startup path receives no heavy validator dependency unless measured and justified.

Canonical outputs must distinguish:
- `VALID`
- `INVALID`
- `SCHEMA_UNSUPPORTED`
- `LIMIT_EXCEEDED`
- `VALIDATOR_ERROR`

Required deliverables:
- current-state audit
- accepted dependency/runtime strategy
- canonical schema registration descriptor
- canonical `ValidationResult`
- preflight complexity limits
- mutation protections
- external/dynamic schema strategy
- zero-dependency runtime boundary implementation where practical
- unit tests including adversarial/limit cases
- release wiring plan that respects startup budget
- final classification and freeze criteria

Do not modify `seven_ai-final.html`, delete files or merge protected branches. No PASS/FREEZE without executable tests and integration evidence.