# Seven AI 2.4.3 — Master Bug Report

**Target:** `Seven-AI-2.4.3-Zero-Key-Final(1).apk`  
**Wave:** Full Bug Hunt Wave 02  
**Agents:** 20/20 complete  
**Raw findings:** 174  
**Status:** Diagnostic synthesis only — production fixes have not started.

## Manager methodology

This file is the deduplicated manager view over the 20 source reports in `.seven-team/reports/bughunt/`.

Promotion rules:
- **CROSS-CONFIRMED**: two or more independent reports point at the same root cause or failure surface.
- **VERIFIED**: the report ties the finding to concrete inspected code/behavior.
- **STRONG**: code evidence is strong but the exact APK/runtime manifestation still needs one targeted check.
- **NEEDS_RUNTIME_TEST** findings are not promoted as confirmed defects unless another report independently verifies the same root cause.
- Absence-of-hardening claims that are not intrinsically defects (for example “no certificate pinning”) are not promoted without an explicit product requirement.
- Duplicate symptoms are mapped to one master root cause; source IDs remain as traceability.

## Consolidated priority ledger

### BLOCKER

| ID | Confidence | Consolidated root cause | Source findings |
|---|---|---|---|
| MBR-001 | VERIFIED | **Competing shell/UI runtime ownership.** Parallel shell/UI implementations can both own the same surfaces, creating divergent state and lifecycle behavior. | A04-001, A04-002 |
| MBR-002 | VERIFIED | **Android release assurance has no real native unit/bridge contract gate.** The release path can go green without exercising the core Android bridge contracts used by the APK. | A08-001 |
| MBR-003 | VERIFIED | **Control bridge boot is order-sensitive.** `SevenBridge` can boot before `SevenControl` exists and does not have a robust retry/backoff ownership model. | A10-001 |

### CRITICAL

| ID | Confidence | Consolidated root cause | Source findings |
|---|---|---|---|
| MBR-004 | CROSS-CONFIRMED | **Stop/cancel pipeline is internally broken.** The release patch references/assigns `stopRequested` inconsistently, diverges on Android abort behavior, and conflicts with the mobile-WebView cancellation policy. | A02-004, A09-001, A10-004, B01-001, B01-004, B06-005, B09-003, B10-001, B10-012 |
| MBR-005 | STRONG | **IndexedDB startup/upgrade failure can leave the full document inert.** Error paths do not restore interaction after `document.body.inert=true`. | A02-001 |
| MBR-006 | VERIFIED | **Legacy memory migration is not atomic.** A failure between old-state removal and new-state commit can cause durable memory loss. | A06-002 |
| MBR-007 | CROSS-CONFIRMED | **GitHub token refresh/expiry state is unreliable.** Token expiry/refresh persistence can leave Self-Dev disconnected after initial authorization. | A07-001, B06-001 |
| MBR-008 | VERIFIED | **Deep Think can emit a trailing `system` message into the provider request.** Providers that enforce role ordering can reject the final call. | B04-001 |
| MBR-009 | STRONG | **RPG/canon world state lacks a proven durable persistence boundary.** World session, canon session, branches and titles are kept in workspace memory with no inspected save/restore integration. | B05-001 |
| MBR-010 | VERIFIED | **Enter-to-send does not guard IME composition.** Arabic/mobile IME composition can be submitted prematurely. | A03-002 |
| MBR-011 | VERIFIED | **Composer auto-grow and keyboard/viewport resizing compete.** Two resize owners can fight during soft-keyboard changes. | A03-001 |
| MBR-012 | CROSS-CONFIRMED | **Theme scheduler can leak/race timers across preference changes and sleep/resume.** Multiple reports independently identify the same timer ownership problem. | A01-001, A09-004, B09-004 |
| MBR-013 | CROSS-CONFIRMED | **Attachment loader first-load state is race-prone and can cache failure.** Concurrent initial callers/rejected promise state can leave duplicate loads or a permanently failed loader. | A09-003, B09-001 |
| MBR-014 | VERIFIED | **Research citations do not carry enough temporal integrity metadata.** Freshness cannot be reliably distinguished from stale evidence. | B03-001 |
| MBR-015 | VERIFIED | **Persisted Android document URI lifecycle is not reliably released/maintained.** SAF permission state can outlive or fail across release/upgrade flows. | B02-001 |
| MBR-016 | VERIFIED | **Android motion/native bridge patch can replace global WebView behavior during navigation.** The replacement boundary is too broad and can destabilize active state. | A04-003 |
| MBR-017 | STRONG | **Test runner uses one global timeout rather than isolated suite budgets.** A hang masks which suite failed and can collapse regression diagnosis. | A08-002 |
| MBR-018 | NEEDS_RUNTIME_TEST | **Release artifact identity is verified statically but runtime equivalence is not gated.** The exact packaged payload is not behaviorally exercised as the release artifact. | A08-003 |

### HIGH

| ID | Confidence | Consolidated root cause | Source findings |
|---|---|---|---|
| MBR-019 | CROSS-CONFIRMED | **Mode picker and hidden toggle state can desynchronize.** Research/Think/Search UI can display a mode different from the state read by the runtime. | A05-001, B04-005, B10-005 |
| MBR-020 | VERIFIED | **Concurrent send calls can append duplicate user messages.** Send is not fully serialized/idempotent. | B01-002 |
| MBR-021 | CROSS-CONFIRMED | **MutationObserver/workspace observers are not consistently owned/teardown-safe.** Re-entry/room switching can retain duplicate observers and repeated work. | A04-004, A09-002, B09-005, B10-008 |
| MBR-022 | CROSS-CONFIRMED | **Attachment send wrapping is not stable under re-patching/errors.** Wrappers can be duplicated and attachment state can be cleared on failed sends. | B01-003, B09-002 |
| MBR-023 | CROSS-CONFIRMED | **Main shell RTL behavior is incomplete.** Sidebar/shell surfaces can remain LTR or position incorrectly after language changes. | A01-003, A03-003 |
| MBR-024 | STRONG | **Android background/process death can outrun queued room persistence.** No inspected lifecycle flush closes the durability race. | A02-002 |
| MBR-025 | CROSS-CONFIRMED | **Context/token budgeting is inconsistent across layers.** Deep Think, control bridge and multilingual token estimation use mismatched budgets/estimators, risking overflow or unnecessary truncation. | A06-003, A09-006, A10-006, B04-003 |
| MBR-026 | VERIFIED | **Provider model discovery has no timeout/cancellation boundary.** One hung discovery endpoint can stall the full catalog refresh. | B07-002 |
| MBR-027 | VERIFIED | **Legacy WebView timeout fallback does not cancel the underlying fetch and emits an untyped timeout.** Late/orphan network work can continue after Seven has failed the request. | B07-001 |
| MBR-028 | STRONG | **Sequential free-provider fallback has no global wall-clock budget.** Up to eight candidates can accumulate multi-minute latency on degraded networks. | B07-004 |
| MBR-029 | STRONG | **Zero-Key provider availability can depend on globals that are not ready at cold start.** Model/provider UI may report no usable route until later initialization. | A05-002 |
| MBR-030 | STRONG | **GitHub native API path policy can block legitimate repo-development endpoints.** Self-Dev operations fail despite valid authentication. | B06-002 |
| MBR-031 | VERIFIED | **GitHub Self-Dev panel can fail to mount in the Android release path.** The coding workspace can expose a dead/empty GitHub surface. | B06-003 |
| MBR-032 | STRONG | **GitHub search cache lacks freshness invalidation.** Stale code/search snippets can survive without TTL/etag revalidation. | B03-002 |
| MBR-033 | VERIFIED | **RPG `snapshot()` exposes live mutable canonical session references.** Adjacent code can mutate state around verification-gated APIs. | B05-002 |
| MBR-034 | VERIFIED | **Loading a new RPG world/canon pack destructively replaces active state without a dirty-state transaction.** | B05-003 |
| MBR-035 | VERIFIED | **Execution checkpoint restore lacks integrity validation.** Corrupted/stale checkpoints can be promoted back into active run state. | A06-005 |
| MBR-036 | CROSS-CONFIRMED | **Attachment/file ingestion lacks a unified hard size budget.** Oversized inputs can create memory pressure or WebView failure. | B02-006, B10-003 |
| MBR-037 | STRONG | **Attachment type validation is too dependent on declared metadata.** MIME/content mismatch is not strongly rejected before downstream processing. | B02-002 |
| MBR-038 | VERIFIED | **Deep Think performance state is module-global and can be attributed to the wrong room/request.** | B04-002 |
| MBR-039 | VERIFIED | **Canon debt threshold arithmetic is vulnerable to floating-point boundary drift.** A threshold intended at 1.0 can be missed. | B10-002 |
| MBR-040 | NEEDS_RUNTIME_TEST | **Workspace bundle dependency order is lexical rather than dependency-declared.** A dependent workspace may execute before its hub/runtime on some release paths. | A10-003 |
| MBR-041 | STRONG | **Browser regression coverage is desktop-Chromium-centric.** Android WebView-specific failures can ship without equivalent browser/device coverage. | A08-005 |
| MBR-042 | VERIFIED | **Main regression suite is not enforced as a required merge status.** A known regression can still merge when the check is not required. | A08-006 |
| MBR-043 | VERIFIED | **Agent smoke workflows share enough mutable infrastructure to permit cross-run contamination.** Concurrent agent validation can become nondeterministic. | A08-004 |

### MEDIUM

| ID | Confidence | Consolidated root cause | Source findings |
|---|---|---|---|
| MBR-044 | STRONG | **Changing mode does not reliably cancel work started under the previous mode.** Old-mode results can arrive after UI state changed. | A05-004 |
| MBR-045 | CROSS-CONFIRMED | **Attachment menu/build lifecycle is not fully idempotent.** Re-entry can duplicate handlers/state transitions and produce focus/menu races. | A04-005, A10-009, B09-008 |
| MBR-046 | STRONG | **Provider discovery failures bypass the provider health/cooldown system.** 429/5xx discovery endpoints can be hit repeatedly. | B07-003 |
| MBR-047 | VERIFIED | **RPG title numbering uses count rather than numeric identity.** Duplicate episode/chapter numbers with different names are possible. | B05-004 |
| MBR-048 | STRONG | **RPG JSON pack ingestion has no explicit byte/depth budget.** Large local packs can block the main thread. | B05-005 |
| MBR-049 | STRONG | **Import/export compatibility lacks a sufficiently explicit schema migration guard in the audited path.** | B02-004 |
| MBR-050 | VERIFIED | **Search/citation normalization uses inconsistent URL field shapes.** A bridge key mismatch can silently drop citation URLs. | B03-004 |
| MBR-051 | STRONG | **Native web-search failures can collapse 429/5xx into empty results.** Research may continue as if no evidence exists. | B03-005 |
| MBR-052 | VERIFIED | **Execution checkpoints can grow storage without an effective retention bound.** | A06-004 |
| MBR-053 | STRONG | **Control bridge tier/budget updates are not atomic.** Concurrent resource synchronization can combine stale tier and budget values. | B09-006 |
| MBR-054 | CROSS-CONFIRMED | **Reduced-motion/theme transition ownership overlaps between CSS/JS/native layers.** Motion may be double-applied or inconsistent. | A01-006, A04-009 |
| MBR-055 | VERIFIED | **GitHub job logs are silently truncated, which can hide the actual failure tail/context.** | B06-004 |
| MBR-056 | VERIFIED | **Canon branching accepts `forceBranch` only as strict boolean true.** Serialized/string truthy values can be ignored unexpectedly. | A10-010 |

### LOW

| ID | Confidence | Consolidated root cause | Source findings |
|---|---|---|---|
| MBR-057 | CROSS-CONFIRMED | **Localization/accessibility debt remains in secondary controls.** Hard-coded English/bilingual strings and incomplete ARIA state exist across attachment, regenerate, provider and Think controls. | A01-007, A03-007, A05-007, B04-007, B10-010 |
| MBR-058 | CROSS-CONFIRMED | **“Online” reliability state represents link state, not end-to-end reachability.** Captive portal/broken DNS can be presented as online. | A02-005, B07-006 |
| MBR-059 | VERIFIED | **Route-exhausted errors discard useful safe retry timing.** Retry-After/cooldown exists internally but is not carried into the final user-facing failure. | B07-005 |
| MBR-060 | VERIFIED | **RPG copy-button observer rescans the complete chat on each subtree mutation.** Long RPG histories create avoidable DOM work. | B05-006 |

## Validation queue — do not treat as confirmed until targeted runtime proof

These findings remain valuable test targets, but the current evidence is not strong enough to count them as confirmed master defects:

- **A01-010** launcher monochrome asset packaging.
- **A02-003** native Capacitor resume/app-state wiring.
- **A05-003** manual model pin vs fallback ordering.
- **A05-005** free-provider model-chip click behavior.
- **A07-002** AES-GCM IV concern: the cited report explicitly lacked the full encryption path needed to prove IV misuse.
- **A07-005** GitHub device-flow polling interval behavior.
- **A07-010** Android animation-scale API behavior on restricted versions.
- **A08-009** web/native bridge contract mismatch needs an APK/device test.
- **B01-005** room switching while generation is active.
- **B01-006** streaming timeout/retry translation.
- **B02-003** PDF.js worker/CSP behavior in the packaged WebView.
- **B02-005** legacy Android SAF persist flags.
- **B02-008** password-protected PDF UX.
- **B03-003** research evidence DOM linkage.
- **B03-006** citation deduplication in final synthesis.
- **B06-006** native execution bridge availability on release device.
- **B06-009** workspace switch during active GitHub native call.
- **B10-004** cold-start theme/logo race.
- **B10-008** observer teardown manifestation after SPA/workspace navigation.
- **B10-011** logo behavior on visibility restoration.

## Findings deliberately not promoted

The manager rejected or downgraded claims where the report did not prove an actual defect:

- **A07-004 — “no certificate pinning”** is not automatically a vulnerability; normal platform TLS validation is acceptable unless Seven explicitly requires pinning.
- **B02-007 — browser export path traversal** is not established merely from a download filename; normal browser download sandboxing/path sanitization changes the threat model.
- Security/configuration claims that infer missing Android manifest settings without inspecting the exact packaged manifest are not counted.
- “No sessionStorage” by itself is not evidence of session-loss; persistence bugs require a concrete lost-state path.
- Absence-only claims are retained in their source agent reports for future verification but are not counted as master root causes.

## Cross-agent convergence

The strongest clusters are the ones independently rediscovered by multiple agents:

1. **Stop/cancel** — 9 source findings converge on one broken cancellation root.
2. **Theme scheduling** — UI, performance and concurrency agents independently found timer ownership/race problems.
3. **Observer lifecycle** — architecture, performance and concurrency reviews all found teardown/idempotency gaps.
4. **Mode state** — model-routing, Deep Think and holistic reviews converge on toggle/picker desynchronization.
5. **Context budgeting** — memory, performance, holistic and Deep Think reviews converge on inconsistent token/resource budgets.
6. **Attachment lifecycle** — chat, architecture and concurrency reviews converge on wrapper/handler/load-state ownership problems.
7. **GitHub auth** — security and coding agents converge on token refresh/expiry handling.
8. **RTL shell** — UI and localization agents independently identify shell/sidebar RTL gaps.
9. **Network fallback** — timeout, discovery and global-deadline issues form one broader resilience family, split above because each has a distinct fix/test.

## Recommended repair order

Do not fix all 60 roots at once. The safe order is:

1. **Release/runtime ownership blockers:** MBR-001 → MBR-003.
2. **User-data and control integrity:** MBR-004 → MBR-013.
3. **Android/network/provider reliability:** MBR-015, MBR-016, MBR-024, MBR-026 → MBR-029.
4. **Core mode/context/runtime correctness:** MBR-019, MBR-025, MBR-038, MBR-039.
5. **Attachments + RPG durability:** MBR-013, MBR-022, MBR-033 → MBR-037, MBR-047, MBR-048.
6. **Research/GitHub correctness:** MBR-007, MBR-014, MBR-030 → MBR-032, MBR-050, MBR-051, MBR-055.
7. **Release assurance:** MBR-017, MBR-018, MBR-040 → MBR-043.
8. **Polish/secondary debt:** MBR-044 → MBR-060.
9. Run the **Validation Queue** as device/runtime experiments; promote only reproduced items.

Each repair batch should include: failing regression first, minimal fix, focused tests, then full Seven test suite + Android audit before the next batch.

## Source report inventory

All 20 reports are retained under `.seven-team/reports/bughunt/`:

`A01 A02 A03 A04 A05 A06 A07 A08 A09 A10 B01 B02 B03 B04 B05 B06 B07 B08 B09 B10`

The 174 raw findings remain traceable there. This Master Report is the authoritative deduplicated priority ledger; raw finding count must **not** be interpreted as 174 independent production bugs.

MASTER_BUGHUNT=COMPLETE
