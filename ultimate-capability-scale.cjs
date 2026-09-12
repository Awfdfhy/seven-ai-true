const assert=require('assert');
const Cat=require('./src/ultimate/capability-catalog.js');
const I=require('./src/ultimate/capability-intelligence.js');

(()=>{
 const ms=()=>Number(process.hrtime.bigint())/1e6;
 // 10K full multi-index metadata path.
 const idx=new I.InvertedCapabilityIndex();let t=ms();
 for(let i=0;i<10000;i++)idx.add({id:`code.tool.${i}`,name:`Code Tool ${i}`,namespace:'code',description:`symbol project feature${i%100}`,capabilities:[`code.feature${i%100}`],tags:['code','project'],protocol:'local',network:'optional',actionClass:'read',trustZone:1,reliability:.95,latency:{p95:2},inputSchema:{type:'object',properties:{q:{type:'string'}}}});
 const build10k=ms()-t;t=ms();const q=idx.candidates('feature42 project',{limit:24});const search10k=ms()-t;assert.equal(idx.stats().documents,10000);assert(q.length<=24&&q.length>0);assert(build10k<60000,'10K index build regression');assert(search10k<10000,'10K discovery regression');

 // 100K compact catalog path. This exercises metadata scale without loading full schemas/executors.
 const gateway=new Cat.LazyCatalogGateway({catalogOptions:{shardSize:2048,cacheOptions:{hotLimit:64,warmLimit:256}},hydrationLimit:12});t=ms();
 for(let i=0;i<100000;i++)gateway.ingest([{id:`cap.tool.${i}`,name:`Capability ${i}`,namespace:i%4===0?'research':i%4===1?'code':i%4===2?'rpg':'files',description:`operation group${i%256}`,capabilities:[`feature${i%256}`],tags:[`group${i%256}`],protocol:i%10===0?'mcp':'local',network:i%10===0?'required':'optional',actionClass:'read',trustZone:i%10===0?3:1,reliability:.9,version:'1',schemaHash:'s'}]);
 const build100k=ms()-t,stats=gateway.stats();assert.equal(stats.catalog.capabilities,100000);assert(stats.catalog.shards>10);t=ms();let total=0;for(let i=0;i<20;i++)total+=gateway.search(`group${i*7%256}`,{limit:12}).length;const search100k=ms()-t;assert(total>0);assert(build100k<90000,'100K compact catalog build regression');assert(search100k<15000,'100K catalog discovery regression');
 const exact=gateway.search('cap.tool.99999',{limit:12});assert(exact.some(x=>x.id==='cap.tool.99999'));const exposedBytes=Buffer.byteLength(JSON.stringify(exact));assert(exact.length<=12);assert(exposedBytes<50000,'top-K context must stay bounded as catalog grows');
 const heapMB=Math.round(process.memoryUsage().heapUsed/1024/1024);
 console.log(JSON.stringify({suite:'ultimate-capability-scale',build10kMs:Math.round(build10k),search10kMs:Number(search10k.toFixed(3)),build100kMs:Math.round(build100k),search20x100kMs:Number(search100k.toFixed(3)),catalogShards:stats.catalog.shards,topKBytes:exposedBytes,heapMB}));
 console.log('ultimate-capability-scale: PASS');
})();