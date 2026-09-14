"use strict";

const TASK_STATES = Object.freeze({
  CREATED: "CREATED",
  PLANNING: "PLANNING",
  EXECUTING: "EXECUTING",
  VERIFYING: "VERIFYING",
  COMMITTING: "COMMITTING",
  COMPLETED: "COMPLETED",
  BLOCKED: "BLOCKED",
  INCONCLUSIVE: "INCONCLUSIVE",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED"
});

const TERMINAL_STATES = Object.freeze(new Set([
  TASK_STATES.COMPLETED,
  TASK_STATES.INCONCLUSIVE,
  TASK_STATES.FAILED,
  TASK_STATES.CANCELLED
]));

const EXPLAINED_STATES = Object.freeze(new Set([
  TASK_STATES.BLOCKED,
  TASK_STATES.INCONCLUSIVE,
  TASK_STATES.FAILED,
  TASK_STATES.CANCELLED
]));

const ALLOWED_TRANSITIONS = Object.freeze({
  CREATED: new Set(["PLANNING", "BLOCKED", "CANCELLED", "FAILED"]),
  PLANNING: new Set(["EXECUTING", "BLOCKED", "INCONCLUSIVE", "CANCELLED", "FAILED"]),
  EXECUTING: new Set(["VERIFYING", "BLOCKED", "INCONCLUSIVE", "CANCELLED", "FAILED"]),
  VERIFYING: new Set(["COMMITTING", "EXECUTING", "BLOCKED", "INCONCLUSIVE", "CANCELLED", "FAILED"]),
  COMMITTING: new Set(["COMPLETED", "BLOCKED", "CANCELLED", "FAILED"]),
  BLOCKED: new Set(["PLANNING", "EXECUTING", "VERIFYING", "CANCELLED", "FAILED", "INCONCLUSIVE"]),
  INCONCLUSIVE: new Set(),
  FAILED: new Set(),
  CANCELLED: new Set(),
  COMPLETED: new Set()
});

const RISK_LEVELS = Object.freeze(["low", "medium", "high", "critical"]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map(v => String(v || "").trim()).filter(Boolean)));
}

function finiteOr(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function normalizeRisk(value) {
  const risk = String(value || "low").toLowerCase();
  return RISK_LEVELS.includes(risk) ? risk : "low";
}

function makeId(prefix = "task") {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

function createTaskContract(input = {}) {
  const goal = String(input.goal || "").trim();
  if (!goal) throw new Error("task contract requires goal");

  const allowedCapabilities = asStringArray(input.allowedCapabilities);
  const deniedCapabilities = asStringArray(input.deniedCapabilities);
  const overlap = allowedCapabilities.filter(x => deniedCapabilities.includes(x));
  if (overlap.length) throw new Error(`capability cannot be both allowed and denied: ${overlap.join(",")}`);

  const contract = {
    schemaVersion: 1,
    id: String(input.id || makeId("task")),
    createdAt: input.createdAt || new Date().toISOString(),
    state: TASK_STATES.CREATED,
    goal,
    intent: String(input.intent || "general"),
    scope: {
      resources: asStringArray(input.scope && input.scope.resources),
      projects: asStringArray(input.scope && input.scope.projects),
      files: asStringArray(input.scope && input.scope.files),
      externalDomains: asStringArray(input.scope && input.scope.externalDomains)
    },
    risk: normalizeRisk(input.risk),
    evidence: {
      required: Boolean(input.evidence && input.evidence.required),
      minIndependentSources: Math.max(0, Math.floor(finiteOr(input.evidence && input.evidence.minIndependentSources, 0))),
      freshnessMs: finiteOr(input.evidence && input.evidence.freshnessMs, 0),
      allowInference: input.evidence && input.evidence.allowInference === false ? false : true
    },
    budgets: {
      tokens: finiteOr(input.budgets && input.budgets.tokens, 0),
      wallMs: finiteOr(input.budgets && input.budgets.wallMs, 0),
      toolCalls: finiteOr(input.budgets && input.budgets.toolCalls, 0),
      networkRequests: finiteOr(input.budgets && input.budgets.networkRequests, 0),
      memoryMb: finiteOr(input.budgets && input.budgets.memoryMb, 0)
    },
    allowedCapabilities,
    deniedCapabilities,
    successCriteria: asStringArray(input.successCriteria),
    stopConditions: asStringArray(input.stopConditions),
    verification: {
      required: input.verification && input.verification.required === false ? false : true,
      checks: asStringArray(input.verification && input.verification.checks)
    },
    metadata: clone(input.metadata || {}),
    lineage: {
      parentTaskId: input.lineage && input.lineage.parentTaskId || null,
      origin: input.lineage && input.lineage.origin || "user",
      requestId: input.lineage && input.lineage.requestId || null
    }
  };

  const validation = validateTaskContract(contract);
  if (!validation.ok) throw new Error(`invalid task contract: ${validation.issues.join(",")}`);
  return contract;
}

function validateTaskContract(contract) {
  const issues = [];
  if (!contract || typeof contract !== "object") return { ok: false, issues: ["not-object"] };
  if (!contract.id) issues.push("missing-id");
  if (!String(contract.goal || "").trim()) issues.push("missing-goal");
  if (!Object.values(TASK_STATES).includes(contract.state)) issues.push("bad-state");
  if (!RISK_LEVELS.includes(contract.risk)) issues.push("bad-risk");
  const allowed = new Set(asStringArray(contract.allowedCapabilities));
  for (const denied of asStringArray(contract.deniedCapabilities)) if (allowed.has(denied)) issues.push(`capability-overlap:${denied}`);
  return { ok: issues.length === 0, issues };
}

function canUseCapability(contract, capability) {
  const name = String(capability || "").trim();
  if (!name) return { allowed: false, reason: "missing-capability" };
  if (!contract || TERMINAL_STATES.has(contract.state)) return { allowed: false, reason: "task-not-active" };
  if (asStringArray(contract.deniedCapabilities).includes(name)) return { allowed: false, reason: "explicitly-denied" };
  const allow = asStringArray(contract.allowedCapabilities);
  if (!allow.length) return { allowed: false, reason: "not-explicitly-allowed" };
  return allow.includes(name)
    ? { allowed: true, reason: "explicitly-allowed" }
    : { allowed: false, reason: "outside-capability-scope" };
}

function transitionTask(contract, nextState, meta = {}) {
  if (!contract) throw new Error("contract required");
  const current = String(contract.state);
  const next = String(nextState);
  if (!Object.values(TASK_STATES).includes(next)) throw new Error(`unknown task state: ${next}`);
  const allowed = ALLOWED_TRANSITIONS[current];
  if (!allowed || !allowed.has(next)) throw new Error(`illegal task transition: ${current}->${next}`);
  const reason = String(meta.reason || "").trim();
  if (EXPLAINED_STATES.has(next) && !reason) throw new Error(`task transition requires reason: ${current}->${next}`);
  return {
    ...clone(contract),
    state: next,
    transition: {
      from: current,
      to: next,
      at: meta.at || new Date().toISOString(),
      reason: reason || null,
      evidenceRef: meta.evidenceRef || null
    }
  };
}

function deriveExecutionEnvelope(contract) {
  const validation = validateTaskContract(contract);
  if (!validation.ok) throw new Error(`invalid task contract: ${validation.issues.join(",")}`);
  return {
    taskId: contract.id,
    state: contract.state,
    risk: contract.risk,
    scope: clone(contract.scope),
    budgets: clone(contract.budgets),
    capabilities: {
      allow: asStringArray(contract.allowedCapabilities),
      deny: asStringArray(contract.deniedCapabilities)
    },
    evidence: clone(contract.evidence),
    verification: clone(contract.verification)
  };
}

module.exports = {
  TASK_STATES,
  TERMINAL_STATES,
  RISK_LEVELS,
  createTaskContract,
  validateTaskContract,
  canUseCapability,
  transitionTask,
  deriveExecutionEnvelope
};