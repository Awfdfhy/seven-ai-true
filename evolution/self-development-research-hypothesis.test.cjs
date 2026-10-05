"use strict";

const assert = require("assert/strict");
const {
  decideResearch,
  normalizeSourceUrl,
  createResearchEvidence,
  summarizeResearch
} = require("./self-development-research.cjs");
const {
  createHypothesis,
  validateHypothesisSet
} = require("./self-development-hypotheses.cjs");

function pass(name, fn) {
  fn();
  console.log("PASS", name);
}

const highConfidenceDiagnosis = { id: "diag-high", confidence: 0.9 };
const uncertainDiagnosis = { id: "diag-low", confidence: 0.5 };

function hypothesis(id, overrides = {}) {
  return createHypothesis({
    id,
    diagnosisId: overrides.diagnosisId || "diag-low",
    mechanism: overrides.mechanism || `Mechanism ${id} changes a bounded ranking policy and predicts measurable quality gain.`,
    changeClass: overrides.changeClass || "ranking",
    targetPaths: overrides.targetPaths || [`release/${id}.js`],
    expectedEffects: overrides.expectedEffects || { qualityScore: "IMPROVE", p90LatencyMs: "PRESERVE" },
    assumptions: overrides.assumptions || ["fixture distribution remains comparable"],
    validationMetrics: overrides.validationMetrics || ["qualityScore", "p90LatencyMs"],
    rollbackPlan: overrides.rollbackPlan || "restore exact baseline SHA",
    evidenceRefs: overrides.evidenceRefs || ["research:source-1"]
  });
}

function evidence({
  id = "research-e1",
  claimKey = "root_cause",
  stance = "SUPPORT",
  host = "example.com",
  publishedAt = "2026-09-20T00:00:00Z",
  retrievedAt = "2026-10-04T00:00:00Z"
} = {}) {
  return createResearchEvidence({
    id,
    claimKey,
    stance,
    sourceUrl: `https://${host}/evidence/${id}?tracking=1`,
    sourceType: "PAPER",
    publishedAt,
    retrievedAt,
    confidence: 0.9
  });
}

function completeResearch(overrides = {}) {
  return {
    researchContext: {},
    researchEvidence: [evidence()],
    requiredClaimKeys: ["root_cause"],
    researchAsOf: "2026-10-05T00:00:00Z",
    researchMaxAgeDays: 365,
    ...overrides
  };
}

pass("high-confidence low-risk internal diagnosis can skip external research", () => {
  const decision = decideResearch({
    diagnosis: highConfidenceDiagnosis,
    riskLevel: "LOW",
    fastMoving: false,
    externalDependency: false,
    priorFailedAttempts: 0,
    solutionAmbiguity: 0.1
  });
  assert.equal(decision.required, false);
  assert.equal(decision.maxSources, 0);
});

pass("uncertain, ambiguous, failed or high-risk work triggers research", () => {
  const uncertain = decideResearch({ diagnosis: uncertainDiagnosis, riskLevel: "MEDIUM" });
  assert.equal(uncertain.required, true);
  assert.ok(uncertain.reasons.includes("diagnosis_uncertain"));

  const ambiguous = decideResearch({ diagnosis: highConfidenceDiagnosis, riskLevel: "MEDIUM", solutionAmbiguity: 0.7 });
  assert.ok(ambiguous.reasons.includes("multiple_plausible_remedies"));

  const failed = decideResearch({ diagnosis: highConfidenceDiagnosis, riskLevel: "MEDIUM", priorFailedAttempts: 1 });
  assert.ok(failed.reasons.includes("prior_attempt_failed"));

  const critical = decideResearch({ diagnosis: highConfidenceDiagnosis, riskLevel: "CRITICAL" });
  assert.equal(critical.required, true);
  assert.equal(critical.maxSources, 12);
  assert.ok(critical.reasons.includes("critical_governance_change"));
});

pass("research URLs are HTTPS-only, credential-free and query-stripped", () => {
  assert.equal(
    normalizeSourceUrl("https://example.com/docs/page?utm_source=x#section"),
    "https://example.com/docs/page"
  );
  assert.throws(() => normalizeSourceUrl("http://example.com/docs"), /HTTPS/);
  assert.throws(() => normalizeSourceUrl("https://user:pass@example.com/docs"), /credentialed/);
  assert.throws(() => normalizeSourceUrl("https://example.com/docs?token=ghp_abcdefghijklmnopqrstuvwxyz123456"), /secret-like/);
});

pass("research summary exposes coverage, contradictions, independence and staleness", () => {
  const rows = [
    createResearchEvidence({
      id: "e1",
      claimKey: "sandbox_required",
      stance: "SUPPORT",
      sourceUrl: "https://example.com/official?a=1",
      sourceType: "OFFICIAL",
      publishedAt: "2026-09-20T00:00:00Z",
      retrievedAt: "2026-10-04T00:00:00Z",
      confidence: 0.9
    }),
    createResearchEvidence({
      id: "e2",
      claimKey: "sandbox_required",
      stance: "CONTRADICT",
      sourceUrl: "https://example.org/paper",
      sourceType: "PAPER",
      publishedAt: "2026-09-25T00:00:00Z",
      retrievedAt: "2026-10-04T00:00:00Z",
      confidence: 0.8
    }),
    createResearchEvidence({
      id: "e3",
      claimKey: "eval_lock_required",
      stance: "SUPPORT",
      sourceUrl: "https://old.example.net/post",
      sourceType: "ENGINEERING",
      publishedAt: "2020-01-01T00:00:00Z",
      retrievedAt: "2026-10-04T00:00:00Z",
      confidence: 0.7
    })
  ];
  const summary = summarizeResearch({
    evidence: rows,
    requiredClaimKeys: ["sandbox_required", "eval_lock_required", "rollback_required"],
    asOf: "2026-10-05T00:00:00Z",
    maxAgeDays: 365
  });
  assert.equal(summary.coverage, 0.666667);
  assert.deepEqual(summary.gaps, ["rollback_required"]);
  assert.deepEqual(summary.contradictions, ["sandbox_required"]);
  assert.ok(summary.staleEvidenceIds.includes("e3"));
  assert.equal(summary.independentHosts.length, 3);
});

pass("hypothesis requires known measurable effects and a validation plan", () => {
  const value = hypothesis("h1");
  assert.equal(value.expectedEffects.qualityScore, "IMPROVE");
  assert.equal(value.risk.level, "LOW");
  assert.equal(value.planningDisposition, "ELIGIBLE_FOR_PLANNING");
  assert.ok(/^[0-9a-f]{64}$/.test(value.fingerprint));

  assert.throws(() => createHypothesis({
    id: "bad",
    diagnosisId: "diag",
    mechanism: "Unknown metric should not become success authority.",
    changeClass: "ranking",
    targetPaths: ["release/router.js"],
    expectedEffects: { magicWinScore: "IMPROVE" },
    validationMetrics: ["magicWinScore"]
  }), /unknown self-development metric/);
});

pass("critical protected-plane hypothesis is governance-only", () => {
  const value = createHypothesis({
    id: "critical",
    diagnosisId: "diag",
    mechanism: "Change evaluator behavior under explicit governance rather than ordinary optimization.",
    changeClass: "self_development",
    targetPaths: ["evolution/gates.cjs"],
    expectedEffects: { reliabilityScore: "IMPROVE" },
    validationMetrics: ["reliabilityScore"],
    evidenceRefs: ["research:governance"]
  });
  assert.equal(value.risk.level, "CRITICAL");
  assert.equal(value.planningDisposition, "GOVERNANCE_REQUIRED");
});

pass("caller cannot bypass required research by supplying a fake decision object", () => {
  const result = validateHypothesisSet({
    diagnosis: uncertainDiagnosis,
    candidates: [hypothesis("h1"), hypothesis("h2")],
    researchContext: {},
    researchEvidence: [],
    requiredClaimKeys: ["root_cause"],
    researchAsOf: "2026-10-05T00:00:00Z"
  });
  assert.equal(result.readyForPlanning, false);
  assert.equal(result.decision, "BLOCKED_RESEARCH_INCOMPLETE");
  assert.equal(result.researchDecision.required, true);
});

pass("uncertain diagnosis requires multiple distinct hypotheses after research is complete", () => {
  const one = validateHypothesisSet({
    diagnosis: uncertainDiagnosis,
    candidates: [hypothesis("h1")],
    ...completeResearch()
  });
  assert.equal(one.readyForPlanning, false);
  assert.equal(one.minCandidates, 2);

  const two = validateHypothesisSet({
    diagnosis: uncertainDiagnosis,
    candidates: [hypothesis("h1"), hypothesis("h2")],
    ...completeResearch()
  });
  assert.equal(two.readyForPlanning, true);
  assert.equal(two.accepted.length, 2);
  assert.equal(two.researchSummary.complete, true);
});

pass("explicit solution ambiguity also requires alternative hypotheses", () => {
  const result = validateHypothesisSet({
    diagnosis: highConfidenceDiagnosis,
    candidates: [hypothesis("h1", { diagnosisId: "diag-high" })],
    ...completeResearch({ researchContext: { solutionAmbiguity: 0.8 } })
  });
  assert.equal(result.readyForPlanning, false);
  assert.equal(result.minCandidates, 2);
  assert.ok(result.researchDecision.reasons.includes("multiple_plausible_remedies"));
});

pass("contradictory research requires multiple hypotheses and critic review", () => {
  const researchEvidence = [
    evidence({ id: "support", stance: "SUPPORT", host: "a.example.com" }),
    evidence({ id: "contra", stance: "CONTRADICT", host: "b.example.com" })
  ];
  const result = validateHypothesisSet({
    diagnosis: highConfidenceDiagnosis,
    candidates: [hypothesis("h1", { diagnosisId: "diag-high" })],
    researchContext: { externalDependency: true },
    researchEvidence,
    requiredClaimKeys: ["root_cause"],
    researchAsOf: "2026-10-05T00:00:00Z"
  });
  assert.equal(result.readyForPlanning, false);
  assert.equal(result.minCandidates, 2);
  assert.equal(result.requiresCritic, true);
  assert.deepEqual(result.researchSummary.contradictions, ["root_cause"]);
});

pass("duplicate hypotheses in one candidate set do not count twice", () => {
  const a = hypothesis("same");
  const b = createHypothesis({ ...a, id: "same-copy" });
  const result = validateHypothesisSet({
    diagnosis: uncertainDiagnosis,
    candidates: [a, b],
    ...completeResearch()
  });
  assert.equal(result.readyForPlanning, false);
  assert.equal(result.accepted.length, 1);
  assert.equal(result.rejected.some((item) => item.reason === "duplicate_hypothesis_in_set"), true);
});

pass("previously rejected identical hypothesis is blocked without new evidence", () => {
  const a = hypothesis("retry", { diagnosisId: "diag-high" });
  const result = validateHypothesisSet({
    diagnosis: highConfidenceDiagnosis,
    candidates: [a],
    priorAttempts: [{
      fingerprint: a.fingerprint,
      decision: "REJECT",
      evidenceRefs: ["research:source-1"]
    }]
  });
  assert.equal(result.readyForPlanning, false);
  assert.equal(result.rejected[0].reason, "repeated_failed_hypothesis_without_new_evidence");
});

pass("previously failed hypothesis may be reconsidered only with new evidence", () => {
  const a = hypothesis("retry-new", {
    diagnosisId: "diag-high",
    evidenceRefs: ["research:source-1", "research:new-source"]
  });
  const result = validateHypothesisSet({
    diagnosis: highConfidenceDiagnosis,
    candidates: [a],
    priorAttempts: [{
      fingerprint: a.fingerprint,
      decision: "ROLLBACK",
      evidenceRefs: ["research:source-1"]
    }]
  });
  assert.equal(result.readyForPlanning, true);
  assert.equal(result.accepted.length, 1);
});

pass("all required research being stale blocks planning", () => {
  const stale = evidence({
    id: "stale",
    publishedAt: "2020-01-01T00:00:00Z",
    retrievedAt: "2026-10-04T00:00:00Z"
  });
  const result = validateHypothesisSet({
    diagnosis: uncertainDiagnosis,
    candidates: [hypothesis("h1"), hypothesis("h2")],
    researchEvidence: [stale],
    requiredClaimKeys: ["root_cause"],
    researchAsOf: "2026-10-05T00:00:00Z",
    researchMaxAgeDays: 365
  });
  assert.equal(result.decision, "BLOCKED_RESEARCH_STALE");
});

console.log("self-development research and hypothesis test suite: PASS");
