"use strict";

const assert = require("assert/strict");
const { selectWinner } = require("./evals.cjs");
const { createRepairCycle, advanceRepairCycle } = require("./repair-cycle.cjs");

function pass(name, fn) {
  fn();
  console.log("PASS", name);
}

const baseline = { tests: 1, quality: 0.7, reliability: 0.7, performance: 0.7, efficiency: 0.7 };
const gates = {
  isolated: true,
  regressionFree: true,
  provenanceVerified: true,
  rollbackReady: true,
  freeProofVerified: true,
  licenseAllowed: true,
  criticalRegression: false
};

pass("multi-candidate eval ignores stronger-looking unsafe candidate", () => {
  const result = selectWinner({
    baseline,
    candidates: [
      { id: "unsafe", metrics: { tests: 1, quality: 1, reliability: 1, performance: 1, efficiency: 1 }, gates: { ...gates, provenanceVerified: false } },
      { id: "safe", metrics: { tests: 1, quality: 0.8, reliability: 0.8, performance: 0.8, efficiency: 0.8 }, gates }
    ]
  });
  assert.equal(result.winner.id, "safe");
  assert.equal(result.rejected.length, 1);
});

pass("multi-run aggregation is deterministic", () => {
  const result = selectWinner({
    baseline,
    candidates: [{
      id: "repeatable",
      runs: [
        { tests: 1, quality: 0.8, reliability: 0.8, performance: 0.7, efficiency: 0.7 },
        { tests: 1, quality: 0.9, reliability: 0.8, performance: 0.9, efficiency: 0.9 }
      ],
      gates
    }]
  });
  assert.equal(result.winner.id, "repeatable");
  assert.equal(result.winner.metrics.quality, 0.85);
});

pass("repair cycle enforces reproduce repair review regression order", () => {
  let cycle = createRepairCycle({ issueId: "bug-1", maxAttempts: 2 });
  cycle = advanceRepairCycle(cycle, { reproduced: true });
  assert.equal(cycle.stage, "REPAIR");
  cycle = advanceRepairCycle(cycle, { changed: true });
  assert.equal(cycle.stage, "REVIEW");
  cycle = advanceRepairCycle(cycle, { approved: true });
  assert.equal(cycle.stage, "REGRESSION_GATE");
  cycle = advanceRepairCycle(cycle, { passed: true });
  assert.equal(cycle.stage, "COMPLETE");
  assert.equal(cycle.outcome, "PASS");
});

pass("failed review consumes bounded retry instead of looping forever", () => {
  let cycle = createRepairCycle({ issueId: "bug-2", maxAttempts: 2 });
  cycle = advanceRepairCycle(cycle, { reproduced: true });
  cycle = advanceRepairCycle(cycle, { changed: true });
  cycle = advanceRepairCycle(cycle, { approved: false });
  assert.equal(cycle.stage, "REPAIR");
  assert.equal(cycle.attempt, 2);
  cycle = advanceRepairCycle(cycle, { changed: true });
  cycle = advanceRepairCycle(cycle, { approved: false });
  assert.equal(cycle.outcome, "REJECT_MAX_ATTEMPTS");
});

console.log("advanced evolution test suite: PASS");
