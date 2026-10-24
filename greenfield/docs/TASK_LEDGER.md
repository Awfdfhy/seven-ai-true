# Task Ledger

| Task | Dependencies | Deliverable | Acceptance | Status |
|---|---|---|---|---|
| G0-01 | None | Repository provenance report | URL, branch, SHA, scope, untouched legacy evidence | READY |
| G0-02 | G0-01 | Source register | Requirements mapped to evidence/confidence | READY |
| G1-01 | G0-02 | Conflict and decision list | No silent resolution of major conflicts | BLOCKED on inventory |
| G1-02 | G1-01 | MVP-0 test spec | Happy path plus adversarial cases | PLANNED |
| G2-01 | G1-02 | Stack scorecard | Up to three stacks scored with evidence | PLANNED |
| G2-02 | G2-01 | ADR-0001 and spike | Proof-of-concept reproduces exact commands | PLANNED |
| G3-01 | G2-02 | Domain/data/event contracts | Contract tests cover invalid/duplicate/stale events | PLANNED |
| G4-01 | G3-01 | MVP-0 vertical slice | End-to-end create/action/narrate/save/reopen passes | PLANNED |
| G5-01 | G4-01 | Provider adapter | Mock and one real provider pass shared contract | PLANNED |
| G8-01 | G4-01 | Android persistence matrix | Force-stop/reopen and SAF gates pass on target APIs | PLANNED |

Update task status only with evidence. Add exact commands and commit SHA for completed tasks.
