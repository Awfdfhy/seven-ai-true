(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateRequests=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
class RunLedger{
 constructor(){this.runs=new Map();}
 create(id,meta={}){check(id&&!this.runs.has(id),'RUN_EXISTS');const r={id,status:'queued',meta:clone(meta),events:[{type:'created',at:Date.now()}],output:''};this.runs.set(id,r);return clone(r);}
 transition(id,status,data={}){const r=this.runs.get(id);check(r,'RUN_NOT_FOUND');const allowed={queued:['running','cancelled','failed'],running:['completed','cancelled','failed'],completed:[],cancelled:[],failed:[]};check((allowed[r.status]||[]).includes(status),`INVALID_RUN_TRANSITION:${r.status}->${status}`);r.status=status;r.events.push({type:'status',status,at:Date.now(),data:clone(data)});return clone(r);}
 append(id,text){const r=this.runs.get(id);check(r&&r.status==='running','RUN_NOT_ACTIVE');r.output+=String(text);r.events.push({type:'chunk',length:String(text).length,at:Date.now()});return r.output.length;}
 get(id){const r=this.runs.get(id);return r?clone(r):null;}
}
class RequestRuntime{
 constructor(opts={}){this.ledger=opts.ledger||new RunLedger();this.active=new Map();this.defaultTimeoutMs=opts.defaultTimeoutMs||60000;}
 async run(input={}){
  check(input.id&&typeof input.execute==='function','REQUEST_REQUIRED');this.ledger.create(input.id,{providerId:input.providerId||null,modelId:input.modelId||null});const controller=new AbortController(),external=input.signal;let externalAbort;if(external){if(external.aborted)controller.abort(external.reason);else{externalAbort=()=>controller.abort(external.reason);external.addEventListener('abort',externalAbort,{once:true});}}
  const timeoutMs=input.timeoutMs||this.defaultTimeoutMs,timer=setTimeout(()=>controller.abort(new Error('REQUEST_TIMEOUT')),timeoutMs);this.active.set(input.id,{controller,startedAt:Date.now()});this.ledger.transition(input.id,'running');let buffer='',lastFlush=Date.now();const flush=force=>{if(!buffer)return;if(force||Date.now()-lastFlush>=(input.flushIntervalMs||24)){const text=buffer;buffer='';lastFlush=Date.now();if(this.ledger.get(input.id)?.status==='running'){this.ledger.append(input.id,text);if(input.onChunk)input.onChunk(text);}}};
  try{
   const result=await input.execute({signal:controller.signal,request:clone(input.request||{})});
   if(result&&typeof result[Symbol.asyncIterator]==='function')for await(const chunk of result){if(controller.signal.aborted)break;buffer+=typeof chunk==='string'?chunk:(chunk?.text||'');flush(false);}else if(result!=null){buffer+=typeof result==='string'?result:(result.text||'');}
   flush(true);if(controller.signal.aborted)throw controller.signal.reason||new Error('REQUEST_CANCELLED');if(this.ledger.get(input.id)?.status==='running')this.ledger.transition(input.id,'completed',{latencyMs:Date.now()-this.active.get(input.id).startedAt});return this.ledger.get(input.id);
  }catch(err){const r=this.ledger.get(input.id);if(r&&r.status==='running')this.ledger.transition(input.id,controller.signal.aborted?'cancelled':'failed',{message:String(err&&err.message||err)});return this.ledger.get(input.id);
  }finally{clearTimeout(timer);this.active.delete(input.id);if(external&&externalAbort)external.removeEventListener('abort',externalAbort);}
 }
 cancel(id,reason='USER_CANCELLED'){const x=this.active.get(id);if(!x)return false;x.controller.abort(new Error(reason));return true;}
 status(id){return this.ledger.get(id);}
 async prepareParallel(tasks={},opts={}){const entries=Object.entries(tasks);const settled=await Promise.all(entries.map(async([k,fn])=>{try{return[k,{ok:true,value:await fn()}]}catch(error){return[k,{ok:false,error:String(error&&error.message||error)}]}}));const result=Object.fromEntries(settled);for(const k of opts.required||[])check(result[k]?.ok,`PREPARE_REQUIRED_FAILED:${k}`);return result;}
}
return {RunLedger,RequestRuntime};
});
