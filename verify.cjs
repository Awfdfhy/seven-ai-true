const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const fs=require('fs'), http=require('http'), assert=require('assert/strict');
const html=fs.readFileSync(require('path').join(__dirname,'../seven_ai-t152.html'),'utf8');
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
 await browser.close();server.close();fs.writeFileSync(require('path').join(__dirname,'results.json'),JSON.stringify({results,liveProviderCalls:false},null,2));
})().catch(e=>{console.error(e);server.close();process.exit(1)});
