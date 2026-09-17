'use strict';
const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {build}=require('./build-release.cjs');

(async()=>{
  const built=build(),html=fs.readFileSync(built.output,'utf8'),dist=path.dirname(built.output);
  const server=http.createServer((req,res)=>{
    const pathname=new URL(req.url,'http://127.0.0.1').pathname;
    if(pathname!=='/'&&pathname!=='/index.html'){
      const file=path.resolve(dist,'.'+pathname);
      if(!file.startsWith(path.resolve(dist)+path.sep)||!fs.existsSync(file)){res.statusCode=404;return res.end('not found')}
      res.setHeader('Content-Type',file.endsWith('.js')||file.endsWith('.mjs')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.svg')?'image/svg+xml':'application/octet-stream');
      return fs.createReadStream(file).pipe(res);
    }
    res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true});
  try{
    const c=await browser.newContext({viewport:{width:390,height:844},userAgent:'Mozilla/5.0 (Linux; Android 14; TECNO LH7n) AppleWebKit/537.36 Chrome/126 Mobile Safari/537.36'});
    await c.addInitScript(()=>localStorage.setItem('user_name_asked','1'));
    await c.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
    const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.goto(origin,{waitUntil:'domcontentloaded'});
    await p.waitForFunction(()=>window.SevenBetaUI?.state.ready&&window.SevenAttachmentLoader);
    assert.equal(await p.evaluate(()=>!!window.SevenAttachments),false,'attachments should remain cold before RPG intent');
    await p.click('.seven-beta-status');
    await p.waitForFunction(()=>window.SevenWorkspaces&&document.querySelector('.seven-ws-launcher'));
    await p.click('[data-ws="rpg"]');
    await p.waitForFunction(()=>SevenWorkspaces.active()==='rpg'&&window.SevenRpgWorkspace&&window.SevenAttachments?.state?.ready,{timeout:10000});
    const ready=await p.evaluate(()=>({workspace:SevenWorkspaces.active(),attachmentReady:SevenAttachments.state.ready,trigger:!!document.querySelector('[data-seven-attach-trigger]'),inputVisible:!document.querySelector('.input-area').hidden}));
    assert.deepEqual(ready,{workspace:'rpg',attachmentReady:true,trigger:true,inputVisible:true});
    await p.click('[data-seven-attach-trigger]');
    assert.equal(await p.getAttribute('[data-seven-attach-trigger]','aria-expanded'),'true');
    assert.equal(await p.isVisible('.seven-attach-menu'),true,'RPG paperclip must open on the first tap');
    await p.keyboard.press('Escape');
    assert.equal(await p.getAttribute('[data-seven-attach-trigger]','aria-expanded'),'false');
    assert.deepEqual(errors,[]);
    await c.close();
    console.log('RPG attachment first-tap Android-browser test: PASS');
  }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exit(1)});
