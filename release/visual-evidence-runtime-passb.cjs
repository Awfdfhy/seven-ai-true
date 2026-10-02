"use strict";

const base=require("./visual-evidence-runtime.cjs");
const TIERS=new Set(Object.values(base.EVIDENCE_TIER));
const STATUSES=new Set(Object.values(base.VERDICT));
const DEVICE_TIERS=new Set([base.EVIDENCE_TIER.EMULATOR,base.EVIDENCE_TIER.PHYSICAL_DEVICE,base.EVIDENCE_TIER.REPRESENTATIVE_DEVICE,base.EVIDENCE_TIER.RELEASE_BUILD_DEVICE]);
function arr(v){return Array.isArray(v)?v:[]}
function req(v,name){const s=String(v??"").trim();if(!s)throw new Error(`${name} required`);return s}
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v))}
function freeze(v){return Object.freeze(v)}
function hex64(v){return /^[0-9a-f]{64}$/i.test(String(v||""))}
function unique(v,key){const seen=new Set();for(const x of arr(v)){const k=String(key(x));if(seen.has(k))return false;seen.add(k)}return true}
function verifyAudit(a){if(!a||!STATUSES.has(a.status)||!a.kind||!a.auditHash)return false;return a.auditHash===base.hash({kind:a.kind,status:a.status,issues:arr(a.issues),metrics:a.metrics||{}})}
function validateTierProof(tier,proof){
  if(!TIERS.has(tier))throw new Error(`unknown evidence tier:${tier}`);
  if(!DEVICE_TIERS.has(tier))return null;
  if(!proof||String(proof.kind)!==tier)throw new Error(`tier proof required for ${tier}`);
  if(!hex64(proof.proofHash))throw new Error("tier proof hash invalid");
  return freeze({kind:tier,proofHash:String(proof.proofHash).toLowerCase(),sourceRef:req(proof.sourceRef,"tierProof.sourceRef"),capturedBy:req(proof.capturedBy,"tierProof.capturedBy")});
}
function createEvidence(scenario,artifact,input={}){
  const audits=arr(input.audits);if(!audits.length)throw new Error("at least one audit required");
  for(const a of audits)if(!verifyAudit(a))throw new Error("invalid or forged visual audit");
  const tier=String(input.tier||base.EVIDENCE_TIER.HOST),environmentIdentity=req(input.environmentIdentity,"environmentIdentity"),tierProof=validateTierProof(tier,input.tierProof);
  const foundation=base.createEvidence(scenario,artifact,{...input,tier,audits});
  const body={schema:"seven.visual-evidence.v2",foundation:clone(foundation),status:foundation.status,environmentIdentity,tierProof:clone(tierProof)};
  return freeze({...body,evidenceHashV2:base.hash(body)});
}
function verifyEvidence(e,scenario,artifact){
  try{
    if(!e?.evidenceHashV2||e.schema!=="seven.visual-evidence.v2"||!base.verifyEvidence(e.foundation,scenario,artifact))return false;
    if(!TIERS.has(e.foundation.tier)||e.status!==e.foundation.status||!String(e.environmentIdentity||"").trim())return false;
    for(const a of arr(e.foundation.audits))if(!verifyAudit(a))return false;
    const proof=validateTierProof(e.foundation.tier,e.tierProof);
    const body={schema:e.schema,foundation:clone(e.foundation),status:e.status,environmentIdentity:e.environmentIdentity,tierProof:clone(proof)};
    return e.evidenceHashV2===base.hash(body);
  }catch{return false}
}
function createScenarioRegistry(input={}){const body={schema:"seven.visual-scenarios.v1",id:String(input.id||"default"),revision:0,entries:{},history:[]};return freeze({...body,registryHash:base.hash(body)})}
function verifyScenarioRegistry(r){if(!r?.registryHash)return false;const body={...r};delete body.registryHash;if(r.registryHash!==base.hash(body))return false;return Object.values(r.entries||{}).every(base.verifyScenario)}
function addScenario(registry,scenario){if(!verifyScenarioRegistry(registry)||!base.verifyScenario(scenario))throw new Error("verified scenario registry/input required");const current=registry.entries[scenario.id];if(current&&current.scenarioHash!==scenario.scenarioHash)throw new Error("scenario id drift requires explicit replacement approval");if(current)return registry;const entries={...registry.entries,[scenario.id]:scenario},history=[...registry.history,{type:"ADD",revision:registry.revision+1,id:scenario.id,scenarioHash:scenario.scenarioHash}],body={schema:registry.schema,id:registry.id,revision:registry.revision+1,entries,history};return freeze({...body,registryHash:base.hash(body)})}
function replaceScenario(registry,scenario,approval={}){if(!verifyScenarioRegistry(registry)||!base.verifyScenario(scenario))throw new Error("verified scenario registry/input required");if(!registry.entries[scenario.id])throw new Error("scenario does not exist");const a={reviewer:req(approval.reviewer,"approval.reviewer"),reason:req(approval.reason,"approval.reason"),approvalRef:req(approval.approvalRef,"approval.approvalRef")};const entries={...registry.entries,[scenario.id]:scenario},history=[...registry.history,{type:"REPLACE",revision:registry.revision+1,id:scenario.id,scenarioHash:scenario.scenarioHash,...a}],body={schema:registry.schema,id:registry.id,revision:registry.revision+1,entries,history};return freeze({...body,registryHash:base.hash(body)})}
function createEvidenceRegistry(input={}){const body={schema:"seven.visual-evidence-registry.v1",id:String(input.id||"default"),revision:0,entries:{}};return freeze({...body,registryHash:base.hash(body)})}
function verifyEvidenceRegistry(r){if(!r?.registryHash)return false;const body={...r};delete body.registryHash;return r.registryHash===base.hash(body)}
function appendEvidence(registry,evidence,scenario,artifact){if(!verifyEvidenceRegistry(registry)||!verifyEvidence(evidence,scenario,artifact))throw new Error("verified evidence registry/input required");if(registry.entries[evidence.evidenceHashV2])return registry;const entries={...registry.entries,[evidence.evidenceHashV2]:{scenarioId:scenario.id,artifactHash:artifact.artifactHash,status:evidence.status,environmentIdentity:evidence.environmentIdentity,tier:evidence.foundation.tier}},body={schema:registry.schema,id:registry.id,revision:registry.revision+1,entries};return freeze({...body,registryHash:base.hash(body)})}
function approveBaseline(registry,scenario,artifact,evidence,approval={}){if(!verifyEvidence(evidence,scenario,artifact))throw new Error("verified v2 evidence required");if(evidence.status===base.VERDICT.WARN&&approval.acceptWarnings!==true)throw new Error("warning evidence requires explicit acceptWarnings");return base.approveBaseline(registry,scenario,artifact,evidence.foundation,approval)}
function createManifest(input={}){
  const scenarios=arr(input.scenarios),artifacts=arr(input.artifacts),evidence=arr(input.evidence),branch=req(input.branch,"manifest.branch"),commitSha=req(input.commitSha,"manifest.commitSha"),environmentIdentity=req(input.environmentIdentity,"manifest.environmentIdentity");
  if(!unique(scenarios,x=>x.id))throw new Error("duplicate scenario id");if(!unique(artifacts,x=>x.artifactHash))throw new Error("duplicate artifact identity");if(!unique(evidence,x=>x.evidenceHashV2))throw new Error("duplicate evidence identity");
  const sm=new Map(scenarios.map(s=>[s.id,s]));for(const s of scenarios)if(!base.verifyScenario(s))throw new Error("invalid scenario in manifest");
  const am=new Map();for(const a of artifacts){const s=sm.get(a.scenarioId);if(!s||!base.verifyArtifact(a,s))throw new Error("invalid artifact in manifest");am.set(a.artifactHash,a)}
  for(const e of evidence){const s=sm.get(e.foundation?.scenarioId),a=am.get(e.foundation?.artifactHash);if(!s||!a||!verifyEvidence(e,s,a))throw new Error("invalid evidence in manifest");if(e.foundation.branch!==branch||e.foundation.commitSha!==commitSha)throw new Error("cross-commit/branch evidence laundering blocked");if(e.environmentIdentity!==environmentIdentity)throw new Error("cross-environment evidence laundering blocked")}
  const summary={count:evidence.length,pass:evidence.filter(x=>x.status===base.VERDICT.PASS).length,warn:evidence.filter(x=>x.status===base.VERDICT.WARN).length,fail:evidence.filter(x=>x.status===base.VERDICT.FAIL).length,inconclusive:evidence.filter(x=>x.status===base.VERDICT.INCONCLUSIVE).length};
  const body={schema:"seven.visual-evidence-manifest.v2",runtimeVersion:base.VERSION,branch,commitSha,environmentIdentity,mode:String(input.mode||"OBSERVE"),scenarios:scenarios.map(clone),artifacts:artifacts.map(clone),evidence:evidence.map(clone),summary};return freeze({...body,manifestHash:base.hash(body)})
}
function verifyManifest(m){try{if(!m?.manifestHash)return false;const body={...m};delete body.manifestHash;if(m.manifestHash!==base.hash(body))return false;return createManifest(body).manifestHash===m.manifestHash}catch{return false}}
module.exports=Object.freeze({...base,verifyAudit,createEvidence,verifyEvidence,createScenarioRegistry,verifyScenarioRegistry,addScenario,replaceScenario,createEvidenceRegistry,verifyEvidenceRegistry,appendEvidence,approveBaseline,createManifest,verifyManifest});
