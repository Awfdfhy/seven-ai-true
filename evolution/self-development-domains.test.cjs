"use strict";

const assert = require("assert/strict");
const { createEvalLock } = require("./eval-lock.cjs");
const { getMetricDefinition } = require("./self-development-metrics.cjs");
const { evaluatePaired } = require("./self-development-paired-eval.cjs");
const {
  getDomainPolicy,
  listDomainPolicies,
  validateDomainHypothesis,
  createDomainEvaluationManifest
} = require("./self-development-domains.cjs");

function pass(name, fn) {
  fn();
  console.log("PASS", name);
}

const BASE_SHA = "1".repeat(40);
const CANDIDATE_SHA = "2".repeat(40);

function safePathFor(domain) {
  if (domain === "coding_behavior") return "release/coding-behavior.js";
  if (domain === "internal_architecture") return "release/internal-architecture.js";
  return `release/${domain.replace(/_/g, "-")}.js`;
}

function hypothesisFor(domain, overrides = {}) {
  const policy = getDomainPolicy(domain);
  const primary = [...policy.primaryMetrics];
  const guards = [...policy.guardMetrics];
  const expectedEffects = {};
  primary.forEach((metric, index) => {
    expectedEffects[metric] = index === 0 ? "IMPROVE" : "PRESERVE";
  });
  guards.forEach((metric) => {
    expectedEffects[metric] = "PRESERVE";
  });

  return {
    id: overrides.id || `h-${domain}`,
    diagnosisId: "diag-phase8",
    mechanism: overrides.mechanism || `Bounded ${domain} optimization with domain-specific guard metrics.`,
    changeClass: overrides.changeClass || policy.allowedChangeClasses[0],
    targetPaths: overrides.targetPaths || [safePathFor(domain)],
    expectedEffects: overrides.expectedEffects || expectedEffects,
    validationMetrics: overrides.validationMetrics || [...new Set([...primary, ...guards])],
    assumptions: ["baseline and candidate environment are paired"],
    rollbackPlan: "restore exact baseline SHA",
    evidenceRefs: ["obs:phase8"],
    ...overrides
  };
}

function environment() {
  return {
    platform: "linux",
    runtime: "node",
    runtimeVersion: process.version,
    architecture: process.arch,
    buildProfile: "ci",
    fixtureVersion: "phase8-v1"
  };
}

function metricDefaults(contract, side) {
  const values = {};
  for (const metric of contract.validationMetrics) {
    const definition = getMetricDefinition(metric);
    let value = definition.unit === "ms" ? 100 : definition.unit === "tokens" ? 1000 : definition.unit === "usd" ? 0.01 : 0.8;

    if (metric === "testsPass") value = 1;
    if (metric === "regressionCount") value = 0;
    if (metric === "crashRate") value = 0;
    if (metric === "errorRate") value = 0.01;
    if (metric === "uiErrorRate") value = 0.01;
    if (metric === "toolHallucinationRate") value = 0.01;
    if (metric === "flakinessRate") value = 0.01;

    if (side === "candidate" && contract.targetMetrics.includes(metric)) {
      if (definition.direction === "HIGHER_IS_BETTER") value = Math.min(definition.max == null ? value + 0.1 : definition.max, value + 0.1);
      else {
        const step = definition.unit === "ms" ? 30 : definition.unit === "tokens" ? 100 : definition.unit === "usd" ? 0.003 : 0.02;
        value = Math.max(definition.min == null ? 0 : definition.min, value - step);
      }
    }
    values[metric] = value;
  }
  return values;
}

function runs(bundle, side, overrides = {}) {
  const defaults = metricDefaults(bundle.contract, side);
  return [1, 2, 3].map((n) => ({
    runId: `${side}-${n}`,
    manifestDigest: bundle.manifest.manifestDigest,
    environmentDigest: bundle.manifest.environmentDigest,
    metrics: { ...defaults, ...overrides }
  }));
}

function allGates(manifest, overrides = {}) {
  return Object.fromEntries(manifest.requiredHardGates.map((gate) => [gate, true]).concat(Object.entries(overrides)));
}

pass("all fourteen requested optimization domains have explicit immutable policies", () => {
  const policies = listDomainPolicies();
  assert.equal(policies.length, 14);
  assert.deepEqual(
    policies.map((policy) => policy.id),
    [
      "agent_workflows",
      "coding_behavior",
      "context",
      "error_handling",
      "internal_architecture",
      "latency",
      "memory",
      "model_routing",
      "prompts",
      "tests",
      "token_efficiency",
      "tool_selection",
      "ui_behavior",
      "web_research"
    ]
  );
  for (const policy of policies) {
    assert.equal(Object.isFrozen(policy), true);
    assert.ok(policy.primaryMetrics.length > 0);
    assert.ok(policy.guardMetrics.length > 0);
    assert.ok(policy.requiredHardGates.length > 0);
    for (const metric of [...policy.primaryMetrics, ...policy.guardMetrics]) {
      assert.ok(getMetricDefinition(metric));
    }
  }
});

pass("test-quality registry measures mutation detection and flakiness instead of test count", () => {
  assert.equal(getMetricDefinition("mutationKillRate").direction, "HIGHER_IS_BETTER");
  assert.equal(getMetricDefinition("regressionDetectionRate").direction, "HIGHER_IS_BETTER");
  const flaky = getMetricDefinition("flakinessRate");
  assert.equal(flaky.direction, "LOWER_IS_BETTER");
  assert.equal(flaky.hardConstraint.max, 0.05);
});

pass("every domain can produce a bounded evaluation contract with primary targets and preserved guards", () => {
  for (const policy of listDomainPolicies()) {
    const contract = validateDomainHypothesis({
      domain: policy.id,
      hypothesis: hypothesisFor(policy.id)
    });
    assert.equal(contract.domain, policy.id);
    assert.equal(contract.authority, "EVALUATION_REQUIREMENTS_ONLY");
    assert.ok(contract.targetMetrics.length >= 1);
    assert.ok(/^[0-9a-f]{64}$/.test(contract.domainContractDigest));
    for (const guard of policy.guardMetrics) {
      assert.ok(contract.validationMetrics.includes(guard));
      assert.equal(contract.hypothesis.expectedEffects[guard], "PRESERVE");
    }
  }
});

pass("domain optimizer cannot substitute a cheaper change class from another domain", () => {
  assert.throws(() => validateDomainHypothesis({
    domain: "memory",
    hypothesis: hypothesisFor("memory", { changeClass: "prompt" })
  }), /not allowed for domain memory/);

  assert.throws(() => validateDomainHypothesis({
    domain: "internal_architecture",
    hypothesis: hypothesisFor("internal_architecture", { changeClass: "prompt" })
  }), /not allowed for domain internal_architecture/);
});

pass("domain optimizer cannot omit guard metrics or turn a guard into an undeclared target", () => {
  const prompt = hypothesisFor("prompts");
  const missing = {
    ...prompt,
    validationMetrics: prompt.validationMetrics.filter((metric) => metric !== "taskSuccess")
  };
  assert.throws(() => validateDomainHypothesis({
    domain: "prompts",
    hypothesis: missing
  }), /(?:domain validation metrics missing: taskSuccess|expected metric missing from validation plan: taskSuccess)/);

  const guardTarget = {
    ...prompt,
    expectedEffects: {
      ...prompt.expectedEffects,
      taskSuccess: "IMPROVE"
    }
  };
  assert.throws(() => validateDomainHypothesis({
    domain: "prompts",
    hypothesis: guardTarget
  }), /guard metrics must be PRESERVE: taskSuccess/);
});

pass("coding and architecture optimizers are risk-floored at HIGH", () => {
  const coding = validateDomainHypothesis({
    domain: "coding_behavior",
    hypothesis: hypothesisFor("coding_behavior")
  });
  const architecture = validateDomainHypothesis({
    domain: "internal_architecture",
    hypothesis: hypothesisFor("internal_architecture")
  });
  assert.equal(coding.hypothesis.risk.level, "HIGH");
  assert.equal(architecture.hypothesis.risk.level, "HIGH");
});

pass("caller-supplied fake LOW risk cannot downgrade a high-risk domain hypothesis", () => {
  const raw = {
    ...hypothesisFor("coding_behavior"),
    risk: { level: "LOW" }
  };
  const contract = validateDomainHypothesis({ domain: "coding_behavior", hypothesis: raw });
  assert.equal(contract.hypothesis.risk.level, "HIGH");
});

pass("domain evaluation manifest locks domain metrics targets and hard gates before runs", () => {
  const bundle = createDomainEvaluationManifest({
    domain: "latency",
    hypothesis: hypothesisFor("latency"),
    experimentId: "phase8-latency",
    evalLock: createEvalLock({ purpose: "phase8-domain-test" }),
    baselineIdentity: { sha: BASE_SHA, artifactType: "git-tree" },
    candidateIdentity: { sha: CANDIDATE_SHA, artifactType: "git-tree" },
    environment: environment(),
    additionalHardGates: ["contracts"]
  });

  assert.deepEqual(bundle.manifest.metrics, bundle.contract.validationMetrics);
  assert.deepEqual(bundle.manifest.targetMetrics, bundle.contract.targetMetrics);
  assert.ok(bundle.manifest.requiredHardGates.includes("quality-floor"));
  assert.ok(bundle.manifest.requiredHardGates.includes("regression"));
  assert.ok(bundle.manifest.requiredHardGates.includes("contracts"));
});

pass("latency optimizer passes only with paired quality guards preserved", () => {
  const bundle = createDomainEvaluationManifest({
    domain: "latency",
    hypothesis: hypothesisFor("latency"),
    experimentId: "phase8-latency-pass",
    evalLock: createEvalLock({ purpose: "phase8-domain-test" }),
    baselineIdentity: { sha: BASE_SHA },
    candidateIdentity: { sha: CANDIDATE_SHA },
    environment: environment(),
    additionalHardGates: ["contracts"]
  });

  const result = evaluatePaired({
    manifest: bundle.manifest,
    baselineRuns: runs(bundle, "baseline"),
    candidateRuns: runs(bundle, "candidate"),
    hardGateResults: allGates(bundle.manifest)
  });
  assert.equal(result.decision, "PASS");
  assert.equal(result.comparisons.find((row) => row.metricId === "qualityScore").status, "NEUTRAL");
});

pass("token optimizer fails when cheaper output violates the quality guard", () => {
  const bundle = createDomainEvaluationManifest({
    domain: "token_efficiency",
    hypothesis: hypothesisFor("token_efficiency"),
    experimentId: "phase8-cost-guard",
    evalLock: createEvalLock({ purpose: "phase8-domain-test" }),
    baselineIdentity: { sha: BASE_SHA },
    candidateIdentity: { sha: CANDIDATE_SHA },
    environment: environment()
  });

  const result = evaluatePaired({
    manifest: bundle.manifest,
    baselineRuns: runs(bundle, "baseline"),
    candidateRuns: runs(bundle, "candidate", { qualityScore: 0.4 }),
    hardGateResults: allGates(bundle.manifest)
  });
  assert.equal(result.decision, "FAIL");
  assert.ok(result.reasons.includes("metric_regressed:qualityScore"));
});

pass("test optimizer rejects excessive flakiness even when mutation kill rate improves", () => {
  const bundle = createDomainEvaluationManifest({
    domain: "tests",
    hypothesis: hypothesisFor("tests"),
    experimentId: "phase8-tests-flaky",
    evalLock: createEvalLock({ purpose: "phase8-domain-test" }),
    baselineIdentity: { sha: BASE_SHA },
    candidateIdentity: { sha: CANDIDATE_SHA },
    environment: environment()
  });

  const result = evaluatePaired({
    manifest: bundle.manifest,
    baselineRuns: runs(bundle, "baseline"),
    candidateRuns: runs(bundle, "candidate", { flakinessRate: 0.10 }),
    hardGateResults: allGates(bundle.manifest)
  });
  assert.equal(result.decision, "FAIL");
  const flaky = result.comparisons.find((row) => row.metricId === "flakinessRate");
  assert.equal(flaky.hardViolation, true);
  assert.equal(flaky.status, "REGRESSED");
});

pass("memory optimization cannot call recall gain sufficient while precision/abstention guards are absent", () => {
  const memory = hypothesisFor("memory");
  const invalid = {
    ...memory,
    validationMetrics: memory.validationMetrics.filter((metric) =>
      !["memoryPrecision", "memoryAbstentionAccuracy"].includes(metric)
    )
  };
  assert.throws(() => validateDomainHypothesis({
    domain: "memory",
    hypothesis: invalid
  }), /domain validation metrics missing/);
});

pass("UI optimization remains measurable and cannot silently drop lifecycle/recovery guards", () => {
  const contract = validateDomainHypothesis({
    domain: "ui_behavior",
    hypothesis: hypothesisFor("ui_behavior")
  });
  assert.ok(contract.validationMetrics.includes("uiErrorRate"));
  assert.ok(contract.validationMetrics.includes("stateRecoveryRate"));
  assert.ok(contract.requiredHardGates.includes("accessibility"));
  assert.ok(contract.requiredHardGates.includes("lifecycle"));
});

console.log("self-development domain optimizer test suite: PASS");
