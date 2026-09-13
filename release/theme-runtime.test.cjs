const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {build}=require('./build-release.cjs');
(async()=>{
 const built=build(),html=fs.readFileSync(built.output,'utf8'),dist=path.dirname(built.output);
 assert.ok(html.includes('id="seven-theme-boot"'),'theme boot missing');
 assert.ok(html.indexOf('id="seven-theme-boot"')<html.indexOf('id="seven-beta-ui-style"'),'theme boot must precede beta CSS');
 const server=http.createServer((req,res)=>{const p=new URL(req.url,'http://127.0.0.1').pathname;if(p.startsWith('/vendor/')){const f=path.resolve(dist,'.'+p);if(!f.startsWith(path.resolve(dist)+path.sep)||!fs.existsSync(f)){res.statusCode=404;return res.end('not found')}return fs.createReadStream(f).pipe(res)}res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html)});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true});
 try{
  const c=await browser.newContext({viewport:{width:390,height:844}});await c.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());const p=await c.newPage();await p.goto(origin,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.SevenTheme&&window.SevenBetaUI?.state.ready);
  const auto=await p.evaluate(()=>({pref:SevenTheme.getPreference(),theme:SevenTheme.getResolvedTheme(),root:document.documentElement.dataset.sevenTheme,h:(new Date).getHours(),ctl:document.querySelector('[data-seven-theme-control]')?.dataset.sevenThemeState}));
  assert.equal(auto.pref,'auto');assert.equal(auto.theme,auto.h>=6&&auto.h<18?'day':'night');assert.equal(auto.root,auto.theme);assert.ok(auto.ctl.startsWith('Auto'));
  const day=await p.evaluate(()=>{SevenTheme.setPreference('day');return{pref:SevenTheme.getPreference(),root:document.documentElement.dataset.sevenTheme,light:document.body.classList.contains('light'),stored:localStorage.getItem('theme'),meta:document.querySelector('meta[name="theme-color"]').content,main:getComputedStyle(document.querySelector('.main')).backgroundImage,ctl:document.querySelector('[data-seven-theme-control]').dataset.sevenThemeState}});
  assert.deepEqual([day.pref,day.root,day.light,day.stored,day.ctl],['day','day',true,'day','Day']);assert.ok(day.meta.includes('f7f6fb'));
  await p.reload({waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.SevenTheme&&window.SevenBetaUI?.state.ready);assert.deepEqual(await p.evaluate(()=>[SevenTheme.getPreference(),document.documentElement.dataset.sevenTheme,document.body.classList.contains('light')]),['day','day',true]);
  const night=await p.evaluate(()=>{SevenTheme.setPreference('night');return{pref:SevenTheme.getPreference(),root:document.documentElement.dataset.sevenTheme,light:document.body.classList.contains('light'),stored:localStorage.getItem('theme'),meta:document.querySelector('meta[name="theme-color"]').content,main:getComputedStyle(document.querySelector('.main')).backgroundImage,ctl:document.querySelector('[data-seven-theme-control]').dataset.sevenThemeState}});
  assert.deepEqual([night.pref,night.root,night.light,night.stored,night.ctl],['night','night',false,'night','Night']);assert.ok(night.meta.includes('0f0d1d'));assert.notEqual(day.main,night.main,'day and night must be visually distinct');
  assert.deepEqual(await p.evaluate(()=>{SevenTheme.setPreference('auto');const a=SevenTheme.getPreference();toggleTheme();const b=SevenTheme.getPreference();toggleTheme();const c=SevenTheme.getPreference();toggleTheme();return[a,b,c,SevenTheme.getPreference()]}),['auto','day','night','auto']);await c.close();
  const legacy=await browser.newContext();await legacy.addInitScript(()=>localStorage.setItem('theme','light'));await legacy.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());const lp=await legacy.newPage();await lp.goto(origin,{waitUntil:'domcontentloaded'});await lp.waitForFunction(()=>window.SevenTheme&&window.SevenBetaUI?.state.ready);assert.deepEqual(await lp.evaluate(()=>[SevenTheme.getPreference(),document.documentElement.dataset.sevenTheme,document.body.classList.contains('light')]),['day','day',true]);await legacy.close();
  console.log('adaptive theme browser tests: PASS');
 }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exit(1)});
