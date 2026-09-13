"use strict";

const { createExperiment, evaluateExperiment } = require("./experiment-lab.cjs");
const {
  createCandidate,
  transition,
  evaluateStage,
  shadowStage,
  canaryStage,
  promotionReadyStage,
  promote,
  rollback
} = require("./coordinator.cjs");
const { createUpdateTransaction } = require("./update-transaction.cjs");
const { executePromotion } = require("./promotion-runner.cjs");

const RISK_ORDER = Object.freeze({ LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 });

function approvalDecision({ riskAssessment = {}, policy = {}, manualApproved = false } = {}) {
  if (manualApproved === true) return { approved: true, mode: "MANUAL" };
  if (policy.autoPromotionEnabled !== true) return { approved: false, mode: "DISABLED" };
  if (riskAssessment.verified !== true || riskAssessment.source !== "trusted-policy") {
    return { approved: false, mode: "UNTRUSTED_RISK" };
  }
  const risk = String(riskAssessment.level || "CRITICAL").toUpperCase();
  const maxRisk = String(policy.maxAutoRisk || "LOW").toUpperCase();
  if (!RISK_ORDER[risk] || !RISK_ORDER[maxRisk]) return { approved: false, mode: "INVALID_RISK" };
  return RISK_ORDER[risk] <= RISK_ORDER[maxRisk]
    ? { approved: true, mode: "AUTO_POLICY", risk, maxRisk }
    : { approved: false, mode: "RISK_TOO_HIGH", risk, maxRisk };
}

async function runSystemEvolution({
  experimentConfig,
  changedPaths = [],
  baselineMetrics = {},
  candidateMetrics = {},
  gates = {},
  shadowPassed = false,
  canaryPassed = false,
  riskAssessment = {},
  approvalPolicy = {},
  manualApproved = false,
  baselineSha,
  candidateSha,
  adapter
} = {}) {
  const experiment = createExperiment(experimentConfig);
  const candidate = createCandidate({
    id: `system:${experiment.id}`,
    kind: "system",
    source: "evolution-engine",
    metadata: { experimentId: experiment.id, subsystem: experiment.subsystem }
  });

  const experimentGate = evaluateExperiment({
    experiment,
    changedPaths,
    baseline: baselineMetrics,
    candidate: candidateMetrics,
    gates
  });
  if (!experimentGate.pass) {
    transition(candidate, "REJECTED", { reason: "experiment_gate_failed", experimentGate });
    return { outcome: "REJECTED", stage: "EVALUATION", experiment, candidate, experimentGate };
  }

  evaluateStage(candidate, { baseline: baselineMetrics, candidate: candidateMetrics, gates });
  shadowStage(candidate, { passed: shadowPassed, details: { experimentId: experiment.id } });
  if (candidate.state === "REJECTED") {
    return { outcome: "REJECTED", stage: "SHADOW", experiment, candidate, experimentGate };
  }

  canaryStage(candidate, { passed: canaryPassed, details: { experimentId: experiment.id } });
  if (candidate.state === "REJECTED") {
    return { outcome: "REJECTED", stage: "CANARY", experiment, candidate, experimentGate };
  }

  promotionReadyStage(candidate, {
    canaryPassed: true,
    rollbackCheckpoint: true,
    details: { baselineSha }
  });
  if (candidate.state === "REJECTED") {
    return { outcome: "REJECTED", stage: "PROMOTION_GATE", experiment, candidate, experimentGate };
  }

  const approval = approvalDecision({ riskAssessment, policy: approvalPolicy, manualApproved });
  if (!approval.approved) {
    return { outcome: "PENDING_APPROVAL", stage: "APPROVAL", experiment, candidate, experimentGate, approval };
  }

  promote(candidate, { approved: true, release: { candidateSha, approvalMode: approval.mode } });
  const transaction = createUpdateTransaction({
    id: `tx:${experiment.id}`,
    experimentId: experiment.id,
    baselineSha,
    candidateSha
  });

  let execution;
  try {
    execution = await executePromotion({ transaction, experimentPass: true, adapter });
  } catch (error) {
    rollback(candidate, `deployment_aborted:${String(error && error.message || error)}`);
    return {
      outcome: "DEPLOYMENT_ABORTED",
      stage: "APPLY",
      experiment,
      candidate,
      transaction,
      experimentGate,
      approval,
      error: String(error && error.message || error)
    };
  }

  if (execution.outcome === "ROLLED_BACK") {
    rollback(candidate, "update_transaction_rolled_back");
  }

  return {
    outcome: execution.outcome,
    stage: execution.outcome === "COMMITTED" ? "COMPLETE" : "APPLY",
    experiment,
    candidate,
    transaction,
    experimentGate,
    approval,
    execution
  };
}

module.exports = { RISK_ORDER, approvalDecision, runSystemEvolution };
