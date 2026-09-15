const fs=require('fs');
const http=require('http');
const path=require('path');
const vm=require('vm');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'tools/seven-design-studio');
for(const file of ['chat-ui-v1.js','index.html','sw.js'])if(!fs.existsSync(path.join(dir,file)))throw new Error(`Missing ${file}`);
const src=fs.readFileSync(path.join(dir,'chat-ui-v1.js'),'utf8');
new vm.Script(src,{filename:'chat-ui-v1.js'});
for(const token of ['2026.09-chat-v1','--seven-chat-ui-v1','seven-chat-v1','svchat-composer-zone','svchat-source-rail','svchat-code','prefers-reduced-motion'])if(!src.includes(token))throw new Error(`Chat contract missing ${token}`);
if(src.includes('backdrop-filter')||src.includes('filter:blur('))throw new Error('Chat introduced expensive always-on blur');
const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
if(!index.includes('./chat-ui-v1.js'))throw new Error('Chat UI is not wired into Design Studio');
const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');
if(!sw.includes('./chat-ui-v1.js')||!sw.includes('seven-design-studio-v21'))throw new Error('Chat UI is not in current offline shell cache');

const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const raw=decodeURIComponent(req.url.split('?')[0]);
  let target=path.join(root,raw==='/'?'tools/seven-design-studio/index.html':raw.replace(/^\//,''));
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!target.startsWith(root)||!fs.existsSync(target)){res.statusCode=404;return res.end('not found');}
  res.setHeader('content-type',mime[path.extname(target)]||'text/plain');res.end(fs.readFileSync(target));
});

(async()=>{
  await new Promise(r=>server.listen(4181,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:4181/tools/seven-design-studio/index.html',{waitUntil:'networkidle',timeout:45000});
  await page.waitForSelector('.gjs-frame',{timeout:30000});
  await page.waitForFunction(()=>{
    const ed=window.__sevenDesignEditor;
    return !!ed?.Pages?.get?.('seven-chat-v1')&&!!document.getElementById('sevenScreenQuick');
  },null,{timeout:15000});

  const selector=page.locator('#sevenScreenQuick');
  const labels=await selector.locator('option').allTextContents();
  if(!labels.includes('Home')||!labels.includes('Chat'))throw new Error(`Screen switcher missing Home/Chat: ${labels.join(', ')}`);
  await selector.selectOption('seven-chat-v1');
  const canvas=page.locator('.gjs-frame').contentFrame();
  const chat=canvas.locator('[data-seven-chat-version="2026.09-chat-v1"]');
  await chat.waitFor({timeout:10000});

  const geom=await chat.evaluate(el=>{const d=el.ownerDocument.documentElement,r=el.getBoundingClientRect();return{internalSW:el.scrollWidth,internalCW:el.clientWidth,minH:r.height,w:r.width,docSW:d.scrollWidth,docCW:d.clientWidth};});
  if(geom.docSW>geom.docCW+1)throw new Error(`Chat creates visible document overflow at 393px: ${geom.docSW}/${geom.docCW}`);
  const composer=await canvas.locator('.svchat-composer-zone').evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return{position:s.position,bottom:s.bottom,w:r.width,h:r.height}});
  if(composer.position!=='fixed'||parseFloat(composer.bottom)!==0||composer.w<geom.docCW*.95)throw new Error(`Chat composer is not keyboard-edge anchored: ${JSON.stringify({composer,viewportWidth:geom.docCW})}`);
  const targets=await canvas.locator('.svchat-icon,.svchat-primary,.svchat-response-actions button').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return{w:r.width,h:r.height}}).filter(x=>x.w>0&&x.h>0&&(x.w<48||x.h<48)));
  if(targets.length)throw new Error(`Chat has undersized primary touch targets: ${JSON.stringify(targets.slice(0,5))}`);
  const user=await canvas.locator('.svchat-user-bubble').first().evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return{w:r.width,bg:s.backgroundImage,radius:s.borderTopLeftRadius}});
  const answer=await canvas.locator('.svchat-answer').first().evaluate(el=>{const s=getComputedStyle(el);return{bg:s.backgroundColor,border:s.borderTopWidth}});
  if(user.w>330||!user.bg.includes('gradient'))throw new Error(`User turn hierarchy regressed: ${JSON.stringify(user)}`);
  if(answer.bg!=='rgba(0, 0, 0, 0)'&&answer.bg!=='transparent')throw new Error(`Assistant answer became another giant bubble: ${JSON.stringify(answer)}`);
  if(await canvas.locator('.svchat-code').count()<1||await canvas.locator('.svchat-source-rail button').count()<3)throw new Error('Chat lost code/evidence inline surfaces');
  const trace=await canvas.locator('.svchat-tool-trace').innerText();
  if(!/Researching/.test(trace)||!/sources checked/.test(trace))throw new Error('Chat task trace lost semantic text');

  await page.locator('#themeBtn').click();
  const day=await chat.evaluate(el=>({bg:getComputedStyle(el).backgroundImage,color:getComputedStyle(el).color}));
  if(!day.bg.includes('gradient')||!day.color)throw new Error('Day chat variant failed');
  await page.locator('#themeBtn').click();
  await page.locator('#dirBtn').click();
  if((await canvas.locator('body').getAttribute('dir'))!=='rtl')throw new Error('Chat RTL propagation failed');
  const codeDir=await canvas.locator('.svchat-code pre').evaluate(el=>getComputedStyle(el).direction);
  if(codeDir!=='ltr')throw new Error(`Code did not stay LTR in RTL mode: ${codeDir}`);
  await page.locator('#dirBtn').click();

  await page.locator('#deviceSelect').selectOption('320');
  await page.setViewportSize({width:320,height:760});
  const tinyGeom=await chat.evaluate(el=>{const d=el.ownerDocument.documentElement;return{docSW:d.scrollWidth,docCW:d.clientWidth};});
  if(tinyGeom.docSW>tinyGeom.docCW+1)throw new Error(`Chat creates visible document overflow at 320px: ${tinyGeom.docSW}/${tinyGeom.docCW}`);
  const firstSource=await canvas.locator('.svchat-source-rail button').first().evaluate(el=>{const r=el.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom};});
  if(firstSource.left<0||firstSource.right<=0)throw new Error(`First source is clipped at 320px: ${JSON.stringify(firstSource)}`);

  await page.locator('#previewBtn').click();
  await page.locator('#previewShell:not([hidden])').waitFor();
  const preview=page.locator('#previewFrame').contentFrame();
  const pChat=preview.locator('[data-seven-chat-version="2026.09-chat-v1"]');
  await pChat.waitFor({timeout:10000});
  if(await preview.locator('.svchat-composer').count()!==1)throw new Error('Standalone preview lost Chat composer');
  const pGeom=await pChat.evaluate(el=>{const d=el.ownerDocument.documentElement;return{docSW:d.scrollWidth,docCW:d.clientWidth};});
  if(pGeom.docSW>pGeom.docCW+1)throw new Error(`Standalone Chat preview creates document overflow: ${pGeom.docSW}/${pGeom.docCW}`);

  if(errors.length)throw new Error(`Browser errors: ${errors.slice(0,5).join(' | ')}`);
  await browser.close();server.close();
  console.log('SEVEN_CHAT_UI_V1_PASS');
})().catch(err=>{console.error(err);server.close();process.exit(1);});
