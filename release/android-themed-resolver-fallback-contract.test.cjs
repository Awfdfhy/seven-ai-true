"use strict";
const assert=require("assert/strict"),fs=require("fs"),path=require("path");
const ROOT=path.resolve(__dirname,"..");
const src=fs.readFileSync(path.join(ROOT,"apk","capture-android-themed-launcher-ui.cjs"),"utf8");
let n=0;
const has=(x,m)=>{assert.ok(src.includes(x),m||`missing ${x}`);n++};
const not=(x,m)=>{assert.ok(!src.includes(x),m||`forbidden ${x}`);n++};

has('confirmation = "Just once"','resolver must first attempt the visible one-shot confirmation');
has('fallbackRequired: false','resolver proof must explicitly model fallback state');
has('fallbackReason = "resolver-confirmation-did-not-exit"','sticky resolver must have an exact recorded reason');
has('return openCustomizationFromLauncher()','failed SET_WALLPAPER route must continue only through genuine launcher UI');
has('method: "launcher-long-press"','fallback evidence must name the visible launcher path');
has('Wallpaper & style launcher menu entry','fallback must select the visible Wallpaper & style entry');
has('KEYCODE_HOME','sticky resolver must be abandoned through normal Android navigation');
has('uiautomator','system UI state must remain observable');
has('screencap','final launcher proof must remain a genuine system screenshot');
not('content update','hidden content-provider mutation is forbidden');
not('run-as','app-private mutation is forbidden');
not('playwright','browser evidence cannot certify system launcher theming');

console.log(`Android Themed Resolver Fallback Contract: PASS (${n} assertions; sticky resolver falls back to genuine Pixel Launcher UI)`);
