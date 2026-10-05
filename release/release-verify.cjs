const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const http=require('http');
const assert=require('assert/strict');
const {build,OUTPUT,MARK}=require('./build-release.cjs');
const {transformFile}=require('./zero-room-transform.cjs');
const {patchFile,MODEL_ID}=require('./frontier-model-patch.cjs');

(async()=>{
  const built=build();
  transformFile(OUTPUT);
  const frontier=patchFile(OUTPUT);
  const html=fs.readFileSync(OUTPUT,'utf8');
  const dist=path.dirname(OUTPUT);
  const deferredShell=new Set(['seven-shell.css','seven-shell.js','ui-polish-fixes.css','ui-polish-fixes.js','seven-shell-final.css','seven-shell-final.js','remake.css','remake.js','intelligence.js']);
  assert.ok(html.includes(MARK));
  assert.ok(html.includes('id="seven-app"')&&html.includes('data-seven-remake="1"'),'Seven UI Remake root missing');
  assert.ok(html.includes('./workspaces/remake.css')&&html.includes('./workspaces/remake.js')&&html.includes('./workspaces/intelligence.js'),'Seven UI Remake asset wiring missing');
  assert.ok(html.includes('sendMessageLocked'),'duplicate-send guard missing');
  assert.ok(html.includes('defaultEnabled: true')&&html.includes('LLM7.io Free')&&html.includes('Kilo Code Free'),'anonymous free-provider defaults missing');
  assert.ok(html.includes('Seven 2.4.3 Zero-Key + UI Cleanup'),'2.4.3 UI cleanup marker missing');
  assert.ok(html.includes('Seven 2.4.2 Zero-Key UX'),'zero-key runtime marker missing');
  assert.ok(!html.includes('id="apiKeyInput"')&&!html.includes('id="nvidiaApiKeyInput"')&&!html.includes('id="openrouterApiKeyInput"')&&!html.includes('id="geminiApiKeyInput"')&&!html.includes('id="llm7TokenInput"'),'manual API-key fields must not exist');
  assert.ok(!/type=["']password["']/i.test(html),'password credential fields must not exist in the release UI');
  assert.ok(html.includes('Automatic Providers')&&html.includes('Zero-Key routing')&&html.includes('You never need to paste an API key.'),'automatic zero-key provider UX missing');
  assert.ok(!html.includes('id="nameModal"')&&!html.includes('id="nameInput"'),'legacy name capture UI must not exist');
  const bundledRemakeCss=fs.readFileSync(path.join(dist,'workspaces','remake.css'),'utf8');
  assert.ok(bundledRemakeCss.includes('--seven-ui-hardening-v242:1'),'UI hardening layer missing from bundled remake CSS');
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
      await page.evaluate(()=>SevenTheme.setPreference('day'));
      await page.waitForFunction(()=>document.documentElement.dataset.sevenTheme==='day');
      const dayBefore=await page.evaluate(()=>({root:getComputedStyle(document.getElementById('seven-app')).getPropertyValue('--s-bg').trim(),main:getComputedStyle(document.querySelector('.main')).backgroundColor,composer:getComputedStyle(document.querySelector('.composer')).backgroundColor}));
      assert.equal(dayBefore.root,'#f5f7f5');
      const autoDark=await page.evaluate(()=>{
        const old=window.matchMedia;
        window.matchMedia=q=>({matches:q.includes('prefers-color-scheme: dark'),media:q,addEventListener(){},removeEventListener(){}});
        localStorage.setItem('theme','auto');const resolved=SevenTheme.getResolvedTheme();SevenTheme.sync();
        const applied=document.documentElement.dataset.sevenTheme;window.matchMedia=old;return{resolved,applied};
      });
      assert.deepEqual(autoDark,{resolved:'night',applied:'night'});
      await page.evaluate(()=>SevenTheme.setPreference('night'));
      await page.waitForFunction(()=>document.documentElement.dataset.sevenTheme==='night');
      // Theme state flips synchronously, while composer/background colors animate.
      // Gate the settled visual state rather than sampling the first transition frame.
      await page.waitForFunction(()=>{
        const main=document.querySelector('.main'),composer=document.querySelector('.composer');
        return !!main&&!!composer&&getComputedStyle(main).backgroundColor==='rgb(17, 24, 21)'&&getComputedStyle(composer).backgroundColor==='rgb(17, 24, 21)';
      },null,{timeout:2500});
      const night=await page.evaluate(()=>{
        const app=document.getElementById('seven-app'),main=document.querySelector('.main'),composer=document.querySelector('.composer');
        const rs=getComputedStyle(app),ms=getComputedStyle(main),cs=getComputedStyle(composer);
        return {
          root:rs.getPropertyValue('--s-bg').trim(),
          main:ms.backgroundColor,
          composer:cs.backgroundColor,
          text:rs.color,
          htmlTheme:document.documentElement.dataset.sevenTheme||'',
          htmlClass:document.documentElement.className,
          bodyClass:document.body.className,
          composerSbS:cs.getPropertyValue('--sb-s').trim(),
          composerSurface:cs.getPropertyValue('--surface').trim(),
          composerShell:cs.getPropertyValue('--seven-shell-composer').trim(),
          composerInline:composer.getAttribute('style')||'',
          composerInApp:app.contains(composer)
        };
      });
      if(night.main!=='rgb(17, 24, 21)'||night.composer!=='rgb(17, 24, 21)')console.error('NIGHT_THEME_DIAGNOSTIC',JSON.stringify(night));
      assert.equal(night.root,'#111815');
      assert.equal(night.main,'rgb(17, 24, 21)');
      assert.equal(night.composer,'rgb(17, 24, 21)');
      assert.notEqual(night.root,dayBefore.root);
      assert.notEqual(night.main,dayBefore.main);
      assert.match(night.text,/rgb\((?:237, 245, 240|238, 246, 241)\)/);
      await page.evaluate(()=>SevenTheme.setPreference('day'));
      await page.waitForFunction(()=>document.documentElement.dataset.sevenTheme==='day');
      assert.equal(await page.evaluate(()=>getComputedStyle(document.getElementById('seven-app')).getPropertyValue('--s-bg').trim()),'#f5f7f5');
      await page.evaluate(()=>{document.documentElement.dir='rtl';document.body.dir='rtl';const s=document.querySelector('.sidebar');s.classList.remove('open','active');document.body.classList.remove('sidebar-open');document.documentElement.dataset.sevenShellSidebar='closed';});
      await page.waitForTimeout(380);
      const closed=await page.evaluate(()=>{const s=document.querySelector('.sidebar'),r=s.getBoundingClientRect();return{left:r.left,right:r.right,innerWidth:innerWidth,transform:getComputedStyle(s).transform}});
      assert.ok(closed.left>=closed.innerWidth-2,'closed RTL sidebar must be fully off-screen to the right: '+JSON.stringify(closed));
      await page.evaluate(()=>document.querySelector('.sidebar').classList.add('open'));
      await page.waitForTimeout(380);
      const opened=await page.evaluate(()=>{const s=document.querySelector('.sidebar'),r=s.getBoundingClientRect(),b=document.querySelector('.seven-shell-backdrop'),bs=b?getComputedStyle(b):null;return{left:r.left,right:r.right,innerWidth:innerWidth,transform:getComputedStyle(s).transform,backdrop:!!b&&!b.hidden,parent:b?.parentElement?.id||'',backdropBg:bs?.backgroundColor||''}});
      assert.ok(opened.left>=-2&&opened.right<=opened.innerWidth+2,'open RTL sidebar must fit viewport: '+JSON.stringify(opened));
      assert.equal(opened.backdrop,true,'mobile sidebar backdrop must be visible');
      assert.equal(opened.parent,'seven-app','mobile sidebar backdrop must inherit Seven theme/root styles');
      assert.notEqual(opened.backdropBg,'rgba(0, 0, 0, 0)','mobile sidebar backdrop must not be transparent');
      await page.close();
    });
    await test('zero-key settings expose no manual credential controls',async()=>{
      const page=await browser.newPage({viewport:{width:390,height:844}});
      await page.addInitScript(()=>{localStorage.setItem('user_name_asked','1');localStorage.setItem('user_name','Seven Tester');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&document.getElementById('settingsModal'));
      const state=await page.evaluate(()=>{openSettings();const sec=document.getElementById('providersSection');sec.open=true;const visible=[...sec.querySelectorAll('input,textarea,select')].filter(el=>{const cs=getComputedStyle(el),b=el.getBoundingClientRect();return!el.hidden&&cs.display!=='none'&&cs.visibility!=='hidden'&&b.width>0&&b.height>0});return{visible:visible.map(x=>x.id),kilo:isFreeProviderConfigured('kilo'),llm7:isFreeProviderConfigured('llm7'),route:hasAnyConfiguredFreeProvider(),text:sec.innerText}}); 
      assert.deepEqual(state.visible,[]);assert.equal(state.kilo,true);assert.equal(state.llm7,true);assert.equal(state.route,true);assert.ok(/never need to paste an API key|لن تحتاج إلى لصق مفتاح API/i.test(state.text));
      await page.close();
    });
    await test('settings tabs map every control to the correct modern section',async()=>{
      const page=await browser.newPage({viewport:{width:320,height:800}});
      await page.addInitScript(()=>{localStorage.setItem('user_name_asked','1');localStorage.setItem('user_name','Seven Tester');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&document.getElementById('settingsModal'));
      const state=await page.evaluate(()=>{
        openSettings();
        const panel=id=>document.getElementById(id)?.closest('[role="tabpanel"]')?.id||null;
        const panels=[...document.querySelectorAll('#settingsModal [role="tabpanel"]')].map(p=>({id:p.id,children:p.children.length,text:p.innerText.trim()}));
        const tabs=[...document.querySelectorAll('#settingsModal [role="tab"]')].map(b=>({id:b.id,text:b.textContent.trim(),selected:b.getAttribute('aria-selected')}));
        const modal=document.querySelector('#settingsModal .modal-content'),r=modal.getBoundingClientRect();
        return{
          temperature:panel('temperatureRange'),
          reasoning:panel('reasoningEffort'),
          pinned:panel('pinnedNotes'),
          providers:panel('providersSection'),
          advanced:panel('advancedSection'),
          theme:panel('s-theme'),
          panels,tabs,
          bounded:modal.scrollWidth<=modal.clientWidth+1&&r.left>=-2&&r.right<=innerWidth+2&&r.top>=-2&&r.bottom<=innerHeight+2
        };
      });
      assert.equal(state.temperature,'s-settings-generation');
      assert.equal(state.reasoning,'s-settings-generation');
      assert.equal(state.pinned,'s-settings-context');
      assert.equal(state.providers,'s-settings-models');
      assert.equal(state.advanced,'s-settings-data');
      assert.equal(state.theme,'s-settings-data');
      assert.equal(state.panels.length,4);
      assert.ok(state.panels.every(p=>p.children>0&&p.text.length>0),JSON.stringify(state.panels));
      assert.equal(state.tabs.length,4);
      assert.equal(state.bounded,true);
      await page.close();
    });
    await test('Arabic settings localization is complete and RTL-safe',async()=>{
      const page=await browser.newPage({viewport:{width:320,height:800}});
      await page.addInitScript(()=>{localStorage.setItem('seven_ui_language','ar');localStorage.setItem('user_name_asked','1');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&document.getElementById('settingsModal'));
      const state=await page.evaluate(()=>{
        openSettings();
        const texts=[...document.querySelectorAll('#settingsModal [role="tab"],#settingsModal summary,#settingsModal label,#settingsModal .settings-helper,#settingsModal .route-status-title,#settingsModal .route-state-badge')].map(x=>x.textContent.trim()).filter(Boolean);
        const m=document.querySelector('#settingsModal .modal-content'),r=m.getBoundingClientRect();
        return{dir:document.documentElement.dir,texts,bounded:m.scrollWidth<=m.clientWidth+1&&r.left>=-2&&r.right<=innerWidth+2&&r.top>=-2&&r.bottom<=innerHeight+2};
      });
      assert.equal(state.dir,'rtl');
      assert.equal(state.bounded,true);
      assert.ok(state.texts.includes('المزودون التلقائيون'));
      assert.ok(state.texts.includes('الذاكرة والبيانات'));
      assert.ok(state.texts.includes('متقدم'));
      assert.equal(state.texts.includes('Automatic Providers'),false);
      assert.equal(state.texts.includes('Memory & Data'),false);
      assert.equal(state.texts.includes('Advanced'),false);
      await page.close();
    });
    await test('search settings require no manual API key',async()=>{
      const page=await browser.newPage({viewport:{width:360,height:800}});
      await page.addInitScript(()=>{localStorage.setItem('user_name_asked','1');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&typeof SevenRemake.searchSettings==='function');
      await page.evaluate(()=>SevenRemake.searchSettings());
      await page.waitForFunction(()=>!!document.querySelector('.s-modal .s-dialog'));
      const state=await page.evaluate(()=>{const modal=document.querySelector('.s-modal');const fields=[...modal.querySelectorAll('input[type="password"],[id*="key" i],[name*="key" i]')];const engine=modal.querySelector('#s-search-engine');return{keyFields:fields.map(x=>x.id||x.name||x.tagName),options:engine?[...engine.options].map(o=>o.value):[],text:modal.innerText,box:(()=>{const r=modal.querySelector('.s-dialog').getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,w:innerWidth,h:innerHeight}})()}}); 
      assert.deepEqual(state.keyFields,[]);
      assert.equal(state.options.includes('brave'),false);
      assert.equal(/API\s*key|أدخل المفتاح|Brave API key/i.test(state.text),false);
      assert.ok(state.box.left>=-2&&state.box.right<=state.box.w+2&&state.box.top>=-2&&state.box.bottom<=state.box.h+2,JSON.stringify(state.box));
      await page.close();
    });
    await test('legacy Brave search preference migrates to zero-key Auto',async()=>{
      const context=await browser.newContext({viewport:{width:360,height:800}});
      const page=await context.newPage();
      await page.addInitScript(()=>{localStorage.setItem('seven_intelligence_preferences_v1',JSON.stringify({engine:'brave',depth:'balanced',maxQueries:3,readPages:true}));localStorage.setItem('user_name_asked','1');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenIntelligence&&typeof SevenIntelligence.settings==='function');
      const state=await page.evaluate(()=>SevenIntelligence.settings());
      assert.equal(state.engine,'auto');
      await page.waitForFunction(()=>window.SevenRemake&&typeof SevenRemake.searchSettings==='function');
      await page.evaluate(()=>SevenRemake.searchSettings());
      await page.waitForFunction(()=>!!document.querySelector('.s-modal .s-dialog'));
      const ui=await page.evaluate(()=>({options:[...document.querySelectorAll('#s-search-engine option')].map(o=>o.value),keyFields:[...document.querySelectorAll('.s-modal input[type="password"],.s-modal [id*="key" i]')].length}));
      assert.equal(ui.options.includes('brave'),false);assert.equal(ui.keyFields,0);
      await context.close();
    });
    await test('responsive UI matrix stays bounded on phone widths themes and directions',async()=>{
      const sizes=[[320,800],[360,800],[390,844],[412,915]];
      for(const [width,height] of sizes)for(const dir of ['ltr','rtl'])for(const theme of ['day','night']){
        const page=await browser.newPage({viewport:{width,height}});
        await page.addInitScript(()=>{localStorage.setItem('user_name_asked','1');localStorage.setItem('user_name','Seven Tester');});
        await page.goto(origin,{waitUntil:'domcontentloaded'});
        await page.waitForFunction(()=>window.SevenRemake&&window.SevenTheme&&document.getElementById('seven-app'));
        await page.evaluate(({dir,theme})=>{document.documentElement.dir=dir;document.body.dir=dir;SevenTheme.setPreference(theme);document.querySelector('.sidebar')?.classList.add('collapsed');},{dir,theme});
        await page.waitForTimeout(360);
        const base=await page.evaluate(()=>{const q=s=>document.querySelector(s)?.getBoundingClientRect();const main=q('.main'),composer=q('.composer'),top=q('.topbar');return{doc:document.documentElement.scrollWidth<=innerWidth+2,main:!!main&&main.left>=-2&&main.right<=innerWidth+2,composer:!!composer&&composer.left>=-2&&composer.right<=innerWidth+2&&composer.bottom<=innerHeight+2,top:!!top&&top.left>=-2&&top.right<=innerWidth+2,theme:document.documentElement.dataset.sevenTheme,bg:getComputedStyle(document.getElementById('seven-app')).getPropertyValue('--s-bg').trim()}}); 
        assert.equal(base.doc,true,`document overflow at ${width} ${dir} ${theme}`);assert.equal(base.main,true);assert.equal(base.composer,true);assert.equal(base.top,true);assert.equal(base.theme,theme);if(theme==='night')assert.equal(base.bg,'#111815');
        await page.evaluate(()=>openSettings());await page.waitForTimeout(40);
        const modal=await page.evaluate(()=>{const e=document.querySelector('#settingsModal .modal-content'),b=e.getBoundingClientRect();return{overflow:e.scrollWidth<=e.clientWidth+1,left:b.left,right:b.right,top:b.top,bottom:b.bottom,w:innerWidth,h:innerHeight}});
        assert.equal(modal.overflow,true);assert.ok(modal.left>=-2&&modal.right<=modal.w+2&&modal.top>=-2&&modal.bottom<=modal.h+2,`settings clipped: ${JSON.stringify(modal)}`);
        await page.close();
      }
    });
    await test('landscape large-text and keyboard-height surfaces stay usable',async()=>{
      for(const [width,height] of [[800,360],[390,430]]){
        const page=await browser.newPage({viewport:{width,height}});
        await page.addInitScript(()=>{localStorage.setItem('user_name_asked','1');localStorage.setItem('seven_ui_language','ar');});
        await page.goto(origin,{waitUntil:'domcontentloaded'});
        await page.waitForFunction(()=>window.SevenRemake&&window.SevenTheme);
        await page.evaluate(()=>{document.documentElement.style.fontSize='150%';SevenTheme.setPreference('night');document.querySelector('.sidebar')?.classList.add('collapsed');});
        await page.waitForTimeout(120);
        let state=await page.evaluate(()=>{
          const rect=s=>document.querySelector(s)?.getBoundingClientRect();
          const top=rect('.topbar'),main=rect('.main'),composer=rect('.composer');
          return{doc:document.documentElement.scrollWidth<=innerWidth+2,top:!!top&&top.left>=-2&&top.right<=innerWidth+2,main:!!main&&main.left>=-2&&main.right<=innerWidth+2,composer:!!composer&&composer.left>=-2&&composer.right<=innerWidth+2&&composer.bottom<=innerHeight+2};
        });
        assert.deepEqual(state,{doc:true,top:true,main:true,composer:true},'base '+width+'x'+height+' '+JSON.stringify(state));

        await page.evaluate(()=>openSettings());
        state=await page.evaluate(()=>{const e=document.querySelector('#settingsModal .modal-content'),r=e.getBoundingClientRect();return{overflow:e.scrollWidth<=e.clientWidth+1,bounded:r.left>=-2&&r.right<=innerWidth+2&&r.top>=-2&&r.bottom<=innerHeight+2,scrollable:e.scrollHeight>=e.clientHeight}});
        assert.equal(state.overflow,true);assert.equal(state.bounded,true);
        await page.evaluate(()=>closeSettings());

        await page.evaluate(()=>SevenRemake.modeDialog());
        await page.waitForFunction(()=>!!document.querySelector('#seven-app > .s-modal .s-dialog'));
        state=await page.evaluate(()=>{const e=document.querySelector('.s-dialog'),r=e.getBoundingClientRect();return{overflow:e.scrollWidth<=e.clientWidth+1,bounded:r.left>=-2&&r.right<=innerWidth+2&&r.top>=-2&&r.bottom<=innerHeight+2}});
        assert.deepEqual(state,{overflow:true,bounded:true});
        await page.evaluate(()=>SevenRemake.closeDialog());

        await page.evaluate(()=>SevenRemake.searchSettings());
        await page.waitForFunction(()=>!!document.querySelector('#seven-app > .s-modal .s-dialog'));
        state=await page.evaluate(()=>{const e=document.querySelector('.s-dialog'),r=e.getBoundingClientRect();return{overflow:e.scrollWidth<=e.clientWidth+1,bounded:r.left>=-2&&r.right<=innerWidth+2&&r.top>=-2&&r.bottom<=innerHeight+2,scrollable:e.scrollHeight>=e.clientHeight}});
        assert.equal(state.overflow,true);assert.equal(state.bounded,true);
        await page.evaluate(()=>SevenRemake.closeDialog());

        await page.evaluate(()=>SevenRemake.openWorkspace('coding'));
        await page.waitForFunction(()=>document.documentElement.dataset.sevenWorkspace==='coding',null,{timeout:10000});
        state=await page.evaluate(()=>{const e=document.querySelector('.seven-workspace-root'),r=e.getBoundingClientRect();return{doc:document.documentElement.scrollWidth<=innerWidth+2,bounded:r.left>=-2&&r.right<=innerWidth+2,scroll:e.scrollWidth<=Math.max(e.clientWidth+2,innerWidth+2)}});
        assert.deepEqual(state,{doc:true,bounded:true,scroll:true});
        await page.evaluate(()=>{SevenWorkspaces.close();SevenWorkspaces.openLauncher();});
        await page.waitForFunction(()=>!!document.querySelector('.seven-ws-picker'));
        state=await page.evaluate(()=>{const e=document.querySelector('.seven-ws-picker'),r=e.getBoundingClientRect();return{overflow:e.scrollWidth<=e.clientWidth+1,bounded:r.left>=-2&&r.right<=innerWidth+2&&r.top>=-2&&r.bottom<=innerHeight+2}});
        assert.deepEqual(state,{overflow:true,bounded:true});
        await page.close();
      }
    });
    await test('fresh install stays zero-room with no legacy name modal',async()=>{
      const context=await browser.newContext({viewport:{width:390,height:844}});
      const page=await context.newPage();
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&typeof roomPersistence!=='undefined'&&roomPersistence.status().ready);
      await page.waitForTimeout(120);
      const state=await page.evaluate(()=>({nameModal:!!document.getElementById('nameModal'),nameInput:!!document.getElementById('nameInput'),rooms:Object.keys(rooms).length,current:currentRoom,title:document.getElementById('roomTitle').textContent.trim()}));
      assert.equal(state.nameModal,false);assert.equal(state.nameInput,false);assert.equal(state.rooms,0);assert.equal(state.current,'');assert.ok(/new chat/i.test(state.title));
      await context.close();
    });
    await test('expanded settings sections remain bounded on smallest phone',async()=>{
      const page=await browser.newPage({viewport:{width:320,height:800}});
      await page.addInitScript(()=>{localStorage.setItem('user_name_asked','1');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&document.getElementById('settingsModal'));
      const state=await page.evaluate(()=>{openSettings();document.querySelectorAll('#settingsModal details').forEach(d=>d.open=true);const m=document.querySelector('#settingsModal .modal-content'),r=m.getBoundingClientRect();return{overflow:m.scrollWidth<=m.clientWidth+1,left:r.left,right:r.right,top:r.top,bottom:r.bottom,w:innerWidth,h:innerHeight,sections:[...document.querySelectorAll('#settingsModal details')].length}});
      assert.ok(state.sections>=2);assert.equal(state.overflow,true);assert.ok(state.left>=-2&&state.right<=state.w+2&&state.top>=-2&&state.bottom<=state.h+2,JSON.stringify(state));
      await page.close();
    });
    await test('long messages code and URLs cannot widen the mobile viewport',async()=>{
      const page=await browser.newPage({viewport:{width:320,height:800}});
      await page.addInitScript(()=>{localStorage.setItem('user_name_asked','1');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&document.getElementById('chat'));
      const state=await page.evaluate(()=>{const long='x'.repeat(500);addMessage('assistant','https://example.com/'+long+'\n\n```js\nconst value="'+long+'";\n```');const chat=document.getElementById('chat'),pre=chat.querySelector('pre'),bubble=chat.querySelector('.message:last-child .bubble');return{doc:document.documentElement.scrollWidth<=innerWidth+2,chat:chat.scrollWidth<=chat.clientWidth+2,pre:!pre||pre.getBoundingClientRect().right<=innerWidth+2,bubble:!bubble||bubble.getBoundingClientRect().right<=innerWidth+2}});
      assert.deepEqual(state,{doc:true,chat:true,pre:true,bubble:true});
      await page.close();
    });
    await test('all specialist workspaces remain viewport-safe on mobile RTL night',async()=>{
      const page=await browser.newPage({viewport:{width:360,height:800}});
      await page.addInitScript(()=>{localStorage.setItem('user_name_asked','1');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&window.SevenTheme);
      await page.evaluate(()=>{document.documentElement.dir='rtl';document.body.dir='rtl';SevenTheme.setPreference('night');});
      for(const kind of ['coding','research','rpg']){
        await page.evaluate(k=>window.SevenRemake.openWorkspace(k),kind);
        await page.waitForFunction(k=>document.documentElement.dataset.sevenWorkspace===k,kind,{timeout:10000});
        const state=await page.evaluate(()=>{const root=document.querySelector('.seven-workspace-root'),r=root?.getBoundingClientRect();return{doc:document.documentElement.scrollWidth<=innerWidth+2,root:!r||(r.left>=-2&&r.right<=innerWidth+2),scroll:!root||root.scrollWidth<=Math.max(root.clientWidth+2,innerWidth+2)}});
        assert.equal(state.doc,true,kind+' document overflow');assert.equal(state.root,true,kind+' root clipped');assert.equal(state.scroll,true,kind+' workspace overflow');
      }
      await page.evaluate(()=>window.SevenWorkspaces?.close());
      await page.close();
    });
    await test('live RPG workspace persists Memory and restores structured Context after reload',async()=>{
      const page=await browser.newPage({viewport:{width:390,height:844}});
      await page.addInitScript(()=>{localStorage.setItem('user_name_asked','1');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&typeof roomPersistence!=='undefined'&&roomPersistence.status().ready);
      const roomId='rpg-live-release-e2e';
      await page.evaluate(async rid=>{
        if(!rooms[rid]){rooms[rid]=createEmptyRoom();roomTitles[rid]='RPG Live Release E2E';}
        currentRoom=rid;await saveRooms();updateRoomTitle();renderChatHistory();updateRoomListUI();
        await SevenRemake.openWorkspace('rpg');
      },roomId);
      await page.waitForFunction(()=>window.SevenRpgWorkspace&&window.SevenRpgLiveIntegration&&document.documentElement.dataset.sevenWorkspace==='rpg',null,{timeout:10000});
      let state=await page.evaluate(rid=>{
        SevenRpgWorkspace.loadWork({id:'rpg-live-world',title:'RPG Live World',continuity:'test',sources:[{id:'src',authority:'A0'}],beats:[{id:'b1',sourceRefs:['src']}]});
        const bridge=SevenRpgWorkspace.state.live,loaded=bridge.loadLatest(rid);
        const seeded=SevenRpgState.createState({
          sessionId:loaded.session.state.sessionId,worldId:'rpg-live-world',revision:loaded.session.state.revision,
          timeline:{tick:10},world:{locations:{hall:{name:'Hall'}}},
          characters:{aria:{control:'ai',locationId:'hall',knowledge:{secret:{learnedAtTick:5,sourceEventId:'tell-aria'}}},ren:{control:'ai',locationId:'hall'}},
          canon:{entries:{public:{level:'HARD',value:'public fact',public:true,entityIds:['hall']},secret:{level:'HARD',value:'hidden fact',public:false,entityIds:['aria']}}},
          scene:{id:'scene-1',locationId:'hall',participantIds:['aria','ren'],timeTick:10}
        });
        bridge.manager.persist({roomId:rid,worldId:'rpg-live-world',state:seeded,legacy:loaded.session.legacy,persistedRevision:loaded.session.persistedRevision},{force:true});
        const projection=SevenRpgWorkspace.contextProjection({roomId:rid,maxChars:8000});
        SevenRpgWorkspace.setContextView('character','ren');
        const renProjection=SevenRpgWorkspace.contextProjection({roomId:rid,maxChars:8000});
        const source=collectContextSources(rooms[rid],'continue',null,{roomId:rid}).find(x=>x.kind==='rpg');
        SevenRpgWorkspace.setContextView('narrator');
        const memory=SevenRuntime.readMemory().objects.find(x=>x.type==='RpgStateSnapshot'&&x.scope==='rpg'&&x.content.includes(rid)&&x.content.includes('rpg-live-world'));
        return{schema:projection?.schema,access:projection?.access,worldId:projection?.worldId,revision:projection?.revision,source:!!source&&source.content.includes('"access":"character-local"'),renSecret:!!renProjection?.knownCanon?.some(x=>x.id==='secret'),renPublic:!!renProjection?.knownCanon?.some(x=>x.id==='public'),memory:!!memory,title:document.querySelector('[data-rpg-world-name]')?.textContent.trim()};
      },roomId);
      assert.equal(state.schema,'seven-rpg-context');assert.equal(state.access,'world-truth');assert.equal(state.worldId,'rpg-live-world');assert.equal(state.source,true);assert.equal(state.renSecret,false);assert.equal(state.renPublic,true);assert.equal(state.memory,true);assert.equal(state.title,'RPG Live World');
      const before={worldId:state.worldId,revision:state.revision};
      await page.evaluate(async rid=>{
        SevenWorkspaces.close();const other=rid+'-empty';rooms[other]=createEmptyRoom();roomTitles[other]='Empty RPG';currentRoom=other;await saveRooms();
        updateRoomTitle();renderChatHistory();updateRoomListUI();await SevenRemake.openWorkspace('rpg');
      },roomId);
      await page.waitForFunction(()=>document.documentElement.dataset.sevenWorkspace==='rpg');
      const isolated=await page.evaluate(()=>({work:SevenRpgWorkspace.snapshot().work,canon:SevenRpgWorkspace.snapshot().canonPack,context:SevenRpgWorkspace.contextProjection()}));
      assert.equal(isolated.work,null);assert.equal(isolated.canon,null);assert.equal(isolated.context,null);
      await page.evaluate(async rid=>{
        SevenWorkspaces.close();delete rooms[rid+'-empty'];delete roomTitles[rid+'-empty'];currentRoom=rid;await saveRooms();
        updateRoomTitle();renderChatHistory();updateRoomListUI();await SevenRemake.openWorkspace('rpg');
      },roomId);
      await page.reload({waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&typeof roomPersistence!=='undefined'&&roomPersistence.status().ready);
      await page.evaluate(async rid=>{currentRoom=rid;updateRoomTitle();renderChatHistory();updateRoomListUI();await SevenRemake.openWorkspace('rpg')},roomId);
      await page.waitForFunction(()=>window.SevenRpgWorkspace&&document.documentElement.dataset.sevenWorkspace==='rpg'&&document.querySelector('[data-rpg-world-name]')?.textContent.trim()==='RPG Live World',null,{timeout:10000});
      state=await page.evaluate(rid=>{const p=SevenRpgWorkspace.contextProjection({roomId:rid,maxChars:8000}),src=collectContextSources(rooms[rid],'continue',null,{roomId:rid}).find(x=>x.kind==='rpg');return{worldId:p?.worldId,revision:p?.revision,source:!!src&&src.content.includes('rpg-live-world'),title:document.querySelector('[data-rpg-world-name]')?.textContent.trim()}},roomId);
      assert.equal(state.worldId,before.worldId);assert.equal(state.revision,before.revision);assert.equal(state.source,true);assert.equal(state.title,'RPG Live World');
      await page.evaluate(async rid=>{
        const bundle=SevenRuntime.readMemory();
        for(const x of bundle.objects.filter(x=>x.type==='RpgStateSnapshot'&&x.scope==='rpg'&&x.content.includes(rid)))SevenRuntime.commitMemory(x,'DELETE');
        for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&k.startsWith('seven_rpg_session_v3')&&k.includes(encodeURIComponent(rid)))localStorage.removeItem(k);}
        SevenWorkspaces.close();delete rooms[rid];delete roomTitles[rid];currentRoom=Object.keys(rooms)[0]||'';await saveRooms();renderChatHistory();updateRoomListUI();
      },roomId);
      await page.close();
    });
    await test('Arabic workspace picker and specialist surfaces are fully localized',async()=>{
      const page=await browser.newPage({viewport:{width:360,height:800}});
      await page.addInitScript(()=>{localStorage.setItem('seven_ui_language','ar');localStorage.setItem('user_name_asked','1');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&window.SevenTheme&&document.documentElement.lang==='ar'&&document.documentElement.dir==='rtl');
      await page.evaluate(()=>{SevenTheme.setPreference('night');return SevenRemake.openWorkspace('coding')});
      await page.waitForFunction(()=>document.documentElement.dataset.sevenWorkspace==='coding'&&document.querySelector('.seven-workspace-root h1')?.textContent.includes('البرمجة'),null,{timeout:10000});
      let state=await page.evaluate(()=>({h1:document.querySelector('.seven-workspace-root h1')?.textContent.trim(),importText:document.querySelector('[data-code-import]')?.textContent.trim(),placeholder:document.querySelector('[data-code-task]')?.placeholder,retry:document.querySelector('[data-code-retry]')?.textContent.trim(),stop:document.querySelector('[data-code-stop]')?.textContent.trim(),run:document.querySelector('[data-code-run]')?.textContent.trim(),empty:document.querySelector('[data-code-files]')?.textContent.trim(),output:document.querySelector('[data-code-output]')?.textContent.trim(),doc:document.documentElement.scrollWidth<=innerWidth+2}));
      assert.match(state.h1,/البرمجة/);assert.equal(state.importText,'استيراد ملفات');assert.match(state.placeholder,/صف/);assert.equal(state.retry,'إعادة المحاولة');assert.equal(state.stop,'إيقاف');assert.equal(state.run,'تشغيل عبر Seven');assert.match(state.empty,/لم تُضف ملفات مشروع/);assert.match(state.output,/أحدث إجابة حقيقية/);assert.equal(state.doc,true);

      await page.evaluate(()=>SevenRemake.openWorkspace('research'));
      await page.waitForFunction(()=>document.documentElement.dataset.sevenWorkspace==='research'&&document.querySelector('.seven-workspace-root h1')?.textContent.trim()==='تتبّع الدليل.',null,{timeout:10000});
      state=await page.evaluate(()=>({h1:document.querySelector('.seven-workspace-root h1')?.textContent.trim(),importText:document.querySelector('[data-research-import]')?.textContent.trim(),runText:document.querySelector('[data-research-run]')?.textContent.trim(),placeholder:document.querySelector('[data-research-task]')?.placeholder,doc:document.documentElement.scrollWidth<=innerWidth+2}));
      assert.equal(state.h1,'تتبّع الدليل.');assert.equal(state.importText,'استيراد حزمة');assert.equal(state.runText,'بحث موسع');assert.match(state.placeholder,/ماذا تريد/);assert.equal(state.doc,true);

      await page.evaluate(()=>SevenRemake.openWorkspace('rpg'));
      await page.waitForFunction(()=>document.documentElement.dataset.sevenWorkspace==='rpg'&&!!document.querySelector('.seven-rpg-chatbar'),null,{timeout:10000});
      state=await page.evaluate(()=>({world:document.querySelector('[data-rpg-world-name]')?.textContent.trim(),mode:document.querySelector('[data-rpg-state]')?.textContent.trim(),titles:document.querySelector('[data-rpg-title-toggle]')?.textContent.trim(),exit:document.querySelector('[data-rpg-exit]')?.textContent.trim(),aria:document.querySelector('.seven-rpg-chatbar')?.getAttribute('aria-label'),doc:document.documentElement.scrollWidth<=innerWidth+2}));
      assert.equal(state.world,'RPG حر');assert.equal(state.mode,'وضع المحادثة');assert.equal(state.titles,'العناوين');assert.equal(state.exit,'الخروج من RPG');assert.equal(state.aria,'عناصر تحكم RPG');assert.equal(state.doc,true);
      await page.evaluate(()=>addMessage('assistant','اختبار نسخ RPG'));
      await page.waitForFunction(()=>!!document.querySelector('#chat .seven-rpg-copy'),null,{timeout:5000});
      state=await page.evaluate(()=>{const b=document.querySelector('#chat .seven-rpg-copy');return{text:b?.textContent.trim(),aria:b?.getAttribute('aria-label'),title:b?.title}});
      assert.match(state.text,/نسخ/);assert.equal(state.aria,'نسخ الرسالة');assert.equal(state.title,'نسخ');

      await page.evaluate(()=>{SevenWorkspaces.close();SevenWorkspaces.openLauncher();});
      await page.waitForFunction(()=>document.querySelector('#seven-ws-launcher-title')?.textContent.trim()==='اختر مساحة عمل',null,{timeout:10000});
      state=await page.evaluate(()=>{const launcher=document.querySelector('.seven-ws-launcher'),p=document.querySelector('.seven-ws-picker'),r=p.getBoundingClientRect(),cs=getComputedStyle(p);return{title:document.querySelector('#seven-ws-launcher-title').textContent.trim(),close:document.querySelector('[data-ws-close]')?.getAttribute('aria-label'),coding:document.querySelector('[data-ws="coding"] strong')?.textContent.trim(),research:document.querySelector('[data-ws="research"] strong')?.textContent.trim(),parent:launcher.parentElement?.id,bg:cs.backgroundColor,border:cs.borderStyle,bounded:r.left>=-2&&r.right<=innerWidth+2&&r.top>=-2&&r.bottom<=innerHeight+2}});
      assert.equal(state.title,'اختر مساحة عمل');assert.equal(state.close,'إغلاق');assert.match(state.coding,/البرمجة/);assert.equal(state.research,'البحث');assert.equal(state.parent,'seven-app');assert.notEqual(state.bg,'rgba(0, 0, 0, 0)');assert.equal(state.border,'solid');assert.equal(state.bounded,true);
      await page.close();
    });
    await test('mode and depth dialogs stay usable on smallest RTL night phone',async()=>{
      const page=await browser.newPage({viewport:{width:320,height:800}});
      await page.addInitScript(()=>{localStorage.setItem('user_name_asked','1');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&window.SevenTheme&&typeof SevenRemake.modeDialog==='function'&&typeof SevenRemake.depthDialog==='function');
      await page.evaluate(()=>{document.documentElement.dir='rtl';document.body.dir='rtl';SevenTheme.setPreference('night');});
      for(const name of ['modeDialog','depthDialog']){
        await page.evaluate(n=>SevenRemake[n](),name);
        await page.waitForFunction(()=>!!document.querySelector('.s-modal .s-dialog'));
        const state=await page.evaluate(()=>{const m=document.querySelector('.s-modal'),d=m.querySelector('.s-dialog'),r=d.getBoundingClientRect();const controls=[...d.querySelectorAll('button,input,select,textarea')].filter(x=>{const b=x.getBoundingClientRect(),s=getComputedStyle(x);return !x.hidden&&s.display!=='none'&&s.visibility!=='hidden'&&b.width>0&&b.height>0});return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,w:innerWidth,h:innerHeight,overflow:d.scrollWidth<=d.clientWidth+1,controls:controls.length,theme:document.documentElement.dataset.sevenTheme,dir:document.documentElement.dir}}); 
        assert.equal(state.overflow,true,name+' overflow');
        assert.ok(state.left>=-2&&state.right<=state.w+2&&state.top>=-2&&state.bottom<=state.h+2,name+' clipped: '+JSON.stringify(state));
        assert.ok(state.controls>=2,name+' controls missing');
        assert.equal(state.theme,'night');assert.equal(state.dir,'rtl');
        await page.evaluate(()=>SevenRemake.closeDialog());
      }
      await page.close();
    });
    await test('modern dialogs inherit Seven theme and isolate background interaction',async()=>{
      const page=await browser.newPage({viewport:{width:320,height:800}});
      await page.addInitScript(()=>{localStorage.setItem('user_name_asked','1');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&window.SevenTheme);
      await page.evaluate(()=>{SevenTheme.setPreference('night');SevenRemake.modeDialog();});
      await page.waitForFunction(()=>!!document.querySelector('#seven-app > .s-modal .s-dialog'));
      const state=await page.evaluate(()=>{
        const root=document.getElementById('seven-app'),modal=root.querySelector(':scope > .s-modal'),dialog=modal.querySelector('.s-dialog');
        const siblings=[...root.children].filter(x=>x!==modal);
        const cs=getComputedStyle(dialog),button=getComputedStyle(dialog.querySelector('.s-mode-option'));
        return{parent:modal.parentElement.id,modalInert:modal.inert,background:cs.backgroundColor,color:cs.color,border:button.borderStyle,rounded:parseFloat(button.borderRadius)>0,siblingsInert:siblings.length>0&&siblings.every(x=>x.inert)};
      });
      assert.equal(state.parent,'seven-app');
      assert.equal(state.modalInert,false);
      assert.equal(state.background,'rgb(17, 24, 21)');
      assert.match(state.color,/rgb\((?:237, 245, 240|238, 246, 241)\)/);
      assert.notEqual(state.border,'none');
      assert.equal(state.rounded,true);
      assert.equal(state.siblingsInert,true);
      await page.evaluate(()=>SevenRemake.closeDialog());
      assert.equal(await page.evaluate(()=>[...document.getElementById('seven-app').children].every(x=>!x.inert)),true);
      await page.close();
    });
    await test('modern model and workspace menus stay inside viewport',async()=>{
      const page=await browser.newPage({viewport:{width:360,height:800}});
      await page.addInitScript(()=>{localStorage.setItem('user_name_asked','1');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&window.SevenTheme&&document.querySelector('.seven-shell-model-chip')&&document.querySelector('.seven-shell-workspace-chip'));
      await page.evaluate(()=>SevenTheme.setPreference('night'));
      await page.click('.seven-shell-model-chip');
      await page.waitForTimeout(60);
      const model=await page.evaluate(()=>{const e=document.querySelector('.seven-shell-model-menu'),r=e?.getBoundingClientRect(),cs=e?getComputedStyle(e):null;return{bounded:!!r&&r.left>=-2&&r.right<=innerWidth+2&&r.top>=-2&&r.bottom<=innerHeight+2,parent:e?.parentElement?.id||'',bg:cs?.backgroundColor||'',border:cs?.borderStyle||''}});
      assert.equal(model.bounded,true);
      assert.equal(model.parent,'seven-app');
      assert.notEqual(model.bg,'rgba(0, 0, 0, 0)');
      assert.equal(model.border,'solid');
      await page.keyboard.press('Escape');
      // The top workspace chip is intentionally hidden on mobile because Seven
      // exposes workspace navigation in the mobile shell. Exercise the picker
      // through the same public workspace runtime instead of clicking hidden UI.
      await page.evaluate(()=>SevenRemake.openWorkspace('coding'));
      await page.waitForFunction(()=>window.SevenWorkspaces&&document.documentElement.dataset.sevenWorkspace==='coding',null,{timeout:10000});
      await page.evaluate(()=>{SevenWorkspaces.close();SevenWorkspaces.openLauncher();});
      await page.waitForFunction(()=>!!document.querySelector('.seven-ws-launcher'),null,{timeout:10000});
      const picker=await page.evaluate(()=>{const e=document.querySelector('.seven-ws-picker'),r=e?.getBoundingClientRect();return!!r&&r.left>=-2&&r.right<=innerWidth+2&&r.top>=-2&&r.bottom<=innerHeight+2});
      assert.equal(picker,true);
      await page.close();
    });
    await test('GitHub Self Dev panel inherits theme localizes and isolates background',async()=>{
      const page=await browser.newPage({viewport:{width:320,height:800}});
      await page.addInitScript(()=>{localStorage.setItem('seven_ui_language','ar');localStorage.setItem('user_name_asked','1');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&window.SevenTheme&&document.documentElement.lang==='ar');
      await page.evaluate(()=>SevenTheme.setPreference('day'));
      await page.addScriptTag({content:fs.readFileSync(path.join(dist,'github-self-dev.js'),'utf8')});
      await page.waitForFunction(()=>!!window.SevenGitHubSelfDev);
      await page.evaluate(()=>SevenGitHubSelfDev.openPanel());
      await page.waitForFunction(()=>!!document.querySelector('#seven-app > #seven-github-selfdev .seven-gh-panel'));
      const state=await page.evaluate(()=>{
        const app=document.getElementById('seven-app'),back=document.getElementById('seven-github-selfdev'),p=back.querySelector('.seven-gh-panel'),r=p.getBoundingClientRect(),cs=getComputedStyle(p);
        const siblings=[...app.children].filter(x=>x!==back);
        return{
          parent:back.parentElement?.id||'',
          title:back.querySelector('#seven-gh-title')?.textContent.trim(),
          close:back.querySelector('.seven-gh-close')?.getAttribute('aria-label'),
          connection:back.querySelector('.seven-gh-card strong')?.textContent.trim(),
          task:back.querySelector('.seven-gh-task')?.placeholder,
          bg:cs.backgroundColor,
          border:cs.borderStyle,
          bounded:r.left>=-2&&r.right<=innerWidth+2&&r.top>=-2&&r.bottom<=innerHeight+2,
          overflow:p.scrollWidth<=p.clientWidth+1,
          isolated:siblings.length>0&&siblings.every(x=>x.inert)
        };
      });
      assert.equal(state.parent,'seven-app');
      assert.match(state.title,/التطوير الذاتي/);
      assert.equal(state.close,'إغلاق');
      assert.equal(state.connection,'الاتصال');
      assert.match(state.task,/مثال/);
      assert.notEqual(state.bg,'rgba(0, 0, 0, 0)');
      assert.equal(state.border,'solid');
      assert.equal(state.bounded,true);
      assert.equal(state.overflow,true);
      assert.equal(state.isolated,true);
      await page.click('.seven-gh-close');
      assert.equal(await page.evaluate(()=>!document.getElementById('seven-github-selfdev')&&[...document.getElementById('seven-app').children].every(x=>!x.inert)),true);
      await page.close();
    });
    await test('Arabic sidebar room search model picker and final nav are localized',async()=>{
      const page=await browser.newPage({viewport:{width:390,height:844}});
      await page.addInitScript(()=>{localStorage.setItem('seven_ui_language','ar');localStorage.setItem('user_name_asked','1');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenShell&&window.SevenShellFinal&&window.SevenUiPolish&&document.documentElement.lang==='ar');
      await page.evaluate(()=>{SevenUiPolish.sync();SevenShell.sync();SevenShellFinal.sync();});
      await page.waitForFunction(()=>document.querySelector('#seven-room-search')?.placeholder==='بحث المحادثات'&&document.querySelector('.seven-shell-primary-nav'));
      const state=await page.evaluate(()=>{
        const search=document.querySelector('#seven-room-search');
        const modelPanel=document.querySelector('.seven-model-panel');
        const modelHead=document.querySelector('.seven-model-panel-head strong');
        const modelClose=document.querySelector('[data-seven-model-close]');
        const nav=[...document.querySelectorAll('.seven-shell-primary-nav .seven-shell-nav-btn')].map(x=>({text:x.textContent.trim(),aria:x.getAttribute('aria-label')||''}));
        return{
          searchPlaceholder:search?.placeholder,
          searchAria:search?.getAttribute('aria-label'),
          modelAria:modelPanel?.getAttribute('aria-label'),
          modelHead:modelHead?.textContent.trim(),
          modelClose:modelClose?.getAttribute('aria-label'),
          nav,
          doc:document.documentElement.scrollWidth<=innerWidth+2
        };
      });
      assert.equal(state.searchPlaceholder,'بحث المحادثات');
      assert.equal(state.searchAria,'بحث المحادثات');
      await page.evaluate(()=>{SevenRemake.update();SevenUiPolish.sync();SevenRemake.update();});
      assert.deepEqual(await page.evaluate(()=>({placeholder:document.querySelector('#seven-room-search').placeholder,aria:document.querySelector('#seven-room-search').getAttribute('aria-label')})),{placeholder:'بحث المحادثات',aria:'بحث المحادثات'});
      assert.equal(state.modelAria,'اختيار النموذج');
      assert.equal(state.modelHead,'النماذج');
      assert.equal(state.modelClose,'إغلاق قائمة النماذج');
      assert.ok(state.nav.some(x=>x.text.includes('محادثة جديدة')));
      assert.ok(state.nav.some(x=>x.text.includes('تطوير ذاتي')&&x.aria.includes('GitHub')));
      assert.equal(state.doc,true);
      await page.close();
    });
    await test('settings expose no manual credential entry points',async()=>{
      const page=await browser.newPage({viewport:{width:390,height:844}});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&document.getElementById('settingsModal'));
      const state=await page.evaluate(()=>{openSettings();const root=document.getElementById('settingsModal');const credentialInputs=[...root.querySelectorAll('input')].filter(x=>x.type==='password'||/api.?key|credential|access.?token|auth.?token|llm7.?token|gateway.?key|brave.?key/i.test((x.id||'')+' '+(x.name||'')+' '+(x.placeholder||'')));return{count:credentialInputs.length,text:root.innerText,automatic:!!document.getElementById('automaticProviderCard')}}); 
      assert.equal(state.count,0);
      assert.equal(state.automatic,true);
      assert.equal(/paste\s+(an?\s+)?api\s*key|enter\s+(an?\s+)?api\s*key|أدخل\s+.*مفتاح/i.test(state.text),false);
      await page.close();
    });
    await test('long-chat jump control is themed localized and rooted correctly',async()=>{
      const page=await browser.newPage({viewport:{width:360,height:800}});
      await page.addInitScript(()=>{localStorage.setItem('seven_ui_language','ar');localStorage.setItem('user_name_asked','1');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&!!document.querySelector('.seven-shell-jump'));
      await page.evaluate(()=>{
        const chat=document.getElementById('chat');
        chat.innerHTML=Array.from({length:32},(_,i)=>'<div class="message assistant"><div class="bubble"><p>رسالة طويلة '+i+' '.repeat(12)+'</p><p>'+('نص '.repeat(40))+'</p></div></div>').join('');
        chat.scrollTop=0;
        chat.dispatchEvent(new Event('scroll'));
      });
      await page.waitForFunction(()=>document.querySelector('.seven-shell-jump')?.classList.contains('show'));
      const state=await page.evaluate(()=>{
        const b=document.querySelector('.seven-shell-jump'),r=b.getBoundingClientRect(),cs=getComputedStyle(b);
        return{parent:b.parentElement?.id,aria:b.getAttribute('aria-label'),bg:cs.backgroundColor,border:cs.borderStyle,bounded:r.left>=-2&&r.right<=innerWidth+2&&r.top>=-2&&r.bottom<=innerHeight+2};
      });
      assert.equal(state.parent,'seven-app');assert.equal(state.aria,'الانتقال إلى أحدث رسالة');assert.notEqual(state.bg,'rgba(0, 0, 0, 0)');assert.equal(state.border,'solid');assert.equal(state.bounded,true);
      await page.close();
    });
    await test('attachment menu is localized themed and bounded on mobile',async()=>{
      const page=await browser.newPage({viewport:{width:320,height:800}});
      await page.addInitScript(()=>{localStorage.setItem('seven_ui_language','ar');localStorage.setItem('user_name_asked','1');});
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.SevenRemake&&window.SevenTheme&&window.SevenAttachmentLoader);
      await page.evaluate(async()=>{SevenTheme.setPreference('night');await SevenAttachmentLoader.load();});
      await page.waitForFunction(()=>window.SevenAttachments&&!!document.querySelector('[data-seven-attach-trigger]'));
      await page.click('[data-seven-attach-trigger]');
      await page.waitForFunction(()=>{const m=document.querySelector('.seven-attach-menu');return m&&!m.hidden});
      const state=await page.evaluate(()=>{
        const m=document.querySelector('.seven-attach-menu'),r=m.getBoundingClientRect(),cs=getComputedStyle(m),composer=document.querySelector('.composer');
        composer.classList.add('seven-drag-active');
        const pseudo=getComputedStyle(composer,'::before').content;
        composer.classList.remove('seven-drag-active');
        return{
          parentInsideSeven:document.getElementById('seven-app').contains(m),
          bounded:r.left>=-2&&r.right<=innerWidth+2&&r.top>=-2&&r.bottom<=innerHeight+2,
          bg:cs.backgroundColor,border:cs.borderStyle,
          photos:m.querySelector('[data-seven-attach="photos"] strong')?.textContent.trim(),
          files:m.querySelector('[data-seven-attach="files"] strong')?.textContent.trim(),
          aria:document.querySelector('[data-seven-attach-trigger]')?.getAttribute('aria-label'),
          pseudo
        };
      });
      assert.equal(state.parentInsideSeven,true);assert.equal(state.bounded,true);assert.notEqual(state.bg,'rgba(0, 0, 0, 0)');assert.equal(state.border,'solid');
      assert.equal(state.photos,'الصور');assert.equal(state.files,'الملفات');assert.equal(state.aria,'إرفاق صور أو ملفات');assert.match(state.pseudo,/أفلت الملفات/);
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
