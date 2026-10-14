'use strict';
const assert=require('node:assert/strict');
const State=require('./workspaces/rpg-state.js');
const Session=require('./workspaces/rpg-session.js');
const Context=require('./workspaces/rpg-context.js');

// Acceptance gate: logical cold restart with the same durable storage.
// This is NOT a substitute for Android process force-stop instrumentation.
const storage=Session.memoryStorage();
const seed={
 sessionId:'acceptance',worldId:'valen',
 timeline:{tick:5},
 world:{locations:{palace:{name:'Palace'},school:{name:'School'}}},
 characters:{
  ali:{control:'player',locationId:'palace'},
  aria:{control:'ai',locationId:'palace'},
  spy:{control:'ai',locationId:'palace'}
 },
 canon:{entries:{
  crown:{level:'HARD',value:'Aldren is king',public:true,entityIds:['ali','aria']},
  secret:{level:'HARD',value:'Hidden pact',public:false,availableAtTick:5,entityIds:['aria']}
 }}
};
const first=Session.createManager({stateApi:State,storage});
let started=first.start({roomId:'room-acceptance',worldId:'valen',state:seed});
assert.equal(started.ok,true);
let committed=first.commitEvents(started.session,[
 {id:'user-move',type:'character.move',source:'user',actorId:'ali',payload:{characterId:'ali',toLocationId:'school'}},
 {id:'npc-feeling',type:'emotion.change',source:'runtime',payload:{characterId:'aria',delta:{affection:.4}}},
]);
assert.equal(committed.ok,true);
assert.equal(committed.session.state.characters.ali.locationId,'school');
const revision=committed.session.state.revision;
const ledgerCount=committed.session.state.ledger.length;

// Simulate a fresh runtime instance after process termination.
const restarted=Session.createManager({stateApi:State,storage});
const loaded=restarted.load('room-acceptance','valen');
assert.equal(loaded.ok,true);
assert.equal(loaded.session.state.revision,revision);
assert.equal(loaded.session.state.ledger.length,ledgerCount);
assert.equal(loaded.session.state.characters.ali.locationId,'school');
assert.equal(loaded.session.state.characters.aria.emotions.affection,.4);

// Reject proposed AI control of player and changing hard canon.
const hijack=restarted.commitEvents(loaded.session,[
 {id:'ai-move',type:'character.move',source:'runtime',actorId:'ali',payload:{characterId:'ali',toLocationId:'palace'}}
]);
assert.equal(hijack.status,'BLOCKED');
assert.equal(hijack.eventReason,'player-control');
const current=restarted.load('room-acceptance','valen');
const canonMutation=restarted.commitEvents(current.session,[
 {id:'canon-rewrite',type:'canon.set',source:'runtime',payload:{id:'crown',entry:{level:'HARD',value:'The spy is king'}}}
]);
assert.equal(canonMutation.status,'BLOCKED');
assert.equal(canonMutation.eventReason,'hard-canon-conflict');
const after=restarted.load('room-acceptance','valen');
assert.equal(after.session.state.canon.entries.crown.value,'Aldren is king');
assert.equal(after.session.state.characters.ali.locationId,'school');
assert.equal(after.session.state.revision,revision);
const npcView=Context.buildCharacterView(after.session.state,State,'spy',{maxChars:10000});
assert.equal(npcView.ok,true);
assert.ok(!npcView.view.knownCanon.some(x=>x.id==='secret'));
console.log('RPG acceptance deterministic gate: PASS (restart, ledger, user agency, canon, knowledge)');