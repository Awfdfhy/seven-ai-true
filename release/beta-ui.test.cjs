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
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.end(html);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true});

  try{
    const context=await browser.newContext({viewport:{width:390,height:844}});
    await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.SevenBetaUI&&SevenBetaUI.state.ready,{timeout:10000});

    const state=await page.evaluate(()=>({
      ready:SevenBetaUI.state.ready,
      version:SevenBetaUI.state.version,
      marker:document.documentElement.dataset.sevenBetaUi,
      rootClass:document.documentElement.classList.contains('seven-beta-ui'),
      badgeCount:document.querySelectorAll('.seven-beta-badge').length,
      badgeText:document.querySelector('.seven-beta-badge')?.textContent,
      sidebar:document.querySelector('.sidebar')?.dataset.sevenBetaSurface,
      topbar:document.querySelector('.topbar')?.dataset.sevenBetaSurface,
      chat:document.querySelector('#chat')?.dataset.sevenBetaSurface,
      composer:document.querySelector('.composer')?.dataset.sevenBetaSurface,
      sw:document.documentElement.scrollWidth,
      cw:document.documentElement.clientWidth,
      bg:getComputedStyle(document.body).backgroundColor,
      composerRadius:getComputedStyle(document.querySelector('.composer')).borderRadius
    }));
    assert.equal(state.ready,true);
    assert.equal(state.version,'1.0.0-beta.1');
    assert.equal(state.marker,'v1');
    assert.equal(state.rootClass,true);
    assert.equal(state.badgeCount,1);
    assert.equal(state.badgeText,'BETA');
    assert.equal(state.sidebar,'navigation');
    assert.equal(state.topbar,'topbar');
    assert.equal(state.chat,'conversation');
    assert.equal(state.composer,'composer');
    assert.ok(state.sw<=state.cw+2,JSON.stringify(state));
    assert.notEqual(state.bg,'rgba(0, 0, 0, 0)');
    assert.ok(parseFloat(state.composerRadius)>=20);
    assert.deepEqual(errors,[]);

    await page.evaluate(()=>SevenBetaUI.sync());
    const duplicateBadge=await page.evaluate(()=>document.querySelectorAll('.seven-beta-badge').length);
    assert.equal(duplicateBadge,1,'beta sync must be idempotent');
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
  }finally{
    await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(err=>{console.error(err);process.exit(1)});
