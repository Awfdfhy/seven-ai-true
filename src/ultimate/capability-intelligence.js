(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenCapabilityIntelligence=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));
const words=s=>String(s||'').toLowerCase().split(/[^a-z0-9_.-]+/).filter(Boolean);
const now=()=>Date.now();

class InvertedCapabilityIndex{
 constructor(){this.docs=new Map();this.postings=new Map();this.namespaces=new Map();}
 add(g){const text=[g.id,g.name,g.namespace,g.description,...(g.capabilities||[]),...(g.tags||[])].join(' '),tokens=[...new Set(words(text))];this.docs.set(g.id,{id:g.id,tokens,namespace:g.namespace,protocol:g.protocol,network:g.network,actionClass:g.actionClass,trustZone:g.trustZone,reliability:g.reliability,latency:g.latency||{}});for(const t of tokens){if(!this.postings.has(t))this.postings.set(t,new Set());this.postings.get(t).add(g.id);}if(!this.namespaces.has(g.namespace))this.namespaces.set(g.namespace,new Set());this.namespaces.get(g.namespace).add(g.id);return this;}
 remove(id){const d=this.docs.get(id);if(!d)return;for(const t of d.tokens){const p=this.postings.get(t);if(p){p.delete(id);if(!p.size)this.postings.delete(t);}}this.namespaces.get(d.namespace)?.delete(id);this.docs.delete(id);}
 candidates(query,input={}){const q=[...new Set(words(query))],scores=new Map();for(const t of q){for(const id of this.postings.get(t)||[]){scores.set(id,(scores.get(id)||0)+1);}}let ids=[...scores].sort((a,b)=>b[1]-a[1]).map(x=>x[0]);if(input.namespace)ids=ids.filter(id=>this.docs.get(id)?.namespace===input.namespace);if(input.includeAll&&ids.length<(input.limit||64)){for(const id of this.docs.keys())if(!ids.includes(id))ids.push(id);}return ids.slice(0,Math.max(1,Number(input.limit||64)));}
 stats(){return{documents:this.docs.size,terms:this.postings.size,namespaces:this.namespaces.size};}
}

class CapabilityQueryPlanner{
 constructor(input={}){this.domainHints=input.domainHints||{code:['code','test','repo','file','project','debug','build'],research:['search','web','source','research','citation'],files:['file','folder','document','pdf'],rpg:['canon','character','world','story','timeline'],memory:['memory','remember','context']};}
 plan(query,input={}){const q=words(query),domains=[];for(const[d,terms]of Object.entries(this.domainHints)){let score=0;for(const t of q)if(terms.some(x=>t.includes(x)||x.includes(t)))score++;if(score)domains.push({domain:d,score});}domains.sort((a,b)=>b.score-a.score);return{query:String(query||''),tokens:q,domains:domains.map(x=>x.domain),networkAllowed:input.allowNetwork!==false,actionClass:input.actionClass||null,privacy:input.privacy||null,workload:input.workload||domains[0]?.domain||'*'};}
}

class MultiIndexDiscovery{
 constructor(input={}){check(input.registry,'DISCOVERY_REGISTRY_REQUIRED');this.registry=input.registry;this.outcomes=input.outcomes||null;this.index=input.index||new InvertedCapabilityIndex();this.queryPlanner=input.queryPlanner||new CapabilityQueryPlanner();for(const g of this.registry.list())this.index.add(g);}
 refresh(){this.index=new InvertedCapabilityIndex();for(const g of this.registry.list())this.index.add(g);return this;}
 search(query,input={}){const plan=this.queryPlanner.plan(query,input),candidateIds=this.index.candidates(query,{limit:input.candidateLimit||96,includeAll:input.includeAll});const qSet=new Set(plan.tokens),rows=[];for(const id of candidateIds){let g;try{g=this.registry.resolve(id);}catch{continue;}if(!plan.networkAllowed&&g.network==='required')continue;if(input.protocols?.length&&!input.protocols.includes(g.protocol))continue;if(input.actionClass&&g.actionClass!==input.actionClass)continue;const text=[g.id,g.name,g.namespace,g.description,...g.capabilities,...g.tags].join(' ').toLowerCase(),ts=new Set(words(text));let overlap=0;for(const t of qSet)if(ts.has(t))overlap++;const lexical=qSet.size?overlap/qSet.size:0,domain=plan.domains.includes(g.namespace)||plan.domains.some(d=>g.tags?.includes(d))?1:0,h=this.outcomes?.stats(g.id,plan.workload)||{n:0,success:.5,latency:null},reliability=h.n?h.success:g.reliability,latency=Number(g.latency?.p95||h.latency||1000),latencyScore=1/(1+latency/250),trust=1-clamp(g.trustZone/5),risk={pure:0,read:.08,write:.42,external_action:.7,irreversible:1}[g.actionClass]??.5;const score=.34*lexical+.13*domain+.2*reliability+.1*latencyScore+.12*trust+.11*(1-risk);rows.push({id:g.id,score,signals:{lexical,domain,reliability,latencyScore,trust,risk},genome:g});}rows.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));return{plan,results:rows.slice(0,Math.max(1,Number(input.limit||8)))};}
}

class ToolsetBudgeter{
 constructor(input={}){this.maxTools=Math.max(1,Number(input.maxTools||12));this.maxSchemaBytes=Math.max(256,Number(input.maxSchemaBytes||24000));}
 choose(rows=[],compiler,input={}){const chosen=[],rejected=[];let bytes=0;for(const r of rows){if(chosen.length>=this.maxTools){rejected.push({id:r.id,reason:'TOOL_LIMIT'});continue;}const c=compiler.compile([r.id],{includeDependencies:false,disclosureLevel:input.disclosureLevel??3,maxTools:1})[0];const size=JSON.stringify(c).length;if(bytes+size>this.maxSchemaBytes){rejected.push({id:r.id,reason:'SCHEMA_BUDGET',bytes:size});continue;}chosen.push(c);bytes+=size;}return{tools:chosen,rejected,bytes,budget:{maxTools:this.maxTools,maxSchemaBytes:this.maxSchemaBytes}};}
}

class CapabilityTransitionModel{
 constructor(){this.counts=new Map();}
 record(from,to,verified=true){if(!verified||!from||!to)return;const k=from+'>'+to;this.counts.set(k,(this.counts.get(k)||0)+1);}
 next(from,limit=4){const rows=[];for(const[k,n]of this.counts){const[a,b]=k.split('>');if(a===from)rows.push({id:b,count:n});}return rows.sort((a,b)=>b.count-a.count).slice(0,limit);}
}

class RecipeLibrary{
 constructor(){this.recipes=new Map();}
 register(r={}){check(r.id&&Array.isArray(r.steps),'RECIPE_FIELDS_REQUIRED');const x={id:r.id,version:String(r.version||'1'),steps:clone(r.steps),verifiedRuns:Number(r.verifiedRuns||0),successes:Number(r.successes||0),compiled:!!r.compiled,createdAt:now()};this.recipes.set(x.id,x);return clone(x);}
 outcome(id,success,verified){if(!verified)return;const r=this.recipes.get(id);if(!r)return;r.verifiedRuns++;if(success)r.successes++;}
 best(minRuns=3,minSuccess=.9){return[...this.recipes.values()].filter(r=>r.verifiedRuns>=minRuns&&r.successes/r.verifiedRuns>=minSuccess).map(clone);}
}

class ErrorRecoveryPolicy{
 decide(error={}){const code=String(error.code||error.reason||'BUG');if(['TRANSIENT_NETWORK','TIMEOUT'].includes(code))return{action:'retry_backoff',retry:true};if(code==='RATE_LIMIT')return{action:'alternate_or_backoff',retry:true};if(code==='SCHEMA_DRIFT')return{action:'quarantine_and_repair',retry:false};if(['AUTH_REQUIRED','PERMISSION_DENIED'].includes(code))return{action:'request_authorization',retry:false};if(code==='PROVIDER_DOWN')return{action:'alternate_provider',retry:true};if(code==='CONFLICT')return{action:'refresh_and_rebase',retry:true};if(['PARTIAL_SIDE_EFFECT','SIDE_EFFECT_UNCERTAIN'].includes(code))return{action:'reconcile',retry:false};if(code==='CANCELLED')return{action:'stop',retry:false};return{action:'diagnose',retry:false};}
}

class CapabilityIntelligencePlane{
 constructor(input={}){check(input.os,'CAPABILITY_OS_REQUIRED');this.os=input.os;this.discovery=input.discovery||new MultiIndexDiscovery({registry:this.os.registry,outcomes:this.os.outcomes});this.budgeter=input.budgeter||new ToolsetBudgeter(input.toolsetBudget);this.transitions=input.transitions||new CapabilityTransitionModel();this.recipes=input.recipes||new RecipeLibrary();this.recovery=input.recovery||new ErrorRecoveryPolicy();}
 discover(query,input={}){return this.discovery.search(query,input);}
 compileForTask(query,input={}){const found=this.discover(query,{...input,limit:input.discoveryLimit||24});const selected=this.budgeter.choose(found.results,this.os.compiler,input);return{queryPlan:found.plan,ranked:found.results.map(r=>({id:r.id,score:r.score,signals:r.signals})),...selected};}
 recordSequence(ids=[],verified=true){for(let i=1;i<ids.length;i++)this.transitions.record(ids[i-1],ids[i],verified);}
 prewarmHints(lastCapabilityId){return this.transitions.next(lastCapabilityId);}
}

return{InvertedCapabilityIndex,CapabilityQueryPlanner,MultiIndexDiscovery,ToolsetBudgeter,CapabilityTransitionModel,RecipeLibrary,ErrorRecoveryPolicy,CapabilityIntelligencePlane};
});