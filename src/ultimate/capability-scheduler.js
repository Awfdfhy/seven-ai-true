(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenCapabilityScheduler=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
const now=()=>Date.now();

class AsyncSemaphore{
 constructor(limit=4){this.limit=Math.max(1,Number(limit||4));this.active=0;this.waiters=[];}
 setLimit(n){this.limit=Math.max(1,Number(n||1));this._drain();}
 _drain(){while(this.active<this.limit&&this.waiters.length){this.active++;this.waiters.shift()();}}
 async acquire(signal){if(signal?.aborted)throw signal.reason||new Error('CANCELLED');if(this.active<this.limit){this.active++;return()=>this.release();}return new Promise((resolve,reject)=>{let done=false;const waiter=()=>{if(done)return;done=true;if(signal)signal.removeEventListener?.('abort',onAbort);resolve(()=>this.release());};const onAbort=()=>{if(done)return;done=true;const i=this.waiters.indexOf(waiter);if(i>=0)this.waiters.splice(i,1);reject(signal.reason||new Error('CANCELLED'));};if(signal)signal.addEventListener?.('abort',onAbort,{once:true});this.waiters.push(waiter);});}
 release(){this.active=Math.max(0,this.active-1);this._drain();}
 async run(fn,signal){const release=await this.acquire(signal);try{return await fn();}finally{release();}}
 snapshot(){return{limit:this.limit,active:this.active,queued:this.waiters.length};}
}

class BoundedEventBuffer{
 constructor(input={}){this.limit=Math.max(16,Number(input.limit||1024));this.rows=[];this.spill=input.spill||null;this.spilled=0;}
 async push(row){this.rows.push(clone(row));if(this.rows.length>this.limit){const n=Math.max(1,Math.floor(this.limit*.25)),out=this.rows.splice(0,n);this.spilled+=out.length;if(this.spill)await this.spill(out);}}
 snapshot(){return{rows:this.rows.map(clone),spilled:this.spilled,limit:this.limit};}
}

class AdaptiveConcurrencyPolicy{
 constructor(input={}){this.min=Math.max(1,Number(input.min||1));this.max=Math.max(this.min,Number(input.max||8));this.mobileMax=Math.max(this.min,Number(input.mobileMax||4));}
 decide(input={}){let cap=input.mobile?this.mobileMax:this.max;const mem=Number(input.memoryPressure||0),thermal=Number(input.thermalPressure||0),battery=Number(input.batteryPressure||0),network=Number(input.networkPressure||0),cpu=Number(input.cpuPressure||0),pressure=Math.max(mem,thermal,battery,cpu,network*.7);if(pressure>=.9)cap=this.min;else if(pressure>=.75)cap=Math.min(cap,2);else if(pressure>=.55)cap=Math.min(cap,3);if(input.rateLimitRemaining!=null&&Number(input.rateLimitRemaining)<cap)cap=Math.max(this.min,Number(input.rateLimitRemaining)||this.min);if(input.userMax!=null)cap=Math.min(cap,Math.max(this.min,Number(input.userMax)));return{concurrency:Math.max(this.min,cap),pressure,reason:pressure>=.9?'critical_pressure':pressure>=.75?'high_pressure':pressure>=.55?'moderate_pressure':'normal'};}
}

class ExecutionDAG{
 constructor(nodes=[]){this.nodes=new Map();for(const raw of nodes)this.add(raw);this.validate();}
 add(raw={}){check(raw.id,'DAG_NODE_ID_REQUIRED');check(!this.nodes.has(raw.id),'DAG_DUPLICATE_NODE:'+raw.id);this.nodes.set(raw.id,{...clone(raw),id:String(raw.id),capabilityId:String(raw.capabilityId||raw.toolId||''),dependsOn:[...new Set((raw.dependsOn||[]).map(String))]});return this;}
 validate(){for(const n of this.nodes.values()){check(n.capabilityId,'DAG_CAPABILITY_REQUIRED:'+n.id);for(const d of n.dependsOn)check(this.nodes.has(d),'DAG_MISSING_DEPENDENCY:'+n.id+':'+d);}const visiting=new Set(),done=new Set(),visit=id=>{if(done.has(id))return;if(visiting.has(id))throw new Error('DAG_CYCLE:'+id);visiting.add(id);for(const d of this.nodes.get(id).dependsOn)visit(d);visiting.delete(id);done.add(id);};for(const id of this.nodes.keys())visit(id);return true;}
 dependents(id){const out=[];for(const n of this.nodes.values())if(n.dependsOn.includes(id))out.push(n.id);return out;}
 cloneNodes(){return[...this.nodes.values()].map(clone);}
}

class CriticalPathPlanner{
 constructor(input={}){this.latencyOf=input.latencyOf||(()=>1);}
 rank(dag){const memo=new Map(),walk=id=>{if(memo.has(id))return memo.get(id);const n=dag.nodes.get(id),own=Math.max(1,Number(n.estimatedMs||this.latencyOf(n.capabilityId,n)||1)),deps=dag.dependents(id),score=own+(deps.length?Math.max(...deps.map(walk)):0);memo.set(id,score);return score;};for(const id of dag.nodes.keys())walk(id);return memo;}
 order(ids,rank){return[...ids].sort((a,b)=>(rank.get(b)||0)-(rank.get(a)||0)||String(a).localeCompare(String(b)));}
}

class BulkheadManager{
 constructor(input={}){this.defaultLimit=Math.max(1,Number(input.defaultLimit||4));this.limits=new Map(Object.entries(input.limits||{}).map(([k,v])=>[k,Math.max(1,Number(v))]));this.pools=new Map();}
 pool(key='default'){if(!this.pools.has(key))this.pools.set(key,new AsyncSemaphore(this.limits.get(key)||this.defaultLimit));return this.pools.get(key);}
 run(key,fn,signal){return this.pool(key).run(fn,signal);}
 snapshot(){return Object.fromEntries([...this.pools].map(([k,v])=>[k,v.snapshot()]));}
}

class Watchdog{
 constructor(input={}){this.defaultTimeoutMs=Math.max(50,Number(input.defaultTimeoutMs||30000));}
 async run(fn,input={}){const timeoutMs=Math.max(1,Number(input.timeoutMs||this.defaultTimeoutMs));let timer=null,off=null;const controller=typeof AbortController!=='undefined'?new AbortController():null;if(input.signal&&controller){if(input.signal.aborted)controller.abort(input.signal.reason);else{const f=()=>controller.abort(input.signal.reason);input.signal.addEventListener?.('abort',f,{once:true});off=()=>input.signal.removeEventListener?.('abort',f);}}const work=Promise.resolve().then(()=>fn(controller?.signal||input.signal));const timeout=new Promise(resolve=>{timer=setTimeout(()=>{controller?.abort(new Error('WATCHDOG_TIMEOUT'));resolve({__watchdog:true});},timeoutMs);});try{const out=await Promise.race([work,timeout]);if(out?.__watchdog)throw Object.assign(new Error('WATCHDOG_TIMEOUT'),{code:'TIMEOUT'});return out;}finally{if(timer)clearTimeout(timer);off?.();}}
}

class CrashRecoveryJournal{
 constructor(input={}){this.limit=Math.max(64,Number(input.limit||5000));this.events=[];this.checkpoints=new Map();}
 append(runId,type,data={}){const row={seq:this.events.length+1,runId,type,at:now(),data:clone(data)};this.events.push(row);if(this.events.length>this.limit)this.events.splice(0,this.events.length-this.limit);return clone(row);}
 checkpoint(runId,state){this.checkpoints.set(runId,{runId,state:clone(state),at:now()});this.append(runId,'CHECKPOINT',{done:Object.keys(state.done||{}),failed:Object.keys(state.failed||{})});}
 recover(runId){return clone(this.checkpoints.get(runId)||null);}
 trace(runId){return this.events.filter(x=>x.runId===runId).map(clone);}
}

class HedgedReadExecutor{
 constructor(input={}){this.delayMs=Math.max(1,Number(input.delayMs||80));}
 async run(primary,alternate,input={}){check(typeof primary==='function','HEDGE_PRIMARY_REQUIRED');if(typeof alternate!=='function'||input.allowHedge===false)return primary();let timer;const delayed=new Promise((resolve,reject)=>{timer=setTimeout(()=>Promise.resolve().then(alternate).then(resolve,reject),Math.max(1,Number(input.delayMs||this.delayMs)));});try{return await Promise.any([Promise.resolve().then(primary),delayed]);}finally{if(timer)clearTimeout(timer);}}
}

class AdvancedCapabilityScheduler{
 constructor(input={}){check(input.runtime,'SCHEDULER_RUNTIME_REQUIRED');this.runtime=input.runtime;this.registry=input.registry||null;this.policy=input.policy||new AdaptiveConcurrencyPolicy(input.concurrency);this.bulkheads=input.bulkheads||new BulkheadManager(input.bulkhead);this.watchdog=input.watchdog||new Watchdog(input.watchdogOptions);this.journal=input.journal||new CrashRecoveryJournal();this.hedger=input.hedger||new HedgedReadExecutor();this.maxRepairs=Math.max(0,Number(input.maxRepairs??2));}
 _latency(id){try{return Number(this.registry?.resolve(id)?.latency?.p95||10);}catch{return 10;}}
 _bulkheadKey(node){try{const g=this.registry?.resolve(node.capabilityId);return g?.providerId||g?.namespace||'default';}catch{return'unknown';}}
 async _executeNode(node,input,ctx){const run=async signal=>{const payload={...clone(node),capabilityId:node.capabilityId,signal,scope:node.scope||input.scope||'*',taskId:node.taskId||input.taskId,inputLabels:node.inputLabels||input.inputLabels,workload:node.workload||input.workload,explicitConfirmation:node.explicitConfirmation??input.explicitConfirmation};return this.runtime.execute(payload);};return this.bulkheads.run(this._bulkheadKey(node),()=>this.watchdog.run(run,{timeoutMs:node.timeoutMs||input.timeoutMs,signal:input.signal}),input.signal).catch(error=>({state:input.signal?.aborted?'cancelled':'failed',reason:String(error?.code||error?.message||error),error:String(error?.message||error)}));}
 async run(nodes=[],input={}){const runId=input.runId||`dag_${now()}_${Math.random().toString(36).slice(2)}`,dag=nodes instanceof ExecutionDAG?nodes:new ExecutionDAG(nodes),rank=new CriticalPathPlanner({latencyOf:id=>this._latency(id)}).rank(dag),pending=new Map(dag.cloneNodes().map(n=>[n.id,n])),done=new Map(),failed=new Map(),inFlight=new Map(),repairs=new Map(),buffer=input.eventBuffer||new BoundedEventBuffer({limit:input.eventLimit||1024,spill:input.spillEvents}),emit=async(type,data={})=>{const row={runId,type,at:now(),...clone(data)};await buffer.push(row);this.journal.append(runId,type,data);if(input.onEvent)await input.onEvent(clone(row));};await emit('RUN_STARTED',{nodes:pending.size});const pressure=typeof input.pressure==='function'?input.pressure():input.pressure||{},decision=this.policy.decide({...pressure,userMax:input.maxParallel,mobile:input.mobile}),semaphore=new AsyncSemaphore(decision.concurrency);let cancelled=false;
 const startNode=node=>{const p=semaphore.run(async()=>{if(input.signal?.aborted)return{nodeId:node.id,result:{state:'cancelled',reason:'CANCELLED'}};await emit('NODE_STARTED',{nodeId:node.id,capabilityId:node.capabilityId,criticality:rank.get(node.id)||0});const result=await this._executeNode(node,input,{done,failed});return{nodeId:node.id,result};},input.signal).catch(error=>({nodeId:node.id,result:{state:'failed',reason:String(error?.message||error)}}));inFlight.set(node.id,p);p.finally(()=>inFlight.delete(node.id));};
 while(pending.size||inFlight.size){if(input.signal?.aborted){cancelled=true;for(const[id]of pending)failed.set(id,{state:'cancelled',reason:'CANCELLED'});pending.clear();break;}let progressed=false;for(const[id,node]of [...pending]){if(node.dependsOn.some(d=>failed.has(d))){pending.delete(id);failed.set(id,{state:'blocked',reason:'DEPENDENCY_FAILED'});await emit('NODE_BLOCKED',{nodeId:id,reason:'DEPENDENCY_FAILED'});progressed=true;}}
 const ready=[...pending.values()].filter(n=>n.dependsOn.every(d=>done.has(d))),ordered=new CriticalPathPlanner().order(ready.map(x=>x.id),rank);for(const id of ordered){if(inFlight.size>=decision.concurrency)break;const node=pending.get(id);if(!node)continue;pending.delete(id);startNode(node);progressed=true;}
 if(!inFlight.size){if(pending.size)throw new Error('DAG_STALLED');break;}const settled=await Promise.race([...inFlight.values()]),{nodeId,result}=settled,node=dag.nodes.get(nodeId)||null;if(result.state==='success'){done.set(nodeId,result);await emit('NODE_COMPLETED',{nodeId,latencyMs:result.latencyMs||null});if(input.onPartial)await input.onPartial({nodeId,result:clone(result),done:done.size,total:dag.nodes.size});}else{let repaired=false,count=repairs.get(nodeId)||0;if(count<this.maxRepairs&&typeof input.repair==='function'){const replacement=await input.repair(clone(node),clone(result),{done:Object.fromEntries(done),failed:Object.fromEntries(failed),runId});if(replacement){const r={...clone(node),...clone(replacement),id:nodeId,dependsOn:clone(replacement.dependsOn||node.dependsOn)};pending.set(nodeId,r);repairs.set(nodeId,count+1);await emit('NODE_REPAIRED',{nodeId,attempt:count+1,reason:result.reason||result.state});repaired=true;}}if(!repaired){failed.set(nodeId,result);await emit('NODE_FAILED',{nodeId,state:result.state,reason:result.reason||null});}}
 if((done.size+failed.size)%Math.max(1,Number(input.checkpointEvery||4))===0)this.journal.checkpoint(runId,{done:Object.fromEntries(done),failed:Object.fromEntries(failed),pending:[...pending.keys()]});if(!progressed&&pending.size&&!inFlight.size)throw new Error('DAG_NO_PROGRESS');}
 const state=cancelled?'cancelled':failed.size?'partial':'success',out={state,runId,done:Object.fromEntries(done),failed:Object.fromEntries(failed),repairs:Object.fromEntries(repairs),concurrency:decision,events:buffer.snapshot(),bulkheads:this.bulkheads.snapshot()};this.journal.checkpoint(runId,out);await emit('RUN_FINISHED',{state,done:done.size,failed:failed.size});return out;}
}

return{AsyncSemaphore,BoundedEventBuffer,AdaptiveConcurrencyPolicy,ExecutionDAG,CriticalPathPlanner,BulkheadManager,Watchdog,CrashRecoveryJournal,HedgedReadExecutor,AdvancedCapabilityScheduler};
});