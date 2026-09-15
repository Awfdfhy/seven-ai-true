const fs=require('fs');
const http=require('http');
const path=require('path');
const vm=require('vm');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'tools/seven-design-studio');
const markFile=path.join(dir,'seven-mark-polish.js');
if(!fs.existsSync(markFile))throw new Error('Missing seven-mark-polish.js');
new vm.Script(fs.readFileSync(markFile,'utf8'),{filename:'seven-mark-polish.js'});
const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
if(!index.includes('./seven-mark-polish.js'))throw new Error('Polished mark module is not wired into index.html');
const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');
if(!sw.includes('./seven-mark-polish.js'))throw new Error('Polished mark module is not cached by service worker');

const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const raw=decodeURIComponent(req.url.split('?')[0]);
  let file=path.join(root,raw==='/'?'tools/seven-design-studio/index.html':raw.replace(/^\//,''));
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!file.startsWith(root)||!fs.existsSync(file)){res.statusCode=404;return res.end('not found');}
  res.setHeader('content-type',mime[path.extname(file)]||'text/plain');res.end(fs.readFileSync(file));
});

(async()=>{
  await new Promise(r=>server.listen(4176,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:4176/tools/seven-design-studio/index.html',{waitUntil:'networkidle',timeout:45000});
  await page.waitForSelector('.gjs-frame',{timeout:30000});
  const canvas=page.locator('.gjs-frame').contentFrame();
  const home=canvas.locator('[data-seven-home-version="2026.09-launchpad-v4"]');
  await home.waitFor({timeout:15000});
  await canvas.locator('[data-seven-mark-version="2026.09-mark-v1"]').first().waitFor({timeout:10000});

  const marks=canvas.locator('.seven-mark-polished');
  const count=await marks.count();
  if(count<2)throw new Error(`Expected polished Seven mark in header and orb, found ${count}`);
  if(await canvas.locator('svg.v4-seven-mark:not(.seven-mark-polished)').count())throw new Error('Legacy unpolished Seven mark remains in rendered Home');
  if((await home.getAttribute('data-seven-mark-polish'))!=='2026.09-mark-v1')throw new Error('Home is missing mark polish version metadata');

  const ids=await marks.evaluateAll(els=>els.flatMap(el=>Array.from(el.querySelectorAll('linearGradient')).map(n=>n.id)));
  if(new Set(ids).size!==ids.length)throw new Error(`Polished mark gradient IDs are not unique: ${ids.join(',')}`);

  const boxes=await marks.evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {w:r.width,h:r.height};}));
  if(boxes.some(b=>b.w<28||b.h<24))throw new Error(`Polished mark became illegible at small size: ${JSON.stringify(boxes)}`);

  const body=await marks.first().locator('.seven-mark-body').getAttribute('d');
  if(!body||body.length<120)throw new Error('Polished Seven silhouette is unexpectedly simple');
  if(await marks.first().locator('.seven-mark-highlight').count()!==1)throw new Error('Polished mark highlight layer missing');
  if(await marks.first().locator('.seven-mark-edge').count()!==1)throw new Error('Polished mark edge layer missing');

  await page.locator('#themeBtn').click();
  if(await canvas.locator('.seven-mark-polished').count()<2)throw new Error('Day mode lost polished Seven marks');
  await page.locator('#themeBtn').click();
  await page.locator('#deviceSelect').selectOption('320');
  await page.setViewportSize({width:320,height:760});
  const geometry=await home.evaluate(el=>({sw:el.scrollWidth,cw:el.clientWidth}));
  if(geometry.sw>geometry.cw+1)throw new Error(`Logo polish introduced Home overflow at 320px: ${geometry.sw}/${geometry.cw}`);

  await page.locator('#previewBtn').click();
  await page.locator('#previewShell:not([hidden])').waitFor();
  const preview=page.locator('#previewFrame').contentFrame();
  await preview.locator('[data-seven-mark-version="2026.09-mark-v1"]').first().waitFor({timeout:10000});
  if(await preview.locator('.seven-mark-polished').count()<2)throw new Error('Prototype preview lost polished Seven marks');

  if(errors.length)throw new Error(`Browser errors: ${errors.slice(0,5).join(' | ')}`);
  await browser.close();server.close();
  console.log('SEVEN_MARK_POLISH_PASS');
})().catch(async err=>{console.error(err);server.close();process.exit(1);});
