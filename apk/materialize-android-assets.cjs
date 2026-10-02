"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto"),sharp=require("sharp");
const ROOT=path.resolve(__dirname,"..");
const DEFAULT_ANDROID=path.join(ROOT,"android");
const DEFAULT_SOURCE=path.join(ROOT,"assets","logo.png");
const BACKGROUND="#121026";
const DENSITIES=Object.freeze({mdpi:1,hdpi:1.5,xhdpi:2,xxhdpi:3,xxxhdpi:4});
function mkdir(p){fs.mkdirSync(p,{recursive:true})}
function write(p,b){mkdir(path.dirname(p));fs.writeFileSync(p,b)}
function sha(b){return crypto.createHash("sha256").update(b).digest("hex")}
function round(n){return Math.max(1,Math.round(n))}
async function canvas(source,canvasPx,corePx,{background=null,mono=false}={}){
  let image=sharp(source).resize(corePx,corePx,{fit:"contain",withoutEnlargement:false});
  if(mono)image=image.tint("#ffffff");
  const core=await image.png().toBuffer();
  const base=sharp({create:{width:canvasPx,height:canvasPx,channels:4,background:background||{r:0,g:0,b:0,alpha:0}}});
  return base.composite([{input:core,gravity:"center"}]).png({compressionLevel:9}).toBuffer();
}
async function materialize({androidRoot=DEFAULT_ANDROID,sourcePath=DEFAULT_SOURCE,sourceBuffer=null,background=BACKGROUND}={}){
  const res=path.join(androidRoot,"app","src","main","res");
  if(!fs.existsSync(res))throw new Error("generated Android res directory missing");
  const source=sourceBuffer||fs.readFileSync(sourcePath);
  const outputs=[];
  for(const [density,scale] of Object.entries(DENSITIES)){
    const legacy=round(48*scale),adaptive=round(108*scale),safeCore=round(66*scale);
    const legacyBytes=await canvas(source,legacy,round(36*scale),{background});
    const foreground=await canvas(source,adaptive,safeCore,{});
    const monochrome=await canvas(source,adaptive,safeCore,{mono:true});
    for(const [name,bytes] of [["ic_launcher.png",legacyBytes],["ic_launcher_round.png",legacyBytes],["ic_launcher_foreground.png",foreground],["ic_launcher_monochrome.png",monochrome]]){
      const out=path.join(res,`mipmap-${density}`,name);write(out,bytes);outputs.push({path:path.relative(androidRoot,out),sha256:sha(bytes),bytes:bytes.length});
    }
  }
  const colorXml=`<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="seven_launcher_background">${background}</color></resources>\n`;
  write(path.join(res,"values","seven_launcher_colors.xml"),colorXml);
  const adaptive=`<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n  <background android:drawable="@color/seven_launcher_background"/>\n  <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n</adaptive-icon>\n`;
  const themed=`<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n  <background android:drawable="@color/seven_launcher_background"/>\n  <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n  <monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>\n</adaptive-icon>\n`;
  for(const name of ["ic_launcher.xml","ic_launcher_round.xml"]){write(path.join(res,"mipmap-anydpi-v26",name),adaptive);write(path.join(res,"mipmap-anydpi-v33",name),themed)}
  const splash=await canvas(source,1024,340,{background});write(path.join(res,"drawable","splash.png"),splash);outputs.push({path:"app/src/main/res/drawable/splash.png",sha256:sha(splash),bytes:splash.length});
  const manifest={schema:"seven.android-assets.v1",generator:"apk/materialize-android-assets.cjs",background,densities:Object.keys(DENSITIES),adaptiveLayerDp:108,safeCoreDp:66,legacyDp:48,themedMonochrome:true,outputs:outputs.sort((a,b)=>a.path.localeCompare(b))};
  manifest.seal=sha(Buffer.from(JSON.stringify(manifest)));
  write(path.join(androidRoot,"seven-android-assets.json"),JSON.stringify(manifest,null,2)+"\n");
  return manifest;
}
if(require.main===module)materialize().then(m=>console.log(`android native assets: PASS (${m.outputs.length} raster outputs; adaptive + themed XML; ${m.seal.slice(0,12)})`)).catch(e=>{console.error(e);process.exit(1)});
module.exports=Object.freeze({BACKGROUND,DENSITIES,materialize,sha});
