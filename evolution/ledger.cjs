"use strict";

const crypto = require("crypto");

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((out, key) => {
      out[key] = canonicalize(value[key]);
      return out;
    }, {});
  }
  return value;
}

function hashObject(value) {
  return crypto.createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function appendEvent(ledger = [], event = {}) {
  const previous = ledger.length ? ledger[ledger.length - 1].hash : null;
  const body = {
    sequence: ledger.length + 1,
    type: String(event.type || "UNKNOWN"),
    source: String(event.source || "seven-evolution"),
    timestamp: event.timestamp || new Date().toISOString(),
    parentHash: previous,
    payload: canonicalize(event.payload || {})
  };
  const entry = Object.freeze({ ...body, hash: hashObject(body) });
  return Object.freeze([...ledger, entry]);
}

function verifyLedger(ledger = []) {
  let parentHash = null;
  for (let index = 0; index < ledger.length; index += 1) {
    const entry = ledger[index];
    const body = {
      sequence: entry.sequence,
      type: entry.type,
      source: entry.source,
      timestamp: entry.timestamp,
      parentHash: entry.parentHash,
      payload: canonicalize(entry.payload || {})
    };
    if (entry.sequence !== index + 1) return { valid: false, reason: "sequence", index };
    if (entry.parentHash !== parentHash) return { valid: false, reason: "parentHash", index };
    if (entry.hash !== hashObject(body)) return { valid: false, reason: "hash", index };
    parentHash = entry.hash;
  }
  return { valid: true, reason: null, entries: ledger.length, head: parentHash };
}

module.exports = { canonicalize, hashObject, appendEvent, verifyLedger };
