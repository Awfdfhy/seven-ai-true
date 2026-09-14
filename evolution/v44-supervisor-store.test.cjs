"use strict";

const assert = require("assert/strict");
const { freezeTarget, createCampaign } = require("./v44-governance.cjs");
const { createRecursionSupervisor, registerCampaign } = require("./v44-supervisor.cjs");
const reservation = require("./v44-promotion-reservations.cjs");
const {
  persistSupervisor,
  loadSupervisor,
  reconcileSupervisorReservation
} = require("./v44-supervisor-store.cjs");

async function pass(name, fn) {
  await fn();
  console.log("PASS", name);
}

function keyedMemoryStore() {
  const committed = new Map();
  const temp = new Map();
  return {
    async writeTemp({ key, envelope }) { temp.set(key, envelope); },
    async commitTemp({ key, expectedChecksum }) {
      const value = temp.get(key);
      if (!value || value.checksum !== expectedChecksum) throw new Error("temp mismatch");
      committed.set(key, value);
      temp.delete(key);
    },
    async readCommitted({ key }) { return committed.get(key) || null; }
  };
}

function fixture() {
  const target = freezeTarget({
    id: "durable-supervisor-target",
    authorityHash: "authority-v1",
    scope: "CAMPAIGN_LOCAL",
    generationLimit: 10
  });
  const constitutionHash = "sev4.4";
  const campaign = createCampaign({ id: "durable-supervisor-campaign", target, constitutionHash, generation: 1 });
  const supervisor = createRecursionSupervisor({ id: "durable-supervisor", constitutionHash, maxPromotions: 2 });
  registerCampaign(supervisor, campaign);
  return { target, campaign, supervisor };
}

(async () => {
  await pass("promotion reservation survives supervisor persistence and reload", async () => {
    const store = keyedMemoryStore();
    const { campaign, supervisor } = fixture();
    reservation.reserve(supervisor, { campaignId: campaign.id, generation: campaign.generation, candidateHash: "candidate-1" });
    await persistSupervisor({ storeAdapter: store, supervisor });
    const restored = await loadSupervisor({ storeAdapter: store, supervisorId: supervisor.id });
    assert.equal(restored.reservations.length, 1);
    assert.equal(restored.promotions.length, 0);
  });

  await pass("restart reconciliation commits a reservation only after durable COMMITTED state", async () => {
    const store = keyedMemoryStore();
    const { campaign, supervisor } = fixture();
    reservation.reserve(supervisor, { campaignId: campaign.id, generation: campaign.generation, candidateHash: "candidate-1" });
    await persistSupervisor({ storeAdapter: store, supervisor });
    const restored = await loadSupervisor({ storeAdapter: store, supervisorId: supervisor.id });
    const result = await reconcileSupervisorReservation({
      storeAdapter: store,
      supervisor: restored,
      campaignId: campaign.id,
      generation: campaign.generation,
      candidateHash: "candidate-1",
      engineState: { phase: "COMPLETE", transaction: { state: "COMMITTED" } }
    });
    assert.equal(result.action, "COMMIT");
    assert.equal(restored.reservations.length, 0);
    assert.equal(restored.promotions.length, 1);
    const persisted = await loadSupervisor({ storeAdapter: store, supervisorId: supervisor.id });
    assert.equal(persisted.promotions.length, 1);
  });

  await pass("restart reconciliation releases reservation after rollback", async () => {
    const store = keyedMemoryStore();
    const { campaign, supervisor } = fixture();
    reservation.reserve(supervisor, { campaignId: campaign.id, generation: campaign.generation, candidateHash: "candidate-2" });
    await persistSupervisor({ storeAdapter: store, supervisor });
    const restored = await loadSupervisor({ storeAdapter: store, supervisorId: supervisor.id });
    const result = await reconcileSupervisorReservation({
      storeAdapter: store,
      supervisor: restored,
      campaignId: campaign.id,
      generation: campaign.generation,
      candidateHash: "candidate-2",
      engineState: { phase: "ROLLED_BACK", transaction: { state: "ROLLED_BACK" } }
    });
    assert.equal(result.action, "RELEASE");
    assert.equal(restored.reservations.length, 0);
    assert.equal(restored.promotions.length, 0);
  });

  console.log("self-evolution v4.4 durable supervisor test suite: PASS");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
