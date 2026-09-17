"use strict";
const assert=require("assert/strict"),fs=require("fs"),path=require("path");
const ROOT=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(ROOT,"apk","capture-android-splash-burst.cjs"),"utf8");
const splash=require(path.join(ROOT,"apk","capture-android-splash-burst.cjs"));
let n=0;
const has=(x,m)=>{assert.ok(source.includes(x),m||`missing ${x}`);n++};
const not=(x,m)=>{assert.ok(!source.includes(x),m||`forbidden ${x}`);n++};
function rawFrame(width,height,paint){
  const pixels=Buffer.alloc(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const [r,g,b,a=255]=paint(x,y),o=(y*width+x)*4;
    pixels[o]=r;pixels[o+1]=g;pixels[o+2]=b;pixels[o+3]=a;
  }
  const header=Buffer.alloc(16);header.writeUInt32LE(width,0);header.writeUInt32LE(height,4);header.writeUInt32LE(1,8);header.writeUInt32LE(0,12);
  return Buffer.concat([header,pixels]);
}
const splashRaw=rawFrame(140,240,(x,y)=>x>55&&x<85&&y>95&&y<145?[240,240,245,255]:[0x12,0x10,0x26,255]);
const decoded=splash.decodeRawScreencap(splashRaw);assert.equal(decoded.width,140);assert.equal(decoded.height,240);n+=2;
const sig=splash.splashSignature(decoded,{sampleStep:2});assert.equal(sig.pass,true);assert.ok(sig.bgRatio>.9);assert.ok(sig.centerNonBgRatio>.003);n+=3;
const flat=splash.splashSignature(splash.decodeRawScreencap(rawFrame(140,240,()=>[0x12,0x10,0x26,255])),{sampleStep:2});assert.equal(flat.pass,false,"uniform background cannot masquerade as branded splash");n++;
const alien=splash.splashSignature(splash.decodeRawScreencap(rawFrame(140,240,()=>[255,255,255,255])),{sampleStep:2});assert.equal(alien.pass,false,"unrelated frame cannot masquerade as splash");n++;
const timeoutError=Object.assign(new Error("spawnSync adb ETIMEDOUT"),{code:"ETIMEDOUT"});
assert.equal(splash.isRetryableAdbFailure({error:timeoutError,status:null,stdout:"",stderr:""}),true,"transport timeout must be retryable");
assert.equal(splash.isRetryableAdbFailure({status:1,stdout:"",stderr:"Failure [INSTALL_FAILED_INVALID_APK]"}),false,"invalid APK must never be hidden by retry policy");n+=2;
let installs=0;
const retryRun=(cmd,args)=>{
  assert.equal(cmd,"adb");
  if(args[0]==="wait-for-device")return{status:0,stdout:"",stderr:""};
  if(args[0]==="shell"&&args[1]==="getprop"&&args[2]==="sys.boot_completed")return{status:0,stdout:"1\n",stderr:""};
  if(args[0]==="install"){
    installs++;
    if(installs===1)return{status:null,error:Object.assign(new Error("spawnSync adb ETIMEDOUT"),{code:"ETIMEDOUT"}),stdout:"",stderr:""};
    return{status:0,stdout:"Success\n",stderr:""};
  }
  throw Error(`unexpected fake adb command: ${args.join(" ")}`);
};
const retryResult=splash.installExactApk("/tmp/seven-release.apk",{runCommand:retryRun,sleepFn:()=>{}});
assert.equal(retryResult.attempts,2,"one transport timeout may consume exactly one bounded retry");assert.equal(installs,2);n+=2;
let invalidInstalls=0;
const invalidRun=(cmd,args)=>{
  if(args[0]==="wait-for-device")return{status:0,stdout:"",stderr:""};
  if(args[0]==="shell"&&args[1]==="getprop")return{status:0,stdout:"1\n",stderr:""};
  if(args[0]==="install"){invalidInstalls++;return{status:1,stdout:"",stderr:"Failure [INSTALL_FAILED_INVALID_APK]"}}
  throw Error(`unexpected fake adb command: ${args.join(" ")}`);
};
assert.throws(()=>splash.installExactApk("/tmp/bad.apk",{runCommand:invalidRun,sleepFn:()=>{}}),/INSTALL_FAILED_INVALID_APK/,"non-transport install failure must fail closed");
assert.equal(invalidInstalls,1,"non-retryable install failure must not be replayed");n+=2;
has('"exec-out","screencap"');
has('spawn("adb",["shell","am","start","-W","-n",ACTIVITY,"--splashscreen-show-icon"]');
has('HOST_SPAWN_NO_REMOTE_SHELL_METACHARACTERS');
has('am","force-stop",APP_ID');
has('requireResourceWitness(apk,"splash",api)');
has('ADB_INSTALL_TIMEOUT_MS=60000');
has('ADB_INSTALL_ATTEMPTS=2');
has('["wait-for-device"]');
has('installExactApk(apk);');
has('captureMethod:"adb-screencap"');
has('expectedSplashBackground:"#121026"');
has('Android TYPE_APPLICATION_STARTING splash is system-created');
has('postCaptureActivityState:"RESUMED_MAIN_ACTIVITY"');
has('exact APK hash/build identity mismatch');
has('profile device proof invalid');
has('genuine Android splash frame not found in adb screencap burst');
not('playwright');
not('seven_ai-final.html');
not('data:image');
not('synthetic screenshot');
not('sh","-c"',"splash launcher must not depend on Android remote-shell metacharacter parsing");
console.log(`Android Splash Burst Contract: PASS (${n} assertions; exact release APK + bounded ADB transport recovery + shell-free real adb frame burst + branded transient-state discrimination)`);
