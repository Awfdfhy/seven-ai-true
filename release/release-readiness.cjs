"use strict";
const crypto=require("crypto");
const VERSION="1.0.0",H64=/^[0-9a-f]{64}$/i,COMMIT=/^[0-9a-f]{40}$/i;
const CLASSES=Object.freeze({CI:"CI",GOVERNED:"GOVERNED",INDEPENDENT_REVIEW:"INDEPENDENT_REVIEW",RELEASE_DEVICE:"RELEASE_DEVICE",PHYSICAL_DEVICE:"PHYSICAL_DEVICE"});
const POLICY=Object.freeze({
  SOURCE_INTEGRITY:[CLASSES.CI],
  REGRESSION_SUITE:[CLASSES.CI],
  PRODUCTION_DEPENDENCIES:[CLASSES.CI,CLASSES.GOVERNED],
  IDENTITY_FREEZE:[CLASSES.GOVERNED,CLASSES.INDEPENDENT_REVIEW],
  ANDROID_RELEASE_VISUAL:[CLASSES.RELEASE_DEVICE,CLASSES.GOVERNED],
  ACCESSIBILITY_DEVICE:[CLASSES.RELEASE_DEVICE],
  PERFORMANCE_RESOURCE_DEVICE:[CLASSES.PHYSICAL_DEVICE],
  SEVEN_EVALS:[CLASSES.CI,CLASSES.INDEPENDENT_REVIEW],
  FINAL_RED_TEAM:[CLASSES.GOVERNED,CLASSES.INDEPENDENT_REVIEW],
  ROLLBACK_RECOVERY:[CLASSES.CI,CLASSES.GOVERNED]
});
const REQUIRED_DOMAINS=Object.freeze(Object.keys(POLICY));
function arr(v){return Array.isArray(v)?v:[]}
function req(v,n){const s=String(v??"").trim();if(!s)throw Error(`${n} required`);return s}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o}return v}
function hash(v){return crypto.createHash("sha256").update(JSON.stringify(stable(v))).digest("hex")}
function seal(b){return Object.freeze({...b,seal:hash(b)})}
function verify(x,s){if(!x||x.schema!==s||!H64.test(String(x.seal||"")))return false;const{seal:q,...b}=x;return q===hash(b)}
function iso(v,n){const d=new Date(req(v,n));if(Number.isNaN(d.getTime()))throw Error(`${n} invalid`);return d.toISOString()}
function unique(v){return [...new Set(arr(v).map(String))].sort()}
function createReceipt(i={}){
  const domain=req(i.domain,"domain");if(!POLICY[domain])throw Error("unknown readiness domain");
  const branch=req(i.branch,"branch"),commitSha=req(i.commitSha,"commitSha").toLowerCase(),artifactSha256=req(i.artifactSha256,"artifactSha256").toLowerCase(),evidenceSha256=req(i.evidenceSha256,"evidenceSha256").toLowerCase();if(!COMMIT.test(commitSha)||!H64.test(artifactSha256)||!H64.test(evidenceSha256))throw Error("invalid release identity hash");
  const classes=unique(i.classes);for(const c of classes)if(!Object.values(CLASSES).includes(c))throw Error(`unknown evidence class:${c}`);if(!classes.length)throw Error("evidence classes required");
  const status=String(i.status||"PASS");if(!["PASS","FAIL","INCONCLUSIVE"].includes(status))throw Error("status invalid");
  const producer=req(i.producer,"producer"),producerContext=req(i.producerContext,"producerContext"),verifier=req(i.verifier,"verifier"),verifierContext=req(i.verifierContext,"verifierContext");
  if(classes.includes(CLASSES.INDEPENDENT_REVIEW)&&producerContext===verifierContext)throw Error("independent review context must differ from producer context");
  const capturedAt=iso(i.capturedAt,"capturedAt"),expiresAt=iso(i.expiresAt,"expiresAt");if(new Date(expiresAt)<=new Date(capturedAt))throw Error("receipt expiry invalid");
  const body={schema:"seven.release-readiness.receipt.v1",version:VERSION,domain,branch,commitSha,artifactSha256,evidenceSha256,classes,status,sourceRef:req(i.sourceRef,"sourceRef"),producer,producerContext,verifier,verifierContext,capturedAt,expiresAt};return seal(body);
}
function verifyReceipt(x){return verify(x,"seven.release-readiness.receipt.v1")&&!!POLICY[x.domain]&&x.classes.every(c=>Object.values(CLASSES).includes(c))&&COMMIT.test(x.commitSha)&&H64.test(x.artifactSha256)&&H64.test(x.evidenceSha256)&&(!x.classes.includes(CLASSES.INDEPENDENT_REVIEW)||x.producerContext!==x.verifierContext)}
function createManifest(i={}){
  const receipts=arr(i.receipts);if(!receipts.length)throw Error("receipts required");const branch=req(i.branch,"branch"),commitSha=req(i.commitSha,"commitSha").toLowerCase(),artifactSha256=req(i.artifactSha256,"artifactSha256").toLowerCase();if(!COMMIT.test(commitSha)||!H64.test(artifactSha256))throw Error("invalid manifest identity");
  const evaluatedAt=iso(i.evaluatedAt,"evaluatedAt"),round=Number(i.round);if(![1,2].includes(round))throw Error("round must be 1 or 2");const byDomain=new Map(),failures=[],missing=[];
  for(const r of receipts){if(!verifyReceipt(r)){failures.push("invalid-receipt");continue}if(r.branch!==branch||r.commitSha!==commitSha||r.artifactSha256!==artifactSha256){failures.push(`release-identity-drift:${r.domain}`);continue}if(byDomain.has(r.domain)){failures.push(`duplicate-domain:${r.domain}`);continue}byDomain.set(r.domain,r);if(new Date(r.expiresAt)<new Date(evaluatedAt))failures.push(`stale:${r.domain}`);if(r.status!=="PASS")failures.push(`non-pass:${r.domain}`);const have=new Set(r.classes);for(const c of POLICY[r.domain])if(!have.has(c))failures.push(`missing-class:${r.domain}:${c}`)}
  for(const d of REQUIRED_DOMAINS)if(!byDomain.has(d))missing.push(d);
  const body={schema:"seven.release-readiness.manifest.v1",version:VERSION,round,branch,commitSha,artifactSha256,evaluatedAt,receiptSeals:Object.fromEntries([...byDomain.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([d,r])=>[d,r.seal])),evidenceHashes:Object.fromEntries([...byDomain.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([d,r])=>[d,r.evidenceSha256])),verifierContexts:Object.fromEntries([...byDomain.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([d,r])=>[d,r.verifierContext])),missing:missing.sort(),failures:[...new Set(failures)].sort()};body.verdict=body.failures.length?"BLOCK":body.missing.length?"INCONCLUSIVE":"PASS";return seal(body);
}
function verifyManifest(x){return verify(x,"seven.release-readiness.manifest.v1")&&[1,2].includes(x.round)&&["PASS","BLOCK","INCONCLUSIVE"].includes(x.verdict)}
function createSaturationPair(i={}){
  const a=i.round1,b=i.round2;if(!verifyManifest(a)||!verifyManifest(b))throw Error("verified saturation manifests required");const failures=[];if(a.round!==1||b.round!==2)failures.push("round-order-invalid");if(a.verdict!=="PASS"||b.verdict!=="PASS")failures.push("both-rounds-must-pass");for(const k of ["branch","commitSha","artifactSha256"])if(a[k]!==b[k])failures.push(`release-drift:${k}`);if(new Date(b.evaluatedAt)<=new Date(a.evaluatedAt))failures.push("round2-must-be-later");if(a.seal===b.seal)failures.push("duplicate-round-evidence");
  for(const d of ["IDENTITY_FREEZE","SEVEN_EVALS","FINAL_RED_TEAM"]){if(a.evidenceHashes?.[d]===b.evidenceHashes?.[d])failures.push(`independent-evidence-not-refreshed:${d}`);if(a.verifierContexts?.[d]===b.verifierContexts?.[d])failures.push(`independent-context-not-refreshed:${d}`)}
  const body={schema:"seven.release-readiness.saturation-pair.v1",version:VERSION,branch:a.branch,commitSha:a.commitSha,artifactSha256:a.artifactSha256,round1Seal:a.seal,round2Seal:b.seal,failures:[...new Set(failures)].sort()};body.verdict=body.failures.length?"BLOCK":"SATURATION_2_OF_2";return seal(body);
}
function verifySaturationPair(x){return verify(x,"seven.release-readiness.saturation-pair.v1")&&["BLOCK","SATURATION_2_OF_2"].includes(x.verdict)}
module.exports=Object.freeze({VERSION,CLASSES,POLICY,REQUIRED_DOMAINS,hash,createReceipt,verifyReceipt,createManifest,verifyManifest,createSaturationPair,verifySaturationPair});
