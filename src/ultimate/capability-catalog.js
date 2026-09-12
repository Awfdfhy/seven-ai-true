(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenCapabilityCatalog=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
const now=()=>Date.now();
const words=s=>String(s||'').toLowerCase().split(/[^a-z0-9_.-]+/).filter(Boolean);

class CapabilitySummaryCodec{
 encode(g={}){return{id:String(g.id),n:String(g.name||g.id),ns:String(g.namespace||String(g.id).split('.')[0]||'general'),c:[...(g.capabilities||[g.id])],t:[...(g.tags||[])],p:String(g.protocol||'local'),net:String(g.network||'optional'),a:String(g.actionClass||'read'),tz:Number.isFinite(g.trustZone)?g.trustZone:4,r:Number(g.reliability??.8),v:String(g.version||'1'),sh:String(g.schemaHash||''),dh:String(g.definitionHash||''),l:Number(g.latency?.p95||0),d:String(g.description||'').slice(0,240)};}
 decode(s={}){return{id:s.id,name:s.n,namespace:s.ns,capabilities:clone(s.c||[]),tags:clone(s.t||[]),protocol:s.p,network:s.net,actionClass:s.a,trustZone:s.tz,reliability:s.r,version:s.v,schemaHash:s.sh,definitionHash:s.dh,latency:{p95:s.l||null},description:s.d||''};}
}

class HotWarmColdCache{
 constructor(input={}){this.hotLimit=Math.max(8,Number(input.hotLimit||64));this.warmLimit=Math.max(this.hotLimit,Number(input.warmLimit||512));this.hot=new Map();this.warm=new Map();this.stats={hotHits:0,warmHits:0,misses:0,evictions:0};}
 _touch(map,key,value){map.delete(key);map.set(key,value);}
 get(id){if(this.hot.has(id)){const v=this.hot.get(id);this._touch(this.hot,id,v);this.stats.hotHits++;return clone(v);}if(this.warm.has(id)){const v=this.warm.get(id);this.warm.delete(id);this._promote(id,v);this.stats.warmHits++;return clone(v);}this.stats.misses++;return null;}
 _promote(id,value){this._touch(this.hot,id,value);while(this.hot.size>this.hotLimit){const k=this.hot.keys().next().value,v=this.hot.get(k);this.hot.delete(k);this._touch(this.warm,k,v);}while(this.warm.size>this.warmLimit){this.warm.delete(this.warm.keys().next().value);this.stats.evictions++;}}
 set(id,value,temperature='hot'){if(temperature==='warm'){this._touch(this.warm,id,clone(value));while(this.warm.size>this.warmLimit){this.warm.delete(this.warm.keys().next().value);this.stats.evictions++;}}else this._promote(id,clone(value));return value;}
 evictCold(){this.warm.clear();}
 pressure(level=0){if(level>=.9){this.warm.clear();while(this.hot.size>Math.max(8,Math.floor(this.hotLimit/4)))this.hot.delete(this.hot.keys().next().value);}else if(level>=.7){while(this.warm.size>Math.floor(this.warmLimit/3))this.warm.delete(this.warm.keys().next().value);}}
 snapshot(){return{hot:this.hot.size,warm:this.warm.size,...this.stats};}
}

class ShardedMetadataCatalog{
 constructor(input={}){this.codec=input.codec||new CapabilitySummaryCodec();this.shardSize=Math.max(128,Number(input.shardSize||4096));this.shards=new Map();this.location=new Map();this.namespaceShards=new Map();this.detailLoader=input.detailLoader||null;this.cache=input.cache||new HotWarmColdCache(input.cacheOptions);this.count=0;}
 _shardKey(summary){const ns=summary.ns||'general';let keys=this.namespaceShards.get(ns);if(!keys){keys=[];this.namespaceShards.set(ns,keys);}let key=keys[keys.length-1],shard=key&&this.shards.get(key);if(!shard||shard.size>=this.shardSize){key=`${ns}:${keys.length}`;keys.push(key);shard=new Map();this.shards.set(key,shard);}return key;}
 add(g){const s=this.codec.encode(g);if(this.location.has(s.id))this.remove(s.id);const key=this._shardKey(s),shard=this.shards.get(key);shard.set(s.id,s);this.location.set(s.id,key);this.count++;return s;}
 remove(id){const key=this.location.get(id);if(!key)return false;this.shards.get(key)?.delete(id);this.location.delete(id);this.count=Math.max(0,this.count-1);return true;}
 summary(id){const key=this.location.get(id),s=key?this.shards.get(key)?.get(id):null;return s?clone(s):null;}
 async detail(id){const hit=this.cache.get(id);if(hit)return hit;if(this.detailLoader){const x=await this.detailLoader(id);if(x){this.cache.set(id,x);return clone(x);}}const s=this.summary(id);if(!s)return null;const x=this.codec.decode(s);this.cache.set(id,x,'warm');return x;}
 *summaries(input={}){const keys=input.namespace?(this.namespaceShards.get(input.namespace)||[]):this.shards.keys();for(const key of keys){const shard=this.shards.get(key);if(!shard)continue;for(const s of shard.values())yield clone(s);}}
 stats(){return{capabilities:this.count,shards:this.shards.size,namespaces:this.namespaceShards.size,cache:this.cache.snapshot(),averageShardSize:this.shards.size?this.count/this.shards.size:0};}
}

class CompactCatalogIndex{
 constructor(){this.postings=new Map();this.docs=new Map();}
 add(summary){const ts=[...new Set(words([summary.id,summary.n,summary.ns,summary.d,...(summary.c||[]),...(summary.t||[])].join(' ')))];this.docs.set(summary.id,{id:summary.id,tokens:ts,ns:summary.ns,p:summary.p,net:summary.net,a:summary.a});for(const t of ts){if(!this.postings.has(t))this.postings.set(t,new Set());this.postings.get(t).add(summary.id);}return this;}
 remove(id){const d=this.docs.get(id);if(!d)return;for(const t of d.tokens){const p=this.postings.get(t);p?.delete(id);if(p&&!p.size)this.postings.delete(t);}this.docs.delete(id);}
 search(query,input={}){const q=[...new Set(words(query))],scores=new Map();for(const t of q)for(const id of this.postings.get(t)||[])scores.set(id,(scores.get(id)||0)+1);const out=[];for(const[id,score]of scores){const d=this.docs.get(id);if(input.namespace&&d.ns!==input.namespace)continue;if(input.allowNetwork===false&&d.net==='required')continue;if(input.protocols?.length&&!input.protocols.includes(d.p))continue;if(input.actionClass&&d.a!==input.actionClass)continue;out.push({id,score});}return out.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,Math.max(1,Number(input.limit||128)));}
 stats(){return{documents:this.docs.size,terms:this.postings.size};}
}

class LazyCatalogGateway{
 constructor(input={}){this.catalog=input.catalog||new ShardedMetadataCatalog(input.catalogOptions);this.index=input.index||new CompactCatalogIndex();this.registry=input.registry||null;this.hydrationLimit=Math.max(1,Number(input.hydrationLimit||24));}
 ingest(genomes=[]){for(const g of genomes){const s=this.catalog.add(g);this.index.add(s);}return genomes.length;}
 ingestRegistry(registry=this.registry){check(registry,'CATALOG_REGISTRY_REQUIRED');return this.ingest(registry.list());}
 search(query,input={}){const ids=this.index.search(query,{...input,limit:input.candidateLimit||128}),rows=[];for(const r of ids){const s=this.catalog.summary(r.id);if(!s)continue;const latencyScore=1/(1+Math.max(0,Number(s.l||0))/250),trust=1-Math.min(1,Math.max(0,Number(s.tz||4)/5)),reliability=Number(s.r??.8),score=.55*(r.score/Math.max(1,words(query).length))+.18*reliability+.12*latencyScore+.1*trust+.05*(s.net==='required'?.7:1);rows.push({id:r.id,score,summary:s});}return rows.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,Math.max(1,Number(input.limit||12)));}
 async hydrate(rows=[],limit=this.hydrationLimit){const out=[];for(const r of rows.slice(0,limit)){let g=null;if(this.registry?.has?.(r.id))g=this.registry.resolve(r.id);else g=await this.catalog.detail(r.id);if(g)out.push({...r,genome:g});}return out;}
 stats(){return{catalog:this.catalog.stats(),index:this.index.stats()};}
}

class CapabilityDemandHeatmap{
 constructor(input={}){this.limit=Math.max(128,Number(input.limit||5000));this.rows=new Map();}
 hit(id,weight=1){const x=this.rows.get(id)||{id,count:0,lastAt:0};x.count+=Number(weight||1);x.lastAt=now();this.rows.set(id,x);if(this.rows.size>this.limit){const cold=[...this.rows.values()].sort((a,b)=>a.lastAt-b.lastAt).slice(0,this.rows.size-this.limit);for(const x of cold)this.rows.delete(x.id);}return clone(x);}
 hottest(limit=32){return[...this.rows.values()].sort((a,b)=>b.count-a.count||b.lastAt-a.lastAt).slice(0,limit).map(clone);}
}

class PredictivePrewarmer{
 constructor(input={}){this.heat=input.heat||new CapabilityDemandHeatmap();this.transition=input.transition||null;this.max=Math.max(1,Number(input.max||4));}
 hints(lastId){const trans=this.transition?.next?.(lastId,this.max)||[],hot=this.heat.hottest(this.max),seen=new Set(),out=[];for(const x of [...trans,...hot])if(x.id&&!seen.has(x.id)){seen.add(x.id);out.push(x.id);if(out.length>=this.max)break;}return out;}
 async prewarm(lastId,loader,input={}){const ids=this.hints(lastId),loaded=[];for(const id of ids){if(Number(input.pressure||0)>=.7)break;try{await loader(id);loaded.push(id);}catch{}}return loaded;}
}

return{CapabilitySummaryCodec,HotWarmColdCache,ShardedMetadataCatalog,CompactCatalogIndex,LazyCatalogGateway,CapabilityDemandHeatmap,PredictivePrewarmer};
});