"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto"),{spawnSync}=require("child_process");
const android=require("../release/android-visual-certification.cjs");
const SHOTS=Object.freeze([
  {scenario:"chat-day",file:"chat-day.png",locale:"en-US",direction:"ltr",theme:"day",reducedMotion:false},
  {scenario:"chat-night",file:"chat-night.png",locale:"en-US",direction:"ltr",theme:"night",reducedMotion:false},
  {scenario:"coding",file:"coding.png",locale:"en-US",direction:"ltr",theme:"night",reducedMotion:false},
  {scenario:"research",file:"research.png",locale:"en-US",direction:"ltr",theme:"night",reducedMotion:false},
  {scenario:"rpg",file:"rpg.png",locale:"en-US",direction:"ltr",theme:"night",reducedMotion:false},
  {scenario:"arabic-rtl",file:"arabic-rtl.png",locale:"ar-IQ",direction:"rtl",theme:"night",reducedMotion:false},
  {scenario:"reduced-motion",file:"reduced-motion.png",locale:"en-US",direction:"ltr",theme:"night",reducedMotion:true}
]);
const DEFAULT_RELEASE_APK="android/app/build/outputs/apk/release/app-release.apk";
const DEFAULT_TEST_APK="android/app/build/outputs/apk/androidTest/release/app-release-androidTest.apk";
const DEFAULT_BUILD_IDENTITY="evidence/android/build-identity.json";
const TEST_PACKAGE="ai.seven.app.test";
function req(v,n){const s=String(v??"").trim();if(!s)throw Error(`${n} required`);return s}
function run(cmd,args,{allow=false,encoding="utf8"}={}){const r=spawnSync(cmd,args,{encoding,maxBuffer:16*1024*1024});if(!allow&&(r.error||r.status!==0))throw Error(`${cmd} ${args.join(" ")} failed: ${r.error?.message||r.stderr||r.stdout}`);return r}
function adb(...args){return run("adb",args)}
function runAs(...args){return adb("shell","run-as",TEST_PACKAGE,...args)}
function extractPrivate(relative,local){
  const r=spawnSync("adb",["exec-out","run-as",TEST_PACKAGE,"cat",relative],{encoding:null,maxBuffer:32*1024*1024});
  if(r.error||r.status!==0)throw Error(`adb run-as evidence export failed for ${relative}: ${r.error?.message||String(r.stderr||r.stdout||"")}`);
  if(!Buffer.isBuffer(r.stdout)||r.stdout.length<24)throw Error(`private evidence export empty:${relative}`);
  fs.writeFileSync(local,r.stdout);
}
function textProp(name){return adb("shell","getprop",name).stdout.trim()}
function fileHash(p){return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex")}
function pngSize(p){const b=fs.readFileSync(p);if(b.length<24||b.toString("hex",0,8)!=="89504e470d0a1a0a")throw Error(`invalid PNG:${p}`);return{width:b.readUInt32BE(16),height:b.readUInt32BE(20)}}
function lastPair(s){const m=[...String(s).matchAll(/(\d+)\s*x\s*(\d+)/g)];if(!m.length)throw Error("wm size unavailable");const x=m[m.length-1];return[Number(x[1]),Number(x[2])]}
function lastNumber(s){const m=[...String(s).matchAll(/(\d+)/g)];if(!m.length)throw Error("numeric device metric unavailable");return Number(m[m.length-1][1])}
function writeJson(p,v){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+"\n")}
function inferProfileId(env=process.env){const explicit=String(env.SEVEN_ANDROID_PROFILE_ID||"").trim();if(explicit)return explicit;const api=Number(textProp("ro.build.version.sdk"));if(api===28)return"api28-compact";if(api===36)return"api36-modern";if(Number.isInteger(api)&&api>0)return`api${api}-device`;throw Error("cannot infer Android profile id")}
function captureProfile({apk,testApk,build,profileId,outDir,runId="local",environmentType="EMULATOR"}){
  if(!android.verifyBuildIdentity(build))throw Error("verified release build identity required");
  apk=path.resolve(req(apk,"apk"));testApk=path.resolve(req(testApk,"testApk"));outDir=path.resolve(req(outDir,"outDir"));profileId=req(profileId,"profileId");
  if(fileHash(apk)!==build.artifactSha256)throw Error("installed APK hash does not match build identity");
  fs.mkdirSync(outDir,{recursive:true});
  adb("install","-r",apk);adb("install","-r",testApk);
  runAs("rm","-rf","files/seven-visual");
  const inst=adb("shell","am","instrument","-w","-r","-e","class","ai.seven.app.SevenVisualEvidenceTest",`${TEST_PACKAGE}/androidx.test.runner.AndroidJUnitRunner`);
  if(!/OK\s*\(/.test(inst.stdout)&&!/OK\s*$/.test(inst.stdout))throw Error(`visual instrumentation did not report OK: ${inst.stdout}`);
  const shotDir=path.join(outDir,"screenshots");fs.mkdirSync(shotDir,{recursive:true});
  for(const s of SHOTS){const relative=`files/seven-visual/${s.file}`,local=path.join(shotDir,s.file);extractPrivate(relative,local);pngSize(local)}
  const wmSize=adb("shell","wm","size").stdout,wmDensity=adb("shell","wm","density").stdout,[widthPx,heightPx]=lastPair(wmSize),densityDpi=lastNumber(wmDensity),density=densityDpi/160;
  const meta={serial:adb("get-serialno").stdout.trim(),manufacturer:textProp("ro.product.manufacturer")||"Android",model:textProp("ro.product.model")||profileId,androidVersion:textProp("ro.build.version.release")||"unknown",apiLevel:Number(textProp("ro.build.version.sdk")),fingerprint:textProp("ro.build.fingerprint"),widthPx,heightPx,densityDpi};
  const sourceRef=`github-actions:${runId}:${profileId}`,device=android.createDeviceProof({environmentType,deviceIdentityHash:android.hash({serial:meta.serial,fingerprint:meta.fingerprint,manufacturer:meta.manufacturer,model:meta.model,androidVersion:meta.androidVersion,apiLevel:meta.apiLevel,widthPx,heightPx,densityDpi}),manufacturer:meta.manufacturer,model:meta.model,androidVersion:meta.androidVersion,apiLevel:meta.apiLevel,widthDp:widthPx/density,heightDp:heightPx/density,density,proofHash:android.hash({meta,buildSeal:build.seal,sourceRef}),sourceRef,capturedBy:"github-actions/android-apk"});
  const captures=SHOTS.map(s=>{const p=path.join(shotDir,s.file),dim=pngSize(p);return android.createCaptureReceipt({build,device,scenario:s.scenario,captureMethod:"instrumentation",screenshotSha256:fileHash(p),width:dim.width,height:dim.height,locale:s.locale,direction:s.direction,theme:s.theme,reducedMotion:s.reducedMotion,sourceRef:`${sourceRef}:${s.scenario}:release-app-state`})});
  const evidence={schema:"seven.android-release-profile-evidence.v1",profileId,buildSeal:build.seal,artifactSha256:build.artifactSha256,device,captures,captureFiles:Object.fromEntries(SHOTS.map(s=>[s.scenario,{path:`screenshots/${s.file}`,sha256:fileHash(path.join(shotDir,s.file))}])),instrumentation:{target:"ai.seven.app",runner:`${TEST_PACKAGE}/androidx.test.runner.AndroidJUnitRunner`,className:"ai.seven.app.SevenVisualEvidenceTest",result:"PASS"},claimBoundary:"GENUINE_RELEASE_APP_DEVICE_CAPTURES_FOR_IN_APP_STATES_ONLY_NO_LAUNCHER_OR_SPLASH_CLAIM"};
  writeJson(path.join(outDir,"profile-evidence.json"),evidence);console.log(`Android release profile: PASS (${profileId}, ${captures.length} genuine in-app scenarios, ${Math.round(device.widthDp)}dp API ${device.apiLevel})`);return evidence;
}
function main(env=process.env){
  const profileId=inferProfileId(env),buildPath=path.resolve(env.SEVEN_ANDROID_BUILD_IDENTITY||DEFAULT_BUILD_IDENTITY),build=JSON.parse(fs.readFileSync(buildPath,"utf8"));
  return captureProfile({apk:env.SEVEN_RELEASE_APK||DEFAULT_RELEASE_APK,testApk:env.SEVEN_ANDROID_TEST_APK||DEFAULT_TEST_APK,build,profileId,outDir:env.SEVEN_ANDROID_PROFILE_OUT||`evidence/android/profiles/${profileId}`,runId:env.GITHUB_RUN_ID||"local",environmentType:env.SEVEN_ANDROID_ENVIRONMENT||"EMULATOR"});
}
if(require.main===module){try{main()}catch(e){console.error("Android release profile: FAIL",e.message);process.exit(1)}}
module.exports=Object.freeze({SHOTS,DEFAULT_RELEASE_APK,DEFAULT_TEST_APK,DEFAULT_BUILD_IDENTITY,TEST_PACKAGE,fileHash,pngSize,lastPair,lastNumber,inferProfileId,captureProfile,main});
