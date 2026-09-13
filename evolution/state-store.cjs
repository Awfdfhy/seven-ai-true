"use strict";

const { canonicalize, hashObject } = require("./ledger.cjs");

function cloneSerializable(value) {
  return JSON.parse(JSON.stringify(value));
}

function createStateEnvelope(state, { version = 1, savedAt = new Date().toISOString() } = {}) {
  const body = {
    version: Number(version) || 1,
    savedAt: String(savedAt),
    state: canonicalize(cloneSerializable(state))
  };
  return Object.freeze({ ...body, checksum: hashObject(body) });
}

function verifyStateEnvelope(envelope) {
  if (!envelope || typeof envelope !== "object") return { valid: false, reason: "missing_envelope" };
  const body = {
    version: envelope.version,
    savedAt: envelope.savedAt,
    state: canonicalize(envelope.state)
  };
  if (!Number.isInteger(envelope.version) || envelope.version < 1) return { valid: false, reason: "invalid_version" };
  if (!envelope.savedAt) return { valid: false, reason: "missing_saved_at" };
  if (!envelope.checksum || envelope.checksum !== hashObject(body)) return { valid: false, reason: "checksum" };
  return { valid: true, reason: null };
}

function restoreState(envelope) {
  const verification = verifyStateEnvelope(envelope);
  if (!verification.valid) throw new Error(`invalid evolution state envelope: ${verification.reason}`);
  return cloneSerializable(envelope.state);
}

function assertStoreAdapter(adapter) {
  for (const method of ["writeTemp", "commitTemp", "readCommitted"]) {
    if (!adapter || typeof adapter[method] !== "function") throw new Error(`state store adapter missing ${method}`);
  }
}

async function persistStateAtomic({ adapter, key = "seven-evolution-state", state, savedAt } = {}) {
  assertStoreAdapter(adapter);
  const envelope = createStateEnvelope(state, { savedAt: savedAt || new Date().toISOString() });
  await adapter.writeTemp({ key, envelope });
  await adapter.commitTemp({ key, expectedChecksum: envelope.checksum });
  const committed = await adapter.readCommitted({ key });
  const verification = verifyStateEnvelope(committed);
  if (!verification.valid || committed.checksum !== envelope.checksum) {
    throw new Error("committed evolution state verification failed");
  }
  return committed;
}

async function loadCommittedState({ adapter, key = "seven-evolution-state" } = {}) {
  assertStoreAdapter(adapter);
  const envelope = await adapter.readCommitted({ key });
  if (!envelope) return null;
  return restoreState(envelope);
}

module.exports = {
  cloneSerializable,
  createStateEnvelope,
  verifyStateEnvelope,
  restoreState,
  assertStoreAdapter,
  persistStateAtomic,
  loadCommittedState
};
