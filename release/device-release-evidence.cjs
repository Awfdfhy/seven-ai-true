"use strict";
const crypto=require("crypto");
const android=require("./android-visual-certification.cjs");
const readiness=require("./release-readiness.cjs");
const VERSION="1.0.0",H64=/^[0-9a-f]{64}$/i;
const A11Y_SCENARIOS=Object.freeze(["chat-navigation","workspace-dialog","generated-ui","arabic-rtl","font-scale-200","reduced-motion"]);
const A11Y_OBSERVATIONS=Object.freeze(["spokenOrder","namesRolesStates","stateAnnouncements","dialogIsolation","focusTraversal","fontScaleNoCriticalClipping","rtlReadingOrder","reducedMotionUsable"]);
const PERF_POLICY=Object.freeze({coldStartP95MaxMs:2500,maxPssMb:512,maxJankPercent:5,minLongSessionMinutes:30,maxThermalStatus:3,maxBatteryDrainPercentPerHour:12,minColdStarts:5,minMemorySamples:3});
function arr(v){return Array.isArray(v)?v:[]}
function req(v,n){const s=String(v??"").trim();if(!s)throw Error(`${n} required`);return s}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o}return v}
function hash(v){return crypto.createHash("sha256").update(JSON.stringify(stable(v))).digest("hex")}
function seal(b){return Object.freeze({...b,seal:hash(b)})}
function verify(x,s){if(!x||x.schema!==s||!H64.test(String(x.seal||"")))return false;const{seal:q,...b}=x;return q===hash(b)}
function iso(v,n){const d=new Date(req(v,n));if(Number.isNaN(d.getTime()))throw Error(`${n} invalid`);return d.toISOString()}
function finite(v,n){const x=Number(v);if(!Number.isFinite(x))throw Error(`${n} must be finite`);return x}
function percentile(xs,p){const a=xs.slice().sort((x,y)=>x-y);if(!a.length)return NaN;return a[Math.min(a.length-1,Math.max(0,Math.ceil(p*a.length)-1))]}
function hashes(v,n,min=1){const out=[...new Set(arr(v).map(x=>String(x).toLowerCase()))];if(out.length<min||out.some(x=>!H64.test(x)))throw Error(`${n} requires ${min}+ sha256 values`);return out.sort()}
function exactBuildDevice(build,device){if(!android.verifyBuildIdentity(build))throw Error("verified Android build required");if(!android.verifyDeviceProof(device))throw Error("verified Android device required")}
function same(a,b){return JSON.stringify(stable(a))===JSON.stringify(stable(b))}
function a11yFailures(scenarios,observations){const f=[];for(const k of A11Y_OBSERVATIONS)if(observations?.[k]!==true)f.push(`observation:${k}`);for(const s of A11Y_SCENARIOS)if(!scenarios.includes(s))f.push(`scenario:${s}`);return [...new Set(f)].sort()}
function perfFailures(policy,metrics){const f=[];if(metrics.coldStartSamples<policy.minColdStarts)f.push("samples:cold-start");if(metrics.pssSamples<policy.minMemorySamples)f.push("samples:memory");if(metrics.coldStartP95Ms>policy.coldStartP95MaxMs)f.push("budget:cold-start-p95");if(metrics.maxPssMb>policy.maxPssMb)f.push("budget:max-pss");if(metrics.jankPercent>policy.maxJankPercent)f.push("budget:jank");if(metrics.longSessionMinutes<policy.minLongSessionMinutes)f.push("coverage:long-session");if(metrics.thermalStatusMax>policy.maxThermalStatus)f.push("budget:thermal");if(metrics.batteryDrainPercentPerHour>policy.maxBatteryDrainPercentPerHour)f.push("budget:battery");return f.sort()}

function createAccessibilityDeviceEvidence(i={}){
  exactBuildDevice(i.build,i.device);
  const tech=req(i.assistiveTech,"assistiveTech");if(tech.toLowerCase()!=="talkback")throw Error("TalkBack evidence required for Android accessibility certification");
  const techVersion=req(i.assistiveTechVersion,"assistiveTechVersion"),capturedAt=iso(i.capturedAt,"capturedAt"),expiresAt=iso(i.expiresAt,"expiresAt");if(new Date(expiresAt)<=new Date(capturedAt))throw Error("accessibility evidence expiry invalid");
  const scenarios=[...new Set(arr(i.scenarios).map(String))].sort(),observations=Object.fromEntries(A11Y_OBSERVATIONS.map(k=>[k,i.observations?.[k]===true])),sourceArtifactSha256=hashes(i.sourceArtifactSha256,"sourceArtifactSha256",A11Y_SCENARIOS.length),failures=a11yFailures(scenarios,observations);
  const body={schema:"seven.device-evidence.accessibility.v1",version:VERSION,buildSeal:i.build.seal,branch:i.build.branch,commitSha:i.build.commitSha,artifactSha256:i.build.artifactSha256,deviceSeal:i.device.seal,deviceIdentityHash:i.device.deviceIdentityHash,environmentType:i.device.environmentType,assistiveTech:tech,assistiveTechVersion:techVersion,scenarios,observations,sourceArtifactSha256,sourceRef:req(i.sourceRef,"sourceRef"),capturedBy:req(i.capturedBy,"capturedBy"),verifier:req(i.verifier,"verifier"),capturedAt,expiresAt,evidenceTier:"RELEASE_DEVICE",failures};body.verdict=failures.length?"FAIL":"PASS";return seal(body);
}
function verifyAccessibilityDeviceEvidence(x,build,device){
  if(!verify(x,"seven.device-evidence.accessibility.v1")||x.evidenceTier!=="RELEASE_DEVICE"||!["PASS","FAIL"].includes(x.verdict)||String(x.assistiveTech||"").toLowerCase()!=="talkback")return false;
  if(build&&(!android.verifyBuildIdentity(build)||x.buildSeal!==build.seal||x.branch!==build.branch||x.commitSha!==build.commitSha||x.artifactSha256!==build.artifactSha256))return false;
  if(device&&(!android.verifyDeviceProof(device)||x.deviceSeal!==device.seal||x.deviceIdentityHash!==device.deviceIdentityHash||x.environmentType!==device.environmentType))return false;
  if(!Array.isArray(x.sourceArtifactSha256)||x.sourceArtifactSha256.length<A11Y_SCENARIOS.length||x.sourceArtifactSha256.some(h=>!H64.test(h)))return false;
  const start=new Date(x.capturedAt).getTime(),end=new Date(x.expiresAt).getTime();if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return false;
  const expected=a11yFailures(arr(x.scenarios),x.observations);return same(expected,x.failures)&&x.verdict===(expected.length?"FAIL":"PASS")&&A11Y_OBSERVATIONS.every(k=>typeof x.observations?.[k]==="boolean");
}

function createPhysicalPerformanceEvidence(i={}){
  exactBuildDevice(i.build,i.device);if(i.device.environmentType!=="PHYSICAL_DEVICE")throw Error("physical-device performance evidence required");
  const policy={...PERF_POLICY,...(i.policy||{})};for(const [k,v] of Object.entries(policy))policy[k]=finite(v,`policy.${k}`);
  const cold=arr(i.coldStartMs).map((x,j)=>finite(x,`coldStartMs[${j}]`)),mem=arr(i.pssMb).map((x,j)=>finite(x,`pssMb[${j}]`));if(cold.some(x=>x<0)||mem.some(x=>x<0))throw Error("performance samples cannot be negative");
  const metrics={coldStartSamples:cold.length,coldStartP95Ms:percentile(cold,.95),pssSamples:mem.length,maxPssMb:mem.length?Math.max(...mem):NaN,jankPercent:finite(i.jankPercent,"jankPercent"),longSessionMinutes:finite(i.longSessionMinutes,"longSessionMinutes"),thermalStatusMax:finite(i.thermalStatusMax,"thermalStatusMax"),batteryDrainPercentPerHour:finite(i.batteryDrainPercentPerHour,"batteryDrainPercentPerHour")};if(Object.values(metrics).some(x=>!Number.isFinite(x)||x<0))throw Error("performance metrics invalid");
  const failures=perfFailures(policy,metrics),sourceArtifactSha256=hashes(i.sourceArtifactSha256,"sourceArtifactSha256",4),capturedAt=iso(i.capturedAt,"capturedAt"),expiresAt=iso(i.expiresAt,"expiresAt");if(new Date(expiresAt)<=new Date(capturedAt))throw Error("performance evidence expiry invalid");
  const body={schema:"seven.device-evidence.performance.v1",version:VERSION,buildSeal:i.build.seal,branch:i.build.branch,commitSha:i.build.commitSha,artifactSha256:i.build.artifactSha256,deviceSeal:i.device.seal,deviceIdentityHash:i.device.deviceIdentityHash,environmentType:i.device.environmentType,policy,metrics,samples:{coldStartMs:cold,pssMb:mem},sourceArtifactSha256,sourceRef:req(i.sourceRef,"sourceRef"),capturedBy:req(i.capturedBy,"capturedBy"),verifier:req(i.verifier,"verifier"),capturedAt,expiresAt,evidenceTier:"PHYSICAL_DEVICE",failures};body.verdict=failures.length?"FAIL":"PASS";return seal(body);
}
function verifyPhysicalPerformanceEvidence(x,build,device){
  if(!verify(x,"seven.device-evidence.performance.v1")||x.evidenceTier!=="PHYSICAL_DEVICE"||x.environmentType!=="PHYSICAL_DEVICE"||!["PASS","FAIL"].includes(x.verdict))return false;
  if(build&&(!android.verifyBuildIdentity(build)||x.buildSeal!==build.seal||x.branch!==build.branch||x.commitSha!==build.commitSha||x.artifactSha256!==build.artifactSha256))return false;
  if(device&&(!android.verifyDeviceProof(device)||device.environmentType!=="PHYSICAL_DEVICE"||x.deviceSeal!==device.seal||x.deviceIdentityHash!==device.deviceIdentityHash))return false;
  if(!Array.isArray(x.sourceArtifactSha256)||x.sourceArtifactSha256.length<4||x.sourceArtifactSha256.some(h=>!H64.test(h)))return false;
  const cold=arr(x.samples?.coldStartMs),mem=arr(x.samples?.pssMb);if(cold.some(v=>!Number.isFinite(v)||v<0)||mem.some(v=>!Number.isFinite(v)||v<0))return false;const recomputed={coldStartSamples:cold.length,coldStartP95Ms:percentile(cold,.95),pssSamples:mem.length,maxPssMb:mem.length?Math.max(...mem):NaN,jankPercent:x.metrics?.jankPercent,longSessionMinutes:x.metrics?.longSessionMinutes,thermalStatusMax:x.metrics?.thermalStatusMax,batteryDrainPercentPerHour:x.metrics?.batteryDrainPercentPerHour};if(Object.values(recomputed).some(v=>!Number.isFinite(v)||v<0)||!same(recomputed,x.metrics))return false;
  for(const v of Object.values(x.policy||{}))if(!Number.isFinite(v))return false;const expected=perfFailures(x.policy,recomputed),start=new Date(x.capturedAt).getTime(),end=new Date(x.expiresAt).getTime();return Number.isFinite(start)&&Number.isFinite(end)&&end>start&&same(expected,x.failures)&&x.verdict===(expected.length?"FAIL":"PASS");
}

function toReadinessReceipt({evidence,producer="seven-device-evidence-ingest",producerContext="device-ingest",verifierContext}={}){
  if(verifyAccessibilityDeviceEvidence(evidence)){
    if(evidence.verdict!=="PASS")throw Error("accessibility evidence must PASS before readiness admission");return readiness.createReceipt({domain:"ACCESSIBILITY_DEVICE",branch:evidence.branch,commitSha:evidence.commitSha,artifactSha256:evidence.artifactSha256,evidenceSha256:evidence.seal,classes:[readiness.CLASSES.RELEASE_DEVICE],status:"PASS",sourceRef:evidence.sourceRef,producer,producerContext,verifier:evidence.verifier,verifierContext:req(verifierContext,"verifierContext"),capturedAt:evidence.capturedAt,expiresAt:evidence.expiresAt});
  }
  if(verifyPhysicalPerformanceEvidence(evidence)){
    if(evidence.verdict!=="PASS")throw Error("physical performance evidence must PASS before readiness admission");return readiness.createReceipt({domain:"PERFORMANCE_RESOURCE_DEVICE",branch:evidence.branch,commitSha:evidence.commitSha,artifactSha256:evidence.artifactSha256,evidenceSha256:evidence.seal,classes:[readiness.CLASSES.PHYSICAL_DEVICE],status:"PASS",sourceRef:evidence.sourceRef,producer,producerContext,verifier:evidence.verifier,verifierContext:req(verifierContext,"verifierContext"),capturedAt:evidence.capturedAt,expiresAt:evidence.expiresAt});
  }
  throw Error("unsupported or forged device evidence");
}
module.exports=Object.freeze({VERSION,A11Y_SCENARIOS,A11Y_OBSERVATIONS,PERF_POLICY,hash,createAccessibilityDeviceEvidence,verifyAccessibilityDeviceEvidence,createPhysicalPerformanceEvidence,verifyPhysicalPerformanceEvidence,toReadinessReceipt});
