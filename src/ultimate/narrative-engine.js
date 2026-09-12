(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateNarrative=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));const check=(v,m)=>{if(!v)throw new Error(m)};const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,Number(n)||0));
const THREAD_STATUS=new Set(['open','partially_resolved','dormant','active','resolved','failed','superseded','abandoned']);
class NarrativeThreadRegistry{
 constructor(){this.threads=new Map();}
 create(input={}){check(input.id&&!this.threads.has(input.id),'THREAD_EXISTS');const t={id:input.id,title:input.title||input.id,status:input.status||'open',importance:clamp(input.importance??50),originEventRef:input.originEventRef||null,events:[],questions:[...(input.questions||[])],characters:[...(input.characters||[])],lastProgress:null};this.threads.set(t.id,t);return clone(t);}
 advance(id,input={}){const t=this.threads.get(id);check(t,'THREAD_NOT_FOUND');if(input.status){check(THREAD_STATUS.has(input.status),'THREAD_STATUS');t.status=input.status;}if(input.sourceEventRef)t.events.push({sourceEventRef:input.sourceEventRef,action:input.action||'advance',note:input.note||null});if(input.questionResolved)t.questions=t.questions.filter(q=>q!==input.questionResolved);t.lastProgress=input.episodeId||input.sourceEventRef||t.lastProgress;return clone(t);}
 active(){return[...this.threads.values()].filter(t=>!['resolved','failed','superseded','abandoned'].includes(t.status)).sort((a,b)=>b.importance-a.importance).map(clone);}
}
class PromisePayoffMatrix{
 constructor(){this.promises=new Map();}
 add(input={}){check(input.id&&!this.promises.has(input.id),'PROMISE_EXISTS');const p={id:input.id,type:input.type||'narrative',text:input.text||'',introducedAt:input.introducedAt||null,status:'open',importance:clamp(input.importance??50),payoffEventRef:null,intentionallyUnresolved:false};this.promises.set(p.id,p);return clone(p);}
 payoff(id,eventRef){const p=this.promises.get(id);check(p,'PROMISE_NOT_FOUND');check(eventRef,'PAYOFF_EVENT_REQUIRED');p.status='paid';p.payoffEventRef=eventRef;return clone(p);}
 defer(id,reason){const p=this.promises.get(id);check(p,'PROMISE_NOT_FOUND');p.status='deferred';p.deferReason=reason||null;return clone(p);}
 abandon(id,explicit=true){const p=this.promises.get(id);check(p,'PROMISE_NOT_FOUND');p.status='abandoned';p.intentionallyUnresolved=!!explicit;return clone(p);}
 due(minImportance=60){return[...this.promises.values()].filter(p=>['open','deferred'].includes(p.status)&&p.importance>=minImportance).sort((a,b)=>b.importance-a.importance).map(clone);}
}
class ForeshadowingEngine{
 constructor(){this.seeds=new Map();}
 plant(input={}){check(input.id&&!this.seeds.has(input.id),'SEED_EXISTS');const s={id:input.id,targetThreadId:input.targetThreadId||null,sourceEventRef:input.sourceEventRef||null,strength:clamp(input.strength??30),earliestEpisode:Number(input.earliestEpisode||1),latestUsefulEpisode:input.latestUsefulEpisode==null?null:Number(input.latestUsefulEpisode),visibility:input.visibility||'subtle',allowedRevealers:[...(input.allowedRevealers||[])],status:'planted',payoffEventRef:null};this.seeds.set(s.id,s);return clone(s);}
 eligible(episode,context={}){return[...this.seeds.values()].filter(s=>s.status==='planted'&&episode>=s.earliestEpisode&&(s.latestUsefulEpisode==null||episode<=s.latestUsefulEpisode)&&(!s.allowedRevealers.length||s.allowedRevealers.some(x=>(context.presentCharacters||[]).includes(x)))).map(clone);}
 resolve(id,eventRef){const s=this.seeds.get(id);check(s,'SEED_NOT_FOUND');s.status='resolved';s.payoffEventRef=eventRef;return clone(s);}
}
class PacingEngine{
 constructor(window=5){this.window=window;this.scenes=[];}
 record(input={}){const s={tension:clamp(input.tension),mystery:clamp(input.mystery),emotion:clamp(input.emotion),action:clamp(input.action),politics:clamp(input.politics),humor:clamp(input.humor),downtime:clamp(input.downtime),information:clamp(input.information)};this.scenes.push(s);if(this.scenes.length>100)this.scenes.shift();return clone(s);}
 analyze(){const recent=this.scenes.slice(-this.window);if(!recent.length)return{recommendation:'none',fatigue:false};const avg=k=>recent.reduce((n,s)=>n+s[k],0)/recent.length;const tension=avg('tension'),action=avg('action'),downtime=avg('downtime'),information=avg('information');let recommendation='continue';let fatigue=false;if(tension>78&&action>65&&downtime<25){recommendation='breathing_scene_if_causally_valid';fatigue=true;}else if(tension<30&&action<25&&recent.length>=this.window)recommendation='advance_pressure_or_reveal';else if(information>82)recommendation='reduce_exposition_and_dramatize';return{recommendation,fatigue,averages:{tension:+tension.toFixed(1),action:+action.toFixed(1),downtime:+downtime.toFixed(1),information:+information.toFixed(1)}};}
}
class SceneContractBuilder{
 build(input={}){check(input.location&&input.time,'SCENE_LOCATION_TIME_REQUIRED');return{location:input.location,time:input.time,presentCharacters:[...(input.presentCharacters||[])],changesSinceLastScene:clone(input.changesSinceLastScene||[]),characterGoals:clone(input.characterGoals||{}),conflict:clone(input.conflict||null),availableInformation:clone(input.availableInformation||{}),relevantThreads:[...(input.relevantThreads||[])],promisesDue:[...(input.promisesDue||[])],foreshadowingAvailable:[...(input.foreshadowingAvailable||[])],mustNot:[...(input.mustNot||[])],possibleExits:[...(input.possibleExits||[])],endingState:'unknown'};}
}
class DialogueIntentEngine{
 constructor(){this.valid=new Set(['inform','conceal','challenge','comfort','deflect','persuade','test','threaten','joke','negotiate','observe','refuse','question']);}
 annotate(line,input={}){const intents=[...(input.intents||[])];for(const i of intents)check(this.valid.has(i),'DIALOGUE_INTENT');return{text:String(line||''),speakerId:input.speakerId||null,intents,public:input.public!==false,targetIds:[...(input.targetIds||[])]};}
}
class NarrativeQualityJudge{
 judge(input={}){const issues=[];const paragraphs=String(input.text||'').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);const normalized=paragraphs.map(x=>x.toLowerCase().replace(/\s+/g,' '));const seen=new Set();for(const p of normalized){if(seen.has(p)&&p.length>30)issues.push('REPEATED_PARAGRAPH');seen.add(p);}if(input.claimedCharacterThought&&!input.playerThoughtAuthorized)issues.push('PLAYER_THOUGHT_OWNERSHIP');if(input.retconWithoutSource)issues.push('RETROACTIVE_CLEVERNESS');if(input.knowledgeLeak)issues.push('KNOWLEDGE_LEAK');if(input.timelineConflict)issues.push('TIMELINE_CONFLICT');return{pass:issues.length===0,issues:[...new Set(issues)]};}
}
class NarrativeCompiler{
 constructor(){this.threads=new NarrativeThreadRegistry();this.promises=new PromisePayoffMatrix();this.foreshadow=new ForeshadowingEngine();this.pacing=new PacingEngine();this.contracts=new SceneContractBuilder();this.dialogue=new DialogueIntentEngine();this.quality=new NarrativeQualityJudge();}
 planScene(input={}){const episode=Number(input.episode||1),activeThreads=this.threads.active().slice(0,input.threadLimit||6),promises=this.promises.due(input.promiseImportance||60).slice(0,6),seeds=this.foreshadow.eligible(episode,{presentCharacters:input.presentCharacters||[]}).slice(0,4);const contract=this.contracts.build({...input,relevantThreads:input.relevantThreads||activeThreads.map(x=>x.id),promisesDue:input.promisesDue||promises.map(x=>x.id),foreshadowingAvailable:input.foreshadowingAvailable||seeds.map(x=>x.id)});return{contract,activeThreads,promisesDue:promises,foreshadowing:seeds,pacing:this.pacing.analyze()};}
}
return{THREAD_STATUS:Object.freeze([...THREAD_STATUS]),NarrativeThreadRegistry,PromisePayoffMatrix,ForeshadowingEngine,PacingEngine,SceneContractBuilder,DialogueIntentEngine,NarrativeQualityJudge,NarrativeCompiler};
});
