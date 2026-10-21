# D04_CODING_SYSTEM — Coding Agent / Repo Map / Edit-Test-Verify

Research audit: READY

DOMAIN_ID=D04_CODING_SYSTEM
SOURCE_ANALYSIS=Harvested 14 sources (all primary). SWE-bench leaderboards, SWE-agent (NeurIPS 2024), GitHub custom agents docs, SWE-bench FAQ. Clear standard: repo map, issue->patch, test execution, environment setup, evaluation on held tests. Also need edit-test-verify loop, subagents, file system awareness.
CURRENT=Seven is agent team (20 agents) with manager coordination - repo shows `.seven-team/`, agent manifests implied. Scripts like `verify.cjs`, `all.cjs` exist. HTML files (`seven_ai-*.html`) suggest single-file app; coding system may be specialized. Need to see if there's repo map, edit tools, test harness.
TARGET=SWE-bench style loop: repo understanding (map/index), plan, edit with minimal diff, run tests (targeted), verify, iterate. Custom agent roles, context management, failure recovery.
NOW=Assess edit-test-verify: what tests run? `verify.cjs` content, `package.json` scripts, `all.cjs`. Repo map presence.
NEXT=Targeted test selection, failure triage, patch validation, regression guard.
LATER=Repo embedding/map, subagent specialization, tool use optimization.
TESTS=SWE-bench style tasks, unit tests, integration, lint/typecheck if present.
RISKS=Over-editing, breaking architecture, test pollution, slow loops.
FIRST_SLICE=Document coding loop; wire `verify.cjs` to run targeted tests; add failure report format.
KNOWN_UNKNOWNS=Actual coding agent implementation vs scripts. Need to read verify.cjs/all.cjs/package.json fully.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
