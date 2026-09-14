const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),http=require('http');
const {build}=require('./build-release.cjs');
(async()=>{
  const built=build(),dist=path.dirname(built.output),html=fs.readFileSync(built.output,'utf8');
  const out=path.join(dist,'screenshots');fs.mkdirSync(out,{recursive:true});
  const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://127.0.0.1').pathname;if(pathname!=='/'&&pathname!=='/index.html'){const file=path.resolve(dist,'.'+pathname);if(!file.startsWith(path.resolve(dist)+path.sep)||!fs.existsSync(file)){res.statusCode=404;return res.end('not found')}res.setHeader('Content-Type',file.endsWith('.js')||file.endsWith('.mjs')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'application/octet-stream');return fs.createReadStream(file).pipe(res)}res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html)});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true});
  try{
    const c=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
    await c.addInitScript(()=>{localStorage.setItem('user_name_asked','1');localStorage.setItem('user_name','Tester');localStorage.setItem('user-name','Tester');localStorage.setItem('theme','night')});
    const p=await c.newPage();await p.goto(origin,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.SevenBetaUI?.state.ready&&window.SevenAurora&&window.SevenTheme);
    await p.screenshot({path:path.join(out,'01-chat-night.png'),fullPage:false});
    await p.evaluate(()=>SevenTheme.setPreference('day'));await p.screenshot({path:path.join(out,'02-chat-day.png'),fullPage:false});
    await p.evaluate(()=>{SevenTheme.setPreference('night');SevenAurora.set('thinking','medium')});await p.screenshot({path:path.join(out,'03-aurora-thinking.png'),fullPage:false});
    await p.click('.seven-beta-status');await p.waitForFunction(()=>window.SevenWorkspaces&&document.querySelector('.seven-ws-launcher'));await p.screenshot({path:path.join(out,'04-workspace-launcher.png'),fullPage:false});
    await p.click('[data-ws="coding"]');await p.waitForFunction(()=>window.SevenCodingWorkspace&&SevenWorkspaces.active()==='coding');await p.evaluate(()=>SevenCodingWorkspace.bindProject([{path:'src/main.js',content:"export function greet(name){\n  return `Hello ${name}`;\n}\n"},{path:'README.md',content:'# Seven Demo\nVerified local project context.'}]));await p.screenshot({path:path.join(out,'05-coding-agent.png'),fullPage:false});
    await p.evaluate(()=>SevenWorkspaces.openLauncher());await p.click('[data-ws="rpg"]');await p.waitForFunction(()=>window.SevenRpgWorkspace&&SevenWorkspaces.active()==='rpg');
    await p.evaluate(()=>{SevenRpgWorkspace.loadWork({id:'demo-series',title:'Demo Series',continuity:'anime',sources:[{id:'official-ep1',title:'Official Episode 1',authority:'A0'}],beats:[{id:'ep1-start',sourceRefs:['official-ep1'],anchors:['first-meeting'],requiredFacts:['hero-arrives'],forbiddenChanges:['rewrite-origin']}],titleRules:{episode:'Case'}});SevenRpgWorkspace.loadCanon({id:'demo-work',version:'1.0.0',defaultContinuity:'anime',continuities:[{id:'anime'}],sources:[{id:'official',authority:'A0'}],entities:[{id:'hero'}],facts:[{id:'arrival',availableAt:1,sources:['official']}],anchors:[{id:'meeting',strength:'strong',continuity:'anime'}],invariants:[]},{continuity:'anime',position:1})});
    await p.screenshot({path:path.join(out,'06-rpg-real-works.png'),fullPage:false});
    await c.close();
    console.log('UI screenshots: PASS ('+fs.readdirSync(out).length+' files)');
  }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exit(1)});
