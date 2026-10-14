'use strict';
const assert=require('node:assert/strict');
const State=require('../release/workspaces/rpg-state.js');
const Context=require('../release/workspaces/rpg-context.js');
const { parseGatewayClientKeys, toRuntimeEnv }=require('./gateway-client-keys.cjs');
// Load credentials from the bundled GATEWAY_CLIENT_KEYS secret (never logged).
// Values act as a secure fallback for the per-provider SEVEN_RPG_*_KEY env vars.
const gatewayEnv=toRuntimeEnv(parseGatewayClientKeys(process.env.GATEWAY_CLIENT_KEYS));
for (const [k,v] of Object.entries(gatewayEnv)) { if (!process.env[k]) process.env[k]=v; }
const providers=[
 {name:'Groq',key:process.env.SEVEN_RPG_GROQ_KEY,url:'https://api.groq.com/openai/v1/chat/completions',model:'llama-3.1-8b-instant'},
 {name:'OpenRouter',key:process.env.SEVEN_RPG_OPENROUTER_KEY,url:'https://openrouter.ai/api/v1/chat/completions',model:'openai/gpt-oss-20b:free'},
 {name:'NVIDIA',key:process.env.SEVEN_RPG_NVIDIA_KEY,url:'https://integrate.api.nvidia.com/v1/chat/completions',model:'meta/llama-3.1-8b-instruct'},
 {name:'Mistral',key:process.env.SEVEN_RPG_MISTRAL_KEY,url:'https://api.mistral.ai/v1/chat/completions',model:'mistral-small-latest'}
];
const cloud=providers.filter(p=>p.key&&p.key.trim());
const local=process.env.SEVEN_RPG_ALLOW_LOCAL_LLM==='true'?{
 name:'Ollama real local Qwen',key:'local-only',url:'http://127.0.0.1:11434/v1/chat/completions',model:'qwen2.5:1.5b-instruct'
}:null;
const available=[...cloud,...(local?[local]:[])];
if(!available.length){console.error('BLOCKED: No cloud credentials or explicitly enabled local Ollama inference. A real LLM is required.');process.exit(2)}
const seed=State.createState({
 sessionId:'live-rpg-acceptance',worldId:'valen',
 timeline:{tick:3},world:{locations:{palace:{name:'Palace'}}},
 characters:{ali:{control:'player',locationId:'palace'},aria:{control:'ai',locationId:'palace'},spy:{control:'ai',locationId:'palace'}},
 canon:{entries:{
  ruler:{level:'HARD',value:'Aldren is king',public:true,entityIds:['ali','aria','spy']},
  pact:{level:'HARD',value:'Hidden pact of Asterion exists',public:false,availableAtTick:3,entityIds:['ali']}
 }}
});
const characterView=Context.buildCharacterView(seed,State,'aria',{maxChars:8000});
assert.equal(characterView.ok,true,'NPC view must exist');
const visible=characterView.view.knownCanon||[];
assert.ok(visible.some(f=>f.id==='ruler'),'public canon must be in NPC context');
assert.ok(!visible.some(f=>f.id==='pact'),'secret must be excluded from NPC context');
assert.equal(Context.validateNoKnowledgeLeak(characterView.view,seed,State,'aria').valid,true);
const prompt=[
 'You are the narrator of a bounded RPG. Respond ONLY as a JSON object with keys',
 'speaker, dialogue, playerAction, canonDelta. speaker must be aria;',
 'dialogue is only dialogue from Aria, no narration about the player;',
 'playerAction must be null; canonDelta must be an empty array.',
 'Only use the NPC knowledge supplied to you. Never invent private knowledge.',
 'Allowed character canon: '+JSON.stringify(visible.map(f=>({id:f.id,value:f.value}))),
 'The player Ali asks: "Aria, what do you think about the coming council?"'
].join(' ');
async function runProvider(provider){
 const model=process.env.SEVEN_RPG_LIVE_MODEL||provider.model;
 const response=await fetch(provider.url,{
  method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+provider.key},
  body:JSON.stringify({model,temperature:0,max_tokens:350,...(provider.name.startsWith('Ollama')?{response_format:{type:'json_object'}}:{}),messages:[{role:'system',content:prompt},{role:'user',content:'Answer as Aria only, in JSON.'}]}),
  signal:AbortSignal.timeout(30000)
 });
 if(!response.ok)throw Error('HTTP '+response.status);
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
 console.log(JSON.stringify({gate:'RPG_LIVE_LLM_CANON',status:'PASS',model,provider:provider.name,realHttpInference:true,npcKnowledgeProjection:'PASS',playerAgency:'PASS',hardCanon:'PASS',knowledgeBoundary:'PASS'}));
}
async function run(){
 const failures=[];
 for(const provider of available){
  try { await runProvider(provider); return; }
  catch(e){
   const reason=e.message.replace(/[^a-zA-Z0-9 .:_-]/g,'').slice(0,160);
   console.error('RPG_LIVE_LLM_CANON provider attempt failed:',provider.name,reason);
   failures.push(provider.name+': '+reason);
  }
 }
 throw Error('All configured providers failed ('+failures.map(f=>f.split(':')[0]).join(', ')+')');
}
run().catch(e=>{console.error('RPG_LIVE_LLM_CANON FAIL:',e.message);process.exitCode=1});
