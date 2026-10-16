# D30_AUTONOMOUS_QUALITY — Reality Lab / Evolution Arena / Constitution / Proof / Meta-Team

Research audit: READY

DOMAIN_ID=D30_AUTONOMOUS_QUALITY
SOURCE_ANALYSIS=SWE-bench [SOURCE primary] https://www.swebench.com/ sets reality-based software engineering eval bar. Playwright visual regression [SOURCE secondary] https://playwright.dev/docs/test-snapshots for UI determinism. OWASP MASVS [SOURCE primary] https://mas.owasp.org/MASVS/ for mobile appsec baseline (relevant if Android surfaces). OpenTelemetry semantic conventions [SOURCE primary] https://opentelemetry.io/docs/specs/semconv/ for telemetry/proof. Focus: reality lab, evolution arena, constitution/proof, meta-team. 
CURRENT=Autonomous quality (owners A08,B10,A10). Seven has .seven-team/autonomy (contracts, proof policy, judge rules, baselines, evaluator-plane). Must not modify these to make candidates pass. Proof-carrying work required. 
TARGET=Deterministic, evidence-based quality gates: invariant checks, proof artifacts, regression proof on every fix, adversarial evals, telemetry aligned to semconv. 
NOW=Inspect .seven-team/autonomy contracts, proof policy, judge rules, baselines. Understand reality lab/evolution arena setup. 
NEXT=Define evidence levels per change type, automate invariant checks where possible, integrate SWE-bench-style realism into tests, wire OTel spans for critical paths. 
LATER=Arena harness with reproducible runs, calibration across judges. 
TESTS=Deterministic regression tests (required), adversarial tests, proof validation, canary checks. 
RISKS=Drift between judge rules and reality, weak proof artifacts, modifying autonomy controls (forbidden). 
FIRST_SLICE=Autonomy map: catalog contracts, proof requirements, baselines; ensure every proposed change states invariants+evidence level+UNPROVEN. 
KNOWN_UNKNOWNS=Reality lab implementation, evaluator-plane controls, existing judge harness. 
DOMAIN_VERDICT=READY_FOR_PLAN (autonomy folder exists; clear guardrails)
