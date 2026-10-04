const assert=require('assert/strict');
const State=require('./workspaces/rpg-state.js');
const Ctx=require('./workspaces/rpg-context.js');
let s=State.createState({
  worldId:'w',timeline:{tick:20},world:{locations:{hall:{name:'Hall'}}},
  characters:{
    a:{control:'ai',locationId:'hall',knowledge:{secret:{learnedAtTick:15,sourceEventId:'tell-a'}},beliefs:{rumor:{value:'maybe'}}},
    b:{control:'ai',locationId:'hall'},
    player:{control:'player',locationId:'hall'},\n    aria:{control:'ai',locationId:'hall'}
  },
  canon:{entries:{
    public:{level:'HARD',value:'public truth',public:true,entityIds:['hall']},
    secret:{level:'HARD',value:'hidden truth',public:false,entityIds:['a']},
    unrelated:{level:'SOFT',value:'elsewhere',public:false,entityIds:['x']}
  }},
  relationships:{'a::b':{trust:.4},'a::player':{respect:.8},'aria::b':{fear:.9}},
  quests:{qa:{title:'A quest',status:'active',ownerIds:['a']},qb:{title:'B quest',status:'active',ownerIds:['b']}},
  scene:{id:'s',locationId:'hall',participantIds:['a','b','player'],purpose:'meeting',timeTick:20}
});
let a=Ctx.buildCharacterView(s,State,'a',{maxChars:10000});assert.equal(a.ok,true);
let b=Ctx.buildCharacterView(s,State,'b',{maxChars:10000});assert.equal(b.ok,true);
assert.ok(a.view.knownCanon.some(x=>x.id==='secret'));
assert.ok(a.view.knownCanon.some(x=>x.id==='public'));
assert.ok(!b.view.knownCanon.some(x=>x.id==='secret'));
assert.ok(b.view.knownCanon.some(x=>x.id==='public'));
assert.equal(a.view.knowledgeRefs.secret.learnedAtTick,15);
assert.equal(b.view.knowledgeRefs.secret,undefined);
assert.equal(a.view.hidden.globalLedgerOmitted,true);\nassert.equal(a.view.relationships['aria::b'],undefined,'substring character IDs must not leak unrelated relationships');
assert.equal(Ctx.validateNoKnowledgeLeak(a.view,s,State,'a').valid,true);
assert.equal(Ctx.validateNoKnowledgeLeak(b.view,s,State,'b').valid,true);
const narrator=Ctx.buildNarratorView(s,State,{maxChars:12000});assert.equal(narrator.view.access,'world-truth');assert.ok(narrator.view.canon.some(x=>x.id==='secret'));
const records=[
 {id:'p',metadata:{visibility:'public'}},
 {id:'a',metadata:{allowedCharacterIds:['a']}},
 {id:'b',metadata:{allowedCharacterIds:['b']}},
 {id:'x'}
];
assert.deepEqual(Ctx.filterMemoryRecords(records,'a').map(x=>x.id),['p','a']);
for(let i=0;i<600;i++){
  const id='f'+i;s.canon.entries[id]={id,level:i%50===0?'HARD':'SOFT',factState:'existing_fact',value:'v'.repeat(40),entityIds:i%3===0?['a']:['x'],tags:[],availableAtTick:0,public:i%97===0,sourceEventId:null,confidence:1,status:'active',supersedes:[]};
  if(i%3===0)s.characters.a.knowledge[id]={learnedAtTick:1,sourceEventId:'e'+i,confidence:1,method:'observed'};
}
a=Ctx.buildCharacterView(s,State,'a',{maxChars:9000,canonLimit:40});b=Ctx.buildCharacterView(s,State,'b',{maxChars:9000,canonLimit:40});
assert.equal(a.view._diagnostics.bounded,true);assert.equal(b.view._diagnostics.bounded,true);
assert.ok(a.view.knownCanon.length<=40);assert.ok(b.view.knownCanon.length<=40);
assert.equal(Ctx.validateNoKnowledgeLeak(a.view,s,State,'a').valid,true);assert.equal(Ctx.validateNoKnowledgeLeak(b.view,s,State,'b').valid,true);
console.log('rpg context views: PASS',JSON.stringify({aCanon:a.view.knownCanon.length,bCanon:b.view.knownCanon.length,aChars:a.view._diagnostics.serializedChars,bChars:b.view._diagnostics.serializedChars}));
