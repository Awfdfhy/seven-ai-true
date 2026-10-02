"use strict";

const fs=require("fs");
const path=require("path");
const crypto=require("crypto");
const {spawnSync}=require("child_process");
const android=require("../release/android-visual-certification.cjs");
const profile=require("./capture-android-release-profile.cjs");
const systemVisuals=require("./capture-android-system-visuals.cjs");

const APP_ID="ai.seven.app";
const DEFAULT_APK="android/app/build/outputs/apk/release/app-release.apk";
const DEFAULT_BUILD="evidence/android/build-identity.json";
const DUMP_ATTEMPTS=8;

function run(args,{allow=false,encoding="utf8",timeout=20000,maxBuffer=16*1024*1024}={}){
  const r=spawnSync("adb",args,{encoding,timeout,maxBuffer});
  if(!allow&&(r.error||r.status!==0))throw Error(`adb ${args.join(" ")} failed: ${r.error?.message||r.stderr||r.stdout}`);
  return r;
}
function adb(...args){return run(args)}
function sleep(ms){Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,ms)}
function hashBytes(b){return crypto.createHash("sha256").update(b).digest("hex")}
function writeJson(p,v){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+"\n")}
function attrs(s){const out={};for(const m of String(s).matchAll(/([A-Za-z0-9_:-]+)="([^"]*)"/g))out[m[1]]=m[2].replace(/&quot;/g,'"').replace(/&amp;/g,"&");return out}
function nodes(xml){return [...String(xml).matchAll(/<node\b([^>]*)\/?>/g)].map(m=>attrs(m[1]))}
function bounds(s){const m=String(s||"").match(/^\[(\d+),(\d+)\]\[(\d+),(\d+)\]$/);if(!m)return null;const x1=+m[1],y1=+m[2],x2=+m[3],y2=+m[4];if(x2<=x1||y2<=y1)return null;return{x1,y1,x2,y2,cx:Math.round((x1+x2)/2),cy:Math.round((y1+y2)/2)}}
function text(n){return `${n.text||""} ${n["content-desc"]||""}`.trim()}
function labeled(n){return `${text(n)} ${n["resource-id"]||""}`.trim()}
function sevenNode(xml){return nodes(xml).find(n=>/(^|\s)Seven(?:\s|$)/i.test(text(n))&&bounds(n.bounds))||null}
function appsNode(xml){
  const candidates=nodes(xml).filter(n=>bounds(n.bounds));
  return candidates.find(n=>/(?:^|:id\/)(?:all_?apps(?:_button|_handle)?|apps_?button|allapps)(?:$|\b)/i.test(n["resource-id"]||""))
    ||candidates.find(n=>/^(?:all\s+apps|apps|apps\s+list)$/i.test(text(n)))
    ||null;
}
function searchNode(xml){
  return nodes(xml).filter(n=>bounds(n.bounds)).find(n=>/(?:search.*apps|apps.*search|search_box|search_input|input_search)/i.test(labeled(n)))||null;
}
function summary(xml){
  const rows=[];
  for(const n of nodes(xml)){
    const t=text(n),id=n["resource-id"]||"";
    if(!t&&!id)continue;
    const row=[t&&`text=${JSON.stringify(t)}`,id&&`id=${id}`,n.clickable==="true"&&"clickable",n.focusable==="true"&&"focusable"].filter(Boolean).join(" ");
    if(row&&!rows.includes(row))rows.push(row);
    if(rows.length>=45)break;
  }
  return rows.join(" | ")||"<no labeled UI nodes>";
}
function foreground(){
  const r=run(["shell","dumpsys","activity","activities"],{allow:true,timeout:12000});
  return String(r.stdout||"").split(/\r?\n/).map(x=>x.trim()).filter(x=>/mResumedActivity|topResumedActivity|ResumedActivity/.test(x)).slice(0,4).join(" ; ")||"<unknown>";
}
function dumpUi(){
  const remote="/data/local/tmp/seven-legacy-launcher.xml",failures=[];
  for(let attempt=1;attempt<=DUMP_ATTEMPTS;attempt++){
    run(["wait-for-device"],{allow:true,timeout:12000});
    run(["shell","rm","-f",remote],{allow:true,timeout:5000});
    let d=run(["shell","uiautomator","dump","--compressed",remote],{allow:true,timeout:12000});
    if(d.status!==0)d=run(["shell","uiautomator","dump",remote],{allow:true,timeout:12000});
    const read=run(["exec-out","cat",remote],{allow:true,timeout:8000});
    const xml=String(read.stdout||"");
    if(d.status===0&&read.status===0&&xml.includes("<hierarchy"))return xml;
    failures.push({attempt,dumpStatus:d.status,readStatus:read.status,error:String(d.error?.message||d.stderr||d.stdout||"").trim().slice(0,160)});
    if(attempt<DUMP_ATTEMPTS)sleep(300);
  }
  throw Error(`legacy launcher hierarchy unavailable; foreground=${foreground()}; attempts=${JSON.stringify(failures)}`);
}
function screenSize(){const [width,height]=profile.lastPair(adb("shell","wm","size").stdout);return{width,height}}
function tap(n,label){const b=bounds(n&&n.bounds);if(!b)throw Error(`${label} has no usable bounds`);adb("shell","input","tap",String(b.cx),String(b.cy));sleep(750);return b}
function home(){
  run(["wait-for-device"],{timeout:12000});
  run(["shell","input","keyevent","KEYCODE_WAKEUP"],{allow:true,timeout:5000});
  run(["shell","wm","dismiss-keyguard"],{allow:true,timeout:5000});
  adb("shell","input","keyevent","KEYCODE_HOME");sleep(900);
}
function homeComponent(){
  const args=["resolve-activity","--brief","-a","android.intent.action.MAIN","-c","android.intent.category.HOME"];
  let r=run(["shell","cmd","package",...args],{allow:true}),raw=`${r.stdout||""}\n${r.stderr||""}`;
  if(r.status!==0||!raw.includes("/")){r=run(["shell","pm",...args],{allow:true});raw=`${r.stdout||""}\n${r.stderr||""}`}
  const component=raw.trim().split(/\r?\n/).filter(Boolean).reverse().find(x=>/^[A-Za-z0-9_.]+\/[A-Za-z0-9_.$]+$/.test(x.trim()));
  if(!component)throw Error(`legacy HOME component unavailable: ${raw.trim()}`);
  return component.trim();
}
function dismissLauncherOnboarding(launcherPackage,trace){
  for(let i=0;i<4;i++){
    const xml=dumpUi();
    if(!foreground().includes(launcherPackage))return xml;
    const n=nodes(xml).find(x=>/^(?:got it|continue|next|ok)$/i.test(text(x))&&bounds(x.bounds)&&(x.clickable==="true"||x.focusable==="true"));
    if(!n)return xml;
    trace.push({action:"launcher-onboarding",label:text(n),bounds:tap(n,"launcher onboarding")});
  }
  return dumpUi();
}
function trySearch(xml,trace){
  const s=searchNode(xml);if(!s)return null;
  const b=tap(s,"launcher app search");trace.push({action:"search-apps",bounds:b,query:"Seven"});
  run(["shell","input","keyevent","KEYCODE_CTRL_LEFT"],{allow:true,timeout:3000});
  run(["shell","input","keyevent","KEYCODE_A"],{allow:true,timeout:3000});
  run(["shell","input","text","Seven"],{allow:false,timeout:5000});sleep(850);
  const q=dumpUi(),n=sevenNode(q);return n?{xml:q,node:n,context:"all-apps-search"}:null;
}
function inspectAndSearch(trace){const xml=dumpUi(),n=sevenNode(xml);if(n)return{xml,node:n,context:"all-apps"};return trySearch(xml,trace)}
function searchDrawer(trace){
  const size=screenSize();
  let found=inspectAndSearch(trace);if(found)return found;
  // API 24 Launcher3 variants differ: some use a vertical alphabetic drawer,
  // others retain paged/horizontal layouts. Exercise both using only visible input.
  for(let pass=0;pass<16;pass++){
    const vertical=pass%2===0;
    if(vertical){
      adb("shell","input","swipe",String(Math.round(size.width*.58)),String(Math.round(size.height*.78)),String(Math.round(size.width*.58)),String(Math.round(size.height*.27)),"360");
      trace.push({action:"scroll-all-apps-vertical",pass});
    }else{
      adb("shell","input","swipe",String(Math.round(size.width*.84)),String(Math.round(size.height*.56)),String(Math.round(size.width*.18)),String(Math.round(size.height*.56)),"360");
      trace.push({action:"page-all-apps-horizontal",pass});
    }
    sleep(500);found=inspectAndSearch(trace);if(found)return found;
  }
  return null;
}
function openAllAppsAndFindSeven(launcherPackage){
  const trace=[];home();let xml=dismissLauncherOnboarding(launcherPackage,trace),n=sevenNode(xml);
  if(n)return{xml,node:n,context:"home",trace};

  const explicit=appsNode(xml);
  if(explicit){
    trace.push({action:"tap-explicit-all-apps",label:text(explicit),resourceId:explicit["resource-id"]||"",bounds:tap(explicit,"All Apps")});
    let found=searchDrawer(trace);if(found)return{...found,trace};
    home();xml=dismissLauncherOnboarding(launcherPackage,trace);
  }

  const size=screenSize();
  // Genuine launcher geometry fallbacks. API24 AOSP Launcher3 commonly exposes
  // a center-hotseat Apps handle even when accessibility metadata omits its label.
  const strategies=[
    {kind:"tap-center-hotseat",x:.50,y:.88},
    {kind:"tap-upper-hotseat",x:.50,y:.82},
    {kind:"swipe-up-drawer",x1:.50,y1:.86,x2:.50,y2:.22},
    {kind:"swipe-up-short",x1:.50,y1:.91,x2:.50,y2:.48}
  ];
  for(const s of strategies){
    home();dismissLauncherOnboarding(launcherPackage,trace);
    if(!foreground().includes(launcherPackage))continue;
    if(s.x!==undefined){
      const x=Math.round(size.width*s.x),y=Math.round(size.height*s.y);adb("shell","input","tap",String(x),String(y));trace.push({action:s.kind,x,y});
    }else{
      const x1=Math.round(size.width*s.x1),y1=Math.round(size.height*s.y1),x2=Math.round(size.width*s.x2),y2=Math.round(size.height*s.y2);adb("shell","input","swipe",String(x1),String(y1),String(x2),String(y2),"480");trace.push({action:s.kind,x1,y1,x2,y2});
    }
    sleep(900);const found=searchDrawer(trace);if(found)return{...found,trace};
  }

  xml=dumpUi();
  throw Error(`Seven launcher node not found after bounded genuine API24 launcher navigation; home=${launcherPackage}; foreground=${foreground()}; ui=${summary(xml)}; trace=${JSON.stringify(trace.slice(-18))}`);
}
function pngSize(b){if(!Buffer.isBuffer(b)||b.length<24||b.toString("hex",0,8)!=="89504e470d0a1a0a")throw Error("invalid legacy launcher PNG");return{width:b.readUInt32BE(16),height:b.readUInt32BE(20)}}
function screen(outPath){const r=run(["exec-out","screencap","-p"],{encoding:null,timeout:12000,maxBuffer:32*1024*1024});const dim=pngSize(r.stdout);fs.mkdirSync(path.dirname(outPath),{recursive:true});fs.writeFileSync(outPath,r.stdout);return{...dim,sha256:hashBytes(r.stdout)}}
function textProp(name){return adb("shell","getprop",name).stdout.trim()}
function deviceProof(build,profileId,runId){
  const size=screenSize(),densityDpi=profile.lastNumber(adb("shell","wm","density").stdout),density=densityDpi/160;
  const meta={serial:adb("get-serialno").stdout.trim(),manufacturer:textProp("ro.product.manufacturer")||"Android",model:textProp("ro.product.model")||"Android",androidVersion:textProp("ro.build.version.release")||"unknown",apiLevel:Number(textProp("ro.build.version.sdk")),fingerprint:textProp("ro.build.fingerprint"),widthPx:size.width,heightPx:size.height,densityDpi};
  const sourceRef=`github-actions:${runId}:${profileId}:legacy-launcher`;
  return android.createDeviceProof({environmentType:"EMULATOR",deviceIdentityHash:android.hash(meta),manufacturer:meta.manufacturer,model:meta.model,androidVersion:meta.androidVersion,apiLevel:meta.apiLevel,widthDp:size.width/density,heightDp:size.height/density,density,proofHash:android.hash({meta,buildSeal:build.seal,sourceRef}),sourceRef,capturedBy:"github-actions/android-legacy-launcher-ui"});
}
function loadEvidence(outDir,build,profileId,runId){
  const p=path.join(outDir,"profile-evidence.json");
  if(fs.existsSync(p)){
    const e=JSON.parse(fs.readFileSync(p,"utf8"));
    if(e.buildSeal!==build.seal||e.artifactSha256!==build.artifactSha256)throw Error("legacy profile evidence build drift");
    if(!android.verifyDeviceProof(e.device))throw Error("legacy profile device proof invalid");
    return e;
  }
  return{schema:"seven.android-release-profile-evidence.v1",profileId,buildSeal:build.seal,artifactSha256:build.artifactSha256,device:deviceProof(build,profileId,runId),captures:[],captureFiles:{},systemWitnesses:{},claimBoundary:"SYSTEM_UI_RELEASE_BUILD_DEVICE_EVIDENCE"};
}
function main(env=process.env){
  const apk=path.resolve(env.SEVEN_RELEASE_APK||DEFAULT_APK),build=JSON.parse(fs.readFileSync(path.resolve(env.SEVEN_ANDROID_BUILD_IDENTITY||DEFAULT_BUILD),"utf8"));
  if(!android.verifyBuildIdentity(build))throw Error("verified release build identity required");
  if(profile.fileHash(apk)!==build.artifactSha256)throw Error("exact APK hash/build identity mismatch");
  adb("install","-r",apk);
  const profileId=String(env.SEVEN_ANDROID_PROFILE_ID||"api24-legacy").trim(),outDir=path.resolve(env.SEVEN_ANDROID_PROFILE_OUT||`evidence/android/profiles/${profileId}`),runId=env.GITHUB_RUN_ID||"local",e=loadEvidence(outDir,build,profileId,runId);
  if(e.device.apiLevel>=26)throw Error(`legacy launcher proof requires pre-API26 device; got API ${e.device.apiLevel}`);
  const resource=systemVisuals.requireResourceWitness(apk,"launcher-legacy",e.device.apiLevel),homeComp=homeComponent(),launcherPackage=homeComp.split("/")[0],found=openAllAppsAndFindSeven(launcherPackage),file=path.join(outDir,"system-screenshots","launcher-legacy.png"),shot=screen(file);
  const witness={kind:"system-launcher-legacy",proof:"genuine-uiautomator-plus-visible-input",homeComponent:homeComp,launcherPackage,resource,uiHash:hashBytes(Buffer.from(found.xml)),bounds:found.node.bounds,context:found.context,navigationTraceHash:android.hash(found.trace),navigationSteps:found.trace.length};
  const receipt=android.createCaptureReceipt({build,device:e.device,scenario:"launcher-legacy",captureMethod:"adb-screencap",screenshotSha256:shot.sha256,width:shot.width,height:shot.height,locale:textProp("persist.sys.locale")||textProp("ro.product.locale")||"en-US",direction:"ltr",theme:"system",reducedMotion:false,sourceRef:`github-actions:${runId}:${profileId}:launcher-legacy:${android.hash(witness)}`});
  e.captures=(e.captures||[]).filter(c=>c.scenario!=="launcher-legacy");e.captures.push(receipt);e.captureFiles=e.captureFiles||{};e.captureFiles["launcher-legacy"]={path:"system-screenshots/launcher-legacy.png",sha256:shot.sha256};e.systemWitnesses=e.systemWitnesses||{};e.systemWitnesses["launcher-legacy"]=witness;e.claimBoundary="GENUINE_RELEASE_BUILD_API24_LEGACY_LAUNCHER_UI_EVIDENCE";
  writeJson(path.join(outDir,"profile-evidence.json"),e);
  console.log(`Android legacy launcher evidence: PASS (${profileId}; ${found.context}; ${found.trace.length} visible-input steps)`);
}

if(require.main===module){try{main()}catch(e){console.error("Android legacy launcher evidence: FAIL",e.message);process.exit(1)}}
module.exports=Object.freeze({attrs,nodes,bounds,text,labeled,sevenNode,appsNode,searchNode,summary,main});
