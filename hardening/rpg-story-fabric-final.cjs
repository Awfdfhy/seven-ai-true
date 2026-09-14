"use strict";

const core = require("./rpg-story-fabric-passb.cjs");

const PLAYER_MENTAL_FIELDS = Object.freeze(new Set(["intent","emotion","choice","decision","desire","belief"]));
const STORY_PROPOSER = /^(story|narrative)(-|$)/i;

function arr(v){ return Array.isArray(v) ? v : []; }
function clone(v){ return v == null ? v : JSON.parse(JSON.stringify(v)); }
function freeze(v){ return Object.freeze(v); }
function same(a,b){ return core.hash(a) === core.hash(b); }
function eventById(session,id){ return session.events.find(event => event.id === id) || null; }
function isPlayer(session,entityId){ return session.state?.entities?.[entityId]?.isPlayer === true; }

function playerOperationMatches(action,op){
  if(!action || action.source !== "USER") return false;
  const args = action.args || {};
  if(op.type === core.WORLD_OP.MOVE_ENTITY){
    const target = args.locationId ?? args.to ?? args.destination;
    return target != null && String(target) === String(op.locationId);
  }
  if(op.type === core.WORLD_OP.SET_ATTRIBUTE && PLAYER_MENTAL_FIELDS.has(String(op.key||"").toLowerCase())){
    const key = String(op.key).toLowerCase();
    if(args.key != null && String(args.key).toLowerCase() === key && Object.prototype.hasOwnProperty.call(args,"value")) return same(args.value,op.value);
    return Object.prototype.hasOwnProperty.call(args,key) && same(args[key],op.value);
  }
  return true;
}

function finalIssues(session,proposal,input={}){
  const issues=[];
  if(input.cancelled === true) issues.push("cancelled-generation");
  const action=input.playerAction||null;
  for(const op of arr(proposal?.operations)){
    if(op.type === core.WORLD_OP.ADD_KNOWLEDGE){
      if(!op.sourceEventId) issues.push(`knowledge-transmission-missing:${op.entityId}:${op.factId}`);
      else if(!eventById(session,op.sourceEventId)) issues.push(`knowledge-transmission-unknown:${op.sourceEventId}`);
    }
    if(isPlayer(session,op.entityId) && !playerOperationMatches(action,op)){
      if(op.type === core.WORLD_OP.MOVE_ENTITY) issues.push(`player-action-target-mismatch:${op.entityId}`);
      else if(op.type === core.WORLD_OP.SET_ATTRIBUTE && PLAYER_MENTAL_FIELDS.has(String(op.key||"").toLowerCase())) issues.push(`player-mental-state-not-user-authored:${op.key}`);
    }
  }
  return issues;
}

function validateWorldDiff(definition,session,proposal,input={}){
  const base=core.validateWorldDiff(definition,session,proposal,input);
  const issues=[...arr(base.issues),...finalIssues(session,proposal,input)];
  return freeze({...base,status:issues.length?"BLOCKED":"PASS",issues});
}

function commitWorldDiff(definition,session,proposal,input={}){
  const validation=validateWorldDiff(definition,session,proposal,input);
  if(validation.status!=="PASS") return freeze({status:"BLOCKED",validation,session});
  if(STORY_PROPOSER.test(String(proposal.proposer||""))){
    return freeze({status:"BLOCKED",validation:{status:"BLOCKED",issues:["story-world-diff-requires-judge-handoff"]},session});
  }
  return core.commitWorldDiff(definition,session,proposal,input);
}

function createNarrativeWorldDiffProposal(definition,session,input={}){
  return core.createWorldDiffProposal(definition,session,{...input,proposer:String(input.proposer||"story-fabric")});
}

function commitNarrativeWorldDiff(definition,session,artifact,proposal,review,input={}){
  if(input.cancelled === true) return freeze({status:"BLOCKED",reason:"cancelled-generation",session});
  if(!STORY_PROPOSER.test(String(proposal?.proposer||""))) return freeze({status:"BLOCKED",reason:"narrative-proposer-required",session});
  const packageInput={
    acceptanceContract:input.acceptanceContract,
    candidate:input.candidate,
    judgeReceipt:input.judgeReceipt,
    storyContract:input.storyContract
  };
  let handoff;
  try{ handoff=core.prepareWorldDiffHandoff(session,artifact,proposal,review,packageInput); }
  catch(error){ return freeze({status:"BLOCKED",reason:`judge-handoff:${error.message}`,session}); }
  const validation=validateWorldDiff(definition,session,proposal,input);
  if(validation.status!=="PASS") return freeze({status:"BLOCKED",validation,session,handoff});
  const committed=core.commitWorldDiff(definition,session,proposal,input);
  if(committed.status!=="COMMITTED") return committed;
  return freeze({...committed,narrativeHandoff:handoff,narrativeCommitVerified:true});
}

function verifyRngReceipt(session,receipt){
  if(!receipt || !Number.isInteger(receipt.nextState) || !receipt.receipt) return false;
  const expected=core.nextRng(session);
  return receipt.nextState===expected.nextState && receipt.receipt===expected.receipt && receipt.value===expected.value;
}
function withRngState(session,receipt){
  if(!verifyRngReceipt(session,receipt)) throw new Error("RNG receipt mismatch");
  return core.withRngState(session,receipt);
}

function verifyWorldSnapshot(snapshot){
  if(!snapshot?.snapshotHash || !snapshot?.boundaryHash || !snapshot?.stateHash) return false;
  const payload={worldId:snapshot.worldId,sessionId:snapshot.sessionId,branch:snapshot.branch,revision:snapshot.revision,eventHeadHash:snapshot.eventHeadHash,state:snapshot.state,rngState:snapshot.rngState};
  if(snapshot.snapshotHash!==core.hash(payload)) return false;
  if(snapshot.stateHash!==core.stateHash(snapshot.state)) return false;
  const boundary={snapshotId:snapshot.id,sessionId:snapshot.sessionId,revision:snapshot.revision,stateHash:snapshot.stateHash,eventHeadHash:snapshot.eventHeadHash,branchAncestryHash:snapshot.branchAncestryHash};
  return snapshot.boundaryHash===core.hash(boundary);
}

function advanceArc(ledger,input={}){
  const session=input.worldSession;
  if(!session?.events) throw new Error("arc advancement requires authoritative WorldSession");
  const evidence=arr(input.evidenceEventIds).map(String);
  if([core.ARC_STATE.CHANGED,core.ARC_STATE.COMPLETE].includes(String(input.state||"").toUpperCase())){
    if(!evidence.length) throw new Error("earned arc change requires event evidence");
    for(const eventId of evidence) if(!eventById(session,eventId)) throw new Error(`arc evidence event unknown:${eventId}`);
  }
  const clean={...input}; delete clean.worldSession;
  return core.advanceArc(ledger,clean);
}

function transitionPromise(ledger,input={}){
  const target=String(input.state||"").toUpperCase();
  if([core.PROMISE_STATE.PAID_OFF,core.PROMISE_STATE.SUBVERTED].includes(target)){
    const graph=input.storyGraph;
    const gv=core.verifyStoryGraph(graph);
    if(!gv.valid) throw new Error(`promise payoff requires valid StoryGraph:${gv.reason}`);
    if(!graph.nodes?.[input.payoffNodeId]) throw new Error("promise payoff node unknown");
  }
  const clean={...input}; delete clean.storyGraph;
  return core.transitionPromise(ledger,clean);
}

function revealToReader(ledger,input={}){
  const graph=input.storyGraph;
  const gv=core.verifyStoryGraph(graph);
  if(!gv.valid) throw new Error(`reader reveal requires valid StoryGraph:${gv.reason}`);
  if(!graph.nodes?.[input.sourceNodeId]) throw new Error("reader reveal source node unknown");
  const clean={...input}; delete clean.storyGraph;
  return core.revealToReader(ledger,clean);
}

module.exports=Object.freeze({
  ...core,
  PLAYER_MENTAL_FIELDS,
  validateWorldDiff,commitWorldDiff,createNarrativeWorldDiffProposal,commitNarrativeWorldDiff,
  verifyRngReceipt,withRngState,verifyWorldSnapshot,
  advanceArc,transitionPromise,revealToReader
});