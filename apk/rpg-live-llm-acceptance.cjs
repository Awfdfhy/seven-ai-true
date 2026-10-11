'use strict';
const assert=require('node:assert/strict');
const State=require('../release/workspaces/rpg-state.js');
const providers=[
 {name:'Groq',key:process.env.SEVEN_RPG_GROQ_KEY,url:'https://api.groq.com/openai/v1/chat/completions',model:'llama-3.1-8b-instant'},
 {name:'OpenRouter',key:process.env.SEVEN_RPG_OPENROUTER_KEY,url:'https://openrouter.ai/api/v1/chat/completions',model:'openai/gpt-oss-20b:free'},
 {name:'NVIDIA',key:process.env.SEVEN_RPG_NVIDIA_KEY,url:'https://integrate.api.nvidia.com/v1/chat/completions',model:'meta/llama-3.1-8b-instruct'},
 {name:'Mistral',key:process.env.SEVEN_RPG_MISTRAL_KEY,url:'https://api.mistral.ai/v1/chat/completions',model:'mistral-small-latest'}
];
const provider=providers.find(p=>p.key&&p.key.trim());
if(!provider){console.error('BLOCKED: no live provider secret (GROQ_API_KEY, OPENROUTER_API_KEY, NVIDIA_API_KEY or MISTRAL_API_KEY)');process.exit(2)}
const key=provider.key,model=process.env.SEVEN_RPG_LIVE_MODEL||provider.model;
const seed=State.createState({
 sessionId:'live-rpg-acceptance',worldId:'valen',
 timeline:{tick:3},world:{locations:{palace:{name:'Palace'}}},
 characters:{ali:{control:'player',locationId:'palace'},aria:{control:'ai',locationId:'palace'},spy:{control:'ai',locationId:'palace'}},
 canon:{entries:{
  ruler:{level:'HARD',value:'Aldren is king',public:true,entityIds:['ali','aria','spy']},
  pact:{level:'HARD',value:'Hidden pact of Asterion exists',public:false,availableAtTick:3,entityIds:['ali']}
 }}
});
const prompt=[
 'You are the narrator of a bounded RPG. Respond ONLY as a JSON object with keys',
 'speaker, dialogue, playerAction, canonDelta. speaker must be aria;',
 'dialogue is only dialogue from Aria, no narration about the player;',
 'playerAction must be null; canonDelta must be an empty array.',
 'Do not alter the fact Aldren is king. Aria cannot know a hidden pact.',
 'The player Ali asks: "Aria, what do you think about the coming council?"'
].join(' ');
async function run(){
 const response=await fetch(provider.url,{
  method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},
  body:JSON.stringify({model,temperature:0,max_tokens:350,messages:[{role:'system',content:prompt},{role:'user',content:'Answer as Aria only, in JSON.'}]}),
  signal:AbortSignal.timeout(30000)
 });
 if(!response.ok)throw Error('Provider error HTTP '+response.status);
 const data=await response.json();
 const raw=data.choices?.[0]?.message?.content;
 assert.equal(typeof raw,'string','No live model response');
 const answer=JSON.parse(raw);
 assert.equal(String(answer.speaker||'').toLowerCase(),'aria');
 assert.equal(typeof answer.dialogue,'string');
 assert.ok(answer.dialogue.trim().length>2);
 assert.equal(answer.playerAction,null,'LLM attempted player control');
 assert.deepEqual(answer.canonDelta,[],'LLM proposed unauthorized canon rewrite');
 assert.ok(!/hidden pact|asterion pact/i.test(answer.dialogue),'NPC knowledge leakage');
 const bad=State.applyEvent(seed,{id:'llm-player',type:'character.move',source:'runtime',actorId:'ali',payload:{characterId:'ali',toLocationId:'palace'}});
 assert.equal(bad.reason,'player-control');
 const rewrite=State.applyEvent(seed,{id:'llm-canon',type:'canon.set',source:'runtime',payload:{id:'ruler',entry:{level:'HARD',value:'Another ruler'}}});
 assert.equal(rewrite.reason,'hard-canon-conflict');
 console.log(JSON.stringify({gate:'RPG_LIVE_LLM_CANON',status:'PASS',model,provider:provider.name,playerAgency:'PASS',hardCanon:'PASS',knowledgeBoundary:'PASS'}));
}
run().catch(e=>{console.error('RPG_LIVE_LLM_CANON FAIL:',e.message);process.exitCode=1});
