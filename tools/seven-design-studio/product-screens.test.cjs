const fs=require('fs');
const http=require('http');
const path=require('path');
const vm=require('vm');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'tools/seven-design-studio');
const modulePath=path.join(dir,'seven-product-screens-v1.js');
if(!fs.existsSync(modulePath))throw new Error('Missing seven-product-screens-v1.js');
const src=fs.readFileSync(modulePath,'utf8');
new vm.Script(src,{filename:'seven-product-screens-v1.js'});
for(const token of ['2026.09-product-screens-v1','--seven-product-screens-v1','seven-spaces-v1','seven-context-v1','seven-research-v1','seven-code-v1','seven-world-v1','seven-tools-v1','seven-library-v1','seven-intelligence-v1','seven-evolution-v1','seven-you-v1','prefers-reduced-motion'])if(!src.includes(token))throw new Error(`Product suite contract missing ${token}`);
if(src.includes('backdrop-filter')||src.includes('filter:blur('))throw new Error('Product suite introduced expensive always-on blur');
const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
if(!index.includes('./seven-product-screens-v1.js'))throw new Error('Product suite is not wired');
const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');
if(!sw.includes('./seven-product-screens-v1.js')||!sw.includes('seven-design-studio-v21'))throw new Error('Product suite is not in current Studio cache');

const pages=[
  ['seven-spaces-v1','spaces'],['seven-context-v1','context'],['seven-research-v1','research'],['seven-code-v1','code'],['seven-world-v1','world'],['seven-tools-v1','tools'],['seven-library-v1','library'],['seven-intelligence-v1','intelligence'],['seven-evolution-v1','evolution'],['seven-you-v1','you']
];
const required={spaces:'.svx-space-list',context:'.svx-stack',research:'.svx-evidence-rail',code:'.svx-editor',world:'.svx-world-hero',tools:'.svx-tool-list',library:'.svx-file-list',intelligence:'.svx-route',evolution:'.svx-repair-flow',you:'.svx-settings-group'};
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const raw=decodeURIComponent(req.url.split('?')[0]);
  let target=path.join(root,raw==='/'?'tools/seven-design-studio/index.html':raw.replace(/^\//,''));
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!target.startsWith(root)||!fs.existsSync(target)){res.statusCode=404;return res.end('not found');}
  res.setHeader('content-type',mime[path.extname(target)]||'text/plain');res.end(fs.readFileSync(target));
});

(async()=>{
  await new Promise(r=>server.listen(4182,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:4182/tools/seven-design-studio/index.html',{waitUntil:'networkidle',timeout:45000});
  await page.waitForSelector('.gjs-frame',{timeout:30000});
  await page.waitForFunction(expected=>{
    const ed=window.__sevenDesignEditor;
    return !!ed&&expected.every(id=>!!ed.Pages?.get?.(id));
  },pages.map(x=>x[0]),{timeout:18000});
  const selector=page.locator('#sevenScreenQuick');
  await page.waitForFunction(expected=>{
    const s=document.getElementById('sevenScreenQuick');
    return !!s&&expected.every(name=>Array.from(s.options).some(o=>o.textContent===name));
  },['Spaces','Context','Research','Code','World','Tools','Library','Intelligence','Evolution','You'],{timeout:10000});
  const canvas=page.locator('.gjs-frame').contentFrame();

  for(const [id,screen] of pages){
    await selector.selectOption(id);
    const rootEl=canvas.locator(`[data-seven-product-screen="${screen}"]`);
    await rootEl.waitFor({timeout:6000});
    if((await rootEl.getAttribute('data-seven-product-suite'))!=='2026.09-product-screens-v1')throw new Error(`${screen}: suite marker missing`);
    if(await canvas.locator(required[screen]).count()<1)throw new Error(`${screen}: distinctive surface missing`);
    const g=await rootEl.evaluate(el=>{const d=el.ownerDocument.documentElement;return{sw:d.scrollWidth,cw:d.clientWidth,minH:el.getBoundingClientRect().height};});
    if(g.sw>g.cw+1)throw new Error(`${screen}: visible horizontal overflow at 393px ${g.sw}/${g.cw}`);
    if(g.minH<700)throw new Error(`${screen}: screen does not hold a full mobile canvas: ${g.minH}`);
  }

  await selector.selectOption('seven-tools-v1');
  const primaryTargets=await canvas.locator('.svx-icon,.svx-button,.svx-mini-nav button,.svx-library-action button').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return{w:r.width,h:r.height,display:getComputedStyle(el).display}}).filter(x=>x.display!=='none'&&x.w>0&&x.h>0&&(x.w<48||x.h<48)));
  if(primaryTargets.length)throw new Error(`Product suite has undersized primary touch targets: ${JSON.stringify(primaryTargets.slice(0,5))}`);

  await page.locator('#themeBtn').click();
  for(const id of ['seven-spaces-v1','seven-world-v1','seven-you-v1']){
    await selector.selectOption(id);
    const bg=await canvas.locator('[data-seven-product-suite="2026.09-product-screens-v1"]').evaluate(el=>getComputedStyle(el).backgroundImage);
    if(!bg.includes('gradient'))throw new Error(`${id}: Day mode lost designed background`);
  }
  await page.locator('#themeBtn').click();
  await page.locator('#dirBtn').click();
  await selector.selectOption('seven-code-v1');
  if((await canvas.locator('body').getAttribute('dir'))!=='rtl')throw new Error('Product suite RTL propagation failed');
  if((await canvas.locator('.svx-editor pre').evaluate(el=>getComputedStyle(el).direction))!=='ltr')throw new Error('Code editor must remain LTR under RTL');
  await page.locator('#dirBtn').click();

  await page.locator('#deviceSelect').selectOption('320');
  await page.setViewportSize({width:320,height:760});
  for(const [id,screen] of pages){
    await selector.selectOption(id);
    const g=await canvas.locator(`[data-seven-product-screen="${screen}"]`).evaluate(el=>{const d=el.ownerDocument.documentElement;return{sw:d.scrollWidth,cw:d.clientWidth};});
    if(g.sw>g.cw+1)throw new Error(`${screen}: visible horizontal overflow at 320px ${g.sw}/${g.cw}`);
  }

  await selector.selectOption('seven-spaces-v1');
  await page.locator('#previewBtn').click();
  await page.locator('#previewShell:not([hidden])').waitFor();
  const preview=page.locator('#previewFrame').contentFrame();
  const p=preview.locator('[data-seven-product-screen="spaces"]');
  await p.waitFor({timeout:10000});
  if(await preview.locator('.svx-space-list').count()!==1)throw new Error('Standalone preview lost Spaces surface');
  const pg=await p.evaluate(el=>{const d=el.ownerDocument.documentElement;return{sw:d.scrollWidth,cw:d.clientWidth};});
  if(pg.sw>pg.cw+1)throw new Error(`Standalone Spaces preview overflows: ${pg.sw}/${pg.cw}`);

  if(errors.length)throw new Error(`Browser errors: ${errors.slice(0,6).join(' | ')}`);
  await browser.close();server.close();
  console.log('SEVEN_PRODUCT_SCREENS_V1_PASS');
})().catch(err=>{console.error(err);server.close();process.exit(1);});
