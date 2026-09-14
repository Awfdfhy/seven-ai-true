"use strict";

const { buildCognitiveDecision, runAdversarialArena, riskScore } = require("./cognitive-boost.cjs");

function requiresArena(decision, context = {}) {
  const risk = riskScore(context.risk == null ? context.task && context.task.risk : context.risk);
  return context.forceArena === true || decision.compute.tier === "DEEP" || decision.compute.tier === "EXTREME" || risk >= 0.7;
}

async function runCognitivePreflight({ candidate, context = {}, arenaAdapter } = {}) {
  if (!candidate) throw new Error("candidate required");
  const decision = buildCognitiveDecision({
    task: context.task || {},
    claims: context.claims || [],
    mission: context.mission,
    routeState: context.routeState || {},
    routeCandidates: context.routeCandidates || [],
    trustInputs: context.trustInputs || []
  });

  const reasons = [];
  if (decision.truthBlocked) reasons.push("truth_contested");
  if (context.requiresAuthority === true && decision.mayUseAuthorityTools !== true) reasons.push("authority_flow_blocked");

  let arena = null;
  if (requiresArena(decision, context)) {
    if (!arenaAdapter || typeof arenaAdapter.critic !== "function" || typeof arenaAdapter.attacker !== "function" || typeof arenaAdapter.judge !== "function") {
      reasons.push("arena_required_but_unavailable");
    } else {
      arena = await runAdversarialArena({
        candidate,
        critic: arenaAdapter.critic,
        attacker: arenaAdapter.attacker,
        judge: arenaAdapter.judge
      });
      if (!arena.passed) reasons.push("adversarial_arena_failed");
    }
  }

  return Object.freeze({
    pass: reasons.length === 0,
    reasons: Object.freeze(reasons),
    decision,
    arena,
    computeTier: decision.compute.tier,
    route: decision.route && decision.route.selected || null
  });
}

module.exports = { requiresArena, runCognitivePreflight };