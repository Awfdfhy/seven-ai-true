(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateSearch=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));const check=(v,m)=>{if(!v)throw new Error(m)};const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));
function canonicalUrl(url){try{const u=new URL(url);u.hash='';['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'].forEach(k=>u.searchParams.delete(k));u.hostname=u.hostname.toLowerCase();if(u.pathname!=='/'&&u.pathname.endsWith('/'))u.pathname=u.pathname.slice(0,-1);return u.toString();}catch{return String(url||'');}}
class SearchIntentRouter{
 route(input={}){const q=String(input.query||'').toLowerCase(),requested=input.vertical||null;let vertical=requested||'general';if(!requested){if(/paper|study|research|arxiv|doi|بحث|دراسة/.test(q))vertical='scientific';else if(/docs|documentation|api|sdk|manual|توثيق/.test(q))vertical='technical_docs';else if(/github|repository|code|source|كود|مستودع/.test(q))vertical='code';else if(/today|latest|breaking|news|اليوم|احدث|آخر/.test(q))vertical='news';else if(/price|buy|product|سعر|شراء/.test(q))vertical='products';}
 const freshness=input.freshness||((vertical==='news')?'fresh':'balanced');const depth=input.depth||'search';return{vertical,freshness,depth,needOfficial:['technical_docs','scientific'].includes(vertical)||!!input.needOfficial,needContradiction:['deep','forensic'].includes(depth),needHistory:depth==='forensic'||!!input.needHistory};}
}
class SearchWavePlanner{
 build(query,input={}){const intent=input.intent||new SearchIntentRouter().route({query,...input}),base=String(query).trim(),waves=[];waves.push({wave:0,name:'discovery',queries:[base,`${base} overview`,`${base} official`]});if(intent.depth!=='quick')waves.push({wave:1,name:'evidence',queries:[`${base} official documentation`,`${base} evidence`,`${base} technical details`]});if(intent.needContradiction)waves.push({wave:2,name:'verification',queries:[`${base} criticism`,`${base} limitations`,`${base} counter evidence`,`${base} alternatives`]});if(intent.needHistory)waves.push({wave:3,name:'forensic',queries:[`${base} historical`,`${base} archive`,`${base} original source`]});return{intent,waves};}
}
class ResultFusion{
 constructor(){this.records=new Map();}
 add(input={}){check(input.url,'SEARCH_RESULT_URL_REQUIRED');const url=canonicalUrl(input.url),id=input.id||url,existing=this.records.get(url);const record={id,url,title:input.title||existing?.title||url,snippet:input.snippet||existing?.snippet||'',publishedAt:input.publishedAt||existing?.publishedAt||null,updatedAt:input.updatedAt||existing?.updatedAt||null,providers:[...new Set([...(existing?.providers||[]),...(input.providers||[]),...(input.provider?[input.provider]:[])])],rankSignals:[...(existing?.rankSignals||[]),clone(input.rankSignal||{})],contentType:input.contentType||existing?.contentType||'web',language:input.language||existing?.language||null,domain:(()=>{try{return new URL(url).hostname}catch{return''}})()};this.records.set(url,record);return clone(record);}
 list(){return[...this.records.values()].map(clone);}
}
class SourceAuthorityScorer{
 score(source={}){const authority=clamp(source.authority??.5),directness=clamp(source.directness??.5),freshness=clamp(source.freshness??.5),specificity=clamp(source.specificity??.5),independence=clamp(source.independence??.5),evidence=clamp(source.evidence??.5),history=clamp(source.historicalAccuracy??.5);const score=authority*.22+directness*.2+evidence*.18+independence*.15+freshness*.1+specificity*.1+history*.05;return{score:+score.toFixed(4),components:{authority,directness,freshness,specificity,independence,evidence,historicalAccuracy:history}};}
 rank(sources=[]){return sources.map(s=>({...clone(s),authorityScore:this.score(s)})).sort((a,b)=>b.authorityScore.score-a.authorityScore.score);}
}
class EvidenceIndependence{
 group(sources=[]){const groups=new Map();for(const s of sources){const key=s.independenceRoot||s.originalSourceId||s.domain||(()=>{try{return new URL(s.url).hostname}catch{return s.id||'unknown'}})();if(!groups.has(key))groups.set(key,[]);groups.get(key).push(clone(s));}return[...groups.entries()].map(([root,items])=>({root,items,count:items.length}));}
 independentCount(sources=[]){return this.group(sources).length;}
}
class TemporalIntelligence{
 normalize(source={},now=Date.now()){const parse=x=>x?new Date(x).getTime():null,published=parse(source.publishedAt),updated=parse(source.updatedAt),eventDate=parse(source.eventDate),retrieved=parse(source.retrievedAt)||now;const effective=updated||published||eventDate;const ageDays=effective==null?null:Math.max(0,(retrieved-effective)/86400000);return{publishedAt:published,updatedAt:updated,eventDate,retrievedAt:retrieved,ageDays,freshness:ageDays==null?.5:ageDays<=1?1:ageDays<=7?.9:ageDays<=30?.75:ageDays<=365?.5:.25};}
}
class GapDetector{
 analyze(claims=[],sources=[]){const gaps=[];const byClaim=new Map();for(const s of sources){for(const c of s.claimIds||[]){if(!byClaim.has(c))byClaim.set(c,[]);byClaim.get(c).push(s);}}const independence=new EvidenceIndependence();for(const c of claims){const ss=byClaim.get(c.id)||[];const independent=independence.independentCount(ss),required=c.requiredEvidence??1;if(!ss.length)gaps.push({claimId:c.id,type:'NO_EVIDENCE'});else if(independent<required)gaps.push({claimId:c.id,type:'INSUFFICIENT_INDEPENDENCE',have:independent,need:required});if(c.requiresPrimary&&!ss.some(s=>s.primary===true||s.directness>=.9))gaps.push({claimId:c.id,type:'PRIMARY_SOURCE_MISSING'});if(c.freshnessRequired&&!ss.some(s=>(s.freshness??0)>=c.freshnessRequired))gaps.push({claimId:c.id,type:'FRESHNESS_GAP'});}return gaps;}
}
class SearchFabric{
 constructor(){this.router=new SearchIntentRouter();this.planner=new SearchWavePlanner();this.fusion=new ResultFusion();this.authority=new SourceAuthorityScorer();this.temporal=new TemporalIntelligence();this.gaps=new GapDetector();}
 prepare(query,input={}){const intent=this.router.route({query,...input});return this.planner.build(query,{...input,intent});}
 ingest(result={}){const temporal=this.temporal.normalize(result);return this.fusion.add({...result,freshness:result.freshness??temporal.freshness});}
 ranked(){return this.authority.rank(this.fusion.list().map(r=>({...r,authority:r.authority??.5,directness:r.directness??.5,freshness:r.freshness??.5,specificity:r.specificity??.5,independence:r.independence??.5,evidence:r.evidence??.5})));}
}
return{canonicalUrl,SearchIntentRouter,SearchWavePlanner,ResultFusion,SourceAuthorityScorer,EvidenceIndependence,TemporalIntelligence,GapDetector,SearchFabric};
});