"use strict";

const assert = require("assert/strict");
const r = require("./rpg-story-fabric.cjs");
let n = 0;
function pass(name, fn) { fn(); n++; console.log("PASS", name); }

const world = r.createWorldDefinition({
  id: "valen-test",
  version: "1",
  principal: "user",
  locations: ["hall", "garden", "tower"],
  relationshipDimensions: ["trust", "respect"],
  invariants: ["NO_NEGATIVE_RESOURCES", "PLAYER_AGENCY_LOCK"],
  entities: [
    { id: "player", kind: "CHARACTER", isPlayer: true, locationId: "hall", resources: { mana: 10 }, attributes: { mood: "calm" } },
    { id: "aria", kind: "CHARACTER", locationId: "garden", resources: { focus: 5 }, goals: ["protect-kingdom"] },
    { id: "guard", kind: "CHARACTER", locationId: "hall", resources: { stamina: 3 } }
  ],
  quests: [{ id: "q1", states: ["OPEN", "ACTIVE", "COMPLETE"], initialState: "OPEN", transitions: [{ from: "OPEN", to: "ACTIVE" }, { from: "ACTIVE", to: "COMPLETE" }] }]
});

pass("world definition is deterministic and principal bound", () => {
  const again = r.createWorldDefinition({
    id: "valen-test", version: "1", principal: "user", locations: ["hall", "garden", "tower"],
    relationshipDimensions: ["trust", "respect"], invariants: ["NO_NEGATIVE_RESOURCES", "PLAYER_AGENCY_LOCK"],
    entities: [
      { id: "player", kind: "CHARACTER", isPlayer: true, locationId: "hall", resources: { mana: 10 }, attributes: { mood: "calm" } },
      { id: "aria", kind: "CHARACTER", locationId: "garden", resources: { focus: 5 }, goals: ["protect-kingdom"] },
      { id: "guard", kind: "CHARACTER", locationId: "hall", resources: { stamina: 3 } }
    ],
    quests: [{ id: "q1", states: ["OPEN", "ACTIVE", "COMPLETE"], initialState: "OPEN", transitions: [{ from: "OPEN", to: "ACTIVE" }, { from: "ACTIVE", to: "COMPLETE" }] }]
  });
  assert.equal(again.definitionHash, world.definitionHash);
  assert.equal(world.principal, "user");
});
pass("duplicate entity identity fails closed", () => assert.throws(() => r.createWorldDefinition({ id:"x", principal:"u", entities:[{id:"a"},{id:"a"}] }), /duplicate entity/));
pass("unknown initial entity location fails closed", () => assert.throws(() => r.createWorldDefinition({ id:"x", principal:"u", entities:[{id:"a",locationId:"nowhere"}] }), /location/));
pass("negative initial resources fail closed", () => assert.throws(() => r.createWorldDefinition({ id:"x", principal:"u", entities:[{id:"a",resources:{hp:-1}}] }), /negative/));

let session = r.createWorldSession(world, { id:"session-1", rngSeed:123, createdAt:"2026-09-14T18:00:00Z" });
pass("world session begins at explicit revision zero", () => { assert.equal(session.revision,0); assert.equal(session.branch.id,"main"); });
pass("world session binds exact definition hash", () => assert.equal(session.definitionHash, world.definitionHash));
pass("definition drift fails closed", () => assert.throws(() => r.verifySessionBoundary({ ...world, definitionHash:"bad" }, session), /drift/));

const npcProposal = r.createWorldDiffProposal(world, session, {
  proposer:"director",
  operations:[{ type:"MOVE_ENTITY", entityId:"aria", locationId:"hall" }]
});
pass("NPC movement proposal is typed but grants no authority", () => assert.equal(npcProposal.grantsAuthority,false));
pass("valid NPC autonomous action passes world validator", () => assert.equal(r.validateWorldDiff(world,session,npcProposal).status,"PASS"));
let result = r.commitWorldDiff(world, session, npcProposal, { eventId:"e1" });
pass("validated NPC change commits through World Kernel", () => { assert.equal(result.status,"COMMITTED"); assert.equal(result.session.state.entities.aria.locationId,"hall"); });
session = result.session;
pass("event ledger advances exactly one revision", () => { assert.equal(session.revision,1); assert.equal(session.events.length,1); });
pass("world audit validates event chain", () => assert.equal(r.auditWorldSession(world,session).status,"PASS"));

const staleProposal = r.createWorldDiffProposal(world, session, { operations:[{type:"SET_ATTRIBUTE",entityId:"guard",key:"alert",value:true}] });
const advanced = r.commitWorldDiff(world, session, staleProposal, { eventId:"e2" });
pass("second valid event advances world", () => assert.equal(advanced.status,"COMMITTED"));
pass("stale proposal cannot commit after revision moves", () => assert.equal(r.validateWorldDiff(world,advanced.session,staleProposal).status,"BLOCKED"));
session = advanced.session;

const inventedPlayerMove = r.createWorldDiffProposal(world, session, { proposer:"model", operations:[{type:"MOVE_ENTITY",entityId:"player",locationId:"garden"}] });
pass("model cannot invent irreversible player movement", () => assert.equal(r.validateWorldDiff(world,session,inventedPlayerMove).issues.includes("player agency proof missing"),true));
pass("blocked player proposal cannot mutate authoritative state", () => assert.equal(r.commitWorldDiff(world,session,inventedPlayerMove).status,"BLOCKED"));
const playerAction = r.createPlayerAction(world, session, { actorId:"player", action:"move", args:{locationId:"garden"}, source:"USER" });
pass("PlayerAction requires user source", () => assert.throws(() => r.createPlayerAction(world,session,{actorId:"player",action:"move",source:"MODEL"}),/USER/));
const playerMove = r.createWorldDiffProposal(world, session, { proposer:"controller", playerAction, operations:[{type:"MOVE_ENTITY",entityId:"player",locationId:"garden"}] });
pass("user-sourced player action satisfies agency proof", () => assert.equal(r.validateWorldDiff(world,session,playerMove,{playerAction}).status,"PASS"));
result = r.commitWorldDiff(world,session,playerMove,{playerAction,eventId:"e3"});
pass("player movement commits only through controller validation", () => assert.equal(result.session.state.entities.player.locationId,"garden"));
session = result.session;

const spendTooMuch = r.createWorldDiffProposal(world,session,{playerAction:r.createPlayerAction(world,session,{actorId:"player",action:"cast",source:"USER"}),operations:[{type:"ADJUST_RESOURCE",entityId:"player",resource:"mana",delta:-99}]});
pass("resource conservation blocks impossible spend", () => assert.match(r.validateWorldDiff(world,session,spendTooMuch,{playerAction:{...spendTooMuch, id:"wrong"}}).issues.join(" "),/negative resource|agency/));
const npcSpendTooMuch = r.createWorldDiffProposal(world,session,{operations:[{type:"ADJUST_RESOURCE",entityId:"guard",resource:"stamina",delta:-9}]});
pass("negative NPC resources fail closed", () => assert.match(r.validateWorldDiff(world,session,npcSpendTooMuch).issues.join(" "),/negative resource/));

const knowProposal = r.createWorldDiffProposal(world,session,{operations:[{type:"ADD_KNOWLEDGE",entityId:"aria",factId:"secret-door",value:true}]});
result = r.commitWorldDiff(world,session,knowProposal,{eventId:"e4"}); session = result.session;
pass("knowledge commit is actor scoped", () => assert.equal(r.knowledgeView(session,"aria").facts["secret-door"].value,true));
pass("world truth is not copied into another actor knowledge plane", () => assert.equal(r.knowledgeView(session,"guard").facts["secret-door"],undefined));
pass("knowledge view respects historical revision", () => assert.equal(r.knowledgeView(session,"aria",3).facts["secret-door"],undefined));

const relProposal = r.createWorldDiffProposal(world,session,{operations:[{type:"SET_RELATIONSHIP",entityId:"aria",targetId:"guard",dimension:"trust",value:.4}]});
result = r.commitWorldDiff(world,session,relProposal,{eventId:"e5"}); session=result.session;
pass("relationship is multidimensional event-derived state", () => assert.equal(r.relationshipView(session,"aria","guard").dimensions.trust.value,.4));
pass("unknown relationship dimension is rejected", () => assert.throws(() => r.createWorldDiffProposal(world,session,{operations:[{type:"SET_RELATIONSHIP",entityId:"aria",targetId:"guard",dimension:"love-meter",value:1}]}),/dimension/));

const badQuest = r.createWorldDiffProposal(world,session,{operations:[{type:"TRANSITION_QUEST",entityId:"aria",questId:"q1",to:"COMPLETE"}]});
pass("quest state machine blocks skipped transition", () => assert.match(r.validateWorldDiff(world,session,badQuest).issues.join(" "),/quest transition/));
const quest1 = r.createWorldDiffProposal(world,session,{operations:[{type:"TRANSITION_QUEST",entityId:"aria",questId:"q1",to:"ACTIVE"}]});
result=r.commitWorldDiff(world,session,quest1,{eventId:"e6"});session=result.session;
pass("valid quest transition commits", () => assert.equal(session.state.entities.aria.quests.q1,"ACTIVE"));

const snapshot = r.createWorldSnapshot(world,session);
pass("snapshot names event ledger as authority", () => assert.equal(snapshot.authoritativeSource,"EVENT_LEDGER"));
pass("snapshot binds exact event head", () => assert.equal(snapshot.eventHeadHash,session.eventHeadHash));

const rngA = r.nextRng(session), rngB = r.nextRng(session);
pass("authoritative RNG is deterministic and replayable", () => { assert.equal(rngA.value,rngB.value); assert.equal(rngA.nextState,rngB.nextState); });
const rngSession = r.withRngState(session,rngA);
pass("RNG advance is explicit instead of model sampling", () => assert.equal(rngSession.rngState,rngA.nextState));

const branch = r.forkWorldSession(world,session,{branchId:"what-if-1"});
pass("branch retains explicit parent and divergence revision", () => { assert.equal(branch.branch.parentId,"main"); assert.equal(branch.branch.divergenceRevision,session.revision); });
const branchProposal = r.createWorldDiffProposal(world,branch,{operations:[{type:"MOVE_ENTITY",entityId:"guard",locationId:"tower"}]});
const branchResult = r.commitWorldDiff(world,branch,branchProposal,{eventId:"branch-e1"});
pass("branch change does not mutate parent world session", () => { assert.equal(branchResult.session.state.entities.guard.locationId,"tower"); assert.equal(session.state.entities.guard.locationId,"hall"); });

const story = r.createStoryContract({
  id:"story-1", principal:"user", worldSessionId:session.id, branchId:session.branch.id,
  worldRevision:session.revision, mode:"DIRECTOR", medium:"EPISODE", userIntent:"Continue the campaign while preserving player agency",
  protectedFacts:["secret-door-exists"], forbiddenChanges:["player-secret-emotion"], requiredBeats:["guard-warning"], spoilerBoundary:"current"
});
pass("StoryContract has no world authority", () => assert.equal(story.grantsWorldAuthority,false));
pass("StoryContract binds exact current world revision", () => assert.equal(r.verifyStoryWorldBinding(story,session),true));
pass("StoryContract fails after branch drift", () => assert.throws(() => r.verifyStoryWorldBinding(story,branch),/branch/));
pass("invalid story ownership mode fails closed", () => assert.throws(() => r.createStoryContract({id:"x",principal:"u",worldSessionId:"s",branchId:"b",worldRevision:0,userIntent:"x",mode:"GOD_MODE"}),/mode/));

let ledger = r.createNarrativeLedger(story);
ledger = r.addArc(ledger,{id:"aria-duty",subjectId:"aria",startCondition:"isolated",desiredChange:"accept-help"});
pass("arc starts planned instead of claiming growth", () => assert.equal(ledger.arcs["aria-duty"].state,"PLANNED"));
pass("arc cannot claim earned change without world-event evidence", () => assert.throws(() => r.advanceArc(ledger,{arcId:"aria-duty",state:"CHANGED"}),/event evidence/));
ledger = r.advanceArc(ledger,{arcId:"aria-duty",state:"CHANGED",evidenceEventIds:["e5"]});
pass("arc change carries event evidence", () => assert.deepEqual(ledger.arcs["aria-duty"].evidenceEventIds,["e5"]));

ledger = r.addPromise(ledger,{id:"door-promise",setupNodeId:"setup-1",description:"The sealed door matters later"});
pass("story promise is planted with source lineage", () => assert.equal(ledger.promises["door-promise"].state,"PLANTED"));
pass("payoff cannot appear without payoff node", () => assert.throws(() => r.transitionPromise(ledger,{promiseId:"door-promise",state:"PAID_OFF"}),/payoffNodeId/));
ledger = r.transitionPromise(ledger,{promiseId:"door-promise",state:"ACTIVE"});
ledger = r.transitionPromise(ledger,{promiseId:"door-promise",state:"PAID_OFF",payoffNodeId:"payoff-9"});
pass("payoff retains setup-to-payoff lineage", () => assert.deepEqual(ledger.promises["door-promise"].lineage,["setup-1","payoff-9"]));
ledger = r.revealToReader(ledger,{factId:"secret-door",sourceNodeId:"payoff-9"});
pass("reader knowledge is separate narrative plane", () => assert.ok(ledger.readerKnowledge["secret-door"]));
pass("duplicate reveal is detected", () => assert.throws(() => r.revealToReader(ledger,{factId:"secret-door",sourceNodeId:"x"}),/already knows/));

let graph = r.createStoryGraph(story);
graph = r.addStoryNode(graph,{id:"work",level:"WORK",purpose:"campaign story"});
graph = r.addStoryNode(graph,{id:"arc1",level:"ARC",parentId:"work",purpose:"door mystery"});
graph = r.addStoryNode(graph,{id:"scene1",level:"SCENE",parentId:"arc1",purpose:"warning reaches the group"});
pass("hierarchical StoryGraph builds lazily", () => assert.equal(graph.nodes.scene1.parentId,"arc1"));
pass("non-root node cannot exist without parent", () => assert.throws(() => r.addStoryNode(graph,{id:"orphan",level:"SCENE",purpose:"x"}),/requires parent/));
pass("story hierarchy cannot move upward", () => assert.throws(() => r.addStoryNode(graph,{id:"bad",level:"PART",parentId:"scene1",purpose:"x"}),/hierarchy/));
pass("unknown dependency is rejected", () => assert.throws(() => r.addStoryNode(graph,{id:"s2",level:"SCENE",parentId:"arc1",purpose:"x",dependencies:["missing"]}),/dependency/));

const scene = r.createSceneContract(world,session,story,ledger,graph,{
  id:"scene-contract-1", locationId:"hall", participants:["aria","guard"], povActorId:"aria",
  purpose:"Aria receives a warning without learning the hidden route", nodeIds:["scene1"],
  permittedRevealFactIds:["secret-door"], requiredFacts:["guard-present"]
});
pass("SceneContract compiles actor-scoped knowledge", () => { assert.ok(scene.knowledge.aria); assert.ok(scene.knowledge.guard); });
pass("SceneContract carries current world revision not a prose summary", () => assert.equal(scene.worldRevision,session.revision));
pass("SceneContract does not grant world authority", () => assert.equal(scene.grantsWorldAuthority,false));
pass("POV actor must be an actual scene participant", () => assert.throws(() => r.createSceneContract(world,session,story,ledger,graph,{locationId:"hall",participants:["aria"],povActorId:"guard",purpose:"x"}),/POV/));

const beats = r.createBeatPlan(scene,{beats:[
  {id:"b1",intent:"guard seeks attention",pressure:"time is short",response:"Aria listens",changedLocalCondition:"warning delivered"},
  {id:"b2",intent:"Aria asks what is known",response:"guard shares only observed facts",changedLocalCondition:"information boundary clarified"}
]});
pass("BeatPlan uses causal local changes", () => assert.equal(beats.beats.length,2));
pass("BeatPlan rejects inert missing-change beats", () => assert.throws(() => r.createBeatPlan(scene,{beats:[{id:"x",intent:"x",response:"y"}]}),/changedLocalCondition/));
pass("BeatPlan rejects duplicate beat identities", () => assert.throws(() => r.createBeatPlan(scene,{beats:[{id:"x",intent:"x",response:"y",changedLocalCondition:"z"},{id:"x",intent:"a",response:"b",changedLocalCondition:"c"}]}),/duplicate/));

const artifact = r.createNarrativeArtifact(scene,beats,{text:"A bounded draft.",claimedFacts:["guard-present"],revealedFactIds:["secret-door"]});
pass("narrative artifact is derived and does not commit world state", () => { assert.equal(artifact.worldDiffCommitted,false); assert.equal(artifact.grantsWorldAuthority,false); });
pass("narrative artifact cannot invent player action", () => assert.throws(() => r.createNarrativeArtifact(scene,beats,{text:"x",inventedPlayerActions:["player agrees"]}),/invent player/));
pass("narrative artifact cannot reveal unpermitted fact", () => assert.throws(() => r.createNarrativeArtifact(scene,beats,{text:"x",revealedFactIds:["future-twist"]}),/unpermitted reveal/));
pass("narrative artifact cannot claim forbidden change", () => assert.throws(() => r.createNarrativeArtifact(scene,beats,{text:"x",claimedFacts:["player-secret-emotion"]}),/forbidden fact/));

const minor = r.createStoryCriticFinding({artifactId:artifact.id,critic:"Continuity",severity:"MINOR",code:"WORDING",evidenceAnchor:"scene:line-1",repairSuggestion:"tighten"});
const review = r.createNarrativeReview({artifact,findings:[minor],continuityEvidenceIds:["e5"]});
pass("non-blocking critic findings can proceed to judge", () => assert.equal(review.status,"READY_FOR_JUDGE"));
const major = r.createStoryCriticFinding({artifactId:artifact.id,critic:"Agency",severity:"MAJOR",code:"AGENCY_RISK",evidenceAnchor:"beat:b2"});
pass("major critic finding requires repair", () => assert.equal(r.createNarrativeReview({artifact,findings:[major]}).status,"REPAIR_REQUIRED"));
pass("foreign critic finding cannot be smuggled into review", () => assert.throws(() => r.createNarrativeReview({artifact,findings:[{...minor,artifactId:"other"}]}),/foreign/));

const worldProposal = r.createWorldDiffProposal(world,session,{operations:[{type:"SET_ATTRIBUTE",entityId:"guard",key:"warningDelivered",value:true}]});
const handoff = r.prepareWorldDiffHandoff(session,artifact,worldProposal,review,{judgeReceiptId:"judge-receipt-1"});
pass("Story → World handoff remains proposed not committed", () => assert.equal(handoff.status,"PROPOSED_NOT_COMMITTED"));
pass("Story → World handoff grants no commit authority", () => assert.equal(handoff.grantsWorldAuthority,false));
pass("repair-required narrative cannot hand off a world diff", () => assert.throws(() => r.prepareWorldDiffHandoff(session,artifact,worldProposal,r.createNarrativeReview({artifact,findings:[major]}),{judgeReceiptId:"j"}),/not ready/));
pass("Story Fabric can never directly commit World Kernel", () => assert.equal(r.storyCanCommitWorld(),false));
pass("Story Fabric can never seize player agency", () => assert.equal(r.storyGrantsPlayerAgency(),false));

pass("tampered event history fails audit", () => {
  const tampered = { ...session, events: session.events.map((e,i) => i===0 ? {...e,proposalHash:"tampered"} : e) };
  assert.equal(r.auditWorldSession(world,tampered).status,"FAIL");
});

console.log(`rpg/story fabric foundation: PASS (${n} assertions)`);
