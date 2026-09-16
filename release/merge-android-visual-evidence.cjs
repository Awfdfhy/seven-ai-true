"use strict";
const fs=require("fs"),path=require("path"),android=require("./android-visual-certification.cjs");
function req(v,n){const s=String(v??"").trim();if(!s)throw Error(`${n} required`);return s}
function readJson(p){return JSON.parse(fs.readFileSync(p,"utf8"))}
function writeJson(p,v){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+"\n")}
function mergeEvidence({build,profiles=[]}={}){
  if(!android.verifyBuildIdentity(build))throw Error("verified build identity required");
  if(!Array.isArray(profiles)||profiles.length<2)throw Error("at least two profile evidence bundles required");
  const devices=[],captures=[];
  for(const profile of profiles){
    if(!profile||profile.schema!=="seven.android-release-profile-evidence.v1")throw Error("profile evidence schema invalid");
    if(profile.buildSeal!==build.seal||profile.artifactSha256!==build.artifactSha256)throw Error("profile build identity drift");
    if(!android.verifyDeviceProof(profile.device))throw Error("profile device proof invalid");
    for(const capture of profile.captures||[])if(!android.verifyCaptureReceipt(capture,{build,device:profile.device}))throw Error(`invalid profile capture:${profile.profileId||"unknown"}`);
    devices.push(profile.device);captures.push(...(profile.captures||[]));
  }
  const certification=android.certify({build,devices,captures});
  if(certification.verdict==="BLOCK")throw Error(`Android visual evidence BLOCK: ${certification.failures.join(",")}`);
  return Object.freeze({schema:"seven.android-release-visual-evidence-merge.v1",buildSeal:build.seal,artifactSha256:build.artifactSha256,profileIds:profiles.map(x=>x.profileId).sort(),deviceSeals:devices.map(x=>x.seal).sort(),captureCount:captures.length,certification,claimBoundary:certification.verdict==="PASS"?"ANDROID_RELEASE_VISUAL_MATRIX_CONTRACT_PASS":"PARTIAL_RELEASE_DEVICE_EVIDENCE_ONLY"});
}
function parse(argv){
  const out={profiles:[]};for(let i=2;i<argv.length;i++){const k=argv[i];if(k==="--profile"){out.profiles.push(argv[++i]);continue}if(k.startsWith("--")){const n=k.slice(2),v=argv[i+1];if(v&&!v.startsWith("--")){out[n]=v;i++}else out[n]=true}}return out;
}
function cli(argv=process.argv,env=process.env){
  const a=parse(argv),buildPath=path.resolve(req(a.build||env.SEVEN_ANDROID_BUILD_IDENTITY,"build identity")),out=path.resolve(a.out||env.SEVEN_ANDROID_VISUAL_MERGE||"evidence/android/android-visual-certification.json");
  const ps=a.profiles.length?a.profiles:String(env.SEVEN_ANDROID_PROFILE_EVIDENCE||"").split(",").filter(Boolean);
  if(ps.length<2)throw Error("two or more --profile files required");
  const build=readJson(buildPath),profiles=ps.map(p=>readJson(path.resolve(p))),merged=mergeEvidence({build,profiles});
  writeJson(out,merged);console.log(`Android release visual evidence: ${merged.certification.verdict} (${merged.certification.covered.length}/${android.SCENARIOS.length} scenarios; missing ${merged.certification.missing.join(",")||"none"})`);
  return merged;
}
if(require.main===module){try{cli()}catch(e){console.error("Android release visual evidence: FAIL",e.message);process.exit(1)}}
module.exports=Object.freeze({mergeEvidence,cli});
