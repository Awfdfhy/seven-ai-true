"use strict";

const { hashObject } = require("./ledger.cjs");

const COMPUTE_TIERS = Object.freeze({
  FAST: Object.freeze({ maxCandidates: 1, verifierPasses: 0, plannerDepth: 1, scoreFloor: 0 }),
  STANDARD: Object.freeze({ maxCandidates: 2, verifierPasses: 1, plannerDepth: 3, scoreFloor: 0.28 }),
  DEEP: Object.freeze({ maxCandidates: 4, verifierPasses: 2, plannerDepth: 6, scoreFloor: 0.55 }),
  EXTREME: Object.freeze({ maxCandidates: 6, verifierPasses: 3, plannerDepth: 10, scoreFloor: 0.78 })
});

const TRUST = Object.freeze({
  SYSTEM: 5,
  VERIFIED: 4,
  USER: 3,
  INTERNAL_DERIVED: 2,
  EXTERNAL: 1,
  UNTRUSTED: 0
});

function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function allocateCompute(input = {}) {
  const score = clamp01(
    clamp01(input.complexity) * 0.30 +
    clamp01(input.risk) * 0.24 +
    clamp01(input.freshnessNeed) * 0.14 +
    clamp01(input.toolDepth) * 0.12 +
    clamp01(input.longHorizon) * 0.12 +
    clamp01(input.recentFailureRate) * 0.08
  );
  const tier = score >= COMPUTE_TIERS.EXTREME.scoreFloor ? "EXTREME"
    : score >= COMPUTE_TIERS.DEEP.scoreFloor ? "DEEP"
      : score >= COMPUTE_TIERS.STANDARD.scoreFloor ? "STANDARD"
        : "FAST";
  return Object.freeze({ tier, score, ...COMPUTE_TIERS[tier] });
}

function normalizeEvidence(item = {}) {
  return Object.freeze({
    id: String(item.id || `evidence-${hashObject(item).slice(0, 16)}`),
    source: String(item.source || "unknown"),
    sourceTrust: clamp01(item.sourceTrust),
    timestamp: item.timestamp || null,
    stance: item.stance === "CONTRADICT" ? "CONTRADICT" : "SUPPORT",
    excerptHash: item.excerptHash || hashObject(String(item.excerpt || "")),
    verified: item.verified === true
  });
}

function createClaim({ text, domain = "general", freshnessSensitive = false } = {}) {
  const normalizedText = String(text || "").trim();
  if (!normalizedText) throw new Error("claim text required");
  return Object.freeze({
    id: `claim-${hashObject({ text: normalizedText, domain }).slice(0, 20)}`,
    text: normalizedText,
    domain: String(domain),
    freshnessSensitive: Boolean(freshnessSensitive),
    evidence: Object.freeze([])
  });
}

function addEvidence(claim, item) {
  if (!claim || !claim.id) throw new Error("claim required");
  const evidence = normalizeEvidence(item);
  const deduped = claim.evidence.filter(row => row.id !== evidence.id);
  return Object.freeze({ ...claim, evidence: Object.freeze([...deduped, evidence]) });
}

function assessClaim(claim) {
  if (!claim || !Array.isArray(claim.evidence)) throw new Error("claim required");
  let support = 0;
  let contradict = 0;
  let verifiedCount = 0;
  for (const row of claim.evidence) {
    const weight = clamp01(row.sourceTrust) * (row.verified ? 1 : 0.45);
    if (row.verified) verifiedCount += 1;
    if (row.stance === "CONTRADICT") contradict += weight;
    else support += weight;
  }
  const total = support + contradict;
  const confidence = total > 0 ? Math.abs(support - contradict) / total : 0;
  const contradiction = support > 0 && contradict > 0;
  const status = total === 0 ? "UNVERIFIED"
    : contradiction && confidence < 0.45 ? "CONTESTED"
      : support > contradict ? "SUPPORTED" : "CONTRADICTED";
  return Object.freeze({
    status,
    confidence: clamp01(confidence),
    contradiction,
    verifiedEvidence: verifiedCount,
    needsMoreEvidence: status === "UNVERIFIED" || status === "CONTESTED" || (claim.freshnessSensitive && verifiedCount < 2)
  });
}

function createMission({ id, goal, tasks = [], budget = {} } = {}) {
  const missionId = String(id || `mission-${hashObject({ goal, tasks }).slice(0, 16)}`);
  if (!String(goal || "").trim()) throw new Error("mission goal required");
  const normalized = tasks.map((task, index) => Object.freeze({
    id: String(task.id || `task-${index + 1}`),
    title: String(task.title || task.id || `Task ${index + 1}`),
    dependsOn: Object.freeze([...(task.dependsOn || [])].map(String)),
    status: task.status || "PENDING",
    cost: Math.max(0, Number(task.cost) || 0),
    definitionOfDone: String(task.definitionOfDone || "")
  }));
  const ids = new Set(normalized.map(task => task.id));
  if (ids.size !== normalized.length) throw new Error("duplicate mission task id");
  for (const task of normalized) {
    for (const dep of task.dependsOn) if (!ids.has(dep)) throw new Error(`unknown dependency: ${dep}`);
  }
  const visit = new Set();
  const done = new Set();
  const byId = new Map(normalized.map(task => [task.id, task]));
  function dfs(id) {
    if (done.has(id)) return;
    if (visit.has(id)) throw new Error("mission dependency cycle");
    visit.add(id);
    for (const dep of byId.get(id).dependsOn) dfs(dep);
    visit.delete(id);
    done.add(id);
  }
  for (const task of normalized) dfs(task.id);
  return Object.freeze({
    id: missionId,
    goal: String(goal),
    tasks: Object.freeze(normalized),
    budget: Object.freeze({ maxCost: Number.isFinite(Number(budget.maxCost)) ? Math.max(0, Number(budget.maxCost)) : Infinity })
  });
}

function nextMissionTasks(mission) {
  const completed = new Set(mission.tasks.filter(task => task.status === "DONE").map(task => task.id));
  const spent = mission.tasks.filter(task => task.status === "DONE").reduce((sum, task) => sum + task.cost, 0);
  const available = Math.max(0, mission.budget.maxCost - spent);
  return mission.tasks.filter(task => task.status === "PENDING" && task.cost <= available && task.dependsOn.every(dep => completed.has(dep)));
}

function updateMissionTask(mission, taskId, status) {
  const allowed = new Set(["PENDING", "RUNNING", "DONE", "FAILED", "BLOCKED"]);
  if (!allowed.has(status)) throw new Error("invalid mission status");
  let found = false;
  const tasks = mission.tasks.map(task => {
    if (task.id !== taskId) return task;
    found = true;
    if (status === "DONE" && task.dependsOn.some(dep => mission.tasks.find(t => t.id === dep).status !== "DONE")) {
      throw new Error("cannot complete task before dependencies");
    }
    return Object.freeze({ ...task, status });
  });
  if (!found) throw new Error("mission task not found");
  return Object.freeze({ ...mission, tasks: Object.freeze(tasks) });
}

function distillSkill({ name, trigger, procedure, knownFailures = [], provenance = [], evalResult } = {}) {
  if (!name || !trigger || !Array.isArray(procedure) || procedure.length === 0) throw new Error("skill fields required");
  if (!evalResult || evalResult.verified !== true || clamp01(evalResult.score) < 0.8) throw new Error("skill requires verified eval score >= 0.8");
  if (!Array.isArray(provenance) || provenance.length === 0) throw new Error("skill provenance required");
  const body = {
    name: String(name),
    trigger: String(trigger),
    procedure: procedure.map(String),
    knownFailures: knownFailures.map(String),
    provenance: provenance.map(String),
    evalScore: clamp01(evalResult.score),
    verifier: String(evalResult.verifier || "seven-evals")
  };
  return Object.freeze({ id: `skill-${hashObject(body).slice(0, 20)}`, ...body, active: false });
}

function activateSkill(skill, gate = {}) {
  if (!skill || !skill.id) throw new Error("skill required");
  if (gate.verified !== true || gate.regressionFree !== true || gate.provenanceValid !== true) throw new Error("skill activation gate failed");
  return Object.freeze({ ...skill, active: true, activatedBy: String(gate.verifier || "seven-evals") });
}

function recordRouteOutcome(state = {}, outcome = {}) {
  if (outcome.verified !== true) return state;
  const taskClass = String(outcome.taskClass || "general");
  const modelId = String(outcome.modelId || "");
  if (!modelId) throw new Error("modelId required");
  const reward = clamp01(outcome.reward);
  const key = `${taskClass}::${modelId}`;
  const current = state[key] || { count: 0, mean: 0, failures: 0 };
  const nextCount = current.count + 1;
  const mean = current.mean + (reward - current.mean) / nextCount;
  return Object.freeze({
    ...state,
    [key]: Object.freeze({ count: nextCount, mean, failures: current.failures + (outcome.success === false ? 1 : 0) })
  });
}

function chooseRoute(state = {}, { taskClass = "general", candidates = [] } = {}) {
  if (!Array.isArray(candidates) || candidates.length === 0) throw new Error("route candidates required");
  const scored = candidates.map(candidate => {
    const modelId = String(candidate.modelId || candidate.id || "");
    const row = state[`${taskClass}::${modelId}`] || { count: 0, mean: 0.5, failures: 0 };
    const reliabilityPenalty = row.count ? row.failures / row.count * 0.25 : 0;
    const exploration = 1 / Math.sqrt(row.count + 1) * 0.08;
    const policyBias = clamp01(candidate.policyScore == null ? 0.5 : candidate.policyScore) * 0.15;
    return { modelId, score: row.mean - reliabilityPenalty + exploration + policyBias, history: row };
  }).sort((a, b) => b.score - a.score || a.modelId.localeCompare(b.modelId));
  return Object.freeze({ selected: scored[0].modelId, ranking: Object.freeze(scored) });
}

function trustLabel(label) {
  if (!(label in TRUST)) throw new Error(`unknown trust label: ${label}`);
  return TRUST[label];
}

function propagateTrust(inputs = [], transformation = {}) {
  if (!Array.isArray(inputs) || inputs.length === 0) throw new Error("trust inputs required");
  const minimum = Math.min(...inputs.map(item => trustLabel(item.trust)));
  const requested = transformation.outputTrust ? trustLabel(transformation.outputTrust) : minimum;
  const authority = Math.min(minimum, requested);
  const trust = Object.keys(TRUST).find(key => TRUST[key] === authority);
  return Object.freeze({
    trust,
    authority,
    tainted: authority <= TRUST.EXTERNAL,
    sources: Object.freeze(inputs.map(item => String(item.id || item.source || "unknown")))
  });
}

function canInfluenceAuthority(flow, requiredTrust = "USER") {
  if (!flow) return false;
  return Number(flow.authority) >= trustLabel(requiredTrust) && flow.tainted !== true;
}

async function runAdversarialArena({ candidate, critic, attacker, judge } = {}) {
  if (!candidate) throw new Error("candidate required");
  for (const [name, fn] of Object.entries({ critic, attacker, judge })) if (typeof fn !== "function") throw new Error(`${name} required`);
  const critique = await critic(candidate);
  const attacks = await attacker(candidate, critique);
  const verdict = await judge(candidate, critique, attacks);
  const criticalFindings = [...(critique && critique.findings || []), ...(attacks && attacks.findings || [])]
    .filter(item => String(item.severity || "").toUpperCase() === "CRITICAL");
  const passed = verdict && verdict.verified === true && verdict.pass === true && criticalFindings.length === 0;
  return Object.freeze({
    passed,
    critique,
    attacks,
    verdict,
    criticalFindings: Object.freeze(criticalFindings),
    evidenceId: `arena-${hashObject({ candidate, critique, attacks, verdict }).slice(0, 20)}`
  });
}

function buildCognitiveDecision({ task, claims = [], mission, routeState = {}, routeCandidates = [], trustInputs = [] } = {}) {
  const compute = allocateCompute(task || {});
  const claimAssessments = claims.map(claim => ({ id: claim.id, assessment: assessClaim(claim) }));
  const truthBlocked = claimAssessments.some(row => row.assessment.status === "CONTESTED" && row.assessment.confidence < 0.35);
  const route = routeCandidates.length ? chooseRoute(routeState, { taskClass: task && task.taskClass || "general", candidates: routeCandidates }) : null;
  const readyTasks = mission ? nextMissionTasks(mission) : [];
  const trust = trustInputs.length ? propagateTrust(trustInputs) : null;
  return Object.freeze({
    compute,
    claimAssessments: Object.freeze(claimAssessments),
    truthBlocked,
    route,
    readyTasks: Object.freeze(readyTasks),
    trust,
    mayUseAuthorityTools: trust ? canInfluenceAuthority(trust, "USER") && !truthBlocked : !truthBlocked
  });
}

module.exports = {
  COMPUTE_TIERS,
  TRUST,
  clamp01,
  allocateCompute,
  normalizeEvidence,
  createClaim,
  addEvidence,
  assessClaim,
  createMission,
  nextMissionTasks,
  updateMissionTask,
  distillSkill,
  activateSkill,
  recordRouteOutcome,
  chooseRoute,
  propagateTrust,
  canInfluenceAuthority,
  runAdversarialArena,
  buildCognitiveDecision
};
