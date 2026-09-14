"use strict";

const core = require("./rpg-story-fabric.cjs");
const judge = require("../evolution/judge-fabric.cjs");

function arr(v){ return Array.isArray(v) ? v : []; }
function clone(v){ return v == null ? v : JSON.parse(JSON.stringify(v)); }
function req(v,name){ const s=String(v??"").trim(); if(!s) throw new Error(`${name} required`); return s; }
function freeze(v){ return Object.freeze(v); }
function stable(v){
  if(Array.isArray(v)) return v.map(stable);
  if(v && typeof v === "object"){
    const out={}; for(const k of Object.keys(v).sort()) if(v[k]!==undefined) out[k]=stable(v[k]); return out;
  }
  return v;
}
function exactHash(v){ return core.hash(stable(v)); }

function stateHash(state){ return exactHash(state); }
function branchHash(branch){ return exactHash(branch); }
function sessionSealBody(session){
  return {
    id:session.id, worldId:session.worldId, definitionHash:session.definitionHash, principal:session.principal,
    branch:session.branch, revision:session.revision, stateHash:session.stateHash,
    eventHeadHash:session.eventHeadHash||null, rngState:session.rngState, branchAncestryHash:session.branchAncestryHash||null
  };
}
function sealSession(session){
  const withState={...clone(session),stateHash:stateHash(session.state)};
  return freeze({...withState,sessionSeal:exactHash(sessionSealBody(withState))});
}
function verifySessionSeal(definition,session){
  try{ core.verifySessionBoundary(definition,session); }catch(error){ return {valid:false,reason:"boundary",detail:error.message}; }
  if(!session.stateHash || session.stateHash!==stateHash(session.state)) return {valid:false,reason:"state-hash-drift"};
  if(!session.sessionSeal || session.sessionSeal!==exactHash(sessionSealBody(session))) return {valid:false,reason:"session-seal-drift"};
  const audit=core.auditWorldSession(definition,session);
  if(audit.status!=="PASS") return {valid:false,reason:"event-ledger-invalid",issues:audit.issues};
  return {valid:true,reason:"session-seal-valid"};
}

function createWorldSession(definition,input={}){
  const base=core.createWorldSession(definition,input);
  return sealSession({...base,branchAncestryHash:exactHash({worldId:base.worldId,branch:base.branch,root:true})});
}

function verifyPlayerAction(action,session){
  if(!action || action.source!=="USER") return {valid:false,reason:"player-action-source"};
  if(action.sessionId!==session.id || action.branchId!==session.branch.id || action.baseRevision!==session.revision) return {valid:false,reason:"player-action-boundary"};
  const body={sessionId:action.sessionId,branchId:action.branchId,baseRevision:action.baseRevision,actorId:action.actorId,action:action.action,args:action.args,source:action.source};
  if(action.actionHash!==exactHash(body)) return {valid:false,reason:"player-action-integrity"};
  return {valid:true,reason:"player-action-valid"};
}

function createPlayerAction(definition,session,input={}){
  const check=verifySessionSeal(definition,session); if(!check.valid) throw new Error(`world session invalid:${check.reason}`);
  return core.createPlayerAction(definition,session,input);
}

function proposalIntegrityBody(proposal){
  return {
    id:proposal.id, sessionId:proposal.sessionId, worldId:proposal.worldId, branchId:proposal.branchId,
    baseRevision:proposal.baseRevision, baseStateHash:proposal.baseStateHash,
    operations:proposal.operations, playerActionId:proposal.playerActionId, proposer:proposal.proposer,
    proposalHash:proposal.proposalHash, branchAncestryHash:proposal.branchAncestryHash
  };
}
function createWorldDiffProposal(definition,session,input={}){
  const check=verifySessionSeal(definition,session); if(!check.valid) throw new Error(`world session invalid:${check.reason}`);
  if(input.playerAction){ const pa=verifyPlayerAction(input.playerAction,session); if(!pa.valid) throw new Error(`invalid PlayerAction:${pa.reason}`); }
  const base=core.createWorldDiffProposal(definition,session,input);
  const draft={...base,baseStateHash:session.stateHash,branchAncestryHash:session.branchAncestryHash};
  return freeze({...draft,integrityHash:exactHash(proposalIntegrityBody(draft))});
}

function verifyProposalIntegrity(session,proposal){
  if(!proposal?.integrityHash || proposal.integrityHash!==exactHash(proposalIntegrityBody(proposal))) return {valid:false,reason:"proposal-integrity"};
  if(proposal.baseStateHash!==session.stateHash) return {valid:false,reason:"proposal-state-drift"};
  if(proposal.branchAncestryHash!==session.branchAncestryHash) return {valid:false,reason:"proposal-branch-ancestry-drift"};
  return {valid:true,reason:"proposal-valid"};
}

function validateWorldDiff(definition,session,proposal,input={}){
  const issues=[];
  const sealed=verifySessionSeal(definition,session); if(!sealed.valid) issues.push(`world-session:${sealed.reason}`);
  const proposalCheck=verifyProposalIntegrity(session,proposal); if(!proposalCheck.valid) issues.push(proposalCheck.reason);
  let playerAction=input.playerAction||null;
  if(proposal?.playerActionId){
    const pa=verifyPlayerAction(playerAction,session);
    if(!pa.valid || playerAction?.id!==proposal.playerActionId) issues.push(`player-action:${pa.reason||"id-mismatch"}`);
  }else if(playerAction){
    const pa=verifyPlayerAction(playerAction,session); if(!pa.valid) issues.push(`player-action:${pa.reason}`);
  }
  if(issues.length) return freeze({status:"BLOCKED",issues,proposalId:proposal?.id||null,baseRevision:session?.revision??null});
  return core.validateWorldDiff(definition,session,proposal,{...input,playerAction});
}

function expectedCausalParents(session,inputParents){
  const known=new Set(session.events.map(e=>e.id));
  const provided=arr(inputParents).map(String);
  if(new Set(provided).size!==provided.length) throw new Error("duplicate causal parent");
  for(const p of provided) if(!known.has(p)) throw new Error(`unknown causal parent:${p}`);
  if(session.events.length){
    const head=session.events[session.events.length-1].id;
    if(provided.length && !provided.includes(head)) throw new Error("causal parents must include current event head");
    return provided.length?provided:[head];
  }
  if(provided.length) throw new Error("root event cannot cite causal parent");
  return [];
}

function commitWorldDiff(definition,session,proposal,input={}){
  const validation=validateWorldDiff(definition,session,proposal,input);
  if(validation.status!=="PASS") return freeze({status:"BLOCKED",validation,session});
  let causalParents;
  try{ causalParents=expectedCausalParents(session,input.causalParents); }
  catch(error){ return freeze({status:"BLOCKED",validation:{status:"BLOCKED",issues:[error.message]},session}); }
  const result=core.commitWorldDiff(definition,session,proposal,{...input,causalParents});
  if(result.status!=="COMMITTED") return result;
  const next=sealSession({...result.session,branchAncestryHash:session.branchAncestryHash});
  const stateReceipt={
    priorStateHash:session.stateHash, resultingStateHash:next.stateHash,
    eventId:result.event.id,eventHash:result.event.eventHash,revision:next.revision,branchId:next.branch.id
  };
  return freeze({...result,session:next,stateReceipt:freeze({...stateReceipt,receiptHash:exactHash(stateReceipt)})});
}

function replayState(definition,events){
  const seed=core.createWorldSession(definition,{id:"replay",rngSeed:1});
  const state=clone(seed.state);
  for(const event of events){
    for(const op of arr(event.operations)){
      const entity=state.entities[op.entityId]; if(!entity) throw new Error(`replay unknown entity:${op.entityId}`);
      if(op.type===core.WORLD_OP.SET_ATTRIBUTE) entity.attributes[op.key]=clone(op.value);
      else if(op.type===core.WORLD_OP.ADJUST_RESOURCE) entity.resources[op.resource]=Number(entity.resources[op.resource]||0)+Number(op.delta);
      else if(op.type===core.WORLD_OP.MOVE_ENTITY) entity.locationId=op.locationId;
      else if(op.type===core.WORLD_OP.ADD_KNOWLEDGE) entity.knowledge[op.factId]={value:clone(op.value),learnedRevision:event.revision,sourceEventId:op.sourceEventId||event.id};
      else if(op.type===core.WORLD_OP.SET_RELATIONSHIP){ entity.relationships[op.targetId]||={}; entity.relationships[op.targetId][op.dimension]={value:op.value,revision:event.revision,eventId:event.id}; }
      else if(op.type===core.WORLD_OP.TRANSITION_QUEST) entity.quests[op.questId]=op.to;
      else throw new Error(`replay unsupported operation:${op.type}`);
    }
    state.clock=event.revision;
  }
  return state;
}

function auditWorldSession(definition,session){
  const issues=[];
  const sealed=verifySessionSeal(definition,session); if(!sealed.valid) issues.push(`seal:${sealed.reason}`);
  const seen=new Set(); let previousId=null;
  for(let i=0;i<session.events.length;i++){
    const event=session.events[i];
    for(const parent of arr(event.causalParents)){
      if(!seen.has(parent)) issues.push(`causal-parent-not-prior:${event.id}:${parent}`);
    }
    if(i>0 && !arr(event.causalParents).includes(previousId)) issues.push(`linear-head-not-parent:${event.id}`);
    if(i===0 && arr(event.causalParents).length) issues.push(`root-has-parent:${event.id}`);
    if(session.branch.parentId && i<session.branch.divergenceRevision && event.branchId===session.branch.id) issues.push(`branch-event-before-divergence:${event.id}`);
    if(session.branch.parentId && i>=session.branch.divergenceRevision && event.branchId!==session.branch.id) issues.push(`foreign-branch-event-after-divergence:${event.id}`);
    seen.add(event.id); previousId=event.id;
  }
  try{
    const replayed=replayState(definition,session.events);
    if(stateHash(replayed)!==session.stateHash) issues.push("state-not-reconstructable-from-events");
  }catch(error){ issues.push(`replay:${error.message}`); }
  return freeze({status:issues.length?"FAIL":"PASS",issues,revision:session.revision,eventCount:session.events.length,stateHash:session.stateHash});
}

function forkWorldSession(definition,session,input={}){
  const check=verifySessionSeal(definition,session); if(!check.valid) throw new Error(`world session invalid:${check.reason}`);
  const base=core.forkWorldSession(definition,session,input);
  const ancestry={worldId:session.worldId,parentSessionId:session.id,parentBranchId:session.branch.id,parentAncestryHash:session.branchAncestryHash,divergenceRevision:session.revision,eventHeadHash:session.eventHeadHash,branchId:base.branch.id};
  return sealSession({...base,branchAncestryHash:exactHash(ancestry)});
}

function withRngState(session,rngReceipt){
  const next=core.withRngState(session,rngReceipt);
  return sealSession({...next,branchAncestryHash:session.branchAncestryHash});
}

function createWorldSnapshot(definition,session){
  const check=verifySessionSeal(definition,session); if(!check.valid) throw new Error(`world session invalid:${check.reason}`);
  const base=core.createWorldSnapshot(definition,session);
  const boundary={snapshotId:base.id,sessionId:session.id,revision:session.revision,stateHash:session.stateHash,eventHeadHash:session.eventHeadHash,branchAncestryHash:session.branchAncestryHash};
  return freeze({...base,stateHash:session.stateHash,sessionSeal:session.sessionSeal,branchAncestryHash:session.branchAncestryHash,boundaryHash:exactHash(boundary)});
}

function storyContractBody(contract){
  return {
    id:contract.id,principal:contract.principal,worldSessionId:contract.worldSessionId,branchId:contract.branchId,worldRevision:contract.worldRevision,
    mode:contract.mode,medium:contract.medium,povPolicy:contract.povPolicy,tense:contract.tense,userIntent:contract.userIntent,
    protectedFacts:contract.protectedFacts,forbiddenChanges:contract.forbiddenChanges,requiredBeats:contract.requiredBeats,spoilerBoundary:contract.spoilerBoundary
  };
}
function verifyStoryContract(contract){
  if(!contract?.contractHash) return {valid:false,reason:"missing-story-contract"};
  return contract.contractHash===exactHash(storyContractBody(contract))?{valid:true,reason:"story-contract-valid"}:{valid:false,reason:"story-contract-drift"};
}
function createStoryContract(input={}){ return core.createStoryContract(input); }

function verifyStoryWorldBinding(contract,session,definition=null){
  const c=verifyStoryContract(contract); if(!c.valid) throw new Error(c.reason);
  if(definition){ const s=verifySessionSeal(definition,session); if(!s.valid) throw new Error(`world session invalid:${s.reason}`); }
  return core.verifyStoryWorldBinding(contract,session);
}

function ledgerBody(ledger){ return {contractId:ledger.contractId,contractHash:ledger.contractHash,branchId:ledger.branchId,revision:ledger.revision,arcs:ledger.arcs,promises:ledger.promises,readerKnowledge:ledger.readerKnowledge,motifs:ledger.motifs}; }
function verifyNarrativeLedger(ledger,contract=null){
  if(!ledger?.ledgerHash || ledger.ledgerHash!==exactHash(ledgerBody(ledger))) return {valid:false,reason:"narrative-ledger-drift"};
  if(contract && (ledger.contractId!==contract.id || ledger.contractHash!==contract.contractHash || ledger.branchId!==contract.branchId)) return {valid:false,reason:"narrative-ledger-contract-drift"};
  return {valid:true,reason:"narrative-ledger-valid"};
}
function graphBody(graph){ return {contractId:graph.contractId,branchId:graph.branchId,nodes:graph.nodes,graphRevision:graph.graphRevision}; }
function verifyStoryGraph(graph,contract=null){
  if(!graph?.graphHash || graph.graphHash!==exactHash(graphBody(graph))) return {valid:false,reason:"story-graph-drift"};
  if(contract && (graph.contractId!==contract.id || graph.branchId!==contract.branchId)) return {valid:false,reason:"story-graph-contract-drift"};
  return {valid:true,reason:"story-graph-valid"};
}

function checkedLedgerMutation(fn,ledger,...args){ const v=verifyNarrativeLedger(ledger); if(!v.valid) throw new Error(v.reason); return fn(ledger,...args); }
function addArc(ledger,input){ return checkedLedgerMutation(core.addArc,ledger,input); }
function advanceArc(ledger,input){ return checkedLedgerMutation(core.advanceArc,ledger,input); }
function addPromise(ledger,input){ return checkedLedgerMutation(core.addPromise,ledger,input); }
function transitionPromise(ledger,input){ return checkedLedgerMutation(core.transitionPromise,ledger,input); }
function revealToReader(ledger,input){ return checkedLedgerMutation(core.revealToReader,ledger,input); }
function addStoryNode(graph,input){ const v=verifyStoryGraph(graph); if(!v.valid) throw new Error(v.reason); return core.addStoryNode(graph,input); }

function createSceneContract(definition,session,storyContract,ledger,graph,input={}){
  verifyStoryWorldBinding(storyContract,session,definition);
  const lv=verifyNarrativeLedger(ledger,storyContract); if(!lv.valid) throw new Error(lv.reason);
  const gv=verifyStoryGraph(graph,storyContract); if(!gv.valid) throw new Error(gv.reason);
  const base=core.createSceneContract(definition,session,storyContract,ledger,graph,input);
  const boundary={
    sceneId:base.id,storyContractHash:storyContract.contractHash,worldStateHash:session.stateHash,sessionSeal:session.sessionSeal,
    ledgerHash:ledger.ledgerHash,graphHash:graph.graphHash,sceneHash:base.sceneHash
  };
  return freeze({...base,storyContractHash:storyContract.contractHash,worldStateHash:session.stateHash,sessionSeal:session.sessionSeal,ledgerHash:ledger.ledgerHash,graphHash:graph.graphHash,integrityHash:exactHash(boundary)});
}
function verifySceneContract(scene,session,storyContract,ledger,graph){
  if(!scene?.integrityHash) return {valid:false,reason:"scene-integrity-missing"};
  const boundary={sceneId:scene.id,storyContractHash:scene.storyContractHash,worldStateHash:scene.worldStateHash,sessionSeal:scene.sessionSeal,ledgerHash:scene.ledgerHash,graphHash:scene.graphHash,sceneHash:scene.sceneHash};
  if(scene.integrityHash!==exactHash(boundary)) return {valid:false,reason:"scene-integrity-drift"};
  if(scene.worldSessionId!==session.id || scene.worldRevision!==session.revision || scene.worldStateHash!==session.stateHash || scene.sessionSeal!==session.sessionSeal) return {valid:false,reason:"scene-world-drift"};
  if(scene.storyContractHash!==storyContract.contractHash || scene.ledgerHash!==ledger.ledgerHash || scene.graphHash!==graph.graphHash) return {valid:false,reason:"scene-narrative-dependency-drift"};
  return {valid:true,reason:"scene-valid"};
}

function createBeatPlan(scene,input={}){
  if(!scene?.integrityHash) throw new Error("strengthened SceneContract required");
  const base=core.createBeatPlan(scene,input);
  return freeze({...base,sceneIntegrityHash:scene.integrityHash,integrityHash:exactHash({id:base.id,planHash:base.planHash,sceneIntegrityHash:scene.integrityHash})});
}
function verifyBeatPlan(plan,scene){
  if(!plan?.integrityHash || plan.sceneIntegrityHash!==scene.integrityHash) return false;
  return plan.integrityHash===exactHash({id:plan.id,planHash:plan.planHash,sceneIntegrityHash:plan.sceneIntegrityHash});
}

function createNarrativeArtifact(scene,beatPlan,input={}){
  if(!verifyBeatPlan(beatPlan,scene)) throw new Error("BeatPlan integrity drift");
  const base=core.createNarrativeArtifact(scene,beatPlan,input);
  const boundary={artifactId:base.id,artifactHash:base.artifactHash,sceneIntegrityHash:scene.integrityHash,beatPlanIntegrityHash:beatPlan.integrityHash};
  return freeze({...base,sceneIntegrityHash:scene.integrityHash,beatPlanIntegrityHash:beatPlan.integrityHash,integrityHash:exactHash(boundary)});
}
function verifyNarrativeArtifact(artifact,scene,beatPlan){
  if(!artifact?.integrityHash || !verifyBeatPlan(beatPlan,scene)) return false;
  const boundary={artifactId:artifact.id,artifactHash:artifact.artifactHash,sceneIntegrityHash:artifact.sceneIntegrityHash,beatPlanIntegrityHash:artifact.beatPlanIntegrityHash};
  return artifact.sceneIntegrityHash===scene.integrityHash && artifact.beatPlanIntegrityHash===beatPlan.integrityHash && artifact.integrityHash===exactHash(boundary);
}

function createCharacterRevealProposal(definition,session,scene,input={}){
  const actorId=req(input.actorId,"reveal.actorId"), factId=req(input.factId,"reveal.factId"), evidenceEventId=req(input.evidenceEventId,"reveal.evidenceEventId");
  if(!scene.participants.includes(actorId)) throw new Error("reveal recipient is not scene participant");
  if(!scene.permittedRevealFactIds.includes(factId)) throw new Error("fact is not permitted to reveal in scene");
  if(core.knowledgeView(session,actorId).facts[factId]) throw new Error("character already knows fact");
  if(!session.events.some(event=>event.id===evidenceEventId)) throw new Error("reveal transmission evidence event unknown");
  return createWorldDiffProposal(definition,session,{proposer:"story-reveal-bridge",operations:[{type:core.WORLD_OP.ADD_KNOWLEDGE,entityId:actorId,factId,value:clone(input.value),sourceEventId:evidenceEventId}]});
}

function createNarrativeAcceptanceContract(artifact,session,storyContract,input={}){
  if(!artifact?.integrityHash) throw new Error("strengthened NarrativeArtifact required");
  return judge.createAcceptanceContract({
    taskId:req(input.taskId||`story-judge:${artifact.id}`,"taskId"),
    goalHash:exactHash({storyId:storyContract.id,userIntent:storyContract.userIntent,artifactId:artifact.id}),
    subjectHash:artifact.artifactHash,
    risk:input.risk||"HIGH",
    scopeFingerprint:exactHash({sessionId:session.id,branchId:session.branch.id,revision:session.revision,stateHash:session.stateHash}),
    authorityFingerprint:exactHash({storyAuthority:false,worldController:"RPG_KERNEL",playerAgencyLocked:true}),
    dependencyFingerprints:{worldStateHash:session.stateHash,sessionSeal:session.sessionSeal,storyContractHash:storyContract.contractHash},
    checks:input.checks||[
      {id:"world-binding",layer:"L1_DETERMINISTIC",property:"world-binding",requiredEvidence:["DETERMINISTIC_EXECUTION"]},
      {id:"player-agency",layer:"L1_DETERMINISTIC",property:"player-agency",requiredEvidence:["DETERMINISTIC_EXECUTION"]},
      {id:"continuity",layer:"L2_EVIDENCE",property:"continuity",requiredEvidence:["SOURCE_EVIDENCE"]}
    ],
    requiredArtifactHashes:[artifact.artifactHash], independentJudgeRequired:input.independentJudgeRequired!==false
  });
}

function createNarrativeJudgeCandidate(artifact,review,contract,input={}){
  if(!artifact?.integrityHash || !review?.reviewHash) throw new Error("artifact/review required");
  if(review.artifactId!==artifact.id || review.artifactHash!==artifact.artifactHash) throw new Error("review/artifact mismatch");
  return judge.createCandidateResult({
    taskId:contract.taskId,candidateId:artifact.id,subjectHash:artifact.artifactHash,subjectVersion:String(input.subjectVersion||"1"),
    scopeFingerprint:contract.scopeFingerprint,authorityFingerprint:contract.authorityFingerprint,
    builderId:input.builderId||"story-builder",builderContextFingerprint:input.builderContextFingerprint||null,
    artifacts:[{id:artifact.id,hash:artifact.artifactHash,kind:"NARRATIVE_ARTIFACT",sourceRef:artifact.sceneId},{id:review.id,hash:review.reviewHash,kind:"NARRATIVE_REVIEW",sourceRef:artifact.id}]
  });
}

function prepareWorldDiffHandoff(session,artifact,proposal,review,input={}){
  const contract=input.acceptanceContract,candidate=input.candidate,receipt=input.judgeReceipt;
  if(!contract||!candidate||!receipt) throw new Error("authentic judge package required");
  if(receipt.verdict!=="PASS" || !judge.verifyReceipt({receipt,contract,candidate})) throw new Error("judge receipt invalid");
  if(candidate.subjectHash!==artifact.artifactHash || candidate.candidateId!==artifact.id) throw new Error("judge candidate does not target exact narrative artifact");
  if(contract.subjectHash!==artifact.artifactHash) throw new Error("judge contract subject mismatch");
  const currentDeps={worldStateHash:session.stateHash,sessionSeal:session.sessionSeal,storyContractHash:input.storyContract?.contractHash||contract.dependencyFingerprints?.storyContractHash};
  const dep=judge.dependencyInvalidation({receipt,contract,currentDependencies:currentDeps});
  if(!dep.valid) throw new Error(`judge dependency drift:${dep.changed.join(",")}`);
  const base=core.prepareWorldDiffHandoff(session,artifact,proposal,review,{judgeReceiptId:receipt.id});
  const payload={...base,judgeReceiptId:receipt.id,judgeContractId:contract.id,judgeCandidateHash:candidate.resultHash,dependencyFingerprints:contract.dependencyFingerprints};
  return freeze({...payload,handoffIntegrityHash:exactHash(payload)});
}

module.exports=Object.freeze({
  ...core,
  createWorldSession,verifySessionSeal,createPlayerAction,verifyPlayerAction,createWorldDiffProposal,verifyProposalIntegrity,
  validateWorldDiff,commitWorldDiff,auditWorldSession,forkWorldSession,withRngState,createWorldSnapshot,
  createStoryContract,verifyStoryContract,verifyStoryWorldBinding,verifyNarrativeLedger,verifyStoryGraph,
  addArc,advanceArc,addPromise,transitionPromise,revealToReader,addStoryNode,
  createSceneContract,verifySceneContract,createBeatPlan,verifyBeatPlan,createNarrativeArtifact,verifyNarrativeArtifact,
  createCharacterRevealProposal,createNarrativeAcceptanceContract,createNarrativeJudgeCandidate,prepareWorldDiffHandoff,
  stateHash,sealSession,replayState
});
