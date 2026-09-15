"use strict";
const assert=require("assert/strict"),a=require("./android-visual-certification.cjs"),d=require("./device-release-evidence.cjs"),r=require("./release-readiness.cjs");let n=0;const ok=(v,m)=>{assert.ok(v,m);n++},eq=(x,y,m)=>{assert.equal(x,y,m);n++},throws=(f,re,m)=>{assert.throws(f,re,m);n++},H=x=>a.hash(x),COMMIT="d".repeat(40);
const build=a.createBuildIdentity({branch:"ultimate-polish-v1",commitSha:COMMIT,applicationId:"ai.seven.app",versionName:"1.0.0",versionCode:102,artifactKind:"APK",artifactSha256:H("device-release-apk"),candidateSeal:H("candidate"),exportReceiptSeal:H("export")});ok(a.verifyBuildIdentity(build));
function device(id,env){return a.createDeviceProof({environmentType:env,deviceIdentityHash:H("device:"+id),manufacturer:"SevenLab",model:id,androidVersion:"15",apiLevel:35,widthDp:360,heightDp:800,density:2.75,proofHash:H("proof:"+id),sourceRef:"lab:"+id,capturedBy:"release-evidence"})}
const farm=device("farm","DEVICE_FARM"),physical=device("physical","PHYSICAL_DEVICE"),emu=device("emu","EMULATOR");
const obs={spokenOrder:true,namesRolesStates:true,stateAnnouncements:true,dialogIsolation:true,focusTraversal:true,fontScaleNoCriticalClipping:true,rtlReadingOrder:true,reducedMotionUsable:true};
function a11y(over={}){return d.createAccessibilityDeviceEvidence({build,device:farm,assistiveTech:"TalkBack",assistiveTechVersion:"16.1",scenarios:d.A11Y_SCENARIOS,observations:obs,sourceArtifactSha256:d.A11Y_SCENARIOS.map(x=>H("a11y:"+x)),sourceRef:"device-farm:a11y-run-1",capturedBy:"android-device-lab",verifier:"a11y-device-verifier",capturedAt:"2026-09-15T01:00:00.000Z",expiresAt:"2026-09-17T01:00:00.000Z",...over})}
let ae=a11y();ok(d.verifyAccessibilityDeviceEvidence(ae,build,farm));eq(ae.verdict,"PASS");eq(ae.evidenceTier,"RELEASE_DEVICE");eq(ae.scenarios.length,6);eq(ae.sourceArtifactSha256.length,6);
let rr=d.toReadinessReceipt({evidence:ae,verifierContext:"device-a11y-lab-1"});ok(r.verifyReceipt(rr));eq(rr.domain,"ACCESSIBILITY_DEVICE");eq(rr.classes.join(","),"RELEASE_DEVICE");eq(rr.evidenceSha256,ae.seal);eq(rr.artifactSha256,build.artifactSha256);
let weak=a11y({scenarios:d.A11Y_SCENARIOS.slice(1)});eq(weak.verdict,"FAIL");ok(weak.failures.some(x=>x.startsWith("scenario:")));throws(()=>d.toReadinessReceipt({evidence:weak,verifierContext:"x"}),/must PASS/);
weak=a11y({observations:{...obs,rtlReadingOrder:false}});eq(weak.verdict,"FAIL");ok(weak.failures.includes("observation:rtlReadingOrder"));
throws(()=>a11y({assistiveTech:"GenericReader"}),/TalkBack/);throws(()=>a11y({sourceArtifactSha256:[H("only-one")]}),/requires 6\+/);
const tamperedA={...ae,verdict:"FAIL"};eq(d.verifyAccessibilityDeviceEvidence(tamperedA,build,farm),false);
const otherBuild=a.createBuildIdentity({branch:"ultimate-polish-v1",commitSha:"e".repeat(40),applicationId:"ai.seven.app",versionName:"1.0.1",versionCode:103,artifactKind:"APK",artifactSha256:H("other-apk"),candidateSeal:H("candidate"),exportReceiptSeal:H("export")});eq(d.verifyAccessibilityDeviceEvidence(ae,otherBuild,farm),false);
function perf(over={}){return d.createPhysicalPerformanceEvidence({build,device:physical,coldStartMs:[780,820,810,900,850,870],pssMb:[188,204,196,210],jankPercent:1.8,longSessionMinutes:45,thermalStatusMax:2,batteryDrainPercentPerHour:5.4,sourceArtifactSha256:[H("perfetto"),H("meminfo"),H("battery"),H("thermal")],sourceRef:"physical-lab:perf-run-1",capturedBy:"android-physical-lab",verifier:"performance-device-verifier",capturedAt:"2026-09-15T01:00:00.000Z",expiresAt:"2026-09-17T01:00:00.000Z",...over})}
let pe=perf();ok(d.verifyPhysicalPerformanceEvidence(pe,build,physical));eq(pe.verdict,"PASS");eq(pe.evidenceTier,"PHYSICAL_DEVICE");eq(pe.metrics.coldStartSamples,6);eq(pe.metrics.coldStartP95Ms,900);eq(pe.metrics.maxPssMb,210);ok(pe.metrics.jankPercent<d.PERF_POLICY.maxJankPercent);
rr=d.toReadinessReceipt({evidence:pe,verifierContext:"physical-performance-lab-1"});ok(r.verifyReceipt(rr));eq(rr.domain,"PERFORMANCE_RESOURCE_DEVICE");eq(rr.classes.join(","),"PHYSICAL_DEVICE");eq(rr.evidenceSha256,pe.seal);
throws(()=>perf({device:emu}),/physical-device/);throws(()=>perf({device:farm}),/physical-device/);
let bad=perf({coldStartMs:[2800,2700,2900,3000,2850]});eq(bad.verdict,"FAIL");ok(bad.failures.includes("budget:cold-start-p95"));throws(()=>d.toReadinessReceipt({evidence:bad,verifierContext:"x"}),/must PASS/);
bad=perf({pssMb:[600,620,610]});eq(bad.verdict,"FAIL");ok(bad.failures.includes("budget:max-pss"));
bad=perf({jankPercent:8});eq(bad.verdict,"FAIL");ok(bad.failures.includes("budget:jank"));
bad=perf({longSessionMinutes:15});eq(bad.verdict,"FAIL");ok(bad.failures.includes("coverage:long-session"));
bad=perf({thermalStatusMax:4});eq(bad.verdict,"FAIL");ok(bad.failures.includes("budget:thermal"));
bad=perf({batteryDrainPercentPerHour:14});eq(bad.verdict,"FAIL");ok(bad.failures.includes("budget:battery"));
bad=perf({coldStartMs:[800,900]});eq(bad.verdict,"FAIL");ok(bad.failures.includes("samples:cold-start"));
bad=perf({pssMb:[200]});eq(bad.verdict,"FAIL");ok(bad.failures.includes("samples:memory"));
throws(()=>perf({sourceArtifactSha256:[H("a"),H("b"),H("c")]}),/requires 4\+/);
const tamperedP={...pe,metrics:{...pe.metrics,maxPssMb:999}};eq(d.verifyPhysicalPerformanceEvidence(tamperedP,build,physical),false);eq(d.verifyPhysicalPerformanceEvidence(pe,otherBuild,physical),false);eq(d.verifyPhysicalPerformanceEvidence(pe,build,emu),false);
throws(()=>d.toReadinessReceipt({evidence:{schema:"fake"},verifierContext:"x"}),/unsupported or forged/);
console.log(`Device Release Evidence: PASS (${n} assertions; TalkBack release-device admission, physical performance/resource budgets, exact-build readiness bridge)`);
