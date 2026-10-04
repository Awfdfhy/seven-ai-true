const assert=require('assert/strict');
const State=require('./workspaces/rpg-state.js');
const Session=require('./workspaces/rpg-session.js');
const Context=require('./workspaces/rpg-context.js');

const storage=Session.memoryStorage();
let clock=0;
const M=Session.createManager({stateApi:State,storage,clock:()=>('bench-'+(++clock))});

const seed={
  sessionId:'long-story',worldId:'valen-long',timeline:{tick:0},
  world:{locations:{capital:{name:'Capital'},frontier:{name:'Frontier'}},flags:{bridgeDestroyed:false}},
  characters:{
    hero:{control:'player',locationId:'capital',voice:{vocabulary:'plain',sentenceLength:'medium',humor:'dry',formality:'casual',recurringExpressions:['hm'],culturalBackground:'Valen',emotionalExpressionStyle:'restrained'}},
    aria:{control:'ai',locationId:'capital',intent:'protect the realm'},
    spy:{control:'ai',locationId:'capital',intent:'learn the hidden pact'},
    king:{control:'ai',locationId:'capital',intent:'preserve continuity'}
  },
  items:{asterionKey:{name:'Asterion Key',ownerId:'hero'}},
  abilities:{gate:{name:'Gate',ownerIds:['hero'],cooldownTurns:5}},
  quests:{summit:{title:'Secure the summit',status:'active',ownerIds:['aria'],objectives:[{id:'o1',done:false}]}},
  factions:{council:{name:'Royal Council',leaderIds:['king'],memberIds:['aria'],reputation:{hero:0}}},
  canon:{entries:{
    ruler:{level:'HARD',value:'The king rules Valen',public:true,entityIds:['king']},
    pact:{level:'HARD',value:'A hidden Asterion pact exists',public:false,availableAtTick:0,entityIds:['aria','hero']}
  }}
};
seed.characters.hero.inventory=['asterionKey'];

let started=M.start({roomId:'bench-room',worldId:'valen-long',state:seed});assert.equal(started.ok,true);
let session=started.session;
let eventCount=0;
function commit(event){
  const out=M.commitEvents(session,[event]);assert.equal(out.ok,true,event.id+': '+(out.reason||out.eventReason||''));session=out.session;eventCount++;return out;
}

// Establish facts/consequences early.
commit({id:'e-destroy-bridge',type:'world.set',source:'user',payload:{path:['flags','bridgeDestroyed'],value:true},summary:'The old frontier bridge was destroyed.'});
commit({id:'e-aria-learns',type:'knowledge.learn',source:'runtime',payload:{characterId:'aria',factId:'pact',method:'witnessed'},summary:'Aria learned the pact.'});
let spyView=Context.buildCharacterView(session.state,State,'spy',{maxChars:9000});assert.equal(spyView.ok,true);assert.ok(!spyView.view.knownCanon.some(x=>x.id==='pact'));
const initialHeroVoice=JSON.stringify(session.state.characters.hero.voice);

for(let i=0;i<1004;i++){
  const n=i+1;
  let ev;
  if(n===100)ev={id:'bench-'+n,type:'item.transfer',source:'user',payload:{itemId:'asterionKey',fromOwnerId:'hero',toOwnerId:'aria'},summary:'Hero entrusted the key to Aria.'};
  else if(n===250)ev={id:'bench-'+n,type:'quest.update',source:'runtime',payload:{questId:'summit',patch:{objectives:[{id:'o1',done:true}]}},summary:'The summit objective was secured.'};
  else if(n===400)ev={id:'bench-'+n,type:'faction.update',source:'runtime',payload:{factionId:'council',patch:{reputation:{hero:.7}}},summary:'The Council reputation improved.'};
  else if(n===500)ev={id:'bench-'+n,type:'knowledge.learn',source:'runtime',payload:{characterId:'spy',factId:'pact',method:'told'},summary:'The spy finally learned the pact through a valid channel.'};
  else if(n===700)ev={id:'bench-'+n,type:'quest.update',source:'runtime',payload:{questId:'summit',patch:{status:'completed'}},summary:'The summit quest completed.'};
  else if(n%20===0)ev={id:'bench-'+n,type:'relationship.change',source:'runtime',payload:{a:'aria',b:'hero',delta:{trust:.001,respect:.001},reason:'long campaign cooperation'}};
  else if(n%17===0)ev={id:'bench-'+n,type:'emotion.change',source:'runtime',payload:{characterId:'aria',delta:{anxiety:-.002,affection:.001}}};
  else if(n%11===0)ev={id:'bench-'+n,type:'time.advance',source:'runtime',payload:{by:1}};
  else ev={id:'bench-'+n,type:'world.set',source:'runtime',payload:{path:['flags','pulse'],value:n}};
  commit(ev);

  if([250,500,750].includes(n)){
    const restored=M.load('bench-room','valen-long');assert.equal(restored.ok,true);session=restored.session;
    assert.equal(session.state.world.flags.bridgeDestroyed,true);
    assert.equal(JSON.stringify(session.state.characters.hero.voice),initialHeroVoice);
  }
}

assert.equal(eventCount,1006);
assert.equal(session.state.world.flags.bridgeDestroyed,true,'old consequence must persist');
assert.equal(session.state.items.asterionKey.ownerId,'aria');
assert.ok(session.state.characters.aria.inventory.includes('asterionKey'));
assert.equal(session.state.quests.summit.status,'completed');
assert.equal(session.state.factions.council.reputation.hero,.7);
assert.equal(JSON.stringify(session.state.characters.hero.voice),initialHeroVoice,'stable voice profile drifted');

spyView=Context.buildCharacterView(session.state,State,'spy',{maxChars:9000,canonLimit:24});
assert.equal(spyView.ok,true);assert.ok(spyView.view.knownCanon.some(x=>x.id==='pact'),'valid propagation must reveal secret later');
const ariaView=Context.buildCharacterView(session.state,State,'aria',{maxChars:9000,canonLimit:24});
assert.equal(ariaView.view._diagnostics.bounded,true);assert.equal(spyView.view._diagnostics.bounded,true);
assert.equal(Context.validateNoKnowledgeLeak(ariaView.view,session.state,State,'aria').valid,true);
assert.equal(Context.validateNoKnowledgeLeak(spyView.view,session.state,State,'spy').valid,true);
assert.equal(State.validateState(session.state).valid,true);

const badCanon=M.commitEvents(session,[{id:'bad-canon',type:'canon.set',source:'runtime',payload:{id:'ruler',entry:{level:'HARD',value:'The spy has always ruled Valen'}}}]);
assert.equal(badCanon.ok,false);assert.equal(badCanon.eventReason,'hard-canon-conflict');
const badPlayer=M.commitEvents(session,[{id:'bad-player',type:'character.move',source:'runtime',actorId:'hero',payload:{characterId:'hero',toLocationId:'frontier'}}]);
assert.equal(badPlayer.ok,false);assert.equal(badPlayer.eventReason,'player-control');

const restored=M.load('bench-room','valen-long');assert.equal(restored.ok,true);
assert.equal(restored.session.state.revision,session.state.revision);
assert.equal(restored.session.state.world.flags.bridgeDestroyed,true);
assert.equal(restored.session.state.quests.summit.status,'completed');
assert.equal(JSON.stringify(restored.session.state.characters.hero.voice),initialHeroVoice);

console.log('rpg long story benchmark: PASS',JSON.stringify({
  committedEvents:eventCount,
  revision:session.state.revision,
  tick:session.state.timeline.tick,
  bridgeDestroyed:session.state.world.flags.bridgeDestroyed,
  quest:session.state.quests.summit.status,
  ariaContextChars:ariaView.view._diagnostics.serializedChars,
  spyContextChars:spyView.view._diagnostics.serializedChars,
  invalidCanonBlocked:true,
  playerAgencyBlocked:true
}));
