"use strict";

const { createExperiment } = require("./experiment-lab.cjs");
const { createEvalLock } = require("./eval-lock.cjs");
const { runCodingCandidate, discardBestEffort, restoreIfStableChanged } = require("./coding-candidate.cjs");
const { assertEvalsAdapter, validateTrustedEvalBundle, gatesFromEvalBundle } = require("./coding-evolution.cjs");
const { freezeEvaluationConstitution } = require("./v44-eval-firewall.cjs");
const { createPromotionBundle } = require("./v44-promotion-bundle.cjs");
const { runStrictEvolution } = require("./v44-strict-runtime.cjs");

const EVALUATION_PATH_PREFIXES = Object.freeze([
  "eval/",
  "evolution/",
  ".github/workflows/",
  "all.cjs",
  "verify.cjs"
]);

function candidateTouchesEvaluation(changedPaths = []) {
  return changedPaths.some((value) => {
    const path = String(value || "").replace(/\\/g, "/").replace(/^\.\//, "");
    return EVALUATION_PATH_PREFIXES.some((prefix) => prefix.endsWith("/") ? path.startsWith(prefix) : path === prefix);
  });
}

function bindUnchangedComponents({ baselineSha, candidateSha, components = {} } = {}) {
  const fallback = String(baselineSha || "");
  return {
    codeHash: String(components.codeHash || candidateSha || ""),
    promptHash: String(components.promptHash || fallback),
    schemaHash: String(components.schemaHash || fallback),
    toolManifestHash: String(components.toolManifestHash || fallback),
    migrationHash: String(components.migrationHash || fallback),
    rollbackHash: String(components.rollbackHash || fallback)
  };
}

async function runStrictCodingEvolution({
  experimentConfig,
  baselineSha,
  codingAgent,
  evalsAdapter,
  promotionAdapter,
  storeAdapter,
  maxRepairAttempts = 3,
  approvalPolicy = { autoPromotionEnabled: true, maxAutoRisk: "LOW" },
  manualApproved = false,
  target,
  campaign,
  judge,
  roles,
  governancePolicy,
  autonomyEnvelope,
  advancedEvidence,
  recursionSupervisor,
  supervisorId,
  parentCampaignId = null,
  baselineBudget,
  candidateBudget,
  assistanceInput = {},
  pathwayInput = {},
  retainedExperience = null,
  retainedExperienceContext = {},
  promotionComponents = {},
  testAuthorHash,
  hiddenHoldoutHash,
  candidateClaims = {}
} = {}) {
  assertEvalsAdapter(evalsAdapter);
  if (!target || !target.hash) throw new Error("strict coding evolution requires frozen target");
  if (!campaign || !campaign.id) throw new Error("strict coding evolution requires campaign");
  if (!judge || !judge.hash) throw new Error("strict coding evolution requires judge identity");
  if (!roles || !roles.builder || !roles.judge || !roles.promotion) throw new Error("strict coding evolution requires role identities");
  if (!testAuthorHash) throw new Error("strict coding evolution requires testAuthorHash");

  const experiment = createExperiment(experimentConfig);
  const evaluationLock = createEvalLock({ experimentId: experiment.id, purpose: "v44-strict-coding-evolution" });
  const evaluationConstitution = freezeEvaluationConstitution({
    comparisonEpoch: `coding:${experiment.id}:corpus-${evaluationLock.taskCorpusVersion}`,
    corpusHash: evaluationLock.corpusHash,
    judgeHash: String(judge.hash),
    testAuthorHash: String(testAuthorHash),
    committedBeforeCandidate: true,
    hiddenHoldoutHash: hiddenHoldoutHash == null ? null : String(hiddenHoldoutHash)
  });

  const coding = await runCodingCandidate({
    experiment,
    baselineSha,
    agent: codingAgent,
    maxAttempts: maxRepairAttempts
  });
  if (coding.outcome !== "PASS") {
    return { outcome: coding.outcome, stage: "CODING", experiment, coding, evaluationConstitution };
  }

  let evalBundle;
  try {
    evalBundle = await evalsAdapter.evaluateCandidate({
      experiment,
      baselineSha,
      candidateSha: coding.candidateSha,
      workspaceId: coding.workspaceId,
      changedPaths: coding.changedPaths,
      evaluationIdentity: evaluationLock,
      evaluationConstitution
    });
  } catch (error) {
    const discardError = await discardBestEffort(codingAgent, { experiment, workspaceId: coding.workspaceId }, "strict_evals_error");
    return {
      outcome: "EVALS_ERROR",
      stage: "EVALS",
      experiment,
      coding,
      evaluationConstitution,
      error: String(error && error.message || error),
      discardError
    };
  }

  const stableAfterEvals = await restoreIfStableChanged({
    agent: codingAgent,
    baselineSha,
    reason: "stable_changed_during_strict_evals"
  });
  if (!stableAfterEvals.stable) {
    return { outcome: "HALT_STABLE_RESTORE_FAILED", stage: "EVALS", experiment, coding, stable: stableAfterEvals };
  }
  if (stableAfterEvals.repaired) {
    await discardBestEffort(codingAgent, { experiment, workspaceId: coding.workspaceId }, "stable_mutation_during_strict_evals");
    return { outcome: "REJECTED_STABLE_MUTATION", stage: "EVALS", experiment, coding, stable: stableAfterEvals };
  }

  const validation = validateTrustedEvalBundle(evalBundle, {
    baselineSha,
    candidateSha: coding.candidateSha
  });
  if (!validation.valid) {
    const discardError = await discardBestEffort(codingAgent, { experiment, workspaceId: coding.workspaceId }, "strict_untrusted_eval_bundle");
    return {
      outcome: "REJECTED_EVALS",
      stage: "EVALS",
      experiment,
      coding,
      validation,
      evaluationConstitution,
      discardError
    };
  }

  const candidate = {
    hash: coding.candidateSha,
    authorityHash: target.authorityHash,
    scope: target.scope,
    claimsAutonomous: candidateClaims.claimsAutonomous === true,
    claimsLearning: candidateClaims.claimsLearning === true,
    claimsGeneralTransfer: candidateClaims.claimsGeneralTransfer === true,
    changesToolLibrary: candidateClaims.changesToolLibrary === true,
    upgradesEvolutionEngine: candidateClaims.upgradesEvolutionEngine === true,
    usesRetainedExperience: candidateClaims.usesRetainedExperience === true,
    touchesEvaluation: candidateTouchesEvaluation(coding.changedPaths),
    action: "PROMOTE_CANDIDATE"
  };

  const promotionBundle = createPromotionBundle({
    candidateHash: candidate.hash,
    targetHash: target.hash,
    campaignId: campaign.id,
    generation: campaign.generation,
    evaluationConstitutionHash: evaluationConstitution.hash,
    components: bindUnchangedComponents({
      baselineSha,
      candidateSha: coding.candidateSha,
      components: promotionComponents
    })
  });

  const strict = await runStrictEvolution({
    target,
    campaign,
    candidate,
    judge: {
      ...judge,
      evalLocked: true,
      forbiddenRegression: evalBundle.criticalRegression === true || judge.forbiddenRegression === true,
      rollbackReady: judge.rollbackReady === true
    },
    roles,
    assistanceInput,
    pathwayInput,
    baselineBudget,
    candidateBudget,
    governancePolicy,
    evaluationConstitution,
    promotionBundle,
    retainedExperience,
    retainedExperienceContext,
    recursionSupervisor,
    supervisorId,
    parentCampaignId,
    storeAdapter,
    autonomyEnvelope,
    advancedEvidence,
    experimentConfig,
    changedPaths: coding.changedPaths,
    baselineMetrics: evalBundle.baselineMetrics,
    candidateMetrics: evalBundle.candidateMetrics,
    gates: gatesFromEvalBundle(evalBundle),
    shadowPassed: evalBundle.shadowPassed,
    canaryPassed: evalBundle.canaryPassed,
    riskAssessment: evalBundle.riskAssessment,
    approvalPolicy,
    manualApproved,
    baselineSha,
    candidateSha: coding.candidateSha,
    evaluationLock,
    candidateMetadata: {
      workspaceId: coding.workspaceId,
      evalEvidenceId: String(evalBundle.evidenceId),
      evalCorpusHash: evaluationLock.corpusHash,
      codingAttempts: coding.attempts,
      changedPaths: coding.changedPaths,
      strictCodingCampaign: true
    },
    adapter: promotionAdapter
  });

  const approvalPending = new Set([
    "PENDING_APPROVAL",
    "GOVERNANCE_APPROVAL_REQUIRED",
    "ADVANCED_APPROVAL_REQUIRED"
  ]).has(strict.outcome);
  let discardError = null;
  if (!approvalPending) {
    discardError = await discardBestEffort(codingAgent, { experiment, workspaceId: coding.workspaceId }, `strict_evolution_${String(strict.outcome).toLowerCase()}`);
  }

  return {
    outcome: strict.outcome,
    stage: strict.stage,
    experiment,
    coding,
    evalBundle,
    evaluationIdentity: strict.evaluationIdentity || evaluationLock,
    evaluationConstitution,
    promotionBundle,
    strict,
    discardError
  };
}

module.exports = {
  EVALUATION_PATH_PREFIXES,
  candidateTouchesEvaluation,
  bindUnchangedComponents,
  runStrictCodingEvolution
};
