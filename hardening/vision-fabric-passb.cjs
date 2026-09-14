"use strict";

const core = require("./vision-fabric.cjs");

const PRIVACY_MODE = Object.freeze(new Set(["MINIMIZE", "LOCAL_ONLY"]));

function asArray(value) { return Array.isArray(value) ? value : []; }
function assertObject(value, name) {
  if (!value || typeof value !== "object") throw new Error(`${name} required`);
  return value;
}
function fraction(value, name) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || n > 1) throw new Error(`${name} must be > 0 and <= 1`);
  return n;
}
function boxArea(region) {
  const box = region?.box;
  if (!box) throw new Error("grounded remote region requires box");
  return Number(box.width) * Number(box.height);
}
function sameBox(a, b) {
  return Boolean(a && b &&
    Number(a.x) === Number(b.x) &&
    Number(a.y) === Number(b.y) &&
    Number(a.width) === Number(b.width) &&
    Number(a.height) === Number(b.height));
}
function boundaryPayload(request) {
  return {
    taskId: request.taskId,
    principal: request.principal,
    project: request.project ?? null,
    versionId: request.versionId,
    sourceId: request.sourceId,
    sensitivity: request.sensitivity,
    allowRemote: request.allowRemote === true,
    maxRemoteRegions: request.maxRemoteRegions,
    maxRemoteAreaFraction: request.maxRemoteAreaFraction,
    privacyMode: request.privacyMode
  };
}
function assertVersionBoundary(version, expected, label = "visual boundary") {
  assertObject(version, "VisualVersion");
  if (version.id !== expected.versionId) throw new Error(`${label} version mismatch`);
  if (version.sourceId !== expected.sourceId) throw new Error(`${label} source mismatch`);
  if (version.principal !== expected.principal) throw new Error(`${label} principal mismatch`);
  if ((version.project ?? null) !== (expected.project ?? null)) throw new Error(`${label} project mismatch`);
  if (version.sensitivity !== expected.sensitivity) throw new Error(`${label} sensitivity mismatch`);
}
function assertRegionBoundary(region, version, label = "region") {
  assertObject(region, label);
  if (!region.id) throw new Error(`${label} id required`);
  if (region.versionId !== version.id) throw new Error(`${label} version mismatch`);
  if (region.sourceId !== version.sourceId) throw new Error(`${label} source mismatch`);
  if (region.principal !== version.principal) throw new Error(`${label} principal mismatch`);
  core.normalizeBox(region.box);
}
function assertArtifactBoundary(artifact, version, regionIds = null, label = "artifact") {
  assertObject(artifact, label);
  if (!artifact.id) throw new Error(`${label} id required`);
  if (artifact.versionId !== version.id) throw new Error(`${label} version mismatch`);
  if (artifact.sourceId !== version.sourceId) throw new Error(`${label} source mismatch`);
  if (artifact.principal !== version.principal) throw new Error(`${label} principal mismatch`);
  if (artifact.derived !== true) throw new Error(`${label} must be a derived artifact`);
  if (artifact.regionId && regionIds && !regionIds.has(artifact.regionId)) throw new Error(`${label} region mismatch`);
}
function assertObservationBoundary(observation, version, label = "observation") {
  assertObject(observation, label);
  if (!observation.id) throw new Error(`${label} id required`);
  if (observation.versionId !== version.id) throw new Error(`${label} version mismatch`);
  if (observation.sourceId !== version.sourceId) throw new Error(`${label} source mismatch`);
  if (observation.principal !== version.principal) throw new Error(`${label} principal mismatch`);
}

function createPerceptionRequest(input = {}) {
  const privacyMode = String(input.privacyMode || "MINIMIZE").toUpperCase();
  if (!PRIVACY_MODE.has(privacyMode)) throw new Error("invalid perception privacyMode");
  const base = core.createPerceptionRequest({ ...input, privacyMode });
  const maxRemoteAreaFraction = fraction(
    input.maxRemoteAreaFraction ?? (base.allowRemote ? 0.35 : 1),
    "request.maxRemoteAreaFraction"
  );
  const draft = { ...base, maxRemoteAreaFraction };
  return Object.freeze({ ...draft, boundaryHash: core.hash(boundaryPayload(draft)) });
}

function verifyPerceptionRequest(request, version) {
  assertObject(request, "PerceptionRequest");
  assertObject(version, "VisualVersion");
  if (!PRIVACY_MODE.has(String(request.privacyMode || "").toUpperCase())) throw new Error("invalid perception privacyMode");
  if (!(request.sensitivity in core.SENSITIVITY)) throw new Error("invalid request sensitivity");
  assertVersionBoundary(version, request, "perception request");
  const expected = core.hash(boundaryPayload(request));
  if (!request.boundaryHash || request.boundaryHash !== expected) throw new Error("perception request boundary drift");
  return true;
}

function createVisualRegion(version, input = {}) {
  if (input.frameId && !input.frame) throw new Error("frame-bound region requires authoritative frame");
  if (input.frame) {
    const frame = assertObject(input.frame, "VisualFrame");
    if (frame.versionId !== version.id) throw new Error("frame/version mismatch");
    if (frame.sourceId !== version.sourceId) throw new Error("frame/source mismatch");
    if (frame.principal !== version.principal) throw new Error("frame/principal mismatch");
    if (input.frameId && input.frameId !== frame.id) throw new Error("frame id mismatch");
    return core.createVisualRegion(version, { ...input, frameId: frame.id });
  }
  return core.createVisualRegion(version, { ...input, frameId: null });
}

function createVisualObservation(input = {}) {
  const version = assertObject(input.version, "VisualVersion");
  const regions = asArray(input.regions);
  if (!regions.length) throw new Error("observation requires at least one exact region");
  regions.forEach(region => assertRegionBoundary(region, version, "observation region"));
  const boundFrames = [...new Set(regions.map(region => region.frameId).filter(Boolean))];
  if (boundFrames.length > 1) throw new Error("observation spans multiple frame identities");
  let frameId = null;
  if (boundFrames.length === 1) {
    const frame = assertObject(input.frame, "frame-bound observation frame");
    if (frame.id !== boundFrames[0]) throw new Error("observation frame mismatch");
    if (frame.versionId !== version.id || frame.sourceId !== version.sourceId || frame.principal !== version.principal) {
      throw new Error("observation frame boundary mismatch");
    }
    frameId = frame.id;
  } else if (input.frame || input.frameId) {
    throw new Error("observation cannot invent frame binding");
  }
  return core.createVisualObservation({ ...input, frameId });
}

function createGroundedObservationSet(input = {}) {
  const version = assertObject(input.version, "VisualVersion");
  const observations = asArray(input.observations);
  const ids = new Set();
  for (const observation of observations) {
    assertObservationBoundary(observation, version);
    if (ids.has(observation.id)) throw new Error("duplicate observation id");
    ids.add(observation.id);
  }
  return core.createGroundedObservationSet(input);
}

function canRemotePerceive(request, input = {}) {
  const version = input.version;
  try { verifyPerceptionRequest(request, version); }
  catch (error) { return { allowed: false, reason: "request-boundary-invalid", detail: error.message }; }
  if (!request.allowRemote) return { allowed: false, reason: "remote-not-authorized" };
  if (core.SENSITIVITY[version.sensitivity] >= core.SENSITIVITY.SENSITIVE) return { allowed: false, reason: "sensitive-source" };
  if (request.privacyMode === "LOCAL_ONLY") return { allowed: false, reason: "local-only-policy" };
  if (!request.maxRemoteRegions) return { allowed: false, reason: "remote-region-budget-zero" };
  const regions = asArray(input.regions);
  if (!regions.length) return { allowed: false, reason: "remote-requires-grounded-regions" };
  if (regions.length > request.maxRemoteRegions) return { allowed: false, reason: "remote-region-budget-exceeded" };
  const ids = new Set();
  let totalAreaFraction = 0;
  try {
    for (const region of regions) {
      assertRegionBoundary(region, version, "remote region");
      if (ids.has(region.id)) return { allowed: false, reason: "duplicate-remote-region" };
      ids.add(region.id);
      totalAreaFraction += boxArea(region);
    }
  } catch (error) {
    return { allowed: false, reason: "remote-region-boundary-invalid", detail: error.message };
  }
  if (!(totalAreaFraction > 0)) return { allowed: false, reason: "remote-region-empty" };
  if (totalAreaFraction > request.maxRemoteAreaFraction) {
    return { allowed: false, reason: "remote-area-budget-exceeded", totalAreaFraction };
  }
  return { allowed: true, reason: "grounded-minimized-regions-eligible", totalAreaFraction };
}

function createRemotePerceptionEnvelope(input = {}) {
  const request = assertObject(input.request, "PerceptionRequest");
  const version = assertObject(input.version, "VisualVersion");
  const regions = asArray(input.regions);
  const decision = canRemotePerceive(request, { version, regions });
  if (!decision.allowed) throw new Error(`remote perception blocked: ${decision.reason}`);
  if (input.metadataStripped !== true) throw new Error("remote envelope requires metadata stripping");
  const payloadVersions = asArray(input.payloadVersions);
  if (payloadVersions.length !== regions.length) throw new Error("remote envelope requires one minimized payload per region");
  const byRegion = new Map(regions.map(region => [region.id, region]));
  const seenRegions = new Set();
  const payloadBindings = payloadVersions.map(entry => {
    const regionId = String(entry?.regionId || "");
    const derived = entry?.version;
    if (!byRegion.has(regionId)) throw new Error("remote payload references foreign region");
    if (seenRegions.has(regionId)) throw new Error("duplicate remote payload region");
    seenRegions.add(regionId);
    assertObject(derived, "remote payload VisualVersion");
    if (derived.sourceId !== version.sourceId || derived.principal !== version.principal || derived.sensitivity !== version.sensitivity) {
      throw new Error("remote payload boundary mismatch");
    }
    if (derived.authoritativeOriginal !== false || derived.parentVersionId !== version.id) {
      throw new Error("remote payload must be directly derived from requested version");
    }
    const kind = String(derived.transform?.kind || "").toUpperCase();
    if (!["CROP", "REDACT"].includes(kind)) throw new Error("remote payload must be cropped or redacted");
    if (kind === "CROP" && derived.transform?.box && !sameBox(derived.transform.box, byRegion.get(regionId).box)) {
      throw new Error("remote crop does not match grounded region");
    }
    return { regionId, versionId: derived.id, transformKind: kind, contentHash: derived.contentHash };
  });
  if (seenRegions.size !== regions.length) throw new Error("remote envelope missing minimized region payload");
  const payload = {
    requestId: request.id,
    versionId: version.id,
    sourceId: version.sourceId,
    principal: version.principal,
    sensitivity: version.sensitivity,
    regionIds: regions.map(region => region.id).sort(),
    payloadBindings: payloadBindings.slice().sort((a, b) => a.regionId.localeCompare(b.regionId)),
    metadataStripped: true,
    totalAreaFraction: decision.totalAreaFraction
  };
  return Object.freeze({
    schemaVersion: 1,
    id: `rpe-${core.hash(payload).slice(0, 20)}`,
    ...payload,
    envelopeHash: core.hash(payload),
    grantsAuthority: false
  });
}

function verifyRemotePerceptionEnvelope(envelope, input = {}) {
  try {
    const rebuilt = createRemotePerceptionEnvelope(input);
    if (!envelope || envelope.id !== rebuilt.id || envelope.envelopeHash !== rebuilt.envelopeHash) {
      return { valid: false, reason: "remote-envelope-drift" };
    }
    return { valid: true, reason: "remote-envelope-verified", rebuilt };
  } catch (error) {
    return { valid: false, reason: "remote-envelope-invalid", detail: error.message };
  }
}

function createPerceptionPlan(request, input = {}) {
  const version = assertObject(input.version, "VisualVersion");
  verifyPerceptionRequest(request, version);
  let envelope = null;
  if (input.remoteEnvelope) {
    const check = verifyRemotePerceptionEnvelope(input.remoteEnvelope, {
      request, version, regions: input.regions, payloadVersions: input.payloadVersions, metadataStripped: input.metadataStripped
    });
    if (!check.valid) throw new Error(`remote envelope invalid: ${check.reason}${check.detail ? `: ${check.detail}` : ""}`);
    envelope = input.remoteEnvelope;
  }
  const base = core.createPerceptionPlan(request, {
    ...input,
    plannedRemoteRegions: envelope ? envelope.regionIds.length : 0
  });
  if (base.vlmRoute === "REMOTE" && !envelope) throw new Error("remote VLM route requires verified minimization envelope");
  return Object.freeze({
    ...base,
    remoteEnvelopeId: envelope?.id || null,
    payloadMinimized: Boolean(envelope),
    remoteAllowed: base.vlmRoute === "REMOTE"
  });
}

function createPerceptionManifest(input = {}) {
  const request = assertObject(input.request, "PerceptionRequest");
  const version = assertObject(input.version, "VisualVersion");
  const plan = assertObject(input.plan, "PerceptionPlan");
  verifyPerceptionRequest(request, version);
  if (plan.requestId !== request.id || plan.versionId !== version.id || plan.principal !== version.principal) {
    throw new Error("manifest plan/request boundary mismatch");
  }
  if (plan.vlmRoute === "REMOTE") {
    if (!input.remoteEnvelope || input.remoteEnvelope.id !== plan.remoteEnvelopeId) throw new Error("manifest missing verified remote envelope");
  }
  const artifactIds = new Set();
  for (const artifact of asArray(input.artifacts)) {
    assertArtifactBoundary(artifact, version);
    if (artifactIds.has(artifact.id)) throw new Error("duplicate manifest artifact id");
    artifactIds.add(artifact.id);
  }
  const observationIds = new Set();
  for (const observation of asArray(input.observations)) {
    assertObservationBoundary(observation, version);
    if (observationIds.has(observation.id)) throw new Error("duplicate manifest observation id");
    observationIds.add(observation.id);
  }
  const completed = asArray(input.completedStages).map(String);
  if (new Set(completed).size !== completed.length) throw new Error("duplicate completed perception stage");
  for (const stage of completed) if (!plan.stages.includes(stage)) throw new Error("manifest contains unplanned stage");
  const order = completed.map(stage => plan.stages.indexOf(stage));
  for (let i = 1; i < order.length; i++) if (order[i] < order[i - 1]) throw new Error("manifest completed stages out of order");
  const base = core.createPerceptionManifest(input);
  const boundary = {
    requestId: request.id,
    planId: plan.id,
    versionId: version.id,
    sourceId: version.sourceId,
    principal: version.principal,
    artifactIds: [...artifactIds].sort(),
    observationIds: [...observationIds].sort(),
    completedStages: completed,
    remoteEnvelopeId: plan.remoteEnvelopeId || null
  };
  return Object.freeze({ ...base, sourceId: version.sourceId, principal: version.principal, remoteEnvelopeId: plan.remoteEnvelopeId || null, boundaryHash: core.hash(boundary) });
}

function createFrameTargetProposal(input = {}) {
  const frame = assertObject(input.frame, "VisualFrame");
  if (!frame.viewportHash) throw new Error("frame target requires viewport identity");
  const box = core.normalizeBox(input.box);
  const payload = {
    frameId: frame.id,
    versionId: frame.versionId,
    sourceId: frame.sourceId,
    principal: frame.principal,
    viewportHash: frame.viewportHash,
    contentHash: frame.contentHash,
    box
  };
  return Object.freeze({ ...payload, proposalHash: core.hash(payload), grantsAuthority: false });
}

function validateFrameTarget(input = {}) {
  const proposal = input.proposal, frame = input.currentFrame;
  if (!proposal || !frame) return { valid: false, reason: "missing-frame-binding" };
  const payload = {
    frameId: proposal.frameId,
    versionId: proposal.versionId,
    sourceId: proposal.sourceId,
    principal: proposal.principal,
    viewportHash: proposal.viewportHash,
    contentHash: proposal.contentHash,
    box: proposal.box
  };
  if (!proposal.proposalHash || proposal.proposalHash !== core.hash(payload)) return { valid: false, reason: "proposal-integrity-drift" };
  if (proposal.frameId !== frame.id) return { valid: false, reason: "stale-frame" };
  if (proposal.versionId !== frame.versionId || proposal.sourceId !== frame.sourceId || proposal.principal !== frame.principal) {
    return { valid: false, reason: "frame-boundary-drift" };
  }
  if (proposal.contentHash !== frame.contentHash) return { valid: false, reason: "frame-content-drift" };
  if (proposal.viewportHash !== frame.viewportHash) return { valid: false, reason: "viewport-drift" };
  try { core.normalizeBox(proposal.box); } catch { return { valid: false, reason: "invalid-target-box" }; }
  return { valid: true, reason: "current-frame-bound" };
}

function reconcileObservations(observations = [], input = {}) {
  const list = asArray(observations);
  if (input.version) {
    for (const observation of list) assertObservationBoundary(observation, input.version);
  }
  return core.reconcileObservations(list);
}

function requirePreciseVisualValue(input = {}) {
  const version = assertObject(input.version, "VisualVersion");
  const observations = asArray(input.observations);
  for (const observation of observations) assertObservationBoundary(observation, version);
  return core.requirePreciseVisualValue({ versionId: version.id, observations });
}

function createVisualEvidenceRef(input = {}) {
  const version = assertObject(input.version, "VisualVersion");
  const observation = assertObject(input.observation, "VisualObservation");
  assertObservationBoundary(observation, version);
  const regions = asArray(input.regions);
  if (!regions.length) throw new Error("visual evidence requires exact regions");
  const regionIds = new Set();
  for (const region of regions) {
    assertRegionBoundary(region, version, "evidence region");
    if (regionIds.has(region.id)) throw new Error("duplicate evidence region");
    regionIds.add(region.id);
  }
  const observationRegionIds = new Set(asArray(observation.regionIds));
  if (observationRegionIds.size !== regionIds.size || [...observationRegionIds].some(id => !regionIds.has(id))) {
    throw new Error("visual evidence region set must exactly match observation grounding");
  }
  const artifacts = asArray(input.artifacts);
  const artifactIds = new Set();
  for (const artifact of artifacts) {
    assertArtifactBoundary(artifact, version, regionIds, "evidence artifact");
    if (artifactIds.has(artifact.id)) throw new Error("duplicate evidence artifact");
    artifactIds.add(artifact.id);
  }
  const base = core.createVisualEvidenceRef({ ...input, regions, artifacts });
  const boundary = {
    sourceId: version.sourceId,
    principal: version.principal,
    versionId: version.id,
    observationId: observation.id,
    regionIds: [...regionIds].sort(),
    artifactIds: [...artifactIds].sort(),
    property: base.property
  };
  return Object.freeze({ ...base, boundaryHash: core.hash(boundary) });
}

function shouldReuseDerivative(artifact, version) {
  return Boolean(artifact && version &&
    artifact.versionId === version.id &&
    artifact.sourceId === version.sourceId &&
    artifact.principal === version.principal &&
    artifact.derived === true);
}

module.exports = Object.freeze({
  ...core,
  createPerceptionRequest,
  verifyPerceptionRequest,
  createVisualRegion,
  createVisualObservation,
  createGroundedObservationSet,
  canRemotePerceive,
  createRemotePerceptionEnvelope,
  verifyRemotePerceptionEnvelope,
  createPerceptionPlan,
  createPerceptionManifest,
  createFrameTargetProposal,
  validateFrameTarget,
  reconcileObservations,
  requirePreciseVisualValue,
  createVisualEvidenceRef,
  shouldReuseDerivative
});
