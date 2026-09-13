"use strict";

const assert = require("assert/strict");
const { createStateEnvelope } = require("./state-store.cjs");
const {
  runDurableSystemEvolution,
  loadDurableEvolutionState,
  recoverDurableEvolution
} = require("./durable-engine.cjs");
const {
  createUpdateTransaction,
  validateUpdate,
  markApplied
} = require("./update-transaction.cjs");

async function pass(name, fn) {
  await fn();
  console.log("PASS", name);
}

function memoryStore(initialState = null) {
  let committed = initialState ? createStateEnvelope(initialState, { savedAt: "2026-09-13T01:00:00.000Z" }) : null;
  let temp = null;
  const writes = [];
  return {
    writes,
    async writeTemp({ envelope }) { temp = envelope; writes.push(envelope.state.phase); },
    async commitTemp({ expectedChecksum }) {
      if (!temp || temp.checksum !== expectedChecksum) throw new Error("temp mismatch");
      committed = temp;
      temp = null;
    },
    async readCommitted() { return committed; }
  };
}

function promotionAdapter(initial = "aaaaaaa", verification = { ciPassed: true, regressionFree: true }) {
  let head = initial;
  const calls = [];
  return {
    calls,
    async getHeadSha() { calls.push(["getHeadSha", head]); return head; },
    async applyCandidate({ candidateSha, expectedBaseSha }) {
      calls.push(["applyCandidate", candidateSha]);
      if (head !== expectedBaseSha) throw new Error("base mismatch");
      head = candidateSha;
      return head;
    },
    async verifyCandidate() { calls.push(["verifyCandidate"]); return verification; },
    async rollbackTo({ rollbackSha }) { calls.push(["rollbackTo", rollbackSha]); head = rollbackSha; return head; }
  };
}

function input(adapter) {
  return {
    experimentConfig: {
      id: "durable-chat-runtime",
      subsystem: "chat-runtime",
      hypothesis: "improve reliability",
      baselineRef: "baseline",
      candidateRef: "candidate",
      allowedPaths: ["seven_ai-final.html"]
    },
    changedPaths: ["seven_ai-final.html"],
    baselineMetrics: { tests: 1, quality: 0.8, reliability: 0.8, performance: 0.7, efficiency: 0.7 },
    candidateMetrics: { tests: 1, quality: 0.9, reliability: 0.9, performance: 0.8, efficiency: 0.8 },
    gates: {
      isolated: true,
      regressionFree: true,
      provenanceVerified: true,
      rollbackReady: true,
      freeProofVerified: true,
      licenseAllowed: true,
      criticalRegression: false
    },
    shadowPassed: true,
    canaryPassed: true,
    riskAssessment: { verified: true, source: "trusted-policy", level: "LOW" },
    approvalPolicy: { autoPromotionEnabled: true, maxAutoRisk: "LOW" },
    baselineSha: "aaaaaaa",
    candidateSha: "bbbbbbb",
    adapter
  };
}

(async () => {
  await pass("durable run checkpoints the full lifecycle and ends COMPLETE", async () => {
    const store = memoryStore();
    const result = await runDurableSystemEvolution({ storeAdapter: store, ...input(promotionAdapter()) });
    assert.equal(result.outcome, "COMMITTED");
    const state = await loadDurableEvolutionState({ storeAdapter: store });
    assert.equal(state.phase, "COMPLETE");
    assert.equal(state.transaction.state, "COMMITTED");
    for (const phase of ["DISCOVERED", "EVALUATED", "SHADOW", "CANARY", "PROMOTABLE", "PROMOTED_PREPARED", "TRANSACTION_VALIDATED", "TRANSACTION_APPLIED", "TRANSACTION_VERIFIED", "TRANSACTION_COMMITTED", "COMPLETE"]) {
      assert.ok(store.writes.includes(phase), `missing checkpoint ${phase}`);
    }
  });

  await pass("unfinished durable state blocks a second evolution run", async () => {
    const store = memoryStore({ phase: "TRANSACTION_APPLIED", transaction: { state: "APPLIED" } });
    await assert.rejects(() => runDurableSystemEvolution({ storeAdapter: store, ...input(promotionAdapter()) }), /requires recovery/);
  });

  await pass("persisted interrupted APPLIED transaction recovers by restoring baseline", async () => {
    const tx = createUpdateTransaction({ id: "tx-recover", experimentId: "exp", baselineSha: "aaaaaaa", candidateSha: "bbbbbbb" });
    validateUpdate(tx, { observedBaseSha: "aaaaaaa", experimentPass: true, rollbackCheckpointSha: "aaaaaaa" });
    markApplied(tx, { appliedSha: "bbbbbbb" });
    const candidate = {
      id: "system:exp",
      kind: "system",
      state: "PROMOTED",
      ledger: [
        { sequence: 1, type: "CANDIDATE_DISCOVERED", source: "seven-evolution", timestamp: "x", parentHash: null, payload: {}, hash: "invalid-for-candidate-not-used" }
      ]
    };
    const store = memoryStore({ phase: "TRANSACTION_APPLIED", transaction: tx, candidate: null });
    const adapter = promotionAdapter("bbbbbbb");
    const result = await recoverDurableEvolution({ storeAdapter: store, promotionAdapter: adapter });
    assert.equal(result.outcome, "ROLLED_BACK");
    const restored = await loadDurableEvolutionState({ storeAdapter: store });
    assert.equal(restored.phase, "ROLLED_BACK");
    assert.equal(restored.transaction.state, "ROLLED_BACK");
    assert.ok(adapter.calls.some((call) => call[0] === "rollbackTo"));
    void candidate;
  });

  await pass("terminal completed state permits the next evolution run", async () => {
    const store = memoryStore({ phase: "COMPLETE", transaction: null, candidate: null });
    const result = await runDurableSystemEvolution({ storeAdapter: store, ...input(promotionAdapter()) });
    assert.equal(result.outcome, "COMMITTED");
  });

  console.log("durable evolution engine test suite: PASS");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
