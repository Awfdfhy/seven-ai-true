"use strict";

const crypto = require("crypto");
const { verifyFreeProof } = require("./model-registry.cjs");

const CAPABILITIES = Object.freeze(["chat","coding","reasoning","vision","tools","json","longContext","local"]);
const HEALTH = new Set(["HEALTHY","DEGRADED","DOWN","UNKNOWN"]);
const QUOTA = new Set(["AVAILABLE","LIMITED","EXHAUSTED","UNKNOWN"]);
const PRICING = new Set(["FREE","LOCAL","PAID","UNKNOWN"]);
const QUALIFICATION = new Set(["VERIFIED","PROVISIONAL","UNVERIFIED","REJECTED"]);

function text(v){return typeof v === "string" ? v.trim() : "";}
function num(v,f=0){const n=Number(v);return Number.isFinite(n)?n:f;}
function clamp01(v){return Math.max(0,Math.min(1,num(v,0)));}
function hash(...parts){return crypto.createHash("sha256").update(parts.map(x=>String(x??"").toLowerCase()).join("::")).digest("hex").slice(0,24);}
function isoMs(v){const n=Date.parse(v);return Number.isFinite(n)?n:null;}
function nowMs(v){if(v instanceof Date)return v.getTime();if(typeof v === "number"&&Number.isFinite(v))return v;return isoMs(v)||Date.now();}
function freeze(v){return Object.freeze(v);}
function capabilitySet(record, endpoint){const out={};for(const k of CAPABILITIES)out[k]=Boolean(endpoint?.capabilities?.[k] ?? record?.capabilities?.[k]);return freeze(out);}

function createDeployment({record,family,revision,endpoint={}}={}){
  if(!record||!record.id)throw new Error("normalized model record required");
  const provider=text(record.provider);const familyName=text(family)||text(record.family)||text(record.model);const revisionName=text(revision)||text(record.revision)||text(record.model);
  if(!provider||!familyName||!revisionName)throw new Error("provider family and revision required");
  const familyId=`family-${hash(provider,familyName)}`;
  const revisionId=`revision-${hash(familyId,revisionName)}`;
  const endpointName=text(endpoint.id)||text(endpoint.deployment)||text(endpoint.url)||"default";
  const endpointId=`endpoint-${hash(provider,revisionId,endpointName)}`;
  const proofClass=record.freeProof&&record.freeProof.class;
  const inferredPricing=proofClass==="OPEN_WEIGHTS_LOCAL"?"LOCAL":proofClass==="FREE_API_TIER"||proofClass==="ZERO_COST_HOSTED"?"FREE":"UNKNOWN";
  const pricing=PRICING.has(String(endpoint.pricing||"").toUpperCase())?String(endpoint.pricing).toUpperCase():inferredPricing;
  const health=HEALTH.has(String(endpoint.health?.status||endpoint.health||"").toUpperCase())?String(endpoint.health?.status||endpoint.health).toUpperCase():"UNKNOWN";
  const quota=QUOTA.has(String(endpoint.quota?.status||endpoint.quota||"").toUpperCase())?String(endpoint.quota?.status||endpoint.quota).toUpperCase():"UNKNOWN";
  const qualification=QUALIFICATION.has(String(endpoint.qualification||"").toUpperCase())?String(endpoint.qualification).toUpperCase():"UNVERIFIED";
  return freeze({
    schemaVersion:1,provider,family:freeze({id:familyId,name:familyName}),revision:freeze({id:revisionId,name:revisionName,modelAlias:text(record.model),recordId:record.id}),
    endpoint:freeze({id:endpointId,name:endpointName,url:text(endpoint.url),pricing,quota,quotaRemaining:endpoint.quota&&Number.isFinite(Number(endpoint.quota.remaining))?Number(endpoint.quota.remaining):null,quotaResetAt:text(endpoint.quota&&endpoint.quota.resetAt),health,healthObservedAt:text(endpoint.health&&endpoint.health.observedAt),qualification}),
    capabilities:capabilitySet(record,endpoint),contextWindow:Math.max(0,num(endpoint.contextWindow,record.contextWindow||0)),maxOutputTokens:Math.max(0,num(endpoint.maxOutputTokens,record.maxOutputTokens||0)),tokenizerId:text(endpoint.tokenizerId)||text(record.tokenizerId)||"unknown",record
  });
}

function proofFreshness(record,{now=Date.now(),maxAgeMs=7*24*60*60*1000}={}){
  const base=verifyFreeProof(record);if(!base.valid)return {valid:false,fresh:false,ageMs:null,reasons:[...base.reasons]};
  const at=isoMs(record.freeProof&&record.freeProof.verifiedAt);if(at===null)return {valid:false,fresh:false,ageMs:null,reasons:["invalid_verified_at"]};
  const age=Math.max(0,nowMs(now)-at);const fresh=maxAgeMs<=0||age<=maxAgeMs;
  return {valid:fresh,fresh,ageMs:age,reasons:fresh?[]:["free_proof_stale"]};
}

function hardEligibility(deployment,task={},opts={}){
  if(!deployment||!deployment.record)return {eligible:false,reasons:["missing_deployment"],uncertainties:[]};
  const reasons=[],uncertainties=[];
  const proof=proofFreshness(deployment.record,{now:opts.now,maxAgeMs:opts.freeProofMaxAgeMs==null?7*24*60*60*1000:opts.freeProofMaxAgeMs});
  if(!proof.valid)reasons.push(...proof.reasons);
  if(!["VERIFIED","ACTIVE"].includes(deployment.record.status))reasons.push("model_not_verified");
  if(!["FREE","LOCAL"].includes(deployment.endpoint.pricing))reasons.push(deployment.endpoint.pricing==="PAID"?"paid_endpoint":"pricing_unknown");
  if(deployment.endpoint.health==="DOWN")reasons.push("endpoint_down");else if(deployment.endpoint.health==="UNKNOWN")uncertainties.push("health_unknown");
  if(deployment.endpoint.quota==="EXHAUSTED")reasons.push("quota_exhausted");else if(deployment.endpoint.quota==="UNKNOWN")uncertainties.push("quota_unknown");
  if(deployment.endpoint.qualification!=="VERIFIED")reasons.push("endpoint_not_qualified");
  for(const cap of Array.isArray(task.requiredCapabilities)?task.requiredCapabilities:[])if(!deployment.capabilities[cap])reasons.push(`missing_capability:${cap}`);
  const requiredContext=Math.max(0,num(task.requiredContextTokens,0));if(requiredContext&&deployment.contextWindow<requiredContext)reasons.push("context_window_insufficient");
  const requiredOutput=Math.max(0,num(task.requiredOutputTokens,0));if(requiredOutput&&deployment.maxOutputTokens&&deployment.maxOutputTokens<requiredOutput)reasons.push("output_window_insufficient");
  return {eligible:reasons.length===0,reasons:[...new Set(reasons)],uncertainties:[...new Set(uncertainties)],proof,unlimited:false};
}

function outcomeScore(outcome={}){
  if(outcome.verified!==true)return null;
  const quality=clamp01(outcome.quality),reliability=clamp01(outcome.reliability),efficiency=clamp01(outcome.efficiency),latency=clamp01(outcome.latencyScore==null?0.5:outcome.latencyScore);
  return quality*.42+reliability*.33+efficiency*.15+latency*.10;
}
function aggregateVerifiedOutcomes(rows=[],revisionId){const valid=rows.filter(x=>x&&x.verified===true&&x.revisionId===revisionId).map(outcomeScore).filter(x=>x!==null);return valid.length?valid.reduce((a,b)=>a+b,0)/valid.length:null;}

function rankEligible(deployments,task,opts={}){
  const rows=[];for(const d of deployments||[]){const gate=hardEligibility(d,task,opts);if(!gate.eligible)continue;const verified=aggregateVerifiedOutcomes(opts.outcomes||[],d.revision.id);const health=d.endpoint.health==="HEALTHY"?1:d.endpoint.health==="DEGRADED"?.65:.4;const quota=d.endpoint.quota==="AVAILABLE"?1:d.endpoint.quota==="LIMITED"?.7:.5;const evidence=verified==null?.5:verified;const score=evidence*.65+health*.22+quota*.08+(d.endpoint.pricing==="LOCAL"?.05:.03);rows.push({deployment:d,gate,score,verifiedOutcomeScore:verified});}
  rows.sort((a,b)=>b.score-a.score||a.deployment.revision.id.localeCompare(b.deployment.revision.id)||a.deployment.endpoint.id.localeCompare(b.deployment.endpoint.id));return rows;
}

function leaseValid(lease,deployments,task,opts={}){
  if(!lease||!lease.endpointId||nowMs(opts.now)>=num(lease.expiresAt,0))return false;
  const d=(deployments||[]).find(x=>x.endpoint.id===lease.endpointId&&x.revision.id===lease.revisionId);return Boolean(d&&hardEligibility(d,task,opts).eligible);
}
function createRouteLease(decision,{now=Date.now(),ttlMs=5*60*1000}={}){
  if(!decision||decision.status!=="PASS"||!decision.selected)throw new Error("passing route decision required");const t=nowMs(now);
  return freeze({schemaVersion:1,revisionId:decision.selected.revision.id,endpointId:decision.selected.endpoint.id,issuedAt:t,expiresAt:t+Math.max(1000,num(ttlMs,300000)),reason:"route-stability"});
}

function selectRoute({deployments=[],task={},championRevisionId=null,lease=null,outcomes=[],now=Date.now(),freeProofMaxAgeMs}={}){
  const opts={outcomes,now,freeProofMaxAgeMs};
  if(leaseValid(lease,deployments,task,opts)){const d=deployments.find(x=>x.endpoint.id===lease.endpointId&&x.revision.id===lease.revisionId);return {status:"PASS",selected:d,reason:"lease-retained",leaseRetained:true,ranked:[]};}
  const ranked=rankEligible(deployments,task,opts);if(!ranked.length)return {status:"NO_ELIGIBLE_MODEL",selected:null,reason:"hard-eligibility-empty",leaseRetained:false,ranked:[]};
  let winner=ranked[0];
  if(championRevisionId){const champion=ranked.find(x=>x.deployment.revision.id===championRevisionId);if(champion&&winner.score-champion.score<.08)winner=champion;}
  return {status:"PASS",selected:winner.deployment,reason:winner.deployment.revision.id===championRevisionId?"champion-retained":"best-verified-eligible",leaseRetained:false,ranked:ranked.map(x=>({revisionId:x.deployment.revision.id,endpointId:x.deployment.endpoint.id,score:x.score,uncertainties:x.gate.uncertainties}))};
}

function failoverEndpoint({failed,deployments=[],task={},now=Date.now(),freeProofMaxAgeMs}={}){
  if(!failed)return {status:"NO_ELIGIBLE_MODEL",selected:null};const same=(deployments||[]).filter(x=>x.revision.id===failed.revision.id&&x.endpoint.id!==failed.endpoint.id);
  const ranked=rankEligible(same,task,{now,freeProofMaxAgeMs});if(ranked.length)return {status:"PASS",selected:ranked[0].deployment,reason:"same-revision-endpoint-failover"};
  return {status:"NO_SAME_REVISION_ENDPOINT",selected:null,reason:"cross-model-route-required"};
}

function contextHandshake({manifest,deployment,requiredContextTokens=0,tokenizerId}={}){
  if(!deployment)return {status:"BLOCKED",reason:"missing-deployment"};
  if(Math.max(0,num(requiredContextTokens,0))>deployment.contextWindow)return {status:"BLOCKED",reason:"context-window-insufficient"};
  const expectedTokenizer=text(tokenizerId)||deployment.tokenizerId;
  if(!manifest)return {status:"RECOMPILE",reason:"missing-context-manifest",modelProfileId:deployment.revision.id,tokenizerId:expectedTokenizer};
  if(manifest.modelProfileId!==deployment.revision.id)return {status:"RECOMPILE",reason:"model-profile-changed",modelProfileId:deployment.revision.id,tokenizerId:expectedTokenizer};
  if(expectedTokenizer!=="unknown"&&manifest.tokenizerId!==expectedTokenizer)return {status:"RECOMPILE",reason:"tokenizer-changed",modelProfileId:deployment.revision.id,tokenizerId:expectedTokenizer};
  return {status:"PASS",reason:"context-compatible",modelProfileId:deployment.revision.id,tokenizerId:expectedTokenizer};
}

function normalizeProviderError(error={}){const code=String(error.code||error.status||"").toUpperCase(),message=text(error.message)||"provider error";let kind="UNKNOWN";if(["401","403","AUTH","UNAUTHORIZED"].includes(code))kind="AUTH";else if(["429","RATE_LIMIT","QUOTA"].includes(code))kind="RATE_LIMIT";else if(["408","TIMEOUT","ETIMEDOUT"].includes(code))kind="TIMEOUT";else if(["400","INVALID_REQUEST"].includes(code))kind="INVALID_REQUEST";else if(["500","502","503","504","UNAVAILABLE"].includes(code))kind="UNAVAILABLE";return freeze({kind,code,message,retryable:["RATE_LIMIT","TIMEOUT","UNAVAILABLE"].includes(kind)});}

module.exports={CAPABILITIES,createDeployment,proofFreshness,hardEligibility,outcomeScore,aggregateVerifiedOutcomes,rankEligible,selectRoute,createRouteLease,leaseValid,failoverEndpoint,contextHandshake,normalizeProviderError};
