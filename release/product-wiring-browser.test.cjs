const {chromium}=require('playwright');
const http=require('http');
const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');
const {build}=require('./build-release.cjs');

(async()=>{
  const built=build();
  const html=fs.readFileSync(built.output,'utf8');
  const dist=path.dirname(built.output);
  const server=http.createServer((req,res)=>{
    const pathname=new URL(req.url,'http://127.0.0.1').pathname;
    if(pathname.startsWith('/vendor/')||pathname.startsWith('/brand/')||pathname.startsWith('/workspaces/')){
      const file=path.resolve(dist,'.'+pathname);
      if(!file.startsWith(path.resolve(dist)+path.sep)||!fs.existsSync(file)){res.statusCode=404;res.end('not found');return;}
      const ext=path.extname(file);
      res.setHeader('Content-Type',ext==='.js'||ext==='.mjs'?'text/javascript; charset=utf-8':ext==='.css'?'text/css; charset=utf-8':ext==='.svg'?'image/svg+xml':'application/octet-stream');
      fs.createReadStream(file).pipe(res);return;
    }
    res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true});
  let assertions=0;
  const ok=(condition,message)=>{assert.ok(condition,message);assertions++};
  try{
    const context=await browser.newContext({viewport:{width:390,height:844}});
    await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.SevenBetaUI&&SevenBetaUI.state.ready,{timeout:10000});

    const core=await page.evaluate(()=>({
      input:!!document.getElementById('userInput'),
      send:!!document.querySelector('.input-area button.send'),
      stop:!!document.querySelector('.input-area button.stop'),
      think:!!document.getElementById('deepThinkToggle'),
      search:!!document.getElementById('searchToggle'),
      file:!!document.getElementById('fileInput'),
      accept:document.getElementById('fileInput')?.getAttribute('accept')||'',
      composerState:document.querySelector('.composer')?.dataset.sevenComposerState||'',
      sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth
    }));
    ok(core.input&&core.send&&core.stop,'chat send/stop path is missing');
    ok(core.think&&core.search&&core.file,'primary composer tools are missing');
    ok(core.accept.includes('.txt')&&core.accept.includes('.pdf'),'knowledge input must advertise TXT and PDF');
    ok(core.composerState==='ready','composer must initialize ready');
    ok(core.sw<=core.cw+2,'mobile core surface overflows horizontally');

    await page.evaluate(()=>openSettings());
    await page.waitForFunction(()=>{const e=document.getElementById('modelSelect');if(!e)return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0;},{timeout:5000});
    const settings=await page.evaluate(()=>({
      model:!!document.getElementById('modelSelect'),
      modelOptions:document.getElementById('modelSelect')?.options.length||0,
      routing:!!document.getElementById('routingModeSelect'),
      routingOptions:document.getElementById('routingModeSelect')?.options.length||0,
      fallback:!!document.getElementById('freeFallbackToggle'),
      status:!!document.getElementById('freeModelStatus'),
      visibleModel:(()=>{const e=document.getElementById('modelSelect');const r=e&&e.getBoundingClientRect();return!!(r&&r.width>0&&r.height>0)})()
    }));
    ok(settings.model&&settings.visibleModel,'Preferred Model escape hatch is not reachable');
    ok(settings.modelOptions>0,'Preferred Model selector has no catalog options');
    ok(settings.routing&&settings.routingOptions>0,'Free Model Routing control is not reachable');
    ok(settings.fallback&&settings.status,'fallback/status model controls are not reachable');

    await page.evaluate(()=>{if(typeof closeSettings==='function')closeSettings();});
    await page.locator('.seven-beta-status').click();
    await page.waitForFunction(()=>window.SevenWorkspaces&&document.querySelector('.seven-ws-launcher'),{timeout:5000});
    const launcher=await page.evaluate(()=>({
      cards:[...document.querySelectorAll('.seven-ws-choice')].map(x=>({id:x.dataset.ws,text:x.textContent.trim()})),
      modal:document.querySelector('.seven-ws-launcher')?.getAttribute('role'),
      aria:document.querySelector('.seven-ws-launcher')?.getAttribute('aria-modal')
    }));
    const launcherIds=launcher.cards.map(x=>x.id);
    ok(launcher.modal==='dialog'&&launcher.aria==='true','workspace launcher must be a modal dialog');
    for(const id of ['chat','coding','research','rpg'])ok(launcherIds.includes(id),'workspace launcher missing '+id);

    for(const kind of ['coding','research','rpg']){
      if(await page.locator('.seven-ws-launcher').count()===0){
        await page.evaluate(()=>SevenWorkspaces.openLauncher());
        await page.waitForSelector('.seven-ws-launcher');
      }
      await page.locator(`.seven-ws-choice[data-ws="${kind}"]`).click();
      await page.waitForFunction(k=>window.SevenWorkspaces&&SevenWorkspaces.active()===k&&document.querySelector('.seven-workspace-root')?.dataset.sevenWorkspace===k,kind,{timeout:7000});
      const state=await page.evaluate(()=>({
        active:SevenWorkspaces.active(),
        root:document.querySelector('.seven-workspace-root')?.dataset.sevenWorkspace,
        hidden:document.querySelector('.seven-workspace-root')?.hidden,
        chatHidden:document.getElementById('chat')?.hidden,
        specialist:document.querySelector('.seven-workspace-root')?.dataset.sevenSpecialist
      }));
      ok(state.active===kind&&state.root===kind&&state.specialist===kind,kind+' workspace did not bind to its runtime');
      ok(state.hidden===false&&state.chatHidden===true,kind+' workspace did not own the specialist surface');
      await page.evaluate(()=>SevenWorkspaces.close());
      await page.waitForFunction(()=>SevenWorkspaces.active()==='chat');
    }

    const finalState=await page.evaluate(()=>({
      active:SevenWorkspaces.active(),
      chatHidden:document.getElementById('chat')?.hidden,
      rootHidden:document.querySelector('.seven-workspace-root')?.hidden,
      sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth
    }));
    ok(finalState.active==='chat'&&finalState.chatHidden===false&&finalState.rootHidden===true,'workspace close must restore chat');
    ok(finalState.sw<=finalState.cw+2,'mobile product surface overflows after workspace round trip');
    assert.deepEqual(errors,[],'browser product wiring emitted page errors');assertions++;
    await context.close();
    console.log(`Product Wiring Browser: PASS (${assertions} assertions; chat/settings/coding/research/rpg mobile flows)`);
  }finally{
    await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(err=>{console.error(err);process.exit(1)});
