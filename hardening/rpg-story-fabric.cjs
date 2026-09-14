"use strict";

const crypto = require("crypto");

const WORLD_OP = Object.freeze({
  SET_ATTRIBUTE: "SET_ATTRIBUTE",
  ADJUST_RESOURCE: "ADJUST_RESOURCE",
  MOVE_ENTITY: "MOVE_ENTITY",
  ADD_KNOWLEDGE: "ADD_KNOWLEDGE",
  SET_RELATIONSHIP: "SET_RELATIONSHIP",
  TRANSITION_QUEST: "TRANSITION_QUEST"
});
const STORY_MODE = Object.freeze({ COAUTHOR: "COAUTHOR", DIRECTOR: "DIRECTOR", EDITOR: "EDITOR" });
const PROMISE_STATE = Object.freeze({
  PLANTED: "PLANTED", ACTIVE: "ACTIVE", ESCALATING: "ESCALATING", DEFERRED: "DEFERRED",
  PAID_OFF: "PAID_OFF", SUBVERTED: "SUBVERTED", ABANDONED_EXPLICITLY: "ABANDONED_EXPLICITLY"
});
const ARC_STATE = Object.freeze({ PLANNED: "PLANNED", ACTIVE: "ACTIVE", PRESSURED: "PRESSURED", CHANGED: "CHANGED", COMPLETE: "COMPLETE" });
const FINDING_SEVERITY = Object.freeze({ INFO: "INFO", MINOR: "MINOR", MAJOR: "MAJOR", CRITICAL: "CRITICAL" });
const NODE_LEVELS = Object.freeze(["WORK", "PART", "ARC", "CHAPTER", "SEQUENCE", "SCENE", "BEAT"]);

function arr(v) { return Array.isArray(v) ? v : []; }
function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function canonical(v) {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  return `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}`;
}
function hash(v) { return crypto.createHash("sha256").update(canonical(v)).digest("hex"); }
function req(v, name) { const s = String(v ?? "").trim(); if (!s) throw new Error(`${name} required`); return s; }
function integer(v, name, min = 0) { const n = Number(v); if (!Number.isInteger(n) || n < min) throw new Error(`${name} must be integer >= ${min}`); return n; }
function finite(v, name) { const n = Number(v); if (!Number.isFinite(n)) throw new Error(`${name} must be finite`); return n; }
function uniqueStrings(values, name) {
  const out = arr(values).map(v => req(v, name));
  if (new Set(out).size !== out.length) throw new Error(`${name} contains duplicates`);
  return out;
}
function id(prefix, payload) { return `${prefix}-${hash(payload).slice(0, 20)}`; }
function freeze(value) { return Object.freeze(value); }

function normalizeEntity(raw = {}) {
  const entityId = req(raw.id, "entity.id");
  const resources = {};
  for (const [key, value] of Object.entries(raw.resources || {})) {
    const n = finite(value, `resource.${key}`);
    if (n < 0) throw new Error("initial resources cannot be negative");
    resources[key] = n;
  }
  return {
    id: entityId,
    kind: req(raw.kind || "ENTITY", "entity.kind").toUpperCase(),
    isPlayer: raw.isPlayer === true,
    attributes: clone(raw.attributes || {}),
    resources,
    locationId: raw.locationId == null ? null : String(raw.locationId),
    knowledge: {},
    relationships: {},
    quests: {},
    goals: uniqueStrings(raw.goals || [], "entity.goal")
  };
}

function createWorldDefinition(input = {}) {
  const entities = arr(input.entities).map(normalizeEntity);
  if (!entities.length) throw new Error("world requires entities");
  const entityIds = new Set();
  for (const entity of entities) {
    if (entityIds.has(entity.id)) throw new Error("duplicate entity id");
    entityIds.add(entity.id);
  }
  const locations = uniqueStrings(input.locations || [], "location");
  const locationSet = new Set(locations);
  for (const entity of entities) if (entity.locationId && !locationSet.has(entity.locationId)) throw new Error("entity location is unknown");
  const relationshipDimensions = uniqueStrings(input.relationshipDimensions || [], "relationship dimension");
  const questDefinitions = arr(input.quests).map(q => ({
    id: req(q.id, "quest.id"),
    states: uniqueStrings(q.states || ["OPEN", "COMPLETE"], "quest.state"),
    initialState: req(q.initialState || (q.states && q.states[0]) || "OPEN", "quest.initialState"),
    transitions: arr(q.transitions).map(t => ({ from: req(t.from, "quest.from"), to: req(t.to, "quest.to") }))
  }));
  const questIds = new Set();
  for (const q of questDefinitions) {
    if (questIds.has(q.id)) throw new Error("duplicate quest id");
    questIds.add(q.id);
    if (!q.states.includes(q.initialState)) throw new Error("quest initial state unknown");
    for (const t of q.transitions) if (!q.states.includes(t.from) || !q.states.includes(t.to)) throw new Error("quest transition state unknown");
  }
  const payload = {
    id: req(input.id, "world.id"), version: req(input.version || "1", "world.version"),
    principal: req(input.principal, "world.principal"), entities, locations,
    relationshipDimensions, questDefinitions,
    invariants: uniqueStrings(input.invariants || [], "world.invariant")
  };
  return freeze({ schemaVersion: 1, ...payload, definitionHash: hash(payload) });
}

function initialState(definition) {
  const entities = {};
  for (const entity of definition.entities) {
    const next = clone(entity);
    for (const quest of definition.questDefinitions) next.quests[quest.id] = quest.initialState;
    entities[next.id] = next;
  }
  return { entities, facts: {}, narrativeCommitments: {}, clock: 0 };
}

function createWorldSession(definition, input = {}) {
  if (!definition?.definitionHash) throw new Error("WorldDefinition required");
  const branch = {
    id: req(input.branchId || "main", "branch.id"),
    parentId: input.parentBranchId == null ? null : String(input.parentBranchId),
    divergenceRevision: input.divergenceRevision == null ? null : integer(input.divergenceRevision, "branch.divergenceRevision", 0)
  };
  const rngSeed = integer(input.rngSeed ?? 1, "rngSeed", 1) >>> 0;
  const payload = { worldId: definition.id, definitionHash: definition.definitionHash, principal: definition.principal, branch, rngSeed };
  return freeze({
    schemaVersion: 1,
    id: input.id || id("ws", payload),
    worldId: definition.id,
    definitionHash: definition.definitionHash,
    principal: definition.principal,
    branch,
    revision: 0,
    state: initialState(definition),
    events: [],
    eventHeadHash: null,
    rngState: rngSeed,
    createdAt: input.createdAt || null
  });
}

function verifySessionBoundary(definition, session) {
  if (!definition?.definitionHash || !session?.id) throw new Error("definition/session required");
  if (session.worldId !== definition.id || session.definitionHash !== definition.definitionHash) throw new Error("world definition drift");
  if (session.principal !== definition.principal) throw new Error("world principal drift");
  return true;
}

function entityAt(session, entityId) {
  const entity = session?.state?.entities?.[entityId];
  if (!entity) throw new Error(`unknown entity: ${entityId}`);
  return entity;
}

function createPlayerAction(definition, session, input = {}) {
  verifySessionBoundary(definition, session);
  const actorId = req(input.actorId, "playerAction.actorId");
  const actor = entityAt(session, actorId);
  if (!actor.isPlayer) throw new Error("PlayerAction actor is not player-controlled");
  const source = req(input.source, "playerAction.source").toUpperCase();
  if (source !== "USER") throw new Error("irreversible player action requires USER source");
  const payload = {
    sessionId: session.id, branchId: session.branch.id, baseRevision: session.revision,
    actorId, action: req(input.action, "playerAction.action"), args: clone(input.args || {}), source
  };
  return freeze({ schemaVersion: 1, id: input.id || id("pa", payload), ...payload, actionHash: hash(payload) });
}

function normalizeOperation(definition, session, op, index) {
  const type = req(op.type, `operation[${index}].type`).toUpperCase();
  if (!Object.values(WORLD_OP).includes(type)) throw new Error(`unsupported world operation: ${type}`);
  const entityId = req(op.entityId, `operation[${index}].entityId`);
  entityAt(session, entityId);
  if (type === WORLD_OP.SET_ATTRIBUTE) return { type, entityId, key: req(op.key, "attribute key"), value: clone(op.value) };
  if (type === WORLD_OP.ADJUST_RESOURCE) return { type, entityId, resource: req(op.resource, "resource"), delta: finite(op.delta, "resource delta") };
  if (type === WORLD_OP.MOVE_ENTITY) {
    const locationId = req(op.locationId, "locationId");
    if (!definition.locations.includes(locationId)) throw new Error("unknown destination location");
    return { type, entityId, locationId };
  }
  if (type === WORLD_OP.ADD_KNOWLEDGE) {
    return { type, entityId, factId: req(op.factId, "factId"), value: clone(op.value), sourceEventId: op.sourceEventId == null ? null : String(op.sourceEventId) };
  }
  if (type === WORLD_OP.SET_RELATIONSHIP) {
    const targetId = req(op.targetId, "relationship.targetId");
    entityAt(session, targetId);
    const dimension = req(op.dimension, "relationship.dimension");
    if (!definition.relationshipDimensions.includes(dimension)) throw new Error("unknown relationship dimension");
    return { type, entityId, targetId, dimension, value: finite(op.value, "relationship.value") };
  }
  const questId = req(op.questId, "questId");
  const quest = definition.questDefinitions.find(q => q.id === questId);
  if (!quest) throw new Error("unknown quest");
  const to = req(op.to, "quest.to");
  if (!quest.states.includes(to)) throw new Error("unknown quest target state");
  return { type, entityId, questId, to };
}

function createWorldDiffProposal(definition, session, input = {}) {
  verifySessionBoundary(definition, session);
  const operations = arr(input.operations).map((op, i) => normalizeOperation(definition, session, op, i));
  if (!operations.length) throw new Error("WorldDiffProposal requires operations");
  const playerActionId = input.playerAction?.id || null;
  if (input.playerAction) {
    if (input.playerAction.sessionId !== session.id || input.playerAction.branchId !== session.branch.id || input.playerAction.baseRevision !== session.revision) throw new Error("PlayerAction boundary mismatch");
  }
  const payload = {
    sessionId: session.id, worldId: session.worldId, branchId: session.branch.id,
    baseRevision: session.revision, operations, playerActionId,
    proposer: req(input.proposer || "model", "proposal.proposer")
  };
  return freeze({ schemaVersion: 1, id: input.id || id("wdp", payload), ...payload, proposalHash: hash(payload), grantsAuthority: false });
}

function questCanTransition(definition, questId, from, to) {
  const q = definition.questDefinitions.find(x => x.id === questId);
  if (!q) return false;
  if (from === to) return true;
  if (!q.transitions.length) return q.states.includes(from) && q.states.includes(to);
  return q.transitions.some(t => t.from === from && t.to === to);
}

function validateWorldDiff(definition, session, proposal, input = {}) {
  const issues = [];
  try { verifySessionBoundary(definition, session); } catch (error) { issues.push(error.message); }
  if (!proposal?.id || proposal.sessionId !== session.id || proposal.worldId !== session.worldId || proposal.branchId !== session.branch.id) issues.push("proposal boundary mismatch");
  if (proposal?.baseRevision !== session.revision) issues.push("stale world revision");
  const expectedHash = proposal ? hash({
    sessionId: proposal.sessionId, worldId: proposal.worldId, branchId: proposal.branchId,
    baseRevision: proposal.baseRevision, operations: proposal.operations, playerActionId: proposal.playerActionId,
    proposer: proposal.proposer
  }) : null;
  if (!proposal?.proposalHash || proposal.proposalHash !== expectedHash) issues.push("proposal integrity drift");

  const playerEntities = new Set(Object.values(session.state.entities).filter(e => e.isPlayer).map(e => e.id));
  const touchesPlayer = arr(proposal?.operations).some(op => playerEntities.has(op.entityId) && [WORLD_OP.SET_ATTRIBUTE, WORLD_OP.ADJUST_RESOURCE, WORLD_OP.MOVE_ENTITY, WORLD_OP.TRANSITION_QUEST].includes(op.type));
  if (touchesPlayer) {
    const action = input.playerAction;
    if (!action || action.id !== proposal.playerActionId || action.source !== "USER" || action.baseRevision !== session.revision || action.branchId !== session.branch.id) issues.push("player agency proof missing");
  }

  for (const op of arr(proposal?.operations)) {
    let entity;
    try { entity = entityAt(session, op.entityId); } catch (error) { issues.push(error.message); continue; }
    if (op.type === WORLD_OP.ADJUST_RESOURCE) {
      const current = Number(entity.resources[op.resource] || 0);
      if (current + op.delta < 0) issues.push(`negative resource: ${op.entityId}.${op.resource}`);
    }
    if (op.type === WORLD_OP.TRANSITION_QUEST) {
      const current = entity.quests[op.questId];
      if (!questCanTransition(definition, op.questId, current, op.to)) issues.push(`invalid quest transition: ${op.questId}`);
    }
  }

  for (const invariant of definition.invariants) {
    if (invariant === "NO_NEGATIVE_RESOURCES") continue;
    if (invariant === "PLAYER_AGENCY_LOCK") continue;
  }
  return freeze({ status: issues.length ? "BLOCKED" : "PASS", issues, proposalId: proposal?.id || null, baseRevision: session.revision });
}

function applyOperations(definition, state, operations, nextRevision, eventId) {
  const next = clone(state);
  for (const op of operations) {
    const entity = next.entities[op.entityId];
    if (op.type === WORLD_OP.SET_ATTRIBUTE) entity.attributes[op.key] = clone(op.value);
    else if (op.type === WORLD_OP.ADJUST_RESOURCE) entity.resources[op.resource] = Number(entity.resources[op.resource] || 0) + op.delta;
    else if (op.type === WORLD_OP.MOVE_ENTITY) entity.locationId = op.locationId;
    else if (op.type === WORLD_OP.ADD_KNOWLEDGE) entity.knowledge[op.factId] = { value: clone(op.value), learnedRevision: nextRevision, sourceEventId: op.sourceEventId || eventId };
    else if (op.type === WORLD_OP.SET_RELATIONSHIP) {
      entity.relationships[op.targetId] ||= {};
      entity.relationships[op.targetId][op.dimension] = { value: op.value, revision: nextRevision, eventId };
    } else if (op.type === WORLD_OP.TRANSITION_QUEST) entity.quests[op.questId] = op.to;
  }
  next.clock = nextRevision;
  return next;
}

function commitWorldDiff(definition, session, proposal, input = {}) {
  const validation = validateWorldDiff(definition, session, proposal, input);
  if (validation.status !== "PASS") return freeze({ status: "BLOCKED", validation, session });
  const revision = session.revision + 1;
  const eventPayload = {
    worldId: session.worldId, sessionId: session.id, branchId: session.branch.id, revision,
    proposalId: proposal.id, proposalHash: proposal.proposalHash, operations: proposal.operations,
    causalParents: uniqueStrings(input.causalParents || (session.events.length ? [session.events[session.events.length - 1].id] : []), "causal parent"),
    previousEventHash: session.eventHeadHash,
    playerActionId: proposal.playerActionId
  };
  const eventId = input.eventId || id("we", eventPayload);
  const event = freeze({ schemaVersion: 1, id: eventId, ...eventPayload, eventHash: hash({ ...eventPayload, id: eventId }) });
  const nextState = applyOperations(definition, session.state, proposal.operations, revision, eventId);
  const nextSession = freeze({ ...clone(session), revision, state: nextState, events: [...session.events, event], eventHeadHash: event.eventHash });
  return freeze({ status: "COMMITTED", event, session: nextSession, resultHash: hash({ eventHash: event.eventHash, revision }) });
}

function auditWorldSession(definition, session) {
  const issues = [];
  try { verifySessionBoundary(definition, session); } catch (error) { issues.push(error.message); }
  let previousHash = null;
  let previousRevision = 0;
  for (const event of arr(session.events)) {
    if (event.previousEventHash !== previousHash) issues.push(`event chain break: ${event.id}`);
    if (event.revision !== previousRevision + 1) issues.push(`event revision break: ${event.id}`);
    const payload = { ...event }; delete payload.eventHash; delete payload.schemaVersion;
    if (hash(payload) !== event.eventHash) issues.push(`event hash drift: ${event.id}`);
    previousHash = event.eventHash;
    previousRevision = event.revision;
  }
  if (session.revision !== previousRevision) issues.push("session revision/event ledger mismatch");
  if ((session.eventHeadHash || null) !== (previousHash || null)) issues.push("event head mismatch");
  return freeze({ status: issues.length ? "FAIL" : "PASS", issues, revision: session.revision, eventCount: session.events.length });
}

function createWorldSnapshot(definition, session) {
  verifySessionBoundary(definition, session);
  const payload = { worldId: session.worldId, sessionId: session.id, branch: session.branch, revision: session.revision, eventHeadHash: session.eventHeadHash, state: session.state, rngState: session.rngState };
  return freeze({ schemaVersion: 1, id: id("snap", payload), ...clone(payload), snapshotHash: hash(payload), authoritativeSource: "EVENT_LEDGER" });
}

function forkWorldSession(definition, session, input = {}) {
  verifySessionBoundary(definition, session);
  const branchId = req(input.branchId, "branchId");
  if (branchId === session.branch.id) throw new Error("branch id must differ");
  const payload = { parent: session.branch.id, branchId, revision: session.revision, eventHeadHash: session.eventHeadHash };
  return freeze({
    ...clone(session),
    id: input.id || id("ws", { sessionId: session.id, ...payload }),
    branch: { id: branchId, parentId: session.branch.id, divergenceRevision: session.revision },
    events: session.events.slice(),
    forkHash: hash(payload)
  });
}

function nextRng(session) {
  let x = session.rngState >>> 0;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
  const value = x / 0x100000000;
  return freeze({ value, nextState: x, receipt: hash({ sessionId: session.id, branchId: session.branch.id, revision: session.revision, prior: session.rngState, next: x }) });
}

function withRngState(session, rngReceipt) {
  if (!rngReceipt || !Number.isInteger(rngReceipt.nextState)) throw new Error("RNG receipt required");
  return freeze({ ...clone(session), rngState: rngReceipt.nextState >>> 0 });
}

function knowledgeView(session, actorId, atRevision = session.revision) {
  const actor = entityAt(session, actorId);
  const revision = integer(atRevision, "knowledge revision", 0);
  const facts = {};
  for (const [factId, record] of Object.entries(actor.knowledge || {})) if (record.learnedRevision <= revision) facts[factId] = clone(record);
  return freeze({ actorId, revision, facts, viewHash: hash({ actorId, revision, facts }) });
}

function relationshipView(session, actorId, targetId) {
  const actor = entityAt(session, actorId); entityAt(session, targetId);
  const dimensions = clone(actor.relationships?.[targetId] || {});
  return freeze({ actorId, targetId, revision: session.revision, dimensions, viewHash: hash({ actorId, targetId, revision: session.revision, dimensions }) });
}

function createStoryContract(input = {}) {
  const mode = req(input.mode || STORY_MODE.DIRECTOR, "story.mode").toUpperCase();
  if (!Object.values(STORY_MODE).includes(mode)) throw new Error("invalid story mode");
  const payload = {
    id: req(input.id, "story.id"),
    principal: req(input.principal, "story.principal"),
    worldSessionId: req(input.worldSessionId, "story.worldSessionId"),
    branchId: req(input.branchId, "story.branchId"),
    worldRevision: integer(input.worldRevision, "story.worldRevision", 0),
    mode,
    medium: req(input.medium || "SCENE", "story.medium").toUpperCase(),
    povPolicy: input.povPolicy == null ? null : String(input.povPolicy),
    tense: input.tense == null ? null : String(input.tense),
    userIntent: req(input.userIntent, "story.userIntent"),
    protectedFacts: uniqueStrings(input.protectedFacts || [], "protected fact"),
    forbiddenChanges: uniqueStrings(input.forbiddenChanges || [], "forbidden change"),
    requiredBeats: uniqueStrings(input.requiredBeats || [], "required beat"),
    spoilerBoundary: input.spoilerBoundary == null ? null : String(input.spoilerBoundary)
  };
  return freeze({ schemaVersion: 1, ...payload, contractHash: hash(payload), grantsWorldAuthority: false });
}

function verifyStoryWorldBinding(contract, session) {
  if (!contract?.contractHash || !session?.id) throw new Error("StoryContract and WorldSession required");
  if (contract.worldSessionId !== session.id || contract.branchId !== session.branch.id) throw new Error("story/world branch mismatch");
  if (contract.worldRevision !== session.revision) throw new Error("story/world revision drift");
  if (contract.principal !== session.principal) throw new Error("story/world principal mismatch");
  return true;
}

function createNarrativeLedger(contract) {
  if (!contract?.contractHash) throw new Error("StoryContract required");
  const payload = { contractId: contract.id, contractHash: contract.contractHash, branchId: contract.branchId };
  return freeze({ schemaVersion: 1, id: id("nl", payload), ...payload, revision: 0, arcs: {}, promises: {}, readerKnowledge: {}, motifs: {}, ledgerHash: hash({ ...payload, revision: 0, arcs: {}, promises: {}, readerKnowledge: {}, motifs: {} }) });
}

function updateLedger(ledger, changes) {
  const next = { ...clone(ledger), ...clone(changes), revision: ledger.revision + 1 };
  const payload = { contractId: next.contractId, contractHash: next.contractHash, branchId: next.branchId, revision: next.revision, arcs: next.arcs, promises: next.promises, readerKnowledge: next.readerKnowledge, motifs: next.motifs };
  next.ledgerHash = hash(payload);
  return freeze(next);
}

function addArc(ledger, input = {}) {
  const arcId = req(input.id, "arc.id");
  if (ledger.arcs[arcId]) throw new Error("duplicate arc");
  const arc = { id: arcId, subjectId: req(input.subjectId, "arc.subjectId"), startCondition: req(input.startCondition, "arc.startCondition"), desiredChange: req(input.desiredChange, "arc.desiredChange"), state: ARC_STATE.PLANNED, evidenceEventIds: [] };
  return updateLedger(ledger, { arcs: { ...ledger.arcs, [arcId]: arc } });
}

function advanceArc(ledger, input = {}) {
  const arcId = req(input.arcId, "arcId"), arc = ledger.arcs[arcId];
  if (!arc) throw new Error("unknown arc");
  const state = req(input.state, "arc.state").toUpperCase();
  if (!Object.values(ARC_STATE).includes(state)) throw new Error("invalid arc state");
  const evidenceEventIds = uniqueStrings(input.evidenceEventIds || [], "arc evidence");
  if ([ARC_STATE.CHANGED, ARC_STATE.COMPLETE].includes(state) && !evidenceEventIds.length) throw new Error("earned arc change requires event evidence");
  const nextArc = { ...clone(arc), state, evidenceEventIds: [...new Set([...arc.evidenceEventIds, ...evidenceEventIds])] };
  return updateLedger(ledger, { arcs: { ...ledger.arcs, [arcId]: nextArc } });
}

function addPromise(ledger, input = {}) {
  const promiseId = req(input.id, "promise.id");
  if (ledger.promises[promiseId]) throw new Error("duplicate promise");
  const promise = { id: promiseId, setupNodeId: req(input.setupNodeId, "promise.setupNodeId"), description: req(input.description, "promise.description"), state: PROMISE_STATE.PLANTED, payoffNodeId: null, lineage: [req(input.setupNodeId, "promise.setupNodeId")] };
  return updateLedger(ledger, { promises: { ...ledger.promises, [promiseId]: promise } });
}

function transitionPromise(ledger, input = {}) {
  const promiseId = req(input.promiseId, "promiseId"), promise = ledger.promises[promiseId];
  if (!promise) throw new Error("unknown promise");
  const state = req(input.state, "promise.state").toUpperCase();
  if (!Object.values(PROMISE_STATE).includes(state)) throw new Error("invalid promise state");
  let payoffNodeId = promise.payoffNodeId;
  if ([PROMISE_STATE.PAID_OFF, PROMISE_STATE.SUBVERTED].includes(state)) payoffNodeId = req(input.payoffNodeId, "promise.payoffNodeId");
  const nextPromise = { ...clone(promise), state, payoffNodeId, lineage: payoffNodeId ? [...promise.lineage, payoffNodeId] : promise.lineage.slice() };
  return updateLedger(ledger, { promises: { ...ledger.promises, [promiseId]: nextPromise } });
}

function revealToReader(ledger, input = {}) {
  const factId = req(input.factId, "reveal.factId");
  if (ledger.readerKnowledge[factId]) throw new Error("reader already knows fact");
  const sourceNodeId = req(input.sourceNodeId, "reveal.sourceNodeId");
  return updateLedger(ledger, { readerKnowledge: { ...ledger.readerKnowledge, [factId]: { factId, sourceNodeId, revision: ledger.revision + 1 } } });
}

function createStoryGraph(contract) {
  if (!contract?.contractHash) throw new Error("StoryContract required");
  return freeze({ schemaVersion: 1, contractId: contract.id, branchId: contract.branchId, nodes: {}, graphRevision: 0, graphHash: hash({ contractId: contract.id, branchId: contract.branchId, nodes: {}, graphRevision: 0 }) });
}

function addStoryNode(graph, input = {}) {
  const nodeId = req(input.id, "storyNode.id");
  if (graph.nodes[nodeId]) throw new Error("duplicate story node");
  const level = req(input.level, "storyNode.level").toUpperCase();
  const levelIndex = NODE_LEVELS.indexOf(level);
  if (levelIndex < 0) throw new Error("invalid story node level");
  const parentId = input.parentId == null ? null : String(input.parentId);
  if (parentId) {
    const parent = graph.nodes[parentId];
    if (!parent) throw new Error("unknown story node parent");
    const parentIndex = NODE_LEVELS.indexOf(parent.level);
    if (parentIndex >= levelIndex) throw new Error("story hierarchy cannot move upward or sideways");
  } else if (level !== "WORK") throw new Error("non-WORK story node requires parent");
  const dependencies = uniqueStrings(input.dependencies || [], "story dependency");
  for (const dep of dependencies) if (!graph.nodes[dep]) throw new Error("unknown story dependency");
  if (dependencies.includes(nodeId)) throw new Error("story node cannot depend on itself");
  const node = {
    id: nodeId, level, parentId, purpose: req(input.purpose, "storyNode.purpose"), dependencies,
    requiredFacts: uniqueStrings(input.requiredFacts || [], "node required fact"),
    forbiddenFacts: uniqueStrings(input.forbiddenFacts || [], "node forbidden fact"),
    intendedChange: input.intendedChange == null ? null : String(input.intendedChange),
    threadIds: uniqueStrings(input.threadIds || [], "node thread")
  };
  const nodes = { ...graph.nodes, [nodeId]: node };
  const next = { ...clone(graph), nodes, graphRevision: graph.graphRevision + 1 };
  next.graphHash = hash({ contractId: next.contractId, branchId: next.branchId, nodes, graphRevision: next.graphRevision });
  return freeze(next);
}

function createSceneContract(definition, session, storyContract, ledger, graph, input = {}) {
  verifySessionBoundary(definition, session);
  verifyStoryWorldBinding(storyContract, session);
  if (ledger.contractId !== storyContract.id || ledger.branchId !== session.branch.id) throw new Error("narrative ledger boundary mismatch");
  if (graph.contractId !== storyContract.id || graph.branchId !== session.branch.id) throw new Error("story graph boundary mismatch");
  const participants = uniqueStrings(input.participants || [], "scene participant");
  participants.forEach(actorId => entityAt(session, actorId));
  const povActorId = input.povActorId == null ? null : String(input.povActorId);
  if (povActorId && !participants.includes(povActorId)) throw new Error("POV actor must participate in scene");
  const knowledge = {};
  for (const actorId of participants) knowledge[actorId] = knowledgeView(session, actorId);
  const activePromises = Object.values(ledger.promises).filter(p => ![PROMISE_STATE.PAID_OFF, PROMISE_STATE.SUBVERTED, PROMISE_STATE.ABANDONED_EXPLICITLY].includes(p.state)).map(p => p.id);
  const activeArcs = Object.values(ledger.arcs).filter(a => a.state !== ARC_STATE.COMPLETE).map(a => a.id);
  const nodeIds = uniqueStrings(input.nodeIds || [], "scene node");
  for (const nodeId of nodeIds) if (!graph.nodes[nodeId]) throw new Error("scene references unknown story node");
  const payload = {
    storyId: storyContract.id, worldSessionId: session.id, branchId: session.branch.id, worldRevision: session.revision,
    locationId: input.locationId == null ? null : String(input.locationId), time: input.time == null ? null : String(input.time),
    participants, povActorId, purpose: req(input.purpose, "scene.purpose"), nodeIds,
    activePromises, activeArcs, permittedRevealFactIds: uniqueStrings(input.permittedRevealFactIds || [], "permitted reveal"),
    requiredFacts: uniqueStrings(input.requiredFacts || [], "scene required fact"),
    forbiddenFacts: uniqueStrings([...(storyContract.forbiddenChanges || []), ...(input.forbiddenFacts || [])], "scene forbidden fact"),
    knowledgeHashes: Object.fromEntries(Object.entries(knowledge).map(([k, v]) => [k, v.viewHash]))
  };
  if (payload.locationId && !definition.locations.includes(payload.locationId)) throw new Error("scene location unknown");
  return freeze({ schemaVersion: 1, id: input.id || id("sc", payload), ...payload, knowledge, sceneHash: hash(payload), grantsWorldAuthority: false });
}

function createBeatPlan(scene, input = {}) {
  if (!scene?.sceneHash) throw new Error("SceneContract required");
  const beats = arr(input.beats).map((beat, index) => ({
    id: req(beat.id || `beat-${index}`, "beat.id"),
    intent: req(beat.intent, "beat.intent"),
    pressure: beat.pressure == null ? null : String(beat.pressure),
    response: req(beat.response, "beat.response"),
    changedLocalCondition: req(beat.changedLocalCondition, "beat.changedLocalCondition"),
    playerActionRequired: beat.playerActionRequired === true
  }));
  if (!beats.length) throw new Error("BeatPlan requires beats");
  if (new Set(beats.map(b => b.id)).size !== beats.length) throw new Error("duplicate beat id");
  const payload = { sceneId: scene.id, sceneHash: scene.sceneHash, beats };
  return freeze({ schemaVersion: 1, id: input.id || id("bp", payload), ...payload, planHash: hash(payload) });
}

function createNarrativeArtifact(scene, beatPlan, input = {}) {
  if (!scene?.sceneHash || !beatPlan?.planHash) throw new Error("scene and beat plan required");
  if (beatPlan.sceneId !== scene.id || beatPlan.sceneHash !== scene.sceneHash) throw new Error("beat plan/scene mismatch");
  const text = String(input.text ?? "");
  const claimedFacts = uniqueStrings(input.claimedFacts || [], "artifact claimed fact");
  for (const fact of scene.forbiddenFacts) if (claimedFacts.includes(fact)) throw new Error(`artifact claims forbidden fact: ${fact}`);
  const inventedPlayerActions = arr(input.inventedPlayerActions).map(String).filter(Boolean);
  if (inventedPlayerActions.length) throw new Error("narrative artifact may not invent player actions");
  const payload = {
    sceneId: scene.id, sceneHash: scene.sceneHash, beatPlanId: beatPlan.id, beatPlanHash: beatPlan.planHash,
    worldSessionId: scene.worldSessionId, branchId: scene.branchId, worldRevision: scene.worldRevision,
    textHash: hash(text), claimedFacts, revealedFactIds: uniqueStrings(input.revealedFactIds || [], "revealed fact")
  };
  for (const fact of payload.revealedFactIds) if (!scene.permittedRevealFactIds.includes(fact)) throw new Error(`unpermitted reveal: ${fact}`);
  return freeze({ schemaVersion: 1, id: input.id || id("na", payload), ...payload, text, artifactHash: hash(payload), grantsWorldAuthority: false, worldDiffCommitted: false });
}

function createStoryCriticFinding(input = {}) {
  const severity = req(input.severity || "MINOR", "finding.severity").toUpperCase();
  if (!Object.values(FINDING_SEVERITY).includes(severity)) throw new Error("invalid finding severity");
  const payload = {
    artifactId: req(input.artifactId, "finding.artifactId"),
    critic: req(input.critic, "finding.critic"), severity,
    code: req(input.code, "finding.code"), evidenceAnchor: req(input.evidenceAnchor, "finding.evidenceAnchor"),
    repairSuggestion: input.repairSuggestion == null ? null : String(input.repairSuggestion)
  };
  return freeze({ schemaVersion: 1, id: input.id || id("sf", payload), ...payload, findingHash: hash(payload), grantsWorldAuthority: false });
}

function createNarrativeReview(input = {}) {
  const artifact = input.artifact;
  if (!artifact?.artifactHash) throw new Error("NarrativeArtifact required");
  const findings = arr(input.findings);
  for (const finding of findings) if (finding.artifactId !== artifact.id) throw new Error("foreign critic finding");
  const blockers = findings.filter(f => [FINDING_SEVERITY.CRITICAL, FINDING_SEVERITY.MAJOR].includes(f.severity));
  const continuityEvidenceIds = uniqueStrings(input.continuityEvidenceIds || [], "continuity evidence");
  const payload = { artifactId: artifact.id, artifactHash: artifact.artifactHash, findingIds: findings.map(f => f.id).sort(), continuityEvidenceIds, blockers: blockers.map(f => f.id).sort() };
  return freeze({ schemaVersion: 1, id: input.id || id("nr", payload), ...payload, status: blockers.length ? "REPAIR_REQUIRED" : "READY_FOR_JUDGE", reviewHash: hash(payload) });
}

function prepareWorldDiffHandoff(session, artifact, proposal, review, input = {}) {
  if (!session?.id || !artifact?.artifactHash || !proposal?.proposalHash || !review?.reviewHash) throw new Error("handoff inputs required");
  if (artifact.worldSessionId !== session.id || artifact.branchId !== session.branch.id || artifact.worldRevision !== session.revision) throw new Error("artifact/world drift");
  if (proposal.sessionId !== session.id || proposal.branchId !== session.branch.id || proposal.baseRevision !== session.revision) throw new Error("proposal/world drift");
  if (review.artifactId !== artifact.id || review.artifactHash !== artifact.artifactHash) throw new Error("review/artifact drift");
  if (review.status !== "READY_FOR_JUDGE") throw new Error("narrative review not ready");
  const judgeReceiptId = req(input.judgeReceiptId, "judgeReceiptId");
  const payload = { sessionId: session.id, branchId: session.branch.id, revision: session.revision, artifactId: artifact.id, artifactHash: artifact.artifactHash, proposalId: proposal.id, proposalHash: proposal.proposalHash, reviewId: review.id, reviewHash: review.reviewHash, judgeReceiptId };
  return freeze({ schemaVersion: 1, id: input.id || id("wh", payload), ...payload, handoffHash: hash(payload), status: "PROPOSED_NOT_COMMITTED", grantsWorldAuthority: false });
}

function storyCanCommitWorld() { return false; }
function storyGrantsPlayerAgency() { return false; }

module.exports = Object.freeze({
  WORLD_OP, STORY_MODE, PROMISE_STATE, ARC_STATE, FINDING_SEVERITY, NODE_LEVELS,
  createWorldDefinition, createWorldSession, verifySessionBoundary, entityAt,
  createPlayerAction, createWorldDiffProposal, validateWorldDiff, commitWorldDiff, auditWorldSession,
  createWorldSnapshot, forkWorldSession, nextRng, withRngState, knowledgeView, relationshipView,
  createStoryContract, verifyStoryWorldBinding, createNarrativeLedger, addArc, advanceArc,
  addPromise, transitionPromise, revealToReader, createStoryGraph, addStoryNode,
  createSceneContract, createBeatPlan, createNarrativeArtifact, createStoryCriticFinding,
  createNarrativeReview, prepareWorldDiffHandoff, storyCanCommitWorld, storyGrantsPlayerAgency,
  hash
});
