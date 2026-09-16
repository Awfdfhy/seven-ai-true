"use strict";
const assert=require("assert/strict"),android=require("./android-visual-certification.cjs"),m=require("./merge-android-visual-evidence.cjs");
let n=0;const ok=(v,m)=>{assert.ok(v,m);n++},eq=(a,b,m)=>{assert.equal(a,b,m);n++},H=x=>android.hash(x),C="b".repeat(40);
const build=android.createBuildIdentity({branch:"ultimate-polish-v1",commitSha:C,applicationId:"ai.seven.app",versionName:"1.0",versionCode:1,artifactKind:"APK",artifactSha256:H("apk"),candidateSeal:H("candidate"),exportReceiptSeal:H("export")});
function dev(id,api,width){return android.createDeviceProof({environmentType:"EMULATOR",deviceIdentityHash:H("dev:"+id),manufacturer:"CI",model:id,androidVersion:String(api),apiLevel:api,widthDp:width,heightDp:800,density:3,proofHash:H("proof:"+id),sourceRef:"ci:"+id,capturedBy:"ci"})}
const d1=dev("compact",28,360),d2=dev("modern",36,412);
const inApp=["chat-day","chat-night","coding","research","rpg","arabic-rtl","reduced-motion"];
function cap(s,d){return android.createCaptureReceipt({build,device:d,scenario:s,captureMethod:"instrumentation",screenshotSha256:H(`${s}:${d.model}`),width:1080,height:2400,locale:s==="arabic-rtl"?"ar-IQ":"en-US",direction:s==="arabic-rtl"?"rtl":"ltr",theme:s==="chat-day"?"day":"night",reducedMotion:s==="reduced-motion",sourceRef:`ci:${d.model}:${s}`})}
function profile(id,d){return{schema:"seven.android-release-profile-evidence.v1",profileId:id,buildSeal:build.seal,artifactSha256:build.artifactSha256,device:d,captures:inApp.map(s=>cap(s,d))}}
const out=m.mergeEvidence({build,profiles:[profile("a",d1),profile("b",d2)]});
eq(out.certification.verdict,"INCONCLUSIVE");eq(out.certification.covered.length,7);ok(out.certification.missing.includes("launcher-themed"));ok(out.certification.missing.includes("splash"));eq(out.captureCount,14);eq(out.claimBoundary,"PARTIAL_RELEASE_DEVICE_EVIDENCE_ONLY");
assert.throws(()=>m.mergeEvidence({build,profiles:[profile("a",d1),{...profile("b",d2),artifactSha256:H("bad")}]}),/identity drift/);n++;
console.log(`Android Visual Evidence Merge: PASS (${n} assertions; partial evidence cannot be promoted to PASS)`);
