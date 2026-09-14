"use strict";

const { appendEvent, verifyLedger } = require("./ledger.cjs");

function ensure(supervisor) {
  if (!supervisor || supervisor.format !== "seven-recursion-supervisor") throw new Error("recursion supervisor required");
  const check = verifyLedger(supervisor.ledger || []);
  if (!check.valid) throw new Error("supervisor ledger integrity failed");
  if (!Array.isArray(supervisor.reservations)) supervisor.reservations = [];
  return supervisor;
}

function keyOf({ campaignId, generation, candidateHash } = {}) {
  if (!campaignId || !candidateHash) throw new Error("promotion identity required");
  const generationNumber = Number(generation);
  if (!Number.isInteger(generationNumber) || generationNumber < 0 || generationNumber > 10) throw new Error("invalid generation");
  return `${campaignId}:${generationNumber}:${candidateHash}`;
}

function reserve(supervisor, input = {}) {
  ensure(supervisor);
  const campaign = supervisor.campaigns[String(input.campaignId || "")];
  if (!campaign) throw new Error("campaign not registered");
  if (Number(input.generation) !== campaign.generation) throw new Error("generation mismatch");
  const key = keyOf(input);
  if (supervisor.promotions.some((entry) => entry.key === key)) return { key, state: "COMMITTED", idempotent: true };
  if (supervisor.reservations.some((entry) => entry.key === key)) return { key, state: "RESERVED", idempotent: true };
  if (supervisor.promotions.length + supervisor.reservations.length >= supervisor.maxPromotions) throw new Error("promotion budget unavailable");
  const record = { key, campaignId: campaign.id, generation: campaign.generation, candidateHash: String(input.candidateHash) };
  supervisor.reservations.push(record);
  supervisor.ledger = appendEvent(supervisor.ledger, { type: "PROMOTION_RESERVED", source: "seven-self-evolution-v4.4", payload: record });
  return { key, state: "RESERVED", idempotent: false };
}

function commit(supervisor, key) {
  ensure(supervisor);
  const index = supervisor.reservations.findIndex((entry) => entry.key === String(key));
  if (index < 0) {
    if (supervisor.promotions.some((entry) => entry.key === String(key))) return { state: "COMMITTED", idempotent: true };
    throw new Error("reservation missing");
  }
  const [record] = supervisor.reservations.splice(index, 1);
  supervisor.promotions.push(record);
  supervisor.ledger = appendEvent(supervisor.ledger, { type: "PROMOTION_COMMITTED", source: "seven-self-evolution-v4.4", payload: record });
  return { state: "COMMITTED", idempotent: false };
}

function release(supervisor, key, reason = "not_promoted") {
  ensure(supervisor);
  const index = supervisor.reservations.findIndex((entry) => entry.key === String(key));
  if (index < 0) return { state: "ABSENT", idempotent: true };
  const [record] = supervisor.reservations.splice(index, 1);
  supervisor.ledger = appendEvent(supervisor.ledger, { type: "PROMOTION_RESERVATION_RELEASED", source: "seven-self-evolution-v4.4", payload: { ...record, reason: String(reason) } });
  return { state: "RELEASED", idempotent: false };
}

module.exports = { keyOf, reserve, commit, release };
