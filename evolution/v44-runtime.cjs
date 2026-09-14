"use strict";

const {
  assessAssistance,
  pathwayReceipt,
  roleIsolationReceipt,
  matchedBudgetReceipt,
  promotionDecision
} = require("./v44-governance.cjs");
const {
  createCampaignJournal,
  appendCampaignEvent,
  persistCampaignJournal
} = require("./v44-campaign-journal.cjs");
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
  governancePolicy = {}
} = {}) {
  const assistance = assessAssistance(assistanceInput);
  const pathway = pathwayReceipt(pathwayInput);
  const isolation = roleIsolationReceipt(roles);
  const budget = matchedBudgetReceipt({
    baseline: baselineBudget,
    candidate: candidateBudget,
    tolerance: Number(governancePolicy.budgetTolerance || 0)
  });
  const decision = promotionDecision({
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
  return { assistance, pathway, isolation, budget, decision };
}

async function record(storeAdapter, journal, type, payload) {
  appendCampaignEvent(journal, type, payload);
  if (storeAdapter) await persistCampaignJournal({ storeAdapter, journal });
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
  storeAdapter,
  engineStateKey,
  ...engineInput
} = {}) {
  if (!target || !target.hash) throw new Error("frozen improvement target required");
  if (!campaign || !campaign.id) throw new Error("campaign required");
  if (campaign.targetHash !== target.hash) throw new Error("campaign target mismatch");

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
    governancePolicy
  });

  if (preflight.decision.decision === "REJECT") {
    await record(storeAdapter, journal, "GOVERNANCE_REJECTED", {
      candidateHash: candidate.hash || null,
      reasons: preflight.decision.reasons,
      assistance: preflight.assistance,
      pathway: preflight.pathway,
      isolation: preflight.isolation,
      budget: preflight.budget
    });
    return {
      outcome: "GOVERNANCE_REJECTED",
      stage: "V44_PREFLIGHT",
      preflight,
      journal
    };
  }

  if (preflight.decision.decision === "EXPERIMENT_ONLY") {
    await record(storeAdapter, journal, "EXPERIMENT_ONLY", {
      candidateHash: candidate.hash,
      decision: preflight.decision.decision
    });
    return {
      outcome: "EXPERIMENT_ONLY",
      stage: "V44_PREFLIGHT",
      preflight,
      journal
    };
  }

  if (preflight.decision.decision === "REQUIRE_APPROVAL" && governancePolicy.governanceApproved !== true) {
    await record(storeAdapter, journal, "GOVERNANCE_APPROVAL_REQUIRED", {
      candidateHash: candidate.hash,
      decision: preflight.decision.decision
    });
    return {
      outcome: "GOVERNANCE_APPROVAL_REQUIRED",
      stage: "V44_PREFLIGHT",
      preflight,
      journal
    };
  }

  await record(storeAdapter, journal, "GOVERNANCE_ACCEPTED", {
    candidateHash: candidate.hash,
    decision: preflight.decision.decision,
    autonomousEvidence: preflight.assistance.autonomousEvidence,
    pathwayComplete: preflight.pathway.complete
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
          governanceDecision: preflight.decision.decision
        }
      }
    });
    await record(storeAdapter, journal, "ENGINE_OUTCOME", {
      candidateHash: candidate.hash,
      outcome: result.outcome,
      stage: result.stage
    });
    return { ...result, v44: { preflight, journal } };
  } catch (error) {
    await record(storeAdapter, journal, "ENGINE_EXCEPTION", {
      candidateHash: candidate.hash,
      error: String(error && error.message || error)
    });
    throw error;
  }
}

module.exports = {
  governancePreflight,
  runGovernedEvolution
};
