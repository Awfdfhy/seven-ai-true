const {chromium}=require('playwright');
const fs=require('fs');
const http=require('http');
const assert=require('assert/strict');
const {build,OUTPUT,MARK}=require('./build-release.cjs');

(async()=>{
  const built=build();
  const html=fs.readFileSync(OUTPUT,'utf8');
  assert.ok(html.includes(MARK));
  assert.ok(built.bytes-built.sourceBytes<100000,'release layer unexpectedly heavy');

  const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html)});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true});
  const results=[];
  async function test(name,fn){await fn();results.push({name,status:'PASS'});console.log('PASS',name)}
  try{
    const context=await browser.newContext({viewport:{width:390,height:844}});
    await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(100);
    if(errors.length)throw new Error('release bootstrap pageerror: '+errors.join(' | '));
    await page.waitForFunction(()=>window.SevenPerformance&&window.SevenPerformance.state.ready&&window.SevenCanon&&window.SevenMotion&&window.SevenMotion.state.ready,null,{timeout:10000});
    await page.waitForFunction(()=>window.roomPersistence&&roomPersistence.status().ready,null,{timeout:10000});

    await test('release runtime boots without page errors',async()=>{assert.deepEqual(errors,[])});
    await test('adaptive performance tier is installed',async()=>{const r=await page.evaluate(()=>({tier:SevenPerformance.state.tier,attr:document.documentElement.dataset.sevenPerformance,ready:SevenPerformance.state.ready}));assert.ok(['lite','balanced','full'].includes(r.tier));assert.equal(r.attr,r.tier);assert.equal(r.ready,true)});
    await test('motion layer is event delegated and ready',async()=>{assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('seven-motion-ready')),true)});
    await test('mobile layout has no document horizontal overflow',async()=>{const r=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,w:document.documentElement.clientWidth,composer:!!document.querySelector('.composer')}));assert.equal(r.composer,true);assert.ok(r.sw<=r.w+2,JSON.stringify(r))});
    await test('offscreen message rendering optimization is active',async()=>{const v=await page.evaluate(()=>{const n=document.createElement('div');n.className='message';n.textContent='probe';document.getElementById('chat').appendChild(n);const s=getComputedStyle(n);const out={visibility:s.contentVisibility,contain:s.contain};n.remove();return out});assert.equal(v.visibility,'auto');assert.ok(v.contain.includes('layout'))});
    await test('canon runtime branches instead of forcing rigid canon',async()=>{const r=await page.evaluate(()=>{const e=SevenCanon.createEngine({id:'probe',sources:[{id:'s',authority:'A0'}],anchors:[{id:'a',strength:'rigid'}],facts:[],events:[],entities:[],invariants:[]});const s=e.createSession({position:1});return e.applySceneDelta(s,{invalidatesAnchors:['a']},{id:'x'}).session.branchOrigin.reason});assert.equal(r,'rigid-anchor-invalidated')});
    await context.close();

    const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
    await reduced.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const rp=await reduced.newPage();const reducedErrors=[];rp.on('pageerror',e=>reducedErrors.push(e.message));
    await rp.goto(origin,{waitUntil:'domcontentloaded'});await rp.waitForTimeout(100);if(reducedErrors.length)throw new Error('reduced-motion pageerror: '+reducedErrors.join(' | '));
    await rp.waitForFunction(()=>window.SevenPerformance&&SevenPerformance.state.ready,null,{timeout:10000});
    await test('reduced motion forces lightweight motion tier',async()=>{const r=await rp.evaluate(()=>({reduced:SevenPerformance.state.reducedMotion,tier:SevenPerformance.state.tier,attr:document.documentElement.dataset.sevenReducedMotion}));assert.equal(r.reduced,true);assert.equal(r.tier,'lite');assert.equal(r.attr,'1')});
    await reduced.close();
  } finally {
    await browser.close();server.close();
  }
  fs.writeFileSync(require('path').join(__dirname,'release-results.json'),JSON.stringify({results,build:built},null,2));
  console.log('release verification: PASS ('+results.length+' checks)');
})().catch(e=>{console.error(e);process.exit(1)});
