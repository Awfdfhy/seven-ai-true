"use strict";

const {
  canonicalize,
  hashObject,
  appendEvent,
  verifyLedger
} = require("./ledger.cjs");
const { normalizeRepoPath } = require("./experiment-lab.cjs");
const { getMetricDefinition } = require("./self-development-metrics.cjs");

const EVENT_TYPE = "SELF_DEVELOPMENT_LEARNING";
const EVENT_SOURCE = "seven-self-development";

const DECISIONS = Object.freeze(new Set([
  "ACCEPT",
  "REJECT",
  "ROLLBACK",
  "BLOCKED",
  "INCONCLUSIVE"
]));

const LESSONS = Object.freeze(new Set([
  "ADOPT",
  "AVOID",
  "RETEST"
]));

const CAUSAL_STATUS = Object.freeze(new Set([
  "HYPOTHESIS",
  "CONTROLLED_EVIDENCE",
  "CONFIRMED"
]));

const METRIC_STATUS = Object.freeze(new Set([
  "IMPROVED",
  "NEUTRAL",
  "REGRESSED",
  "INCONCLUSIVE"
]));

const ALLOWED_INPUT_FIELDS = Object.freeze(new Set([
  "schemaVersion",
  "experimentId",
  "diagnosisId",
  "weaknessSignature",
  "hypothesisFingerprint",
  "baselineSha",
  "candidateSha",
  "manifestDigest",
  "evidenceDigest",
  "decision",
  "lesson",
  "reasonCodes",
  "changedPaths",
  "affectedSystems",
  "metricResults",
  "confounders",
  "knownUnknowns",
  "evidenceRefs",
  "causalStatus",
  "proofLevel",
  "recordedAt"
]));

const SECRET_LIKE = /(?:bearer\s+[a-z0-9._~-]+|gh[pousr]_[a-z0-9_]+|sk-[a-z0-9_-]{12,})/i;

function safeText(value, name, max = 240) {
  const text = String(value == null ? "" : value).trim().replace(/\s+/g, " ");
  if (!text || text.length > max || /[\u0000-\u001f]/.test(text)) throw new Error(`invalid ${name}`);
  if (SECRET_LIKE.test(text)) throw new Error(`secret-like ${name} rejected`);
  return text;
}

function safeList(values, name, { maxItems = 32, maxText = 240 } = {}) {
  if (!Array.isArray(values)) throw new Error(`${name} must be an array`);
  return Object.freeze(
    [...new Set(values.map((value) => safeText(value, name, maxText)))].slice(0, maxItems)
  );
}

function exactSha(value, name, { required = true } = {}) {
  if (value == null || value === "") {
    if (required) throw new Error(`${name} required`);
    return null;
  }
  const sha = String(value).trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error(`${name} requires exact 40-char SHA`);
  return sha;
}

function digest64(value, name, { required = true } = {}) {
  if (value == null || value === "") {
    if (required) throw new Error(`${name} required`);
    return null;
  }
  const digest = String(value).trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(digest)) throw new Error(`${name} requires sha256 digest`);
  return digest;
}

function iso(value, name = "recordedAt") {
  const date = new Date(value || "");
  if (!Number.isFinite(date.getTime())) throw new Error(`invalid ${name}`);
  return date.toISOString();
}

function normalizeProofLevel(value) {
  const level = safeText(value || "L0", "proofLevel", 8).toUpperCase();
  if (!/^L[0-8]$/.test(level)) throw new Error("invalid proofLevel");
  return level;
}

function normalizeReasonCodes(values = []) {
  const reasons = safeList(values, "reasonCode", { maxItems: 32, maxText: 100 });
  for (const reason of reasons) {
    if (!/^[a-z0-9][a-z0-9_.:-]*$/i.test(reason)) throw new Error(`invalid reasonCode: ${reason}`);
  }
  return reasons;
}

function normalizeChangedPaths(values = []) {
  if (!Array.isArray(values)) throw new Error("changedPaths must be an array");
  return Object.freeze([...new Set(values.map(normalizeRepoPath))].sort().slice(0, 64));
}

function finiteOrNull(value, name) {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`non-finite ${name}`);
  return n;
}

function normalizeMetricResults(values = []) {
  if (!Array.isArray(values)) throw new Error("metricResults must be an array");
  if (values.length > 64) throw new Error("too many metricResults");

  const seen = new Set();
  const rows = values.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("invalid metricResult");
    const allowed = new Set([
      "metricId",
      "status",
      "baselineMean",
      "candidateMean",
      "improvement",
      "hardViolation"
    ]);
    for (const key of Object.keys(raw)) {
      if (!allowed.has(key)) throw new Error(`unknown metricResult field: ${key}`);
    }

    const metricId = safeText(raw.metricId, "metricId", 100);
    getMetricDefinition(metricId);
    if (seen.has(metricId)) throw new Error(`duplicate metricResult: ${metricId}`);
    seen.add(metricId);

    const status = String(raw.status || "").toUpperCase();
    if (!METRIC_STATUS.has(status)) throw new Error(`invalid metric status: ${status}`);
    if (raw.hardViolation !== true && raw.hardViolation !== false) {
      throw new Error("hardViolation must be boolean");
    }

    return Object.freeze({
      metricId,
      status,
      baselineMean: finiteOrNull(raw.baselineMean, `${metricId}.baselineMean`),
      candidateMean: finiteOrNull(raw.candidateMean, `${metricId}.candidateMean`),
      improvement: finiteOrNull(raw.improvement, `${metricId}.improvement`),
      hardViolation: raw.hardViolation
    });
  });

  return Object.freeze(rows.sort((a, b) => a.metricId.localeCompare(b.metricId)));
}

function validateDecisionLesson(decision, lesson, candidateSha, manifestDigest, evidenceDigest) {
  if (["ACCEPT", "REJECT", "ROLLBACK"].includes(decision)) {
    if (!candidateSha) throw new Error(`candidateSha required for ${decision}`);
    if (!manifestDigest) throw new Error(`manifestDigest required for ${decision}`);
    if (!evidenceDigest) throw new Error(`evidenceDigest required for ${decision}`);
  }

  if (decision === "ACCEPT" && lesson !== "ADOPT") {
    throw new Error("ACCEPT requires ADOPT lesson");
  }
  if (decision === "ROLLBACK" && lesson === "ADOPT") {
    throw new Error("ROLLBACK cannot produce ADOPT lesson");
  }
  if (decision === "REJECT" && lesson === "ADOPT") {
    throw new Error("REJECT cannot produce ADOPT lesson");
  }
  if (["BLOCKED", "INCONCLUSIVE"].includes(decision) && lesson !== "RETEST") {
    throw new Error(`${decision} requires RETEST lesson`);
  }
}

function createLearningRecord(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("learning record input required");

  for (const key of Object.keys(input)) {
    if (!ALLOWED_INPUT_FIELDS.has(key)) throw new Error(`unknown learning record field: ${key}`);
  }

  const decision = String(input.decision || "").toUpperCase();
  const lesson = String(input.lesson || "").toUpperCase();
  const causalStatus = String(input.causalStatus || "HYPOTHESIS").toUpperCase();

  if (!DECISIONS.has(decision)) throw new Error("invalid learning decision");
  if (!LESSONS.has(lesson)) throw new Error("invalid learning lesson");
  if (!CAUSAL_STATUS.has(causalStatus)) throw new Error("invalid causalStatus");

  const candidateSha = exactSha(input.candidateSha, "candidateSha", { required: false });
  const manifestDigest = digest64(input.manifestDigest, "manifestDigest", { required: false });
  const evidenceDigest = digest64(input.evidenceDigest, "evidenceDigest", { required: false });
  validateDecisionLesson(decision, lesson, candidateSha, manifestDigest, evidenceDigest);

  const record = {
    schemaVersion: 1,
    experimentId: safeText(input.experimentId, "experimentId", 160),
    diagnosisId: safeText(input.diagnosisId, "diagnosisId", 200),
    weaknessSignature: safeText(input.weaknessSignature, "weaknessSignature", 300),
    hypothesisFingerprint: digest64(input.hypothesisFingerprint, "hypothesisFingerprint"),
    baselineSha: exactSha(input.baselineSha, "baselineSha"),
    candidateSha,
    manifestDigest,
    evidenceDigest,
    decision,
    lesson,
    reasonCodes: normalizeReasonCodes(input.reasonCodes || []),
    changedPaths: normalizeChangedPaths(input.changedPaths || []),
    affectedSystems: safeList(input.affectedSystems || [], "affectedSystem", { maxItems: 24, maxText: 100 }),
    metricResults: normalizeMetricResults(input.metricResults || []),
    confounders: safeList(input.confounders || [], "confounder", { maxItems: 24, maxText: 300 }),
    knownUnknowns: safeList(input.knownUnknowns || [], "knownUnknown", { maxItems: 24, maxText: 300 }),
    evidenceRefs: safeList(input.evidenceRefs || [], "evidenceRef", { maxItems: 40, maxText: 200 }),
    causalStatus,
    proofLevel: normalizeProofLevel(input.proofLevel || "L0"),
    recordedAt: iso(input.recordedAt)
  };

  return Object.freeze(record);
}

function validateStoredRecord(payload) {
  try {
    const normalized = createLearningRecord(payload);
    return {
      valid: hashObject(canonicalize(normalized)) === hashObject(canonicalize(payload)),
      normalized,
      reason: null
    };
  } catch (error) {
    return {
      valid: false,
      normalized: null,
      reason: String(error && error.message || error)
    };
  }
}

function verifyLearningArchive(ledger = []) {
  const chain = verifyLedger(ledger);
  if (!chain.valid) {
    return {
      valid: false,
      reason: `ledger_${chain.reason}`,
      index: chain.index,
      entries: ledger.length,
      head: chain.head || null
    };
  }

  const experimentIds = new Set();
  for (let index = 0; index < ledger.length; index += 1) {
    const entry = ledger[index];
    if (entry.type !== EVENT_TYPE || entry.source !== EVENT_SOURCE) {
      return { valid: false, reason: "unexpected_event_type", index, entries: ledger.length, head: chain.head };
    }

    const record = validateStoredRecord(entry.payload);
    if (!record.valid) {
      return { valid: false, reason: "invalid_learning_record", detail: record.reason, index, entries: ledger.length, head: chain.head };
    }
    if (experimentIds.has(record.normalized.experimentId)) {
      return { valid: false, reason: "duplicate_experiment_id", index, entries: ledger.length, head: chain.head };
    }
    experimentIds.add(record.normalized.experimentId);
  }

  return {
    valid: true,
    reason: null,
    entries: ledger.length,
    head: chain.head
  };
}

function appendLearningRecord(ledger = [], input = {}) {
  const verification = verifyLearningArchive(ledger);
  if (!verification.valid) throw new Error(`invalid learning archive: ${verification.reason}`);

  const record = createLearningRecord(input);
  const duplicate = ledger.some((entry) => entry.payload && entry.payload.experimentId === record.experimentId);
  if (duplicate) throw new Error(`duplicate learning experiment: ${record.experimentId}`);

  return appendEvent(ledger, {
    type: EVENT_TYPE,
    source: EVENT_SOURCE,
    timestamp: record.recordedAt,
    payload: record
  });
}

function recordsFromArchive(ledger = []) {
  const verification = verifyLearningArchive(ledger);
  if (!verification.valid) throw new Error(`invalid learning archive: ${verification.reason}`);
  return Object.freeze(ledger.map((entry) => Object.freeze({ ...entry.payload })));
}

function findPriorAttempts(ledger = [], hypothesisFingerprint) {
  const fingerprint = digest64(hypothesisFingerprint, "hypothesisFingerprint");
  return Object.freeze(recordsFromArchive(ledger)
    .filter((record) => record.hypothesisFingerprint === fingerprint)
    .map((record) => Object.freeze({
      fingerprint,
      decision: record.decision,
      evidenceRefs: Object.freeze([...record.evidenceRefs]),
      experimentId: record.experimentId,
      lesson: record.lesson,
      recordedAt: record.recordedAt
    })));
}

function createLearningSnapshot(ledger = []) {
  const verification = verifyLearningArchive(ledger);
  if (!verification.valid) throw new Error(`invalid learning archive: ${verification.reason}`);

  const body = {
    schemaVersion: 1,
    eventType: EVENT_TYPE,
    entries: ledger.length,
    head: verification.head,
    ledger: canonicalize(ledger)
  };
  return Object.freeze({
    ...body,
    checksum: hashObject(body)
  });
}

function restoreLearningSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    throw new Error("learning snapshot required");
  }
  const body = {
    schemaVersion: snapshot.schemaVersion,
    eventType: snapshot.eventType,
    entries: snapshot.entries,
    head: snapshot.head,
    ledger: canonicalize(snapshot.ledger || [])
  };
  if (snapshot.schemaVersion !== 1 || snapshot.eventType !== EVENT_TYPE) {
    throw new Error("invalid learning snapshot schema");
  }
  if (snapshot.checksum !== hashObject(body)) throw new Error("learning snapshot checksum mismatch");

  const ledger = snapshot.ledger || [];
  const verification = verifyLearningArchive(ledger);
  if (!verification.valid) throw new Error(`invalid learning snapshot archive: ${verification.reason}`);
  if (snapshot.entries !== verification.entries || snapshot.head !== verification.head) {
    throw new Error("learning snapshot identity mismatch");
  }

  return Object.freeze(ledger.map((entry) => Object.freeze(canonicalize(entry))));
}

function assertExperimentStartAllowed({
  ledger = [],
  experimentId,
  activeExperimentId = null
} = {}) {
  verifyLearningArchive(ledger);
  const next = safeText(experimentId, "experimentId", 160);
  if (activeExperimentId != null && activeExperimentId !== "") {
    const active = safeText(activeExperimentId, "activeExperimentId", 160);
    if (active !== next) {
      const error = new Error(`unfinished self-development experiment blocks new start: ${active}`);
      error.code = "SELF_DEV_ACTIVE_EXPERIMENT";
      throw error;
    }
  }
  if (ledger.some((entry) => entry.payload && entry.payload.experimentId === next)) {
    const error = new Error(`experiment already has terminal learning record: ${next}`);
    error.code = "SELF_DEV_EXPERIMENT_TERMINAL";
    throw error;
  }
  return true;
}

module.exports = {
  EVENT_TYPE,
  createLearningRecord,
  appendLearningRecord,
  verifyLearningArchive,
  recordsFromArchive,
  findPriorAttempts,
  createLearningSnapshot,
  restoreLearningSnapshot,
  assertExperimentStartAllowed
};
