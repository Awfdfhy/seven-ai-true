(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateIntelligenceOptimizer=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));

class ParetoFrontier{
 constructor(){this.rows=[];}
 add(input={}){check(input.id,'PARETO_ID_REQUIRED');const row={id:input.id,quality:clamp(input.quality??0),latencyMs:Number(input.latencyMs||0),tokens:Number(input.tokens||0),cost:Number(input.cost||0),payload:clone(input.payload||{})};this.rows=this.rows.filter(x=>x.id!==row.id);this.rows.push(row);return clone(row);}
 frontier(){return this.rows.filter(a=>!this.rows.some(b=>b.id!==a.id&&b.quality>=a.quality&&b.latencyMs<=a.latencyMs&&b.tokens<=a.tokens&&b.cost<=a.cost&&(b.quality>a.quality||b.latencyMs<a.latencyMs||b.tokens<a.tokens||b.cost<a.cost))).sort((a,b)=>b.quality-a.quality||a.latencyMs-b.latencyMs).map(clone);}
}

class ReflectivePromptProgramOptimizer{
 constructor(input={}){this.variants=new Map();this.history=[];this.frontier=new ParetoFrontier();this.maxVariants=Math.max(4,Number(input.maxVariants||24));}
 add(input={}){check(input.id&&!this.variants.has(input.id),'PROMPT_PROGRAM_ID_REQUIRED');const row={id:input.id,parentIds:[...(input.parentIds||[])],program:clone(input.program||{}),status:input.status||'candidate',generation:Number(input.generation||0),lessons:[...(input.lessons||[])],report:null};this.variants.set(row.id,row);return clone(row);}
 evaluate(id,input={}){const row=this.variants.get(id);check(row,'PROMPT_PROGRAM_NOT_FOUND');check(input.verified===true,'PROMPT_EVAL_MUST_BE_VERIFIED');row.report={quality:clamp(input.quality??0),latencyMs:Number(input.latencyMs||0),tokens:Number(input.tokens||0),cost:Number(input.cost||0),failures:clone(input.failures||[]),verified:true};this.frontier.add({id,quality:row.report.quality,latencyMs:row.report.latencyMs,tokens:row.report.tokens,cost:row.report.cost,payload:{generation:row.generation}});this.history.push({id,report:clone(row.report),at:Date.now()});return clone(row.report);}
 lessons(input={}){const rows=(input.variantIds||[...this.variants.keys()]).map(id=>this.variants.get(id)).filter(x=>x?.report),failures=[];for(const r of rows)for(const f of r.report.failures||[])failures.push(typeof f==='string'?f:f.code||JSON.stringify(f));const count=new Map();for(const f of failures)count.set(f,(count.get(f)||0)+1);return[...count.entries()].sort((a,b)=>b[1]-a[1]).slice(0,input.limit||8).map(([lesson,occurrences])=>({lesson,occurrences}));}
 proposalPacket(input={}){const parents=this.frontier.frontier().slice(0,input.parentLimit||4),lessons=this.lessons({variantIds:parents.map(x=>x.id),limit:input.lessonLimit||8});return{task:'propose_prompt_program_variants',parents:parents.map(x=>({id:x.id,program:clone(this.variants.get(x.id)?.program),report:clone(this.variants.get(x.id)?.report)})),lessons,constraints:{preserveSchemas:true,maxVariants:Number(input.count||4),optimize:['quality','latency','tokens'],noAuthorityChange:true},authority:'derived_prompt_optimization_packet'};}
 ingestProposals(proposals=[],input={}){const created=[];for(const p of proposals.slice(0,input.limit||8)){const id=p.id||`prompt_g${input.generation||1}_${this.variants.size+1}`;if(this.variants.has(id))continue;created.push(this.add({id,parentIds:[...(p.parentIds||[])],program:p.program||{},generation:Number(input.generation||1),lessons:[...(p.lessons||[])]}));}if(this.variants.size>this.maxVariants){const keep=new Set(this.frontier.frontier().map(x=>x.id));for(const id of [...this.variants.keys()])if(this.variants.size>this.maxVariants&&!keep.has(id))this.variants.delete(id);}return created;}
 best(input={}){const rows=this.frontier.frontier();if(!rows.length)return null;const latencyWeight=clamp(input.latencyWeight??.2),tokenWeight=clamp(input.tokenWeight??.1);return rows.map(x=>({...x,utility:+(x.quality-latencyWeight*Math.min(1,x.latencyMs/10000)-tokenWeight*Math.min(1,x.tokens/8000)).toFixed(4)})).sort((a,b)=>b.utility-a.utility)[0];}
}

class MarginalGainEscalationPolicy{
 constructor(input={}){this.threshold=Number(input.threshold??.08);this.maxOutputTiers=input.maxOutputTiers||{fast:384,balanced:1024,deep:3072,max:6144};}
 decide(input={}){const fast=clamp(input.fastExpectedQuality??.55),strong=clamp(input.strongExpectedQuality??.75),gain=strong-fast,complexity=clamp(input.complexity??.4),risk=clamp(input.risk??.2),latency=clamp(input.latencyPriority??.5),budgetPressure=clamp(input.budgetPressure??0),adjusted=gain+complexity*.08+risk*.08-latency*.06-budgetPressure*.08;let tier='fast';if(adjusted>=this.threshold)tier='balanced';if(adjusted>=this.threshold+.1)tier='deep';if(adjusted>=this.threshold+.22&&latency<.45)tier='max';return{escalate:tier!=='fast',tier,maxOutputTokens:this.maxOutputTiers[tier],marginalGain:+gain.toFixed(4),adjustedGain:+adjusted.toFixed(4),authority:'derived_escalation_policy'};}
}

class CapabilityProbeLab{
 constructor(){this.probes=new Map();this.results=new Map();}
 define(input={}){check(input.id&&!this.probes.has(input.id),'PROBE_ID_REQUIRED');const row={id:input.id,capability:input.capability||input.id,cases:(input.cases||[]).map(clone),threshold:clamp(input.threshold??.7),required:!!input.required};this.probes.set(row.id,row);return clone(row);}
 record(modelId,probeId,input={}){check(input.verified===true,'PROBE_RESULT_MUST_BE_VERIFIED');const probe=this.probes.get(probeId);check(probe,'PROBE_NOT_FOUND');const score=clamp(input.score??0),k=`${modelId}|${probeId}`,row={modelId,probeId,capability:probe.capability,score,pass:score>=probe.threshold,latencyMs:Number(input.latencyMs||0),verified:true,at:Date.now(),evidenceRefs:[...(input.evidenceRefs||[])]};this.results.set(k,row);return clone(row);}
 profile(modelId){const rows=[...this.results.values()].filter(x=>x.modelId===modelId),capabilities={};for(const r of rows)capabilities[r.capability]={score:r.score,pass:r.pass,latencyMs:r.latencyMs};const missingRequired=[...this.probes.values()].filter(p=>p.required&&!rows.some(r=>r.probeId===p.id&&r.pass)).map(p=>p.capability);return{modelId,capabilities,missingRequired,pass:missingRequired.length===0,verifiedProbes:rows.length,authority:'derived_capability_profile'};}
}

class CapabilityDriftDetector{
 compare(previous,current,input={}){const tolerance=Number(input.tolerance??.08),issues=[];for(const [cap,old] of Object.entries(previous.capabilities||{})){const now=current.capabilities?.[cap];if(!now)issues.push({code:'CAPABILITY_MISSING',capability:cap});else if(old.score-now.score>tolerance)issues.push({code:'CAPABILITY_REGRESSION',capability:cap,drop:+(old.score-now.score).toFixed(4)});}return{pass:issues.length===0,issues,previousModelId:previous.modelId,currentModelId:current.modelId};}
}

return{ParetoFrontier,ReflectivePromptProgramOptimizer,MarginalGainEscalationPolicy,CapabilityProbeLab,CapabilityDriftDetector};
});