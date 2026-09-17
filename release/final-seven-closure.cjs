"use strict";
const fs=require("fs"),path=require("path");
const exact=require("./exact-rc-seal.cjs");
const android=require("./android-visual-certification.cjs");
const audit=require("./dependency-audit-gate.cjs");
const H40=/^[0-9a-f]{40}$/i,H64=/^[0-9a-f]{64}$/i;
const VERSION="1.0.0";
const CLAIM="FINAL_SEVEN_CI_RC_VERIFIED_NOT_STORE_PRODUCTION_SIGNED_NO_PHYSICAL_DEVICE_CLAIM";
function req(v,n){const s=String(v??"").trim();if(!s)throw Error(`${n} required`);return s}
function readJson(p){return JSON.parse(fs.readFileSync(p,"utf8"))}
function writeJson(p,v){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+"\n")}
function createClosure({rc,visual,dependencyAudit,apkPath,root,branch,commitSha,sourceRef}={}){
  root=path.resolve(root||path.join(__dirname,".."));
  branch=req(branch,"branch");commitSha=req(commitSha,"commitSha").toLowerCase();sourceRef=req(sourceRef,"sourceRef");
  if(!H40.test(commitSha))throw Error("final closure commit SHA invalid");
  if(!exact.verifyExactRc(rc,{branch,commitSha}))throw Error("exact RC verification failed or same-head identity drifted");
  if(rc.coverage.canonicalSuites<120)throw Error(`final closure suite floor regressed:${rc.coverage.canonicalSuites}`);
  if(rc.coverage.androidScenarioCount!==11||!Array.isArray(rc.coverage.androidScenarios)||rc.coverage.androidScenarios.length!==11)throw Error("final closure Android scenario coverage incomplete");
  if(rc.coverage.physicalDeviceIncluded!==false)throw Error("final closure truth boundary drift: physical-device claim");
  if(rc.claimBoundary!=="EXACT_RC_CI_SIGNED_NOT_STORE_PRODUCTION_SIGNING_NO_PHYSICAL_DEVICE_CLAIM")throw Error("exact RC claim boundary drift");
  if(rc.signing?.claimBoundary!=="RELEASE_VARIANT_CI_SIGNED_NOT_STORE_PRODUCTION_SIGNING")throw Error("signing truth boundary drift");
  if(rc.protectedSource?.bytes!==658133||rc.protectedSource?.gitBlobSha1!=="3e8dfa8e7da7124e16504140eb9631c10cabf053")throw Error("protected source identity drift");
  if(!visual||visual.schema!=="seven.android-release-visual-evidence-merge.v1")throw Error("final closure Android visual evidence missing");
  const cert=visual.certification;
  if(!android.verifyCertification(cert)||cert.verdict!=="PASS"||cert.missing.length||cert.failures.length)throw Error("final closure Android visual certification not PASS");
  if(cert.seal!==rc.identity.visualCertificationSeal||visual.artifactSha256!==rc.artifact.sha256)throw Error("final closure visual evidence does not bind to exact RC");
  if(!audit.verifySummary(dependencyAudit))throw Error("final closure dependency audit seal invalid");
  if(dependencyAudit.seal!==rc.references.dependencyAuditSeal)throw Error("final closure dependency audit does not bind to exact RC");
  if(!dependencyAudit.gate.productionVulnerabilityFree||!dependencyAudit.gate.fullGraphVulnerabilityFree)throw Error("final closure dependency audit is not clean");
  apkPath=path.resolve(req(apkPath,"release APK"));if(!fs.existsSync(apkPath))throw Error("final closure APK missing");
  const apkSha256=exact.fileHash(apkPath),apkBytes=fs.statSync(apkPath).size;
  if(apkSha256!==rc.artifact.sha256||apkBytes!==rc.artifact.bytes)throw Error("final closure APK bytes/hash drift from exact RC");
  const refs={
    workflowSha256:exact.fileHash(path.join(root,".github/workflows/android-apk.yml")),
    finalGateSha256:exact.fileHash(__filename),
    finalContractSha256:exact.fileHash(path.join(root,"release/final-seven-closure.test.cjs")),
    statusSha256:exact.fileHash(path.join(root,"docs/project-memory/current/STATUS.md")),
    finalClosureDocSha256:exact.fileHash(path.join(root,"docs/project-memory/current/FINAL_SEVEN_CLOSURE.md")),
    exactRcSeal:rc.seal,
    visualCertificationSeal:cert.seal,
    dependencyAuditSeal:dependencyAudit.seal
  };
  const body={schema:"seven.final-seven-closure.v1",version:VERSION,verdict:"PASS",branch,commitSha,rcLabel:rc.rcLabel,
    artifact:{kind:"APK",sha256:apkSha256,bytes:apkBytes,versionName:rc.versionName,versionCode:rc.versionCode},
    coverage:{canonicalSuites:rc.coverage.canonicalSuites,suiteManifestSha256:rc.coverage.suiteManifestSha256,androidScenarioCount:11,androidScenarios:[...rc.coverage.androidScenarios].sort(),physicalDeviceIncluded:false},
    protectedSource:{...rc.protectedSource},signing:{...rc.signing},references:refs,sourceRef,claimBoundary:CLAIM};
  return Object.freeze({...body,seal:exact.hash(body)});
}
function verifyClosure(x,expected={}){
  if(!x||x.schema!=="seven.final-seven-closure.v1"||x.version!==VERSION||x.verdict!=="PASS"||x.claimBoundary!==CLAIM||!H64.test(String(x.seal||"")))return false;
  const{seal,...body}=x;if(seal!==exact.hash(body))return false;
  if(!H40.test(String(x.commitSha||""))||!H64.test(String(x.artifact?.sha256||""))||x.artifact?.kind!=="APK"||!Number.isInteger(x.artifact?.bytes)||x.artifact.bytes<=0)return false;
  if(!Number.isInteger(x.coverage?.canonicalSuites)||x.coverage.canonicalSuites<120||x.coverage?.androidScenarioCount!==11||!Array.isArray(x.coverage?.androidScenarios)||x.coverage.androidScenarios.length!==11||x.coverage.physicalDeviceIncluded!==false)return false;
  if(x.protectedSource?.bytes!==658133||x.protectedSource?.gitBlobSha1!=="3e8dfa8e7da7124e16504140eb9631c10cabf053")return false;
  if(x.signing?.claimBoundary!=="RELEASE_VARIANT_CI_SIGNED_NOT_STORE_PRODUCTION_SIGNING")return false;
  for(const[k,v]of [["branch",x.branch],["commitSha",x.commitSha],["artifactSha256",x.artifact.sha256],["artifactBytes",x.artifact.bytes],["rcLabel",x.rcLabel]])if(expected[k]!==undefined&&expected[k]!==v)return false;
  return true;
}
function generateFromFiles(opts={}){
  const root=path.resolve(opts.root||path.join(__dirname,".."));
  const rc=readJson(path.resolve(opts.rcPath||path.join(root,"evidence/android/exact-rc.json")));
  const visual=readJson(path.resolve(opts.visualPath||path.join(root,"evidence/android/android-visual-certification.json")));
  const dependencyAudit=readJson(path.resolve(opts.dependencyAuditPath||path.join(root,"release/dependency-audit-summary.json")));
  const out=path.resolve(opts.outPath||path.join(root,"evidence/android/final-seven-closure.json"));
  const closure=createClosure({rc,visual,dependencyAudit,apkPath:opts.apkPath||path.join(root,"android/app/build/outputs/apk/release/app-release.apk"),root,branch:opts.branch,commitSha:opts.commitSha,sourceRef:opts.sourceRef});
  writeJson(out,closure);const reread=readJson(out);
  if(!verifyClosure(reread,{branch:closure.branch,commitSha:closure.commitSha,artifactSha256:closure.artifact.sha256,artifactBytes:closure.artifact.bytes,rcLabel:closure.rcLabel}))throw Error("persisted final closure verification failed");
  return closure;
}
function parse(argv){const o={};for(let i=2;i<argv.length;i++){const k=argv[i];if(!k.startsWith("--"))continue;const n=k.slice(2),v=argv[i+1];if(v&&!v.startsWith("--")){o[n]=v;i++}else o[n]=true}return o}
function cli(argv=process.argv){const a=parse(argv);const x=generateFromFiles({rcPath:a.rc,visualPath:a.visual,dependencyAuditPath:a["dependency-audit"],apkPath:a.apk,outPath:a.out,branch:a.branch,commitSha:a.commit,sourceRef:a["source-ref"]});console.log(`FINAL SEVEN CLOSURE: PASS (${x.rcLabel}; ${x.coverage.canonicalSuites} canonical suites; 11/11 Android scenarios; ${x.artifact.bytes} APK bytes; ${x.artifact.sha256.slice(0,16)}…)`);return x}
if(require.main===module){try{cli()}catch(e){console.error("FINAL SEVEN CLOSURE: FAIL",e&&e.message||e);process.exit(1)}}
module.exports=Object.freeze({VERSION,CLAIM,createClosure,verifyClosure,generateFromFiles,cli});
