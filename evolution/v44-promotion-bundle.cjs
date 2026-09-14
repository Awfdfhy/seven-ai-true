"use strict";

const { stableHash, deepFreeze } = require("./v44-governance.cjs");

const REQUIRED_COMPONENTS = Object.freeze([
  "codeHash",
  "promptHash",
  "schemaHash",
  "toolManifestHash",
  "migrationHash",
  "rollbackHash"
]);

function createPromotionBundle({
  candidateHash,
  targetHash,
  campaignId,
  generation,
  evaluationConstitutionHash,
  components = {}
} = {}) {
  const body = {
    format: "seven-promotion-bundle",
    version: 1,
    candidateHash: String(candidateHash || ""),
    targetHash: String(targetHash || ""),
    campaignId: String(campaignId || ""),
    generation: Number(generation),
    evaluationConstitutionHash: String(evaluationConstitutionHash || ""),
    components: Object.fromEntries(REQUIRED_COMPONENTS.map((name) => [name, String(components[name] || "")]))
  };
  for (const field of ["candidateHash", "targetHash", "campaignId", "evaluationConstitutionHash"]) {
    if (!body[field]) throw new Error(`promotion bundle missing ${field}`);
  }
  if (!Number.isInteger(body.generation) || body.generation < 0 || body.generation > 10) throw new Error("invalid promotion bundle generation");
  for (const name of REQUIRED_COMPONENTS) {
    if (!body.components[name]) throw new Error(`promotion bundle missing component ${name}`);
  }
  return deepFreeze({ ...body, hash: stableHash(body) });
}

function verifyPromotionBundle(bundle, { candidateHash, targetHash, campaignId, generation, evaluationConstitutionHash } = {}) {
  const reasons = [];
  if (!bundle || bundle.format !== "seven-promotion-bundle" || !bundle.hash) reasons.push("bundle_missing_or_invalid");
  else {
    const body = {
      format: bundle.format,
      version: bundle.version,
      candidateHash: bundle.candidateHash,
      targetHash: bundle.targetHash,
      campaignId: bundle.campaignId,
      generation: bundle.generation,
      evaluationConstitutionHash: bundle.evaluationConstitutionHash,
      components: bundle.components
    };
    if (stableHash(body) !== bundle.hash) reasons.push("bundle_hash_mismatch");
    if (candidateHash && bundle.candidateHash !== candidateHash) reasons.push("bundle_candidate_mismatch");
    if (targetHash && bundle.targetHash !== targetHash) reasons.push("bundle_target_mismatch");
    if (campaignId && bundle.campaignId !== campaignId) reasons.push("bundle_campaign_mismatch");
    if (generation != null && Number(bundle.generation) !== Number(generation)) reasons.push("bundle_generation_mismatch");
    if (evaluationConstitutionHash && bundle.evaluationConstitutionHash !== evaluationConstitutionHash) reasons.push("bundle_evaluation_mismatch");
    for (const name of REQUIRED_COMPONENTS) {
      if (!bundle.components || !bundle.components[name]) reasons.push(`bundle_component_missing:${name}`);
    }
  }
  return deepFreeze({ valid: reasons.length === 0, reasons });
}

module.exports = {
  REQUIRED_COMPONENTS,
  createPromotionBundle,
  verifyPromotionBundle
};
