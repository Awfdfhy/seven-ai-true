"use strict";

const { verifyLedger } = require("./ledger.cjs");
const { requireRollback, confirmRollback } = require("./update-transaction.cjs");
const { rollbackSafely, assertAdapter } = require("./promotion-runner.cjs");

function classifyRecovery(tx, observedSha) {
  if (!tx || !tx.state) return { action: "HALT", reason: "missing_transaction" };
  if (!verifyLedger(tx.ledger || []).valid) return { action: "HALT", reason: "ledger_integrity" };
  const head = String(observedSha || "");
  const atBaseline = head === tx.baselineSha;
  const atCandidate = head === tx.candidateSha;
  if (!atBaseline && !atCandidate) return { action: "HALT", reason: "unknown_head" };

  switch (tx.state) {
    case "PREPARED":
      return atBaseline
        ? { action: "SAFE_ABORT", reason: "not_applied" }
        : { action: "HALT", reason: "candidate_visible_without_validated_state" };
    case "VALIDATED":
      return atBaseline
        ? { action: "SAFE_ABORT", reason: "not_applied" }
        : { action: "ROLLBACK", reason: "uncertain_apply", effectUncertain: true };
    case "APPLIED":
    case "VERIFIED":
      return atCandidate
        ? { action: "ROLLBACK", reason: "crash_before_commit" }
        : { action: "CONFIRM_ROLLBACK", reason: "baseline_already_restored" };
    case "ROLLBACK_REQUIRED":
      return atCandidate
        ? { action: "ROLLBACK", reason: "resume_pending_rollback" }
        : { action: "CONFIRM_ROLLBACK", reason: "rollback_already_restored" };
    case "COMMITTED":
      return atCandidate
        ? { action: "STABLE", reason: "committed_candidate" }
        : { action: "HALT", reason: "committed_head_drift" };
    case "ROLLED_BACK":
      return atBaseline
        ? { action: "STABLE", reason: "rollback_complete" }
        : { action: "HALT", reason: "rolled_back_but_candidate_visible" };
    default:
      return { action: "HALT", reason: "unknown_state" };
  }
}

async function recoverTransaction({ transaction: tx, adapter } = {}) {
  assertAdapter(adapter);
  const head = await adapter.getHeadSha();
  const classification = classifyRecovery(tx, head);

  if (classification.action === "ROLLBACK") {
    return {
      ...await rollbackSafely(tx, adapter, `recovery:${classification.reason}`, { effectUncertain: classification.effectUncertain === true }),
      recovery: classification
    };
  }

  if (classification.action === "CONFIRM_ROLLBACK") {
    if (tx.state !== "ROLLBACK_REQUIRED") requireRollback(tx, `recovery:${classification.reason}`);
    confirmRollback(tx, { observedSha: head });
    return { outcome: "ROLLED_BACK", transaction: tx, recovery: classification };
  }

  if (classification.action === "SAFE_ABORT") {
    return { outcome: "SAFE_ABORT", transaction: tx, recovery: classification };
  }

  if (classification.action === "STABLE") {
    return { outcome: "STABLE", transaction: tx, recovery: classification };
  }

  return { outcome: "HALT", transaction: tx, recovery: classification };
}

module.exports = { classifyRecovery, recoverTransaction };
