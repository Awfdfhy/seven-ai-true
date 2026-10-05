"use strict";

const crypto = require("crypto");

const REQUIRED_FEATURES = Object.freeze([
  "bounded-repair",
  "cancellation",
  "exact-sha",
  "evidence-bundle",
  "independent-review",
  "isolated-workspace",
  "mandatory-verification",
  "protected-evaluator",
  "transactional-patch"
]);

const SECRET_LIKE = /(?:bearer\s+[a-z0-9._~-]+|gh[pousr]_[a-z0-9_]+|sk-[a-z0-9_-]{12,})/i;

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

function digest(value) {
  return crypto.createHash("sha256").update(JSON.stringify(stableObject(value))).digest("hex");
}

function safeText(value, name, max = 240) {
  const text = String(value == null ? "" : value).trim().replace(/\s+/g, " ");
  if (!text || text.length > max || /[\u0000-\u001f]/.test(text)) throw new Error(`invalid ${name}`);
  if (SECRET_LIKE.test(text)) throw new Error(`secret-like ${name} rejected`);
  return text;
}

function exactSha(value, name) {
  const sha = String(value || "").trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error(`${name} requires exact 40-char SHA`);
  return sha;
}

function digest64(value, name) {
  const hash = String(value || "").trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(hash)) throw new Error(`${name} requires sha256 digest`);
  return hash;
}

function normalizeAttestation(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Coding attestation required");
  const allowed = new Set([
    "schemaVersion",
    "authority",
    "runtimeId",
    "implementationSha",
    "evidenceDigest",
    "sourceBranch",
    "features"
  ]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new Error(`unknown Coding attestation field: ${key}`);
  }
  if (value.schemaVersion !== 1) throw new Error("unsupported Coding attestation schema");
  if (value.authority !== "SEVEN_CODING_V1") throw new Error("Coding attestation authority mismatch");
  if (!Array.isArray(value.features)) throw new Error("Coding attestation features required");
  const features = [...new Set(value.features.map((item) => safeText(item, "Coding feature", 80)))].sort();
  return Object.freeze({
    schemaVersion: 1,
    authority: "SEVEN_CODING_V1",
    runtimeId: safeText(value.runtimeId, "Coding runtimeId", 120),
    implementationSha: exactSha(value.implementationSha, "Coding implementationSha"),
    evidenceDigest: digest64(value.evidenceDigest, "Coding evidenceDigest"),
    sourceBranch: safeText(value.sourceBranch, "Coding sourceBranch", 120),
    features: Object.freeze(features)
  });
}

function inspectCodingAdapter({ adapter, attestation, attestationVerifier } = {}) {
  const reasons = [];
  if (!adapter || typeof adapter !== "object" || Array.isArray(adapter)) {
    reasons.push("coding_adapter_missing");
  } else if (typeof adapter.run !== "function") {
    reasons.push("coding_run_port_missing");
  }

  let normalizedAttestation = null;
  try {
    normalizedAttestation = normalizeAttestation(attestation);
  } catch (error) {
    reasons.push("coding_attestation_invalid");
  }

  if (normalizedAttestation) {
    for (const feature of REQUIRED_FEATURES) {
      if (!normalizedAttestation.features.includes(feature)) reasons.push(`coding_feature_missing:${feature}`);
    }
  }

  if (typeof attestationVerifier !== "function") {
    reasons.push("coding_attestation_verifier_missing");
  } else if (normalizedAttestation) {
    let trusted = false;
    try {
      trusted = attestationVerifier(normalizedAttestation, adapter) === true;
    } catch {
      trusted = false;
    }
    if (!trusted) reasons.push("coding_attestation_untrusted");
  }

  const unique = [...new Set(reasons)];
  return Object.freeze({
    schemaVersion: 1,
    ready: unique.length === 0,
    decision: unique.length === 0 ? "CODING_SYSTEM_READY" : "BLOCKED_CODING_SYSTEM_UNAVAILABLE",
    reasons: Object.freeze(unique),
    attestation: normalizedAttestation,
    requiredFeatures: Object.freeze([...REQUIRED_FEATURES])
  });
}

function normalizeAllowedPaths(paths) {
  if (!Array.isArray(paths) || !paths.length) throw new Error("Coding handoff allowedPaths required");
  const out = [...new Set(paths.map((path) => {
    const normalized = String(path || "").replace(/\\/g, "/").replace(/^\.\//, "").trim();
    if (!normalized || normalized.startsWith("/") || normalized.includes("../") || normalized === "..") {
      throw new Error(`unsafe Coding handoff path: ${normalized}`);
    }
    return normalized;
  }))].sort();
  return Object.freeze(out);
}

function createCodingHandoff({
  planningCandidate,
  codingAvailability,
  baselineSha,
  taskId,
  runId,
  taskSummary,
  acceptanceCriteria = []
} = {}) {
  if (!planningCandidate || typeof planningCandidate !== "object") throw new Error("planningCandidate required");
  if (planningCandidate.orchestrationAuthorized !== true) {
    return Object.freeze({
      decision: "BLOCKED_PLANNING_NOT_AUTHORIZED",
      reasons: Object.freeze(["planning_not_orchestration_authorized"])
    });
  }
  if (planningCandidate.ordinaryCodingAllowed !== true || planningCandidate.disposition === "GOVERNANCE_REQUIRED") {
    return Object.freeze({
      decision: "BLOCKED_GOVERNANCE",
      reasons: Object.freeze(["planning_candidate_not_allowed_in_ordinary_coding"])
    });
  }
  if (!codingAvailability || codingAvailability.ready !== true || codingAvailability.decision !== "CODING_SYSTEM_READY") {
    return Object.freeze({
      decision: "BLOCKED_CODING_SYSTEM_UNAVAILABLE",
      reasons: Object.freeze(codingAvailability && codingAvailability.reasons ? [...codingAvailability.reasons] : ["coding_system_unavailable"])
    });
  }
  if (!codingAvailability.attestation) throw new Error("verified Coding attestation missing");

  const baseline = exactSha(baselineSha, "baselineSha");
  const paths = normalizeAllowedPaths(planningCandidate.scopeManifest && planningCandidate.scopeManifest.allowedPaths);
  const criteria = Object.freeze([...new Set(acceptanceCriteria.map((value) => safeText(value, "acceptanceCriterion", 240)))].slice(0, 40));
  if (!criteria.length) throw new Error("acceptanceCriteria required");

  const body = {
    schemaVersion: 1,
    taskId: safeText(taskId, "taskId", 160),
    runId: safeText(runId, "runId", 160),
    taskSummary: safeText(taskSummary, "taskSummary", 500),
    baselineSha: baseline,
    implementationSha: codingAvailability.attestation.implementationSha,
    implementationEvidenceDigest: codingAvailability.attestation.evidenceDigest,
    planningValidationDigest: digest64(planningCandidate.validationDigest, "planningValidationDigest"),
    scopeDigest: digest64(planningCandidate.scopeManifest.scopeDigest, "scopeDigest"),
    allowedPaths: paths,
    maxRepairAttempts: Number(planningCandidate.scopeManifest.maxRepairAttempts),
    acceptanceCriteria: criteria
  };

  if (!Number.isInteger(body.maxRepairAttempts) || body.maxRepairAttempts < 0 || body.maxRepairAttempts > 5) {
    throw new Error("invalid Coding handoff repair budget");
  }

  return Object.freeze({
    ...body,
    decision: "READY_FOR_CODING_SYSTEM",
    handoffDigest: digest(body),
    fallbackAllowed: false
  });
}

function handoffCore(handoff) {
  return {
    schemaVersion: handoff.schemaVersion,
    taskId: handoff.taskId,
    runId: handoff.runId,
    taskSummary: handoff.taskSummary,
    baselineSha: handoff.baselineSha,
    implementationSha: handoff.implementationSha,
    implementationEvidenceDigest: handoff.implementationEvidenceDigest,
    planningValidationDigest: handoff.planningValidationDigest,
    scopeDigest: handoff.scopeDigest,
    allowedPaths: handoff.allowedPaths,
    maxRepairAttempts: handoff.maxRepairAttempts,
    acceptanceCriteria: handoff.acceptanceCriteria
  };
}

function validateCodingResult({ handoff, result, resultVerifier } = {}) {
  if (!handoff || handoff.decision !== "READY_FOR_CODING_SYSTEM" || handoff.fallbackAllowed !== false) {
    return Object.freeze({ decision: "BLOCKED", reasons: Object.freeze(["invalid_coding_handoff"]) });
  }
  if (digest(handoffCore(handoff)) !== handoff.handoffDigest) {
    return Object.freeze({ decision: "BLOCKED", reasons: Object.freeze(["coding_handoff_integrity_failed"]) });
  }
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return Object.freeze({ decision: "BLOCKED", reasons: Object.freeze(["coding_result_missing"]) });
  }

  const allowed = new Set([
    "schemaVersion",
    "status",
    "taskId",
    "runId",
    "baselineSha",
    "commitSha",
    "implementationSha",
    "changedPaths",
    "attempts",
    "verificationDigest",
    "reviewDigest",
    "evidenceDigest"
  ]);
  for (const key of Object.keys(result)) {
    if (!allowed.has(key)) return Object.freeze({ decision: "BLOCKED", reasons: Object.freeze([`unknown_coding_result_field:${key}`]) });
  }

  const reasons = [];
  if (result.schemaVersion !== 1) reasons.push("coding_result_schema_invalid");
  const status = String(result.status || "").toUpperCase();
  if (!["PASS", "FAIL", "BLOCKED"].includes(status)) reasons.push("coding_result_status_invalid");

  let baseline = null;
  let implementation = null;
  try { baseline = exactSha(result.baselineSha, "result baselineSha"); } catch { reasons.push("coding_result_baseline_invalid"); }
  try { implementation = exactSha(result.implementationSha, "result implementationSha"); } catch { reasons.push("coding_result_implementation_invalid"); }

  if (baseline && baseline !== handoff.baselineSha) reasons.push("coding_result_baseline_mismatch");
  if (implementation && implementation !== handoff.implementationSha) reasons.push("coding_result_implementation_mismatch");
  if (String(result.taskId || "") !== handoff.taskId) reasons.push("coding_result_task_mismatch");
  if (String(result.runId || "") !== handoff.runId) reasons.push("coding_result_run_mismatch");

  const attempts = Number(result.attempts);
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > Math.max(1, handoff.maxRepairAttempts + 1)) {
    reasons.push("coding_result_attempt_budget_invalid");
  }

  let changedPaths = [];
  try {
    changedPaths = [...normalizeAllowedPaths(result.changedPaths || [])];
  } catch {
    reasons.push("coding_result_changed_paths_invalid");
  }
  const outsideScope = changedPaths.filter((path) => !handoff.allowedPaths.some((allowedPath) =>
    path === allowedPath || path.startsWith(`${allowedPath.replace(/\/$/, "")}/`)
  ));
  if (outsideScope.length) reasons.push("coding_result_scope_escape");

  let commitSha = null;
  if (result.commitSha != null && result.commitSha !== "") {
    try { commitSha = exactSha(result.commitSha, "result commitSha"); } catch { reasons.push("coding_result_commit_invalid"); }
  }

  if (status === "PASS") {
    if (!commitSha) reasons.push("coding_pass_commit_missing");
    if (commitSha && commitSha === handoff.baselineSha) reasons.push("coding_pass_candidate_equals_baseline");
    for (const field of ["verificationDigest", "reviewDigest", "evidenceDigest"]) {
      try { digest64(result[field], `result ${field}`); } catch { reasons.push(`coding_pass_${field}_invalid`); }
    }
  }

  if (typeof resultVerifier !== "function") {
    reasons.push("coding_result_verifier_missing");
  } else {
    let trusted = false;
    try {
      trusted = resultVerifier(result, handoff) === true;
    } catch {
      trusted = false;
    }
    if (!trusted) reasons.push("coding_result_untrusted");
  }

  if (reasons.length) {
    return Object.freeze({
      decision: "BLOCKED",
      reasons: Object.freeze([...new Set(reasons)]),
      status
    });
  }

  if (status === "BLOCKED") {
    return Object.freeze({ decision: "CODING_BLOCKED", reasons: Object.freeze([]), status });
  }
  if (status === "FAIL") {
    return Object.freeze({ decision: "CODING_FAILED", reasons: Object.freeze([]), status });
  }

  return Object.freeze({
    decision: "VERIFIED_CODING_CANDIDATE",
    reasons: Object.freeze([]),
    status,
    candidateSha: commitSha,
    baselineSha: baseline,
    changedPaths: Object.freeze(changedPaths),
    verificationDigest: digest64(result.verificationDigest, "result verificationDigest"),
    reviewDigest: digest64(result.reviewDigest, "result reviewDigest"),
    evidenceDigest: digest64(result.evidenceDigest, "result evidenceDigest")
  });
}

module.exports = {
  REQUIRED_FEATURES,
  inspectCodingAdapter,
  createCodingHandoff,
  validateCodingResult
};
