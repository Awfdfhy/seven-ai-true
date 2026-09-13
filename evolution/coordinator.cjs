"use strict";

const { appendEvent, verifyLedger } = require("./ledger.cjs");
const { evaluateCandidate, canEnterCanary, canPromote } = require("./gates.cjs");

const TRANSITIONS = Object.freeze({
  DISCOVERED: ["EVALUATED", "REJECTED"],
  EVALUATED: ["SHADOW", "REJECTED"],
  SHADOW: ["CANARY", "REJECTED"],
  CANARY: ["PROMOTABLE", "REJECTED"],
  PROMOTABLE: ["PROMOTED", "REJECTED"],
  PROMOTED: ["ROLLED_BACK"],
  REJECTED: [],
  ROLLED_BACK: []
});

function createCandidate({ id, kind = "system", source = "manual", metadata = {} } = {}) {
  if (!id) throw new Error("candidate id required");
  const candidate = {
    id: String(id),
    kind: String(kind),
    source: String(source),
    state: "DISCOVERED",
    metadata: { ...metadata },
    evaluation: null,
    ledger: []
  };
  candidate.ledger = appendEvent(candidate.ledger, {
    type: "CANDIDATE_DISCOVERED",
    payload: { id: candidate.id, kind: candidate.kind, source: candidate.source }
  });
  return candidate;
}

function transition(candidate, nextState, payload = {}) {
  const allowed = TRANSITIONS[candidate.state] || [];
  if (!allowed.includes(nextState)) {
    throw new Error(`invalid evolution transition: ${candidate.state} -> ${nextState}`);
  }
  candidate.state = nextState;
  candidate.ledger = appendEvent(candidate.ledger, {
    type: `STATE_${nextState}`,
    payload: { candidateId: candidate.id, ...payload }
  });
  return candidate;
}

function evaluateStage(candidate, input) {
  if (candidate.state !== "DISCOVERED") throw new Error("candidate must be DISCOVERED");
  candidate.evaluation = evaluateCandidate(input);
  if (!candidate.evaluation.pass) return transition(candidate, "REJECTED", { reason: candidate.evaluation });
  return transition(candidate, "EVALUATED", { score: candidate.evaluation.candidateScore });
}

function shadowStage(candidate, { passed = false, details = {} } = {}) {
  if (candidate.state !== "EVALUATED") throw new Error("candidate must be EVALUATED");
  if (!passed) return transition(candidate, "REJECTED", { reason: "shadow_failed", details });
  return transition(candidate, "SHADOW", { details });
}

function canaryStage(candidate, { passed = false, details = {} } = {}) {
  if (candidate.state !== "SHADOW") throw new Error("candidate must be SHADOW");
  if (!canEnterCanary({ shadowPassed: passed, evaluation: candidate.evaluation })) {
    return transition(candidate, "REJECTED", { reason: "canary_entry_denied", details });
  }
  return transition(candidate, "CANARY", { details });
}

function promotionReadyStage(candidate, { canaryPassed = false, rollbackCheckpoint = false, details = {} } = {}) {
  if (candidate.state !== "CANARY") throw new Error("candidate must be CANARY");
  if (!canPromote({ canaryPassed, rollbackCheckpoint, evaluation: candidate.evaluation })) {
    return transition(candidate, "REJECTED", { reason: "promotion_gate_failed", details });
  }
  return transition(candidate, "PROMOTABLE", { rollbackCheckpoint: true, details });
}

function promote(candidate, { approved = false, release = {} } = {}) {
  if (candidate.state !== "PROMOTABLE") throw new Error("candidate must be PROMOTABLE");
  if (!approved) return transition(candidate, "REJECTED", { reason: "final_approval_missing" });
  return transition(candidate, "PROMOTED", { release });
}

function rollback(candidate, reason = "unspecified") {
  if (candidate.state !== "PROMOTED") throw new Error("only PROMOTED candidates can roll back");
  return transition(candidate, "ROLLED_BACK", { reason });
}

function verifyCandidate(candidate) {
  const ledger = verifyLedger(candidate.ledger);
  return {
    valid: ledger.valid,
    ledger,
    state: candidate.state,
    promotable: candidate.state === "PROMOTABLE" && ledger.valid
  };
}

module.exports = {
  TRANSITIONS,
  createCandidate,
  transition,
  evaluateStage,
  shadowStage,
  canaryStage,
  promotionReadyStage,
  promote,
  rollback,
  verifyCandidate
};
