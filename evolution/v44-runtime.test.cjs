"use strict";

const assert = require("assert/strict");
const {
  freezeTarget,
  createCampaign,
  roleIsolationReceipt,
  matchedBudgetReceipt
} = require("./v44-governance.cjs");
const { runGovernedEvolution } = require("./v44-runtime.cjs");
const { loadCampaignJournal, inspectCampaignJournal } = require("./v44-campaign-journal.cjs");

async function pass(name, fn) {
  await fn();
  console.log("PASS", name);
}

function keyedMemoryStore() {
  const committed = new Map();
  const temp = new Map();
  return {
    async writeTemp({ key, envelope }) { temp.set(key, envelope); },
    async commitTemp({ key, expectedChecksum }) {
      const value = temp.get(key);
      if (!value || value.checksum !== expectedChecksum) throw new Error("temp mismatch");
      committed.set(key, value);
      temp.delete(key);
    },
    async readCommitted({ key }) { return committed.get(key) || null; }
  };
}

function promotionAdapter() {
  let head = "aaaaaaa";
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
    async verifyCandidate() { calls.push(["verifyCandidate"]); return { ciPassed: true, regressionFree: true }; },
    async rollbackTo({ rollbackSha }) { calls.push(["rollbackTo", rollbackSha]); head = rollbackSha; return head; }
  };
}

function governanceFixture(extra = {}) {
  const target = freezeTarget({
    id: "chat-runtime-v44",
    lane: "ENGINEERING_EVOLUTION",
    scope: "CAMPAIGN_LOCAL",
    authorityHash: "authority-v1",
    requirements: ["improve reliability"],
    invariants: ["truth states preserved"],
    forbiddenRegressions: ["critical regression"],
    resourceEnvelope: { mobile: true },
    generationLimit: 10
  });
  const campaign = createCampaign({ id: "campaign-v44", target, constitutionHash: "v5.40+sev4.4", generation: 1 });
  return {
    target,
    campaign,
    candidate: {
      hash: "candidate-hash-v1",
      authorityHash: "authority-v1",
      scope: "CAMPAIGN_LOCAL",
      claimsAutonomous: true,
      claimsLearning: true
    },
    judge: {
      independent: true,
      evalLocked: true,
      holdoutPassed: true,
      forbiddenRegression: false,
      rollbackReady: true
    },
    roles: {
      builder: { identity: "builder-v1", contextHash: "ctx-builder", memoryHash: "mem-builder" },
      judge: { identity: "judge-v1", contextHash: "ctx-judge", memoryHash: "mem-judge" },
      promotion: { identity: "promotion-v1" }
    },
    assistanceInput: { humanInterventions: 0, extraRetries: 0, strongerModelCalls: 0 },
    pathwayInput: { saved: true, represented: true, retrieved: true, applied: true, updated: true, outcome: true },
    baselineBudget: { modelCalls: 10, toolCalls: 10, tokens: 1000, wallTimeMs: 1000, networkBytes: 10000 },
    candidateBudget: { modelCalls: 10, toolCalls: 10, tokens: 1000, wallTimeMs: 1000, networkBytes: 10000 },
    governancePolicy: { decision: "AUTO_ELIGIBLE", budgetTolerance: 0 },
    ...extra
  };
}

function engineFixture(adapter) {
  return {
    experimentConfig: {
      id: "v44-runtime-integration",
      subsystem: "chat-runtime",
      hypothesis: "improves runtime without regressions",
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
  await pass("clean-room role isolation rejects shared builder/judge context", async () => {
    const receipt = roleIsolationReceipt({
      builder: { identity: "builder", contextHash: "same" },
      judge: { identity: "judge", contextHash: "same" },
      promotion: { identity: "promotion" }
    });
    assert.equal(receipt.isolated, false);
    assert.ok(receipt.reasons.includes("builder_judge_context_shared"));
  });

  await pass("matched-budget receipt rejects candidate-only compute advantage", async () => {
    const receipt = matchedBudgetReceipt({
      baseline: { modelCalls: 1, toolCalls: 1, tokens: 10, wallTimeMs: 10, networkBytes: 10 },
      candidate: { modelCalls: 2, toolCalls: 1, tokens: 10, wallTimeMs: 10, networkBytes: 10 }
    });
    assert.equal(receipt.matched, false);
    assert.ok(receipt.reasons.includes("candidate_budget_exceeds_baseline:modelCalls"));
  });

  await pass("assistance cannot be mislabeled as autonomous improvement", async () => {
    const store = keyedMemoryStore();
    const adapter = promotionAdapter();
    const result = await runGovernedEvolution({
      ...governanceFixture({ assistanceInput: { humanInterventions: 1 } }),
      storeAdapter: store,
      ...engineFixture(adapter)
    });
    assert.equal(result.outcome, "GOVERNANCE_REJECTED");
    assert.ok(result.preflight.decision.reasons.includes("assistance_misattributed"));
    assert.equal(adapter.calls.some((call) => call[0] === "applyCandidate"), false);
  });

  await pass("claimed learning requires complete pathway proof", async () => {
    const store = keyedMemoryStore();
    const adapter = promotionAdapter();
    const result = await runGovernedEvolution({
      ...governanceFixture({ pathwayInput: { saved: true, represented: true, retrieved: false, applied: true, updated: true, outcome: true } }),
      storeAdapter: store,
      ...engineFixture(adapter)
    });
    assert.equal(result.outcome, "GOVERNANCE_REJECTED");
    assert.ok(result.preflight.decision.reasons.includes("learning_pathway_unproven"));
    assert.equal(adapter.calls.some((call) => call[0] === "applyCandidate"), false);
  });

  await pass("governance approval boundary stops before deployment", async () => {
    const store = keyedMemoryStore();
    const adapter = promotionAdapter();
    const result = await runGovernedEvolution({
      ...governanceFixture({ governancePolicy: { decision: "REQUIRE_APPROVAL", budgetTolerance: 0 } }),
      storeAdapter: store,
      ...engineFixture(adapter)
    });
    assert.equal(result.outcome, "GOVERNANCE_APPROVAL_REQUIRED");
    assert.equal(adapter.calls.some((call) => call[0] === "applyCandidate"), false);
  });

  await pass("valid V4.4 candidate crosses governance then existing durable promotion core", async () => {
    const store = keyedMemoryStore();
    const adapter = promotionAdapter();
    const fixture = governanceFixture();
    const result = await runGovernedEvolution({
      ...fixture,
      storeAdapter: store,
      ...engineFixture(adapter)
    });
    assert.equal(result.outcome, "COMMITTED");
    assert.equal(result.transaction.state, "COMMITTED");
    assert.ok(adapter.calls.some((call) => call[0] === "applyCandidate"));
    const journal = await loadCampaignJournal({ storeAdapter: store, campaignId: fixture.campaign.id });
    const inspection = inspectCampaignJournal(journal);
    assert.equal(inspection.valid, true);
    assert.ok(journal.ledger.some((entry) => entry.type === "GOVERNANCE_ACCEPTED"));
    assert.ok(journal.ledger.some((entry) => entry.type === "ENGINE_OUTCOME" && entry.payload.outcome === "COMMITTED"));
  });

  console.log("self-evolution v4.4 governed runtime test suite: PASS");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
