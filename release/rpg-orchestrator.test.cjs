const assert=require('assert/strict');
const State=require('./workspaces/rpg-state.js');
const Session=require('./workspaces/rpg-session.js');
const Context=require('./workspaces/rpg-context.js');
const Planner=require('./workspaces/rpg-planner.js');
const Orchestrator=require('./workspaces/rpg-orchestrator.js');
const storage=Session.memoryStorage(),mem=[];
const O=Orchestrator.createRuntime({stateApi:State,sessionApi:Session,contextApi:Context,plannerApi:Planner,storage,memoryWriter:m=>mem.push(m),clock:(()=>{let n=0;return()=>String(++n)})()});
const seed={world:{locations:{home:{},road:{}}},characters:{hero:{control:'player',locationId:'home'},npc:{control:'ai',locationId:'home',intent:'protect hero'}},canon:{entries:{rule:{level:'HARD',value:'The crown belongs to the realm',public:true}}}};
let ready=O.ensure('room1',null,seed);assert.equal(ready.ok,true);
let gen=O.generationContext('room1',{maxChars:10000});assert.equal(gen.ok,true);assert.equal(gen.view.controlRules.hero,'player');
let p=O.plan('room1');assert.equal(p.ok,true);assert.ok(p.plan.npcProposals.some(x=>x.characterId==='npc'));assert.ok(!p.plan.npcProposals.some(x=>x.characterId==='hero'));
(async()=>{
 let out=await O.processTurn({roomId:'room1',userText:'I move to the road.',reply:'The hero reaches the road. The NPC trusts the hero more.',extractor:async()=>JSON.stringify({events:[
   {type:'character.move',actorId:'hero',payload:{characterId:'hero',toLocationId:'road'},evidence:{source:'user',quote:'I move to the road.'},summary:'Hero moves to road'},
   {type:'relationship.change',payload:{a:'npc',b:'hero',directional:true,delta:{trust:.2}},evidence:{source:'assistant',quote:'The NPC trusts the hero more.'},summary:'NPC trust rises'}
 ]})});
 assert.equal(out.ok,true);let s=O.snapshot('room1').state;assert.equal(s.characters.hero.locationId,'road');assert.equal(State.relationshipFor(s,'npc','hero').trust,.2);assert.equal(s.turn,1);assert.ok(mem.length>=2);
 const rev=s.revision;
 out=await O.processTurn({roomId:'room1',userText:'Nothing about moving.',reply:'The hero appears at home.',extractor:async()=>({events:[{type:'character.move',actorId:'hero',payload:{characterId:'hero',toLocationId:'home'},evidence:{source:'user',quote:'I move home.'}}]})});
 assert.equal(out.ok,false);assert.equal(out.eventReason,'player-control');assert.equal(O.snapshot('room1').state.revision,rev);
 out=await O.processTurn({roomId:'room1',userText:'Continue.',reply:'Quiet moment.',extractor:async()=>'{bad json'});
 assert.equal(out.ok,true);s=O.snapshot('room1').state;assert.equal(s.turn,2);assert.equal(out.extractionStatus,'invalid-json');
 const before=JSON.stringify(s.canon.entries.rule.value);
 out=await O.processTurn({roomId:'room1',userText:'Continue.',reply:'The crown was never part of the realm.',extractor:async()=>({events:[{type:'canon.set',payload:{id:'rule',entry:{level:'HARD',value:'The crown never belonged to the realm'}},evidence:{source:'assistant',quote:'The crown was never part of the realm.'}}]})});
 assert.equal(out.ok,false);assert.equal(out.eventReason,'hard-canon-conflict');assert.equal(JSON.stringify(O.snapshot('room1').state.canon.entries.rule.value),before);
 console.log('rpg orchestrator: PASS',JSON.stringify({turn:O.snapshot('room1').state.turn,memories:mem.length}));
})().catch(e=>{console.error(e);process.exit(1)});