"use strict";

const crypto = require("crypto");

const SENSITIVITY = Object.freeze({ PUBLIC: 0, PRIVATE: 1, SENSITIVE: 2 });
const OBSERVATION_STATE = Object.freeze({ PROPOSED: "PROPOSED", VERIFIED: "VERIFIED", CONFLICT: "CONFLICT", UNRESOLVED: "UNRESOLVED" });
const STAGE = Object.freeze({ METADATA: "METADATA", OCR: "OCR", LAYOUT: "LAYOUT", TARGET_CROP: "TARGET_CROP", VLM: "VLM", SECOND_PASS: "SECOND_PASS", VALIDATE: "VALIDATE", HANDOFF: "HANDOFF" });

function asArray(v) { return Array.isArray(v) ? v : []; }
function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function canonical(v) {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  return `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}`;
}
function hash(v) { return crypto.createHash("sha256").update(canonical(v)).digest("hex"); }
function reqString(v, name) { const s = String(v || "").trim(); if (!s) throw new Error(`${name} required`); return s; }
function int(v, name, min = 0) { const n = Number(v); if (!Number.isInteger(n) || n < min) throw new Error(`${name} must be integer >= ${min}`); return n; }
function finite(v, name) { const n = Number(v); if (!Number.isFinite(n)) throw new Error(`${name} must be finite`); return n; }
function iso(v, name) { const s = reqString(v, name); if (!Number.isFinite(Date.parse(s))) throw new Error(`${name} must be ISO time`); return new Date(s).toISOString(); }
function sensitivity(v) { const s = String(v || "PRIVATE").toUpperCase(); if (!(s in SENSITIVITY)) throw new Error("invalid sensitivity"); return s; }
function normalizeBox(box = {}) {
  const x = finite(box.x, "box.x"), y = finite(box.y, "box.y"), width = finite(box.width, "box.width"), height = finite(box.height, "box.height");
  if (x < 0 || y < 0 || width <= 0 || height <= 0 || x + width > 1 || y + height > 1) throw new Error("box must be normalized within frame");
  return { x, y, width, height };
}
function visualId(prefix, payload) { return `${prefix}-${hash(payload).slice(0, 20)}`; }

function createVisualSource(input = {}) {
  const source = {
    schemaVersion: 1,
    id: reqString(input.id, "source.id"),
    principal: reqString(input.principal, "source.principal"),
    project: input.project ? String(input.project) : null,
    origin: reqString(input.origin, "source.origin"),
    originKind: reqString(input.originKind || "IMPORT", "source.originKind").toUpperCase(),
    sensitivity: sensitivity(input.sensitivity),
    createdAt: iso(input.createdAt || new Date().toISOString(), "source.createdAt"),
    ambient: input.ambient === true,
    metadata: clone(input.metadata || {})
  };
  if (source.ambient) throw new Error("ambient visual capture is not permitted");
  return Object.freeze(source);
}

function createVisualVersion(input = {}) {
  const source = input.source;
  if (!source || !source.id || !source.principal) throw new Error("visual version requires VisualSource");
  const contentHash = reqString(input.contentHash, "version.contentHash").toLowerCase();
  if (!/^[a-f0-9]{16,128}$/.test(contentHash)) throw new Error("version.contentHash must be hex digest");
  const width = int(input.width, "version.width", 1), height = int(input.height, "version.height", 1);
  const payload = { sourceId: source.id, contentHash, width, height, orientation: Number(input.orientation || 0), pageIndex: input.pageIndex ?? null, frameIndex: input.frameIndex ?? null };
  return Object.freeze({
    schemaVersion: 1,
    id: input.id || visualId("vv", payload),
    sourceId: source.id,
    principal: source.principal,
    project: source.project,
    sensitivity: source.sensitivity,
    contentHash,
    width,
    height,
    orientation: Number(input.orientation || 0),
    pageIndex: input.pageIndex == null ? null : int(input.pageIndex, "version.pageIndex", 0),
    frameIndex: input.frameIndex == null ? null : int(input.frameIndex, "version.frameIndex", 0),
    capturedAt: iso(input.capturedAt || source.createdAt, "version.capturedAt"),
    parentVersionId: null,
    transform: null,
    authoritativeOriginal: true,
    lineage: { sourceId: source.id, parents: [], transformation: "capture/import" }
  });
}

function deriveVisualVersion(parent, input = {}) {
  if (!parent || !parent.id || !parent.contentHash) throw new Error("derived version requires parent VisualVersion");
  const transform = clone(input.transform || {});
  const kind = reqString(transform.kind, "transform.kind").toUpperCase();
  if (!["CROP", "RESIZE", "ROTATE", "REDACT", "NORMALIZE"].includes(kind)) throw new Error("unsupported visual transform");
  const contentHash = reqString(input.contentHash, "derived.contentHash").toLowerCase();
  if (contentHash === parent.contentHash) throw new Error("derived representation must have distinct content hash");
  const width = int(input.width ?? parent.width, "derived.width", 1), height = int(input.height ?? parent.height, "derived.height", 1);
  const payload = { parent: parent.id, contentHash, width, height, transform };
  return Object.freeze({
    ...clone(parent),
    id: input.id || visualId("vv", payload), contentHash, width, height,
    parentVersionId: parent.id,
    authoritativeOriginal: false,
    transform,
    lineage: { sourceId: parent.sourceId, parents: [parent.id], transformation: kind }
  });
}

function createVisualFrame(version, input = {}) {
  if (!version || !version.id) throw new Error("frame requires VisualVersion");
  const sequence = int(input.sequence ?? version.frameIndex ?? 0, "frame.sequence", 0);
  const viewport = input.viewport ? { width: int(input.viewport.width, "viewport.width", 1), height: int(input.viewport.height, "viewport.height", 1), scale: finite(input.viewport.scale ?? 1, "viewport.scale") } : null;
  const payload = { versionId: version.id, sequence, viewport, capturedAt: input.capturedAt || version.capturedAt };
  return Object.freeze({
    schemaVersion: 1, id: input.id || visualId("vf", payload), versionId: version.id, sourceId: version.sourceId,
    principal: version.principal, sequence, capturedAt: iso(input.capturedAt || version.capturedAt, "frame.capturedAt"),
    viewport, viewportHash: viewport ? hash(viewport) : null, contentHash: version.contentHash
  });
}

function createVisualRegion(version, input = {}) {
  if (!version || !version.id) throw new Error("region requires VisualVersion");
  const box = normalizeBox(input.box);
  const frameId = input.frameId ? String(input.frameId) : null;
  const payload = { versionId: version.id, frameId, box, role: input.role || null };
  return Object.freeze({ schemaVersion: 1, id: input.id || visualId("vr", payload), versionId: version.id, sourceId: version.sourceId, principal: version.principal, frameId, box, role: input.role ? String(input.role) : null, lineage: { parents: [version.id], transformation: "region" } });
}

function ensureRegionVersion(region, versionId) { if (!region || region.versionId !== versionId) throw new Error("region/version mismatch"); }

function createOCRArtifact(input = {}) {
  const version = input.version, region = input.region;
  if (!version || !version.id) throw new Error("OCR requires VisualVersion");
  if (region) ensureRegionVersion(region, version.id);
  const engine = reqString(input.engine, "ocr.engine"), engineVersion = reqString(input.engineVersion, "ocr.engineVersion");
  const text = String(input.text ?? "");
  const lines = asArray(input.lines).map(line => ({ text: String(line.text ?? ""), box: normalizeBox(line.box) }));
  const payload = { versionId: version.id, regionId: region?.id || null, engine, engineVersion, textHash: hash(text), lines };
  return Object.freeze({ schemaVersion: 1, id: input.id || visualId("ocr", payload), versionId: version.id, sourceId: version.sourceId, principal: version.principal, regionId: region?.id || null, engine, engineVersion, text, textHash: hash(text), lines, languages: asArray(input.languages).map(String), quality: input.quality == null ? null : Math.max(0, Math.min(1, finite(input.quality, "ocr.quality"))), derived: true, grantsAuthority: false, lineage: { parents: [region?.id || version.id], transformation: "ocr", transformer: `${engine}@${engineVersion}` } });
}

function createLayoutArtifact(input = {}) {
  const version = input.version;
  if (!version || !version.id) throw new Error("layout requires VisualVersion");
  const blocks = asArray(input.blocks).map((b, i) => ({ id: String(b.id || `block-${i}`), kind: String(b.kind || "UNKNOWN").toUpperCase(), box: normalizeBox(b.box), readingOrder: b.readingOrder == null ? null : int(b.readingOrder, "block.readingOrder", 0) }));
  const ids = new Set(); for (const b of blocks) { if (ids.has(b.id)) throw new Error("duplicate layout block id"); ids.add(b.id); }
  const payload = { versionId: version.id, engine: input.engine || "unknown", blocks };
  return Object.freeze({ schemaVersion: 1, id: input.id || visualId("layout", payload), versionId: version.id, sourceId: version.sourceId, principal: version.principal, engine: String(input.engine || "unknown"), blocks, readingOrderIsHypothesis: true, derived: true, lineage: { parents: [version.id], transformation: "layout" } });
}

function createVisualObservation(input = {}) {
  const version = input.version;
  if (!version || !version.id) throw new Error("observation requires VisualVersion");
  const regions = asArray(input.regions);
  if (!regions.length) throw new Error("observation requires at least one exact region");
  regions.forEach(r => ensureRegionVersion(r, version.id));
  const predicate = reqString(input.predicate, "observation.predicate");
  const method = reqString(input.method, "observation.method");
  const state = String(input.state || OBSERVATION_STATE.PROPOSED).toUpperCase();
  if (!Object.values(OBSERVATION_STATE).includes(state)) throw new Error("invalid observation state");
  const payload = { versionId: version.id, regions: regions.map(r => r.id), subject: input.subject || null, predicate, value: input.value, method, model: input.model || null };
  return Object.freeze({ schemaVersion: 1, id: input.id || visualId("vo", payload), versionId: version.id, sourceId: version.sourceId, principal: version.principal, regionIds: regions.map(r => r.id), frameId: input.frameId || null, subject: input.subject == null ? null : String(input.subject), predicate, value: clone(input.value), method, model: input.model ? String(input.model) : null, state, precise: input.precise === true, grantsAuthority: false, confidence: input.confidence == null ? null : Math.max(0, Math.min(1, finite(input.confidence, "observation.confidence"))), lineage: { parents: regions.map(r => r.id), transformation: "visual-observation", transformer: input.model || method } });
}

function createGroundedObservationSet(input = {}) {
  const version = input.version;
  if (!version || !version.id) throw new Error("observation set requires VisualVersion");
  const observations = asArray(input.observations);
  if (!observations.length) throw new Error("observation set requires observations");
  observations.forEach(o => { if (o.versionId !== version.id) throw new Error("observation set version mismatch"); });
  const payload = { versionId: version.id, observationIds: observations.map(o => o.id).sort() };
  return Object.freeze({ schemaVersion: 1, id: input.id || visualId("vos", payload), versionId: version.id, sourceId: version.sourceId, principal: version.principal, observationIds: observations.map(o => o.id), unresolved: observations.filter(o => [OBSERVATION_STATE.CONFLICT, OBSERVATION_STATE.UNRESOLVED].includes(o.state)).map(o => o.id), grantsAuthority: false });
}

function createPerceptionRequest(input = {}) {
  const version = input.version;
  if (!version || !version.id) throw new Error("perception request requires VisualVersion");
  const principal = reqString(input.principal, "request.principal");
  if (principal !== version.principal) throw new Error("perception principal mismatch");
  if (input.ambient === true) throw new Error("ambient perception is forbidden");
  const needs = [...new Set(asArray(input.needs).map(v => String(v).toUpperCase()))];
  if (!needs.length) throw new Error("perception request requires needs");
  const payload = { taskId: input.taskId, principal, versionId: version.id, needs, allowRemote: input.allowRemote === true, maxRemoteRegions: input.maxRemoteRegions ?? (input.allowRemote === true ? 1 : 0) };
  return Object.freeze({ schemaVersion: 1, id: input.id || visualId("pr", payload), taskId: reqString(input.taskId, "request.taskId"), principal, project: version.project, versionId: version.id, sourceId: version.sourceId, sensitivity: version.sensitivity, needs, allowRemote: input.allowRemote === true, maxRemoteRegions: int(input.maxRemoteRegions ?? (input.allowRemote === true ? 1 : 0), "request.maxRemoteRegions", 0), privacyMode: String(input.privacyMode || "MINIMIZE").toUpperCase(), ambient: false, createdAt: iso(input.createdAt || new Date().toISOString(), "request.createdAt") });
}

function canRemotePerceive(request, input = {}) {
  if (!request?.allowRemote) return { allowed: false, reason: "remote-not-authorized" };
  if (SENSITIVITY[request.sensitivity] >= SENSITIVITY.SENSITIVE) return { allowed: false, reason: "sensitive-source" };
  if (request.privacyMode === "LOCAL_ONLY") return { allowed: false, reason: "local-only-policy" };
  if (!request.maxRemoteRegions) return { allowed: false, reason: "remote-region-budget-zero" };
  const regionCount = int(input.regionCount ?? 0, "regionCount", 0);
  if (regionCount <= 0) return { allowed: false, reason: "remote-requires-minimized-region" };
  if (request.maxRemoteRegions && regionCount > request.maxRemoteRegions) return { allowed: false, reason: "remote-region-budget-exceeded" };
  return { allowed: true, reason: "explicit-minimized-remote-route" };
}

function createPerceptionPlan(request, input = {}) {
  if (!request?.id) throw new Error("plan requires PerceptionRequest");
  const tier = String(input.tier || "BALANCED").toUpperCase();
  if (!["LITE", "BALANCED", "FULL"].includes(tier)) throw new Error("invalid perception tier");
  const stages = [STAGE.METADATA];
  if (request.needs.some(n => ["TEXT", "DOCUMENT", "TABLE", "CHART", "UI"].includes(n))) stages.push(STAGE.OCR);
  if (request.needs.some(n => ["DOCUMENT", "TABLE", "CHART", "DIAGRAM", "UI"].includes(n))) stages.push(STAGE.LAYOUT);
  stages.push(STAGE.TARGET_CROP);
  const semanticNeed = request.needs.some(n => ["SEMANTIC", "CHART", "DIAGRAM", "UI", "OBJECTS"].includes(n));
  const remoteDecision = canRemotePerceive(request, { regionCount: Math.max(0, Number(input.plannedRemoteRegions || 0)) });
  const localVlm = input.localVlmAvailable === true && tier !== "LITE";
  if (semanticNeed && (localVlm || remoteDecision.allowed)) stages.push(STAGE.VLM);
  if (input.requireIndependentSecondPass === true && stages.includes(STAGE.VLM)) stages.push(STAGE.SECOND_PASS);
  stages.push(STAGE.VALIDATE, STAGE.HANDOFF);
  const payload = { requestId: request.id, tier, stages, localVlm, remote: remoteDecision.allowed };
  return Object.freeze({ schemaVersion: 1, id: input.id || visualId("pp", payload), requestId: request.id, versionId: request.versionId, principal: request.principal, tier, stages, remoteAllowed: remoteDecision.allowed, remoteReason: remoteDecision.reason, heavyVisionLoaded: stages.includes(STAGE.VLM), vlmRoute: stages.includes(STAGE.VLM) ? (localVlm ? "LOCAL" : "REMOTE") : null, continuousPolling: false, cancellableBetweenStages: true, payloadMinimized: remoteDecision.allowed });
}

function createPerceptionManifest(input = {}) {
  const request = input.request, plan = input.plan;
  if (!request?.id || !plan?.id) throw new Error("manifest requires request and plan");
  if (plan.requestId !== request.id || plan.versionId !== request.versionId) throw new Error("manifest plan/request mismatch");
  const artifactIds = asArray(input.artifacts).map(a => { if (a.versionId !== request.versionId) throw new Error("manifest artifact version mismatch"); return a.id; });
  const observationIds = asArray(input.observations).map(o => { if (o.versionId !== request.versionId) throw new Error("manifest observation version mismatch"); return o.id; });
  const payload = { requestId: request.id, planId: plan.id, versionId: request.versionId, artifactIds: artifactIds.slice().sort(), observationIds: observationIds.slice().sort(), completedStages: asArray(input.completedStages) };
  return Object.freeze({ schemaVersion: 1, id: input.id || visualId("pm", payload), ...payload, cancelled: input.cancelled === true, status: input.cancelled === true ? "CANCELLED" : "COMPLETE", lineageHash: hash(payload) });
}

function createFrameDelta(previous, current, input = {}) {
  if (!previous?.id || !current?.id) throw new Error("frame delta requires two frames");
  if (previous.sourceId !== current.sourceId || previous.principal !== current.principal) throw new Error("frame delta source boundary mismatch");
  const duplicate = previous.contentHash === current.contentHash;
  const changedRegions = duplicate ? [] : asArray(input.changedRegions).map(normalizeBox);
  return Object.freeze({ schemaVersion: 1, id: visualId("fd", { previous: previous.id, current: current.id, changedRegions }), previousFrameId: previous.id, currentFrameId: current.id, duplicate, changedRegions, keyframeRequired: !duplicate && (input.forceKeyframe === true || changedRegions.length === 0) });
}

function validateFrameTarget(input = {}) {
  const proposal = input.proposal, currentFrame = input.currentFrame;
  if (!proposal?.frameId || !currentFrame?.id) return { valid: false, reason: "missing-frame-binding" };
  if (proposal.frameId !== currentFrame.id) return { valid: false, reason: "stale-frame" };
  if (proposal.viewportHash && proposal.viewportHash !== currentFrame.viewportHash) return { valid: false, reason: "viewport-drift" };
  try { normalizeBox(proposal.box); } catch { return { valid: false, reason: "invalid-target-box" }; }
  return { valid: true, reason: "current-frame-bound" };
}

function reconcileObservations(observations = []) {
  const list = asArray(observations);
  if (!list.length) return { state: OBSERVATION_STATE.UNRESOLVED, reason: "no-observations" };
  const versions = new Set(list.map(o => o.versionId)); if (versions.size !== 1) return { state: OBSERVATION_STATE.UNRESOLVED, reason: "version-mismatch" };
  const values = new Set(list.map(o => canonical(o.value)));
  if (values.size > 1) return { state: OBSERVATION_STATE.CONFLICT, reason: "method-disagreement", observationIds: list.map(o => o.id) };
  return { state: list.every(o => o.state === OBSERVATION_STATE.VERIFIED) ? OBSERVATION_STATE.VERIFIED : OBSERVATION_STATE.PROPOSED, reason: "consistent", observationIds: list.map(o => o.id) };
}

function requirePreciseVisualValue(input = {}) {
  const observations = asArray(input.observations);
  const eligible = observations.filter(o => o.precise === true && o.state === OBSERVATION_STATE.VERIFIED && o.versionId === input.versionId);
  if (!eligible.length) return { state: OBSERVATION_STATE.UNRESOLVED, reason: "no-verified-precise-visual-evidence" };
  const values = new Set(eligible.map(o => canonical(o.value)));
  if (values.size !== 1) return { state: OBSERVATION_STATE.CONFLICT, reason: "precise-value-conflict" };
  return { state: OBSERVATION_STATE.VERIFIED, value: clone(eligible[0].value), evidence: eligible.map(o => o.id) };
}

function createVisualEvidenceRef(input = {}) {
  const observation = input.observation, version = input.version, regions = asArray(input.regions);
  if (!observation?.id || !version?.id) throw new Error("visual evidence requires observation and version");
  if (observation.versionId !== version.id) throw new Error("visual evidence version mismatch");
  if (!regions.length) throw new Error("visual evidence requires exact regions");
  regions.forEach(r => ensureRegionVersion(r, version.id));
  const regionIds = regions.map(r => r.id);
  for (const id of observation.regionIds) if (!regionIds.includes(id)) throw new Error("visual evidence missing observation region");
  const payload = { versionId: version.id, observationId: observation.id, regionIds: regionIds.slice().sort(), artifactIds: asArray(input.artifacts).map(a => a.id).sort() };
  return Object.freeze({ schemaVersion: 1, id: input.id || visualId("ve", payload), sourceId: version.sourceId, principal: version.principal, versionId: version.id, observationId: observation.id, regionIds, artifactIds: payload.artifactIds, property: input.property ? String(input.property) : observation.predicate, verificationState: observation.state, grantsAuthority: false, lineageHash: hash(payload) });
}

function shouldReuseDerivative(artifact, version) { return Boolean(artifact && version && artifact.versionId === version.id); }
function grantsAuthority() { return false; }
function canPerformAction() { return false; }

module.exports = Object.freeze({
  SENSITIVITY, OBSERVATION_STATE, STAGE,
  createVisualSource, createVisualVersion, deriveVisualVersion, createVisualFrame, createVisualRegion,
  createOCRArtifact, createLayoutArtifact, createVisualObservation, createGroundedObservationSet,
  createPerceptionRequest, canRemotePerceive, createPerceptionPlan, createPerceptionManifest,
  createFrameDelta, validateFrameTarget, reconcileObservations, requirePreciseVisualValue,
  createVisualEvidenceRef, shouldReuseDerivative, grantsAuthority, canPerformAction,
  normalizeBox, hash
});
