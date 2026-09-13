"use strict";

const { evaluate } = require("./core.cjs");

const REQUIRED_METRICS = ["tests", "quality", "reliability", "performance", "efficiency"];
const REQUIRED_GATES = [
  "isolated",
  "regressionFree",
  "provenanceVerified",
  "rollbackReady",
  "freeProofVerified",
  "licenseAllowed"
];

function bool(value) {
  return value === true;
}

function evaluateCandidate({ baseline = {}, candidate = {}, gates = {}, requiredMetrics = REQUIRED_METRICS } = {}) {
  const metricDecision = evaluate({ baseline, candidate, required: requiredMetrics });
  const failedGates = REQUIRED_GATES.filter((name) => !bool(gates[name]));
  const criticalRegression = bool(gates.criticalRegression);
  const pass = metricDecision.pass && failedGates.length === 0 && !criticalRegression;

  return {
    ...metricDecision,
    pass,
    decision: pass ? "ELIGIBLE_FOR_SHADOW" : "REJECT",
    failedGates,
    criticalRegression,
    requiredMetrics: [...requiredMetrics]
  };
}

function canEnterCanary({ shadowPassed = false, evaluation } = {}) {
  return Boolean(shadowPassed && evaluation && evaluation.pass === true);
}

function canPromote({ canaryPassed = false, rollbackCheckpoint = false, evaluation } = {}) {
  return Boolean(canaryPassed && rollbackCheckpoint && evaluation && evaluation.pass === true);
}

module.exports = {
  REQUIRED_METRICS,
  REQUIRED_GATES,
  evaluateCandidate,
  canEnterCanary,
  canPromote
};
