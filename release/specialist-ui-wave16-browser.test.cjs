"use strict";
const {chromium}=require("playwright"),http=require("http"),fs=require("fs"),path=require("path"),assert=require("assert/strict"),{build}=require("./build-release.cjs");
(async()=>{
  const built=build(),html=fs.readFileSync(built.output,"utf8"),dist=path.dirname(built.output);
  assert.equal(built.workspaceLoadMode,"lazy-local");
  const server=http.createServer((req,res)=>{
    const p=new URL(req.url,"http://127.0.0.1").pathname;
    if(p!=="/"&&p!=="/index.html"){
      const f=path.resolve(dist,"."+p);
      if(!f.startsWith(path.resolve(dist)+path.sep)||!fs.existsSync(f)){res.statusCode=404;return res.end("not found")}
      res.setHeader("Content-Type",f.endsWith(".js")||f.endsWith(".mjs")?"text/javascript; charset=utf-8":f.endsWith(".css")?"text/css; charset=utf-8":"application/octet-stream");
      return fs.createReadStream(f).pipe(res);
    }
    res.setHeader("Content-Type","text/html; charset=utf-8");res.end(html);
  });
  await new Promise(r=>server.listen(0,"127.0.0.1",r));
  const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({headless:true});
  let n=0;const ok=(v,m)=>{assert.ok(v,m);n++},eq=(a,b,m)=>{assert.equal(a,b,m);n++};
  async function fresh(opts={}){
    const c=await browser.newContext({viewport:{width:390,height:844},...opts});
    await c.addInitScript(()=>localStorage.setItem("user_name_asked","1"));
    await c.route("**/*",x=>x.request().url().startsWith(origin)?x.continue():x.abort());
    const p=await c.newPage(),errors=[],traffic=[];
    p.on("pageerror",e=>errors.push(e.message));
    p.on("request",x=>{if(x.url().includes("/workspaces/"))traffic.push(x.url())});
    await p.goto(origin,{waitUntil:"domcontentloaded"});
    await p.waitForFunction(()=>window.SevenBetaUI?.state.ready);
    return{c,p,errors,traffic};
  }
  async function openWorkspace(p,kind){
    await p.click(".seven-beta-status");
    await p.waitForFunction(()=>window.SevenWorkspaces&&document.querySelector('.seven-ws-launcher'));
    await p.click(`[data-ws="${kind}"]`);
    await p.waitForFunction(k=>window.SevenWorkspaces?.active()===k,kind);
  }
  async function mobileRtl(p){
    for(const width of [360,390,720]){
      await p.setViewportSize({width,height:820});
      const v=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
      ok(v.sw<=v.cw+2,`${width}:${JSON.stringify(v)}`);
    }
    await p.evaluate(()=>document.documentElement.dir="rtl");await p.setViewportSize({width:360,height:820});
    const r=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,dir:getComputedStyle(document.querySelector('.seven-workspace-root')).direction}));
    ok(r.sw<=r.cw+2,JSON.stringify(r));eq(r.dir,"rtl");
  }
  try{
    {
      const {c,p,errors,traffic}=await fresh();
      eq(await p.evaluate(()=>!!window.SevenWorkspaces),false);eq(traffic.length,0);
      await openWorkspace(p,"coding");
      ok(traffic.some(x=>x.endsWith("/workspaces/coding.js")));ok(!traffic.some(x=>x.endsWith("/workspaces/research.js")||x.endsWith("/workspaces/rpg.js")));
      eq(await p.evaluate(()=>document.documentElement.dataset.sevenWorkspace),"coding");
      eq(await p.textContent(".seven-ws-head h1"),"Coding Agent");
      ok(/Direct device file writes|truth boundary/i.test(await p.textContent("[data-code-notice]")));
      const mapped=await p.evaluate(()=>SevenCodingWorkspace.bindProject([{path:"src/a.js",content:"export const a=1;"},{path:"src/b.js",content:"export const b=2;"}]));
      eq(mapped.files.length,2);eq(await p.locator("[data-code-files] .seven-ws-row").count(),2);ok((await p.textContent("[data-code-preview]")).includes("export const a=1"));
      await p.evaluate(()=>{window.__wave16Coding=[];window.sendMessage=async()=>{__wave16Coding.push(document.getElementById('userInput').value);const m=document.createElement('div');m.className='message assistant';m.innerHTML='<div class="bubble">verified coding response</div>';document.getElementById('chat').appendChild(m)}});
      await p.fill("[data-code-task]","inspect this project and explain the bug");await p.click("[data-code-run]");
      await p.waitForFunction(()=>window.__wave16Coding.length===1);eq((await p.evaluate(()=>__wave16Coding))[0],"inspect this project and explain the bug");
      await p.waitForFunction(()=>document.querySelector('[data-code-output]').textContent.includes('verified coding response'));ok((await p.textContent("[data-code-output]")).includes("verified coding response"));
      await mobileRtl(p);eq(errors.length,0,errors.join("\n"));await p.evaluate(()=>SevenWorkspaces.close());eq(await p.evaluate(()=>SevenWorkspaces.active()),"chat");
      await c.close();
    }
    {
      const {c,p,errors,traffic}=await fresh();await openWorkspace(p,"research");
      ok(traffic.some(x=>x.endsWith("/workspaces/research.js")));ok(!traffic.some(x=>x.endsWith("/workspaces/coding.js")||x.endsWith("/workspaces/rpg.js")));
      const out=await p.evaluate(()=>SevenResearchWorkspace.loadBundle({claims:[{id:"c1",text:"supported",minIndependentSupport:1},{id:"c2",text:"missing"}],sources:[{id:"s1",title:"Source",url:"https://example.test/s",updatedAt:"2026-09-15T00:00:00Z",clusterId:"official",evidence:[{id:"e1",claimId:"c1",stance:"support",locator:"L1-L2"}]}],options:{now:"2026-09-16T00:00:00Z"}}));
      eq(out.analysis.status,"INCONCLUSIVE");const summary=await p.evaluate(()=>SevenResearchWorkspace.summary());eq(summary.claims,2);eq(summary.sources,1);eq(summary.gaps,1);eq(await p.locator("[data-research-citations] .seven-ws-source").count(),1);
      ok(/Truth boundary|not auto-promoted/i.test(await p.textContent("[data-research-notice]")));
      await p.evaluate(()=>{window.__wave16Research=[];window.sendMessage=async()=>{__wave16Research.push(document.getElementById('userInput').value);const m=document.createElement('div');m.className='message assistant';m.innerHTML='<div class="bubble">provisional research result</div>';document.getElementById('chat').appendChild(m)}});
      await p.fill("[data-research-task]","find current evidence");await p.click("[data-research-run]");await p.waitForFunction(()=>window.__wave16Research.length===1);eq((await p.evaluate(()=>__wave16Research))[0],"find current evidence");
      await p.waitForFunction(()=>document.querySelector('[data-research-output]').textContent.includes('provisional research result'));ok((await p.textContent("[data-research-output]")).includes("provisional research result"));
      await p.click("[data-research-clear]");eq((await p.evaluate(()=>SevenResearchWorkspace.summary())).status,"EMPTY");
      await mobileRtl(p);eq(errors.length,0,errors.join("\n"));await c.close();
    }
    {
      const {c,p,errors,traffic}=await fresh();await openWorkspace(p,"rpg");
      ok(traffic.some(x=>x.endsWith("/workspaces/rpg.js")));ok(traffic.some(x=>x.endsWith("/workspaces/canon-simulator.js")));ok(traffic.some(x=>x.endsWith("/workspaces/world-runtime.js")));ok(!traffic.some(x=>x.endsWith("/workspaces/coding.js")||x.endsWith("/workspaces/research.js")));
      const surface=await p.evaluate(()=>({bar:!!document.querySelector('.seven-rpg-chatbar'),chatHidden:document.getElementById('chat')?.hidden,inputHidden:document.querySelector('.input-area')?.hidden,rootHidden:document.querySelector('.seven-workspace-root')?.hidden}));
      ok(surface.bar&&surface.chatHidden===false&&surface.inputHidden===false&&surface.rootHidden===true,JSON.stringify(surface));
      const before=await p.evaluate(()=>SevenRpgWorkspace.snapshot());eq(before.work,null);eq(before.canonPack,null);
      const blocked=await p.evaluate(()=>({beat:SevenRpgWorkspace.commitVerifiedBeat({verified:false}),canon:SevenRpgWorkspace.applyVerifiedDelta({}, {verified:false})}));
      eq(blocked.beat.reason,"verification-required");eq(blocked.canon.reason,"verification-required");
      await p.click("[data-rpg-title-toggle]");await p.click("[data-title-record]");ok(/Load a Real Works pack/i.test(await p.textContent("[data-rpg-notice]")));
      const autoBlocked=await p.evaluate(()=>SevenRpgWorkspace.autoTitle({kind:'episode',name:'Too early',boundary:false,confidence:1}));eq(autoBlocked.reason,'not-a-story-boundary');
      const after=await p.evaluate(()=>SevenRpgWorkspace.snapshot());eq(after.work,null);eq(after.canonPack,null);
      await mobileRtl(p);eq(errors.length,0,errors.join("\n"));await c.close();
    }
    {
      const {c,p}=await fresh({reducedMotion:"reduce"});await p.click(".seven-beta-status");await p.waitForFunction(()=>window.SevenWorkspaces&&document.querySelector('[data-ws="coding"]'));
      for(const kind of ["coding","research","rpg"]){const dur=await p.evaluate(k=>getComputedStyle(document.querySelector(`[data-ws="${k}"]`)).transitionDuration,kind);ok(dur==="0s"||parseFloat(dur)<=.001,`${kind}:${dur}`)}
      await c.close();
    }
    console.log(`Wave 16 Specialist Workspaces Browser: PASS (${n} assertions; Coding + Research + chat-first RPG interaction, lazy isolation, truth boundaries, mobile/RTL/reduced-motion)`);
  }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exit(1)});