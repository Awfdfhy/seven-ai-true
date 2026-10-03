# Seven Remake V3 — Final Manager 11 + 12

## Phase 11 — AppKernel / Recovery / Observability

Final integration closes the normal-path ownership gap:

- `main.tsx` creates one `SevenRuntime`.
- `SevenRuntime` owns one TaskManager, ShellStore, ThemeService, DiagnosticsBuffer and AppKernel.
- AppKernel owns ThemeService lifecycle.
- React `App` receives the runtime and renders state/intents; it does not instantiate alternate runtime owners.
- Failed boot is renderable and retryable rather than leaving the document permanently inert.
- Diagnostics remain bounded and redact sensitive/content-bearing keys.

## Phase 12 — Release Assurance / Final Closure

The release runtime provides:

- deterministic payload manifests
- SHA-256 payload identity
- exact installed artifact identity comparison
- required gate aggregation
- PASS / FAIL / BLOCKED / INCONCLUSIVE semantics
- evidence-bearing completion records for all 12 phases

## Critical truth boundary

**12/12 implementation completion is not the same as installed-remake release readiness.**

The repository's existing `.github/workflows/android-apk.yml` packages/tests the legacy release path. It does not currently provide installed APK identity/smoke evidence for the TypeScript/Vite `remake/` artifact.

Therefore Final Manager treats the current real release state as:

`RELEASE_READY=INCONCLUSIVE`

until an actual remake Android packaging path produces:

1. Android bridge device round-trip evidence
2. built remake APK payload hash
3. installed payload identity match
4. installed remake smoke evidence

The release assurance code explicitly refuses to manufacture PASS when those proofs are absent.
