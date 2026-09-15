"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto"),sharp=require("sharp");
const brandContract=require("../release/brand-asset-contract.cjs");
const ROOT=path.resolve(__dirname,"..");
const DEFAULT_ANDROID=path.join(ROOT,"android");
const DEFAULT_SOURCE=path.join(ROOT,"assets","logo.png");
const DEFAULT_BRAND=path.join(ROOT,"brand","final");
const BACKGROUND="#121026";
const DENSITIES=Object.freeze({mdpi:1,hdpi:1.5,xhdpi:2,xxhdpi:3,xxxhdpi:4});
function mkdir(p){fs.mkdirSync(p,{recursive:true})}
function write(p,b){mkdir(path.dirname(p));fs.writeFileSync(p,b)}
function sha(b){return crypto.createHash("sha256").update(b).digest("hex")}
function round(n){return Math.max(1,Math.round(n))}
async function contain(source,canvasPx,corePx,{background=null,mono=false}={}){let image=sharp(source).resize(corePx,corePx,{fit:"contain",withoutEnlargement:false});if(mono)image=image.tint("#ffffff");const core=await image.png().toBuffer();return sharp({create:{width:canvasPx,height:canvasPx,channels:4,background:background||{r:0,g:0,b:0,alpha:0}}}).composite([{input:core,gravity:"center"}]).png({compressionLevel:9}).toBuffer()}
async function fullLayer(source,px){return sharp(source).resize(px,px,{fit:"fill"}).png({compressionLevel:9}).toBuffer()}
async function compositeLayers(background,foreground,px,foregroundPx=px){const bg=await sharp(background).resize(px,px,{fit:"fill"}).png().toBuffer(),fg=await sharp(foreground).resize(foregroundPx,foregroundPx,{fit:"contain"}).png().toBuffer();return sharp(bg).composite([{input:fg,gravity:"center"}]).png({compressionLevel:9}).toBuffer()}
function loadApprovedBrand({root=ROOT,brandDir=DEFAULT_BRAND}={}){
  const manifestPath=path.join(brandDir,"brand-export-manifest.json"),planPath=path.join(brandDir,"consumption-plan.json");if(!fs.existsSync(manifestPath)||!fs.existsSync(planPath))return null;
  const manifest=JSON.parse(fs.readFileSync(manifestPath,"utf8")),plan=JSON.parse(fs.readFileSync(planPath,"utf8"));if(!brandContract.verifyBrandExportManifest(manifest,{root,requireFiles:true})||!brandContract.verifyConsumptionPlan(plan,manifest))throw new Error("brand/final exists but approved brand manifest/consumption plan is invalid");
  const readItem=x=>{const full=path.resolve(root,x.path);const b=fs.readFileSync(full);if(sha(b)!==x.sha256)throw new Error(`approved brand asset hash drift: ${x.path}`);return b};
  return Object.freeze({sourceMode:"brand-final",candidateSeal:manifest.candidateSeal,brandManifestSeal:manifest.seal,consumptionPlanSeal:plan.seal,master:readItem(plan.master),monochrome:readItem(plan.monochrome),day:readItem(plan.day),night:readItem(plan.night),adaptiveForeground:readItem(plan.adaptiveForeground),adaptiveBackground:readItem(plan.adaptiveBackground),themedMonochrome:readItem(plan.themedMonochrome),approvedHashes:{master:plan.master.sha256,monochrome:plan.monochrome.sha256,day:plan.day.sha256,night:plan.night.sha256,adaptiveForeground:plan.adaptiveForeground.sha256,adaptiveBackground:plan.adaptiveBackground.sha256,themedMonochrome:plan.themedMonochrome.sha256}})
}
async function materialize({androidRoot=DEFAULT_ANDROID,sourcePath=DEFAULT_SOURCE,sourceBuffer=null,brandSources=null,root=ROOT,brandDir=DEFAULT_BRAND,background=BACKGROUND}={}){
  const res=path.join(androidRoot,"app","src","main","res");if(!fs.existsSync(res))throw new Error("generated Android res directory missing");
  let approved=null,sourceMode="legacy-source";if(brandSources){approved=brandSources;sourceMode=String(brandSources.sourceMode||"brand-sources")}else if(!sourceBuffer)approved=loadApprovedBrand({root,brandDir});if(approved)sourceMode=approved.sourceMode||"brand-final";
  const source=sourceBuffer||(!approved?fs.readFileSync(sourcePath):null),outputs=[];
  for(const [density,scale] of Object.entries(DENSITIES)){
    const legacy=round(48*scale),adaptive=round(108*scale),safeCore=round(66*scale);let legacyBytes,foreground,monochrome,backgroundBytes=null;
    if(approved){
      legacyBytes=await compositeLayers(approved.adaptiveBackground,approved.master,legacy,legacy);
      foreground=await fullLayer(approved.adaptiveForeground,adaptive);
      monochrome=await fullLayer(approved.themedMonochrome,adaptive);
      backgroundBytes=await fullLayer(approved.adaptiveBackground,adaptive);
    }else{
      legacyBytes=await contain(source,legacy,round(36*scale),{background});foreground=await contain(source,adaptive,safeCore,{});monochrome=await contain(source,adaptive,safeCore,{mono:true});
    }
    const files=[["ic_launcher.png",legacyBytes],["ic_launcher_round.png",legacyBytes],["ic_launcher_foreground.png",foreground],["ic_launcher_monochrome.png",monochrome]];if(backgroundBytes)files.push(["ic_launcher_background.png",backgroundBytes]);
    for(const [name,bytes] of files){const out=path.join(res,`mipmap-${density}`,name);write(out,bytes);outputs.push({path:path.relative(androidRoot,out),sha256:sha(bytes),bytes:bytes.length})}
  }
  const backgroundRef=approved?"@mipmap/ic_launcher_background":"@color/seven_launcher_background";const colorXml=`<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="seven_launcher_background">${background}</color></resources>\n`;write(path.join(res,"values","seven_launcher_colors.xml"),colorXml);
  const adaptive=`<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n  <background android:drawable="${backgroundRef}"/>\n  <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n</adaptive-icon>\n`,themed=`<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n  <background android:drawable="${backgroundRef}"/>\n  <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n  <monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>\n</adaptive-icon>\n`;
  for(const name of ["ic_launcher.xml","ic_launcher_round.xml"]){write(path.join(res,"mipmap-anydpi-v26",name),adaptive);write(path.join(res,"mipmap-anydpi-v33",name),themed)}
  let splash;if(approved)splash=await compositeLayers(approved.adaptiveBackground,approved.day||approved.master,1024,340);else splash=await contain(source,1024,340,{background});write(path.join(res,"drawable","splash.png"),splash);outputs.push({path:"app/src/main/res/drawable/splash.png",sha256:sha(splash),bytes:splash.length});
  const manifest={schema:"seven.android-assets.v1",generator:"apk/materialize-android-assets.cjs",sourceMode,background,densities:Object.keys(DENSITIES),adaptiveLayerDp:108,safeCoreDp:66,legacyDp:48,themedMonochrome:true,candidateSeal:approved?.candidateSeal||null,brandManifestSeal:approved?.brandManifestSeal||null,consumptionPlanSeal:approved?.consumptionPlanSeal||null,approvedHashes:approved?.approvedHashes||null,outputs:outputs.sort((a,b)=>a.path.localeCompare(b))};manifest.seal=sha(Buffer.from(JSON.stringify(manifest)));write(path.join(androidRoot,"seven-android-assets.json"),JSON.stringify(manifest,null,2)+"\n");return manifest
}
if(require.main===module)materialize().then(m=>console.log(`android native assets: PASS (${m.outputs.length} raster outputs; source=${m.sourceMode}; adaptive + themed XML; ${m.seal.slice(0,12)})`)).catch(e=>{console.error(e);process.exit(1)});
module.exports=Object.freeze({BACKGROUND,DENSITIES,loadApprovedBrand,materialize,sha});
