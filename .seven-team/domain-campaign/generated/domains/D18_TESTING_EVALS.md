# D18_TESTING_EVALS — Testing / Evals / Mutation / Visual / Release Evidence

Research audit: READY

DOMAIN_ID=D18_TESTING_EVALS
SOURCE_ANALYSIS=Harvested 12 sources (10 primary). SWE-bench, BFCL V4 (Berkeley Function Calling), Playwright visual comparisons + emulation. 
Coverage: unit/contract/integration/E2E, visual regression, emulation (device/viewport), evals/leaderboards. 
Disagreements: snapshot flakiness (need deterministic env), emulation vs real devices. Limitations: leaderboards show aggregate; need domain-specific. Harvest sufficient.

CURRENT=Seven has node:test (`test`), custom `verify.cjs`, `runtime-smoke.cjs`, `eval/` dir, `evolution/` dir. Memory has results. Release artifacts present. 
Need to assess: test organization, coverage of critical paths, contract tests, E2E, visual (Playwright mentioned), mutation, release evidence. A08 owns testing/release assurance.

TARGET=Robust test pyramid: unit (fast, focused), contract (schemas/invariants), integration (cross-subsystem), E2E (journeys), smoke, adversarial, evals. Release evidence bundle (artifacts, hashes, verification logs). Deterministic, no weakened guards. Visual comparisons with stable baselines. 

NOW=Audit existing tests: run `node --test` to see current tests, inspect verify.cjs gates, runtime-smoke.cjs. Catalog what’s tested vs release blockers. Define release evidence schema.

NEXT=Contract test harness for critical invariants (arch ownership, permissions, memory, tools), focused test selector (affected files), snapshot stability (Playwright visual with fixed viewport/timezone), flake detection. Release evidence generation (sha256, logs).

LATER=Mutation testing, property-based tests for core logic, τ-bench/AgentDojo style eval integration, BFCL subset for tools, visual regression in CI-like env, Android device evidence separation.

TESTS=Deterministic unit/contract/integration, smoke, verify gates all green, visual with consistent env, adversarial. Release evidence must be reproducible.

RISKS=Flaky snapshots (fonts/animation), emulation drift, overloading verify, weakening tests. Android vs browser evidence confusion — must distinguish explicitly.

FIRST_SLICE=Run `node --test` and inspect results; strengthen verify.cjs with explicit release evidence checks (artifacts exist, hashes). Smallest improvement to release assurance.

KNOWN_UNKNOWNS=Current test count/pass, flake issues, visual baseline state, eval harness API. Need to run tests.

DOMAIN_VERDICT=READY_FOR_PLAN
