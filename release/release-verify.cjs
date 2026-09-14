const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const http=require('http');
const assert=require('assert/strict');
const {build,OUTPUT,MARK,THEME_BOOT}=require('./build-release.cjs');

(async()=>{
  const built=build();
  const html=fs.readFileSync(OUTPUT,'utf8');
  const dist=path.dirname(OUTPUT);
  assert.ok(html.includes(MARK));
  const releaseAssets=['seven-final.css','beta-ui.css','canon-simulator.js','world-runtime.js','research-runtime.js','performance-runtime.js','control-runtime.js','control-bridge.js','execution-bridge.js','pdf-runtime.js','motion-runtime.js','ui-runtime.js','beta-ui-runtime.js'];
  const releaseLayerBytes=releaseAssets.reduce((n,name)=>n+fs.statSync(path.join(__dirname,name)).size,0)+Buffer.byteLength(THEME_BOOT);
  assert.ok(releaseLayerBytes<100000,`release layer unexpectedly heavy: ${releaseLayerBytes} bytes`);

  const server=http.createServer((req,res)=>{
    const pathname=new URL(req.url,'http://127.0.0.1').pathname;
    if(pathname.startsWith('/vendor/')||pathname.startsWith('/workspaces/')){
      const file=path.resolve(dist,'.'+pathname);
      if(!file.startsWith(path.resolve(dist)+path.sep)||!fs.existsSync(file)){res.statusCode=404;res.end('not found');return;}
      res.setHeader('Content-Type',file.endsWith('.js')||file.endsWith('.mjs')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'application/octet-stream');
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
      await page.waitForFunction(()=>window.SevenRuntime&&window.SevenControl&&window.SevenBridge&&window.SevenExecution&&window.SevenBetaUI);
      assert.equal(await page.evaluate(()=>document.documentElement.dataset.sevenControl),'v4.3');
      await page.close();
    });
    await test('workspace assets are lazy and loadable',async()=>{
      const page=await browser.newPage();
      await page.addInitScript(()=>{localStorage.setItem('user_name_asked','1');localStorage.setItem('user_name','Seven Tester');localStorage.setItem('user-name','Seven Tester');});
      const requested=[];page.on('request',r=>{if(r.url().includes('/workspaces/'))requested.push(r.url())});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenBetaUI?.state.ready&&document.querySelector('.seven-beta-status'));
      assert.equal(requested.length,0);
      await page.click('.seven-beta-status');
      await page.waitForFunction(()=>window.SevenWorkspaces&&document.querySelector('.seven-ws-launcher'),null,{timeout:10000});
      assert.ok(requested.length>0);
      await page.close();
    });
  }finally{await browser.close();server.close();}
  console.log(`release verification: PASS (${results.length} checks, ${releaseLayerBytes} startup bytes)`);
})().catch(e=>{console.error(e);process.exit(1)});
