(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenCapabilityObservatory=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
const now=()=>Date.now();
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));
function percentile(values,p){if(!values.length)return null;const a=[...values].sort((x,y)=>x-y),i=Math.min(a.length-1,Math.max(0,Math.ceil(clamp(p)*a.length)-1));return a[i];}

class MetricWindow{
 constructor(limit=512){this.limit=Math.max(16,Number(limit||512));this.rows=[];}
 push(x){this.rows.push({...clone(x),at:x.at||now()});if(this.rows.length>this.limit)this.rows.splice(0,this.rows.length-this.limit);}
 summary(){const a=this.rows,lat=a.map(x=>Number(x.latencyMs)).filter(Number.isFinite),queue=a.map(x=>Number(x.queueMs)).filter(Number.isFinite),ttfr=a.map(x=>Number(x.ttfrMs)).filter(Number.isFinite),success=a.filter(x=>x.success===true).length,verified=a.filter(x=>x.verified===true&&x.success===true).length,bytes=a.reduce((s,x)=>s+(Number(x.bytes)||0),0),tokens=a.reduce((s,x)=>s+(Number(x.tokens)||0),0),retries=a.reduce((s,x)=>s+(Number(x.retries)||0),0),cacheHits=a.filter(x=>x.cacheHit).length;return{n:a.length,successRate:a.length?success/a.length:null,verifiedSuccessRate:a.length?verified/a.length:null,latency:{p50:percentile(lat,.5),p95:percentile(lat,.95),p99:percentile(lat,.99)},queue:{p50:percentile(queue,.5),p95:percentile(queue,.95)},ttfr:{p50:percentile(ttfr,.5),p95:percentile(ttfr,.95)},cacheHitRate:a.length?cacheHits/a.length:null,bytes,tokens,retries,lastAt:a[a.length-1]?.at||null};}
}

class CapabilityObservatory{
 constructor(input={}){this.windowSize=Math.max(16,Number(input.windowSize||512));this.capabilities=new Map();this.providers=new Map();this.events=[];this.eventLimit=Math.max(128,Number(input.eventLimit||5000));}
 _window(map,key){if(!map.has(key))map.set(key,new MetricWindow(this.windowSize));return map.get(key);}
 record(input={}){check(input.capabilityId,'TELEMETRY_CAPABILITY_REQUIRED');const row={capabilityId:String(input.capabilityId),providerId:String(input.providerId||'unknown'),workload:String(input.workload||'*'),success:input.success===true,verified:input.verified===true,latencyMs:Number(input.latencyMs||0),queueMs:Number(input.queueMs||0),ttfrMs:Number(input.ttfrMs||0),bytes:Number(input.bytes||0),tokens:Number(input.tokens||0),retries:Number(input.retries||0),cacheHit:input.cacheHit===true,errorCode:input.errorCode||null,cpuMs:Number(input.cpuMs||0),memoryDelta:Number(input.memoryDelta||0),batteryCost:Number(input.batteryCost||0),networkBytes:Number(input.networkBytes||0),version:input.version||null,at:input.at||now()};this._window(this.capabilities,row.capabilityId).push(row);this._window(this.providers,row.providerId).push(row);this.events.push(row);if(this.events.length>this.eventLimit)this.events.splice(0,this.events.length-this.eventLimit);return clone(row);}
 capability(id){return this.capabilities.get(id)?.summary()||new MetricWindow().summary();}
 provider(id){return this.providers.get(id)?.summary()||new MetricWindow().summary();}
 snapshot(){return{capabilities:Object.fromEntries([...this.capabilities].map(([k,v])=>[k,v.summary()])),providers:Object.fromEntries([...this.providers].map(([k,v])=>[k,v.summary()])),events:this.events.length};}
}

class CapabilitySLOEvaluator{
 constructor(input={}){this.defaults={minVerifiedSuccess:.97,maxP95Ms:null,maxP99Ms:null,maxErrorRate:.03,...(input.defaults||{})};this.overrides=new Map(Object.entries(input.overrides||{}));}
 evaluate(id,summary,override={}){const s={...this.defaults,...(this.overrides.get(id)||{}),...override},checks=[];if(s.minVerifiedSuccess!=null&&summary.verifiedSuccessRate!=null)checks.push({metric:'verifiedSuccessRate',ok:summary.verifiedSuccessRate>=s.minVerifiedSuccess,actual:summary.verifiedSuccessRate,target:s.minVerifiedSuccess});if(s.maxP95Ms!=null&&summary.latency?.p95!=null)checks.push({metric:'p95',ok:summary.latency.p95<=s.maxP95Ms,actual:summary.latency.p95,target:s.maxP95Ms});if(s.maxP99Ms!=null&&summary.latency?.p99!=null)checks.push({metric:'p99',ok:summary.latency.p99<=s.maxP99Ms,actual:summary.latency.p99,target:s.maxP99Ms});if(s.maxErrorRate!=null&&summary.successRate!=null)checks.push({metric:'errorRate',ok:1-summary.successRate<=s.maxErrorRate,actual:1-summary.successRate,target:s.maxErrorRate});return{id,ok:checks.every(x=>x.ok),checks};}
}

class ParetoToolRouter{
 constructor(input={}){this.weights={quality:.3,reliability:.22,verification:.15,latency:.12,memory:.06,network:.04,cost:.04,risk:.07,...(input.weights||{})};}
 score(x={}){const latency=1/(1+Math.max(0,Number(x.latencyMs||0))/250),memory=1/(1+Math.max(0,Number(x.memoryBytes||0))/1e7),network=1/(1+Math.max(0,Number(x.networkBytes||0))/1e6),cost=1/(1+Math.max(0,Number(x.cost||0))),risk=1-clamp(x.risk||0);return this.weights.quality*clamp(x.quality??.5)+this.weights.reliability*clamp(x.reliability??.5)+this.weights.verification*clamp(x.verification??.5)+this.weights.latency*latency+this.weights.memory*memory+this.weights.network*network+this.weights.cost*cost+this.weights.risk*risk;}
 frontier(rows=[]){const dominates=(a,b)=>{const dims=[['quality',1],['reliability',1],['verification',1],['latencyMs',-1],['memoryBytes',-1],['networkBytes',-1],['cost',-1],['risk',-1]];let strict=false;for(const[k,dir]of dims){const av=Number(a[k]??0),bv=Number(b[k]??0);if(dir===1&&av<bv)return false;if(dir===-1&&av>bv)return false;if(av!==bv)strict=true;}return strict;};return rows.filter((x,i)=>!rows.some((y,j)=>i!==j&&dominates(y,x))).map(x=>({...clone(x),utility:this.score(x)})).sort((a,b)=>b.utility-a.utility);}
 rank(rows=[]){return rows.map(x=>({...clone(x),utility:this.score(x)})).sort((a,b)=>b.utility-a.utility);}
}

class ToolArena{
 constructor(input={}){this.router=input.router||new ParetoToolRouter();this.rows=new Map();}
 record(input={}){check(input.capabilityId&&input.workload&&input.verified===true,'ARENA_VERIFIED_RESULT_REQUIRED');const key=`${input.workload}:${input.capabilityId}`,x=this.rows.get(key)||{capabilityId:input.capabilityId,workload:input.workload,runs:0,successes:0,quality:0,latencyMs:0,memoryBytes:0,networkBytes:0,cost:0,risk:Number(input.risk||0),verification:0};x.runs++;x.successes+=input.success?1:0;const n=x.runs;x.quality+=(Number(input.quality??(input.success?1:0))-x.quality)/n;x.latencyMs+=(Number(input.latencyMs||0)-x.latencyMs)/n;x.memoryBytes+=(Number(input.memoryBytes||0)-x.memoryBytes)/n;x.networkBytes+=(Number(input.networkBytes||0)-x.networkBytes)/n;x.cost+=(Number(input.cost||0)-x.cost)/n;x.verification+=(Number(input.verification??1)-x.verification)/n;x.reliability=x.successes/x.runs;this.rows.set(key,x);return clone(x);}
 champions(workload,minRuns=3){const rows=[...this.rows.values()].filter(x=>x.workload===workload&&x.runs>=minRuns);return this.router.rank(rows);}
 pareto(workload,minRuns=3){return this.router.frontier([...this.rows.values()].filter(x=>x.workload===workload&&x.runs>=minRuns));}
}

class TailLatencyOptimizer{
 constructor(input={}){this.minSamples=Math.max(3,Number(input.minSamples||20));this.tailRatio=Math.max(1,Number(input.tailRatio||3));}
 advise(summary={}){if((summary.n||0)<this.minSamples)return{action:'collect_more',reason:'INSUFFICIENT_SAMPLES'};const p50=Number(summary.latency?.p50||0),p99=Number(summary.latency?.p99||0);if(p50>0&&p99/p50>=this.tailRatio)return{action:'enable_selective_hedging',tailRatio:p99/p50};if((summary.queue?.p95||0)>p50)return{action:'reduce_queue_or_increase_safe_parallelism'};return{action:'hold'};}
}

class BenchmarkSuite{
 constructor(){this.cases=[];this.results=[];}
 add(input={}){check(input.id&&typeof input.run==='function','BENCHMARK_CASE_REQUIRED');this.cases.push(input);return this;}
 async run(input={}){const rounds=Math.max(1,Number(input.rounds||1)),out=[];for(const c of this.cases){const times=[];let value;for(let i=0;i<rounds;i++){const t=typeof performance!=='undefined'&&performance.now?performance.now():Date.now();value=await c.run(i);const e=typeof performance!=='undefined'&&performance.now?performance.now():Date.now();times.push(e-t);}const row={id:c.id,rounds,timesMs:times,p50Ms:percentile(times,.5),p95Ms:percentile(times,.95),result:c.project?c.project(value):value};out.push(row);}this.results.push({at:now(),rows:clone(out)});return out;}
 compare(previous,current,input={}){const maxRegression=Number(input.maxRegressionRatio||1.5),rows=[];for(const cur of current){const old=previous.find(x=>x.id===cur.id);if(!old)continue;const ratio=(cur.p95Ms||0)/Math.max(.001,old.p95Ms||.001);rows.push({id:cur.id,ratio,ok:ratio<=maxRegression});}return{ok:rows.every(x=>x.ok),rows};}
}

class CapabilityCoverageMap{
 constructor(){this.demand=new Map();this.supply=new Map();}
 demandCapability(id,n=1){this.demand.set(id,(this.demand.get(id)||0)+Number(n||1));}
 supplyCapability(id,quality={}){if(!this.supply.has(id))this.supply.set(id,[]);this.supply.get(id).push(clone(quality));}
 gaps(){const rows=[];for(const[id,demand]of this.demand){const supply=this.supply.get(id)||[];if(!supply.length)rows.push({capability:id,demand,kind:'missing'});else{const best=Math.max(...supply.map(x=>Number(x.quality??1)*Number(x.availability??1)*Number(x.reliability??1)));if(best<.6)rows.push({capability:id,demand,kind:'weak',best});}}return rows.sort((a,b)=>b.demand-a.demand);}
}

return{percentile,MetricWindow,CapabilityObservatory,CapabilitySLOEvaluator,ParetoToolRouter,ToolArena,TailLatencyOptimizer,BenchmarkSuite,CapabilityCoverageMap};
});