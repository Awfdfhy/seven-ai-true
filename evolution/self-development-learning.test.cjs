"use strict";

const assert = require("assert/strict");
const {
  createLearningRecord,
  appendLearningRecord,
  verifyLearningArchive,
  recordsFromArchive,
  findPriorAttempts,
  createLearningSnapshot,
  restoreLearningSnapshot,
  assertExperimentStartAllowed
} = require("./self-development-learning.cjs");

function pass(name, fn) {
  fn();
  console.log("PASS", name);
}

const BASE_SHA = "1".repeat(40);
const CANDIDATE_SHA = "2".repeat(40);
const MANIFEST = "a".repeat(64);
const EVIDENCE = "b".repeat(64);
const HYPOTHESIS = "c".repeat(64);

function baseRecord(overrides = {}) {
  return {
    experimentId: "exp-1",
    diagnosisId: "diag-1",
    weaknessSignature: "tools|tool_call|schema_validation",
    hypothesisFingerprint: HYPOTHESIS,
    baselineSha: BASE_SHA,
    candidateSha: CANDIDATE_SHA,
    manifestDigest: MANIFEST,
    evidenceDigest: EVIDENCE,
    decision: "REJECT",
    lesson: "AVOID",
    reasonCodes: ["metric_regressed:p90LatencyMs"],
    changedPaths: ["release/router.js"],
    affectedSystems: ["Tools", "Model Routing"],
    metricResults: [{
      metricId: "p90LatencyMs",
      status: "REGRESSED",
      baselineMean: 100,
      candidateMean: 170,
      improvement: -70,
      hardViolation: false
    }],
    confounders: [],
    knownUnknowns: ["mobile device variance not measured"],
    evidenceRefs: ["ci:run-1", "review:r1"],
    causalStatus: "CONTROLLED_EVIDENCE",
    proofLevel: "L3",
    recordedAt: "2026-10-05T04:00:00Z",
    ...overrides
  };
}

pass("learning record binds exact experiment, candidate and evidence identity", () => {
  const record = createLearningRecord(baseRecord());
  assert.equal(record.experimentId, "exp-1");
  assert.equal(record.baselineSha, BASE_SHA);
  assert.equal(record.candidateSha, CANDIDATE_SHA);
  assert.equal(record.manifestDigest, MANIFEST);
  assert.equal(record.evidenceDigest, EVIDENCE);
  assert.equal(record.decision, "REJECT");
  assert.equal(record.lesson, "AVOID");
  assert.equal(Object.isFrozen(record), true);
});

pass("learning schema rejects hidden permission approval or arbitrary authority fields", () => {
  assert.throws(() => createLearningRecord({
    ...baseRecord(),
    approved: true
  }), /unknown learning record field: approved/);

  assert.throws(() => createLearningRecord({
    ...baseRecord(),
    permissionGrant: "write-main"
  }), /unknown learning record field: permissionGrant/);

  assert.throws(() => createLearningRecord({
    ...baseRecord(),
    capability: "github.merge"
  }), /unknown learning record field: capability/);
});

pass("secret-like evidence references and identifiers fail closed", () => {
  assert.throws(() => createLearningRecord({
    ...baseRecord(),
    experimentId: "ghp_abcdefghijklmnopqrstuvwxyz123456"
  }), /secret-like experimentId/);

  assert.throws(() => createLearningRecord({
    ...baseRecord(),
    evidenceRefs: ["sk-abcdefghijklmnopqrstuv"]
  }), /secret-like evidenceRef/);
});

pass("decision and lesson semantics are constrained", () => {
  assert.throws(() => createLearningRecord({
    ...baseRecord(),
    decision: "ACCEPT",
    lesson: "AVOID"
  }), /ACCEPT requires ADOPT/);

  assert.throws(() => createLearningRecord({
    ...baseRecord(),
    decision: "ROLLBACK",
    lesson: "ADOPT"
  }), /ROLLBACK cannot produce ADOPT/);

  assert.throws(() => createLearningRecord({
    ...baseRecord(),
    decision: "BLOCKED",
    lesson: "AVOID",
    candidateSha: null,
    manifestDigest: null,
    evidenceDigest: null
  }), /BLOCKED requires RETEST/);

  const blocked = createLearningRecord({
    ...baseRecord(),
    experimentId: "blocked-1",
    decision: "BLOCKED",
    lesson: "RETEST",
    candidateSha: null,
    manifestDigest: null,
    evidenceDigest: null
  });
  assert.equal(blocked.candidateSha, null);
});

pass("terminal evaluated decisions require exact candidate and evidence binding", () => {
  assert.throws(() => createLearningRecord({
    ...baseRecord(),
    candidateSha: null
  }), /candidateSha required for REJECT/);

  assert.throws(() => createLearningRecord({
    ...baseRecord(),
    manifestDigest: null
  }), /manifestDigest required for REJECT/);

  assert.throws(() => createLearningRecord({
    ...baseRecord(),
    evidenceDigest: null
  }), /evidenceDigest required for REJECT/);

  assert.throws(() => createLearningRecord({
    ...baseRecord(),
    candidateSha: "main"
  }), /exact 40-char SHA/);
});

pass("metric results accept registered metrics only and reject duplicate or invented result authority", () => {
  const record = createLearningRecord({
    ...baseRecord(),
    metricResults: [
      {
        metricId: "qualityScore",
        status: "IMPROVED",
        baselineMean: 0.7,
        candidateMean: 0.8,
        improvement: 0.1,
        hardViolation: false
      },
      {
        metricId: "p90LatencyMs",
        status: "NEUTRAL",
        baselineMean: 100,
        candidateMean: 110,
        improvement: -10,
        hardViolation: false
      }
    ]
  });
  assert.deepEqual(record.metricResults.map((row) => row.metricId), ["p90LatencyMs", "qualityScore"]);

  assert.throws(() => createLearningRecord({
    ...baseRecord(),
    metricResults: [{
      metricId: "magicWinScore",
      status: "IMPROVED",
      baselineMean: 0,
      candidateMean: 1,
      improvement: 1,
      hardViolation: false
    }]
  }), /unknown self-development metric/);

  assert.throws(() => createLearningRecord({
    ...baseRecord(),
    metricResults: [
      ...baseRecord().metricResults,
      ...baseRecord().metricResults
    ]
  }), /duplicate metricResult/);
});

pass("append creates a hash-chained tamper-evident archive", () => {
  let ledger = [];
  ledger = appendLearningRecord(ledger, baseRecord());
  ledger = appendLearningRecord(ledger, baseRecord({
    experimentId: "exp-2",
    recordedAt: "2026-10-05T04:01:00Z",
    decision: "ROLLBACK",
    lesson: "AVOID",
    reasonCodes: ["post_promotion_regression"]
  }));

  const verification = verifyLearningArchive(ledger);
  assert.equal(verification.valid, true);
  assert.equal(verification.entries, 2);
  assert.ok(/^[0-9a-f]{64}$/.test(verification.head));
  assert.equal(ledger[1].parentHash, ledger[0].hash);
});

pass("failed rejected and rolled-back experiments remain queryable as prior attempts", () => {
  let ledger = [];
  ledger = appendLearningRecord(ledger, baseRecord());
  ledger = appendLearningRecord(ledger, baseRecord({
    experimentId: "exp-rollback",
    recordedAt: "2026-10-05T04:02:00Z",
    decision: "ROLLBACK",
    lesson: "RETEST",
    reasonCodes: ["canary_regression"],
    evidenceRefs: ["ci:run-2"]
  }));

  const attempts = findPriorAttempts(ledger, HYPOTHESIS);
  assert.equal(attempts.length, 2);
  assert.deepEqual(attempts.map((item) => item.decision), ["REJECT", "ROLLBACK"]);
  assert.ok(attempts[1].evidenceRefs.includes("ci:run-2"));
});

pass("accepted experiments are retained as ADOPT lessons", () => {
  let ledger = [];
  ledger = appendLearningRecord(ledger, baseRecord({
    experimentId: "exp-accept",
    decision: "ACCEPT",
    lesson: "ADOPT",
    reasonCodes: ["target_improved"],
    metricResults: [{
      metricId: "qualityScore",
      status: "IMPROVED",
      baselineMean: 0.7,
      candidateMean: 0.8,
      improvement: 0.1,
      hardViolation: false
    }]
  }));
  const records = recordsFromArchive(ledger);
  assert.equal(records[0].decision, "ACCEPT");
  assert.equal(records[0].lesson, "ADOPT");
});

pass("duplicate experiment IDs cannot overwrite or append a second terminal lesson", () => {
  let ledger = appendLearningRecord([], baseRecord());
  assert.throws(() => appendLearningRecord(ledger, baseRecord({
    decision: "ACCEPT",
    lesson: "ADOPT"
  })), /duplicate learning experiment/);
  assert.equal(ledger.length, 1);
});

pass("payload tampering is detected by the existing hash chain", () => {
  const ledger = appendLearningRecord([], baseRecord());
  const tampered = JSON.parse(JSON.stringify(ledger));
  tampered[0].payload.lesson = "ADOPT";

  const verification = verifyLearningArchive(tampered);
  assert.equal(verification.valid, false);
  assert.equal(verification.reason, "ledger_hash");
});

pass("structurally invalid record remains invalid even if an attacker recomputes generic ledger hash", () => {
  const { appendEvent } = require("./ledger.cjs");
  const invalidPayload = {
    ...baseRecord(),
    approved: true
  };
  const forged = appendEvent([], {
    type: "SELF_DEVELOPMENT_LEARNING",
    source: "seven-self-development",
    timestamp: "2026-10-05T04:00:00Z",
    payload: invalidPayload
  });

  const chainOnly = require("./ledger.cjs").verifyLedger(forged);
  assert.equal(chainOnly.valid, true);

  const learning = verifyLearningArchive(forged);
  assert.equal(learning.valid, false);
  assert.equal(learning.reason, "invalid_learning_record");
});

pass("unexpected event type cannot be smuggled into the learning archive", () => {
  const { appendEvent } = require("./ledger.cjs");
  const forged = appendEvent([], {
    type: "PERMISSION_GRANT",
    source: "seven-self-development",
    timestamp: "2026-10-05T04:00:00Z",
    payload: {}
  });
  const result = verifyLearningArchive(forged);
  assert.equal(result.valid, false);
  assert.equal(result.reason, "unexpected_event_type");
});

pass("snapshot round-trip preserves exact valid chain identity", () => {
  let ledger = appendLearningRecord([], baseRecord());
  ledger = appendLearningRecord(ledger, baseRecord({
    experimentId: "exp-2",
    recordedAt: "2026-10-05T04:01:00Z",
    decision: "INCONCLUSIVE",
    lesson: "RETEST",
    candidateSha: null,
    manifestDigest: null,
    evidenceDigest: null,
    reasonCodes: ["insufficient_samples"]
  }));

  const snapshot = createLearningSnapshot(ledger);
  const restored = restoreLearningSnapshot(snapshot);
  assert.deepEqual(restored, ledger);
  assert.equal(verifyLearningArchive(restored).valid, true);
});

pass("snapshot checksum and chain identity detect corruption", () => {
  const ledger = appendLearningRecord([], baseRecord());
  const snapshot = createLearningSnapshot(ledger);

  assert.throws(() => restoreLearningSnapshot({
    ...snapshot,
    entries: 999
  }), /checksum mismatch/);

  const forgedBody = {
    ...snapshot,
    ledger: JSON.parse(JSON.stringify(snapshot.ledger))
  };
  forgedBody.ledger[0].payload.lesson = "ADOPT";
  const { hashObject } = require("./ledger.cjs");
  const body = {
    schemaVersion: forgedBody.schemaVersion,
    eventType: forgedBody.eventType,
    entries: forgedBody.entries,
    head: forgedBody.head,
    ledger: forgedBody.ledger
  };
  forgedBody.checksum = hashObject(body);
  assert.throws(() => restoreLearningSnapshot(forgedBody), /invalid learning snapshot archive/);
});

pass("unfinished experiment blocks a different new experiment", () => {
  assert.throws(() => assertExperimentStartAllowed({
    ledger: [],
    experimentId: "exp-new",
    activeExperimentId: "exp-active"
  }), (error) => error && error.code === "SELF_DEV_ACTIVE_EXPERIMENT");

  assert.equal(assertExperimentStartAllowed({
    ledger: [],
    experimentId: "exp-active",
    activeExperimentId: "exp-active"
  }), true);
});

pass("terminal experiment cannot be started again under the same ID", () => {
  const ledger = appendLearningRecord([], baseRecord());
  assert.throws(() => assertExperimentStartAllowed({
    ledger,
    experimentId: "exp-1"
  }), (error) => error && error.code === "SELF_DEV_EXPERIMENT_TERMINAL");
});

pass("corrupt archive blocks new experiment start", () => {
  const ledger = appendLearningRecord([], baseRecord());
  const corrupt = JSON.parse(JSON.stringify(ledger));
  corrupt[0].hash = "0".repeat(64);
  assert.throws(() => assertExperimentStartAllowed({
    ledger: corrupt,
    experimentId: "exp-new"
  }), /invalid learning archive/);
});

console.log("self-development learning archive test suite: PASS");
