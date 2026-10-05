"use strict";

const crypto = require("crypto");
const { assertEvalLock } = require("./eval-lock.cjs");
const {
  getMetricDefinition,
  validateMetricValue
} = require("./self-development-metrics.cjs");

const FORBIDDEN_VALUE = /(?:bearer\s+[a-z0-9._~-]+|gh[pousr]_[a-z0-9_]+|sk-[a-z0-9_-]{12,})/i;
const ENVIRONMENT_KEYS = Object.freeze(new Set([
  "platform",
  "runtime",
  "runtimeVersion",
  "architecture",
  "buildProfile",
  "fixtureVersion",
  "modelSetVersion",
  "locale",
  "networkProfile",
  "deviceClass"
]));

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

function safeToken(value, name, { max = 160, required = true } = {}) {
  if (value == null || value === "") {
    if (required) throw new Error(`${name} required`);
    return null;
  }
  const text = String(value).trim();
  if (!text || text.length > max || /[\u0000-\u001f]/.test(text)) throw new Error(`invalid ${name}`);
  if (FORBIDDEN_VALUE.test(text)) throw new Error(`secret-like ${name} rejected`);
  return text;
}

function normalizeIdentity(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${name} identity required`);
  const sha = String(value.sha || "").trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error(`${name} identity requires exact 40-char SHA`);
  const artifactDigest = value.artifactDigest == null ? null : String(value.artifactDigest).trim().toLowerCase();
  if (artifactDigest != null && !/^[0-9a-f]{64}$/.test(artifactDigest)) throw new Error(`invalid ${name} artifactDigest`);
  return Object.freeze({
    sha,
    artifactDigest,
    artifactType: safeToken(value.artifactType, `${name}.artifactType`, { required: false, max: 80 })
  });
}

function normalizeEnvironment(environment = {}) {
  if (!environment || typeof environment !== "object" || Array.isArray(environment)) throw new Error("environment identity must be an object");
  const keys = Object.keys(environment);
  if (!keys.length) throw new Error("environment identity required");
  const out = {};
  for (const key of keys.sort()) {
    if (!ENVIRONMENT_KEYS.has(key)) throw new Error(`unknown environment identity key: ${key}`);
    const raw = environment[key];
    if (!["string", "number", "boolean"].includes(typeof raw)) throw new Error(`environment identity must be scalar: ${key}`);
    const value = typeof raw === "string" ? raw.trim() : raw;
    if (typeof value === "string") {
      if (!value || value.length > 160) throw new Error(`invalid environment identity: ${key}`);
      if (FORBIDDEN_VALUE.test(value)) throw new Error(`secret-like environment identity rejected: ${key}`);
    }
    if (typeof value === "number" && !Number.isFinite(value)) throw new Error(`non-finite environment identity: ${key}`);
    out[key] = value;
  }
  return Object.freeze(out);
}

function normalizeGateNames(names = []) {
  if (!Array.isArray(names)) throw new Error("requiredHardGates must be an array");
  return Object.freeze([...new Set(names.map((name) => {
    const text = safeToken(name, "hard gate", { max: 80 });
    if (!/^[a-z][a-z0-9_.-]*$/i.test(text)) throw new Error(`invalid hard gate name: ${text}`);
    return text;
  }))].sort());
}

function createEvaluationManifest({
  experimentId,
  evalLock,
  baselineIdentity,
  candidateIdentity,
  environment,
  metrics = [],
  targetMetrics = [],
  requiredHardGates = []
} = {}) {
  assertEvalLock(evalLock);
  const baseline = normalizeIdentity(baselineIdentity, "baseline");
  const candidate = normalizeIdentity(candidateIdentity, "candidate");
  if (baseline.sha === candidate.sha && baseline.artifactDigest === candidate.artifactDigest) {
    throw new Error("candidate identity must differ from baseline");
  }

  if (!Array.isArray(metrics) || metrics.length === 0) throw new Error("evaluation metrics required");
  const metricIds = [...new Set(metrics.map((id) => String(id)))].sort();
  metricIds.forEach(getMetricDefinition);

  if (!Array.isArray(targetMetrics) || targetMetrics.length === 0) throw new Error("targetMetrics required");
  const targets = [...new Set(targetMetrics.map(String))].sort();
  for (const target of targets) {
    getMetricDefinition(target);
    if (!metricIds.includes(target)) throw new Error(`target metric not in manifest: ${target}`);
  }

  const env = normalizeEnvironment(environment);
  const gates = normalizeGateNames(requiredHardGates);
  const evaluatorIdentity = Object.freeze({
    format: evalLock.format,
    version: Number(evalLock.version),
    baselineCommit: String(evalLock.baselineCommit),
    taskCorpusVersion: Number(evalLock.taskCorpusVersion),
    corpusHash: String(evalLock.corpusHash),
    taskCount: Number(evalLock.taskCount)
  });

  const core = {
    schemaVersion: 1,
    experimentId: safeToken(experimentId, "experimentId", { max: 160 }),
    evaluatorIdentity,
    baselineIdentity: baseline,
    candidateIdentity: candidate,
    environment: env,
    environmentDigest: digest(env),
    metrics: Object.freeze(metricIds),
    targetMetrics: Object.freeze(targets),
    requiredHardGates: gates
  };

  return Object.freeze({
    ...core,
    manifestDigest: digest(core)
  });
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sampleStandardDeviation(values, avg) {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, value) => sum + ((value - avg) ** 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function aggregateMetric(metricId, values) {
  const definition = getMetricDefinition(metricId);
  const normalized = values.map((value) => validateMetricValue(metricId, value));
  if (normalized.length < definition.minSamples) {
    return Object.freeze({
      metricId,
      status: "INCONCLUSIVE",
      reason: "insufficient_samples",
      samples: normalized.length,
      minSamples: definition.minSamples,
      mean: normalized.length ? Number(mean(normalized).toFixed(9)) : null,
      cv: null
    });
  }

  const avg = mean(normalized);
  const sd = sampleStandardDeviation(normalized, avg);
  const cv = Math.abs(avg) < 1e-12 ? (sd === 0 ? 0 : Infinity) : Math.abs(sd / avg);
  if (definition.maxCv != null && cv > definition.maxCv) {
    return Object.freeze({
      metricId,
      status: "INCONCLUSIVE",
      reason: "excessive_variance",
      samples: normalized.length,
      minSamples: definition.minSamples,
      mean: Number(avg.toFixed(9)),
      cv: Number.isFinite(cv) ? Number(cv.toFixed(6)) : null
    });
  }

  return Object.freeze({
    metricId,
    status: "MEASURED",
    reason: null,
    samples: normalized.length,
    minSamples: definition.minSamples,
    mean: Number(avg.toFixed(9)),
    cv: Number(cv.toFixed(6))
  });
}

function hardConstraintViolation(definition, candidateMean) {
  const hard = definition.hardConstraint;
  if (!hard) return null;
  if (hard.min !== undefined && candidateMean < hard.min) return `candidate_below_hard_min:${hard.min}`;
  if (hard.max !== undefined && candidateMean > hard.max) return `candidate_above_hard_max:${hard.max}`;
  return null;
}

function compareMetric(metricId, baselineValues = [], candidateValues = []) {
  const definition = getMetricDefinition(metricId);
  const baseline = aggregateMetric(metricId, baselineValues);
  const candidate = aggregateMetric(metricId, candidateValues);

  if (baseline.status !== "MEASURED" || candidate.status !== "MEASURED") {
    return Object.freeze({
      metricId,
      domain: definition.domain,
      direction: definition.direction,
      unit: definition.unit,
      status: "INCONCLUSIVE",
      hardViolation: false,
      reason: baseline.status !== "MEASURED"
        ? `baseline_${baseline.reason}`
        : `candidate_${candidate.reason}`,
      baseline,
      candidate,
      delta: null,
      improvement: null
    });
  }

  const violation = hardConstraintViolation(definition, candidate.mean);
  const signedDelta = Number((candidate.mean - baseline.mean).toFixed(9));
  const improvement = definition.direction === "HIGHER_IS_BETTER" ? signedDelta : -signedDelta;
  let status = "NEUTRAL";
  let reason = "within_tolerance";

  if (violation) {
    status = "REGRESSED";
    reason = violation;
  } else if (improvement >= definition.minImprovement) {
    status = "IMPROVED";
    reason = "minimum_improvement_met";
  } else if (-improvement > definition.regressionTolerance) {
    status = "REGRESSED";
    reason = "regression_tolerance_exceeded";
  }

  return Object.freeze({
    metricId,
    domain: definition.domain,
    direction: definition.direction,
    unit: definition.unit,
    status,
    hardViolation: Boolean(violation),
    reason,
    baseline,
    candidate,
    delta: signedDelta,
    improvement: Number(improvement.toFixed(9)),
    minImprovement: definition.minImprovement,
    regressionTolerance: definition.regressionTolerance
  });
}

function validateRuns(manifest, runs, side) {
  if (!Array.isArray(runs) || runs.length === 0) {
    return { valid: false, blocked: false, reason: `${side}_runs_missing`, runs: [] };
  }
  const normalized = [];
  for (const raw of runs) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return { valid: false, blocked: true, reason: `${side}_run_invalid`, runs: [] };
    }
    if (String(raw.environmentDigest || "") !== manifest.environmentDigest) {
      return { valid: false, blocked: true, reason: `${side}_environment_mismatch`, runs: [] };
    }
    const metrics = raw.metrics;
    if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) {
      return { valid: false, blocked: true, reason: `${side}_metrics_invalid`, runs: [] };
    }
    for (const key of Object.keys(metrics)) {
      if (!manifest.metrics.includes(key)) {
        return { valid: false, blocked: true, reason: `${side}_metric_not_in_manifest:${key}`, runs: [] };
      }
      validateMetricValue(key, metrics[key]);
    }
    normalized.push(Object.freeze({
      runId: safeToken(raw.runId, `${side}.runId`, { max: 160 }),
      environmentDigest: manifest.environmentDigest,
      metrics: Object.freeze({ ...metrics })
    }));
  }
  return { valid: true, blocked: false, reason: null, runs: normalized };
}

function evaluateHardGates(manifest, hardGateResults = {}) {
  if (!hardGateResults || typeof hardGateResults !== "object" || Array.isArray(hardGateResults)) {
    return { decision: "BLOCKED", reasons: ["hard_gate_results_invalid"], normalized: {} };
  }
  const normalized = {};
  const missing = [];
  const failed = [];
  for (const gate of manifest.requiredHardGates) {
    if (!Object.prototype.hasOwnProperty.call(hardGateResults, gate)) {
      missing.push(gate);
      continue;
    }
    if (hardGateResults[gate] !== true && hardGateResults[gate] !== false) {
      return { decision: "BLOCKED", reasons: [`hard_gate_non_boolean:${gate}`], normalized: {} };
    }
    normalized[gate] = hardGateResults[gate];
    if (hardGateResults[gate] === false) failed.push(gate);
  }
  if (failed.length) return { decision: "FAIL", reasons: failed.map((gate) => `hard_gate_failed:${gate}`), normalized };
  if (missing.length) return { decision: "INCONCLUSIVE", reasons: missing.map((gate) => `hard_gate_missing:${gate}`), normalized };
  return { decision: "PASS", reasons: [], normalized };
}

function evaluatePaired({
  manifest,
  baselineRuns = [],
  candidateRuns = [],
  hardGateResults = {}
} = {}) {
  if (!manifest || manifest.schemaVersion !== 1 || !manifest.manifestDigest) throw new Error("valid evaluation manifest required");
  const manifestCore = {
    schemaVersion: manifest.schemaVersion,
    experimentId: manifest.experimentId,
    evaluatorIdentity: manifest.evaluatorIdentity,
    baselineIdentity: manifest.baselineIdentity,
    candidateIdentity: manifest.candidateIdentity,
    environment: manifest.environment,
    environmentDigest: manifest.environmentDigest,
    metrics: manifest.metrics,
    targetMetrics: manifest.targetMetrics,
    requiredHardGates: manifest.requiredHardGates
  };
  if (digest(manifestCore) !== manifest.manifestDigest) {
    return Object.freeze({
      decision: "BLOCKED",
      reasons: Object.freeze(["manifest_integrity_failed"]),
      comparisons: Object.freeze([]),
      hardGates: Object.freeze({})
    });
  }

  const baseline = validateRuns(manifest, baselineRuns, "baseline");
  if (!baseline.valid && baseline.blocked) {
    return Object.freeze({ decision: "BLOCKED", reasons: Object.freeze([baseline.reason]), comparisons: Object.freeze([]), hardGates: Object.freeze({}) });
  }
  const candidate = validateRuns(manifest, candidateRuns, "candidate");
  if (!candidate.valid && candidate.blocked) {
    return Object.freeze({ decision: "BLOCKED", reasons: Object.freeze([candidate.reason]), comparisons: Object.freeze([]), hardGates: Object.freeze({}) });
  }

  const hardGates = evaluateHardGates(manifest, hardGateResults);
  const comparisons = manifest.metrics.map((metricId) => compareMetric(
    metricId,
    baseline.runs.map((run) => run.metrics[metricId]).filter((value) => value !== undefined),
    candidate.runs.map((run) => run.metrics[metricId]).filter((value) => value !== undefined)
  ));

  const reasons = [...hardGates.reasons];
  let decision = "PASS";

  const hardMetricFailures = comparisons.filter((item) => item.hardViolation);
  const regressions = comparisons.filter((item) => item.status === "REGRESSED");
  const inconclusive = comparisons.filter((item) => item.status === "INCONCLUSIVE");

  if (hardGates.decision === "BLOCKED") {
    decision = "BLOCKED";
  } else if (hardGates.decision === "FAIL" || hardMetricFailures.length || regressions.length) {
    decision = "FAIL";
    for (const item of regressions) reasons.push(`metric_regressed:${item.metricId}`);
  } else if (!baseline.valid || !candidate.valid || hardGates.decision === "INCONCLUSIVE" || inconclusive.length) {
    decision = "INCONCLUSIVE";
    if (!baseline.valid) reasons.push(baseline.reason);
    if (!candidate.valid) reasons.push(candidate.reason);
    for (const item of inconclusive) reasons.push(`metric_inconclusive:${item.metricId}:${item.reason}`);
  } else {
    const improvedTargets = comparisons.filter((item) => manifest.targetMetrics.includes(item.metricId) && item.status === "IMPROVED");
    if (!improvedTargets.length) {
      decision = "FAIL";
      reasons.push("target_metric_not_improved");
    }
  }

  const resultCore = {
    schemaVersion: 1,
    experimentId: manifest.experimentId,
    manifestDigest: manifest.manifestDigest,
    baselineIdentity: manifest.baselineIdentity,
    candidateIdentity: manifest.candidateIdentity,
    environmentDigest: manifest.environmentDigest,
    decision,
    reasons: Object.freeze([...new Set(reasons)]),
    hardGates: Object.freeze({ ...hardGates.normalized }),
    comparisons: Object.freeze(comparisons)
  };

  return Object.freeze({
    ...resultCore,
    evidenceDigest: digest(resultCore)
  });
}

module.exports = {
  createEvaluationManifest,
  aggregateMetric,
  compareMetric,
  evaluatePaired
};
