"use strict";

const crypto = require("crypto");

const OUTCOMES = Object.freeze(new Set(["PASS", "FAIL", "ERROR", "BLOCKED", "INCONCLUSIVE"]));
const SEVERITIES = Object.freeze(new Set(["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"]));

const METRIC_RULES = Object.freeze({
  latencyMs: { min: 0 },
  firstTokenMs: { min: 0 },
  inputTokens: { min: 0 },
  outputTokens: { min: 0 },
  contextTokens: { min: 0 },
  retryCount: { min: 0 },
  fallbackCount: { min: 0 },
  errorCount: { min: 0 },
  longTaskCount: { min: 0 },
  layoutShiftCount: { min: 0 },
  memoryHit: { min: 0, max: 1 },
  toolSuccess: { min: 0, max: 1 },
  searchSuccess: { min: 0, max: 1 },
  verificationFailure: { min: 0, max: 1 },
  userCorrection: { min: 0, max: 1 },
  crash: { min: 0, max: 1 },
  stateRestoreFailure: { min: 0, max: 1 },
  taskSuccess: { min: 0, max: 1 },
  qualityScore: { min: 0, max: 1 },
  costEstimateUsd: { min: 0 }
});

const METADATA_KEYS = Object.freeze(new Set([
  "errorClass",
  "statusCode",
  "toolId",
  "operation",
  "route",
  "provider",
  "model",
  "purpose",
  "tier",
  "workspace",
  "stage",
  "testSuite",
  "benchmarkId",
  "locale",
  "mode",
  "reasonCode",
  "recoveryOutcome"
]));

const FORBIDDEN_KEY = /(?:prompt|response|content|secret|password|authorization|cookie|api.?key|credential|raw.?body|stack|message|conversation|user.?text)/i;
const FORBIDDEN_VALUE = /(?:bearer\s+[a-z0-9._~-]+|gh[pousr]_[a-z0-9_]+|sk-[a-z0-9_-]{12,})/i;

function stableObject(value) {
  if (Array.isArray(value)) return value.map(stableObject);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((out, key) => {
      out[key] = stableObject(value[key]);
      return out;
    }, {});
  }
  return value;
}

function sha256(value) {
  return crypto.createHash("sha256").update(JSON.stringify(stableObject(value))).digest("hex");
}

function cleanId(value, name, { required = false, max = 160 } = {}) {
  if (value == null || value === "") {
    if (required) throw new Error(`${name} required`);
    return null;
  }
  const text = String(value).trim();
  if (!text || text.length > max || /[\u0000-\u001f]/.test(text)) throw new Error(`invalid ${name}`);
  if (FORBIDDEN_VALUE.test(text)) throw new Error(`secret-like identifier rejected: ${name}`);
  return text;
}

function normalizeMetrics(metrics = {}) {
  if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) throw new Error("metrics must be an object");
  const out = {};
  for (const [key, raw] of Object.entries(metrics)) {
    const rule = METRIC_RULES[key];
    if (!rule) throw new Error(`unknown observation metric: ${key}`);
    const value = Number(raw);
    if (!Number.isFinite(value)) throw new Error(`non-finite observation metric: ${key}`);
    if (value < rule.min || (rule.max !== undefined && value > rule.max)) {
      throw new Error(`observation metric out of range: ${key}`);
    }
    out[key] = value;
  }
  return Object.freeze(out);
}

function normalizeMetadata(metadata = {}) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) throw new Error("metadata must be an object");
  const out = {};
  for (const [key, raw] of Object.entries(metadata)) {
    if (FORBIDDEN_KEY.test(key)) throw new Error(`forbidden telemetry metadata key: ${key}`);
    if (!METADATA_KEYS.has(key)) throw new Error(`unknown telemetry metadata key: ${key}`);
    if (!["string", "number", "boolean"].includes(typeof raw)) throw new Error(`telemetry metadata must be scalar: ${key}`);
    const value = typeof raw === "string" ? raw.trim() : raw;
    if (typeof value === "string") {
      if (value.length > 240) throw new Error(`telemetry metadata too large: ${key}`);
      if (FORBIDDEN_VALUE.test(value)) throw new Error(`secret-like telemetry metadata rejected: ${key}`);
    }
    out[key] = value;
  }
  return Object.freeze(out);
}

function normalizeEvidenceRefs(refs = []) {
  if (!Array.isArray(refs)) throw new Error("evidenceRefs must be an array");
  return Object.freeze([...new Set(refs.map((value) => cleanId(value, "evidenceRef", { required: true, max: 200 })))].slice(0, 16));
}

function createObservation({
  id,
  timestamp = new Date().toISOString(),
  source,
  subsystem,
  kind,
  outcome = "INCONCLUSIVE",
  severity = "INFO",
  runId,
  requestId,
  metrics = {},
  metadata = {},
  evidenceRefs = []
} = {}) {
  const normalizedOutcome = String(outcome || "").toUpperCase();
  const normalizedSeverity = String(severity || "").toUpperCase();
  if (!OUTCOMES.has(normalizedOutcome)) throw new Error(`invalid observation outcome: ${outcome}`);
  if (!SEVERITIES.has(normalizedSeverity)) throw new Error(`invalid observation severity: ${severity}`);
  const at = new Date(timestamp);
  if (!Number.isFinite(at.getTime())) throw new Error("invalid observation timestamp");

  const body = {
    schemaVersion: 1,
    timestamp: at.toISOString(),
    source: cleanId(source, "source", { required: true }),
    subsystem: cleanId(subsystem, "subsystem", { required: true }),
    kind: cleanId(kind, "kind", { required: true }),
    outcome: normalizedOutcome,
    severity: normalizedSeverity,
    runId: cleanId(runId, "runId"),
    requestId: cleanId(requestId, "requestId"),
    metrics: normalizeMetrics(metrics),
    metadata: normalizeMetadata(metadata),
    evidenceRefs: normalizeEvidenceRefs(evidenceRefs)
  };

  const fingerprint = sha256({
    source: body.source,
    subsystem: body.subsystem,
    kind: body.kind,
    outcome: body.outcome,
    severity: body.severity,
    metrics: body.metrics,
    metadata: body.metadata
  });
  const observationId = cleanId(id, "id") || `obs:${fingerprint.slice(0, 16)}:${at.getTime()}`;

  return Object.freeze({ ...body, id: observationId, fingerprint });
}

class ObservationBuffer {
  constructor({ maxEntries = 1000 } = {}) {
    const n = Number(maxEntries);
    if (!Number.isInteger(n) || n < 10 || n > 5000) throw new Error("maxEntries must be an integer between 10 and 5000");
    this.maxEntries = n;
    this.entries = [];
  }

  append(input) {
    // Never trust a caller-supplied "already normalized" record. Re-validating every
    // append keeps the privacy/metric allowlists outside caller authority.
    const record = createObservation(input);
    this.entries.push(record);
    if (this.entries.length > this.maxEntries) this.entries.splice(0, this.entries.length - this.maxEntries);
    return record;
  }

  snapshot({ subsystem, since } = {}) {
    const sinceMs = since == null ? null : new Date(since).getTime();
    if (since != null && !Number.isFinite(sinceMs)) throw new Error("invalid snapshot since");
    return this.entries.filter((entry) => {
      if (subsystem && entry.subsystem !== subsystem) return false;
      if (sinceMs != null && new Date(entry.timestamp).getTime() < sinceMs) return false;
      return true;
    }).map((entry) => ({ ...entry, metrics: { ...entry.metrics }, metadata: { ...entry.metadata }, evidenceRefs: [...entry.evidenceRefs] }));
  }

  size() {
    return this.entries.length;
  }
}

module.exports = {
  OUTCOMES,
  SEVERITIES,
  METRIC_RULES,
  METADATA_KEYS,
  createObservation,
  normalizeMetrics,
  normalizeMetadata,
  ObservationBuffer
};
