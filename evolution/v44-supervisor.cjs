"use strict";

const { appendEvent, verifyLedger } = require("./ledger.cjs");

function createRecursionSupervisor({ id, constitutionHash, maxPromotions = 10 } = {}) {
  const limit = Number(maxPromotions);
  if (!id) throw new Error("supervisor id required");
  if (!constitutionHash) throw new Error("constitution hash required");
  if (!Number.isInteger(limit) || limit < 0 || limit > 10) throw new Error("maxPromotions must be an integer from 0 to 10");
  const supervisor = {
    format: "seven-recursion-supervisor",
    version: 1,
    id: String(id),
    constitutionHash: String(constitutionHash),
    maxPromotions: limit,
    campaigns: {},
    promotions: [],
    ledger: []
  };
  supervisor.ledger = appendEvent(supervisor.ledger, {
    type: "SUPERVISOR_CREATED",
    source: "seven-self-evolution-v4.4",
    payload: { id: supervisor.id, constitutionHash: supervisor.constitutionHash, maxPromotions: limit }
  });
  return supervisor;
}

function assertIntegrity(supervisor) {
  if (!supervisor || supervisor.format !== "seven-recursion-supervisor") throw new Error("recursion supervisor required");
  const integrity = verifyLedger(supervisor.ledger || []);
  if (!integrity.valid) throw new Error(`supervisor ledger integrity failed: ${integrity.reason}`);
  return integrity;
}

function registerCampaign(supervisor, campaign, { parentCampaignId = null } = {}) {
  assertIntegrity(supervisor);
  if (!campaign || !campaign.id) throw new Error("campaign required");
  if (campaign.constitutionHash !== supervisor.constitutionHash) throw new Error("campaign constitution mismatch");
  const id = String(campaign.id);
  const existing = supervisor.campaigns[id];
  if (existing) {
    if (existing.targetHash !== campaign.targetHash || existing.generation !== campaign.generation || existing.parentCampaignId !== (parentCampaignId || null)) {
      throw new Error("campaign id reused with different identity");
    }
    return { registered: false, idempotent: true, campaign: existing };
  }
  if (parentCampaignId) {
    const parent = supervisor.campaigns[String(parentCampaignId)];
    if (!parent) throw new Error("parent campaign not registered");
    let cursor = parent;
    while (cursor) {
      if (cursor.id === id) throw new Error("campaign nesting cycle detected");
      cursor = cursor.parentCampaignId ? supervisor.campaigns[cursor.parentCampaignId] : null;
    }
  }
  const record = {
    id,
    targetHash: campaign.targetHash,
    generation: campaign.generation,
    generationLimit: campaign.generationLimit,
    parentCampaignId: parentCampaignId ? String(parentCampaignId) : null
  };
  supervisor.campaigns[id] = record;
  supervisor.ledger = appendEvent(supervisor.ledger, {
    type: "CAMPAIGN_REGISTERED",
    source: "seven-self-evolution-v4.4",
    payload: record
  });
  return { registered: true, idempotent: false, campaign: record };
}

function recordPromotion(supervisor, { campaignId, generation, candidateHash } = {}) {
  assertIntegrity(supervisor);
  const campaign = supervisor.campaigns[String(campaignId || "")];
  if (!campaign) throw new Error("campaign not registered");
  if (!candidateHash) throw new Error("candidate hash required");
  const g = Number(generation);
  if (!Number.isInteger(g) || g !== campaign.generation) throw new Error("promotion generation mismatch");
  const key = `${campaign.id}:${g}:${candidateHash}`;
  const existing = supervisor.promotions.find((entry) => entry.key === key);
  if (existing) return { recorded: false, idempotent: true, promotion: existing };
  if (supervisor.promotions.length >= supervisor.maxPromotions) throw new Error("global recursive promotion budget exhausted");
  const promotion = { key, campaignId: campaign.id, generation: g, candidateHash: String(candidateHash) };
  supervisor.promotions.push(promotion);
  supervisor.ledger = appendEvent(supervisor.ledger, {
    type: "PROMOTION_RECORDED",
    source: "seven-self-evolution-v4.4",
    payload: promotion
  });
  return { recorded: true, idempotent: false, promotion };
}

function inspectRecursionSupervisor(supervisor) {
  const ledger = verifyLedger(supervisor && supervisor.ledger ? supervisor.ledger : []);
  return {
    valid: Boolean(supervisor && supervisor.format === "seven-recursion-supervisor" && ledger.valid),
    ledger,
    campaignCount: supervisor ? Object.keys(supervisor.campaigns || {}).length : 0,
    promotionCount: supervisor ? (supervisor.promotions || []).length : 0,
    remainingPromotions: supervisor ? Math.max(0, supervisor.maxPromotions - (supervisor.promotions || []).length) : 0
  };
}

module.exports = {
  createRecursionSupervisor,
  registerCampaign,
  recordPromotion,
  inspectRecursionSupervisor
};
