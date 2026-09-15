const fs=require('fs');
const http=require('http');
const path=require('path');
const vm=require('vm');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'tools/seven-design-studio');
const file=path.join(dir,'home-capability-catalog-v1.js');
if(!fs.existsSync(file))throw new Error('Missing home-capability-catalog-v1.js');
new vm.Script(fs.readFileSync(file,'utf8'),{filename:'home-capability-catalog-v1.js'});
const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
if(!index.includes('./home-capability-catalog-v1.js'))throw new Error('Capability catalog module is not wired into index.html');
const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');
if(!sw.includes('./home-capability-catalog-v1.js'))throw new Error('Capability catalog module is not cached by service worker');

const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const raw=decodeURIComponent(req.url.split('?')[0]);
  let target=path.join(root,raw==='/'?'tools/seven-design-studio/index.html':raw.replace(/^\//,''));
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!target.startsWith(root)||!fs.existsSync(target)){res.statusCode=404;return res.end('not found');}
  res.setHeader('content-type',mime[path.extname(target)]||'text/plain');res.end(fs.readFileSync(target));
});

(async()=>{
  await new Promise(r=>server.listen(4178,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:4178/tools/seven-design-studio/index.html',{waitUntil:'networkidle',timeout:45000});
  await page.waitForSelector('.gjs-frame',{timeout:30000});
  const canvas=page.locator('.gjs-frame').contentFrame();
  const home=canvas.locator('[data-seven-home-completion="2026.09-home-v5"]');
  await home.waitFor({timeout:15000});
  await canvas.locator('[data-seven-capability-catalog="2026.09-capability-catalog-v1"]').waitFor({timeout:10000});

  const routes=String(await home.getAttribute('data-seven-capability-routes')||'').split(/\s+/).filter(Boolean);
  for(const required of ['schema','mcp','sql','data-analysis','visualization','math','geospatial','weather','documents','docx','spreadsheets','media-transform','generative-media','provenance','archive','api','webhooks','auth','mail','calendar','cloud-files','code-hosting','ocr','speech','local-inference','device','notifications','share']){
    if(!routes.includes(required))throw new Error(`Extended capability route missing: ${required}`);
  }

  await page.locator('#deviceSelect').selectOption('320');
  await page.setViewportSize({width:320,height:760});
  const geom=await home.evaluate(el=>({sw:el.scrollWidth,cw:el.clientWidth}));
  if(geom.sw>geom.cw+1)throw new Error(`Capability catalog introduced Home overflow at 320px: ${geom.sw}/${geom.cw}`);

  await page.locator('#previewBtn').click();
  await page.locator('#previewShell:not([hidden])').waitFor();
  const preview=page.locator('#previewFrame').contentFrame();
  await preview.locator('[data-seven-capability-catalog="2026.09-capability-catalog-v1"]').waitFor({timeout:10000});
  await preview.locator('.v4-all').click();
  const sheet=preview.locator('.v5-layer:not([hidden])');
  await sheet.waitFor({timeout:5000});
  await sheet.locator('[data-seven-catalog-extra="2026.09-capability-catalog-v1"]').waitFor({timeout:5000});

  const text=(await sheet.textContent())||'';
  for(const group of ['Data & knowledge','Documents & media','Automation & connections','Device & local','Tool fabric','Trust & provenance'])if(!text.includes(group))throw new Error(`Capability catalog missing group: ${group}`);
  for(const item of ['SQL & local data','Data analysis','Charts & tables','Math & science','Maps & weather','PDF tools','DOCX & reports','Spreadsheets','Image generation','Media transform','APIs','Webhooks','Connected accounts','Mail','Calendar','Cloud files','Code hosting','OCR & scanner','Speech','Local intelligence','Device actions','Notifications','SchemaGuard','MCP tools','Artifact provenance','Content integrity'])if(!text.includes(item))throw new Error(`Capability catalog missing item: ${item}`);

  const all=sheet.locator('.v5-command');
  if(await all.count()<60)throw new Error(`Expected at least 60 progressively disclosed commands, found ${await all.count()}`);
  const search=sheet.locator('[data-v5-command-search]');
  await search.fill('webhook');
  const visible=await all.evaluateAll(els=>els.filter(el=>!el.hidden).map(el=>el.textContent.trim()));
  if(visible.length!==1||visible[0]!=='Webhooks')throw new Error(`Command search filter failed: ${JSON.stringify(visible)}`);

  if(errors.length)throw new Error(`Browser errors: ${errors.slice(0,5).join(' | ')}`);
  await browser.close();server.close();
  console.log('SEVEN_HOME_CAPABILITY_CATALOG_PASS');
})().catch(async err=>{console.error(err);server.close();process.exit(1);});
