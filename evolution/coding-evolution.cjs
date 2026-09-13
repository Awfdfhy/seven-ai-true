"use strict";

const { createExperiment } = require("./experiment-lab.cjs");
const { runCodingCandidate, discardBestEffort, restoreIfStableChanged } = require("./coding-candidate.cjs");
const { runDurableSystemEvolution } = require("./durable-engine.cjs");

const METRIC_KEYS = Object.freeze(["tests", "quality", "reliability", "performance", "efficiency"]);

function assertEvalsAdapter(adapter) {
  if (!adapter || typeof adapter.evaluateCandidate !== "function") {
    throw new Error("evals adapter missing evaluateCandidate");
  }
}

function validMetricSet(metrics) {
  if (!metrics || typeof metrics !== "object") return false;
  return METRIC_KEYS.every((key) => Number.isFinite(Number(metrics[key])) && Number(metrics[key]) >= 0 && Number(metrics[key]) <= 1);
}

function validateTrustedEvalBundle(bundle, { baselineSha, candidateSha } = {}) {
  const reasons = [];
  if (!bundle || typeof bundle !== "object") return { valid: false, reasons: ["missing_bundle"] };
  if (bundle.source !== "seven-evals") reasons.push("untrusted_source");
  if (bundle.verified !== true) reasons.push("bundle_not_verified");
  if (!bundle.evidenceId) reasons.push("missing_evidence_id");
  if (bundle.baselineSha !== baselineSha) reasons.push("baseline_binding_mismatch");
  if (bundle.candidateSha !== candidateSha) reasons.push("candidate_binding_mismatch");
  if (!validMetricSet(bundle.baselineMetrics)) reasons.push("invalid_baseline_metrics");
  if (!validMetricSet(bundle.candidateMetrics)) reasons.push("invalid_candidate_metrics");
  if (typeof bundle.shadowPassed !== "boolean") reasons.push("missing_shadow_result");
  if (typeof bundle.canaryPassed !== "boolean") reasons.push("missing_canary_result");
  if (!bundle.riskAssessment || bundle.riskAssessment.verified !== true || bundle.riskAssessment.source !== "trusted-policy") {
    reasons.push("untrusted_risk_assessment");
  }
  return { valid: reasons.length === 0, reasons };
}

function gatesFromEvalBundle(bundle) {
  return {
    isolated: true,
    regressionFree: bundle.regressionFree === true,
    provenanceVerified: bundle.verified === true && Boolean(bundle.evidenceId),
    rollbackReady: true,
    freeProofVerified: true,
    licenseAllowed: true,
    criticalRegression: bundle.criticalRegression === true
  };
}

async function runCodingEvolution({
  experimentConfig,
  baselineSha,
  codingAgent,
  evalsAdapter,
  promotionAdapter,
  storeAdapter,
  stateKey = "seven-evolution-state",
  maxRepairAttempts = 3,
  approvalPolicy = { autoPromotionEnabled: true, maxAutoRisk: "LOW" },
  manualApproved = false
} = {}) {
  assertEvalsAdapter(evalsAdapter);
  const experiment = createExperiment(experimentConfig);
  const coding = await runCodingCandidate({
    experiment,
    baselineSha,
    agent: codingAgent,
    maxAttempts: maxRepairAttempts
  });
  if (coding.outcome !== "PASS") {
    return { outcome: coding.outcome, stage: "CODING", experiment, coding };
  }

  let evalBundle;
  try {
    evalBundle = await evalsAdapter.evaluateCandidate({
      experiment,
      baselineSha,
      candidateSha: coding.candidateSha,
      workspaceId: coding.workspaceId,
      changedPaths: coding.changedPaths
    });
  } catch (error) {
    const discardError = await discardBestEffort(codingAgent, { experiment, workspaceId: coding.workspaceId }, "evals_error");
    return {
      outcome: "EVALS_ERROR",
      stage: "EVALS",
      experiment,
      coding,
      error: String(error && error.message || error),
      discardError
    };
  }

  const stableAfterEvals = await restoreIfStableChanged({
    agent: codingAgent,
    baselineSha,
    reason: "stable_changed_during_evals"
  });
  if (!stableAfterEvals.stable) {
    return { outcome: "HALT_STABLE_RESTORE_FAILED", stage: "EVALS", experiment, coding, stable: stableAfterEvals };
  }
  if (stableAfterEvals.repaired) {
    await discardBestEffort(codingAgent, { experiment, workspaceId: coding.workspaceId }, "stable_mutation_during_evals");
    return { outcome: "REJECTED_STABLE_MUTATION", stage: "EVALS", experiment, coding, stable: stableAfterEvals };
  }

  const validation = validateTrustedEvalBundle(evalBundle, {
    baselineSha,
    candidateSha: coding.candidateSha
  });
  if (!validation.valid) {
    const discardError = await discardBestEffort(codingAgent, { experiment, workspaceId: coding.workspaceId }, "untrusted_eval_bundle");
    return {
      outcome: "REJECTED_EVALS",
      stage: "EVALS",
      experiment,
      coding,
      validation,
      discardError
    };
  }

  const evolution = await runDurableSystemEvolution({
    storeAdapter,
    stateKey,
    experimentConfig,
    changedPaths: coding.changedPaths,
    baselineMetrics: evalBundle.baselineMetrics,
    candidateMetrics: evalBundle.candidateMetrics,
    gates: gatesFromEvalBundle(evalBundle),
    shadowPassed: evalBundle.shadowPassed,
    canaryPassed: evalBundle.canaryPassed,
    riskAssessment: evalBundle.riskAssessment,
    approvalPolicy,
    manualApproved,
    baselineSha,
    candidateSha: coding.candidateSha,
    candidateMetadata: {
      workspaceId: coding.workspaceId,
      evalEvidenceId: String(evalBundle.evidenceId),
      codingAttempts: coding.attempts,
      changedPaths: coding.changedPaths
    },
    adapter: promotionAdapter
  });

  let discardError = null;
  if (evolution.outcome !== "PENDING_APPROVAL") {
    discardError = await discardBestEffort(codingAgent, { experiment, workspaceId: coding.workspaceId }, `evolution_${String(evolution.outcome).toLowerCase()}`);
  }

  return {
    outcome: evolution.outcome,
    stage: evolution.stage,
    experiment,
    coding,
    evalBundle,
    evolution,
    discardError
  };
}

module.exports = {
  METRIC_KEYS,
  assertEvalsAdapter,
  validMetricSet,
  validateTrustedEvalBundle,
  gatesFromEvalBundle,
  runCodingEvolution
};
