# D09_DEEP_THINK — Deep Think / Planning / Verification / Progress

Research audit: READY

DOMAIN_ID=D09_DEEP_THINK
SOURCE_ANALYSIS=Harvested evidence is READY with 10 primary sources. BFCL and SWE-bench provide tool-calling/planning benchmark references; BrowseComp seed supports search/research grounding. Disagreement: benchmark scores reflect model capability, not Seven's orchestration quality. Limitation: harvested pages are mostly landing/CSS, not detailed methodology.
CURRENT=Seven has `remake/src/application/deep-think/deep-think-transport.ts` implementing planner+final two-stage flow, context budget checks, cancellation, streaming, and planning size limits. Tests exist in `phase6` and manager integration. Evidence level: code + tests.
TARGET=Deep Think with verified planning, cancellation safety, context capacity guards, progress events, and deterministic fallback to quick mode.
NOW=Add progress/cancellation diagnostics and tests for partial planner failure, context overflow, and aborted streams.
NEXT=Add verification pass and plan-size/token budget metrics; compare planning quality on SWE-bench-like tasks.
LATER=Multi-plan verification and tool-use planning.
TESTS=Adversarial tests for abort during planner/final, oversized plan, invalid chunks, empty plan; replay determinism.
RISKS=Long-running planner tasks; context overflow; partial output; cancellation races.
FIRST_SLICE=Progress events + abort regression tests.
KNOWN_UNKNOWNS=No benchmark comparison evidence; no Android streaming behavior proof.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
