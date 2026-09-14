"use strict";

const crypto=require("crypto");
const DOMAINS=Object.freeze(["COGNITIVE","CODING","RESEARCH","TOOLS","MEMORY","CONTEXT","RPG","REAL_WORKS","STORY","ZERO_MANUAL","RECOVERY","ANDROID","GENERAL"]);
const RISKS=Object.freeze(["LOW","MEDIUM","HIGH","CRITICAL"]);
const CONTAMINATION_STATES=Object.freeze(["CLEAN_KNOWN","POSSIBLE_EXPOSURE","KNOWN_EXPOSED","NOT_APPLICABLE","UNKNOWN"]);
const SUITE_STATES=Object.freeze(["ACTIVE_DIAGNOSTIC","ACTIVE_REGRESSION","SATURATING","SATURATED_REGRESSION_ONLY","RETIRED","QUARANTINED"]);
const COMPARISON_SUMMARIES=Object.freeze(["BETTER","WORSE","MIXED","NO_MATERIAL_CHANGE","NON_COMPARABLE"]);
const RELEASE_DECISIONS=Object.freeze(["PROMOTE","PROMOTE_WITH_MONITORING","HOLD","REJECT","INSUFFICIENT_EVIDENCE"]);
function text(v){return typeof v==="string"?v.trim():"";}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o;}return v;}
function hash(v){return crypto.createHash("sha256").update(typeof v==="string"?v:JSON.stringify(stable(v))).digest("hex");}
function finite(v){const n=Number(v);if(!Number.isFinite(n))throw new Error("metric must be finite");return n;}
function metric01(v){const n=finite(v);if(n<0||n>1)throw new Error("metric outside [0,1]");return n;}
function mean(a){return a.length?a.reduce((x,y)=>x+y,0)/a.length:0;}
function variance(a,m=mean(a)){return a.length>1?a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1):0;}
function std(a){return Math.sqrt(variance(a));}
function sem(a){return a.length>1?std(a)/Math.sqrt(a.length):0;}
function interval95(a){const m=mean(a),d=1.96*sem(a);return {mean:m,low:m-d,high:m+d,n:a.length,stddev:std(a)};}
function uniq(v){return [...new Set((Array.isArray(v)?v:[]).map(text).filter(Boolean))].sort();}
function enumValue(v,allowed,fallback){const x=String(v||fallback).toUpperCase();if(!allowed.includes(x))throw new Error(`invalid value:${x}`);return x;}
function asNonNegativeInt(v,name){const n=Number(v);if(!Number.isInteger(n)||n<0)throw new Error(`${name} must be a non-negative integer`);return n;}
function boolMap(input={}){const out={};for(const [k,v] of Object.entries(input)){if(v!==true&&v!==false)throw new Error(`gate must be boolean:${k}`);out[k]=v;}return out;}

function createEvaluationProgram(input={}){
  const name=text(input.name),version=text(input.version);if(!name||!version)throw new Error("evaluation program name/version required");
  const body={schemaVersion:1,name,version,targetClaims:uniq(input.targetClaims),requiredSuites:uniq(input.requiredSuites),criticalInvariants:uniq(input.criticalInvariants),governanceOwner:text(input.governanceOwner)||null,changePolicyHash:text(input.changePolicyHash)||null};
  return Object.freeze({...body,id:`eval-program-${hash(body).slice(0,24)}`});
}
function createAffordanceContract(input={}){
  const body={schemaVersion:1,network:String(input.network||"NONE").toUpperCase(),externalRepos:input.externalRepos===true,packageManager:input.packageManager===true,files:String(input.files||"NONE").toUpperCase(),hiddenTests:input.hiddenTests===true,tools:uniq(input.tools),maxWallMs:input.maxWallMs==null?null:Math.max(0,finite(input.maxWallMs)),resourceClass:text(input.resourceClass)||"default"};
  return Object.freeze({...body,id:`affordance-${hash(body).slice(0,24)}`});
}
function createTrialPolicy(input={}){
  const kind=String(input.kind||"FIXED").toUpperCase();if(!["DETERMINISTIC_SINGLE","FIXED","ADAPTIVE"].includes(kind))throw new Error("invalid trial policy");
  const minTrials=Math.max(1,Math.floor(Number(input.minTrials)||1)),maxTrials=Math.max(minTrials,Math.floor(Number(input.maxTrials)||minTrials));
  const body={schemaVersion:1,kind,minTrials,maxTrials,targetHalfWidth:input.targetHalfWidth==null?null:Math.max(0,finite(input.targetHalfWidth)),seedPolicy:text(input.seedPolicy)||"fixed-index"};
  return Object.freeze({...body,id:`trial-policy-${hash(body).slice(0,24)}`});
}
function createEvalTask(input={}){
  const dataset=text(input.dataset),split=text(input.split),version=text(input.version),caseId=text(input.caseId),promptHash=text(input.promptHash);if(!dataset||!split||!version||!caseId||!promptHash)throw new Error("eval task identity incomplete");
  const domain=enumValue(input.domain,DOMAINS,"GENERAL"),risk=enumValue(input.risk,RISKS,"MEDIUM"),contaminationState=enumValue(input.contaminationState,CONTAMINATION_STATES,"UNKNOWN");
  const body={schemaVersion:2,dataset,split,version,caseId,promptHash,referenceHash:text(input.referenceHash)||null,rubricHash:text(input.rubricHash)||null,language:text(input.language)||"und",mode:text(input.mode)||"core",risk,domain,tags:uniq(input.tags),hidden:input.hidden===true,contaminationState,contaminationKeys:uniq(input.contaminationKeys),affordanceHash:text(input.affordanceHash)||null,provenanceHash:text(input.provenanceHash)||null};
  return Object.freeze({...body,id:`eval-task-${hash(body).slice(0,24)}`});
}
function createEvalSuite(input={}){
  const name=text(input.name),version=text(input.version),tasks=input.tasks||[];if(!name||!version||!tasks.length)throw new Error("eval suite name/version/tasks required");
  const taskIds=tasks.map(t=>t.id);if(taskIds.some(x=>!x)||new Set(taskIds).size!==taskIds.length)throw new Error("duplicate or invalid eval task");
  const trialPolicy=input.trialPolicy?.id?input.trialPolicy:createTrialPolicy(input.trialPolicy||{}),lifecycle=enumValue(input.lifecycle,SUITE_STATES,"ACTIVE_REGRESSION");
  const materialityThreshold=input.materialityThreshold==null?0.01:finite(input.materialityThreshold);if(materialityThreshold<0||materialityThreshold>1)throw new Error("invalid materiality threshold");
  const weights={};for(const [k,v] of Object.entries(input.metricWeights||{})){const n=finite(v);if(n<0)throw new Error("negative metric weight");weights[k]=n;}
  const body={schemaVersion:2,name,version,taskIds,taskSetHash:hash([...taskIds].sort()),purpose:String(input.purpose||"BENCHMARK").toUpperCase(),hardGates:uniq(input.hardGates),metricWeights:stable(weights),materialityThreshold,evalLockHash:text(input.evalLockHash)||null,constitutionHash:text(input.constitutionHash)||null,graderManifestHash:text(input.graderManifestHash)||null,environmentRequirementsHash:text(input.environmentRequirementsHash)||null,affordanceHash:text(input.affordanceHash)||null,trialPolicy,lifecycle,publicity:String(input.publicity||"PUBLIC").toUpperCase(),knownLimitations:uniq(input.knownLimitations)};
  return Object.freeze({...body,id:`eval-suite-${hash(body).slice(0,24)}`});
}
function environmentIdentity(input={}){
  const body={modelRevisionId:text(input.modelRevisionId)||"none",providerEndpointId:text(input.providerEndpointId)||"none",toolSnapshotId:text(input.toolSnapshotId)||"none",policyId:text(input.policyId)||"none",codeRevision:text(input.codeRevision),runtimeRevision:text(input.runtimeRevision)||"unknown",graderManifestHash:text(input.graderManifestHash)||"unknown",affordanceHash:text(input.affordanceHash)||"none",deviceProfile:text(input.deviceProfile)||"unknown",deviceClass:String(input.deviceClass||"HOST").toUpperCase(),locale:text(input.locale)||"und",seed:text(input.seed)||"0",computeBudget:stable(input.computeBudget||{}),networkProfile:text(input.networkProfile)||"default",liveWindow:text(input.liveWindow)||null};
  if(!body.codeRevision)throw new Error("environment code revision required");return Object.freeze({...body,id:`eval-env-${hash(body).slice(0,24)}`});
}
function createEvalRun({suite,task,environment,subjectId,metrics={},hardGates={},artifacts=[],repetition=0,startedAt=null,endedAt=null,failureCategory=null,censored=false,contaminationState=null}={}){
  const subject=text(subjectId);if(!suite||!task||!environment||!subject)throw new Error("suite task environment subject required");if(!suite.taskIds.includes(task.id))throw new Error("task outside suite");
  const rep=asNonNegativeInt(repetition,"repetition"),normalized={};for(const [k,v] of Object.entries(metrics))normalized[k]=metric01(v);const gates=boolMap(hardGates);
  const refs=(artifacts||[]).map(a=>({kind:text(a.kind),hash:text(a.hash),sourceRef:text(a.sourceRef)}));if(refs.some(a=>!a.kind||!a.hash||!a.sourceRef))throw new Error("eval artifact identity incomplete");
  const contamination=contaminationState==null?task.contaminationState:enumValue(contaminationState,CONTAMINATION_STATES,"UNKNOWN");
  const body={schemaVersion:2,suiteId:suite.id,taskId:task.id,environmentId:environment.id,subjectId:subject,repetition:rep,metrics:normalized,hardGates:gates,artifacts:refs,startedAt,endedAt,failureCategory:text(failureCategory)||null,censored:censored===true,contaminationState:contamination};
  return Object.freeze({...body,id:`eval-run-${hash(body).slice(0,24)}`});
}
function hardGateStatus(suite,runs){const failures=[],missing=[];for(const gate of suite.hardGates){for(const r of runs){if(!(gate in r.hardGates))missing.push(`${r.id}:${gate}`);else if(r.hardGates[gate]!==true)failures.push(`${r.id}:${gate}`);}}return {pass:failures.length===0&&missing.length===0,failures,missing};}
function summarizeSubject({suite,runs=[],subjectId,tasks=[]}={}){
  const rows=runs.filter(r=>r.suiteId===suite.id&&r.subjectId===subjectId),byMetric={};for(const r of rows)for(const [k,v] of Object.entries(r.metrics))(byMetric[k]||(byMetric[k]=[])).push(v);
  const metrics={};for(const [k,vals] of Object.entries(byMetric))metrics[k]=interval95(vals);const gate=hardGateStatus(suite,rows),weights=suite.metricWeights||{};let weighted=0,total=0;for(const [k,stat] of Object.entries(metrics)){const w=Number.isFinite(Number(weights[k]))?Math.max(0,Number(weights[k])):1;weighted+=stat.mean*w;total+=w;}
  const censored=rows.filter(r=>r.censored).map(r=>r.id),taskCoverage=new Set(rows.map(r=>r.taskId)),missingTasks=(tasks.length?tasks.map(t=>t.id):suite.taskIds).filter(id=>!taskCoverage.has(id));
  const contamination=rows.reduce((acc,r)=>{acc[r.contaminationState]=(acc[r.contaminationState]||0)+1;return acc;},{});
  return {suiteId:suite.id,subjectId,rowCount:rows.length,metrics,aggregate:total?weighted/total:0,hardGate:gate,eligible:rows.length>0&&gate.pass&&!censored.length&&!missingTasks.length,censored,missingTasks,contamination};
}
function matchedEnvironment(a,b){
  if(!a||!b)return {matched:false,reasons:["environment-missing"]};
  const fields=["toolSnapshotId","policyId","codeRevision","runtimeRevision","graderManifestHash","affordanceHash","deviceProfile","deviceClass","locale","seed","computeBudget","networkProfile","liveWindow"],reasons=[];
  for(const f of fields)if(JSON.stringify(stable(a[f]))!==JSON.stringify(stable(b[f])))reasons.push(`environment-mismatch:${f}`);
  return {matched:reasons.length===0,reasons};
}
function runKey(r){return `${r.taskId}::${r.repetition}`;}
function weightedRunScore(run,weights){let n=0,d=0;for(const [k,v] of Object.entries(run.metrics)){const w=Number.isFinite(Number(weights[k]))?Math.max(0,Number(weights[k])):1;n+=v*w;d+=w;}return d?n/d:null;}
function comparisonHashPayload(c){return {fair:c.fair,reasons:c.reasons,summary:c.summary,baselineId:c.baseline.subjectId,candidateId:c.candidate.subjectId,deltas:c.deltas,aggregateDelta:c.aggregateDelta,aggregateInterval:c.aggregateInterval,pairCount:c.pairCount,criticalRegressions:c.criticalRegressions,contaminationWarnings:c.contaminationWarnings};}
function compareSubjects({suite,tasks=[],runs=[],baselineId,candidateId,environments={}}={}){
  if(!suite||!baselineId||!candidateId)throw new Error("comparison suite/baseline/candidate required");if(baselineId===candidateId)throw new Error("baseline and candidate must differ");
  const base=summarizeSubject({suite,runs,subjectId:baselineId,tasks}),candidate=summarizeSubject({suite,runs,subjectId:candidateId,tasks}),reasons=[],criticalRegressions=[];
  if(base.rowCount===0)reasons.push("baseline-empty");if(candidate.rowCount===0)reasons.push("candidate-empty");if(base.hardGate.failures.length)reasons.push("baseline-hard-gate-failed");if(base.hardGate.missing.length)reasons.push("baseline-hard-gate-missing");
  if(candidate.hardGate.failures.length)criticalRegressions.push(...candidate.hardGate.failures.map(x=>`candidate-hard-gate:${x}`));if(candidate.hardGate.missing.length)reasons.push("candidate-hard-gate-missing");
  const baseMap=new Map(),candMap=new Map();for(const r of runs.filter(r=>r.suiteId===suite.id&&r.subjectId===baselineId)){const k=runKey(r);if(baseMap.has(k))reasons.push(`duplicate-trial:${baselineId}:${k}`);baseMap.set(k,r);}for(const r of runs.filter(r=>r.suiteId===suite.id&&r.subjectId===candidateId)){const k=runKey(r);if(candMap.has(k))reasons.push(`duplicate-trial:${candidateId}:${k}`);candMap.set(k,r);}
  const pairs=[];for(const task of tasks){for(let rep=0;rep<suite.trialPolicy.minTrials;rep++){const k=`${task.id}::${rep}`,a=baseMap.get(k),b=candMap.get(k);if(!a||!b){reasons.push(`missing-paired-trial:${k}`);continue;}if(a.censored||b.censored){reasons.push(`censored-trial:${k}`);continue;}const env=matchedEnvironment(environments[a.environmentId],environments[b.environmentId]);if(!env.matched)reasons.push(...env.reasons.map(x=>`${k}:${x}`));pairs.push([a,b]);}}
  for(const k of new Set([...baseMap.keys(),...candMap.keys()]))if(baseMap.has(k)!==candMap.has(k))reasons.push(`trial-count-mismatch:${k}`);
  const metricNames=[...new Set(pairs.flatMap(([a,b])=>[...Object.keys(a.metrics),...Object.keys(b.metrics)]))],deltas={};for(const m of metricNames){const vals=pairs.filter(([a,b])=>m in a.metrics&&m in b.metrics).map(([a,b])=>b.metrics[m]-a.metrics[m]);if(vals.length)deltas[m]=interval95(vals);}
  const pairScores=pairs.map(([a,b])=>{const sa=weightedRunScore(a,suite.metricWeights),sb=weightedRunScore(b,suite.metricWeights);return sa==null||sb==null?null:sb-sa;}).filter(v=>v!=null),aggregateInterval=pairScores.length?interval95(pairScores):null,aggregateDelta=aggregateInterval?aggregateInterval.mean:0;
  const contaminationWarnings=[];for(const r of [...baseMap.values(),...candMap.values()])if(["KNOWN_EXPOSED","POSSIBLE_EXPOSURE","UNKNOWN"].includes(r.contaminationState))contaminationWarnings.push(`${r.id}:${r.contaminationState}`);
  const fair=reasons.length===0;let summary="NON_COMPARABLE",winner="TIE_OR_INCONCLUSIVE";
  if(criticalRegressions.length){summary="WORSE";winner=baselineId;}
  else if(fair&&aggregateInterval){const t=suite.materialityThreshold,positive=aggregateDelta>=t&&aggregateInterval.low>0,negative=aggregateDelta<=-t&&aggregateInterval.high<0;const metricSigns=Object.values(deltas).map(d=>d.mean>=t&&d.low>0?1:d.mean<=-t&&d.high<0?-1:0);if(positive){summary=metricSigns.includes(-1)?"MIXED":"BETTER";winner=summary==="BETTER"?candidateId:"TIE_OR_INCONCLUSIVE";}else if(negative){summary=metricSigns.includes(1)?"MIXED":"WORSE";winner=summary==="WORSE"?baselineId:"TIE_OR_INCONCLUSIVE";}else if(metricSigns.includes(1)&&metricSigns.includes(-1))summary="MIXED";else summary="NO_MATERIAL_CHANGE";}
  const result={fair,reasons:[...new Set(reasons)],summary,baseline:base,candidate,deltas,aggregateDelta,aggregateInterval,winner,pairCount:pairs.length,criticalRegressions:[...new Set(criticalRegressions)],contaminationWarnings:[...new Set(contaminationWarnings)],capabilityClaimEligible:contaminationWarnings.length===0&&fair&&criticalRegressions.length===0};
  return {...result,comparisonHash:hash(comparisonHashPayload(result))};
}
function contaminationCheck({task,subjectEvidence={}}={}){const seen=new Set(uniq(subjectEvidence.seenKeys)),hits=task.contaminationKeys.filter(k=>seen.has(k));return {clean:hits.length===0,hits,state:hits.length?"KNOWN_EXPOSED":task.contaminationState};}
function stratifiedReport({suite,tasks=[],runs=[],subjectId,metric="quality"}={}){const rows=runs.filter(r=>r.suiteId===suite.id&&r.subjectId===subjectId),taskById=new Map(tasks.map(t=>[t.id,t])),groups={};for(const r of rows){const t=taskById.get(r.taskId);if(!t||!(metric in r.metrics))continue;for(const [axis,key] of [["language",t.language],["domain",t.domain],["mode",t.mode]]){const id=`${axis}:${key}`;(groups[id]||(groups[id]=[])).push(r.metrics[metric]);}}const out={};for(const [k,v] of Object.entries(groups))out[k]=interval95(v);const worst=Object.entries(out).sort((a,b)=>a[1].mean-b[1].mean)[0]||null;return {metric,groups:out,worstGroup:worst?{group:worst[0],...worst[1]}:null};}
function releaseDecision({comparison,requiredSuitesPass=true,holdoutEvidence=true,rollbackReady=true,unmeasuredBlockers=[],monitoringRequired=false}={}){
  const reasons=[];if(!comparison)return {decision:"INSUFFICIENT_EVIDENCE",reasons:["comparison-missing"]};if(comparison.criticalRegressions?.length)return {decision:"REJECT",reasons:[...comparison.criticalRegressions]};if(!comparison.fair||comparison.summary==="NON_COMPARABLE")reasons.push("comparison-non-comparable");if(!requiredSuitesPass)reasons.push("required-suite-failed-or-missing");if(!holdoutEvidence)reasons.push("holdout-evidence-missing");if(!rollbackReady)reasons.push("rollback-not-ready");reasons.push(...unmeasuredBlockers.map(x=>`unmeasured:${x}`));if(reasons.length)return {decision:"INSUFFICIENT_EVIDENCE",reasons};if(comparison.summary==="WORSE")return {decision:"REJECT",reasons:["candidate-worse"]};if(comparison.summary==="MIXED")return {decision:"HOLD",reasons:["mixed-result"]};if(comparison.summary==="BETTER")return {decision:monitoringRequired?"PROMOTE_WITH_MONITORING":"PROMOTE",reasons:monitoringRequired?["monitoring-required"]:[]};return {decision:"HOLD",reasons:["no-material-change"]};}
function benchmarkReceipt({suite,comparison,constitutionHash,runnerHash}={}){if(!suite||!comparison||!constitutionHash||!runnerHash)throw new Error("benchmark receipt identity incomplete");if(suite.constitutionHash&&suite.constitutionHash!==constitutionHash)throw new Error("benchmark constitution mismatch");const body={schemaVersion:2,suiteId:suite.id,taskSetHash:suite.taskSetHash,constitutionHash:text(constitutionHash),runnerHash:text(runnerHash),comparisonHash:comparison.comparisonHash||hash(comparisonHashPayload(comparison)),fair:comparison.fair,summary:comparison.summary,baselineId:comparison.baseline.subjectId,candidateId:comparison.candidate.subjectId,aggregateDelta:comparison.aggregateDelta,pairCount:comparison.pairCount,hardGatePass:comparison.candidate.hardGate.pass,criticalRegressions:comparison.criticalRegressions,reasons:comparison.reasons};return Object.freeze({...body,id:`benchmark-${hash(body).slice(0,24)}`});}
function verifyBenchmarkReceipt(receipt){if(!receipt||!receipt.id)return false;const body={...receipt};delete body.id;return receipt.id===`benchmark-${hash(body).slice(0,24)}`;}
module.exports={DOMAINS,RISKS,CONTAMINATION_STATES,SUITE_STATES,COMPARISON_SUMMARIES,RELEASE_DECISIONS,hash,mean,std,interval95,createEvaluationProgram,createAffordanceContract,createTrialPolicy,createEvalTask,createEvalSuite,environmentIdentity,createEvalRun,hardGateStatus,summarizeSubject,matchedEnvironment,compareSubjects,contaminationCheck,stratifiedReport,releaseDecision,benchmarkReceipt,verifyBenchmarkReceipt};
