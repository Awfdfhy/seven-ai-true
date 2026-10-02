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
function versionParts(v){return String(v).split(/[^0-9]+/).filter(Boolean).map(Number)}
function compareVersions(a,b){const x=versionParts(a),y=versionParts(b),n=Math.max(x.length,y.length);for(let i=0;i<n;i++){const d=(x[i]||0)-(y[i]||0);if(d)return d}return String(a).localeCompare(String(b))}
function latestBuildTool(name){
  const sdk=process.env.ANDROID_HOME||process.env.ANDROID_SDK_ROOT;if(!sdk)throw Error("ANDROID_HOME/ANDROID_SDK_ROOT required for exact APK resource witness");
  const root=path.join(sdk,"build-tools");if(!fs.existsSync(root))throw Error(`Android build-tools unavailable at ${root}`);
  const versions=fs.readdirSync(root,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name).sort(compareVersions).reverse();
  for(const v of versions){const p=path.join(root,v,name);if(fs.existsSync(p))return p}
  throw Error(`${name} unavailable in Android build-tools`);
}
function apkResources(apk){const aapt=latestBuildTool("aapt"),out=run(aapt,["dump","resources",apk],{timeout:30000}).stdout;if(!out||!out.includes(APP_ID))throw Error("exact APK resource table unavailable");return out}
function resourcePresent(table,type,name){return new RegExp(`(?:${APP_ID.replace(/\./g,"\\.")}:)?${type}/${name}(?=[:\\s])`).test(table)}
function requireResourceWitness(apk,scenario,api){
  const table=apkResources(apk),hash=()=>shaBytes(Buffer.from(table));
  const launcher=resourcePresent(table,"mipmap","ic_launcher"),foreground=resourcePresent(table,"mipmap","ic_launcher_foreground"),background=resourcePresent(table,"color","seven_launcher_background"),mono=resourcePresent(table,"mipmap","ic_launcher_monochrome"),splash=resourcePresent(table,"drawable","splash");
  if(scenario==="launcher-legacy"){
    if(api>=26)throw Error("legacy launcher proof requires pre-API26 platform");
    if(!launcher)throw Error("legacy launcher resource identity missing from exact APK table");
    return{class:"legacy-raster-pre-v26",witnessHash:hash(),resourceTable:"aapt"};
  }
  if(scenario==="launcher-adaptive"){
    if(api<26)throw Error("adaptive launcher proof requires API26+");
    if(!launcher||!foreground||!background)throw Error(`adaptive launcher resources missing from exact APK table (launcher=${launcher},foreground=${foreground},background=${background})`);
    return{class:"adaptive-v26",witnessHash:hash(),resourceTable:"aapt"};
  }
  if(scenario==="launcher-themed"){
    if(api<33)throw Error("themed launcher proof requires API33+");
    if(!launcher||!foreground||!background||!mono)throw Error(`themed launcher resources missing from exact APK table (launcher=${launcher},foreground=${foreground},background=${background},mono=${mono})`);
    return{class:"monochrome-themed",witnessHash:hash(),resourceTable:"aapt"};
  }
  if(scenario==="splash"){
    if(!splash)throw Error("splash resource identity missing from exact APK table");
    return{class:"system-starting-window",witnessHash:hash(),resourceTable:"aapt"};
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
  const remotePng="/data/local/tmp/seven-splash.png",remoteWitness="/data/local/tmp/seven-splash-window.txt",captureControl="ANDROID_SHELL_WAIT_FOR_DEBUGGER_TRANSIENT_FREEZE";
  run("adb",["shell","rm","-f",remotePng,remoteWitness],{allow:true});
  // Freeze the exact non-debuggable RELEASE process before its first app frame so the
  // transient Android starting window can be observed without modifying APK bytes or app UI.
  // This is a capture-clock control only. It is always cleared before a normal relaunch proof.
  run("adb",["shell","am","clear-debug-app"],{allow:true});
  const freeze=run("adb",["shell","am","set-debug-app","-w",APP_ID],{allow:true});
  if(freeze.error||freeze.status!==0)throw Error(`Android splash capture freeze unavailable: ${freeze.error?.message||freeze.stderr||freeze.stdout}`);
  adb("shell","am","force-stop",APP_ID);home();
  const expr=`(Splash Screen|Starting Window|Starting).*${APP_ID.replace(/\./g,"\\.")}|${APP_ID.replace(/\./g,"\\.")}.*(Splash|Starting)`;
  const loop=`i=0; while [ $i -lt 480 ]; do S="$(dumpsys SurfaceFlinger --list 2>/dev/null)"; M="$(printf '%s\\n' "$S" | grep -Ei '${expr}' | head -n 8)"; if [ -n "$M" ]; then { printf 'source=SurfaceFlinger\\n'; printf '%s\\n' "$M"; } > ${remoteWitness}; screencap -p ${remotePng} && exit 0; fi; if [ $((i%12)) -eq 0 ]; then W="$(dumpsys window windows 2>/dev/null)"; M="$(printf '%s\\n' "$W" | grep -Ei '${expr}' | head -n 8)"; if [ -n "$M" ]; then { printf 'source=WindowManager\\n'; printf '%s\\n' "$M"; } > ${remoteWitness}; screencap -p ${remotePng} && exit 0; fi; fi; i=$((i+1)); done; exit 7`;
  let monitor=null,captured=null;
  try{
    monitor=spawn("adb",["shell","sh","-c",loop],{stdio:"ignore"});sleep(40);
    run("adb",["shell","am","start","-n",ACTIVITY,"--splashscreen-show-icon"],{allow:false,timeout:8000});
    let ready=false;for(let i=0;i<240;i++){const r=run("adb",["shell","test","-s",remotePng],{allow:true});if(r.status===0){ready=true;break}sleep(50)}
    if(!ready)throw Error("genuine Android splash/starting-window compositor witness was not observed under bounded transient freeze");
    const png=spawnSync("adb",["exec-out","cat",remotePng],{encoding:null,maxBuffer:32*1024*1024}),wit=spawnSync("adb",["exec-out","cat",remoteWitness],{encoding:"utf8",maxBuffer:2*1024*1024});
    if(png.error||png.status!==0||wit.error||wit.status!==0)throw Error("splash evidence export failed");
    const rawWitness=String(wit.stdout||"").trim(),source=/^source=(SurfaceFlinger|WindowManager)$/m.exec(rawWitness)?.[1];
    if(!source||!new RegExp(`(?:Splash Screen|Starting Window|Starting).*${APP_ID.replace(/\./g,"\\.")}|${APP_ID.replace(/\./g,"\\.")}.*(?:Splash|Starting)`,"i").test(rawWitness))throw Error("splash compositor/window witness text invalid");
    const witness=`captureControl=${captureControl}\n${rawWitness}`,dim=pngSizeBuffer(png.stdout);fs.mkdirSync(path.dirname(outPath),{recursive:true});fs.writeFileSync(outPath,png.stdout);
    captured={...dim,sha256:shaBytes(png.stdout),witness,witnessSource:source,witnessHash:shaBytes(Buffer.from(witness)),captureControl};
  }finally{
    try{if(monitor)monitor.kill()}catch{}
    const clear=run("adb",["shell","am","clear-debug-app"],{allow:true});
    if(clear.error||clear.status!==0)throw Error(`Android splash capture cleanup failed: ${clear.error?.message||clear.stderr||clear.stdout}`);
  }
  if(!captured)throw Error("Android splash capture did not produce evidence");
  // Re-launch normally after clearing the capture clock control. This prevents a frozen
  // debug-wait state from being mistaken for a healthy release launch.
  adb("shell","am","force-stop",APP_ID);run("adb",["shell","am","start","-n",ACTIVITY],{allow:false,timeout:8000});
  let resumed=false,last="";for(let i=0;i<30;i++){last=adb("shell","dumpsys","activity","activities").stdout;if(new RegExp(`(?:mResumedActivity|topResumedActivity|ResumedActivity)[^\\n]*${APP_ID.replace(/\./g,"\\.")}[^\\n]*MainActivity`,"i").test(last)){resumed=true;break}sleep(200)}
  if(!resumed)throw Error(`app did not normally resume after witnessed splash; activity=${String(last).split(/\r?\n/).filter(x=>/ResumedActivity|mResumedActivity|topResumedActivity/.test(x)).slice(0,4).join(" ; ")||"<unknown>"}`);
  return captured;
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
module.exports=Object.freeze({attrs,parseNodes,parseBounds,sevenNode,appsNode,versionParts,compareVersions,latestBuildTool,apkResources,resourcePresent,requireResourceWitness,themedState,homeComponent,main});
