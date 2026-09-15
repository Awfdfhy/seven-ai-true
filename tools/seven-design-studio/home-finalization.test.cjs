const fs=require('fs');
const http=require('http');
const path=require('path');
const vm=require('vm');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'tools/seven-design-studio');
for(const file of ['home-visual-polish-v4.js','studio-preview-behavior.js','index.html','sw.js']){
  if(!fs.existsSync(path.join(dir,file)))throw new Error(`Missing ${file}`);
}
for(const file of ['home-visual-polish-v4.js','studio-preview-behavior.js'])new vm.Script(fs.readFileSync(path.join(dir,file),'utf8'),{filename:file});
const v4=fs.readFileSync(path.join(dir,'home-visual-polish-v4.js'),'utf8');
for(const token of ['2026.09-visual-polish-v4-final','--seven-home-visual-polish-v4-final','padding-bottom:calc(148px','scroll-padding-bottom','v5-shortcuts','prefers-reduced-motion'])if(!v4.includes(token))throw new Error(`Final Home contract missing ${token}`);
const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
if(!index.includes('./home-visual-polish-v4.js'))throw new Error('Final polish v4 not wired');
const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');
if(!sw.includes('./home-visual-polish-v4.js')||!sw.includes("seven-design-studio-v21"))throw new Error('Final polish v4 not cached in current Studio generation');

const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const raw=decodeURIComponent(req.url.split('?')[0]);
  let target=path.join(root,raw==='/'?'tools/seven-design-studio/index.html':raw.replace(/^\//,''));
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!target.startsWith(root)||!fs.existsSync(target)){res.statusCode=404;return res.end('not found');}
  res.setHeader('content-type',mime[path.extname(target)]||'text/plain');res.end(fs.readFileSync(target));
});

(async()=>{
  await new Promise(r=>server.listen(4180,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:320,height:760},isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:4180/tools/seven-design-studio/index.html',{waitUntil:'networkidle',timeout:45000});
  await page.waitForSelector('.gjs-frame',{timeout:30000});
  const canvas=page.locator('.gjs-frame').contentFrame();
  const home=canvas.locator('[data-seven-home-visual-polish-v4="2026.09-visual-polish-v4-final"]');
  await home.waitFor({timeout:15000});

  const pad=await home.evaluate(el=>parseFloat(getComputedStyle(el).paddingBottom));
  const navH=await canvas.locator('.v5-bottom-nav').evaluate(el=>el.getBoundingClientRect().height);
  if(pad<navH+55)throw new Error(`Home bottom breathing room is insufficient: padding=${pad}, nav=${navH}`);

  await page.locator('#deviceSelect').selectOption('320');
  await page.locator('#previewBtn').click();
  await page.locator('#previewShell:not([hidden])').waitFor();
  const preview=page.locator('#previewFrame').contentFrame();
  const pHome=preview.locator('[data-seven-home-completion="2026.09-home-v5"]');
  await pHome.waitFor({timeout:10000});
  await page.waitForTimeout(950);

  const pPad=await pHome.evaluate(el=>parseFloat(getComputedStyle(el).paddingBottom));
  const pNavH=await preview.locator('.v5-bottom-nav').evaluate(el=>el.getBoundingClientRect().height);
  if(pPad<pNavH+55)throw new Error(`Standalone preview lost final bottom clearance: padding=${pPad}, nav=${pNavH}`);
  const scrollY=await preview.locator('body').evaluate(()=>window.scrollY);
  if(Math.abs(scrollY)>1)throw new Error(`Preview did not reset to top: ${scrollY}`);
  const title=await preview.locator('.v5-intro h1').evaluate(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};});
  if(title.top<0)throw new Error(`Home title is clipped above the viewport: ${JSON.stringify(title)}`);
  const rail=await preview.locator('.v5-shortcuts').evaluate(el=>({left:el.scrollLeft,sw:el.scrollWidth,cw:el.clientWidth}));
  if(Math.abs(rail.left)>1)throw new Error(`LTR intent rail did not reset to Research: ${JSON.stringify(rail)}`);
  const first=await preview.locator('.v4-shortcut').first().evaluate(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};});
  if(first.left<0||first.right<=0)throw new Error(`First Home shortcut is clipped: ${JSON.stringify(first)}`);
  const geom=await pHome.evaluate(el=>({sw:el.scrollWidth,cw:el.clientWidth}));
  if(geom.sw>geom.cw+1)throw new Error(`Final Home overflows horizontally at 320px: ${geom.sw}/${geom.cw}`);

  if(errors.length)throw new Error(`Browser errors: ${errors.slice(0,5).join(' | ')}`);
  await browser.close();server.close();
  console.log('SEVEN_HOME_FINALIZATION_PASS');
})().catch(err=>{console.error(err);server.close();process.exit(1);});
