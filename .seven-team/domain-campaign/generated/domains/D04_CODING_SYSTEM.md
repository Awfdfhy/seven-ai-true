# D04_CODING_SYSTEM — Coding Agent / Repo Map / Edit-Test-Verify

Research audit: READY

DOMAIN_ID=D04_CODING_SYSTEM
SOURCE_ANALYSIS=Harvested 14 sources (14 primary). SWE-bench (leaderboards, FAQ) — gold standard for issue→fix. SWE-agent (NeurIPS 2024) — agent scaffolding for coding tasks. GitHub Copilot custom agents docs. 
Disagreements: pass@k vs real issue resolution; environment setup heavy. Freshness current (SWE-bench active). Limitations: SWE-bench focuses on Python repos; environment complexity. Harvest sufficient.

CURRENT=Seven is coding agent (Codex CLI context). Has `remake/` (architecture/milestones), docs, build artifacts. Test via node:test + verify.cjs. Need to inspect edit-test-verify loop, repo map, patch/apply flow, test selection (proactive vs interactive per instructions), validation philosophy. Also AGENTS.md style rules apply.

TARGET=Deterministic edit-test-verify: repo map/index, safe edits (apply_patch), focused tests (start specific to changed code), avoid unrelated fixes, root-cause fixes, evidence-backed changes, regression proof. SWE-bench inspired discipline: run minimal failing tests first, iterate, verify. Track invariants touched.

NOW=Inspect coding flow: how edits applied, test running, validation gates. Read verify.cjs (what it checks). Map test layout (node:test discovers *.test.* or spec). Identify smoke vs full tests. Define coding invariants per arch.

NEXT=Repo map (symbols, ownership, imports), test impact analysis (affected tests), focused test runner wrapper, patch validation, flake detection basics. Deterministic test ordering.

LATER=SWE-bench subset integration (sandboxed), mutation testing hooks, coverage gates for changed code, regression proof bundles.

TESTS=Focused unit/integration, smoke via runtime-smoke.cjs, verify via verify.cjs, deterministic, no unrelated test changes. E2E where relevant.

RISKS=Over-testing, fixing unrelated bugs, slow validation, environment drift. Must follow validation philosophy (interactive vs non-interactive). 

FIRST_SLICE=Understand verify.cjs + node:test setup; write focused test for a small change path; document edit-test-verify checklist. Smallest improvement to release assurance discipline.

KNOWN_UNKNOWNS=Test discovery, CI/local parity, flake rate, repo indexing. Need inspection.

DOMAIN_VERDICT=READY_FOR_PLAN
