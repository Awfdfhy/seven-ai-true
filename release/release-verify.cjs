const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const http=require('http');
const assert=require('assert/strict');
const {build,OUTPUT,MARK}=require('./build-release.cjs');
const {patchFile,MODEL_ID}=require('./frontier-model-patch.cjs');

(async()=>{
  const built=build();
  const frontier=patchFile(OUTPUT);
  const html=fs.readFileSync(OUTPUT,'utf8');
  const dist=path.dirname(OUTPUT);
  const deferredShell=new Set(['seven-shell.css','seven-shell.js','ui-polish-fixes.css','ui-polish-fixes.js','seven-shell-final.css','seven-shell-final.js','remake.css','remake.js','intelligence.js']);
  assert.ok(html.includes(MARK));
  assert.ok(html.includes('id="seven-app"')&&html.includes('data-seven-remake="1"'),'Seven UI Remake root missing');
  assert.ok(html.includes('./workspaces/remake.css')&&html.includes('./workspaces/remake.js')&&html.includes('./workspaces/intelligence.js'),'Seven UI Remake asset wiring missing');
  assert.ok(html.includes('sendMessageLocked'),'duplicate-send guard missing');
  assert.ok(html.includes('defaultEnabled: true')&&html.includes('LLM7.io Free'),'anonymous free-provider default missing');
  assert.ok((built.workspaceFiles||[]).some(x=>x.path.endsWith('/research-v2.js')),'Research v2 workspace missing');
  assert.ok(html.includes(`id:"${MODEL_ID}"`),'verified release must include the frontier free model');
  assert.equal(frontier.model,MODEL_ID);
  assert.ok(built.brandFiles.some(x=>x.path==='brand/seven-day-white.svg'));
  assert.ok(built.brandFiles.some(x=>x.path==='brand/seven-night-black.svg'));
  const releaseLayerBytes=built.startupBytes;
  assert.ok(releaseLayerBytes<100000,`release layer unexpectedly heavy: ${releaseLayerBytes} bytes`);
  assert.equal(built.pdfLoadMode,'lazy-local');
  assert.equal(built.attachmentLoadMode,'lazy-local');
  assert.equal(built.workspaceLoadMode,'lazy-local');
  assert.ok(html.includes('id="seven-attachment-loader"'));
  assert.ok(!html.includes('id="seven-attachment-runtime"'));
  assert.ok(!html.includes('id="seven-canon-runtime"')&&!html.includes('id="seven-world-runtime"'));

  const server=http.createServer((req,res)=>{
    const pathname=new URL(req.url,'http://127.0.0.1').pathname;
    if(pathname.startsWith('/vendor/')||pathname.startsWith('/workspaces/')||pathname.startsWith('/brand/')||pathname==='/attachment-runtime.js'){
      const file=path.resolve(dist,'.'+pathname);
      if(!file.startsWith(path.resolve(dist)+path.sep)||!fs.existsSync(file)){res.statusCode=404;res.end('not found');return;}
      res.setHeader('Content-Type',file.endsWith('.js')||file.endsWith('.mjs')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.svg')?'image/svg+xml':'application/octet-stream');
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
    await test('release boots',async()=>{
      const page=await browser.newPage();
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRuntime&&window.SevenControl&&window.SevenBridge&&window.SevenExecution&&window.SevenBetaUI&&window.SevenRemake&&window.SevenIntelligence);
      assert.equal(await page.evaluate(()=>document.documentElement.dataset.sevenControl),'v4.3');
      assert.equal(await page.evaluate(()=>!!window.SevenAttachmentLoader),true);
      assert.equal(await page.evaluate(()=>!!document.querySelector('#seven-app[data-seven-remake="1"]')),true);
      assert.equal(await page.evaluate(()=>!!window.SevenAttachments),false);
      await page.close();
    });
    await test('modern night theme and RTL sidebar are functional',async()=>{
      const page=await browser.newPage({viewport:{width:390,height:844}});
      await page.addInitScript(()=>{localStorage.setItem('user_name_asked','1');localStorage.setItem('user_name','Seven Tester');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&window.SevenTheme&&document.getElementById('seven-app'));
      await page.evaluate(()=>SevenTheme.setPreference('night'));
      await page.waitForFunction(()=>document.documentElement.dataset.sevenTheme==='night');
      assert.equal(await page.evaluate(()=>getComputedStyle(document.getElementById('seven-app')).getPropertyValue('--s-bg').trim()),'#111815');
      assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.main')).backgroundColor),'rgb(17, 24, 21)');
      await page.evaluate(()=>SevenTheme.setPreference('day'));
      await page.waitForFunction(()=>document.documentElement.dataset.sevenTheme==='day');
      assert.equal(await page.evaluate(()=>getComputedStyle(document.getElementById('seven-app')).getPropertyValue('--s-bg').trim()),'#f5f7f5');
      await page.evaluate(()=>{document.documentElement.dir='rtl';document.body.dir='rtl';const s=document.querySelector('.sidebar');s.classList.remove('open','active');document.body.classList.remove('sidebar-open');document.documentElement.dataset.sevenShellSidebar='closed';});\n      await page.waitForTimeout(380);\n      const closed=await page.evaluate(()=>{const s=document.querySelector('.sidebar'),r=s.getBoundingClientRect();return{left:r.left,right:r.right,innerWidth:innerWidth,transform:getComputedStyle(s).transform}});
      assert.ok(closed.left>=closed.innerWidth-2,'closed RTL sidebar must be fully off-screen to the right: '+JSON.stringify(closed));
      await page.evaluate(()=>document.querySelector('.sidebar').classList.add('open'));\n      await page.waitForTimeout(380);\n      const opened=await page.evaluate(()=>{const s=document.querySelector('.sidebar'),r=s.getBoundingClientRect();return{left:r.left,right:r.right,innerWidth:innerWidth,transform:getComputedStyle(s).transform}});
      assert.ok(opened.left>=-2&&opened.right<=opened.innerWidth+2,'open RTL sidebar must fit viewport: '+JSON.stringify(opened));
      await page.close();
    });
    await test('workspace assets are lazy and loadable',async()=>{
      const page=await browser.newPage();
      await page.addInitScript(()=>{localStorage.setItem('user_name_asked','1');localStorage.setItem('user_name','Seven Tester');localStorage.setItem('user-name','Seven Tester');});
      const requested=[];page.on('request',r=>{if(r.url().includes('/workspaces/'))requested.push(r.url())});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenBetaUI?.state.ready&&window.SevenRemake&&typeof window.SevenRemake.openWorkspace==='function');
      const specialistBefore=requested.filter(u=>!deferredShell.has(path.posix.basename(new URL(u).pathname)));
      assert.deepEqual(specialistBefore,[],'specialist workspaces must remain unloaded before workspace intent: '+JSON.stringify(specialistBefore));
      assert.equal(await page.evaluate(()=>!!window.SevenWorkspaces),false);
      assert.equal(await page.evaluate(()=>!!window.SevenAttachments),false);
      await page.evaluate(()=>window.SevenRemake.openWorkspace('coding'));
      await page.waitForFunction(()=>window.SevenWorkspaces&&document.querySelector('.seven-workspace-root'),null,{timeout:10000});
      const specialistAfter=requested.filter(u=>!deferredShell.has(path.posix.basename(new URL(u).pathname)));
      assert.ok(specialistAfter.some(u=>u.endsWith('/workspaces/hub.js')),'workspace hub did not lazy-load after intent: '+JSON.stringify(specialistAfter));
      await page.close();
    });
  }finally{await browser.close();server.close();}
  console.log(`release verification: PASS (${results.length} checks, ${releaseLayerBytes} startup bytes; frontier=${MODEL_ID}; PDF/attachments/workspaces lazy-local)`);
})().catch(e=>{console.error(e);process.exit(1)});
