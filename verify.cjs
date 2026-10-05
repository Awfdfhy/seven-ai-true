const {chromium}=require('playwright');
const fs=require('fs'), http=require('http'), assert=require('assert/strict');
const html=fs.readFileSync(require('path').join(__dirname,'seven_ai-final.html'),'utf8');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(html)});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});
 const results=[];
 async function test(name,fn){await fn();results.push({name,status:'PASS'});console.log('PASS',name)}
 const context=await browser.newContext();
 await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
 const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin);
 await page.waitForFunction(()=>roomPersistence.status().ready);
 await test('initial IDB migration and UI boot',async()=>{assert.equal(await page.evaluate(()=>roomPersistence.status().revision),1);assert.deepEqual(errors,[])});
 await test('auto context budget is bounded by the controller model window',async()=>{
  const r=await page.evaluate(()=>{
    const oldMode=currentRoutingMode;currentRoutingMode='auto';
    try{const limits=modelLimits(currentModel),output=Math.min(currentMaxTokens,limits.maxTokens),budget=getContextInputTokenBudget(currentModel,output);return {budget,window:limits.contextWindow,output}}
    finally{currentRoutingMode=oldMode}
  });
  assert.ok(r.budget+r.output+2048<=r.window);
 });
 await test('composer IME composition blocks Enter send until composition ends',async()=>{
  const r=await page.evaluate(()=>{
    const input=document.getElementById('userInput'),old=sendMessage;let calls=0;
    sendMessage=()=>{calls++};
    try{
      input.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true,data:'م'}));
      input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
      const during=calls;
      input.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true,data:'مرحبا'}));
      input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
      return {during,after:calls,composition:composerCompositionActive,inlineGrow:input.hasAttribute('oninput')};
    }finally{sendMessage=old;composerCompositionActive=false}
  });
  assert.deepEqual(r,{during:0,after:1,composition:false,inlineGrow:false});
 });
 await test('room commit/reload and untouched legacy keys',async()=>{
  await page.evaluate(async()=>{rooms.default.history.push({role:'user',content:'مرحبا Seven 123 /src/A.js'});await saveRooms()});
  assert.equal(await page.evaluate(()=>localStorage.getItem('chat_rooms_v6')),null);
  await page.reload();await page.waitForFunction(()=>roomPersistence.status().ready);
  assert.equal(await page.evaluate(()=>rooms.default.history[0].content),'مرحبا Seven 123 /src/A.js');
 });
 await test('room switch cancels only the originating active generation',async()=>{
  const r=await page.evaluate(()=>{
    const originalRoom=currentRoom,other='room-switch-fixture';
    rooms[other]=createEmptyRoom();roomTitles[other]='Other';
    let aborts=0;activeAbortController={abort(){aborts++}};
    isGenerating=true;activeGenerationRoomId=originalRoom;stopRequested=false;
    switchRoom(other);
    const first={room:currentRoom,stopped:stopRequested,aborts,origin:activeGenerationRoomId};
    stopRequested=false;aborts=0;
    const wrongRoomStop=stopGeneration();
    const second={wrongRoomStop,stopped:stopRequested,aborts};
    isGenerating=false;activeGenerationRoomId=null;activeAbortController=null;stopRequested=false;
    delete rooms[other];delete roomTitles[other];currentRoom=originalRoom;updateRoomTitle();renderChatHistory();updateRoomListUI();
    return {first,second};
  });
  assert.equal(r.first.stopped,true);assert.equal(r.first.aborts,1);assert.equal(r.first.origin,'default');assert.equal(r.second.wrongRoomStop,false);assert.equal(r.second.stopped,false);assert.equal(r.second.aborts,0);
 });
 await test('structured RPG context is room-scoped and absent from normal chat',async()=>{
  const r=await page.evaluate(()=>{
    const oldWs=window.SevenWorkspaces,oldRpg=window.SevenRpgWorkspace;
    let requestedRoom=null;
    try{
      window.SevenWorkspaces={active:()=> 'rpg'};
      window.SevenRpgWorkspace={contextProjection:opts=>{requestedRoom=opts.roomId;return {schema:'seven-rpg-context',version:1,sessionId:'s-a',worldId:'valen',turn:7,canon:[{id:'king',value:'Aldren'}],_diagnostics:{bounded:true}}}};
      const room=createEmptyRoom();
      const rpgSources=collectContextSources(room,'continue',null,{roomId:'room-a'});
      const rpgBundle=compileContextBundle(room,'continue',null,{roomId:'room-a',inputBudgetTokens:4096});
      window.SevenWorkspaces={active:()=> 'chat'};
      const chatSources=collectContextSources(room,'continue',null,{roomId:'room-b'});
      return {
        requestedRoom,
        rpgCount:rpgSources.filter(x=>x.kind==='rpg').length,
        trusted:rpgSources.find(x=>x.kind==='rpg')?.trustedInstructions,
        serialized:rpgBundle.messages[0]?.content||'',
        chatCount:chatSources.filter(x=>x.kind==='rpg').length
      };
    }finally{window.SevenWorkspaces=oldWs;window.SevenRpgWorkspace=oldRpg}
  });
  assert.equal(r.requestedRoom,'room-a');assert.equal(r.rpgCount,1);assert.equal(r.trusted,false);assert.match(r.serialized,/<rpg_state>/);assert.match(r.serialized,/valen/);assert.equal(r.chatCount,0);
 });
 await test('room persistence stages durable WAL before async commit and clears it after commit',async()=>{
  const r=await page.evaluate(async()=>{
    await roomPersistence.flush();
    const blockerDb=await new Promise((resolve,reject)=>{const q=indexedDB.open('seven_ai_canonical_v1');q.onerror=()=>reject(q.error);q.onsuccess=()=>resolve(q.result)});
    let releaseBlocker;
    const blockerReady=new Promise((resolve,reject)=>{const tx=blockerDb.transaction(['state'],'readwrite'),store=tx.objectStore('state');let released=false;releaseBlocker=()=>{released=true};const pump=()=>{const q=store.get('rooms');q.onerror=()=>reject(q.error);q.onsuccess=()=>{resolve();if(!released)pump()}};pump()});
    await blockerReady;
    roomTitles.default='wal-stage-'+Date.now();
    const p=saveRooms();
    let staged=false;for(let i=0;i<120;i++){if(roomPersistence.status().walStaged){staged=true;break}await new Promise(r=>setTimeout(r,10))}
    releaseBlocker();
    const ok=await p,cleared=!roomPersistence.status().walStaged&&localStorage.getItem('seven_ai_room_wal_v1')===null;
    blockerDb.close();return{staged,ok,cleared};
  });
  assert.deepEqual(r,{staged:true,ok:true,cleared:true});
 });
 await test('room persistence replays a newer crash WAL exactly once',async()=>{
  await page.evaluate(async()=>{await roomPersistence.flush();const base=roomPersistence.status().revision,value=JSON.parse(JSON.stringify({version:1,rooms,roomTitles,currentRoom}));value.roomTitles[value.currentRoom]='Recovered after process death';localStorage.setItem('seven_ai_room_wal_v1',JSON.stringify({schemaVersion:1,seq:Date.now()*1000+777,sessionId:'dead-process-fixture',baseRevision:base,value}))});
  await page.reload();await page.waitForFunction(()=>roomPersistence.status().ready);
  const r=await page.evaluate(()=>({title:roomTitles[currentRoom],wal:localStorage.getItem('seven_ai_room_wal_v1'),revision:roomPersistence.status().revision}));
  assert.equal(r.title,'Recovered after process death');assert.equal(r.wal,null);assert.ok(r.revision>=2);
 });
 await test('queued snapshots maintain order',async()=>{
  const r=await page.evaluate(async()=>{roomTitles.default='one';const a=saveRooms();roomTitles.default='two';const b=saveRooms();return [await a,await b]});assert.deepEqual(r,[true,true]);
  await page.reload();await page.waitForFunction(()=>roomPersistence.status().ready);assert.equal(await page.evaluate(()=>roomTitles.default),'two');
 });
 await test('stale tab fails rather than overwrite',async()=>{
  const other=await context.newPage();await other.goto(origin);await other.waitForFunction(()=>roomPersistence.status().ready);
  assert.equal(await page.evaluate(async()=>{roomTitles.default='winner';return await saveRooms()}),true);
  assert.equal(await other.evaluate(async()=>{roomTitles.default='stale';return await saveRooms()}),false);
  assert.equal(await other.evaluate(()=>roomPersistence.status().failed),true);await other.close();
 });
 const failedStorage=await browser.newContext();await failedStorage.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
 await failedStorage.addInitScript(()=>{Object.defineProperty(window,'indexedDB',{configurable:true,value:{open(){const q={result:null,error:null};setTimeout(()=>{q.error=new DOMException('blocked','InvalidStateError');q.onerror&&q.onerror()},0);return q}}})});
 const failedPage=await failedStorage.newPage();await failedPage.goto(origin);await failedPage.waitForFunction(()=>typeof roomPersistence!=='undefined'&&roomPersistence.status().failed);
 await test('storage startup failure restores interactive recovery UI',async()=>{
  const r=await failedPage.evaluate(()=>({inert:document.body.inert,ready:roomPersistence.status().ready,failed:roomPersistence.status().failed,status:document.getElementById('persistenceStatus')?.textContent||'',focusable:(()=>{const e=document.getElementById('userInput');e?.focus();return document.activeElement===e})()}));
  assert.equal(r.inert,false);assert.equal(r.ready,false);assert.equal(r.failed,true);assert.match(r.status,/Storage unavailable or invalid/);assert.equal(r.focusable,true);
 });
 await failedPage.close();await failedStorage.close();
 await test('atomic memory create update delete and history',async()=>{
  const r=await page.evaluate(()=>{const m=addMemory('I prefer Arabic explanations.');if(!m)return null;const before=getMemoryHistory(m.id).length;const u=updateMemory(m.id,'I prefer Arabic and English explanations.');const valid=verifyMemoryLedgerConsistency(m.id).consistent;const d=deleteMemory(m.id);return {before,u:!!u,valid,d,history:getMemoryHistory(m.id).length,legacy:localStorage.getItem(MEMORY_STORAGE_KEY)}});
  assert.deepEqual(r,{before:1,u:true,valid:true,d:true,history:3,legacy:null});
 });
 await test('failed memory write leaves state and ledger unchanged',async()=>{
  const r=await page.evaluate(()=>{const before=localStorage.getItem(MEMORY_BUNDLE_KEY);const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===MEMORY_BUNDLE_KEY)throw new DOMException('full','QuotaExceededError');return set.call(this,k,v)};let result;try{result=addMemory('This write should never persist.')}finally{Storage.prototype.setItem=set}return {failed:result===null,same:before===localStorage.getItem(MEMORY_BUNDLE_KEY)}});assert.deepEqual(r,{failed:true,same:true});
 });
 await test('memory metadata never grants action permission',async()=>{
  const r=await page.evaluate(()=>{const m=addMemory('I use this project for tests.');return canMemoryAuthorizeAction(m,{requireTrackedLedger:false,allowRestricted:true,minimumAuthority:'untrusted'})});assert.equal(r.allowed,false);assert.ok(r.reasons.includes('originalPermissionGrantRequired'));
 });
 await test('corrupt bundle cannot be overwritten',async()=>{
  const r=await page.evaluate(()=>{const before=localStorage.getItem(MEMORY_BUNDLE_KEY);localStorage.setItem(MEMORY_BUNDLE_KEY,'bad');const result=addMemory('Must not replace corrupted data.');const raw=localStorage.getItem(MEMORY_BUNDLE_KEY);localStorage.setItem(MEMORY_BUNDLE_KEY,before);return {result,raw}});assert.deepEqual(r,{result:null,raw:'bad'});
 });
 const legacy=await browser.newContext();await legacy.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
 await legacy.addInitScript(()=>{if(!localStorage.getItem('seeded')){localStorage.setItem('seeded','1');localStorage.setItem('user_name_asked','1');localStorage.setItem('chat_rooms_v6',JSON.stringify({custom:{history:[{role:'user',content:'legacy exact'}],knowledgeBase:'',summary:''}}));localStorage.setItem('room_titles_v6',JSON.stringify({custom:'Old title'}));localStorage.setItem('current_room_v6','custom')}});
 const p2=await legacy.newPage();await p2.goto(origin);await p2.waitForFunction(()=>roomPersistence.status().ready);
 await test('legacy room migration preserves ID title text and original',async()=>{assert.deepEqual(await p2.evaluate(()=>({id:currentRoom,title:roomTitles.custom,text:rooms.custom.history[0].content,old:JSON.parse(localStorage.getItem('chat_rooms_v6')).custom.history[0].content})),{id:'custom',title:'Old title',text:'legacy exact',old:'legacy exact'})});
 await test('room audit and state commit revisions agree',async()=>{const r=await page.evaluate(()=>new Promise(resolve=>{const q=indexedDB.open('seven_ai_canonical_v1');q.onsuccess=()=>{const tx=q.result.transaction(['state','audit']);let state,audit;tx.objectStore('state').get('rooms').onsuccess=e=>state=e.target.result;tx.objectStore('audit').getAll().onsuccess=e=>audit=e.target.result;tx.oncomplete=()=>{q.result.close();resolve({state:state.revision,last:audit.at(-1).revision,count:audit.length})}}}));assert.equal(r.state,r.last);assert.equal(r.count,r.state)});
 await test('free-only model catalog and credential-free backup',async()=>{
  const r=await page.evaluate(()=>{const old=localStorage.getItem('groq_api_key');localStorage.setItem('groq_api_key','sentinel-secret');const catalog=getFreeModelCatalog();const backup=buildCanonicalBackupPayload();if(old===null)localStorage.removeItem('groq_api_key');else localStorage.setItem('groq_api_key',old);return {allFree:catalog.length>0&&catalog.every(m=>m.free===true&&m.freeBasis!=='paid'),selection:isValidFreeModelSelection(currentModel),format:backup.format,version:backup.version,secret:JSON.stringify(backup).includes('sentinel-secret')}});
  assert.deepEqual(r,{allFree:true,selection:true,format:'seven-canonical-backup',version:2,secret:false});
 });
 await test('awesome free api pack is zero-key by default',async()=>{
  const r=await page.evaluate(()=>{const providers=['kilo','llm7','aion','mistral','zai'];const catalog=getFreeModelCatalog();return {providers:providers.every(id=>!!FREE_PROVIDER_REGISTRY[id]),seeds:['gpt-oss:20b','aion-labs/aion-3.0','mistral-small-latest','glm-4.7-flash'].every(id=>catalog.some(m=>m.id===id)),kilo:isFreeProviderConfigured('kilo'),llm7:isFreeProviderConfigured('llm7'),route:hasAnyConfiguredFreeProvider(),kiloModels:FREE_PROVIDER_REGISTRY.kilo.modelsUrl,kiloStatic:catalog.some(m=>m.provider==='kilo'&&!m.discovered)}});
  assert.deepEqual(r,{providers:true,seeds:true,kilo:true,llm7:true,route:true,kiloModels:'https://api.kilo.ai/api/gateway/models',kiloStatic:false});
 });

 await test('model intelligence v3 detects multi-intent requests with confidence',async()=>{
  const r=await page.evaluate(()=>{const x=SevenModelIntelligenceV3.analyze('Debug this JavaScript function and give a proof of why the algorithm is correct.',{workspace:'coding'});return {version:x.version,primary:x.primaryIntent,coding:x.taskWeights.coding,reasoning:x.taskWeights.reasoning,confidence:x.confidence,secondary:x.secondaryIntents.map(v=>v.id)}});
  assert.equal(r.version,3);assert.ok(r.coding>0.3);assert.ok(r.reasoning>0.12);assert.ok(r.confidence>0.5);assert.ok(r.primary==='coding'||r.secondary.includes('coding'));
 });
 await test('model intelligence v3 lowers confidence for ambiguous short requests',async()=>{
  const r=await page.evaluate(()=>SevenModelIntelligenceV3.analyze('help',{}).confidence);
  assert.ok(r<=0.45);
 });
 await test('model intelligence v3 enforces required vision capability',async()=>{
  const r=await page.evaluate(()=>{const ctx={version:3,taskWeights:{general:1,coding:0,reasoning:0,research:0,planning:0},intentWeights:{vision:.7},confidence:.8,complexity:'medium',requiredContext:4096,preferSpeed:false,preferPrecision:false,preferTools:false,preferVision:true,requireTools:false,requireVision:true,requireStructured:false,requireStreaming:true};const base={provider:'test',free:true,contextWindow:100000,quality:90,speed:80,tasks:{general:90},effort:null};return {noVision:SevenModelIntelligenceV3.score({...base,id:'a',capabilities:{stream:true,vision:false,tools:true,structured:true}},ctx).eligible,vision:SevenModelIntelligenceV3.score({...base,id:'b',capabilities:{stream:true,vision:true,tools:true,structured:true}},ctx).eligible}});
  assert.deepEqual(r,{noVision:false,vision:true});
 });
 await test('model intelligence v3 rejects insufficient context',async()=>{
  const r=await page.evaluate(()=>{const ctx={version:3,taskWeights:{general:1,coding:0,reasoning:0,research:0,planning:0},intentWeights:{},confidence:.7,complexity:'low',requiredContext:12000,preferSpeed:false,preferPrecision:false,preferTools:false,preferVision:false,requireTools:false,requireVision:false,requireStructured:false,requireStreaming:false};return SevenModelIntelligenceV3.score({provider:'test',id:'tiny',free:true,contextWindow:4096,quality:99,speed:99,tasks:{general:99},capabilities:{}},ctx).eligible});
  assert.equal(r,false);
 });
 await test('model intelligence v3 decays old failures instead of poisoning health forever',async()=>{
  const r=await page.evaluate(()=>{const model={provider:'groq',id:'health-fixture'};const key=freeHealthKey(model.provider,model.id),old=freeModelHealth[key];const now=Date.now();freeModelHealth[key]={successes:2,failures:5,latencyMs:600,lastSuccessAt:now-1000,lastFailureAt:now-1000,cooldownUntil:0,lastStatus:500};const recent=SevenModelIntelligenceV3.health(model,now).score;freeModelHealth[key]={successes:2,failures:5,latencyMs:600,lastSuccessAt:now-1000,lastFailureAt:now-6*60*60*1000,cooldownUntil:0,lastStatus:500};const stale=SevenModelIntelligenceV3.health(model,now).score;if(old===undefined)delete freeModelHealth[key];else freeModelHealth[key]=old;return {recent,stale}});
  assert.ok(r.stale>r.recent);
 });
 await test('model intelligence v3 respects provider-wide cooldown',async()=>{
  const r=await page.evaluate(()=>{const key=freeHealthKey('groq','*'),old=freeModelHealth[key];freeModelHealth[key]={successes:0,failures:1,latencyMs:0,lastSuccessAt:0,lastFailureAt:Date.now(),cooldownUntil:Date.now()+60000,lastStatus:429};const state=SevenModelIntelligenceV3.health({provider:'groq',id:'fixture'}).state;if(old===undefined)delete freeModelHealth[key];else freeModelHealth[key]=old;return state});
  assert.equal(r,'cooldown');
 });
 await test('model intelligence v3 hysteresis keeps healthy near-ties but not clear losses',async()=>{
  const r=await page.evaluate(()=>{const a={provider:'groq',id:'a'},b={provider:'groq',id:'b'};const ctx={confidence:.5};const near=SevenModelIntelligenceV3.hysteresis([{model:a,score:90,explanation:{reasons:[]}},{model:b,score:88.5,explanation:{reasons:[]}}],b,ctx)[0].model.id;const far=SevenModelIntelligenceV3.hysteresis([{model:a,score:90,explanation:{reasons:[]}},{model:b,score:80,explanation:{reasons:[]}}],b,ctx)[0].model.id;return {near,far}});
  assert.deepEqual(r,{near:'b',far:'a'});
 });
 await test('model picker v3 is ranked by the same scoring primitive and explanations stay bounded',async()=>{
  const r=await page.evaluate(()=>{document.getElementById('userInput').value='Debug this JavaScript function and verify the logic precisely';populateFreeModelSelect(currentModel);const first=document.getElementById('modelSelect').options[0];const ctx=modelPickerContextV3();const all=getFreeModelCatalog().filter(m=>m.free===true&&isFreePriceProofFresh(m));const ready=all.filter(m=>isFreeProviderConfigured(m.provider)&&(!m.requiresExplicitEnable||isFreeProviderEnabled(m.provider)));const pool=ready.length?ready:all;const ranked=SevenModelIntelligenceV3.rank(pool,ctx);const explanation=JSON.stringify(ranked[0]?.explanation||{});return {option:first?.value||'',expected:ranked[0]?freeModelSelectionKey(ranked[0].model.provider,ranked[0].model.id):'',reasonCount:(ranked[0]?.explanation?.reasons||[]).length,secret:/gsk_|sk-or-|nvapi-|AIza/.test(explanation)}});
  assert.equal(r.option,r.expected);assert.ok(r.reasonCount<=3);assert.equal(r.secret,false);
 });

 await test('provider health v2 lazily normalizes legacy health records',async()=>{
  const r=await page.evaluate(()=>{const raw={successes:4,failures:2,latencyMs:900,lastSuccessAt:10,lastFailureAt:5,cooldownUntil:0,lastStatus:200};const x=SevenProviderHealthV2.normalize(raw);return {version:x.schemaVersion,successes:x.successes,failures:x.failures,latency:x.ewmaLatencyMs,samples:x.latencySamples}});
  assert.deepEqual(r,{version:2,successes:4,failures:2,latency:900,samples:[900]});
 });
 await test('provider health v2 records bounded EWMA latency samples',async()=>{
  const r=await page.evaluate(()=>{const model={provider:'groq',id:'latency-v2-fixture'};const key=freeHealthKey(model.provider,model.id),pkey=freeHealthKey(model.provider,'*');const old=freeModelHealth[key],pold=freeModelHealth[pkey];for(let i=0;i<20;i++)recordFreeRouteSuccess(model,100+i*10);const x=getFreeModelHealth(model.provider,model.id);if(old===undefined)delete freeModelHealth[key];else freeModelHealth[key]=old;if(pold===undefined)delete freeModelHealth[pkey];else freeModelHealth[pkey]=pold;return {samples:x.latencySamples.length,ewma:x.ewmaLatencyMs,streak:x.consecutiveSuccesses,fail:x.consecutiveFailures}});
  assert.equal(r.samples,12);assert.ok(r.ewma>=100&&r.ewma<=300);assert.equal(r.streak,20);assert.equal(r.fail,0);
 });
 await test('provider health v2 classifies failure families',async()=>{
  const r=await page.evaluate(()=>{const classify=SevenProviderHealthV2.classify;const mk=(status,extra={})=>Object.assign(new Error('x'),{status},extra);const old=stopRequested;stopRequested=false;const out={auth:classify(mk(401)),rate:classify(mk(429)),notFound:classify(mk(404)),server:classify(mk(503)),network:classify(Object.assign(new TypeError('Failed to fetch'),{})),timeout:classify(Object.assign(new Error('timeout'),{code:'PROVIDER_TIMEOUT'}))};const abort=new DOMException('Stopped','AbortError');stopRequested=true;out.cancel=classify(abort);stopRequested=old;return out});
  assert.deepEqual(r,{auth:'auth',rate:'rate_limit',notFound:'not_found',server:'server',network:'network',timeout:'timeout',cancel:'cancelled'});
 });
 await test('provider health v2 cancellation does not damage route health',async()=>{
  const r=await page.evaluate(()=>{const model={provider:'groq',id:'cancel-v2-fixture'};const key=freeHealthKey(model.provider,model.id),old=freeModelHealth[key],oldStop=stopRequested;stopRequested=true;recordFreeRouteFailure(model,new DOMException('Stopped','AbortError'));const x=getFreeModelHealth(model.provider,model.id);stopRequested=oldStop;if(old===undefined)delete freeModelHealth[key];else freeModelHealth[key]=old;return {failures:x.failures,streak:x.consecutiveFailures,last:x.lastErrorClass}});
  assert.deepEqual(r,{failures:0,streak:0,last:null});
 });
 await test('provider health v2 failure streak increases cooldown and retry-after is bounded',async()=>{
  const r=await page.evaluate(()=>{const a=dynamicCooldownMsV2('server',1,0),b=dynamicCooldownMsV2('server',3,0),retry=SevenProviderHealthV2.retryAfter('99999');return {a,b,retry,max:PROVIDER_HEALTH_V2.maxCooldownMs}});
  assert.ok(r.b>r.a);assert.equal(r.retry,r.max);
 });
 await test('provider health v2 keeps 404 model-local',async()=>{
  const r=await page.evaluate(()=>{const model={provider:'groq',id:'missing-v2-fixture'};const key=freeHealthKey(model.provider,model.id),pkey=freeHealthKey(model.provider,'*'),old=freeModelHealth[key],pold=freeModelHealth[pkey],oldStop=stopRequested;stopRequested=false;const e=Object.assign(new Error('missing'),{status:404});recordFreeRouteFailure(model,e);const own=getFreeModelHealth(model.provider,model.id),broad=getFreeModelHealth(model.provider,'*');stopRequested=oldStop;if(old===undefined)delete freeModelHealth[key];else freeModelHealth[key]=old;if(pold===undefined)delete freeModelHealth[pkey];else freeModelHealth[pkey]=pold;return {ownCooling:own.cooldownUntil>Date.now(),providerCooling:broad.cooldownUntil>Date.now(),providerFailures:broad.failures}});
  assert.equal(r.ownCooling,true);assert.equal(r.providerCooling,false);assert.equal(r.providerFailures,0);
 });
 await test('provider health v2 opens provider circuit for 429 and honors retry-after',async()=>{
  const r=await page.evaluate(()=>{const model={provider:'groq',id:'rate-v2-fixture'};const key=freeHealthKey(model.provider,model.id),pkey=freeHealthKey(model.provider,'*'),old=freeModelHealth[key],pold=freeModelHealth[pkey],oldStop=stopRequested;stopRequested=false;const now=Date.now(),e=Object.assign(new Error('rate'),{status:429,retryAfterMs:5*60*1000});recordFreeRouteFailure(model,e);const broad=getFreeModelHealth(model.provider,'*');stopRequested=oldStop;if(old===undefined)delete freeModelHealth[key];else freeModelHealth[key]=old;if(pold===undefined)delete freeModelHealth[pkey];else freeModelHealth[pkey]=pold;return {cooling:broad.cooldownUntil>now,remaining:broad.cooldownUntil-now,error:broad.lastErrorClass}});
  assert.equal(r.cooling,true);assert.ok(r.remaining>=5*60*1000-1000);assert.equal(r.error,'rate_limit');
 });
 await test('provider health v2 opens provider circuit only after repeated server failures',async()=>{
  const r=await page.evaluate(()=>{const ids=['server-v2-a','server-v2-b','server-v2-c'],keys=ids.map(id=>freeHealthKey('groq',id)),pkey=freeHealthKey('groq','*'),olds=keys.map(k=>freeModelHealth[k]),pold=freeModelHealth[pkey],oldStop=stopRequested;stopRequested=false;const e=Object.assign(new Error('server'),{status:503});recordFreeRouteFailure({provider:'groq',id:ids[0]},e);const first=getFreeModelHealth('groq','*').cooldownUntil>Date.now();recordFreeRouteFailure({provider:'groq',id:ids[1]},e);const second=getFreeModelHealth('groq','*').cooldownUntil>Date.now();recordFreeRouteFailure({provider:'groq',id:ids[2]},e);const third=getFreeModelHealth('groq','*').cooldownUntil>Date.now();stopRequested=oldStop;keys.forEach((k,i)=>{if(olds[i]===undefined)delete freeModelHealth[k];else freeModelHealth[k]=olds[i]});if(pold===undefined)delete freeModelHealth[pkey];else freeModelHealth[pkey]=pold;return {first,second,third}});
  assert.deepEqual(r,{first:false,second:false,third:true});
 });
 await test('provider health v2 success heals failure streak and cooldown',async()=>{
  const r=await page.evaluate(()=>{const model={provider:'groq',id:'heal-v2-fixture'};const key=freeHealthKey(model.provider,model.id),pkey=freeHealthKey(model.provider,'*'),old=freeModelHealth[key],pold=freeModelHealth[pkey],oldStop=stopRequested;stopRequested=false;recordFreeRouteFailure(model,Object.assign(new Error('rate'),{status:429}));const before=SevenProviderHealthV2.model(model.provider,model.id);recordFreeRouteSuccess(model,420);const after=SevenProviderHealthV2.model(model.provider,model.id);const broad=SevenProviderHealthV2.model(model.provider,'*');const recovery=getFreeModelHealth(model.provider,model.id).recoveryCount;stopRequested=oldStop;if(old===undefined)delete freeModelHealth[key];else freeModelHealth[key]=old;if(pold===undefined)delete freeModelHealth[pkey];else freeModelHealth[pkey]=pold;return {before:before.state,after:after.state,streak:after.consecutiveFailures,broad:broad.state,recovery}});
  assert.equal(r.before,'cooldown');assert.notEqual(r.after,'cooldown');assert.equal(r.streak,0);assert.notEqual(r.broad,'cooldown');assert.ok(r.recovery>=1);
 });
 await test('provider health v2 exposes deterministic quota pressure',async()=>{
  const r=await page.evaluate(()=>{const key=freeUsageKey('openrouter'),old=freeModelUsage[key];freeModelUsage[key]={requests:46,successes:40,failures:6,estimatedInputTokens:0,estimatedOutputBudget:0};const near=getProviderQuotaPressureV2('openrouter');freeModelUsage[key]={requests:10,successes:10,failures:0,estimatedInputTokens:0,estimatedOutputBudget:0};const normal=getProviderQuotaPressureV2('openrouter');if(old===undefined)delete freeModelUsage[key];else freeModelUsage[key]=old;return {near:near.state,normal:normal.state}});
  assert.deepEqual(r,{near:'near_limit',normal:'normal'});
 });
 await test('provider health v2 diagnostics are bounded and contain no secrets or content',async()=>{
  const r=await page.evaluate(()=>{const model={provider:'groq',id:'diag-v2-fixture'};const key=freeHealthKey(model.provider,model.id),old=freeModelHealth[key];freeModelHealth[key]=normalizeHealthRecordV2({successes:2,failures:1,latencySamples:[200,300,400],ewmaLatencyMs:300,lastStatus:500,lastErrorClass:'server'});const snap=SevenProviderHealthV2.model(model.provider,model.id);const text=JSON.stringify(snap);if(old===undefined)delete freeModelHealth[key];else freeModelHealth[key]=old;return {keys:Object.keys(snap).sort(),secret:/gsk_|sk-or-|nvapi-|AIza|Authorization|Bearer/i.test(text),content:/prompt|response|message/i.test(text),p90:snap.p90LatencyMs}});
  assert.equal(r.secret,false);assert.equal(r.content,false);assert.ok(r.p90>=300);
 });
 await test('model intelligence v3 delegates health truth to provider health v2',async()=>{
  const r=await page.evaluate(()=>{const model={provider:'groq',id:'delegate-v2-fixture'};const key=freeHealthKey(model.provider,model.id),old=freeModelHealth[key];freeModelHealth[key]=normalizeHealthRecordV2({successes:8,failures:0,lastSuccessAt:Date.now(),consecutiveSuccesses:3});const a=SevenModelIntelligenceV3.health(model),b=SevenProviderHealthV2.score(model.provider,model.id);if(old===undefined)delete freeModelHealth[key];else freeModelHealth[key]=old;return {a,b}});
  assert.equal(r.a.state,r.b.state);assert.equal(r.a.cooldownUntil,r.b.cooldownUntil);assert.equal(r.a.latencyMs,r.b.latencyMs);assert.ok(Math.abs(r.a.score-r.b.score)<1e-6);
 });

 await test('memory scope hardening writes ordinary memory as explicit global private',async()=>{
  const r=await page.evaluate(()=>{const m=addMemory('Scope hardening global fixture '+Date.now());if(!m)return null;const out={scope:m.scope,scopeRef:m.scopeRef,access:m.access,visible:isMemoryVisibleInScope(m,normalizeMemoryScopeContext({allowGlobal:true}))};deleteMemory(m.id);return out});
  assert.deepEqual(r,{scope:'user',scopeRef:'global',access:'private',visible:true});
 });
 await test('memory scope hardening isolates room memories',async()=>{
  const r=await page.evaluate(()=>{const m=addScopedMemory('Room isolated memory '+Date.now(),'room','room-alpha');if(!m)return null;const a=isMemoryVisibleInScope(m,{roomId:'room-alpha'}),b=isMemoryVisibleInScope(m,{roomId:'room-beta'});deleteMemory(m.id);return {a,b,scope:m.scope,ref:m.scopeRef}});
  assert.deepEqual(r,{a:true,b:false,scope:'conversation',ref:'room-alpha'});
 });
 await test('memory scope hardening isolates project and RPG memories',async()=>{
  const r=await page.evaluate(()=>{const p=addScopedMemory('Project scoped fixture '+Date.now(),'project','project-one');const g=addScopedMemory('RPG scoped fixture '+Date.now(),'rpg','world-one');const out={p1:isMemoryVisibleInScope(p,{projectId:'project-one'}),p2:isMemoryVisibleInScope(p,{projectId:'project-two'}),g1:isMemoryVisibleInScope(g,{rpgId:'world-one'}),g2:isMemoryVisibleInScope(g,{rpgId:'world-two'}),rpgScope:g.scope};deleteMemory(p.id);deleteMemory(g.id);return out});
  assert.deepEqual(r,{p1:true,p2:false,g1:true,g2:false,rpgScope:'rpg'});
 });
 await test('memory scope hardening permits same content in isolated scopes',async()=>{
  const r=await page.evaluate(()=>{const content='Same scoped content '+Date.now();const a=addScopedMemory(content,'room','dup-room-a');const b=addScopedMemory(content,'room','dup-room-b');const ok=!!a&&!!b&&a.id!==b.id; if(a)deleteMemory(a.id);if(b)deleteMemory(b.id);return ok});
  assert.equal(r,true);
 });
 await test('memory scope hardening excludes restricted memory by default',async()=>{
  const r=await page.evaluate(()=>{const m=addMemoryRecord({content:'Restricted scoped fixture '+Date.now(),scope:'user',scopeRef:'global',access:'restricted'},{allowDuplicate:true});const hidden=isMemoryVisibleInScope(m,{allowGlobal:true}),allowed=isMemoryVisibleInScope(m,{allowGlobal:true,allowRestricted:true});deleteMemory(m.id);return {hidden,allowed}});
  assert.deepEqual(r,{hidden:false,allowed:true});
 });
 await test('memory scope hardening keeps legacy unscoped canonical memory globally compatible',async()=>{
  const r=await page.evaluate(()=>{const m=addMemoryRecord({content:'Legacy scope fixture '+Date.now(),scope:null,scopeRef:null,access:null},{allowDuplicate:true});const global=isMemoryVisibleInScope(m,{allowLegacyGlobal:true}),strict=isMemoryVisibleInScope(m,{allowLegacyGlobal:false});deleteMemory(m.id);return {global,strict}});
  assert.deepEqual(r,{global:true,strict:false});
 });
 await test('memory scope hardening blocks relation expansion across rooms',async()=>{
  const r=await page.evaluate(()=>{const stamp=Date.now();const secret=addMemoryRecord({content:'alpha relation secret '+stamp,scope:'conversation',scopeRef:'relation-room-b',access:'private'},{allowDuplicate:true});const anchor=addMemoryRecord({content:'alpha relation anchor '+stamp,scope:'conversation',scopeRef:'relation-room-a',access:'private',relations:[secret.id]},{allowDuplicate:true});const result=retrieveMemoryIntelligence('remember alpha relation anchor',5,{roomId:'relation-room-a'});const ids=result.memories.map(x=>x.id);deleteMemory(anchor.id);deleteMemory(secret.id);return {anchor:ids.includes(anchor.id),secret:ids.includes(secret.id),scoped:result.diagnostics.scopedEligible}});
  assert.equal(r.anchor,true);assert.equal(r.secret,false);assert.ok(r.scoped>=1);
 });
 await test('memory scope hardening blocks evidence expansion across rooms',async()=>{
  const r=await page.evaluate(()=>{const stamp=Date.now();const evidence=addMemoryRecord({content:'scope evidence hidden '+stamp,scope:'conversation',scopeRef:'evidence-room-b',access:'private'},{allowDuplicate:true});const owner=addMemoryRecord({content:'scope evidence owner '+stamp,scope:'conversation',scopeRef:'evidence-room-a',access:'private',evidenceRefs:[{type:'memory',relation:'supports',source:evidence.id}]},{allowDuplicate:true});const result=reconstructMemoryContext('remember scope evidence owner',{primaryLimit:3,evidenceLimit:6,scopeContext:{roomId:'evidence-room-a'}});const ids=result.items.map(x=>x.id);deleteMemory(owner.id);deleteMemory(evidence.id);return {owner:ids.includes(owner.id),evidence:ids.includes(evidence.id)}});
  assert.equal(r.owner,true);assert.equal(r.evidence,false);
 });
 await test('memory scope hardening active chat context binds current room',async()=>{
  const r=await page.evaluate(()=>{const ctx=getActiveMemoryScopeContext({roomId:'bound-room'});return {roomId:ctx.roomId,global:ctx.allowGlobal,shared:ctx.allowShared,restricted:ctx.allowRestricted}});
  assert.deepEqual(r,{roomId:'bound-room',global:true,shared:false,restricted:false});
 });
 await test('memory scope metadata survives update and canonical backup validation',async()=>{
  const r=await page.evaluate(()=>{const m=addScopedMemory('Scope export fixture '+Date.now(),'project','export-project');const updated=updateMemoryRecord(m.id,{content:m.content+' updated'});const payload=buildCanonicalBackupPayload();const valid=validateCanonicalBackupPayload(payload);const saved=payload.objects.memory.memories.find(x=>x.id===m.id);deleteMemory(m.id);return {updated:!!updated,valid:valid.valid,scope:saved&&saved.scope,ref:saved&&saved.scopeRef,access:saved&&saved.access}});
  assert.deepEqual(r,{updated:true,valid:true,scope:'project',ref:'export-project',access:'private'});
 });

 await test('ui simplification removes manual credentials and keeps core controls',async()=>{
  const r=await page.evaluate(()=>{openSettings();const ids=['routingModeSelect','modelSelect','temperatureRange','reasoningEffort','maxTokens','freeFallbackToggle','pinnedNotes','knowledgeStatus'];const core=['routingModeSelect','modelSelect','temperatureRange','reasoningEffort','maxTokens'].every(id=>{const el=document.getElementById(id);return !!el&&el.closest('details')===null});const providers=document.getElementById('providersSection');providers.open=true;const visible=[...providers.querySelectorAll('input,textarea,select')].filter(el=>{const cs=getComputedStyle(el),b=el.getBoundingClientRect();return!el.hidden&&cs.display!=='none'&&cs.visibility!=='hidden'&&b.width>0&&b.height>0}).map(el=>el.id);return{all:ids.every(id=>!!document.getElementById(id)),core,visible,memory:document.getElementById('memoryDataSection').open,advanced:document.getElementById('advancedSection').open}});
  assert.deepEqual(r,{all:true,core:true,visible:[],memory:false,advanced:false});
 });
 await test('ui simplification route status is semantic and reflects runtime health',async()=>{
  const r=await page.evaluate(()=>{openSettings();renderFreeModelFabricStatus();const card=document.getElementById('routeStatusCard'),badge=document.getElementById('routeStateBadge'),text=document.getElementById('freeModelStatus');return {role:card.getAttribute('role'),live:card.getAttribute('aria-live'),state:card.dataset.state,label:badge.textContent.trim(),text:text.textContent.trim()}});
  assert.equal(r.role,'status');assert.equal(r.live,'polite');assert.ok(['ready','degraded','cooldown','blocked'].includes(r.state));assert.ok(r.label.length>0);assert.ok(r.text.length>0);
 });
 await test('ui simplification settings fit 320px without horizontal overflow',async()=>{
  await page.setViewportSize({width:320,height:800});
  const r=await page.evaluate(()=>{openSettings();const el=document.querySelector('#settingsModal .modal-content'),rect=el.getBoundingClientRect();return {client:el.clientWidth,scroll:el.scrollWidth,left:rect.left,right:rect.right,width:rect.width,viewport:window.innerWidth}});
  assert.ok(r.scroll<=r.client+1);assert.ok(r.left>=-1);assert.ok(r.right<=r.viewport+1);
 });
 await test('ui simplification RTL sections remain usable at 320px',async()=>{
  const r=await page.evaluate(()=>{document.documentElement.setAttribute('dir','rtl');openSettings();const section=document.getElementById('providersSection');section.open=true;const summary=section.querySelector('summary'),card=document.getElementById('routeStatusCard'),modal=document.querySelector('#settingsModal .modal-content');const out={direction:getComputedStyle(summary).direction,cardDirection:getComputedStyle(card).direction,overflow:modal.scrollWidth<=modal.clientWidth+1,summaryHeight:summary.getBoundingClientRect().height};document.documentElement.setAttribute('dir','ltr');section.open=false;return out});
  assert.equal(r.direction,'rtl');assert.ok(['rtl','ltr'].includes(r.cardDirection));assert.equal(r.overflow,true);assert.ok(r.summaryHeight>=44);
 });

 await test('performance polish bounds 500-message chat DOM without mutating canonical history',async()=>{
  const r=await page.evaluate(()=>{const old=currentRoom,id='perf-long-'+Date.now();rooms[id]=createEmptyRoom();roomTitles[id]='Perf';for(let i=0;i<500;i++)rooms[id].history.push({role:i%2?'assistant':'user',content:'message '+i});currentRoom=id;chatRenderLimits.delete(id);renderChatHistory();const chat=document.getElementById('chat'),out={canonical:rooms[id].history.length,rendered:chat.querySelectorAll('.message').length,hidden:chat.querySelector('.history-window-control button')?.textContent||'',regen:!!chat.querySelector('.message.assistant:last-of-type .regenerate-btn')||!!chat.querySelector('.regenerate-btn')};delete rooms[id];delete roomTitles[id];chatRenderLimits.delete(id);currentRoom=old;renderChatHistory();return out});
  assert.equal(r.canonical,500);assert.ok(r.rendered<=100);assert.ok(r.hidden.includes('400 hidden'));assert.equal(r.regen,true);
 });
 await test('performance polish show-earlier expands projection without changing history',async()=>{
  const r=await page.evaluate(()=>new Promise(resolve=>{const old=currentRoom,id='perf-expand-'+Date.now();rooms[id]=createEmptyRoom();roomTitles[id]='Perf expand';for(let i=0;i<350;i++)rooms[id].history.push({role:i%2?'assistant':'user',content:'row '+i});currentRoom=id;chatRenderLimits.delete(id);renderChatHistory();const before=document.querySelectorAll('#chat .message').length,canonicalBefore=rooms[id].history.length;showEarlierChatMessages();requestAnimationFrame(()=>requestAnimationFrame(()=>{const after=document.querySelectorAll('#chat .message').length,canonicalAfter=rooms[id].history.length,limit=getChatRenderLimit(id);delete rooms[id];delete roomTitles[id];chatRenderLimits.delete(id);currentRoom=old;renderChatHistory();resolve({before,after,canonicalBefore,canonicalAfter,limit})}))}));
  assert.equal(r.canonicalBefore,350);assert.equal(r.canonicalAfter,350);assert.ok(r.after>r.before);assert.equal(r.limit,200);
 });
 await test('performance polish streaming UI coalesces bursts and preserves latest text',async()=>{
  const r=await page.evaluate(()=>new Promise(resolve=>{const before=SevenAppReliability.snapshot().streaming;const bubble=addMessage('assistant','',{suppressScroll:true});for(let i=0;i<50;i++)scheduleStreamingBubbleUpdate(bubble,'chunk-'+i);requestAnimationFrame(()=>requestAnimationFrame(()=>{const after=SevenAppReliability.snapshot().streaming;const text=bubble.textContent;bubble.closest('.message')?.remove();resolve({text,requests:after.requests-before.requests,writes:after.writes-before.writes})}))}));
  assert.equal(r.text,'chunk-49');assert.equal(r.requests,50);assert.ok(r.writes>=1&&r.writes<50);
 });
 await test('performance polish background state does not cancel active generation',async()=>{
  const r=await page.evaluate(()=>{const oldGenerating=isGenerating,oldStop=stopRequested;isGenerating=true;stopRequested=false;const bg=updateAppVisibilityStateV1(true),during={generating:isGenerating,stop:stopRequested,cls:document.documentElement.classList.contains('app-backgrounded')};const fg=updateAppVisibilityStateV1(false);isGenerating=oldGenerating;stopRequested=oldStop;return {bg,fg,during,afterClass:document.documentElement.classList.contains('app-backgrounded')}});
  assert.equal(r.bg,'background');assert.equal(r.fg,'foreground');assert.deepEqual(r.during,{generating:true,stop:false,cls:true});assert.equal(r.afterClass,false);
 });
 await test('performance polish network projection is advisory and deterministic',async()=>{
  const r=await page.evaluate(()=>{const a=updateNetworkUiStateV1(false),da=document.documentElement.dataset.network,b=updateNetworkUiStateV1(true),db=document.documentElement.dataset.network;updateNetworkUiStateV1();return {a,da,b,db}});
  assert.deepEqual(r,{a:'offline',da:'offline',b:'link-online',db:'link-online'});
 });
 await test('integration diagnostics normalize errors and bound trace data',async()=>{
  const r=await page.evaluate(()=>{const timeout=Object.assign(new Error('hidden detail'),{code:'PROVIDER_TIMEOUT'}),rate=Object.assign(new Error('rate'),{status:429}),net=new TypeError('Failed to fetch'),t=SevenDiagnostics.begin('chat',{roomId:'diag-room',mode:'search'});SevenDiagnostics.event(t,'provider',{provider:'fixture',messageCount:3,secret:'must-not-appear'});SevenDiagnostics.finish(t,'failed',{code:'TIMEOUT',retryable:true});const snap=SevenDiagnostics.snapshot().at(-1),raw=JSON.stringify(snap);return{timeout:SevenDiagnostics.error(timeout,'model'),rate:SevenDiagnostics.error(rate,'model'),net:SevenDiagnostics.error(net,'model'),snap,leak:raw.includes('must-not-appear')}});
  assert.equal(r.timeout.code,'TIMEOUT');assert.equal(r.rate.code,'RATE_LIMIT');assert.equal(r.net.code,'NETWORK_ERROR');assert.equal(r.snap.status,'failed');assert.equal(r.snap.roomId,'diag-room');assert.equal(r.leak,false);
 });
 await test('provider discovery failure enters health and success heals it',async()=>{
  const r=await page.evaluate(async()=>{const oldFetch=fetchProviderWithTimeout,oldRaw=localStorage.getItem(FREE_MODEL_HEALTH_KEY),oldHealth=JSON.parse(JSON.stringify(freeModelHealth));try{fetchProviderWithTimeout=async()=>({ok:false,status:429,headers:{get:n=>String(n).toLowerCase()==='retry-after'?'1':null}});try{await fetchProviderModelList('kilo')}catch(_){}const failed=SevenProviderHealthV2.provider('kilo');fetchProviderWithTimeout=async()=>({ok:true,status:200,headers:{get:()=>null},json:async()=>({data:[]})});await fetchProviderModelList('kilo');const healed=SevenProviderHealthV2.provider('kilo');return{failed:failed.state,healed:healed.state}}finally{fetchProviderWithTimeout=oldFetch;freeModelHealth=oldHealth;if(oldRaw===null)localStorage.removeItem(FREE_MODEL_HEALTH_KEY);else localStorage.setItem(FREE_MODEL_HEALTH_KEY,oldRaw)}});
  assert.equal(r.failed,'cooldown');assert.notEqual(r.healed,'cooldown');
 });
 await test('performance polish visual viewport and diagnostics initialize safely',async()=>{
  const r=await page.evaluate(()=>{const vv=updateVisualViewportV1(),snap=SevenAppReliability.snapshot(),raw=JSON.stringify(SevenAppReliability.snapshot());return {width:vv.width,height:vv.height,version:snap.version,visibility:snap.visibility,network:snap.network,hasRender:!!snap.renderWindow,secret:/gsk_|sk-or-|nvapi-|AIza|Authorization|Bearer/i.test(raw),content:/message-499|chunk-49|Relevant memories/.test(raw)}});
  assert.ok(r.width>0&&r.height>0);assert.equal(r.version,2);assert.ok(['foreground','background'].includes(r.visibility));assert.ok(['link-online','offline','unknown'].includes(r.network));assert.equal(r.hasRender,true);assert.equal(r.secret,false);assert.equal(r.content,false);
 });
 await test('performance polish 320px chat and settings avoid horizontal overflow',async()=>{
  await page.setViewportSize({width:320,height:800});
  const r=await page.evaluate(()=>{document.getElementById('sidebar').classList.add('collapsed');updateVisualViewportV1();openSettings();const settings=document.querySelector('#settingsModal .modal-content'),composer=document.querySelector('.composer'),main=document.querySelector('.main');return {doc:document.documentElement.scrollWidth<=window.innerWidth+1,settings:settings.scrollWidth<=settings.clientWidth+1,settingsRight:settings.getBoundingClientRect().right<=window.innerWidth+1,composer:composer.getBoundingClientRect().right<=window.innerWidth+1&&composer.getBoundingClientRect().left>=-1,main:main.getBoundingClientRect().right<=window.innerWidth+1}});
  assert.equal(r.doc,true);assert.equal(r.settings,true);assert.equal(r.settingsRight,true);assert.equal(r.composer,true);assert.equal(r.main,true);
 });
 await test('performance polish RTL remains bounded at 320px',async()=>{
  const r=await page.evaluate(()=>{document.documentElement.setAttribute('dir','rtl');document.getElementById('sidebar').classList.add('collapsed');openSettings();const modal=document.querySelector('#settingsModal .modal-content'),chat=document.getElementById('chat'),out={modal:modal.scrollWidth<=modal.clientWidth+1,chat:chat.scrollWidth<=chat.clientWidth+1,direction:getComputedStyle(document.body).direction};document.documentElement.setAttribute('dir','ltr');return out});
  assert.equal(r.modal,true);assert.equal(r.chat,true);assert.equal(r.direction,'rtl');
 });

 await test('deep think speed policy adaptively budgets hidden output',async()=>{
  const r=await page.evaluate(()=>{
    const low=SevenDeepThinkPerformance.policy([{role:'user',content:'Explain this briefly.'}],currentModel);
    const high=SevenDeepThinkPerformance.policy([{role:'user',content:'Research and analyze this architecture carefully with code, multiple steps, assumptions, edge cases, and a detailed comparison.\n1. inspect\n2. compare\n3. verify'}],currentModel);
    return {lowBudget:low.hiddenMaxTokens,highBudget:high.hiddenMaxTokens,lowTimeout:low.timeoutMs,highTimeout:high.timeoutMs,lowTier:low.tier,highTier:high.tier,strongest:low.strongestEffort,expected:getReasoningEffort(currentModel,'deepThink'),max:modelLimits(currentModel).maxTokens};
  });
  assert.ok(r.lowBudget<=r.max);assert.ok(r.highBudget<=r.max);assert.ok(r.highBudget>=r.lowBudget);assert.ok(r.highTimeout>=r.lowTimeout);assert.equal(r.strongest,r.expected);
 });
 await test('deep think latency priority becomes an explicit routing signal',async()=>{
  const r=await page.evaluate(()=>SevenModelIntelligenceV3.analyze('Analyze this problem carefully',{purpose:'deepThink',deepThinkRequested:true,latencyPriority:true}));
  assert.equal(r.preferSpeed,true);assert.equal(r.preferPrecision,true);assert.ok(r.evidence.includes('latency-priority'));
 });
 await test('main token estimator is conservative for Arabic and compatible with ASCII estimate',async()=>{
  const r=await page.evaluate(()=>({ar:estimateTokens('مرحبا'.repeat(100)),arChars:'مرحبا'.repeat(100).length,en:estimateTokens('abcd'.repeat(100))}));
  assert.ok(r.ar>=r.arChars);assert.ok(r.en>=90&&r.en<=110);
 });
 await test('fallback budget enforces one bounded wall-clock envelope',async()=>{
  const r=await page.evaluate(()=>({
    a:fallbackAttemptBudgetV2(60000,8,null),
    b:fallbackAttemptBudgetV2(9000,3,45000),
    c:normalizeRequestConfig({messages:[],requestDeadlineMs:12345}).requestDeadlineMs
  }));
  assert.ok(r.a<=7500&&r.a>=2000);assert.ok(r.b<=3000);assert.equal(r.c,12345);
 });
 await test('request normalization preserves deep latency and timeout policy without changing final budgets',async()=>{
  const r=await page.evaluate(()=>{
    const deep=normalizeRequestConfig({messages:[{role:'user',content:'x'}],maxTokens:2048,purpose:'deepThink',model:currentModel,latencyPriority:true,timeoutMs:25000});
    const chat=normalizeRequestConfig({messages:[{role:'user',content:'x'}],maxTokens:1234,purpose:'chat',model:currentModel,latencyPriority:false});
    return {deep:{maxTokens:deep.maxTokens,latency:deep.latencyPriority,timeout:deep.timeoutMs},chat:{maxTokens:chat.maxTokens,latency:chat.latencyPriority,timeout:chat.timeoutMs}};
  });
  assert.deepEqual(r.deep,{maxTokens:2048,latency:true,timeout:25000});assert.deepEqual(r.chat,{maxTokens:1234,latency:false,timeout:null});
 });
 await test('runDeepThink keeps a dedicated hidden pass with compact brief and fast-lane config',async()=>{
  const r=await page.evaluate(async()=>{
    const old=requestAI;
    let calls=0,captured=null;
    requestAI=async cfg=>{calls++;captured={purpose:cfg.purpose,maxTokens:cfg.maxTokens,latencyPriority:cfg.latencyPriority,timeoutMs:cfg.timeoutMs,system:cfg.messages?.[0]?.content||''};return {choices:[{message:{content:'compact synthetic brief'}}],_sevenRoute:{provider:'fixture',model:'fixture-model',attempts:1}}};
    try{
      beginDeepThinkPerformanceV1('fixture-room');
      const out=await runDeepThink([{role:'user',content:'Analyze this carefully'}],currentModel);
      const snap=SevenDeepThinkPerformance.snapshot();
      finishDeepThinkPerformanceV1('completed');
      return {calls,captured,outLen:out.length,roles:out.map(x=>x.role),first:out[0]?.content||'',last:out[out.length-1]?.content||'',snap};
    }finally{requestAI=old;if(activeDeepThinkPerformance)finishDeepThinkPerformanceV1('cancelled');}
  });
  assert.equal(r.calls,1);assert.equal(r.captured.purpose,'deepThink');assert.equal(r.captured.latencyPriority,true);assert.ok(r.captured.timeoutMs>=25000);assert.ok(r.captured.maxTokens>=512);assert.ok(r.captured.system.includes('compact decision brief'));assert.ok(!r.captured.system.toLowerCase().includes('step by step'));assert.equal(r.roles[0],'system');assert.ok(r.first.includes('compact synthetic brief'));assert.notEqual(r.roles[r.roles.length-1],'system');assert.ok(r.snap.deepRoute.provider==='fixture');
 });
 await test('deep think performance ownership is request scoped',async()=>{
  const r=await page.evaluate(()=>{
    const a=beginDeepThinkPerformanceV1('room-a');
    const b=beginDeepThinkPerformanceV1('room-b');
    a.contextMs=11;b.contextMs=22;
    const finishedA=finishDeepThinkPerformanceV1('completed',a);
    const activeAfterA=SevenDeepThinkPerformance.snapshot();
    const finishedB=finishDeepThinkPerformanceV1('completed',b);
    return {finishedA,activeAfterA,finishedB,activeCleared:activeDeepThinkPerformance===null};
  });
  assert.equal(r.finishedA.roomId,'room-a');assert.equal(r.activeAfterA.roomId,'room-b');assert.equal(r.activeAfterA.contextMs,22);assert.equal(r.finishedB.roomId,'room-b');assert.equal(r.activeCleared,true);
 });
 await test('deep think diagnostics expose timings and routes but no content or secrets',async()=>{
  const r=await page.evaluate(()=>{
    beginDeepThinkPerformanceV1('safe-room');
    activeDeepThinkPerformance.contextMs=12;activeDeepThinkPerformance.deepThinkMs=34;activeDeepThinkPerformance.hiddenBudget=2048;activeDeepThinkPerformance.timeoutMs=25000;activeDeepThinkPerformance.deepRoute={provider:'groq',model:'fixture'};
    finishDeepThinkPerformanceV1('completed');
    const snap=SevenDeepThinkPerformance.snapshot(),raw=JSON.stringify(snap);
    return {snap,secret:/gsk_|sk-or-|nvapi-|AIza|Authorization|Bearer/i.test(raw),content:/prompt|response|message|compact synthetic brief/i.test(raw)};
  });
  assert.equal(r.snap.status,'completed');assert.equal(r.snap.hiddenBudget,2048);assert.equal(r.secret,false);assert.equal(r.content,false);
 });
 await test('deep think low-complexity fast lane does not allocate full model ceiling when ceiling is larger',async()=>{
  const r=await page.evaluate(()=>{const p=SevenDeepThinkPerformance.policy([{role:'user',content:'What is 2 + 2?'}],currentModel);return {budget:p.hiddenMaxTokens,max:modelLimits(currentModel).maxTokens}});
  if(r.max>2048)assert.ok(r.budget<r.max);else assert.equal(r.budget,r.max);
 });

 await test('measured latency v2 keeps bounded valid route samples',async()=>{
  const r=await page.evaluate(()=>{
    SevenLatencyV2.clear();
    const model={provider:'fixture',id:'latency-bounded'};
    for(let i=0;i<30;i++)recordLatencySampleV2(model,{purpose:'deepThink',latencyTier:'low'},{success:true,totalMs:1000+i,firstTokenMs:100+i});
    recordLatencySampleV2(model,{purpose:'deepThink',latencyTier:'low'},{success:true,totalMs:NaN,firstTokenMs:-5});
    const snap=SevenLatencyV2.snapshot('fixture','latency-bounded','deepThink','low');
    return snap;
  });
  assert.equal(r.samples,20);assert.equal(r.firstTokenSamples,20);assert.equal(r.successes,31);assert.ok(r.p50TotalMs>0);assert.ok(r.p90TotalMs>=r.p50TotalMs);
 });
 await test('measured latency v2 percentile and warm-up influence are deterministic',async()=>{
  const r=await page.evaluate(()=>({
    p50:SevenLatencyV2.percentile([100,200,300,400,500],.5),
    p90:SevenLatencyV2.percentile([100,200,300,400,500],.9),
    i2:SevenLatencyV2.influence(2),
    i3:SevenLatencyV2.influence(3),
    i6:SevenLatencyV2.influence(6)
  }));
  assert.equal(r.p50,300);assert.equal(r.p90,500);assert.equal(r.i2,0);assert.ok(r.i3>0&&r.i3<1);assert.equal(r.i6,1);
 });
 await test('measured latency v2 learned timeout uses p90 but obeys complexity bounds',async()=>{
  const r=await page.evaluate(()=>{
    SevenLatencyV2.clear();
    const model={provider:'fixture',id:'timeout-fast'};
    const fallback=SevenLatencyV2.timeout('fixture','timeout-fast','deepThink','low',25000);
    for(let i=0;i<6;i++)recordLatencySampleV2(model,{purpose:'deepThink',latencyTier:'low'},{success:true,totalMs:3000+i*100});
    const learned=SevenLatencyV2.timeout('fixture','timeout-fast','deepThink','low',25000);
    const high=SevenLatencyV2.timeout('fixture','timeout-fast','deepThink','high',45000);
    return {fallback,learned,high};
  });
  assert.equal(r.fallback,25000);assert.ok(r.learned>=8000&&r.learned<=25000);assert.ok(r.learned<r.fallback);assert.equal(r.high,45000);
 });
 await test('adaptive speed router v2 lets measured p90 break only near ties',async()=>{
  const r=await page.evaluate(()=>{
    SevenLatencyV2.clear();
    const fast={provider:'fixture',id:'fast',free:true,contextWindow:131072,maxTokens:8192,quality:90,speed:80,tasks:{general:90,coding:90,reasoning:90,research:90,planning:90},capabilities:{stream:true,tools:true,structured:true},effort:['high']};
    const slow={provider:'fixture',id:'slow',free:true,contextWindow:131072,maxTokens:8192,quality:90,speed:80,tasks:{general:90,coding:90,reasoning:90,research:90,planning:90},capabilities:{stream:true,tools:true,structured:true},effort:['high']};
    for(let i=0;i<6;i++){
      recordLatencySampleV2(fast,{purpose:'deepThink',latencyTier:'medium'},{success:true,totalMs:1800+i*50});
      recordLatencySampleV2(slow,{purpose:'deepThink',latencyTier:'medium'},{success:true,totalMs:9000+i*100});
    }
    const ctx={version:3,taskWeights:{general:0,coding:0,reasoning:.8,research:0,planning:.2},intentWeights:{reasoning:.8},confidence:.8,complexity:'medium',latencyTier:'medium',latencyPriority:true,purpose:'deepThink',requiredContext:4096,preferSpeed:true,preferPrecision:true,preferTools:false,preferVision:false,requireTools:false,requireVision:false,requireStructured:false,requireStreaming:true};
    return SevenModelIntelligenceV3.rank([slow,fast],ctx).map(x=>x.model.id);
  });
  assert.deepEqual(r,['fast','slow']);
 });
 await test('adaptive speed router v2 does not displace a clearly stronger reasoning model',async()=>{
  const r=await page.evaluate(()=>{
    SevenLatencyV2.clear();
    const strong={provider:'fixture',id:'strong',free:true,contextWindow:131072,maxTokens:8192,quality:99,speed:70,tasks:{general:99,coding:99,reasoning:99,research:99,planning:99},capabilities:{stream:true,tools:true,structured:true},effort:['high']};
    const weak={provider:'fixture',id:'weak',free:true,contextWindow:131072,maxTokens:8192,quality:70,speed:99,tasks:{general:70,coding:70,reasoning:70,research:70,planning:70},capabilities:{stream:true,tools:true,structured:true},effort:['high']};
    for(let i=0;i<8;i++){
      recordLatencySampleV2(strong,{purpose:'deepThink',latencyTier:'medium'},{success:true,totalMs:12000});
      recordLatencySampleV2(weak,{purpose:'deepThink',latencyTier:'medium'},{success:true,totalMs:900});
    }
    const ctx={version:3,taskWeights:{general:0,coding:0,reasoning:.9,research:0,planning:.1},intentWeights:{reasoning:.9},confidence:.9,complexity:'medium',latencyTier:'medium',latencyPriority:true,purpose:'deepThink',requiredContext:4096,preferSpeed:true,preferPrecision:true,preferTools:false,preferVision:false,requireTools:false,requireVision:false,requireStructured:false,requireStreaming:true};
    return SevenModelIntelligenceV3.rank([weak,strong],ctx).map(x=>({id:x.model.id,score:x.score}));
  });
  assert.equal(r[0].id,'strong');assert.ok(r[0].score-r[1].score>4);
 });
 await test('measured latency v2 records first-token only when it actually exists',async()=>{
  const r=await page.evaluate(()=>{
    SevenLatencyV2.clear();
    const model={provider:'fixture',id:'first-token'};
    recordLatencySampleV2(model,{purpose:'chat',latencyTier:'low'},{success:false,totalMs:5000,firstTokenMs:null});
    recordLatencySampleV2(model,{purpose:'chat',latencyTier:'low'},{success:true,totalMs:2200,firstTokenMs:450});
    const snap=SevenLatencyV2.snapshot('fixture','first-token','chat','low');
    return snap;
  });
  assert.equal(r.samples,2);assert.equal(r.firstTokenSamples,1);assert.equal(r.p50FirstTokenMs,450);assert.equal(r.failures,1);assert.equal(r.successes,1);
 });
 await test('request normalization preserves latency tier for route-aware timeouts',async()=>{
  const r=await page.evaluate(()=>normalizeRequestConfig({messages:[{role:'user',content:'x'}],purpose:'deepThink',model:currentModel,latencyPriority:true,latencyTier:'high',timeoutMs:45000,maxTokens:2048}));
  assert.equal(r.latencyPriority,true);assert.equal(r.latencyTier,'high');assert.equal(r.timeoutMs,45000);
 });
 await test('measured latency v2 diagnostics contain no content or secret material',async()=>{
  const r=await page.evaluate(()=>{
    SevenLatencyV2.clear();
    const model={provider:'groq',id:'safe-fixture'};
    for(let i=0;i<4;i++)recordLatencySampleV2(model,{purpose:'deepThink',latencyTier:'medium'},{success:true,totalMs:2000+i*100});
    const snap=SevenLatencyV2.snapshot('groq','safe-fixture','deepThink','medium');
    const raw=JSON.stringify(snap);
    return {raw,secret:/gsk_|sk-or-|nvapi-|AIza|Authorization|Bearer/i.test(raw),content:/prompt|response|message|conversation|reasoning brief/i.test(raw)};
  });
  assert.equal(r.secret,false);assert.equal(r.content,false);
 });
 await test('web search v2 recognizes Arabic and current-information intent',async()=>{
  const r=await page.evaluate(()=>SevenSearchV2.analyze('ما هي أحدث تحديثات Android الآن؟'));
  assert.equal(r.language,'ar');assert.equal(r.timeSensitive,true);assert.equal(r.technical,true);
 });
 await test('web search v2 query plan keeps Arabic primary and adds bounded freshness/entity variants',async()=>{
  const r=await page.evaluate(()=>SevenSearchV2.plan('ما هي أحدث تحديثات Android؟'));
  assert.equal(r.intent.language,'ar');assert.ok(r.queries.length>=2&&r.queries.length<=5);assert.equal(r.queries[0].language,'ar');assert.ok(r.queries.some(q=>q.purpose==='freshness'||q.purpose==='technical_current'||q.purpose==='primary_current'));assert.ok(r.queries.some(q=>q.language==='en'));
 });
 await test('web search v2 canonicalizes and deduplicates tracking variants',async()=>{
  const r=await page.evaluate(()=>SevenSearchV2.dedupe([
    {title:'Example',url:'https://example.com/a/?utm_source=x#part',snippet:'one',engine:'a',queryId:'q1',queryPriority:1,rank:1,language:'en',readState:'snippet_only'},
    {title:'Example',url:'https://example.com/a?fbclid=123',snippet:'better text',engine:'b',queryId:'q2',queryPriority:.8,rank:2,language:'en',readState:'read_success'}
  ],'Example'));
  assert.equal(r.length,1);assert.equal(r[0].url,'https://example.com/a');assert.equal(r[0].readState,'read_success');assert.ok(r[0].discoveredBy.length>=2);
 });
 await test('web search v2 aggregates DDG and English/Arabic Wikipedia instead of fallback-only search',async()=>{
  const r=await page.evaluate(async()=>{
    const old=fetchWithTimeout;
    fetchWithTimeout=async url=>{
      const s=String(url);
      const response=data=>({ok:true,json:async()=>data});
      if(s.includes('api.duckduckgo.com')) return response({Heading:'Android',AbstractText:'DDG Android summary',AbstractURL:'https://example.com/android?utm_source=test',RelatedTopics:[]});
      if(s.includes('en.wikipedia.org')&&s.includes('list=search')) return response({query:{search:[{title:'Android',snippet:'English wiki result'}]}});
      if(s.includes('ar.wikipedia.org')&&s.includes('list=search')) return response({query:{search:[{title:'أندرويد',snippet:'نتيجة عربية'}]}});
      if(s.includes('en.wikipedia.org')&&s.includes('prop=extracts')) return response({query:{pages:{1:{extract:'English Android full intro'}}}});
      if(s.includes('ar.wikipedia.org')&&s.includes('prop=extracts')) return response({query:{pages:{1:{extract:'مقدمة أندرويد العربية'}}}});
      return {ok:false,json:async()=>({})};
    };
    try{
      const out=await performWebSearchV2('أحدث Android');
      return {
        capability:out?.capability,
        engines:(out?.sources||[]).map(x=>x.engine),
        states:(out?.sources||[]).map(x=>x.readState),
        diagnostics:out?.diagnostics,
        context:out?.contextText||''
      };
    }finally{fetchWithTimeout=old;}
  });
  assert.equal(r.capability,'knowledge_sources_only');assert.ok(r.engines.includes('duckduckgo'));assert.ok(r.engines.includes('wikipedia_en'));assert.ok(r.engines.includes('wikipedia_ar'));assert.ok(r.states.includes('read_success'));assert.ok(r.context.includes('[S1]'));assert.ok(r.diagnostics.uniqueCandidateCount>=3);
 });
 await test('web search v2 context is bounded and labels snippet versus read evidence',async()=>{
  const r=await page.evaluate(()=>{
    const items=[];
    for(let i=0;i<20;i++)items.push(normalizeSearchCandidateV2({title:'T'+i,url:'https://example.com/'+i,snippet:'x'.repeat(3000),engine:'fixture',queryId:'q1',queryPriority:1,rank:i+1,language:'en',readState:i===0?'read_success':'snippet_only'}));
    const text=buildSearchContextTextV2(items);
    return {length:text.length,read:text.includes('read_success'),snippet:text.includes('snippet_only')};
  });
  assert.ok(r.length<=12000);assert.equal(r.read,true);assert.equal(r.snippet,true);
 });
 await test('web search v2 source UI exposes adapter, read state, and limited capability truth',async()=>{
  const r=await page.evaluate(()=>{
    const bubble=addMessage('assistant','fixture',{suppressScroll:true});
    renderSearchSources(bubble,[{title:'Source',url:'https://example.com',engine:'wikipedia_ar',readState:'read_success',capability:'knowledge_sources_only'}]);
    const wrapper=bubble.closest('.message');
    const meta=wrapper.querySelector('.search-source-meta')?.textContent||'';
    const all=wrapper.querySelector('.search-sources')?.textContent||'';
    wrapper.remove();
    return {meta,all};
  });
  assert.ok(r.meta.includes('Wikipedia ar'));assert.ok(r.meta.includes('Read'));assert.ok(r.all.includes('limited search coverage'));
 });
 await test('web search v2 diagnostics avoid secrets and full page content',async()=>{
  const r=await page.evaluate(()=>{
    const snap=SevenSearchV2.snapshot();
    const raw=JSON.stringify(snap||{});
    return {secret:/gsk_|sk-or-|nvapi-|AIza|Authorization|Bearer/i.test(raw),full:/DDG Android summary|English Android full intro|مقدمة أندرويد العربية/.test(raw)};
  });
  assert.equal(r.secret,false);assert.equal(r.full,false);
 });

 await test('web search gateway URL validation requires clean HTTPS',async()=>{
  const r=await page.evaluate(()=>({
    good:SevenSearchV2.normalizeGatewayUrl('https://gateway.example/path/'),
    http:SevenSearchV2.normalizeGatewayUrl('http://gateway.example'),
    credentialed:SevenSearchV2.normalizeGatewayUrl('https://user:pass@gateway.example')
  }));
  assert.equal(r.good,'https://gateway.example/path');assert.equal(r.http,null);assert.equal(r.credentialed,null);
 });
 await test('web search gateway joins the parallel pool and reader upgrades source state',async()=>{
  const r=await page.evaluate(async()=>{
    SevenSearchV2.clearCache();
    const oldFetch=fetchWithTimeout,oldUrl=SEARCH_GATEWAY_URL,oldKey=SEARCH_GATEWAY_KEY;
    SEARCH_GATEWAY_URL='https://gateway.example';SEARCH_GATEWAY_KEY='gateway-secret-fixture';
    fetchWithTimeout=async (url,opts)=>{
      const s=String(url);
      if(s==='https://gateway.example/v1/search'){
        const body=JSON.parse(opts.body);
        if(opts.headers['X-Seven-Gateway-Key']!=='gateway-secret-fixture')throw new Error('missing key');
        return {ok:true,json:async()=>({capability:'general_web',backend:'brave',results:[
          {title:'General Android source',url:'https://docs.example.com/android',snippet:'Latest Android update API documentation',rank:1,sourceType:'documentation',publishedAt:new Date().toISOString()},
          {title:'Android release notes',url:'https://release.example.com/android',snippet:'Latest Android update release notes',rank:2,sourceType:'official',publishedAt:new Date().toISOString()}
        ]})};
      }
      if(s==='https://gateway.example/v1/read'){
        const body=JSON.parse(opts.body);
        return {ok:true,json:async()=>({readState:'read_success',title:'General Android source',text:'General article body with verified Android details.',finalUrl:body.url,contentType:'text/html',injectionSuspected:false})};
      }
      return {ok:false,json:async()=>({})};
    };
    try{
      const out=await performWebSearchV2('latest Android update');
      const raw=JSON.stringify({diagnostics:out?.diagnostics,context:out?.contextText,sources:out?.sources});
      return {
        capability:out?.capability,
        status:out?.status,
        engines:(out?.sources||[]).map(x=>x.engine),
        states:(out?.sources||[]).map(x=>x.readState),
        pagesRead:out?.diagnostics?.pagesRead,
        hasBody:(out?.contextText||'').includes('General article body'),
        leaked:raw.includes('gateway-secret-fixture')
      };
    }finally{fetchWithTimeout=oldFetch;SEARCH_GATEWAY_URL=oldUrl;SEARCH_GATEWAY_KEY=oldKey;}
  });
  assert.equal(r.capability,'general_web');assert.equal(r.status,'success');assert.ok(r.engines.includes('gateway_brave'));assert.ok(r.states.includes('read_success'));assert.ok(r.pagesRead>=1);assert.equal(r.hasBody,true);assert.equal(r.leaked,false);
 });
 await test('web search gateway failure degrades truthfully to limited capability',async()=>{
  const r=await page.evaluate(async()=>{
    SevenSearchV2.clearCache();
    const oldFetch=fetchWithTimeout,oldUrl=SEARCH_GATEWAY_URL,oldKey=SEARCH_GATEWAY_KEY;
    SEARCH_GATEWAY_URL='https://gateway.example';SEARCH_GATEWAY_KEY='';
    fetchWithTimeout=async (url)=>{
      const s=String(url);
      if(s.includes('gateway.example'))return {ok:false,status:502,json:async()=>({error:'down'})};
      if(s.includes('api.duckduckgo.com'))return {ok:true,json:async()=>({Heading:'Fallback',AbstractText:'Fallback knowledge result',AbstractURL:'https://example.com/fallback',RelatedTopics:[]})};
      return {ok:false,json:async()=>({})};
    };
    try{
      const out=await performWebSearchV2('fallback query');
      return {capability:out?.capability,status:out?.status,configured:out?.diagnostics?.gatewayConfigured,sources:out?.sources?.length||0};
    }finally{fetchWithTimeout=oldFetch;SEARCH_GATEWAY_URL=oldUrl;SEARCH_GATEWAY_KEY=oldKey;}
  });
  assert.equal(r.capability,'limited_capability');assert.equal(r.status,'partial');assert.equal(r.configured,true);assert.ok(r.sources>=1);
 });
 await test('web search gateway reader failure stays explicit and preserves snippet evidence',async()=>{
  const r=await page.evaluate(async()=>{
    SevenSearchV2.clearCache();
    const oldFetch=fetchWithTimeout,oldUrl=SEARCH_GATEWAY_URL,oldKey=SEARCH_GATEWAY_KEY;
    SEARCH_GATEWAY_URL='https://gateway.example';SEARCH_GATEWAY_KEY='';
    fetchWithTimeout=async (url,opts)=>{
      const s=String(url);
      if(s.endsWith('/v1/search'))return {ok:true,json:async()=>({capability:'general_web_degraded',backend:'duckduckgo_html',results:[{title:'Result',url:'https://site.example/page',snippet:'Useful search snippet',rank:1}]})};
      if(s.endsWith('/v1/read'))throw Object.assign(new Error('reader timeout'),{code:'PROVIDER_TIMEOUT'});
      return {ok:false,json:async()=>({})};
    };
    try{
      const out=await performWebSearchV2('reader failure');
      const source=out?.sources?.find(x=>x.url.includes('site.example'));
      return {capability:out?.capability,state:source?.readState,context:out?.contextText||'',blocked:out?.diagnostics?.pagesBlocked};
    }finally{fetchWithTimeout=oldFetch;SEARCH_GATEWAY_URL=oldUrl;SEARCH_GATEWAY_KEY=oldKey;}
  });
  assert.equal(r.capability,'general_web_degraded');assert.equal(r.state,'failed');assert.ok(r.context.includes('Useful search snippet'));assert.ok(r.blocked>=1);
 });
 await test('web search gateway disabled preserves knowledge-sources-only behavior',async()=>{
  const r=await page.evaluate(async()=>{
    SevenSearchV2.clearCache();
    const oldFetch=fetchWithTimeout,oldUrl=SEARCH_GATEWAY_URL,oldKey=SEARCH_GATEWAY_KEY;
    SEARCH_GATEWAY_URL='';SEARCH_GATEWAY_KEY='should-not-be-used';
    fetchWithTimeout=async url=>{
      const s=String(url);
      if(s.includes('api.duckduckgo.com'))return {ok:true,json:async()=>({Heading:'Local',AbstractText:'Local result',AbstractURL:'https://example.com/local',RelatedTopics:[]})};
      return {ok:false,json:async()=>({})};
    };
    try{
      const out=await performWebSearchV2('local fallback');
      return {capability:out?.capability,gatewayConfigured:out?.diagnostics?.gatewayConfigured,keyLeaked:JSON.stringify(out||{}).includes('should-not-be-used')};
    }finally{fetchWithTimeout=oldFetch;SEARCH_GATEWAY_URL=oldUrl;SEARCH_GATEWAY_KEY=oldKey;}
  });
  assert.equal(r.capability,'knowledge_sources_only');assert.equal(r.gatewayConfigured,false);assert.equal(r.keyLeaked,false);
 });
 await test('web search gateway is managed automatically with no manual credential controls',async()=>{
  const r=await page.evaluate(()=>{
    openSettings();
    const status=!!document.getElementById('searchGatewayStatus');
    const url=!!document.getElementById('searchGatewayUrlInput');
    const key=!!document.getElementById('searchGatewayKeyInput');
    const text=document.getElementById('searchGatewayStatus')?.textContent||'';
    closeSettings();
    return {status,url,key,text};
  });
  assert.equal(r.status,true);assert.equal(r.url,false);assert.equal(r.key,false);assert.ok(/without setup|managed/i.test(r.text));
 });

 await test('web search evidence freshness is query-relative',async()=>{
  const r=await page.evaluate(()=>{
    const now=Date.now();
    const current=new Date(now-24*60*60*1000).toISOString();
    const old=new Date(now-2*365*24*60*60*1000).toISOString();
    return {
      current:SevenSearchV2.freshness({publishedAt:current},'latest news today'),
      stale:SevenSearchV2.freshness({publishedAt:old},'latest news today'),
      evergreen:SevenSearchV2.freshness({publishedAt:old},'history of the web'),
      unknown:SevenSearchV2.freshness({},'latest news today')
    };
  });
  assert.equal(r.current,'current');assert.equal(r.stale,'stale');assert.equal(r.evergreen,'evergreen');assert.equal(r.unknown,'unknown');
 });
 await test('web search score parts deterministically sum to final candidate score',async()=>{
  const r=await page.evaluate(()=>{
    const item={title:'Android documentation',url:'https://developer.example/android',snippet:'Android API documentation current release',engine:'gateway_brave',queryId:'q1',queryPriority:1,rank:1,language:'en',sourceType:'documentation',readState:'read_success',publishedAt:new Date().toISOString(),discoveredBy:['a','b']};
    const normalized=SevenSearchV2.normalize(item);
    const parts=SevenSearchV2.scoreParts(normalized,'latest Android API documentation');
    const total=Object.values(parts.parts).reduce((a,b)=>a+Number(b||0),0);
    return {reported:parts.total,sum:Number(total.toFixed(3)),type:parts.parts.sourceType,freshness:parts.freshnessClass};
  });
  assert.equal(r.reported,r.sum);assert.ok(r.type>=10);assert.ok(['current','recent'].includes(r.freshness));
 });
 await test('web search evidence selection prefers independent hosts and stable IDs',async()=>{
  const r=await page.evaluate(()=>{
    const items=[
      {title:'A1',url:'https://a.example/1',snippet:'alpha',engine:'x',queryId:'q1',queryPriority:1,rank:1,language:'en',sourceType:'documentation',readState:'read_success'},
      {title:'A2',url:'https://a.example/2',snippet:'alpha two',engine:'x',queryId:'q1',queryPriority:1,rank:2,language:'en',sourceType:'documentation',readState:'read_success'},
      {title:'B1',url:'https://b.example/1',snippet:'beta',engine:'x',queryId:'q1',queryPriority:.9,rank:3,language:'en',sourceType:'government',readState:'read_success'},
      {title:'C1',url:'https://c.example/1',snippet:'gamma',engine:'x',queryId:'q1',queryPriority:.8,rank:4,language:'en',sourceType:'academic',readState:'snippet_only'}
    ];
    const ev=SevenSearchV2.evidence(items,'alpha beta gamma');
    return {ids:ev.map(x=>x.sourceId),hosts:ev.map(x=>new URL(x.url).hostname),eids:ev.map(x=>x.evidenceId)};
  });
  assert.deepEqual(r.ids,['S1','S2','S3','S4']);assert.deepEqual(r.eids,['E1','E2','E3','E4']);assert.equal(new Set(r.hosts.slice(0,3)).size,3);
 });
 await test('web search evidence context and system prompt share exact citation IDs',async()=>{
  const r=await page.evaluate(()=>{
    const candidates=[
      normalizeSearchCandidateV2({title:'Source One',url:'https://one.example/a',snippet:'Evidence one',engine:'fixture',queryId:'q1',queryPriority:1,rank:1,language:'en',sourceType:'documentation',readState:'read_success'}),
      normalizeSearchCandidateV2({title:'Source Two',url:'https://two.example/a',snippet:'Evidence two',engine:'fixture',queryId:'q1',queryPriority:.9,rank:2,language:'en',sourceType:'reference',readState:'snippet_only'})
    ];
    const intent=analyzeSearchIntentV2('test evidence');
    const ranked=dedupeSearchCandidatesV2(candidates,intent);
    const evidence=buildSearchEvidenceUnitsV2(ranked,intent);
    const context=buildSearchContextTextV2(evidence,intent);
    const msgs=serializeContextSources([
      createContextSource('policy','policy',{trustedInstructions:true,priority:100}),
      createContextSource('web',context,{priority:50,provenance:'web'})
    ],[]);
    return {context,system:msgs[0].content,ids:evidence.map(x=>x.sourceId)};
  });
  assert.ok(r.context.includes('[S1]'));assert.ok(r.context.includes('[S2]'));assert.ok(r.system.includes('cite only the provided source IDs exactly like [S1]'));assert.deepEqual(r.ids,['S1','S2']);
 });
 await test('inline search citations link only known source IDs and skip code',async()=>{
  const r=await page.evaluate(()=>{
    const bubble=addMessage('assistant','Known [S1] unknown [S99] and `[S1]`',{suppressScroll:true});
    bubble.innerHTML='<p>Known [S1] unknown [S99]</p><pre><code>[S1]</code></pre>';
    const linked=linkSearchCitationMarkersV2(bubble,[{id:'S1',title:'One',url:'https://one.example',readState:'read_success'}]);
    const links=[...bubble.querySelectorAll('a.inline-source-citation')].map(a=>({text:a.textContent,href:a.href,rel:a.rel}));
    const code=bubble.querySelector('code').textContent;
    const plain=bubble.textContent;
    bubble.closest('.message').remove();
    return {linked,links,code,plain};
  });
  assert.equal(r.linked,1);assert.equal(r.links.length,1);assert.equal(r.links[0].text,'[S1]');assert.ok(r.links[0].href.startsWith('https://one.example/'));assert.ok(r.links[0].rel.includes('noopener'));assert.equal(r.code,'[S1]');assert.ok(r.plain.includes('[S99]'));
 });
 await test('search source cards display stable ID, type, freshness and read state',async()=>{
  const r=await page.evaluate(()=>{
    const bubble=addMessage('assistant','fixture',{suppressScroll:true});
    renderSearchSources(bubble,[{id:'S1',title:'Official docs',url:'https://docs.example',engine:'gateway_brave',readState:'read_success',sourceType:'documentation',freshnessClass:'current',publishedAt:'2026-10-02',capability:'general_web'}]);
    const wrapper=bubble.closest('.message');
    const id=wrapper.querySelector('.search-source-id')?.textContent||'';
    const meta=wrapper.querySelector('.search-source-meta')?.textContent||'';
    wrapper.remove();
    return {id,meta};
  });
  assert.equal(r.id,'S1');assert.ok(r.meta.includes('Read'));assert.ok(r.meta.includes('documentation'));assert.ok(r.meta.includes('current'));assert.ok(r.meta.includes('2026-10-02'));
 });
 await test('search source metadata survives room normalization and render without storing page bodies',async()=>{
  const r=await page.evaluate(()=>{
    const old=currentRoom,id='citation-room-'+Date.now();
    const raw={history:[
      {role:'user',content:'question'},
      {role:'assistant',content:'Answer [S1]',searchSources:serializeSearchSourcesForHistoryV2([{id:'S1',title:'Source',url:'https://source.example',engine:'gateway_brave',readState:'read_success',sourceType:'documentation',freshnessClass:'recent',capability:'general_web'}])}
    ],knowledge:'',pinned:'',summary:'',knowledgeFiles:[]};
    const normalized=normalizeRoom(raw,id);
    rooms[id]=normalized;roomTitles[id]='Citation room';
    currentRoom=id;renderChatHistory();
    const linked=!!document.querySelector('#chat a.inline-source-citation');
    const card=!!document.querySelector('#chat .search-source-id');
    const persisted=Array.isArray(normalized.history[1].searchSources)&&normalized.history[1].searchSources[0]?.id==='S1';
    const serialized=JSON.stringify(normalized.history[1].searchSources);
    delete rooms[id];delete roomTitles[id];currentRoom=old;renderChatHistory();
    return {linked,card,persisted,containsBody:/Evidence one|General article body|full page/i.test(serialized)};
  });
  assert.equal(r.linked,true);assert.equal(r.card,true);assert.equal(r.persisted,true);assert.equal(r.containsBody,false);
 });
 await test('web search diagnostics expose freshness/source distributions without evidence bodies',async()=>{
  const r=await page.evaluate(async()=>{
    SevenSearchV2.clearCache();
    const oldFetch=fetchWithTimeout,oldUrl=SEARCH_GATEWAY_URL,oldKey=SEARCH_GATEWAY_KEY;
    SEARCH_GATEWAY_URL='';SEARCH_GATEWAY_KEY='';
    fetchWithTimeout=async url=>{
      const s=String(url);
      if(s.includes('api.duckduckgo.com'))return {ok:true,json:async()=>({Heading:'Diag',AbstractText:'Body fixture that should not enter diagnostics',AbstractURL:'https://example.com/diag',RelatedTopics:[]})};
      return {ok:false,json:async()=>({})};
    };
    try{
      const out=await performWebSearchV2('diagnostic query');
      const raw=JSON.stringify(out?.diagnostics||{});
      return {diag:out?.diagnostics,containsBody:raw.includes('Body fixture that should not enter diagnostics')};
    }finally{fetchWithTimeout=oldFetch;SEARCH_GATEWAY_URL=oldUrl;SEARCH_GATEWAY_KEY=oldKey;}
  });
  assert.ok(r.diag.evidenceCount>=1);assert.ok(r.diag.freshnessDistribution);assert.ok(r.diag.sourceTypeDistribution);assert.equal(r.containsBody,false);
 });

 await test('web search gap analysis accepts strong diverse read evidence',async()=>{
  const r=await page.evaluate(()=>{
    const items=[
      {title:'Android API official documentation',url:'https://docs.example/android',snippet:'Android API official documentation reference',engine:'fixture',queryId:'q1',queryPriority:1,rank:1,language:'en',sourceType:'documentation',readState:'read_success'},
      {title:'Android API platform guidance',url:'https://gov.example/android',snippet:'Android API official platform guidance documentation',engine:'fixture',queryId:'q1',queryPriority:.9,rank:2,language:'en',sourceType:'government',readState:'read_success'}
    ];
    const ev=SevenSearchV2.evidence(items,'Android API official documentation');
    return SevenSearchV2.assess(ev,'Android API official documentation');
  });
  assert.equal(r.sufficient,true);assert.deepEqual(r.gapCodes,[]);assert.ok(r.score>=.62);assert.equal(r.independentHostCount,2);assert.equal(r.readCount,2);
 });
 await test('web search gap analysis identifies thin snippet-only evidence',async()=>{
  const r=await page.evaluate(()=>{
    const items=[{title:'One result',url:'https://one.example/a',snippet:'short answer',engine:'fixture',queryId:'q1',queryPriority:1,rank:1,language:'en',sourceType:'reference',readState:'snippet_only'}];
    const ev=SevenSearchV2.evidence(items,'technical API answer');
    return SevenSearchV2.assess(ev,'technical API answer');
  });
  assert.equal(r.sufficient,false);assert.ok(r.gapCodes.includes('too_few_sources'));assert.ok(r.gapCodes.includes('no_read_evidence'));assert.ok(r.gapCodes.includes('no_strong_source'));
 });
 await test('web search gap analysis flags stale evidence only for current questions',async()=>{
  const r=await page.evaluate(()=>{
    const old='2024-01-01T00:00:00Z';
    const items=[
      {title:'Android release old',url:'https://a.example/release',snippet:'Latest Android release information',engine:'fixture',queryId:'q1',queryPriority:1,rank:1,language:'en',sourceType:'documentation',readState:'read_success',publishedAt:old},
      {title:'Android release archive',url:'https://b.example/release',snippet:'Latest Android release information archive',engine:'fixture',queryId:'q1',queryPriority:.9,rank:2,language:'en',sourceType:'official',readState:'read_success',publishedAt:old}
    ];
    const current=SevenSearchV2.assess(SevenSearchV2.evidence(items,'latest Android release today'),'latest Android release today');
    const evergreen=SevenSearchV2.assess(SevenSearchV2.evidence(items,'Android release history'),'Android release history');
    return {current,evergreen};
  });
  assert.ok(r.current.gapCodes.includes('stale_current_query'));assert.equal(r.evergreen.gapCodes.includes('stale_current_query'),false);
 });
 await test('web search follow-up planner is bounded and deduplicates initial query text',async()=>{
  const r=await page.evaluate(()=>{
    const question='latest Android API';
    const intent=SevenSearchV2.analyze(question);
    const assessment={gapCodes:['stale_current_query','no_strong_source','too_few_sources'],sufficient:false};
    const first=question+' '+intent.currentYear+' latest official source';
    const follow=SevenSearchV2.followUp(question,[],assessment,[{text:first}]);
    return {follow,first};
  });
  assert.ok(r.follow.length<=2);assert.ok(r.follow.length>=1);assert.equal(r.follow.some(q=>q.text.toLowerCase()===r.first.toLowerCase()),false);assert.equal(new Set(r.follow.map(q=>q.text.toLowerCase())).size,r.follow.length);
 });
 await test('web search conflict signals flag material numeric disagreement but not near-equal values',async()=>{
  const r=await page.evaluate(()=>{
    const make=value=>[
      {evidenceId:'E1',sourceId:'S1',title:'GPU benchmark RTX test',url:'https://a.example/gpu',excerpt:'GPU benchmark RTX test reaches '+value[0]+' fps sustained',engine:'x',queryId:'q1',readState:'read_success',sourceType:'specialist',language:'en',freshnessClass:'evergreen'},
      {evidenceId:'E2',sourceId:'S2',title:'GPU benchmark RTX test',url:'https://b.example/gpu',excerpt:'GPU benchmark RTX test reaches '+value[1]+' fps sustained',engine:'y',queryId:'q1',readState:'read_success',sourceType:'specialist',language:'en',freshnessClass:'evergreen'}
    ];
    return {
      different:SevenSearchV2.conflicts(make([60,90]),'GPU benchmark RTX test'),
      near:SevenSearchV2.conflicts(make([60,61]),'GPU benchmark RTX test')
    };
  });
  assert.ok(r.different.some(x=>x.code==='possible_numeric_disagreement'));assert.equal(r.near.some(x=>x.code==='possible_numeric_disagreement'),false);
 });
 await test('web search conflict context presents signals as caution, not authority',async()=>{
  const r=await page.evaluate(()=>{
    const evidence=[
      {evidenceId:'E1',sourceId:'S1',title:'GPU benchmark RTX',url:'https://a.example',excerpt:'GPU benchmark RTX 60 fps',engine:'a',queryId:'q1',readState:'read_success',sourceType:'specialist',language:'en',freshnessClass:'evergreen'},
      {evidenceId:'E2',sourceId:'S2',title:'GPU benchmark RTX',url:'https://b.example',excerpt:'GPU benchmark RTX 90 fps',engine:'b',queryId:'q1',readState:'read_success',sourceType:'specialist',language:'en',freshnessClass:'evergreen'}
    ];
    const assessment={gapCodes:[],score:.8};
    const conflicts=[{code:'possible_numeric_disagreement',sources:['S1','S2'],unit:'fps'}];
    return buildSearchContextTextV2(evidence,SevenSearchV2.analyze('GPU benchmark RTX'),assessment,conflicts);
  });
  assert.ok(r.includes('possible disagreement signals'));assert.ok(r.includes('Do not silently resolve'));assert.ok(r.includes('[S1]'));assert.ok(r.includes('[S2]'));
 });
 await test('web search insufficient first wave triggers exactly one bounded follow-up wave',async()=>{
  const r=await page.evaluate(async()=>{
    SevenSearchV2.clearCache();
    const oldFetch=fetchWithTimeout,oldUrl=SEARCH_GATEWAY_URL,oldKey=SEARCH_GATEWAY_KEY;
    SEARCH_GATEWAY_URL='';SEARCH_GATEWAY_KEY='';
    let ddgCalls=0;
    fetchWithTimeout=async url=>{
      const s=String(url);
      if(s.includes('api.duckduckgo.com')){
        ddgCalls++;
        const q=new URL(s).searchParams.get('q')||'';
        if(q.includes('independent source'))return {ok:true,json:async()=>({Heading:'Second independent result',AbstractText:'Android API coverage independent evidence',AbstractURL:'https://two.example/result',RelatedTopics:[]})};
        return {ok:true,json:async()=>({Heading:'First result',AbstractText:'Android API coverage evidence',AbstractURL:'https://one.example/result',RelatedTopics:[]})};
      }
      if(s.includes('wikipedia.org'))return {ok:true,json:async()=>({query:{search:[]}})};
      return {ok:false,json:async()=>({})};
    };
    try{
      const out=await performWebSearchV2('Android API coverage test');
      return {ddgCalls,diag:out?.diagnostics,queries:out?.queries?.map(q=>q.text)||[],sources:out?.sources?.length||0};
    }finally{fetchWithTimeout=oldFetch;SEARCH_GATEWAY_URL=oldUrl;SEARCH_GATEWAY_KEY=oldKey;}
  });
  assert.equal(r.diag.followUpWaveCount,1);assert.ok(r.diag.followUpCount>=1&&r.diag.followUpCount<=2);assert.equal(r.ddgCalls,r.diag.queryCount);assert.ok(r.sources>=2);
 });
 await test('web search sufficient first wave avoids follow-up latency',async()=>{
  const r=await page.evaluate(async()=>{
    SevenSearchV2.clearCache();
    const oldFetch=fetchWithTimeout,oldUrl=SEARCH_GATEWAY_URL,oldKey=SEARCH_GATEWAY_KEY;
    SEARCH_GATEWAY_URL='https://gateway.example';SEARCH_GATEWAY_KEY='';
    let searchCalls=0,readCalls=0;
    fetchWithTimeout=async (url,opts)=>{
      const s=String(url);
      if(s==='https://gateway.example/v1/search'){
        searchCalls++;
        return {ok:true,json:async()=>({capability:'general_web',backend:'brave',results:[
          {title:'Android API documentation',url:'https://docs.example/api',snippet:'Android API documentation official reference',rank:1,sourceType:'documentation'},
          {title:'Android API official guide',url:'https://official.example/api',snippet:'Android API official documentation guide',rank:2,sourceType:'official'}
        ]})};
      }
      if(s==='https://gateway.example/v1/read'){
        readCalls++;
        const body=JSON.parse(opts.body);
        return {ok:true,json:async()=>({readState:'read_success',title:'Read page',text:'Android API official documentation guide reference with full details.',finalUrl:body.url,contentType:'text/html',injectionSuspected:false})};
      }
      if(s.includes('api.duckduckgo.com'))return {ok:true,json:async()=>({RelatedTopics:[]})};
      if(s.includes('wikipedia.org'))return {ok:true,json:async()=>({query:{search:[]}})};
      return {ok:false,json:async()=>({})};
    };
    try{
      const out=await performWebSearchV2('Android API documentation');
      return {searchCalls,readCalls,diag:out?.diagnostics};
    }finally{fetchWithTimeout=oldFetch;SEARCH_GATEWAY_URL=oldUrl;SEARCH_GATEWAY_KEY=oldKey;}
  });
  assert.equal(r.diag.sufficient,true);assert.equal(r.diag.followUpWaveCount,0);assert.equal(r.diag.followUpCount,0);assert.equal(r.searchCalls,r.diag.queryCount);assert.equal(r.readCalls,2);
 });
 await test('web search follow-up preserves prior read state and does not reread same successful URL',async()=>{
  const r=await page.evaluate(async()=>{
    SevenSearchV2.clearCache();
    const oldFetch=fetchWithTimeout,oldUrl=SEARCH_GATEWAY_URL,oldKey=SEARCH_GATEWAY_KEY;
    SEARCH_GATEWAY_URL='https://gateway.example';SEARCH_GATEWAY_KEY='';
    const reads={};
    fetchWithTimeout=async (url,opts)=>{
      const s=String(url);
      if(s==='https://gateway.example/v1/search'){
        const body=JSON.parse(opts.body);
        const follow=String(body.query).includes('independent source');
        return {ok:true,json:async()=>({capability:'general_web',backend:'brave',results:follow?[
          {title:'Coverage first',url:'https://one.example/page',snippet:'Android API coverage evidence',rank:1,sourceType:'reference'},
          {title:'Coverage second',url:'https://two.example/page',snippet:'Android API coverage independent source evidence',rank:2,sourceType:'reference'}
        ]:[
          {title:'Coverage first',url:'https://one.example/page',snippet:'Android API coverage evidence',rank:1,sourceType:'reference'}
        ]})};
      }
      if(s==='https://gateway.example/v1/read'){
        const body=JSON.parse(opts.body);reads[body.url]=(reads[body.url]||0)+1;
        return {ok:true,json:async()=>({readState:'read_success',title:'Read',text:'Android API coverage evidence full article '+body.url,finalUrl:body.url,contentType:'text/html',injectionSuspected:false})};
      }
      if(s.includes('api.duckduckgo.com'))return {ok:true,json:async()=>({RelatedTopics:[]})};
      if(s.includes('wikipedia.org'))return {ok:true,json:async()=>({query:{search:[]}})};
      return {ok:false,json:async()=>({})};
    };
    try{
      const out=await performWebSearchV2('Android API coverage test');
      return {reads,diag:out?.diagnostics,states:out?.sources?.map(x=>({url:x.url,state:x.readState}))};
    }finally{fetchWithTimeout=oldFetch;SEARCH_GATEWAY_URL=oldUrl;SEARCH_GATEWAY_KEY=oldKey;}
  });
  assert.equal(r.diag.followUpWaveCount,1);assert.equal(r.reads['https://one.example/page'],1);assert.equal(r.reads['https://two.example/page'],1);assert.ok(r.states.every(x=>x.state==='read_success'||x.state==='read_partial'));
 });
 await test('web search empty evidence returns no fabricated context',async()=>{
  const r=await page.evaluate(()=>buildSearchContextTextV2([],SevenSearchV2.analyze('nothing'),{gapCodes:['too_few_sources'],score:0},[]));
  assert.equal(r,'');
 });
 await test('web search Batch 4 diagnostics remain metadata-only',async()=>{
  const r=await page.evaluate(()=>{
    const snap=SevenSearchV2.snapshot()||{};
    const raw=JSON.stringify(snap);
    return {
      hasWave:Object.prototype.hasOwnProperty.call(snap,'followUpWaveCount'),
      secret:/gsk_|sk-or-|nvapi-|AIza|Authorization|Bearer|gateway-secret/i.test(raw),
      body:/full article https:\/\/|Android API coverage evidence full article/.test(raw)
    };
  });
  assert.equal(r.hasWave,true);assert.equal(r.secret,false);assert.equal(r.body,false);
 });

 await test('web search Batch 5 cache policy keeps current TTL shorter than evergreen TTL',async()=>{
  const r=await page.evaluate(()=>SevenSearchV2.cachePolicy());
  assert.ok(r.currentQueryTtlMs<r.evergreenQueryTtlMs);assert.ok(r.currentPageTtlMs<r.evergreenPageTtlMs);assert.equal(r.queryMaxEntries,80);assert.equal(r.pageMaxEntries,40);
 });
 await test('web search Batch 5 repeated adapter query hits cache and avoids network',async()=>{
  const r=await page.evaluate(async()=>{
    SevenSearchV2.clearCache();
    SevenSearchV2.clearCache();
    const oldFetch=fetchWithTimeout,oldUrl=SEARCH_GATEWAY_URL,oldKey=SEARCH_GATEWAY_KEY;
    SEARCH_GATEWAY_URL='';SEARCH_GATEWAY_KEY='';
    let calls=0;
    fetchWithTimeout=async url=>{
      calls++;
      const s=String(url);
      if(s.includes('api.duckduckgo.com'))return {ok:true,json:async()=>({Heading:'Cache Alpha',AbstractText:'cache alpha independent evidence',AbstractURL:'https://ddg.example/cache-alpha',RelatedTopics:[]})};
      if(s.includes('wikipedia.org')&&s.includes('list=search'))return {ok:true,json:async()=>({query:{search:[{title:'Cache Alpha',snippet:'cache alpha reference evidence'}]}})};
      if(s.includes('wikipedia.org')&&s.includes('prop=extracts'))return {ok:true,json:async()=>({query:{pages:{1:{extract:'Cache Alpha reference evidence full introduction'}}}})};
      return {ok:false,json:async()=>({})};
    };
    try{
      const first=await performWebSearchV2('cache alpha');
      const afterFirst=calls;
      const second=await performWebSearchV2('cache alpha');
      return {afterFirst,afterSecond:calls,first:first?.diagnostics,second:second?.diagnostics,cache:SevenSearchV2.cacheSnapshot()};
    }finally{fetchWithTimeout=oldFetch;SEARCH_GATEWAY_URL=oldUrl;SEARCH_GATEWAY_KEY=oldKey;SevenSearchV2.clearCache();}
  });
  assert.ok(r.afterFirst>=2);assert.equal(r.afterSecond,r.afterFirst);assert.ok(r.second.queryCacheHits>=2);assert.equal(r.second.networkSearchRequests,0);assert.ok(r.cache.queryEntries>=2);
 });
 await test('web search Batch 5 page cache prevents duplicate reader calls',async()=>{
  const r=await page.evaluate(async()=>{
    SevenSearchV2.clearCache();
    SevenSearchV2.clearCache();
    const oldFetch=fetchWithTimeout,oldUrl=SEARCH_GATEWAY_URL,oldKey=SEARCH_GATEWAY_KEY;
    SEARCH_GATEWAY_URL='https://gateway.example';SEARCH_GATEWAY_KEY='';
    let readerCalls=0;
    fetchWithTimeout=async (url,opts)=>{
      const s=String(url);
      if(s==='https://gateway.example/v1/search')return {ok:true,json:async()=>({capability:'general_web',backend:'fixture',results:[
        {title:'Cache docs A',url:'https://docs-a.example/page',snippet:'cache docs official documentation reference',rank:1,sourceType:'documentation'},
        {title:'Cache docs B',url:'https://docs-b.example/page',snippet:'cache docs official guide reference',rank:2,sourceType:'official'}
      ]})};
      if(s==='https://gateway.example/v1/read'){
        readerCalls++;const body=JSON.parse(opts.body);
        return {ok:true,json:async()=>({readState:'read_success',title:'Read',text:'cache docs official documentation reference full page',finalUrl:body.url,contentType:'text/html',injectionSuspected:false})};
      }
      if(s.includes('api.duckduckgo.com'))return {ok:true,json:async()=>({RelatedTopics:[]})};
      if(s.includes('wikipedia.org'))return {ok:true,json:async()=>({query:{search:[]}})};
      return {ok:false,json:async()=>({})};
    };
    try{
      const first=await performWebSearchV2('cache docs');
      const firstCalls=readerCalls;
      const second=await performWebSearchV2('cache docs');
      return {firstCalls,secondCalls:readerCalls,first:first?.diagnostics,second:second?.diagnostics,cache:SevenSearchV2.cacheSnapshot()};
    }finally{fetchWithTimeout=oldFetch;SEARCH_GATEWAY_URL=oldUrl;SEARCH_GATEWAY_KEY=oldKey;SevenSearchV2.clearCache();}
  });
  assert.equal(r.firstCalls,2);assert.equal(r.secondCalls,r.firstCalls);assert.ok(r.second.pageCacheHits>=2);assert.equal(r.second.readerNetworkRequests,0);assert.ok(r.cache.pageEntries>=2);
 });
 await test('web search Batch 5 cache remains bounded under many unique searches',async()=>{
  const r=await page.evaluate(async()=>{
    SevenSearchV2.clearCache();
    SevenSearchV2.clearCache();
    const oldFetch=fetchWithTimeout,oldUrl=SEARCH_GATEWAY_URL,oldKey=SEARCH_GATEWAY_KEY;
    SEARCH_GATEWAY_URL='';SEARCH_GATEWAY_KEY='';
    fetchWithTimeout=async url=>{
      const s=String(url);
      if(s.includes('api.duckduckgo.com'))return {ok:true,json:async()=>({RelatedTopics:[]})};
      if(s.includes('wikipedia.org'))return {ok:true,json:async()=>({query:{search:[]}})};
      return {ok:false,json:async()=>({})};
    };
    try{
      for(let i=0;i<16;i++)await performWebSearchV2('bounded-cache-'+i);
      return SevenSearchV2.cacheSnapshot();
    }finally{fetchWithTimeout=oldFetch;SEARCH_GATEWAY_URL=oldUrl;SEARCH_GATEWAY_KEY=oldKey;SevenSearchV2.clearCache();}
  });
  assert.ok(r.queryEntries<=r.queryMaxEntries);assert.ok(r.pageEntries<=r.pageMaxEntries);
 });
 await test('web search Batch 5 sufficient search emits truthful stages without fake reading',async()=>{
  const r=await page.evaluate(async()=>{
    SevenSearchV2.clearCache();
    SevenSearchV2.clearCache();
    const oldFetch=fetchWithTimeout,oldUrl=SEARCH_GATEWAY_URL,oldKey=SEARCH_GATEWAY_KEY;
    SEARCH_GATEWAY_URL='';SEARCH_GATEWAY_KEY='';
    const stages=[];
    fetchWithTimeout=async url=>{
      const s=String(url);
      if(s.includes('api.duckduckgo.com'))return {ok:true,json:async()=>({Heading:'Stage Alpha',AbstractText:'stage alpha independent evidence',AbstractURL:'https://stage-a.example/item',RelatedTopics:[]})};
      if(s.includes('wikipedia.org')&&s.includes('list=search'))return {ok:true,json:async()=>({query:{search:[{title:'Stage Alpha',snippet:'stage alpha reference evidence'}]}})};
      if(s.includes('wikipedia.org')&&s.includes('prop=extracts'))return {ok:true,json:async()=>({query:{pages:{1:{extract:'Stage Alpha reference evidence full introduction'}}}})};
      return {ok:false,json:async()=>({})};
    };
    try{
      const out=await performWebSearchV2('stage alpha',{onStage:s=>stages.push(s)});
      return {stages,diag:out?.diagnostics};
    }finally{fetchWithTimeout=oldFetch;SEARCH_GATEWAY_URL=oldUrl;SEARCH_GATEWAY_KEY=oldKey;SevenSearchV2.clearCache();}
  });
  assert.deepEqual(r.stages.map(x=>x.name),['planning','searching','checking','answering']);assert.equal(r.stages.some(x=>x.name==='reading'),false);assert.equal(r.stages.some(x=>x.name==='follow_up'),false);
 });
 await test('web search Batch 5 follow-up stage appears only for insufficient evidence',async()=>{
  const r=await page.evaluate(async()=>{
    SevenSearchV2.clearCache();
    SevenSearchV2.clearCache();
    const oldFetch=fetchWithTimeout,oldUrl=SEARCH_GATEWAY_URL,oldKey=SEARCH_GATEWAY_KEY;
    SEARCH_GATEWAY_URL='';SEARCH_GATEWAY_KEY='';
    const stages=[];
    fetchWithTimeout=async url=>{
      const s=String(url);
      if(s.includes('api.duckduckgo.com')){
        const q=new URL(s).searchParams.get('q')||'';
        if(q.includes('independent source'))return {ok:true,json:async()=>({Heading:'Follow Two',AbstractText:'Android API follow stage independent evidence',AbstractURL:'https://follow-two.example/page',RelatedTopics:[]})};
        return {ok:true,json:async()=>({Heading:'Follow One',AbstractText:'Android API follow stage evidence',AbstractURL:'https://follow-one.example/page',RelatedTopics:[]})};
      }
      if(s.includes('wikipedia.org'))return {ok:true,json:async()=>({query:{search:[]}})};
      return {ok:false,json:async()=>({})};
    };
    try{
      const out=await performWebSearchV2('Android API follow stage',{onStage:s=>stages.push(s)});
      return {names:stages.map(x=>x.name),diag:out?.diagnostics};
    }finally{fetchWithTimeout=oldFetch;SEARCH_GATEWAY_URL=oldUrl;SEARCH_GATEWAY_KEY=oldKey;SevenSearchV2.clearCache();}
  });
  assert.ok(r.names.includes('follow_up'));assert.equal(r.diag.followUpWaveCount,1);assert.ok(r.names.indexOf('follow_up')>r.names.indexOf('checking'));
 });
 await test('web search Batch 5 stage payload never exposes query body source body or gateway key',async()=>{
  const r=await page.evaluate(async()=>{
    SevenSearchV2.clearCache();
    SevenSearchV2.clearCache();
    const oldFetch=fetchWithTimeout,oldUrl=SEARCH_GATEWAY_URL,oldKey=SEARCH_GATEWAY_KEY;
    SEARCH_GATEWAY_URL='';SEARCH_GATEWAY_KEY='gateway-secret-should-not-appear';
    const stages=[];
    fetchWithTimeout=async url=>{
      const s=String(url);
      if(s.includes('api.duckduckgo.com'))return {ok:true,json:async()=>({RelatedTopics:[]})};
      if(s.includes('wikipedia.org'))return {ok:true,json:async()=>({query:{search:[]}})};
      return {ok:false,json:async()=>({})};
    };
    try{
      await performWebSearchV2('TOPSECRET_QUERY_123',{onStage:s=>stages.push(s)});
      const raw=JSON.stringify(stages);
      return {raw,diag:JSON.stringify(SevenSearchV2.snapshot()||{})};
    }finally{fetchWithTimeout=oldFetch;SEARCH_GATEWAY_URL=oldUrl;SEARCH_GATEWAY_KEY=oldKey;SevenSearchV2.clearCache();}
  });
  assert.equal(r.raw.includes('TOPSECRET_QUERY_123'),false);assert.equal(r.raw.includes('gateway-secret-should-not-appear'),false);assert.equal(r.diag.includes('TOPSECRET_QUERY_123'),false);assert.equal(r.diag.includes('gateway-secret-should-not-appear'),false);
 });
 await test('web search Batch 5 cache diagnostics expose counts only',async()=>{
  const r=await page.evaluate(()=>{const snap=SevenSearchV2.cacheSnapshot(),raw=JSON.stringify(snap);return {snap,raw};});
  assert.ok(Object.keys(r.snap).every(k=>['schemaVersion','queryEntries','pageEntries','queryMaxEntries','pageMaxEntries'].includes(k)));assert.equal(/https?:|query|snippet|gateway-secret|api[_-]?key/i.test(r.raw.replace(/queryEntries|queryMaxEntries/g,'')),false);
 });

 await test('web search Batch 4 polish flags explicit polarity disagreement conservatively',async()=>{
  const r=await page.evaluate(()=>SevenSearchV2.conflicts([
    {evidenceId:'E1',sourceId:'S1',title:'Feature support',url:'https://one.example/a',excerpt:'This feature is supported and available on Android.',engine:'a',queryId:'q1',readState:'read_success',sourceType:'documentation',language:'en',freshnessClass:'current'},
    {evidenceId:'E2',sourceId:'S2',title:'Feature support',url:'https://two.example/a',excerpt:'This feature is not available and unsupported on Android.',engine:'b',queryId:'q1',readState:'read_success',sourceType:'documentation',language:'en',freshnessClass:'current'}
  ],'latest Android feature support'));
  assert.ok(r.some(x=>x.code==='possible_polarity_disagreement'));assert.ok(r.every(x=>Array.isArray(x.sources)&&x.sources.length===2));
 });
 await test('web search Batch 4 polish exposes bounded follow-up query diagnostics',async()=>{
  const r=await page.evaluate(async()=>{
    SevenSearchV2.clearCache();
    const oldRun=runSearchWaveV2,oldRead=readTopSearchCandidatesV2;let wave=0;
    runSearchWaveV2=async()=>{
      wave++;
      const raw=wave===1?[
        normalizeSearchCandidateV2({title:'Weak',url:'https://weak.example/a',snippet:'coverage topic',engine:'fixture',queryId:'q1',queryPriority:1,rank:1,language:'en',sourceType:'reference',readState:'snippet_only'})
      ]:[
        normalizeSearchCandidateV2({title:'Independent',url:'https://independent.example/a',snippet:'coverage topic independent source',engine:'fixture',queryId:'fq1',queryPriority:.8,rank:1,language:'en',sourceType:'reference',readState:'read_success'})
      ];
      return {raw,gatewayReports:[]};
    };
    readTopSearchCandidatesV2=async rows=>({candidates:rows,pagesAttempted:0,pagesRead:0,pagesBlocked:0});
    try{
      const out=await performWebSearchV2('coverage topic');
      return {queries:out.diagnostics.followUpQueries,count:out.diagnostics.followUpCount,waves:out.diagnostics.followUpWaveCount};
    }finally{runSearchWaveV2=oldRun;readTopSearchCandidatesV2=oldRead;SevenSearchV2.clearCache();}
  });
  assert.ok(Array.isArray(r.queries));assert.equal(r.queries.length,r.count);assert.ok(r.queries.length<=2);assert.equal(r.waves,r.queries.length?1:0);
 });

 await test('web search batch6 intent taxonomy is deterministic',async()=>{
  const r=await page.evaluate(()=>({
    tech:SevenSearchV2.analyze('Android WebView API changes').intentType,
    cmp:SevenSearchV2.analyze('Pixel 10 vs Galaxy S26 battery').intentType,
    academic:SevenSearchV2.analyze('Find peer-reviewed papers about battery degradation').intentType,
    nav:SevenSearchV2.analyze('Open the official Android website').intentType,
    how:SevenSearchV2.analyze('How to configure Python asyncio timeout').intentType
  }));
  assert.deepEqual(r,{tech:'technical',cmp:'comparison',academic:'academic',nav:'navigational',how:'how_to'});
 });
 await test('web search batch6 technical plan asks for documentation coverage',async()=>{
  const r=await page.evaluate(()=>SevenSearchV2.plan('Android WebView API changes'));
  assert.equal(r.intent.intentType,'technical');assert.ok(r.intent.sourceNeeds.includes('documentation'));assert.ok(r.queries.some(q=>q.sourceTypeHint==='documentation'&&q.coverageKey==='official_docs'));assert.ok(r.queries.length<=5);
 });
 await test('web search batch6 comparison decomposes into balanced subject coverage',async()=>{
  const r=await page.evaluate(()=>SevenSearchV2.plan('Pixel 10 vs Galaxy S26 battery life'));
  const keys=r.queries.map(q=>q.coverageKey);
  assert.equal(r.intent.intentType,'comparison');assert.ok(keys.includes('subject_a'));assert.ok(keys.includes('subject_b'));assert.ok(keys.includes('independent_comparison'));assert.ok(r.queries.length<=5);
 });
 await test('web search batch6 ambiguous comparison falls back without inventing subjects',async()=>{
  const r=await page.evaluate(()=>SevenSearchV2.plan('Which one is better? compare them'));
  assert.equal(r.intent.intentType,'comparison');assert.ok(r.intent.comparisonSubjects.length<2);assert.ok(!r.queries.some(q=>q.coverageKey==='subject_a'||q.coverageKey==='subject_b'));assert.ok(r.queries.length>=1&&r.queries.length<=5);
 });
 await test('web search batch6 current queries add freshness and primary coverage',async()=>{
  const r=await page.evaluate(()=>SevenSearchV2.plan('latest Android security update today'));
  const keys=r.queries.map(q=>q.coverageKey);
  assert.ok(['current_fact','technical'].includes(r.intent.intentType));assert.ok(r.intent.timeSensitive);assert.ok(r.queries.some(q=>q.recencyHint==='day'));assert.ok(keys.includes('primary')||keys.includes('primary_current')||keys.includes('official_docs'));assert.ok(r.queries.length<=5);
 });
 await test('web search batch6 preserves Arabic primary and useful English technical entity query',async()=>{
  const r=await page.evaluate(()=>SevenSearchV2.plan('ما هي أحدث تغييرات Android WebView API؟'));
  assert.equal(r.intent.language,'ar');assert.equal(r.queries[0].language,'ar');assert.ok(r.queries.some(q=>q.language==='en'&&q.purpose==='entity_english'));assert.ok(r.queries.length<=5);
 });
 await test('web search batch6 source classifier is conservative',async()=>{
  const r=await page.evaluate(()=>({
    gov:SevenSearchV2.classifySource({url:'https://www.nasa.gov/news',title:'NASA'}),
    docs:SevenSearchV2.classifySource({url:'https://developer.android.com/reference/android/webkit/WebView',title:'WebView API Reference'}),
    academic:SevenSearchV2.classifySource({url:'https://arxiv.org/abs/1234.5678',title:'Paper'}),
    reference:SevenSearchV2.classifySource({url:'https://en.wikipedia.org/wiki/WebView',title:'WebView'}),
    community:SevenSearchV2.classifySource({url:'https://github.com/example/repo/issues/1',title:'Issue'}),
    unknown:SevenSearchV2.classifySource({url:'https://example.net/article',title:'Article'})
  }));
  assert.deepEqual(r,{gov:'government',docs:'documentation',academic:'academic',reference:'reference',community:'community',unknown:'unknown'});
 });
 await test('web search batch6 technical scoring favors documentation in near ties',async()=>{
  const r=await page.evaluate(()=>{
    const q='Android WebView API changes';
    const docs={title:'Android WebView API changes',url:'https://developer.android.com/reference/android/webkit/WebView',snippet:'Android WebView API changes',engine:'fixture',queryId:'q1',queryPriority:1,rank:1,language:'en',sourceType:'documentation',readState:'read_success'};
    const generic={title:'Android WebView API changes',url:'https://example.com/webview',snippet:'Android WebView API changes',engine:'fixture',queryId:'q1',queryPriority:1,rank:1,language:'en',sourceType:'unknown',readState:'read_success'};
    return {docs:SevenSearchV2.scoreParts(docs,q).total,generic:SevenSearchV2.scoreParts(generic,q).total};
  });
  assert.ok(r.docs>r.generic);
 });
 await test('web search batch6 authority cannot rescue irrelevant documentation',async()=>{
  const r=await page.evaluate(()=>{
    const q='Android WebView API changes';
    const irrelevant={title:'Cooking documentation',url:'https://docs.example.com/cooking',snippet:'recipes kitchen food',engine:'fixture',queryId:'q1',queryPriority:1,rank:1,language:'en',sourceType:'documentation',readState:'read_success'};
    const relevant={title:'Android WebView API changes explained',url:'https://specialist.example.com/webview',snippet:'Android WebView API changes compatibility',engine:'fixture',queryId:'q1',queryPriority:1,rank:1,language:'en',sourceType:'specialist',readState:'read_success'};
    return {irrelevant:SevenSearchV2.scoreParts(irrelevant,q).total,relevant:SevenSearchV2.scoreParts(relevant,q).total};
  });
  assert.ok(r.relevant>r.irrelevant);
 });
 await test('web search batch6 sends sourceTypeHint and domainHint to gateway payload',async()=>{
  const r=await page.evaluate(async()=>{
    const oldUrl=SEARCH_GATEWAY_URL,oldKey=SEARCH_GATEWAY_KEY,oldFetch=fetchWithTimeout;
    SEARCH_GATEWAY_URL='https://gateway.example';
    SEARCH_GATEWAY_KEY='';
    let body=null;
    fetchWithTimeout=async(url,opts)=>{body=JSON.parse(opts.body);return {ok:true,json:async()=>({backend:'fixture',capability:'general_web',results:[]})};};
    try{
      await searchGatewayCandidatesV2({id:'q1',text:'Android docs',language:'en',priority:1,sourceTypeHint:'documentation',domainHint:'developer.android.com',recencyHint:'week',purpose:'official_docs',coverageKey:'official_docs'},{language:'en'});
      return body;
    }finally{SEARCH_GATEWAY_URL=oldUrl;SEARCH_GATEWAY_KEY=oldKey;fetchWithTimeout=oldFetch;}
  });
  assert.equal(r.sourceTypeHint,'documentation');assert.equal(r.domainHint,'developer.android.com');assert.equal(r.recency,'week');
 });
 await test('web search batch6 coverage metadata reaches evidence units',async()=>{
  const r=await page.evaluate(()=>{
    const items=[{title:'Android docs',url:'https://developer.android.com/reference/android/webkit/WebView',snippet:'WebView API',engine:'fixture',queryId:'q1',queryPriority:1,queryPurpose:'official_docs',coverageKey:'official_docs',language:'en',sourceType:'documentation',readState:'read_success'}];
    const ev=SevenSearchV2.evidence(items,'Android WebView API');
    return ev[0];
  });
  assert.ok(r.coverageKeys.includes('official_docs'));assert.equal(r.queryPurpose,'official_docs');
 });
 await test('web search batch6 diagnostics expose coverage metadata without raw query text',async()=>{
  const r=await page.evaluate(async()=>{
    const oldDDG=searchDuckDuckGoCandidatesV2,oldWiki=searchWikipediaCandidatesV2,oldGateway=isSearchGatewayConfiguredV2;
    searchDuckDuckGoCandidatesV2=async q=>[normalizeSearchCandidateV2({title:'Android docs',url:'https://developer.android.com/reference/android/webkit/WebView',snippet:'Android WebView API changes',engine:'fixture',queryId:q.id,queryPriority:q.priority,queryPurpose:q.purpose,coverageKey:q.coverageKey,language:q.language,sourceType:'documentation',readState:'read_success'})];
    searchWikipediaCandidatesV2=async()=>[];
    isSearchGatewayConfiguredV2=()=>false;
    try{
      await performWebSearchV2('Android WebView API changes',{});
      const snap=SevenSearchV2.snapshot(),raw=JSON.stringify(SevenSearchV2.snapshot()||{});
      return {snap,hasRaw:raw.includes('Android WebView API changes')};
    }finally{searchDuckDuckGoCandidatesV2=oldDDG;searchWikipediaCandidatesV2=oldWiki;isSearchGatewayConfiguredV2=oldGateway;}
  });
  assert.ok(Array.isArray(r.snap.plannedCoverageKeys));assert.ok(Array.isArray(r.snap.coveredCoverageKeys));assert.equal(r.hasRaw,false);
 });

 await test('mode change cancels work started under the previous mode',async()=>{
  const r=await page.evaluate(()=>{
    const oldMode=SevenModeState.current(),oldRoom=currentRoom;
    let aborts=0;activeAbortController={abort(){aborts++}};isGenerating=true;activeGenerationRoomId=oldRoom;stopRequested=false;
    SevenModeState.set(oldMode==='search'?'think':'search');
    const changed={stopped:stopRequested,aborts,mode:SevenModeState.current()};
    stopRequested=false;aborts=0;SevenModeState.set(SevenModeState.current());
    const same={stopped:stopRequested,aborts};
    isGenerating=false;activeGenerationRoomId=null;activeAbortController=null;stopRequested=false;SevenModeState.set(oldMode);
    return {changed,same};
  });
  assert.equal(r.changed.stopped,true);assert.equal(r.changed.aborts,1);assert.equal(r.same.stopped,false);assert.equal(r.same.aborts,0);
 });
 await test('mode state keeps picker and runtime semantics identical',async()=>{
  const r=await page.evaluate(()=>{
    const before=SevenModeState.snapshot();
    SevenModeState.set('research');
    const research={state:SevenModeState.snapshot(),plan:createCognitiveRequestPlan({text:'research fixture',roomId:currentRoom})};
    SevenModeState.set('think');const think=SevenModeState.snapshot();
    SevenModeState.set('search');const search=SevenModeState.snapshot();
    SevenModeState.set(before.mode);
    return {research,think,search};
  });
  assert.deepEqual(r.research.state,{mode:'research',deepThink:false,search:false,research:true});
  assert.equal(r.research.plan.research.use,true);assert.equal(r.research.plan.web.use,true);assert.equal(r.research.plan.deepThink.use,true);
  assert.deepEqual(r.think,{mode:'think',deepThink:true,search:false,research:false});
  assert.deepEqual(r.search,{mode:'search',deepThink:false,search:true,research:false});
 });
 await test('deep research toggle is independent while controller implies web and Deep Think',async()=>{
  const r=await page.evaluate(()=>{
    const old={researchMode,searchMode,deepThinkMode};
    researchMode=false;searchMode=false;deepThinkMode=false;
    toggleResearchMode();
    const toggled={researchMode,searchMode,deepThinkMode,active:document.getElementById('researchToggle')?.classList.contains('active')===true};
    const plan=createCognitiveRequestPlan({text:'Research current Android WebView behavior',roomId:currentRoom,researchRequested:true,searchRequested:false,deepThinkRequested:false});
    const task=createCognitiveTaskPlan(plan);
    toggleResearchMode();
    researchMode=old.researchMode;searchMode=old.searchMode;deepThinkMode=old.deepThinkMode;
    document.getElementById('researchToggle')?.classList.toggle('active',researchMode);
    return {toggled,plan:{research:plan.research,web:plan.web,deep:plan.deepThink,verification:plan.verificationDepth},steps:task.steps.map(x=>x.id)};
  });
  assert.deepEqual(r.toggled,{researchMode:true,searchMode:false,deepThinkMode:false,active:true});
  assert.equal(r.plan.research.use,true);assert.equal(r.plan.web.use,true);assert.equal(r.plan.deep.use,true);assert.equal(r.plan.verification,'enhanced');
  assert.ok(r.steps.includes('research'));assert.ok(!r.steps.includes('web'));assert.ok(r.steps.includes('deepThink'));
 });
 await test('deep research planner is deterministic complementary and bounded',async()=>{
  const r=await page.evaluate(()=>{
    const a=SevenDeepResearchV2.plan('Compare Android WebView and Chrome Custom Tabs for a current app');
    const b=SevenDeepResearchV2.plan('Compare Android WebView and Chrome Custom Tabs for a current app');
    return {same:JSON.stringify(a)===JSON.stringify(b),count:a.subquestions.length,ids:a.subquestions.map(x=>x.id),coverage:a.subquestions.map(x=>x.coverageKey)};
  });
  assert.equal(r.same,true);assert.ok(r.count>=2&&r.count<=5);assert.equal(new Set(r.ids).size,r.ids.length);assert.ok(new Set(r.coverage).size>=2);
 });
 await test('deep research aggregates duplicate sources while preserving subquestion provenance',async()=>{
  const r=await page.evaluate(()=>{
    const old=localStorage.getItem('sevenDeepResearchV2');
    localStorage.removeItem('sevenDeepResearchV2');
    const run=createDeepResearchRunV2('Research fixture',currentRoom);
    const a=run.subquestions[0],b=run.subquestions[1]||{id:'rq2',coverageKey:'second'};
    const evidence={evidence:[{evidenceId:'S1',title:'Fixture',url:'https://example.com/a?utm_source=x',excerpt:'first',sourceType:'documentation',readState:'read_success',freshnessClass:'current',relevanceScore:90,coverageKeys:['one'],engine:'gateway_fixture'}],conflicts:[],assessment:{gapCodes:[]},diagnostics:{queryCount:1,pagesAttempted:1}};
    mergeResearchEvidenceV2(run,evidence,a);
    mergeResearchEvidenceV2(run,{...evidence,evidence:[{...evidence.evidence[0],url:'https://example.com/a',excerpt:'longer independent fixture evidence',coverageKeys:['two'],engine:'wikipedia_en'}]},b);
    const item=run.evidence[0];
    const out={count:run.evidence.length,ids:item.subquestionIds.slice().sort(),coverage:item.coverageKeys.slice().sort(),engines:item.engines.slice().sort(),url:item.url};
    if(old===null)localStorage.removeItem('sevenDeepResearchV2');else localStorage.setItem('sevenDeepResearchV2',old);
    return out;
  });
  assert.equal(r.count,1);assert.ok(r.ids.includes('rq1'));assert.ok(r.ids.length>=2);assert.ok(r.coverage.includes('one'));assert.ok(r.coverage.includes('two'));assert.ok(r.engines.includes('gateway_fixture'));assert.ok(r.engines.includes('wikipedia_en'));assert.equal(r.url,'https://example.com/a');
 });
 await test('deep research execution builds bounded R-citation evidence and checkpoint',async()=>{
  const r=await page.evaluate(async()=>{
    const oldStore=localStorage.getItem('sevenDeepResearchV2'),oldSearch=performWebSearchV2,oldStop=stopRequested;
    localStorage.removeItem('sevenDeepResearchV2');stopRequested=false;
    let calls=0;
    performWebSearchV2=async(q)=>{calls++;return {
      version:2,status:'success',capability:'general_web',
      evidence:[
        {evidenceId:'S1',title:'Official '+calls,url:'https://example'+calls+'.com/doc',excerpt:'Evidence '+calls,sourceType:'documentation',readState:'read_success',freshnessClass:'current',relevanceScore:94,coverageKeys:['fixture'],engine:'gateway_fixture'},
        {evidenceId:'S2',title:'Independent '+calls,url:'https://independent'+calls+'.org/report',excerpt:'Independent evidence '+calls,sourceType:'specialist',readState:'snippet_only',freshnessClass:'recent',relevanceScore:82,coverageKeys:['fixture2'],engine:'duckduckgo'}
      ],
      conflicts:[],assessment:{gapCodes:[],sufficient:true},diagnostics:{queryCount:1,pagesAttempted:1}
    }};
    try{
      const out=await performDeepResearchV2('Research current WebView behavior',currentRoom,{});
      const run=SevenDeepResearchV2.get(out.researchRunId),bundle=SevenDeepResearchV2.bundle(out.researchRunId);
      return {calls,status:out.researchStatus,sourceIds:out.sources.map(x=>x.id),context:out.contextText,evidence:run.evidence.length,completed:run.completedSubquestionIds.length,bundleKeys:Object.keys(bundle),stored:localStorage.getItem('sevenDeepResearchV2')||''};
    }finally{
      performWebSearchV2=oldSearch;stopRequested=oldStop;
      if(oldStore===null)localStorage.removeItem('sevenDeepResearchV2');else localStorage.setItem('sevenDeepResearchV2',oldStore);
    }
  });
  assert.ok(r.calls>=1&&r.calls<=5);assert.ok(['SUFFICIENT','PARTIAL'].includes(r.status));assert.ok(r.sourceIds.length>0&&r.sourceIds.every(x=>/^R\d+$/.test(x)));assert.ok(r.context.includes('[R1]'));assert.ok(r.evidence<=30);assert.ok(r.completed<=10);assert.ok(r.bundleKeys.includes('evidence'));assert.ok(!/gsk_|sk-or-|nvapi-|AIza|Authorization|Bearer|chain-of-thought/i.test(r.stored));
 });
 await test('deep research resume rejects room or question mismatch',async()=>{
  const r=await page.evaluate(async()=>{
    const old=localStorage.getItem('sevenDeepResearchV2');
    localStorage.removeItem('sevenDeepResearchV2');
    const run=createDeepResearchRunV2('Exact resume question','room-a');
    run.status='paused';checkpointDeepResearchRunV2(run);
    const wrongRoom=await SevenDeepResearchV2.resume(run.id,'room-b','Exact resume question',{});
    const wrongQuestion=await SevenDeepResearchV2.resume(run.id,'room-a','Different question',{});
    if(old===null)localStorage.removeItem('sevenDeepResearchV2');else localStorage.setItem('sevenDeepResearchV2',old);
    return {wrongRoom,wrongQuestion};
  });
  assert.equal(r.wrongRoom,null);assert.equal(r.wrongQuestion,null);
 });
 await test('deep research citations R# become links and source cards preserve R IDs',async()=>{
  const r=await page.evaluate(()=>{
    const bubble=addMessage('assistant','Claim [R1].',{suppressScroll:true});
    const sources=[{id:'R1',title:'Research source',url:'https://example.com/r',engine:'gateway_fixture',readState:'read_success',sourceType:'documentation',freshnessClass:'current',capability:'deep_research'}];
    linkSearchCitationMarkersV2(bubble,sources);renderSearchSources(bubble,sources);
    const link=bubble.querySelector('a.inline-source-citation')?.textContent||'';
    const sourceId=bubble.closest('.message').querySelector('.search-source-id')?.textContent||'';
    bubble.closest('.message').remove();
    return {link,sourceId};
  });
  assert.equal(r.link,'[R1]');assert.equal(r.sourceId,'R1');
 });
 await test('deep research toggle stays usable at 320px RTL',async()=>{
  await page.setViewportSize({width:320,height:800});
  const r=await page.evaluate(()=>{
    document.documentElement.setAttribute('dir','rtl');
    document.getElementById('sidebar').classList.add('collapsed');
    const button=document.getElementById('researchToggle'),composer=document.querySelector('.composer');
    const out={exists:!!button,visible:button.getBoundingClientRect().width>0&&button.getBoundingClientRect().height>0,composerFits:composer.scrollWidth<=composer.clientWidth+1,docFits:document.documentElement.scrollWidth<=window.innerWidth+1};
    document.documentElement.setAttribute('dir','ltr');
    return out;
  });
  assert.deepEqual(r,{exists:true,visible:true,composerFits:true,docFits:true});
 });

 await test('deep research citation audit allows known R ids and rejects invented R ids',async()=>{
  const r=await page.evaluate(()=>{
    const result={sources:[{id:'R1',url:'https://example.com/1'},{id:'R2',url:'https://example.com/2'}]};
    return {
      known:SevenDeepResearchV2.audit('Supported [R1] and [R2].',result),
      unknown:SevenDeepResearchV2.audit('Invented [R9].',result),
      missing:SevenDeepResearchV2.audit('No citations here.',result)
    };
  });
  assert.equal(r.known.valid,true);assert.equal(r.known.citedCount,2);assert.equal(r.unknown.valid,false);assert.deepEqual(r.unknown.unknown,['R9']);assert.equal(r.missing.citedCount,0);
 });
 await test('deep research verification gate fails unknown citations and warns missing citations',async()=>{
  const r=await page.evaluate(()=>{
    const controller=createCognitiveRequestPlan({text:'Research fixture',roomId:currentRoom,researchRequested:true,searchRequested:false,deepThinkRequested:false});
    const task=createCognitiveTaskPlan(controller);
    const searchResult={researchStatus:'PARTIAL',sources:[{id:'R1',title:'Fixture',url:'https://example.com',capability:'deep_research'}]};
    const base={controllerPlan:controller,taskPlan:task,messages:[{role:'system',content:'system'},{role:'user',content:'Research fixture'}],searchResult,executionRun:null,roomValid:true,stopped:false};
    const good=createVerificationResult({...base,reply:'Claim [R1].'});
    const bad=createVerificationResult({...base,reply:'Claim [R9].'});
    const missing=createVerificationResult({...base,reply:'Claim without citation.'});
    return {
      good:{outcome:good.outcome,codes:good.checks.filter(x=>x.id==='researchCitations')},
      bad:{outcome:bad.outcome,fail:bad.failureCodes},
      missing:{outcome:missing.outcome,warn:missing.warningCodes}
    };
  });
  assert.equal(r.good.outcome,'pass');assert.equal(r.good.codes[0].code,'research_citations_known');
  assert.equal(r.bad.outcome,'fail');assert.ok(r.bad.fail.includes('research_unknown_citation'));
  assert.equal(r.missing.outcome,'pass');assert.ok(r.missing.warn.includes('research_citations_missing'));
 });
 await test('deep research bridge exposes citation lock without source bodies or secrets',async()=>{
  const r=await page.evaluate(()=>{
    const old=localStorage.getItem('sevenDeepResearchV2');
    localStorage.removeItem('sevenDeepResearchV2');
    const run=createDeepResearchRunV2('Bridge fixture',currentRoom);
    run.evidence=[sanitizeResearchEvidenceV2({researchEvidenceId:'R1',title:'Official docs',url:'https://example.com/docs',excerpt:'PRIVATE FULL BODY SHOULD NOT APPEAR',sourceType:'documentation',readState:'read_success',freshnessClass:'current',engines:['gateway_fixture']})];
    checkpointDeepResearchRunV2(run);
    const bridge=SevenDeepResearchV2.bridge(run.id),raw=JSON.stringify(bridge);
    if(old===null)localStorage.removeItem('sevenDeepResearchV2');else localStorage.setItem('sevenDeepResearchV2',old);
    return {bridge,secret:/gsk_|sk-or-|nvapi-|AIza|Authorization|Bearer/i.test(raw),body:raw.includes('PRIVATE FULL BODY SHOULD NOT APPEAR')};
  });
  assert.deepEqual(r.bridge.citationLock,['R1']);assert.equal(r.secret,false);assert.equal(r.body,false);assert.ok(['SevenRuntime','SevenResearch','unavailable'].includes(r.bridge.runtime));
 });
 await test('deep research history serialization preserves run metadata for later export',async()=>{
  const r=await page.evaluate(()=>serializeSearchSourcesForHistoryV2([{id:'R1',title:'Source',url:'https://example.com',engine:'fixture',readState:'read_success',sourceType:'documentation',freshnessClass:'current',capability:'deep_research',researchRunId:'dr_fixture',researchStatus:'SUFFICIENT',researchScore:88}])[0]);
  assert.equal(r.researchRunId,'dr_fixture');assert.equal(r.researchStatus,'SUFFICIENT');assert.equal(r.researchScore,88);
 });
 await test('deep research source UI renders evidence header and export control',async()=>{
  const r=await page.evaluate(()=>{
    const bubble=addMessage('assistant','Report [R1].',{suppressScroll:true});
    const sources=[{id:'R1',title:'Research source',url:'https://example.com/r',engine:'gateway_fixture',readState:'read_success',sourceType:'documentation',freshnessClass:'current',capability:'deep_research',researchRunId:'dr_fixture',researchStatus:'PARTIAL',researchScore:67}];
    renderSearchSources(bubble,sources);
    const wrapper=bubble.closest('.message'),button=wrapper.querySelector('.research-export-btn'),head=wrapper.querySelector('.research-source-head')?.textContent||'';
    const out={button:button?.textContent||'',head,width:button?.getBoundingClientRect().width||0};
    wrapper.remove();
    return out;
  });
  assert.equal(r.button,'Export evidence');assert.ok(r.head.includes('PARTIAL'));assert.ok(r.head.includes('67'));assert.ok(r.width>0);
 });
 await test('deep research export emits bounded safe bundle through canonical JSON downloader',async()=>{
  const r=await page.evaluate(()=>{
    const oldStore=localStorage.getItem('sevenDeepResearchV2'),oldDownload=downloadJsonPayload;
    localStorage.removeItem('sevenDeepResearchV2');
    const run=createDeepResearchRunV2('Export fixture',currentRoom);
    run.evidence=[sanitizeResearchEvidenceV2({researchEvidenceId:'R1',title:'Source',url:'https://example.com/a',excerpt:'bounded excerpt',sourceType:'official',readState:'read_success',freshnessClass:'current',engines:['gateway']})];
    checkpointDeepResearchRunV2(run);
    let captured=null;
    downloadJsonPayload=(payload,filename)=>{captured={payload,filename};};
    try{
      const ok=SevenDeepResearchV2.export(run.id);
      const raw=JSON.stringify(captured||{});
      return {ok,filename:captured?.filename||'',hasEvidence:Array.isArray(captured?.payload?.evidence),secret:/gsk_|sk-or-|nvapi-|AIza|Authorization|Bearer|chain-of-thought/i.test(raw)};
    }finally{
      downloadJsonPayload=oldDownload;
      if(oldStore===null)localStorage.removeItem('sevenDeepResearchV2');else localStorage.setItem('sevenDeepResearchV2',oldStore);
    }
  });
  assert.equal(r.ok,true);assert.ok(r.filename.endsWith('.json'));assert.equal(r.hasEvidence,true);assert.equal(r.secret,false);
 });

 await test('deep research aggregate follow-up is targeted and keeps total questions bounded',async()=>{
  const r=await page.evaluate(()=>{
    const plan=planDeepResearchV2('Research current Android WebView behavior');
    const run={question:'Research current Android WebView behavior',subquestions:plan.subquestions.slice(),evidence:[],conflicts:[]};
    const follow=planAggregateResearchFollowUpV2(run,plan,{status:'PARTIAL',gaps:['source_diversity','freshness','unresolved_conflict']});
    return {initial:plan.subquestions.length,follow:follow.length,total:plan.subquestions.length+follow.length,ids:follow.map(x=>x.id),coverage:follow.map(x=>x.coverageKey)};
  });
  assert.ok(r.follow>=1&&r.follow<=2);assert.ok(r.total<=10);assert.equal(new Set(r.ids).size,r.ids.length);assert.equal(new Set(r.coverage).size,r.coverage.length);
 });
 await test('deep research enforces aggregate page-read ceiling across subquestions and follow-up',async()=>{
  const r=await page.evaluate(async()=>{
    const oldStore=localStorage.getItem('sevenDeepResearchV2'),oldSearch=performWebSearchV2,oldStop=stopRequested;
    localStorage.removeItem('sevenDeepResearchV2');stopRequested=false;
    const budgets=[];let calls=0;
    performWebSearchV2=async(q,opts)=>{
      calls++;const first=Math.max(0,Number(opts?.maxPageReads)||0),follow=Math.max(0,Number(opts?.maxFollowUpPageReads)||0);
      budgets.push(first+follow);
      return {
        version:2,status:'partial',capability:'general_web',
        evidence:[{evidenceId:'S1',title:'Evidence '+calls,url:'https://same.example.com/'+calls,excerpt:'Evidence',sourceType:'specialist',readState:'read_success',freshnessClass:'recent',relevanceScore:70,coverageKeys:['fixture'],engine:'gateway'}],
        conflicts:[],assessment:{gapCodes:['source_diversity'],sufficient:false},
        diagnostics:{queryCount:1,pagesAttempted:first+follow}
      };
    };
    try{
      const out=await performDeepResearchV2('Research fixture with weak diversity',currentRoom,{});
      const run=SevenDeepResearchV2.get(out.researchRunId);
      return {calls,budgets,pageCount:run.diagnostics.pageCount,subquestions:run.subquestions.length,terminal:out.terminalCode};
    }finally{
      performWebSearchV2=oldSearch;stopRequested=oldStop;
      if(oldStore===null)localStorage.removeItem('sevenDeepResearchV2');else localStorage.setItem('sevenDeepResearchV2',oldStore);
    }
  });
  assert.ok(r.calls>=1);assert.ok(r.budgets.every(x=>x>=0&&x<=5));assert.ok(r.pageCount<=12);assert.ok(r.subquestions<=10);assert.ok(['COMPLETE','PARTIAL','INCONCLUSIVE'].includes(r.terminal));
 });
 await test('deep research weak aggregate evidence can trigger one bounded follow-up round',async()=>{
  const r=await page.evaluate(async()=>{
    const oldStore=localStorage.getItem('sevenDeepResearchV2'),oldSearch=performWebSearchV2,oldStop=stopRequested;
    localStorage.removeItem('sevenDeepResearchV2');stopRequested=false;
    let calls=0;
    performWebSearchV2=async(q,opts)=>{
      calls++;
      const host=calls<=3?'weak.example.com':('independent'+calls+'.example.org');
      return {
        version:2,status:'partial',capability:'general_web',
        evidence:[{evidenceId:'S1',title:'Evidence '+calls,url:'https://'+host+'/doc'+calls,excerpt:'Evidence '+calls,sourceType:calls>3?'official':'specialist',readState:'read_success',freshnessClass:'current',relevanceScore:80,coverageKeys:['fixture'],engine:'gateway'}],
        conflicts:[],assessment:{gapCodes:calls<=3?['source_diversity']:[],sufficient:calls>3},
        diagnostics:{queryCount:1,pagesAttempted:1}
      };
    };
    try{
      const plan=SevenDeepResearchV2.plan('Research current platform behavior');
      const out=await performDeepResearchV2('Research current platform behavior',currentRoom,{});
      const run=SevenDeepResearchV2.get(out.researchRunId);
      return {initial:plan.subquestions.length,total:run.subquestions.length,followIds:run.subquestions.filter(x=>x.id.startsWith('rf')).map(x=>x.id),calls,diag:SevenDeepResearchV2.snapshot()};
    }finally{
      performWebSearchV2=oldSearch;stopRequested=oldStop;
      if(oldStore===null)localStorage.removeItem('sevenDeepResearchV2');else localStorage.setItem('sevenDeepResearchV2',oldStore);
    }
  });
  assert.ok(r.total>=r.initial);assert.ok(r.total<=10);assert.ok(r.followIds.length<=2);assert.ok(r.calls<=10);assert.ok((r.diag?.followUpCount||0)<=2);
 });
 await browser.close();server.close();fs.writeFileSync(require('path').join(__dirname,'results.json'),JSON.stringify({results,liveProviderCalls:false},null,2));
})().catch(e=>{console.error(e);server.close();process.exit(1)});
