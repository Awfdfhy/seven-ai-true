"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto"),sharp=require("sharp"),{spawnSync}=require("child_process");
const android=require("../release/android-visual-certification.cjs");
const profile=require("./capture-android-release-profile.cjs");
const systemVisuals=require("./capture-android-system-visuals.cjs");

const APP_ID="ai.seven.app";
const ACTIVITY="ai.seven.app/.MainActivity";
const DEFAULT_APK="android/app/build/outputs/apk/release/app-release.apk";
const DEFAULT_BUILD="evidence/android/build-identity.json";
const SPLASH_RGB=Object.freeze([0x12,0x10,0x26]);
const CAPTURE_FRAMES=30;

function run(cmd,args,{allow=false,encoding="utf8",timeout=20000,maxBuffer=64*1024*1024}={}){
  const r=spawnSync(cmd,args,{encoding,maxBuffer,timeout});
  if(!allow&&(r.error||r.status!==0))throw Error(`${cmd} ${args.join(" ")} failed: ${r.error?.message||r.stderr||r.stdout}`);
  return r;
}
function adb(...args){return run("adb",args)}
function sleep(ms){Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,ms)}
function shaBytes(b){return crypto.createHash("sha256").update(b).digest("hex")}
function fileHash(p){return shaBytes(fs.readFileSync(p))}
function writeJson(p,v){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+"\n")}
function textProp(name){return adb("shell","getprop",name).stdout.trim()}
function home(){adb("shell","input","keyevent","KEYCODE_HOME");sleep(650)}

function decodeRawScreencap(buf){
  if(!Buffer.isBuffer(buf)||buf.length<20)throw Error("raw Android screencap unavailable");
  const width=buf.readUInt32LE(0),height=buf.readUInt32LE(4),format=buf.readUInt32LE(8),dataspace=buf.readUInt32LE(12);
  if(width<1||height<1||width>10000||height>10000)throw Error(`raw Android screencap dimensions invalid: ${width}x${height}`);
  let bpp;
  if(format===1||format===2||format===5)bpp=4;
  else if(format===3)bpp=3;
  else if(format===4)bpp=2;
  else throw Error(`unsupported Android screencap pixel format ${format}`);
  const need=16+width*height*bpp;
  if(buf.length<need)throw Error(`raw Android screencap truncated: ${buf.length}<${need}`);
  return{width,height,format,dataspace,bpp,pixels:buf.subarray(16,need)};
}
function pixelRgb(frame,offset){
  const p=frame.pixels,f=frame.format;
  if(f===1||f===2)return[p[offset],p[offset+1],p[offset+2]];
  if(f===5)return[p[offset+2],p[offset+1],p[offset]];
  if(f===3)return[p[offset],p[offset+1],p[offset+2]];
  const v=p[offset]|(p[offset+1]<<8);
  return[((v>>11)&31)*255/31,((v>>5)&63)*255/63,(v&31)*255/31];
}
function splashSignature(frame,{target=SPLASH_RGB,tolerance=12,sampleStep=7}={}){
  let total=0,bg=0,border=0,borderBg=0,center=0,centerNonBg=0;
  const {width,height,bpp}=frame;
  const xLo=width*.16,xHi=width*.84,yLo=height*.16,yHi=height*.84;
  const cxLo=width*.32,cxHi=width*.68,cyLo=height*.34,cyHi=height*.66;
  for(let y=0;y<height;y+=sampleStep){
    for(let x=0;x<width;x+=sampleStep){
      const off=(y*width+x)*bpp,[r,g,b]=pixelRgb(frame,off);
      const isBg=Math.abs(r-target[0])<=tolerance&&Math.abs(g-target[1])<=tolerance&&Math.abs(b-target[2])<=tolerance;
      total++;if(isBg)bg++;
      const isBorder=x<xLo||x>xHi||y<yLo||y>yHi;
      if(isBorder){border++;if(isBg)borderBg++}
      const isCenter=x>=cxLo&&x<=cxHi&&y>=cyLo&&y<=cyHi;
      if(isCenter){center++;if(!isBg)centerNonBg++}
    }
  }
  const bgRatio=total?bg/total:0,borderBgRatio=border?borderBg/border:0,centerNonBgRatio=center?centerNonBg/center:0;
  const score=bgRatio*.62+borderBgRatio*.38;
  const pass=bgRatio>=.46&&borderBgRatio>=.58&&centerNonBgRatio>=.003&&centerNonBgRatio<=.42;
  return{pass,bgRatio,borderBgRatio,centerNonBgRatio,score};
}
function captureRaw(){
  const r=run("adb",["exec-out","screencap"],{encoding:null,timeout:12000,maxBuffer:64*1024*1024});
  return decodeRawScreencap(r.stdout);
}
function rgbaPixels(frame){
  const out=Buffer.allocUnsafe(frame.width*frame.height*4),n=frame.width*frame.height;
  for(let i=0;i<n;i++){
    const [r,g,b]=pixelRgb(frame,i*frame.bpp),o=i*4;
    out[o]=Math.round(r);out[o+1]=Math.round(g);out[o+2]=Math.round(b);out[o+3]=255;
  }
  return out;
}
async function writeFramePng(frame,outPath){
  fs.mkdirSync(path.dirname(outPath),{recursive:true});
  await sharp(rgbaPixels(frame),{raw:{width:frame.width,height:frame.height,channels:4}}).png({compressionLevel:9}).toFile(outPath);
  const png=fs.readFileSync(outPath);return{width:frame.width,height:frame.height,sha256:shaBytes(png)};
}
function readRemoteText(remote){
  const r=run("adb",["exec-out","cat",remote],{allow:true,encoding:"utf8",timeout:6000,maxBuffer:2*1024*1024});
  return r.status===0?String(r.stdout||"").trim():"";
}
function launchColdWithForcedIcon(){
  const remote="/data/local/tmp/seven-splash-launch.txt";
  run("adb",["shell","rm","-f",remote],{allow:true});
  adb("shell","am","force-stop",APP_ID);home();
  const command=`am start -W -n ${ACTIVITY} --splashscreen-show-icon > ${remote} 2>&1`;
  const starter=run("adb",["shell","sh","-c",`(${command}) >/dev/null 2>&1 &`],{allow:true,timeout:5000});
  if(starter.error||starter.status!==0)throw Error(`Android cold splash launch could not start: ${starter.error?.message||starter.stderr||starter.stdout}`);
  return remote;
}
function waitForLaunch(remote){
  let out="";
  for(let i=0;i<50;i++){
    out=readRemoteText(remote);
    if(/Status:\s*ok/i.test(out)&&new RegExp(APP_ID.replace(/\./g,"\\."),"i").test(out))return out;
    sleep(100);
  }
  throw Error(`Android forced-icon launch did not complete cleanly: ${out||"<no output>"}`);
}
function requireResumed(){
  let last="";
  for(let i=0;i<35;i++){
    last=adb("shell","dumpsys","activity","activities").stdout;
    if(new RegExp(`(?:mResumedActivity|topResumedActivity|ResumedActivity)[^\\n]*${APP_ID.replace(/\./g,"\\.")}[^\\n]*MainActivity`,"i").test(last))return true;
    sleep(150);
  }
  throw Error(`Seven did not resume after splash capture: ${String(last).split(/\r?\n/).filter(x=>/ResumedActivity|mResumedActivity|topResumedActivity/.test(x)).slice(0,4).join(" ; ")||"<unknown>"}`);
}
function loadProfileEvidence(outDir,build){
  const p=path.join(outDir,"profile-evidence.json");
  if(!fs.existsSync(p))throw Error(`release-profile evidence required before splash burst: ${p}`);
  const e=JSON.parse(fs.readFileSync(p,"utf8"));
  if(e.buildSeal!==build.seal||e.artifactSha256!==build.artifactSha256)throw Error("profile evidence build identity drift");
  if(!android.verifyDeviceProof(e.device))throw Error("profile device proof invalid");
  return e;
}
async function captureSplash({apk,build,profileId,outDir,runId}){
  const evidence=loadProfileEvidence(outDir,build),api=evidence.device.apiLevel;
  const resource=systemVisuals.requireResourceWitness(apk,"splash",api);
  adb("install","-r",apk);
  run("adb",["shell","am","clear-debug-app"],{allow:true});
  const baseline=captureRaw(),baselineHash=shaBytes(Buffer.concat([Buffer.from(`${baseline.width}x${baseline.height}:${baseline.format}:`),baseline.pixels]));
  const launchRemote=launchColdWithForcedIcon();
  const started=Date.now(),frames=[];
  let best=null;
  for(let i=0;i<CAPTURE_FRAMES;i++){
    const frame=captureRaw(),sig=splashSignature(frame),frameHash=shaBytes(Buffer.concat([Buffer.from(`${frame.width}x${frame.height}:${frame.format}:`),frame.pixels]));
    const item={index:i,elapsedMs:Date.now()-started,frameHash,signature:sig};frames.push(item);
    if(frameHash!==baselineHash&&(!best||sig.score>best.signature.score))best={frame,item,signature:sig};
    if(sig.pass&&frameHash!==baselineHash){best={frame,item,signature:sig};break}
  }
  const launchOutput=waitForLaunch(launchRemote);requireResumed();
  if(!best||!best.signature.pass){
    const top=frames.sort((a,b)=>b.signature.score-a.signature.score).slice(0,5);
    throw Error(`genuine Android splash frame not found in adb screencap burst; top=${JSON.stringify(top)}`);
  }
  const outPath=path.join(outDir,"system-screenshots","splash.png"),shot=await writeFramePng(best.frame,outPath);
  const witness={
    kind:"android-system-splash-transient-frame",
    source:"adb-raw-screencap-burst",
    requestedBy:"am start -W --splashscreen-show-icon",
    launchStatus:"ok",
    launchOutputHash:shaBytes(Buffer.from(launchOutput)),
    baselineFrameHash:baselineHash,
    selectedFrameHash:best.item.frameHash,
    selectedFrameIndex:best.item.index,
    selectedFrameElapsedMs:best.item.elapsedMs,
    visualSignature:best.signature,
    expectedSplashBackground:"#121026",
    frameCountObserved:frames.length,
    resource,
    provenanceNote:"Android TYPE_APPLICATION_STARTING splash is system-created; capture uses real adb screencap pixels and no synthetic rendering"
  };
  const receipt=android.createCaptureReceipt({build,device:evidence.device,scenario:"splash",captureMethod:"adb-screencap",screenshotSha256:shot.sha256,width:shot.width,height:shot.height,locale:textProp("persist.sys.locale")||textProp("ro.product.locale")||"en-US",direction:"ltr",theme:"system",reducedMotion:false,sourceRef:`github-actions:${runId}:${profileId}:splash:adb-raw-burst:${android.hash(witness)}`});
  evidence.captures=(evidence.captures||[]).filter(c=>c.scenario!=="splash");evidence.captures.push(receipt);
  evidence.captureFiles=evidence.captureFiles||{};evidence.captureFiles.splash={path:"system-screenshots/splash.png",sha256:shot.sha256};
  evidence.systemWitnesses=evidence.systemWitnesses||{};evidence.systemWitnesses.splash=witness;
  evidence.claimBoundary="GENUINE_RELEASE_BUILD_SYSTEM_UI_EVIDENCE_WITH_TRANSIENT_SPLASH_PIXEL_WITNESS";
  writeJson(path.join(outDir,"profile-evidence.json"),evidence);
  console.log(`Android splash burst evidence: PASS (${profileId}; frame=${best.item.index}; ${Math.round(best.signature.bgRatio*1000)/10}% exact-theme background)`);
}
async function main(env=process.env){
  const apk=path.resolve(env.SEVEN_RELEASE_APK||DEFAULT_APK),buildPath=path.resolve(env.SEVEN_ANDROID_BUILD_IDENTITY||DEFAULT_BUILD),build=JSON.parse(fs.readFileSync(buildPath,"utf8"));
  if(!android.verifyBuildIdentity(build))throw Error("verified release build identity required");
  if(fileHash(apk)!==build.artifactSha256)throw Error("exact APK hash/build identity mismatch");
  const profileId=String(env.SEVEN_ANDROID_PROFILE_ID||"api36-modern").trim(),outDir=path.resolve(env.SEVEN_ANDROID_PROFILE_OUT||`evidence/android/profiles/${profileId}`),runId=env.GITHUB_RUN_ID||"local";
  await captureSplash({apk,build,profileId,outDir,runId});
}
if(require.main===module)main().catch(e=>{console.error("Android splash burst evidence: FAIL",e.message);process.exit(1)});
module.exports=Object.freeze({decodeRawScreencap,pixelRgb,splashSignature,rgbaPixels,captureSplash,main});
