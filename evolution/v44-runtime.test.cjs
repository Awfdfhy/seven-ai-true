"use strict";

const assert = require("assert/strict");
const {
  freezeTarget,
  createCampaign,
  roleIsolationReceipt,
  matchedBudgetReceipt
} = require("./v44-governance.cjs");
const {
  createRecursionSupervisor,
  registerCampaign,
  inspectRecursionSupervisor
} = require("./v44-supervisor.cjs");
const reservation = require("./v44-promotion-reservations.cjs");
const {
  freezeEvaluationConstitution,
  createEvaluatorEscrow
} = require("./v44-eval-firewall.cjs");
const {
  createPromotionBundle,
  verifyPromotionBundle
} = require("./v44-promotion-bundle.cjs");
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
  const constitutionHash = "v5.40+sev4.4";
  const campaign = createCampaign({ id: "campaign-v44", target, constitutionHash, generation: 1 });
  const candidate = {
    hash: "candidate-hash-v1",
    authorityHash: "authority-v1",
    scope: "CAMPAIGN_LOCAL",
    claimsAutonomous: true,
    claimsLearning: true,
    touchesEvaluation: false
  };
  const evaluationConstitution = freezeEvaluationConstitution({
    comparisonEpoch: "epoch-1",
    corpusHash: "corpus-v1",
    judgeHash: "judge-v1",
    testAuthorHash: "test-author-v1",
    committedBeforeCandidate: true,
    hiddenHoldoutHash: "holdout-v1"
  });
  const promotionBundle = createPromotionBundle({
    candidateHash: candidate.hash,
    targetHash: target.hash,
    campaignId: campaign.id,
    generation: campaign.generation,
    evaluationConstitutionHash: evaluationConstitution.hash,
    components: {
      codeHash: "code-v1",
      promptHash: "prompt-v1",
      schemaHash: "schema-v1",
      toolManifestHash: "tools-v1",
      migrationHash: "migration-v1",
      rollbackHash: "rollback-v1"
    }
  });
  return {
    target,
    campaign,
    candidate,
    judge: {
      hash: "judge-v1",
      independent: true,
      evalLocked: true,
      holdoutPassed: true,
      forbiddenRegression: false,
      rollbackReady: true
    },
    roles: {
      builder: { identity: "builder-v1", contextHash: "ctx-builder", memoryHash: "mem-builder" },
      judge: { identity: "judge-role-v1", contextHash: "ctx-judge", memoryHash: "mem-judge" },
      promotion: { identity: "promotion-v1" }
    },
    assistanceInput: { humanInterventions: 0, extraRetries: 0, strongerModelCalls: 0 },
    pathwayInput: { saved: true, represented: true, retrieved: true, applied: true, updated: true, outcome: true },
    baselineBudget: { modelCalls: 10, toolCalls: 10, tokens: 1000, wallTimeMs: 1000, networkBytes: 10000 },
    candidateBudget: { modelCalls: 10, toolCalls: 10, tokens: 1000, wallTimeMs: 1000, networkBytes: 10000 },
    governancePolicy: { decision: "AUTO_ELIGIBLE", budgetTolerance: 0 },
    evaluationConstitution,
    promotionBundle,
    recursionSupervisor: createRecursionSupervisor({ id: "supervisor-v1", constitutionHash, maxPromotions: 10 }),
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
  });

  await pass("global supervisor reservation prevents nested campaigns exceeding the shared cap", async () => {
    const fixture = governanceFixture();
    const supervisor = createRecursionSupervisor({ id: "cap-one", constitutionHash: fixture.campaign.constitutionHash, maxPromotions: 1 });
    registerCampaign(supervisor, fixture.campaign);
    const first = reservation.reserve(supervisor, { campaignId: fixture.campaign.id, generation: fixture.campaign.generation, candidateHash: "c1" });
    assert.equal(first.state, "RESERVED");
    const nested = createCampaign({ id: "nested", target: fixture.target, constitutionHash: fixture.campaign.constitutionHash, generation: 2 });
    registerCampaign(supervisor, nested, { parentCampaignId: fixture.campaign.id });
    assert.throws(() => reservation.reserve(supervisor, { campaignId: nested.id, generation: nested.generation, candidateHash: "c2" }), /budget unavailable/);
    reservation.commit(supervisor, first.key);
    const inspection = inspectRecursionSupervisor(supervisor);
    assert.equal(inspection.promotionCount, 1);
  });

  await pass("evaluator replacement cannot activate inside the same comparison epoch", async () => {
    assert.throws(() => createEvaluatorEscrow({
      incumbentJudgeHash: "judge-v1",
      candidateJudgeHash: "judge-v2",
      calibrationEvidenceHash: "calibration-v2",
      approvedBy: "promotion-plane",
      currentEpoch: "epoch-1",
      effectiveEpoch: "epoch-1"
    }), /cannot activate inside/);
  });

  await pass("tampered promotion bundle is rejected", async () => {
    const fixture = governanceFixture();
    const tampered = { ...fixture.promotionBundle, candidateHash: "other-candidate" };
    const receipt = verifyPromotionBundle(tampered, { candidateHash: fixture.candidate.hash });
    assert.equal(receipt.valid, false);
    assert.ok(receipt.reasons.includes("bundle_hash_mismatch"));
  });

  await pass("candidate touching evaluation identity is rejected before deployment", async () => {
    const store = keyedMemoryStore();
    const adapter = promotionAdapter();
    const fixture = governanceFixture();
    fixture.candidate = { ...fixture.candidate, touchesEvaluation: true };
    const result = await runGovernedEvolution({ ...fixture, storeAdapter: store, ...engineFixture(adapter) });
    assert.equal(result.outcome, "GOVERNANCE_REJECTED");
    assert.ok(result.preflight.decision.reasons.includes("candidate_changed_evaluation_identity"));
    assert.equal(adapter.calls.some((call) => call[0] === "applyCandidate"), false);
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

  await pass("valid V4.4 candidate crosses both governance layers and commits", async () => {
    const store = keyedMemoryStore();
    const adapter = promotionAdapter();
    const fixture = governanceFixture();
    const result = await runGovernedEvolution({ ...fixture, storeAdapter: store, ...engineFixture(adapter) });
    assert.equal(result.outcome, "COMMITTED");
    assert.equal(result.transaction.state, "COMMITTED");
    assert.ok(adapter.calls.some((call) => call[0] === "applyCandidate"));
    const supervisor = inspectRecursionSupervisor(fixture.recursionSupervisor);
    assert.equal(supervisor.promotionCount, 1);
    assert.equal(supervisor.reservationCount || 0, 0);
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
