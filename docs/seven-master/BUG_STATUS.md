# Seven AI — Bug Status Reconciliation

Date: 2026-10-05

Status meanings:
- **FIXED** — implementation changed and a regression/static/device gate exists.
- **STALE / NOT REPRODUCED** — the audited implementation no longer exists or the report assumption is false in current main.
- **PARTIAL** — material mitigation exists but the entire claimed boundary is not yet acceptance-proven.
- **OPEN** — reproducible/architectural gap remains.
- **EXTERNAL GATE** — requires repository/platform administration unavailable to the current GitHub integration.

| ID | Current status | Integration disposition |
|---|---|---|
| MBR-001 | PARTIAL | Multiple shell layers remain; shipped ownership is tested but not fully consolidated. |
| MBR-002 | PARTIAL | Android instrumentation now exercises SevenPlatform/Keystore; closure requires latest API34/API36 green run. |
| MBR-003 | FIXED | Control bridge has bounded retry/backoff plus late-runtime test. |
| MBR-004 | FIXED for current single-generation design | Abort unified; room/mode switch cancellation and wrong-room stop are regression-tested. Legacy no-Abort fetch remains separately MBR-027. |
| MBR-005 | FIXED | IndexedDB startup failure restores interactive recovery UI while writes remain fail-closed. |
| MBR-006 | STALE / NOT REPRODUCED | Current migration retains legacy keys; injected failed-write regression proves preservation. |
| MBR-007 | FIXED | Native GitHub access/refresh expiry is validated and stale credentials are cleared. |
| MBR-008 | FIXED | Deep Think brief is merged into leading system context, never appended as trailing system. |
| MBR-009 | PARTIAL | Versioned RPG session manager, quarantine and 1006-event restart harness exist; legacy live workspace is not yet unified with it. |
| MBR-010 | FIXED | Explicit composition lifecycle + keyCode 229 guard; automated IME regression passes. |
| MBR-011 | FIXED | Inline textarea auto-grow owner removed; shell owns resize. |
| MBR-012 | STALE / FIXED IN CURRENT CODE | Theme scheduling clears the existing timer before reschedule. |
| MBR-013 | FIXED | Attachment loader clears rejected state and removes stale script so retries work. |
| MBR-014 | FIXED | Citation locks now preserve retrievedAt/publishedAt/contentHash. |
| MBR-015 | PARTIAL | SAF release hardening exists; final Android lifecycle evidence still required. |
| MBR-016 | OPEN | Broad Android motion/native navigation ownership still requires focused lifecycle validation. |
| MBR-017 | STALE / NOT REPRODUCED | all.cjs gives every suite its own timeout/process. |
| MBR-018 | PARTIAL | Packaged WebView is exercised by Android instrumentation; final latest-SHA device run pending. |
| MBR-019 | FIXED | SevenModeState is canonical; mode picker no longer derives truth from CSS toggles. |
| MBR-020 | FIXED | sendMessageLocked serialization plus Android double-send test. |
| MBR-021 | PARTIAL | Major observers disconnect before rebind; full observer ownership consolidation remains. |
| MBR-022 | PARTIAL | Attachment loader/lifecycle hardened; full failed-send attachment retention E2E remains. |
| MBR-023 | PARTIAL | RTL/mobile regressions and Android visual evidence exist; complete shell directional audit remains. |
| MBR-024 | OPEN | Process-death durability during a queued room save remains an Android lifecycle gap. |
| MBR-025 | PARTIAL | Controller multilingual estimator and selected-model context budget fixed; legacy estimators still need convergence. |
| MBR-026 | FIXED | Provider discovery has an 8s typed timeout boundary. |
| MBR-027 | PARTIAL | No-AbortController path emits typed timeout and late results are quarantined by request state, but the underlying legacy fetch cannot be physically aborted. |
| MBR-028 | FIXED | Fallback has global request deadline and fair-share per-attempt budgets. |
| MBR-029 | PARTIAL | Current zero-key boot path is exercised by release/device tests; cold-start race closure depends on latest Android green run. |
| MBR-030 | FIXED | Native GitHub boundary allows exact repository subpaths and rejects prefix-lookalike repositories/admin endpoints. |
| MBR-031 | PARTIAL | Self-Dev panel has explicit mount path and Android visual test; final device evidence pending. |
| MBR-032 | STALE / NOT REPRODUCED | The reported seven.github.search.cache/searchGitHub implementation is absent from current Self-Dev path. |
| MBR-033 | FIXED | RPG snapshot returns deep clone. |
| MBR-034 | FIXED | World/canon engines are constructed before active state replacement; pack validation is fail-closed. |
| MBR-035 | FIXED | Checkpoint v2 identity/digest validation rejects corruption. |
| MBR-036 | FIXED | Unified 25MB/file and 50MB total attachment budgets. |
| MBR-037 | PARTIAL | Declared MIME vs extension mismatch is rejected; deep magic-byte sniffing is not universal. |
| MBR-038 | FIXED | Deep Think telemetry is request-object scoped. |
| MBR-039 | FIXED | Canon threshold uses epsilon-tolerant boundary. |
| MBR-040 | FIXED | Workspace hub declares and loads RPG dependencies before workspace runtime. |
| MBR-041 | PARTIAL | CI contains Android 14 and Android 16 WebView suites; latest SHA still must pass. |
| MBR-042 | EXTERNAL GATE | Repository rulesets are empty; branch-protection endpoint is inaccessible to current GitHub App. Required-status enforcement cannot be proven or changed here. |
| MBR-043 | OPEN | Agent workflow mutable-infrastructure isolation is not fully proven. |
| MBR-044 | FIXED | Changing response mode cancels active old-mode work first; idempotent same-mode set does not cancel. |
| MBR-045 | PARTIAL | Attachment loader/menu re-entry is guarded; exhaustive focus/race matrix remains. |
| MBR-046 | FIXED | Discovery success/failure now updates provider-wide health/cooldown. |
| MBR-047 | FIXED | RPG numbering uses max numeric identity + 1. |
| MBR-048 | FIXED | RPG JSON packs cap bytes, nesting depth and object-node complexity. |
| MBR-049 | STALE / FIXED IN CURRENT CODE | Canonical backup v2 validates format/schema/runs/memory and fails atomically. |
| MBR-050 | STALE / NOT REPRODUCED | Reported url→link bridge mismatch is absent from current execution bridge. |
| MBR-051 | STALE / NOT REPRODUCED | Reported native-bridge webSearch path is absent from current search architecture; current gateway exposes failures. |
| MBR-052 | FIXED | Execution checkpoints are bounded to retained v2 checkpoints. |
| MBR-053 | STALE / NOT REPRODUCED | Control sync has no await/interleaving boundary between tier and budget assignment. |
| MBR-054 | PARTIAL | Reduced-motion paths are tested, but full CSS/JS/native ownership consolidation remains. |
| MBR-055 | FIXED | Native GitHub logs no longer silently cut to 180KB; 2MB cap is explicit with truncated flag. |
| MBR-056 | FIXED | forceBranch accepts boolean or serialized "true". |
| MBR-057 | PARTIAL | Major controls localized/ARIA-tested; secondary-control debt remains. |
| MBR-058 | FIXED | Reliability now reports link-online separately from provider reachability evidence. |
| MBR-059 | FIXED | Exhausted route error carries the soonest safe retryAfterMs into user guidance. |
| MBR-060 | FIXED | RPG copy observer processes only added nodes after initial scan. |

## Acceptance-impacting open items
The remaining release-level blockers are not hidden: MBR-009 live RPG state unification, MBR-024 Android process-death persistence, MBR-042 required-status repository enforcement, MBR-043 workflow isolation, and final Android/API34/API36 evidence. PARTIAL UI/lifecycle items remain regression debt and must not be called zero bugs.
