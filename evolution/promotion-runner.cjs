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

function assertAdapter(adapter) {
  for (const method of ["getHeadSha", "applyCandidate", "verifyCandidate", "rollbackTo"]) {
    if (!adapter || typeof adapter[method] !== "function") throw new Error(`promotion adapter missing ${method}`);
  }
}

async function rollbackSafely(tx, adapter, reason, options = {}) {
  if (tx.state !== "ROLLBACK_REQUIRED") requireRollback(tx, reason, options);
  try {
    await adapter.rollbackTo({ rollbackSha: tx.rollbackSha, transactionId: tx.id, reason });
    const restored = await adapter.getHeadSha();
    confirmRollback(tx, { observedSha: restored });
    return { outcome: "ROLLED_BACK", transaction: tx };
  } catch (rollbackError) {
    return {
      outcome: "ROLLBACK_FAILED",
      transaction: tx,
      rollbackError: String(rollbackError && rollbackError.message || rollbackError)
    };
  }
}

async function executePromotion({ transaction: tx, experimentPass = false, adapter } = {}) {
  if (!tx) throw new Error("transaction required");
  assertAdapter(adapter);

  const observedBaseSha = await adapter.getHeadSha();
  validateUpdate(tx, {
    observedBaseSha,
    experimentPass,
    rollbackCheckpointSha: tx.rollbackSha
  });

  let appliedSha;
  try {
    appliedSha = await adapter.applyCandidate({
      candidateSha: tx.candidateSha,
      expectedBaseSha: tx.baselineSha,
      transactionId: tx.id
    });
    markApplied(tx, { appliedSha });
  } catch (applyError) {
    const rollback = await rollbackSafely(tx, adapter, "apply_error_or_uncertain_effect", { effectUncertain: tx.state === "VALIDATED" });
    return {
      ...rollback,
      applyError: String(applyError && applyError.message || applyError)
    };
  }

  let verification;
  try {
    verification = await adapter.verifyCandidate({
      candidateSha: tx.candidateSha,
      transactionId: tx.id
    });
  } catch (verifyError) {
    const rollback = await rollbackSafely(tx, adapter, "verification_error");
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
    return rollbackSafely(tx, adapter, "post_apply_gate_failed");
  }

  commitUpdate(tx);
  return {
    outcome: "COMMITTED",
    transaction: tx,
    verification: {
      ciPassed: true,
      regressionFree: true,
      observedSha: observedCandidateSha
    }
  };
}

async function enforcePostReleaseHealth({ transaction: tx, samples = [], policy, adapter } = {}) {
  if (!tx || tx.state !== "COMMITTED") throw new Error("committed transaction required");
  assertAdapter(adapter);
  const health = assessHealth(samples, policy);
  if (health.status !== "ROLLBACK_REQUIRED") {
    return { outcome: health.status, transaction: tx, health };
  }
  const rollback = await rollbackSafely(tx, adapter, `post_release_health:${health.reason || "unknown"}`, { postRelease: true });
  return { ...rollback, health };
}

module.exports = { assertAdapter, rollbackSafely, executePromotion, enforcePostReleaseHealth };
