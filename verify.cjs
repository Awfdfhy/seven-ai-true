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
 await test('room commit/reload and untouched legacy keys',async()=>{
  await page.evaluate(async()=>{rooms.default.history.push({role:'user',content:'مرحبا Seven 123 /src/A.js'});await saveRooms()});
  assert.equal(await page.evaluate(()=>localStorage.getItem('chat_rooms_v6')),null);
  await page.reload();await page.waitForFunction(()=>roomPersistence.status().ready);
  assert.equal(await page.evaluate(()=>rooms.default.history[0].content),'مرحبا Seven 123 /src/A.js');
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
 await test('awesome free api pack is wired and anonymous routes require opt-in',async()=>{
  const r=await page.evaluate(()=>{const providers=['kilo','llm7','aion','mistral','zai'];const catalog=getFreeModelCatalog();const before={kilo:isFreeProviderConfigured('kilo'),llm7:isFreeProviderConfigured('llm7')};const old=freeProviderPrefs;freeProviderPrefs=Object.assign({},old,{kilo:true,llm7:true});const after={kilo:isFreeProviderConfigured('kilo'),llm7:isFreeProviderConfigured('llm7')};freeProviderPrefs=old;return {providers:providers.every(id=>!!FREE_PROVIDER_REGISTRY[id]),seeds:['kilo-auto/free','gpt-oss:20b','aion-labs/aion-3.0','mistral-small-latest','glm-4.7-flash'].every(id=>catalog.some(m=>m.id===id)),before,after,ui:providers.every(id=>!!document.getElementById('provider'+id.charAt(0).toUpperCase()+id.slice(1)+'Enabled'))}});
  assert.deepEqual(r,{providers:true,seeds:true,before:{kilo:false,llm7:false},after:{kilo:true,llm7:true},ui:true});
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
  assert.deepEqual(r.a,r.b);
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

 await test('ui simplification keeps core routing controls visible and advanced groups collapsed',async()=>{
  const r=await page.evaluate(()=>{openSettings();const ids=['routingModeSelect','modelSelect','temperatureRange','reasoningEffort','maxTokens','freeFallbackToggle','providerGroqEnabled','providerNvidiaEnabled','providerOpenrouterEnabled','providerGeminiEnabled','pinnedNotes','knowledgeStatus'];const core=['routingModeSelect','modelSelect','temperatureRange','reasoningEffort','maxTokens'].every(id=>{const el=document.getElementById(id);return !!el&&el.closest('details')===null});return {all:ids.every(id=>!!document.getElementById(id)),core,providers:document.getElementById('providersSection').open,memory:document.getElementById('memoryDataSection').open,advanced:document.getElementById('advancedSection').open}});
  assert.deepEqual(r,{all:true,core:true,providers:false,memory:false,advanced:false});
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
  assert.equal(r.canonical,500);assert.ok(r.rendered<=CHAT_INITIAL_RENDER_LIMIT);assert.ok(r.hidden.includes('400 hidden'));assert.equal(r.regen,true);
 });
 await test('performance polish show-earlier expands projection without changing history',async()=>{
  const r=await page.evaluate(()=>new Promise(resolve=>{const old=currentRoom,id='perf-expand-'+Date.now();rooms[id]=createEmptyRoom();roomTitles[id]='Perf expand';for(let i=0;i<350;i++)rooms[id].history.push({role:i%2?'assistant':'user',content:'row '+i});currentRoom=id;chatRenderLimits.delete(id);renderChatHistory();const before=document.querySelectorAll('#chat .message').length,canonicalBefore=rooms[id].history.length;showEarlierChatMessages();requestAnimationFrame(()=>requestAnimationFrame(()=>{const after=document.querySelectorAll('#chat .message').length,canonicalAfter=rooms[id].history.length,limit=getChatRenderLimit(id);delete rooms[id];delete roomTitles[id];chatRenderLimits.delete(id);currentRoom=old;renderChatHistory();resolve({before,after,canonicalBefore,canonicalAfter,limit})}))}));
  assert.equal(r.canonicalBefore,350);assert.equal(r.canonicalAfter,350);assert.ok(r.after>r.before);assert.equal(r.limit,CHAT_INITIAL_RENDER_LIMIT+CHAT_RENDER_CHUNK);
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
  assert.deepEqual(r,{a:'offline',da:'offline',b:'online',db:'online'});
 });
 await test('performance polish visual viewport and diagnostics initialize safely',async()=>{
  const r=await page.evaluate(()=>{const vv=updateVisualViewportV1(),snap=SevenAppReliability.snapshot(),raw=JSON.stringify(SevenAppReliability.snapshot());return {width:vv.width,height:vv.height,version:snap.version,visibility:snap.visibility,network:snap.network,hasRender:!!snap.renderWindow,secret:/gsk_|sk-or-|nvapi-|AIza|Authorization|Bearer/i.test(raw),content:/message-499|chunk-49|Relevant memories/.test(raw)}});
  assert.ok(r.width>0&&r.height>0);assert.equal(r.version,1);assert.ok(['foreground','background'].includes(r.visibility));assert.ok(['online','offline','unknown'].includes(r.network));assert.equal(r.hasRender,true);assert.equal(r.secret,false);assert.equal(r.content,false);
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
 await browser.close();server.close();fs.writeFileSync(require('path').join(__dirname,'results.json'),JSON.stringify({results,liveProviderCalls:false},null,2));
})().catch(e=>{console.error(e);server.close();process.exit(1)});
