(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenProgrammaticTools=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
const now=()=>Date.now();
const get=(obj,path)=>String(path||'').split('.').filter(Boolean).reduce((a,k)=>a==null?undefined:a[k],obj);
const lookup=(ctx,path)=>{const direct=get(ctx,path);return direct===undefined?get(ctx?.steps,path):direct;};
function resolveValue(v,ctx){if(typeof v==='string'){const exact=v.match(/^\$\{([^}]+)\}$/);if(exact)return clone(lookup(ctx,exact[1]));return v.replace(/\$\{([^}]+)\}/g,(_,p)=>{const x=lookup(ctx,p);return x==null?'':typeof x==='string'?x:JSON.stringify(x);});}if(Array.isArray(v))return v.map(x=>resolveValue(x,ctx));if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,resolveValue(x,ctx)]));return v;}

class CognitiveBoundaryDetector{
 decide(input={}){if(input.forceModel===true)return{needsModel:true,reason:'FORCED'};if(input.recipe?.deterministic===true&&input.recipe?.verified===true)return{needsModel:false,reason:'VERIFIED_DETERMINISTIC_RECIPE'};if(input.intent?.kind==='lookup'&&input.knownCapability)return{needsModel:false,reason:'DIRECT_CAPABILITY'};if(input.ambiguity===0&&input.plan?.every?.(x=>x.deterministic))return{needsModel:false,reason:'DETERMINISTIC_PLAN'};return{needsModel:true,reason:'SEMANTIC_REASONING_REQUIRED'};}
}

class RecipeCompiler{
 constructor(input={}){this.registry=input.registry||null;this.maxSteps=Math.max(1,Number(input.maxSteps||64));}
 compile(recipe={}){check(recipe.id&&Array.isArray(recipe.steps),'RECIPE_FIELDS_REQUIRED');check(recipe.steps.length<=this.maxSteps,'RECIPE_STEP_LIMIT');const ids=new Set(),steps=recipe.steps.map((s,i)=>{const id=String(s.id||`step_${i+1}`);check(!ids.has(id),'RECIPE_DUPLICATE_STEP:'+id);ids.add(id);const capabilityId=String(s.capabilityId||s.toolId||'');check(capabilityId,'RECIPE_CAPABILITY_REQUIRED:'+id);if(this.registry)this.registry.resolve(capabilityId);return{id,capabilityId,args:clone(s.args||{}),dependsOn:[...new Set((s.dependsOn||[]).map(String))],when:clone(s.when||null),select:s.select||null,outputType:s.outputType||null,scope:s.scope||null};});for(const s of steps)for(const d of s.dependsOn)check(ids.has(d),'RECIPE_DEPENDENCY_MISSING:'+s.id+':'+d);const visiting=new Set(),done=new Set(),by=new Map(steps.map(x=>[x.id,x])),visit=id=>{if(done.has(id))return;if(visiting.has(id))throw new Error('RECIPE_CYCLE:'+id);visiting.add(id);for(const d of by.get(id).dependsOn)visit(d);visiting.delete(id);done.add(id);};for(const s of steps)visit(s.id);return Object.freeze({id:String(recipe.id),version:String(recipe.version||'1'),deterministic:recipe.deterministic!==false,verified:recipe.verified===true,steps,inputs:clone(recipe.inputs||{}),output:clone(recipe.output||null),createdAt:now()});}
}

class SafeExpressionEngine{
 compare(cond,ctx){if(cond==null)return true;if(typeof cond==='boolean')return cond;if(typeof cond==='string')return !!get(ctx,cond);check(cond&&typeof cond==='object','RECIPE_CONDITION_INVALID');const left=resolveValue(cond.left,ctx),right=resolveValue(cond.right,ctx),op=cond.op||'eq';if(op==='eq')return JSON.stringify(left)===JSON.stringify(right);if(op==='neq')return JSON.stringify(left)!==JSON.stringify(right);if(op==='exists')return left!==undefined&&left!==null;if(op==='truthy')return !!left;if(op==='gt')return Number(left)>Number(right);if(op==='gte')return Number(left)>=Number(right);if(op==='lt')return Number(left)<Number(right);if(op==='lte')return Number(left)<=Number(right);if(op==='includes')return Array.isArray(left)?left.includes(right):String(left||'').includes(String(right||''));throw new Error('RECIPE_CONDITION_OPERATOR:'+op);}
}

class ProgrammaticToolRuntime{
 constructor(input={}){check(input.runtime,'PROGRAMMATIC_RUNTIME_REQUIRED');this.runtime=input.runtime;this.registry=input.registry||null;this.compiler=input.compiler||new RecipeCompiler({registry:this.registry});this.expressions=input.expressions||new SafeExpressionEngine();this.maxParallel=Math.max(1,Number(input.maxParallel||6));}
 async run(recipe,input={}){const r=recipe?.steps?this.compiler.compile(recipe):recipe;check(r?.steps,'COMPILED_RECIPE_REQUIRED');const ctx={input:clone(input.values||{}),steps:{},meta:{recipeId:r.id,startedAt:now()}},pending=new Map(r.steps.map(x=>[x.id,x])),failed={},skipped={},activity=[];let calls=0;while(pending.size){if(input.signal?.aborted)return{state:'cancelled',context:ctx,failed,skipped,activity,calls};for(const[id,s]of[...pending])if(s.dependsOn.some(d=>failed[d]||skipped[d])){failed[id]={state:'blocked',reason:'DEPENDENCY_FAILED'};pending.delete(id);}const ready=[...pending.values()].filter(s=>s.dependsOn.every(d=>ctx.steps[d]));if(!ready.length){if(pending.size)throw new Error('RECIPE_STALLED');break;}for(let i=0;i<ready.length;i+=this.maxParallel){const batch=ready.slice(i,i+this.maxParallel),rows=await Promise.all(batch.map(async s=>{pending.delete(s.id);if(!this.expressions.compare(s.when,ctx)){skipped[s.id]={state:'skipped'};activity.push({stepId:s.id,state:'skipped',at:now()});return[s.id,null,'skipped'];}const args=resolveValue(s.args,ctx);calls++;activity.push({stepId:s.id,capabilityId:s.capabilityId,state:'running',at:now()});const out=await this.runtime.execute({capabilityId:s.capabilityId,args,scope:s.scope||input.scope||'*',taskId:input.taskId,signal:input.signal,inputLabels:input.inputLabels,workload:input.workload});return[s.id,out,'ran'];}));for(const[id,out,kind]of rows){if(kind==='skipped')continue;if(out.state==='success'){const value=out.packet?.projection??out.packet?.raw??out.result??out;ctx.steps[id]={value:clone(value),packet:clone(out.packet||null),state:'success'};activity.push({stepId:id,state:'success',at:now()});}else{failed[id]=clone(out);activity.push({stepId:id,state:'failed',reason:out.reason||out.state,at:now()});}}}}
 ctx.meta.finishedAt=now();const output=r.output?resolveValue(r.output,ctx):clone(ctx.steps);return{state:Object.keys(failed).length?'partial':'success',output,context:ctx,failed,skipped,activity,calls,modelCalls:0};}
}

class ToolMacroLibrary{
 constructor(input={}){this.compiler=input.compiler||new RecipeCompiler();this.rows=new Map();this.stats=new Map();}
 register(recipe){const r=this.compiler.compile(recipe);this.rows.set(r.id,r);return r;}
 get(id){const r=this.rows.get(id);check(r,'MACRO_NOT_FOUND:'+id);return r;}
 record(id,input={}){if(input.verified!==true)return;const s=this.stats.get(id)||{runs:0,successes:0};s.runs++;if(input.success)s.successes++;this.stats.set(id,s);}
 eligible(id,input={}){const s=this.stats.get(id)||{runs:0,successes:0},minRuns=Number(input.minRuns||3),minRate=Number(input.minRate||.95);return{ok:s.runs>=minRuns&&s.successes/Math.max(1,s.runs)>=minRate,stats:clone(s)};}
}

class FastLaneRouter{
 constructor(input={}){this.boundary=input.boundary||new CognitiveBoundaryDetector();this.macros=input.macros||null;this.programmatic=input.programmatic||null;}
 async route(input={}){const decision=this.boundary.decide(input);if(decision.needsModel)return{lane:'smart',decision};if(input.recipe&&this.programmatic){const run=await this.programmatic.run(input.recipe,input.runtimeInput||{});return{lane:'fast',decision,run};}return{lane:'fast',decision,directCapability:input.knownCapability||null};}
}

class BatchCompiler{
 constructor(input={}){this.maxBatch=Math.max(1,Number(input.maxBatch||32));}
 group(calls=[]){const groups=new Map();for(const c of calls){const key=`${c.capabilityId||c.toolId}|${c.scope||'*'}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c);}const out=[];for(const[key,rows]of groups)for(let i=0;i<rows.length;i+=this.maxBatch)out.push({key,calls:rows.slice(i,i+this.maxBatch)});return out;}
}

class IncrementalComputationCache{
 constructor(input={}){this.limit=Math.max(32,Number(input.limit||1024));this.rows=new Map();this.dependencies=new Map();}
 set(key,value,deps=[]){this.rows.set(key,{value:clone(value),at:now()});for(const d of deps){if(!this.dependencies.has(d))this.dependencies.set(d,new Set());this.dependencies.get(d).add(key);}while(this.rows.size>this.limit){const k=this.rows.keys().next().value;this.rows.delete(k);}return value;}
 get(key){return clone(this.rows.get(key)?.value??null);}
 invalidateDependency(dep){const ks=this.dependencies.get(dep)||new Set();for(const k of ks)this.rows.delete(k);this.dependencies.delete(dep);return ks.size;}
}

return{resolveValue,CognitiveBoundaryDetector,RecipeCompiler,SafeExpressionEngine,ProgrammaticToolRuntime,ToolMacroLibrary,FastLaneRouter,BatchCompiler,IncrementalComputationCache};
});