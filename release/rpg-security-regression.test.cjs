'use strict';
const assert=require('node:assert/strict');
const RPG=require('./workspaces/rpg-state.js');
const base=RPG.createState({
 sessionId:'security-acceptance',worldId:'valen',
 timeline:{tick:0},world:{locations:{palace:{name:'Palace'}},flags:{}},
 characters:{ali:{control:'player',locationId:'palace'},aria:{control:'ai',locationId:'palace'}},
 canon:{entries:{
  king:{level:'HARD',value:'Aldren is king',public:true},
  future:{level:'HARD',value:'Future secret',public:false,availableAtTick:50}
 }}
});
function rejects(type,payload,reason,other={}){
 const event={id:type+'-'+reason,type,source:'runtime',payload,...other};
 const result=RPG.applyEvent(base,event);
 assert.equal(result.ok,false,JSON.stringify({type,payload,result}));
 assert.equal(result.reason,reason,JSON.stringify({type,payload,result}));
 assert.equal(base.revision,0,'base mutated on rejected event');
}
for(const part of ['__proto__','constructor','prototype']){
 rejects('world.set',{path:['flags',part,'rpgInjected'],value:'unsafe'},'invalid-world-path');
 rejects('world.set',{path:['flags',part],value:{rpgInjected:true}},'invalid-world-path');
}
assert.equal(Object.prototype.rpgInjected,undefined,'global prototype polluted');
assert.equal(({}).rpgInjected,undefined,'global Object became polluted');
rejects('world.set',{path:Array(65).fill('tooDeep'),value:1},'invalid-world-path');
rejects('canon.set',{id:'king',entry:{level:'HARD',value:'AI is king'}},'hard-canon-conflict',{authority:'user-override'});
rejects('canon.set',{id:'__proto__',entry:{value:'poison'}},'invalid-canon-id');
rejects('thread.update',{threadId:'__proto__',patch:{poison:true}},'invalid-thread-id');
rejects('belief.set',{characterId:'aria',factId:'__proto__',value:'poison'},'invalid-belief-key');
rejects('knowledge.learn',{characterId:'aria',factId:'future',allowEarlyReveal:true},'future-knowledge');
rejects('character.move',{characterId:'ali',toLocationId:'palace'},'player-control',{authority:'user-override'});
const valid=RPG.applyEvent(base,{id:'ordinary-path',type:'world.set',source:'runtime',payload:{path:['flags','session'],value:'safe'}});
assert.equal(valid.ok,true);
assert.equal(valid.state.world.flags.session,'safe');
const authorized=RPG.applyEvent(base,{id:'authorized-override',type:'canon.set',source:'user',authority:'user-override',payload:{id:'king',entry:{level:'HARD',value:'Elowen is king'}}});
assert.equal(authorized.ok,true);
assert.equal(authorized.state.canon.entries.king.value,'Elowen is king');
console.log('RPG security regression: PASS (prototype paths, authority spoofing, forbidden knowledge, player control, authorized writes)');
