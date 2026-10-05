const assert=require('assert/strict');
const State=require('./workspaces/rpg-state.js');
const Session=require('./workspaces/rpg-session.js');
const Context=require('./workspaces/rpg-context.js');
const Planner=require('./workspaces/rpg-planner.js');
const Orchestrator=require('./workspaces/rpg-orchestrator.js');

const storage=Session.memoryStorage();
const prefix='seven_rpg_session_v3',pointerPrefix='seven_rpg_session_v3:active';
const roomId='room-unified',worldId='world-unified';
const external=Session.createManager({stateApi:State,storage,prefix,clock:(()=>{let n=0;return()=>String(++n)})()});
let started=external.start({roomId,worldId,state:{worldId,characters:{npc:{control:'ai',locationId:'hall',intent:'guard'}}}});
assert.equal(started.ok,true);
storage.setItem(pointerPrefix+':'+encodeURIComponent(roomId),worldId);

const runtime=Orchestrator.createRuntime({stateApi:State,sessionApi:Session,contextApi:Context,plannerApi:Planner,storage,prefix,pointerPrefix});
let ready=runtime.ensure(roomId);
assert.equal(ready.ok,true);
assert.equal(ready.session.worldId,worldId);
assert.equal(ready.session.state.characters.npc.intent,'guard');

const current=external.load(roomId,worldId);
assert.equal(current.ok,true);
const changed=external.commitEvents(current.session,[{id:'external-1',type:'character.set',source:'runtime',countsAsTurn:false,payload:{characterId:'npc',patch:{intent:'investigate'}}}]);
assert.equal(changed.ok,true);

ready=runtime.ensure(roomId);
assert.equal(ready.ok,true);
assert.equal(ready.session.state.characters.npc.intent,'investigate');
assert.equal(ready.session.persistedRevision,changed.session.persistedRevision);

const plan=runtime.plan(roomId);
assert.equal(plan.ok,true);
assert.ok(plan.plan.npcProposals.some(x=>x.characterId==='npc'&&x.intent==='investigate'));
console.log('rpg unified live session: PASS');