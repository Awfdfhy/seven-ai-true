# Seven AI — Chat Workflow Protocol

## Start of Every Specialist Chat
Read:
1. MASTER_PLAN.md
2. CURRENT_STATUS.md
3. SYSTEM_REGISTRY.md
4. INTEGRATION_CONTRACTS.md
5. DECISIONS.md
6. The subsystem's own notes/code

Then:
- Confirm current repo state.
- Inspect relevant implementation before proposing changes.
- Build a plan for this subsystem only.
- Execute in small verifiable batches.

## End of Every Work Batch
Record:
- What changed
- Files changed
- Tests run
- Pass/fail evidence
- New risks
- Dependencies affected
- Next exact action

Update CURRENT_STATUS.md when status materially changes.

## Conflict Rule
If two chats want incompatible changes:
- Neither silently overrides the other.
- Record conflict in DECISIONS.md.
- Master / Integration chat resolves it.
- Then update INTEGRATION_CONTRACTS.md.

## Specialist Scope
A specialist chat may refactor internals freely when public contracts remain stable.
Any shared API/schema/tool protocol change requires an integration-contract update.

## Verification Loop
Understand → Inspect → Plan → Implement → Test → Debug → Verify → Review → Document
