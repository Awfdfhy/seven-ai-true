(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateIntelligence=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));

class InferenceBudget{
 constructor(input={}){this.maxModelCalls=Math.max(1,Number(input.maxModelCalls||12));this.maxVerifierCalls=Math.max(0,Number(input.maxVerifierCalls||4));this.maxParallel=Math.max(1,Number(input.maxParallel||3));this.used={modelCalls:0,verifierCalls:0};}
 model(n=1){check(this.used.modelCalls+n<=this.maxModelCalls,'INFERENCE_MODEL_BUDGET');this.used.modelCalls+=n;}
 verifier(n=1){check(this.used.verifierCalls+n<=this.maxVerifierCalls,'INFERENCE_VERIFIER_BUDGET');this.used.verifierCalls+=n;}
 snapshot(){return{limits:{modelCalls:this.maxModelCalls,verifierCalls:this.maxVerifierCalls,parallel:this.maxParallel},used:clone(this.used)};}
}

class CandidateBank{
 constructor(){this.rows=[];}
 add(input={}){check(input.id&&input.answer!=null,'CANDIDATE_REQUIRED');const row={id:input.id,answer:input.answer,model:clone(input.model||null),stage:input.stage||'solve',parentId:input.parentId||null,score:input.score==null?null:clamp(input.score),verified:!!input.verified,feedback:input.feedback||null,metadata:clone(input.metadata||{})};this.rows.push(row);return clone(row);}
 rank(){return[...this.rows].sort((a,b)=>(b.verified-a.verified)||((b.score??-.01)-(a.score??-.01))).map(clone);}
 best(){return this.rank()[0]||null;}
}

class PublicInferenceTrace{
 constructor(){this.events=[];}
 add(stage,input={}){this.events.push({stage,state:input.state||'done',candidateCount:input.candidateCount??null,score:input.score??null,at:Date.now()});}
 snapshot(){return clone(this.events);}
}

class IntelligenceOrchestrator{
 constructor(input={}){check(typeof input.invoke==='function','INTELLIGENCE_INVOKE_REQUIRED');this.invoke=input.invoke;this.verify=typeof input.verify==='function'?input.verify:null;this.synthesize=typeof input.synthesize==='function'?input.synthesize:null;}
 async _call(budget,request){budget.model();return this.invoke(clone(request));}
 async _judge(budget,candidate,context){if(!this.verify)return{verified:false,score:candidate.score??.5};budget.verifier();const verdict=await this.verify(clone(candidate),clone(context));return{verified:verdict?.verified!==false,score:clamp(verdict?.score??0),feedback:verdict?.feedback||null};}
 async run(input={}){const strategy=input.strategy||{mode:'direct',budget:{candidates:1,rounds:1,parallel:1,maxModelCalls:8,maxVerifierCalls:2}},budget=new InferenceBudget({maxModelCalls:strategy.budget?.maxModelCalls||8,maxVerifierCalls:strategy.budget?.maxVerifierCalls||2,maxParallel:strategy.budget?.parallel||2}),bank=new CandidateBank(),trace=new PublicInferenceTrace(),models=(input.models||[]).length?input.models:[input.model||null],prompt=input.prompt||input.messages||input.input,context=input.context||{};check(prompt!=null,'INTELLIGENCE_PROMPT_REQUIRED');const modelAt=i=>models[i%models.length];const solve=async(i,stage='solve',parentId=null,extra={})=>{const result=await this._call(budget,{stage,prompt,context,model:modelAt(i),candidateIndex:i,parentId,...clone(extra)});const answer=result?.answer??result?.text??result;return bank.add({id:`c${bank.rows.length+1}`,answer,model:modelAt(i),stage,parentId,metadata:{rawScore:result?.score??null}});};
  if(strategy.mode==='direct'){const c=await solve(0);const v=await this._judge(budget,c,context);Object.assign(bank.rows[0],v);trace.add('solve',{candidateCount:1,score:v.score});return this._finish(bank,trace,budget,strategy);}
  if(strategy.mode==='sample_verify'){const n=Math.max(2,Number(strategy.budget?.candidates||2)),rows=await Promise.all(Array.from({length:n},(_,i)=>solve(i,'candidate')));trace.add('candidate search',{candidateCount:rows.length});for(const c of rows){const v=await this._judge(budget,c,context),row=bank.rows.find(x=>x.id===c.id);Object.assign(row,v);}trace.add('verify',{candidateCount:rows.length,score:bank.best()?.score});return this._finish(bank,trace,budget,strategy);}
  if(strategy.mode==='solver_critic'||strategy.mode==='solver_critic_repair'){const c=await solve(0,'solve');trace.add('solve',{candidateCount:1});const critique=await this._call(budget,{stage:'critique',prompt,context,model:modelAt(1),candidate:{id:c.id,answer:c.answer}});trace.add('critique',{candidateCount:1});let target=c;if(strategy.mode==='solver_critic_repair'){target=await solve(0,'repair',c.id,{candidate:{answer:c.answer},feedback:critique?.feedback??critique?.text??critique});trace.add('repair',{candidateCount:1});}const v=await this._judge(budget,target,{...context,critique:critique?.feedback??critique?.text??null}),row=bank.rows.find(x=>x.id===target.id);Object.assign(row,v);trace.add('verify',{candidateCount:1,score:v.score});return this._finish(bank,trace,budget,strategy);}
  if(strategy.mode==='tree_search'){const width=Math.max(2,Math.min(3,Number(strategy.budget?.parallel||2))),rounds=Math.max(2,Number(strategy.budget?.rounds||2));let frontier=await Promise.all(Array.from({length:width},(_,i)=>solve(i,'explore')));trace.add('explore',{candidateCount:frontier.length});for(let r=0;r<rounds;r++){for(const c of frontier){const v=await this._judge(budget,c,{...context,round:r}),row=bank.rows.find(x=>x.id===c.id);Object.assign(row,v);}const top=bank.rank().slice(0,width);if(r===rounds-1)break;frontier=await Promise.all(top.map((c,i)=>solve(i,'refine',c.id,{candidate:{answer:c.answer},feedback:c.feedback})));trace.add('refine',{candidateCount:frontier.length});}trace.add('verify',{candidateCount:bank.rows.length,score:bank.best()?.score});return this._finish(bank,trace,budget,strategy);}
  const n=Math.max(2,Number(strategy.budget?.candidates||Math.min(4,models.length||2))),specialists=await Promise.all(Array.from({length:n},(_,i)=>solve(i,'specialist')));trace.add('specialists',{candidateCount:specialists.length});for(const c of specialists){const v=await this._judge(budget,c,context),row=bank.rows.find(x=>x.id===c.id);Object.assign(row,v);}const ranked=bank.rank().slice(0,Math.min(4,specialists.length));if(this.synthesize){budget.model();const synthesis=await this.synthesize({prompt,context,candidates:ranked.map(x=>({answer:x.answer,score:x.score,verified:x.verified})),model:modelAt(0)}),row=bank.add({id:`c${bank.rows.length+1}`,answer:synthesis?.answer??synthesis?.text??synthesis,model:modelAt(0),stage:'synthesis'}),v=await this._judge(budget,row,context);Object.assign(bank.rows.find(x=>x.id===row.id),v);trace.add('synthesis',{candidateCount:ranked.length,score:v.score});}trace.add('verify',{candidateCount:bank.rows.length,score:bank.best()?.score});return this._finish(bank,trace,budget,strategy);
 }
 _finish(bank,trace,budget,strategy){const best=bank.best();return{answer:best?.answer??null,winner:best,candidates:bank.rank().map(x=>({id:x.id,stage:x.stage,score:x.score,verified:x.verified,model:x.model})),strategy:strategy.mode,trace:trace.snapshot(),budget:budget.snapshot(),authority:'derived_inference_result'};}
}

return{InferenceBudget,CandidateBank,PublicInferenceTrace,IntelligenceOrchestrator};
});