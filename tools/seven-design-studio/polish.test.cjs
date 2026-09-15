const fs=require('fs');
const http=require('http');
const path=require('path');
const vm=require('vm');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'tools/seven-design-studio');
for(const file of ['studio-bridge.js','mobile-polish.js']){
  const source=fs.readFileSync(path.join(dir,file),'utf8');
  new vm.Script(source,{filename:file});
}
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
for(const asset of ['./studio-bridge.js','./mobile-polish.js','./mobile-polish.css']){
  if(!html.includes(asset))throw new Error(`Missing wired asset ${asset}`);
}

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
  await new Promise(r=>server.listen(4174,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true,acceptDownloads:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:4174/tools/seven-design-studio/index.html',{waitUntil:'networkidle',timeout:45000});
  await page.waitForSelector('.gjs-frame',{timeout:30000});
  if(!(await page.evaluate(()=>!!window.__sevenDesignEditor)))throw new Error('Editor bridge unavailable');

  await page.locator('#themeBtn').click();
  await page.locator('#dirBtn').click();
  await page.locator('[data-panel="more"]').click();
  await page.locator('#sheet.open').waitFor();
  await page.locator('#sevenMobileReliability').waitFor({timeout:5000});

  await page.locator('#snapshotPolish').click();
  const recoveryCount=await page.evaluate(()=>{try{return JSON.parse(localStorage.getItem('seven-design-studio-recovery-v1')||'[]').length}catch(_){return 0}});
  if(recoveryCount<1)throw new Error('Recovery snapshot missing');

  const downloadPromise=page.waitForEvent('download');
  await page.locator('#exportHtml').click();
  const download=await downloadPromise;
  const filePath=await download.path();
  if(!filePath)throw new Error('Export path missing');
  const exported=fs.readFileSync(filePath,'utf8');
  if(!exported.includes('data-seven-export="hardened-v1"'))throw new Error('Hardened export marker missing');
  if(!exported.includes('viewport-fit=cover'))throw new Error('Mobile viewport hardening missing');
  if(!exported.includes('seven-day seven-rtl'))throw new Error('Day/RTL state missing from export');
  if(!exported.includes('body:not(.seven-day) .seven-screen'))throw new Error('Contrast guard missing from export');

  if(errors.length)throw new Error(`Browser errors: ${errors.slice(0,5).join(' | ')}`);
  await browser.close();
  server.close();
  console.log('SEVEN_DESIGN_STUDIO_POLISH_PASS');
})().catch(err=>{console.error(err);server.close();process.exit(1);});
