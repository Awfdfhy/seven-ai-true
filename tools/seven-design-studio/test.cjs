const fs=require('fs');
const http=require('http');
const path=require('path');
const vm=require('vm');
const { chromium }=require('playwright');

const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'tools/seven-design-studio');
const required=['index.html','studio.css','studio.js','mobile-polish.css','mobile-polish.js','manifest.webmanifest','sw.js','seven-design-icon.svg'];
for(const file of required){if(!fs.existsSync(path.join(dir,file)))throw new Error(`Missing ${file}`);}

for(const file of ['studio.js','mobile-polish.js']){
  const source=fs.readFileSync(path.join(dir,file),'utf8');
  new vm.Script(source,{filename:file});
}
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
for(const id of ['gjs','themeBtn','dirBtn','deviceSelect','previewBtn','sheet','sheetBody']){
  if(!html.includes(`id="${id}"`))throw new Error(`Missing shell id ${id}`);
}
for(const asset of ['./studio.js','./studio.css','./mobile-polish.js','./mobile-polish.css']){
  if(!html.includes(asset))throw new Error(`Studio asset not wired: ${asset}`);
}

const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const raw=decodeURIComponent(req.url.split('?')[0]);
  let file=path.join(root,raw==='/'?'tools/seven-design-studio/index.html':raw.replace(/^\//,''));
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!file.startsWith(root)||!fs.existsSync(file)){res.statusCode=404;return res.end('not found');}
  res.setHeader('content-type',mime[path.extname(file)]||'text/plain');res.end(fs.readFileSync(file));
});

function rgbTuple(value){
  const m=String(value).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  return m?m.slice(1,4).map(Number):null;
}
function isLight(rgb){return rgb && rgb.reduce((a,b)=>a+b,0)>600;}
function isDark(rgb){return rgb && rgb.reduce((a,b)=>a+b,0)<260;}

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

  // Touch shell: primary controls must remain comfortably tappable on phone.
  const dockHeight=await page.locator('.dock-button').first().evaluate(el=>el.getBoundingClientRect().height);
  if(dockHeight<44)throw new Error(`Dock touch target too small: ${dockHeight}`);
  const topHeight=await page.locator('#previewBtn').evaluate(el=>el.getBoundingClientRect().height);
  if(topHeight<44)throw new Error(`Preview touch target too small: ${topHeight}`);

  // Initial Night preview must actually render dark. This guards the real Android issue found in the first device pass.
  await page.locator('#previewBtn').click();
  await page.locator('#previewShell:not([hidden])').waitFor();
  const preview=page.locator('#previewFrame').contentFrame();
  await preview.locator('body[data-seven-preview-theme="night"]').waitFor({timeout:10000});
  const nightScreen=await preview.locator('.seven-screen').evaluate(el=>({bg:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color}));
  if(!isDark(rgbTuple(nightScreen.bg)))throw new Error(`Night preview is not dark: ${nightScreen.bg}`);
  if(isDark(rgbTuple(nightScreen.color)))throw new Error(`Night preview text is not light enough: ${nightScreen.color}`);
  await page.locator('#exitPreview').click();

  // Day + RTL must propagate through both editor canvas and prototype preview.
  await page.locator('#themeBtn').click();
  if(!(await body.evaluate(el=>el.classList.contains('seven-day'))))throw new Error('Day mode did not reach canvas');
  await page.locator('#dirBtn').click();
  if((await body.getAttribute('dir'))!=='rtl')throw new Error('RTL did not reach canvas');

  await page.locator('[data-panel="add"]').click();
  await page.locator('#sheet.open').waitFor();
  if(await page.locator('#sheetBody .block').count()<8)throw new Error('Component library too small or failed to render');
  await page.locator('#closeSheet').click();

  await page.locator('#previewBtn').click();
  await page.locator('#previewShell:not([hidden])').waitFor();
  await preview.locator('body[data-seven-preview-theme="day"][dir="rtl"]').waitFor({timeout:10000});
  const dayScreen=await preview.locator('.seven-screen').evaluate(el=>({bg:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color,sw:el.scrollWidth,cw:el.clientWidth}));
  if(!isLight(rgbTuple(dayScreen.bg)))throw new Error(`Day preview is not light: ${dayScreen.bg}`);
  if(!isDark(rgbTuple(dayScreen.color)))throw new Error(`Day preview text is not dark enough: ${dayScreen.color}`);
  if(dayScreen.sw>dayScreen.cw+1)throw new Error(`Preview horizontal overflow: ${dayScreen.sw}/${dayScreen.cw}`);
  await page.locator('#exitPreview').click();

  await page.locator('#deviceSelect').selectOption('320');
  const width=await page.locator('#phoneStage').getAttribute('data-width');
  if(width!=='320')throw new Error('Device preview switch failed');
  await page.setViewportSize({width:320,height:760});
  const shellOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  if(shellOverflow>1)throw new Error(`Studio shell overflows at 320px by ${shellOverflow}px`);

  const protectedPath=path.join(root,'seven_ai-final.html');
  if(!fs.existsSync(protectedPath))throw new Error('Protected source missing');
  const protectedBytes=fs.statSync(protectedPath).size;
  if(protectedBytes!==658133)throw new Error(`Protected source size changed: ${protectedBytes}`);

  if(errors.length)throw new Error(`Browser errors: ${errors.slice(0,5).join(' | ')}`);
  await browser.close(); server.close();
  console.log('SEVEN_DESIGN_STUDIO_PASS');
})().catch(async err=>{console.error(err);server.close();process.exit(1);});
