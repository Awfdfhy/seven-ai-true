# Seven AI 2.4.3 — 20-Agent Full Bug Hunt

**Completed agents:** 20/20  
**Target:** user-uploaded `Seven-AI-2.4.3-Zero-Key-Final(1).apk`  
**Scope:** diagnostic audit only; no production bug fixes were made in this wave.

## Completion status

- Team A: **10/10**
- Team B: **10/10**
- Valid source reports: **20/20**
- Raw bug findings indexed: **174**
- Deduplicated/promoted master root causes: **60**
- Master report: `.seven-team/bughunt/MASTER_BUG_REPORT.md`
- Master status: **MASTER_BUGHUNT=COMPLETE**

## Reports

- A01 — Cline — UI / visual layout / theme / night mode / responsive surfaces — PASS (13041 chars)
- A02 — Codex CLI — Android lifecycle / install-upgrade / WebView / native bridge / permissions — PASS (7607 chars; evidence-grounded recovery)
- A03 — Gemini CLI — Arabic RTL / localization / accessibility / text overflow / keyboard — PASS (9907 chars)
- A04 — OpenHands — Navigation / dialogs / workspaces / architecture / duplicate UI systems — PASS (15495 chars)
- A05 — OpenCode — Model picker / provider routing / free-route selection / mode controls — PASS (12611 chars)
- A06 — Aider — Memory / context / persistence / migrations / corruption / restore — PASS (5614 chars)
- A07 — Goose — Security / zero-key / credentials / self-dev / GitHub protections — PASS (13147 chars)
- A08 — mini-SWE — Test gaps / reproducibility / CI / release verification / regressions — PASS (13343 chars)
- A09 — Qwen Code — Performance / DOM / storage / observers / network latency / long chats — PASS (12911 chars)
- A10 — Hermes Agent — Holistic adversarial product audit across all surfaces — PASS (15612 chars)
- B01 — Cline — Chat core / send-stop-copy / streaming / retry / room switching — PASS (8916 chars)
- B02 — Codex CLI — Attachments / PDF / import-export / file errors / Android document flow — PASS (11061 chars)
- B03 — Gemini CLI — Web Search / Deep Research / citations / evidence / stale-result handling — PASS (9628 chars)
- B04 — OpenHands — Deep Think / reasoning modes / context construction / orchestration — PASS (17623 chars)
- B05 — OpenCode — RPG / canon / world runtime / state / titles / persistence — PASS (7954 chars; evidence-grounded recovery)
- B06 — Aider — Coding workspace / GitHub self-development / repo actions / failure recovery — PASS (16753 chars)
- B07 — Goose — Provider/network failures / offline / timeout / rate-limit / fallback behavior — PASS (7956 chars)
- B08 — mini-SWE — Storage / backup / migration / session recovery / destructive edge cases — PASS (6316 chars)
- B09 — Qwen Code — Concurrency / races / duplicate actions / state corruption / stress paths — PASS (11178 chars)
- B10 — Hermes Agent — Independent whole-app adversarial bug hunt and cross-system contradictions — PASS (11008 chars)

## Manager synthesis

The manager has completed the synthesis phase.

The 174 raw findings were not treated as 174 independent production bugs. Repeated symptoms were attached to common root causes, and weak/inferred findings were moved to a validation queue or rejected rather than inflating the count.

The authoritative repair ledger is the Master Bug Report. It contains **60 prioritized root causes**, ordered BLOCKER → CRITICAL → HIGH → MEDIUM → LOW, with source bug IDs preserved for traceability.

No production fixes have started yet. The next phase is the repair campaign, beginning with the BLOCKER/CRITICAL roots and requiring a regression test before each fix batch.

BUGHUNT_MANAGER=PASS
