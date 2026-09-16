const fs=require('fs');
const http=require('http');
const path=require('path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'tools/seven-design-studio');
const requiredFiles=['index.html','sw.js','studio-page-state-sync.js','home-completion-v5.js','home-visual-polish-v4.js','chat-ui-v1.js','seven-product-screens-v1.js'];
for(const file of requiredFiles)if(!fs.existsSync(path.join(dir,file)))throw new Error(`UI V1 closure missing ${file}`);
const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');
for(const token of ['./studio-page-state-sync.js','./home-completion-v5.js','./home-visual-polish-v4.js','./chat-ui-v1.js','./seven-product-screens-v1.js']){
  if(!index.includes(token))throw new Error(`UI V1 index wiring missing ${token}`);
  if(!sw.includes(token))throw new Error(`UI V1 offline shell missing ${token}`);
}
if(!sw.includes('seven-design-studio-v22'))throw new Error('UI V1 closure must run against Studio cache v22');

const screens=[
  ['Home','[data-seven-home-completion="2026.09-home-v5"]'],
  ['Chat','[data-seven-chat-version="2026.09-chat-v1"]'],
  ['Spaces','[data-seven-product-screen="spaces"]'],
  ['Context','[data-seven-product-screen="context"]'],
  ['Research','[data-seven-product-screen="research"]'],
  ['Code','[data-seven-product-screen="code"]'],
  ['World','[data-seven-product-screen="world"]'],
  ['Tools','[data-seven-product-screen="tools"]'],
  ['Library','[data-seven-product-screen="library"]'],
  ['Intelligence','[data-seven-product-screen="intelligence"]'],
  ['Evolution','[data-seven-product-screen="evolution"]'],
  ['You','[data-seven-product-screen="you"]']
];
const widths=[320,360,393,412,480];
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const raw=decodeURIComponent(req.url.split('?')[0]);
  let target=path.join(root,raw==='/'?'tools/seven-design-studio/index.html':raw.replace(/^\//,''));
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!target.startsWith(root)||!fs.existsSync(target)){res.statusCode=404;return res.end('not found');}
  res.setHeader('content-type',mime[path.extname(target)]||'text/plain');res.end(fs.readFileSync(target));
});

(async()=>{
  await new Promise(r=>server.listen(4183,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:4183/tools/seven-design-studio/index.html',{waitUntil:'networkidle',timeout:45000});
  await page.waitForSelector('.gjs-frame',{timeout:30000});
  const selector=page.locator('#sevenScreenQuick');
  await page.waitForFunction(expected=>{
    const s=document.getElementById('sevenScreenQuick');
    if(!s)return false;
    const labels=Array.from(s.options).map(o=>o.textContent.trim());
    return expected.every(label=>labels.includes(label));
  },screens.map(([label])=>label),{timeout:20000});
  const canvas=page.locator('.gjs-frame').contentFrame();

  const selectScreen=async(label,rootSelector)=>{
    await selector.selectOption({label});
    const rootEl=canvas.locator(rootSelector);
    await rootEl.waitFor({timeout:5000});
    return rootEl;
  };
  const assertNoOverflow=async(label,rootSelector,width,variant)=>{
    const rootEl=await selectScreen(label,rootSelector);
    const g=await rootEl.evaluate(el=>{const d=el.ownerDocument.documentElement,r=el.getBoundingClientRect();return{docSW:d.scrollWidth,docCW:d.clientWidth,w:r.width,left:r.left,right:r.right};});
    if(g.docSW>g.docCW+1)throw new Error(`${label} ${variant} overflows at ${width}px: ${JSON.stringify(g)}`);
    if(g.left<-1||g.right>g.docCW+1)throw new Error(`${label} ${variant} root escapes viewport at ${width}px: ${JSON.stringify(g)}`);
  };

  // Full Android width matrix, Night/LTR baseline.
  for(const width of widths){
    await page.locator('#deviceSelect').selectOption(String(width));
    await page.setViewportSize({width,height:900});
    for(const [label,rootSelector] of screens)await assertNoOverflow(label,rootSelector,width,'Night/LTR');
  }

  // Cross-screen Day persistence and geometry at the main phone width.
  await page.locator('#deviceSelect').selectOption('393');
  await page.setViewportSize({width:393,height:852});
  await page.locator('#themeBtn').click();
  await canvas.locator('body.seven-day').waitFor({timeout:3000});
  for(const [label,rootSelector] of screens){
    await assertNoOverflow(label,rootSelector,393,'Day/LTR');
    await canvas.locator('body.seven-day[data-seven-page-state-sync="2026.09-page-state-sync-v2"]').waitFor({timeout:3000});
  }
  await page.locator('#themeBtn').click();
  await canvas.locator('body:not(.seven-day)').waitFor({timeout:3000});

  // Cross-screen RTL persistence. Code surfaces are allowed to remain LTR internally.
  await page.locator('#dirBtn').click();
  for(const [label,rootSelector] of screens){
    await assertNoOverflow(label,rootSelector,393,'Night/RTL');
    await canvas.locator('body.seven-rtl[dir="rtl"][data-seven-page-state-sync="2026.09-page-state-sync-v2"]').waitFor({timeout:3000});
  }
  await selector.selectOption({label:'Code'});
  if((await canvas.locator('.svx-editor pre').evaluate(el=>getComputedStyle(el).direction))!=='ltr')throw new Error('Code lost LTR isolation under global RTL');
  await page.locator('#dirBtn').click();
  await canvas.locator('body[dir="ltr"]:not(.seven-rtl)').waitFor({timeout:3000});

  // Lite must survive screen changes without introducing an additional UI copy.
  for(let i=0;i<4&&(await page.locator('#densityBtn').innerText()).trim().toLowerCase()!=='lite';i++)await page.locator('#densityBtn').click();
  if((await page.locator('#densityBtn').innerText()).trim().toLowerCase()!=='lite')throw new Error('Could not enter Lite performance tier');
  for(const [label,rootSelector] of [['Home',screens[0][1]],['Research',screens[4][1]],['World',screens[6][1]]]){
    await selectScreen(label,rootSelector);
    await canvas.locator('body.seven-lite').waitFor({timeout:3000});
  }

  // Reduced Motion + Large Text are persisted settings and must survive a page transition.
  await page.evaluate(()=>{
    const key='seven-design-studio-settings-v1';
    let s={};try{s=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(_){}
    s.largeText=true;s.reduced=true;localStorage.setItem(key,JSON.stringify(s));
    window.__sevenSyncPageState?.();
  });
  await selectScreen('Chat',screens[1][1]);
  await canvas.locator('body.seven-large.seven-reduced').waitFor({timeout:3000});
  await selectScreen('You',screens[11][1]);
  await canvas.locator('body.seven-large.seven-reduced').waitFor({timeout:3000});

  // Restore persisted test state so standalone preview is evaluated in a normal tier.
  await page.evaluate(()=>{
    const key='seven-design-studio-settings-v1';
    let s={};try{s=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(_){}
    s.largeText=false;s.reduced=false;s.density='balanced';localStorage.setItem(key,JSON.stringify(s));
  });
  // Cycle the live density control back to Balanced, then synchronize canvas state.
  for(let i=0;i<4&&(await page.locator('#densityBtn').innerText()).trim().toLowerCase()!=='balanced';i++)await page.locator('#densityBtn').click();
  await page.evaluate(()=>window.__sevenSyncPageState?.());

  // Integrated standalone-preview smoke on a specialist surface.
  await selector.selectOption({label:'Research'});
  await page.locator('#previewBtn').click();
  await page.locator('#previewShell:not([hidden])').waitFor();
  const preview=page.locator('#previewFrame').contentFrame();
  const pResearch=preview.locator('[data-seven-product-screen="research"]');
  await pResearch.waitFor({timeout:10000});
  const pg=await pResearch.evaluate(el=>{const d=el.ownerDocument.documentElement;return{sw:d.scrollWidth,cw:d.clientWidth};});
  if(pg.sw>pg.cw+1)throw new Error(`Research standalone preview overflows: ${pg.sw}/${pg.cw}`);

  if(errors.length)throw new Error(`UI V1 browser errors: ${errors.slice(0,8).join(' | ')}`);
  await browser.close();server.close();
  console.log('SEVEN_UI_V1_CLOSURE_PASS');
})().catch(err=>{console.error(err);server.close();process.exit(1);});
