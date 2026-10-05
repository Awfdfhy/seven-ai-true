"use strict";

const VERDICTS = Object.freeze(new Set(["APPROVE", "REJECT", "CHANGES_REQUIRED"]));
const SEVERITIES = Object.freeze(new Set(["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"]));
const SECRET_LIKE = /(?:bearer\s+[a-z0-9._~-]+|gh[pousr]_[a-z0-9_]+|sk-[a-z0-9_-]{12,})/i;

function safeText(value, name, max = 240) {
  const text = String(value == null ? "" : value).trim().replace(/\s+/g, " ");
  if (!text || text.length > max || /[\u0000-\u001f]/.test(text)) throw new Error(`invalid ${name}`);
  if (SECRET_LIKE.test(text)) throw new Error(`secret-like ${name} rejected`);
  return text;
}

function exactSha(value, name = "candidateSha") {
  const sha = String(value || "").trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error(`${name} requires exact 40-char SHA`);
  return sha;
}

function digest64(value, name) {
  const digest = String(value || "").trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(digest)) throw new Error(`${name} requires sha256 digest`);
  return digest;
}

function createFinding({
  code,
  severity = "MEDIUM",
  summary,
  evidenceRef
} = {}) {
  const normalizedSeverity = String(severity || "").toUpperCase();
  if (!SEVERITIES.has(normalizedSeverity)) throw new Error("invalid review finding severity");
  return Object.freeze({
    code: safeText(code, "finding code", 80),
    severity: normalizedSeverity,
    summary: safeText(summary, "finding summary", 400),
    evidenceRef: safeText(evidenceRef, "finding evidenceRef", 200)
  });
}

function createReview({
  reviewId,
  reviewerId,
  builderId,
  candidateSha,
  evidenceDigest,
  verdict,
  scope = "INDEPENDENT_CRITIC",
  findings = [],
  architectureChecked = true,
  testsChecked = true,
  resultsChecked = true
} = {}) {
  const normalizedVerdict = String(verdict || "").toUpperCase();
  if (!VERDICTS.has(normalizedVerdict)) throw new Error("invalid review verdict");
  if (!Array.isArray(findings)) throw new Error("review findings must be an array");

  const reviewer = safeText(reviewerId, "reviewerId", 160);
  const builder = safeText(builderId, "builderId", 160);
  const normalizedFindings = Object.freeze(findings.map((finding) => createFinding(finding)));

  return Object.freeze({
    schemaVersion: 1,
    reviewId: safeText(reviewId, "reviewId", 160),
    reviewerId: reviewer,
    builderId: builder,
    independent: reviewer !== builder,
    candidateSha: exactSha(candidateSha),
    evidenceDigest: digest64(evidenceDigest, "evidenceDigest"),
    verdict: normalizedVerdict,
    scope: safeText(scope, "review scope", 100),
    architectureChecked: architectureChecked === true,
    testsChecked: testsChecked === true,
    resultsChecked: resultsChecked === true,
    findings: normalizedFindings,
    hasCriticalFinding: normalizedFindings.some((finding) => finding.severity === "CRITICAL"),
    hasHighFinding: normalizedFindings.some((finding) => finding.severity === "HIGH")
  });
}

module.exports = {
  createFinding,
  createReview
};
