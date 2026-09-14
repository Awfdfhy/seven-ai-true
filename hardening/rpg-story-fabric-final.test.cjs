"use strict";

const assert=require("assert/strict");
const r=require("./rpg-story-fabric-final.cjs");
const judge=require("../evolution/judge-fabric.cjs");
let n=0; function pass(name,fn){fn();n++;console.log("PASS",name);}

const world=r.createWorldDefinition({
  id:"final-world",version:"1",principal:"user",locations:["hall","gate"],relationshipDimensions:["trust"],
  invariants:["NO_NEGATIVE_RESOURCES","PLAYER_AGENCY_LOCK"],
  entities:[{id:"player",kind:"CHARACTER",isPlayer:true,locationId:"hall",resources:{energy:5}},{id:"npc",kind:"CHARACTER",locationId:"hall",resources:{energy:5}}]
});
let session=r.createWorldSession(world,{id:"final-session",rngSeed:11});
const seedProposal=r.createWorldDiffProposal(world,session,{proposer:"world-controller",operations:[{type:"SET_ATTRIBUTE",entityId:"npc",key:"noticed",value:true}]});
let result=r.commitWorldDiff(world,session,seedProposal,{eventId:"observed-1"}); session=result.session;
pass("seed causal event commits through canonical final runtime",()=>assert.equal(result.status,"COMMITTED"));

const noTransmission=r.createWorldDiffProposal(world,session,{operations:[{type:"ADD_KNOWLEDGE",entityId:"npc",factId:"secret",value:true}]});
pass("generic knowledge teleportation fails closed",()=>{const v=r.validateWorldDiff(world,session,noTransmission);assert.equal(v.status,"BLOCKED");assert.ok(v.issues.some(x=>x.includes("knowledge-transmission-missing")));});
pass("knowledge teleportation cannot commit through generic path",()=>assert.equal(r.commitWorldDiff(world,session,noTransmission).status,"BLOCKED"));
const ghostTransmission=r.createWorldDiffProposal(world,session,{operations:[{type:"ADD_KNOWLEDGE",entityId:"npc",factId:"secret",value:true,sourceEventId:"ghost"}]});
pass("unknown knowledge transmission event fails closed",()=>assert.ok(r.validateWorldDiff(world,session,ghostTransmission).issues.some(x=>x.includes("knowledge-transmission-unknown"))));
const groundedKnowledge=r.createWorldDiffProposal(world,session,{operations:[{type:"ADD_KNOWLEDGE",entityId:"npc",factId:"secret",value:true,sourceEventId:"observed-1"}]});
pass("existing event can ground character knowledge",()=>assert.equal(r.validateWorldDiff(world,session,groundedKnowledge).status,"PASS"));
result=r.commitWorldDiff(world,session,groundedKnowledge,{eventId:"learn-2"}); session=result.session;
pass("grounded knowledge records original transmission event",()=>assert.equal(r.knowledgeView(session,"npc").facts.secret.sourceEventId,"observed-1"));

const wrongMoveAction=r.createPlayerAction(world,session,{actorId:"player",action:"move",args:{to:"gate"},source:"USER"});
const wrongMove=r.createWorldDiffProposal(world,session,{playerAction:wrongMoveAction,proposer:"controller",operations:[{type:"MOVE_ENTITY",entityId:"player",locationId:"hall"}]});
pass("unrelated PlayerAction cannot authorize a different movement target",()=>assert.ok(r.validateWorldDiff(world,session,wrongMove,{playerAction:wrongMoveAction}).issues.some(x=>x.includes("target-mismatch"))));
const goodMove=r.createWorldDiffProposal(world,session,{playerAction:wrongMoveAction,proposer:"controller",operations:[{type:"MOVE_ENTITY",entityId:"player",locationId:"gate"}]});
pass("exact user-selected movement target validates",()=>assert.equal(r.validateWorldDiff(world,session,goodMove,{playerAction:wrongMoveAction}).status,"PASS"));

const emotionAction=r.createPlayerAction(world,session,{actorId:"player",action:"speak",args:{emotion:"calm"},source:"USER"});
const forgedEmotion=r.createWorldDiffProposal(world,session,{playerAction:emotionAction,proposer:"controller",operations:[{type:"SET_ATTRIBUTE",entityId:"player",key:"emotion",value:"afraid"}]});
pass("player mental state cannot be inferred from unrelated user action",()=>assert.ok(r.validateWorldDiff(world,session,forgedEmotion,{playerAction:emotionAction}).issues.some(x=>x.includes("mental-state"))));
const explicitEmotion=r.createWorldDiffProposal(world,session,{playerAction:emotionAction,proposer:"controller",operations:[{type:"SET_ATTRIBUTE",entityId:"player",key:"emotion",value:"calm"}]});
pass("explicitly user-authored mental state remains representable",()=>assert.equal(r.validateWorldDiff(world,session,explicitEmotion,{playerAction:emotionAction}).status,"PASS"));

const rng=r.nextRng(session);
pass("authentic RNG receipt verifies",()=>assert.equal(r.verifyRngReceipt(session,rng),true));
pass("forged RNG state is rejected",()=>assert.equal(r.verifyRngReceipt(session,{...rng,nextState:(rng.nextState+1)>>>0}),false));
pass("forged RNG receipt cannot advance authoritative RNG",()=>assert.throws(()=>r.withRngState(session,{...rng,nextState:(rng.nextState+1)>>>0}),/mismatch/));
const rngAdvanced=r.withRngState(session,rng);
pass("authentic RNG receipt advances exact state",()=>assert.equal(rngAdvanced.rngState,rng.nextState));

const snapshot=r.createWorldSnapshot(world,session);
pass("strengthened world snapshot verifies",()=>assert.equal(r.verifyWorldSnapshot(snapshot),true));
pass("snapshot state tampering is detected",()=>assert.equal(r.verifyWorldSnapshot({...snapshot,state:{...snapshot.state,clock:999}}),false));
pass("snapshot boundary tampering is detected",()=>assert.equal(r.verifyWorldSnapshot({...snapshot,branchAncestryHash:"wrong"}),false));

const story=r.createStoryContract({id:"story-final",principal:"user",worldSessionId:session.id,branchId:session.branch.id,worldRevision:session.revision,mode:"DIRECTOR",medium:"SCENE",userIntent:"continue without retcon"});
let ledger=r.createNarrativeLedger(story); ledger=r.addArc(ledger,{id:"arc",subjectId:"npc",startCondition:"guarded",desiredChange:"trust"});
pass("fabricated arc event id cannot claim earned change",()=>assert.throws(()=>r.advanceArc(ledger,{arcId:"arc",state:"CHANGED",evidenceEventIds:["ghost"],worldSession:session}),/unknown/));
ledger=r.advanceArc(ledger,{arcId:"arc",state:"CHANGED",evidenceEventIds:["observed-1"],worldSession:session});
pass("real world event can ground earned arc change",()=>assert.deepEqual(ledger.arcs.arc.evidenceEventIds,["observed-1"]));

let graph=r.createStoryGraph(story); graph=r.addStoryNode(graph,{id:"work",level:"WORK",purpose:"root"}); graph=r.addStoryNode(graph,{id:"setup",level:"SCENE",parentId:"work",purpose:"setup"}); graph=r.addStoryNode(graph,{id:"payoff",level:"SCENE",parentId:"work",purpose:"payoff"});
ledger=r.addPromise(ledger,{id:"promise",setupNodeId:"setup",description:"door matters"}); ledger=r.transitionPromise(ledger,{promiseId:"promise",state:"ACTIVE"});
pass("unknown payoff node cannot close promise",()=>assert.throws(()=>r.transitionPromise(ledger,{promiseId:"promise",state:"PAID_OFF",payoffNodeId:"ghost",storyGraph:graph}),/unknown/));
ledger=r.transitionPromise(ledger,{promiseId:"promise",state:"PAID_OFF",payoffNodeId:"payoff",storyGraph:graph});
pass("payoff requires a real StoryGraph node",()=>assert.equal(ledger.promises.promise.payoffNodeId,"payoff"));
pass("reader reveal cannot cite invented story node",()=>assert.throws(()=>r.revealToReader(ledger,{factId:"door",sourceNodeId:"ghost",storyGraph:graph}),/unknown/));
ledger=r.revealToReader(ledger,{factId:"door",sourceNodeId:"payoff",storyGraph:graph});
pass("reader reveal binds an existing story node",()=>assert.equal(ledger.readerKnowledge.door.sourceNodeId,"payoff"));

const scene=r.createSceneContract(world,session,story,ledger,graph,{id:"scene-final",locationId:"hall",participants:["npc"],povActorId:"npc",purpose:"resolve setup",nodeIds:["payoff"]});
const beats=r.createBeatPlan(scene,{beats:[{id:"beat",intent:"act",response:"change",changedLocalCondition:"resolved"}]});
const artifact=r.createNarrativeArtifact(scene,beats,{id:"artifact-final",text:"Narrative draft"});
const review=r.createNarrativeReview({artifact,findings:[],continuityEvidenceIds:["observed-1"]});
const acceptance=r.createNarrativeAcceptanceContract(artifact,session,story,{risk:"HIGH"});
const candidate=r.createNarrativeJudgeCandidate(artifact,review,acceptance,{builderId:"builder",builderContextFingerprint:"builder-context"});
const now=Date.now();
const observations=acceptance.checks.map((check,i)=>({checkId:check.id,status:"PASS",observerId:`obs-${i}`,evidence:[{type:check.requiredEvidence[0],sourceRef:`src-${i}`,hash:`hash-${i}`,subjectHash:artifact.artifactHash,checkId:check.id,property:check.property,dependencyCluster:`cluster-${i}`,observedAt:now}]}));
const judged=judge.adjudicate({contract:acceptance,candidate,observations,adversarialJudge:{judgeId:"independent",qualified:true,promotionStatus:"QUALIFIED",verdict:"PASS",contextFingerprint:"judge-context"},now});
pass("independent narrative judge reaches authentic PASS",()=>assert.equal(judged.verdict,"PASS"));
const storyProposal=r.createNarrativeWorldDiffProposal(world,session,{operations:[{type:"SET_ATTRIBUTE",entityId:"npc",key:"spoke",value:true}]});
pass("generic world commit rejects story-origin proposal",()=>assert.equal(r.commitWorldDiff(world,session,storyProposal,{eventId:"story-event"}).status,"BLOCKED"));
pass("fabricated narrative judge package cannot commit",()=>assert.equal(r.commitNarrativeWorldDiff(world,session,artifact,storyProposal,review,{acceptanceContract:acceptance,candidate,judgeReceipt:{...judged.receipt,id:"fake"},storyContract:story,eventId:"story-event"}).status,"BLOCKED"));
const narrativeCommit=r.commitNarrativeWorldDiff(world,session,artifact,storyProposal,review,{acceptanceContract:acceptance,candidate,judgeReceipt:judged.receipt,storyContract:story,eventId:"story-event"});
pass("authentic judge-bound story handoff may commit only through World Kernel",()=>{assert.equal(narrativeCommit.status,"COMMITTED");assert.equal(narrativeCommit.narrativeCommitVerified,true);assert.equal(narrativeCommit.session.state.entities.npc.attributes.spoke,true);});
pass("cancelled story generation cannot create authoritative event",()=>assert.equal(r.commitNarrativeWorldDiff(world,session,artifact,storyProposal,review,{acceptanceContract:acceptance,candidate,judgeReceipt:judged.receipt,storyContract:story,cancelled:true}).status,"BLOCKED"));

console.log(`rpg/story final adversarial guard: PASS (${n} assertions)`);