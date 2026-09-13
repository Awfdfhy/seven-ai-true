const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const http=require('http');
const assert=require('assert/strict');
const {build,OUTPUT,MARK}=require('./build-release.cjs');

(async()=>{
  const built=build();
  const html=fs.readFileSync(OUTPUT,'utf8');
  const dist=path.dirname(OUTPUT);
  assert.ok(html.includes(MARK));
  assert.ok(built.bytes-built.sourceBytes<100000,'release layer unexpectedly heavy');

  const server=http.createServer((req,res)=>{
    const pathname=new URL(req.url,'http://127.0.0.1').pathname;
    if(pathname.startsWith('/vendor/')){
      const file=path.resolve(dist,'.'+pathname);
      if(!file.startsWith(path.resolve(dist)+path.sep)||!fs.existsSync(file)){res.statusCode=404;res.end('not found');return;}
      res.setHeader('Content-Type',file.endsWith('.mjs')?'text/javascript; charset=utf-8':'application/octet-stream');
      fs.createReadStream(file).pipe(res);return;
    }
    res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true});
  const results=[];
  async function test(name,fn){await fn();results.push({name,status:'PASS'});console.log('PASS',name)}
  try{
    const context=await browser.newContext({viewport:{width:390,height:844}});
    await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(100);
    if(errors.length)throw new Error('release bootstrap pageerror: '+errors.join(' | '));
    await page.waitForFunction(()=>window.SevenPerformance&&window.SevenPerformance.state.ready&&window.SevenControl&&window.SevenControl.state.ready&&window.SevenCanon&&window.SevenMotion&&window.SevenMotion.state.ready&&window.SevenUI&&window.SevenUI.state.ready&&window.SevenPdf,null,{timeout:10000});
    await page.waitForFunction(()=>typeof roomPersistence!=='undefined'&&roomPersistence.status().ready,null,{timeout:10000});

    await test('release runtime boots without page errors',async()=>{assert.deepEqual(errors,[])});
    await test('room persistence is ready',async()=>{const r=await page.evaluate(()=>roomPersistence.status());assert.equal(r.ready,true);assert.equal(r.failed,false)});
    await test('adaptive performance tier is installed',async()=>{const r=await page.evaluate(()=>({tier:SevenPerformance.state.tier,attr:document.documentElement.dataset.sevenPerformance,ready:SevenPerformance.state.ready}));assert.ok(['lite','balanced','full'].includes(r.tier));assert.equal(r.attr,r.tier);assert.equal(r.ready,true)});
    await test('control plane boots on the active performance tier',async()=>{const r=await page.evaluate(()=>({ready:SevenControl.state.ready,version:SevenControl.VERSION,tier:SevenControl.state.tier,performance:SevenPerformance.state.tier,attr:document.documentElement.dataset.sevenControl,budget:SevenControl.state.budget}));assert.equal(r.ready,true);assert.equal(r.version,'4.2.0');assert.equal(r.tier,r.performance);assert.equal(r.attr,'v4.2');assert.equal(r.budget.tier,r.tier);assert.ok(r.budget.contextTokens>=1024)});
    await test('task contracts fail closed outside explicit capability scope',async()=>{const r=await page.evaluate(()=>{const task=SevenControl.createTaskContract({id:'probe-task',goal:'probe',allowedCapabilities:['read','test'],deniedCapabilities:['delete']});return {read:SevenControl.canUseCapability(task,'read'),write:SevenControl.canUseCapability(task,'write'),del:SevenControl.canUseCapability(task,'delete')};});assert.equal(r.read.allowed,true);assert.equal(r.write.allowed,false);assert.equal(r.del.allowed,false)});
    await test('context compiler preserves hard token budget and lifecycle filters',async()=>{const r=await page.evaluate(()=>SevenControl.compileContext({maxTokens:500,reserveTokens:50,items:[{id:'required',category:'task',tokens:100,required:true,content:'x'},{id:'deleted',category:'memory',tokens:50,lifecycle:'deleted',content:'y'},{id:'large',category:'conversation',tokens:450,content:'z'}]}));assert.ok(r.tokensUsed<=r.tokenBudget);assert.ok(r.selected.some(x=>x.id==='required'));assert.ok(!r.selected.some(x=>x.id==='deleted'))});
    await test('derived truth cannot amplify source authority',async()=>{const r=await page.evaluate(()=>{const parent=SevenControl.createClaim({id:'parent',text:'fact',kind:'FACT',sources:[{id:'s',authority:'A2'}]});const child=SevenControl.deriveClaim({id:'child',text:'summary',parents:[parent],transformation:'summary'});return {parent:SevenControl.AUTH[parent.authority],child:SevenControl.AUTH[child.authority],blocked:SevenControl.resolveClaim(child,{allowInference:false}).state};});assert.ok(r.child<=r.parent);assert.equal(r.blocked,'UNKNOWN')});
    await test('side effects require verification evidence',async()=>{const r=await page.evaluate(()=>{const l=SevenControl.createSideEffectLedger();l.plan({idempotencyKey:'probe-write',reversible:true});l.mutate('probe-write','ATTEMPTED',{});let rejected=false;try{l.mutate('probe-write','VERIFIED',{})}catch(_){rejected=true;}const verified=l.mutate('probe-write','VERIFIED',{evidence:{sha:'abc'}});return {rejected,state:verified.state,unresolved:l.unresolved().length};});assert.equal(r.rejected,true);assert.equal(r.state,'VERIFIED');assert.equal(r.unresolved,0)});
    await test('motion layer is event delegated and ready',async()=>{assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('seven-motion-ready')),true)});
    await test('UI system runtime is semantic and ready',async()=>{const r=await page.evaluate(()=>({ready:SevenUI.state.ready,version:SevenUI.state.version,root:document.documentElement.dataset.sevenUi,composer:document.querySelector('.composer')?.dataset.sevenComposer,chatRole:document.getElementById('chat')?.getAttribute('role'),live:document.getElementById('chat')?.getAttribute('aria-live')}));assert.equal(r.ready,true);assert.equal(r.version,'2.0.0');assert.equal(r.root,'v2');assert.equal(r.composer,'v2');assert.equal(r.chatRole,'log');assert.equal(r.live,'polite')});
    await test('tool toggle semantics mirror visual state',async()=>{const r=await page.evaluate(()=>Array.from(document.querySelectorAll('.tool-btn.toggle')).map(el=>({active:el.classList.contains('active'),pressed:el.getAttribute('aria-pressed')})));for(const item of r)assert.equal(item.pressed,item.active?'true':'false')});
    await test('PDF engine is not loaded during normal boot',async()=>{const r=await page.evaluate(()=>({loaded:SevenPdf.loaded,global:typeof window.pdfjsLib}));assert.equal(r.loaded,false);assert.equal(r.global,'undefined')});
    await test('localized PDF engine lazy-loads without CDN',async()=>{const r=await page.evaluate(async()=>{const lib=await SevenPdf.load();return {pdf:typeof lib.getDocument==='function',loaded:SevenPdf.loaded,worker:lib.GlobalWorkerOptions.workerSrc}});assert.equal(r.pdf,true);assert.equal(r.loaded,true);assert.equal(r.worker,'./vendor/pdfjs/pdf.worker.min.mjs');assert.deepEqual(errors,[])});
    await test('mobile layout has no document horizontal overflow',async()=>{const r=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,w:document.documentElement.clientWidth,composer:!!document.querySelector('.composer')}));assert.equal(r.composer,true);assert.ok(r.sw<=r.w+2,JSON.stringify(r))});
    await test('offscreen message rendering optimization is active',async()=>{const v=await page.evaluate(()=>{const n=document.createElement('div');n.className='message';n.textContent='probe';document.getElementById('chat').appendChild(n);const s=getComputedStyle(n);const out={visibility:s.contentVisibility,intrinsic:s.containIntrinsicSize||`${s.containIntrinsicWidth} ${s.containIntrinsicHeight}`};n.remove();return out});assert.equal(v.visibility,'auto');assert.ok(v.intrinsic&&v.intrinsic!=='none'&&v.intrinsic!=='0px',JSON.stringify(v))});
    await test('new messages receive UI semantic decoration',async()=>{const r=await page.evaluate(async()=>{const n=document.createElement('div');n.className='message assistant';n.innerHTML='<div class="bubble">probe</div>';document.getElementById('chat').appendChild(n);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));const out={role:n.dataset.sevenMessageRole,decorated:n.dataset.sevenUiDecorated,bubble:n.querySelector('.bubble').dataset.sevenBubble};n.remove();return out});assert.equal(r.role,'assistant');assert.equal(r.decorated,'1');assert.equal(r.bubble,'1')});
    await test('canon runtime branches instead of forcing rigid canon',async()=>{const r=await page.evaluate(()=>{const e=SevenCanon.createEngine({id:'probe',sources:[{id:'s',authority:'A0'}],anchors:[{id:'a',strength:'rigid'}],facts:[],events:[],entities:[],invariants:[]});const s=e.createSession({position:1});return e.applySceneDelta(s,{invalidatesAnchors:['a']},{id:'x'}).session.branchOrigin.reason});assert.equal(r,'rigid-anchor-invalidated')});
    await context.close();

    const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
    await reduced.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const rp=await reduced.newPage();const reducedErrors=[];rp.on('pageerror',e=>reducedErrors.push(e.message));
    await rp.goto(origin,{waitUntil:'domcontentloaded'});await rp.waitForTimeout(100);if(reducedErrors.length)throw new Error('reduced-motion pageerror: '+reducedErrors.join(' | '));
    await rp.waitForFunction(()=>window.SevenPerformance&&SevenPerformance.state.ready&&window.SevenControl&&SevenControl.state.ready&&window.SevenUI&&SevenUI.state.ready,null,{timeout:10000});
    await test('reduced motion forces lightweight motion tier',async()=>{const r=await rp.evaluate(()=>({reduced:SevenPerformance.state.reducedMotion,tier:SevenPerformance.state.tier,controlTier:SevenControl.state.tier,attr:document.documentElement.dataset.sevenReducedMotion}));assert.equal(r.reduced,true);assert.equal(r.tier,'lite');assert.equal(r.controlTier,'lite');assert.equal(r.attr,'1')});
    await reduced.close();
  } finally {
    await browser.close();server.close();
  }
  fs.writeFileSync(path.join(__dirname,'release-results.json'),JSON.stringify({results,build:built},null,2));
  console.log('release verification: PASS ('+results.length+' checks)');
})().catch(e=>{console.error(e);process.exit(1)});
