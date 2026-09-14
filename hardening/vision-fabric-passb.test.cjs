"use strict";

const assert = require("assert/strict");
const v = require("./vision-fabric-passb.cjs");

let n = 0;
function pass(name, fn) { fn(); n++; console.log("PASS", name); }

const source = v.createVisualSource({
  id: "screen-1", principal: "user", project: "seven", origin: "explicit:screenshot",
  originKind: "SCREENSHOT", sensitivity: "PRIVATE", createdAt: "2026-09-14T17:00:00Z"
});
const version = v.createVisualVersion({
  source, contentHash: "a".repeat(64), width: 1080, height: 2400,
  frameIndex: 1, capturedAt: "2026-09-14T17:00:00Z"
});
const frame = v.createVisualFrame(version, { sequence: 1, viewport: { width: 1080, height: 2400, scale: 1 } });
const region = v.createVisualRegion(version, { frame, box: { x: .1, y: .1, width: .2, height: .2 }, role: "control" });

pass("frame-bound region requires authoritative frame", () => {
  assert.throws(() => v.createVisualRegion(version, { frameId: frame.id, box: { x: .1, y: .1, width: .1, height: .1 } }), /authoritative frame/);
});

const version2 = v.createVisualVersion({
  source, contentHash: "b".repeat(64), width: 1080, height: 2400,
  frameIndex: 2, capturedAt: "2026-09-14T17:01:00Z"
});
const frame2 = v.createVisualFrame(version2, { sequence: 2, viewport: { width: 1080, height: 2400, scale: 1 } });

pass("region rejects frame from another visual version", () => {
  assert.throws(() => v.createVisualRegion(version, { frame: frame2, box: { x: 0, y: 0, width: .1, height: .1 } }), /frame\/version/);
});

const obs = v.createVisualObservation({
  version, regions: [region], frame, predicate: "label", value: "Send", method: "OCR",
  state: "VERIFIED", precise: true
});

pass("observation cannot drift from region frame", () => {
  assert.throws(() => v.createVisualObservation({
    version, regions: [region], frame: frame2, predicate: "label", value: "Send", method: "VLM"
  }), /frame mismatch|frame boundary/);
});

const proposal = v.createFrameTargetProposal({ frame, box: region.box });
pass("canonical target proposal validates only on exact frame", () => {
  assert.equal(v.validateFrameTarget({ proposal, currentFrame: frame }).valid, true);
});
pass("target proposal detects tampering before geometry use", () => {
  assert.equal(v.validateFrameTarget({ proposal: { ...proposal, box: { x: .2, y: .2, width: .2, height: .2 } }, currentFrame: frame }).reason, "proposal-integrity-drift");
});
pass("target proposal fails on stale frame content", () => {
  assert.equal(v.validateFrameTarget({ proposal, currentFrame: frame2 }).reason, "stale-frame");
});

const request = v.createPerceptionRequest({
  taskId: "vision-task", principal: "user", version, needs: ["ui", "semantic"],
  allowRemote: true, maxRemoteRegions: 1, maxRemoteAreaFraction: .1, privacyMode: "MINIMIZE",
  createdAt: "2026-09-14T17:02:00Z"
});

pass("request privacy vocabulary fails closed", () => {
  assert.throws(() => v.createPerceptionRequest({
    taskId: "x", principal: "user", version, needs: ["ui"], privacyMode: "SEND_EVERYTHING"
  }), /privacyMode/);
});

pass("forged request sensitivity is detected against authoritative version", () => {
  const forged = { ...request, sensitivity: "PUBLIC" };
  assert.equal(v.canRemotePerceive(forged, { version, regions: [region] }).reason, "request-boundary-invalid");
});

pass("remote route requires authoritative version", () => {
  assert.equal(v.canRemotePerceive(request, { regions: [region] }).reason, "request-boundary-invalid");
});

pass("remote route cannot substitute regionCount for grounded regions", () => {
  assert.equal(v.canRemotePerceive(request, { version, regionCount: 1 }).reason, "remote-requires-grounded-regions");
});

const hugeRegion = v.createVisualRegion(version, {
  frame, box: { x: 0, y: 0, width: .8, height: .8 }, role: "whole-screen"
});
pass("remote route enforces area minimization not just region count", () => {
  assert.equal(v.canRemotePerceive(request, { version, regions: [hugeRegion] }).reason, "remote-area-budget-exceeded");
});

const foreignSource = v.createVisualSource({ id: "foreign", principal: "user", project: "seven", origin: "upload:foreign", sensitivity: "PRIVATE" });
const foreignVersion = v.createVisualVersion({ source: foreignSource, contentHash: "c".repeat(64), width: 100, height: 100 });
const foreignRegion = v.createVisualRegion(foreignVersion, { box: { x: 0, y: 0, width: .1, height: .1 } });

pass("remote route rejects foreign region despite valid count", () => {
  assert.equal(v.canRemotePerceive(request, { version, regions: [foreignRegion] }).reason, "remote-region-boundary-invalid");
});

const crop = v.deriveVisualVersion(version, {
  contentHash: "d".repeat(64), width: 216, height: 480,
  transform: { kind: "CROP", box: region.box }
});

pass("remote envelope requires metadata stripping", () => {
  assert.throws(() => v.createRemotePerceptionEnvelope({
    request, version, regions: [region], payloadVersions: [{ regionId: region.id, version: crop }]
  }), /metadata stripping/);
});

pass("remote envelope rejects authoritative original as minimized payload", () => {
  assert.throws(() => v.createRemotePerceptionEnvelope({
    request, version, regions: [region], payloadVersions: [{ regionId: region.id, version }], metadataStripped: true
  }), /directly derived/);
});

const envelope = v.createRemotePerceptionEnvelope({
  request, version, regions: [region], payloadVersions: [{ regionId: region.id, version: crop }], metadataStripped: true
});

pass("valid minimized envelope is integrity bound", () => {
  assert.equal(v.verifyRemotePerceptionEnvelope(envelope, {
    request, version, regions: [region], payloadVersions: [{ regionId: region.id, version: crop }], metadataStripped: true
  }).valid, true);
});

pass("remote plan cannot activate from a region-count claim alone", () => {
  const plan = v.createPerceptionPlan(request, { version, tier: "LITE", localVlmAvailable: false, plannedRemoteRegions: 1 });
  assert.equal(plan.vlmRoute, null);
  assert.equal(plan.payloadMinimized, false);
});

const remotePlan = v.createPerceptionPlan(request, {
  version, tier: "LITE", localVlmAvailable: false,
  remoteEnvelope: envelope, regions: [region],
  payloadVersions: [{ regionId: region.id, version: crop }], metadataStripped: true
});

pass("remote plan requires verified minimization envelope", () => {
  assert.equal(remotePlan.vlmRoute, "REMOTE");
  assert.equal(remotePlan.remoteEnvelopeId, envelope.id);
  assert.equal(remotePlan.payloadMinimized, true);
});

const ocr = v.createOCRArtifact({
  version, region, engine: "platform", engineVersion: "1", text: "Send",
  lines: [{ text: "Send", box: region.box }]
});

pass("evidence rejects foreign artifact even when observation is valid", () => {
  const forgedArtifact = { ...ocr, sourceId: "foreign-source" };
  assert.throws(() => v.createVisualEvidenceRef({
    version, observation: obs, regions: [region], artifacts: [forgedArtifact]
  }), /artifact source mismatch/);
});

const extraRegion = v.createVisualRegion(version, { frame, box: { x: .5, y: .5, width: .1, height: .1 } });
pass("evidence rejects extra-region smuggling", () => {
  assert.throws(() => v.createVisualEvidenceRef({
    version, observation: obs, regions: [region, extraRegion], artifacts: [ocr]
  }), /exactly match/);
});

const evidence = v.createVisualEvidenceRef({ version, observation: obs, regions: [region], artifacts: [ocr] });
pass("exact visual evidence remains version source principal bound", () => {
  assert.ok(evidence.boundaryHash);
  assert.equal(evidence.sourceId, source.id);
});

pass("manifest rejects foreign artifact source even with matching version id", () => {
  const forgedArtifact = { ...ocr, sourceId: "foreign-source" };
  assert.throws(() => v.createPerceptionManifest({
    request, version, plan: remotePlan, remoteEnvelope: envelope,
    artifacts: [forgedArtifact], observations: [obs], completedStages: remotePlan.stages
  }), /artifact source mismatch/);
});

pass("manifest rejects duplicate artifact identities", () => {
  assert.throws(() => v.createPerceptionManifest({
    request, version, plan: remotePlan, remoteEnvelope: envelope,
    artifacts: [ocr, ocr], observations: [obs], completedStages: remotePlan.stages
  }), /duplicate manifest artifact/);
});

const manifest = v.createPerceptionManifest({
  request, version, plan: remotePlan, remoteEnvelope: envelope,
  artifacts: [ocr], observations: [obs], completedStages: remotePlan.stages
});
pass("manifest closes exact remote envelope and perception boundary", () => {
  assert.equal(manifest.remoteEnvelopeId, envelope.id);
  assert.ok(manifest.boundaryHash);
});

pass("derivative reuse rejects same-version foreign source artifact", () => {
  assert.equal(v.shouldReuseDerivative({ ...ocr, sourceId: "foreign-source" }, version), false);
});

const sensitiveSource = v.createVisualSource({
  id: "sensitive", principal: "user", project: "seven", origin: "explicit:screen",
  sensitivity: "SENSITIVE"
});
const sensitiveVersion = v.createVisualVersion({
  source: sensitiveSource, contentHash: "e".repeat(64), width: 500, height: 500
});
const sensitiveRegion = v.createVisualRegion(sensitiveVersion, { box: { x: .1, y: .1, width: .1, height: .1 } });
const sensitiveRequest = v.createPerceptionRequest({
  taskId: "secret-task", principal: "user", version: sensitiveVersion, needs: ["semantic"],
  allowRemote: true, maxRemoteRegions: 1, maxRemoteAreaFraction: .1
});
pass("authoritative sensitive version blocks remote even if caller tries permissive route", () => {
  assert.equal(v.canRemotePerceive(sensitiveRequest, { version: sensitiveVersion, regions: [sensitiveRegion] }).reason, "sensitive-source");
});

pass("precise value resolution rejects foreign observation boundaries", () => {
  assert.throws(() => v.requirePreciseVisualValue({
    version, observations: [{ ...obs, sourceId: "foreign-source" }]
  }), /observation source mismatch/);
});

pass("vision Pass B still grants no action authority", () => {
  assert.equal(envelope.grantsAuthority, false);
  assert.equal(v.canPerformAction(), false);
});

console.log(`vision fabric Pass B: PASS (${n} assertions)`);
