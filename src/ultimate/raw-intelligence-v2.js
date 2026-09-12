(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateRawIntelligenceV2=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));

class CapabilityMatrix{
 constructor(){this.rows=new Map();}
 record(modelId,input={}){check(modelId&&input.category,'CAPABILITY_RECORD_REQUIRED');check(input.verified===true,'CAPABILITY_SCORE_MUST_BE_VERIFIED');const key=`${modelId}|${input.category}`,row={modelId,category:input.category,score:clamp(input.score),latencyMs:Number(input.latencyMs||0),tokens:Number(input.tokens||0),evalRef:input.evalRef||null,createdAt:input.createdAt||Date.now(),metadata:clone(input.metadata||{})};this.rows.set(key,row);return clone(row);}
 profile(modelId){return [...this.rows.values()].filter(x=>x.modelId===modelId).map(clone).sort((a,b)=>a.category.localeCompare(b.category));}
 compare(baseId,candidateId){const base=new Map(this.profile(baseId).map(x=>[x.category,x])),candidate=new Map(this.profile(candidateId).map(x=>[x.category,x])),categories=[...new Set([...base.keys(),...candidate.keys()])].sort(),rows=categories.map(category=>{const a=base.get(category),b=candidate.get(category);return{category,base:a?.score??null,candidate:b?.score??null,delta:a&&b?+(b.score-a.score).toFixed(4):null};});return{baseId,candidateId,rows};}
}

class ContinualLearningGate{
 constructor(input={}){this.maxDrop=Number(input.maxDrop??.02);this.critical=new Set(input.critical||['general','instruction_following','safety','coding','reasoning']);this.minCandidate=Number(input.minCandidate??.5);}
 evaluate(comparison){const issues=[];for(const r of comparison.rows){if(this.critical.has(r.category)&&r.candidate==null)issues.push(`MISSING_CRITICAL:${r.category}`);if(r.candidate!=null&&r.candidate<this.minCandidate&&this.critical.has(r.category))issues.push(`CRITICAL_BELOW_FLOOR:${r.category}`);if(r.delta!=null&&r.delta<-this.maxDrop)issues.push(`REGRESSION:${r.category}:${r.delta}`);}return{pass:issues.length===0,issues,authority:'verified_continual_learning_gate'};}
}

class SkillAdapterBank{
 constructor(){this.rows=new Map();this.outcomes=new Map();}
 register(input={}){check(input.id&&input.baseModelId,'ADAPTER_ID_BASE_REQUIRED');check(!this.rows.has(input.id),'ADAPTER_EXISTS');const row={id:input.id,baseModelId:input.baseModelId,domains:[...(input.domains||[])],capabilities:[...(input.capabilities||[])],status:input.status||'quarantined',datasetId:input.datasetId||null,recipeId:input.recipeId||null,evalRefs:[...(input.evalRefs||[])],rank:Number(input.rank||0),alpha:Number(input.alpha||0),quantization:input.quantization||null,metadata:clone(input.metadata||{})};this.rows.set(row.id,row);return clone(row);}
 recordOutcome(id,input={}){check(this.rows.has(id),'ADAPTER_NOT_FOUND');check(input.verified===true,'ADAPTER_OUTCOME_MUST_BE_VERIFIED');const key=`${id}|${input.taskType||'general'}`,r=this.outcomes.get(key)||{wins:0,total:0,quality:0};r.total++;if(input.success!==false)r.wins++;r.quality=((r.quality*(r.total-1))+clamp(input.quality??(input.success===false?0:1)))/r.total;this.outcomes.set(key,r);return clone(r);}
 route(baseModelId,input={}){const domain=input.domain||input.taskType||'general',required=new Set(input.capabilities||[]),rows=[...this.rows.values()].filter(x=>x.baseModelId===baseModelId&&!['blocked','deprecated','quarantined'].includes(x.status)&&(!x.domains.length||x.domains.includes(domain)||x.domains.includes('general'))&&[...required].every(c=>x.capabilities.includes(c))).map(x=>{const o=this.outcomes.get(`${x.id}|${input.taskType||domain}`)||{wins:0,total:0,quality:.5},success=o.total?o.wins/o.total:.5,score=o.quality*.65+success*.35;return{...clone(x),observedQuality:+o.quality.toFixed(4),successRate:+success.toFixed(4),score:+score.toFixed(4)}}).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));return{selected:rows[0]||null,candidates:rows};}
 promote(id,status,input={}){const x=this.rows.get(id);check(x,'ADAPTER_NOT_FOUND');check(input.gate?.pass===true,'ADAPTER_PROMOTION_GATE_REQUIRED');const order=['quarantined','shadow','canary','specialist','default_candidate','default'];check(order.includes(status),'ADAPTER_STATUS');check(order.indexOf(status)>=order.indexOf(x.status),'ADAPTER_NO_BACKWARD_PROMOTION');x.status=status;if(input.evalRef)x.evalRefs.push(input.evalRef);return clone(x);}
}

class VerifierCurriculumBuilder{
 _example(source){return{id:`verifier:${source.id}`,input:clone(source.input),candidate:clone(source.output),label:source.success!==false&&Number(source.reward??1)>=.8?1:0,feedback:clone(source.feedback||null),evidenceRefs:[...(source.evidenceRefs||[])],groupId:source.groupId,sourceExperienceId:source.id};}
 build(experiences=[],input={}){const rows=experiences.filter(x=>x.verified===true),hard=rows.filter(x=>x.success===false||Number(x.reward??1)<Number(input.rewardThreshold??.75)||x.metadata?.uncertain),positive=rows.filter(x=>x.success!==false&&Number(x.reward??1)>=.9),max=Math.max(1,Number(input.maxExamples||1000)),mixed=[],seen=new Set();const push=source=>{if(!source||mixed.length>=max||seen.has(source.id))return;seen.add(source.id);mixed.push(this._example(source));};
  // Preserve both error-detection and acceptance calibration whenever both pools exist.
  let hi=0,pi=0;while(mixed.length<max&&(hi<hard.length||pi<positive.length)){if(hi<hard.length)push(hard[hi++]);if(pi<positive.length)push(positive[pi++]);if(hi<hard.length)push(hard[hi++]);}
  // Fill any remaining capacity from other verified examples without duplicating rows.
  for(const row of rows)push(row);
  return{examples:mixed,count:mixed.length,hardCount:hard.length,positiveCount:positive.length,classBalance:{negative:mixed.filter(x=>x.label===0).length,positive:mixed.filter(x=>x.label===1).length},authority:'derived_verifier_curriculum'};}
}

class TeacherCouncilDistillationPlanner{
 plan(input={}){const teachers=[...(input.teachers||[])];check(teachers.length,'DISTILLATION_TEACHER_REQUIRED');const candidates=Math.max(1,Math.min(8,Number(input.candidatesPerExample||Math.min(4,teachers.length*2)))),verify=input.verifierAvailable!==false;return{teachers,candidatesPerExample:candidates,diversifyBy:['provider','model_family','temperature_or_seed'],reduce:verify?'tool_then_rubric_verifier':'rubric_verifier_required_before_training',acceptRule:verify?'verified_best_or_verified_consensus':'do_not_commit_to_training_store',storeOnlyVerified:true,authority:'derived_distillation_plan'};}
}

class RawIntelligenceCampaignPlanner{
 plan(input={}){check(input.baseModelId,'RAW_CAMPAIGN_BASE_REQUIRED');const examples=Number(input.examples||0),pairs=Number(input.preferencePairs||0),verifiable=clamp(input.verifiableFraction??0),compute=input.compute||{},goals=new Set(input.goals||['quality']),stages=[];stages.push({id:'baseline',kind:'capability_sweep',required:true,outputs:['capability_matrix','latency_profile','failure_taxonomy']});stages.push({id:'data',kind:'verified_data_flywheel',required:true,outputs:['deduped_train','validation','sealed_test','lineage_manifest']});if(input.openWeights===true){if(examples>=64)stages.push({id:'sft',kind:'qlora_sft',required:true,config:{baseImmutable:true,precision:compute.gpuMemoryGb&&compute.gpuMemoryGb<24?'4bit':'auto',target:'behavior_and_skill_bootstrap'}});if(input.teacherAvailable&&examples>=64)stages.push({id:'distill',kind:'verified_teacher_distillation',required:false,config:{multipleTeachers:true,verifyBeforeStore:true}});if(pairs>=64)stages.push({id:'preference',kind:'dpo_or_preference_optimization',required:false,config:{chosenRejectedMustBeVerified:true}});if(verifiable>=.55&&examples>=192)stages.push({id:'rlvr',kind:'verifiable_reward_optimization',required:false,config:{algorithm:compute.multiGpu?'grpo_or_equivalent':'offline_or_low_memory_variant',externalToolsForMemorizationHeavyVerification:true}});if(goals.has('long_context'))stages.push({id:'long_context',kind:'long_context_curriculum',required:false,config:{progressiveLength:true,retrievalAndCompressionTasks:true}});if(goals.has('latency'))stages.push({id:'serve',kind:'quantize_and_speculative_eval',required:false,config:{quantizeOnlyAfterQualityGate:true,draftModelOptional:true}});}else stages.push({id:'closed',kind:'system_intelligence_optimization',required:true,config:{routing:true,promptPrograms:true,tools:true,retrieval:true,testTimeScaling:true,workflowSearch:true}});stages.push({id:'verify',kind:'sealed_eval_and_regression_gate',required:true,outputs:['quality','critical_capabilities','latency','token_efficiency','robustness']});stages.push({id:'deploy',kind:'shadow_canary_promotion',required:true,config:{automaticDefaultForbiddenWithoutGate:true,rollback:true}});return{id:input.id||`raw_campaign_${Date.now()}`,baseModelId:input.baseModelId,openWeights:input.openWeights===true,stages,rules:['VERIFIED_DATA_ONLY','NO_TRAIN_TEST_LEAKAGE','SOURCE_LINEAGE_REQUIRED','BASE_CHECKPOINT_IMMUTABLE','CRITICAL_CAPABILITY_REGRESSION_BLOCKS_PROMOTION','REAL_TRAFFIC_CANARY_BEFORE_DEFAULT'],authority:'derived_raw_intelligence_campaign'};}
}

class FailureTaxonomy{
 constructor(){this.rows=[];}
 record(input={}){check(input.taskId&&input.category,'FAILURE_TAXONOMY_RECORD_REQUIRED');const row={taskId:input.taskId,category:input.category,subtype:input.subtype||'unspecified',modelId:input.modelId||null,workflowId:input.workflowId||null,severity:clamp(input.severity??.5),verified:input.verified===true,evidenceRefs:[...(input.evidenceRefs||[])],metadata:clone(input.metadata||{})};this.rows.push(row);return clone(row);}
 summary(){const counts={};for(const r of this.rows)counts[`${r.category}/${r.subtype}`]=(counts[`${r.category}/${r.subtype}`]||0)+1;return{count:this.rows.length,verified:this.rows.filter(x=>x.verified).length,counts};}
 priorities(){const map=new Map();for(const r of this.rows.filter(x=>x.verified)){const k=`${r.category}/${r.subtype}`,x=map.get(k)||{key:k,count:0,severity:0};x.count++;x.severity+=r.severity;map.set(k,x);}return[...map.values()].map(x=>({...x,priority:+(x.count*(x.severity/x.count)).toFixed(3)})).sort((a,b)=>b.priority-a.priority);}
}

class SelfImprovementFlywheel{
 constructor(input={}){this.experiences=input.experiences;this.failures=input.failures||new FailureTaxonomy();this.capabilities=input.capabilities||new CapabilityMatrix();this.adapters=input.adapters||new SkillAdapterBank();this.campaigns=input.campaigns||new RawIntelligenceCampaignPlanner();}
 ingestFailure(input={}){check(input.verified===true,'FLYWHEEL_FAILURE_MUST_BE_VERIFIED');return this.failures.record(input);}
 next(input={}){const priorities=this.failures.priorities(),top=priorities.slice(0,5),stats=this.experiences?.stats?.()||{count:0};return{verifiedExperiences:stats.count,priorityFailures:top,recommendations:[top.length?'build targeted verified curriculum for '+top[0].key:null,stats.count>=64?'run adapter/SFT candidate campaign':null,stats.count>=192?'evaluate verifier-guided reward optimization where rewards are deterministic':null].filter(Boolean),campaign:this.campaigns.plan({...input,examples:input.examples??stats.count}),authority:'derived_improvement_proposal'};}
}

return{CapabilityMatrix,ContinualLearningGate,SkillAdapterBank,VerifierCurriculumBuilder,TeacherCouncilDistillationPlanner,RawIntelligenceCampaignPlanner,FailureTaxonomy,SelfImprovementFlywheel};
});