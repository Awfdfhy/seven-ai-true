(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimatePerformance=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));const check=(v,m)=>{if(!v)throw new Error(m)};
class LatencyBudget{
 constructor(opts={}){this.targets={uiMs:opts.uiMs??16,contextMs:opts.contextMs??80,retrievalMs:opts.retrievalMs??120,networkMs:opts.networkMs??250,ttftMs:opts.ttftMs??500};this.samples=[];}
 record(sample={}){const s={uiMs:Number(sample.uiMs||0),contextMs:Number(sample.contextMs||0),retrievalMs:Number(sample.retrievalMs||0),networkMs:Number(sample.networkMs||0),ttftMs:Number(sample.ttftMs||0),generationMs:Number(sample.generationMs||0),cacheHit:!!sample.cacheHit,at:Date.now()};this.samples.push(s);if(this.samples.length>500)this.samples.shift();return this.assess(s);}
 assess(s){const over={};for(const k of Object.keys(this.targets))if((s[k]||0)>this.targets[k])over[k]={value:s[k],target:this.targets[k],ratio:+((s[k]||0)/this.targets[k]).toFixed(2)};const bottleneck=Object.entries({...s}).filter(([k,v])=>k.endsWith('Ms')&&typeof v==='number').sort((a,b)=>b[1]-a[1])[0]?.[0]||null;return{healthy:Object.keys(over).length===0,over,bottleneck};}
 summary(){if(!this.samples.length)return{count:0};const keys=['uiMs','contextMs','retrievalMs','networkMs','ttftMs','generationMs'],out={count:this.samples.length,cacheHitRate:this.samples.filter(s=>s.cacheHit).length/this.samples.length};for(const k of keys){const a=this.samples.map(s=>s[k]).sort((x,y)=>x-y);out[k]={avg:Math.round(a.reduce((n,v)=>n+v,0)/a.length),p50:a[Math.floor((a.length-1)*.5)],p95:a[Math.floor((a.length-1)*.95)]};}return out;}
}
class HotWarmColdCache{
 constructor(opts={}){this.hotLimit=opts.hotLimit??8;this.warmLimit=opts.warmLimit??32;this.hot=new Map();this.warm=new Map();this.cold=new Map();}
 set(key,value,tier='hot'){check(['hot','warm','cold'].includes(tier),'CACHE_TIER');this.delete(key);this[tier].set(key,{value:clone(value),touched:Date.now()});this._rebalance();return tier;}
 get(key){for(const tier of['hot','warm','cold']){const row=this[tier].get(key);if(!row)continue;row.touched=Date.now();if(tier==='warm'){this.hot.set(key,row);this.warm.delete(key);this._rebalance();}return clone(row.value);}return null;}
 delete(key){for(const tier of['hot','warm','cold'])this[tier].delete(key);}
 _rebalance(){while(this.hot.size>this.hotLimit){const [k,v]=[...this.hot.entries()].sort((a,b)=>a[1].touched-b[1].touched)[0];this.hot.delete(k);this.warm.set(k,v);}while(this.warm.size>this.warmLimit){const [k,v]=[...this.warm.entries()].sort((a,b)=>a[1].touched-b[1].touched)[0];this.warm.delete(k);this.cold.set(k,v);}}
 stats(){return{hot:this.hot.size,warm:this.warm.size,cold:this.cold.size};}
}
class WorkLaneScheduler{
 constructor(opts={}){this.limits={critical:opts.critical??4,interactive:opts.interactive??4,background:opts.background??2};this.running={critical:0,interactive:0,background:0};this.queues={critical:[],interactive:[],background:[]};}
 enqueue(fn,{lane='interactive',priority=0}={}){check(this.queues[lane]&&typeof fn==='function','WORK_LANE');return new Promise((resolve,reject)=>{this.queues[lane].push({fn,priority,resolve,reject,createdAt:Date.now()});this.queues[lane].sort((a,b)=>b.priority-a.priority||a.createdAt-b.createdAt);this._pump(lane);});}
 _pump(lane){while(this.running[lane]<this.limits[lane]&&this.queues[lane].length){const job=this.queues[lane].shift();this.running[lane]++;Promise.resolve().then(job.fn).then(job.resolve,job.reject).finally(()=>{this.running[lane]--;this._pump(lane);});}}
 snapshot(){return{running:clone(this.running),queued:Object.fromEntries(Object.entries(this.queues).map(([k,v])=>[k,v.length]))};}
}
class StreamBatcher{
 constructor(opts={}){this.intervalMs=opts.intervalMs??24;this.maxChars=opts.maxChars??800;this.buffer='';this.lastFlush=0;}
 push(text,now=Date.now()){this.buffer+=String(text||'');if(this.buffer.length>=this.maxChars||now-this.lastFlush>=this.intervalMs)return this.flush(now);return null;}
 flush(now=Date.now()){if(!this.buffer)return null;const out=this.buffer;this.buffer='';this.lastFlush=now;return out;}
}
class PerformanceController{
 constructor(opts={}){this.mode=opts.mode||'auto';this.budget=new LatencyBudget(opts.budget||{});this.cache=new HotWarmColdCache(opts.cache||{});this.scheduler=new WorkLaneScheduler(opts.scheduler||{});this.device={reducedMotion:false,lowPower:false,thermal:'normal',fps:60};}
 updateDevice(input={}){Object.assign(this.device,clone(input));return this.quality();}
 quality(){if(this.mode!=='auto')return this.mode;if(this.device.reducedMotion)return'minimal';if(this.device.lowPower||this.device.thermal==='hot'||this.device.fps<40)return'light';if(this.device.fps<55)return'balanced';return'full';}
 strategy(){const q=this.quality();return{quality:q,ambient:q==='full',glass:q==='full'?'full':q==='balanced'?'reduced':'static',morph:['full','balanced'].includes(q),virtualize:true,workers:true,streamBatchMs:q==='light'||q==='minimal'?32:20};}
}
return{LatencyBudget,HotWarmColdCache,WorkLaneScheduler,StreamBatcher,PerformanceController};
});