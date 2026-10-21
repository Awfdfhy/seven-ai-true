# D18_TESTING_EVALS — Testing / Evals / Mutation / Visual / Release Evidence

Research audit: READY

DOMAIN_ID=D18_TESTING_EVALS
SOURCE_ANALYSIS=Harvested 12 sources (10 primary). SWE-bench, BFCL, BrowseComp, Playwright visual comparisons/emulation. Strong emphasis on deterministic tests, snapshots, browser emulation, regression proof. Release evidence required.
CURRENT=Scripts: `verify.cjs`, `runtime-smoke.cjs`, `all.cjs`. `eval/` dir exists. HTML builds exist. Need to see test structure, coverage, gates.
TARGET=Layered gates: unit/contract/integration/E2E, mutation (where feasible), visual regression, browser evidence, Android build evidence, installed-device evidence. Proof-carrying: evidence level per change.
NOW=Read verify.cjs/runtime-smoke.cjs/all.cjs, list eval/, check package.json test scripts.
NEXT=Deterministic fixtures, snapshot baselines, flake tracking, evidence bundles.
LATER=Mutation testing, eval harness, regression dashboard, release gate policy.
TESTS=All layers + adversarial. Must distinguish browser/mock/Android build/installed-device evidence per rules.
RISKS=Flaky tests, weakened guards, missing release evidence, false PASS.
FIRST_SLICE=Map test inventory + gates; add evidence level tagging; enforce "no weaken tests" rule in checks.
KNOWN_UNKNOWNS=Actual test framework. Need to inspect files.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
