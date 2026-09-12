const assert=require('assert');
const {SearchFabric}=require('./src/ultimate/search-fabric.js');
const {SearchProviderRegistry,SearchRuntime}=require('./src/ultimate/search-runtime.js');

(async()=>{
 const fabric=new SearchFabric(),providers=new SearchProviderRegistry();let callsA=0,callsB=0,callsPaid=0;
 providers.register({id:'free-a',verticals:['general','technical_docs'],freeProof:'verified_free',priority:10,search:async q=>{callsA++;return[{url:'https://example.com/docs?utm_source=a',title:'Official docs',authority:1,directness:1,evidence:1,independenceRoot:'official',snippet:q}]}});
 providers.register({id:'free-b',verticals:['general','technical_docs'],freeProof:'free_quota',priority:8,search:async q=>{callsB++;return[{url:'https://example.com/docs',title:'Duplicate mirror result',authority:.7,directness:.7,evidence:.7,independenceRoot:'official',snippet:q},{url:'https://other.example/report',title:'Independent report',authority:.7,directness:.6,evidence:.8,independenceRoot:'other'}]}});
 providers.register({id:'paid',verticals:['general'],freeProof:'paid',priority:99,search:async()=>{callsPaid++;return[{url:'https://paid.example'}]}});
 const runtime=new SearchRuntime({fabric,providers,maxProvidersPerQuery:2});const q1=await runtime.query('Seven API docs',{vertical:'technical_docs'});assert.equal(q1.runs.length,2);assert.equal(callsPaid,0,'paid provider must stay out of free-first search');assert.equal(fabric.fusion.list().length,2,'canonical fusion should collapse duplicate URL but keep independent source');assert.equal(q1.results[0].url,'https://example.com/docs');
 const beforeA=callsA,beforeB=callsB;const q2=await runtime.query('Seven API docs',{vertical:'technical_docs'});assert.equal(callsA,beforeA);assert.equal(callsB,beforeB);assert.ok(q2.runs.every(x=>x.cached===true),'repeat query must hit search cache');
 const deep=await runtime.execute('Seven AI architecture',{depth:'deep',vertical:'general',maxQueriesPerWave:1});assert.ok(deep.waves.length>=3);assert.ok(deep.totalQueries>=3);assert.equal(callsPaid,0);
 const failing=new SearchProviderRegistry();let bad=0;failing.register({id:'bad',freeProof:'verified_free',search:async()=>{bad++;const e=new Error('quota');e.retryAfterMs=10000;throw e}});const rt2=new SearchRuntime({fabric:new SearchFabric(),providers:failing,maxProvidersPerQuery:1});const failed=await rt2.query('x');assert.equal(failed.runs[0].results.length,0);assert.equal(failing.providers.get('bad').cooldownUntil>Date.now(),true);assert.equal(bad,1);
 console.log('ultimate search runtime: 14 assertions PASS');
})().catch(err=>{console.error(err);process.exit(1)});