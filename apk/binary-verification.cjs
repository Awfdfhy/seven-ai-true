const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
function parseBadging(output){
  const line=String(output).split('\n').find(x=>x.startsWith('package:'))||'';
  const field=name=>(line.match(new RegExp("(?:^|\\s)"+name+"='([^']*)'"))||[])[1];
  const packageName=field('name'),versionCode=field('versionCode'),versionName=field('versionName');
  if(!packageName||!/^\d+$/.test(versionCode||'')||!versionName)throw new Error('APK binary identity unavailable');
  return {packageName,versionCode:Number(versionCode),versionName};
}
function parseCertificates(output){
  const certificates=[...String(output).matchAll(/^(?:Signer (?:#\d+|\(minSdkVersion=[^\r\n]*\))|V\d+(?:\.\d+)? Signer:) certificate SHA-256 digest: ([a-f0-9]{64})[ \t]*$/gmi)].map(x=>x[1].toLowerCase());
  if(!certificates.length)throw new Error('APK signing certificate unavailable: '+String(output).slice(0,2500));
  return [...new Set(certificates)];
}
function assertIdentity(actual,expected){
  for(const key of ['packageName','versionCode','versionName'])if(actual[key]!==expected[key])throw new Error('APK binary '+key+' mismatch');
}
function buildTool(name){
  for(const sdk of [...new Set([process.env.ANDROID_SDK_ROOT,process.env.ANDROID_HOME].filter(Boolean))]){
    const root=path.join(sdk,'build-tools');if(!fs.existsSync(root))continue;
    for(const version of fs.readdirSync(root).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}))){
      const executable=path.join(root,version,name);if(fs.existsSync(executable))return executable;
    }
  }
  return name;
}
function verifyBinary(apk,expected,{run=spawnSync,tool=buildTool}={}){
  function execute(name,args){const result=run(tool(name),args,{encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024});if(result.error||result.status!==0)throw new Error('APK '+name+' verification failed: '+(result.error||String(result.stderr||'').slice(0,1000)));return result.stdout}
  const identity=parseBadging(execute('aapt',['dump','badging',apk]));assertIdentity(identity,expected);
  const signerCertificateSha256=parseCertificates(execute('apksigner',['verify','--verbose','--print-certs',apk]));
  return {...identity,signatureVerified:true,signerCertificateSha256,upgradeContinuity:'UNVERIFIED'};
}
module.exports={parseBadging,parseCertificates,assertIdentity,verifyBinary};
