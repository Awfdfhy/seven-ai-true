"use strict";
const {executeCodingRequest,CONTRACT_VERSION}=require('../release/coding-integration-contract.cjs');
const {validateChangedPaths}=require('./experiment-lab.cjs');
const {commitLike,discardBestEffort,restoreIfStableChanged}=require('./coding-candidate.cjs');

// Lifecycle owns isolation/cleanup only. Chat 3 owns all edit/test/repair execution.
async function runVerifiedCodingRequest({experiment,baselineSha,agent,adapter,maxAttempts=3}={}){
  if(!adapter)throw Error('public-coding-adapter-required');
  for(const method of ['getStableHeadSha','prepareCandidate','discardCandidate','restoreStable']){
    if(!agent||typeof agent[method]!=='function')throw Error('coding-lifecycle-missing:'+method);
  }
  if(!commitLike(baselineSha))throw Error('baselineSha must be commit-like');
  const initial=await agent.getStableHeadSha();
  if(initial!==baselineSha)return {outcome:'REJECTED_BASE_DRIFT',stage:'PREPARE',expected:baselineSha,observed:initial};
  const prepared=await agent.prepareCandidate({experiment,baselineSha,allowedPaths:[...experiment.allowedPaths]});
  const context={experiment,baselineSha,workspaceId:prepared&&prepared.workspaceId};
  const reject=async(outcome,extra={})=>({outcome,stage:'CODING',...extra,discardError:await discardBestEffort(agent,context,outcome)});
  if(!prepared||prepared.isolated!==true||prepared.baselineSha!==baselineSha||!prepared.workspaceId)return reject('REJECTED_ISOLATION');
  let codingReceipt;
  try{
    const port=typeof adapter==='function'?await adapter(context):adapter;
    const initialCandidate=await port.snapshot();
    if(initialCandidate.sha!==baselineSha)return reject('REJECTED_BASE_DRIFT');
    const guard=async()=>{
      const stable=await restoreIfStableChanged({agent,baselineSha,reason:'stable_changed_during_coding_request'});
      if(!stable.stable||stable.repaired)throw Object.assign(Error('stable-mutated'),{stable});
    };
    await guard();
    const guarded={};
    for(const key of ['snapshot','inspect','research','plan','applyAtomic','runTests','diagnose','repair','diff','verify','propose']){
      if(typeof port[key]==='function')guarded[key]=async(...args)=>{
        await guard();
        if(key==='applyAtomic'){
          const scope=validateChangedPaths(experiment,(args[0].changes||[]).map(c=>c.path));
          if(!scope.valid)throw Error('coding-request-scope-violation');
        }
        const value=await port[key](...args);await guard();return value;
      };
    }
    codingReceipt=await executeCodingRequest(guarded,{task:experiment.hypothesis,source:'self-development',maxRepairs:Math.max(0,Math.min(3,Number(maxAttempts)-1))});
    if(codingReceipt.contract!==CONTRACT_VERSION||codingReceipt.verdict!=='READY_FOR_INTEGRATION')return reject('REJECTED_CODING_RECEIPT',{receipt:codingReceipt});
    if(codingReceipt.baseSha!==baselineSha||!commitLike(codingReceipt.resultSha)||codingReceipt.resultSha===baselineSha)return reject('REJECTED_CANDIDATE_SHA',{receipt:codingReceipt});
    if((await port.snapshot()).sha!==codingReceipt.resultSha)return reject('REJECTED_CANDIDATE_DRIFT',{receipt:codingReceipt});
    const scope=validateChangedPaths(experiment,codingReceipt.filesChanged);
    if(!scope.valid)return reject('REJECTED_SCOPE',{scope,receipt:codingReceipt});
    return {outcome:'PASS',stage:'COMPLETE',workspaceId:String(prepared.workspaceId),baselineSha,candidateSha:codingReceipt.resultSha,changedPaths:scope.changedPaths,attempts:1+codingReceipt.states.filter(s=>s==='REPAIR').length,receipt:codingReceipt};
  }catch(error){
    if(error.stable)return reject(error.stable.stable?'REJECTED_STABLE_MUTATION':'HALT_STABLE_RESTORE_FAILED',{stable:error.stable});
    return reject('REJECTED_CODING_REQUEST',{error:String(error&&error.message||error)});
  }
}
module.exports={runVerifiedCodingRequest};
