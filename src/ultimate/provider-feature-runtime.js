(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateProviderFeatures=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
const EFFORTS=['low','medium','high','xhigh','max'];
const clampEffort=(value,supported)=>{const set=supported?.length?supported:EFFORTS;if(set.includes(value))return value;const target=Math.max(0,EFFORTS.indexOf(value)),ranked=[...set].sort((a,b)=>Math.abs(EFFORTS.indexOf(a)-target)-Math.abs(EFFORTS.indexOf(b)-target));return ranked[0]||null;};

class ProviderFeatureRegistry{
 constructor(){this.rows=new Map();}
 register(id,input={}){check(id&&!this.rows.has(id),'PROVIDER_FEATURE_PROFILE_EXISTS');const row={id,protocol:input.protocol||'openai_compatible',effort:{supported:[...(input.effort?.supported||[])],path:input.effort?.path||null,map:clone(input.effort?.map||{})},promptCaching:clone(input.promptCaching||{supported:false}),appendOnlyThinking:!!input.appendOnlyThinking,turnScopedSystem:!!input.turnScopedSystem,progressUpdates:clone(input.progressUpdates||{supported:false}),parallelToolCalls:input.parallelToolCalls!==false,structuredOutput:!!input.structuredOutput,maxContext:Number(input.maxContext||0),maxOutput:Number(input.maxOutput||0),metadata:clone(input.metadata||{})};this.rows.set(id,row);return clone(row);}
 upsert(id,input={}){if(this.rows.has(id))this.rows.delete(id);return this.register(id,input);}
 get(id){const x=this.rows.get(id);return x?clone(x):null;}
}

class CanonicalRequestCompiler{
 constructor(input={}){this.features=input.features||new ProviderFeatureRegistry();}
 _setPath(obj,path,value){if(!path||value==null)return;const parts=String(path).split('.');let cur=obj;for(let i=0;i<parts.length-1;i++){const p=parts[i];if(!cur[p]||typeof cur[p]!=='object')cur[p]={};cur=cur[p];}cur[parts[parts.length-1]]=value;}
 compile(providerId,input={}){const p=this.features.get(providerId)||{id:providerId,protocol:'openai_compatible',effort:{supported:[],path:null,map:{}},promptCaching:{supported:false},appendOnlyThinking:false,turnScopedSystem:false,progressUpdates:{supported:false},parallelToolCalls:true,structuredOutput:false,maxContext:0,maxOutput:0},options=clone(input.options||{}),headers=clone(input.headers||{}),notes=[];if(input.effort){const effort=clampEffort(input.effort,p.effort?.supported||[]),mapped=p.effort?.map?.[effort]??effort;if(p.effort?.path)this._setPath(options,p.effort.path,mapped);else notes.push({code:'EFFORT_NOT_NATIVE',effort});}
 if(input.parallelToolCalls&&p.parallelToolCalls!==false&&options.parallel_tool_calls==null&&p.protocol==='openai_compatible')options.parallel_tool_calls=true;
 if(input.progressUpdates&&p.progressUpdates?.supported){if(p.progressUpdates.optionPath)this._setPath(options,p.progressUpdates.optionPath,p.progressUpdates.value??true);if(p.progressUpdates.header)headers[p.progressUpdates.header]=p.progressUpdates.headerValue||'1';}
 if(input.cacheStablePrefix&&p.promptCaching?.supported){if(p.promptCaching.mode==='option'&&p.promptCaching.optionPath)this._setPath(options,p.promptCaching.optionPath,p.promptCaching.value??true);else notes.push({code:'CACHE_CONTROL_REQUIRES_MESSAGE_ANNOTATION'});}
 if(input.maxOutputTokens&&p.maxOutput&&input.maxOutputTokens>p.maxOutput)options.max_tokens=p.maxOutput;else if(input.maxOutputTokens&&options.max_tokens==null)options.max_tokens=input.maxOutputTokens;
 return{providerId,options,headers,capabilities:{appendOnlyThinking:!!p.appendOnlyThinking,turnScopedSystem:!!p.turnScopedSystem,progressUpdates:!!p.progressUpdates?.supported,promptCaching:!!p.promptCaching?.supported,parallelToolCalls:p.parallelToolCalls!==false,structuredOutput:!!p.structuredOutput,maxContext:p.maxContext,maxOutput:p.maxOutput},notes,authority:'derived_provider_request'};}
}

class ConversationCompatibilityGuard{
 validate(profile,input={}){const issues=[];if(profile?.appendOnlyThinking&&input.historyMutated)issues.push('APPEND_ONLY_HISTORY_REQUIRED');if(input.contextTokens&&profile?.maxContext&&input.contextTokens>profile.maxContext)issues.push('CONTEXT_LIMIT_EXCEEDED');if(input.maxOutputTokens&&profile?.maxOutput&&input.maxOutputTokens>profile.maxOutput)issues.push('OUTPUT_LIMIT_EXCEEDED');return{pass:issues.length===0,issues};}
}

function registerReferenceProfiles(registry){registry.upsert('anthropic-fable',{protocol:'anthropic',effort:{supported:EFFORTS,path:'output_config.effort'},promptCaching:{supported:true,mode:'message_annotation'},appendOnlyThinking:true,turnScopedSystem:true,progressUpdates:{supported:true,optionPath:'thinking.display',value:'updates'},parallelToolCalls:true,structuredOutput:true,maxContext:1000000,maxOutput:128000});registry.upsert('openai-reasoning',{protocol:'openai_compatible',effort:{supported:['low','medium','high'],path:'reasoning_effort'},promptCaching:{supported:false},parallelToolCalls:true,structuredOutput:true});registry.upsert('generic-openai',{protocol:'openai_compatible',effort:{supported:[],path:null},promptCaching:{supported:false},parallelToolCalls:true,structuredOutput:false});return registry;}

return{EFFORTS,clampEffort,ProviderFeatureRegistry,CanonicalRequestCompiler,ConversationCompatibilityGuard,registerReferenceProfiles};
});