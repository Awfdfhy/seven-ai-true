"use strict";

const assert = require("assert/strict");
const {
  createStateEnvelope,
  verifyStateEnvelope,
  restoreState,
  persistStateAtomic,
  loadCommittedState
} = require("./state-store.cjs");
const {
  createUpdateTransaction,
  validateUpdate,
  markApplied,
  verifyApplied,
  commitUpdate
} = require("./update-transaction.cjs");
const { recoverTransaction, classifyRecovery } = require("./recovery.cjs");

async function pass(name, fn) {
  await fn();
  console.log("PASS", name);
}

function storeAdapter({ committed = null, failCommit = false } = {}) {
  let current = committed;
  let temp = null;
  return {
    async writeTemp({ envelope }) { temp = envelope; },
    async commitTemp({ expectedChecksum }) {
      if (failCommit) throw new Error("simulated power loss before commit");
      if (!temp || temp.checksum !== expectedChecksum) throw new Error("temp checksum mismatch");
      current = temp;
      temp = null;
    },
    async readCommitted() { return current; }
  };
}

function promotionAdapter(initialHead) {
  let head = initialHead;
  return {
    async getHeadSha() { return head; },
    async applyCandidate({ candidateSha }) { head = candidateSha; return head; },
    async verifyCandidate() { return { ciPassed: true, regressionFree: true }; },
    async rollbackTo({ rollbackSha }) { head = rollbackSha; return head; }
  };
}

function txTo(state) {
  const tx = createUpdateTransaction({ id: `recovery-${state}`, experimentId: "exp", baselineSha: "aaaaaaa", candidateSha: "bbbbbbb" });
  if (state === "PREPARED") return tx;
  validateUpdate(tx, { observedBaseSha: "aaaaaaa", experimentPass: true, rollbackCheckpointSha: "aaaaaaa" });
  if (state === "VALIDATED") return tx;
  markApplied(tx, { appliedSha: "bbbbbbb" });
  if (state === "APPLIED") return tx;
  verifyApplied(tx, { observedSha: "bbbbbbb", ciPassed: true, regressionFree: true });
  if (state === "VERIFIED") return tx;
  commitUpdate(tx);
  return tx;
}

(async () => {
  await pass("state envelope detects corruption before restore", async () => {
    const envelope = createStateEnvelope({ transaction: { state: "PREPARED" } }, { savedAt: "2026-09-13T00:00:00.000Z" });
    assert.equal(verifyStateEnvelope(envelope).valid, true);
    const tampered = { ...envelope, state: { transaction: { state: "COMMITTED" } } };
    assert.equal(verifyStateEnvelope(tampered).valid, false);
    assert.throws(() => restoreState(tampered), /checksum/);
  });

  await pass("failed atomic commit cannot replace the last committed state", async () => {
    const oldEnvelope = createStateEnvelope({ generation: 1 }, { savedAt: "2026-09-13T00:00:00.000Z" });
    const adapter = storeAdapter({ committed: oldEnvelope, failCommit: true });
    await assert.rejects(() => persistStateAtomic({ adapter, state: { generation: 2 }, savedAt: "2026-09-13T00:01:00.000Z" }), /power loss/);
    const restored = await loadCommittedState({ adapter });
    assert.deepEqual(restored, { generation: 1 });
  });

  await pass("successful atomic persistence round-trips verified state", async () => {
    const adapter = storeAdapter();
    await persistStateAtomic({ adapter, state: { generation: 3, phase: "CANARY" }, savedAt: "2026-09-13T00:02:00.000Z" });
    assert.deepEqual(await loadCommittedState({ adapter }), { generation: 3, phase: "CANARY" });
  });

  await pass("crash after apply but before commit conservatively rolls back", async () => {
    const tx = txTo("APPLIED");
    const result = await recoverTransaction({ transaction: tx, adapter: promotionAdapter("bbbbbbb") });
    assert.equal(result.outcome, "ROLLED_BACK");
    assert.equal(tx.state, "ROLLED_BACK");
  });

  await pass("candidate visible from merely validated state is treated as uncertain apply and rolled back", async () => {
    const tx = txTo("VALIDATED");
    const result = await recoverTransaction({ transaction: tx, adapter: promotionAdapter("bbbbbbb") });
    assert.equal(result.outcome, "ROLLED_BACK");
    assert.equal(tx.state, "ROLLED_BACK");
  });

  await pass("prepared state with unexpected candidate head halts instead of guessing", async () => {
    const tx = txTo("PREPARED");
    const result = await recoverTransaction({ transaction: tx, adapter: promotionAdapter("bbbbbbb") });
    assert.equal(result.outcome, "HALT");
    assert.equal(result.recovery.reason, "candidate_visible_without_validated_state");
  });

  await pass("committed transaction at candidate head resumes as stable", async () => {
    const tx = txTo("COMMITTED");
    const result = await recoverTransaction({ transaction: tx, adapter: promotionAdapter("bbbbbbb") });
    assert.equal(result.outcome, "STABLE");
    assert.equal(tx.state, "COMMITTED");
  });

  await pass("committed transaction with unknown or reverted head halts for explicit inspection", async () => {
    const tx = txTo("COMMITTED");
    assert.equal(classifyRecovery(tx, "aaaaaaa").action, "HALT");
    assert.equal(classifyRecovery(tx, "ccccccc").reason, "unknown_head");
  });

  await pass("corrupted transaction ledger always halts recovery", async () => {
    const tx = txTo("APPLIED");
    tx.ledger = tx.ledger.map((entry, index) => index === 0 ? { ...entry, payload: { tampered: true } } : entry);
    const result = await recoverTransaction({ transaction: tx, adapter: promotionAdapter("bbbbbbb") });
    assert.equal(result.outcome, "HALT");
    assert.equal(result.recovery.reason, "ledger_integrity");
  });

  console.log("evolution recovery test suite: PASS");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
