(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateFrontierChat=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));
const estimateTokens=v=>Math.max(1,Math.ceil(JSON.stringify(v??'').length/4));
const words=s=>String(s||'').toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}_-]+/gu)||[];
const stable=v=>{if(v==null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return`[${v.map(stable).join(',')}]`;return`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(',')}}`;};
const hash=text=>{let h=2166136261;for(const c of String(text)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return(h>>>0).toString(16).padStart(8,'0');};
const roleOk=r=>['system','user','assistant','tool'].includes(r);

class AppendOnlyConversation{
 constructor(input={}){this.id=input.id||`chat_${Date.now()}`;this.turns=[];this.revision=0;this.createdAt=input.createdAt||Date.now();}
 append(input={}){check(roleOk(input.role),'CHAT_ROLE_REQUIRED');check(input.content!=null,'CHAT_CONTENT_REQUIRED');const previousHash=this.turns.length?this.turns[this.turns.length-1].hash:null,row={id:input.id||`${this.id}:turn:${this.turns.length+1}`,seq:this.turns.length+1,role:input.role,content:clone(input.content),sourceRefs:[...(input.sourceRefs||[])],authority:input.authority||((input.role==='user'||input.role==='system')?'source':'derived'),visibility:input.visibility||'full',createdAt:input.createdAt||Date.now(),metadata:clone(input.metadata||{}),previousHash};row.hash=hash(stable({id:row.id,seq:row.seq,role:row.role,content:row.content,sourceRefs:row.sourceRefs,authority:row.authority,previousHash:row.previousHash}));this.turns.push(row);this.revision++;return clone(row);}
 appendMany(rows=[]){return rows.map(x=>this.append(x));}
 get(id){const x=this.turns.find(t=>t.id===id);check(x,'CHAT_TURN_NOT_FOUND');return clone(x);}
 list(){return this.turns.map(clone);}
 prefixHash(seq=this.turns.length){const rows=this.turns.slice(0,Math.max(0,seq));return rows.length?rows[rows.length-1].hash:hash(this.id);}
 snapshot(){return{id:this.id,revision:this.revision,turns:this.list(),prefixHash:this.prefixHash(),createdAt:this.createdAt,authority:'authoritative_append_only_conversation'};}
 importAppendOnly(snapshot={}){check(snapshot.id===this.id,'CHAT_ID_MISMATCH');check(Array.isArray(snapshot.turns),'CHAT_TURNS_REQUIRED');for(let i=0;i<this.turns.length;i++)check(stable(this.turns[i])===stable(snapshot.turns[i]),'CHAT_HISTORY_MUTATION_REJECTED');for(const row of snapshot.turns.slice(this.turns.length)){const copy=clone(row),expectedPrevious=this.turns.length?this.turns[this.turns.length-1].hash:null;check(copy.previousHash===expectedPrevious,'CHAT_PREFIX_MISMATCH');this.turns.push(copy);this.revision++;}return this.snapshot();}
}

class TurnScopedInstructions{
 constructor(){this.rows=[];this.serial=0;this.userGeneration=0;}
 userTurn(){this.userGeneration++;this.rows=this.rows.filter(r=>r.clearAt!=='next_user_message'||r.createdGeneration>=this.userGeneration);return this.userGeneration;}
 add(input={}){check(input.text,'TURN_INSTRUCTION_TEXT_REQUIRED');const row={id:input.id||`tsi_${++this.serial}`,text:String(input.text),createdGeneration:this.userGeneration,clearAt:input.clearAt||'next_user_message',scope:input.scope||'chat',metadata:clone(input.metadata||{})};this.rows.push(row);return clone(row);}
 active(){return this.rows.filter(r=>r.clearAt==='never'||r.createdGeneration>=this.userGeneration).map(clone);}
 clear(id){this.rows=this.rows.filter(x=>x.id!==id);}
}

class AdaptiveEffortPolicy{
 constructor(input={}){this.defaultEffort=input.defaultEffort||'high';this.levels=['low','medium','high','xhigh','max'];}
 decide(input={}){const complexity=clamp(input.complexity??.35),uncertainty=clamp(input.uncertainty??.25),risk=clamp(input.risk??.15),longHorizon=clamp(input.longHorizon??0),freshness=input.searchRequested||input.timeSensitive?1:0,quality=clamp(input.qualityPriority??.8),latency=clamp(input.latencyPriority??.55),score=complexity*.28+uncertainty*.20+risk*.18+longHorizon*.18+freshness*.07+quality*.16-latency*.18;let effort='low';if(score>.12)effort='medium';if(score>.30)effort='high';if(score>.55)effort='xhigh';if(score>.76)effort='max';if((input.searchRequested||input.toolHeavy)&&effort==='low')effort='medium';if(input.forceEffort&&this.levels.includes(input.forceEffort))effort=input.forceEffort;if(input.maxEffort&&this.levels.includes(input.maxEffort)&&this.levels.indexOf(effort)>this.levels.indexOf(input.maxEffort))effort=input.maxEffort;return{effort,score:+score.toFixed(3),reason:{complexity,uncertainty,risk,longHorizon,freshness,qualityPriority:quality,latencyPriority:latency},authority:'derived_effort_policy'};}
}

class CompactionLedger{
 constructor(){this.rows=new Map();this.serial=0;}
 add(input={}){check(Array.isArray(input.sourceTurnIds)&&input.sourceTurnIds.length,'COMPACTION_SOURCES_REQUIRED');check(input.summary!=null,'COMPACTION_SUMMARY_REQUIRED');const id=input.id||`compact_${++this.serial}`,row={id,sourceTurnIds:[...input.sourceTurnIds],sourcePrefixHash:input.sourcePrefixHash||null,summary:clone(input.summary),mustPreserve:clone(input.mustPreserve||{}),estimatedSourceTokens:Number(input.estimatedSourceTokens||0),estimatedSummaryTokens:estimateTokens(input.summary),transform:input.transform||'summary',authority:'derived_compaction',createdAt:input.createdAt||Date.now()};this.rows.set(id,row);return clone(row);}
 get(id){const x=this.rows.get(id);check(x,'COMPACTION_NOT_FOUND');return clone(x);}
 list(){return[...this.rows.values()].map(clone);}
}

class VirtualContextCompiler{
 constructor(input={}){this.defaultBudget=Math.max(512,Number(input.defaultBudget||12000));this.recentShare=clamp(input.recentShare??.55,.2,.9);}
 _score(turn,querySet,latestSeq,pinnedIds){const t=new Set(words(stable(turn.content))),over=[...querySet].filter(x=>t.has(x)).length,recency=latestSeq?turn.seq/latestSeq:0,pin=pinnedIds.has(turn.id)?5:0,source=turn.authority==='source'?.4:0;return pin+over*2+recency*.8+source;}
 compile(input={}){const turns=(input.turns||input.conversation?.list?.()||[]).map(clone),budget=Math.max(256,Number(input.tokenBudget||this.defaultBudget)),query=String(input.query||''),q=new Set(words(query)),pinnedIds=new Set(input.pinnedTurnIds||[]),latest=turns.length?turns[turns.length-1].seq:0,virtualTokens=turns.reduce((n,x)=>n+estimateTokens(x.content),0),system=turns.filter(x=>x.role==='system'),nonSystem=turns.filter(x=>x.role!=='system');let used=0;const picked=[],pickedIds=new Set();const take=t=>{const cost=estimateTokens(t.content);if(pickedIds.has(t.id)||used+cost>budget)return false;picked.push(t);pickedIds.add(t.id);used+=cost;return true;};for(const t of system)take(t);for(const t of nonSystem.filter(x=>pinnedIds.has(x.id)).sort((a,b)=>a.seq-b.seq))take(t);const recentBudget=Math.max(128,Math.floor(budget*this.recentShare)),recent=[];let ru=0;for(let i=nonSystem.length-1;i>=0;i--){const t=nonSystem[i],cost=estimateTokens(t.content);if(!pickedIds.has(t.id)&&ru+cost<=recentBudget){recent.unshift(t);ru+=cost;}}for(const t of recent)take(t);const ranked=nonSystem.filter(x=>!pickedIds.has(x.id)).map(t=>({t,score:this._score(t,q,latest,pinnedIds)})).sort((a,b)=>b.score-a.score||b.t.seq-a.t.seq);for(const x of ranked)take(x.t);const compactions=(input.compactions||[]).filter(c=>c.sourceTurnIds?.some(id=>!pickedIds.has(id)));for(const c of compactions){const synthetic={id:`compaction:${c.id}`,seq:0,role:'system',content:{type:'compaction',summary:clone(c.summary),mustPreserve:clone(c.mustPreserve),sourceTurnIds:[...c.sourceTurnIds],sourcePrefixHash:c.sourcePrefixHash},authority:'derived',sourceRefs:[...c.sourceTurnIds]};take(synthetic);}picked.sort((a,b)=>{if(a.role==='system'&&b.role!=='system')return-1;if(b.role==='system'&&a.role!=='system')return 1;return(a.seq||0)-(b.seq||0);});const messages=picked.map(x=>({role:x.role,content:clone(x.content),_seven:{turnId:x.id,authority:x.authority,sourceRefs:[...(x.sourceRefs||[])]}}));return{messages,manifest:{selectedTurnIds:picked.map(x=>x.id),sourceTurnIds:picked.filter(x=>!String(x.id).startsWith('compaction:')).map(x=>x.id),compactionIds:picked.filter(x=>String(x.id).startsWith('compaction:')).map(x=>String(x.id).slice(11)),query,conversationRevision:input.conversation?.revision??null},materializedTokens:used,virtualTokens,compressionRatio:virtualTokens?+(used/virtualTokens).toFixed(4):1,budget,authority:'derived_context_view'};}
}

class CompletionContract{
 constructor(input={}){this.id=input.id||`contract_${Date.now()}`;this.criteria=(input.criteria||[]).map((x,i)=>({id:x.id||`c${i+1}`,label:x.label||String(x),required:x.required!==false,status:'pending',evidenceRefs:[]}));this.blockers=[];this.createdAt=Date.now();}
 mark(id,input={}){const c=this.criteria.find(x=>x.id===id);check(c,'COMPLETION_CRITERION_NOT_FOUND');c.status=input.status||'done';c.evidenceRefs=[...(input.evidenceRefs||[])];return this.snapshot();}
 block(input={}){this.blockers.push({id:input.id||`b${this.blockers.length+1}`,reason:String(input.reason||'blocked'),recoverable:input.recoverable!==false,evidenceRefs:[...(input.evidenceRefs||[])]});return this.snapshot();}
 snapshot(){const required=this.criteria.filter(x=>x.required),done=required.filter(x=>x.status==='done').length;return{id:this.id,criteria:clone(this.criteria),blockers:clone(this.blockers),progress:required.length?+(done/required.length).toFixed(3):1,done:required.every(x=>x.status==='done')&&this.blockers.filter(x=>!x.recoverable).length===0,authority:'authoritative_task_contract'};}
}

class ProgressJournal{
 constructor(){this.rows=[];}
 push(input={}){const row={id:input.id||`progress_${this.rows.length+1}`,stage:input.stage||'working',message:String(input.message||''),state:input.state||'active',at:input.at||Date.now(),evidenceRefs:[...(input.evidenceRefs||[])]};this.rows.push(row);return clone(row);}
 public(){return this.rows.map(clone);}
}

class RubricVerifier{
 constructor(input={}){this.rubric=input.rubric||[{id:'instruction',weight:.22,required:true},{id:'correctness',weight:.28,required:true},{id:'completeness',weight:.18,required:true},{id:'grounding',weight:.14,required:false},{id:'consistency',weight:.10,required:true},{id:'efficiency',weight:.08,required:false}];this.passScore=Number(input.passScore??.82);}
 evaluate(input={}){const checks=input.checks||{},rows=[],totalWeight=this.rubric.reduce((n,r)=>n+Number(r.weight||0),0)||1;let weighted=0,covered=0;for(const r of this.rubric){const raw=checks[r.id],known=raw!=null,score=known?clamp(typeof raw==='number'?raw:raw.score??(raw.pass===false?0:1)):null;if(known){weighted+=score*Number(r.weight||0);covered+=Number(r.weight||0);}rows.push({id:r.id,weight:r.weight,required:!!r.required,score,known,details:known&&typeof raw==='object'?clone(raw):null});}const normalized=covered?weighted/covered:0,missingRequired=rows.filter(x=>x.required&&!x.known).map(x=>x.id),failedRequired=rows.filter(x=>x.required&&x.known&&x.score<.5).map(x=>x.id),coverage=covered/totalWeight,pass=coverage>=.6&&normalized>=this.passScore&&!missingRequired.length&&!failedRequired.length;return{pass,score:+normalized.toFixed(4),coverage:+coverage.toFixed(4),rows,missingRequired,failedRequired,evidenceRefs:[...(input.evidenceRefs||[])],authority:'verified_answer_report'};}
}

class CandidateBank{
 constructor(){this.rows=[];}
 add(input={}){check(input.id&&input.output!=null,'CANDIDATE_REQUIRED');check(input.report?.authority==='verified_answer_report','CANDIDATE_VERIFIED_REPORT_REQUIRED');const row={id:input.id,output:clone(input.output),report:clone(input.report),latencyMs:Number(input.latencyMs||0),tokens:Number(input.tokens||estimateTokens(input.output)),modelId:input.modelId||null,workflowId:input.workflowId||null};this.rows.push(row);return clone(row);}
 rank(input={}){const latencyScale=Math.max(1,Number(input.latencyScaleMs||10000)),tokenScale=Math.max(1,Number(input.tokenScale||8000)),qualityWeight=Number(input.qualityWeight??.9),efficiencyWeight=1-qualityWeight;return this.rows.map(clone).map(x=>({...x,utility:+(x.report.score*qualityWeight-efficiencyWeight*(Math.min(1,x.latencyMs/latencyScale)*.55+Math.min(1,x.tokens/tokenScale)*.45)).toFixed(5)})).sort((a,b)=>b.utility-a.utility||b.report.score-a.report.score||a.latencyMs-b.latencyMs);}
 best(input={}){return this.rank(input)[0]||null;}
}

class LongHorizonCheckpointStore{
 constructor(){this.rows=new Map();this.serial=0;}
 save(input={}){check(input.sessionId,'CHECKPOINT_SESSION_REQUIRED');const id=input.id||`${input.sessionId}:cp:${++this.serial}`,row={id,sessionId:input.sessionId,conversationRevision:Number(input.conversationRevision||0),conversationPrefixHash:input.conversationPrefixHash||null,contract:clone(input.contract||null),publicProgress:clone(input.publicProgress||[]),workspaceState:clone(input.workspaceState||{}),pending:clone(input.pending||[]),evidenceRefs:[...(input.evidenceRefs||[])],createdAt:input.createdAt||Date.now(),authority:'authoritative_checkpoint'};this.rows.set(id,row);return clone(row);}
 latest(sessionId){const rows=[...this.rows.values()].filter(x=>x.sessionId===sessionId).sort((a,b)=>b.createdAt-a.createdAt);return rows.length?clone(rows[0]):null;}
}

class ChatTurnPlanner{
 constructor(input={}){this.effort=input.effort||new AdaptiveEffortPolicy();}
 assess(input={}){const text=String(input.text||input.userInput||''),len=Math.min(1,text.length/5000),multi=/\b(and|then|also|compare|research|build|implement|analyze)\b/gi.test(text)||/(وابحث|وأنشئ|وطور|ثم|قارن|حلل|نفذ)/.test(text),fresh=/\b(latest|today|current|recent|news|price|version|release)\b/i.test(text)||/(أحدث|اليوم|حاليا|حاليًا|اخبار|أخبار|سعر|إصدار)/.test(text),code=/\b(code|repo|bug|test|function|class|api)\b/i.test(text)||/(كود|مشروع|خطأ|اختبار|دالة|واجهة)/.test(text);return{complexity:clamp(input.complexity??(.22+len*.25+(multi?.22:0)+(code?.14:0))),uncertainty:clamp(input.uncertainty??(fresh?.6:.22)),risk:clamp(input.risk??.12),longHorizon:clamp(input.longHorizon??(text.length>1800?.55:multi?.35:.08)),searchRequested:input.searchRequested??fresh,toolHeavy:input.toolHeavy??code,timeSensitive:input.timeSensitive??fresh};}
 plan(input={}){const assessment=this.assess(input),effort=this.effort.decide({...input,...assessment}),hard=effort.effort==='xhigh'||effort.effort==='max',candidateCount=effort.effort==='low'?1:effort.effort==='medium'?1:effort.effort==='high'?2:hard?3:2,verification=effort.effort!=='low'||assessment.risk>.35||assessment.searchRequested,repairRounds=effort.effort==='max'?2:verification?1:0;return{assessment,effort,candidateCount,verification,repairRounds,batchIndependentTools:true,appendOnlyHistory:true,progressUpdates:assessment.longHorizon>.3||assessment.toolHeavy,finishWholeTask:true,contextPolicy:{preserve:['user_constraints','decisions','exact_identifiers','unfinished_work','source_lineage'],preferRecent:true,retrieveRelevant:true,neverMutateHistory:true},authority:'derived_chat_turn_plan'};}
}

class FrontierChatFabric{
 constructor(input={}){this.conversation=input.conversation||new AppendOnlyConversation({id:input.sessionId});this.instructions=input.instructions||new TurnScopedInstructions();this.compactions=input.compactions||new CompactionLedger();this.context=input.context||new VirtualContextCompiler(input.contextOptions||{});this.planner=input.planner||new ChatTurnPlanner(input.plannerOptions||{});this.progress=input.progress||new ProgressJournal();this.checkpoints=input.checkpoints||new LongHorizonCheckpointStore();this.contracts=new Map();}
 user(content,input={}){this.instructions.userTurn();return this.conversation.append({role:'user',content,sourceRefs:input.sourceRefs,authority:'source',metadata:input.metadata});}
 system(content,input={}){return this.conversation.append({role:'system',content,sourceRefs:input.sourceRefs,authority:input.authority||'source',metadata:input.metadata});}
 assistant(content,input={}){return this.conversation.append({role:'assistant',content,sourceRefs:input.sourceRefs,authority:input.authority||'derived',metadata:input.metadata});}
 createContract(input={}){const c=new CompletionContract(input);this.contracts.set(c.id,c);return c;}
 planTurn(input={}){const plan=this.planner.plan(input),compiled=this.context.compile({conversation:this.conversation,query:input.text||input.userInput||'',tokenBudget:input.tokenBudget,pinnedTurnIds:input.pinnedTurnIds,compactions:this.compactions.list()});return{...plan,context:compiled,turnScopedInstructions:this.instructions.active(),conversationRevision:this.conversation.revision,conversationPrefixHash:this.conversation.prefixHash()};}
 compact(input={}){const ids=input.sourceTurnIds||this.conversation.turns.slice(0,-Math.max(1,Number(input.keepRecent||8))).map(x=>x.id),rows=ids.map(id=>this.conversation.get(id)),prefixSeq=Math.max(...rows.map(x=>x.seq),0);return this.compactions.add({sourceTurnIds:ids,sourcePrefixHash:this.conversation.prefixHash(prefixSeq),summary:input.summary,mustPreserve:input.mustPreserve,estimatedSourceTokens:rows.reduce((n,x)=>n+estimateTokens(x.content),0),transform:input.transform});}
 checkpoint(input={}){return this.checkpoints.save({sessionId:this.conversation.id,conversationRevision:this.conversation.revision,conversationPrefixHash:this.conversation.prefixHash(),contract:input.contract?.snapshot?.()||input.contract||null,publicProgress:this.progress.public(),workspaceState:input.workspaceState,pending:input.pending,evidenceRefs:input.evidenceRefs});}
}

return{estimateTokens,stable,hash,AppendOnlyConversation,TurnScopedInstructions,AdaptiveEffortPolicy,CompactionLedger,VirtualContextCompiler,CompletionContract,ProgressJournal,RubricVerifier,CandidateBank,LongHorizonCheckpointStore,ChatTurnPlanner,FrontierChatFabric};
});