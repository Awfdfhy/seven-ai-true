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
    if(pathname.startsWith('/vendor/')){
      const file=path.resolve(dist,'.'+pathname);
      if(!file.startsWith(path.resolve(dist)+path.sep)||!fs.existsSync(file)){res.statusCode=404;res.end('not found');return;}
      res.setHeader('Content-Type',file.endsWith('.mjs')?'text/javascript; charset=utf-8':'application/octet-stream');
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
    await page.waitForFunction(()=>window.SevenBetaUI&&SevenBetaUI.state.ready,{timeout:10000});
    await page.evaluate(()=>{deepThinkToggle.classList.remove('active');searchToggle.classList.remove('active');SevenBetaUI.syncMode();});
    const state=await page.evaluate(()=>({
      ready:SevenBetaUI.state.ready,version:SevenBetaUI.state.version,mode:SevenBetaUI.state.mode,
      marker:document.documentElement.dataset.sevenBetaUi,modeMarker:document.documentElement.dataset.sevenBetaMode,
      rootClass:document.documentElement.classList.contains('seven-beta-ui'),
      badgeCount:document.querySelectorAll('.seven-beta-badge').length,statusCount:document.querySelectorAll('.seven-beta-status').length,
      badgeText:document.querySelector('.seven-beta-badge')?.textContent,statusText:document.querySelector('.seven-beta-status-label')?.textContent,
      sidebar:document.querySelector('.sidebar')?.dataset.sevenBetaSurface,topbar:document.querySelector('.topbar')?.dataset.sevenBetaSurface,
      chat:document.querySelector('#chat')?.dataset.sevenBetaSurface,composer:document.querySelector('.composer')?.dataset.sevenBetaSurface,
      thinkTool:document.getElementById('deepThinkToggle')?.dataset.sevenBetaTool,searchTool:document.getElementById('searchToggle')?.dataset.sevenBetaTool,
      attachTool:document.querySelector('.composer-tools .tool-btn:not(.toggle)')?.dataset.sevenBetaTool,
      sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,bg:getComputedStyle(document.body).backgroundColor,
      composerRadius:getComputedStyle(document.querySelector('.composer')).borderRadius
    }));
    assert.equal(state.ready,true);assert.equal(state.version,'1.2.0-beta.1');assert.equal(state.marker,'v1');assert.equal(state.mode,'chat');assert.equal(state.modeMarker,'chat');
    assert.equal(state.rootClass,true);assert.equal(state.badgeCount,1);assert.equal(state.statusCount,1);assert.equal(state.badgeText,'BETA');assert.equal(state.statusText,'Chat');
    assert.equal(state.sidebar,'navigation');assert.equal(state.topbar,'topbar');assert.equal(state.chat,'conversation');assert.equal(state.composer,'composer');
    assert.equal(state.thinkTool,'think');assert.equal(state.searchTool,'search');assert.equal(state.attachTool,'knowledge');
    assert.ok(state.sw<=state.cw+2,JSON.stringify(state));assert.notEqual(state.bg,'rgba(0, 0, 0, 0)');assert.ok(parseFloat(state.composerRadius)>=20);assert.deepEqual(errors,[]);
    async function expectMode(change,expected){
      await page.evaluate(change);await page.waitForFunction(m=>window.SevenBetaUI&&SevenBetaUI.state.mode===m,expected);
      const r=await page.evaluate(()=>({state:SevenBetaUI.state.mode,root:document.documentElement.dataset.sevenBetaMode,composer:document.querySelector('.composer').dataset.sevenBetaMode,label:document.querySelector('.seven-beta-status-label').textContent}));
      assert.equal(r.state,expected);assert.equal(r.root,expected);assert.equal(r.composer,expected);assert.equal(r.label,{chat:'Chat',think:'Think',search:'Search',research:'Research'}[expected]);
    }
    await expectMode(()=>deepThinkToggle.classList.add('active'),'think');
    await expectMode(()=>searchToggle.classList.add('active'),'research');
    await expectMode(()=>deepThinkToggle.classList.remove('active'),'search');
    await expectMode(()=>searchToggle.classList.remove('active'),'chat');
    await page.evaluate(()=>SevenBetaUI.sync());
    const idempotent=await page.evaluate(()=>({badge:document.querySelectorAll('.seven-beta-badge').length,status:document.querySelectorAll('.seven-beta-status').length}));
    assert.deepEqual(idempotent,{badge:1,status:1},'beta sync must be idempotent');
    await page.setViewportSize({width:360,height:780});
    const narrow=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,label:getComputedStyle(document.querySelector('.seven-beta-status-label')).display}));
    assert.ok(narrow.sw<=narrow.cw+2,JSON.stringify(narrow));assert.equal(narrow.label,'none');
    await context.close();
    const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    await reduced.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const reducedPage=await reduced.newPage();
    await reducedPage.goto(origin,{waitUntil:'domcontentloaded'});
    await reducedPage.waitForFunction(()=>window.SevenBetaUI&&SevenBetaUI.state.ready,{timeout:10000});
    const motion=await reducedPage.evaluate(()=>getComputedStyle(document.querySelector('.composer')).transitionDuration);
    assert.ok(motion==='0s'||motion==='0.000001s'||parseFloat(motion)<=0.001,'reduced motion not respected: '+motion);
    await reduced.close();
    console.log('beta UI browser tests: PASS');
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(err=>{console.error(err);process.exit(1)});
