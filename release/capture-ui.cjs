const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),http=require('http'),crypto=require('crypto');
const {build}=require('./build-release.cjs');
const V=require('./visual-evidence-runtime-final.cjs');

function sha256File(file){return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}
async function collectStructure(page,scenario){
  return page.evaluate((scenario)=>{
    const visible=(el,cs,r)=>cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity)!==0&&r.width>0&&r.height>0;
    const nodes=[...document.querySelectorAll('button,a[href],input,textarea,select,[role="button"],[tabindex]')];
    const targets=nodes.map((el,i)=>{const cs=getComputedStyle(el),r=el.getBoundingClientRect(),tag=el.tagName.toLowerCase();return{
      selector:el.id?`#${el.id}`:el.classList.length?`${tag}.${[...el.classList].slice(0,2).join('.')}`:`${tag}:nth(${i})`,
      width:r.width,height:r.height,visible:visible(el,cs,r),disabled:!!el.disabled,
      accessibleName:(el.getAttribute('aria-label')||el.getAttribute('title')||el.getAttribute('placeholder')||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,120),
      focusable:!el.disabled&&(el.tabIndex>=0||['button','a','input','textarea','select'].includes(tag)),interactive:true
    }});
    const presentSelectors=[...new Set([...(scenario.criticalSelectors||[]),...(scenario.expectedSelectors||[])])].filter(s=>!!document.querySelector(s));
    const rootStyle=getComputedStyle(document.documentElement);
    return {scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,scrollHeight:document.documentElement.scrollHeight,clientHeight:document.documentElement.clientHeight,targets,presentSelectors,direction:rootStyle.direction||document.documentElement.dir||'ltr',reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
  },scenario);
}

(async()=>{
  const built=build(),dist=path.dirname(built.output),html=fs.readFileSync(built.output,'utf8');
  const out=path.join(dist,'screenshots');fs.mkdirSync(out,{recursive:true});
  const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://127.0.0.1').pathname;if(pathname!=='/'&&pathname!=='/index.html'){const file=path.resolve(dist,'.'+pathname);if(!file.startsWith(path.resolve(dist)+path.sep)||!fs.existsSync(file)){res.statusCode=404;return res.end('not found')}res.setHeader('Content-Type',file.endsWith('.js')||file.endsWith('.mjs')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'application/octet-stream');return fs.createReadStream(file).pipe(res)}res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html)});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true});
  const scenarios=[],artifacts=[],evidence=[];
  const branch=process.env.GITHUB_REF_NAME||'local';const commitSha=process.env.GITHUB_SHA||'local-capture';
  const environmentIdentity=`host:${process.platform}:${process.arch}:node-${process.versions.node}:chromium-${browser.version()}`;
  async function shot(page,fileName,input){
    const scenario=V.createScenario({viewport:{width:390,height:844},density:1,fontScale:1,captureMethod:'playwright-host',...input});
    const file=path.join(out,fileName);await page.screenshot({path:file,fullPage:false});
    const artifact=V.createArtifact(scenario,{path:'screenshots/'+fileName,sha256:sha256File(file),byteSize:fs.statSync(file).size,width:scenario.viewport.width,height:scenario.viewport.height,captureMethod:'playwright-host',sourceRef:path.basename(built.output)});
    const structural=await collectStructure(page,scenario);
    const audits=[
      V.auditViewport(structural),
      V.auditTouchTargets(structural.targets,{preferredMin:44,hardMin:24}),
      V.auditAccessibility(structural.targets),
      V.auditState(scenario,structural)
    ];
    const ev=V.createEvidence(scenario,artifact,{tier:'HOST',environmentIdentity,commitSha,branch,audits,policy:'OBSERVE',notes:['Wave 12 foundation: structural + screenshot evidence; warnings/failures are preserved rather than auto-approved.']});
    scenarios.push(scenario);artifacts.push(artifact);evidence.push(ev);return ev;
  }
  async function baseContext(extra={}){const c=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,...extra});await c.addInitScript(()=>{localStorage.setItem('user_name_asked','1');localStorage.setItem('user_name','Tester');localStorage.setItem('user-name','Tester');localStorage.setItem('theme','night')});return c}
  try{
    const c=await baseContext();const p=await c.newPage();await p.goto(origin,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.SevenBetaUI?.state.ready&&window.SevenAurora&&window.SevenTheme);
    await shot(p,'01-chat-night.png',{id:'chat-night',surface:'core-chat',journey:'chat-idle',state:'idle',theme:'night',locale:'en',direction:'ltr',criticalSelectors:['#chat','.composer','.seven-beta-status'],expectedSelectors:['#chat','.composer','.seven-beta-status'],tags:['phone','core','night']});
    await p.evaluate(()=>SevenTheme.setPreference('day'));await shot(p,'02-chat-day.png',{id:'chat-day',surface:'core-chat',journey:'chat-idle',state:'idle',theme:'day',locale:'en',direction:'ltr',criticalSelectors:['#chat','.composer','.seven-beta-status'],expectedSelectors:['#chat','.composer','.seven-beta-status'],tags:['phone','core','day']});
    await p.evaluate(()=>{SevenTheme.setPreference('night');SevenAurora.set('thinking','medium')});await shot(p,'03-aurora-thinking.png',{id:'chat-thinking',surface:'core-chat',journey:'reasoning-state',state:'thinking',theme:'night',locale:'en',direction:'ltr',criticalSelectors:['#chat','.composer','.seven-beta-status'],expectedSelectors:['#chat','.composer','.seven-beta-status'],tags:['phone','semantic-state']});
    await p.click('.seven-beta-status');await p.waitForFunction(()=>window.SevenWorkspaces&&document.querySelector('.seven-ws-launcher'));await shot(p,'04-workspace-launcher.png',{id:'workspace-launcher',surface:'workspace-launcher',journey:'open-workspace',state:'launcher',theme:'night',locale:'en',direction:'ltr',criticalSelectors:['.seven-ws-launcher','.seven-beta-status'],expectedSelectors:['.seven-ws-launcher','.seven-ws-picker','.seven-beta-status'],tags:['phone','workspace']});
    await p.click('[data-ws="coding"]');await p.waitForFunction(()=>window.SevenCodingWorkspace&&SevenWorkspaces.active()==='coding');await p.evaluate(()=>SevenCodingWorkspace.bindProject([{path:'src/main.js',content:"export function greet(name){\n  return `Hello ${name}`;\n}\n"},{path:'README.md',content:'# Seven Demo\nVerified local project context.'}]));await shot(p,'05-coding-agent.png',{id:'coding-agent',surface:'coding',journey:'project-bound',state:'ready',theme:'night',locale:'en',direction:'ltr',criticalSelectors:['.seven-beta-status'],expectedSelectors:['.seven-workspace-root','.seven-beta-status'],tags:['phone','specialist','coding']});
    await p.evaluate(()=>SevenWorkspaces.openLauncher());await p.click('[data-ws="rpg"]');await p.waitForFunction(()=>window.SevenRpgWorkspace&&SevenWorkspaces.active()==='rpg');
    await p.evaluate(()=>{SevenRpgWorkspace.loadWork({id:'demo-series',title:'Demo Series',continuity:'anime',sources:[{id:'official-ep1',title:'Official Episode 1',authority:'A0'}],beats:[{id:'ep1-start',sourceRefs:['official-ep1'],anchors:['first-meeting'],requiredFacts:['hero-arrives'],forbiddenChanges:['rewrite-origin']}],titleRules:{episode:'Case'}});SevenRpgWorkspace.loadCanon({id:'demo-work',version:'1.0.0',defaultContinuity:'anime',continuities:[{id:'anime'}],sources:[{id:'official',authority:'A0'}],entities:[{id:'hero'}],facts:[{id:'arrival',availableAt:1,sources:['official']}],anchors:[{id:'meeting',strength:'strong',continuity:'anime'}],invariants:[]},{continuity:'anime',position:1})});
    await shot(p,'06-rpg-real-works.png',{id:'rpg-real-works',surface:'rpg-real-works',journey:'canon-loaded',state:'ready',theme:'night',locale:'en',direction:'ltr',criticalSelectors:['.seven-beta-status'],expectedSelectors:['.seven-workspace-root','.seven-beta-status'],tags:['phone','specialist','rpg']});
    await p.evaluate(()=>{document.documentElement.dir='rtl';document.documentElement.lang='ar'});await shot(p,'07-rpg-rtl-probe.png',{id:'rpg-rtl-probe',surface:'rpg-real-works',journey:'rtl-layout-probe',state:'ready',theme:'night',locale:'ar',direction:'rtl',criticalSelectors:['.seven-beta-status'],expectedSelectors:['.seven-workspace-root','.seven-beta-status'],tags:['phone','rtl','structural-probe']});
    await c.close();

    const reduced=await baseContext({reducedMotion:'reduce'});const rp=await reduced.newPage();await rp.goto(origin,{waitUntil:'domcontentloaded'});await rp.waitForFunction(()=>window.SevenBetaUI?.state.ready&&window.SevenAurora&&window.SevenTheme);await rp.evaluate(()=>SevenAurora.set('coding','high'));
    await shot(rp,'08-chat-reduced-motion.png',{id:'chat-reduced-motion',surface:'core-chat',journey:'reduced-motion',state:'coding',theme:'night',locale:'en',direction:'ltr',reducedMotion:true,criticalSelectors:['#chat','.composer','.seven-beta-status'],expectedSelectors:['#chat','.composer','.seven-beta-status'],tags:['phone','accessibility','reduced-motion']});await reduced.close();

    const manifest=V.createManifest({branch,commitSha,environmentIdentity,mode:'OBSERVE',scenarios,artifacts,evidence});fs.writeFileSync(path.join(out,'visual-evidence.json'),JSON.stringify(manifest,null,2));
    if(!V.verifyManifest(manifest))throw new Error('visual evidence manifest failed self-verification');
    console.log(`UI visual evidence: PASS (${scenarios.length} scenarios; ${manifest.summary.pass} pass, ${manifest.summary.warn} warn, ${manifest.summary.fail} fail; OBSERVE mode)`);
  }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exit(1)});
