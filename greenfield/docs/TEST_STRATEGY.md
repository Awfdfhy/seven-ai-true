# Test Strategy

## Layers
- Static: format, lint, type checking, dependency/license checks, secret scanning.
- Unit: domain rules, schema validation, reducers, migrations, idempotency, provider parsers.
- Contract: mock and each real provider use the same request/response suite.
- Integration: repositories, save transactions, import/export, AI orchestration, cancellation.
- UI: navigation, async states, accessibility, RTL/LTR, keyboard, long text, responsive layouts.
- Platform: Android install/upgrade, lifecycle, SAF/document providers, permissions, offline transitions, force-stop/reopen.
- Release: reproducible build, dependency audit, secret scan, artifact checksum, supported-device smoke tests.

## Minimum adversarial cases
Malformed/empty AI response; invalid state mutation; duplicate submit; replayed event; late response after cancel; stale revision; wrong world ID; corrupt save; interrupted write; migration failure; oversized/malicious import; offline start; provider timeout; rate limit; mixed Arabic/English; very long narrative; process death and restore.

## Evidence requirements
For each test run record commit SHA, exact command, toolchain version, environment, exit code, passed/failed/skipped counts, and relevant artifact/log path. Distinguish not run from passed. Never invent test results. Flaky tests must be tracked and cannot silently count as a pass.
