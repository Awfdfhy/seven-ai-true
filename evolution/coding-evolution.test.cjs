"use strict";

const assert = require("assert/strict");
const { createStateEnvelope } = require("./state-store.cjs");
const { loadDurableEvolutionState } = require("./durable-engine.cjs");
const { runCodingEvolution } = require("./coding-evolution.cjs");

async function pass(name, fn) {
  await fn();
  console.log("PASS", name);
}

function storeAdapter() {
  let committed = null;
  let temp = null;
  return {
    async writeTemp({ envelope }) { temp = envelope; },
    async commitTemp({ expectedChecksum }) {
      if (!temp || temp.checksum !== expectedChecksum) throw new Error("temp mismatch");
      committed = temp;
      temp = null;
    },
    async readCommitted() { return committed; },
    seed(state) { committed = createStateEnvelope(state, { savedAt: "2026-09-13T01:00:00.000Z" }); }
  };
}

function codingAgent(options = {}) {
  let stable = "aaaaaaa";
  const calls = [];
  return {
    calls,
    setStable(value) { stable = value; },
    async getStableHeadSha() { calls.push(["getStableHeadSha", stable]); return stable; },
    async prepareCandidate() { calls.push(["prepareCandidate"]); return { isolated: true, baselineSha: "aaaaaaa", workspaceId: "ws-auto" }; },
    async reproduce() { calls.push(["reproduce"]); return { reproduced: true }; },
    async repair() { calls.push(["repair"]); return { changed: true }; },
    async review() { calls.push(["review"]); return { approved: true }; },
    async regression() { calls.push(["regression"]); return { passed: true }; },
    async getChangedPaths() { calls.push(["getChangedPaths"]); return options.changedPaths || ["seven_ai-final.html"]; },
    async getCandidateSha() { calls.push(["getCandidateSha"]); return "bbbbbbb"; },
    async discardCandidate({ reason }) { calls.push(["discardCandidate", reason]); },
    async restoreStable({ baselineSha }) { calls.push(["restoreStable", baselineSha]); stable = baselineSha; }
  };
}

function evalBundle(overrides = {}) {
  return {
    source: "seven-evals",
    verified: true,
    evidenceId: "eval-evidence-1",
    baselineSha: "aaaaaaa",
    candidateSha: "bbbbbbb",
    baselineMetrics: { tests: 1, quality: 0.8, reliability: 0.8, performance: 0.7, efficiency: 0.7 },
    candidateMetrics: { tests: 1, quality: 0.9, reliability: 0.9, performance: 0.8, efficiency: 0.8 },
    regressionFree: true,
    criticalRegression: false,
    shadowPassed: true,
    canaryPassed: true,
    riskAssessment: { verified: true, source: "trusted-policy", level: "LOW" },
    ...overrides
  };
}

function evalsAdapter(bundle = evalBundle(), hook = null) {
  return {
    async evaluateCandidate(input) {
      if (hook) await hook(input);
      return bundle;
    }
  };
}

function promotionAdapter(verification = { ciPassed: true, regressionFree: true }) {
  let head = "aaaaaaa";
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

function experimentConfig() {
  return {
    id: "auto-coding-evolution",
    subsystem: "coding-agent",
    hypothesis: "repair improves coding reliability",
    baselineRef: "aaaaaaa",
    candidateRef: "isolated-workspace",
    allowedPaths: ["seven_ai-final.html"]
  };
}

function baseInput({ agent = codingAgent(), evals = evalsAdapter(), promotion = promotionAdapter(), store = storeAdapter(), approvalPolicy } = {}) {
  return {
    experimentConfig: experimentConfig(),
    baselineSha: "aaaaaaa",
    codingAgent: agent,
    evalsAdapter: evals,
    promotionAdapter: promotion,
    storeAdapter: store,
    approvalPolicy: approvalPolicy || { autoPromotionEnabled: true, maxAutoRisk: "LOW" }
  };
}

(async () => {
  await pass("full coding evolution path reaches committed durable state", async () => {
    const store = storeAdapter();
    const agent = codingAgent();
    const promotion = promotionAdapter();
    const result = await runCodingEvolution(baseInput({ agent, promotion, store }));
    assert.equal(result.outcome, "COMMITTED");
    const state = await loadDurableEvolutionState({ storeAdapter: store });
    assert.equal(state.phase, "COMPLETE");
    assert.equal(state.candidate.metadata.workspaceId, "ws-auto");
    assert.equal(state.candidate.metadata.evalEvidenceId, "eval-evidence-1");
    assert.ok(promotion.calls.some((call) => call[0] === "applyCandidate"));
    assert.ok(agent.calls.some((call) => call[0] === "discardCandidate"));
  });

  await pass("untrusted eval bundle is rejected before stable promotion", async () => {
    const promotion = promotionAdapter();
    const agent = codingAgent();
    const result = await runCodingEvolution(baseInput({
      agent,
      promotion,
      evals: evalsAdapter(evalBundle({ source: "candidate-self-report" }))
    }));
    assert.equal(result.outcome, "REJECTED_EVALS");
    assert.ok(result.validation.reasons.includes("untrusted_source"));
    assert.equal(promotion.calls.some((call) => call[0] === "applyCandidate"), false);
    assert.ok(agent.calls.some((call) => call[0] === "discardCandidate"));
  });

  await pass("candidate/eval SHA mismatch is rejected", async () => {
    const promotion = promotionAdapter();
    const result = await runCodingEvolution(baseInput({
      promotion,
      evals: evalsAdapter(evalBundle({ candidateSha: "ccccccc" }))
    }));
    assert.equal(result.outcome, "REJECTED_EVALS");
    assert.ok(result.validation.reasons.includes("candidate_binding_mismatch"));
    assert.equal(promotion.calls.some((call) => call[0] === "applyCandidate"), false);
  });

  await pass("evals touching stable branch is restored and rejected", async () => {
    const agent = codingAgent();
    const promotion = promotionAdapter();
    const evals = evalsAdapter(evalBundle(), async () => { agent.setStable("ccccccc"); });
    const result = await runCodingEvolution(baseInput({ agent, promotion, evals }));
    assert.equal(result.outcome, "REJECTED_STABLE_MUTATION");
    assert.ok(agent.calls.some((call) => call[0] === "restoreStable"));
    assert.equal(promotion.calls.some((call) => call[0] === "applyCandidate"), false);
  });

  await pass("failed shadow evaluation rejects candidate and cleans workspace", async () => {
    const agent = codingAgent();
    const promotion = promotionAdapter();
    const result = await runCodingEvolution(baseInput({
      agent,
      promotion,
      evals: evalsAdapter(evalBundle({ shadowPassed: false }))
    }));
    assert.equal(result.outcome, "REJECTED");
    assert.equal(result.evolution.stage, "SHADOW");
    assert.equal(promotion.calls.some((call) => call[0] === "applyCandidate"), false);
    assert.ok(agent.calls.some((call) => call[0] === "discardCandidate"));
  });

  await pass("high risk remains pending and keeps workspace for later approval", async () => {
    const agent = codingAgent();
    const result = await runCodingEvolution(baseInput({
      agent,
      evals: evalsAdapter(evalBundle({ riskAssessment: { verified: true, source: "trusted-policy", level: "HIGH" } })),
      approvalPolicy: { autoPromotionEnabled: true, maxAutoRisk: "LOW" }
    }));
    assert.equal(result.outcome, "PENDING_APPROVAL");
    assert.equal(agent.calls.some((call) => call[0] === "discardCandidate"), false);
  });

  await pass("post-apply regression rolls back and cleans isolated workspace", async () => {
    const agent = codingAgent();
    const promotion = promotionAdapter({ ciPassed: false, regressionFree: false });
    const result = await runCodingEvolution(baseInput({ agent, promotion }));
    assert.equal(result.outcome, "ROLLED_BACK");
    assert.ok(promotion.calls.some((call) => call[0] === "rollbackTo"));
    assert.ok(agent.calls.some((call) => call[0] === "discardCandidate"));
  });

  console.log("coding evolution integration test suite: PASS");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
