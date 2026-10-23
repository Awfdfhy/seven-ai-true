# D19_AGENT_ORCHESTRATION — Multi-Agent Team / Manager / Strike Teams / Calibration

Research audit: READY

DOMAIN_ID=D19_AGENT_ORCHESTRATION
SOURCE_ANALYSIS=Harvested: GitHub custom agents, Microsoft multi-agent reference architecture, MCP spec. Focus on roles/specialists, coordination, tools, governance, scalability, security. Seven has 20-agent team with Manager coordination per instructions - meta orchestration.
CURRENT=Repo has `.seven-team/` with autonomy, domain-campaign, product-intelligence, etc. `PROJECT_MANIFEST.json` exists. No obvious agent runtime code visible at root except maybe in HTML/Cloudflare. Team structure defined in prompts/manifests.
TARGET=Clear role boundaries, delegation, shared state, handoffs, calibration, conflict resolution, audit trail, avoid duplicate ownership.
NOW=Read `.seven-team/domain-campaign/domains.json`, manifests, autonomy contracts, understand Manager/strike teams.
NEXT=Map actual orchestration implementation vs defined roles, identify coordination primitives, handoff protocol.
LATER=Calibration/eval, task routing, multi-agent traces.
TESTS=Handoff tests, role boundary tests, delegation correctness, auditability.
RISKS=Role confusion, duplicate ownership, uncontrolled delegation, traceability gaps.
FIRST_SLICE=Read domain-campaign and autonomy dirs, map B10 responsibilities across domains.
KNOWN_UNKNOWNS=Runtime orchestration vs prompt-defined.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
