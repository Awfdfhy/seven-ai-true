"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto"),{spawnSync,spawn}=require("child_process");
const android=require("../release/android-visual-certification.cjs");
const profile=require("./capture-android-release-profile.cjs");
const APP_ID="ai.seven.app",ACTIVITY="ai.seven.app/.MainActivity";
const DEFAULT_APK="android/app/build/outputs/apk/release/app-release.apk";
const DEFAULT_BUILD="evidence/android/build-identity.json";
function req(v,n){const s=String(v??"").trim();if(!s)throw Error(`${n} required`);return s}
function run(cmd,args,{allow=false,encoding="utf8",timeout=20000}={}){const r=spawnSync(cmd,args,{encoding,maxBuffer:32*1024*1024,timeout});if(!allow&&(r.error||r.status!==0))throw Error(`${cmd} ${args.join(" ")} failed: ${r.error?.message||r.stderr||r.stdout}`);return r}
function adb(...args){return run("adb",args)}
function sleep(ms){Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,ms)}
function shaBytes(b){return crypto.createHash("sha256").update(b).digest("hex")}
function writeJson(p,v){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+"\n")}
function textProp(name){return adb("shell","getprop",name).stdout.trim()}
function pngSizeBuffer(b){if(!Buffer.isBuffer(b)||b.length<24||b.toString("hex",0,8)!=="89504e470d0a1a0a")throw Error("invalid PNG bytes");return{width:b.readUInt32BE(16),height:b.readUInt32BE(20)}}
function wm(){
  const [widthPx,heightPx]=profile.lastPair(adb("shell","wm","size").stdout),densityDpi=profile.lastNumber(adb("shell","wm","density").stdout),density=densityDpi/160;
  return{widthPx,heightPx,densityDpi,density,widthDp:widthPx/density,heightDp:heightPx/density};
}
function deviceMeta(){
  const m=wm();return{serial:adb("get-serialno").stdout.trim(),manufacturer:textProp("ro.product.manufacturer")||"Android",model:textProp("ro.product.model")||"Android",androidVersion:textProp("ro.build.version.release")||"unknown",apiLevel:Number(textProp("ro.build.version.sdk")),fingerprint:textProp("ro.build.fingerprint"),...m};
}
function makeDevice(build,profileId,runId){
  const meta=deviceMeta(),sourceRef=`github-actions:${runId}:${profileId}:system-ui`;
  return android.createDeviceProof({environmentType:"EMULATOR",deviceIdentityHash:android.hash({serial:meta.serial,fingerprint:meta.fingerprint,manufacturer:meta.manufacturer,model:meta.model,androidVersion:meta.androidVersion,apiLevel:meta.apiLevel,widthPx:meta.widthPx,heightPx:meta.heightPx,densityDpi:meta.densityDpi}),manufacturer:meta.manufacturer,model:meta.model,androidVersion:meta.androidVersion,apiLevel:meta.apiLevel,widthDp:meta.widthDp,heightDp:meta.heightDp,density:meta.density,proofHash:android.hash({meta,buildSeal:build.seal,sourceRef}),sourceRef,capturedBy:"github-actions/android-system-ui"});
}
function attrs(s){const o={};for(const m of String(s).matchAll(/([A-Za-z0-9_:-]+)="([^"]*)"/g))o[m[1]]=m[2].replace(/&quot;/g,'"').replace(/&amp;/g,"&");return o}
function parseNodes(xml){return [...String(xml).matchAll(/<node\b([^>]*)\/?>/g)].map(m=>attrs(m[1]))}
function parseBounds(s){const m=String(s||"").match(/^\[(\d+),(\d+)\]\[(\d+),(\d+)\]$/);if(!m)return null;const x1=+m[1],y1=+m[2],x2=+m[3],y2=+m[4];if(x2<=x1||y2<=y1)return null;return{x1,y1,x2,y2,cx:Math.round((x1+x2)/2),cy:Math.round((y1+y2)/2)}}
function dumpUi(){
  const remote="/data/local/tmp/seven-launcher.xml";run("adb",["shell","uiautomator","dump",remote]);
  const r=spawnSync("adb",["exec-out","cat",remote],{encoding:"utf8",maxBuffer:8*1024*1024});
  if(r.error||r.status!==0||!r.stdout.includes("<hierarchy"))throw Error(`launcher UI dump unavailable: ${r.error?.message||r.stderr||r.stdout}`);
  return r.stdout;
}
function sevenNode(xml){return parseNodes(xml).find(n=>{const t=`${n.text||""} ${n["content-desc"]||""}`.trim();return /(^|\s)Seven(\s|$)/i.test(t)&&parseBounds(n.bounds)})||null}
function appsNode(xml){return parseNodes(xml).find(n=>/^(apps|all apps)$/i.test(String(n.text||n["content-desc"]||"").trim())&&parseBounds(n.bounds))||null}
function homeComponent(){
  const args=["resolve-activity","--brief","-a","android.intent.action.MAIN","-c","android.intent.category.HOME"];
  let r=run("adb",["shell","cmd","package",...args],{allow:true}),raw=`${r.stdout||""}\n${r.stderr||""}`;
  if(r.status!==0||!raw.includes("/")){r=run("adb",["shell","pm",...args],{allow:true});raw=`${r.stdout||""}\n${r.stderr||""}`}
  const out=raw.trim().split(/\r?\n/).filter(Boolean),c=[...out].reverse().find(x=>/^[A-Za-z0-9_.]+\/[A-Za-z0-9_.$]+$/.test(x.trim()));
  if(!c)throw Error(`HOME component unavailable: ${out.join(" | ")}`);
  return c.trim();
}
function home(){adb("shell","input","keyevent","KEYCODE_HOME");sleep(700)}
function openAllAppsAndFindSeven(){
  home();let xml=dumpUi(),node=sevenNode(xml);if(node)return{xml,node,context:"home"};
  const apps=appsNode(xml);
  if(apps){const b=parseBounds(apps.bounds);adb("shell","input","tap",String(b.cx),String(b.cy));sleep(700)}
  else {const m=wm();adb("shell","input","swipe",String(Math.round(m.widthPx*.5)),String(Math.round(m.heightPx*.82)),String(Math.round(m.widthPx*.5)),String(Math.round(m.heightPx*.24)),"450");sleep(800)}
  for(let i=0;i<12;i++){xml=dumpUi();node=sevenNode(xml);if(node)return{xml,node,context:"all-apps"};const m=wm();adb("shell","input","swipe",String(Math.round(m.widthPx*.55)),String(Math.round(m.heightPx*.78)),String(Math.round(m.widthPx*.55)),String(Math.round(m.heightPx*.28)),"350");sleep(450)}
  throw Error("Seven launcher node not found in genuine system launcher");
}
function ensureSevenOnHome(){
  home();let xml=dumpUi(),node=sevenNode(xml);if(node)return{xml,node,context:"home"};
  const found=openAllAppsAndFindSeven(),b=parseBounds(found.node.bounds),m=wm();
  adb("shell","input","swipe",String(b.cx),String(b.cy),String(Math.round(m.widthPx*.52)),String(Math.round(m.heightPx*.32)),"1400");
  sleep(1300);home();xml=dumpUi();node=sevenNode(xml);
  if(!node)throw Error("Seven could not be placed and verified on launcher workspace");
  return{xml,node,context:"home"};
}
function apkListing(apk){return run("unzip",["-l",apk]).stdout}
function requireResourceWitness(apk,scenario,api){
  const l=apkListing(apk),hash=()=>shaBytes(Buffer.from(l));
  const legacyRaster=/res\/mipmap-[^/\s]+\/ic_launcher\.(?:png|webp)/.test(l);
  const adaptiveXml=/res\/mipmap-anydpi-v26\/ic_launcher\.xml/.test(l);
  const themedXml=/res\/mipmap-anydpi-v33\/ic_launcher\.xml/.test(l);
  const monoRaster=/res\/mipmap-[^/\s]+\/ic_launcher_monochrome\.(?:png|webp)/.test(l);
  const splashRaster=/res\/drawable(?:-[^/\s]+)?\/splash\.(?:png|webp)/.test(l);
  if(scenario==="launcher-legacy"){
    if(api>=26)throw Error("legacy launcher proof requires pre-API26 platform");
    if(!legacyRaster)throw Error("legacy raster launcher resource missing from exact APK");
    return{class:"legacy-raster-pre-v26",witnessHash:hash()};
  }
  if(scenario==="launcher-adaptive"){
    if(api<26)throw Error("adaptive launcher proof requires API26+");
    if(!adaptiveXml)throw Error("adaptive launcher resource missing from exact APK");
    return{class:"adaptive-v26",witnessHash:hash()};
  }
  if(scenario==="launcher-themed"){
    if(api<33)throw Error("themed launcher proof requires API33+");
    if(!themedXml||!monoRaster)throw Error("monochrome themed launcher resources missing from exact APK");
    return{class:"monochrome-themed",witnessHash:hash()};
  }
  if(scenario==="splash"){
    if(!splashRaster)throw Error("splash resource missing from exact APK");
    return{class:"system-starting-window",witnessHash:hash()};
  }
  throw Error(`unsupported system scenario:${scenario}`);
}
function themedState(authority){
  for(const p of ["get_icon_themed","icon_themed"]){const r=run("adb",["shell","content","query","--uri",`content://${authority}/${p}`],{allow:true});const out=`${r.stdout||""}\n${r.stderr||""}`;if(r.status===0&&/boolean_value\s*=\s*(?:1|true)\b/i.test(out))return{path:p,raw:out.trim()}}
  return null;
}
function enableThemed(launcherPackage){
  const authority=`${launcherPackage}.grid_control`;let state=themedState(authority);if(state)return{authority,...state};
  for(const p of ["set_icon_themed","icon_themed"]){run("adb",["shell","content","update","--uri",`content://${authority}/${p}`,"--bind","boolean_value:b:true"],{allow:true});sleep(300);state=themedState(authority);if(state)return{authority,enabledVia:p,...state}}
  throw Error(`launcher themed-icon state cannot be enabled and verified through ${authority}`);
}
function screenHost(outPath){const r=spawnSync("adb",["exec-out","screencap","-p"],{encoding:null,maxBuffer:32*1024*1024});if(r.error||r.status!==0)throw Error(`system screencap failed: ${r.error?.message||r.stderr}`);const dim=pngSizeBuffer(r.stdout);fs.mkdirSync(path.dirname(outPath),{recursive:true});fs.writeFileSync(outPath,r.stdout);return{...dim,sha256:shaBytes(r.stdout)}}
function splashCapture(outPath){
  const remotePng="/data/local/tmp/seven-splash.png",remoteWitness="/data/local/tmp/seven-splash-window.txt";
  run("adb",["shell","rm","-f",remotePng,remoteWitness],{allow:true});adb("shell","am","force-stop",APP_ID);home();
  const loop=`i=0; while [ $i -lt 160 ]; do D="$(dumpsys window windows)"; printf '%s\\n' "$D" | grep -E 'Splash Screen ${APP_ID}|Starting[^[:cntrl:]]*${APP_ID}|${APP_ID}[^[:cntrl:]]*Splash' > ${remoteWitness} && { screencap -p ${remotePng}; exit 0; }; i=$((i+1)); sleep 0.02; done; exit 7`;
  const monitor=spawn("adb",["shell","sh","-c",loop],{stdio:"ignore"});sleep(80);
  run("adb",["shell","am","start","-n",ACTIVITY],{allow:false,timeout:8000});
  let ready=false;for(let i=0;i<120;i++){const r=run("adb",["shell","test","-s",remotePng],{allow:true});if(r.status===0){ready=true;break}sleep(50)}
  if(!ready){try{monitor.kill()}catch{}throw Error("genuine Android splash/starting-window witness was not observed")}
  const png=spawnSync("adb",["exec-out","cat",remotePng],{encoding:null,maxBuffer:32*1024*1024}),wit=spawnSync("adb",["exec-out","cat",remoteWitness],{encoding:"utf8",maxBuffer:2*1024*1024});
  if(png.error||png.status!==0||wit.error||wit.status!==0)throw Error("splash evidence export failed");
  const witness=String(wit.stdout||"").trim();if(!new RegExp(`Splash Screen ${APP_ID}|Starting.*${APP_ID}|${APP_ID}.*Splash`,"i").test(witness))throw Error("splash witness text invalid");
  const dim=pngSizeBuffer(png.stdout);fs.mkdirSync(path.dirname(outPath),{recursive:true});fs.writeFileSync(outPath,png.stdout);
  sleep(700);const windows=adb("shell","dumpsys","window","windows").stdout;if(!windows.includes(APP_ID))throw Error("app did not become foreground after witnessed splash");
  return{...dim,sha256:shaBytes(png.stdout),witness,witnessHash:shaBytes(Buffer.from(witness))};
}
function loadEvidence(outDir,build,profileId,runId){
  const p=path.join(outDir,"profile-evidence.json");
  if(fs.existsSync(p)){const e=JSON.parse(fs.readFileSync(p,"utf8"));if(e.buildSeal!==build.seal||e.artifactSha256!==build.artifactSha256)throw Error("existing profile evidence build drift");if(!android.verifyDeviceProof(e.device))throw Error("existing profile device proof invalid");return e}
  const device=makeDevice(build,profileId,runId);return{schema:"seven.android-release-profile-evidence.v1",profileId,buildSeal:build.seal,artifactSha256:build.artifactSha256,device,captures:[],captureFiles:{},systemWitnesses:{},claimBoundary:"SYSTEM_UI_RELEASE_BUILD_DEVICE_EVIDENCE"};
}
function main(env=process.env){
  const apk=path.resolve(env.SEVEN_RELEASE_APK||DEFAULT_APK),build=JSON.parse(fs.readFileSync(path.resolve(env.SEVEN_ANDROID_BUILD_IDENTITY||DEFAULT_BUILD),"utf8"));if(!android.verifyBuildIdentity(build))throw Error("verified release build identity required");if(profile.fileHash(apk)!==build.artifactSha256)throw Error("exact APK hash/build identity mismatch");
  adb("install","-r",apk);
  const profileId=req(env.SEVEN_ANDROID_PROFILE_ID||profile.inferProfileId(env),"profileId"),outDir=path.resolve(env.SEVEN_ANDROID_PROFILE_OUT||`evidence/android/profiles/${profileId}`),runId=env.GITHUB_RUN_ID||"local",e=loadEvidence(outDir,build,profileId,runId),api=e.device.apiLevel,homeComp=homeComponent(),launcherPackage=homeComp.split("/")[0];
  const scenarios=String(env.SEVEN_SYSTEM_SCENARIOS||"").split(",").map(x=>x.trim()).filter(Boolean);if(!scenarios.length)throw Error("SEVEN_SYSTEM_SCENARIOS required");
  fs.mkdirSync(path.join(outDir,"system-screenshots"),{recursive:true});e.systemWitnesses=e.systemWitnesses||{};e.captureFiles=e.captureFiles||{};
  for(const scenario of scenarios){
    const resource=requireResourceWitness(apk,scenario,api),file=path.join(outDir,"system-screenshots",`${scenario}.png`);let shot,witness;
    if(scenario==="splash"){shot=splashCapture(file);witness={kind:"android-starting-window",homeComponent:homeComp,resource,...shot};}
    else if(scenario==="launcher-themed"){const themed=enableThemed(launcherPackage),found=ensureSevenOnHome();shot=screenHost(file);witness={kind:"system-launcher-themed",homeComponent:homeComp,launcherPackage,themed,resource,uiHash:shaBytes(Buffer.from(found.xml)),bounds:found.node.bounds};}
    else {const found=openAllAppsAndFindSeven();shot=screenHost(file);witness={kind:scenario==="launcher-legacy"?"system-launcher-legacy":"system-launcher-adaptive",homeComponent:homeComp,launcherPackage,resource,uiHash:shaBytes(Buffer.from(found.xml)),bounds:found.node.bounds,context:found.context};}
    const receipt=android.createCaptureReceipt({build,device:e.device,scenario,captureMethod:"adb-screencap",screenshotSha256:shot.sha256,width:shot.width,height:shot.height,locale:textProp("persist.sys.locale")||textProp("ro.product.locale")||"en-US",direction:"ltr",theme:"system",reducedMotion:false,sourceRef:`github-actions:${runId}:${profileId}:${scenario}:system-ui:${android.hash(witness)}`});
    e.captures=(e.captures||[]).filter(c=>c.scenario!==scenario);e.captures.push(receipt);e.captureFiles[scenario]={path:`system-screenshots/${scenario}.png`,sha256:shot.sha256};e.systemWitnesses[scenario]=witness;
  }
  e.claimBoundary="GENUINE_RELEASE_BUILD_SYSTEM_UI_EVIDENCE_WITH_EXPLICIT_LAUNCHER_OR_STARTING_WINDOW_WITNESSES";writeJson(path.join(outDir,"profile-evidence.json"),e);
  console.log(`Android system visual evidence: PASS (${profileId}: ${scenarios.join(", ")})`);
}
if(require.main===module){try{main()}catch(e){console.error("Android system visual evidence: FAIL",e.message);process.exit(1)}}
module.exports=Object.freeze({attrs,parseNodes,parseBounds,sevenNode,appsNode,requireResourceWitness,themedState,homeComponent,main});