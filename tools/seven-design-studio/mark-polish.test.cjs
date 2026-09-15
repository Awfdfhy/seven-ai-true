const fs=require('fs');
const http=require('http');
const path=require('path');
const vm=require('vm');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'tools/seven-design-studio');
const markFile=path.join(dir,'seven-mark-polish.js');
const indexFile=path.join(dir,'index.html');
if(!fs.existsSync(markFile))throw new Error('Missing seven-mark-polish.js');
if(!fs.existsSync(indexFile))throw new Error('Missing index.html');
new vm.Script(fs.readFileSync(markFile,'utf8'),{filename:'seven-mark-polish.js'});
const index=fs.readFileSync(indexFile,'utf8');
const launchpadPos=index.indexOf('./home-launchpad-v4.js');
const polishPos=index.indexOf('./seven-mark-polish.js');
if(launchpadPos<0||polishPos<0||polishPos<launchpadPos)throw new Error('Seven mark polish must load after Home V4');

const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const raw=decodeURIComponent(req.url.split('?')[0]);
  let file=path.join(root,raw==='/'?'tools/seven-design-studio/index.html':raw.replace(/^\//,''));
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!file.startsWith(root)||!fs.existsSync(file)){res.statusCode=404;return res.end('not found');}
  res.setHeader('content-type',mime[path.extname(file)]||'text/plain');
  res.end(fs.readFileSync(file));
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
  const marks=canvas.locator('[data-seven-mark-version="2026.09-mark-v2"]');
  await marks.first().waitFor({timeout:10000});
  if(await marks.count()<2)throw new Error('Polished mark is missing from header or central orb');
  const polishVersion=await home.getAttribute('data-seven-mark-polish');
  if(polishVersion!=='2026.09-mark-v2')throw new Error(`Unexpected mark polish version: ${polishVersion}`);

  const svgMarkup=await marks.first().evaluate(el=>el.outerHTML);
  for(const color of ['#32BECF','#4166F5','#8265DC']){
    if(!svgMarkup.toUpperCase().includes(color))throw new Error(`Canonical Seven color missing from mark: ${color}`);
  }
  if(!svgMarkup.includes('seven-mark-loop')||!svgMarkup.includes('seven-mark-tail')||!svgMarkup.includes('seven-mark-fold'))throw new Error('Polished ribbon geometry layers are incomplete');

  const headerBox=await canvas.locator('.v4-brand-mark').evaluate(el=>{const r=el.getBoundingClientRect();return {w:r.width,h:r.height};});
  if(headerBox.w<43||headerBox.h<34)throw new Error(`Header mark too small: ${headerBox.w}x${headerBox.h}`);
  const orbBox=await canvas.locator('.v4-orb-core').evaluate(el=>{const r=el.getBoundingClientRect();return {w:r.width,h:r.height};});
  if(orbBox.w<39||orbBox.h<30)throw new Error(`Orb mark too small: ${orbBox.w}x${orbBox.h}`);

  await page.locator('#themeBtn').click();
  if(await marks.count()<2)throw new Error('Day theme lost polished Seven mark');
  await page.locator('#themeBtn').click();

  await page.locator('#deviceSelect').selectOption('320');
  await page.setViewportSize({width:320,height:760});
  if(await marks.count()<2)throw new Error('320px layout lost polished Seven mark');

  await page.locator('#previewBtn').click();
  await page.locator('#previewShell:not([hidden])').waitFor();
  const preview=page.locator('#previewFrame').contentFrame();
  const previewMarks=preview.locator('[data-seven-mark-version="2026.09-mark-v2"]');
  await previewMarks.first().waitFor({timeout:10000});
  if(await previewMarks.count()<2)throw new Error('Prototype preview lost polished Seven mark');

  if(errors.length)throw new Error(`Browser errors: ${errors.slice(0,5).join(' | ')}`);
  await browser.close();server.close();
  console.log('SEVEN_MARK_POLISH_V2_PASS');
})().catch(async err=>{console.error(err);server.close();process.exit(1);});
