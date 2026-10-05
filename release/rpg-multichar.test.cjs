const assert=require('assert/strict');
const State=require('./workspaces/rpg-state.js');
const Context=require('./workspaces/rpg-context.js');

const characters={},canon={publicRule:{level:'HARD',value:'The council meets in the Hall',public:true,entityIds:['hall']}};
for(let i=0;i<20;i++){
  const id='c'+i,fact='secret-'+i;
  characters[id]={
    control:i===0?'player':'ai',
    locationId:'hall',
    identity:{name:'Character '+i},
    voice:{vocabulary:'voice-'+i,sentenceLength:i%2?'short':'medium',humor:'h'+i,formality:'f'+i,recurringExpressions:['phrase-'+i]},
    knowledge:{[fact]:{learnedAtTick:1,sourceEventId:'learn-'+i,confidence:1,method:'observed'}},
    intent:i===0?'':'goal-'+i
  };
  canon[fact]={level:'HARD',value:'private-'+i,public:false,entityIds:[id]};
}
const state=State.createState({
  worldId:'multi',timeline:{tick:5},world:{locations:{hall:{name:'Hall'}}},
  characters,canon:{entries:canon},
  scene:{id:'council',locationId:'hall',participantIds:Object.keys(characters),purpose:'Council',timeTick:5}
});
const out=Context.buildSceneGenerationView(state,State,{maxChars:60000,characterLimit:20,canonLimit:8,publicCanonLimit:8});
assert.equal(out.ok,true);
assert.equal(out.view._diagnostics.bounded,true);
assert.equal(out.view._diagnostics.characterCount,20);
assert.equal(out.view.controlRules.c0,'player');
for(let i=0;i<20;i++){
  const id='c'+i,view=out.view.characters[id];
  assert.ok(view,'missing character view '+id);
  assert.equal(view.character.voice.vocabulary,'voice-'+i);
  assert.ok(view.knownCanon.some(x=>x.id==='secret-'+i),'own secret missing for '+id);
  for(let j=0;j<20;j++)if(j!==i)assert.ok(!view.knownCanon.some(x=>x.id==='secret-'+j),'knowledge leak '+id+' -> secret-'+j);
  assert.equal(Context.validateNoKnowledgeLeak(view,state,State,id).valid,true);
}
console.log('rpg 20-character scene: PASS',JSON.stringify({characters:20,chars:out.view._diagnostics.serializedChars}));