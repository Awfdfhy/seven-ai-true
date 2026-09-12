(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateFrontierToolLoop=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};

class ToolSchemaCompiler{
 constructor(input={}){check(input.fabric&&input.executors,'TOOL_SCHEMA_DEPS_REQUIRED');this.fabric=input.fabric;this.executors=input.executors;}
 executable(toolIds=[]){const rows=[];for(const id of toolIds){let tool;try{tool=this.fabric.resolve(id);}catch{continue;}if(!this.executors.executors?.has(tool.id))continue;rows.push(tool);}return rows;}
 compile(toolIds=[]){return this.executable(toolIds).map(tool=>({type:'function',function:{name:tool.id,description:`Seven tool: ${tool.name}. Category: ${tool.category}.`,parameters:clone(tool.schema||{type:'object',properties:{},additionalProperties:true})}}));}
}

function normalizeOpenAIMessage(payload={}){const msg=payload.choices?.[0]?.message||payload.message||payload;const content=typeof msg.content==='string'?msg.content:Array.isArray(msg.content)?msg.content.map(x=>x?.text||x?.content||'').join(''):String(msg.content||'');const toolCalls=(msg.tool_calls||msg.toolCalls||[]).map((x,i)=>{let args=x.function?.arguments??x.arguments??{};if(typeof args==='string'){try{args=JSON.parse(args||'{}');}catch{args={_parseError:true,_raw:args};}}return{id:x.id||`call_${i+1}`,name:x.function?.name||x.name,args};}).filter(x=>x.name);return{content,toolCalls,raw:payload};}

class StructuredProviderInvoker{
 constructor(input={}){check(input.providers,'STRUCTURED_PROVIDER_POOL_REQUIRED');this.providers=input.providers;}
 async invoke(candidate,input={}){const adapter=this.providers.get(candidate.providerId);check(typeof adapter.chat==='function','STRUCTURED_CHAT_UNSUPPORTED');const json=await adapter.chat({model:candidate.modelId,messages:clone(input.messages||[]),apiKey:input.apiKey,headers:input.headers,options:{...(input.options||{}),tools:clone(input.tools||[]),tool_choice:input.toolChoice||'auto',parallel_tool_calls:input.parallelToolCalls!==false}},{signal:input.signal});return normalizeOpenAIMessage(json);}
}

class ToolLoopBudget{
 constructor(input={}){this.maxRounds=Math.max(1,Number(input.maxRounds||8));this.maxToolCalls=Math.max(1,Number(input.maxToolCalls||24));this.maxParallel=Math.max(1,Number(input.maxParallel||6));this.used={rounds:0,toolCalls:0};}
 round(){check(this.used.rounds<this.maxRounds,'TOOL_LOOP_ROUND_BUDGET');this.used.rounds++;}
 tools(n){check(this.used.toolCalls+n<=this.maxToolCalls,'TOOL_LOOP_CALL_BUDGET');this.used.toolCalls+=n;}
 snapshot(){return{limits:{rounds:this.maxRounds,toolCalls:this.maxToolCalls,parallel:this.maxParallel},used:clone(this.used)};}
}

class ParallelToolScheduler{
 constructor(input={}){check(input.runtime&&input.fabric,'PARALLEL_TOOL_DEPS_REQUIRED');this.runtime=input.runtime;this.fabric=input.fabric;}
 async execute(calls=[],input={}){const safe=[],serial=[];for(const call of calls){const tool=this.fabric.resolve(call.name);const actionClass=tool.actionClass||'read';if(actionClass==='read')safe.push({call,tool});else serial.push({call,tool});}const rows=[];const chunk=Math.max(1,Number(input.maxParallel||6));for(let i=0;i<safe.length;i+=chunk){const batch=safe.slice(i,i+chunk);const out=await Promise.all(batch.map(({call,tool})=>this.runtime.execute({toolId:tool.id,args:call.args,actionClass:tool.actionClass||'read',scope:input.scope||'*',signal:input.signal,idempotencyKey:call.id})));rows.push(...out.map((x,j)=>({callId:batch[j].call.id,name:batch[j].tool.id,...x})));}for(const {call,tool} of serial){const out=await this.runtime.execute({toolId:tool.id,args:call.args,actionClass:tool.actionClass||'read',scope:input.scope||'*',signal:input.signal,idempotencyKey:call.id,sideEffectConfirmed:input.sideEffectConfirmed===true});rows.push({callId:call.id,name:tool.id,...out});}return rows;}
}

class AgenticToolLoop{
 constructor(input={}){for(const k of['fabric','runtime','providers'])check(input[k],`TOOL_LOOP_${k.toUpperCase()}_REQUIRED`);this.fabric=input.fabric;this.runtime=input.runtime;this.providers=input.providers;this.schemas=input.schemas||new ToolSchemaCompiler({fabric:this.fabric,executors:this.runtime.executors});this.invoker=input.invoker||new StructuredProviderInvoker({providers:this.providers});this.scheduler=input.scheduler||new ParallelToolScheduler({runtime:this.runtime,fabric:this.fabric});}
 canHandle(toolIds=[]){return this.schemas.executable(toolIds).length>0;}
 async run(input={}){check(input.candidate?.providerId&&input.candidate?.modelId,'TOOL_LOOP_MODEL_REQUIRED');const requested=(input.toolIds||[]),tools=this.schemas.compile(requested);if(!tools.length)return{handled:false,reason:'NO_EXECUTABLE_TOOLS'};const messages=clone(input.messages||[]),budget=new ToolLoopBudget(input.budget||{}),activity=[],progress=(stage,message,data={})=>{const row={stage,message,state:data.state||'active',at:Date.now(),data:clone(data)};activity.push(row);if(input.onProgress)input.onProgress(clone(row));};progress('tools','Preparing tools',{count:tools.length});let final='';while(budget.used.rounds<budget.maxRounds){budget.round();if(input.signal?.aborted)return{handled:true,status:'cancelled',output:final,messages,activity,budget:budget.snapshot()};const response=await this.invoker.invoke(input.candidate,{messages,tools,toolChoice:'auto',parallelToolCalls:input.parallelToolCalls!==false,apiKey:input.apiKey,headers:input.headers,options:input.options,signal:input.signal});if(!response.toolCalls.length){final=response.content||'';progress('answer','Tool loop complete',{state:'done'});return{handled:true,status:'completed',output:final,messages:[...messages,{role:'assistant',content:final}],activity,budget:budget.snapshot(),raw:response.raw};}budget.tools(response.toolCalls.length);const invalid=response.toolCalls.filter(x=>x.args?._parseError);check(!invalid.length,'TOOL_CALL_ARGUMENT_PARSE_FAILED');messages.push({role:'assistant',content:response.content||'',tool_calls:response.toolCalls.map(x=>({id:x.id,type:'function',function:{name:x.name,arguments:JSON.stringify(x.args||{})}}))});progress('tools',`Running ${response.toolCalls.length} tool call${response.toolCalls.length===1?'':'s'}`,{count:response.toolCalls.length});const results=await this.scheduler.execute(response.toolCalls,{maxParallel:budget.maxParallel,scope:input.scope,signal:input.signal,sideEffectConfirmed:input.sideEffectConfirmed});for(const r of results){messages.push({role:'tool',tool_call_id:r.callId,name:r.name,content:JSON.stringify({state:r.state,result:r.result??null,error:r.error??null,sideEffectUncertainty:r.sideEffectUncertainty??false})});}const failures=results.filter(x=>!['success'].includes(x.state));progress('tools','Tool results returned',{state:failures.length?'warning':'done',failures:failures.length,count:results.length});}
 return{handled:true,status:'incomplete',output:final,messages,activity,budget:budget.snapshot(),reason:'ROUND_BUDGET_EXHAUSTED'};}
}

return{ToolSchemaCompiler,normalizeOpenAIMessage,StructuredProviderInvoker,ToolLoopBudget,ParallelToolScheduler,AgenticToolLoop};
});