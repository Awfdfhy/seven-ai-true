# D09_DEEP_THINK — Deep Think / Planning / Verification / Progress

Research audit: READY

DOMAIN_ID=D09_DEEP_THINK
SOURCE_ANALYSIS=Harvested BFCL (Berkeley Function Calling Leaderboard) and SWE-bench leaderboards. BFCL emphasizes tool/function calling correctness/robustness; SWE-bench emphasizes software engineering task solving with tests. Both are eval-driven. No Seven-specific Deep Think traces harvested.
CURRENT=ARCHITECTURE: Deep Think is "two-pass orchestration is a service, not a UI patch" with invariants: "exactly one leading system message after final context shaping" and "final payload is revalidated before provider dispatch". Ownership A09/B04.
TARGET=Deterministic planning/verification with traceable steps, tool-use correctness, revalidation guards, progress reporting, and eval-backed improvements.
NOW=Codify Deep Think invariant checks (single leading system message, payload revalidation) as runtime guards with tests; add trace logging.
NEXT=Integrate tool-calling validation (inspired by BFCL patterns), step verification, and cancellation integration with TaskManager.
LATER=Planning search with verification loops and SWE-bench-style regression tests.
TESTS=Invariant tests, payload revalidation tests, tool schema validation, cancellation during planning, and deterministic traces.
RISKS=Over-planning latency, prompt bloat, tool misuse. Guards must not be bypassable.
FIRST_SLICE=Enforce and test the two invariants as service guards; add trace events for planning/verification steps.
KNOWN_UNKNOWNS=Current two-pass implementation details, tool schemas, and eval coverage.
DOMAIN_VERDICT=READY_FOR_PLAN
