"use strict";

const crypto=require("crypto");

const ACCESS_CLASSES=Object.freeze(["DURABLE_FREE_TIER","TRIAL_FREE","TEMPORARY_PROMO","SIGNUP_CREDIT","LOCAL_SELF_HOSTED","PAID","UNKNOWN"]);
const HEALTH=Object.freeze(["HEALTHY","DEGRADED","DOWN","UNKNOWN"]);
const QUOTA=Object.freeze(["AVAILABLE","LIMITED","EXHAUSTED","UNKNOWN"]);
const PRICING=Object.freeze(["FREE","LOCAL","PAID","UNKNOWN"]);
const CAPABILITIES=Object.freeze(["chat","coding","reasoning","vision","tools","json","longContext","local"]);
const HASH64=/^[0-9a-f]{64}$/i;

function req(v,n){const s=String(v??"").trim();if(!s)throw new Error(`${n} required`);return s}
function finite(v,n){const x=Number(v);if(!Number.isFinite(x))throw new Error(`${n} must be finite`);return x}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o}return v}
function sha(v){return crypto.createHash("sha256").update(JSON.stringify(stable(v))).digest("hex")}
function seal(body){return Object.freeze({...body,seal:sha(body)})}
function verifySealed(x,schema){if(!x||x.schema!==schema||!HASH64.test(String(x.seal||"")))return false;const {seal:s,...body}=x;return s===sha(body)}
function caps(input={}){const out={};for(const k of CAPABILITIES)out[k]=input[k]===true;return Object.freeze(out)}
function enumValue(v,allowed,n){const s=String(v||"").toUpperCase();if(!allowed.includes(s))throw new Error(`${n} invalid`);return s}
function iso(v,n){const s=req(v,n),t=Date.parse(s);if(!Number.isFinite(t))throw new Error(`${n} invalid`);return new Date(t).toISOString()}

function createProviderAdapterContract(input={}){
  const provider=req(input.provider,"provider"),adapterId=req(input.adapterId,"adapterId"),adapterRevision=req(input.adapterRevision,"adapterRevision");
  const requestSchemaHash=req(input.requestSchemaHash,"requestSchemaHash").toLowerCase(),responseSchemaHash=req(input.responseSchemaHash,"responseSchemaHash").toLowerCase(),errorMapHash=req(input.errorMapHash,"errorMapHash").toLowerCase();
  if(!HASH64.test(requestSchemaHash)||!HASH64.test(responseSchemaHash)||!HASH64.test(errorMapHash))throw new Error("adapter contract hashes must be sha256");
  const endpointKinds=[...new Set((Array.isArray(input.endpointKinds)?input.endpointKinds:[]).map(x=>req(x,"endpointKind")))].sort();if(!endpointKinds.length)throw new Error("endpointKinds required");
  const credentialMode=String(input.credentialMode||"OPTIONAL").toUpperCase();if(!["NONE","OPTIONAL","REQUIRED"].includes(credentialMode))throw new Error("credentialMode invalid");
  const body={schema:"seven.provider-adapter-contract.v1",provider,adapterId,adapterRevision,capabilities:caps(input.capabilities),streaming:input.streaming===true,cancellation:input.cancellation===true,endpointKinds,credentialMode,requestSchemaHash,responseSchemaHash,errorMapHash};
  return seal(body);
}
function verifyProviderAdapterContract(x){return verifySealed(x,"seven.provider-adapter-contract.v1")}

function createEndpointObservation({contract,deployment,observedAt,observer,accessClass,pricing,health,quota,quotaRemaining=null,quotaResetAt="",termsUrl,termsHash,capabilities,contextWindow,maxOutputTokens,supportsStreaming,supportsCancellation,latencyMs=null}={}){
  if(!verifyProviderAdapterContract(contract))throw new Error("verified adapter contract required");
  if(!deployment?.revision?.id||!deployment?.endpoint?.id)throw new Error("deployment identity required");
  if(contract.provider!==deployment.provider)throw new Error("adapter provider/deployment provider mismatch");
  const access=enumValue(accessClass,ACCESS_CLASSES,"accessClass"),price=enumValue(pricing,PRICING,"pricing"),healthState=enumValue(health,HEALTH,"health"),quotaState=enumValue(quota,QUOTA,"quota");
  const th=req(termsHash,"termsHash").toLowerCase();if(!HASH64.test(th))throw new Error("termsHash must be sha256");
  const qr=quotaRemaining==null?null:finite(quotaRemaining,"quotaRemaining");if(qr!=null&&qr<0)throw new Error("quotaRemaining cannot be negative");
  const cw=Math.max(0,finite(contextWindow??0,"contextWindow")),mo=Math.max(0,finite(maxOutputTokens??0,"maxOutputTokens")),lm=latencyMs==null?null:Math.max(0,finite(latencyMs,"latencyMs"));
  const observedCaps=caps(capabilities||{});
  const body={schema:"seven.provider-endpoint-observation.v1",provider:contract.provider,adapterSeal:contract.seal,adapterId:contract.adapterId,adapterRevision:contract.adapterRevision,revisionId:deployment.revision.id,endpointId:deployment.endpoint.id,observedAt:iso(observedAt,"observedAt"),observer:req(observer,"observer"),accessClass:access,pricing:price,health:healthState,quota:quotaState,quotaRemaining:qr,quotaResetAt:quotaResetAt?iso(quotaResetAt,"quotaResetAt"):"",termsUrl:req(termsUrl,"termsUrl"),termsHash:th,capabilities:observedCaps,contextWindow:cw,maxOutputTokens:mo,supportsStreaming:supportsStreaming===true,supportsCancellation:supportsCancellation===true,latencyMs:lm};
  return seal(body);
}
function verifyEndpointObservation(x,{contract,deployment}={}){
  if(!verifySealed(x,"seven.provider-endpoint-observation.v1"))return false;
  if(contract&&(!verifyProviderAdapterContract(contract)||x.adapterSeal!==contract.seal||x.provider!==contract.provider))return false;
  if(deployment&&(x.revisionId!==deployment?.revision?.id||x.endpointId!==deployment?.endpoint?.id||x.provider!==deployment?.provider))return false;
  return true;
}

function observationFreshness(observation,{now=Date.now(),maxAgeMs=6*60*60*1000,maxFutureSkewMs=5*60*1000}={}){
  if(!verifyEndpointObservation(observation))return {valid:false,fresh:false,reason:"invalid-observation"};
  const at=Date.parse(observation.observedAt),n=now instanceof Date?now.getTime():Number(now);const nowMs=Number.isFinite(n)?n:Date.now(),age=nowMs-at;
  if(age< -Math.max(0,Number(maxFutureSkewMs)||0))return {valid:false,fresh:false,reason:"future-observation",ageMs:age};
  if(age>Math.max(0,Number(maxAgeMs)||0))return {valid:true,fresh:false,reason:"stale-observation",ageMs:age};
  return {valid:true,fresh:true,reason:"fresh",ageMs:Math.max(0,age)};
}

function qualifyAdapterBinding({contract,deployment,observation,requiredCapabilities=[],requiredContextTokens=0,requiredOutputTokens=0,requireStreaming=false,requireCancellation=false,now=Date.now(),maxAgeMs}={}){
  const failures=[],uncertainties=[];
  if(!verifyProviderAdapterContract(contract))failures.push("invalid-adapter-contract");
  if(!verifyEndpointObservation(observation,{contract,deployment}))failures.push("invalid-endpoint-observation");
  if(failures.length)return Object.freeze({verdict:"FAIL",failures,uncertainties});
  const fresh=observationFreshness(observation,{now,maxAgeMs:maxAgeMs==null?6*60*60*1000:maxAgeMs});if(!fresh.valid)failures.push(fresh.reason);else if(!fresh.fresh)failures.push("endpoint-observation-stale");
  if(observation.health==="DOWN")failures.push("endpoint-down");else if(observation.health==="UNKNOWN")uncertainties.push("health-unknown");
  if(observation.quota==="EXHAUSTED"||(observation.quota==="LIMITED"&&observation.quotaRemaining!=null&&observation.quotaRemaining<=0))failures.push("quota-exhausted");else if(observation.quota==="UNKNOWN")uncertainties.push("quota-unknown");
  if(!["FREE","LOCAL"].includes(observation.pricing))failures.push(observation.pricing==="PAID"?"paid-endpoint":"pricing-unknown");
  for(const cap of requiredCapabilities)if(!observation.capabilities[cap])failures.push(`missing-capability:${cap}`);
  if(Number(requiredContextTokens)>observation.contextWindow)failures.push("context-window-insufficient");
  if(Number(requiredOutputTokens)>0&&observation.maxOutputTokens>0&&Number(requiredOutputTokens)>observation.maxOutputTokens)failures.push("output-window-insufficient");
  if(requireStreaming&&(!contract.streaming||!observation.supportsStreaming))failures.push("streaming-not-proven");
  if(requireCancellation&&(!contract.cancellation||!observation.supportsCancellation))failures.push("cancellation-not-proven");
  return Object.freeze({verdict:failures.length?"FAIL":"PASS",failures:[...new Set(failures)].sort(),uncertainties:[...new Set(uncertainties)].sort(),freshness:fresh});
}

function durableChampionAccess(observation){
  if(!verifyEndpointObservation(observation))return false;
  return observation.accessClass==="DURABLE_FREE_TIER"||observation.accessClass==="LOCAL_SELF_HOSTED";
}
function opportunisticFreeAccess(observation){
  if(!verifyEndpointObservation(observation))return false;
  return ["DURABLE_FREE_TIER","LOCAL_SELF_HOSTED","TRIAL_FREE","TEMPORARY_PROMO","SIGNUP_CREDIT"].includes(observation.accessClass)&&["FREE","LOCAL"].includes(observation.pricing);
}

module.exports=Object.freeze({ACCESS_CLASSES,HEALTH,QUOTA,PRICING,CAPABILITIES,sha,createProviderAdapterContract,verifyProviderAdapterContract,createEndpointObservation,verifyEndpointObservation,observationFreshness,qualifyAdapterBinding,durableChampionAccess,opportunisticFreeAccess});
