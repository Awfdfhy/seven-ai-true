const fs=require('fs');
const path=require('path');
const {inventory,gitIdentity}=require('./build-provenance.cjs');
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
  page=page.replace('</head>','<link id="seven-rpg-standalone-style" rel="stylesheet" href="./rpg-standalone-ui.css"></head>');
  // Do not overwrite valid selections; repair only stale/unavailable model ids.
  // Seven uses this catalog when the user opens Settings, before making a call.
  const stale='            document.getElementById("modelSelect").value = currentModel;';
  const safe=
    '            const rpgModels = document.getElementById("modelSelect");\n' +
    '            if ([...rpgModels.options].some(o => o.value === currentModel)) rpgModels.value = currentModel;\n' +
    '            else if (rpgModels.options.length) { rpgModels.selectedIndex = 0; onModelChange(); }';
  if(!page.includes(stale))throw new Error('RPG model picker guard anchor missing');
  page=page.replace(stale,safe);

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
  console.log('Seven RPG standalone: native RPG shell, exclusive RPG hub and RPG-only assets: PASS');
}
fs.writeFileSync(path.join(WWW,'seven-packaging.json'),JSON.stringify({format:'seven-android-web-payload',version:5,...gitIdentity(ROOT),files:inventory(WWW),lazyWorkspaces:true,adaptiveBrand:true,lazyRootAssets:ROOT_LAZY},null,2));
console.log('android web payload: PASS (root lazy assets: '+ROOT_LAZY.join(', ')+')');
