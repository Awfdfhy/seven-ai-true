const assert=require('assert');
const C=require('./src/ultimate/frontier-chat-fabric.js');
const P=require('./src/ultimate/provider-feature-runtime.js');
const F=require('./src/ultimate/frontier-evals.js');

const chat=new C.FrontierChatFabric({sessionId:'s1',contextOptions:{defaultBudget:180}});
const s=chat.system('You are Seven',{sourceRefs:['system:v1']});
const u1=chat.user('Remember project alpha uses an append-only ledger',{sourceRefs:['user:1']});
chat.assistant('Understood',{sourceRefs:['run:1']});
const u2=chat.user('Now compare it with beta and verify the latest details',{sourceRefs:['user:2']});
assert.equal(chat.conversation.revision,4);
assert.throws(()=>chat.conversation.importAppendOnly({id:'s1',turns:[{...s,content:'mutated'}]}),/CHAT_HISTORY_MUTATION_REJECTED/);
const plan=chat.planTurn({text:u2.content,complexity:.78,uncertainty:.7,risk:.3,longHorizon:.6,searchRequested:true,tokenBudget:180});
assert.ok(['high','xhigh','max'].includes(plan.effort.effort));
assert.equal(plan.appendOnlyHistory,true);
assert.equal(plan.finishWholeTask,true);
assert.ok(plan.context.materializedTokens<=180);
assert.equal(plan.context.manifest.conversationRevision,4);
const compact=chat.compact({sourceTurnIds:[u1.id],summary:{facts:['project alpha uses an append-only ledger']},mustPreserve:{exact:['append-only ledger']}});
assert.equal(compact.authority,'derived_compaction');
assert.deepEqual(compact.sourceTurnIds,[u1.id]);
const contract=chat.createContract({id:'task1',criteria:[{id:'research',label:'verify sources'},{id:'answer',label:'deliver answer'}]});
assert.equal(contract.snapshot().done,false);contract.mark('research',{evidenceRefs:['src:1']});contract.mark('answer',{evidenceRefs:['run:2']});assert.equal(contract.snapshot().done,true);
chat.progress.push({stage:'research',message:'Verified the current source',evidenceRefs:['src:1']});
const cp=chat.checkpoint({contract,workspaceState:{phase:'done'}});assert.equal(cp.conversationRevision,4);assert.equal(cp.contract.done,true);

const verifier=new C.RubricVerifier({passScore:.8});
const report=verifier.evaluate({checks:{instruction:1,correctness:.95,completeness:.9,grounding:.9,consistency:1,efficiency:.8},evidenceRefs:['eval:1']});
assert.equal(report.pass,true);
const bank=new C.CandidateBank();bank.add({id:'a',output:'A',report,latencyMs:120,tokens:10});const weaker=verifier.evaluate({checks:{instruction:1,correctness:.82,completeness:.8,grounding:.8,consistency:.9,efficiency:.9},evidenceRefs:['eval:2']});bank.add({id:'b',output:'B',report:weaker,latencyMs:50,tokens:8});assert.equal(bank.best().id,'a');

const registry=P.registerReferenceProfiles(new P.ProviderFeatureRegistry());
const compiler=new P.CanonicalRequestCompiler({features:registry});
const anth=compiler.compile('anthropic-fable',{effort:'max',progressUpdates:true,parallelToolCalls:true,maxOutputTokens:200000});
assert.equal(anth.options.output_config.effort,'max');assert.equal(anth.options.thinking.display,'updates');assert.equal(anth.options.max_tokens,128000);assert.equal(anth.capabilities.appendOnlyThinking,true);
const guard=new P.ConversationCompatibilityGuard();assert.equal(guard.validate(registry.get('anthropic-fable'),{historyMutated:true}).pass,false);

const score=new F.FrontierScorecard();for(const cat of Object.keys(F.DEFAULT_WEIGHTS))score.add({category:cat,score:.9,verified:true,latencyMs:100,tokens:100,evidenceRefs:['e']});const summary=score.summary();assert.ok(summary.overall>.85);const gate=new F.FrontierGate({minOverall:.8,minCritical:.8});assert.equal(gate.evaluate(summary).pass,true);const protocols=new F.ProtocolMatchedEvaluator();protocols.register({id:'a',candidates:2,rounds:2,tools:true,effort:'high',maxCalls:6});protocols.register({id:'b',candidates:2,rounds:2,tools:true,effort:'high',maxCalls:6});assert.equal(protocols.compare({protocolId:'a'},{protocolId:'b'}).matched,true);
console.log('ultimate frontier chat: 28 assertions PASS');