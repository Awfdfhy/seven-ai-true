const assert=require('assert/strict');
const R=require('./workspaces/rpg-state.js');
let s=R.createState({
 timeline:{tick:0},
 world:{locations:{a:{},b:{}},travelEdges:{'a::b':{duration:3,method:'road'}}},
 characters:{hero:{control:'user',locationId:'a',resources:{mana:10}},npc:{control:'ai',locationId:'a'},other:{control:'ai',locationId:'a'}},
 abilities:{spell:{ownerIds:['hero'],costs:{mana:4},cooldownTurns:2}},
 quests:{q0:{status:'active'},q1:{status:'active',dependencies:['q0']}}
});
// Unknown control falls back to AI, so make explicit player after normalization.
s.characters.hero.control='player';
let x=R.applyEvent(s,{id:'d1',type:'relationship.change',source:'runtime',payload:{a:'npc',b:'other',directional:true,delta:{trust:.5}}});assert.equal(x.ok,true);s=x.state;
assert.equal(R.relationshipFor(s,'npc','other').trust,.5);assert.equal(R.relationshipFor(s,'other','npc').trust,0);
x=R.applyEvent(s,{id:'q1bad',type:'quest.update',source:'runtime',payload:{questId:'q1',patch:{status:'completed'}}});assert.equal(x.reason,'quest-dependency-incomplete');
x=R.applyEvent(s,{id:'q0done',type:'quest.update',source:'runtime',payload:{questId:'q0',patch:{status:'completed'}}});assert.equal(x.ok,true);s=x.state;
x=R.applyEvent(s,{id:'q1done',type:'quest.update',source:'runtime',payload:{questId:'q1',patch:{status:'completed'}}});assert.equal(x.ok,true);s=x.state;
x=R.applyEvent(s,{id:'spell1',type:'ability.use',source:'user',payload:{abilityId:'spell',characterId:'hero'}});assert.equal(x.ok,true);s=x.state;assert.equal(s.characters.hero.resources.mana,6);
x=R.applyEvent(s,{id:'spell2',type:'ability.use',source:'user',payload:{abilityId:'spell',characterId:'hero'}});assert.equal(x.reason,'ability-cooldown');
x=R.applyEvent(s,{id:'turn1',type:'narrative.record',source:'runtime',payload:{}});s=x.state;
x=R.applyEvent(s,{id:'turn2',type:'narrative.record',source:'runtime',payload:{}});s=x.state;
x=R.applyEvent(s,{id:'spell3',type:'ability.use',source:'user',payload:{abilityId:'spell',characterId:'hero'}});assert.equal(x.ok,true);s=x.state;assert.equal(s.characters.hero.resources.mana,2);
x=R.applyEvent(s,{id:'turn3',type:'narrative.record',source:'runtime',payload:{}});s=x.state;
x=R.applyEvent(s,{id:'turn4',type:'narrative.record',source:'runtime',payload:{}});s=x.state;
x=R.applyEvent(s,{id:'spell4',type:'ability.use',source:'user',payload:{abilityId:'spell',characterId:'hero'}});assert.equal(x.reason,'ability-resource-insufficient');
x=R.applyEvent(s,{id:'travel',type:'travel.start',source:'user',payload:{characterId:'hero',toLocationId:'b'}});assert.equal(x.ok,true);s=x.state;assert.equal(s.characters.hero.locationId,null);assert.equal(s.characters.hero.travelState.arrivalTick,s.timeline.tick+3);
x=R.applyEvent(s,{id:'sceneWhileTravel',type:'scene.start',source:'runtime',payload:{locationId:'b',participantIds:['hero']}});assert.equal(x.reason,'character-in-transit');
x=R.applyEvent(s,{id:'early',type:'travel.arrive',source:'user',payload:{characterId:'hero'}});assert.equal(x.reason,'travel-not-arrived');
x=R.applyEvent(s,{id:'advance',type:'time.advance',source:'runtime',payload:{by:3}});s=x.state;
x=R.applyEvent(s,{id:'arrive',type:'travel.arrive',source:'user',payload:{characterId:'hero'}});assert.equal(x.ok,true);s=x.state;assert.equal(s.characters.hero.locationId,'b');assert.equal(s.characters.hero.travelState,null);
assert.equal(R.validateState(s).valid,true);
console.log('rpg extended rules: PASS');