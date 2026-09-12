(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateInferenceResilience=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
function stable(v){if(v==null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return`[${v.map(stable).join(',')}]`;return`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(',')}}`;}
function hash(text){let h=2166136261;for(const c of String(text)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return(h>>>0).toString(16).padStart(8,'0');}

class CircuitBreaker{
 constructor(input={}){this.threshold=Math.max(1,Number(input.threshold||3));this.cooldownMs=Math.max(100,Number(input.cooldownMs||15000));this.halfOpenSuccesses=Math.max(1,Number(input.halfOpenSuccesses||1));this.rows=new Map();}
 _row(id){if(!this.rows.has(id))this.rows.set(id,{state:'closed',failures:0,halfOpenWins:0,openedAt:0,lastFailure:null});return this.rows.get(id);}
 state(id,now=Date.now()){const r=this._row(id);if(r.state==='open'&&now-r.openedAt>=this.cooldownMs){r.state='half_open';r.halfOpenWins=0;}return r.state;}
 allow(id,now=Date.now()){return this.state(id,now)!=='open';}
 record(id,input={}){const r=this._row(id),success=input.success!==false,now=input.now||Date.now();this.state(id,now);if(success){if(r.state==='half_open'){r.halfOpenWins++;if(r.halfOpenWins>=this.halfOpenSuccesses){r.state='closed';r.failures=0;r.halfOpenWins=0;}}else{r.failures=Math.max(0,r.failures-1);}r.lastFailure=null;}else{r.failures++;r.lastFailure=input.errorClass||input.error||'unknown';if(r.state==='half_open'||r.failures>=this.threshold){r.state='open';r.openedAt=now;r.halfOpenWins=0;}}return this.snapshot(id,now);}
 snapshot(id,now=Date.now()){const r=this._row(id);return{id,state:this.state(id,now),failures:r.failures,openedAt:r.openedAt,lastFailure:r.lastFailure};}
}

class QuotaWindow{
 constructor(input={}){this.windowMs=Math.max(1000,Number(input.windowMs||60000));this.defaultLimits={requests:Number(input.requests||Infinity),tokens:Number(input.tokens||Infinity)};this.rows=new Map();}
 _row(id,now=Date.now()){let r=this.rows.get(id);if(!r||now-r.startedAt>=this.windowMs){r={startedAt:now,requests:0,tokens:0,limits:{...this.defaultLimits}};this.rows.set(id,r);}return r;}
 setLimits(id,limits={}){const r=this._row(id);r.limits={requests:Number(limits.requests??this.defaultLimits.requests),tokens:Number(limits.tokens??this.defaultLimits.tokens)};return clone(r.limits);}
 canUse(id,input={}){const r=this._row(id,input.now),req=Number(input.requests??1),tokens=Number(input.tokens||0);return r.requests+req<=r.limits.requests&&r.tokens+tokens<=r.limits.tokens;}
 consume(id,input={}){const r=this._row(id,input.now),req=Number(input.requests??1),tokens=Number(input.tokens||0);check(this.canUse(id,{requests:req,tokens,now:input.now}),'PROVIDER_QUOTA_WINDOW_EXCEEDED');r.requests+=req;r.tokens+=tokens;return this.snapshot(id,input.now);}
 snapshot(id,now=Date.now()){const r=this._row(id,now);return{id,windowMs:this.windowMs,used:{requests:r.requests,tokens:r.tokens},limits:clone(r.limits),remaining:{requests:Number.isFinite(r.limits.requests)?Math.max(0,r.limits.requests-r.requests):Infinity,tokens:Number.isFinite(r.limits.tokens)?Math.max(0,r.limits.tokens-r.tokens):Infinity}};}
}

class ProviderResilienceController{
 constructor(input={}){this.breakers=input.breakers||new CircuitBreaker(input.circuit||{});this.quotas=input.quotas||new QuotaWindow(input.quota||{});}
 canAttempt(providerId,input={}){return this.breakers.allow(providerId,input.now)&&this.quotas.canUse(providerId,{requests:1,tokens:input.estimatedTokens||0,now:input.now});}
 begin(providerId,input={}){check(this.canAttempt(providerId,input),'PROVIDER_TEMPORARILY_UNAVAILABLE');return this.quotas.consume(providerId,{requests:1,tokens:input.estimatedTokens||0,now:input.now});}
 finish(providerId,input={}){return this.breakers.record(providerId,input);}
 snapshot(providerId){return{circuit:this.breakers.snapshot(providerId),quota:this.quotas.snapshot(providerId)};}
}

class ExactInferenceCache{
 constructor(input={}){this.maxEntries=Math.max(1,Number(input.maxEntries||128));this.defaultTtlMs=Math.max(0,Number(input.ttlMs||300000));this.rows=new Map();}
 key(input={}){check(input.modelId,'CACHE_MODEL_REQUIRED');const body={namespace:input.namespace||'default',modelId:input.modelId,messages:input.messages||null,prompt:input.prompt||null,options:input.options||{},contextRevision:input.contextRevision||null,toolRevision:input.toolRevision||null,promptProgramVersion:input.promptProgramVersion||null};return hash(stable(body));}
 get(key,input={}){const row=this.rows.get(key);if(!row)return null;const now=input.now||Date.now();if(row.expiresAt&&row.expiresAt<=now){this.rows.delete(key);return null;}row.hits++;row.lastHit=now;return clone(row.value);}
 set(key,value,input={}){const now=input.now||Date.now(),ttl=input.ttlMs==null?this.defaultTtlMs:Math.max(0,Number(input.ttlMs));this.rows.set(key,{value:clone(value),createdAt:now,expiresAt:ttl?now+ttl:0,hits:0,lastHit:0});if(this.rows.size>this.maxEntries){const victim=[...this.rows.entries()].sort((a,b)=>(a[1].lastHit||a[1].createdAt)-(b[1].lastHit||b[1].createdAt))[0]?.[0];if(victim)this.rows.delete(victim);}return key;}
 invalidateNamespace(namespace){let n=0;for(const [k,row] of this.rows){if(row.value?.cacheMeta?.namespace===namespace){this.rows.delete(k);n++;}}return n;}
 clear(){this.rows.clear();}
}

class FreshnessPolicy{
 allowCache(input={}){if(input.forceFresh||input.searchRequested||input.hasSideEffects||input.timeSensitive)return{allow:false,reason:'freshness_required'};if(input.authoritativeMutation)return{allow:false,reason:'authoritative_mutation'};if(input.cachePolicy==='off'||input.cachePolicy==null)return{allow:false,reason:'cache_not_requested'};return{allow:true,reason:'exact_cache_allowed',ttlMs:Number(input.cacheTtlMs||300000)};}
}

class AdvancedModelExecutor{
 constructor(input={}){check(input.base&&input.control,'ADVANCED_EXECUTOR_REQUIRED');this.base=input.base;this.control=input.control;this.resilience=input.resilience||new ProviderResilienceController();this.cache=input.cache||new ExactInferenceCache();this.freshness=input.freshness||new FreshnessPolicy();}
 _filteredPlan(plan,input={}){const candidates=(plan.route?.candidates||[]).filter(x=>this.resilience.canAttempt(x.providerId,{estimatedTokens:input.estimatedTokens||0}));check(candidates.length,'NO_RESILIENT_MODEL_ROUTE');const route={...plan.route,selected:candidates[0],candidates};this.control.fallback.build(route);return{...plan,route};}
 async execute(input={}){let plan=input.plan||this.control.plan(input);plan=this._filteredPlan(plan,input);const freshness=this.freshness.allowCache(input),selected=plan.route.selected;let cacheKey=null;if(freshness.allow){cacheKey=this.cache.key({namespace:input.cacheNamespace,modelId:selected.modelId,messages:input.messages,prompt:input.prompt,options:input.options,contextRevision:input.contextRevision,toolRevision:input.toolRevision,promptProgramVersion:input.promptProgramVersion});const hit=this.cache.get(cacheKey);if(hit){if(input.onChunk&&hit.output)input.onChunk(hit.output,{providerId:selected.providerId,modelId:selected.modelId,cacheHit:true});return{status:'completed',plan,selected,attempts:[],run:{id:`cache:${cacheKey}`,status:'completed',output:hit.output,events:[{type:'cache_hit',data:{key:cacheKey},at:Date.now()}]},cache:{hit:true,key:cacheKey}};}}
  for(const c of plan.route.candidates)this.resilience.begin(c.providerId,{estimatedTokens:0});const result=await this.base.execute({...input,plan});for(const a of result.attempts||[])this.resilience.finish(a.providerId,{success:a.status==='completed',errorClass:a.status});if(result.status==='completed'&&freshness.allow&&cacheKey&&result.run?.output!=null)this.cache.set(cacheKey,{output:result.run.output,cacheMeta:{namespace:input.cacheNamespace||'default',modelId:result.selected?.modelId||selected.modelId}}, {ttlMs:freshness.ttlMs});return{...result,cache:{hit:false,key:cacheKey}};
 }
}

return{stable,hash,CircuitBreaker,QuotaWindow,ProviderResilienceController,ExactInferenceCache,FreshnessPolicy,AdvancedModelExecutor};
});