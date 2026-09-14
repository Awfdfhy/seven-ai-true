const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {build}=require('./build-release.cjs');
(async()=>{
 const built=build(),html=fs.readFileSync(built.output,'utf8'),dist=path.dirname(built.output);
 const server=http.createServer((req,res)=>{const p=new URL(req.url,'http://127.0.0.1').pathname;if(p.startsWith('/vendor/')){const f=path.resolve(dist,'.'+p);if(!f.startsWith(path.resolve(dist)+path.sep)||!fs.existsSync(f)){res.statusCode=404;return res.end('not found')}return fs.createReadStream(f).pipe(res)}res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html)});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true});
 try{
  const c=await browser.newContext({viewport:{width:390,height:844}});await c.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());const p=await c.newPage();await p.goto(origin,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.SevenUI?.state.ready&&window.SevenTheme&&window.SevenBetaUI?.state.ready);
  const bidi=await p.evaluate(async()=>{const chat=document.getElementById('chat');for(const [role,text] of [['user','مرحبا Seven، explain this بالعربية والإنجليزية'],['assistant','Sure. هذا اختبار mixed direction 123.']]){const n=document.createElement('div');n.className='message '+role;n.innerHTML='<div class="bubble"></div>';n.querySelector('.bubble').textContent=text;chat.appendChild(n)}await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const bubbles=[...chat.querySelectorAll('.message .bubble')].slice(-2);return{dirs:bubbles.map(x=>x.getAttribute('dir')),textarea:document.querySelector('.composer textarea')?.getAttribute('dir'),sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}});
  assert.deepEqual(bidi.dirs,['auto','auto']);assert.equal(bidi.textarea,'auto');assert.ok(bidi.sw<=bidi.cw+2,JSON.stringify(bidi));
  const control=await p.evaluate(()=>{const b=document.querySelector('[data-seven-theme-control]');return{label:b?.getAttribute('aria-label'),state:b?.dataset.sevenThemeState}});assert.ok(/^Theme: /.test(control.label||''));assert.ok(control.state);
  for(const theme of ['day','night']){await p.setViewportSize({width:360,height:780});const r=await p.evaluate(theme=>{SevenTheme.setPreference(theme);return{theme:document.documentElement.dataset.sevenTheme,sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,colorScheme:getComputedStyle(document.documentElement).colorScheme,bottom:getComputedStyle(document.querySelector('.input-area')).paddingBottom}},theme);assert.equal(r.theme,theme);assert.ok(r.sw<=r.cw+2,`${theme}: ${JSON.stringify(r)}`);assert.equal(r.colorScheme,theme==='day'?'light':'dark');assert.ok(parseFloat(r.bottom)>=18,`safe-area baseline lost: ${r.bottom}`)}
  await c.close();console.log('RTL + mobile theme tests: PASS');
 }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exit(1)});
