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
      return {calls,captured,outLen:out.length,last:out[out.length-1].content,snap};
    }finally{requestAI=old;if(activeDeepThinkPerformance)finishDeepThinkPerformanceV1('cancelled');}
  });
  assert.equal(r.calls,1);assert.equal(r.captured.purpose,'deepThink');assert.equal(r.captured.latencyPriority,true);assert.ok(r.captured.timeoutMs>=25000);assert.ok(r.captured.maxTokens>=512);assert.ok(r.captured.system.includes('compact decision brief'));assert.ok(!r.captured.system.toLowerCase().includes('step by step'));assert.ok(r.last.includes('compact synthetic brief'));assert.ok(r.snap.deepRoute.provider==='fixture');
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
  assert.equal(r.intent.language,'ar');assert.ok(r.queries.length>=2&&r.queries.length<=3);assert.equal(r.queries[0].language,'ar');assert.ok(r.queries.some(q=>q.purpose==='freshness'));assert.ok(r.queries.some(q=>q.language==='en'));
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
 await test('web search v2 source UI exposes adapter and read state',async()=>{
  const r=await page.evaluate(()=>{
    const bubble=addMessage('assistant','fixture',{suppressScroll:true});
    renderSearchSources(bubble,[{title:'Source',url:'https://example.com',engine:'wikipedia_ar',readState:'read_success'}]);
    const meta=bubble.closest('.message').querySelector('.search-source-meta')?.textContent||'';
    bubble.closest('.message').remove();
    return meta;
  });
  assert.ok(r.includes('Wikipedia ar'));assert.ok(r.includes('Read'));
 });
 await test('web search v2 diagnostics avoid secrets and full page content',async()=>{
  const r=await page.evaluate(()=>{
    const snap=SevenSearchV2.snapshot();
    const raw=JSON.stringify(snap||{});
    return {secret:/gsk_|sk-or-|nvapi-|AIza|Authorization|Bearer/i.test(raw),full:/DDG Android summary|English Android full intro|مقدمة أندرويد العربية/.test(raw)};
  });
  assert.equal(r.secret,false);assert.equal(r.full,false);
 });
 await browser.close();server.close();fs.writeFileSync(require('path').join(__dirname,'results.json'),JSON.stringify({results,liveProviderCalls:false},null,2));
})().catch(e=>{console.error(e);server.close();process.exit(1)});
