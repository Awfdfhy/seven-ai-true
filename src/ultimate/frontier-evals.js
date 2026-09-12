(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateFrontierEvals=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));
const DEFAULT_WEIGHTS=Object.freeze({general_chat:.12,instruction_following:.12,reasoning:.12,coding:.12,research:.10,tool_use:.08,long_context:.10,long_horizon:.08,verification:.08,efficiency:.08});

class FrontierScorecard{
 constructor(input={}){this.weights={...DEFAULT_WEIGHTS,...(input.weights||{})};this.rows=[];}
 add(input={}){check(input.category&&this.weights[input.category]!=null,'FRONTIER_CATEGORY_REQUIRED');check(input.verified===true,'FRONTIER_SCORE_MUST_BE_VERIFIED');const row={id:input.id||`${input.category}:${this.rows.length+1}`,category:input.category,score:clamp(input.score),latencyMs:Number(input.latencyMs||0),tokens:Number(input.tokens||0),cost:Number(input.cost||0),evidenceRefs:[...(input.evidenceRefs||[])],metadata:clone(input.metadata||{})};this.rows.push(row);return clone(row);}
 summary(){const categories={};for(const cat of Object.keys(this.weights)){const rows=this.rows.filter(x=>x.category===cat);if(rows.length)categories[cat]=+(rows.reduce((n,x)=>n+x.score,0)/rows.length).toFixed(4);}let numerator=0,denominator=0;for(const [cat,score] of Object.entries(categories)){const w=Number(this.weights[cat]||0);numerator+=score*w;denominator+=w;}const latency=this.rows.length?Math.round(this.rows.reduce((n,x)=>n+x.latencyMs,0)/this.rows.length):0,tokens=this.rows.length?Math.round(this.rows.reduce((n,x)=>n+x.tokens,0)/this.rows.length):0,cost=this.rows.reduce((n,x)=>n+x.cost,0);return{overall:denominator?+(numerator/denominator).toFixed(4):0,categories,avgLatencyMs:latency,avgTokens:tokens,totalCost:+cost.toFixed(6),tasks:this.rows.length,authority:'verified_frontier_scorecard'};}
}

class FrontierGate{
 constructor(input={}){this.minOverall=Number(input.minOverall??.78);this.minCritical=Number(input.minCritical??.72);this.critical=new Set(input.critical||['general_chat','instruction_following','reasoning','coding','verification']);this.maxLatencyRegression=Number(input.maxLatencyRegression??.35);this.maxTokenRegression=Number(input.maxTokenRegression??.25);this.maxCategoryDrop=Number(input.maxCategoryDrop??.03);}
 evaluate(candidate,baseline=null){check(candidate?.authority==='verified_frontier_scorecard','FRONTIER_SCORECARD_REQUIRED');const issues=[];if(candidate.overall<this.minOverall)issues.push({code:'OVERALL_BELOW_FLOOR',value:candidate.overall});for(const cat of this.critical){const v=candidate.categories?.[cat];if(v==null)issues.push({code:'CRITICAL_CATEGORY_MISSING',category:cat});else if(v<this.minCritical)issues.push({code:'CRITICAL_CATEGORY_BELOW_FLOOR',category:cat,value:v});}if(baseline){for(const [cat,base] of Object.entries(baseline.categories||{})){const cur=candidate.categories?.[cat];if(cur!=null&&base-cur>this.maxCategoryDrop)issues.push({code:'CATEGORY_REGRESSION',category:cat,drop:+(base-cur).toFixed(4)});}if(baseline.avgLatencyMs>0&&candidate.avgLatencyMs>baseline.avgLatencyMs*(1+this.maxLatencyRegression))issues.push({code:'LATENCY_REGRESSION'});if(baseline.avgTokens>0&&candidate.avgTokens>baseline.avgTokens*(1+this.maxTokenRegression))issues.push({code:'TOKEN_REGRESSION'});}return{pass:issues.length===0,issues,candidate:clone(candidate),baseline:baseline?clone(baseline):null,authority:'verified_frontier_gate'};}
}

class ProtocolMatchedEvaluator{
 constructor(input={}){this.protocols=new Map();for(const p of input.protocols||[])this.register(p);}
 register(input={}){check(input.id,'EVAL_PROTOCOL_ID_REQUIRED');this.protocols.set(input.id,{id:input.id,candidates:Number(input.candidates||1),rounds:Number(input.rounds||1),tools:!!input.tools,search:!!input.search,effort:input.effort||'high',maxCalls:Number(input.maxCalls||1),metadata:clone(input.metadata||{})});return clone(this.protocols.get(input.id));}
 compare(a,b){check(a?.protocolId&&b?.protocolId,'PROTOCOL_REPORT_REQUIRED');const pa=this.protocols.get(a.protocolId),pb=this.protocols.get(b.protocolId);check(pa&&pb,'EVAL_PROTOCOL_NOT_FOUND');const matched=pa.candidates===pb.candidates&&pa.rounds===pb.rounds&&pa.tools===pb.tools&&pa.search===pb.search&&pa.effort===pb.effort&&pa.maxCalls===pb.maxCalls;return{matched,reason:matched?null:'INFERENCE_PROTOCOL_MISMATCH',a:clone(pa),b:clone(pb)};}
}

class FrontierBenchmarkPlan{
 build(input={}){const categories=input.categories||Object.keys(DEFAULT_WEIGHTS),tasks=[];for(const category of categories){const count=Math.max(1,Number(input.tasksPerCategory?.[category]||input.defaultTasksPerCategory||8));for(let i=0;i<count;i++)tasks.push({id:`${category}:${i+1}`,category,seed:`seven-frontier:${category}:${i+1}`,requirements:{freshEvidence:category==='research',tools:['coding','tool_use','research'].includes(category),multiTurn:['general_chat','long_context','long_horizon'].includes(category),deterministicVerifier:['coding','reasoning','tool_use'].includes(category)}});}return{id:input.id||`frontier_benchmark_${Date.now()}`,tasks,principles:['SEALED_TEST_SET','PROTOCOL_MATCHED_COMPARISON','VERIFIED_SCORING','QUALITY_AND_EFFICIENCY_JOINTLY_MEASURED','NO_SINGLE_BENCHMARK_DEFINES_INTELLIGENCE'],authority:'derived_eval_plan'};}
}

return{DEFAULT_WEIGHTS,FrontierScorecard,FrontierGate,ProtocolMatchedEvaluator,FrontierBenchmarkPlan};
});