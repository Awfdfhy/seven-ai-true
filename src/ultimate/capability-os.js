(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenCapabilityOS=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const assert=(v,m)=>{if(!v)throw new Error(m)};
const now=()=>Date.now();
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));
const toks=s=>String(s||'').toLowerCase().split(/[^a-z0-9_.-]+/).filter(Boolean);
const overlap=(a,b)=>{const A=new Set(toks(a)),B=new Set(toks(b));if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.sqrt(A.size*B.size);};
const stable=v=>{if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(stable).join(',')+']';return'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';};
function hash(v){let h=2166136261,s=stable(v);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return('00000000'+(h>>>0).toString(16)).slice(-8);}

const RISK={pure:0,read:.08,write:.42,external_action:.7,irreversible:1};
const STATES=['DISCOVERED','SELECTED','COMPILED','AUTHORIZED','QUEUED','RUNNING','RESULT_RECEIVED','VALIDATED','VERIFIED','COMMITTED'];

class CapabilityGenome{
 static normalize(x={}){assert(x.id,'CAPABILITY_ID_REQUIRED');const actionClass=x.actionClass||'read';return Object.freeze({id:String(x.id),name:String(x.name||x.id),namespace:String(x.namespace||String(x.id).split('.')[0]||'general'),capabilities:[...new Set((x.capabilities||[x.id]).map(String))],description:String(x.description||''),inputSchema:clone(x.inputSchema||x.schema||{type:'object',properties:{},additionalProperties:false}),outputSchema:clone(x.outputSchema||null),preconditions:clone(x.preconditions||[]),postconditions:clone(x.postconditions||[]),actionClass,sideEffects:clone(x.sideEffects||[]),reversible:x.reversible!==false,deterministic:!!x.deterministic,idempotent:x.idempotent!==false,permissions:clone(x.permissions||[]),privacy:String(x.privacy||'private'),network:String(x.network||'optional'),latency:clone(x.latency||{p50:null,p95:null,p99:null}),resources:clone(x.resources||{}),reliability:clamp(x.reliability??.8),freshness:clone(x.freshness||{}),dependencies:clone(x.dependencies||[]),conflicts:clone(x.conflicts||[]),alternatives:clone(x.alternatives||[]),protocol:String(x.protocol||'local'),providerId:String(x.providerId||'seven'),version:String(x.version||'1'),trustZone:Number.isFinite(x.trustZone)?x.trustZone:4,authority:Math.max(0,Number(x.authority||0)),verification:clone(x.verification||[]),failureModes:clone(x.failureModes||[]),cache:clone(x.cache||{}),schemaHash:hash(x.inputSchema||x.schema||{}),implementationHash:String(x.implementationHash||''),tags:[...new Set((x.tags||[]).map(String))],metadata:clone(x.metadata||{})});}
}

class CapabilityRegistry{
 constructor(){this.items=new Map();this.aliases=new Map();this.versions=new Map();}
 register(raw){const g=CapabilityGenome.normalize(raw),old=this.items.get(g.id);if(old&&old.schemaHash!==g.schemaHash)throw new Error('CAPABILITY_SCHEMA_CHANGED_REVIEW_REQUIRED');this.items.set(g.id,g);this.versions.set(`${g.id}@${g.version}`,g);for(const a of raw.aliases||[])this.aliases.set(String(a),g.id);return g;}
 resolve(id){const k=this.aliases.get(id)||id,g=this.items.get(k);assert(g,'CAPABILITY_NOT_FOUND:'+id);return g;}
 list(filter={}){return[...this.items.values()].filter(x=>(!filter.namespace||x.namespace===filter.namespace)&&(!filter.protocol||x.protocol===filter.protocol));}
 manifest(){return this.list().map(x=>({id:x.id,version:x.version,schemaHash:x.schemaHash,implementationHash:x.implementationHash}));}
}

class CapabilityGraph{
 constructor(registry){this.registry=registry;this.edges=new Map();}
 link(from,type,to,meta={}){this.registry.resolve(from);this.registry.resolve(to);const k=String(from);if(!this.edges.has(k))this.edges.set(k,[]);this.edges.get(k).push({from:k,type:String(type),to:String(to),meta:clone(meta)});return this;}
 outgoing(id,type=null){return(this.edges.get(id)||[]).filter(e=>!type||e.type===type).map(clone);}
 closure(ids=[],types=['requires','enables']){const seen=new Set(ids),q=[...ids];while(q.length){const x=q.shift();for(const e of this.outgoing(x)){if(!types.includes(e.type)||seen.has(e.to))continue;seen.add(e.to);q.push(e.to);}}return[...seen];}
 alternatives(id){return this.outgoing(id,'alternative_to').map(x=>x.to);}
}

class OutcomeStore{
 constructor(limit=5000){this.limit=limit;this.rows=[];}
 record(x={}){assert(x.capabilityId&&x.verified===true,'VERIFIED_OUTCOME_REQUIRED');this.rows.push({...clone(x),at:now()});if(this.rows.length>this.limit)this.rows.splice(0,this.rows.length-this.limit);}
 stats(id,workload='*'){const a=this.rows.filter(x=>x.capabilityId===id&&(workload==='*'||x.workload===workload));if(!a.length)return{n:0,success:.5,latency:null};return{n:a.length,success:a.filter(x=>x.success).length/a.length,latency:a.reduce((s,x)=>s+(Number(x.latencyMs)||0),0)/a.length};}
}

class CapabilityDiscovery{
 constructor({registry,graph,outcomes}){this.registry=registry;this.graph=graph;this.outcomes=outcomes;}
 search(query,input={}){const q=String(query||''),limit=Math.max(1,Number(input.limit||8)),allowNetwork=input.allowNetwork!==false,allowedProtocols=new Set(input.protocols||[]);let rows=[];for(const g of this.registry.list()){if(!allowNetwork&&g.network==='required')continue;if(allowedProtocols.size&&!allowedProtocols.has(g.protocol))continue;const text=[g.id,g.name,g.namespace,g.description,...g.capabilities,...g.tags].join(' ');const semantic=overlap(q,text),exact=text.toLowerCase().includes(q.toLowerCase())&&q?1:0,history=this.outcomes?.stats(g.id,input.workload||'*')||{n:0,success:.5};const reliability=history.n?history.success:g.reliability;const latency=Number(g.latency?.p95||history.latency||1000);const latencyScore=1/(1+latency/1000);const trust=1-clamp(g.trustZone/5);const risk=RISK[g.actionClass]??.5;const score=.38*semantic+.15*exact+.18*reliability+.1*latencyScore+.1*trust+.09*(1-risk);if(score>0||input.includeAll)rows.push({id:g.id,score,semantic,reliability,latencyScore,trust,risk,genome:g});}rows.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));return rows.slice(0,limit).map(clone);}
}

class ToolsetCompiler{
 constructor({registry,graph}){this.registry=registry;this.graph=graph;}
 compile(ids=[],input={}){const expanded=input.includeDependencies===false?[...ids]:this.graph.closure(ids,['requires']);const max=Math.max(1,Number(input.maxTools||12)),level=Math.max(0,Math.min(4,Number(input.disclosureLevel??2)));return expanded.slice(0,max).map(id=>{const g=this.registry.resolve(id),base={id:g.id,name:g.name,actionClass:g.actionClass,version:g.version,schemaHash:g.schemaHash};if(level>=1)base.description=g.description;if(level>=2)base.capabilities=clone(g.capabilities);if(level>=3)base.inputSchema=clone(g.inputSchema);if(level>=4){base.outputSchema=clone(g.outputSchema);base.postconditions=clone(g.postconditions);base.verification=clone(g.verification);}return base;});}
}

class PermissionKernel{
 constructor(){this.leases=new Map();}
 grant(input={}){assert(input.capabilityId&&input.scope,'LEASE_FIELDS_REQUIRED');const id=input.id||`lease_${now()}_${Math.random().toString(36).slice(2)}`,lease={id,capabilityId:input.capabilityId,scope:input.scope,expiresAt:input.expiresAt||null,taskId:input.taskId||null,actionClasses:clone(input.actionClasses||['read']),revoked:false};this.leases.set(id,lease);return clone(lease);}
 revoke(id){const x=this.leases.get(id);if(x)x.revoked=true;}
 authorize(g,input={}){if(g.actionClass==='pure')return{ok:true,reason:'PURE'};const t=now(),matches=[...this.leases.values()].filter(x=>!x.revoked&&x.capabilityId===g.id&&(!x.expiresAt||x.expiresAt>t)&&(!x.taskId||x.taskId===input.taskId)&&x.actionClasses.includes(g.actionClass)&&(x.scope==='*'||x.scope===input.scope));return matches.length?{ok:true,leaseId:matches[0].id}:{ok:false,reason:'LEASE_REQUIRED'};}
}

class InformationFlowGuard{
 constructor(){this.rank={public:0,untrusted:1,private:2,project_internal:3,secret:4};}
 canFlow(labels=[],destination={}){const max=Math.max(0,...labels.map(x=>this.rank[x]??2)),allowed=this.rank[destination.maxSensitivity||'private']??2;if(max>allowed)return{ok:false,reason:'SENSITIVITY_FLOW_BLOCKED'};if(labels.includes('untrusted')&&destination.actionClass&&destination.actionClass!=='read'&&destination.actionClass!=='pure')return{ok:false,reason:'UNTRUSTED_TO_SIDE_EFFECT_BLOCKED'};return{ok:true};}
}

class ResultFabric{
 normalize(g,result,input={}){const raw=clone(result),labels=[...new Set(input.labels||[])];return{capabilityId:g.id,raw,projection:input.project?input.project(raw):raw,type:input.type||'StructuredJSON',labels,authority:Math.min(g.authority,Number(input.sourceAuthority??g.authority)),trustZone:g.trustZone,source:{providerId:g.providerId,protocol:g.protocol,version:g.version,schemaHash:g.schemaHash},lineage:clone(input.lineage||[]),receivedAt:now(),validated:false,verified:false};}
 validate(packet){packet.validated=true;return packet;}
 verify(packet,evidence={}){assert(packet.validated,'RESULT_NOT_VALIDATED');packet.verified=evidence.ok===true;packet.verification=clone(evidence);return packet;}
}

class ExecutionLedger{
 constructor(){this.events=[];this.last=new Map();}
 append(callId,state,data={}){if(!STATES.includes(state)&&!['FAILED','CANCELLED','BLOCKED','UNCERTAIN','QUARANTINED'].includes(state))throw new Error('INVALID_CALL_STATE');const prev=this.last.get(callId)||null,row={seq:this.events.length+1,callId,state,prev,at:now(),data:clone(data)};this.events.push(row);this.last.set(callId,state);return clone(row);}
 trace(callId){return this.events.filter(x=>x.callId===callId).map(clone);}
}

class ExactResultCache{
 constructor(limit=512){this.limit=limit;this.map=new Map();}
 key(g,args,scope){return hash({id:g.id,version:g.version,schema:g.schemaHash,args,scope});}
 get(g,args,scope){const k=this.key(g,args,scope),x=this.map.get(k);if(!x)return null;if(x.expiresAt&&x.expiresAt<=now()){this.map.delete(k);return null;}this.map.delete(k);this.map.set(k,x);return clone(x.value);}
 set(g,args,scope,value,ttlMs=0){const k=this.key(g,args,scope);this.map.set(k,{value:clone(value),expiresAt:ttlMs?now()+ttlMs:null});while(this.map.size>this.limit)this.map.delete(this.map.keys().next().value);}
 invalidateCapability(id){for(const[k,v]of this.map)if(v.value?.capabilityId===id)this.map.delete(k);}
}

class Singleflight{
 constructor(){this.running=new Map();}
 async run(key,fn){if(this.running.has(key))return this.running.get(key);const p=Promise.resolve().then(fn).finally(()=>this.running.delete(key));this.running.set(key,p);return p;}
}

class CircuitBreaker{
 constructor(input={}){this.threshold=input.threshold||4;this.cooldownMs=input.cooldownMs||15000;this.rows=new Map();}
 allow(id){const x=this.rows.get(id);if(!x)return true;if(x.openUntil&&x.openUntil>now())return false;if(x.openUntil){x.failures=0;x.openUntil=0;}return true;}
 success(id){this.rows.set(id,{failures:0,openUntil:0});}
 failure(id){const x=this.rows.get(id)||{failures:0,openUntil:0};x.failures++;if(x.failures>=this.threshold)x.openUntil=now()+this.cooldownMs;this.rows.set(id,x);}
}

class ResourceGovernor{
 constructor(input={}){this.maxConcurrent=Math.max(1,Number(input.maxConcurrent||6));this.maxCalls=Math.max(1,Number(input.maxCalls||32));this.active=0;this.calls=0;}
 async enter(fn){assert(this.calls<this.maxCalls,'RESOURCE_CALL_BUDGET');while(this.active>=this.maxConcurrent)await new Promise(r=>setTimeout(r,1));this.calls++;this.active++;try{return await fn();}finally{this.active--;}}
}

class CapabilityRuntime{
 constructor(input={}){for(const k of['registry','executors'])assert(input[k],`RUNTIME_${k.toUpperCase()}_REQUIRED`);this.registry=input.registry;this.executors=input.executors;this.permissions=input.permissions||new PermissionKernel();this.flow=input.flow||new InformationFlowGuard();this.results=input.results||new ResultFabric();this.ledger=input.ledger||new ExecutionLedger();this.cache=input.cache||new ExactResultCache();this.singleflight=input.singleflight||new Singleflight();this.breakers=input.breakers||new CircuitBreaker();this.governor=input.governor||new ResourceGovernor();this.outcomes=input.outcomes||new OutcomeStore();}
 executor(id){return this.executors instanceof Map?this.executors.get(id):this.executors[id];}
 async execute(input={}){const g=this.registry.resolve(input.capabilityId),callId=input.callId||`call_${now()}_${Math.random().toString(36).slice(2)}`,scope=input.scope||'*';this.ledger.append(callId,'DISCOVERED',{capabilityId:g.id});this.ledger.append(callId,'SELECTED');this.ledger.append(callId,'COMPILED',{schemaHash:g.schemaHash});const auth=this.permissions.authorize(g,{scope,taskId:input.taskId});if(!auth.ok){this.ledger.append(callId,'BLOCKED',auth);return{state:'blocked',callId,reason:auth.reason};}this.ledger.append(callId,'AUTHORIZED',auth);const flow=this.flow.canFlow(input.inputLabels||[],{maxSensitivity:input.maxDestinationSensitivity||'private',actionClass:g.actionClass});if(!flow.ok){this.ledger.append(callId,'BLOCKED',flow);return{state:'blocked',callId,reason:flow.reason};}if(!this.breakers.allow(g.id)){this.ledger.append(callId,'BLOCKED',{reason:'CIRCUIT_OPEN'});return{state:'blocked',callId,reason:'CIRCUIT_OPEN'};}const cached=g.actionClass==='pure'||g.actionClass==='read'?this.cache.get(g,input.args||{},scope):null;if(cached){this.ledger.append(callId,'QUEUED',{cache:true});this.ledger.append(callId,'RUNNING',{cache:true});this.ledger.append(callId,'RESULT_RECEIVED',{cache:true});this.ledger.append(callId,'VALIDATED',{cache:true});this.ledger.append(callId,'VERIFIED',{cache:true});this.ledger.append(callId,'COMMITTED',{cache:true});return{state:'success',callId,packet:cached,cacheHit:true};}const ex=this.executor(g.id);if(typeof ex!=='function'){this.ledger.append(callId,'FAILED',{reason:'EXECUTOR_MISSING'});return{state:'failed',callId,reason:'EXECUTOR_MISSING'};}this.ledger.append(callId,'QUEUED');const key=hash({id:g.id,args:input.args||{},scope});const start=now();try{return await this.singleflight.run(key,()=>this.governor.enter(async()=>{if(input.signal?.aborted){this.ledger.append(callId,'CANCELLED');return{state:'cancelled',callId};}this.ledger.append(callId,'RUNNING');const raw=await ex(clone(input.args||{}),{signal:input.signal,scope,taskId:input.taskId});if(input.signal?.aborted){this.ledger.append(callId,'CANCELLED',{lateResult:true});return{state:'cancelled',callId};}this.ledger.append(callId,'RESULT_RECEIVED');let packet=this.results.normalize(g,raw,{labels:input.outputLabels||[],sourceAuthority:input.sourceAuthority,lineage:input.lineage});packet=this.results.validate(packet);this.ledger.append(callId,'VALIDATED');let evidence={ok:true,kind:'schema'};if(typeof input.verify==='function')evidence=await input.verify(clone(packet),g);packet=this.results.verify(packet,evidence);if(!packet.verified){this.breakers.failure(g.id);this.ledger.append(callId,'FAILED',{reason:'VERIFICATION_FAILED'});this.outcomes.record({capabilityId:g.id,workload:input.workload||'*',verified:true,success:false,latencyMs:now()-start});return{state:'failed',callId,reason:'VERIFICATION_FAILED',packet};}this.ledger.append(callId,'VERIFIED',evidence);this.breakers.success(g.id);this.ledger.append(callId,'COMMITTED');const latencyMs=now()-start;this.outcomes.record({capabilityId:g.id,workload:input.workload||'*',verified:true,success:true,latencyMs});if(g.actionClass==='pure'||g.actionClass==='read')this.cache.set(g,input.args||{},scope,packet,Number(g.cache?.ttlMs||0));return{state:'success',callId,packet,latencyMs};}));}catch(error){this.breakers.failure(g.id);this.ledger.append(callId,'FAILED',{message:String(error?.message||error)});this.outcomes.record({capabilityId:g.id,workload:input.workload||'*',verified:true,success:false,latencyMs:now()-start});return{state:'failed',callId,reason:String(error?.message||error)};}}
}

class DependencyScheduler{
 constructor({registry,graph,runtime}){this.registry=registry;this.graph=graph;this.runtime=runtime;}
 async run(nodes=[],input={}){const pending=new Map(nodes.map(n=>[n.id,{...clone(n),dependsOn:[...(n.dependsOn||[])]}])),done=new Map(),failed=new Map();while(pending.size){if(input.signal?.aborted)return{state:'cancelled',done:Object.fromEntries(done),failed:Object.fromEntries(failed)};const ready=[...pending.values()].filter(n=>n.dependsOn.every(x=>done.has(x)));if(!ready.length){for(const[nid,n]of pending)if(n.dependsOn.some(x=>failed.has(x))){failed.set(nid,{state:'blocked',reason:'DEPENDENCY_FAILED'});pending.delete(nid);}if(!pending.size)break;if(![...pending.values()].some(n=>n.dependsOn.every(x=>done.has(x))))throw new Error('EXECUTION_GRAPH_CYCLE_OR_MISSING_DEPENDENCY');continue;}const rows=await Promise.all(ready.map(async n=>[n.id,await this.runtime.execute({...input,...n,capabilityId:n.capabilityId||n.toolId})]));for(const[id,r]of rows){pending.delete(id);if(r.state==='success')done.set(id,r);else failed.set(id,r);}}return{state:failed.size?'partial':'success',done:Object.fromEntries(done),failed:Object.fromEntries(failed)};}
}

class CapabilityOS{
 constructor(input={}){this.registry=input.registry||new CapabilityRegistry();this.graph=input.graph||new CapabilityGraph(this.registry);this.outcomes=input.outcomes||new OutcomeStore();this.permissions=input.permissions||new PermissionKernel();this.executors=input.executors||new Map();this.discovery=new CapabilityDiscovery({registry:this.registry,graph:this.graph,outcomes:this.outcomes});this.compiler=new ToolsetCompiler({registry:this.registry,graph:this.graph});this.runtime=new CapabilityRuntime({registry:this.registry,executors:this.executors,permissions:this.permissions,outcomes:this.outcomes,governor:input.governor});this.scheduler=new DependencyScheduler({registry:this.registry,graph:this.graph,runtime:this.runtime});}
 register(genome,executor=null){const g=this.registry.register(genome);if(executor){if(this.executors instanceof Map)this.executors.set(g.id,executor);else this.executors[g.id]=executor;}return g;}
 discover(q,input={}){return this.discovery.search(q,input);}
 compile(ids,input={}){return this.compiler.compile(ids,input);}
 async execute(input){return this.runtime.execute(input);}
 async executeGraph(nodes,input={}){return this.scheduler.run(nodes,input);}
 snapshot(){return{capabilities:this.registry.list().length,manifest:this.registry.manifest(),outcomes:this.outcomes.rows.length,ledgerEvents:this.runtime.ledger.events.length};}
}

return{CapabilityGenome,CapabilityRegistry,CapabilityGraph,OutcomeStore,CapabilityDiscovery,ToolsetCompiler,PermissionKernel,InformationFlowGuard,ResultFabric,ExecutionLedger,ExactResultCache,Singleflight,CircuitBreaker,ResourceGovernor,CapabilityRuntime,DependencyScheduler,CapabilityOS,hash};
});