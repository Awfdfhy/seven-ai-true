# Seven Domain Research Standard

Every domain research report is an engineering deliverable, not a brainstorm.

## Required sequence

1. Inspect Seven's current implementation and exact runtime path.
2. Search the public internet broadly. Use the seeded sources only as a starting point.
3. Prefer primary/official sources and current research.
4. Compare at least two external approaches when the domain has competing architectures.
5. Record concrete lessons, not link dumps.
6. Identify failure modes, abuse/security cases, mobile constraints, Arabic/RTL impact and performance costs where relevant.
7. Define a target architecture for Seven.
8. Produce a phased roadmap: NOW / NEXT / LATER.
9. Define deterministic acceptance tests and runtime evidence.
10. Recommend the smallest high-value implementation slice for this cycle.
11. State what remains unknown.

## Source format

For each domain, use lines like:

[SOURCE primary] https://example.com — exact lesson and why it applies to Seven
[SOURCE secondary] https://example.com — pain point / comparison / implementation detail

A URL without a lesson does not count as useful research.

## Minimum evidence

Use the domain's sourceTarget. At least half should be primary/official where reasonably available.
At least one source must provide a benchmark/evaluation method when the domain is measurable.
If enough credible sources cannot be found, mark RESEARCH_INSUFFICIENT rather than inventing evidence.

## Final domain section

DOMAIN_ID=<id>
DOMAIN_VERDICT=READY_FOR_PLAN or RESEARCH_INSUFFICIENT
CURRENT_SEVEN_STATE=<short>
TARGET_STATE=<short>
HIGHEST_VALUE_GAP=<short>
FIRST_IMPLEMENTATION_SLICE=<short>
SOURCES_USED=<integer>
PRIMARY_SOURCES_USED=<integer>
