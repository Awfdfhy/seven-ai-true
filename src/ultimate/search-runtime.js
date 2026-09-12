(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateSearchRuntime=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));const check=(v,m)=>{if(!v)throw new Error(m)};
class SearchProviderRegistry{
 constructor(){this.providers=new Map();}
 register(input={}){check(input.id&&typeof input.search==='function','SEARCH_PROVIDER_REQUIRED');check(!this.providers.has(input.id),'SEARCH_PROVIDER_EXISTS');const p={id:input.id,verticals:[...(input.verticals||['general'])],freeProof:input.freeProof||'unknown',local:!!input.local,priority:Number(input.priority||0),health:input.health||'healthy',search:input.search,requests:0,failures:0,cooldownUntil:0};this.providers.set(p.id,p);return p.id;}
 candidates(vertical='general',{freeOnly=true,now=Date.now()}={}){return[...this.providers.values()].filter(p=>p.health!=='down'&&p.cooldownUntil<=now&&(p.verticals.includes(vertical)||p.verticals.includes('general'))&&(!freeOnly||p.local||['verified_free','free_quota'].includes(p.freeProof))).sort((a,b)=>b.priority-a.priority||a.failures-b.failures);}
 success(id){const p=this.providers.get(id);check(p,'SEARCH_PROVIDER_NOT_FOUND');p.requests++;p.failures=Math.max(0,p.failures-1);p.health='healthy';}
 failure(id,error,opts={}){const p=this.providers.get(id);check(p,'SEARCH_PROVIDER_NOT_FOUND');p.requests++;p.failures++;if(opts.retryAfterMs)p.cooldownUntil=Date.now()+opts.retryAfterMs;if(p.failures>=3)p.health='degraded';if(p.failures>=6)p.health='down';p.lastError=String(error&&error.message||error);}
}
class SearchCache{
 constructor(opts={}){this.ttlMs=opts.ttlMs??300000;this.rows=new Map();}
 key(providerId,query,vertical){return`${providerId}|${vertical}|${String(query).trim().toLowerCase()}`;}
 get(providerId,query,vertical){const k=this.key(providerId,query,vertical),r=this.rows.get(k);if(!r)return null;if(Date.now()-r.at>this.ttlMs){this.rows.delete(k);return null;}return clone(r.value);}
 set(providerId,query,vertical,value){this.rows.set(this.key(providerId,query,vertical),{at:Date.now(),value:clone(value)});return value;}
}
class SearchRuntime{
 constructor(opts={}){check(opts.fabric,'SEARCH_FABRIC_REQUIRED');this.fabric=opts.fabric;this.providers=opts.providers||new SearchProviderRegistry();this.cache=opts.cache||new SearchCache();this.maxProvidersPerQuery=opts.maxProvidersPerQuery??2;}
 async query(query,input={}){const intent=input.intent||this.fabric.router.route({query,...input}),providers=this.providers.candidates(intent.vertical,{freeOnly:input.freeOnly!==false}),selected=providers.slice(0,input.maxProviders||this.maxProvidersPerQuery);check(selected.length,'SEARCH_PROVIDER_UNAVAILABLE');const runs=await Promise.all(selected.map(async p=>{const cached=this.cache.get(p.id,query,intent.vertical);if(cached)return{providerId:p.id,cached:true,results:cached};try{const raw=await p.search(query,{signal:input.signal,intent:clone(intent),limit:input.limit||10});const results=Array.isArray(raw)?raw:(raw?.results||[]);this.cache.set(p.id,query,intent.vertical,results);this.providers.success(p.id);return{providerId:p.id,cached:false,results};}catch(error){this.providers.failure(p.id,error,{retryAfterMs:error?.retryAfterMs});return{providerId:p.id,error:String(error&&error.message||error),results:[]};}}));for(const run of runs)for(const result of run.results)this.fabric.ingest({...result,provider:run.providerId});return{query,intent,runs,results:this.fabric.ranked()};}
 async execute(question,input={}){const plan=this.fabric.prepare(question,input),waves=[];let totalQueries=0;for(const wave of plan.waves){if(input.signal?.aborted)break;const maxQueries=input.maxQueriesPerWave??3,queries=wave.queries.slice(0,maxQueries);const results=await Promise.all(queries.map(q=>this.query(q,{...input,intent:plan.intent}).catch(error=>({query:q,error:String(error&&error.message||error),results:[]}))));totalQueries+=queries.length;waves.push({wave:wave.wave,name:wave.name,queries:results});if(input.stopWhen&&input.stopWhen({wave:wave.wave,results:this.fabric.ranked()}))break;}return{question,plan,waves,totalQueries,results:this.fabric.ranked()};}
}
return{SearchProviderRegistry,SearchCache,SearchRuntime};
});