"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const android=require("./android-visual-certification.cjs");
const VERSION="1.0.0",H40=/^[0-9a-f]{40}$/i,H64=/^[0-9a-f]{64}$/i;
function arr(v){return Array.isArray(v)?v:[]}
function req(v,n){const s=String(v??"").trim();if(!s)throw Error(`${n} required`);return s}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o}return v}
function hash(v){return crypto.createHash("sha256").update(Buffer.isBuffer(v)||typeof v==="string"?v:JSON.stringify(stable(v))).digest("hex")}
function fileHash(p){return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex")}
function seal(b){return Object.freeze({...b,seal:hash(b)})}
function verify(x,s){if(!x||x.schema!==s||!H64.test(String(x.seal||"")))return false;const{seal:q,...b}=x;return q===hash(b)}
function createCandidate(i={}){
  const commitSha=req(i.commitSha,"commitSha").toLowerCase(),artifactSha256=req(i.artifactSha256,"artifactSha256").toLowerCase(),signerCertSha256=req(i.signerCertSha256,"signerCertSha256").toLowerCase();
  if(!H40.test(commitSha)||!H64.test(artifactSha256)||!H64.test(signerCertSha256))throw Error("invalid candidate hash identity");
  const versionCode=Number(i.versionCode);if(!Number.isInteger(versionCode)||versionCode<=0)throw Error("versionCode invalid");
  const body={schema:"seven.android-ci-release-candidate.v1",version:VERSION,branch:req(i.branch,"branch"),commitSha,applicationId:req(i.applicationId,"applicationId"),versionName:req(i.versionName,"versionName"),versionCode,artifactKind:"APK",artifactSha256,signerCertSha256,signingProfile:"CI_DEBUG_KEY_RELEASE_VARIANT",sourceRef:req(i.sourceRef,"sourceRef"),producer:req(i.producer||"github-actions/android-apk","producer"),claimBoundary:"RELEASE_VARIANT_CI_SIGNED_NOT_STORE_PRODUCTION_SIGNING"};
  return seal(body);
}
function verifyCandidate(x){return verify(x,"seven.android-ci-release-candidate.v1")&&H40.test(x.commitSha)&&H64.test(x.artifactSha256)&&H64.test(x.signerCertSha256)&&x.artifactKind==="APK"&&x.claimBoundary==="RELEASE_VARIANT_CI_SIGNED_NOT_STORE_PRODUCTION_SIGNING"}
function createExportReceipt(i={}){
  if(!verifyCandidate(i.candidate))throw Error("verified candidate required");
  const exportedArtifactSha256=req(i.exportedArtifactSha256,"exportedArtifactSha256").toLowerCase();if(!H64.test(exportedArtifactSha256)||exportedArtifactSha256!==i.candidate.artifactSha256)throw Error("export artifact hash drift");
  const body={schema:"seven.android-ci-release-export.v1",version:VERSION,candidateSeal:i.candidate.seal,artifactSha256:exportedArtifactSha256,sourceRef:req(i.sourceRef,"sourceRef"),exportedBy:req(i.exportedBy||"github-actions/android-apk","exportedBy"),claimBoundary:"BYTE_IDENTICAL_CI_RELEASE_EXPORT"};
  return seal(body);
}
function verifyExportReceipt(x,candidate){return verify(x,"seven.android-ci-release-export.v1")&&H64.test(x.artifactSha256)&&(!candidate||(verifyCandidate(candidate)&&x.candidateSeal===candidate.seal&&x.artifactSha256===candidate.artifactSha256))}
function createBundle({candidate,exportReceipt}={}){
  if(!verifyCandidate(candidate)||!verifyExportReceipt(exportReceipt,candidate))throw Error("verified candidate/export required");
  const build=android.createBuildIdentity({branch:candidate.branch,commitSha:candidate.commitSha,applicationId:candidate.applicationId,versionName:candidate.versionName,versionCode:candidate.versionCode,artifactKind:"APK",artifactSha256:candidate.artifactSha256,candidateSeal:candidate.seal,exportReceiptSeal:exportReceipt.seal});
  const body={schema:"seven.android-ci-release-bundle.v1",version:VERSION,candidate,exportReceipt,build,claimBoundary:"CI_RELEASE_ARTIFACT_IDENTITY_ONLY"};
  return seal(body);
}
function verifyBundle(x){
  return verify(x,"seven.android-ci-release-bundle.v1")&&verifyCandidate(x.candidate)&&verifyExportReceipt(x.exportReceipt,x.candidate)&&android.verifyBuildIdentity(x.build)&&x.build.candidateSeal===x.candidate.seal&&x.build.exportReceiptSeal===x.exportReceipt.seal&&x.build.artifactSha256===x.candidate.artifactSha256&&x.claimBoundary==="CI_RELEASE_ARTIFACT_IDENTITY_ONLY";
}
function writeJson(p,v){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+"\n")}
function parse(argv){
  const out={};for(let i=2;i<argv.length;i++){const k=argv[i];if(!k.startsWith("--"))continue;const n=k.slice(2),v=argv[i+1];if(v&&!v.startsWith("--")){out[n]=v;i++}else out[n]=true}return out;
}
function cli(argv=process.argv,env=process.env){
  const a=parse(argv),apk=path.resolve(req(a.apk||env.SEVEN_RELEASE_APK,"apk")),outDir=path.resolve(a["out-dir"]||env.SEVEN_ANDROID_EVIDENCE_DIR||"evidence/android");
  if(!fs.existsSync(apk))throw Error("release APK missing");
  const artifactSha256=fileHash(apk);
  const candidate=createCandidate({branch:a.branch||env.GITHUB_REF_NAME||env.SEVEN_BRANCH,commitSha:a.commit||env.GITHUB_SHA,applicationId:a["application-id"]||env.SEVEN_APPLICATION_ID||"ai.seven.app",versionName:a["version-name"]||env.SEVEN_VERSION_NAME,versionCode:a["version-code"]||env.SEVEN_VERSION_CODE,artifactSha256,signerCertSha256:a.signer||env.SEVEN_SIGNER_SHA256,sourceRef:a["source-ref"]||`github-actions:${env.GITHUB_RUN_ID||"local"}:${env.GITHUB_RUN_ATTEMPT||"1"}`});
  const exportReceipt=createExportReceipt({candidate,exportedArtifactSha256:artifactSha256,sourceRef:`${candidate.sourceRef}:export`});
  const bundle=createBundle({candidate,exportReceipt});
  writeJson(path.join(outDir,"candidate.json"),candidate);writeJson(path.join(outDir,"export-receipt.json"),exportReceipt);writeJson(path.join(outDir,"build-identity.json"),bundle.build);writeJson(path.join(outDir,"build-bundle.json"),bundle);
  console.log(`android CI release identity: PASS (${artifactSha256.slice(0,16)}…, ${candidate.branch}@${candidate.commitSha.slice(0,12)})`);
  return bundle;
}
if(require.main===module){try{cli()}catch(e){console.error("android CI release identity: FAIL",e.message);process.exit(1)}}
module.exports=Object.freeze({VERSION,hash,fileHash,createCandidate,verifyCandidate,createExportReceipt,verifyExportReceipt,createBundle,verifyBundle,cli});
