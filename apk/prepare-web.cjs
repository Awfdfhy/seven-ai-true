const fs=require('fs');
const path=require('path');
const {inventory,gitIdentity}=require('./build-provenance.cjs');
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
  const css='<style id="seven-rpg-standalone-style">html[data-seven-standalone-profile="rpg"] [data-seven-shell-workspace]:not([data-seven-shell-workspace="rpg"]),html[data-seven-standalone-profile="rpg"] [data-seven-github-selfdev],html[data-seven-standalone-profile="rpg"] .seven-ws-choice:not([data-ws="rpg"]),html[data-seven-standalone-profile="rpg"] [data-rpg-exit]{display:none!important}</style>';
  page=page.replace('</body>',css+'<script id="seven-rpg-standalone-entry" src="./rpg-standalone-entry.js"></script></body>');
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
  page=page.replace('</head>','<link rel="stylesheet" href="./rpg-standalone-ui.css"></head>');
  // Do not overwrite valid selections; repair only stale/unavailable model ids.
  // Seven uses this catalog when the user opens Settings, before making a call.
  const stale='            document.getElementById("modelSelect").value = currentModel;';
  const safe=
    '            const rpgModels = document.getElementById("modelSelect");\n' +
    '            if ([...rpgModels.options].some(o => o.value === currentModel)) rpgModels.value = currentModel;\n' +
    '            else if (rpgModels.options.length) { rpgModels.selectedIndex = 0; onModelChange(); }';
  if(!page.includes(stale))throw new Error('RPG model picker guard anchor missing');
  page=page.replace(stale,safe);

  // Non-RPG workspaces must not ship in the standalone APK. Shared chat/model
  // engines remain because RPG narration depends on them.
  const remove=['coding.js','research.js','research-v2.js','generated-ui.js','generated-ui.css'];
  for(const name of remove)fs.rmSync(path.join(WWW,'workspaces',name),{force:true});
  // Physically exclude non-RPG standalone assets rather than only hiding UI.
  // Keep the RPG hub and shared LLM/chat runtime until their dependencies are replaced.
  fs.rmSync(path.join(WWW,'github-self-dev.js'),{force:true});
  fs.rmSync(path.join(WWW,'workspaces','coding.css'),{force:true});
  fs.rmSync(path.join(WWW,'workspaces','self-development.js'),{force:true});
  fs.rmSync(path.join(WWW,'workspaces','self-development.css'),{force:true});
  fs.writeFileSync(index,page);
  console.log('Seven RPG dedicated Android profile: PASS (ai.seven.rpg; boot in RPG; exclude legacy standalone assets)');
}
fs.writeFileSync(path.join(WWW,'seven-packaging.json'),JSON.stringify({format:'seven-android-web-payload',version:5,...gitIdentity(ROOT),files:inventory(WWW),lazyWorkspaces:true,adaptiveBrand:true,lazyRootAssets:ROOT_LAZY},null,2));
console.log('android web payload: PASS (root lazy assets: '+ROOT_LAZY.join(', ')+')');
