# Risk Register

| ID | Risk | Severity | Mitigation / evidence required | Status |
|---|---|---|---|---|
| R-001 | Scope expands before a playable core exists | High | Enforce MVP-0 and milestone gates | Open |
| R-002 | Model prose mutates game state | Critical | Typed proposals, deterministic validator, adversarial tests | Open |
| R-003 | Save corruption or migration loses worlds | Critical | Versioning, atomic writes, backup, restore and fault injection | Open |
| R-004 | Character learns facts they did not observe | High | World/character-scoped retrieval and knowledge tests | Open |
| R-005 | API keys leak into app or logs | Critical | Secret scanning, secure boundary, sanitized telemetry | Open |
| R-006 | RTL is patched late and breaks layout | High | RTL/LTR from design-system stage; golden tests | Open |
| R-007 | Android SAF/lifecycle differs from web tests | High | Target API matrix and emulator/device gates | Open |
| R-008 | Agent reports unrun tests as successful | High | Evidence template, command logs, independent verification | Open |
| R-009 | Dependencies create lock-in or license problems | Medium/High | ADR, health/license review, minimal dependencies | Open |
| R-010 | Staging branch mistaken for new repository | Medium | Clear status and separate-repo creation gate | Open |
