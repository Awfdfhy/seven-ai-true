# D30_AUTONOMOUS_QUALITY — Reality Lab / Evolution Arena / Constitution / Proof / Meta-Team

Research audit: READY

DOMAIN_ID=D30_AUTONOMOUS_QUALITY
SOURCE_ANALYSIS=Harvested 14 sources (13 primary). SWE-bench, Playwright visual comparisons, OWASP MASVS (Mobile App Security Verification Standard), OTel semantic conventions 1.44.0. 
Covers: autonomous quality (reality lab/evolution arena), constitution/proof/meta-team, security (MASVS), observability (OTel semconv), evals/visual. 
Disagreements: proof-carrying work is strict (invariants+evidence+UNPROVEN). Limitations: MASVS is mobile-focused; need to map to agent system. Harvest sufficient.

CURRENT=Seven has `.seven-team/autonomy/` (constitution/contracts/proof policy/judge rules/baselines/evaluator controls) — must not modify. `evolution/` dir, `eval/` dir present. Proof-carrying work required: state invariants touched, evidence level, remaining UNPROVEN. Product intelligence quality rubric for UI.

TARGET=Autonomous quality framework: reality lab (deterministic evals), evolution arena (safe evolution), proof-carrying changes (invariants + evidence + UNPROVEN), constitution compliance, security (MASVS relevant controls), observability (OTel semconv where applicable), meta-team quality gates.

NOW=Inspect `.seven-team/autonomy/` contracts (read key files), proof policy, judge rules, baselines. Map how quality is measured. Identify invariants per subsystem (arch ownership, no duplicate owners, secrets, release gates).

NEXT=Proof bundle format (invariants, evidence links/commands, commands run, findings, UNPROVEN), quality scorecard (release blockers, risks, evidence completeness), MASVS checklist mapped to agent/mobile context, OTel trace attributes for critical flows.

LATER=Evolution arena scoring with deterministic seeds, adversarial harness integration, quality gates in verify, automated UNPROVEN tracking.

TESTS=Contract tests enforcing invariants, proof bundle validation, security checks (secrets scan, policy), constitution compliance checks.

RISKS=Modifying autonomy controls (forbidden), weak proof (claiming proof without evidence), conflating build/installed evidence, aesthetic claims without runtime evidence.

FIRST_SLICE=Read autonomy contracts + proof policy; define proof bundle template for A08 work; add invariant checks to verify.cjs (e.g. no duplicate owners, secrets). Smallest enforceable quality slice.

KNOWN_UNKNOWNS=Exact proof policy text, judge rules, baselines values, evolution arena API. Need to inspect autonomy files.

DOMAIN_VERDICT=READY_FOR_PLAN
