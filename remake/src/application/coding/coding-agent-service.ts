import type { PatchPlan, RepositorySnapshot } from "./contracts";
import { createCodingRun, transitionCodingRun, type CodingRun } from "./run-controller";
import { buildRepositoryMap } from "./repo-intelligence";
import { reviewCandidateDiff, type DiffReview } from "./diff-review";
import { applyPatchPlan } from "./patch-transaction";
import { selectVerificationPlan } from "./test-selector";
import { runVerificationPlan, type VerificationEvidence, type VerificationExecutionPort } from "./verification-runner";
import { CodingWorkspaceService } from "./repository-port";
import type { CodingAgentModel, CodingDiagnosis, CodingUnderstanding, ModelPatchProposal } from "./provider-coding-agent";

export interface CodingResearchPort{research(query:string,signal:AbortSignal):Promise<Readonly<{text:string;sourceIds:readonly string[]}>>}
export interface VerificationExecutorFactory{create(input:Readonly<{repository:string;branch:string;baseSha:string;commitSha:string}>):VerificationExecutionPort}
export type CodingAgentResult=Readonly<{status:"PASS"|"FAIL"|"BLOCKED";run:CodingRun;commitSha?:string;verification?:VerificationEvidence;review?:Readonly<{verdict:string;summary:string;findings:readonly string[]}>;attempts:number;message:string}>;

function bindProposal(snapshot:RepositorySnapshot,proposal:ModelPatchProposal,taskId:string):PatchPlan{
 const byPath=new Map(snapshot.files.map(f=>[f.path,f]));
 const operations=proposal.operations.map(op=>{
  if(op.kind==="create"){if(byPath.has(op.path))throw new Error(`Create target already exists: ${op.path}`);return op;}
  const file=byPath.get(op.path);if(!file)throw new Error(`Coding model attempted to mutate an uninspected path: ${op.path}`);
  if(op.kind==="delete")return {kind:"delete" as const,path:op.path,expectedSha256:file.sha256};
  if(op.kind==="replace")return {kind:"replace" as const,path:op.path,expectedSha256:file.sha256,content:op.content};
  return {kind:"patch" as const,path:op.path,expectedSha256:file.sha256,edits:op.edits};
 });
 return Object.freeze({version:1,planId:crypto.randomUUID(),taskId,baseSha:snapshot.headSha,snapshotFingerprint:snapshot.fingerprint,operations:Object.freeze(operations)});
}
function unique(paths:readonly string[]):readonly string[]{return Object.freeze([...new Set(paths)].sort())}

export class CodingAgentService{
 constructor(private readonly workspace:CodingWorkspaceService,private readonly model:CodingAgentModel,private readonly verificationFactory:VerificationExecutorFactory,private readonly research?:CodingResearchPort){}
 async run(input:Readonly<{taskId:string;runId:string;task:string;repository:string;branch:string;inspectionPaths?:readonly string[];acceptanceCriteria:readonly string[];signal:AbortSignal;maxRepairAttempts?:number}>):Promise<CodingAgentResult>{
  let run=createCodingRun({runId:input.runId,taskId:input.taskId,acceptanceCriteria:input.acceptanceCriteria});
  let inspectionPaths=input.inspectionPaths?.length
   ? unique(input.inspectionPaths)
   : await this.workspace.discover({repository:input.repository,branch:input.branch,query:input.task,signal:input.signal,maxFiles:64,maxBytes:4_000_000});
  let repairInstruction: string|undefined;
  let understanding: CodingUnderstanding|undefined;
  let researchEvidence:readonly string[]=[];
  let lastVerification:VerificationEvidence|undefined,lastReview:Readonly<{verdict:string;summary:string;findings:readonly string[]}>|undefined,lastCommit:string|undefined;
  const maxAttempts=Math.max(1,Math.min(5,input.maxRepairAttempts??3));
  for(let attempt=1;attempt<=maxAttempts;attempt+=1){
   const snapshot=await this.workspace.inspect({repository:input.repository,branch:input.branch,paths:inspectionPaths,signal:input.signal});
   if(attempt===1){
    run=transitionCodingRun(run,"INSPECT",{kind:"workspace-inspected",summary:`Inspected ${snapshot.files.length} files at ${snapshot.headSha}.`});
    const repoMap=buildRepositoryMap(snapshot,input.task,{maxEntries:24,charBudget:12000});
    understanding=await this.model.understand({task:input.task,repoMap,snapshot,signal:input.signal});
    inspectionPaths=unique([...inspectionPaths,...understanding.inspectHints.filter(p=>snapshot.files.some(f=>f.path===p))]);
    const researchRows:string[]=[];
   if(understanding.researchQueries.length){
     if(!this.research){run=transitionCodingRun(run,"BLOCKED",{kind:"research-unavailable",summary:"Model requested external research but no research adapter is available."});return{status:"BLOCKED",run,attempts:attempt,message:"Required research is unavailable."};}
     for(const q of understanding.researchQueries){const result=await this.research.research(q,input.signal);researchRows.push(result.text);}
   }
   researchEvidence=Object.freeze(researchRows);
   run=transitionCodingRun(run,"RESEARCH",{kind:"research-accounted",summary:understanding.researchQueries.length?`Completed ${understanding.researchQueries.length} research queries.`:"No external research was required."});
   }
   if(!understanding)throw new Error("Coding understanding is missing.");
   const repoMap=buildRepositoryMap(snapshot,input.task,{maxEntries:24,charBudget:12000});
   const proposal=await this.model.proposePatch({task:input.task,understanding,repoMap,snapshot,research:researchEvidence,repairInstruction,signal:input.signal});
  const plan=bindProposal(snapshot,proposal,input.taskId);
   if(attempt===1)run=transitionCodingRun(run,"PLAN",{kind:"patch-planned",summary:proposal.summary});
  const preview=await applyPatchPlan(snapshot,plan);
   if(preview.status==="REJECTED"){run=transitionCodingRun(run,"FAILED",{kind:"plan-rejected",summary:preview.message});return{status:"FAIL",run,attempts:attempt,message:preview.message};}
   const diffReview=reviewCandidateDiff(snapshot,preview.candidate);
   if(diffReview.status==="REJECT"){run=transitionCodingRun(run,"FAILED",{kind:"diff-policy-rejected",summary:"Deterministic diff review rejected the proposed patch."});return{status:"FAIL",run,attempts:attempt,message:"Diff policy rejected the proposed patch."};}
  if(attempt===1)run=transitionCodingRun(run,"EDIT",{kind:"edit-authorized",summary:`Applying ${plan.operations.length} validated operations.`});
   else run=transitionCodingRun(run,"EDIT",{kind:"repair-authorized",summary:`Applying bounded repair attempt ${attempt}.`});
  const applied=await this.workspace.apply({snapshot,plan,message:`Seven Coding: ${proposal.summary}`.slice(0,512),signal:input.signal});
  if(applied.status!=="COMMITTED"){run=transitionCodingRun(run,"FAILED",{kind:"rejected",summary:applied.message});return{status:"FAIL",run,attempts:attempt,message:applied.message};}
  lastCommit=applied.commitSha;
  run=transitionCodingRun(run,"TEST",{kind:"commit-created",summary:`Candidate committed as ${applied.commitSha}.`});
  const vplan=selectVerificationPlan(applied.changedPaths);
  const executor=this.verificationFactory.create({repository:input.repository,branch:input.branch,baseSha:applied.baseSha,commitSha:applied.commitSha});
  lastVerification=await runVerificationPlan(vplan,executor,input.signal);
  if(lastVerification.status!=="PASS"){
   if(attempt===maxAttempts){run=transitionCodingRun(run,"FAILED",{kind:"verification-failed",summary:"Verification failed after repair budget was exhausted."});return{status:"FAIL",run,commitSha:lastCommit,verification:lastVerification,attempts:attempt,message:"Verification failed."};}
   run=transitionCodingRun(run,"DEBUG",{kind:"verification-failed",summary:`Verification failed on attempt ${attempt}; entering bounded repair.`});
   const diagnosis=await this.model.diagnose({task:input.task,verification:lastVerification,diffReview,signal:input.signal});
   repairInstruction=diagnosis.repairInstruction;
   inspectionPaths=unique([...inspectionPaths,...diagnosis.inspectHints]);
   continue;
  }
  run=transitionCodingRun(run,"VERIFY",{kind:"verification-pass",summary:`All ${lastVerification.results.length} selected verification gates passed.`});
  const review=await this.model.review({task:input.task,snapshot,proposal,verification:lastVerification,diffReview,signal:input.signal});
  lastReview=review;
  run=transitionCodingRun(run,"REVIEW",{kind:"independent-review",summary:review.summary});
  if(review.verdict==="PASS"){
   run=transitionCodingRun(run,"DOCUMENT",{kind:"evidence-documented",summary:`Verified commit ${applied.commitSha} with ${lastVerification.results.length} command results.`});
   run=transitionCodingRun(run,"COMPLETE",{kind:"coding-complete",summary:"Coding task completed with verification and independent review."});
   return{status:"PASS",run,commitSha:lastCommit,verification:lastVerification,review:lastReview,attempts:attempt,message:"Verified coding task completed."};
  }
  if(review.verdict==="BLOCKED"){
   run=transitionCodingRun(run,"BLOCKED",{kind:"review-blocked",summary:review.summary});
   return{status:"BLOCKED",run,commitSha:lastCommit,verification:lastVerification,review:lastReview,attempts:attempt,message:review.summary};
  }
  if(attempt===maxAttempts){run=transitionCodingRun(run,"FAILED",{kind:"review-rejected",summary:"Reviewer requested changes after repair budget was exhausted."});return{status:"FAIL",run,commitSha:lastCommit,verification:lastVerification,review:lastReview,attempts:attempt,message:"Reviewer rejected candidate."};}
  run=transitionCodingRun(run,"DEBUG",{kind:"review-requested-changes",summary:review.summary});
  repairInstruction=review.findings.join("\n")||review.summary;
 }
 return{status:"FAIL",run,commitSha:lastCommit,verification:lastVerification,review:lastReview,attempts:maxAttempts,message:"Coding loop exhausted."};
 }
}
