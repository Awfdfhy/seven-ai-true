const fs=require('fs');
const http=require('http');
const path=require('path');
const vm=require('vm');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'tools/seven-design-studio');
const names=['home-visual-polish-v1.js','home-visual-polish-v2.js','home-visual-polish-a11y-v1.js','home-visual-polish-v3.js'];
const src={};
for(const name of names){
  const file=path.join(dir,name);
  if(!fs.existsSync(file))throw new Error(`Missing ${name}`);
  src[name]=fs.readFileSync(file,'utf8');
  new vm.Script(src[name],{filename:name});
}
const v3=src['home-visual-polish-v3.js'];
for(const token of ['2026.09-visual-polish-v3','--seven-home-visual-polish-v3','v5-live{display:none}','height:48px','body.seven-day','body.seven-lite','prefers-reduced-motion']){
  if(!v3.includes(token))throw new Error(`Visual polish v3 contract missing ${token}`);
}
if(v3.includes('backdrop-filter')||v3.includes('filter:blur('))throw new Error('Visual polish v3 introduced expensive always-on blur');

const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
for(const asset of ['./home-visual-polish-v1.js','./home-visual-polish-v2.js','./home-visual-polish-a11y-v1.js','./home-visual-polish-v3.js','./studio-preview-polish.css']){
  if(!index.includes(asset))throw new Error(`Visual polish asset not wired: ${asset}`);
}
if(!(index.indexOf('./home-visual-polish-v1.js')<index.indexOf('./home-visual-polish-v2.js')&&index.indexOf('./home-visual-polish-v2.js')<index.indexOf('./home-visual-polish-a11y-v1.js')&&index.indexOf('./home-visual-polish-a11y-v1.js')<index.indexOf('./home-visual-polish-v3.js'))){
  throw new Error('Visual polish module order is invalid');
}
const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');
for(const token of ['./home-visual-polish-v3.js','./studio-preview-polish.css','seven-design-studio-v18'])if(!sw.includes(token))throw new Error(`Current service worker missing ${token}`);

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
  const home=canvas.locator('[data-seven-home-visual-polish-v3="2026.09-visual-polish-v3"]');
  await home.waitFor({timeout:15000});
  if((await home.getAttribute('data-seven-home-completion'))!=='2026.09-home-v5')throw new Error('Visual polish v3 detached from Home V5');
  if((await home.getAttribute('data-seven-mark-polish'))!=='2026.09-mark-v2')throw new Error('Visual polish v3 lost the Seven mark');

  const rootVisual=await home.evaluate(el=>{const s=getComputedStyle(el);return{border:s.borderTopWidth,radius:s.borderTopLeftRadius,shadow:s.boxShadow}});
  if(parseFloat(rootVisual.border)!==0||parseFloat(rootVisual.radius)!==0||rootVisual.shadow!=='none')throw new Error(`Home regained prototype framing: ${JSON.stringify(rootVisual)}`);

  const composer=await canvas.locator('.v5-composer').evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return{h:r.height,tl:s.borderTopLeftRadius,bl:s.borderBottomLeftRadius,shadow:s.boxShadow}});
  if(composer.h<188||composer.h>225)throw new Error(`Composer hierarchy regressed: ${JSON.stringify(composer)}`);
  if(parseFloat(composer.tl)<24||parseFloat(composer.bl)>10||composer.shadow==='none')throw new Error(`Composer lost Seven geometry/elevation: ${JSON.stringify(composer)}`);

  const primary=await canvas.locator('.v5-mode,.v5-context').evaluateAll(els=>els.map(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return{h:r.height,w:r.width,border:s.borderTopWidth,bg:s.backgroundColor}}));
  if(primary.some(x=>x.h<48||x.w<48||parseFloat(x.border)!==0))throw new Error(`Composer controls are heavy or undersized: ${JSON.stringify(primary)}`);
  const ghost=await canvas.locator('.v5-round').first().evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return{w:r.width,h:r.height,border:s.borderTopWidth,shadow:s.boxShadow}});
  if(ghost.w<48||ghost.h<48||parseFloat(ghost.border)!==0||ghost.shadow!=='none')throw new Error(`Composer utility control regressed: ${JSON.stringify(ghost)}`);

  const shortcuts=await canvas.locator('.v5-shortcuts').evaluate(el=>{const s=getComputedStyle(el);return{display:s.display,overflow:s.overflowX,sw:el.scrollWidth,cw:el.clientWidth}});
  if(shortcuts.display!=='flex'||!['auto','scroll'].includes(shortcuts.overflow))throw new Error(`Intent rail regressed: ${JSON.stringify(shortcuts)}`);
  if(await canvas.locator('.v4-shortcut').first().evaluate(el=>getComputedStyle(el).flexDirection)!=='row')throw new Error('Intent shortcuts returned to card stacks');

  const nowSurface=await canvas.locator('.v5-now-surface').evaluate(el=>{const s=getComputedStyle(el);return{border:s.borderTopWidth,radius:s.borderTopLeftRadius}});
  if(parseFloat(nowSurface.border)!==0||parseFloat(nowSurface.radius)!==0)throw new Error(`Now regained a heavy outer container: ${JSON.stringify(nowSurface)}`);
  if(await canvas.locator('.v5-live').evaluate(el=>getComputedStyle(el).display)!=='none')throw new Error('Redundant Live badge is still visually competing with task state');

  const nav=await canvas.locator('.v5-bottom-nav').evaluate(el=>{const s=getComputedStyle(el);return{left:s.left,right:s.right,bottom:s.bottom,radius:s.borderTopLeftRadius}});
  if(parseFloat(nav.left)!==0||parseFloat(nav.right)!==0||parseFloat(nav.bottom)!==0||parseFloat(nav.radius)!==0)throw new Error(`Bottom navigation is not edge-integrated: ${JSON.stringify(nav)}`);
  const orb=await canvas.locator('.v5-orb-button').evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return{w:r.width,h:r.height,shadow:s.boxShadow,bg:s.backgroundColor}});
  if(orb.w>56||orb.h>60||orb.w<48||orb.h<48||orb.shadow!=='none')throw new Error(`Seven Orb container dominates navigation: ${JSON.stringify(orb)}`);

  const readable=await canvas.locator('.v5-eyebrow,.v5-input-hint,.v5-bottom-nav small,.v5-section-heading>button').evaluateAll(els=>els.filter(el=>getComputedStyle(el).display!=='none').map(el=>({text:el.textContent.trim(),size:parseFloat(getComputedStyle(el).fontSize)})));
  const tooSmall=readable.filter(x=>x.size<11);
  if(tooSmall.length)throw new Error(`Readability floor regressed: ${JSON.stringify(tooSmall)}`);

  await page.locator('#themeBtn').click();
  const day=await home.evaluate(el=>({bg:getComputedStyle(el).backgroundImage,color:getComputedStyle(el).color}));
  if(!day.bg.includes('gradient')||!day.color)throw new Error('Day visual polish v3 failed');
  await page.locator('#themeBtn').click();
  await page.locator('#dirBtn').click();
  if((await canvas.locator('body').getAttribute('dir'))!=='rtl')throw new Error('RTL propagation failed after visual polish v3');
  await page.locator('#dirBtn').click();

  await page.locator('#deviceSelect').selectOption('320');
  await page.setViewportSize({width:320,height:760});
  const geom=await home.evaluate(el=>({sw:el.scrollWidth,cw:el.clientWidth}));
  if(geom.sw>geom.cw+1)throw new Error(`Visual polish v3 overflows Home at 320px: ${geom.sw}/${geom.cw}`);
  if(await canvas.locator('.v5-intro>div>p:last-child').evaluate(el=>getComputedStyle(el).display)!=='none')throw new Error('320px Home still wastes vertical space on explanatory copy');
  if(await canvas.locator('.v5-input-hint').evaluate(el=>getComputedStyle(el).display)!=='none')throw new Error('320px composer did not simplify its footer');
  const tiny=await canvas.locator('.v5-brand,.v5-icon-button,.v5-avatar,.v6-status,.v4-mode,.v4-context,.v4-add,.v4-voice,.v4-send,.v4-shortcut,.v4-active-row,.v4-resume-row,.v5-bottom-nav>button').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return{w:r.width,h:r.height,cls:el.className}}).filter(x=>x.w>0&&x.h>0&&(x.w<48||x.h<48)));
  if(tiny.length)throw new Error(`Visual polish v3 created undersized touch targets: ${JSON.stringify(tiny.slice(0,5))}`);

  await page.locator('#previewBtn').click();
  await page.locator('#previewShell:not([hidden])').waitFor();
  const frameChrome=await page.locator('#previewFrame').evaluate(el=>{const s=getComputedStyle(el);return{border:s.borderTopWidth,radius:s.borderTopLeftRadius}});
  if(parseFloat(frameChrome.border)!==0||parseFloat(frameChrome.radius)!==0)throw new Error(`Mobile preview chrome still masquerades as APK UI: ${JSON.stringify(frameChrome)}`);
  const preview=page.locator('#previewFrame').contentFrame();
  const pHome=preview.locator('[data-seven-home-visual-polish-v3="2026.09-visual-polish-v3"]');
  await pHome.waitFor({timeout:10000});
  if(await preview.locator('.v5-shortcuts').evaluate(el=>getComputedStyle(el).display)!=='flex')throw new Error('Prototype preview lost the intent rail');
  if(await preview.locator('.v5-live').evaluate(el=>getComputedStyle(el).display)!=='none')throw new Error('Prototype preview restored redundant Live badge');

  await preview.locator('.v4-all').click();
  const sheet=preview.locator('.v5-layer:not([hidden])');
  await sheet.waitFor({timeout:5000});
  await sheet.locator('[data-seven-catalog-extra="2026.09-capability-catalog-v1"]').waitFor({timeout:5000});
  if(await sheet.locator('.v5-command').count()<60)throw new Error('Visual polish v3 hid progressive capability coverage');

  if(errors.length)throw new Error(`Browser errors: ${errors.slice(0,5).join(' | ')}`);
  await browser.close();server.close();
  console.log('SEVEN_HOME_VISUAL_POLISH_V3_PASS');
})().catch(err=>{console.error(err);server.close();process.exit(1);});
