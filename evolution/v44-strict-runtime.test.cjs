"use strict";

const assert = require("assert/strict");
const { freezeTarget, createCampaign } = require("./v44-governance.cjs");
const { createRecursionSupervisor } = require("./v44-supervisor.cjs");
const { freezeEvaluationConstitution } = require("./v44-eval-firewall.cjs");
const { createPromotionBundle } = require("./v44-promotion-bundle.cjs");
const { createAutonomyEnvelope } = require("./v44-advanced-governance.cjs");
const { runStrictEvolution } = require("./v44-strict-runtime.cjs");

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

function strictFixture() {
  const constitutionHash = "v5.40+sev4.4";
  const target = freezeTarget({
    id: "strict-target",
    lane: "META_EVOLUTION",
    scope: "CAMPAIGN_LOCAL",
    authorityHash: "authority-v1",
    requirements: ["improve self-evolution"],
    invariants: ["truth", "rollback"],
    forbiddenRegressions: ["recovery-loss"],
    generationLimit: 10
  });
  const campaign = createCampaign({ id: "strict-campaign", target, constitutionHash, generation: 1 });
  const candidate = {
    hash: "strict-candidate-v1",
    authorityHash: "authority-v1",
    scope: "CAMPAIGN_LOCAL",
    claimsAutonomous: true,
    claimsLearning: true,
    claimsGeneralTransfer: true,
    changesToolLibrary: true,
    upgradesEvolutionEngine: true,
    touchesEvaluation: false,
    action: "PROMOTE_CANDIDATE"
  };
  const evaluationConstitution = freezeEvaluationConstitution({
    comparisonEpoch: "strict-epoch-1",
    corpusHash: "strict-corpus-v1",
    judgeHash: "strict-judge-v1",
    testAuthorHash: "strict-test-author-v1",
    committedBeforeCandidate: true,
    hiddenHoldoutHash: "strict-holdout-v1"
  });
  const promotionBundle = createPromotionBundle({
    candidateHash: candidate.hash,
    targetHash: target.hash,
    campaignId: campaign.id,
    generation: campaign.generation,
    evaluationConstitutionHash: evaluationConstitution.hash,
    components: {
      codeHash: "code",
      promptHash: "prompt",
      schemaHash: "schema",
      toolManifestHash: "tools",
      migrationHash: "migration",
      rollbackHash: "rollback"
    }
  });
  const autonomyEnvelope = createAutonomyEnvelope({ id: "strict-envelope", actions: { PROMOTE_CANDIDATE: "AUTO" } });
  const advancedEvidence = {
    approved: true,
    capabilityConservation: {
      baseline: { truth: 1, recovery: 1, permissions: true },
      candidate: { truth: 1, recovery: 1, permissions: true },
      protectedCapabilities: ["truth", "recovery", "permissions"],
      tolerance: 0
    },
    propagation: { fromScale: "EXPERIENCE", toScale: "GENERATION", authorized: true, evidenceHash: "propagation-proof" },
    substrateTransfer: {
      claim: "GENERAL",
      tested: [{ substrate: "model-a", passed: true }, { substrate: "model-b", passed: true }],
      requiredSubstrates: ["model-a", "model-b"]
    },
    toolLibraryHealth: {
      brokenDependencies: 0,
      compositionRegressions: 0,
      newDuplicateCapabilities: 0,
      orphanedTools: 0,
      rollbackReady: true
    },
    oversight: {
      reviewMinutes: 5,
      interventionCount: 1,
      fatigueSignal: false,
      independentReview: true,
      maxReviewMinutes: 30,
      maxInterventions: 5
    },
    bootstrapSupervisor: {
      incumbentEngineHash: "engine-old",
      candidateEngineHash: "engine-new",
      supervisorEngineHash: "engine-old",
      rollbackHash: "engine-old"
    }
  };
  return {
    target,
    campaign,
    candidate,
    judge: {
      hash: "strict-judge-v1",
      independent: true,
      evalLocked: true,
      holdoutPassed: true,
      forbiddenRegression: false,
      rollbackReady: true
    },
    roles: {
      builder: { identity: "strict-builder-v1", contextHash: "ctx-builder", memoryHash: "mem-builder" },
      judge: { identity: "strict-judge-role-v1", contextHash: "ctx-judge", memoryHash: "mem-judge" },
      promotion: { identity: "strict-promotion-v1" }
    },
    assistanceInput: { humanInterventions: 0, extraRetries: 0, strongerModelCalls: 0 },
    pathwayInput: { saved: true, represented: true, retrieved: true, applied: true, updated: true, outcome: true },
    baselineBudget: { modelCalls: 10, toolCalls: 10, tokens: 1000, wallTimeMs: 1000, networkBytes: 10000 },
    candidateBudget: { modelCalls: 10, toolCalls: 10, tokens: 1000, wallTimeMs: 1000, networkBytes: 10000 },
    governancePolicy: { decision: "AUTO_ELIGIBLE", budgetTolerance: 0 },
    evaluationConstitution,
    promotionBundle,
    recursionSupervisor: createRecursionSupervisor({ id: "strict-supervisor", constitutionHash, maxPromotions: 10 }),
    autonomyEnvelope,
    advancedEvidence
  };
}

function engineFixture(adapter) {
  return {
    experimentConfig: {
      id: "strict-runtime-integration",
      subsystem: "self-evolution",
      hypothesis: "strict runtime preserves governance while improving",
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
  await pass("strict entrypoint blocks protected capability regression before deployment", async () => {
    const adapter = promotionAdapter();
    const fixture = strictFixture();
    fixture.advancedEvidence = {
      ...fixture.advancedEvidence,
      capabilityConservation: {
        baseline: { truth: 1 },
        candidate: { truth: 0.5 },
        protectedCapabilities: ["truth"]
      }
    };
    const result = await runStrictEvolution({ ...fixture, storeAdapter: keyedMemoryStore(), ...engineFixture(adapter) });
    assert.equal(result.outcome, "ADVANCED_GOVERNANCE_REJECTED");
    assert.ok(result.strictV44.reasons.includes("capability_regression:truth"));
    assert.equal(adapter.calls.some((call) => call[0] === "applyCandidate"), false);
  });

  await pass("strict entrypoint passes all V4.4 gates and commits through the durable engine", async () => {
    const adapter = promotionAdapter();
    const fixture = strictFixture();
    const result = await runStrictEvolution({ ...fixture, storeAdapter: keyedMemoryStore(), ...engineFixture(adapter) });
    assert.equal(result.outcome, "COMMITTED");
    assert.equal(result.strictV44.pass, true);
    assert.equal(result.transaction.state, "COMMITTED");
    assert.ok(adapter.calls.some((call) => call[0] === "applyCandidate"));
  });

  console.log("self-evolution v4.4 strict runtime test suite: PASS");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
