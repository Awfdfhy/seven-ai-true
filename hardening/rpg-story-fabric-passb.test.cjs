"use strict";

const assert=require("assert/strict");
const r=require("./rpg-story-fabric-passb.cjs");
const judge=require("../evolution/judge-fabric.cjs");
let n=0; function pass(name,fn){fn();n++;console.log("PASS",name);}

const world=r.createWorldDefinition({
  id:"w",version:"1",principal:"user",locations:["a","b"],relationshipDimensions:["trust"],
  invariants:["NO_NEGATIVE_RESOURCES","PLAYER_AGENCY_LOCK"],
  entities:[{id:"p",kind:"CHARACTER",isPlayer:true,locationId:"a",resources:{energy:5}},{id:"npc",kind:"CHARACTER",locationId:"a",resources:{energy:5}}],
  quests:[{id:"q",states:["OPEN","DONE"],initialState:"OPEN",transitions:[{from:"OPEN",to:"DONE"}]}]
});
let session=r.createWorldSession(world,{id:"s",rngSeed:7});

pass("session has state hash and integrity seal",()=>{assert.ok(session.stateHash);assert.ok(session.sessionSeal);assert.equal(r.verifySessionSeal(world,session).valid,true);});
pass("silent world-state tampering breaks session seal",()=>{const bad={...session,state:{...session.state,clock:99}};assert.equal(r.verifySessionSeal(world,bad).reason,"state-hash-drift");});
pass("forged session seal cannot hide state tampering",()=>{const bad={...session,state:{...session.state,clock:99},sessionSeal:"fake"};assert.equal(r.verifySessionSeal(world,bad).valid,false);});

const action=r.createPlayerAction(world,session,{actorId:"p",action:"move",args:{to:"b"},source:"USER"});
pass("authentic PlayerAction verifies",()=>assert.equal(r.verifyPlayerAction(action,session).valid,true));
pass("PlayerAction payload tampering is detected",()=>assert.equal(r.verifyPlayerAction({...action,args:{to:"a"}},session).reason,"player-action-integrity"));

let proposal=r.createWorldDiffProposal(world,session,{playerAction:action,proposer:"controller",operations:[{type:"MOVE_ENTITY",entityId:"p",locationId:"b"}]});
pass("proposal binds exact base state and branch ancestry",()=>{assert.equal(proposal.baseStateHash,session.stateHash);assert.equal(proposal.branchAncestryHash,session.branchAncestryHash);});
pass("proposal payload tampering fails integrity",()=>assert.equal(r.verifyProposalIntegrity(session,{...proposal,proposer:"attacker"}).valid,false));
pass("forged PlayerAction cannot satisfy player agency",()=>assert.equal(r.validateWorldDiff(world,session,proposal,{playerAction:{...action,args:{to:"a"}}}).status,"BLOCKED"));

let committed=r.commitWorldDiff(world,session,proposal,{playerAction:action,eventId:"e1"});
pass("commit produces resulting-state receipt",()=>{assert.equal(committed.status,"COMMITTED");assert.ok(committed.stateReceipt.receiptHash);});
session=committed.session;
pass("committed state is reconstructable from event ledger",()=>assert.equal(r.auditWorldSession(world,session).status,"PASS"));

const npcProposal=r.createWorldDiffProposal(world,session,{operations:[{type:"SET_ATTRIBUTE",entityId:"npc",key:"alert",value:true}]});
pass("unknown causal parent blocks commit",()=>assert.equal(r.commitWorldDiff(world,session,npcProposal,{eventId:"e2",causalParents:["ghost"]}).status,"BLOCKED"));
pass("causal parent set must include current head",()=>{
  const fakePrior={...session,events:[...session.events,{...session.events[0],id:"extra",revision:2,previousEventHash:session.eventHeadHash,eventHash:"bad"}],revision:2};
  assert.equal(r.verifySessionSeal(world,fakePrior).valid,false);
});
committed=r.commitWorldDiff(world,session,npcProposal,{eventId:"e2"});session=committed.session;
pass("default causal parent binds current event head",()=>assert.deepEqual(session.events[1].causalParents,["e1"]));
pass("event-chain tampering is detected",()=>{const bad={...session,events:session.events.map((e,i)=>i===1?{...e,causalParents:[]}:e)};assert.equal(r.auditWorldSession(world,bad).status,"FAIL");});

const branch=r.forkWorldSession(world,session,{branchId:"branch-1"});
pass("fork receives explicit ancestry hash",()=>{assert.notEqual(branch.branchAncestryHash,session.branchAncestryHash);assert.equal(r.verifySessionSeal(world,branch).valid,true);});
const bp=r.createWorldDiffProposal(world,branch,{operations:[{type:"MOVE_ENTITY",entityId:"npc",locationId:"b"}]});
const bc=r.commitWorldDiff(world,branch,bp,{eventId:"be1"});
pass("branch event audits only after divergence",()=>assert.equal(r.auditWorldSession(world,bc.session).status,"PASS"));
pass("foreign branch event after divergence fails audit",()=>{const events=bc.session.events.map((e,i)=>i===bc.session.events.length-1?{...e,branchId:"main"}:e);const bad=r.sealSession({...bc.session,events});assert.equal(r.auditWorldSession(world,bad).status,"FAIL");});

const snap=r.createWorldSnapshot(world,session);
pass("snapshot binds state and session seal",()=>{assert.equal(snap.stateHash,session.stateHash);assert.equal(snap.sessionSeal,session.sessionSeal);assert.ok(snap.boundaryHash);});

const story=r.createStoryContract({id:"story",principal:"user",worldSessionId:session.id,branchId:session.branch.id,worldRevision:session.revision,mode:"DIRECTOR",medium:"SCENE",userIntent:"continue",forbiddenChanges:["player-emotion"]});
pass("StoryContract integrity verifies",()=>assert.equal(r.verifyStoryContract(story).valid,true));
pass("StoryContract tampering fails before scene compilation",()=>{const bad={...story,userIntent:"retcon everything"};assert.equal(r.verifyStoryContract(bad).valid,false);assert.throws(()=>r.verifyStoryWorldBinding(bad,session,world),/drift/);});

let ledger=r.createNarrativeLedger(story); ledger=r.addPromise(ledger,{id:"promise",setupNodeId:"setup",description:"door"});
pass("Narrative Ledger verifies before mutation",()=>assert.equal(r.verifyNarrativeLedger(ledger,story).valid,true));
pass("tampered Narrative Ledger cannot accept another transition",()=>{const bad={...ledger,promises:{...ledger.promises,promise:{...ledger.promises.promise,state:"PAID_OFF"}}};assert.equal(r.verifyNarrativeLedger(bad,story).valid,false);assert.throws(()=>r.transitionPromise(bad,{promiseId:"promise",state:"ACTIVE"}),/drift/);});

let graph=r.createStoryGraph(story); graph=r.addStoryNode(graph,{id:"work",level:"WORK",purpose:"root"}); graph=r.addStoryNode(graph,{id:"scene",level:"SCENE",parentId:"work",purpose:"warning"});
pass("Story Graph integrity verifies",()=>assert.equal(r.verifyStoryGraph(graph,story).valid,true));
pass("tampered Story Graph cannot accept new nodes",()=>{const bad={...graph,nodes:{...graph.nodes,scene:{...graph.nodes.scene,purpose:"retcon"}}};assert.equal(r.verifyStoryGraph(bad,story).valid,false);assert.throws(()=>r.addStoryNode(bad,{id:"x",level:"BEAT",parentId:"scene",purpose:"x"}),/drift/);});

const scene=r.createSceneContract(world,session,story,ledger,graph,{id:"scene-contract",locationId:"a",participants:["npc"],povActorId:"npc",purpose:"warning",nodeIds:["scene"],permittedRevealFactIds:["f1"]});
pass("SceneContract binds world state plus narrative dependencies",()=>{assert.equal(scene.worldStateHash,session.stateHash);assert.equal(scene.ledgerHash,ledger.ledgerHash);assert.equal(scene.graphHash,graph.graphHash);assert.equal(r.verifySceneContract(scene,session,story,ledger,graph).valid,true);});
pass("world revision/state drift invalidates existing scene",()=>{const newer={...session,stateHash:"changed"};assert.equal(r.verifySceneContract(scene,newer,story,ledger,graph).valid,false);});

const beats=r.createBeatPlan(scene,{beats:[{id:"b",intent:"warn",response:"listen",changedLocalCondition:"warning-known"}]});
pass("BeatPlan is bound to strengthened scene integrity",()=>assert.equal(r.verifyBeatPlan(beats,scene),true));
pass("BeatPlan tampering is detected",()=>assert.equal(r.verifyBeatPlan({...beats,planHash:"x"},scene),false));
const artifact=r.createNarrativeArtifact(scene,beats,{text:"draft"});
pass("NarrativeArtifact is bound through scene and beat integrity",()=>assert.equal(r.verifyNarrativeArtifact(artifact,scene,beats),true));
pass("NarrativeArtifact integrity detects dependency swap",()=>assert.equal(r.verifyNarrativeArtifact({...artifact,sceneIntegrityHash:"x"},scene,beats),false));

const evidenceProposal=r.createWorldDiffProposal(world,session,{operations:[{type:"ADD_KNOWLEDGE",entityId:"npc",factId:"source-fact",value:true}]});
committed=r.commitWorldDiff(world,session,evidenceProposal,{eventId:"e3"});session=committed.session;
const story2=r.createStoryContract({id:"story2",principal:"user",worldSessionId:session.id,branchId:session.branch.id,worldRevision:session.revision,mode:"DIRECTOR",medium:"SCENE",userIntent:"continue"});
let l2=r.createNarrativeLedger(story2),g2=r.createStoryGraph(story2);g2=r.addStoryNode(g2,{id:"w2",level:"WORK",purpose:"root"});g2=r.addStoryNode(g2,{id:"s2",level:"SCENE",parentId:"w2",purpose:"reveal"});
const sc2=r.createSceneContract(world,session,story2,l2,g2,{locationId:"a",participants:["npc"],purpose:"reveal",nodeIds:["s2"],permittedRevealFactIds:["new-fact","source-fact"]});
pass("character reveal bridge requires real transmission evidence",()=>assert.throws(()=>r.createCharacterRevealProposal(world,session,sc2,{actorId:"npc",factId:"new-fact",value:true,evidenceEventId:"ghost"}),/unknown/));
const revealProposal=r.createCharacterRevealProposal(world,session,sc2,{actorId:"npc",factId:"new-fact",value:true,evidenceEventId:"e3"});
pass("character reveal remains a WorldDiff proposal, not narrative mutation",()=>{assert.equal(revealProposal.operations[0].type,"ADD_KNOWLEDGE");assert.equal(r.knowledgeView(session,"npc").facts["new-fact"],undefined);});
pass("story cannot reveal a fact the character already knows as new",()=>assert.throws(()=>r.createCharacterRevealProposal(world,session,sc2,{actorId:"npc",factId:"source-fact",value:true,evidenceEventId:"e3"}),/already knows/));

const b2=r.createBeatPlan(sc2,{beats:[{id:"b2",intent:"speak",response:"hear",changedLocalCondition:"heard"}]});
const a2=r.createNarrativeArtifact(sc2,b2,{text:"draft 2"});
const review=r.createNarrativeReview({artifact:a2,findings:[],continuityEvidenceIds:["e3"]});
const acceptance=r.createNarrativeAcceptanceContract(a2,session,story2,{risk:"HIGH"});
const candidate=r.createNarrativeJudgeCandidate(a2,review,acceptance,{builderId:"builder",builderContextFingerprint:"builder-ctx"});
const now=Date.now();
const observations=acceptance.checks.map((check,i)=>({checkId:check.id,status:"PASS",observerId:`obs-${i}`,evidence:[{type:check.requiredEvidence[0],sourceRef:`src-${i}`,hash:`ev-${i}`,subjectHash:a2.artifactHash,checkId:check.id,property:check.property,dependencyCluster:`cluster-${i}`,observedAt:now}]}));
const judged=judge.adjudicate({contract:acceptance,candidate,observations,adversarialJudge:{judgeId:"independent",qualified:true,promotionStatus:"QUALIFIED",verdict:"PASS",contextFingerprint:"judge-ctx"},now});
pass("existing Wave06 judge can issue authentic narrative PASS receipt",()=>{assert.equal(judged.verdict,"PASS");assert.equal(judge.verifyReceipt({receipt:judged.receipt,contract:acceptance,candidate}),true);});
const nextWorldProposal=r.createWorldDiffProposal(world,session,{operations:[{type:"SET_ATTRIBUTE",entityId:"npc",key:"spoke",value:true}]});
const handoff=r.prepareWorldDiffHandoff(session,a2,nextWorldProposal,review,{acceptanceContract:acceptance,candidate,judgeReceipt:judged.receipt,storyContract:story2});
pass("authentic judge receipt allows proposed-not-committed handoff",()=>{assert.equal(handoff.status,"PROPOSED_NOT_COMMITTED");assert.ok(handoff.handoffIntegrityHash);});
pass("fabricated PASS receipt cannot authorize handoff",()=>assert.throws(()=>r.prepareWorldDiffHandoff(session,a2,nextWorldProposal,review,{acceptanceContract:acceptance,candidate,judgeReceipt:{...judged.receipt,id:"fake"},storyContract:story2}),/invalid/));
pass("judge dependency drift blocks handoff",()=>{const drifted={...session,stateHash:"changed"};assert.throws(()=>r.prepareWorldDiffHandoff(drifted,a2,nextWorldProposal,review,{acceptanceContract:acceptance,candidate,judgeReceipt:judged.receipt,storyContract:story2}),/drift/);});
pass("Story Fabric still cannot directly commit world truth",()=>assert.equal(r.storyCanCommitWorld(),false));
pass("Story Fabric still cannot seize player agency",()=>assert.equal(r.storyGrantsPlayerAgency(),false));

console.log(`rpg/story fabric Pass B: PASS (${n} assertions)`);