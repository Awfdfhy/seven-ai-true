"use strict";

const {
  assessAssistance,
  pathwayReceipt,
  roleIsolationReceipt,
  matchedBudgetReceipt,
  promotionDecision,
  deepFreeze
} = require("./v44-governance.cjs");
const {
  createCampaignJournal,
  appendCampaignEvent,
  persistCampaignJournal
} = require("./v44-campaign-journal.cjs");
const { registerCampaign } = require("./v44-supervisor.cjs");
const reservation = require("./v44-promotion-reservations.cjs");
const { persistSupervisor, loadSupervisor } = require("./v44-supervisor-store.cjs");
const { evaluationFirewallReceipt } = require("./v44-eval-firewall.cjs");
const { verifyPromotionBundle } = require("./v44-promotion-bundle.cjs");
const { experienceUseReceipt } = require("./v44-experience-compiler.cjs");
const { runDurableSystemEvolution } = require("./durable-engine.cjs");

function governancePreflight({
  target,
  campaign,
  candidate = {},
  judge = {},
  roles = {},
  assistanceInput = {},
  pathwayInput = {},
  baselineBudget = {},
  candidateBudget = {},
  governancePolicy = {},
  evaluationConstitution,
  promotionBundle,
  retainedExperience = null,
  retainedExperienceContext = {}
} = {}) {
  const assistance = assessAssistance(assistanceInput);
  const pathway = pathwayReceipt(pathwayInput);
  const isolation = roleIsolationReceipt(roles);
  const budget = matchedBudgetReceipt({
    baseline: baselineBudget,
    candidate: candidateBudget,
    tolerance: Number(governancePolicy.budgetTolerance || 0)
  });
  const evaluation = evaluationFirewallReceipt({
    constitution: evaluationConstitution,
    candidateBuilderHash: roles.builder && roles.builder.identity,
    requestedJudgeHash: judge.hash,
    candidateTouchesEvaluation: candidate.touchesEvaluation === true
  });
  const bundle = verifyPromotionBundle(promotionBundle, {
    candidateHash: candidate.hash,
    targetHash: target && target.hash,
    campaignId: campaign && campaign.id,
    generation: campaign && campaign.generation,
    evaluationConstitutionHash: evaluationConstitution && evaluationConstitution.hash
  });
  const experience = candidate.usesRetainedExperience === true
    ? experienceUseReceipt({
        experience: retainedExperience,
        currentTargetHash: target && target.hash,
        requestedScope: target && target.scope,
        ...retainedExperienceContext
      })
    : deepFreeze({ usable: true, reasons: [], notUsed: true });
  const base = promotionDecision({
    target,
    campaign,
    candidate,
    judge,
    assistance,
    pathway,
    isolation,
    budget,
    policy: governancePolicy
  });
  const reasons = [
    ...(base.reasons || []),
    ...(evaluation.pass ? [] : evaluation.reasons),
    ...(bundle.valid ? [] : bundle.reasons),
    ...(experience.usable ? [] : experience.reasons)
  ];
  const decision = reasons.length
    ? deepFreeze({ decision: "REJECT", reasons: [...new Set(reasons)] })
    : base;
  return { assistance, pathway, isolation, budget, evaluation, bundle, experience, decision };
}

async function record(storeAdapter, journal, type, payload) {
  appendCampaignEvent(journal, type, payload);
  if (storeAdapter) await persistCampaignJournal({ storeAdapter, journal });
}

async function resolveSupervisor({ storeAdapter, recursionSupervisor, supervisorId } = {}) {
  const id = String(supervisorId || recursionSupervisor && recursionSupervisor.id || "");
  if (!id) throw new Error("recursion supervisor required");
  if (storeAdapter) {
    const stored = await loadSupervisor({ storeAdapter, supervisorId: id });
    if (stored) return stored;
  }
  if (!recursionSupervisor) throw new Error("recursion supervisor required");
  return recursionSupervisor;
}

async function runGovernedEvolution({
  target,
  campaign,
  candidate = {},
  judge = {},
  roles = {},
  assistanceInput = {},
  pathwayInput = {},
  baselineBudget = {},
  candidateBudget = {},
  governancePolicy = {},
  evaluationConstitution,
  promotionBundle,
  retainedExperience = null,
  retainedExperienceContext = {},
  recursionSupervisor,
  supervisorId,
  parentCampaignId = null,
  storeAdapter,
  engineStateKey,
  ...engineInput
} = {}) {
  if (!target || !target.hash) throw new Error("frozen improvement target required");
  if (!campaign || !campaign.id) throw new Error("campaign required");
  if (campaign.targetHash !== target.hash) throw new Error("campaign target mismatch");
  if (!evaluationConstitution || !evaluationConstitution.hash) throw new Error("evaluation constitution required");
  if (!promotionBundle || !promotionBundle.hash) throw new Error("promotion bundle required");

  const supervisor = await resolveSupervisor({ storeAdapter, recursionSupervisor, supervisorId });
  registerCampaign(supervisor, campaign, { parentCampaignId });
  if (storeAdapter) await persistSupervisor({ storeAdapter, supervisor });

  const journal = createCampaignJournal({ campaign, target });
  if (storeAdapter) await persistCampaignJournal({ storeAdapter, journal });

  const preflight = governancePreflight({
    target,
    campaign,
    candidate,
    judge,
    roles,
    assistanceInput,
    pathwayInput,
    baselineBudget,
    candidateBudget,
    governancePolicy,
    evaluationConstitution,
    promotionBundle,
    retainedExperience,
    retainedExperienceContext
  });

  if (preflight.decision.decision === "REJECT") {
    await record(storeAdapter, journal, "GOVERNANCE_REJECTED", {
      candidateHash: candidate.hash || null,
      reasons: preflight.decision.reasons,
      evaluationConstitutionHash: evaluationConstitution.hash,
      promotionBundleHash: promotionBundle.hash
    });
    return { outcome: "GOVERNANCE_REJECTED", stage: "V44_PREFLIGHT", preflight, journal, supervisor };
  }

  if (preflight.decision.decision === "EXPERIMENT_ONLY") {
    await record(storeAdapter, journal, "EXPERIMENT_ONLY", { candidateHash: candidate.hash });
    return { outcome: "EXPERIMENT_ONLY", stage: "V44_PREFLIGHT", preflight, journal, supervisor };
  }

  if (preflight.decision.decision === "REQUIRE_APPROVAL" && governancePolicy.governanceApproved !== true) {
    await record(storeAdapter, journal, "GOVERNANCE_APPROVAL_REQUIRED", { candidateHash: candidate.hash });
    return { outcome: "GOVERNANCE_APPROVAL_REQUIRED", stage: "V44_PREFLIGHT", preflight, journal, supervisor };
  }

  const held = reservation.reserve(supervisor, {
    campaignId: campaign.id,
    generation: campaign.generation,
    candidateHash: candidate.hash
  });
  const reservationKey = held.key;
  if (storeAdapter) await persistSupervisor({ storeAdapter, supervisor });

  await record(storeAdapter, journal, "GOVERNANCE_ACCEPTED", {
    candidateHash: candidate.hash,
    decision: preflight.decision.decision,
    reservationKey,
    evaluationConstitutionHash: evaluationConstitution.hash,
    promotionBundleHash: promotionBundle.hash,
    experienceHash: retainedExperience && retainedExperience.hash || null
  });

  try {
    const result = await runDurableSystemEvolution({
      storeAdapter,
      stateKey: engineStateKey || `seven-evolution-engine:${campaign.id}`,
      ...engineInput,
      candidateMetadata: {
        ...(engineInput.candidateMetadata || {}),
        v44: {
          targetHash: target.hash,
          campaignId: campaign.id,
          generation: campaign.generation,
          constitutionHash: campaign.constitutionHash,
          candidateHash: candidate.hash,
          evaluationConstitutionHash: evaluationConstitution.hash,
          promotionBundleHash: promotionBundle.hash,
          governanceDecision: preflight.decision.decision
        }
      }
    });

    if (result.outcome === "COMMITTED") reservation.commit(supervisor, reservationKey);
    else reservation.release(supervisor, reservationKey, result.outcome || "not_committed");
    if (storeAdapter) await persistSupervisor({ storeAdapter, supervisor });

    await record(storeAdapter, journal, "ENGINE_OUTCOME", {
      candidateHash: candidate.hash,
      outcome: result.outcome,
      stage: result.stage,
      reservationState: result.outcome === "COMMITTED" ? "COMMITTED" : "RELEASED"
    });
    return { ...result, v44: { preflight, journal, reservationKey, supervisor } };
  } catch (error) {
    reservation.release(supervisor, reservationKey, "engine_exception");
    if (storeAdapter) await persistSupervisor({ storeAdapter, supervisor });
    await record(storeAdapter, journal, "ENGINE_EXCEPTION", {
      candidateHash: candidate.hash,
      error: String(error && error.message || error),
      reservationState: "RELEASED"
    });
    throw error;
  }
}

module.exports = { governancePreflight, resolveSupervisor, runGovernedEvolution };
