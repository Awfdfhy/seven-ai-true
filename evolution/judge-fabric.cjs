"use strict";

const crypto = require("crypto");

const VERDICTS = Object.freeze(["PASS", "FAIL", "INCONCLUSIVE", "REPAIR_REQUIRED", "BLOCKED"]);
const LEGACY_VERDICTS = Object.freeze({ PASS:"ACCEPT", FAIL:"REJECT", REPAIR_REQUIRED:"REPAIR", INCONCLUSIVE:"INCONCLUSIVE", BLOCKED:"INCONCLUSIVE" });
const LAYERS = Object.freeze(["L0_INVARIANT", "L1_DETERMINISTIC", "L2_EVIDENCE", "L3_SEMANTIC", "L4_ADVERSARIAL"]);
const EVIDENCE_CLASSES = Object.freeze([
  "AUTHORITATIVE_STATE", "DETERMINISTIC_EXECUTION", "FORMAL_PROOF", "INDEPENDENT_OBSERVATION",
  "SOURCE_EVIDENCE", "DEVICE_MEASUREMENT", "MODEL_JUDGMENT", "HUMAN_ACCEPTANCE", "TEST", "SOURCE"
]);

function text(v){ return typeof v === "string" ? v.trim() : ""; }
function clone(v){ return v == null ? v : JSON.parse(JSON.stringify(v)); }
function stable(v){
  if(Array.isArray(v)) return v.map(stable);
  if(v && typeof v === "object"){
    const o = {};
    for(const k of Object.keys(v).sort()) if(v[k] !== undefined) o[k] = stable(v[k]);
    return o;
  }
  return v;
}
function hash(v){ return crypto.createHash("sha256").update(typeof v === "string" ? v : JSON.stringify(stable(v))).digest("hex"); }
function uniq(v){ return [...new Set((Array.isArray(v) ? v : []).map(text).filter(Boolean))].sort(); }
function risk(v){ const x = String(v || "MEDIUM").toUpperCase(); return ["LOW","MEDIUM","HIGH","CRITICAL"].includes(x) ? x : "MEDIUM"; }
function layer(v){ const x = String(v || "L1_DETERMINISTIC").toUpperCase(); if(!LAYERS.includes(x)) throw new Error("invalid verification layer"); return x; }
function freeze(v){ return Object.freeze(v); }
function nowMs(v){ if(v == null) return null; const n = typeof v === "number" ? v : Date.parse(v); return Number.isFinite(n) ? n : null; }

function createVerificationSubject(input={}){
  const subjectId = text(input.subjectId || input.id), version = text(input.version), subjectHash = text(input.subjectHash || input.hash);
  if(!subjectId || !version || !subjectHash) throw new Error("verification subject id/version/hash required");
  const body = {schemaVersion:1, subjectId, version, subjectHash, subjectType:text(input.subjectType)||"GENERIC", sourceRef:text(input.sourceRef)||null};
  return freeze({...body, id:`verify-subject-${hash(body).slice(0,24)}`});
}

function normalizeCheck(c={}){
  const id = text(c.id); if(!id) throw new Error("verification check id required");
  const deps = uniq(c.dependencies);
  const minIndependentSources = Math.max(1, Math.min(32, Math.floor(Number(c.minIndependentSources) || 1)));
  const freshnessMs = c.freshnessMs == null ? null : Math.max(0, Number(c.freshnessMs));
  if(freshnessMs != null && !Number.isFinite(freshnessMs)) throw new Error("invalid evidence freshness window");
  return freeze({
    id, layer:layer(c.layer), kind:text(c.kind)||"predicate", property:text(c.property)||id,
    hard:c.hard !== false, requiredEvidence:uniq(c.requiredEvidence), minIndependentSources,
    freshnessMs, dependencies:deps, repairable:c.repairable === true, description:text(c.description),
    allowedVerifierTypes:uniq(c.allowedVerifierTypes), environmentRequirements:uniq(c.environmentRequirements)
  });
}

function validateCheckDag(checks){
  const byId = new Map(checks.map(c=>[c.id,c]));
  for(const c of checks) for(const d of c.dependencies) if(!byId.has(d)) throw new Error(`unknown check dependency:${c.id}:${d}`);
  const visiting = new Set(), done = new Set(), order = [];
  function visit(id){
    if(done.has(id)) return;
    if(visiting.has(id)) throw new Error("verification check dependency cycle");
    visiting.add(id);
    for(const d of byId.get(id).dependencies) visit(d);
    visiting.delete(id); done.add(id); order.push(id);
  }
  for(const c of checks) visit(c.id);
  return order;
}

function createAcceptanceContract(input={}){
  const taskId=text(input.taskId), goalHash=text(input.goalHash);
  if(!taskId || !goalHash) throw new Error("taskId and goalHash required");
  const checks=(input.checks||[]).map(normalizeCheck); if(!checks.length) throw new Error("acceptance contract requires checks");
  const ids=new Set(checks.map(c=>c.id)); if(ids.size!==checks.length) throw new Error("duplicate verification check");
  const checkOrder = validateCheckDag(checks);
  const body={
    schemaVersion:2, taskId, goalHash, contractVersion:text(input.contractVersion)||"1", subjectHash:text(input.subjectHash)||null,
    risk:risk(input.risk), scopeFingerprint:text(input.scopeFingerprint)||null, authorityFingerprint:text(input.authorityFingerprint)||null,
    checks, checkOrder, requiredArtifactHashes:uniq(input.requiredArtifactHashes), forbiddenArtifactHashes:uniq(input.forbiddenArtifactHashes),
    effectRequirement:input.effectRequirement?clone(input.effectRequirement):null,
    independentJudgeRequired:input.independentJudgeRequired===true || ["HIGH","CRITICAL"].includes(risk(input.risk)),
    maxRepairCycles:Math.max(0,Math.min(10,Number(input.maxRepairCycles) || 2)),
    dependencyFingerprints:stable(input.dependencyFingerprints||{}), policyVersion:text(input.policyVersion)||"1"
  };
  return freeze({...body,id:`accept-${hash(body).slice(0,24)}`});
}

function createCandidateResult(input={}){
  const taskId=text(input.taskId), candidateId=text(input.candidateId); if(!taskId||!candidateId) throw new Error("candidate task/id required");
  const artifacts=(input.artifacts||[]).map(a=>({id:text(a.id),hash:text(a.hash),kind:text(a.kind),sourceRef:text(a.sourceRef)}));
  if(artifacts.some(a=>!a.id||!a.hash)) throw new Error("candidate artifacts require id/hash");
  const body={schemaVersion:2, taskId,candidateId,subjectHash:text(input.subjectHash)||null,subjectVersion:text(input.subjectVersion)||null,
    scopeFingerprint:text(input.scopeFingerprint)||null,authorityFingerprint:text(input.authorityFingerprint)||null,builderId:text(input.builderId)||null,
    builderContextFingerprint:text(input.builderContextFingerprint)||null,artifacts,claims:clone(input.claims||[]),effectKeys:uniq(input.effectKeys)};
  return freeze({...body,resultHash:hash(body)});
}

function createJudgeProfile(input={}){
  const judgeId=text(input.judgeId), revision=text(input.revision); if(!judgeId||!revision) throw new Error("judge id/revision required");
  const promotionStatus=String(input.promotionStatus||"UNQUALIFIED").toUpperCase();
  if(!["UNQUALIFIED","CALIBRATING","QUALIFIED","QUARANTINED"].includes(promotionStatus)) throw new Error("invalid judge promotion status");
  const calibration=input.calibration||{};
  const body={schemaVersion:1,judgeId,revision,domains:uniq(input.domains),checkTypes:uniq(input.checkTypes),promotionStatus,
    calibration:{sampleCount:Math.max(0,Math.floor(Number(calibration.sampleCount)||0)),falsePassRate:Number.isFinite(Number(calibration.falsePassRate))?Number(calibration.falsePassRate):null,falseFailRate:Number.isFinite(Number(calibration.falseFailRate))?Number(calibration.falseFailRate):null,localeCoverage:uniq(calibration.localeCoverage)},
    contextFingerprint:text(input.contextFingerprint)||null,health:String(input.health||"UNKNOWN").toUpperCase()};
  return freeze({...body,id:`judge-profile-${hash(body).slice(0,24)}`});
}

function createVerificationPlan(contract,{availableDeterministicChecks=[],availableEvidenceChecks=[],availableEnvironments=[]}={}){
  if(!contract||!contract.id) throw new Error("acceptance contract required");
  const deterministic=new Set(availableDeterministicChecks), evidence=new Set(availableEvidenceChecks), env=new Set(availableEnvironments), byId=new Map();
  for(const id of contract.checkOrder){
    const c=contract.checks.find(x=>x.id===id);
    let executor = ["L0_INVARIANT","L1_DETERMINISTIC"].includes(c.layer) ? (deterministic.has(c.id)?"DETERMINISTIC":"MISSING") : c.layer==="L2_EVIDENCE" ? (evidence.size===0||evidence.has(c.id)?"EVIDENCE":"MISSING") : c.layer==="L3_SEMANTIC" ? "SEMANTIC" : "ADVERSARIAL";
    const missingEnvironment=c.environmentRequirements.filter(x=>!env.has(x)); if(missingEnvironment.length) executor="MISSING";
    const dependencyBlocked=c.dependencies.some(d=>byId.get(d)?.executor==="MISSING"); if(dependencyBlocked) executor="BLOCKED_BY_DEPENDENCY";
    byId.set(c.id,{...c,executor,missingEnvironment});
  }
  const checks=contract.checkOrder.map(id=>byId.get(id)), blockedRequired=checks.filter(c=>c.hard&&(c.executor==="MISSING"||c.executor==="BLOCKED_BY_DEPENDENCY")).map(c=>c.id);
  const body={schemaVersion:2,contractId:contract.id,checks,requiredLayers:[...new Set(checks.map(c=>c.layer))],semanticNeeded:checks.some(c=>c.layer==="L3_SEMANTIC"),adversarialNeeded:checks.some(c=>c.layer==="L4_ADVERSARIAL"),blockedRequired};
  return freeze({...body,id:`verify-plan-${hash(body).slice(0,24)}`});
}

function normalizeEvidence(e={}, obs={}, contract=null){
  const type=String(e.type||e.evidenceClass||"").toUpperCase(), sourceRef=text(e.sourceRef), h=text(e.hash);
  if(!type||!sourceRef||!h) return null;
  const observedAt=nowMs(e.observedAt), cluster=text(e.dependencyCluster||e.clusterId)||`source:${sourceRef}`;
  return {type,sourceRef,hash:h,subjectHash:text(e.subjectHash)||null,checkId:text(e.checkId)||text(obs.checkId)||null,property:text(e.property)||null,
    verifierId:text(e.verifierId)||text(obs.observerId)||null,verifierRevision:text(e.verifierRevision)||null,observedAt,dependencyCluster:cluster,
    environmentId:text(e.environmentId)||null,lineageHash:text(e.lineageHash)||null,selfReported:e.selfReported===true,authorityClass:text(e.authorityClass)||null};
}
function normalizeObservation(o={},contract=null){
  const status=String(o.status||"INCONCLUSIVE").toUpperCase(); if(!["PASS","FAIL","INCONCLUSIVE","BLOCKED"].includes(status)) throw new Error("invalid observation status");
  const checkId=text(o.checkId); if(!checkId) throw new Error("observation checkId required");
  const evidence=(o.evidence||[]).map(e=>normalizeEvidence(e,o,contract)).filter(Boolean);
  return {checkId,status,evidence,reason:text(o.reason)||null,observerId:text(o.observerId)||null,observerRevision:text(o.observerRevision)||null,artifactHash:text(o.artifactHash)||null};
}

function evidenceSufficiency(check, observations, contract, now=Date.now()){
  const evidence=observations.flatMap(o=>o.evidence), reasons=[];
  for(const required of check.requiredEvidence){
    const rows=evidence.filter(e=>e.type===required);
    if(!rows.length){ reasons.push(`missing-evidence-class:${required}`); continue; }
    const valid=rows.filter(e=>{
      if(contract.subjectHash && e.subjectHash!==contract.subjectHash) return false;
      if(e.checkId && e.checkId!==check.id) return false;
      if(e.property && e.property!==check.property) return false;
      if(check.freshnessMs!=null && (e.observedAt==null || now-e.observedAt>check.freshnessMs || e.observedAt>now+60000)) return false;
      return true;
    });
    if(!valid.length){ reasons.push(`invalid-evidence-binding:${required}`); continue; }
    const clusters=new Set(valid.filter(e=>!e.selfReported).map(e=>e.dependencyCluster));
    if(clusters.size<check.minIndependentSources) reasons.push(`insufficient-independent-evidence:${required}:${clusters.size}/${check.minIndependentSources}`);
  }
  return {pass:reasons.length===0,reasons,evidenceCount:evidence.length};
}
function artifactGate(contract,candidate){const hashes=new Set(candidate.artifacts.map(a=>a.hash)),reasons=[];for(const h of contract.requiredArtifactHashes)if(!hashes.has(h))reasons.push(`required_artifact_missing:${h}`);for(const h of contract.forbiddenArtifactHashes)if(hashes.has(h))reasons.push(`forbidden_artifact_present:${h}`);return reasons;}
function effectGate(requirement,effectRecords=[]){if(!requirement)return {status:"PASS",reason:"no-effect-requirement"};const key=text(requirement.effectKey),record=effectRecords.find(r=>r&&r.key===key);if(!record)return {status:"INCONCLUSIVE",reason:"effect-record-missing"};if(record.lifecycle!=="CLOSED")return {status:"INCONCLUSIVE",reason:"effect-not-closed"};const expected=String(requirement.expectedCertainty||"PRESENT_VERIFIED").toUpperCase();if(record.effectCertainty!==expected)return {status:"FAIL",reason:`effect-certainty:${record.effectCertainty}`};return {status:"PASS",reason:"effect-verified"};}

function judgeGate(contract,candidate,judge){
  if(!contract.independentJudgeRequired) return {status:"PASS",reasons:[]};
  if(!judge) return {status:"INCONCLUSIVE",reasons:["independent-adjudication-missing"]};
  const reasons=[];
  if(!judge.judgeId) reasons.push("judge-identity-missing");
  if(candidate.builderId&&judge.judgeId===candidate.builderId) reasons.push("builder-is-independent-judge");
  if(candidate.builderContextFingerprint&&judge.contextFingerprint&&judge.contextFingerprint===candidate.builderContextFingerprint) reasons.push("judge-context-not-independent");
  if(judge.qualified!==true && judge.promotionStatus!=="QUALIFIED") reasons.push("judge-not-qualified");
  const verdict=String(judge.verdict||"INCONCLUSIVE").toUpperCase();
  if(verdict==="FAIL") return {status:"FAIL",reasons:[...reasons,"adversarial-judge-fail"]};
  if(verdict!=="PASS") reasons.push("adversarial-judge-inconclusive");
  if(reasons.some(x=>["builder-is-independent-judge","judge-context-not-independent","judge-not-qualified"].includes(x))) return {status:"FAIL",reasons};
  return {status:reasons.length?"INCONCLUSIVE":"PASS",reasons};
}

function adjudicate({contract,candidate,observations=[],plan=null,semanticJudge=null,adversarialJudge=null,effectRecords=[],repairCycle=0,now=Date.now()}={}){
  if(!contract||!candidate) return {verdict:"INCONCLUSIVE",legacyVerdict:"INCONCLUSIVE",reason:"missing-contract-or-candidate",receipt:null};
  const hardReasons=[],repairReasons=[],inconclusive=[],blocked=[],normalized=observations.map(o=>normalizeObservation(o,contract)),byCheck=new Map();
  for(const o of normalized){if(!byCheck.has(o.checkId))byCheck.set(o.checkId,[]);byCheck.get(o.checkId).push(o);}
  if(candidate.taskId!==contract.taskId) hardReasons.push("task-identity-mismatch");
  if(contract.subjectHash&&candidate.subjectHash!==contract.subjectHash) hardReasons.push("subject-hash-mismatch");
  if(contract.scopeFingerprint&&candidate.scopeFingerprint!==contract.scopeFingerprint) hardReasons.push("scope-mismatch");
  if(contract.authorityFingerprint&&candidate.authorityFingerprint!==contract.authorityFingerprint) hardReasons.push("authority-mismatch");
  hardReasons.push(...artifactGate(contract,candidate));
  if(plan&&plan.contractId!==contract.id) hardReasons.push("verification-plan-contract-mismatch");
  if(plan) blocked.push(...(plan.blockedRequired||[]).map(id=>`blocked-check:${id}`));

  const matrix=[];
  for(const check of contract.checks){
    const rows=byCheck.get(check.id)||[], statuses=new Set(rows.map(r=>r.status));
    let state="UNKNOWN", reasons=[];
    if(!rows.length){ if(plan&&plan.blockedRequired?.includes(check.id)){state="BLOCKED";reasons.push("executor-unavailable");} else {state="UNKNOWN";reasons.push("missing-check");} }
    else if(statuses.has("BLOCKED")){ state="BLOCKED"; reasons.push("check-blocked"); }
    else if(statuses.has("PASS")&&statuses.has("FAIL")){
      if(["L0_INVARIANT","L1_DETERMINISTIC","L2_EVIDENCE"].includes(check.layer)){state="REFUTED";reasons.push("blocking-contradiction");}
      else {state="CONFLICT";reasons.push("judge-disagreement");}
    } else if(statuses.has("FAIL")){state="REFUTED";reasons.push("check-failed");}
    else if(statuses.has("PASS")){
      const suff=evidenceSufficiency(check,rows,contract,now); if(suff.pass) state="SUPPORTED"; else {state="UNKNOWN";reasons.push(...suff.reasons);}
    } else {state="UNKNOWN";reasons.push("check-inconclusive");}
    matrix.push({checkId:check.id,property:check.property,state,reasons});
    if(state==="REFUTED"){
      if(check.hard){ if(check.repairable) repairReasons.push(check.id); else hardReasons.push(`hard-fail:${check.id}`); }
      else repairReasons.push(check.id);
    } else if(state==="BLOCKED"){ if(check.hard) blocked.push(`blocked-check:${check.id}`); }
    else if(state==="CONFLICT"||state==="UNKNOWN"){ if(check.hard) inconclusive.push(`${state.toLowerCase()}:${check.id}:${reasons.join("|")}`); }
  }

  const effect=effectGate(contract.effectRequirement,effectRecords); if(effect.status==="FAIL") hardReasons.push(effect.reason); else if(effect.status==="INCONCLUSIVE") inconclusive.push(effect.reason);
  if(contract.checks.some(c=>c.layer==="L3_SEMANTIC")&&semanticJudge){ const v=String(semanticJudge.verdict||"INCONCLUSIVE").toUpperCase(); if(v==="FAIL")repairReasons.push("semantic-judge-fail"); else if(v!=="PASS")inconclusive.push("semantic-judge-inconclusive"); }
  const independent=judgeGate(contract,candidate,adversarialJudge); if(independent.status==="FAIL") hardReasons.push(...independent.reasons); else if(independent.status==="INCONCLUSIVE") inconclusive.push(...independent.reasons);

  let verdict="PASS",reason="all-required-verification-passed";
  if(hardReasons.length){verdict="FAIL";reason=hardReasons.join(",");}
  else if(repairReasons.length&&repairCycle<contract.maxRepairCycles){verdict="REPAIR_REQUIRED";reason=repairReasons.join(",");}
  else if(repairReasons.length){verdict="FAIL";reason="repair-budget-exhausted:"+repairReasons.join(",");}
  else if(blocked.length){verdict="BLOCKED";reason=[...new Set(blocked)].join(",");}
  else if(inconclusive.length){verdict="INCONCLUSIVE";reason=[...new Set(inconclusive)].join(",");}

  const observationHashes=normalized.map(hash).sort(), matrixHash=hash(matrix), repairDirective=verdict==="REPAIR_REQUIRED"?{failedCriteria:[...new Set(repairReasons)],recheckSet:[...new Set(repairReasons)],contractChanged:false}:null;
  const receiptBody={schemaVersion:2,contractId:contract.id,candidateHash:candidate.resultHash,verdict,reason,observationHashes,matrixHash,planId:plan?.id||null,semanticJudgeHash:semanticJudge?hash(semanticJudge):null,adversarialJudgeHash:adversarialJudge?hash(adversarialJudge):null,effectGate:effect,dependencyFingerprints:contract.dependencyFingerprints};
  const receipt=freeze({...receiptBody,id:`judge-${hash(receiptBody).slice(0,24)}`});
  return {verdict,legacyVerdict:LEGACY_VERDICTS[verdict],reason,hardReasons:[...new Set(hardReasons)],repairReasons:[...new Set(repairReasons)],inconclusive:[...new Set(inconclusive)],blocked:[...new Set(blocked)],matrix,repairDirective,receipt};
}

function verifyReceipt({receipt,contract,candidate}={}){
  if(!receipt||!contract||!candidate||!VERDICTS.includes(receipt.verdict)) return false;
  if(receipt.contractId!==contract.id||receipt.candidateHash!==candidate.resultHash) return false;
  const body={...receipt}; delete body.id;
  return receipt.id===`judge-${hash(body).slice(0,24)}`;
}
function dependencyInvalidation({receipt,contract,currentDependencies={}}={}){
  if(!receipt||!contract) return {valid:false,reasons:["receipt-or-contract-missing"],changed:[]};
  const changed=[]; const previous=receipt.dependencyFingerprints||{};
  for(const k of new Set([...Object.keys(previous),...Object.keys(currentDependencies)])) if(JSON.stringify(stable(previous[k]))!==JSON.stringify(stable(currentDependencies[k]))) changed.push(k);
  return {valid:changed.length===0,reasons:changed.map(x=>`dependency-changed:${x}`),changed};
}

module.exports={VERDICTS,LEGACY_VERDICTS,LAYERS,EVIDENCE_CLASSES,hash,createVerificationSubject,createAcceptanceContract,createCandidateResult,createJudgeProfile,createVerificationPlan,adjudicate,verifyReceipt,effectGate,evidenceSufficiency,dependencyInvalidation};
