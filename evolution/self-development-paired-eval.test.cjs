"use strict";

const assert = require("assert/strict");
const { createEvalLock } = require("./eval-lock.cjs");
const {
  getMetricDefinition,
  listMetricDefinitions,
  validateMetricValue
} = require("./self-development-metrics.cjs");
const {
  createEvaluationManifest,
  compareMetric,
  evaluatePaired
} = require("./self-development-paired-eval.cjs");

function pass(name, fn) {
  fn();
  console.log("PASS", name);
}

const BASE_SHA = "1".repeat(40);
const CANDIDATE_SHA = "2".repeat(40);

function manifest(overrides = {}) {
  return createEvaluationManifest({
    experimentId: "phase2-fixture",
    evalLock: createEvalLock({ purpose: "self-development-phase2-test", experimentId: "phase2-fixture" }),
    baselineIdentity: { sha: BASE_SHA, artifactType: "git-tree" },
    candidateIdentity: { sha: CANDIDATE_SHA, artifactType: "git-tree" },
    environment: {
      platform: "linux",
      runtime: "node",
      runtimeVersion: process.version,
      architecture: process.arch,
      buildProfile: "ci",
      fixtureVersion: "phase2-v1"
    },
    metrics: ["qualityScore", "testsPass", "crashRate", "p90LatencyMs"],
    targetMetrics: ["qualityScore"],
    requiredHardGates: ["contracts", "regression"],
    ...overrides
  });
}

function run(manifestValue, id, metrics, environmentDigest = manifestValue.environmentDigest) {
  return {
    runId: id,
    environmentDigest,
    metrics
  };
}

function threeRuns(manifestValue, side, quality, latency, extra = {}) {
  return [1, 2, 3].map((n) => run(manifestValue, `${side}-${n}`, {
    qualityScore: quality,
    testsPass: 1,
    crashRate: 0,
    p90LatencyMs: latency,
    ...extra
  }));
}

pass("metric registry is fixed, validated and returned as immutable copies", () => {
  const definition = getMetricDefinition("qualityScore");
  assert.equal(definition.direction, "HIGHER_IS_BETTER");
  assert.equal(Object.isFrozen(definition), true);
  assert.throws(() => { definition.minImprovement = -10; }, TypeError);
  assert.ok(listMetricDefinitions().some((item) => item.id === "memoryRecall"));
  assert.equal(validateMetricValue("qualityScore", 0.8), 0.8);
  assert.throws(() => validateMetricValue("qualityScore", 1.1), /above maximum/);
  assert.throws(() => getMetricDefinition("inventedSuccessMetric"), /unknown self-development metric/);
});

pass("evaluation manifest binds exact identities, evaluator lock and success criteria", () => {
  const value = manifest();
  assert.equal(value.baselineIdentity.sha, BASE_SHA);
  assert.equal(value.candidateIdentity.sha, CANDIDATE_SHA);
  assert.deepEqual(value.targetMetrics, ["qualityScore"]);
  assert.ok(/^[0-9a-f]{64}$/.test(value.manifestDigest));
  assert.ok(/^[0-9a-f]{64}$/.test(value.environmentDigest));
});

pass("tampered evaluator lock is rejected before a manifest can exist", () => {
  const lock = createEvalLock({ purpose: "tamper-test" });
  assert.throws(() => createEvaluationManifest({
    experimentId: "tampered-lock",
    evalLock: { ...lock, corpusHash: "0".repeat(64) },
    baselineIdentity: { sha: BASE_SHA },
    candidateIdentity: { sha: CANDIDATE_SHA },
    environment: { platform: "linux", runtime: "node" },
    metrics: ["qualityScore"],
    targetMetrics: ["qualityScore"]
  }), /evaluation lock invalid/);
});

pass("baseline and candidate must be different exact SHAs", () => {
  assert.throws(() => createEvaluationManifest({
    experimentId: "same-identity",
    evalLock: createEvalLock(),
    baselineIdentity: { sha: BASE_SHA },
    candidateIdentity: { sha: BASE_SHA },
    environment: { platform: "linux", runtime: "node" },
    metrics: ["qualityScore"],
    targetMetrics: ["qualityScore"]
  }), /candidate identity must differ/);

  assert.throws(() => createEvaluationManifest({
    experimentId: "symbolic-ref",
    evalLock: createEvalLock(),
    baselineIdentity: { sha: "main" },
    candidateIdentity: { sha: CANDIDATE_SHA },
    environment: { platform: "linux", runtime: "node" },
    metrics: ["qualityScore"],
    targetMetrics: ["qualityScore"]
  }), /exact 40-char SHA/);
});

pass("environment identity rejects secret-like values", () => {
  assert.throws(() => createEvaluationManifest({
    experimentId: "secret-env",
    evalLock: createEvalLock(),
    baselineIdentity: { sha: BASE_SHA },
    candidateIdentity: { sha: CANDIDATE_SHA },
    environment: { platform: "linux", modelSetVersion: "ghp_abcdefghijklmnopqrstuvwxyz123456" },
    metrics: ["qualityScore"],
    targetMetrics: ["qualityScore"]
  }), /secret-like environment identity/);
});

pass("paired evaluation passes only when target improves under the same environment", () => {
  const value = manifest();
  const result = evaluatePaired({
    manifest: value,
    baselineRuns: threeRuns(value, "base", 0.70, 120),
    candidateRuns: threeRuns(value, "candidate", 0.74, 125),
    hardGateResults: { contracts: true, regression: true }
  });
  assert.equal(result.decision, "PASS");
  assert.equal(result.comparisons.find((item) => item.metricId === "qualityScore").status, "IMPROVED");
  assert.equal(result.comparisons.find((item) => item.metricId === "p90LatencyMs").status, "NEUTRAL");
  assert.ok(/^[0-9a-f]{64}$/.test(result.evidenceDigest));
});

pass("lower-is-better metrics can be the explicit target", () => {
  const value = manifest({
    metrics: ["p90LatencyMs", "testsPass", "crashRate"],
    targetMetrics: ["p90LatencyMs"]
  });
  const baselineRuns = [1, 2, 3].map((n) => run(value, `b-${n}`, { p90LatencyMs: 200, testsPass: 1, crashRate: 0 }));
  const candidateRuns = [1, 2, 3].map((n) => run(value, `c-${n}`, { p90LatencyMs: 160, testsPass: 1, crashRate: 0 }));
  const result = evaluatePaired({
    manifest: value,
    baselineRuns,
    candidateRuns,
    hardGateResults: { contracts: true, regression: true }
  });
  assert.equal(result.decision, "PASS");
  assert.equal(result.comparisons.find((item) => item.metricId === "p90LatencyMs").status, "IMPROVED");
});

pass("insufficient samples stay INCONCLUSIVE instead of being promoted", () => {
  const value = manifest();
  const result = evaluatePaired({
    manifest: value,
    baselineRuns: [
      run(value, "b-1", { qualityScore: 0.70, testsPass: 1, crashRate: 0, p90LatencyMs: 120 }),
      run(value, "b-2", { qualityScore: 0.70, testsPass: 1, crashRate: 0, p90LatencyMs: 120 })
    ],
    candidateRuns: [
      run(value, "c-1", { qualityScore: 0.90, testsPass: 1, crashRate: 0, p90LatencyMs: 120 }),
      run(value, "c-2", { qualityScore: 0.90, testsPass: 1, crashRate: 0, p90LatencyMs: 120 })
    ],
    hardGateResults: { contracts: true, regression: true }
  });
  assert.equal(result.decision, "INCONCLUSIVE");
  assert.ok(result.reasons.some((reason) => reason.includes("metric_inconclusive:qualityScore")));
});

pass("unequal paired run counts are INCONCLUSIVE to prevent cherry-picking", () => {
  const value = manifest();
  const result = evaluatePaired({
    manifest: value,
    baselineRuns: threeRuns(value, "base", 0.70, 120),
    candidateRuns: [
      run(value, "c-1", { qualityScore: 0.90, testsPass: 1, crashRate: 0, p90LatencyMs: 100 }),
      run(value, "c-2", { qualityScore: 0.90, testsPass: 1, crashRate: 0, p90LatencyMs: 100 }),
      run(value, "c-3", { qualityScore: 0.90, testsPass: 1, crashRate: 0, p90LatencyMs: 100 }),
      run(value, "c-4", { qualityScore: 0.90, testsPass: 1, crashRate: 0, p90LatencyMs: 100 })
    ],
    hardGateResults: { contracts: true, regression: true }
  });
  assert.equal(result.decision, "INCONCLUSIVE");
  assert.ok(result.reasons.includes("run_count_mismatch"));
});

pass("environment mismatch is BLOCKED before metric comparison", () => {
  const value = manifest();
  const result = evaluatePaired({
    manifest: value,
    baselineRuns: threeRuns(value, "base", 0.70, 120),
    candidateRuns: [
      run(value, "c-1", { qualityScore: 0.80, testsPass: 1, crashRate: 0, p90LatencyMs: 100 }, "f".repeat(64))
    ],
    hardGateResults: { contracts: true, regression: true }
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("candidate_environment_mismatch"));
});

pass("run metrics cannot silently add a new success criterion", () => {
  const value = manifest();
  const candidateRuns = threeRuns(value, "candidate", 0.80, 100);
  candidateRuns[0] = {
    ...candidateRuns[0],
    metrics: { ...candidateRuns[0].metrics, magicWinScore: 1 }
  };
  const result = evaluatePaired({
    manifest: value,
    baselineRuns: threeRuns(value, "base", 0.70, 120),
    candidateRuns,
    hardGateResults: { contracts: true, regression: true }
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons[0].includes("metric_not_in_manifest"));
});

pass("missing mandatory hard-gate evidence is INCONCLUSIVE", () => {
  const value = manifest();
  const result = evaluatePaired({
    manifest: value,
    baselineRuns: threeRuns(value, "base", 0.70, 120),
    candidateRuns: threeRuns(value, "candidate", 0.80, 100),
    hardGateResults: { contracts: true }
  });
  assert.equal(result.decision, "INCONCLUSIVE");
  assert.ok(result.reasons.includes("hard_gate_missing:regression"));
});

pass("failed hard gate overrides an otherwise better candidate", () => {
  const value = manifest();
  const result = evaluatePaired({
    manifest: value,
    baselineRuns: threeRuns(value, "base", 0.70, 120),
    candidateRuns: threeRuns(value, "candidate", 0.90, 80),
    hardGateResults: { contracts: false, regression: true }
  });
  assert.equal(result.decision, "FAIL");
  assert.ok(result.reasons.includes("hard_gate_failed:contracts"));
});

pass("hard metric regression overrides quality gains", () => {
  const value = manifest();
  const candidateRuns = threeRuns(value, "candidate", 0.90, 80, { crashRate: 0.01 });
  const result = evaluatePaired({
    manifest: value,
    baselineRuns: threeRuns(value, "base", 0.70, 120),
    candidateRuns,
    hardGateResults: { contracts: true, regression: true }
  });
  assert.equal(result.decision, "FAIL");
  const crash = result.comparisons.find((item) => item.metricId === "crashRate");
  assert.equal(crash.hardViolation, true);
  assert.equal(crash.status, "REGRESSED");
});

pass("non-hard regression beyond tolerance also rejects a candidate", () => {
  const value = manifest();
  const result = evaluatePaired({
    manifest: value,
    baselineRuns: threeRuns(value, "base", 0.70, 100),
    candidateRuns: threeRuns(value, "candidate", 0.90, 160),
    hardGateResults: { contracts: true, regression: true }
  });
  assert.equal(result.decision, "FAIL");
  assert.ok(result.reasons.includes("metric_regressed:p90LatencyMs"));
});

pass("a measured candidate that does not improve its declared target fails", () => {
  const value = manifest();
  const result = evaluatePaired({
    manifest: value,
    baselineRuns: threeRuns(value, "base", 0.70, 120),
    candidateRuns: threeRuns(value, "candidate", 0.71, 100),
    hardGateResults: { contracts: true, regression: true }
  });
  assert.equal(result.decision, "FAIL");
  assert.ok(result.reasons.includes("target_metric_not_improved"));
});

pass("excessive variance makes the comparison INCONCLUSIVE", () => {
  const compared = compareMetric("qualityScore", [0.70, 0.70, 0.70], [0.1, 0.5, 1.0]);
  assert.equal(compared.status, "INCONCLUSIVE");
  assert.equal(compared.reason, "candidate_excessive_variance");
});

pass("manifest tampering is BLOCKED rather than evaluated", () => {
  const value = manifest();
  const tampered = { ...value, targetMetrics: Object.freeze(["p90LatencyMs"]) };
  const result = evaluatePaired({
    manifest: tampered,
    baselineRuns: threeRuns(value, "base", 0.70, 120),
    candidateRuns: threeRuns(value, "candidate", 0.90, 80),
    hardGateResults: { contracts: true, regression: true }
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("manifest_integrity_failed"));
});

console.log("self-development paired evaluator test suite: PASS");
