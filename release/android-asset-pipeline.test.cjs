"use strict";
const assert=require("assert/strict"),fs=require("fs"),os=require("os"),path=require("path"),sharp=require("sharp");
const assets=require("../apk/materialize-android-assets.cjs");
let n=0;const ok=(v,m)=>{assert.ok(v,m);n++},eq=(a,b,m)=>{assert.equal(a,b,m);n++};
(async()=>{
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"seven-android-assets-"));
  try{
    const android=path.join(tmp,"android"),res=path.join(android,"app","src","main","res");fs.mkdirSync(res,{recursive:true});
    const source=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108"><path fill="#ffffff" d="M24 22h62L54 87H37l38-51H24z"/></svg>');
    const a=await assets.materialize({androidRoot:android,sourceBuffer:source});
    eq(a.schema,"seven.android-assets.v1");eq(a.adaptiveLayerDp,108);eq(a.safeCoreDp,66);eq(a.legacyDp,48);eq(a.themedMonochrome,true);eq(a.outputs.length,21);ok(/^[0-9a-f]{64}$/.test(a.seal));
    for(const density of Object.keys(assets.DENSITIES))for(const name of ["ic_launcher.png","ic_launcher_round.png","ic_launcher_foreground.png","ic_launcher_monochrome.png"]){const f=path.join(res,`mipmap-${density}`,name);ok(fs.existsSync(f),`${density}/${name}`)}
    for(const api of ["mipmap-anydpi-v26","mipmap-anydpi-v33"])for(const name of ["ic_launcher.xml","ic_launcher_round.xml"])ok(fs.existsSync(path.join(res,api,name)),`${api}/${name}`);
    const v33=fs.readFileSync(path.join(res,"mipmap-anydpi-v33","ic_launcher.xml"),"utf8");ok(v33.includes("<monochrome"));ok(v33.includes("@mipmap/ic_launcher_monochrome"));
    const v26=fs.readFileSync(path.join(res,"mipmap-anydpi-v26","ic_launcher.xml"),"utf8");ok(!v26.includes("<monochrome"));ok(v26.includes("@color/seven_launcher_background"));
    const colors=fs.readFileSync(path.join(res,"values","seven_launcher_colors.xml"),"utf8");ok(colors.includes(assets.BACKGROUND));
    const mdLegacy=await sharp(path.join(res,"mipmap-mdpi","ic_launcher.png")).metadata();eq(mdLegacy.width,48);eq(mdLegacy.height,48);
    const mdFg=await sharp(path.join(res,"mipmap-mdpi","ic_launcher_foreground.png")).metadata();eq(mdFg.width,108);eq(mdFg.height,108);
    const xxx=await sharp(path.join(res,"mipmap-xxxhdpi","ic_launcher_foreground.png")).metadata();eq(xxx.width,432);eq(xxx.height,432);
    const splash=await sharp(path.join(res,"drawable","splash.png")).metadata();eq(splash.width,1024);eq(splash.height,1024);
    const manifest=JSON.parse(fs.readFileSync(path.join(android,"seven-android-assets.json"),"utf8"));eq(manifest.seal,a.seal);eq(manifest.outputs.length,a.outputs.length);
    const first=a.outputs.map(x=>[x.path,x.sha256]);const b=await assets.materialize({androidRoot:android,sourceBuffer:source});eq(JSON.stringify(b.outputs.map(x=>[x.path,x.sha256])),JSON.stringify(first),"asset generation must be deterministic");eq(b.seal,a.seal,"manifest seal must be deterministic");
    const packageJson=JSON.parse(fs.readFileSync(path.join(__dirname,"..","package.json"),"utf8"));ok(!packageJson.devDependencies?.["@capacitor/assets"],"vulnerable legacy asset generator must be absent");ok(packageJson.scripts["android:generate"].includes("materialize-android-assets.cjs"));ok(packageJson.scripts["android:generate"].includes("npx --no-install cap"));ok(!packageJson.scripts["android:generate"].includes("capacitor-assets"));
    console.log(`Android Asset Pipeline: PASS (${n} assertions; local deterministic icons/splash, adaptive safe core, themed monochrome, no legacy capacitor-assets)`);
  }finally{fs.rmSync(tmp,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exit(1)});
