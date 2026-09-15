const fs=require('fs');
const http=require('http');
const path=require('path');
const vm=require('vm');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'tools/seven-design-studio');
for(const file of ['home-completion-v5.js','index.html','sw.js']){
  if(!fs.existsSync(path.join(dir,file)))throw new Error(`Missing ${file}`);
}
new vm.Script(fs.readFileSync(path.join(dir,'home-completion-v5.js'),'utf8'),{filename:'home-completion-v5.js'});
const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
if(!index.includes('./home-completion-v5.js'))throw new Error('Home completion module is not wired into index.html');
const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');
if(!sw.includes('./home-completion-v5.js'))throw new Error('Home completion module is not cached by service worker');

const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const raw=decodeURIComponent(req.url.split('?')[0]);
  let file=path.join(root,raw==='/'?'tools/seven-design-studio/index.html':raw.replace(/^\//,''));
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!file.startsWith(root)||!fs.existsSync(file)){res.statusCode=404;return res.end('not found');}
  res.setHeader('content-type',mime[path.extname(file)]||'text/plain');res.end(fs.readFileSync(file));
});

(async()=>{
  await new Promise(r=>server.listen(4177,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:4177/tools/seven-design-studio/index.html',{waitUntil:'networkidle',timeout:45000});
  await page.waitForSelector('.gjs-frame',{timeout:30000});
  const canvas=page.locator('.gjs-frame').contentFrame();
  const home=canvas.locator('[data-seven-home-completion="2026.09-home-v5"]');
  await home.waitFor({timeout:15000});

  if((await home.getAttribute('data-seven-home-version'))!=='2026.09-launchpad-v4')throw new Error('V5 broke the authoritative V4 launchpad contract');
  if((await home.getAttribute('data-seven-mark-polish'))!=='2026.09-mark-v2')throw new Error('V5 lost the polished Seven mark');
  if(await canvas.locator('.v4-shortcut').count()!==4)throw new Error('V5 must keep exactly four Home shortcuts');
  if(await canvas.locator('.v4-composer').count()!==1)throw new Error('V5 lost the Universal Composer');
  if(await canvas.locator('.v4-active-row').count()!==1||await canvas.locator('.v4-resume-row').count()!==1)throw new Error('V5 broke consolidated Now surface');

  const routes=String(await home.getAttribute('data-seven-capability-routes')||'').split(/\s+/).filter(Boolean);
  for(const required of ['chat','search','research','coding','create','world','rpg','canon','spaces','context','memory','files','pdf','vision','camera','voice','tools','models','providers','compute','verification','permissions','recovery','evolution','accessibility','rtl','performance']){
    if(!routes.includes(required))throw new Error(`V5 capability route missing: ${required}`);
  }

  const touchTargets=await canvas.locator('.v5-brand,.v5-icon-button,.v5-avatar,.v5-ready,.v4-mode,.v4-context,.v4-add,.v4-voice,.v4-send,.v4-shortcut,.v4-active-row,.v4-resume-row,.v5-bottom-nav>button').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {w:r.width,h:r.height,cls:el.className}}));
  const tiny=touchTargets.filter(x=>x.w>0&&x.h>0&&(x.w<48||x.h<48));
  if(tiny.length)throw new Error(`V5 undersized touch targets: ${JSON.stringify(tiny.slice(0,5))}`);

  await page.locator('#themeBtn').click();
  const day=await home.evaluate(el=>({color:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundImage}));
  if(!day.color||!day.bg.includes('gradient'))throw new Error('V5 Day theme failed');
  await page.locator('#themeBtn').click();
  await page.locator('#dirBtn').click();
  if((await canvas.locator('body').getAttribute('dir'))!=='rtl')throw new Error('V5 RTL propagation failed');
  await page.locator('#dirBtn').click();

  await page.locator('#deviceSelect').selectOption('320');
  await page.setViewportSize({width:320,height:760});
  const geometry=await home.evaluate(el=>({sw:el.scrollWidth,cw:el.clientWidth}));
  if(geometry.sw>geometry.cw+1)throw new Error(`V5 Home overflows at 320px: ${geometry.sw}/${geometry.cw}`);

  await page.locator('#previewBtn').click();
  await page.locator('#previewShell:not([hidden])').waitFor();
  const preview=page.locator('#previewFrame').contentFrame();
  await preview.locator('[data-seven-home-completion="2026.09-home-v5"]').waitFor({timeout:10000});
  const pLayer=preview.locator('.v5-layer:not([hidden])');

  await preview.locator('.v4-add').click();
  await pLayer.waitFor({timeout:5000});
  const addLabels=await pLayer.locator('.v5-action-tile small').allTextContents();
  for(const expected of ['Files','Photos','Camera','Scan','Web','Tools','Connect','Context'])if(!addLabels.includes(expected))throw new Error(`Add sheet missing ${expected}`);
  await pLayer.locator('[data-v5-close]').first().click();

  await preview.locator('.v4-mode').click();
  await pLayer.waitFor({timeout:5000});
  for(const mode of ['Auto','Fast','Balanced','Deep','Custom'])if(await pLayer.locator(`[data-v5-select-mode="${mode}"]`).count()!==1)throw new Error(`Mode sheet missing ${mode}`);
  await pLayer.locator('[data-v5-select-mode="Deep"]').click();
  if((await preview.locator('[data-v5-mode-label]').textContent()).trim()!=='Deep')throw new Error('Deep mode selection did not update composer');

  await preview.locator('.v4-context').click();
  await pLayer.waitFor({timeout:5000});
  if(await pLayer.locator('[data-v5-context-toggle]').count()!==6)throw new Error('Context sheet must expose six governed source families');
  const contextText=(await pLayer.textContent())||'';
  for(const expected of ['Conversation','Memories','Current Space','Files','Pinned','Sources','Context Compiler'])if(!contextText.includes(expected))throw new Error(`Context sheet missing ${expected}`);
  await pLayer.locator('[data-v5-close]').first().click();

  await preview.locator('.v4-all').click();
  await pLayer.waitFor({timeout:5000});
  if(await pLayer.locator('[data-v5-command-search]').count()!==1)throw new Error('Command Center search missing');
  const commands=pLayer.locator('.v5-command');
  if(await commands.count()<30)throw new Error(`Command Center is too shallow: ${await commands.count()} commands`);
  const commandText=(await pLayer.textContent())||'';
  for(const group of ['Ask','Make','Build','World','Use context','System'])if(!commandText.includes(group))throw new Error(`Command Center missing ${group}`);
  await pLayer.locator('[data-v5-command="permissions"]').click();
  await pLayer.waitFor({timeout:5000});
  if(!((await pLayer.textContent())||'').includes('READ_REMOTE'))throw new Error('Permission UI did not expose scoped authority');
  await pLayer.locator('[data-v5-close]').first().click();

  await preview.locator('.v4-shortcut.research').click();
  if(await preview.locator('.v5-active-chip').count()!==1)throw new Error('Specialist shortcut did not become a removable composer chip');

  await preview.locator('.v4-active-row').click();
  await pLayer.waitFor({timeout:5000});
  if(await pLayer.locator('[data-v5-task-control]').count()!==3)throw new Error('Task sheet missing pause/stop/retry controls');
  const taskText=(await pLayer.textContent())||'';
  for(const phase of ['Understand request','Plan sources','Research','Verify'])if(!taskText.includes(phase))throw new Error(`Task phase missing ${phase}`);
  await pLayer.locator('[data-v5-task-control="pause"]').click();
  if(!((await preview.locator('[data-v5-task-meta]').textContent())||'').includes('Paused'))throw new Error('Task pause state did not propagate');

  await preview.locator('.v5-ready').click();
  await pLayer.waitFor({timeout:5000});
  const stateText=(await pLayer.textContent())||'';
  for(const state of ['Ready','Waiting for permission','Offline / provider unavailable','Cancelled · completion uncertain','Recovery available'])if(!stateText.includes(state))throw new Error(`System-state UI missing ${state}`);

  if(errors.length)throw new Error(`Browser errors: ${errors.slice(0,5).join(' | ')}`);
  await browser.close();server.close();
  console.log('SEVEN_HOME_COMPLETION_V5_PASS');
})().catch(async err=>{console.error(err);server.close();process.exit(1);});
