const fs=require('fs');
const http=require('http');
const path=require('path');
const vm=require('vm');
const { chromium }=require('playwright');

const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'tools/seven-design-studio');
const required=['index.html','studio.css','studio.js','manifest.webmanifest','sw.js','seven-design-icon.svg'];
for(const file of required){if(!fs.existsSync(path.join(dir,file)))throw new Error(`Missing ${file}`);}

const js=fs.readFileSync(path.join(dir,'studio.js'),'utf8');
new vm.Script(js,{filename:'studio.js'});
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
for(const id of ['gjs','themeBtn','dirBtn','deviceSelect','previewBtn','sheet','sheetBody']){
  if(!html.includes(`id="${id}"`))throw new Error(`Missing shell id ${id}`);
}
if(!html.includes('./studio.js')||!html.includes('./studio.css'))throw new Error('Studio assets not wired');

const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const raw=decodeURIComponent(req.url.split('?')[0]);
  let file=path.join(root,raw==='/'?'tools/seven-design-studio/index.html':raw.replace(/^\//,''));
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!file.startsWith(root)||!fs.existsSync(file)){res.statusCode=404;return res.end('not found');}
  res.setHeader('content-type',mime[path.extname(file)]||'text/plain');res.end(fs.readFileSync(file));
});

(async()=>{
  await new Promise(r=>server.listen(4173,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
  const errors=[]; page.on('pageerror',e=>errors.push(String(e))); page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:4173/tools/seven-design-studio/index.html',{waitUntil:'networkidle',timeout:45000});
  await page.waitForSelector('.gjs-frame',{timeout:30000});
  const frame=page.locator('.gjs-frame');
  const body=frame.contentFrame().locator('body');
  await body.locator('.seven-screen').waitFor({timeout:15000});

  await page.getByRole('button',{name:'Toggle theme'}).click().catch(async()=>page.locator('#themeBtn').click());
  if(!(await body.evaluate(el=>el.classList.contains('seven-day'))))throw new Error('Day mode did not reach canvas');
  await page.locator('#dirBtn').click();
  if((await body.getAttribute('dir'))!=='rtl')throw new Error('RTL did not reach canvas');

  await page.locator('[data-panel="add"]').click();
  await page.locator('#sheet.open').waitFor();
  if(await page.locator('#sheetBody .block').count()<8)throw new Error('Component library too small or failed to render');
  await page.locator('#closeSheet').click();

  await page.locator('#previewBtn').click();
  await page.locator('#previewShell:not([hidden])').waitFor();
  await page.locator('#exitPreview').click();

  await page.locator('#deviceSelect').selectOption('320');
  const width=await page.locator('#phoneStage').getAttribute('data-width');
  if(width!=='320')throw new Error('Device preview switch failed');

  const protectedPath=path.join(root,'seven_ai-final.html');
  if(!fs.existsSync(protectedPath))throw new Error('Protected source missing');
  const protectedBytes=fs.statSync(protectedPath).size;
  if(protectedBytes!==658133)throw new Error(`Protected source size changed: ${protectedBytes}`);

  if(errors.length)throw new Error(`Browser errors: ${errors.slice(0,5).join(' | ')}`);
  await browser.close(); server.close();
  console.log('SEVEN_DESIGN_STUDIO_PASS');
})().catch(async err=>{console.error(err);server.close();process.exit(1);});
