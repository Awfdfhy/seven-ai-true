"use strict";
const assert=require("assert/strict"),fs=require("fs"),path=require("path");
const ROOT=path.resolve(__dirname,"..");
const prep=fs.readFileSync(path.join(ROOT,"apk","prepare-pixel-launcher-home.cjs"),"utf8");
const wf=fs.readFileSync(path.join(ROOT,".github","workflows","android-apk.yml"),"utf8");
let n=0;
const has=(s,x,m)=>{assert.ok(s.includes(x),m||`missing ${x}`);n++};
const not=(s,x,m)=>{assert.ok(!s.includes(x),m||`forbidden ${x}`);n++};
const matches=(s,re,m)=>{assert.ok(re.test(s),m||`missing pattern ${re}`);n++};

has(prep,'"uiautomator", "dump"');
has(prep,'"exec-out", "cat"');
has(prep,'"draganddrop"');
has(prep,'KEYCODE_HOME');
has(prep,'Pixel Launcher Seven placement: PASS');
has(prep,'Seven could not be placed on Pixel Launcher workspace via genuine draganddrop');
matches(prep,/targets\s*=\s*\[/,"placement must retry bounded workspace targets");
matches(prep,/for\s*\(let i\s*=\s*0;\s*i\s*<\s*targets\.length/,"placement attempts must be bounded");
not(prep,'content update');
not(prep,'run-as');
not(prep,'playwright');
not(prep,'seven_ai-final.html');

has(wf,'target: google_apis_playstore');
has(wf,'node apk/prepare-pixel-launcher-home.cjs');
const profile=wf.indexOf('SEVEN_ANDROID_PROFILE_ID=api36-modern node apk/capture-android-release-profile.cjs');
const prepare=wf.indexOf('node apk/prepare-pixel-launcher-home.cjs');
const themed=wf.indexOf('SEVEN_ANDROID_PROFILE_ID=api36-modern node apk/capture-android-themed-launcher-ui.cjs');
assert.ok(profile>=0&&prepare>profile&&themed>prepare,'Pixel Launcher preparation must run after exact release profile and before themed capture');n++;

console.log(`Pixel Launcher Home Contract: PASS (${n} assertions; genuine bounded UI drag-and-drop preparation)`);
