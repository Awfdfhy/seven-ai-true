const {chromium}=require('playwright');
const http=require('http');
const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');
const {build}=require('./build-release.cjs');

(async()=>{
  const built=build();
  const html=fs.readFileSync(built.output,'utf8');
  assert.ok(html.includes('id="seven-beta-ui-style"'),'beta UI stylesheet is not packaged');
  assert.ok(html.includes('id="seven-beta-ui-runtime"'),'beta UI runtime is not packaged');
  const dist=path.dirname(built.output);
  const server=http.createServer((req,res)=>{
    const pathname=new URL(req.url,'http://127.0.0.1').pathname;
    if(pathname.startsWith('/vendor/')||pathname.startsWith('/brand/')){
      const file=path.resolve(dist,'.'+pathname);
      if(!file.startsWith(path.resolve(dist)+path.sep)||!fs.existsSync(file)){res.statusCode=404;res.end('not found');return;}
      res.setHeader('Content-Type',file.endsWith('.js')||file.endsWith('.mjs')?'text/javascript; charset=utf-8':file.endsWith('.svg')?'image/svg+xml':'application/octet-stream');
      fs.createReadStream(file).pipe(res);return;
    }
    res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({viewport:{width:390,height:844}});
    await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.SevenBetaUI&&SevenBetaUI.state.ready&&window.SevenAurora,{timeout:10000});
    await page.evaluate(()=>{deepThinkToggle.classList.remove('active');searchToggle.classList.remove('active');SevenBetaUI.syncMode();});
    const state=await page.evaluate(()=>({
      ready:SevenBetaUI.state.ready,version:SevenBetaUI.state.version,mode:SevenBetaUI.state.mode,
      marker:document.documentElement.dataset.sevenBetaUi,modeMarker:document.documentElement.dataset.sevenBetaMode,
      aurora:document.documentElement.dataset.sevenAurora,auroraIntensity:document.documentElement.dataset.sevenAuroraIntensity,auroraVersion:SevenAurora.version,
      rootClass:document.documentElement.classList.contains('seven-beta-ui'),
      badgeCount:document.querySelectorAll('.seven-beta-badge').length,statusCount:document.querySelectorAll('.seven-beta-status').length,
      badgeText:document.querySelector('.seven-beta-badge')?.textContent,statusText:document.querySelector('.seven-beta-status-label')?.textContent,
      sidebar:document.querySelector('.sidebar')?.dataset.sevenBetaSurface,topbar:document.querySelector('.topbar')?.dataset.sevenBetaSurface,
      chat:document.querySelector('#chat')?.dataset.sevenBetaSurface,composer:document.querySelector('.composer')?.dataset.sevenBetaSurface,
      thinkTool:document.getElementById('deepThinkToggle')?.dataset.sevenBetaTool,searchTool:document.getElementById('searchToggle')?.dataset.sevenBetaTool,
      attachTool:document.querySelector('.composer-tools .tool-btn:not(.toggle)')?.dataset.sevenBetaTool,
      pickerCount:document.querySelectorAll('.seven-mode-picker').length,
      optionCount:document.querySelectorAll('[data-seven-mode]').length,
      pickerLabel:document.querySelector('[data-seven-mode-label]')?.textContent,
      thinkDisplay:getComputedStyle(document.getElementById('deepThinkToggle')).display,
      searchDisplay:getComputedStyle(document.getElementById('searchToggle')).display,
      stopPatched:window.stopGeneration?.sevenPatched===true,
      sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,bg:getComputedStyle(document.body).backgroundColor,
      composerRadius:getComputedStyle(document.querySelector('.composer')).borderRadius
    }));
    assert.equal(state.ready,true);assert.equal(state.version,'1.5.0-beta.1');assert.equal(state.marker,'v1');assert.equal(state.mode,'chat');assert.equal(state.modeMarker,'chat');
    assert.equal(state.auroraVersion,'1.0.0-beta.1');assert.equal(state.aurora,'idle');assert.equal(state.auroraIntensity,'low');
    assert.equal(state.rootClass,true);assert.equal(state.badgeCount,1);assert.equal(state.statusCount,1);assert.equal(state.badgeText,'BETA');assert.equal(state.statusText,'Chat');
    assert.equal(state.sidebar,'navigation');assert.equal(state.topbar,'topbar');assert.equal(state.chat,'conversation');assert.equal(state.composer,'composer');
    assert.equal(state.thinkTool,'think');assert.equal(state.searchTool,'search');assert.equal(state.attachTool,'knowledge');
    assert.equal(state.pickerCount,1);assert.equal(state.optionCount,4);assert.equal(state.pickerLabel,'Chat');assert.equal(state.thinkDisplay,'none');assert.equal(state.searchDisplay,'none');assert.equal(state.stopPatched,true);
    assert.ok(state.sw<=state.cw+2,JSON.stringify(state));assert.notEqual(state.bg,'rgba(0, 0, 0, 0)');assert.ok(parseFloat(state.composerRadius)>=20);assert.deepEqual(errors,[]);
    async function expectMode(change,expected){
      await page.evaluate(change);await page.waitForFunction(m=>window.SevenBetaUI&&SevenBetaUI.state.mode===m,expected);
      const r=await page.evaluate(()=>({state:SevenBetaUI.state.mode,root:document.documentElement.dataset.sevenBetaMode,composer:document.querySelector('.composer').dataset.sevenBetaMode,label:document.querySelector('.seven-beta-status-label').textContent,picker:document.querySelector('[data-seven-mode-label]').textContent,checked:document.querySelector('[data-seven-mode="'+SevenBetaUI.state.mode+'"]')?.getAttribute('aria-checked'),aurora:document.documentElement.dataset.sevenAurora,intensity:document.documentElement.dataset.sevenAuroraIntensity}));
      assert.equal(r.state,expected);assert.equal(r.root,expected);assert.equal(r.composer,expected);assert.equal(r.label,{chat:'Chat',think:'Think',search:'Search',research:'Research'}[expected]);assert.equal(r.picker,{chat:'Chat',think:'Think',search:'Search',research:'Research'}[expected]);assert.equal(r.checked,'true');
      assert.equal(r.aurora,{chat:'idle',think:'thinking',search:'research',research:'research'}[expected]);assert.equal(r.intensity,expected==='chat'?'low':'medium');
    }
    await expectMode(()=>SevenBetaUI.setMode('think'),'think');
    await expectMode(()=>SevenBetaUI.setMode('research'),'research');
    await expectMode(()=>SevenBetaUI.setMode('search'),'search');
    await expectMode(()=>SevenBetaUI.setMode('chat'),'chat');
    await page.evaluate(()=>{const modal=document.getElementById('nameModal');if(modal){modal.style.display='none';modal.setAttribute('aria-hidden','true')}});
    await page.click('.seven-mode-trigger');assert.equal(await page.getAttribute('.seven-mode-trigger','aria-expanded'),'true');assert.equal(await page.isVisible('.seven-mode-menu'),true);await page.keyboard.press('Escape');assert.equal(await page.getAttribute('.seven-mode-trigger','aria-expanded'),'false');
    const semantic=await page.evaluate(()=>['coding','rpg','success','warning','error'].map(x=>{SevenAurora.set(x,'high');return[x,SevenAurora.getState(),SevenAurora.getIntensity(),document.documentElement.dataset.sevenAurora,document.documentElement.dataset.sevenAuroraIntensity,getComputedStyle(document.documentElement).getPropertyValue('--sb-mode').trim(),document.querySelector('.seven-beta-status-label').textContent]}));
    assert.equal(new Set(semantic.map(x=>x[5])).size,5,'Aurora semantic states must have distinct signatures');for(const row of semantic){assert.deepEqual(row.slice(0,5),[row[0],row[0],'high',row[0],'high']);assert.ok(row[6])}
    assert.deepEqual(await page.evaluate(()=>{SevenAurora.reset();return[SevenAurora.getState(),SevenAurora.getIntensity(),document.querySelector('.seven-beta-status-label').textContent]}),['idle','low','Chat']);
    await page.evaluate(()=>SevenBetaUI.sync());
    const idempotent=await page.evaluate(()=>({badge:document.querySelectorAll('.seven-beta-badge').length,status:document.querySelectorAll('.seven-beta-status').length,picker:document.querySelectorAll('.seven-mode-picker').length}));
    assert.deepEqual(idempotent,{badge:1,status:1,picker:1},'beta sync must be idempotent');
    await page.setViewportSize({width:360,height:780});
    const narrow=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,label:getComputedStyle(document.querySelector('.seven-beta-status-label')).display}));
    assert.ok(narrow.sw<=narrow.cw+2,JSON.stringify(narrow));assert.equal(narrow.label,'none');
    await context.close();

    const android=await browser.newContext({viewport:{width:390,height:844},userAgent:'Mozilla/5.0 (Linux; Android 14; TECNO LH7n) AppleWebKit/537.36 Chrome/126 Mobile Safari/537.36'});
    await android.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const ap=await android.newPage();const androidErrors=[];ap.on('pageerror',e=>androidErrors.push(e.message));await ap.goto(origin,{waitUntil:'domcontentloaded'});await ap.waitForFunction(()=>window.SevenBetaUI&&SevenBetaUI.state.ready);
    const stopState=await ap.evaluate(()=>{const b=document.getElementById('stopBtn');b.style.display='inline-block';window.stopGeneration();return{patched:window.stopGeneration.sevenPatched===true,disabled:b.disabled,stopping:b.classList.contains('seven-stopping'),label:b.getAttribute('aria-label')}});
    assert.equal(stopState.patched,true);assert.equal(stopState.disabled,true);assert.equal(stopState.stopping,true);assert.match(stopState.label,/Stopping|الإيقاف/);assert.deepEqual(androidErrors,[]);
    await ap.evaluate(()=>document.getElementById('stopBtn').style.display='none');await ap.waitForFunction(()=>!document.getElementById('stopBtn').disabled);await android.close();

    const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    await reduced.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const reducedPage=await reduced.newPage();
    await reducedPage.goto(origin,{waitUntil:'domcontentloaded'});
    await reducedPage.waitForFunction(()=>window.SevenBetaUI&&SevenBetaUI.state.ready&&window.SevenAurora,{timeout:10000});
    await reducedPage.evaluate(()=>SevenAurora.set('coding','high'));
    const motion=await reducedPage.evaluate(()=>({composer:getComputedStyle(document.querySelector('.composer')).transitionDuration,orb:getComputedStyle(document.querySelector('.seven-beta-status i')).animationName,stop:getComputedStyle(document.querySelector('.input-area button.stop')).animationName}));
    assert.ok(motion.composer==='0s'||motion.composer==='0.000001s'||parseFloat(motion.composer)<=0.001,'reduced motion not respected: '+motion.composer);assert.equal(motion.orb,'none');assert.equal(motion.stop,'none');
    await reduced.close();
    console.log('beta UI + modes + stop + Aurora browser tests: PASS');
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(err=>{console.error(err);process.exit(1)});
