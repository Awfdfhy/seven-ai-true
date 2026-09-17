const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const DIST=path.join(ROOT,'dist');
const SRC=path.join(DIST,'seven_ai-release.html');
const WWW=path.join(ROOT,'www');
const ROOT_LAZY=['attachment-runtime.js'];

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
fs.writeFileSync(path.join(WWW,'seven-packaging.json'),JSON.stringify({format:'seven-android-web-payload',version:4,lazyWorkspaces:true,adaptiveBrand:true,lazyRootAssets:ROOT_LAZY},null,2));
console.log('android web payload: PASS (root lazy assets: '+ROOT_LAZY.join(', ')+')');
