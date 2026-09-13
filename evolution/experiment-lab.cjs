"use strict";

const { REQUIRED_METRICS, evaluateCandidate } = require("./gates.cjs");

const PROTECTED_PATHS = Object.freeze([
  ".github/workflows/",
  "evolution/POLICY.json",
  "evolution/gates.cjs",
  "evolution/ledger.cjs",
  "evolution/coordinator.cjs",
  "all.cjs"
]);

function normalizeRepoPath(value) {
  const path = String(value || "").replace(/\\/g, "/").replace(/^\.\//, "").trim();
  if (!path) throw new Error("repository path required");
  if (path.startsWith("/") || path.includes("../") || path === "..") throw new Error(`unsafe repository path: ${path}`);
  return path;
}

function isProtected(path) {
  const normalized = normalizeRepoPath(path);
  return PROTECTED_PATHS.some((protectedPath) => protectedPath.endsWith("/")
    ? normalized.startsWith(protectedPath)
    : normalized === protectedPath);
}

function createExperiment({
  id,
  subsystem,
  hypothesis,
  baselineRef,
  candidateRef,
  allowedPaths = [],
  requiredMetrics = REQUIRED_METRICS,
  maxRuns = 3
} = {}) {
  if (!id || !subsystem || !hypothesis || !baselineRef || !candidateRef) throw new Error("complete experiment identity required");
  if (String(baselineRef) === String(candidateRef)) throw new Error("candidate must differ from baseline");
  const paths = [...new Set(allowedPaths.map(normalizeRepoPath))].sort();
  if (paths.length === 0) throw new Error("experiment must declare allowed paths");
  if (paths.some(isProtected)) throw new Error("experiment cannot include protected evaluator paths");
  const metrics = [...new Set(requiredMetrics.map(String))];
  for (const metric of REQUIRED_METRICS) {
    if (!metrics.includes(metric)) throw new Error(`required metric cannot be removed: ${metric}`);
  }
  return Object.freeze({
    id: String(id),
    subsystem: String(subsystem),
    hypothesis: String(hypothesis),
    baselineRef: String(baselineRef),
    candidateRef: String(candidateRef),
    allowedPaths: Object.freeze(paths),
    requiredMetrics: Object.freeze(metrics),
    maxRuns: Math.max(1, Math.min(10, Number(maxRuns) || 3))
  });
}

function validateChangedPaths(experiment, changedPaths = []) {
  if (!experiment) throw new Error("experiment required");
  const normalized = changedPaths.map(normalizeRepoPath);
  const protectedChanges = normalized.filter(isProtected);
  const outsideScope = normalized.filter((path) => !experiment.allowedPaths.some((allowed) => path === allowed || path.startsWith(`${allowed.replace(/\/$/, "")}/`)));
  return {
    valid: protectedChanges.length === 0 && outsideScope.length === 0 && normalized.length > 0,
    changedPaths: normalized,
    protectedChanges,
    outsideScope
  };
}

function evaluateExperiment({ experiment, changedPaths = [], baseline = {}, candidate = {}, gates = {} } = {}) {
  const scope = validateChangedPaths(experiment, changedPaths);
  const evaluation = evaluateCandidate({ baseline, candidate, gates, required: experiment.requiredMetrics });
  const pass = scope.valid && evaluation.pass;
  return {
    pass,
    decision: pass ? "ELIGIBLE_FOR_SHADOW" : "REJECT",
    scope,
    evaluation
  };
}

module.exports = {
  PROTECTED_PATHS,
  normalizeRepoPath,
  isProtected,
  createExperiment,
  validateChangedPaths,
  evaluateExperiment
};
