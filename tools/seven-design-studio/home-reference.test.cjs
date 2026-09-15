const fs=require('fs');
const http=require('http');
const path=require('path');
const vm=require('vm');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'tools/seven-design-studio');
for(const file of ['home-reference-v2.js','index.html']){
  if(!fs.existsSync(path.join(dir,file)))throw new Error(`Missing ${file}`);
}
new vm.Script(fs.readFileSync(path.join(dir,'home-reference-v2.js'),'utf8'),{filename:'home-reference-v2.js'});
const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
if(!index.includes('./home-reference-v2.js'))throw new Error('Reference Home V2 is not wired into index.html');

const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const raw=decodeURIComponent(req.url.split('?')[0]);
  let file=path.join(root,raw==='/'?'tools/seven-design-studio/index.html':raw.replace(/^\//,''));
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!file.startsWith(root)||!fs.existsSync(file)){res.statusCode=404;return res.end('not found');}
  res.setHeader('content-type',mime[path.extname(file)]||'text/plain');res.end(fs.readFileSync(file));
});

(async()=>{
  await new Promise(r=>server.listen(4175,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:4175/tools/seven-design-studio/index.html',{waitUntil:'networkidle',timeout:45000});
  await page.waitForSelector('.gjs-frame',{timeout:30000});
  const canvas=page.locator('.gjs-frame').contentFrame();
  const home=canvas.locator('[data-seven-home-version="2026.09-reference-v2"]');
  await home.waitFor({timeout:15000});

  if(await canvas.locator('.ref-feature').count()!==6)throw new Error('Expected six reference-grade feature tiles');
  if(await canvas.locator('.ref-tools-row').count()!==1)throw new Error('Tools row missing');
  if(await canvas.locator('.ref-history-row').count()!==2)throw new Error('Continue rows missing');
  if(await canvas.locator('.ref-model-row').count()!==1)throw new Error('Model row missing');
  if(await canvas.locator('.ref-bottom-nav').count()!==1)throw new Error('Bottom navigation missing');
  if(await canvas.locator('.ref-composer').count()!==1)throw new Error('Premium composer missing');

  const geometry=await home.evaluate(el=>({sw:el.scrollWidth,cw:el.clientWidth}));
  if(geometry.sw>geometry.cw+1)throw new Error(`Home overflows at 393px: ${geometry.sw}/${geometry.cw}`);

  const targets=await canvas.locator('.ref-feature,.ref-tools-row,.ref-history-row,.ref-bottom-nav button').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {w:r.width,h:r.height}}));
  const tiny=targets.filter(r=>r.w>0&&r.h>0&&(r.w<40||r.h<40));
  if(tiny.length)throw new Error(`Undersized Home touch targets: ${JSON.stringify(tiny.slice(0,4))}`);

  await page.locator('#deviceSelect').selectOption('320');
  await page.setViewportSize({width:320,height:760});
  const small=await home.evaluate(el=>({sw:el.scrollWidth,cw:el.clientWidth}));
  if(small.sw>small.cw+1)throw new Error(`Home overflows at 320px: ${small.sw}/${small.cw}`);

  await page.locator('#previewBtn').click();
  await page.locator('#previewShell:not([hidden])').waitFor();
  const preview=page.locator('#previewFrame').contentFrame();
  await preview.locator('[data-seven-home-version="2026.09-reference-v2"]').waitFor({timeout:10000});
  if(await preview.locator('.ref-feature').count()!==6)throw new Error('Preview did not preserve premium Home content');

  if(errors.length)throw new Error(`Browser errors: ${errors.slice(0,5).join(' | ')}`);
  await browser.close();server.close();
  console.log('SEVEN_HOME_REFERENCE_V2_PASS');
})().catch(async err=>{console.error(err);server.close();process.exit(1);});
