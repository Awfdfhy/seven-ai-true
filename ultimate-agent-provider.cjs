const assert=require('assert');
const {parseSSEBuffer,ProviderPool}=require('./src/ultimate/provider-adapters.js');
const {CodingAgentRuntime,VerificationGate}=require('./src/ultimate/agent-runtime.js');

(async()=>{
 const parsed=parseSSEBuffer('data: {"a":1}\n\ndata: [DONE]\n\npartial');assert.deepStrictEqual(parsed.events,['{"a":1}','[DONE]']);assert.equal(parsed.rest,'partial');
 const pool=new ProviderPool();pool.register({id:'local'},{local:true});pool.register({id:'unknown'},{freeProof:'unknown'});assert.deepStrictEqual(pool.eligible({freeOnly:true}),['local']);pool.markFailure('local',new Error('x'));pool.markFailure('local',new Error('x'));pool.markFailure('local',new Error('x'));assert.equal(pool.health.get('local').state,'degraded');
 let testAttempt=0;const agent=new CodingAgentRuntime({maxRepairs:2,verifier:new VerificationGate()});const result=await agent.execute({id:'agent1',goal:'repair project',executor:async(step)=>{if(step==='inspect')return{plan:['edit','test']};if(step==='edit')return{changedFiles:['app.js']};if(step==='syntax')return{pass:true};if(step==='test'){testAttempt++;return{pass:testAttempt>=2,output:testAttempt>=2?'ok':'failure'}}if(step==='repair')return{changedFiles:['app.js']};if(step==='inspect_diff')return{inspected:true};return{};}});assert.equal(result.status,'completed');assert.equal(result.repairCount,1);assert.equal(result.verification.state,'PASS');assert.equal(result.evidence.tests.status,'pass');assert.ok(agent.activity('agent1').some(x=>x.kind==='verification'));
 const bad=new CodingAgentRuntime({maxRepairs:0});const fail=await bad.execute({id:'agent2',goal:'broken',executor:async(step)=>{if(step==='inspect')return{};if(step==='edit')return{changedFiles:[]};if(step==='syntax')return{pass:false};if(step==='test')return{pass:false};if(step==='inspect_diff')return{inspected:false};return{};}});assert.equal(fail.status,'inconclusive');assert.equal(fail.verification.state,'FAIL');
 console.log('ultimate agent/provider: 12 assertions PASS');
})().catch(err=>{console.error(err);process.exit(1)});
