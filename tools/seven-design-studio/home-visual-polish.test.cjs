const fs=require('fs');
const http=require('http');
const path=require('path');
const vm=require('vm');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'tools/seven-design-studio');
const v1File=path.join(dir,'home-visual-polish-v1.js');
const a11yFile=path.join(dir,'home-visual-polish-a11y-v1.js');
const v2File=path.join(dir,'home-visual-polish-v2.js');
for(const file of [v1File,a11yFile,v2File])if(!fs.existsSync(file))throw new Error(`Missing ${path.basename(file)}`);
const v1=fs.readFileSync(v1File,'utf8');
const a11y=fs.readFileSync(a11yFile,'utf8');
const v2=fs.readFileSync(v2File,'utf8');
new vm.Script(v1,{filename:'home-visual-polish-v1.js'});
new vm.Script(a11y,{filename:'home-visual-polish-a11y-v1.js'});
new vm.Script(v2,{filename:'home-visual-polish-v2.js'});
for(const token of ['2026.09-visual-polish-v2','--seven-home-visual-polish-v2','border:0!important;border-radius:0!important;box-shadow:none!important','display:flex;grid-template-columns:none','border-radius:0;','v6-status','body.seven-day','body.seven-lite','prefers-reduced-motion'])if(!v2.includes(token))throw new Error(`Visual polish v2 contract missing ${token}`);
if(v2.includes('backdrop-filter')||v2.includes('filter:blur('))throw new Error('Visual polish v2 introduced expensive always-on blur');
if(!a11y.includes('font-size:11px'))throw new Error('Visual readability floor is missing');
const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
for(const mod of ['./home-visual-polish-v1.js','./home-visual-polish-a11y-v1.js','./home-visual-polish-v2.js'])if(!index.includes(mod))throw new Error(`Visual module not wired: ${mod}`);
if(index.indexOf('./home-visual-polish-v2.js')<index.indexOf('./home-visual-polish-v1.js'))throw new Error('V2 must load after V1');
const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');
if(!sw.includes('./home-visual-polish-v2.js')||!sw.includes("seven-design-studio-v16"))throw new Error('Visual polish v2 is not cached by the current service worker');

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
  const home=canvas.locator('[data-seven-home-visual-polish-v2="2026.09-visual-polish-v2"]');
  await home.waitFor({timeout:15000});
  if((await home.getAttribute('data-seven-home-completion'))!=='2026.09-home-v5')throw new Error('Visual polish v2 detached from Home V5');
  if((await home.getAttribute('data-seven-mark-polish'))!=='2026.09-mark-v2')throw new Error('Visual polish v2 lost the Seven mark');

  const rootVisual=await home.evaluate(el=>{const s=getComputedStyle(el);return{border:s.borderTopWidth,radius:s.borderTopLeftRadius,shadow:s.boxShadow}});
  if(parseFloat(rootVisual.border)!==0||parseFloat(rootVisual.radius)!==0||rootVisual.shadow!=='none')throw new Error(`Home still looks like a framed prototype: ${JSON.stringify(rootVisual)}`);

  const status=canvas.locator('.v6-status');
  await status.waitFor();
  if(await status.locator('span').evaluate(el=>getComputedStyle(el).display)!=='none')throw new Error('Ready status still consumes headline space');
  if(!(await canvas.locator('.v5-header-actions .v6-status').count()))throw new Error('Ready status was not integrated into the header');

  const composer=await canvas.locator('.v5-composer').evaluate(el=>{const s=getComputedStyle(el);const r=el.getBoundingClientRect();return{h:r.height,tl:s.borderTopLeftRadius,bl:s.borderBottomLeftRadius,shadow:s.boxShadow}});
  if(composer.h<188||composer.h>230)throw new Error(`Composer hierarchy is no longer compact and primary: ${JSON.stringify(composer)}`);
  if(parseFloat(composer.tl)<24||parseFloat(composer.bl)>12)throw new Error(`Seven Cut geometry regressed: ${JSON.stringify(composer)}`);
  if(!composer.shadow||composer.shadow==='none')throw new Error('Composer lost restrained elevation');

  const shortcuts=await canvas.locator('.v5-shortcuts').evaluate(el=>{const s=getComputedStyle(el);return{display:s.display,overflow:s.overflowX,sw:el.scrollWidth,cw:el.clientWidth}});
  if(shortcuts.display!=='flex')throw new Error(`Intent shortcuts returned to dashboard grid: ${JSON.stringify(shortcuts)}`);
  if(shortcuts.overflow!=='auto'&&shortcuts.overflow!=='scroll')throw new Error(`Intent rail is not progressively scrollable: ${JSON.stringify(shortcuts)}`);
  if(await canvas.locator('.v4-shortcut').first().evaluate(el=>getComputedStyle(el).flexDirection)!=='row')throw new Error('Intent shortcuts regressed to card stacks');

  const nowSurface=await canvas.locator('.v5-now-surface').evaluate(el=>{const s=getComputedStyle(el);return{border:s.borderTopWidth,radius:s.borderTopLeftRadius,bg:s.backgroundColor}});
  if(parseFloat(nowSurface.border)!==0||parseFloat(nowSurface.radius)!==0)throw new Error(`Now is still trapped in a heavy container: ${JSON.stringify(nowSurface)}`);

  const nav=await canvas.locator('.v5-bottom-nav').evaluate(el=>{const s=getComputedStyle(el);return{left:s.left,right:s.right,bottom:s.bottom,tl:s.borderTopLeftRadius}});
  if(parseFloat(nav.left)!==0||parseFloat(nav.right)!==0||parseFloat(nav.bottom)!==0||parseFloat(nav.tl)!==0)throw new Error(`Bottom navigation is still floating: ${JSON.stringify(nav)}`);
  const orb=await canvas.locator('.v5-orb-button').evaluate(el=>{const s=getComputedStyle(el);const r=el.getBoundingClientRect();return{w:r.width,h:r.height,radius:s.borderTopLeftRadius,shadow:s.boxShadow}});
  if(orb.w>56||orb.h>56||parseFloat(orb.radius)<25||orb.shadow!=='none')throw new Error(`Seven Orb container still dominates the navigation: ${JSON.stringify(orb)}`);

  const readable=await canvas.locator('.v5-eyebrow,.v5-input-hint,.v5-bottom-nav small,.v5-section-heading>button').evaluateAll(els=>els.map(el=>({text:el.textContent.trim(),size:parseFloat(getComputedStyle(el).fontSize)})));
  const tooSmall=readable.filter(x=>x.size<11);
  if(tooSmall.length)throw new Error(`Visual polish readability floor regressed: ${JSON.stringify(tooSmall)}`);

  await canvas.locator('.v5-composer textarea').focus();
  const focusShadow=await canvas.locator('.v5-composer').evaluate(el=>getComputedStyle(el).boxShadow);
  if(!focusShadow||focusShadow==='none')throw new Error('Composer focus state is visually silent');

  await page.locator('#themeBtn').click();
  const day=await home.evaluate(el=>({bg:getComputedStyle(el).backgroundImage,color:getComputedStyle(el).color}));
  if(!day.bg.includes('gradient')||!day.color)throw new Error('Day visual polish v2 failed');
  await page.locator('#themeBtn').click();
  await page.locator('#dirBtn').click();
  if((await canvas.locator('body').getAttribute('dir'))!=='rtl')throw new Error('RTL propagation failed after visual polish v2');
  await page.locator('#dirBtn').click();

  await page.locator('#deviceSelect').selectOption('320');
  await page.setViewportSize({width:320,height:760});
  const geom=await home.evaluate(el=>({sw:el.scrollWidth,cw:el.clientWidth}));
  if(geom.sw>geom.cw+1)throw new Error(`Visual polish v2 overflows Home at 320px: ${geom.sw}/${geom.cw}`);
  const tiny=await canvas.locator('.v5-brand,.v5-icon-button,.v5-avatar,.v6-status,.v4-mode,.v4-context,.v4-add,.v4-voice,.v4-send,.v4-shortcut,.v4-active-row,.v4-resume-row,.v5-bottom-nav>button').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return{w:r.width,h:r.height,cls:el.className}}).filter(x=>x.w>0&&x.h>0&&(x.w<48||x.h<48)));
  if(tiny.length)throw new Error(`Visual polish v2 created undersized touch targets: ${JSON.stringify(tiny.slice(0,5))}`);

  await page.locator('#previewBtn').click();
  await page.locator('#previewShell:not([hidden])').waitFor();
  const preview=page.locator('#previewFrame').contentFrame();
  const pHome=preview.locator('[data-seven-home-visual-polish-v2="2026.09-visual-polish-v2"]');
  await pHome.waitFor({timeout:10000});
  if(await preview.locator('.v5-shortcuts').evaluate(el=>getComputedStyle(el).display)!=='flex')throw new Error('Prototype preview lost the horizontal intent rail');
  if((await preview.locator('.v5-bottom-nav').evaluate(el=>parseFloat(getComputedStyle(el).borderTopLeftRadius)))!==0)throw new Error('Prototype preview restored floating navigation');
  const pReadable=await preview.locator('.v5-eyebrow,.v5-bottom-nav small').evaluateAll(els=>els.every(el=>parseFloat(getComputedStyle(el).fontSize)>=11));
  if(!pReadable)throw new Error('Prototype preview lost visual readability floor');

  await preview.locator('.v4-all').click();
  const sheet=preview.locator('.v5-layer:not([hidden])');
  await sheet.waitFor({timeout:5000});
  await sheet.locator('[data-seven-catalog-extra="2026.09-capability-catalog-v1"]').waitFor({timeout:5000});
  if(await sheet.locator('.v5-command').count()<60)throw new Error('Visual polish v2 hid progressive capability coverage in preview');

  if(errors.length)throw new Error(`Browser errors: ${errors.slice(0,5).join(' | ')}`);
  await browser.close();server.close();
  console.log('SEVEN_HOME_VISUAL_POLISH_V2_PASS');
})().catch(async err=>{console.error(err);server.close();process.exit(1);});
