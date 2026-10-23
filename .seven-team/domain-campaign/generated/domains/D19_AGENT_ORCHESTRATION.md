# D19_AGENT_ORCHESTRATION — Multi-Agent Team / Manager / Strike Teams / Calibration

Research audit: READY

DOMAIN_ID=D19_AGENT_ORCHESTRATION
SOURCE_ANALYSIS=12 sources (12 primary); harvest READY. GitHub custom agents, Microsoft multi-agent reference architecture, MCP spec. Emphasizes reusable specialist roles, security, scalability. Limitation: Seven's .seven-team orchestration state is the actual authority.
CURRENT=Seven runs 20-agent superloop with manager stages; ownership.json, team.json define roles; autonomy contracts under .seven-team/autonomy. Constitution/proof policy mandatory.
TARGET=One owner per subsystem, no duplicate runtimes/stores/bridges; evidence-gated stage transitions; deterministic conflict resolution.
NOW=Review orchestration state and ownership map for duplicate owners and conflicts.
NEXT=Integration conflict reports (A10/B10), meta-team evidence proposals.
LATER=Calibration/meta-team changes from repeated evidence only.
TESTS=Deterministic: ownership uniqueness checks; E2E: stage flow; adversarial: conflicting assignments; eval: conflict report.
RISKS=Duplicate owners, scope creep, evidence fabrication, weakening tests.
FIRST_SLICE=Ownership audit + conflict report.
KNOWN_UNKNOWNS=Current ownership violations, stage state consistency.
DOMAIN_VERDICT=READY_FOR_PLAN
