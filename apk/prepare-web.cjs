const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const DIST=path.join(ROOT,'dist');
const SRC=path.join(DIST,'seven-ultimate-release.html');
const WWW=path.join(ROOT,'www');
function copyDir(src,dst){if(!fs.existsSync(src))return;fs.mkdirSync(dst,{recursive:true});for(const e of fs.readdirSync(src,{withFileTypes:true})){const a=path.join(src,e.name),b=path.join(dst,e.name);if(e.isDirectory())copyDir(a,b);else fs.copyFileSync(a,b);}}
if(!fs.existsSync(SRC))throw new Error('integrated Ultimate release missing');
const html=fs.readFileSync(SRC,'utf8');
if(!html.includes('SEVEN_ULTIMATE_RELEASE_V1'))throw new Error('unverified Ultimate release refused');
if(fs.existsSync(WWW))fs.rmSync(WWW,{recursive:true,force:true});fs.mkdirSync(WWW,{recursive:true});
fs.copyFileSync(SRC,path.join(WWW,'index.html'));
for(const file of ['ultimate-app.js','ultimate-build.json']){const src=path.join(DIST,file);if(fs.existsSync(src))fs.copyFileSync(src,path.join(WWW,file));}
copyDir(path.join(DIST,'src'),path.join(WWW,'src'));
fs.writeFileSync(path.join(WWW,'seven-packaging.json'),JSON.stringify({format:'seven-android-ultimate-payload',version:2,build:'seven-ultimate-integrated-v1'},null,2));
console.log('android Ultimate web payload: PASS');
