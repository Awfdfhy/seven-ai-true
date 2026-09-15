"use strict";
const crypto=require("crypto");
const android=require("./android-visual-certification.cjs");

const VERSION="1.0.0",H64=/^[0-9a-f]{64}$/i;
const ATTESTATION_METHODS=new Set(["adb-getprop","instrumentation","device-farm-api"]);
const MAX_WITNESS_MS=24*60*60*1000;
function arr(v){return Array.isArray(v)?v:[]}
function req(v,n){const s=String(v??"").trim();if(!s)throw Error(`${n} required`);return s}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o}return v}
function hash(v){return crypto.createHash("sha256").update(JSON.stringify(stable(v))).digest("hex")}
function seal(b){return Object.freeze({...b,seal:hash(b)})}
function verify(x,s){if(!x||x.schema!==s||!H64.test(String(x.seal||"")))return false;const{seal:q,...b}=x;return q===hash(b)}
function iso(v,n){const d=new Date(req(v,n));if(Number.isNaN(d.getTime()))throw Error(`${n} invalid`);return d.toISOString()}
function sameSet(a,b){return [...a].sort().join("|")===[...b].sort().join("|")}

function createDeviceAttestation(i={}){
  if(!android.verifyDeviceProof(i.device))throw Error("verified device required");
  const method=req(i.attestationMethod,"attestationMethod");if(!ATTESTATION_METHODS.has(method))throw Error("attestationMethod invalid");
  if(i.device.environmentType==="PHYSICAL_DEVICE"&&method==="device-farm-api")throw Error("physical device cannot be attested only by device-farm-api");
  for(const k of ["buildFingerprintSha256","captureSessionSha256","sourceEvidenceSha256"])if(!H64.test(String(i[k]||"")))throw Error(`${k} invalid`);
  const capturedAt=iso(i.capturedAt,"capturedAt");
  const body={schema:"seven.visual-red-team.device-attestation.v1",version:VERSION,deviceSeal:i.device.seal,deviceIdentityHash:i.device.deviceIdentityHash,environmentType:i.device.environmentType,attestationMethod:method,buildFingerprintSha256:String(i.buildFingerprintSha256).toLowerCase(),captureSessionSha256:String(i.captureSessionSha256).toLowerCase(),sourceEvidenceSha256:String(i.sourceEvidenceSha256).toLowerCase(),sourceRef:req(i.sourceRef,"sourceRef"),capturedBy:req(i.capturedBy,"capturedBy"),capturedAt};
  return seal(body);
}
function verifyDeviceAttestation(x,device){
  if(!verify(x,"seven.visual-red-team.device-attestation.v1")||!ATTESTATION_METHODS.has(x.attestationMethod)||!H64.test(x.buildFingerprintSha256)||!H64.test(x.captureSessionSha256)||!H64.test(x.sourceEvidenceSha256))return false;
  if(device&&(!android.verifyDeviceProof(device)||x.deviceSeal!==device.seal||x.deviceIdentityHash!==device.deviceIdentityHash||x.environmentType!==device.environmentType))return false;
  if(x.environmentType==="PHYSICAL_DEVICE"&&x.attestationMethod==="device-farm-api")return false;
  return !Number.isNaN(new Date(x.capturedAt).getTime());
}

function createCaptureWitness(i={}){
  if(!android.verifyBuildIdentity(i.build)||!android.verifyDeviceProof(i.device)||!android.verifyCaptureReceipt(i.capture,{build:i.build,device:i.device})||!verifyDeviceAttestation(i.attestation,i.device))throw Error("verified build/device/capture/attestation required");
  const capturedAt=iso(i.capturedAt,"capturedAt"),expiresAt=iso(i.expiresAt,"expiresAt"),start=new Date(capturedAt).getTime(),end=new Date(expiresAt).getTime();
  if(end<=start||end-start>MAX_WITNESS_MS)throw Error("witness lifetime invalid");
  const byteSize=Number(i.byteSize);if(!Number.isInteger(byteSize)||byteSize<=0)throw Error("byteSize invalid");
  for(const k of ["transportProofSha256","sourceArtifactSha256"])if(!H64.test(String(i[k]||"")))throw Error(`${k} invalid`);
  if(String(i.sourceArtifactSha256).toLowerCase()!==i.capture.screenshotSha256)throw Error("source artifact hash must equal captured screenshot hash");
  const body={schema:"seven.visual-red-team.capture-witness.v1",version:VERSION,buildSeal:i.build.seal,artifactSha256:i.build.artifactSha256,candidateSeal:i.build.candidateSeal,deviceSeal:i.device.seal,deviceIdentityHash:i.device.deviceIdentityHash,attestationSeal:i.attestation.seal,captureSeal:i.capture.seal,scenario:i.capture.scenario,screenshotSha256:i.capture.screenshotSha256,sourceArtifactSha256:String(i.sourceArtifactSha256).toLowerCase(),sourceArtifactRef:req(i.sourceArtifactRef,"sourceArtifactRef"),transportProofSha256:String(i.transportProofSha256).toLowerCase(),byteSize,capturedAt,expiresAt};
  return seal(body);
}
function verifyCaptureWitness(x,{build,device,capture,attestation}={}){
  if(!verify(x,"seven.visual-red-team.capture-witness.v1")||!H64.test(x.transportProofSha256)||!H64.test(x.sourceArtifactSha256)||x.sourceArtifactSha256!==x.screenshotSha256)return false;
  const start=new Date(x.capturedAt).getTime(),end=new Date(x.expiresAt).getTime();if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||end-start>MAX_WITNESS_MS)return false;
  if(build&&(!android.verifyBuildIdentity(build)||x.buildSeal!==build.seal||x.artifactSha256!==build.artifactSha256||x.candidateSeal!==build.candidateSeal))return false;
  if(device&&(!android.verifyDeviceProof(device)||x.deviceSeal!==device.seal||x.deviceIdentityHash!==device.deviceIdentityHash))return false;
  if(capture&&(!android.verifyCaptureReceipt(capture,{build,device})||x.captureSeal!==capture.seal||x.scenario!==capture.scenario||x.screenshotSha256!==capture.screenshotSha256))return false;
  if(attestation&&(!verifyDeviceAttestation(attestation,device)||x.attestationSeal!==attestation.seal))return false;
  return Number.isInteger(x.byteSize)&&x.byteSize>0&&!!String(x.sourceArtifactRef||"").trim();
}

function redTeamAndroidVisual(i={}){
  const {build,certification}=i;if(!android.verifyBuildIdentity(build)||!android.verifyCertification(certification))throw Error("verified build/certification required");
  const devices=arr(i.devices),captures=arr(i.captures),attestations=arr(i.attestations),witnesses=arr(i.witnesses),evaluatedAt=new Date(iso(i.evaluatedAt||new Date().toISOString(),"evaluatedAt")).getTime();
  const failures=[],missing=[];
  if(certification.verdict!=="PASS")failures.push("upstream-certification-not-pass");
  if(certification.buildSeal!==build.seal||certification.artifactSha256!==build.artifactSha256||certification.candidateSeal!==build.candidateSeal)failures.push("certification-build-drift");
  const dm=new Map();for(const d of devices){if(!android.verifyDeviceProof(d)){failures.push("invalid-device");continue}if(dm.has(d.seal))failures.push("duplicate-device");dm.set(d.seal,d)}
  const cm=new Map();for(const c of captures){const d=dm.get(c?.deviceSeal);if(!d||!android.verifyCaptureReceipt(c,{build,device:d})){failures.push("invalid-capture");continue}if(cm.has(c.seal))failures.push("duplicate-capture-seal");cm.set(c.seal,c)}
  if(!sameSet(certification.deviceSeals||[],[...dm.keys()]))failures.push("certification-device-set-drift");
  if(!sameSet(certification.captureSeals||[],[...cm.keys()]))failures.push("certification-capture-set-drift");
  const am=new Map(),sessionOwners=new Map();for(const a of attestations){const d=dm.get(a?.deviceSeal);if(!d||!verifyDeviceAttestation(a,d)){failures.push("invalid-attestation");continue}if(am.has(a.deviceSeal))failures.push("duplicate-attestation-for-device");am.set(a.deviceSeal,a);const prior=sessionOwners.get(a.captureSessionSha256);if(prior&&prior!==a.deviceIdentityHash)failures.push("cross-device-session-reuse");sessionOwners.set(a.captureSessionSha256,a.deviceIdentityHash)}
  for(const d of dm.values())if(!am.has(d.seal))missing.push(`device-attestation:${d.deviceIdentityHash}`);
  const wm=new Map(),artifactRefs=new Map(),shotOwners=new Map(),perDevice=new Map();for(const w of witnesses){const c=cm.get(w?.captureSeal),d=c&&dm.get(c.deviceSeal),a=d&&am.get(d.seal);if(!c||!d||!a||!verifyCaptureWitness(w,{build,device:d,capture:c,attestation:a})){failures.push("invalid-witness");continue}if(wm.has(w.captureSeal)){failures.push("duplicate-witness");continue}wm.set(w.captureSeal,w);if(new Date(w.expiresAt).getTime()<evaluatedAt)failures.push(`stale-witness:${w.scenario}`);const refOwner=artifactRefs.get(w.sourceArtifactRef);if(refOwner&&refOwner!==w.captureSeal)failures.push("source-artifact-ref-reuse");artifactRefs.set(w.sourceArtifactRef,w.captureSeal);const shotOwner=shotOwners.get(w.screenshotSha256);if(shotOwner&&shotOwner!==`${w.scenario}:${w.deviceIdentityHash}`)failures.push("screenshot-hash-reuse-across-contexts");shotOwners.set(w.screenshotSha256,`${w.scenario}:${w.deviceIdentityHash}`);perDevice.set(w.deviceSeal,(perDevice.get(w.deviceSeal)||0)+1)}
  for(const c of cm.values())if(!wm.has(c.seal))missing.push(`capture-witness:${c.scenario}:${c.deviceSeal}`);
  for(const s of android.SCENARIOS)if(![...wm.values()].some(w=>w.scenario===s))missing.push(`scenario-witness:${s}`);
  for(const d of dm.values())if((perDevice.get(d.seal)||0)<2)missing.push(`device-coverage:${d.deviceIdentityHash}`);
  const physical=[...dm.values()].filter(d=>d.environmentType==="PHYSICAL_DEVICE");
  if(Boolean(certification.physicalDeviceIncluded)!==Boolean(physical.length))failures.push("physical-device-claim-drift");
  if(i.requirePhysical===true&&physical.length===0)missing.push("physical-device-required");
  for(const d of physical){const a=am.get(d.seal);if(a&&a.attestationMethod==="device-farm-api")failures.push("physical-device-attestation-laundering")}
  const body={schema:"seven.visual-red-team.android-report.v1",version:VERSION,buildSeal:build.seal,certificationSeal:certification.seal,artifactSha256:build.artifactSha256,candidateSeal:build.candidateSeal,evaluatedAt:new Date(evaluatedAt).toISOString(),deviceCount:dm.size,captureCount:cm.size,witnessCount:wm.size,physicalDeviceCount:physical.length,failures:[...new Set(failures)].sort(),missing:[...new Set(missing)].sort()};
  body.verdict=body.failures.length?"BLOCK":body.missing.length?"INCONCLUSIVE":"PASS";return seal(body);
}
function verifyRedTeamReport(x,build,certification){return verify(x,"seven.visual-red-team.android-report.v1")&&["PASS","BLOCK","INCONCLUSIVE"].includes(x.verdict)&&(!build||x.buildSeal===build.seal)&&(!certification||x.certificationSeal===certification.seal)}

module.exports=Object.freeze({VERSION,ATTESTATION_METHODS:[...ATTESTATION_METHODS],MAX_WITNESS_MS,hash,createDeviceAttestation,verifyDeviceAttestation,createCaptureWitness,verifyCaptureWitness,redTeamAndroidVisual,verifyRedTeamReport});
