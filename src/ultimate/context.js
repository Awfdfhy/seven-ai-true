(function(root,factory){
  const api=factory();if(typeof module==='object'&&module.exports) module.exports=api;if(root) root.SevenUltimateContext=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const check=(v,m)=>{if(!v) throw new Error(m)};
  const words=s=>String(s||'').toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}_-]+/gu)||[];
  const tokenSet=s=>new Set(words(s));
  const estimateTokens=v=>Math.max(1,Math.ceil(JSON.stringify(v??'').length/4));
  const overlap=(a,b)=>{let n=0;for(const x of a) if(b.has(x)) n++;return n;};

  class MemoryRetriever{
    constructor(runtime){check(runtime,'RUNTIME_REQUIRED');this.runtime=runtime;}
    searchCharacter(gameId,campaignId,timelineId,entityId,query,opts={}){
      const limit=Math.max(1,opts.limit||12),budget=Math.max(64,opts.tokenBudget||2400),q=tokenSet(query);
      const g=this.runtime.game(gameId),memories=this.runtime.memories(gameId,campaignId,timelineId,entityId);
      const latestSeq=Math.max(1,...this.runtime.visibleEvents(gameId,campaignId,timelineId).map(e=>e.seq||0));
      const ranked=[];
      for(const m of memories){
        const e=g.events.get(m.sourceEventRef);if(!e) continue;
        const lexical=overlap(q,tokenSet(JSON.stringify({payload:e.payload,type:e.type,interpretation:m.interpretation,beliefAfter:m.beliefAfter})));
        const recency=(e.seq||0)/latestSeq;
        const causal=(e.causeRefs||[]).length?0.15:0;
        const emotion=Math.min(1,Math.abs(Number(m.emotionalWeight||0))/10);
        const score=lexical*2+recency*0.6+emotion*0.8+causal;
        ranked.push({memory:clone(m),event:clone(e),score});
      }
      ranked.sort((a,b)=>b.score-a.score||((b.event.seq||0)-(a.event.seq||0)));
      const out=[];let used=0;
      for(const x of ranked){const cost=estimateTokens(x);if(out.length&&used+cost>budget) continue;out.push(x);used+=cost;if(out.length>=limit) break;}
      return {entityId,query:String(query||''),items:out,estimatedTokens:used,totalCandidates:ranked.length};
    }
    byTime(gameId,campaignId,timelineId,entityId,predicate){
      const g=this.runtime.game(gameId);return this.runtime.memories(gameId,campaignId,timelineId,entityId).map(m=>({memory:m,event:g.events.get(m.sourceEventRef)})).filter(x=>x.event&&predicate(x.event,x.memory)).map(clone);
    }
    causesOf(gameId,campaignId,timelineId,eventRef){
      const g=this.runtime.game(gameId),seen=new Set(),out=[];const walk=ref=>{if(seen.has(ref))return;seen.add(ref);const e=g.events.get(ref);if(!e)return;for(const c of e.causeRefs||[]){const ce=g.events.get(c);if(ce){out.push(clone(ce));walk(c);}}};walk(eventRef);return out;
    }
  }

  class ContextWorkspace{
    constructor(){this.items=new Map();this.order=0;}
    add(input={}){const id=input.id||`ctx_${++this.order}`;check(!this.items.has(id),'CONTEXT_EXISTS');const item={id,category:input.category||'general',content:clone(input.content),sourceRefs:[...(input.sourceRefs||[])],lineage:clone(input.lineage||{}),priority:Number(input.priority||0),pinned:!!input.pinned,compressed:false,original:null};this.items.set(id,item);return clone(item);}
    get(id){const x=this.items.get(id);check(x,'CONTEXT_NOT_FOUND');return x;}
    pin(id,value=true){this.get(id).pinned=!!value;return clone(this.get(id));}
    evict(id){const x=this.get(id);if(x.pinned) throw new Error('CONTEXT_PINNED');this.items.delete(id);return true;}
    compress(id,compressedContent,transform='summary'){const x=this.get(id);if(!x.compressed)x.original=clone(x.content);x.content=clone(compressedContent);x.compressed=true;x.lineage={...x.lineage,transform,sourcePreserved:true};return clone(x);}
    expand(id){const x=this.get(id);check(x.compressed&&x.original!==null,'CONTEXT_NOT_COMPRESSED');x.content=clone(x.original);x.original=null;x.compressed=false;x.lineage={...x.lineage,expanded:true};return clone(x);}
    compile(opts={}){
      const totalBudget=Math.max(128,opts.totalBudget||8000),categoryBudgets={...(opts.categoryBudgets||{})};
      const arr=[...this.items.values()].sort((a,b)=>(Number(b.pinned)-Number(a.pinned))||b.priority-a.priority||a.id.localeCompare(b.id));
      const usedBy={},selected=[];let used=0;
      for(const x of arr){const cost=estimateTokens(x.content),catBudget=categoryBudgets[x.category]??totalBudget,catUsed=usedBy[x.category]||0;if(!x.pinned&&(used+cost>totalBudget||catUsed+cost>catBudget))continue;selected.push(clone(x));used+=cost;usedBy[x.category]=catUsed+cost;}
      return {items:selected,estimatedTokens:used,categoryTokens:usedBy,budget:totalBudget};
    }
  }

  class ActiveContextCache{
    constructor(opts={}){this.ttlMs=opts.ttlMs||300000;this.clock=opts.clock||(()=>Date.now());this.rows=new Map();}
    key(gameId,campaignId,timelineId){return `${gameId}|${campaignId}|${timelineId}`;}
    get(gameId,campaignId,timelineId){const k=this.key(gameId,campaignId,timelineId),r=this.rows.get(k);if(!r)return null;if(this.clock()-r.touchedAt>this.ttlMs){this.rows.delete(k);return null;}r.touchedAt=this.clock();return clone(r.value);}
    set(gameId,campaignId,timelineId,value){this.rows.set(this.key(gameId,campaignId,timelineId),{value:clone(value),touchedAt:this.clock()});return clone(value);}
    patch(gameId,campaignId,timelineId,delta={}){const current=this.get(gameId,campaignId,timelineId)||{};const next={...current,...clone(delta)};return this.set(gameId,campaignId,timelineId,next);}
    invalidateGame(gameId){for(const k of [...this.rows.keys()]) if(k.startsWith(`${gameId}|`))this.rows.delete(k);}
  }

  class LatencyTracker{
    constructor(limit=256){this.limit=limit;this.rows=[];}
    record(input={}){const row={at:Date.now(),uiMs:Number(input.uiMs||0),contextMs:Number(input.contextMs||0),memoryMs:Number(input.memoryMs||0),networkMs:Number(input.networkMs||0),ttftMs:Number(input.ttftMs||0),generationMs:Number(input.generationMs||0),cacheHit:!!input.cacheHit,promptCacheHit:!!input.promptCacheHit};this.rows.push(row);if(this.rows.length>this.limit)this.rows.shift();return clone(row);}
    summary(){if(!this.rows.length)return {count:0};const avg=k=>Math.round(this.rows.reduce((s,r)=>s+r[k],0)/this.rows.length);return {count:this.rows.length,uiMs:avg('uiMs'),contextMs:avg('contextMs'),memoryMs:avg('memoryMs'),networkMs:avg('networkMs'),ttftMs:avg('ttftMs'),generationMs:avg('generationMs'),cacheHitRate:this.rows.filter(x=>x.cacheHit).length/this.rows.length,promptCacheHitRate:this.rows.filter(x=>x.promptCacheHit).length/this.rows.length};}
    bottleneck(){const s=this.summary();if(!s.count)return null;return ['uiMs','contextMs','memoryMs','networkMs','ttftMs','generationMs'].sort((a,b)=>s[b]-s[a])[0];}
  }

  return {estimateTokens,MemoryRetriever,ContextWorkspace,ActiveContextCache,LatencyTracker};
});
