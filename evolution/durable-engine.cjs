"use strict";

const { runSystemEvolution } = require("./engine.cjs");
const { persistStateAtomic, loadCommittedState } = require("./state-store.cjs");
const { recoverTransaction } = require("./recovery.cjs");
const { rollback: rollbackCandidate } = require("./coordinator.cjs");

const TERMINAL_PHASES = Object.freeze(new Set([
  "COMPLETE",
  "ROLLED_BACK",
  "REJECTED",
  "DEPLOYMENT_ABORTED",
  "ROLLBACK_FAILED"
]));

function serializableSnapshot(snapshot = {}) {
  return {
    schemaVersion: 1,
    phase: String(snapshot.phase || "UNKNOWN"),
    experiment: snapshot.experiment || null,
    candidate: snapshot.candidate || null,
    transaction: snapshot.transaction || null,
    experimentGate: snapshot.experimentGate || null,
    approval: snapshot.approval || null,
    execution: snapshot.execution || null
  };
}

function isTerminalState(state) {
  return Boolean(state && TERMINAL_PHASES.has(String(state.phase)));
}

async function createDurableCheckpoint({ storeAdapter, stateKey = "seven-evolution-state" } = {}) {
  if (!storeAdapter) throw new Error("storeAdapter required");
  return async function durableCheckpoint(snapshot) {
    return persistStateAtomic({
      adapter: storeAdapter,
      key: stateKey,
      state: serializableSnapshot(snapshot)
    });
  };
}

async function loadDurableEvolutionState({ storeAdapter, stateKey = "seven-evolution-state" } = {}) {
  if (!storeAdapter) throw new Error("storeAdapter required");
  return loadCommittedState({ adapter: storeAdapter, key: stateKey });
}

async function runDurableSystemEvolution({ storeAdapter, stateKey = "seven-evolution-state", ...engineInput } = {}) {
  if (!storeAdapter) throw new Error("storeAdapter required");
  const previous = await loadDurableEvolutionState({ storeAdapter, stateKey });
  if (previous && !isTerminalState(previous)) {
    throw new Error(`unfinished evolution state requires recovery before a new run: ${previous.phase}`);
  }

  const onCheckpoint = await createDurableCheckpoint({ storeAdapter, stateKey });
  return runSystemEvolution({ ...engineInput, onCheckpoint });
}

async function recoverDurableEvolution({ storeAdapter, stateKey = "seven-evolution-state", promotionAdapter } = {}) {
  if (!storeAdapter) throw new Error("storeAdapter required");
  if (!promotionAdapter) throw new Error("promotionAdapter required");
  const state = await loadDurableEvolutionState({ storeAdapter, stateKey });
  if (!state) return { outcome: "NO_STATE", state: null };
  if (!state.transaction) {
    return isTerminalState(state)
      ? { outcome: "STABLE", state }
      : { outcome: "HALT", reason: `nonterminal state without transaction: ${state.phase}`, state };
  }

  const recovery = await recoverTransaction({ transaction: state.transaction, adapter: promotionAdapter });
  if (recovery.outcome === "ROLLED_BACK" && state.candidate && state.candidate.state === "PROMOTED") {
    rollbackCandidate(state.candidate, "durable_recovery_rollback");
  }

  const phase = recovery.outcome === "ROLLED_BACK"
    ? "ROLLED_BACK"
    : recovery.outcome === "STABLE" && state.transaction.state === "COMMITTED"
      ? "COMPLETE"
      : recovery.outcome;

  const nextState = {
    ...state,
    phase,
    transaction: state.transaction,
    candidate: state.candidate,
    recovery: {
      outcome: recovery.outcome,
      reason: recovery.recovery && recovery.recovery.reason || null
    }
  };
  await persistStateAtomic({ adapter: storeAdapter, key: stateKey, state: nextState });
  return { ...recovery, state: nextState };
}

module.exports = {
  TERMINAL_PHASES,
  serializableSnapshot,
  isTerminalState,
  createDurableCheckpoint,
  loadDurableEvolutionState,
  runDurableSystemEvolution,
  recoverDurableEvolution
};
