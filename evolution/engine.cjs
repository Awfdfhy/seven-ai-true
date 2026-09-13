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
const { createEvalLock } = require("./eval-lock.cjs");
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

async function emitCheckpoint(onCheckpoint, phase, snapshot = {}) {
  if (typeof onCheckpoint !== "function") return;
  await onCheckpoint({ phase, ...snapshot });
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
  candidateMetadata = {},
  evaluationLock,
  adapter,
  onCheckpoint
} = {}) {
  const experiment = createExperiment(experimentConfig);
  // Freeze the evaluation identity at the beginning of the evolution run.
  // Callers with a longer pre-evaluation phase may provide an even earlier lock.
  const lockedEvaluation = evaluationLock || createEvalLock({ experimentId: experiment.id });
  const candidate = createCandidate({
    id: `system:${experiment.id}`,
    kind: "system",
    source: "evolution-engine",
    metadata: {
      experimentId: experiment.id,
      subsystem: experiment.subsystem,
      ...candidateMetadata
    }
  });
  await emitCheckpoint(onCheckpoint, "DISCOVERED", { experiment, candidate, transaction: null });

  const experimentGate = evaluateExperiment({
    experiment,
    changedPaths,
    baseline: baselineMetrics,
    candidate: candidateMetrics,
    gates
  });
  if (!experimentGate.pass) {
    transition(candidate, "REJECTED", { reason: "experiment_gate_failed", experimentGate });
    await emitCheckpoint(onCheckpoint, "REJECTED", { experiment, candidate, transaction: null, experimentGate });
    return { outcome: "REJECTED", stage: "EVALUATION", experiment, candidate, experimentGate };
  }

  evaluateStage(candidate, { baseline: baselineMetrics, candidate: candidateMetrics, gates });
  await emitCheckpoint(onCheckpoint, candidate.state, { experiment, candidate, transaction: null, experimentGate });

  shadowStage(candidate, { passed: shadowPassed, details: { experimentId: experiment.id } });
  await emitCheckpoint(onCheckpoint, candidate.state, { experiment, candidate, transaction: null, experimentGate });
  if (candidate.state === "REJECTED") {
    return { outcome: "REJECTED", stage: "SHADOW", experiment, candidate, experimentGate };
  }

  canaryStage(candidate, { passed: canaryPassed, details: { experimentId: experiment.id } });
  await emitCheckpoint(onCheckpoint, candidate.state, { experiment, candidate, transaction: null, experimentGate });
  if (candidate.state === "REJECTED") {
    return { outcome: "REJECTED", stage: "CANARY", experiment, candidate, experimentGate };
  }

  promotionReadyStage(candidate, {
    canaryPassed: true,
    rollbackCheckpoint: true,
    details: { baselineSha }
  });
  await emitCheckpoint(onCheckpoint, candidate.state, { experiment, candidate, transaction: null, experimentGate });
  if (candidate.state === "REJECTED") {
    return { outcome: "REJECTED", stage: "PROMOTION_GATE", experiment, candidate, experimentGate };
  }

  const approval = approvalDecision({ riskAssessment, policy: approvalPolicy, manualApproved });
  if (!approval.approved) {
    await emitCheckpoint(onCheckpoint, "PENDING_APPROVAL", { experiment, candidate, transaction: null, experimentGate, approval });
    return { outcome: "PENDING_APPROVAL", stage: "APPROVAL", experiment, candidate, experimentGate, approval };
  }

  promote(candidate, { approved: true, release: { candidateSha, approvalMode: approval.mode } });
  const transaction = createUpdateTransaction({
    id: `tx:${experiment.id}`,
    experimentId: experiment.id,
    baselineSha,
    candidateSha
  });

  try {
    await emitCheckpoint(onCheckpoint, "PROMOTED_PREPARED", { experiment, candidate, transaction, experimentGate, approval });
  } catch (checkpointError) {
    rollback(candidate, `promotion_checkpoint_failed:${String(checkpointError && checkpointError.message || checkpointError)}`);
    return {
      outcome: "DEPLOYMENT_ABORTED",
      stage: "CHECKPOINT",
      experiment,
      candidate,
      transaction,
      experimentGate,
      approval,
      error: String(checkpointError && checkpointError.message || checkpointError)
    };
  }

  const transactionCheckpoint = async ({ phase }) => {
    await emitCheckpoint(onCheckpoint, `TRANSACTION_${phase}`, {
      experiment,
      candidate,
      transaction,
      experimentGate,
      approval
    });
  };

  let execution;
  try {
    execution = await executePromotion({
      transaction,
      experimentPass: true,
      evaluationLock: lockedEvaluation,
      adapter,
      onCheckpoint: transactionCheckpoint
    });
  } catch (error) {
    rollback(candidate, `deployment_aborted:${String(error && error.message || error)}`);
    await emitCheckpoint(onCheckpoint, "DEPLOYMENT_ABORTED", { experiment, candidate, transaction, experimentGate, approval });
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
    await emitCheckpoint(onCheckpoint, "ROLLED_BACK", { experiment, candidate, transaction, experimentGate, approval, execution });
  } else if (execution.outcome === "COMMITTED") {
    await emitCheckpoint(onCheckpoint, "COMPLETE", { experiment, candidate, transaction, experimentGate, approval, execution });
  } else {
    await emitCheckpoint(onCheckpoint, execution.outcome, { experiment, candidate, transaction, experimentGate, approval, execution });
  }

  return {
    outcome: execution.outcome,
    stage: execution.outcome === "COMMITTED" ? "COMPLETE" : "APPLY",
    experiment,
    candidate,
    transaction,
    experimentGate,
    approval,
    evaluationIdentity: execution.evaluationIdentity || null,
    execution
  };
}

module.exports = { RISK_ORDER, approvalDecision, emitCheckpoint, runSystemEvolution };
