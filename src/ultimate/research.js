(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateResearch=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
const host=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch{return''}};
const canonicalUrl=u=>{try{const x=new URL(u);['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'].forEach(k=>x.searchParams.delete(k));x.hash='';return x.toString()}catch{return String(u||'')}};
class EvidenceGraph{
 constructor(){this.sources=new Map();this.claims=new Map();this.edges=[];}
 addSource(input={}){check(input.id&&input.url,'SOURCE_REQUIRED');check(!this.sources.has(input.id),'SOURCE_EXISTS');const s={id:input.id,url:canonicalUrl(input.url),domain:host(input.url),title:input.title||'',publishedAt:input.publishedAt||null,updatedAt:input.updatedAt||null,retrievedAt:input.retrievedAt||new Date().toISOString(),authority:Number(input.authority??.5),directness:Number(input.directness??.5),freshness:Number(input.freshness??.5),independenceRoot:input.independenceRoot||host(input.url),contentType:input.contentType||'web'};this.sources.set(s.id,s);return clone(s);}
 addClaim(input={}){check(input.id&&input.text,'CLAIM_REQUIRED');check(!this.claims.has(input.id),'CLAIM_EXISTS');const c={id:input.id,text:input.text,requiredEvidence:Number(input.requiredEvidence||1),status:'unverified'};this.claims.set(c.id,c);return clone(c);}
 link(input={}){check(this.claims.has(input.claimId),'CLAIM_NOT_FOUND');check(this.sources.has(input.sourceId),'SOURCE_NOT_FOUND');check(['support','contradict','context'].includes(input.relation),'EDGE_RELATION');const e={claimId:input.claimId,sourceId:input.sourceId,relation:input.relation,strength:Number(input.strength??1),passage:input.passage||null};this.edges.push(e);this.recompute(input.claimId);return clone(e);}
 recompute(claimId){const c=this.claims.get(claimId),edges=this.edges.filter(e=>e.claimId===claimId),support=edges.filter(e=>e.relation==='support'),contra=edges.filter(e=>e.relation==='contradict');const roots=new Set(support.map(e=>this.sources.get(e.sourceId)?.independenceRoot).filter(Boolean));if(contra.length&&support.length)c.status='conflicted';else if(roots.size>=c.requiredEvidence)c.status='supported';else if(contra.length)c.status='contradicted';else c.status='unverified';return clone(c);}
 claimView(claimId){const c=this.claims.get(claimId);check(c,'CLAIM_NOT_FOUND');const edges=this.edges.filter(e=>e.claimId===claimId).map(e=>({...clone(e),source:clone(this.sources.get(e.sourceId))}));return {claim:clone(c),edges,independentSupportRoots:new Set(edges.filter(e=>e.relation==='support').map(e=>e.source?.independenceRoot)).size};}
 conflicts(){return [...this.claims.values()].filter(c=>c.status==='conflicted').map(c=>this.claimView(c.id));}
 gaps(){return [...this.claims.values()].filter(c=>!['supported','contradicted'].includes(c.status)).map(c=>({id:c.id,text:c.text,status:c.status,need:c.requiredEvidence-this.claimView(c.id).independentSupportRoots}));}
 citationAudit(){const issues=[];for(const c of this.claims.values()){const view=this.claimView(c.id);if(c.status==='supported'&&!view.edges.some(e=>e.relation==='support'&&e.passage))issues.push({claimId:c.id,issue:'NO_PASSAGE_EVIDENCE'});if(view.edges.some(e=>!e.source))issues.push({claimId:c.id,issue:'MISSING_SOURCE'});}return {pass:issues.length===0,issues};}
}
class QueryPortfolio{
 build(question,input={}){const q=String(question||'').trim();check(q,'QUESTION_REQUIRED');const list=[{kind:'direct',query:q},{kind:'official',query:`${q} official documentation`},{kind:'criticism',query:`${q} limitations criticism`},{kind:'alternative',query:`${q} alternatives comparison`}];if(input.technical)list.push({kind:'technical',query:`${q} technical documentation benchmark`});if(input.historical)list.push({kind:'historical',query:`${q} history archive`});for(const lang of input.languages||[])if(lang&&lang!=='en')list.push({kind:'multilingual',query:`${q} ${lang}`});return list;}
}
class ResearchController{
 constructor(){this.graph=new EvidenceGraph();this.portfolio=new QueryPortfolio();this.wave=0;}
 begin(question,opts={}){this.question=question;this.queries=this.portfolio.build(question,opts);this.wave=0;return {question,queries:clone(this.queries),wave:this.wave};}
 nextWave(){this.wave++;const gaps=this.graph.gaps(),conflicts=this.graph.conflicts();return {wave:this.wave,focus:[...gaps.map(x=>({kind:'gap',claimId:x.id})),...conflicts.map(x=>({kind:'conflict',claimId:x.claim.id}))]};}
 saturation(){const claims=[...this.graph.claims.values()];if(!claims.length)return 0;return claims.filter(c=>c.status==='supported'||c.status==='contradicted').length/claims.length;}
 canStop(threshold=.9){return this.saturation()>=threshold&&this.graph.conflicts().length===0&&this.graph.citationAudit().pass;}
}
return {canonicalUrl,EvidenceGraph,QueryPortfolio,ResearchController};
});
