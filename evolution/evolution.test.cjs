"use strict";

const assert = require("assert/strict");
const { score, evaluate } = require("./core.cjs");
const { appendEvent, verifyLedger } = require("./ledger.cjs");
const { evaluateCandidate } = require("./gates.cjs");
const {
  createCandidate,
  evaluateStage,
  shadowStage,
  canaryStage,
  promotionReadyStage,
  promote,
  rollback,
  verifyCandidate
} = require("./coordinator.cjs");

function pass(name, fn) {
  fn();
  console.log("PASS", name);
}

const baseline = { tests: 1, quality: 0.8, reliability: 0.8, performance: 0.7, efficiency: 0.7 };
const stronger = { tests: 1, quality: 0.9, reliability: 0.9, performance: 0.8, efficiency: 0.8 };
const safeGates = {
  isolated: true,
  regressionFree: true,
  provenanceVerified: true,
  rollbackReady: true,
  freeProofVerified: true,
  licenseAllowed: true,
  criticalRegression: false
};

pass("weighted score remains bounded", () => {
  assert.equal(score({ tests: 9, quality: -4 }), 0.45);
});

pass("core rejects failed tests even with strong metrics", () => {
  const result = evaluate({ baseline, candidate: { ...stronger, tests: 0 }, required: Object.keys(baseline) });
  assert.equal(result.pass, false);
  assert.equal(result.decision, "REJECT");
});

pass("candidate requires every hard safety gate", () => {
  const result = evaluateCandidate({ baseline, candidate: stronger, gates: { ...safeGates, rollbackReady: false } });
  assert.equal(result.pass, false);
  assert.ok(result.failedGates.includes("rollbackReady"));
});

pass("eligible candidate enters shadow only after complete evaluation", () => {
  const result = evaluateCandidate({ baseline, candidate: stronger, gates: safeGates });
  assert.equal(result.pass, true);
  assert.equal(result.decision, "ELIGIBLE_FOR_SHADOW");
});

pass("ledger detects tampering", () => {
  let ledger = appendEvent([], { type: "ONE", timestamp: "2026-01-01T00:00:00.000Z", payload: { a: 1 } });
  ledger = appendEvent(ledger, { type: "TWO", timestamp: "2026-01-01T00:00:01.000Z", payload: { b: 2 } });
  assert.equal(verifyLedger(ledger).valid, true);
  const tampered = ledger.map((entry, index) => index === 0 ? { ...entry, payload: { a: 2 } } : entry);
  assert.equal(verifyLedger(tampered).valid, false);
});

pass("full lifecycle cannot skip stages and supports rollback", () => {
  const candidate = createCandidate({ id: "candidate-1", kind: "system", source: "test" });
  assert.throws(() => promote(candidate, { approved: true }), /PROMOTABLE/);

  evaluateStage(candidate, { baseline, candidate: stronger, gates: safeGates });
  assert.equal(candidate.state, "EVALUATED");

  shadowStage(candidate, { passed: true });
  assert.equal(candidate.state, "SHADOW");

  canaryStage(candidate, { passed: true });
  assert.equal(candidate.state, "CANARY");

  promotionReadyStage(candidate, { canaryPassed: true, rollbackCheckpoint: true });
  assert.equal(candidate.state, "PROMOTABLE");
  assert.equal(verifyCandidate(candidate).promotable, true);

  promote(candidate, { approved: true, release: { version: "test" } });
  assert.equal(candidate.state, "PROMOTED");

  rollback(candidate, "regression detected");
  assert.equal(candidate.state, "ROLLED_BACK");
  assert.equal(verifyCandidate(candidate).valid, true);
});

pass("failed shadow is terminally rejected", () => {
  const candidate = createCandidate({ id: "candidate-2" });
  evaluateStage(candidate, { baseline, candidate: stronger, gates: safeGates });
  shadowStage(candidate, { passed: false });
  assert.equal(candidate.state, "REJECTED");
  assert.throws(() => canaryStage(candidate, { passed: true }), /SHADOW/);
});

console.log("evolution test suite: PASS");
