"use strict";

const assert = require("assert/strict");
const { runSystemEvolution, approvalDecision } = require("./engine.cjs");
const { createHealthPolicy } = require("./health-monitor.cjs");
const { enforcePostReleaseHealth } = require("./promotion-runner.cjs");

async function pass(name, fn) {
  await fn();
  console.log("PASS", name);
}

const baselineMetrics = { tests: 1, quality: 0.8, reliability: 0.8, performance: 0.7, efficiency: 0.7 };
const candidateMetrics = { tests: 1, quality: 0.9, reliability: 0.9, performance: 0.8, efficiency: 0.8 };
const gates = {
  isolated: true,
  regressionFree: true,
  provenanceVerified: true,
  rollbackReady: true,
  freeProofVerified: true,
  licenseAllowed: true,
  criticalRegression: false
};
const experimentConfig = {
  id: "chat-runtime-improvement",
  subsystem: "chat-runtime",
  hypothesis: "improves runtime without regressions",
  baselineRef: "baseline",
  candidateRef: "candidate",
  allowedPaths: ["seven_ai-final.html"]
};

function adapter({ drift = false, verify = { ciPassed: true, regressionFree: true } } = {}) {
  let head = drift ? "ccccccc" : "aaaaaaa";
  const calls = [];
  return {
    calls,
    async getHeadSha() { calls.push(["getHeadSha", head]); return head; },
    async applyCandidate({ candidateSha, expectedBaseSha }) {
      calls.push(["applyCandidate", candidateSha, expectedBaseSha]);
      if (head !== expectedBaseSha) throw new Error("base mismatch");
      head = candidateSha;
      return head;
    },
    async verifyCandidate() { calls.push(["verifyCandidate"]); return verify; },
    async rollbackTo({ rollbackSha }) { calls.push(["rollbackTo", rollbackSha]); head = rollbackSha; return head; }
  };
}

function common(extra = {}) {
  return {
    experimentConfig,
    changedPaths: ["seven_ai-final.html"],
    baselineMetrics,
    candidateMetrics,
    gates,
    shadowPassed: true,
    canaryPassed: true,
    approvalPolicy: { autoPromotionEnabled: true, maxAutoRisk: "LOW" },
    riskAssessment: { verified: true, source: "trusted-policy", level: "LOW" },
    baselineSha: "aaaaaaa",
    candidateSha: "bbbbbbb",
    adapter: adapter(),
    ...extra
  };
}

(async () => {
  await pass("untrusted risk label cannot auto-approve", async () => {
    const result = await runSystemEvolution(common({
      riskAssessment: { verified: false, source: "candidate", level: "LOW" }
    }));
    assert.equal(result.outcome, "PENDING_APPROVAL");
    assert.equal(result.candidate.state, "PROMOTABLE");
    assert.equal(result.approval.mode, "UNTRUSTED_RISK");
    assert.equal(result.execution, undefined);
  });

  await pass("trusted low-risk candidate completes the full automatic path", async () => {
    const fake = adapter();
    const result = await runSystemEvolution(common({ adapter: fake }));
    assert.equal(result.outcome, "COMMITTED");
    assert.equal(result.stage, "COMPLETE");
    assert.equal(result.candidate.state, "PROMOTED");
    assert.equal(result.transaction.state, "COMMITTED");
    assert.equal(result.approval.mode, "AUTO_POLICY");
    assert.ok(fake.calls.some((call) => call[0] === "applyCandidate"));
  });

  await pass("risk above policy remains pending instead of silently promoting", async () => {
    const result = await runSystemEvolution(common({
      riskAssessment: { verified: true, source: "trusted-policy", level: "HIGH" }
    }));
    assert.equal(result.outcome, "PENDING_APPROVAL");
    assert.equal(result.approval.mode, "RISK_TOO_HIGH");
  });

  await pass("manual approval can authorize a high-risk candidate after all gates", async () => {
    const result = await runSystemEvolution(common({
      manualApproved: true,
      riskAssessment: { verified: true, source: "trusted-policy", level: "HIGH" }
    }));
    assert.equal(result.outcome, "COMMITTED");
    assert.equal(result.approval.mode, "MANUAL");
  });

  await pass("failed shadow rejects before update transaction exists", async () => {
    const fake = adapter();
    const result = await runSystemEvolution(common({ shadowPassed: false, adapter: fake }));
    assert.equal(result.outcome, "REJECTED");
    assert.equal(result.stage, "SHADOW");
    assert.equal(result.transaction, undefined);
    assert.equal(fake.calls.some((call) => call[0] === "applyCandidate"), false);
  });

  await pass("post-apply verification failure rolls back both transaction and candidate", async () => {
    const fake = adapter({ verify: { ciPassed: false, regressionFree: true } });
    const result = await runSystemEvolution(common({ adapter: fake }));
    assert.equal(result.outcome, "ROLLED_BACK");
    assert.equal(result.transaction.state, "ROLLED_BACK");
    assert.equal(result.candidate.state, "ROLLED_BACK");
  });

  await pass("base drift aborts deployment and rolls back logical candidate state", async () => {
    const result = await runSystemEvolution(common({ adapter: adapter({ drift: true }) }));
    assert.equal(result.outcome, "DEPLOYMENT_ABORTED");
    assert.equal(result.candidate.state, "ROLLED_BACK");
    assert.match(result.error, /base drift/);
  });

  await pass("post-release critical health signal rolls committed update back", async () => {
    const fake = adapter();
    const result = await runSystemEvolution(common({ adapter: fake }));
    assert.equal(result.transaction.state, "COMMITTED");
    const health = await enforcePostReleaseHealth({
      transaction: result.transaction,
      adapter: fake,
      policy: createHealthPolicy({ minSamples: 2 }),
      samples: [{ successRate: 1, errorRate: 0, critical: false }, { successRate: 1, errorRate: 0, critical: true, source: "runtime-crash" }]
    });
    assert.equal(health.outcome, "ROLLED_BACK");
    assert.equal(result.transaction.state, "ROLLED_BACK");
    assert.equal(health.health.reason, "critical_signal");
  });

  await pass("healthy post-release samples do not roll back", async () => {
    const fake = adapter();
    const result = await runSystemEvolution(common({ adapter: fake }));
    const health = await enforcePostReleaseHealth({
      transaction: result.transaction,
      adapter: fake,
      policy: createHealthPolicy({ minSamples: 2, minSuccessRate: 0.95, maxErrorRate: 0.05 }),
      samples: [{ successRate: 1, errorRate: 0 }, { successRate: 0.99, errorRate: 0.01 }]
    });
    assert.equal(health.outcome, "HEALTHY");
    assert.equal(result.transaction.state, "COMMITTED");
  });

  await pass("approval policy rejects invalid risk vocabulary", async () => {
    const decision = approvalDecision({
      riskAssessment: { verified: true, source: "trusted-policy", level: "BANANA" },
      policy: { autoPromotionEnabled: true, maxAutoRisk: "LOW" }
    });
    assert.equal(decision.approved, false);
    assert.equal(decision.mode, "INVALID_RISK");
  });

  console.log("evolution engine test suite: PASS");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
