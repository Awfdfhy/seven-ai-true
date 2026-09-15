const fs=require('fs');
const http=require('http');
const path=require('path');
const vm=require('vm');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'tools/seven-design-studio');
for(const file of ['home-synthesis-v3.js','index.html']){
  if(!fs.existsSync(path.join(dir,file)))throw new Error(`Missing ${file}`);
}
new vm.Script(fs.readFileSync(path.join(dir,'home-synthesis-v3.js'),'utf8'),{filename:'home-synthesis-v3.js'});
const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
if(!index.includes('./home-synthesis-v3.js'))throw new Error('Seven Home synthesis V3 is not wired into index.html');
if(index.includes('./home-reference-v2.js'))throw new Error('Legacy reference V2 script is still wired into index.html');

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
  const home=canvas.locator('[data-seven-home-version="2026.09-synthesis-v3"]');
  await home.waitFor({timeout:15000});

  if(await canvas.locator('.v3-feature').count()!==6)throw new Error('Expected six synthesized capability tiles');
  if(await canvas.locator('.v3-suggestions button').count()!==3)throw new Error('Quick suggestion rail missing');
  if(await canvas.locator('.v3-tools').count()!==1)throw new Error('Tools & Create row missing');
  if(await canvas.locator('.v3-active-card').count()!==1)throw new Error('Active work surface missing');
  if(await canvas.locator('.v3-recent').count()!==2)throw new Error('Continue recents missing');
  if(await canvas.locator('.v3-personal-card').count()!==1)throw new Error('Personalized next-step card missing');
  if(await canvas.locator('.v3-compute-card').count()!==1)throw new Error('Compute surface missing');
  if(await canvas.locator('.v3-bottom-nav').count()!==1)throw new Error('Bottom navigation missing');
  if(await canvas.locator('.v3-composer').count()!==1)throw new Error('Premium composer missing');

  const geometry=await home.evaluate(el=>({sw:el.scrollWidth,cw:el.clientWidth}));
  if(geometry.sw>geometry.cw+1)throw new Error(`Home overflows at 393px: ${geometry.sw}/${geometry.cw}`);

  const targets=await canvas.locator('.v3-feature,.v3-tools,.v3-active-card,.v3-recent,.v3-personal-card,.v3-compute-card,.v3-bottom-nav button,.v3-circle,.v3-voice,.v3-send').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {w:r.width,h:r.height,cls:el.className}}));
  const tiny=targets.filter(r=>r.w>0&&r.h>0&&(r.w<40||r.h<40));
  if(tiny.length)throw new Error(`Undersized Home touch targets: ${JSON.stringify(tiny.slice(0,4))}`);

  const composer=await canvas.locator('.v3-composer').evaluate(el=>({h:el.getBoundingClientRect().height,bg:getComputedStyle(el).backgroundImage,border:getComputedStyle(el).borderColor}));
  if(composer.h<150)throw new Error(`Composer lacks visual presence: ${composer.h}`);
  if(!composer.bg.includes('gradient'))throw new Error('Composer lost its layered surface');

  await page.locator('#themeBtn').click();
  const dayBg=await home.evaluate(el=>getComputedStyle(el).backgroundColor);
  if(!dayBg)throw new Error('Day theme did not compute');
  await page.locator('#themeBtn').click();

  await page.locator('#dirBtn').click();
  if((await canvas.locator('body').getAttribute('dir'))!=='rtl')throw new Error('RTL did not propagate to synthesized Home');
  await page.locator('#dirBtn').click();

  await page.locator('#deviceSelect').selectOption('320');
  await page.setViewportSize({width:320,height:760});
  const small=await home.evaluate(el=>({sw:el.scrollWidth,cw:el.clientWidth}));
  if(small.sw>small.cw+1)throw new Error(`Home overflows at 320px: ${small.sw}/${small.cw}`);
  if(await canvas.locator('.v3-feature').count()!==6)throw new Error('Small-phone layout lost capability tiles');

  await page.locator('#previewBtn').click();
  await page.locator('#previewShell:not([hidden])').waitFor();
  const preview=page.locator('#previewFrame').contentFrame();
  await preview.locator('[data-seven-home-version="2026.09-synthesis-v3"]').waitFor({timeout:10000});
  if(await preview.locator('.v3-feature').count()!==6)throw new Error('Preview did not preserve synthesized Home content');
  if(await preview.locator('.v3-bottom-nav').count()!==1)throw new Error('Preview lost bottom navigation');

  if(errors.length)throw new Error(`Browser errors: ${errors.slice(0,5).join(' | ')}`);
  await browser.close();server.close();
  console.log('SEVEN_HOME_SYNTHESIS_V3_PASS');
})().catch(async err=>{console.error(err);server.close();process.exit(1);});
