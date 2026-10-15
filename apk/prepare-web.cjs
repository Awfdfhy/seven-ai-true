const fs=require('fs');
const path=require('path');
const {inventory,gitIdentity}=require('./build-provenance.cjs');
const {patchRpgModelRuntime}=require('./rpg-model-repair.cjs');
const {removeLegacyUi}=require('./rpg-shell.cjs');
const ROOT=path.resolve(__dirname,'..');
const DIST=path.join(ROOT,'dist');
const SRC=path.join(DIST,'seven_ai-release.html');
const WWW=path.join(ROOT,'www');
const ROOT_LAZY=JSON.parse(fs.readFileSync(path.join(ROOT,'capacitor.config.json'),'utf8')).appId==='ai.seven.rpg' ? ['attachment-runtime.js'] : ['attachment-runtime.js','github-self-dev.js'];

function copyDir(src,dst){
  if(!fs.existsSync(src))return;
  fs.mkdirSync(dst,{recursive:true});
  for(const e of fs.readdirSync(src,{withFileTypes:true})){
    const a=path.join(src,e.name),b=path.join(dst,e.name);
    if(e.isDirectory())copyDir(a,b);else fs.copyFileSync(a,b);
  }
}

if(!fs.existsSync(SRC))throw new Error('verified release missing');
const html=fs.readFileSync(SRC,'utf8');
if(!html.includes('SEVEN_FINAL_RELEASE_LAYER_V1'))throw new Error('unverified release refused');
fs.rmSync(WWW,{recursive:true,force:true});
fs.mkdirSync(WWW,{recursive:true});
fs.copyFileSync(SRC,path.join(WWW,'index.html'));
copyDir(path.join(DIST,'vendor'),path.join(WWW,'vendor'));
copyDir(path.join(DIST,'workspaces'),path.join(WWW,'workspaces'));
copyDir(path.join(DIST,'brand'),path.join(WWW,'brand'));
for(const name of ROOT_LAZY){
  const src=path.join(DIST,name),dst=path.join(WWW,name);
  if(!fs.existsSync(src))throw new Error('missing required lazy web runtime: '+name);
  fs.copyFileSync(src,dst);
}
// Standalone RPG is a DISTINCT Android application profile, not a renamed Seven AI APK.
// Preserve the shared Chat/LLM runtime (required by RPG), while hiding non-RPG entry points.
const profile=JSON.parse(fs.readFileSync(path.join(ROOT,'capacitor.config.json'),'utf8'));
if(profile.appId==='ai.seven.rpg'){
  const src=path.join(ROOT,'apk','rpg-standalone-entry.js');
  const index=path.join(WWW,'index.html');
  if(!fs.existsSync(src))throw new Error('RPG standalone entrypoint missing');
  let page=fs.readFileSync(index,'utf8');
  if(!page.includes('</body>')||!page.includes('SEVEN_FINAL_RELEASE_LAYER_V1'))throw new Error('RPG standalone source invalid');
  if(page.includes('seven-rpg-standalone-entry'))throw new Error('duplicate RPG standalone entrypoint');
  if(!page.includes('<title>Seven AI</title>'))throw new Error('expected base HTML title missing');
  page=page.replace('<title>Seven AI</title>','<title>Seven RPG</title>');
  // Ship a newly authored RPG shell, not the old Seven AI UI with CSS hidden.
  page=removeLegacyUi(page);
  // RPG theme must be active during HTML parsing, not after the late JS entry.
  // On older Android WebView a slow asset request otherwise exposes raw legacy
  // settings and a full-size launcher icon during first paint.
  page=page.replace(/<html\b([^>]*)>/i,(original,attributes)=>
    attributes.includes('data-seven-standalone-profile')?original:
      '<html'+attributes+' data-seven-standalone-profile="rpg">');
  if(!page.includes('data-seven-standalone-profile="rpg"'))throw Error('RPG initial paint profile not installed');
  page=page.replace('</body>','<script id="seven-rpg-standalone-entry" src="./rpg-standalone-entry.js"></script></body>');
  const runtimeSource=fs.readFileSync(path.join(ROOT,'seven_ai-final.html'),'utf8');
  const runtimeStart=runtimeSource.indexOf('window.SevenRuntime = (() => {');
  const runtimeEnd=runtimeSource.indexOf('        })();',runtimeStart);
  if(runtimeStart<0||runtimeEnd<=runtimeStart)throw Error('RPG memory runtime source not found');
  fs.writeFileSync(path.join(WWW,'rpg-memory-runtime.js'),runtimeSource.slice(runtimeStart,runtimeEnd+13));
  page=page.replace('<script id="seven-rpg-standalone-entry"','<script src="./rpg-memory-runtime.js"></script><script id="seven-rpg-standalone-entry"');
  fs.copyFileSync(src,path.join(WWW,'rpg-standalone-entry.js'));
  const skin=path.join(ROOT,'apk','rpg-standalone-ui.css');
  if(!fs.existsSync(skin))throw new Error('Standalone RPG design missing');
  fs.copyFileSync(skin,path.join(WWW,'rpg-standalone-ui.css'));
  // Minimal critical paint is inline so Android 14 never exposes the
  // hidden settings modal or unbounded logo if external CSS is delayed.
  const criticalPaint=[
    'html[data-seven-standalone-profile="rpg"]{color-scheme:dark;background:#090b17;color:#f9f5ff}',
    'html[data-seven-standalone-profile="rpg"] body{margin:0;background:#090b17;color:#f9f5ff;font-family:system-ui,sans-serif}',
    'html[data-seven-standalone-profile="rpg"] .rpg-application{display:flex;flex-direction:column;min-height:100dvh;max-width:100vw;overflow:hidden}',
    'html[data-seven-standalone-profile="rpg"] .rpg-header{display:flex;align-items:center;gap:12px;padding:12px;background:#171b2e}',
    'html[data-seven-standalone-profile="rpg"] .rpg-identity{display:flex;gap:8px;align-items:center}',
    'html[data-seven-standalone-profile="rpg"] .rpg-identity .app-icon{width:38px;height:38px;object-fit:contain}',
    'html[data-seven-standalone-profile="rpg"] .rpg-main{display:flex;flex:1;flex-direction:column;min-width:0;overflow:hidden}',
    'html[data-seven-standalone-profile="rpg"] .rpg-scene-vista{min-height:120px;background:linear-gradient(135deg,#19243e,#10172b);color:#f4e2c3;padding:14px}',
    'html[data-seven-standalone-profile="rpg"] #chat{flex:1;min-height:0;overflow:auto}',
    'html[data-seven-standalone-profile="rpg"] .rpg-composer{padding:12px;border-radius:16px;background:#1d233a}',
    'html[data-seven-standalone-profile="rpg"] [hidden]{display:none!important}',
    'html[data-seven-standalone-profile="rpg"] #settingsModal{display:none}',
    'html[data-seven-standalone-profile="rpg"] .rpg-settings[style*="display: flex"]{display:flex}',
    'html[data-seven-standalone-profile="rpg"] .rpg-header button{min-width:44px;min-height:44px;color:inherit;background:#2d3252;border:1px solid #78699e;border-radius:12px}'
  ].join('');
  page=page.replace('</head>','<style id="rpg-critical-paint">'+criticalPaint+'</style><link id="seven-rpg-standalone-style" rel="stylesheet" href="./rpg-standalone-ui.css"></head>');
  // Repair the free-model picker and persistent routing before packaging.
  page=patchRpgModelRuntime(page);
  page=page.replace('</body>','<script id="rpg-smart-controls" src="./rpg-smart-controls.js"></script></body>');
  fs.copyFileSync(path.join(ROOT,'apk','rpg-smart-controls.js'),path.join(WWW,'rpg-smart-controls.js'));
  // Android Keystore bridge; the APK never embeds GitHub Actions LLM secrets.
  page=page.replace('</body>','<script id="rpg-provider-keys" src="./rpg-provider-keys.js"></script></body>');
  fs.copyFileSync(path.join(ROOT,'apk','rpg-provider-keys.js'),path.join(WWW,'rpg-provider-keys.js'));
  // A fully local illustrated Visual Novel canvas, separate from the story engine.
  page=page.replace('</body>','<script id="seven-rpg-scene-controller" src="./rpg-scene-controller.js"></script></body>');
  fs.copyFileSync(path.join(ROOT,'apk','rpg-scene-controller.js'),path.join(WWW,'rpg-scene-controller.js'));

  // Physically remove every unrelated Seven AI workspace and its UI CSS/JS
  // from the signed standalone package. No generic workspace launchers survive.
  const workspaceDir=path.join(WWW,'workspaces');
  const keepWorkspace=name=>name==='hub.js'||name==='intelligence.js'||
    name==='world-runtime.js'||name==='canon-simulator.js'||
    name==='rtl.css'||/^rpg(?:[.-]|$)/i.test(name);
  if(!fs.existsSync(workspaceDir))throw Error('RPG workspace assets missing');
  for(const name of fs.readdirSync(workspaceDir)){
    if(!keepWorkspace(name))fs.rmSync(path.join(workspaceDir,name),{recursive:true,force:true});
  }
  fs.copyFileSync(path.join(ROOT,'apk','rpg-hub.js'),path.join(workspaceDir,'hub.js'));
  // Avoid lazy loading the self-development runtime from Seven AI.
  fs.rmSync(path.join(WWW,'github-self-dev.js'),{force:true});
  for(const required of ['hub.js','rpg.js','rpg-state.js','rpg-session.js','rpg-live-integration.js','canon-simulator.js','world-runtime.js']){
    if(!fs.existsSync(path.join(workspaceDir,required)))throw Error('RPG runtime asset missing: '+required);
  }
  fs.writeFileSync(index,page);
  require('node:child_process').execFileSync(process.execPath,[path.join(ROOT,'apk','build-rpg-scene-pack.cjs')],{
    cwd:ROOT,stdio:'inherit',timeout:600000
  });
  console.log('Seven RPG standalone: illustrated RPG shell, offline scene library and RPG-only assets: PASS');
}
fs.writeFileSync(path.join(WWW,'seven-packaging.json'),JSON.stringify({format:'seven-android-web-payload',version:5,...gitIdentity(ROOT),files:inventory(WWW),lazyWorkspaces:true,adaptiveBrand:true,lazyRootAssets:ROOT_LAZY},null,2));
console.log('android web payload: PASS (root lazy assets: '+ROOT_LAZY.join(', ')+')');
