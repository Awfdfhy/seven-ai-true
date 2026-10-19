# D09_DEEP_THINK — Deep Think / Planning / Verification / Progress

Research audit: READY

DOMAIN_ID=D09_DEEP_THINK
SOURCE_ANALYSIS=BrowseComp (openai.com/index/browsecomp), Berkeley Function Calling Leaderboard V4 (gorilla.cs.berkeley.edu), SWE-bench (swebench.com) — all primary, harvest=READY. These are planning/verification/progress benchmarks for agentic deep thinking. No disagreement; limitation is they are evaluation leaderboards, not runtime orchestration specs, and SWE-bench page harvest included CSS/favicon noise (primary content confirmed).
CURRENT=`release/research-runtime.js` has claim-evidence matrix, freshness/stale detection, citation lock, and next-actions (gap/freshness/contradiction/citation/authority). `release/control-runtime.js` has task state machine (CREATED→PLANNING→EXECUTING→VERIFYING→COMMITTING→COMPLETED|BLOCKED|INCONCLUSIVE|FAILED|CANCELLED) with side effect ledger. No Deep Think two-pass orchestration service yet; no "exactly one leading system message after context shaping" invariant; no final-payload revalidation before provider dispatch.
TARGET=Deep Think as a service (not UI patch, per ARCHITECTURE §4): two-pass orchestration (plan → verify → dispatch), exactly one leading system message after final context shaping, final payload revalidated before provider dispatch, progress reporting tied to task state machine, verification depth scaled by tier (lite=1, balanced=2, full=3).
NOW=Implement Deep Think service wrapper around existing research verification: planning pass, verification pass, system-message invariant, payload revalidation gate, integration with control-runtime task states.
NEXT=Progress events per Deep Think phase, verification-depth by tier, contradiction-resolution surfacing to UI, BrowseComp/BFCL-aligned eval scenarios.
LATER=SWE-bench-style agentic task verification, automated planning-quality regression benchmarks, Android Deep Think latency evidence.
TESTS=Unit: exactly one system message in final payload, payload revalidation rejects malformed output, two-pass transitions (PLANNING→VERIFYING→COMMITTING), verification depth by tier, contradiction detection blocks commit, progress event sequence deterministic.
RISKS=Extra latency without user value; double system messages corrupting context; silent network-failure-to-"no-evidence" conversion (violates ARCHITECTURE §7); Deep Think running when tier=lite should skip/reduce.
FIRST_SLICE=Deep Think service with planning/verification passes + system-message invariant + payload revalidation gate; unit-tested against existing research-runtime verify().
KNOWN_UNKNOWNS=No live provider integration in repo; no benchmark harness wired; BrowseComp/SWE-bench not yet executed against Seven runtime.
DOMAIN_VERDICT=READY_FOR_PLAN
