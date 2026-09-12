(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateEvals=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));const check=(v,m)=>{if(!v)throw new Error(m)};const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));
class EvalSuite{
 constructor(input={}){this.id=input.id||'default';this.tasks=[];this.weights={...input.weights};}
 add(input={}){check(input.id&&!this.tasks.some(t=>t.id===input.id),'EVAL_TASK_EXISTS');const t={id:input.id,category:input.category||'general',input:clone(input.input),expected:clone(input.expected),weight:Number(input.weight||1),timeoutMs:Number(input.timeoutMs||30000),metadata:clone(input.metadata||{})};this.tasks.push(t);return clone(t);}
 categories(){return[...new Set(this.tasks.map(t=>t.category))];}
}
class EvalRunner{
 constructor(opts={}){this.clock=opts.clock||(()=>Date.now());this.history=[];}
 async run(suite,subject,input={}){check(suite instanceof EvalSuite,'EVAL_SUITE_REQUIRED');check(subject&&typeof subject.execute==='function','EVAL_SUBJECT_REQUIRED');const rows=[];for(const task of suite.tasks){const start=this.clock();let result,error=null;try{result=await subject.execute(clone(task.input),{task:clone(task),signal:input.signal});}catch(e){error=String(e&&e.message||e);}const elapsed=Math.max(0,this.clock()-start);let score=0,details={};if(!error){if(typeof input.judge==='function'){const judged=await input.judge(task,clone(result));score=clamp(typeof judged==='number'?judged:judged.score);details=typeof judged==='object'?clone(judged):{};}else if(typeof task.metadata.judge==='function'){score=clamp(task.metadata.judge(result,task));}else score=JSON.stringify(result)===JSON.stringify(task.expected)?1:0;}rows.push({taskId:task.id,category:task.category,score,error,latencyMs:elapsed,weight:task.weight,details});}
 const totalWeight=rows.reduce((n,r)=>n+r.weight,0)||1,overall=rows.reduce((n,r)=>n+r.score*r.weight,0)/totalWeight,categories={};for(const cat of suite.categories()){const rs=rows.filter(r=>r.category===cat),w=rs.reduce((n,r)=>n+r.weight,0)||1;categories[cat]=rs.reduce((n,r)=>n+r.score*r.weight,0)/w;}
 const report={suiteId:suite.id,subjectId:subject.id||'subject',overall:+overall.toFixed(4),categories:Object.fromEntries(Object.entries(categories).map(([k,v])=>[k,+v.toFixed(4)])),failures:rows.filter(r=>r.error||r.score<1).length,avgLatencyMs:rows.length?Math.round(rows.reduce((n,r)=>n+r.latencyMs,0)/rows.length):0,rows,createdAt:new Date().toISOString()};this.history.push(clone(report));return report;}
}
class RegressionGate{
 constructor(opts={}){this.maxOverallDrop=opts.maxOverallDrop??.02;this.maxCategoryDrop=opts.maxCategoryDrop??.05;this.maxLatencyIncrease=opts.maxLatencyIncrease??.35;this.requiredCategories=new Set(opts.requiredCategories||[]);}
 evaluate(baseline,candidate){check(baseline&&candidate,'EVAL_REPORT_REQUIRED');const issues=[];const overallDrop=baseline.overall-candidate.overall;if(overallDrop>this.maxOverallDrop)issues.push({type:'OVERALL_REGRESSION',drop:+overallDrop.toFixed(4)});for(const [cat,base] of Object.entries(baseline.categories||{})){if(candidate.categories?.[cat]==null){if(this.requiredCategories.has(cat))issues.push({type:'CATEGORY_MISSING',category:cat});continue;}const drop=base-candidate.categories[cat];if(drop>this.maxCategoryDrop)issues.push({type:'CATEGORY_REGRESSION',category:cat,drop:+drop.toFixed(4)});}if(baseline.avgLatencyMs>0&&candidate.avgLatencyMs>baseline.avgLatencyMs*(1+this.maxLatencyIncrease))issues.push({type:'LATENCY_REGRESSION',ratio:+(candidate.avgLatencyMs/baseline.avgLatencyMs).toFixed(3)});return{pass:issues.length===0,state:issues.length?'FAIL':'PASS',issues};}
}
class PromotionRegistry{
 constructor(){this.entries=new Map();}
 register(input={}){check(input.id&&!this.entries.has(input.id),'PROMOTION_ENTRY_EXISTS');const e={id:input.id,kind:input.kind||'model',status:'quarantined',reports:[],history:[{status:'quarantined',at:Date.now()}],metadata:clone(input.metadata||{})};this.entries.set(e.id,e);return clone(e);}
 attachReport(id,report){const e=this.entries.get(id);check(e,'PROMOTION_ENTRY_NOT_FOUND');e.reports.push(clone(report));return clone(e);}
 transition(id,status,evidence={}){const e=this.entries.get(id);check(e,'PROMOTION_ENTRY_NOT_FOUND');const allowed={quarantined:['shadow','blocked'],shadow:['canary','blocked'],canary:['specialist','blocked'],specialist:['default_candidate','deprecated','blocked'],default_candidate:['default','specialist','blocked'],default:['deprecated','blocked'],deprecated:['blocked'],blocked:[]};check((allowed[e.status]||[]).includes(status),'INVALID_PROMOTION_TRANSITION');check(evidence.pass!==false,'PROMOTION_EVIDENCE_FAILED');e.status=status;e.history.push({status,at:Date.now(),evidence:clone(evidence)});return clone(e);}
 get(id){const e=this.entries.get(id);check(e,'PROMOTION_ENTRY_NOT_FOUND');return clone(e);}
}
class PromptEvolutionEngine{
 constructor(opts={}){this.variants=new Map();this.gate=opts.gate||new RegressionGate();}
 add(input={}){check(input.id&&!this.variants.has(input.id),'PROMPT_VARIANT_EXISTS');this.variants.set(input.id,{id:input.id,template:input.template||'',status:input.status||'candidate',report:null,parentId:input.parentId||null});return clone(this.variants.get(input.id));}
 score(id,report){const v=this.variants.get(id);check(v,'PROMPT_VARIANT_NOT_FOUND');v.report=clone(report);return clone(v);}
 choose(baselineId,candidateIds=[]){const base=this.variants.get(baselineId);check(base?.report,'PROMPT_BASELINE_REPORT_REQUIRED');const accepted=[];for(const id of candidateIds){const v=this.variants.get(id);if(!v?.report)continue;const gate=this.gate.evaluate(base.report,v.report);if(gate.pass&&v.report.overall>=base.report.overall)accepted.push({id,overall:v.report.overall,latency:v.report.avgLatencyMs,gate});}accepted.sort((a,b)=>b.overall-a.overall||a.latency-b.latency);return{selected:accepted[0]||null,accepted};}
}
return{EvalSuite,EvalRunner,RegressionGate,PromotionRegistry,PromptEvolutionEngine};
});