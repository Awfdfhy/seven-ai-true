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
has('"exec-out","screencap"');
has('spawn("adb",["shell","am","start","-W","-n",ACTIVITY,"--splashscreen-show-icon"]');
has('HOST_SPAWN_NO_REMOTE_SHELL_METACHARACTERS');
has('am","force-stop",APP_ID');
has('requireResourceWitness(apk,"splash",api)');
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
console.log(`Android Splash Burst Contract: PASS (${n} assertions; exact release APK + shell-free real adb frame burst + branded transient-state discrimination)`);
