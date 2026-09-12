const assert=require('assert');
const C=require('./src/ultimate/capability-os.js');
const I=require('./src/ultimate/capability-intelligence.js');
const IR=require('./src/ultimate/tool-ir.js');
const Sec=require('./src/ultimate/capability-security.js');
const S=require('./src/ultimate/capability-scheduler.js');
const O=require('./src/ultimate/capability-observatory.js');
const P=require('./src/ultimate/programmatic-tools.js');
const T=require('./src/ultimate/capability-transactions.js');
const CP=require('./src/ultimate/capability-protocols.js');
const Cat=require('./src/ultimate/capability-catalog.js');
const Bridge=require('./src/ultimate/frontier-capability-bridge.js');

(async()=>{
 let assertions=0;const ok=(v,m)=>{assert(v,m);assertions++;},eq=(a,b,m)=>{assert.equal(a,b,m);assertions++;};
 // Schema firewall + Tool IR.
 const fw=new IR.SchemaFirewall({maxDepth:8});eq(fw.inspect({type:'object',properties:{q:{type:'string'}},additionalProperties:false}).ok,true);
 let blockedRef=false;try{fw.inspect({$ref:'https://evil/schema.json'});}catch(e){blockedRef=/EXTERNAL_REF/.test(e.message);}ok(blockedRef,'external schema refs must fail closed');
 const tir=new IR.ToolIR({firewall:fw}),tool=tir.normalize({id:'research.search',description:'search evidence',inputSchema:{type:'object',properties:{q:{type:'string'}},required:['q'],additionalProperties:false},actionClass:'read'});eq(tool.id,'research.search');ok(tool.definitionFingerprint&&tool.schemaFingerprint);
 const compiled=new IR.ProviderSchemaCompiler({ir:tir}).openAI(tool);eq(compiled.function.name,'research.search');
 const lock=new IR.CapabilityLockfile();lock.pin(tool);eq(lock.verify(tool).ok,true);
 const artifacts=new IR.ArtifactRefStore({maxInlineBytes:8});eq(artifacts.maybeExternalize({long:'abcdefghijklmnopqrstuvwxyz'}).inline,false);

 // Security kernel: SHA-256, integrity, vault, flow, leases.
 const digest=await Sec.sha256({a:1});ok(digest.length>=16,'digest expected');
 const integrity=new Sec.DefinitionIntegrityStore();await integrity.pin(tool);eq((await integrity.verify(tool)).ok,true);
 const vault=new Sec.SecretVaultBoundary(),ref=vault.put('secret-token',{scope:'project',providerId:'p'});let vaultBlocked=false;try{vault.resolveForTransport(ref,{scope:'project',providerId:'p'});}catch(e){vaultBlocked=true;}ok(vaultBlocked,'secret only at transport boundary');eq(vault.resolveForTransport(ref,{scope:'project',providerId:'p',transportBoundary:true}),'secret-token');
 const exfil=new Sec.CrossToolExfiltrationGuard();eq(exfil.inspect({labels:['secret'],destination:{network:true,actionClass:'read'}}).ok,false);eq(exfil.inspect({labels:['public'],destination:{network:true,actionClass:'read'}}).ok,true);
 const leases=new Sec.CapabilityLeaseKernel(),lg={id:'x',actionClass:'read'};leases.grant({capabilityId:'x',scope:'p',actionClasses:['read'],ttlMs:5000});eq(leases.authorize(lg,{scope:'p'}).ok,true);

 // Hardened Capability OS: validation, cache, side-effect non-coalescing, lineage.
 const os=new C.CapabilityOS({governor:new C.ResourceGovernor({maxConcurrent:3,maxCalls:100,maxQueue:20})});let reads=0,writes=0;
 os.register({id:'file.read',namespace:'files',description:'read project file',actionClass:'read',deterministic:true,inputSchema:{type:'object',properties:{path:{type:'string'}},required:['path'],additionalProperties:false},outputSchema:{type:'object',properties:{text:{type:'string'}},required:['text'],additionalProperties:false},cache:{ttlMs:5000},latency:{p95:2},trustZone:1},async a=>{reads++;return{text:'data:'+a.path};});
 os.register({id:'file.write',namespace:'files',description:'write project file',actionClass:'write',idempotent:false,reversible:true,inputSchema:{type:'object',properties:{path:{type:'string'}},required:['path'],additionalProperties:false},outputSchema:{type:'object',properties:{ok:{type:'boolean'}},required:['ok'],additionalProperties:false},trustZone:1},async()=>{writes++;await new Promise(r=>setTimeout(r,3));return{ok:true};});
 os.register({id:'bad.output',namespace:'test',description:'bad output',actionClass:'read',inputSchema:{type:'object',properties:{},additionalProperties:false},outputSchema:{type:'object',properties:{ok:{type:'boolean'}},required:['ok'],additionalProperties:false}},async()=>({wrong:true}));
 os.permissions.grant({capabilityId:'file.read',scope:'/p',actionClasses:['read']});os.permissions.grant({capabilityId:'file.write',scope:'/p',actionClasses:['write']});os.permissions.grant({capabilityId:'bad.output',scope:'/p',actionClasses:['read']});
 let invalid=await os.execute({capabilityId:'file.read',args:{path:'a',oops:1},scope:'/p'});eq(invalid.reason,'INVALID_ARGUMENT');
 let r1=await os.execute({capabilityId:'file.read',args:{path:'a'},scope:'/p'});eq(r1.state,'success');ok(r1.packet.verified);let r2=await os.execute({capabilityId:'file.read',args:{path:'a'},scope:'/p'});eq(r2.cacheHit,true);eq(reads,1);
 const wr=await Promise.all([os.execute({capabilityId:'file.write',args:{path:'x'},scope:'/p'}),os.execute({capabilityId:'file.write',args:{path:'x'},scope:'/p'})]);eq(wr.filter(x=>x.state==='success').length,2);eq(writes,2,'side effects must never singleflight');
 let bo=await os.execute({capabilityId:'bad.output',args:{},scope:'/p'});eq(bo.reason,'OUTPUT_SCHEMA_INVALID');

 // Multi-index discovery, bounded context, recipes and fast lane.
 const plane=new I.CapabilityIntelligencePlane({os,toolsetBudget:{maxTools:2,maxSchemaBytes:3000}});let disc=plane.discover('read project file',{limit:3});eq(disc.results[0].id,'file.read');let ts=plane.compileForTask('read project file',{discoveryLimit:3,disclosureLevel:3});ok(ts.tools.length<=2);ok(ts.bytes<=3000);
 const pr=new P.ProgrammaticToolRuntime({runtime:os.runtime,registry:os.registry});const recipe={id:'read_twice',verified:true,deterministic:true,steps:[{id:'a',capabilityId:'file.read',args:{path:'one'}},{id:'b',capabilityId:'file.read',dependsOn:['a'],args:{path:'${a.value.text}'}}],output:{final:'${b.value.text}'}};let po=await pr.run(recipe,{scope:'/p'});eq(po.state,'success');eq(po.modelCalls,0);ok(String(po.output.final).startsWith('data:'));
 const fast=new P.FastLaneRouter({programmatic:pr});eq((await fast.route({recipe,runtimeInput:{scope:'/p'}})).lane,'fast');

 // Scheduler: independent work is never lost, dependency waits, pressure clamps concurrency.
 let active=0,maxActive=0;const so=new C.CapabilityOS({governor:new C.ResourceGovernor({maxConcurrent:8,maxCalls:100})});for(const id of ['a','b','c']){so.register({id:`job.${id}`,namespace:'job',actionClass:'pure',deterministic:true,inputSchema:{type:'object',properties:{},additionalProperties:false},latency:{p95:id==='c'?3:10}},async()=>{active++;maxActive=Math.max(maxActive,active);await new Promise(r=>setTimeout(r,id==='c'?2:8));active--;return{id};});}
 const sch=new S.AdvancedCapabilityScheduler({runtime:so.runtime,registry:so.registry,concurrency:{max:4,mobileMax:3}}),events=[];let sr=await sch.run([{id:'A',capabilityId:'job.a'},{id:'B',capabilityId:'job.b'},{id:'C',capabilityId:'job.c',dependsOn:['A','B']}],{mobile:true,onEvent:e=>events.push(e)});eq(sr.state,'success');eq(Object.keys(sr.done).length,3);ok(maxActive>=2,'parallel branches expected');ok(events.some(e=>e.type==='NODE_COMPLETED'&&e.nodeId==='C'));
 eq(new S.AdaptiveConcurrencyPolicy({max:8,mobileMax:4}).decide({mobile:true,memoryPressure:.95}).concurrency,1);

 // Transactions: commit, dedup and optimistic conflict.
 const tx=new T.TransactionCoordinator({runtime:os.runtime});let tr=await tx.execute({capabilityId:'file.write',args:{path:'z'},scope:'/p',resourceId:'file:z',expectedVersion:0,idempotencyKey:'tx1',postcondition:async p=>({ok:p.raw.ok})});eq(tr.state,'success');eq(tr.version,1);let td=await tx.execute({capabilityId:'file.write',args:{path:'z'},scope:'/p',resourceId:'file:z',idempotencyKey:'tx1'});eq(td.deduplicated,true);let conflict=await tx.execute({capabilityId:'file.write',args:{path:'z'},scope:'/p',resourceId:'file:z',expectedVersion:0,idempotencyKey:'tx2'});eq(conflict.reason,'CONFLICT');

 // Observatory, arena and SLOs.
 const obs=new O.CapabilityObservatory({windowSize:32});for(let i=0;i<10;i++)obs.record({capabilityId:'file.read',providerId:'seven',workload:'files',success:true,verified:true,latencyMs:i+1,cacheHit:i>0});let sm=obs.capability('file.read');eq(sm.n,10);ok(sm.latency.p95>=9);const slo=new O.CapabilitySLOEvaluator({defaults:{minVerifiedSuccess:.9,maxP95Ms:20}});eq(slo.evaluate('file.read',sm).ok,true);
 const arena=new O.ToolArena();for(let i=0;i<4;i++)arena.record({capabilityId:'file.read',workload:'files',verified:true,success:true,quality:.95,latencyMs:2});eq(arena.champions('files').length,1);

 // Modern MCP cache + auth-bound durable tasks.
 let requests=0;const mcp=new CP.MCP20260728Adapter({transport:async req=>{requests++;if(req.method==='tools/list')return{ttlMs:1000,cacheScope:'private',tools:[]};return{ok:true};}});await mcp.listTools();await mcp.listTools();eq(requests,1);const tasks=new CP.DurableTaskLedger(),task=tasks.create({authBinding:'auth'});let authBlocked=false;try{tasks.get(task.id);}catch(e){authBlocked=true;}ok(authBlocked);eq(tasks.get(task.id,{authBinding:'auth'}).id,task.id);tasks.cancel(task.id,{authBinding:'auth'});eq(tasks.acceptResult(task.id,task.generation,{x:1},{authBinding:'auth'}).accepted,false);

 // Lazy catalog basics + hot/warm/cold pressure behavior.
 const catalog=new Cat.ShardedMetadataCatalog({shardSize:128,cacheOptions:{hotLimit:8,warmLimit:16}}),gateway=new Cat.LazyCatalogGateway({catalog});for(let i=0;i<500;i++)gateway.ingest([{id:`cap.${i}`,name:`Capability ${i}`,namespace:i%2?'code':'research',capabilities:[`feature${i%20}`],tags:[i%2?'code':'research'],description:`feature${i%20} operation`,protocol:'local',actionClass:'read',reliability:.9,trustZone:1}]);eq(gateway.stats().catalog.capabilities,500);ok(gateway.search('feature17',{limit:5}).length>0);catalog.cache.pressure(.95);ok(catalog.cache.snapshot().hot<=8);

 // Capability platform migration does not erase legacy executors.
 const {ToolFabric,PermissionLedger}=require('./src/ultimate/tool-fabric.js');const {ToolExecutorRegistry,ToolExecutionRuntime}=require('./src/ultimate/tool-runtime.js');const fabric=new ToolFabric(),perms=new PermissionLedger(),ers=new ToolExecutorRegistry();ers.register('calculator',async a=>({value:Number(a.a||0)+Number(a.b||0)}),{resultSchema:{type:'object',required:['value']}});const legacyRt=new ToolExecutionRuntime({fabric,permissions:perms,executors:ers});ok(legacyRt&&legacyRt.executors===ers);
 const platform=new Bridge.CapabilityPlatform();platform.migrateLegacy(fabric,ers,{grantReadScope:'/chat'});ok(platform.os.registry.has('calculator'));let calc=await platform.os.execute({capabilityId:'calculator',args:{a:2,b:4},scope:'/chat'});eq(calc.state,'success');eq(calc.packet.raw.value,6);

 console.log(`ultimate-capability-mega: ${assertions} assertions PASS`);
})().catch(e=>{console.error(e);process.exit(1);});