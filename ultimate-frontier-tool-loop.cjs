const assert=require('assert');
const {ToolFabric,PermissionLedger}=require('./src/ultimate/tool-fabric.js');
const {ToolExecutorRegistry,ToolExecutionRuntime}=require('./src/ultimate/tool-runtime.js');
const {ProviderPool}=require('./src/ultimate/provider-adapters.js');
const T=require('./src/ultimate/frontier-tool-loop.js');

(async()=>{
 const fabric=new ToolFabric(),permissions=new PermissionLedger(),executors=new ToolExecutorRegistry();
 let active=0,maxActive=0,calls=0;
 executors.register('calculator',async args=>{calls++;active++;maxActive=Math.max(maxActive,active);await new Promise(r=>setTimeout(r,8));active--;return{value:Number(args.a||0)+Number(args.b||0)};},{resultSchema:{type:'object',required:['value']}});
 const runtime=new ToolExecutionRuntime({fabric,permissions,executors,maxRetries:0});
 let providerRound=0;
 const providers=new ProviderPool();
 providers.register({id:'p',async chat(input){providerRound++;if(providerRound===1)return{choices:[{message:{content:'',tool_calls:[{id:'c1',type:'function',function:{name:'calculator',arguments:'{"a":2,"b":3}'}},{id:'c2',type:'function',function:{name:'calculator',arguments:'{"a":10,"b":4}'}}]}}]};const toolMessages=input.messages.filter(x=>x.role==='tool');return{choices:[{message:{content:`Results ${toolMessages.map(x=>JSON.parse(x.content).result.value).join(', ')}`}}]};}},{freeProof:'verified_free'});
 const schemas=new T.ToolSchemaCompiler({fabric,executors});assert.equal(schemas.compile(['calculator']).length,1);assert.equal(schemas.compile(['web_search']).length,0);
 const loop=new T.AgenticToolLoop({fabric,runtime,providers});assert.equal(loop.canHandle(['calculator']),true);assert.equal(loop.canHandle(['web_search']),false);
 const progress=[];const out=await loop.run({candidate:{providerId:'p',modelId:'m'},messages:[{role:'user',content:'calculate both'}],toolIds:['calculator'],onProgress:x=>progress.push(x),budget:{maxRounds:4,maxToolCalls:4,maxParallel:4}});
 assert.equal(out.status,'completed');assert.equal(out.output,'Results 5, 14');assert.equal(calls,2);assert.equal(maxActive,2,'independent read tools should run concurrently');assert.equal(out.budget.used.toolCalls,2);assert.equal(out.budget.used.rounds,2);assert.ok(progress.some(x=>x.stage==='tools'));
 const parsed=T.normalizeOpenAIMessage({choices:[{message:{content:'x',tool_calls:[{id:'a',function:{name:'calculator',arguments:'{"a":1}'}}]}}]});assert.equal(parsed.toolCalls[0].args.a,1);
 console.log('ultimate frontier tool loop: 12 assertions PASS');
})().catch(e=>{console.error(e);process.exit(1)});