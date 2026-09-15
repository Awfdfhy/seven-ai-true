"use strict";

const crypto=require("crypto");
const {verifyFreeProof}=require("./model-registry.cjs");
const modelFabric=require("./model-fabric.cjs");
const adapter=require("./provider-adapter-contract.cjs");

const HASH64=/^[0-9a-f]{64}$/i;
const BENCHMARK_SOURCE_KINDS=Object.freeze(["INDEPENDENT_BENCHMARK","PROVIDER_BENCHMARK","MODEL_CARD","INTERNAL"]);
const LEASE_ROLES=Object.freeze(["CHAMPION","OPPORTUNISTIC"]);

function req(v,n){const s=String(v??"").trim();if(!s)throw new Error(`${n} required`);return s}
function finite(v,n){const x=Number(v);if(!Number.isFinite(x))throw new Error(`${n} must be finite`);return x}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o}return v}
function sha(v){return crypto.createHash("sha256").update(JSON.stringify(stable(v))).digest("hex")}
function seal(body){return Object.freeze({...body,seal:sha(body)})}
function verifySealed(x,schema){if(!x||x.schema!==schema||!HASH64.test(String(x.seal||"")))return false;const {seal:s,...body}=x;return s===sha(body)}
function iso(v,n){const s=req(v,n),t=Date.parse(s);if(!Number.isFinite(t))throw new Error(`${n} invalid`);return new Date(t).toISOString()}
function nowMs(v){if(v instanceof Date)return v.getTime();const n=Number(v);return Number.isFinite(n)?n:Date.now()}
function exactDeployment(d){if(!d?.revision?.id||!d?.endpoint?.id||!d?.record?.id)throw new Error("exact deployment required");return d}

function createBenchmarkObservation(input={}){
  const deployment=exactDeployment(input.deployment),sourceKind=String(input.sourceKind||"").toUpperCase();if(!BENCHMARK_SOURCE_KINDS.includes(sourceKind))throw new Error("sourceKind invalid");
  const methodologyFingerprint=req(input.methodologyFingerprint,"methodologyFingerprint").toLowerCase();if(!HASH64.test(methodologyFingerprint))throw new Error("methodologyFingerprint must be sha256");
  const indexName=req(input.indexName,"indexName"),indexRevision=req(input.indexRevision,"indexRevision"),score=finite(input.score,"score"),sourceId=req(input.sourceId,"sourceId"),sourceUrl=req(input.sourceUrl,"sourceUrl"),independenceGroup=req(input.independenceGroup,"independenceGroup");
  const benchmarkKey=sha({indexName,indexRevision,methodologyFingerprint});
  const body={schema:"seven.model-benchmark-observation.v1",provider:deployment.provider,recordId:deployment.record.id,revisionId:deployment.revision.id,endpointId:deployment.endpoint.id,indexName,indexRevision,methodologyFingerprint,benchmarkKey,score,sourceKind,sourceId,sourceUrl,independenceGroup,observedAt:iso(input.observedAt,"observedAt")};
  return seal(body);
}
function verifyBenchmarkObservation(x,deployment){
  if(!verifySealed(x,"seven.model-benchmark-observation.v1"))return false;
  if(x.benchmarkKey!==sha({indexName:x.indexName,indexRevision:x.indexRevision,methodologyFingerprint:x.methodologyFingerprint}))return false;
  if(deployment&&(x.recordId!==deployment?.record?.id||x.revisionId!==deployment?.revision?.id||x.endpointId!==deployment?.endpoint?.id||x.provider!==deployment?.provider))return false;
  return true;
}
function compareBenchmarkObservations(a,b){
  if(!verifyBenchmarkObservation(a)||!verifyBenchmarkObservation(b))throw new Error("verified benchmark observations required");
  if(a.benchmarkKey!==b.benchmarkKey)return Object.freeze({status:"NON_COMPARABLE",reason:"benchmark-scale-or-methodology-drift",delta:null});
  return Object.freeze({status:"COMPARABLE",reason:"same-benchmark-identity",delta:b.score-a.score,benchmarkKey:a.benchmarkKey});
}

function createSevenEvalReceipt(input={}){
  const deployment=exactDeployment(input.deployment),suiteFingerprint=req(input.suiteFingerprint,"suiteFingerprint").toLowerCase(),runtimeFingerprint=req(input.runtimeFingerprint,"runtimeFingerprint").toLowerCase(),holdoutFingerprint=req(input.holdoutFingerprint,"holdoutFingerprint").toLowerCase();
  if(!HASH64.test(suiteFingerprint)||!HASH64.test(runtimeFingerprint)||!HASH64.test(holdoutFingerprint))throw new Error("Seven Eval fingerprints must be sha256");
  const metrics=input.metrics||{},quality=finite(metrics.quality,"metrics.quality"),reliability=finite(metrics.reliability,"metrics.reliability"),toolUse=finite(metrics.toolUse,"metrics.toolUse"),factuality=finite(metrics.factuality,"metrics.factuality"),latencyScore=finite(metrics.latencyScore,"metrics.latencyScore");
  for(const [k,v] of Object.entries({quality,reliability,toolUse,factuality,latencyScore}))if(v<0||v>1)throw new Error(`${k} must be 0..1`);
  const hardGates={...(input.hardGates||{})};const required=["safety","regression","authority","cancellation","resource"];
  const pass=required.every(k=>hardGates[k]===true)&&input.verdict==="PASS";
  const score=quality*.35+reliability*.25+toolUse*.15+factuality*.2+latencyScore*.05;
  const comparisonKey=sha({suiteFingerprint,runtimeFingerprint,holdoutFingerprint});
  const body={schema:"seven.model-eval-receipt.v1",recordId:deployment.record.id,revisionId:deployment.revision.id,endpointId:deployment.endpoint.id,suiteFingerprint,runtimeFingerprint,holdoutFingerprint,comparisonKey,metrics:{quality,reliability,toolUse,factuality,latencyScore},hardGates,verdict:pass?"PASS":"FAIL",score,runId:req(input.runId,"runId"),observedAt:iso(input.observedAt,"observedAt")};return seal(body);
}
function verifySevenEvalReceipt(x,deployment){return verifySealed(x,"seven.model-eval-receipt.v1")&&(!deployment||(x.recordId===deployment?.record?.id&&x.revisionId===deployment?.revision?.id&&x.endpointId===deployment?.endpoint?.id))}

function createAdversarialReceipt(input={}){
  const deployment=exactDeployment(input.deployment),producer=req(input.producer,"producer"),producerContext=req(input.producerContext,"producerContext"),builderContext=req(input.builderContext,"builderContext");if(producerContext===builderContext)throw new Error("adversarial review must be independent from builder context");
  const findingHash=req(input.findingHash,"findingHash").toLowerCase();if(!HASH64.test(findingHash))throw new Error("findingHash must be sha256");
  const criticalFindings=Math.max(0,Math.trunc(finite(input.criticalFindings??0,"criticalFindings"))),majorFindings=Math.max(0,Math.trunc(finite(input.majorFindings??0,"majorFindings")));
  const verdict=input.verdict==="PASS"&&criticalFindings===0&&majorFindings===0?"PASS":"FAIL";
  return seal({schema:"seven.model-adversarial-receipt.v1",recordId:deployment.record.id,revisionId:deployment.revision.id,endpointId:deployment.endpoint.id,producer,producerContext,builderContext,findingHash,criticalFindings,majorFindings,verdict,observedAt:iso(input.observedAt,"observedAt")});
}
function verifyAdversarialReceipt(x,deployment){return verifySealed(x,"seven.model-adversarial-receipt.v1")&&x.producerContext!==x.builderContext&&(!deployment||(x.recordId===deployment?.record?.id&&x.revisionId===deployment?.revision?.id&&x.endpointId===deployment?.endpoint?.id))}

function benchmarkQualification(observations,deployment,{minIndependentGroups=1}={}){
  const rows=(Array.isArray(observations)?observations:[]).filter(x=>verifyBenchmarkObservation(x,deployment));if(!rows.length)return {pass:false,reasons:["missing-benchmark-evidence"],benchmarkKey:null};
  const independent=rows.filter(x=>x.sourceKind==="INDEPENDENT_BENCHMARK"),groups=new Set(independent.map(x=>x.independenceGroup));
  const keys=new Set(rows.map(x=>x.benchmarkKey));const reasons=[];if(keys.size!==1)reasons.push("benchmark-scale-mixing");if(groups.size<Math.max(1,Number(minIndependentGroups)||1))reasons.push("insufficient-independent-benchmark-groups");
  return {pass:reasons.length===0,reasons,benchmarkKey:keys.size===1?[...keys][0]:null,independentGroups:[...groups].sort()};
}

function createQualificationLease(input={}){
  const deployment=exactDeployment(input.deployment),contract=input.adapterContract,observation=input.endpointObservation,evalReceipt=input.evalReceipt,adversarialReceipt=input.adversarialReceipt;
  const role=String(input.role||"CHAMPION").toUpperCase();if(!LEASE_ROLES.includes(role))throw new Error("qualification role invalid");
  const proof=verifyFreeProof(deployment.record);const reasons=[];if(!proof.valid)reasons.push(...proof.reasons);
  if(!["VERIFIED","ACTIVE"].includes(deployment.record.status))reasons.push("model-not-verified");
  const binding=adapter.qualifyAdapterBinding({contract,deployment,observation,requiredCapabilities:input.requiredCapabilities||[],requiredContextTokens:input.requiredContextTokens||0,requiredOutputTokens:input.requiredOutputTokens||0,requireStreaming:input.requireStreaming===true,requireCancellation:input.requireCancellation===true,now:input.now,maxAgeMs:input.endpointMaxAgeMs});if(binding.verdict!=="PASS")reasons.push(...binding.failures);
  if(role==="CHAMPION"&&!adapter.durableChampionAccess(observation))reasons.push("champion-access-not-durable-free");if(role==="OPPORTUNISTIC"&&!adapter.opportunisticFreeAccess(observation))reasons.push("opportunistic-access-not-free");
  const bq=benchmarkQualification(input.benchmarkObservations,deployment,{minIndependentGroups:input.minIndependentBenchmarkGroups||1});if(!bq.pass)reasons.push(...bq.reasons);
  if(!verifySevenEvalReceipt(evalReceipt,deployment)||evalReceipt.verdict!=="PASS")reasons.push("seven-evals-not-passing");
  if(!verifyAdversarialReceipt(adversarialReceipt,deployment)||adversarialReceipt.verdict!=="PASS")reasons.push("adversarial-review-not-passing");
  if(reasons.length)throw new Error(`qualification blocked: ${[...new Set(reasons)].join(",")}`);
  const issued=nowMs(input.now),ttl=Math.max(60*1000,Number(input.ttlMs)||24*60*60*1000),body={schema:"seven.model-qualification-lease.v1",role,recordId:deployment.record.id,revisionId:deployment.revision.id,endpointId:deployment.endpoint.id,provider:deployment.provider,issuedAt:issued,expiresAt:issued+ttl,freeProofClass:deployment.record.freeProof.class,adapterSeal:contract.seal,endpointObservationSeal:observation.seal,benchmarkKey:bq.benchmarkKey,benchmarkObservationSeals:(input.benchmarkObservations||[]).map(x=>x.seal).sort(),independentBenchmarkGroups:bq.independentGroups,evalReceiptSeal:evalReceipt.seal,evalComparisonKey:evalReceipt.comparisonKey,evalScore:evalReceipt.score,adversarialReceiptSeal:adversarialReceipt.seal,evidenceFingerprint:sha({freeProof:deployment.record.freeProof,adapter:contract.seal,endpoint:observation.seal,benchmark:(input.benchmarkObservations||[]).map(x=>x.seal).sort(),eval:evalReceipt.seal,adversarial:adversarialReceipt.seal})};return seal(body);
}
function verifyQualificationLease(x,deployment){return verifySealed(x,"seven.model-qualification-lease.v1")&&(!deployment||(x.recordId===deployment?.record?.id&&x.revisionId===deployment?.revision?.id&&x.endpointId===deployment?.endpoint?.id&&x.provider===deployment?.provider))}
function qualificationLeaseFresh(lease,{now=Date.now()}={}){return verifyQualificationLease(lease)&&nowMs(now)<lease.expiresAt&&nowMs(now)>=lease.issuedAt-5*60*1000}

function compareQualifiedLeases(a,b){
  if(!verifyQualificationLease(a)||!verifyQualificationLease(b))throw new Error("verified qualification leases required");
  if(a.role!=="CHAMPION"||b.role!=="CHAMPION")return Object.freeze({status:"NON_COMPARABLE",reason:"champion-role-required"});
  if(a.evalComparisonKey!==b.evalComparisonKey)return Object.freeze({status:"NON_COMPARABLE",reason:"Seven-Eval-comparison-identity-drift"});
  return Object.freeze({status:"COMPARABLE",reason:"matched-Seven-Evals",delta:b.evalScore-a.evalScore});
}

function selectChampion({leases=[],deployments=[],task={},now=Date.now(),minimumMaterialDelta=.02,currentChampionRevisionId=null}={}){
  const candidates=[];
  for(const lease of leases){if(!verifyQualificationLease(lease)||lease.role!=="CHAMPION"||!qualificationLeaseFresh(lease,{now}))continue;const deployment=(deployments||[]).find(d=>d?.revision?.id===lease.revisionId&&d?.endpoint?.id===lease.endpointId);if(!deployment)continue;const gate=modelFabric.hardEligibility(deployment,task,{now});if(!gate.eligible)continue;candidates.push({lease,deployment});}
  if(!candidates.length)return Object.freeze({status:"NO_QUALIFIED_CHAMPION",selected:null,reason:"no-fresh-eligible-champion-lease",ranked:[]});
  const evalKeys=new Set(candidates.map(x=>x.lease.evalComparisonKey));if(evalKeys.size!==1)return Object.freeze({status:"INCOMPARABLE_QUALIFIED_POOL",selected:null,reason:"Seven-Eval-comparison-identity-drift",ranked:candidates.map(x=>({revisionId:x.lease.revisionId,score:x.lease.evalScore}))});
  candidates.sort((a,b)=>b.lease.evalScore-a.lease.evalScore||a.lease.revisionId.localeCompare(b.lease.revisionId)||a.lease.endpointId.localeCompare(b.lease.endpointId));let winner=candidates[0];
  if(currentChampionRevisionId){const current=candidates.find(x=>x.lease.revisionId===currentChampionRevisionId);if(current&&winner.lease.evalScore-current.lease.evalScore<Math.max(0,Number(minimumMaterialDelta)||0))winner=current;}
  return Object.freeze({status:"PASS",selected:winner.deployment,lease:winner.lease,reason:winner.lease.revisionId===currentChampionRevisionId?"champion-retained-no-material-gain":"best-matched-Seven-Eval-champion",ranked:candidates.map(x=>({revisionId:x.lease.revisionId,endpointId:x.lease.endpointId,score:x.lease.evalScore,expiresAt:x.lease.expiresAt}))});
}

module.exports=Object.freeze({BENCHMARK_SOURCE_KINDS,LEASE_ROLES,sha,createBenchmarkObservation,verifyBenchmarkObservation,compareBenchmarkObservations,createSevenEvalReceipt,verifySevenEvalReceipt,createAdversarialReceipt,verifyAdversarialReceipt,benchmarkQualification,createQualificationLease,verifyQualificationLease,qualificationLeaseFresh,compareQualifiedLeases,selectChampion});
