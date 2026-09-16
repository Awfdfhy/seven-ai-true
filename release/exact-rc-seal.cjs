"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const android=require("./android-visual-certification.cjs");
const artifact=require("./android-ci-release-artifact.cjs");
const audit=require("./dependency-audit-gate.cjs");
const H40=/^[0-9a-f]{40}$/i,H64=/^[0-9a-f]{64}$/i;
const VERSION="1.0.0";
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o}return v}
function hash(v){return crypto.createHash("sha256").update(Buffer.isBuffer(v)||typeof v==="string"?v:JSON.stringify(stable(v))).digest("hex")}
function fileHash(p){return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex")}
function gitBlobSha1(p){const b=fs.readFileSync(p);return crypto.createHash("sha1").update(Buffer.from(`blob ${b.length}\0`)).update(b).digest("hex")}
function seal(body){return Object.freeze({...body,seal:hash(body)})}
function verifySeal(x,schema){if(!x||x.schema!==schema||!H64.test(String(x.seal||"")))return false;const{seal:q,...body}=x;return q===hash(body)}
function readJson(p){return JSON.parse(fs.readFileSync(p,"utf8"))}
function writeJson(p,v){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+"\n")}
function req(v,n){const s=String(v??"").trim();if(!s)throw Error(`${n} required`);return s}
function validatePolicy(policy,root){
  if(!policy||policy.schema!=="seven.exact-rc-policy.v1"||policy.version!==1)throw Error("exact RC policy invalid");
  if(!policy.branch||!policy.applicationId||policy.artifactKind!=="APK")throw Error("exact RC policy identity invalid");
  if(!Number.isInteger(policy.minCanonicalSuites)||policy.minCanonicalSuites<100)throw Error("exact RC suite floor invalid");
  if(policy.requiredAndroidScenarioCount!==android.SCENARIOS.length)throw Error("exact RC Android scenario floor drift");
  if(policy.signingClaimBoundary!=="RELEASE_VARIANT_CI_SIGNED_NOT_STORE_PRODUCTION_SIGNING")throw Error("exact RC signing boundary invalid");
  if(policy.rcClaimBoundary!=="EXACT_RC_CI_SIGNED_NOT_STORE_PRODUCTION_SIGNING_NO_PHYSICAL_DEVICE_CLAIM")throw Error("exact RC claim boundary invalid");
  const ps=policy.protectedSource||{},sp=path.join(root,req(ps.path,"protected source path"));
  if(!fs.existsSync(sp))throw Error("protected source missing");
  if(fs.statSync(sp).size!==ps.bytes||gitBlobSha1(sp)!==ps.gitBlobSha1)throw Error("protected source identity drift");
  for(const rel of policy.requiredFiles||[]){if(!fs.existsSync(path.join(root,rel)))throw Error(`required RC evidence missing:${rel}`);if(/(^|[\/_.-])(probe|demo|mock|placeholder|fake)([\/_.-]|$)/i.test(rel))throw Error(`weak RC evidence path:${rel}`)}
  return true;
}
function suiteUniverse(root){
  const tests=(dir)=>fs.readdirSync(path.join(root,dir)).filter(x=>x.endsWith(".test.cjs")).sort().map(x=>`${dir}/${x}`);
  const fixed=["eval/harness.cjs","memory.cjs","runtime-smoke.cjs","verify.cjs","release/static-audit.cjs","release/release-verify.cjs"];
  return [...fixed,...tests("release"),...tests("evolution"),...tests("hardening")];
}
function createSuiteManifest(root){
  const suites=suiteUniverse(root),entries=suites.map(rel=>({path:rel,sha256:fileHash(path.join(root,rel))}));
  return Object.freeze({count:suites.length,sha256:hash(entries),entries});
}
function validateVisual(visual,build,policy){
  if(!visual||visual.schema!=="seven.android-release-visual-evidence-merge.v1")throw Error("Android visual merge invalid");
  const c=visual.certification;
  if(!android.verifyCertification(c))throw Error("Android visual certification seal invalid");
  if(visual.buildSeal!==build.seal||visual.artifactSha256!==build.artifactSha256)throw Error("Android visual merge build drift");
  if(c.buildSeal!==build.seal||c.artifactSha256!==build.artifactSha256||c.candidateSeal!==build.candidateSeal)throw Error("Android certification build drift");
  if(c.verdict!=="PASS"||visual.claimBoundary!=="ANDROID_RELEASE_VISUAL_MATRIX_CONTRACT_PASS")throw Error("Android visual matrix not PASS");
  if(c.missing.length||c.failures.length)throw Error("Android visual matrix incomplete");
  const covered=[...new Set(c.covered)].sort(),required=[...android.SCENARIOS].sort();
  if(covered.length!==policy.requiredAndroidScenarioCount||JSON.stringify(covered)!==JSON.stringify(required))throw Error("Android scenario coverage drift");
  if(policy.requirePhysicalDevice===true&&!c.physicalDeviceIncluded)throw Error("physical device required by policy");
  if(policy.requirePhysicalDevice===false&&c.physicalDeviceIncluded)throw Error("policy truth boundary changed: physical evidence unexpectedly included");
  return c;
}
function createExactRc({buildBundle,visual,dependencyAudit,artifactBytes,root,policy,branch,commitSha,sourceRef}={}){
  root=path.resolve(root||path.join(__dirname,".."));
  if(!artifact.verifyBundle(buildBundle))throw Error("verified Android build bundle required");
  validatePolicy(policy,root);
  const candidate=buildBundle.candidate,build=buildBundle.build;
  branch=req(branch||build.branch,"branch");commitSha=req(commitSha||build.commitSha,"commitSha").toLowerCase();
  if(!H40.test(commitSha)||branch!==policy.branch||branch!==build.branch||commitSha!==build.commitSha)throw Error("RC branch/commit identity drift");
  if(candidate.branch!==branch||candidate.commitSha!==commitSha||candidate.applicationId!==policy.applicationId||build.applicationId!==policy.applicationId)throw Error("RC candidate identity drift");
  if(candidate.claimBoundary!==policy.signingClaimBoundary)throw Error("RC signer claim boundary drift");
  const cert=validateVisual(visual,build,policy);
  if(!audit.verifySummary(dependencyAudit))throw Error("dependency audit summary invalid");
  if(policy.requireProductionVulnerabilityFree&&!dependencyAudit.gate.productionVulnerabilityFree)throw Error("production dependency audit not clean");
  if(policy.requireFullGraphVulnerabilityFree&&!dependencyAudit.gate.fullGraphVulnerabilityFree)throw Error("full dependency graph audit not clean");
  artifactBytes=Number(artifactBytes);if(!Number.isInteger(artifactBytes)||artifactBytes<=0)throw Error("artifactBytes invalid");
  const suites=createSuiteManifest(root);if(suites.count<policy.minCanonicalSuites)throw Error(`canonical suite count regressed:${suites.count}`);
  const protectedPath=path.join(root,policy.protectedSource.path);
  const refs={
    policySha256:fileHash(path.join(root,"release/exact-rc-policy.json")),
    runnerSha256:fileHash(path.join(root,"all.cjs")),
    wave27GateSha256:fileHash(path.join(root,"release/full-seven-red-team-wave27.test.cjs")),
    productWiringSha256:fileHash(path.join(root,"docs/project-memory/current/PRODUCT_WIRING_MATRIX.json")),
    dependencyAuditSeal:dependencyAudit.seal
  };
  const body={
    schema:"seven.exact-release-candidate.v1",version:VERSION,rcLabel:`seven-rc-${commitSha.slice(0,12)}`,branch,commitSha,
    applicationId:candidate.applicationId,versionName:candidate.versionName,versionCode:candidate.versionCode,
    artifact:{kind:candidate.artifactKind,sha256:candidate.artifactSha256,bytes:artifactBytes},
    signing:{profile:candidate.signingProfile,signerCertSha256:candidate.signerCertSha256,claimBoundary:candidate.claimBoundary},
    identity:{candidateSeal:candidate.seal,exportReceiptSeal:buildBundle.exportReceipt.seal,buildSeal:build.seal,visualCertificationSeal:cert.seal},
    coverage:{canonicalSuites:suites.count,suiteManifestSha256:suites.sha256,androidScenarios:[...cert.covered].sort(),androidScenarioCount:cert.covered.length,physicalDeviceIncluded:cert.physicalDeviceIncluded===true},
    protectedSource:{path:policy.protectedSource.path,bytes:fs.statSync(protectedPath).size,gitBlobSha1:gitBlobSha1(protectedPath)},
    references:refs,sourceRef:req(sourceRef,"sourceRef"),claimBoundary:policy.rcClaimBoundary
  };
  return seal(body);
}
function verifyExactRc(x,expected={}){
  if(!verifySeal(x,"seven.exact-release-candidate.v1"))return false;
  if(!H40.test(String(x.commitSha||""))||!H64.test(String(x.artifact?.sha256||""))||!H64.test(String(x.signing?.signerCertSha256||"")))return false;
  if(x.claimBoundary!=="EXACT_RC_CI_SIGNED_NOT_STORE_PRODUCTION_SIGNING_NO_PHYSICAL_DEVICE_CLAIM")return false;
  if(x.signing?.claimBoundary!=="RELEASE_VARIANT_CI_SIGNED_NOT_STORE_PRODUCTION_SIGNING"||x.artifact?.kind!=="APK")return false;
  if(!Number.isInteger(x.artifact?.bytes)||x.artifact.bytes<=0||!Number.isInteger(x.coverage?.canonicalSuites)||x.coverage.canonicalSuites<100)return false;
  if(x.coverage?.androidScenarioCount!==android.SCENARIOS.length||!Array.isArray(x.coverage?.androidScenarios)||x.coverage.androidScenarios.length!==android.SCENARIOS.length||x.coverage.physicalDeviceIncluded!==false)return false;
  if(x.protectedSource?.bytes!==658133||x.protectedSource?.gitBlobSha1!=="3e8dfa8e7da7124e16504140eb9631c10cabf053")return false;
  const pairs=[["branch",x.branch],["commitSha",x.commitSha],["artifactSha256",x.artifact.sha256],["artifactBytes",x.artifact.bytes],["buildSeal",x.identity?.buildSeal],["candidateSeal",x.identity?.candidateSeal]];
  for(const[k,v]of pairs)if(expected[k]!==undefined&&expected[k]!==v)return false;
  return true;
}
function generateFromFiles(opts={}){
  const root=path.resolve(opts.root||path.join(__dirname,".."));
  const policy=readJson(path.resolve(opts.policyPath||path.join(root,"release/exact-rc-policy.json")));
  const buildBundle=readJson(path.resolve(opts.buildBundlePath||path.join(root,"evidence/android/build-bundle.json")));
  const visual=readJson(path.resolve(opts.visualPath||path.join(root,"evidence/android/android-visual-certification.json")));
  const dependencyAudit=readJson(path.resolve(opts.dependencyAuditPath||path.join(root,"release/dependency-audit-summary.json")));
  const apkPath=path.resolve(opts.apkPath||path.join(root,"android/app/build/outputs/apk/release/app-release.apk"));
  if(!fs.existsSync(apkPath))throw Error("exact RC APK missing");
  const sha=fileHash(apkPath),bytes=fs.statSync(apkPath).size;if(sha!==buildBundle.candidate.artifactSha256)throw Error("exact RC APK hash differs from sealed candidate");
  const rc=createExactRc({buildBundle,visual,dependencyAudit,artifactBytes:bytes,root,policy,branch:opts.branch||buildBundle.build.branch,commitSha:opts.commitSha||buildBundle.build.commitSha,sourceRef:opts.sourceRef||`github-actions:${process.env.GITHUB_RUN_ID||"local"}:${process.env.GITHUB_RUN_ATTEMPT||"1"}`});
  if(!verifyExactRc(rc,{branch:buildBundle.build.branch,commitSha:buildBundle.build.commitSha,artifactSha256:sha,artifactBytes:bytes,buildSeal:buildBundle.build.seal,candidateSeal:buildBundle.candidate.seal}))throw Error("exact RC self-verification failed");
  const out=path.resolve(opts.outPath||path.join(root,"evidence/android/exact-rc.json"));writeJson(out,rc);
  const reread=readJson(out);if(!verifyExactRc(reread,{commitSha:buildBundle.build.commitSha,artifactSha256:sha,artifactBytes:bytes,buildSeal:buildBundle.build.seal}))throw Error("exact RC persisted seal verification failed");
  return rc;
}
function parse(argv){const o={};for(let i=2;i<argv.length;i++){const k=argv[i];if(!k.startsWith("--"))continue;const n=k.slice(2),v=argv[i+1];if(v&&!v.startsWith("--")){o[n]=v;i++}else o[n]=true}return o}
function cli(argv=process.argv){const a=parse(argv);const rc=generateFromFiles({buildBundlePath:a["build-bundle"],visualPath:a.visual,dependencyAuditPath:a["dependency-audit"],apkPath:a.apk,outPath:a.out,policyPath:a.policy,branch:a.branch,commitSha:a.commit,sourceRef:a["source-ref"]});console.log(`Wave 28 Exact RC Seal: PASS (${rc.rcLabel}; ${rc.coverage.canonicalSuites} canonical suites; ${rc.coverage.androidScenarioCount}/11 Android scenarios; ${rc.artifact.bytes} APK bytes; ${rc.artifact.sha256.slice(0,16)}…)`);return rc}
if(require.main===module){try{cli()}catch(e){console.error("Wave 28 Exact RC Seal: FAIL",e&&e.message||e);process.exit(1)}}
module.exports=Object.freeze({VERSION,hash,fileHash,gitBlobSha1,validatePolicy,suiteUniverse,createSuiteManifest,createExactRc,verifyExactRc,generateFromFiles,cli});
