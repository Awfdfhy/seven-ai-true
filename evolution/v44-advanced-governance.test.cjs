"use strict";

const assert = require("assert/strict");
const {
  createAutonomyEnvelope,
  autonomyReceipt,
  capabilityConservationReceipt,
  propagationReceipt,
  substrateTransferReceipt,
  toolLibraryHealthReceipt,
  oversightSustainabilityReceipt,
  bootstrapSupervisorReceipt
} = require("./v44-advanced-governance.cjs");

async function pass(name, fn) {
  await fn();
  console.log("PASS", name);
}

(async () => {
  await pass("autonomy envelope prevents auto-promotion when approval is required", async () => {
    const envelope = createAutonomyEnvelope({ id: "env", actions: { PROMOTE_CANDIDATE: "REQUIRE_APPROVAL" } });
    const receipt = autonomyReceipt({ envelope, action: "PROMOTE_CANDIDATE", requestedDecision: "AUTO_ELIGIBLE" });
    assert.equal(receipt.pass, false);
    assert.ok(receipt.reasons.includes("autonomy_policy_exceeds_envelope"));
  });

  await pass("capability conservation rejects protected regression", async () => {
    const receipt = capabilityConservationReceipt({
      baseline: { truth: 1, recovery: 0.9 },
      candidate: { truth: 1, recovery: 0.7 },
      protectedCapabilities: ["truth", "recovery"]
    });
    assert.equal(receipt.pass, false);
    assert.ok(receipt.reasons.includes("capability_regression:recovery"));
  });

  await pass("cross-scale propagation requires explicit evidence and authorization", async () => {
    const denied = propagationReceipt({ fromScale: "EXPERIENCE", toScale: "PRODUCT", authorized: false });
    assert.equal(denied.pass, false);
    const allowed = propagationReceipt({ fromScale: "EXPERIENCE", toScale: "PRODUCT", authorized: true, evidenceHash: "proof" });
    assert.equal(allowed.pass, true);
  });

  await pass("general substrate claim requires more than one proven substrate", async () => {
    const receipt = substrateTransferReceipt({ claim: "GENERAL", tested: [{ substrate: "model-a", passed: true }] });
    assert.equal(receipt.pass, false);
    assert.ok(receipt.reasons.includes("general_transfer_underpowered"));
  });

  await pass("tool library health rejects dependency and composition damage", async () => {
    const receipt = toolLibraryHealthReceipt({ brokenDependencies: 1, compositionRegressions: 1, rollbackReady: true });
    assert.equal(receipt.pass, false);
    assert.ok(receipt.reasons.includes("tool_dependency_breakage"));
    assert.ok(receipt.reasons.includes("tool_composition_regression"));
  });

  await pass("oversight sustainability rejects fatigue or unbounded review work", async () => {
    const receipt = oversightSustainabilityReceipt({
      reviewMinutes: 90,
      interventionCount: 2,
      fatigueSignal: true,
      independentReview: true,
      maxReviewMinutes: 30,
      maxInterventions: 5
    });
    assert.equal(receipt.pass, false);
    assert.ok(receipt.reasons.includes("oversight_time_budget_exceeded"));
    assert.ok(receipt.reasons.includes("oversight_fatigue_signal"));
  });

  await pass("evolution-engine upgrade cannot supervise itself", async () => {
    const receipt = bootstrapSupervisorReceipt({
      incumbentEngineHash: "engine-old",
      candidateEngineHash: "engine-new",
      supervisorEngineHash: "engine-new",
      rollbackHash: "rollback-old"
    });
    assert.equal(receipt.pass, false);
    assert.ok(receipt.reasons.includes("bootstrap_supervisor_is_candidate"));
  });

  console.log("self-evolution v4.4 advanced governance test suite: PASS");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
