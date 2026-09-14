"use strict";

const assert = require("assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");
const { freezeTarget, createCampaign } = require("./v44-governance.cjs");
const { createRecursionSupervisor } = require("./v44-supervisor.cjs");
const { createAutonomyEnvelope } = require("./v44-advanced-governance.cjs");
const { runStrictCodingEvolution } = require("./v44-coding-evolution.cjs");

const ROOT = path.resolve(__dirname, "..");
const TARGET_PATH = path.join(ROOT, "release", "performance-runtime.js");

function sha(value) {
  return crypto.createHash("sha1").update(String(value)).digest("hex");
}

function buildIdempotentCandidate(source) {
  let out = String(source);
  const edits = [
    [
      "const state={tier:'balanced',reducedMotion:false,longTasks:[],marks:[],ready:false};",
      "const state={tier:'balanced',reducedMotion:false,longTasks:[],marks:[],ready:false,observer:null,visibilityBound:false};"
    ],
    [
      "function observeLongTasks(){\n    if(!hasDOM||!root.PerformanceObserver)return null;\n    try{",
      "function observeLongTasks(){\n    if(!hasDOM||!root.PerformanceObserver)return null;\n    if(state.observer)return state.observer;\n    try{"
    ],
    [
      "      observer.observe({entryTypes:['longtask']});\n      return observer;",
      "      observer.observe({entryTypes:['longtask']});\n      state.observer=observer;\n      return observer;"
    ],
    [
      "  function suspendWhenHidden(){\n    if(!hasDOM)return;\n    doc.addEventListener('visibilitychange'",
      "  function suspendWhenHidden(){\n    if(!hasDOM||state.visibilityBound)return;\n    state.visibilityBound=true;\n    doc.addEventListener('visibilitychange'"
    ]
  ];
  for (const [from, to] of edits) {
    if (!out.includes(from)) throw new Error(`seeded canary repair pattern missing: ${from.slice(0, 45)}`);
    out = out.replace(from, to);
  }
  return out;
}

function probeRuntime(source, manualBoots = 2) {
  const stats = { observers: 0, visibilityListeners: 0 };
  class PerformanceObserver {
    constructor() { stats.observers += 1; }
    observe() {}
  }
  const classList = { add() {}, remove() {} };
  const document = {
    readyState: "complete",
    hidden: false,
    documentElement: { dataset: {}, classList },
    addEventListener(name) { if (name === "visibilitychange") stats.visibilityListeners += 1; }
  };
  const context = {
    module: { exports: {} },
    exports: {},
    document,
    navigator: { deviceMemory: 4, hardwareConcurrency: 4 },
    matchMedia() { return { matches: false }; },
    PerformanceObserver,
    performance: { now: () => 1 },
    setTimeout,
    clearTimeout
  };
  vm.runInNewContext(String(source), context, { filename: "performance-runtime.js" });
  const api = context.module.exports;
  assert.equal(typeof api.boot, "function");
  for (let i = 0; i < manualBoots; i += 1) api.boot();
  return { ...stats, snapshot: api.snapshot() };
}

function keyedStore() {
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

function createWorkspaceAgent(baselineSource, baselineSha) {
  let stable = baselineSha;
  let workspace = null;
  let candidateFile = null;
  const calls = [];
  return {
    calls,
    async getStableHeadSha() { return stable; },
    async prepareCandidate() {
      workspace = fs.mkdtempSync(path.join(os.tmpdir(), "seven-v44-canary-"));
      candidateFile = path.join(workspace, "performance-runtime.js");
      fs.writeFileSync(candidateFile, baselineSource, "utf8");
      calls.push(["prepareCandidate", workspace]);
      return { isolated: true, baselineSha, workspaceId: workspace };
    },
    async reproduce() {
      const before = probeRuntime(fs.readFileSync(candidateFile, "utf8"), 2);
      calls.push(["reproduce", before]);
      return { reproduced: before.observers > 1 && before.visibilityListeners > 1, before };
    },
    async repair() {
      const current = fs.readFileSync(candidateFile, "utf8");
      const next = buildIdempotentCandidate(current);
      fs.writeFileSync(candidateFile, next, "utf8");
      calls.push(["repair", sha(next)]);
      return { changed: next !== current };
    },
    async review() {
      const after = probeRuntime(fs.readFileSync(candidateFile, "utf8"), 3);
      calls.push(["review", after]);
      return { approved: after.observers === 1 && after.visibilityListeners === 1, after };
    },
    async regression() {
      const source = fs.readFileSync(candidateFile, "utf8");
      const after = probeRuntime(source, 5);
      const passed = after.observers === 1 && after.visibilityListeners === 1 && after.snapshot.ready === true;
      calls.push(["regression", passed]);
      return { passed, after };
    },
    async getChangedPaths() { return ["release/performance-runtime.js"]; },
    async getCandidateSha() { return sha(fs.readFileSync(candidateFile, "utf8")); },
    async discardCandidate() {
      calls.push(["discardCandidate"]);
      if (workspace) fs.rmSync(workspace, { recursive: true, force: true });
    },
    async restoreStable({ baselineSha: expected }) { stable = expected; },
    readCandidate() { return candidateFile && fs.existsSync(candidateFile) ? fs.readFileSync(candidateFile, "utf8") : null; }
  };
}

function promotionAdapter(baselineSha, getCandidateSource) {
  let head = baselineSha;
  const calls = [];
  return {
    calls,
    async getHeadSha() { return head; },
    async applyCandidate({ candidateSha, expectedBaseSha }) {
      if (head !== expectedBaseSha) throw new Error("base mismatch");
      calls.push(["applyCandidate", candidateSha]);
      head = candidateSha;
      return head;
    },
    async verifyCandidate() {
      const source = getCandidateSource();
      const proof = probeRuntime(source, 6);
      const pass = proof.observers === 1 && proof.visibilityListeners === 1;
      calls.push(["verifyCandidate", pass]);
      return { ciPassed: pass, regressionFree: pass };
    },
    async rollbackTo({ rollbackSha }) { calls.push(["rollbackTo", rollbackSha]); head = rollbackSha; return head; }
  };
}

(async () => {
  const baselineSource = fs.readFileSync(TARGET_PATH, "utf8");
  const baselineSha = sha(baselineSource);
  const baselineProbe = probeRuntime(baselineSource, 2);
  assert.ok(baselineProbe.observers > 1, "canary baseline must reproduce duplicate observers");
  assert.ok(baselineProbe.visibilityListeners > 1, "canary baseline must reproduce duplicate listeners");

  const agent = createWorkspaceAgent(baselineSource, baselineSha);
  const target = freezeTarget({
    id: "performance-runtime-idempotent-boot",
    lane: "ENGINEERING_EVOLUTION",
    scope: "CAMPAIGN_LOCAL",
    authorityHash: "seven-product-requirements-v1",
    requirements: ["boot must not duplicate background observers/listeners"],
    invariants: ["public performance API preserved", "stable source unchanged before promotion"],
    forbiddenRegressions: ["runtime boot failure"],
    generationLimit: 3
  });
  const constitutionHash = "sev4.4+polish5.40";
  const campaign = createCampaign({ id: "first-closed-loop-canary", target, constitutionHash, generation: 1 });
  const supervisor = createRecursionSupervisor({ id: "first-canary-supervisor", constitutionHash, maxPromotions: 3 });
  const judge = { hash: "performance-canary-judge-v1", independent: true, holdoutPassed: true, rollbackReady: true };
  const roles = {
    builder: { identity: "deterministic-repair-builder-v1", contextHash: "builder-context", memoryHash: "builder-memory" },
    judge: { identity: "performance-canary-judge-role-v1", contextHash: "judge-context", memoryHash: "judge-memory" },
    promotion: { identity: "external-promotion-plane-v1" }
  };
  const store = keyedStore();

  const evalsAdapter = {
    async evaluateCandidate({ baselineSha: expectedBaseline, candidateSha, workspaceId }) {
      assert.equal(expectedBaseline, baselineSha);
      const candidateSource = fs.readFileSync(path.join(workspaceId, "performance-runtime.js"), "utf8");
      assert.equal(sha(candidateSource), candidateSha);
      const before = probeRuntime(baselineSource, 4);
      const after = probeRuntime(candidateSource, 4);
      const fixed = before.observers > 1 && before.visibilityListeners > 1 && after.observers === 1 && after.visibilityListeners === 1;
      return {
        source: "seven-evals",
        verified: true,
        evidenceId: `perf-idempotency:${candidateSha}`,
        baselineSha,
        candidateSha,
        baselineMetrics: { tests: 1, quality: 0.8, reliability: 0.8, performance: 0.55, efficiency: 0.55 },
        candidateMetrics: { tests: fixed ? 1 : 0, quality: 0.9, reliability: 0.9, performance: fixed ? 0.9 : 0.4, efficiency: fixed ? 0.9 : 0.4 },
        regressionFree: fixed,
        criticalRegression: !fixed,
        shadowPassed: fixed,
        canaryPassed: fixed,
        riskAssessment: { verified: true, source: "trusted-policy", level: "LOW" }
      };
    }
  };

  let candidateSourceForPromotion = null;
  const promotion = promotionAdapter(baselineSha, () => candidateSourceForPromotion);
  const originalGetCandidateSha = agent.getCandidateSha.bind(agent);
  agent.getCandidateSha = async function() {
    candidateSourceForPromotion = agent.readCandidate();
    return originalGetCandidateSha();
  };

  const result = await runStrictCodingEvolution({
    experimentConfig: {
      id: "first-v44-performance-canary",
      subsystem: "performance-runtime",
      hypothesis: "idempotent boot removes duplicate observer/listener registration without API regression",
      baselineRef: baselineSha,
      candidateRef: "isolated-workspace",
      allowedPaths: ["release/performance-runtime.js"]
    },
    baselineSha,
    codingAgent: agent,
    evalsAdapter,
    promotionAdapter: promotion,
    storeAdapter: store,
    target,
    campaign,
    judge,
    roles,
    governancePolicy: { decision: "AUTO_ELIGIBLE", budgetTolerance: 0 },
    autonomyEnvelope: createAutonomyEnvelope({ id: "ci-canary-envelope", actions: { PROMOTE_CANDIDATE: "AUTO" } }),
    advancedEvidence: {
      capabilityConservation: {
        baseline: { sourceIntegrity: true, rollback: true },
        candidate: { sourceIntegrity: true, rollback: true },
        protectedCapabilities: ["sourceIntegrity", "rollback"]
      },
      propagation: { fromScale: "ACTION", toScale: "ACTION", authorized: false },
      oversight: { reviewMinutes: 0, interventionCount: 0, fatigueSignal: false, independentReview: true }
    },
    recursionSupervisor: supervisor,
    baselineBudget: { modelCalls: 0, toolCalls: 4, tokens: 0, wallTimeMs: 1, networkBytes: 0 },
    candidateBudget: { modelCalls: 0, toolCalls: 4, tokens: 0, wallTimeMs: 1, networkBytes: 0 },
    assistanceInput: { humanInterventions: 0, extraRetries: 0, strongerModelCalls: 0 },
    pathwayInput: {},
    promotionComponents: { rollbackHash: baselineSha },
    testAuthorHash: "performance-canary-test-author-v1",
    hiddenHoldoutHash: "performance-canary-holdout-v1",
    candidateClaims: { claimsAutonomous: true, claimsLearning: false },
    approvalPolicy: { autoPromotionEnabled: true, maxAutoRisk: "LOW" }
  });

  assert.equal(result.outcome, "COMMITTED");
  assert.equal(result.strict.strictV44.pass, true);
  assert.equal(result.strict.transaction.state, "COMMITTED");
  assert.ok(promotion.calls.some((call) => call[0] === "applyCandidate"));
  assert.ok(promotion.calls.some((call) => call[0] === "verifyCandidate" && call[1] === true));
  assert.ok(agent.calls.some((call) => call[0] === "reproduce"));
  assert.ok(agent.calls.some((call) => call[0] === "repair"));
  assert.ok(agent.calls.some((call) => call[0] === "regression" && call[1] === true));

  console.log("PASS first V4.4 closed-loop seeded canary campaign");
  console.log(JSON.stringify({
    campaignId: campaign.id,
    targetHash: target.hash,
    baselineSha,
    candidateSha: result.coding.candidateSha,
    outcome: result.outcome,
    evidenceId: result.evalBundle.evidenceId,
    baselineRegistrations: { observers: baselineProbe.observers, visibilityListeners: baselineProbe.visibilityListeners },
    promotionVerified: true,
    truthBoundary: "seeded deterministic CI canary; no production credentials or live repository promotion authority"
  }));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
