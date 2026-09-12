const assert=require('assert');
const R=require('./src/ultimate/raw-intelligence-v2.js');
const E=require('./src/ultimate/model-evolution-lab.js');

const caps=new R.CapabilityMatrix();
for(const category of ['general','instruction_following','safety','coding','reasoning']){
 caps.record('base',{category,score:.82,verified:true,evalRef:`base:${category}`});
 caps.record('candidate',{category,score:.88,verified:true,evalRef:`candidate:${category}`});
}
const comparison=caps.compare('base','candidate');
assert.equal(comparison.rows.length,5);
const gate=new R.ContinualLearningGate({maxDrop:.02,minCandidate:.7});
assert.equal(gate.evaluate(comparison).pass,true);

const adapters=new R.SkillAdapterBank();
adapters.register({id:'code-lora',baseModelId:'base',domains:['coding'],capabilities:['edit','test'],status:'specialist',datasetId:'d1'});
adapters.register({id:'general-lora',baseModelId:'base',domains:['general'],capabilities:[],status:'specialist',datasetId:'d2'});
adapters.recordOutcome('code-lora',{taskType:'coding',verified:true,success:true,quality:.94});
const route=adapters.route('base',{taskType:'coding',capabilities:['edit']});
assert.equal(route.selected.id,'code-lora');
assert.throws(()=>adapters.recordOutcome('code-lora',{taskType:'coding',success:true}),/ADAPTER_OUTCOME_MUST_BE_VERIFIED/);

const store=new E.VerifiedExperienceStore();
store.add({id:'x1',taskType:'coding',input:{bug:'a'},output:{patch:'p1'},verified:true,success:false,reward:.2,evidenceRefs:['test:fail'],groupId:'g1',metadata:{uncertain:true}});
store.add({id:'x2',taskType:'coding',input:{bug:'b'},output:{patch:'p2'},verified:true,success:true,reward:.96,evidenceRefs:['test:pass'],groupId:'g2'});
const curriculum=new R.VerifierCurriculumBuilder().build(store.list(),{maxExamples:8});
assert.equal(curriculum.count,2);
assert.ok(curriculum.examples.some(x=>x.label===0));
assert.ok(curriculum.examples.some(x=>x.label===1));

const teachers=new R.TeacherCouncilDistillationPlanner().plan({teachers:['teacherA','teacherB'],candidatesPerExample:4,verifierAvailable:true});
assert.equal(teachers.storeOnlyVerified,true);
assert.equal(teachers.candidatesPerExample,4);

const campaign=new R.RawIntelligenceCampaignPlanner().plan({baseModelId:'base',openWeights:true,examples:400,preferencePairs:200,verifiableFraction:.8,teacherAvailable:true,compute:{multiGpu:true},goals:['quality','long_context','latency']});
const kinds=campaign.stages.map(x=>x.kind);
assert.ok(kinds.includes('qlora_sft'));
assert.ok(kinds.includes('verified_teacher_distillation'));
assert.ok(kinds.includes('dpo_or_preference_optimization'));
assert.ok(kinds.includes('verifiable_reward_optimization'));
assert.ok(kinds.includes('long_context_curriculum'));
assert.ok(kinds.includes('quantize_and_speculative_eval'));
assert.equal(campaign.rules.includes('BASE_CHECKPOINT_IMMUTABLE'),true);

const failures=new R.FailureTaxonomy();
failures.record({taskId:'t1',category:'reasoning',subtype:'premature_answer',severity:.9,verified:true,evidenceRefs:['eval:t1']});
failures.record({taskId:'t2',category:'reasoning',subtype:'premature_answer',severity:.7,verified:true,evidenceRefs:['eval:t2']});
assert.equal(failures.priorities()[0].key,'reasoning/premature_answer');
const flywheel=new R.SelfImprovementFlywheel({experiences:store,failures,capabilities:caps,adapters});
const next=flywheel.next({baseModelId:'base',openWeights:true,teacherAvailable:true,preferencePairs:0,verifiableFraction:.7});
assert.equal(next.verifiedExperiences,2);
assert.ok(next.priorityFailures.length);
assert.ok(next.campaign.stages.length>=4);
console.log('ultimate raw intelligence v2: 25 assertions PASS');