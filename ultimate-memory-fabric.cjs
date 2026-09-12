const assert=require('assert');
const {SevenUltimateOS}=require('./src/ultimate/runtime.js');

(()=>{
 const os=new SevenUltimateOS();os.createRpg({gameId:'g',campaignId:'c',timelineId:'t'});os.core.registerEntity('g',{id:'a',name:'A'});os.core.registerEntity('g',{id:'b',name:'B'});
 const e1=os.commitBeat({id:'e1',actorEntityId:'a',actionType:'dialogue',payload:{text:'The crown treaty was signed'},witnessIds:['b'],rememberBy:['a','b']});
 const e2=os.commitBeat({id:'e2',actorEntityId:'b',actionType:'dialogue',payload:{text:'The treaty caused a council crisis'},causeRefs:[e1.ref],rememberBy:['b']});
 const e3=os.commitBeat({id:'e3',actorEntityId:'a',actionType:'dialogue',payload:{text:'A private unrelated garden conversation'},rememberBy:['a']});
 const stats=os.memory.rebuild('g');assert.equal(stats.events,3);assert.equal(stats.entities>=2,true);assert.equal(stats.semanticVectors,3);
 const qB=os.memoryQuery({entityId:'b',text:'crown treaty',limit:10});assert.ok(qB.items.some(x=>x.event.id==='e1'));assert.ok(qB.items.some(x=>x.event.id==='e2'));assert.equal(qB.items.some(x=>x.event.id==='e3'),false,'character retrieval must not leak unknown memories');
 const qA=os.memoryQuery({entityId:'a',text:'garden',limit:10});assert.equal(qA.items[0].event.id,'e3');
 const causal=os.memoryQuery({entityId:'b',causeOf:e2.ref,limit:10});assert.ok(causal.items.some(x=>x.event.id==='e1'));
 const chain=os.chainMemory({text:'council crisis',depth:2});assert.ok(chain.chain.some(x=>x.id==='e1'));assert.ok(chain.chain.some(x=>x.id==='e2'));assert.equal(chain.authority,'derived_retrieval');
 const view=os.memory.entityView('g','a');assert.equal(view.authority,'derived');assert.ok(view.eventRefs.includes(e1.ref));
 assert.equal(os.snapshot().memoryIndex.events,3);
 console.log('ultimate memory fabric: 15 assertions PASS');
})();