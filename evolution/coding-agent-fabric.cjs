"use strict";

const crypto=require("crypto");

const RISK=Object.freeze(["LOW","MEDIUM","HIGH","CRITICAL"]);
const REQ_KIND=Object.freeze(["FUNCTIONAL","BUG","SAFETY","SECURITY","PERFORMANCE","UX","COMPATIBILITY","TEST","NON_GOAL"]);
function text(v){return typeof v==="string"?v.trim():"";}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o;}return v;}
function hash(v){return crypto.createHash("sha256").update(typeof v==="string"?v:JSON.stringify(stable(v))).digest("hex");}
function uniq(v){return [...new Set((Array.isArray(v)?v:[]).map(text).filter(Boolean))].sort();}
function freeze(v){return Object.freeze(v);}

function createRequirementLedger(input={}){
  const taskId=text(input.taskId),items=input.items||[];if(!taskId||!items.length)throw new Error("requirement ledger task/items required");
  const normalized=items.map((r,i)=>{
    const id=text(r.id)||`req-${i+1}`,sourceRef=text(r.sourceRef),sourceHash=text(r.sourceHash),statementHash=text(r.statementHash)||(text(r.statement)?hash(text(r.statement)):"");
    if(!id||!sourceRef||!sourceHash||!statementHash)throw new Error("requirement source binding incomplete");
    const kind=String(r.kind||"FUNCTIONAL").toUpperCase();if(!REQ_KIND.includes(kind))throw new Error("invalid requirement kind");
    return {id,kind,sourceRef,sourceHash,statementHash,hard:r.hard!==false,acceptanceIds:uniq(r.acceptanceIds),supersedes:uniq(r.supersedes)};
  });
  if(new Set(normalized.map(x=>x.id)).size!==normalized.length)throw new Error("duplicate requirement id");
  const body={schemaVersion:1,taskId,items:normalized,sourceSetHash:hash(normalized.map(x=>[x.sourceRef,x.sourceHash]).sort())};
  return freeze({...body,id:`requirements-${hash(body).slice(0,24)}`});
}
function createDevEnvironment(input={}){
  const environmentId=text(input.environmentId),projectRootId=text(input.projectRootId),toolSnapshotId=text(input.toolSnapshotId);if(!environmentId||!projectRootId||!toolSnapshotId)throw new Error("dev environment identity incomplete");
  const body={schemaVersion:1,environmentId,projectRootId,toolSnapshotId,runtimeRevision:text(input.runtimeRevision)||"unknown",os:text(input.os)||"unknown",arch:text(input.arch)||"unknown",qualifiedCommands:uniq(input.qualifiedCommands),packageManager:text(input.packageManager)||null,sandboxClass:text(input.sandboxClass)||"workspace-write",networkClass:text(input.networkClass)||"restricted"};
  return freeze({...body,id:`dev-env-${hash(body).slice(0,24)}`});
}
function createChangeContract(input={}){
  const taskId=text(input.taskId),goalHash=text(input.goalHash),projectRootId=text(input.projectRootId),baselineManifestHash=text(input.baselineManifestHash),requirementsId=text(input.requirementsId),environmentId=text(input.environmentId);
  if(!taskId||!goalHash||!projectRootId||!baselineManifestHash||!requirementsId||!environmentId)throw new Error("change contract identity incomplete");
  const risk=String(input.risk||"MEDIUM").toUpperCase();if(!RISK.includes(risk))throw new Error("invalid coding risk");
  const body={schemaVersion:1,taskId,goalHash,projectRootId,baselineManifestHash,requirementsId,environmentId,risk,allowedPaths:uniq(input.allowedPaths),forbiddenPaths:uniq(input.forbiddenPaths),protectedPolicyId:text(input.protectedPolicyId)||null,scopeFingerprint:text(input.scopeFingerprint)||null,authorityFingerprint:text(input.authorityFingerprint)||null,maxRepairCycles:Math.max(0,Math.min(12,Math.floor(Number(input.maxRepairCycles)||2))),requireReproduction:input.requireReproduction!==false,requiredVerificationLayers:uniq(input.requiredVerificationLayers),nonGoals:uniq(input.nonGoals)};
  if(!body.allowedPaths.length)throw new Error("change contract allowedPaths required");
  return freeze({...body,id:`change-contract-${hash(body).slice(0,24)}`});
}
function createBaselineProof({changeContract,manifestHash,fileVersionsHash,testManifestHash,environmentId,toolSnapshotId,observedAt=null}={}){
  if(!changeContract)throw new Error("change contract required");
  if(text(manifestHash)!==changeContract.baselineManifestHash)throw new Error("baseline proof manifest mismatch");
  if(text(environmentId)!==changeContract.environmentId)throw new Error("baseline proof environment mismatch");
  const body={schemaVersion:1,changeContractId:changeContract.id,manifestHash:text(manifestHash),fileVersionsHash:text(fileVersionsHash),testManifestHash:text(testManifestHash),environmentId:text(environmentId),toolSnapshotId:text(toolSnapshotId),observedAt};
  if(!body.fileVersionsHash||!body.testManifestHash||!body.toolSnapshotId)throw new Error("baseline proof evidence incomplete");
  return freeze({...body,id:`baseline-proof-${hash(body).slice(0,24)}`});
}
function createCandidateWorkspace({changeContract,baselineProof,workspaceId,isolationProofHash,projectTransactionId=null}={}){
  if(!changeContract||!baselineProof||baselineProof.changeContractId!==changeContract.id)throw new Error("candidate baseline mismatch");
  const body={schemaVersion:1,workspaceId:text(workspaceId),changeContractId:changeContract.id,baselineProofId:baselineProof.id,baselineManifestHash:changeContract.baselineManifestHash,isolationProofHash:text(isolationProofHash),projectTransactionId:text(projectTransactionId)||null,state:"ISOLATED"};
  if(!body.workspaceId||!body.isolationProofHash)throw new Error("candidate workspace identity incomplete");
  return freeze({...body,id:`candidate-workspace-${hash(body).slice(0,24)}`});
}
function createReproductionReceipt({changeContract,baselineProof,reproduced,evidenceHashes=[],reason=null}={}){
  if(!changeContract||!baselineProof)throw new Error("contract/baseline required");
  const body={schemaVersion:1,changeContractId:changeContract.id,baselineProofId:baselineProof.id,reproduced:reproduced===true,evidenceHashes:uniq(evidenceHashes),reason:text(reason)||null};
  if(changeContract.requireReproduction&&body.reproduced&&!body.evidenceHashes.length)throw new Error("reproduction evidence required");
  if(changeContract.requireReproduction&&!body.reproduced&&!body.reason)throw new Error("non-reproduction reason required");
  return freeze({...body,id:`reproduction-${hash(body).slice(0,24)}`});
}
function createInvestigationRecord({changeContract,queries=[],filesInspected=[],symbolsInspected=[],findings=[],projectMapId=null}={}){
  if(!changeContract)throw new Error("change contract required");
  const body={schemaVersion:1,changeContractId:changeContract.id,queries:uniq(queries),filesInspected:uniq(filesInspected),symbolsInspected:uniq(symbolsInspected),findings:(findings||[]).map(f=>({id:text(f.id),evidenceHash:text(f.evidenceHash),claimHash:text(f.claimHash)})),projectMapId:text(projectMapId)||null};
  if(body.findings.some(x=>!x.id||!x.evidenceHash||!x.claimHash))throw new Error("investigation finding evidence incomplete");
  return freeze({...body,id:`investigation-${hash(body).slice(0,24)}`});
}
function createTestSelectionRecord({changeContract,baselineProof,candidateWorkspace,tests=[],baselineTestManifestHash}={}){
  if(!changeContract||!baselineProof||!candidateWorkspace)throw new Error("test selection context required");
  if(candidateWorkspace.changeContractId!==changeContract.id||baselineProof.changeContractId!==changeContract.id)throw new Error("test selection identity mismatch");
  if(text(baselineTestManifestHash)!==baselineProof.testManifestHash)throw new Error("test manifest drift");
  const rows=(tests||[]).map(t=>({id:text(t.id),commandHash:text(t.commandHash),reason:text(t.reason),layer:text(t.layer)||"TARGETED",requirementIds:uniq(t.requirementIds),expectedArtifactKinds:uniq(t.expectedArtifactKinds)}));
  if(!rows.length||rows.some(t=>!t.id||!t.commandHash||!t.reason))throw new Error("test selection incomplete");
  if(new Set(rows.map(x=>x.id)).size!==rows.length)throw new Error("duplicate test id");
  const body={schemaVersion:1,changeContractId:changeContract.id,baselineProofId:baselineProof.id,candidateWorkspaceId:candidateWorkspace.id,baselineTestManifestHash:text(baselineTestManifestHash),tests:rows};
  return freeze({...body,id:`test-selection-${hash(body).slice(0,24)}`});
}
function createReviewConstraintSet(input={}){
  const changeContractId=text(input.changeContractId),baselineTestManifestHash=text(input.baselineTestManifestHash);if(!changeContractId||!baselineTestManifestHash)throw new Error("review constraints identity incomplete");
  const body={schemaVersion:1,changeContractId,baselineTestManifestHash,requiredGates:uniq(input.requiredGates),forbiddenChangedPaths:uniq(input.forbiddenChangedPaths),mustPreserveTestIds:uniq(input.mustPreserveTestIds),allowTestChanges:input.allowTestChanges===true,allowEvalChanges:input.allowEvalChanges===true,minReviewers:Math.max(1,Math.floor(Number(input.minReviewers)||1))};
  return freeze({...body,id:`review-constraints-${hash(body).slice(0,24)}`});
}
function validateCandidateScope({changeContract,changedPaths=[]}={}){
  if(!changeContract)return {pass:false,reasons:["change-contract-missing"]};
  const reasons=[];
  function within(path,prefix){return path===prefix||path.startsWith(prefix+"/");}
  for(const p of changedPaths){
    const path=text(p).replace(/\\/g,"/").replace(/^\.\//,"");
    if(path.includes("../")||path===".."||path.startsWith("/"))reasons.push(`unsafe-path:${p}`);
    if(!changeContract.allowedPaths.some(a=>within(path,a)))reasons.push(`out-of-scope:${path}`);
    if(changeContract.forbiddenPaths.some(a=>within(path,a)))reasons.push(`forbidden-path:${path}`);
  }
  return {pass:reasons.length===0,reasons:[...new Set(reasons)]};
}
function createVerificationRunRecord({testSelection,testResults=[],reviewResults=[],changedPaths=[],baselineTestManifestHash,currentTestManifestHash}={}){
  if(!testSelection)throw new Error("test selection required");
  const tests=(testResults||[]).map(r=>({testId:text(r.testId),status:String(r.status||"INCONCLUSIVE").toUpperCase(),artifactHash:text(r.artifactHash),exitCode:Number.isInteger(r.exitCode)?r.exitCode:null,commandHash:text(r.commandHash)}));
  const reviews=(reviewResults||[]).map(r=>({reviewerId:text(r.reviewerId),status:String(r.status||"INCONCLUSIVE").toUpperCase(),evidenceHash:text(r.evidenceHash),independent:r.independent===true}));
  if(tests.some(r=>!r.testId||!r.artifactHash||!r.commandHash))throw new Error("test result evidence incomplete");
  if(reviews.some(r=>!r.reviewerId||!r.evidenceHash))throw new Error("review result evidence incomplete");
  const body={schemaVersion:1,testSelectionId:testSelection.id,testResults:tests,reviewResults:reviews,changedPaths:uniq(changedPaths),baselineTestManifestHash:text(baselineTestManifestHash),currentTestManifestHash:text(currentTestManifestHash)};
  return freeze({...body,id:`verification-run-${hash(body).slice(0,24)}`});
}
function assessVerification({changeContract,requirementLedger,baselineProof,testSelection,reviewConstraints,verificationRun}={}){
  const reasons=[],coverage=new Map(requirementLedger.items.filter(r=>r.kind!=="NON_GOAL").map(r=>[r.id,new Set()]));
  if(verificationRun.baselineTestManifestHash!==baselineProof.testManifestHash)reasons.push("baseline-test-manifest-mismatch");
  if(!reviewConstraints.allowTestChanges&&verificationRun.currentTestManifestHash!==baselineProof.testManifestHash)reasons.push("test-manifest-modified");
  const selected=new Map(testSelection.tests.map(t=>[t.id,t]));
  for(const result of verificationRun.testResults){
    const spec=selected.get(result.testId);if(!spec){reasons.push(`unselected-test:${result.testId}`);continue;}
    if(spec.commandHash!==result.commandHash)reasons.push(`test-command-drift:${result.testId}`);
    if(result.status!=="PASS"||result.exitCode!==0)reasons.push(`test-failed:${result.testId}`);
    if(result.status==="PASS")for(const rid of spec.requirementIds)coverage.get(rid)?.add(result.testId);
  }
  for(const spec of testSelection.tests)if(!verificationRun.testResults.some(r=>r.testId===spec.id))reasons.push(`test-not-run:${spec.id}`);
  const independentPass=verificationRun.reviewResults.filter(r=>r.status==="PASS"&&r.independent).length;
  if(independentPass<reviewConstraints.minReviewers)reasons.push("insufficient-independent-review");
  const scope=validateCandidateScope({changeContract,changedPaths:verificationRun.changedPaths});reasons.push(...scope.reasons);
  for(const path of verificationRun.changedPaths)if(reviewConstraints.forbiddenChangedPaths.includes(path))reasons.push(`review-forbidden-path:${path}`);
  for(const req of requirementLedger.items.filter(r=>r.hard&&r.kind!=="NON_GOAL"))if(!coverage.get(req.id)?.size)reasons.push(`hard-requirement-uncovered:${req.id}`);
  return {pass:reasons.length===0,reasons:[...new Set(reasons)],coverage:Object.fromEntries([...coverage].map(([k,v])=>[k,[...v].sort()]))};
}
function repairDecision({cycle,maxRepairCycles,fingerprint,previousFingerprints=[],newEvidence=false}={}){
  const c=Math.max(0,Math.floor(Number(cycle)||0)),max=Math.max(0,Math.floor(Number(maxRepairCycles)||0)),fp=text(fingerprint);if(!fp)throw new Error("repair fingerprint required");
  if(c>=max)return {action:"STOP_INCONCLUSIVE",reason:"repair-budget-exhausted"};
  const repeats=previousFingerprints.filter(x=>x===fp).length;
  if(repeats>=1&&!newEvidence)return {action:"STOP_INCONCLUSIVE",reason:"no-progress-repeat"};
  return {action:"REPAIR",reason:newEvidence?"new-evidence":"bounded-retry"};
}
function createChangeEvidenceBundle({changeContract,requirementLedger,baselineProof,candidateWorkspace,projectTransaction,verificationRun,verificationAssessment,diffHash,projectMapHash,toolSnapshotId,judgeCandidateHash}={}){
  if(!changeContract||!requirementLedger||!baselineProof||!candidateWorkspace||!projectTransaction||!verificationRun||!verificationAssessment)throw new Error("change evidence context incomplete");
  const reasons=[];
  if(requirementLedger.id!==changeContract.requirementsId)reasons.push("requirement-ledger-mismatch");
  if(baselineProof.id!==candidateWorkspace.baselineProofId)reasons.push("candidate-baseline-mismatch");
  if(projectTransaction.state!=="VERIFIED")reasons.push("project-transaction-not-verified");
  if(!verificationAssessment.pass)reasons.push("verification-assessment-failed");
  const body={schemaVersion:1,changeContractId:changeContract.id,requirementsId:requirementLedger.id,baselineProofId:baselineProof.id,candidateWorkspaceId:candidateWorkspace.id,projectTransactionId:projectTransaction.id,projectTransactionVerificationReceiptId:projectTransaction.verificationReceipt?.id||null,verificationRunId:verificationRun.id,verificationAssessmentHash:hash(verificationAssessment),diffHash:text(diffHash),projectMapHash:text(projectMapHash),toolSnapshotId:text(toolSnapshotId),judgeCandidateHash:text(judgeCandidateHash),coverage:stable(verificationAssessment.coverage),preflightReasons:reasons};
  if(!body.diffHash||!body.projectMapHash||!body.toolSnapshotId||!body.judgeCandidateHash)throw new Error("change evidence artifact identity incomplete");
  return freeze({...body,id:`change-evidence-${hash(body).slice(0,24)}`,eligible:reasons.length===0});
}
function createPromotionRequest({changeContract,evidenceBundle,judgeResult,currentBaselineManifestHash}={}){
  const reasons=[];if(!changeContract||!evidenceBundle)reasons.push("contract-or-evidence-missing");
  if(changeContract&&text(currentBaselineManifestHash)!==changeContract.baselineManifestHash)reasons.push("baseline-drift-before-promotion");
  if(evidenceBundle&&!evidenceBundle.eligible)reasons.push("evidence-bundle-ineligible");
  if(!judgeResult||judgeResult.verdict!=="PASS"||!judgeResult.receipt?.id)reasons.push("independent-judge-not-pass");
  if(judgeResult?.receipt?.candidateHash&&evidenceBundle?.judgeCandidateHash!==judgeResult.receipt.candidateHash)reasons.push("judge-candidate-mismatch");
  const body={schemaVersion:1,changeContractId:changeContract?.id||null,evidenceBundleId:evidenceBundle?.id||null,judgeReceiptId:judgeResult?.receipt?.id||null,currentBaselineManifestHash:text(currentBaselineManifestHash),reasons:[...new Set(reasons)]};
  return freeze({...body,id:`promotion-request-${hash(body).slice(0,24)}`,eligible:body.reasons.length===0});
}

module.exports={RISK,REQ_KIND,hash,createRequirementLedger,createDevEnvironment,createChangeContract,createBaselineProof,createCandidateWorkspace,createReproductionReceipt,createInvestigationRecord,createTestSelectionRecord,createReviewConstraintSet,validateCandidateScope,createVerificationRunRecord,assessVerification,repairDecision,createChangeEvidenceBundle,createPromotionRequest};
