"use strict";

const SOURCE_TYPES = Object.freeze(new Set(["OFFICIAL", "PAPER", "REPO", "ENGINEERING", "COMMUNITY"]));
const STANCES = Object.freeze(new Set(["SUPPORT", "CONTRADICT", "NEUTRAL"]));
const RISK_LEVELS = Object.freeze(new Set(["LOW", "MEDIUM", "HIGH", "CRITICAL"]));
const SECRET_LIKE = /(?:bearer\s+[a-z0-9._~-]+|gh[pousr]_[a-z0-9_]+|sk-[a-z0-9_-]{12,})/i;

function boundedNumber(value, name, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${name} out of range`);
  return n;
}

function safeToken(value, name, max = 160) {
  const text = String(value == null ? "" : value).trim();
  if (!text || text.length > max || /[\u0000-\u001f]/.test(text)) throw new Error(`invalid ${name}`);
  if (SECRET_LIKE.test(text)) throw new Error(`secret-like ${name} rejected`);
  return text;
}

function parseIso(value, name, { required = true } = {}) {
  if (value == null || value === "") {
    if (required) throw new Error(`${name} required`);
    return null;
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error(`invalid ${name}`);
  return date.toISOString();
}

function normalizeSourceUrl(value) {
  let url;
  try {
    url = new URL(String(value || ""));
  } catch {
    throw new Error("invalid research source URL");
  }
  if (url.protocol !== "https:") throw new Error("research source must use HTTPS");
  if (url.username || url.password) throw new Error("credentialed research source rejected");
  if (SECRET_LIKE.test(url.href)) throw new Error("secret-like research source rejected");
  url.username = "";
  url.password = "";
  url.search = "";
  url.hash = "";
  return url.toString();
}

function decideResearch({
  diagnosis,
  riskLevel = "MEDIUM",
  fastMoving = false,
  externalDependency = false,
  priorFailedAttempts = 0,
  solutionAmbiguity = 0
} = {}) {
  if (!diagnosis || typeof diagnosis !== "object") throw new Error("diagnosis required");
  const confidence = boundedNumber(diagnosis.confidence, "diagnosis confidence", 0, 1);
  const risk = String(riskLevel || "").toUpperCase();
  if (!RISK_LEVELS.has(risk)) throw new Error("invalid risk level");
  const failures = Math.max(0, Math.min(20, Number(priorFailedAttempts) || 0));
  const ambiguity = boundedNumber(solutionAmbiguity, "solutionAmbiguity", 0, 1);

  const reasons = [];
  if (confidence < 0.70) reasons.push("diagnosis_uncertain");
  if (ambiguity >= 0.45) reasons.push("multiple_plausible_remedies");
  if (fastMoving === true) reasons.push("fast_moving_domain");
  if (externalDependency === true) reasons.push("external_dependency");
  if (failures > 0) reasons.push("prior_attempt_failed");
  if (risk === "HIGH") reasons.push("high_risk_change");
  if (risk === "CRITICAL") reasons.push("critical_governance_change");

  const required = reasons.length > 0;
  const maxSources = risk === "CRITICAL" ? 12 : risk === "HIGH" ? 10 : required ? 8 : 0;
  return Object.freeze({
    schemaVersion: 1,
    required,
    reasons: Object.freeze(reasons),
    maxSources,
    confidence,
    riskLevel: risk
  });
}

function createResearchEvidence({
  id,
  claimKey,
  stance,
  sourceUrl,
  sourceType,
  publishedAt,
  retrievedAt,
  confidence = 1,
  evidenceRef
} = {}) {
  const normalizedStance = String(stance || "").toUpperCase();
  const normalizedType = String(sourceType || "").toUpperCase();
  if (!STANCES.has(normalizedStance)) throw new Error("invalid research evidence stance");
  if (!SOURCE_TYPES.has(normalizedType)) throw new Error("invalid research source type");

  const canonicalUrl = normalizeSourceUrl(sourceUrl);
  const source = new URL(canonicalUrl);

  return Object.freeze({
    schemaVersion: 1,
    id: safeToken(id, "research evidence id"),
    claimKey: safeToken(claimKey, "claimKey", 120),
    stance: normalizedStance,
    sourceUrl: canonicalUrl,
    sourceHost: source.hostname.toLowerCase(),
    sourceType: normalizedType,
    publishedAt: parseIso(publishedAt, "publishedAt", { required: false }),
    retrievedAt: parseIso(retrievedAt, "retrievedAt"),
    confidence: boundedNumber(confidence, "research evidence confidence", 0, 1),
    evidenceRef: safeToken(evidenceRef || id, "evidenceRef", 200)
  });
}

function summarizeResearch({
  evidence = [],
  requiredClaimKeys = [],
  asOf,
  maxAgeDays = 365
} = {}) {
  if (!Array.isArray(evidence)) throw new Error("research evidence must be an array");
  if (!Array.isArray(requiredClaimKeys)) throw new Error("requiredClaimKeys must be an array");
  const now = new Date(parseIso(asOf, "asOf")).getTime();
  const maxAgeMs = boundedNumber(maxAgeDays, "maxAgeDays", 1, 3650) * 86400000;

  const rows = evidence.map((item) => item && item.schemaVersion === 1
    ? createResearchEvidence(item)
    : createResearchEvidence(item));

  const required = [...new Set(requiredClaimKeys.map((key) => safeToken(key, "required claim key", 120)))].sort();
  const byClaim = new Map();
  const staleEvidenceIds = [];

  for (const row of rows) {
    if (!byClaim.has(row.claimKey)) byClaim.set(row.claimKey, []);
    byClaim.get(row.claimKey).push(row);
    const freshnessAt = new Date(row.publishedAt || row.retrievedAt).getTime();
    if (now - freshnessAt > maxAgeMs) staleEvidenceIds.push(row.id);
  }

  const contradictions = [];
  for (const [claimKey, claimRows] of byClaim.entries()) {
    const support = claimRows.some((row) => row.stance === "SUPPORT" && row.confidence >= 0.5);
    const contradict = claimRows.some((row) => row.stance === "CONTRADICT" && row.confidence >= 0.5);
    if (support && contradict) contradictions.push(claimKey);
  }

  const coveredClaimKeys = required.filter((key) => byClaim.has(key));
  const gaps = required.filter((key) => !byClaim.has(key));
  const independentHosts = [...new Set(rows.map((row) => row.sourceHost))].sort();

  return Object.freeze({
    schemaVersion: 1,
    evidenceCount: rows.length,
    requiredClaimKeys: Object.freeze(required),
    coveredClaimKeys: Object.freeze(coveredClaimKeys),
    gaps: Object.freeze(gaps),
    contradictions: Object.freeze(contradictions.sort()),
    staleEvidenceIds: Object.freeze([...new Set(staleEvidenceIds)].sort()),
    independentHosts: Object.freeze(independentHosts),
    coverage: required.length ? Number((coveredClaimKeys.length / required.length).toFixed(6)) : 1,
    complete: gaps.length === 0,
    hasContradictions: contradictions.length > 0
  });
}

module.exports = {
  decideResearch,
  normalizeSourceUrl,
  createResearchEvidence,
  summarizeResearch
};
