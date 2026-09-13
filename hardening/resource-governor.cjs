"use strict";

const TIERS = Object.freeze({
  lite: Object.freeze({ contextScale: 0.55, concurrency: 1, animationScale: 0.35, allowBackground: false, verificationDepth: 1 }),
  balanced: Object.freeze({ contextScale: 0.8, concurrency: 2, animationScale: 0.7, allowBackground: false, verificationDepth: 2 }),
  full: Object.freeze({ contextScale: 1, concurrency: 3, animationScale: 1, allowBackground: true, verificationDepth: 3 })
});

function clamp(n, min, max) { return Math.max(min, Math.min(max, Number(n) || 0)); }
function positiveOr(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function selectTier(signals = {}) {
  const mem = Number(signals.deviceMemoryGb || 0);
  const cores = Number(signals.cores || 0);
  const battery = signals.batteryLevel == null ? 1 : clamp(signals.batteryLevel, 0, 1);
  const memoryPressure = String(signals.memoryPressure || "normal");
  const reducedMotion = Boolean(signals.reducedMotion);
  const thermal = String(signals.thermal || "normal");
  const hidden = Boolean(signals.hidden);
  const recentLongTasks = Math.max(0, Number(signals.recentLongTasks || 0));

  if (memoryPressure === "critical" || thermal === "critical" || battery <= 0.1) return "lite";
  if (reducedMotion || memoryPressure === "high" || thermal === "high" || hidden || recentLongTasks >= 3 || (mem && mem <= 2) || (cores && cores <= 2) || battery <= 0.2) return "lite";
  if (mem >= 6 && cores >= 6 && battery > 0.35 && recentLongTasks === 0) return "full";
  return "balanced";
}

function createBudget({ tier = "balanced", baseContextTokens = 16000, baseMemoryMb = 256, baseToolCalls = 12 } = {}) {
  const name = Object.prototype.hasOwnProperty.call(TIERS, tier) ? tier : "balanced";
  const policy = TIERS[name];
  const baseContext = positiveOr(baseContextTokens, 16000);
  const baseMemory = positiveOr(baseMemoryMb, 256);
  const baseTools = positiveOr(baseToolCalls, 12);
  return {
    tier: name,
    baseContextTokens: baseContext,
    baseMemoryMb: baseMemory,
    baseToolCalls: baseTools,
    contextTokens: Math.max(1024, Math.floor(baseContext * policy.contextScale)),
    memoryMb: Math.max(64, Math.floor(baseMemory * policy.contextScale)),
    toolCalls: Math.max(1, Math.floor(baseTools * (name === "full" ? 1 : name === "balanced" ? 0.75 : 0.5))),
    concurrency: policy.concurrency,
    animationScale: policy.animationScale,
    allowBackground: policy.allowBackground,
    verificationDepth: policy.verificationDepth
  };
}

function adaptBudget(current, signals = {}) {
  const tier = selectTier(signals);
  return createBudget({
    tier,
    baseContextTokens: positiveOr(current?.baseContextTokens, 16000),
    baseMemoryMb: positiveOr(current?.baseMemoryMb, 256),
    baseToolCalls: positiveOr(current?.baseToolCalls, 12)
  });
}

function capabilityDecision(capability, { tier = "balanced", risk = "low", network = true, charging = false } = {}) {
  const heavy = new Set(["deep-research", "parallel-agents", "large-local-model", "full-reindex", "deep-verification"]);
  const background = new Set(["background-sync", "background-reindex", "speculative-prefetch"]);
  if (!network && ["web", "cloud-model", "deep-research"].includes(capability)) return { allowed: false, reason: "offline" };
  if (tier === "lite" && heavy.has(capability)) return { allowed: false, reason: "resource-tier" };
  if (tier !== "full" && background.has(capability)) return { allowed: false, reason: "background-disabled" };
  if (risk === "critical" && capability === "speculative-tooling") return { allowed: false, reason: "risk-policy" };
  if (capability === "full-reindex" && !charging) return { allowed: false, reason: "requires-charging" };
  return { allowed: true, reason: "within-budget" };
}

module.exports = { TIERS, selectTier, createBudget, adaptBudget, capabilityDecision };
