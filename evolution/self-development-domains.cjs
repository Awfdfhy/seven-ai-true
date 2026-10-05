"use strict";

const crypto = require("crypto");
const { createHypothesis } = require("./self-development-hypotheses.cjs");
const { getMetricDefinition } = require("./self-development-metrics.cjs");
const { createEvaluationManifest } = require("./self-development-paired-eval.cjs");

const RISK_RANK = Object.freeze({ LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 });

const POLICIES = Object.freeze({
  prompts: Object.freeze({
    id: "prompts",
    allowedChangeClasses: Object.freeze(["prompt"]),
    minRisk: "LOW",
    primaryMetrics: Object.freeze(["qualityScore"]),
    guardMetrics: Object.freeze(["taskSuccess", "p90LatencyMs", "totalTokens"]),
    requiredHardGates: Object.freeze(["contracts", "content-privacy", "regression"])
  }),
  context: Object.freeze({
    id: "context",
    allowedChangeClasses: Object.freeze(["context"]),
    minRisk: "MEDIUM",
    primaryMetrics: Object.freeze(["qualityScore", "totalTokens"]),
    guardMetrics: Object.freeze(["taskSuccess", "memoryRecall"]),
    requiredHardGates: Object.freeze(["contracts", "content-privacy", "regression", "scope-isolation"])
  }),
  memory: Object.freeze({
    id: "memory",
    allowedChangeClasses: Object.freeze(["memory"]),
    minRisk: "MEDIUM",
    primaryMetrics: Object.freeze(["memoryRecall", "memoryPrecision", "memoryAbstentionAccuracy"]),
    guardMetrics: Object.freeze(["taskSuccess", "crashRate"]),
    requiredHardGates: Object.freeze(["forget-semantics", "provenance", "regression", "scope-isolation"])
  }),
  model_routing: Object.freeze({
    id: "model_routing",
    allowedChangeClasses: Object.freeze(["routing"]),
    minRisk: "MEDIUM",
    primaryMetrics: Object.freeze(["routingTaskSuccess", "p90LatencyMs", "costEstimateUsd"]),
    guardMetrics: Object.freeze(["errorRate"]),
    requiredHardGates: Object.freeze(["capability-eligibility", "provider-health", "regression"])
  }),
  tool_selection: Object.freeze({
    id: "tool_selection",
    allowedChangeClasses: Object.freeze(["tool_selection"]),
    minRisk: "MEDIUM",
    primaryMetrics: Object.freeze(["toolSuccessRate", "toolHallucinationRate"]),
    guardMetrics: Object.freeze(["errorRate", "crashRate"]),
    requiredHardGates: Object.freeze(["idempotency", "permissions", "regression", "schema"])
  }),
  web_research: Object.freeze({
    id: "web_research",
    allowedChangeClasses: Object.freeze(["research"]),
    minRisk: "MEDIUM",
    primaryMetrics: Object.freeze(["searchEvidenceCoverage", "qualityScore"]),
    guardMetrics: Object.freeze(["p90LatencyMs", "errorRate"]),
    requiredHardGates: Object.freeze(["citation-lock", "freshness", "regression", "source-provenance"])
  }),
  coding_behavior: Object.freeze({
    id: "coding_behavior",
    allowedChangeClasses: Object.freeze(["coding_behavior"]),
    minRisk: "HIGH",
    primaryMetrics: Object.freeze(["taskSuccess", "regressionDetectionRate"]),
    guardMetrics: Object.freeze(["testsPass", "crashRate"]),
    requiredHardGates: Object.freeze(["exact-sha", "protected-evaluator", "regression", "rollback"])
  }),
  latency: Object.freeze({
    id: "latency",
    allowedChangeClasses: Object.freeze(["latency"]),
    minRisk: "MEDIUM",
    primaryMetrics: Object.freeze(["p90LatencyMs", "firstTokenMs"]),
    guardMetrics: Object.freeze(["qualityScore", "taskSuccess"]),
    requiredHardGates: Object.freeze(["quality-floor", "regression"])
  }),
  token_efficiency: Object.freeze({
    id: "token_efficiency",
    allowedChangeClasses: Object.freeze(["token_efficiency"]),
    minRisk: "MEDIUM",
    primaryMetrics: Object.freeze(["totalTokens", "costEstimateUsd"]),
    guardMetrics: Object.freeze(["qualityScore", "taskSuccess"]),
    requiredHardGates: Object.freeze(["quality-floor", "regression"])
  }),
  ui_behavior: Object.freeze({
    id: "ui_behavior",
    allowedChangeClasses: Object.freeze(["ui_ordering", "error_handling"]),
    minRisk: "LOW",
    primaryMetrics: Object.freeze(["uiErrorRate", "taskSuccess"]),
    guardMetrics: Object.freeze(["crashRate", "stateRecoveryRate"]),
    requiredHardGates: Object.freeze(["accessibility", "lifecycle", "regression"])
  }),
  error_handling: Object.freeze({
    id: "error_handling",
    allowedChangeClasses: Object.freeze(["error_handling"]),
    minRisk: "MEDIUM",
    primaryMetrics: Object.freeze(["errorRate", "stateRecoveryRate"]),
    guardMetrics: Object.freeze(["taskSuccess"]),
    requiredHardGates: Object.freeze(["regression", "state-integrity"])
  }),
  agent_workflows: Object.freeze({
    id: "agent_workflows",
    allowedChangeClasses: Object.freeze(["agent_workflow"]),
    minRisk: "MEDIUM",
    primaryMetrics: Object.freeze(["taskSuccess", "p90LatencyMs"]),
    guardMetrics: Object.freeze(["errorRate", "stateRecoveryRate"]),
    requiredHardGates: Object.freeze(["cancellation", "isolation", "regression"])
  }),
  tests: Object.freeze({
    id: "tests",
    allowedChangeClasses: Object.freeze(["test_generation"]),
    minRisk: "MEDIUM",
    primaryMetrics: Object.freeze(["mutationKillRate", "regressionDetectionRate", "flakinessRate"]),
    guardMetrics: Object.freeze(["testsPass"]),
    requiredHardGates: Object.freeze(["evaluator-integrity", "held-out", "regression"])
  }),
  internal_architecture: Object.freeze({
    id: "internal_architecture",
    allowedChangeClasses: Object.freeze(["architecture", "shared_contract"]),
    minRisk: "HIGH",
    primaryMetrics: Object.freeze(["reliabilityScore", "taskSuccess", "stateRecoveryRate"]),
    guardMetrics: Object.freeze(["crashRate", "p90LatencyMs"]),
    requiredHardGates: Object.freeze(["contracts", "integration", "recovery", "regression", "security"])
  })
});

function stableObject(value) {
  if (Array.isArray(value)) return value.map(stableObject);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((out, key) => {
      out[key] = stableObject(value[key]);
      return out;
    }, {});
  }
  return value;
}

function digest(value) {
  return crypto.createHash("sha256").update(JSON.stringify(stableObject(value))).digest("hex");
}

function clonePolicy(policy) {
  return Object.freeze({
    id: policy.id,
    allowedChangeClasses: Object.freeze([...policy.allowedChangeClasses]),
    minRisk: policy.minRisk,
    primaryMetrics: Object.freeze([...policy.primaryMetrics]),
    guardMetrics: Object.freeze([...policy.guardMetrics]),
    requiredHardGates: Object.freeze([...policy.requiredHardGates])
  });
}

function getDomainPolicy(domain) {
  const id = String(domain || "").trim().toLowerCase();
  const policy = POLICIES[id];
  if (!policy) throw new Error(`unknown self-development optimization domain: ${id}`);
  for (const metric of [...policy.primaryMetrics, ...policy.guardMetrics]) getMetricDefinition(metric);
  return clonePolicy(policy);
}

function listDomainPolicies() {
  return Object.freeze(Object.keys(POLICIES).sort().map((id) => getDomainPolicy(id)));
}

function riskAtLeast(actual, minimum) {
  return (RISK_RANK[String(actual || "").toUpperCase()] || 99) >= (RISK_RANK[String(minimum || "").toUpperCase()] || 99);
}

function validateDomainHypothesis({ domain, hypothesis } = {}) {
  const policy = getDomainPolicy(domain);
  const validated = createHypothesis(hypothesis);

  if (!policy.allowedChangeClasses.includes(validated.changeClass)) {
    throw new Error(`change class ${validated.changeClass} is not allowed for domain ${policy.id}`);
  }
  if (!riskAtLeast(validated.risk.level, policy.minRisk)) {
    throw new Error(`domain ${policy.id} requires risk >= ${policy.minRisk}`);
  }

  const requiredMetrics = [...new Set([...policy.primaryMetrics, ...policy.guardMetrics])].sort();
  const missingMetrics = requiredMetrics.filter((metric) => !validated.validationMetrics.includes(metric));
  if (missingMetrics.length) {
    throw new Error(`domain validation metrics missing: ${missingMetrics.join(",")}`);
  }

  const primaryImproved = policy.primaryMetrics.filter((metric) => validated.expectedEffects[metric] === "IMPROVE");
  if (!primaryImproved.length) throw new Error("domain hypothesis must improve at least one primary metric");

  const invalidPrimaryEffects = policy.primaryMetrics.filter((metric) => {
    const effect = validated.expectedEffects[metric];
    return effect !== "IMPROVE" && effect !== "PRESERVE";
  });
  if (invalidPrimaryEffects.length) {
    throw new Error(`primary metric effects missing: ${invalidPrimaryEffects.join(",")}`);
  }

  const invalidGuards = policy.guardMetrics.filter((metric) => validated.expectedEffects[metric] !== "PRESERVE");
  if (invalidGuards.length) {
    throw new Error(`guard metrics must be PRESERVE: ${invalidGuards.join(",")}`);
  }

  const targetMetrics = Object.freeze(primaryImproved.sort());
  const requirementsCore = {
    domain: policy.id,
    hypothesisFingerprint: validated.fingerprint,
    riskLevel: validated.risk.level,
    validationMetrics: requiredMetrics,
    targetMetrics,
    guardMetrics: [...policy.guardMetrics].sort(),
    requiredHardGates: [...policy.requiredHardGates].sort()
  };

  return Object.freeze({
    schemaVersion: 1,
    domain: policy.id,
    policy,
    hypothesis: validated,
    validationMetrics: Object.freeze(requiredMetrics),
    targetMetrics,
    guardMetrics: Object.freeze([...policy.guardMetrics].sort()),
    requiredHardGates: Object.freeze([...policy.requiredHardGates].sort()),
    domainContractDigest: digest(requirementsCore),
    authority: "EVALUATION_REQUIREMENTS_ONLY"
  });
}

function createDomainEvaluationManifest({
  domain,
  hypothesis,
  experimentId,
  evalLock,
  baselineIdentity,
  candidateIdentity,
  environment,
  additionalHardGates = []
} = {}) {
  if (!Array.isArray(additionalHardGates)) throw new Error("additionalHardGates must be an array");
  const contract = validateDomainHypothesis({ domain, hypothesis });
  const hardGates = [...new Set([
    ...contract.requiredHardGates,
    ...additionalHardGates.map((gate) => String(gate))
  ])].sort();

  const manifest = createEvaluationManifest({
    experimentId,
    evalLock,
    baselineIdentity,
    candidateIdentity,
    environment,
    metrics: contract.validationMetrics,
    targetMetrics: contract.targetMetrics,
    requiredHardGates: hardGates
  });

  return Object.freeze({
    contract,
    manifest
  });
}

module.exports = {
  getDomainPolicy,
  listDomainPolicies,
  validateDomainHypothesis,
  createDomainEvaluationManifest
};
