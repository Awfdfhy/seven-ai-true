const assert=require('assert');
const {SevenUltimateOS}=require('./src/ultimate/runtime.js');
const {RevisionedMemoryStore}=require('./src/ultimate/persistence.js');

(async()=>{
 const store=new RevisionedMemoryStore(),os=new SevenUltimateOS({persistence:store});os.addKnowledgeSource({id:'doc1',title:'Seven Spec',sourceRef:'file:spec',kind:'document'});const ing=os.ingestKnowledge('doc1','Seven uses authoritative state. Summaries are derived views. The RPG Chronicle keeps canonical events and causal links.',{chunking:{maxChars:70,overlap:10}});assert.ok(ing.chunks>=2);const dedupe=os.ingestKnowledge('doc1','Seven uses authoritative state. Summaries are derived views. The RPG Chronicle keeps canonical events and causal links.');assert.equal(dedupe.deduplicated,true);
 const q=os.queryKnowledge('canonical RPG events',{limit:3});assert.ok(q.items.length>0);assert.equal(q.authority,'derived_retrieval');assert.equal(q.items[0].chunk.lineage.sourceRef,'file:spec');assert.ok(q.citations[0].range.length===2);
 const source=os.knowledgeBase.sourceView('doc1');assert.equal(source.source.authority,'authoritative_source');assert.equal(source.versions.length,1);assert.ok(os.snapshot().knowledgeBase.chunks>=2);
 await os.save('state',0);os.knowledgeBase.removeSource('doc1');assert.equal(os.knowledgeBase.stats().sources,0);await os.load('state');assert.equal(os.knowledgeBase.stats().sources,1);assert.ok(os.queryKnowledge('authoritative state').items.length>0,'knowledge chunks and lineage must survive restore');
 console.log('ultimate knowledge fabric: 13 assertions PASS');
})().catch(err=>{console.error(err);process.exit(1)});