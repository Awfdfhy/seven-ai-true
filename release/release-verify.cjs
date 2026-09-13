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
    await page.waitForFunction(()=>window.SevenPerformance&&window.SevenPerformance.state.ready&&window.SevenCanon&&window.SevenMotion&&window.SevenMotion.state.ready&&window.SevenUI&&window.SevenUI.state.ready&&window.SevenPdf,null,{timeout:10000});
    await page.waitForFunction(()=>typeof roomPersistence!=='undefined'&&roomPersistence.status().ready,null,{timeout:10000});
    await page.waitForTimeout(650);

    await test('release runtime boots without page errors',async()=>{assert.deepEqual(errors,[])});
    await test('room persistence is ready',async()=>{const r=await page.evaluate(()=>roomPersistence.status());assert.equal(r.ready,true);assert.equal(r.failed,false)});
    await test('adaptive performance tier is installed',async()=>{const r=await page.evaluate(()=>({tier:SevenPerformance.state.tier,attr:document.documentElement.dataset.sevenPerformance,ready:SevenPerformance.state.ready}));assert.ok(['lite','balanced','full'].includes(r.tier));assert.equal(r.attr,r.tier);assert.equal(r.ready,true)});
    await test('Motion OS is governed, semantic and ready',async()=>{const r=await page.evaluate(()=>({ready:document.documentElement.classList.contains('seven-motion-ready'),version:SevenMotion.VERSION,profile:SevenMotion.state.profile,attr:document.documentElement.dataset.sevenMotionProfile,preference:document.documentElement.dataset.sevenMotionPreference,performance:SevenPerformance.state.tier}));const expected=r.performance==='lite'?'lite':'balanced';assert.equal(r.ready,true);assert.equal(r.version,'3.0.0');assert.equal(r.profile,expected);assert.equal(r.attr,expected);assert.equal(r.preference,'auto')});
    await test('performance tier changes govern Motion OS immediately',async()=>{const r=await page.evaluate(async()=>{const original=SevenPerformance.state.tier;SevenPerformance.applyTier('lite');await Promise.resolve();const lowered={profile:SevenMotion.state.profile,attr:document.documentElement.dataset.sevenMotionProfile};SevenPerformance.applyTier(original);await Promise.resolve();return {lowered,restored:SevenMotion.state.profile,expectedRestore:original==='lite'?'lite':'balanced'};});assert.equal(r.lowered.profile,'lite');assert.equal(r.lowered.attr,'lite');assert.equal(r.restored,r.expectedRestore)});
    await test('Motion OS installs its accessible preference control',async()=>{const r=await page.evaluate(()=>{const el=document.getElementById('sevenMotionPreference');return {exists:!!el,value:el&&el.value,described:el&&el.getAttribute('aria-describedby'),options:el&&el.options.length}});assert.equal(r.exists,true);assert.equal(r.value,'auto');assert.equal(r.described,'sevenMotionPreferenceNote');assert.equal(r.options,6)});
    await test('Motion OS rejects unexplained and layout-heavy animation',async()=>{const r=await page.evaluate(()=>({unexplained:SevenMotion.compileMotion({family:'reveal'},{profile:'balanced'}),layout:SevenMotion.compileMotion({family:'glide',purpose:'space',keyframes:[{width:'1px'},{width:'2px'}]},{profile:'balanced'})}));assert.equal(r.unexplained.accepted,false);assert.equal(r.unexplained.reason,'unexplained-motion');assert.equal(r.layout.accepted,false);assert.equal(r.layout.reason,'forbidden-animated-property:width')});
    await test('UI system runtime is semantic and ready',async()=>{const r=await page.evaluate(()=>({ready:SevenUI.state.ready,version:SevenUI.state.version,root:document.documentElement.dataset.sevenUi,composer:document.querySelector('.composer')?.dataset.sevenComposer,chatRole:document.getElementById('chat')?.getAttribute('role'),live:document.getElementById('chat')?.getAttribute('aria-live')}));assert.equal(r.ready,true);assert.equal(r.version,'2.0.0');assert.equal(r.root,'v2');assert.equal(r.composer,'v2');assert.equal(r.chatRole,'log');assert.equal(r.live,'polite')});
    await test('tool toggle semantics mirror visual state',async()=>{const r=await page.evaluate(()=>Array.from(document.querySelectorAll('.tool-btn.toggle')).map(el=>({active:el.classList.contains('active'),pressed:el.getAttribute('aria-pressed')})));for(const item of r)assert.equal(item.pressed,item.active?'true':'false')});
    await test('PDF engine is not loaded during normal boot',async()=>{const r=await page.evaluate(()=>({loaded:SevenPdf.loaded,global:typeof window.pdfjsLib}));assert.equal(r.loaded,false);assert.equal(r.global,'undefined')});
    await test('localized PDF engine lazy-loads without CDN',async()=>{const r=await page.evaluate(async()=>{const lib=await SevenPdf.load();return {pdf:typeof lib.getDocument==='function',loaded:SevenPdf.loaded,worker:lib.GlobalWorkerOptions.workerSrc}});assert.equal(r.pdf,true);assert.equal(r.loaded,true);assert.equal(r.worker,'./vendor/pdfjs/pdf.worker.min.mjs');assert.deepEqual(errors,[])});
    await test('mobile layout has no document horizontal overflow',async()=>{const r=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,w:document.documentElement.clientWidth,composer:!!document.querySelector('.composer')}));assert.equal(r.composer,true);assert.ok(r.sw<=r.w+2,JSON.stringify(r))});
    await test('offscreen message rendering optimization is active',async()=>{const v=await page.evaluate(()=>{const n=document.createElement('div');n.className='message';n.textContent='probe';document.getElementById('chat').appendChild(n);const s=getComputedStyle(n);const out={visibility:s.contentVisibility,intrinsic:s.containIntrinsicSize||`${s.containIntrinsicWidth} ${s.containIntrinsicHeight}`};n.remove();return out});assert.equal(v.visibility,'auto');assert.ok(v.intrinsic&&v.intrinsic!=='none'&&v.intrinsic!=='0px',JSON.stringify(v))});
    await test('new messages receive UI semantic decoration',async()=>{const r=await page.evaluate(async()=>{const n=document.createElement('div');n.className='message assistant';n.innerHTML='<div class="bubble">probe</div>';document.getElementById('chat').appendChild(n);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));const out={role:n.dataset.sevenMessageRole,decorated:n.dataset.sevenUiDecorated,bubble:n.querySelector('.bubble').dataset.sevenBubble};n.remove();return out});assert.equal(r.role,'assistant');assert.equal(r.decorated,'1');assert.equal(r.bubble,'1')});
    await test('new messages receive one semantic reveal instead of token animation',async()=>{const r=await page.evaluate(async()=>{const n=document.createElement('div');n.className='message assistant';n.innerHTML='<div class="bubble">motion probe</div>';document.getElementById('chat').appendChild(n);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));const out={seen:n.dataset.sevenMotionSeen,family:n.dataset.sevenMotionFamily};n.remove();return out});assert.equal(r.seen,'1');assert.equal(r.family,'reveal')});
    await test('execution state drives an accessible causal tool path',async()=>{const r=await page.evaluate(async()=>{dispatchEvent(new CustomEvent('seven:execution-state',{detail:{runId:'probe',stepId:'verify',status:'running'}}));const path=document.querySelector('.composer > .seven-tool-path');const during={stage:document.documentElement.dataset.sevenExecutionStage,path:!!path,busy:document.querySelector('.composer')?.getAttribute('aria-busy'),role:path?.getAttribute('role'),label:path?.getAttribute('aria-label')};dispatchEvent(new CustomEvent('seven:execution-state',{detail:{runId:'probe',stepId:'verify',status:'passed'}}));await new Promise(resolve=>requestAnimationFrame(resolve));return {...during,cleared:!document.querySelector('.composer > .seven-tool-path'),busyCleared:!document.querySelector('.composer')?.hasAttribute('aria-busy')};});assert.equal(r.stage,'verify');assert.equal(r.path,true);assert.equal(r.busy,'true');assert.equal(r.role,'status');assert.match(r.label,/verify/);assert.equal(r.cleared,true);assert.equal(r.busyCleared,true)});
    await test('Celestial Shift follows the governed profile on a real theme change',async()=>{const r=await page.evaluate(async()=>{const before=document.body.classList.contains('light');toggleTheme();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));const after=document.body.classList.contains('light');const signature=!!document.querySelector('[data-seven-signature="celestial-shift"]');const profile=SevenMotion.state.profile;if(after!==before)toggleTheme();return {changed:after!==before,signature,profile};});assert.equal(r.changed,true);assert.equal(r.signature,['balanced','ultra'].includes(r.profile))});
    await test('canon runtime branches instead of forcing rigid canon',async()=>{const r=await page.evaluate(()=>{const e=SevenCanon.createEngine({id:'probe',sources:[{id:'s',authority:'A0'}],anchors:[{id:'a',strength:'rigid'}],facts:[],events:[],entities:[],invariants:[]});const s=e.createSession({position:1});return e.applySceneDelta(s,{invalidatesAnchors:['a']},{id:'x'}).session.branchOrigin.reason});assert.equal(r,'rigid-anchor-invalidated')});
    await test('World and Research publish semantic motion bridge events',async()=>{const r=await page.evaluate(()=>{
      const seen=[];const names=['seven:world-entry','seven:canon-divergence','seven:world-scene-change','seven:research-topology'];
      const handlers=names.map(name=>{const fn=()=>seen.push(name);addEventListener(name,fn);return [name,fn];});
      const engine=SevenWorld.createEngine({id:'motion-world',sources:[{id:'source'}],beats:[{id:'b0',sourceRefs:['source']},{id:'b1',sourceRefs:['source']}]});
      const session=engine.createSession({});engine.commitBeat(session,{beatId:'b1',allowBranch:true,playerActionSource:'user'});
      SevenResearch.verify([{id:'claim',text:'probe'}],[{id:'source',url:'https://example.com',authority:'A1',evidence:[{claimId:'claim',stance:'support',excerpt:'probe'}]}]);
      for(const [name,fn] of handlers)removeEventListener(name,fn);
      return seen;
    });for(const name of ['seven:world-entry','seven:canon-divergence','seven:world-scene-change','seven:research-topology'])assert.ok(r.includes(name),name)});
    await context.close();

    const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
    await reduced.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const rp=await reduced.newPage();const reducedErrors=[];rp.on('pageerror',e=>reducedErrors.push(e.message));
    await rp.goto(origin,{waitUntil:'domcontentloaded'});await rp.waitForTimeout(100);if(reducedErrors.length)throw new Error('reduced-motion pageerror: '+reducedErrors.join(' | '));
    await rp.waitForFunction(()=>window.SevenPerformance&&SevenPerformance.state.ready&&window.SevenMotion&&SevenMotion.state.ready&&window.SevenUI&&SevenUI.state.ready,null,{timeout:10000});
    await test('reduced motion forces lightweight performance and non-spatial Motion OS',async()=>{const r=await rp.evaluate(()=>({reduced:SevenPerformance.state.reducedMotion,tier:SevenPerformance.state.tier,attr:document.documentElement.dataset.sevenReducedMotion,motion:SevenMotion.state.profile,motionAttr:document.documentElement.dataset.sevenMotionProfile,frames:SevenMotion.compileMotion({family:'transfer',purpose:'space'},{profile:'reduced'}).frames}));assert.equal(r.reduced,true);assert.equal(r.tier,'lite');assert.equal(r.attr,'1');assert.equal(r.motion,'reduced');assert.equal(r.motionAttr,'reduced');assert.ok(r.frames.every(frame=>!Object.prototype.hasOwnProperty.call(frame,'transform')))});
    await reduced.close();
  } finally {
    await browser.close();server.close();
  }
  fs.writeFileSync(path.join(__dirname,'release-results.json'),JSON.stringify({results,build:built},null,2));
  console.log('release verification: PASS ('+results.length+' checks)');
})().catch(e=>{console.error(e);process.exit(1)});
