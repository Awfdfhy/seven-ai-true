"use strict";

const assert = require("assert/strict");
const {
  createObservation,
  ObservationBuffer
} = require("./self-development-observer.cjs");
const {
  aggregateWeaknesses,
  diagnoseWeakness,
  createImprovementProposal
} = require("./self-development-diagnosis.cjs");
const {
  createExperiment,
  isProtected
} = require("./experiment-lab.cjs");
const { createEvalLock } = require("./eval-lock.cjs");
const {
  createEvaluationManifest,
  evaluatePaired
} = require("./self-development-paired-eval.cjs");
const {
  createResearchEvidence
} = require("./self-development-research.cjs");
const {
  createHypothesis,
  validateHypothesisSet
} = require("./self-development-hypotheses.cjs");
const {
  authorizePlanningCandidate,
  prioritizeCandidates
} = require("./self-development-planner.cjs");
const { validateDomainHypothesis } = require("./self-development-domains.cjs");
const { decideAcceptance } = require("./self-development-acceptance.cjs");
const {
  createLearningRecord,
  appendLearningRecord,
  verifyLearningArchive
} = require("./self-development-learning.cjs");
const {
  createUpdateTransaction
} = require("./update-transaction.cjs");
const {
  createRepairCycle,
  advanceRepairCycle
} = require("./repair-cycle.cjs");

function pass(name, fn) {
  fn();
  console.log("PASS", name);
}

const BASE_SHA = "1".repeat(40);
const CANDIDATE_SHA = "2".repeat(40);

function lowHypothesis(id = "attack-low") {
  return createHypothesis({
    id,
    diagnosisId: "diag-attack",
    mechanism: "Bounded ranking adjustment measured under a locked evaluator.",
    changeClass: "ranking",
    targetPaths: ["release/ranking.js"],
    expectedEffects: { qualityScore: "IMPROVE" },
    validationMetrics: ["qualityScore"],
    evidenceRefs: ["obs:attack"]
  });
}

function lowValidation(hypothesis = lowHypothesis()) {
  return {
    diagnosis: {
      id: "diag-attack",
      confidence: 0.9,
      observationIds: ["obs:attack"]
    },
    candidates: [hypothesis],
    researchContext: {},
    researchEvidence: [],
    requiredClaimKeys: [],
    priorAttempts: []
  };
}

function environment() {
  return {
    platform: "linux",
    runtime: "node",
    runtimeVersion: process.version,
    architecture: process.arch,
    buildProfile: "ci",
    fixtureVersion: "phase9-adversarial-v1"
  };
}

function lowEvidenceBundle() {
  const hypothesis = lowHypothesis();
  const validation = lowValidation(hypothesis);
  const authorization = authorizePlanningCandidate({
    hypothesisValidation: validation,
    hypothesisId: hypothesis.id,
    assessment: {
      expectedGain: 0.5,
      confidence: 0.8,
      implementationCost: 0.2,
      evaluationCost: 0.2,
      blastRadius: 0.1,
      reversibility: 0.9,
      userImpact: 0.6,
      urgency: 0.5,
      problemSeverity: 0.6,
      hardFailureFix: false
    }
  });
  assert.equal(authorization.decision, "AUTHORIZED");
  const plan = authorization.candidate;

  const manifest = createEvaluationManifest({
    experimentId: "phase9-acceptance-attack",
    evalLock: createEvalLock({ purpose: "phase9-adversarial" }),
    baselineIdentity: { sha: BASE_SHA },
    candidateIdentity: { sha: CANDIDATE_SHA },
    environment: environment(),
    metrics: ["qualityScore"],
    targetMetrics: ["qualityScore"],
    requiredHardGates: ["contracts", "regression", "rollback"]
  });

  const runs = (prefix, value) => [1, 2, 3].map((n) => ({
    runId: `${prefix}-${n}`,
    manifestDigest: manifest.manifestDigest,
    environmentDigest: manifest.environmentDigest,
    metrics: { qualityScore: value }
  }));

  const result = evaluatePaired({
    manifest,
    baselineRuns: runs("base", 0.70),
    candidateRuns: runs("candidate", 0.80),
    hardGateResults: {
      contracts: true,
      regression: true,
      rollback: true
    }
  });
  assert.equal(result.decision, "PASS");

  return { hypothesis, validation, plan, manifest, result };
}

pass("ATTACK forged pre-normalized telemetry cannot bypass content rejection", () => {
  const buffer = new ObservationBuffer({ maxEntries: 10 });
  assert.throws(() => buffer.append({
    schemaVersion: 1,
    fingerprint: "trusted-looking",
    timestamp: "2026-10-05T00:00:00Z",
    source: "runtime",
    subsystem: "tools",
    kind: "tool_call",
    outcome: "ERROR",
    severity: "MEDIUM",
    metrics: { errorCount: 1 },
    metadata: { prompt: "secret prompt body" }
  }), /forbidden telemetry metadata key/);
  assert.equal(buffer.size(), 0);
});

pass("ATTACK shortened or symbolic baseline identity cannot enter an improvement proposal", () => {
  const observations = [
    createObservation({
      id: "obs-a",
      timestamp: "2026-10-05T00:00:00Z",
      source: "runtime",
      subsystem: "routing",
      kind: "route",
      outcome: "ERROR",
      severity: "MEDIUM",
      metrics: { errorCount: 1 },
      metadata: { errorClass: "route_failure" }
    }),
    createObservation({
      id: "obs-b",
      timestamp: "2026-10-05T00:01:00Z",
      source: "runtime",
      subsystem: "routing",
      kind: "route",
      outcome: "ERROR",
      severity: "MEDIUM",
      metrics: { errorCount: 1 },
      metadata: { errorClass: "route_failure" }
    })
  ];
  const diagnosis = diagnoseWeakness(aggregateWeaknesses(observations)[0]);
  for (const bad of ["main", "abcdef1", "a".repeat(39), "a".repeat(41)]) {
    assert.throws(() => createImprovementProposal({
      diagnosis,
      baselineSha: bad,
      changeClass: "routing",
      allowedPaths: ["release/router.js"]
    }), /exact 40-char SHA/);
  }
});

pass("ATTACK evaluator corpus autonomy policy and release gates are protected paths", () => {
  for (const path of [
    "eval/tasks.jsonl",
    "eval/baseline.json",
    ".seven-team/autonomy/constitution.json",
    ".seven-team/autonomy/proof-policy.json",
    "evolution/gates.cjs",
    ".github/workflows/seven-tests.yml",
    "release/static-audit.cjs",
    "release/release-verify.cjs"
  ]) {
    assert.equal(isProtected(path), true, path);
    assert.throws(() => createExperiment({
      id: `attack:${path}`,
      subsystem: "self-development",
      hypothesis: "change the judge to make candidate pass",
      baselineRef: BASE_SHA,
      candidateRef: CANDIDATE_SHA,
      allowedPaths: [path]
    }), /protected evaluator paths/);
  }
});

pass("ATTACK evaluator-lock drift cannot create an evaluation manifest", () => {
  const lock = createEvalLock({ purpose: "phase9-lock-attack" });
  assert.throws(() => createEvaluationManifest({
    experimentId: "attack-lock",
    evalLock: { ...lock, corpusHash: "0".repeat(64) },
    baselineIdentity: { sha: BASE_SHA },
    candidateIdentity: { sha: CANDIDATE_SHA },
    environment: environment(),
    metrics: ["qualityScore"],
    targetMetrics: ["qualityScore"]
  }), /evaluation lock invalid/);
});

pass("ATTACK manifest criteria drift after lock is BLOCKED", () => {
  const manifest = createEvaluationManifest({
    experimentId: "attack-manifest",
    evalLock: createEvalLock({ purpose: "phase9-manifest-attack" }),
    baselineIdentity: { sha: BASE_SHA },
    candidateIdentity: { sha: CANDIDATE_SHA },
    environment: environment(),
    metrics: ["qualityScore"],
    targetMetrics: ["qualityScore"],
    requiredHardGates: ["regression"]
  });
  const tampered = {
    ...manifest,
    targetMetrics: Object.freeze([])
  };
  const result = evaluatePaired({
    manifest: tampered,
    baselineRuns: [],
    candidateRuns: [],
    hardGateResults: {}
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("manifest_integrity_failed"));
});

pass("ATTACK candidate cannot invent a success metric at run time", () => {
  const manifest = createEvaluationManifest({
    experimentId: "attack-metric",
    evalLock: createEvalLock({ purpose: "phase9-metric-attack" }),
    baselineIdentity: { sha: BASE_SHA },
    candidateIdentity: { sha: CANDIDATE_SHA },
    environment: environment(),
    metrics: ["qualityScore"],
    targetMetrics: ["qualityScore"]
  });
  const base = [1, 2, 3].map((n) => ({
    runId: `b-${n}`,
    manifestDigest: manifest.manifestDigest,
    environmentDigest: manifest.environmentDigest,
    metrics: { qualityScore: 0.7 }
  }));
  const candidate = [1, 2, 3].map((n) => ({
    runId: `c-${n}`,
    manifestDigest: manifest.manifestDigest,
    environmentDigest: manifest.environmentDigest,
    metrics: { qualityScore: 0.8, magicWinScore: 1 }
  }));
  const result = evaluatePaired({ manifest, baselineRuns: base, candidateRuns: candidate });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons[0].includes("metric_not_in_manifest"));
});

pass("ATTACK fake research-ready object cannot bypass real evidence requirements", () => {
  const hypothesis = createHypothesis({
    id: "attack-research",
    diagnosisId: "diag-research",
    mechanism: "Change shared storage behavior.",
    changeClass: "shared_contract",
    targetPaths: ["release/shared-contract.js"],
    expectedEffects: { reliabilityScore: "IMPROVE" },
    validationMetrics: ["reliabilityScore"],
    evidenceRefs: ["fake:evidence"]
  });

  const result = validateHypothesisSet({
    readyForPlanning: true,
    decision: "READY_FOR_PLANNING",
    diagnosis: {
      id: "diag-research",
      confidence: 0.9,
      observationIds: ["obs:research"]
    },
    candidates: [hypothesis],
    researchEvidence: [],
    requiredClaimKeys: ["root_cause"],
    researchAsOf: "2026-10-05T00:00:00Z"
  });
  assert.equal(result.readyForPlanning, false);
  assert.ok(result.decision.startsWith("BLOCKED_RESEARCH"));
});

pass("ATTACK rejected hypothesis cannot retry using an invented evidence reference", () => {
  const evidence = createResearchEvidence({
    id: "grounded-e1",
    claimKey: "root_cause",
    stance: "SUPPORT",
    sourceUrl: "https://example.com/root-cause",
    sourceType: "PAPER",
    publishedAt: "2026-09-20T00:00:00Z",
    retrievedAt: "2026-10-05T00:00:00Z",
    confidence: 0.9
  });
  const hypothesis = createHypothesis({
    id: "attack-retry",
    diagnosisId: "diag-retry",
    mechanism: "Bounded routing repair.",
    changeClass: "routing",
    targetPaths: ["release/router.js"],
    expectedEffects: { routingTaskSuccess: "IMPROVE" },
    validationMetrics: ["routingTaskSuccess"],
    evidenceRefs: ["grounded-e1", "invented-e2"]
  });
  const result = validateHypothesisSet({
    diagnosis: {
      id: "diag-retry",
      confidence: 0.9,
      observationIds: ["obs:retry"]
    },
    candidates: [hypothesis],
    priorAttempts: [{
      fingerprint: hypothesis.fingerprint,
      decision: "REJECT",
      evidenceRefs: ["grounded-e1"]
    }],
    researchEvidence: [evidence],
    requiredClaimKeys: ["root_cause"],
    researchAsOf: "2026-10-05T00:00:00Z"
  });
  assert.equal(result.readyForPlanning, false);
  assert.equal(result.rejected[0].reason, "repeated_failed_hypothesis_new_evidence_not_grounded");
});

pass("ATTACK caller cannot downgrade coding or self-development risk by writing a LOW risk field", () => {
  const coding = validateDomainHypothesis({
    domain: "coding_behavior",
    hypothesis: {
      id: "attack-coding-risk",
      diagnosisId: "diag-risk",
      mechanism: "Modify coding orchestration behavior.",
      changeClass: "coding_behavior",
      targetPaths: ["release/coding-behavior.js"],
      expectedEffects: {
        taskSuccess: "IMPROVE",
        regressionDetectionRate: "PRESERVE",
        testsPass: "PRESERVE",
        crashRate: "PRESERVE"
      },
      validationMetrics: ["taskSuccess", "regressionDetectionRate", "testsPass", "crashRate"],
      evidenceRefs: ["obs:risk"],
      risk: { level: "LOW" }
    }
  });
  assert.equal(coding.hypothesis.risk.level, "HIGH");

  const recursive = createHypothesis({
    id: "attack-recursive",
    diagnosisId: "diag-recursive",
    mechanism: "Rewrite the self-development evaluator.",
    changeClass: "self_development",
    targetPaths: ["evolution/gates.cjs"],
    expectedEffects: { reliabilityScore: "IMPROVE" },
    validationMetrics: ["reliabilityScore"],
    evidenceRefs: ["obs:recursive"],
    risk: { level: "LOW" }
  });
  assert.equal(recursive.risk.level, "CRITICAL");
  assert.equal(recursive.planningDisposition, "GOVERNANCE_REQUIRED");
});

pass("ATTACK planner refuses raw hypotheses and caller-authored ready flags", () => {
  const hypothesis = lowHypothesis("attack-planner");
  assert.throws(() => prioritizeCandidates({
    hypotheses: [hypothesis],
    assessments: {}
  }), /hypothesisValidation input required/);

  assert.throws(() => prioritizeCandidates({
    hypothesisValidation: {
      readyForPlanning: true,
      decision: "READY_FOR_PLANNING",
      accepted: [hypothesis]
    },
    assessments: {
      "attack-planner": {
        expectedGain: 1,
        confidence: 1,
        implementationCost: 0,
        evaluationCost: 0,
        blastRadius: 0,
        reversibility: 1,
        userImpact: 1,
        urgency: 1,
        problemSeverity: 1,
        hardFailureFix: true
      }
    }
  }), /diagnosis required/);
});

pass("ATTACK structurally valid proof cannot authorize acceptance without trusted authority verifier", () => {
  const bundle = lowEvidenceBundle();
  const result = decideAcceptance({
    planningCandidate: bundle.plan,
    hypothesisValidation: bundle.validation,
    evaluationManifest: bundle.manifest,
    evaluationResult: bundle.result,
    proofBundle: {
      level: "L8",
      sourceSha: CANDIDATE_SHA,
      evidenceDigest: bundle.result.evidenceDigest,
      rollbackReady: true,
      knownUnknowns: []
    },
    builderId: "builder-agent"
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("proof_verifier_missing"));
});

pass("ATTACK learning archive cannot smuggle permissions through a valid hash chain", () => {
  assert.throws(() => createLearningRecord({
    experimentId: "attack-learning",
    diagnosisId: "diag-learning",
    weaknessSignature: "x|y|z",
    hypothesisFingerprint: "a".repeat(64),
    baselineSha: BASE_SHA,
    decision: "BLOCKED",
    lesson: "RETEST",
    permissionGrant: "github.merge",
    recordedAt: "2026-10-05T00:00:00Z"
  }), /unknown learning record field: permissionGrant/);

  const valid = appendLearningRecord([], {
    experimentId: "attack-learning-valid",
    diagnosisId: "diag-learning",
    weaknessSignature: "x|y|z",
    hypothesisFingerprint: "a".repeat(64),
    baselineSha: BASE_SHA,
    decision: "BLOCKED",
    lesson: "RETEST",
    reasonCodes: ["coding_unavailable"],
    recordedAt: "2026-10-05T00:00:00Z"
  });
  const tampered = JSON.parse(JSON.stringify(valid));
  tampered[0].payload.lesson = "ADOPT";
  assert.equal(verifyLearningArchive(tampered).valid, false);
});

pass("ATTACK promotion transaction rejects abbreviated SHA identities", () => {
  assert.throws(() => createUpdateTransaction({
    id: "attack-short-sha",
    experimentId: "exp",
    baselineSha: "aaaaaaa",
    candidateSha: "bbbbbbb"
  }), /exact 40-char SHA/);
});

pass("ATTACK bounded repair cycle cannot become an endless self-rewrite loop", () => {
  let cycle = createRepairCycle({ issueId: "attack-loop", maxAttempts: 2 });
  cycle = advanceRepairCycle(cycle, { reproduced: true });
  cycle = advanceRepairCycle(cycle, { changed: true });
  cycle = advanceRepairCycle(cycle, { approved: false });
  assert.equal(cycle.stage, "REPAIR");
  cycle = advanceRepairCycle(cycle, { changed: true });
  cycle = advanceRepairCycle(cycle, { approved: false });
  assert.equal(cycle.outcome, "REJECT_MAX_ATTEMPTS");
});

console.log("self-development adversarial attack suite: PASS");
