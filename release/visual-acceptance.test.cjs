const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const http=require('http');
const assert=require('assert/strict');
const {build,OUTPUT}=require('./build-release.cjs');

(async()=>{
  const built=build();
  const html=fs.readFileSync(OUTPUT,'utf8');
  assert.equal(built.brand.visualShell,'brand-os-v1');
  assert.equal(built.brand.mark,'celestial-seven-v1');
  assert.ok(html.includes('seven-visual-shell-style'));
  assert.ok(html.includes('seven-visual-shell-runtime'));
  assert.ok(html.includes('type="image/svg+xml"'));

  const dist=path.dirname(OUTPUT);
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
  const checks=[];
  async function pass(name,fn){await fn();checks.push(name);console.log('PASS',name)}
  const returningUser=()=>{
    localStorage.setItem('user_name','Visual QA');
    localStorage.setItem('user_name_asked','1');
    localStorage.setItem('seven_ui_mode_v1','core');
  };

  try{
    const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
    await ctx.addInitScript(returningUser);
    await ctx.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const page=await ctx.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.SevenVisualShell&&document.documentElement.dataset.sevenVisual==='brand-os-v1',null,{timeout:10000});
    await page.waitForTimeout(120);

    await pass('Brand OS boots without page errors',async()=>assert.deepEqual(errors,[]));
    await pass('returning user is not blocked by onboarding',async()=>assert.equal(await page.locator('#nameModal').evaluate(el=>getComputedStyle(el).display),'none'));
    await pass('legacy sidebar bitmap is replaced by the Seven mark',async()=>{
      const r=await page.evaluate(()=>({legacy:document.querySelectorAll('.sidebar-header img.app-icon').length,marks:document.querySelectorAll('.seven-brand-mark').length}));
      assert.equal(r.legacy,0);assert.ok(r.marks>=2,JSON.stringify(r));
    });
    await pass('four product modes are exposed as one shared identity',async()=>{
      const r=await page.evaluate(()=>Array.from(document.querySelectorAll('.seven-mode-button')).map(b=>b.dataset.mode));
      assert.deepEqual(r,['core','build','world','research']);
    });
    await pass('mode transition updates environment and composer language',async()=>{
      await page.click('.seven-mode-button[data-mode="world"]');
      const r=await page.evaluate(()=>({mode:document.documentElement.dataset.sevenMode,ph:document.getElementById('userInput').placeholder,selected:document.querySelector('.seven-mode-button[data-mode="world"]').getAttribute('aria-selected')}));
      assert.equal(r.mode,'world');assert.match(r.ph,/world/i);assert.equal(r.selected,'true');
      await page.evaluate(()=>SevenVisualShell.setMode('core'));
    });
    await pass('settings are restructured into product-grade sections',async()=>{
      const r=await page.evaluate(()=>({count:document.querySelectorAll('#settingsModal .seven-settings-section').length,head:!!document.querySelector('#settingsModal .seven-settings-head'),names:Array.from(document.querySelectorAll('#settingsModal .seven-settings-section')).map(n=>n.dataset.section)}));
      assert.equal(r.head,true);assert.ok(r.count>=5,JSON.stringify(r));assert.deepEqual(r.names,['intelligence','providers','generation','memory','data']);
    });
    await pass('mobile composition keeps the visual hierarchy and no overflow',async()=>{
      const r=await page.evaluate(()=>{const sidebar=getComputedStyle(document.querySelector('.sidebar'));const composer=getComputedStyle(document.querySelector('.composer'));return {sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,sidebarWidth:parseFloat(sidebar.width),radius:parseFloat(composer.borderTopLeftRadius),dock:document.querySelector('.seven-mode-dock').getBoundingClientRect().width}});
      assert.ok(r.sw<=r.cw+2,JSON.stringify(r));assert.ok(r.sidebarWidth>=280,JSON.stringify(r));assert.ok(r.radius>=20,JSON.stringify(r));assert.ok(r.dock>0,JSON.stringify(r));
    });
    await pass('RTL has a first-class structural treatment',async()=>{
      const r=await page.evaluate(()=>{document.documentElement.dir='rtl';const s=getComputedStyle(document.querySelector('.sidebar'));const out={left:s.borderLeftWidth,right:s.borderRightWidth};document.documentElement.dir='';return out});
      assert.notEqual(r.left,'0px');
    });
    await pass('dark and light themes use different canvas systems',async()=>{
      const r=await page.evaluate(()=>{const dark=getComputedStyle(document.body).getPropertyValue('--seven-canvas').trim();document.body.classList.add('light');const light=getComputedStyle(document.body).getPropertyValue('--seven-canvas').trim();document.body.classList.remove('light');return {dark,light}});
      assert.notEqual(r.dark,r.light);assert.ok(r.dark&&r.light);
    });

    await page.evaluate(()=>{const s=document.getElementById('sidebar');if(s&&!s.classList.contains('collapsed'))s.classList.add('collapsed');const b=document.querySelector('.sidebar-backdrop');if(b)b.classList.remove('visible')});
    await page.screenshot({path:path.join(dist,'visual-core-mobile.png'),fullPage:true});
    await page.evaluate(()=>{const s=document.getElementById('sidebar');if(s)s.classList.remove('collapsed');const b=document.querySelector('.sidebar-backdrop');if(b)b.classList.add('visible')});
    await page.waitForTimeout(80);
    await page.screenshot({path:path.join(dist,'visual-sidebar-mobile.png'),fullPage:true});
    await page.evaluate(()=>{const s=document.getElementById('sidebar');if(s)s.classList.add('collapsed');const b=document.querySelector('.sidebar-backdrop');if(b)b.classList.remove('visible');const m=document.getElementById('settingsModal');if(m)m.style.display='flex'});
    await page.waitForTimeout(80);
    await page.screenshot({path:path.join(dist,'visual-settings-mobile.png'),fullPage:true});
    await ctx.close();

    const onboarding=await browser.newContext({viewport:{width:390,height:844}});
    await onboarding.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const op=await onboarding.newPage();
    await op.goto(origin,{waitUntil:'domcontentloaded'});
    await op.waitForFunction(()=>window.SevenVisualShell&&getComputedStyle(document.getElementById('nameModal')).display!=='none',null,{timeout:10000});
    await pass('first-run onboarding uses the new Seven identity',async()=>{
      const r=await op.evaluate(()=>({mark:!!document.querySelector('#nameModal .seven-brand-mark'),legacy:!!document.querySelector('#nameModal img.name-modal-logo')}));
      assert.equal(r.mark,true);assert.equal(r.legacy,false);
    });
    await op.screenshot({path:path.join(dist,'visual-onboarding-mobile.png'),fullPage:true});
    await onboarding.close();

    const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    await reduced.addInitScript(returningUser);
    await reduced.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const rp=await reduced.newPage();
    await rp.goto(origin,{waitUntil:'domcontentloaded'});
    await rp.waitForFunction(()=>window.SevenVisualShell,null,{timeout:10000});
    await pass('reduced motion removes signature orbit animation',async()=>{
      const animation=await rp.evaluate(()=>{const mark=document.querySelector('.seven-brand-mark[data-size="hero"] .seven-orbit')||document.querySelector('.seven-brand-mark .seven-orbit');return mark?getComputedStyle(mark).animationName:'none'});
      assert.equal(animation,'none');
    });
    await reduced.close();
  } finally {
    await browser.close();server.close();
  }

  fs.writeFileSync(path.join(__dirname,'visual-results.json'),JSON.stringify({checks,brand:built.brand},null,2));
  console.log('visual acceptance: PASS ('+checks.length+' checks)');
})().catch(e=>{console.error(e);process.exit(1)});
