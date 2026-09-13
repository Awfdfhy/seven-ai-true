"use strict";

const {
  validateUpdate,
  markApplied,
  verifyApplied,
  commitUpdate,
  requireRollback,
  confirmRollback
} = require("./update-transaction.cjs");
const { assessHealth } = require("./health-monitor.cjs");
const { assertEvalLock } = require("./eval-lock.cjs");

function assertAdapter(adapter) {
  for (const method of ["getHeadSha", "applyCandidate", "verifyCandidate", "rollbackTo"]) {
    if (!adapter || typeof adapter[method] !== "function") throw new Error(`promotion adapter missing ${method}`);
  }
}

async function checkpoint(onCheckpoint, tx, phase, { bestEffort = false } = {}) {
  if (typeof onCheckpoint !== "function") return null;
  try {
    await onCheckpoint({ transaction: tx, phase, state: tx.state });
    return null;
  } catch (error) {
    const message = String(error && error.message || error);
    if (bestEffort) return message;
    const wrapped = new Error(`checkpoint failed at ${phase}: ${message}`);
    wrapped.cause = error;
    throw wrapped;
  }
}

async function rollbackSafely(tx, adapter, reason, options = {}) {
  const onCheckpoint = options.onCheckpoint;
  let checkpointError = null;
  if (tx.state !== "ROLLBACK_REQUIRED") requireRollback(tx, reason, options);
  checkpointError = await checkpoint(onCheckpoint, tx, "ROLLBACK_REQUIRED", { bestEffort: true });
  try {
    await adapter.rollbackTo({ rollbackSha: tx.rollbackSha, transactionId: tx.id, reason });
    const restored = await adapter.getHeadSha();
    confirmRollback(tx, { observedSha: restored });
    const finalCheckpointError = await checkpoint(onCheckpoint, tx, "ROLLED_BACK", { bestEffort: true });
    return {
      outcome: "ROLLED_BACK",
      transaction: tx,
      ...(checkpointError || finalCheckpointError ? { checkpointError: checkpointError || finalCheckpointError } : {})
    };
  } catch (rollbackError) {
    return {
      outcome: "ROLLBACK_FAILED",
      transaction: tx,
      rollbackError: String(rollbackError && rollbackError.message || rollbackError),
      ...(checkpointError ? { checkpointError } : {})
    };
  }
}

async function executePromotion({ transaction: tx, experimentPass = false, evaluationLock, adapter, onCheckpoint } = {}) {
  if (!tx) throw new Error("transaction required");
  assertAdapter(adapter);

  // A candidate may only be promoted against the exact evaluation corpus and
  // baseline identity that were frozen for its experiment. This runs before
  // reading or mutating the target repository, so benchmark drift fails closed.
  const evalLockVerification = assertEvalLock(evaluationLock);

  const observedBaseSha = await adapter.getHeadSha();
  validateUpdate(tx, {
    observedBaseSha,
    experimentPass,
    rollbackCheckpointSha: tx.rollbackSha
  });
  await checkpoint(onCheckpoint, tx, "VALIDATED");

  let appliedSha;
  try {
    appliedSha = await adapter.applyCandidate({
      candidateSha: tx.candidateSha,
      expectedBaseSha: tx.baselineSha,
      transactionId: tx.id
    });
    markApplied(tx, { appliedSha });
    await checkpoint(onCheckpoint, tx, "APPLIED");
  } catch (applyError) {
    const rollback = await rollbackSafely(tx, adapter, "apply_error_or_uncertain_effect", {
      effectUncertain: tx.state === "VALIDATED",
      onCheckpoint
    });
    return {
      ...rollback,
      applyError: String(applyError && applyError.message || applyError)
    };
  }

  let verification;
  try {
    verification = await adapter.verifyCandidate({
      candidateSha: tx.candidateSha,
      transactionId: tx.id,
      evaluationIdentity: evalLockVerification.expected
    });
  } catch (verifyError) {
    const rollback = await rollbackSafely(tx, adapter, "verification_error", { onCheckpoint });
    return {
      ...rollback,
      verifyError: String(verifyError && verifyError.message || verifyError)
    };
  }

  const observedCandidateSha = await adapter.getHeadSha();
  verifyApplied(tx, {
    observedSha: observedCandidateSha,
    ciPassed: verification && verification.ciPassed === true,
    regressionFree: verification && verification.regressionFree === true
  });

  if (tx.state === "ROLLBACK_REQUIRED") {
    return rollbackSafely(tx, adapter, "post_apply_gate_failed", { onCheckpoint });
  }

  try {
    await checkpoint(onCheckpoint, tx, "VERIFIED");
  } catch (verifyCheckpointError) {
    const rollback = await rollbackSafely(tx, adapter, "verified_checkpoint_failed", { onCheckpoint });
    return {
      ...rollback,
      checkpointFailure: String(verifyCheckpointError && verifyCheckpointError.message || verifyCheckpointError)
    };
  }

  commitUpdate(tx);
  try {
    await checkpoint(onCheckpoint, tx, "COMMITTED");
  } catch (commitCheckpointError) {
    const rollback = await rollbackSafely(tx, adapter, "commit_checkpoint_failed", { postRelease: true, onCheckpoint });
    return {
      ...rollback,
      checkpointFailure: String(commitCheckpointError && commitCheckpointError.message || commitCheckpointError)
    };
  }

  return {
    outcome: "COMMITTED",
    transaction: tx,
    evaluationIdentity: evalLockVerification.expected,
    verification: {
      ciPassed: true,
      regressionFree: true,
      observedSha: observedCandidateSha
    }
  };
}

async function enforcePostReleaseHealth({ transaction: tx, samples = [], policy, adapter, onCheckpoint } = {}) {
  if (!tx || tx.state !== "COMMITTED") throw new Error("committed transaction required");
  assertAdapter(adapter);
  const health = assessHealth(samples, policy);
  if (health.status !== "ROLLBACK_REQUIRED") {
    return { outcome: health.status, transaction: tx, health };
  }
  const rollback = await rollbackSafely(tx, adapter, `post_release_health:${health.reason || "unknown"}`, {
    postRelease: true,
    onCheckpoint
  });
  return { ...rollback, health };
}

module.exports = { assertAdapter, checkpoint, rollbackSafely, executePromotion, enforcePostReleaseHealth };
