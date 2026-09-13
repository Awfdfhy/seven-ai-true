"use strict";

const assert = require("assert/strict");
const {
  createExperiment,
  validateChangedPaths,
  evaluateExperiment
} = require("./experiment-lab.cjs");
const {
  createUpdateTransaction,
  validateUpdate,
  markApplied,
  verifyApplied,
  commitUpdate,
  requireRollback,
  confirmRollback,
  inspectTransaction
} = require("./update-transaction.cjs");

function pass(name, fn) {
  fn();
  console.log("PASS", name);
}

const baseline = { tests: 1, quality: 0.80, reliability: 0.80, performance: 0.70, efficiency: 0.70 };
const stronger = { tests: 1, quality: 0.90, reliability: 0.90, performance: 0.80, efficiency: 0.80 };
const gates = {
  isolated: true,
  regressionFree: true,
  provenanceVerified: true,
  rollbackReady: true,
  freeProofVerified: true,
  licenseAllowed: true,
  criticalRegression: false
};

function experiment() {
  return createExperiment({
    id: "exp-chat-runtime-1",
    subsystem: "chat-runtime",
    hypothesis: "candidate improves reliability without regression",
    baselineRef: "baseline-a",
    candidateRef: "candidate-b",
    allowedPaths: ["seven_ai-final.html"]
  });
}

pass("experiment cannot grant itself access to evaluator or CI paths", () => {
  assert.throws(() => createExperiment({
    id: "bad",
    subsystem: "evolution",
    hypothesis: "rewrite evaluator",
    baselineRef: "a",
    candidateRef: "b",
    allowedPaths: ["evolution/gates.cjs"]
  }), /protected evaluator paths/);
  assert.throws(() => createExperiment({
    id: "bad-ci",
    subsystem: "ci",
    hypothesis: "weaken tests",
    baselineRef: "a",
    candidateRef: "b",
    allowedPaths: [".github/workflows/seven-tests.yml"]
  }), /protected evaluator paths/);
});

pass("path traversal and undeclared files fail scope validation", () => {
  const exp = experiment();
  assert.throws(() => validateChangedPaths(exp, ["../secret"]), /unsafe repository path/);
  const scope = validateChangedPaths(exp, ["seven_ai-final.html", "README.md"]);
  assert.equal(scope.valid, false);
  assert.deepEqual(scope.outsideScope, ["README.md"]);
});

pass("unexpected evaluator modification rejects otherwise strong candidate", () => {
  const exp = experiment();
  const result = evaluateExperiment({
    experiment: exp,
    changedPaths: ["seven_ai-final.html", "evolution/gates.cjs"],
    baseline,
    candidate: stronger,
    gates
  });
  assert.equal(result.pass, false);
  assert.ok(result.scope.protectedChanges.includes("evolution/gates.cjs"));
});

pass("in-scope stronger candidate can reach shadow eligibility", () => {
  const result = evaluateExperiment({
    experiment: experiment(),
    changedPaths: ["seven_ai-final.html"],
    baseline,
    candidate: stronger,
    gates
  });
  assert.equal(result.pass, true);
  assert.equal(result.decision, "ELIGIBLE_FOR_SHADOW");
});

pass("update validation rejects base drift and missing exact rollback checkpoint", () => {
  const tx = createUpdateTransaction({ id: "tx-drift", experimentId: "exp", baselineSha: "aaaaaaa", candidateSha: "bbbbbbb" });
  assert.throws(() => validateUpdate(tx, { observedBaseSha: "ccccccc", experimentPass: true, rollbackCheckpointSha: "aaaaaaa" }), /base drift/);

  const tx2 = createUpdateTransaction({ id: "tx-checkpoint", experimentId: "exp", baselineSha: "aaaaaaa", candidateSha: "bbbbbbb" });
  assert.throws(() => validateUpdate(tx2, { observedBaseSha: "aaaaaaa", experimentPass: true, rollbackCheckpointSha: "ccccccc" }), /rollback checkpoint/);
});

pass("transaction cannot apply a different candidate SHA", () => {
  const tx = createUpdateTransaction({ id: "tx-wrong-apply", experimentId: "exp", baselineSha: "aaaaaaa", candidateSha: "bbbbbbb" });
  validateUpdate(tx, { observedBaseSha: "aaaaaaa", experimentPass: true, rollbackCheckpointSha: "aaaaaaa" });
  assert.throws(() => markApplied(tx, { appliedSha: "ccccccc" }), /does not match candidate/);
});

pass("failed post-apply verification forces rollback to exact baseline", () => {
  const tx = createUpdateTransaction({ id: "tx-rollback", experimentId: "exp", baselineSha: "aaaaaaa", candidateSha: "bbbbbbb" });
  validateUpdate(tx, { observedBaseSha: "aaaaaaa", experimentPass: true, rollbackCheckpointSha: "aaaaaaa" });
  markApplied(tx, { appliedSha: "bbbbbbb" });
  verifyApplied(tx, { observedSha: "bbbbbbb", ciPassed: false, regressionFree: true });
  assert.equal(tx.state, "ROLLBACK_REQUIRED");
  assert.throws(() => confirmRollback(tx, { observedSha: "ddddddd" }), /not restored/);
  confirmRollback(tx, { observedSha: "aaaaaaa" });
  assert.equal(tx.state, "ROLLED_BACK");
  assert.equal(inspectTransaction(tx).terminal, true);
});

pass("verified update commits only after exact SHA and regression gates", () => {
  const tx = createUpdateTransaction({ id: "tx-good", experimentId: "exp", baselineSha: "aaaaaaa", candidateSha: "bbbbbbb" });
  validateUpdate(tx, { observedBaseSha: "aaaaaaa", experimentPass: true, rollbackCheckpointSha: "aaaaaaa" });
  markApplied(tx, { appliedSha: "bbbbbbb" });
  verifyApplied(tx, { observedSha: "bbbbbbb", ciPassed: true, regressionFree: true });
  assert.equal(tx.state, "VERIFIED");
  commitUpdate(tx);
  assert.equal(tx.state, "COMMITTED");
  assert.equal(inspectTransaction(tx).ledger.valid, true);
});

pass("ledger tampering blocks commit", () => {
  const tx = createUpdateTransaction({ id: "tx-tamper", experimentId: "exp", baselineSha: "aaaaaaa", candidateSha: "bbbbbbb" });
  validateUpdate(tx, { observedBaseSha: "aaaaaaa", experimentPass: true, rollbackCheckpointSha: "aaaaaaa" });
  markApplied(tx, { appliedSha: "bbbbbbb" });
  verifyApplied(tx, { observedSha: "bbbbbbb", ciPassed: true, regressionFree: true });
  tx.ledger = tx.ledger.map((entry, index) => index === 0 ? { ...entry, payload: { altered: true } } : entry);
  assert.throws(() => commitUpdate(tx), /ledger integrity failed/);
});

pass("verified candidate may still be rolled back before commit", () => {
  const tx = createUpdateTransaction({ id: "tx-late-rollback", experimentId: "exp", baselineSha: "aaaaaaa", candidateSha: "bbbbbbb" });
  validateUpdate(tx, { observedBaseSha: "aaaaaaa", experimentPass: true, rollbackCheckpointSha: "aaaaaaa" });
  markApplied(tx, { appliedSha: "bbbbbbb" });
  verifyApplied(tx, { observedSha: "bbbbbbb", ciPassed: true, regressionFree: true });
  requireRollback(tx, "late health signal");
  confirmRollback(tx, { observedSha: "aaaaaaa" });
  assert.equal(tx.state, "ROLLED_BACK");
});

console.log("experiment and update transaction test suite: PASS");
