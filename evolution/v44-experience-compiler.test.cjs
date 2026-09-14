"use strict";

const assert = require("assert/strict");
const {
  compileExperience,
  verifyExperience,
  experienceUseReceipt,
  createSupersession
} = require("./v44-experience-compiler.cjs");

async function pass(name, fn) {
  await fn();
  console.log("PASS", name);
}

function baseExperience(extra = {}) {
  return compileExperience({
    id: "exp-1",
    sourceTargetHash: "target-a",
    scope: "PROJECT_LOCAL",
    substrateHash: "model-a",
    mechanismClass: "retrieval-strategy",
    evidenceHash: "evidence-a",
    outcomeClass: "reliability-improvement",
    ...extra
  });
}

(async () => {
  await pass("compiled experience is hash-verifiable", async () => {
    const experience = baseExperience();
    assert.equal(verifyExperience(experience).valid, true);
  });

  await pass("same target scope and substrate may reuse retained experience", async () => {
    const experience = baseExperience();
    const receipt = experienceUseReceipt({
      experience,
      currentTargetHash: "target-a",
      requestedScope: "PROJECT_LOCAL",
      currentSubstrateHash: "model-a"
    });
    assert.equal(receipt.usable, true);
  });

  await pass("scope escalation requires transfer evidence", async () => {
    const experience = baseExperience();
    const receipt = experienceUseReceipt({
      experience,
      currentTargetHash: "target-a",
      requestedScope: "PRODUCT",
      currentSubstrateHash: "model-a"
    });
    assert.equal(receipt.usable, false);
    assert.ok(receipt.reasons.includes("scope_transfer_unproven"));
  });

  await pass("substrate change requires transfer evidence", async () => {
    const experience = baseExperience();
    const receipt = experienceUseReceipt({
      experience,
      currentTargetHash: "target-a",
      requestedScope: "PROJECT_LOCAL",
      currentSubstrateHash: "model-b"
    });
    assert.equal(receipt.usable, false);
    assert.ok(receipt.reasons.includes("substrate_transfer_unproven"));
  });

  await pass("explicit transfer evidence can bridge target scope and substrate", async () => {
    const experience = baseExperience();
    const receipt = experienceUseReceipt({
      experience,
      currentTargetHash: "target-b",
      requestedScope: "PRODUCT",
      currentSubstrateHash: "model-b",
      transferEvidenceHash: "transfer-proof-v1"
    });
    assert.equal(receipt.usable, true);
  });

  await pass("negative-transfer signal blocks reuse even with transfer evidence", async () => {
    const experience = baseExperience({ transferProofHash: "prior-transfer" });
    const receipt = experienceUseReceipt({
      experience,
      currentTargetHash: "target-b",
      requestedScope: "PRODUCT",
      currentSubstrateHash: "model-b",
      negativeTransferSignal: true
    });
    assert.equal(receipt.usable, false);
    assert.ok(receipt.reasons.includes("negative_transfer_signal"));
  });

  await pass("superseded experience is not silently reused", async () => {
    const prior = baseExperience();
    const replacement = baseExperience({ id: "exp-2", evidenceHash: "evidence-b" });
    const supersession = createSupersession({
      priorExperienceHash: prior.hash,
      replacementExperienceHash: replacement.hash,
      reason: "newer evidence",
      evidenceHash: "supersession-proof"
    });
    assert.ok(supersession.hash);
    const receipt = experienceUseReceipt({
      experience: prior,
      currentTargetHash: "target-a",
      requestedScope: "PROJECT_LOCAL",
      currentSubstrateHash: "model-a",
      supersededBy: replacement.hash
    });
    assert.equal(receipt.usable, false);
    assert.ok(receipt.reasons.includes("experience_superseded"));
  });

  console.log("self-evolution v4.4 experience compiler test suite: PASS");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
