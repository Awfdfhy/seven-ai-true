const assert=require('assert');
const {FrontierInferenceExecutor,VerificationStack,extractJson}=require('./src/ultimate/frontier-inference-runtime.js');
const {IntelligenceOrchestrator}=require('./src/ultimate/intelligence-orchestrator.js');

(async()=>{
 assert.deepEqual(extractJson('```json\n{"score":0.9}\n```'),{score:.9});
 const base={
  async execute(input={}){
   const model=input.plan.route.selected.modelId;
   const output=model==='m2'?'correct answer':'weak answer';
   return{status:'completed',selected:input.plan.route.selected,attempts:[{providerId:input.plan.route.selected.providerId,modelId:model,status:'completed'}],run:{id:input.id||'r',status:'completed',output,events:[]}};
  }
 };
 const plan={route:{selected:{providerId:'p1',modelId:'m1',score:.8},candidates:[{providerId:'p1',modelId:'m1',score:.8},{providerId:'p2',modelId:'m2',score:.79}]},strategy:{mode:'sample_verify',budget:{candidates:2,rounds:1,parallel:2,maxModelCalls:5,maxVerifierCalls:2}}};
 const executor=new FrontierInferenceExecutor({control:{},baseExecutor:base,Orchestrator:IntelligenceOrchestrator,verification:new VerificationStack({minScore:.7})});
 let streamed='';
 const result=await executor.execute({id:'fi',plan,strategy:plan.strategy,messages:[{role:'user',content:'answer carefully'}],taskText:'answer carefully',verifyCandidate:async candidate=>({verified:true,score:candidate.answer.includes('correct')?.96:.25,feedback:candidate.answer.includes('correct')?null:'incorrect'}),onChunk:x=>streamed+=x});
 assert.equal(result.status,'completed');
 assert.equal(result.run.output,'correct answer');
 assert.equal(streamed,'correct answer');
 assert.equal(result.frontier.strategy,'sample_verify');
 assert.equal(result.frontier.winner.verified,true);
 assert.ok(result.frontier.winner.score>.9);
 assert.equal(result.attempts.length,2);
 const stack=new VerificationStack({toolVerifiers:[async()=>({verified:true,pass:false,score:0,critical:true,label:'deterministic failure'})],judge:async()=>({verified:true,score:.95}),minScore:.7});
 const verdict=await stack.verify({answer:'x'},{task:'t'});
 assert.equal(verdict.verified,true);
 assert.equal(verdict.pass,false);
 assert.equal(verdict.hardFailure,true);
 console.log('ultimate frontier inference: 12 assertions PASS');
})().catch(e=>{console.error(e);process.exit(1)});