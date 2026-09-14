"use strict";

const { persistStateAtomic, loadCommittedState } = require("./state-store.cjs");
const { inspectRecursionSupervisor } = require("./v44-supervisor.cjs");
const reservation = require("./v44-promotion-reservations.cjs");

function supervisorStateKey(supervisorId) {
  const id = String(supervisorId || "").trim();
  if (!id) throw new Error("supervisor id required");
  return `seven-evolution-supervisor:${id}`;
}

async function persistSupervisor({ storeAdapter, supervisor } = {}) {
  if (!storeAdapter) throw new Error("storeAdapter required");
  const inspection = inspectRecursionSupervisor(supervisor);
  if (!inspection.valid) throw new Error("cannot persist invalid recursion supervisor");
  return persistStateAtomic({
    adapter: storeAdapter,
    key: supervisorStateKey(supervisor.id),
    state: supervisor
  });
}

async function loadSupervisor({ storeAdapter, supervisorId } = {}) {
  if (!storeAdapter) throw new Error("storeAdapter required");
  const supervisor = await loadCommittedState({ adapter: storeAdapter, key: supervisorStateKey(supervisorId) });
  if (!supervisor) return null;
  const inspection = inspectRecursionSupervisor(supervisor);
  if (!inspection.valid) throw new Error("stored recursion supervisor integrity failed");
  return supervisor;
}

async function reconcileSupervisorReservation({
  storeAdapter,
  supervisor,
  campaignId,
  generation,
  candidateHash,
  engineState
} = {}) {
  if (!engineState) throw new Error("engine state required");
  const key = reservation.keyOf({ campaignId, generation, candidateHash });
  const phase = String(engineState.phase || "UNKNOWN");
  const txState = engineState.transaction && String(engineState.transaction.state || "");
  let action = "KEEP_RESERVED";
  if (phase === "COMPLETE" && txState === "COMMITTED") {
    reservation.commit(supervisor, key);
    action = "COMMIT";
  } else if (["ROLLED_BACK", "REJECTED", "DEPLOYMENT_ABORTED", "ROLLBACK_FAILED"].includes(phase)) {
    reservation.release(supervisor, key, `reconcile:${phase}`);
    action = "RELEASE";
  }
  if (storeAdapter) await persistSupervisor({ storeAdapter, supervisor });
  return { action, key, phase, transactionState: txState || null };
}

module.exports = {
  supervisorStateKey,
  persistSupervisor,
  loadSupervisor,
  reconcileSupervisorReservation
};
