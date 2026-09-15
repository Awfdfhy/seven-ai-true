"use strict";
const {chromium}=require("playwright");
const http=require("http");
const fs=require("fs");
const path=require("path");
const assert=require("assert/strict");
const {build}=require("./build-release.cjs");

(async()=>{
  const built=build(),html=fs.readFileSync(built.output,"utf8"),dist=path.dirname(built.output);
  const server=http.createServer((req,res)=>{
    const p=new URL(req.url,"http://x").pathname;
    if(p!=="/"&&p!=="/index.html"){
      const f=path.resolve(dist,"."+p);
      if(!f.startsWith(path.resolve(dist)+path.sep)||!fs.existsSync(f)){res.statusCode=404;return res.end()}
      res.setHeader("Content-Type",f.endsWith(".js")?"text/javascript":f.endsWith(".css")?"text/css":"application/octet-stream");
      return fs.createReadStream(f).pipe(res);
    }
    res.setHeader("Content-Type","text/html");res.end(html);
  });
  await new Promise(r=>server.listen(0,"127.0.0.1",r));
  const origin=`http://127.0.0.1:${server.address().port}`,b=await chromium.launch({headless:true});
  let n=0;const ok=(v,m)=>{assert.ok(v,m);n++},eq=(a,x,m)=>{assert.equal(a,x,m);n++};
  try{
    const c=await b.newContext({viewport:{width:390,height:844}});
    await c.addInitScript(()=>localStorage.setItem("user_name_asked","1"));
    await c.route("**/*",x=>x.request().url().startsWith(origin)?x.continue():x.abort());
    const p=await c.newPage();await p.goto(origin,{waitUntil:"domcontentloaded"});
    await p.waitForFunction(()=>window.SevenMotion?.VERSION==='2.0.0'&&window.SevenPerformance?.state?.ready&&document.documentElement.classList.contains('seven-motion-ready'));
    ok(await p.evaluate(()=>document.documentElement.classList.contains('seven-motion-ready')));
    await p.evaluate(()=>SevenPerformance.applyTier('full'));

    const send=p.locator('.input-area button.send');
    await send.dispatchEvent('pointerdown');
    await p.waitForFunction(()=>document.querySelector('.input-area button.send')?.classList.contains('seven-pressing'));
    ok(await send.evaluate(x=>x.classList.contains('seven-pressing')));
    await send.dispatchEvent('pointerup');
    await p.waitForFunction(()=>!document.querySelector('.input-area button.send')?.classList.contains('seven-pressing'));
    eq(await send.evaluate(x=>x.classList.contains('seven-pressing')),false);

    await p.evaluate(()=>{
      window.__sevenRevealSeen=false;
      const c=document.getElementById('chat'),m=document.createElement('div');m.id='motion-probe';m.className='message';m.textContent='motion probe';
      const obs=new MutationObserver(()=>{if(m.classList.contains('seven-reveal'))window.__sevenRevealSeen=true});
      obs.observe(m,{attributes:true,attributeFilter:['class']});c.appendChild(m);
    });
    await p.waitForFunction(()=>document.getElementById('motion-probe')?.dataset.sevenRevealed==='1');
    eq(await p.evaluate(()=>document.getElementById('motion-probe').dataset.sevenRevealed),'1');
    ok(await p.evaluate(()=>window.__sevenRevealSeen===true),'reveal animation class must be observed at least once');

    await p.evaluate(()=>{
      window.__sevenThemeShiftSeen=false;
      const obs=new MutationObserver(()=>{if(document.body.classList.contains('seven-theme-shift'))window.__sevenThemeShiftSeen=true});
      obs.observe(document.body,{attributes:true,attributeFilter:['class']});
      document.documentElement.dataset.sevenTheme=document.documentElement.dataset.sevenTheme==='day'?'night':'day';
    });
    await p.waitForFunction(()=>window.__sevenThemeShiftSeen===true);
    ok(await p.evaluate(()=>window.__sevenThemeShiftSeen===true));

    await p.evaluate(()=>{
      let x=document.querySelector('.seven-workspace-root');if(!x){x=document.createElement('section');x.className='seven-workspace-root';document.body.appendChild(x)}
      document.dispatchEvent(new CustomEvent('seven:workspacechange',{detail:{workspace:'research'}}));
    });
    await p.waitForFunction(()=>document.querySelector('.seven-workspace-root')?.dataset.sevenRevealed==='1');
    ok(await p.evaluate(()=>document.querySelector('.seven-workspace-root').dataset.sevenRevealed==='1'));

    await p.evaluate(()=>{
      SevenPerformance.applyTier('lite');document.body.classList.remove('seven-theme-shift');
      const m=document.createElement('div');m.id='lite-motion-probe';m.className='message';document.getElementById('chat').appendChild(m);
      document.documentElement.dataset.sevenTheme=document.documentElement.dataset.sevenTheme==='day'?'night':'day';
    });
    await p.waitForFunction(()=>document.getElementById('lite-motion-probe')?.dataset.sevenRevealed==='1');
    const lite=await p.evaluate(()=>({
      marked:document.getElementById('lite-motion-probe').dataset.sevenRevealed,
      classed:document.getElementById('lite-motion-probe').classList.contains('seven-reveal'),
      theme:document.body.classList.contains('seven-theme-shift'),
      allowAmbient:SevenMotion.allow('ambient'),allowFeedback:SevenMotion.allow('feedback')
    }));
    eq(lite.marked,'1');eq(lite.classed,false);eq(lite.theme,false);eq(lite.allowAmbient,false);eq(lite.allowFeedback,true);
    await send.dispatchEvent('pointerdown');await p.waitForFunction(()=>document.querySelector('.input-area button.send')?.classList.contains('seven-pressing'));ok(await send.evaluate(x=>x.classList.contains('seven-pressing')));await send.dispatchEvent('pointerup');

    await p.evaluate(()=>SevenMotion.stop());
    eq(await p.evaluate(()=>SevenMotion.state.ready),false);eq(await p.evaluate(()=>SevenMotion.state.observers.length),0);eq(await p.evaluate(()=>SevenMotion.state.timers.size),0);
    await p.evaluate(()=>SevenMotion.boot());await p.waitForFunction(()=>SevenMotion.state.ready);ok(await p.evaluate(()=>SevenMotion.state.ready));
    await c.close();

    const rc=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    await rc.addInitScript(()=>localStorage.setItem('user_name_asked','1'));await rc.route('**/*',x=>x.request().url().startsWith(origin)?x.continue():x.abort());
    const rp=await rc.newPage();await rp.goto(origin,{waitUntil:'domcontentloaded'});await rp.waitForFunction(()=>window.SevenMotion&&window.SevenPerformance?.state?.ready);
    eq(await rp.evaluate(()=>SevenMotion.allow('feedback')),false);
    const rs=rp.locator('.input-area button.send');await rs.dispatchEvent('pointerdown');eq(await rs.evaluate(x=>x.classList.contains('seven-pressing')),false);
    await rp.evaluate(()=>{const m=document.createElement('div');m.className='message';m.id='reduce-probe';document.getElementById('chat').appendChild(m);document.documentElement.dataset.sevenTheme=document.documentElement.dataset.sevenTheme==='day'?'night':'day'});
    await rp.waitForFunction(()=>document.getElementById('reduce-probe')?.dataset.sevenRevealed==='1');
    const rr=await rp.evaluate(()=>{const m=document.getElementById('reduce-probe');return{marked:m.dataset.sevenRevealed,classed:m.classList.contains('seven-reveal'),theme:document.body.classList.contains('seven-theme-shift')}});
    eq(rr.marked,'1');eq(rr.classed,false);eq(rr.theme,false);await rc.close();
    console.log(`Motion Browser: PASS (${n} assertions; semantic feedback, lite/reduced governance, transient motion observed race-free, cleanup)`);
  }finally{await b.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exit(1)});
