"use strict";

const DIMS=Object.freeze(["reasoningUnits","retrievalUnits","contextTokens","toolCalls","verificationPasses","candidates","retries","concurrency","recoveryReserve"]);
const ACTIONS=Object.freeze(["CONTINUE","DEEPEN","BROADEN","SHIFT","PIVOT","VERIFY_NOW","EARLY_EXIT","ABANDON_AS_INCONCLUSIVE"]);
const PREFS=new Set(["FAST","AUTO","MAX_QUALITY"]);
function n(v,f=0){const x=Number(v);return Number.isFinite(x)?x:f;}function c01(v){return Math.max(0,Math.min(1,n(v)));}function risk(v){const k=String(v??"").toLowerCase(),m={low:.15,medium:.45,high:.75,critical:1};return k in m?m[k]:c01(v);}function vector(input={}){const out={};for(const d of DIMS)out[d]=Math.max(0,Math.floor(n(input[d],0)));return Object.freeze(out);}function add(a,b){const x={};for(const d of DIMS)x[d]=n(a[d])+n(b[d]);return vector(x);}function sub(a,b){const x={};for(const d of DIMS)x[d]=Math.max(0,n(a[d])-n(b[d]));return vector(x);}function fits(need,cap){return DIMS.every(d=>n(need[d])<=n(cap[d]));}

function resourceCeiling(resource={}){
  if(resource.max)return vector(resource.max);
  const tier=String(resource.tier||"balanced").toLowerCase();
  if(tier==="lite")return vector({reasoningUnits:4,retrievalUnits:4,contextTokens:9000,toolCalls:6,verificationPasses:3,candidates:2,retries:2,concurrency:1,recoveryReserve:2});
  if(tier==="full")return vector({reasoningUnits:12,retrievalUnits:12,contextTokens:32000,toolCalls:18,verificationPasses:5,candidates:6,retries:4,concurrency:4,recoveryReserve:5});
  return vector({reasoningUnits:8,retrievalUnits:8,contextTokens:18000,toolCalls:10,verificationPasses:4,candidates:4,retries:3,concurrency:2,recoveryReserve:3});
}

function mandatoryFloor(task={}){
  const r=risk(task.risk),consequence=c01(task.consequence),high=Math.max(r,consequence),side=task.sideEffects===true||n(task.sideEffectRisk)>0;
  return vector({
    reasoningUnits:high>=.95?3:high>=.7?2:1,
    retrievalUnits:task.freshnessNeed||task.requiresEvidence?1:0,
    contextTokens:Math.max(0,n(task.requiredContextTokens,0)),
    toolCalls:task.requiresTools?1:0,
    verificationPasses:high>=.95?3:high>=.7?2:task.verificationRequired===false?0:1,
    candidates:high>=.95?2:1,
    retries:side?1:0,
    concurrency:1,
    recoveryReserve:side?(high>=.7?2:1):0
  });
}

function allocateCompute({task={},resource={},preference="AUTO"}={}){
  const pref=PREFS.has(String(preference).toUpperCase())?String(preference).toUpperCase():"AUTO",ceiling=resourceCeiling(resource),floor=mandatoryFloor(task);
  if(!fits(floor,ceiling))return {status:"BLOCKED",reason:"mandatory-floor-exceeds-resource-ceiling",floor,ceiling,budget:null,preference:pref};
  const difficulty=c01(task.difficulty??task.complexity),r=risk(task.risk),consequence=c01(task.consequence),fresh=c01(task.freshnessNeed),tools=c01(task.toolDepth),horizon=c01(task.longHorizon),failure=c01(task.recentFailureRate);
  const score=difficulty*.28+r*.16+consequence*.2+fresh*.1+tools*.1+horizon*.1+failure*.06,mult=pref==="FAST"?.65:pref==="MAX_QUALITY"?1.25:1;
  const desired=vector({reasoningUnits:Math.ceil((1+score*8)*mult),retrievalUnits:Math.ceil((fresh*6+horizon*2)*mult),contextTokens:Math.ceil(Math.max(floor.contextTokens,2000+(difficulty+horizon)*7000)*Math.min(mult,1.15)),toolCalls:Math.ceil((tools*8+(task.requiresTools?1:0))*mult),verificationPasses:Math.ceil((1+Math.max(r,consequence)*3)*Math.min(mult,1.2)),candidates:Math.ceil((1+difficulty*4)*mult),retries:Math.ceil((failure*3+(task.sideEffects?1:0))*Math.min(mult,1.1)),concurrency:Math.ceil(1+(difficulty>.55?1:0)+(horizon>.75?1:0)),recoveryReserve:floor.recoveryReserve});
  const out={};for(const d of DIMS)out[d]=Math.min(ceiling[d],Math.max(floor[d],desired[d]));
  return {status:"PASS",reason:"deterministic-budget",score,preference:pref,floor,ceiling,budget:vector(out),backgroundAllowed:false};
}

function createBudgetPool(budget){let remaining=vector(budget),seq=0;return Object.freeze({
  allocate(request={},meta={}){const need=vector(request);if(!fits(need,remaining))return {allowed:false,reason:"child-lease-exceeds-parent",remaining};remaining=sub(remaining,need);seq++;return {allowed:true,lease:Object.freeze({id:`lease-${seq}`,budget:need,purpose:String(meta.purpose||"task"),parent:String(meta.parent||"root")}),remaining};},
  release(lease){if(!lease||!lease.budget)throw new Error("lease required");const next={};for(const d of DIMS)next[d]=Math.min(n(budget[d]),n(remaining[d])+n(lease.budget[d]));remaining=vector(next);return remaining;},
  snapshot(){return {capacity:vector(budget),remaining,used:sub(vector(budget),remaining)}}
});}

function verifyReserve(plan,consumed={}){if(!plan||plan.status!=="PASS")return {safe:false,reason:"invalid-plan"};const b=plan.budget,f=plan.floor;const verificationLeft=n(b.verificationPasses)-n(consumed.verificationPasses),recoveryLeft=n(b.recoveryReserve)-n(consumed.recoveryReserve);if(verificationLeft<f.verificationPasses)return {safe:false,reason:"verification-reserve-encroached"};if(recoveryLeft<f.recoveryReserve)return {safe:false,reason:"recovery-reserve-encroached"};return {safe:true,reason:"protected-reserves-intact"};}

function nextComputeAction({checkpoint={},plan}={}){
  if(!plan||plan.status!=="PASS")return {action:"ABANDON_AS_INCONCLUSIVE",reason:"no-valid-compute-plan"};
  const effectsResolved=checkpoint.sideEffectsResolved!==false,verified=checkpoint.verificationPassed===true,done=checkpoint.successCriteriaMet===true;
  if(done&&verified&&effectsResolved)return {action:"EARLY_EXIT",reason:"verified-success"};
  if(done&&!verified)return {action:"VERIFY_NOW",reason:"success-awaits-verification"};
  if(!effectsResolved&&checkpoint.cancelRequested===true)return {action:"VERIFY_NOW",reason:"reconcile-side-effects-before-exit"};
  const noProgress=Math.max(0,n(checkpoint.noProgressCount,0)),retriesLeft=Math.max(0,n(checkpoint.retriesLeft,plan.budget.retries));
  if(noProgress>=2&&retriesLeft<=0)return {action:"ABANDON_AS_INCONCLUSIVE",reason:"bounded-no-progress"};
  if(checkpoint.evidenceGap===true)return {action:"BROADEN",reason:"evidence-gap"};
  if(checkpoint.routeFailure===true)return {action:"SHIFT",reason:"route-failure"};
  if(noProgress>=2)return {action:"PIVOT",reason:"diminishing-returns"};
  if(c01(checkpoint.verifiedUtilityGain)<.08&&n(checkpoint.steps,0)>1)return {action:"VERIFY_NOW",reason:"low-marginal-verified-utility"};
  if(checkpoint.uncertaintyHigh===true)return {action:"DEEPEN",reason:"high-uncertainty"};
  return {action:"CONTINUE",reason:"useful-progress"};
}

function marginalUtility({before={},after={},cost={}}={}){const gain=Math.max(0,c01(after.verifiedSuccess)-c01(before.verifiedSuccess)),uncertaintyGain=Math.max(0,c01(before.uncertainty)-c01(after.uncertainty)),resource=Math.max(1,n(cost.reasoningUnits)+n(cost.retrievalUnits)+n(cost.toolCalls)+n(cost.verificationPasses));return (gain*.7+uncertaintyGain*.3)/resource;}

module.exports={DIMS,ACTIONS,vector,add,sub,fits,risk,resourceCeiling,mandatoryFloor,allocateCompute,createBudgetPool,verifyReserve,nextComputeAction,marginalUtility};
