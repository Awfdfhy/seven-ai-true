"use strict";

const { isProtected, normalizeRepoPath } = require("./experiment-lab.cjs");

const SEVERITY_WEIGHT = Object.freeze({ INFO: 0, LOW: 1, MEDIUM: 2, HIGH: 4, CRITICAL: 8 });
const RISK_ORDER = Object.freeze({ LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 });

const CRITICAL_POLICY_PATHS = Object.freeze([
  /^evolution\//,
  /^eval\//,
  /^\.seven-team\/autonomy\//,
  /^\.github\/workflows\//,
  /^all\.cjs$/,
  /^verify\.cjs$/,
  /^runtime-smoke\.cjs$/,
  /^memory\.cjs$/,
  /^PROJECT_MANIFEST\.json$/
]);

const HIGH_POLICY_PATHS = Object.freeze([
  /^docs\/seven-master\/INTEGRATION_CONTRACTS\.md$/,
  /^docs\/seven-master\/DECISIONS\.md$/,
  /(?:^|\/)(?:auth|permission|security|keystore|credential)(?:\/|\.|$)/i,
  /(?:^|\/)(?:storage|persistence|migration)(?:\/|\.|$)/i
]);

const CHANGE_CLASS_RISK = Object.freeze({
  prompt: "LOW",
  ranking: "LOW",
  threshold: "LOW",
  ui_ordering: "LOW",
  context: "MEDIUM",
  memory: "MEDIUM",
  routing: "MEDIUM",
  tool_selection: "MEDIUM",
  research: "MEDIUM",
  latency: "MEDIUM",
  token_efficiency: "MEDIUM",
  error_handling: "MEDIUM",
  agent_workflow: "MEDIUM",
  test_generation: "MEDIUM",
  shared_contract: "HIGH",
  auth: "HIGH",
  permissions: "HIGH",
  storage_schema: "HIGH",
  core_execution: "HIGH",
  github_mutation: "HIGH",
  rollback: "HIGH",
  evaluator: "CRITICAL",
  self_development: "CRITICAL",
  protected_policy: "CRITICAL"
});

function negativeObservation(observation) {
  if (!observation || typeof observation !== "object") return false;
  if (["FAIL", "ERROR", "BLOCKED"].includes(observation.outcome)) return true;
  if (["HIGH", "CRITICAL"].includes(observation.severity)) return true;
  const m = observation.metrics || {};
  return Number(m.userCorrection || 0) > 0
    || Number(m.verificationFailure || 0) > 0
    || Number(m.crash || 0) > 0
    || Number(m.stateRestoreFailure || 0) > 0
    || Number(m.errorCount || 0) > 0;
}

function weaknessSignature(observation) {
  const meta = observation.metadata || {};
  const discriminator = meta.errorClass || meta.reasonCode || meta.stage || observation.outcome || "unknown";
  return [observation.subsystem, observation.kind, discriminator].map((x) => String(x || "unknown")).join("|");
}

function averageMetric(observations, key) {
  const values = observations.map((o) => o.metrics && o.metrics[key]).filter((v) => Number.isFinite(Number(v))).map(Number);
  if (!values.length) return null;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(6));
}

function aggregateWeaknesses(observations = []) {
  if (!Array.isArray(observations)) throw new Error("observations must be an array");
  const groups = new Map();
  for (const observation of observations) {
    if (!negativeObservation(observation)) continue;
    const signature = weaknessSignature(observation);
    if (!groups.has(signature)) groups.set(signature, []);
    groups.get(signature).push(observation);
  }

  return [...groups.entries()].map(([signature, rows]) => {
    const ordered = [...rows].sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
    const maxSeverity = ordered.reduce((best, row) => {
      return (SEVERITY_WEIGHT[row.severity] || 0) > (SEVERITY_WEIGHT[best] || 0) ? row.severity : best;
    }, "INFO");
    const last = ordered[ordered.length - 1];
    const metrics = {};
    for (const key of [
      "latencyMs",
      "firstTokenMs",
      "retryCount",
      "fallbackCount",
      "errorCount",
      "memoryHit",
      "toolSuccess",
      "searchSuccess",
      "verificationFailure",
      "userCorrection",
      "crash",
      "stateRestoreFailure",
      "taskSuccess",
      "qualityScore"
    ]) {
      const value = averageMetric(ordered, key);
      if (value !== null) metrics[key] = value;
    }

    const priorityScore = ordered.length * 2
      + (SEVERITY_WEIGHT[maxSeverity] || 0) * 3
      + Number(metrics.userCorrection || 0) * 4
      + Number(metrics.crash || 0) * 8
      + Number(metrics.verificationFailure || 0) * 5;

    return Object.freeze({
      schemaVersion: 1,
      signature,
      subsystem: last.subsystem,
      kind: last.kind,
      discriminator: (last.metadata && (last.metadata.errorClass || last.metadata.reasonCode || last.metadata.stage)) || last.outcome,
      count: ordered.length,
      firstAt: ordered[0].timestamp,
      lastAt: last.timestamp,
      maxSeverity,
      observationIds: Object.freeze(ordered.map((row) => row.id)),
      evidenceRefs: Object.freeze([...new Set(ordered.flatMap((row) => row.evidenceRefs || []))]),
      metrics: Object.freeze(metrics),
      priorityScore: Number(priorityScore.toFixed(6))
    });
  }).sort((a, b) => b.priorityScore - a.priorityScore || b.count - a.count || a.signature.localeCompare(b.signature));
}

function hypothesisTemplate(cluster) {
  const kind = String(cluster.kind || "").toLowerCase();
  const subsystem = String(cluster.subsystem || "").toLowerCase();

  if (kind.includes("tool") || subsystem.includes("tool")) {
    return {
      family: "tool_selection_or_execution",
      statement: "The failure cluster may originate in tool eligibility/selection, schema validation, permission gating, execution, or result validation.",
      experiment: "Replay the same task fixture with tool-selection and execution stages measured separately; compare missed/hallucinated tool rate and executor outcomes."
    };
  }
  if (kind.includes("search") || kind.includes("research") || subsystem.includes("research")) {
    return {
      family: "research_retrieval_or_verification",
      statement: "The failure cluster may originate in query planning, retrieval/fetch quality, evidence verification, or source synthesis.",
      experiment: "Run fixed research fixtures with acquisition, evidence coverage, freshness and verification metrics separated."
    };
  }
  if (kind.includes("memory") || subsystem.includes("memory")) {
    return {
      family: "memory_retrieval_or_context",
      statement: "The failure cluster may originate in memory intent gating, retrieval/reranking, temporal resolution, scope filtering, or context reconstruction.",
      experiment: "Replay held-out memory fixtures while measuring recall, precision, temporal/update correctness, abstention and context inclusion independently."
    };
  }
  if (kind.includes("route") || kind.includes("model") || subsystem.includes("model")) {
    return {
      family: "model_routing_or_provider_health",
      statement: "The failure cluster may originate in request classification, capability eligibility, health/quota state, routing score, or provider behavior.",
      experiment: "Compare the current router against a fixed simple baseline on the same requests with quality, cost/tokens, latency and route-recall metrics."
    };
  }
  if (kind.includes("coding") || kind.includes("verification") || subsystem.includes("coding")) {
    return {
      family: "coding_localization_patch_or_verification",
      statement: "The failure cluster may originate in issue reproduction, repository localization, patch construction, test selection, or verification.",
      experiment: "Reproduce the issue from an exact SHA and measure localization, patch scope, targeted tests and regression gates as separate stages."
    };
  }
  if (kind.includes("persistence") || kind.includes("restore") || subsystem.includes("persistence")) {
    return {
      family: "persistence_or_recovery",
      statement: "The failure cluster may originate in commit ordering, migration, corruption handling, restore, or cross-lifecycle recovery.",
      experiment: "Run deterministic restart/corruption/migration fixtures with canonical-state integrity checks."
    };
  }
  if (kind.includes("crash")) {
    return {
      family: "runtime_stability",
      statement: "A runtime stability defect is plausible and must be reproduced before optimization work continues.",
      experiment: "Reproduce under the same artifact/environment identity and capture the smallest content-free failure signature plus recovery behavior."
    };
  }
  if (kind.includes("ui") || subsystem.includes("ui")) {
    return {
      family: "ui_runtime_or_state_projection",
      statement: "The measured symptom may originate in UI state projection, lifecycle cleanup, rendering cost, accessibility state, or interaction wiring.",
      experiment: "Replay a fixed UI journey and compare functional state, errors, long tasks/layout shifts and visual/accessibility evidence."
    };
  }
  return {
    family: "cross_system_unknown",
    statement: "The observation cluster is real, but the root cause is not yet localized to a single subsystem.",
    experiment: "Instrument the nearest stage boundaries and run a discriminating fixture before proposing a production patch."
  };
}

function diagnoseWeakness(cluster, { minEvidence = 2 } = {}) {
  if (!cluster || typeof cluster !== "object" || !cluster.signature) throw new Error("weakness cluster required");
  const minimum = Math.max(1, Math.min(20, Number(minEvidence) || 2));
  const urgent = cluster.maxSeverity === "CRITICAL" || Number(cluster.metrics && cluster.metrics.crash || 0) > 0;
  const sufficient = cluster.count >= minimum || urgent;
  const template = hypothesisTemplate(cluster);
  const confidence = urgent && cluster.count === 1
    ? 0.7
    : cluster.count >= 5
      ? 0.82
      : cluster.count >= 3
        ? 0.68
        : cluster.count >= 2
          ? 0.52
          : 0.28;

  return Object.freeze({
    schemaVersion: 1,
    id: `diag:${Buffer.from(cluster.signature).toString("base64url").slice(0, 24)}`,
    weaknessSignature: cluster.signature,
    observationIds: Object.freeze([...(cluster.observationIds || [])]),
    symptom: `${cluster.kind} in ${cluster.subsystem} repeated ${cluster.count} time(s)`,
    affectedSubsystems: Object.freeze([cluster.subsystem]),
    hypotheses: Object.freeze([Object.freeze({
      family: template.family,
      statement: template.statement,
      confidence: Number(confidence.toFixed(2))
    })]),
    confidence: Number(confidence.toFixed(2)),
    causalStatus: "HYPOTHESIS",
    evidenceSufficientForPlanning: sufficient,
    missingEvidence: Object.freeze(sufficient ? [] : [`need_at_least_${minimum}_coherent_observations_or_critical_signal`]),
    recommendedExperiment: template.experiment
  });
}

function matchesAny(path, patterns) {
  return patterns.some((pattern) => pattern.test(path));
}

function classifyChangeRisk({ changeClass, targetPaths = [] } = {}) {
  const normalizedClass = String(changeClass || "unknown").toLowerCase();
  const paths = [...new Set((targetPaths || []).map(normalizeRepoPath))];

  if (paths.some((path) => matchesAny(path, CRITICAL_POLICY_PATHS))) {
    return Object.freeze({ level: "CRITICAL", reason: "evaluator_or_self_development_plane", paths: Object.freeze(paths) });
  }
  if (paths.some((path) => matchesAny(path, HIGH_POLICY_PATHS))) {
    return Object.freeze({ level: "HIGH", reason: "shared_contract_or_sensitive_runtime", paths: Object.freeze(paths) });
  }

  const level = CHANGE_CLASS_RISK[normalizedClass] || "HIGH";
  return Object.freeze({
    level,
    reason: CHANGE_CLASS_RISK[normalizedClass] ? `change_class:${normalizedClass}` : "unknown_change_class_fails_high",
    paths: Object.freeze(paths)
  });
}

function createImprovementProposal({
  id,
  diagnosis,
  baselineSha,
  changeClass,
  allowedPaths = [],
  affectedSystems = [],
  expectedEffects = {},
  validationPlan = [],
  rollbackPlan
} = {}) {
  if (!diagnosis || diagnosis.causalStatus !== "HYPOTHESIS") throw new Error("diagnosis hypothesis required");
  const exactBaselineSha = String(baselineSha || "").trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(exactBaselineSha)) throw new Error("baselineSha requires exact 40-char SHA");
  if (!diagnosis.evidenceSufficientForPlanning) throw new Error("diagnosis evidence insufficient for planning");
  const paths = [...new Set(allowedPaths.map(normalizeRepoPath))].sort();
  if (!paths.length) throw new Error("proposal allowedPaths required");
  const risk = classifyChangeRisk({ changeClass, targetPaths: paths });
  const protectedPaths = paths.filter((path) => isProtected(path) || matchesAny(path, CRITICAL_POLICY_PATHS));
  const requiresManualApproval = RISK_ORDER[risk.level] >= RISK_ORDER.HIGH;
  const codingEligible = protectedPaths.length === 0 && risk.level !== "CRITICAL";

  return Object.freeze({
    schemaVersion: 1,
    id: String(id || `proposal:${diagnosis.id}`),
    diagnosisId: diagnosis.id,
    baselineSha: exactBaselineSha,
    changeClass: String(changeClass || "unknown"),
    allowedPaths: Object.freeze(paths),
    affectedSystems: Object.freeze([...new Set(affectedSystems.map(String))].sort()),
    expectedEffects: Object.freeze({ ...expectedEffects }),
    validationPlan: Object.freeze(validationPlan.map(String)),
    rollbackPlan: String(rollbackPlan || "restore exact baseline SHA and discard isolated candidate"),
    risk,
    protectedPaths: Object.freeze(protectedPaths),
    requiresManualApproval,
    codingEligible,
    decision: codingEligible ? "READY_FOR_CODING_SYSTEM" : "GOVERNANCE_REQUIRED"
  });
}

module.exports = {
  SEVERITY_WEIGHT,
  RISK_ORDER,
  CHANGE_CLASS_RISK,
  negativeObservation,
  weaknessSignature,
  aggregateWeaknesses,
  diagnoseWeakness,
  classifyChangeRisk,
  createImprovementProposal
};
