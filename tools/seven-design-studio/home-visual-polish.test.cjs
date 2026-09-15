const fs=require('fs');
const http=require('http');
const path=require('path');
const vm=require('vm');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'tools/seven-design-studio');
const file=path.join(dir,'home-visual-polish-v1.js');
const a11yFile=path.join(dir,'home-visual-polish-a11y-v1.js');
if(!fs.existsSync(file))throw new Error('Missing home-visual-polish-v1.js');
if(!fs.existsSync(a11yFile))throw new Error('Missing home-visual-polish-a11y-v1.js');
const source=fs.readFileSync(file,'utf8');
const a11ySource=fs.readFileSync(a11yFile,'utf8');
new vm.Script(source,{filename:'home-visual-polish-v1.js'});
new vm.Script(a11ySource,{filename:'home-visual-polish-a11y-v1.js'});
for(const token of ['2026.09-visual-polish-v1','--seven-home-visual-polish-v1','grid-template-columns:repeat(2','border-radius:29px 29px 29px 10px','left:0;right:0;bottom:0','body.seven-day','body.seven-lite','prefers-reduced-motion'])if(!source.includes(token))throw new Error(`Visual polish contract missing ${token}`);
if(source.includes('backdrop-filter')||source.includes('filter:blur('))throw new Error('Visual polish introduced expensive always-on blur');
if(!a11ySource.includes('font-size:11px'))throw new Error('Visual readability floor is missing');
const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
if(!index.includes('./home-visual-polish-v1.js')||!index.includes('./home-visual-polish-a11y-v1.js'))throw new Error('Visual polish modules are not wired into index.html');
const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');
if(!sw.includes('./home-visual-polish-v1.js')||!sw.includes('./home-visual-polish-a11y-v1.js')||!sw.includes("seven-design-studio-v15"))throw new Error('Visual polish is not cached by the current service worker');

const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const raw=decodeURIComponent(req.url.split('?')[0]);
  let target=path.join(root,raw==='/'?'tools/seven-design-studio/index.html':raw.replace(/^\//,''));
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!target.startsWith(root)||!fs.existsSync(target)){res.statusCode=404;return res.end('not found');}
  res.setHeader('content-type',mime[path.extname(target)]||'text/plain');res.end(fs.readFileSync(target));
});

(async()=>{
  await new Promise(r=>server.listen(4179,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:4179/tools/seven-design-studio/index.html',{waitUntil:'networkidle',timeout:45000});
  await page.waitForSelector('.gjs-frame',{timeout:30000});
  const canvas=page.locator('.gjs-frame').contentFrame();
  const home=canvas.locator('[data-seven-home-visual-polish="2026.09-visual-polish-v1"]');
  await home.waitFor({timeout:15000});
  if((await home.getAttribute('data-seven-home-completion'))!=='2026.09-home-v5')throw new Error('Visual polish detached from Home V5');
  if((await home.getAttribute('data-seven-mark-polish'))!=='2026.09-mark-v2')throw new Error('Visual polish lost the Seven mark');

  const visual=await canvas.locator('.v5-composer').evaluate(el=>{const s=getComputedStyle(el);return{tl:s.borderTopLeftRadius,bl:s.borderBottomLeftRadius,shadow:s.boxShadow}});
  if(parseFloat(visual.tl)<25||parseFloat(visual.bl)>12)throw new Error(`Seven Cut geometry regressed: ${JSON.stringify(visual)}`);
  if(!visual.shadow||visual.shadow==='none')throw new Error('Composer lost restrained elevation');
  const shortcuts=await canvas.locator('.v5-shortcuts').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length);
  if(shortcuts!==2)throw new Error(`Expected contemporary 2-column intent chips, got ${shortcuts}`);
  if(await canvas.locator('.v4-shortcut').first().evaluate(el=>getComputedStyle(el).flexDirection)!=='row')throw new Error('Intent shortcuts regressed to card stack');
  const nav=await canvas.locator('.v5-bottom-nav').evaluate(el=>{const s=getComputedStyle(el);return{left:s.left,right:s.right,bottom:s.bottom,bl:s.borderBottomLeftRadius,tl:s.borderTopLeftRadius}});
  if(parseFloat(nav.left)!==0||parseFloat(nav.right)!==0||parseFloat(nav.bottom)!==0)throw new Error(`Bottom navigation is not edge-integrated: ${JSON.stringify(nav)}`);
  if(parseFloat(nav.tl)<20||parseFloat(nav.bl)>1)throw new Error(`Bottom navigation geometry regressed: ${JSON.stringify(nav)}`);

  const readable=await canvas.locator('.v5-eyebrow,.v5-input-hint,.v5-bottom-nav small').evaluateAll(els=>els.map(el=>({text:el.textContent.trim(),size:parseFloat(getComputedStyle(el).fontSize)})));
  const tooSmall=readable.filter(x=>x.size<11);
  if(tooSmall.length)throw new Error(`Visual polish readability floor regressed: ${JSON.stringify(tooSmall)}`);

  await canvas.locator('.v5-composer textarea').focus();
  const focusShadow=await canvas.locator('.v5-composer').evaluate(el=>getComputedStyle(el).boxShadow);
  if(!focusShadow||focusShadow==='none')throw new Error('Composer focus state is visually silent');

  await canvas.locator('.v4-all').click();
  const commandLayer=canvas.locator('.v5-layer:not([hidden])');
  await commandLayer.waitFor({timeout:5000});
  await commandLayer.locator('[data-seven-catalog-extra]').waitFor({timeout:5000});
  if(await commandLayer.locator('.v5-command').count()<60)throw new Error('Visual polish hid progressive capability coverage');
  await commandLayer.locator('.v5-sheet-close').click();

  await page.locator('#themeBtn').click();
  const day=await home.evaluate(el=>({bg:getComputedStyle(el).backgroundImage,color:getComputedStyle(el).color}));
  if(!day.bg.includes('gradient')||!day.color)throw new Error('Day visual polish failed');
  await page.locator('#themeBtn').click();
  await page.locator('#dirBtn').click();
  if((await canvas.locator('body').getAttribute('dir'))!=='rtl')throw new Error('RTL propagation failed after visual polish');
  await page.locator('#dirBtn').click();

  await page.locator('#deviceSelect').selectOption('320');
  await page.setViewportSize({width:320,height:760});
  const geom=await home.evaluate(el=>({sw:el.scrollWidth,cw:el.clientWidth}));
  if(geom.sw>geom.cw+1)throw new Error(`Visual polish overflows at 320px: ${geom.sw}/${geom.cw}`);
  const tiny=await canvas.locator('.v5-brand,.v5-icon-button,.v5-avatar,.v5-ready,.v4-mode,.v4-context,.v4-add,.v4-voice,.v4-send,.v4-shortcut,.v4-active-row,.v4-resume-row,.v5-bottom-nav>button').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return{w:r.width,h:r.height,cls:el.className}}).filter(x=>x.w>0&&x.h>0&&(x.w<48||x.h<48)));
  if(tiny.length)throw new Error(`Visual polish created undersized touch targets: ${JSON.stringify(tiny.slice(0,5))}`);

  await page.locator('#previewBtn').click();
  await page.locator('#previewShell:not([hidden])').waitFor();
  const preview=page.locator('#previewFrame').contentFrame();
  const pHome=preview.locator('[data-seven-home-visual-polish="2026.09-visual-polish-v1"]');
  await pHome.waitFor({timeout:10000});
  if(await preview.locator('.v5-shortcuts').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length)!==2)throw new Error('Prototype preview lost visual polish');
  const pReadable=await preview.locator('.v5-eyebrow,.v5-bottom-nav small').evaluateAll(els=>els.every(el=>parseFloat(getComputedStyle(el).fontSize)>=11));
  if(!pReadable)throw new Error('Prototype preview lost visual readability floor');

  if(errors.length)throw new Error(`Browser errors: ${errors.slice(0,5).join(' | ')}`);
  await browser.close();server.close();
  console.log('SEVEN_HOME_VISUAL_POLISH_V1_PASS');
})().catch(async err=>{console.error(err);server.close();process.exit(1);});
