"use strict";

const { appendEvent, verifyLedger } = require("./ledger.cjs");

const STATES = Object.freeze([
  "PREPARED",
  "VALIDATED",
  "APPLIED",
  "VERIFIED",
  "COMMITTED",
  "ROLLBACK_REQUIRED",
  "ROLLED_BACK"
]);

function requireSha(value, name) {
  const sha = String(value || "").trim();
  if (!/^[0-9a-f]{7,64}$/i.test(sha)) throw new Error(`${name} must be a commit-like SHA`);
  return sha;
}

function createUpdateTransaction({ id, baselineSha, candidateSha, experimentId } = {}) {
  if (!id || !experimentId) throw new Error("transaction id and experimentId required");
  const baseline = requireSha(baselineSha, "baselineSha");
  const candidate = requireSha(candidateSha, "candidateSha");
  if (baseline === candidate) throw new Error("candidateSha must differ from baselineSha");
  const tx = {
    id: String(id),
    experimentId: String(experimentId),
    baselineSha: baseline,
    candidateSha: candidate,
    rollbackSha: baseline,
    state: "PREPARED",
    ledger: []
  };
  tx.ledger = appendEvent(tx.ledger, { type: "UPDATE_PREPARED", payload: { id: tx.id, experimentId: tx.experimentId, baselineSha: baseline, candidateSha: candidate } });
  return tx;
}

function event(tx, type, payload = {}) {
  tx.ledger = appendEvent(tx.ledger, { type, payload: { transactionId: tx.id, ...payload } });
}

function validateUpdate(tx, { observedBaseSha, experimentPass = false, rollbackCheckpointSha } = {}) {
  if (!tx || tx.state !== "PREPARED") throw new Error("transaction must be PREPARED");
  const observed = requireSha(observedBaseSha, "observedBaseSha");
  const checkpoint = requireSha(rollbackCheckpointSha, "rollbackCheckpointSha");
  if (observed !== tx.baselineSha) throw new Error("base drift detected");
  if (checkpoint !== tx.baselineSha) throw new Error("rollback checkpoint must equal baseline");
  if (experimentPass !== true) throw new Error("experiment gate did not pass");
  tx.state = "VALIDATED";
  event(tx, "UPDATE_VALIDATED", { observedBaseSha: observed, rollbackCheckpointSha: checkpoint });
  return tx;
}

function markApplied(tx, { appliedSha } = {}) {
  if (!tx || tx.state !== "VALIDATED") throw new Error("transaction must be VALIDATED");
  const applied = requireSha(appliedSha, "appliedSha");
  if (applied !== tx.candidateSha) throw new Error("applied SHA does not match candidate");
  tx.state = "APPLIED";
  event(tx, "UPDATE_APPLIED", { appliedSha: applied });
  return tx;
}

function verifyApplied(tx, { observedSha, ciPassed = false, regressionFree = false } = {}) {
  if (!tx || tx.state !== "APPLIED") throw new Error("transaction must be APPLIED");
  const observed = requireSha(observedSha, "observedSha");
  const pass = observed === tx.candidateSha && ciPassed === true && regressionFree === true;
  if (!pass) {
    tx.state = "ROLLBACK_REQUIRED";
    event(tx, "UPDATE_VERIFY_FAILED", { observedSha: observed, ciPassed: ciPassed === true, regressionFree: regressionFree === true });
    return tx;
  }
  tx.state = "VERIFIED";
  event(tx, "UPDATE_VERIFIED", { observedSha: observed });
  return tx;
}

function commitUpdate(tx) {
  if (!tx || tx.state !== "VERIFIED") throw new Error("transaction must be VERIFIED");
  if (!verifyLedger(tx.ledger).valid) throw new Error("transaction ledger integrity failed");
  tx.state = "COMMITTED";
  event(tx, "UPDATE_COMMITTED", { candidateSha: tx.candidateSha });
  return tx;
}

function requireRollback(tx, reason = "manual", options = {}) {
  if (!tx) throw new Error("transaction required");
  const uncertainValidated = tx.state === "VALIDATED" && options.effectUncertain === true;
  const postRelease = tx.state === "COMMITTED" && options.postRelease === true;
  if (!uncertainValidated && !postRelease && !["APPLIED", "VERIFIED"].includes(tx.state)) {
    throw new Error("rollback can only be requested after apply, uncertain apply, or committed post-release regression");
  }
  tx.state = "ROLLBACK_REQUIRED";
  event(tx, "ROLLBACK_REQUIRED", {
    reason: String(reason),
    effectUncertain: options.effectUncertain === true,
    postRelease: options.postRelease === true
  });
  return tx;
}

function confirmRollback(tx, { observedSha } = {}) {
  if (!tx || tx.state !== "ROLLBACK_REQUIRED") throw new Error("transaction must require rollback");
  const observed = requireSha(observedSha, "observedSha");
  if (observed !== tx.rollbackSha) throw new Error("rollback SHA not restored");
  tx.state = "ROLLED_BACK";
  event(tx, "ROLLBACK_CONFIRMED", { observedSha: observed });
  if (!verifyLedger(tx.ledger).valid) throw new Error("transaction ledger integrity failed");
  return tx;
}

function inspectTransaction(tx) {
  const ledger = verifyLedger(tx && tx.ledger ? tx.ledger : []);
  return {
    id: tx && tx.id,
    state: tx && tx.state,
    ledger,
    terminal: Boolean(tx && ["COMMITTED", "ROLLED_BACK"].includes(tx.state)),
    rollbackEligible: Boolean(tx && tx.state === "COMMITTED")
  };
}

module.exports = {
  STATES,
  createUpdateTransaction,
  validateUpdate,
  markApplied,
  verifyApplied,
  commitUpdate,
  requireRollback,
  confirmRollback,
  inspectTransaction
};
