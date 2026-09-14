"use strict";

const { appendEvent, verifyLedger } = require("./ledger.cjs");
const { persistStateAtomic, loadCommittedState } = require("./state-store.cjs");

function createCampaignJournal({ campaign, target } = {}) {
  if (!campaign || !campaign.id) throw new Error("campaign required");
  if (!target || !target.hash) throw new Error("target required");
  let ledger = [];
  ledger = appendEvent(ledger, {
    type: "CAMPAIGN_OPENED",
    source: "seven-self-evolution-v4.4",
    payload: {
      campaignId: campaign.id,
      generation: campaign.generation,
      generationLimit: campaign.generationLimit,
      targetHash: target.hash,
      constitutionHash: campaign.constitutionHash
    }
  });
  return {
    format: "seven-evolution-campaign-journal",
    version: 1,
    campaignId: campaign.id,
    targetHash: target.hash,
    constitutionHash: campaign.constitutionHash,
    generation: campaign.generation,
    ledger
  };
}

function appendCampaignEvent(journal, type, payload = {}) {
  if (!journal || !Array.isArray(journal.ledger)) throw new Error("campaign journal required");
  const integrity = verifyLedger(journal.ledger);
  if (!integrity.valid) throw new Error(`campaign journal integrity failed: ${integrity.reason}`);
  journal.ledger = appendEvent(journal.ledger, {
    type: String(type || "UNKNOWN"),
    source: "seven-self-evolution-v4.4",
    payload: { campaignId: journal.campaignId, generation: journal.generation, ...payload }
  });
  return journal;
}

function inspectCampaignJournal(journal) {
  const ledger = verifyLedger(journal && journal.ledger ? journal.ledger : []);
  return {
    valid: Boolean(journal && journal.format === "seven-evolution-campaign-journal" && ledger.valid),
    ledger,
    campaignId: journal && journal.campaignId,
    generation: journal && journal.generation
  };
}

function campaignStateKey(campaignId) {
  const id = String(campaignId || "").trim();
  if (!id) throw new Error("campaign id required");
  return `seven-evolution-campaign:${id}`;
}

async function persistCampaignJournal({ storeAdapter, journal } = {}) {
  if (!storeAdapter) throw new Error("storeAdapter required");
  const inspection = inspectCampaignJournal(journal);
  if (!inspection.valid) throw new Error("cannot persist invalid campaign journal");
  return persistStateAtomic({
    adapter: storeAdapter,
    key: campaignStateKey(journal.campaignId),
    state: journal
  });
}

async function loadCampaignJournal({ storeAdapter, campaignId } = {}) {
  if (!storeAdapter) throw new Error("storeAdapter required");
  const journal = await loadCommittedState({ adapter: storeAdapter, key: campaignStateKey(campaignId) });
  if (!journal) return null;
  const inspection = inspectCampaignJournal(journal);
  if (!inspection.valid) throw new Error("stored campaign journal integrity failed");
  return journal;
}

module.exports = {
  createCampaignJournal,
  appendCampaignEvent,
  inspectCampaignJournal,
  campaignStateKey,
  persistCampaignJournal,
  loadCampaignJournal
};
