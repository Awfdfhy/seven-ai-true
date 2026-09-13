"use strict";

const EFFECT_STATE = Object.freeze({
  PLANNED: "PLANNED",
  ATTEMPTED: "ATTEMPTED",
  VERIFIED: "VERIFIED",
  FAILED: "FAILED",
  UNCERTAIN: "UNCERTAIN",
  RECONCILED: "RECONCILED",
  ROLLED_BACK: "ROLLED_BACK"
});

function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }

function createLedger(seed = []) {
  const entries = clone(seed);
  const byKey = new Map(entries.filter(e => e && e.idempotencyKey).map(e => [e.idempotencyKey, e]));

  function plan(input = {}) {
    const key = String(input.idempotencyKey || "").trim();
    if (!key) throw new Error("side effect requires idempotencyKey");
    if (byKey.has(key)) return clone(byKey.get(key));
    const entry = {
      id: String(input.id || `effect-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`),
      idempotencyKey: key,
      taskId: input.taskId || null,
      capability: input.capability || null,
      target: clone(input.target || null),
      reversible: Boolean(input.reversible),
      state: EFFECT_STATE.PLANNED,
      plannedAt: input.at || new Date().toISOString(),
      attempt: null,
      verification: null,
      reconciliation: null,
      history: []
    };
    entries.push(entry); byKey.set(key, entry); return clone(entry);
  }

  function mutate(key, nextState, payload = {}) {
    const entry = byKey.get(key);
    if (!entry) throw new Error(`unknown side effect: ${key}`);
    const from = entry.state;
    const allowed = {
      PLANNED: new Set(["ATTEMPTED", "FAILED"]),
      ATTEMPTED: new Set(["VERIFIED", "FAILED", "UNCERTAIN"]),
      UNCERTAIN: new Set(["RECONCILED", "VERIFIED", "FAILED", "ROLLED_BACK"]),
      VERIFIED: new Set(["ROLLED_BACK"]),
      FAILED: new Set(["RECONCILED"]),
      RECONCILED: new Set(["VERIFIED", "FAILED", "ROLLED_BACK"]),
      ROLLED_BACK: new Set()
    };
    if (!allowed[from] || !allowed[from].has(nextState)) throw new Error(`illegal side effect transition: ${from}->${nextState}`);
    if (nextState === EFFECT_STATE.VERIFIED && !payload.evidence) throw new Error("verified side effect requires evidence");
    if (nextState === EFFECT_STATE.ROLLED_BACK && !entry.reversible) throw new Error("irreversible side effect cannot be marked rolled back");
    entry.state = nextState;
    entry.history.push({ from, to: nextState, at: payload.at || new Date().toISOString(), reason: payload.reason || null });
    if (nextState === EFFECT_STATE.ATTEMPTED) entry.attempt = clone(payload);
    if (nextState === EFFECT_STATE.VERIFIED) entry.verification = clone(payload);
    if (nextState === EFFECT_STATE.RECONCILED || nextState === EFFECT_STATE.ROLLED_BACK) entry.reconciliation = clone(payload);
    return clone(entry);
  }

  function unresolved() {
    return entries.filter(e => [EFFECT_STATE.PLANNED, EFFECT_STATE.ATTEMPTED, EFFECT_STATE.UNCERTAIN, EFFECT_STATE.RECONCILED].includes(e.state)).map(clone);
  }

  function snapshot() { return clone(entries); }
  function get(key) { return byKey.has(key) ? clone(byKey.get(key)) : null; }

  return { plan, mutate, unresolved, snapshot, get };
}

module.exports = { EFFECT_STATE, createLedger };
